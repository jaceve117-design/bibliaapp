#!/usr/bin/env node
/**
 * MOTOR DE TRADUCCIÓN POR LOTES.
 *
 *   node bin/traducir.mjs                 # toda la cola, en el orden de config
 *   node bin/traducir.mjs --libro MAT     # sólo un libro
 *   node bin/traducir.mjs --libro MAT --cap 5
 *   node bin/traducir.mjs --simular       # sin llamadas: estima coste y tiempo
 *   node bin/traducir.mjs --limite 50     # tope de lotes en esta corrida
 *
 * Reanudable: lo ya traducido no se vuelve a pagar. Idempotente: si el original
 * cambia (cambia su hash), esa unidad y sólo esa se rehace.
 */
import '../lib/env.mjs';   // primero: carga .env antes de que nadie lea process.env
import { config } from '../config.mjs';
import { verifica } from '../lib/rutas.mjs';
import { obra as obraDe } from '../lib/obras.mjs';
import { Estado } from '../lib/estado.mjs';
import { Contador, ParadaEnSeco } from '../lib/costos.mjs';
import { cargaGlosario } from '../lib/glosario.mjs';
import { prefijoFijo, ejemplosDeOro, cuerpoLote } from '../lib/prompt.mjs';
import { validaUnidad, validaGlosa, tieneGraves } from '../lib/validadores.mjs';
import { normalizaReferencias } from '../lib/referencias.mjs';
import { agrupa } from '../lib/lotes.mjs';
import { conLimite, extraeJson, dormir, barra } from '../lib/util.mjs';
import { traductor } from '../lib/proveedores/index.mjs';

// ── argumentos ─────────────────────────────────────────────────────────────
const args = process.argv.slice(2);
const bandera = (n) => args.includes(n);
const valor = (n, d) => (args.includes(n) ? args[args.indexOf(n) + 1] : d);

const simular = bandera('--simular');
const limite = Number(valor('--limite', Infinity));
const libro = valor('--libro', null);
const capArg = valor('--cap', null);
const obraId = valor('--obra', 'henry');
const dominio = valor('--dominio', null);
const letra = valor('--letra', null);

verifica();
const glosario = cargaGlosario();
const OBRA_TMP = obraDe(obraId);
// Cada obra puede traer su propio prompt y su propio tamaño de lote. Las glosas
// son unidades de 1-6 palabras: el prefijo de prosa (glosario + ejemplos de
// Henry) no les sirve y además se pagaría en cada una de las ~1.500 llamadas.
const PREFIJO = OBRA_TMP.prompt ?? prefijoFijo(glosario, ejemplosDeOro(config.patronOro, 2));
const LOTE = { ...config.traductor, ...(OBRA_TMP.lote ?? {}) };
// las glosas se validan con el perfil corto, no con el de párrafo
const valida = (u, es) => (obraId === 'glosas' ? validaGlosa(u, es) : validaUnidad(u, es, glosario));
const { impl, nombre: proveedorReal } = traductor(config.traductor.modelo);

// ── cola ───────────────────────────────────────────────────────────────────
const OBRA = OBRA_TMP;
const cola = await OBRA.unidades({ libro, cap: capArg, letra, dominio });

const estado = new Estado();
const contador = new Contador();

const pendientes = cola.filter((u) => !estado.resuelta(u));
const deMemoria = pendientes.filter((u) => estado.recuerda(u));
const aTraducir = pendientes.filter((u) => !estado.recuerda(u));

console.log('\nMotor de traducción · Matthew Henry EN→ES');
console.log(`  cola:         ${cola.length} unidades`);
console.log(`  ya resueltas: ${cola.length - pendientes.length}`);
console.log(`  de memoria:   ${deMemoria.length} (sin coste)`);
console.log(`  a traducir:   ${aTraducir.length} · ${aTraducir.reduce((a, u) => a + u.chars, 0).toLocaleString('es')} chars`);

// las que ya están en memoria de traducción se resuelven sin gastar un token
if (!simular) {
  for (const u of deMemoria) {
    estado.anotaTraduccion({ id: u.id, h: u.h, es: estado.recuerda(u), modelo: 'memoria', via: 'memoria' });
  }
  if (deMemoria.length) {
    estado.guardaMemoria();
    console.log(`  ✓ ${deMemoria.length} resueltas desde memoria de traducción`);
  }
}

const lotes = agrupa(aTraducir.map((u) => ({ ...u, osis: u.osis ?? u.dominio ?? u.obra, cap: u.cap ?? u.letra ?? '' })), LOTE).slice(0, limite);
const charsTotal = aTraducir.reduce((a, u) => a + u.chars, 0);
const tokIn = Math.round(charsTotal / 3.7);
const tokOut = Math.round((charsTotal * 1.18) / 3.4);
const esCF = config.traductor.modelo.startsWith('@cf/');
const p = config.precios[config.traductor.modelo] ?? { in: 0, out: 0, cacheRead: 0, cacheWrite: 0 };
const prefTok = Math.round(PREFIJO.length / 3.6);
const npc = config.workersAI.neuronasPorChar[config.traductor.modelo] ?? config.workersAI.neuronasPorCharDefecto;
const neuronasEst = esCF ? charsTotal * npc : 0;
const estUSD = esCF
  ? (neuronasEst / 1000) * config.workersAI.usdPorMilNeuronas
  : (tokIn / 1e6) * p.in +
    (tokOut / 1e6) * p.out +
    ((lotes.length * prefTok) / 1e6) * p.cacheRead +
    (prefTok / 1e6) * p.cacheWrite;

console.log(`  lotes:        ${lotes.length} (≤${LOTE.charsPorLote} chars, ≤${LOTE.maxUnidadesPorLote} unidades c/u)`);
console.log(esCF
  ? `  facturación: Workers AI · ~${Math.round(neuronasEst).toLocaleString('es')} neuronas (${config.workersAI.gratisPorDia.toLocaleString('es')}/día gratis)`
  : `  prefijo fijo: ${prefTok} tok cacheados × ${lotes.length} llamadas`);
console.log(`  estimación:   ~${tokIn.toLocaleString('es')} tok entrada · ~${tokOut.toLocaleString('es')} tok salida`);
console.log(`                ~${estUSD.toFixed(2)} USD con ${config.traductor.modelo}`);
console.log(`  gastado ya:   ${contador.usd.toFixed(2)} USD de ${config.presupuesto.topeUSD} (queda ${contador.restante.toFixed(2)})\n`);

if (simular) {
  if (esCF) {
    const dias = neuronasEst / config.workersAI.gratisPorDia;
    console.log(`  [nota] sólo con la cuota gratuita tardaría ${dias.toFixed(1)} días; con plan Workers de pago va seguido.`);
  } else {
    const sinCache = (tokIn / 1e6) * p.in + (tokOut / 1e6) * p.out + ((lotes.length * prefTok) / 1e6) * p.in;
    console.log(`  [comparativa] sin caché de prompt sería ~${sinCache.toFixed(2)} USD → el caché ahorra ~${(sinCache - estUSD).toFixed(2)} USD`);
  }
  console.log('\n--simular: no se hizo ninguna llamada ni se escribió estado.');
  process.exit(0);
}
if (!lotes.length) { console.log('Nada que traducir.'); process.exit(0); }
if (!impl.disponible()) {
  console.error(`✗ Falta la clave del proveedor '${proveedorReal}' para el modelo ${config.traductor.modelo}.`);
  process.exit(1);
}

// ── reintento individual de una unidad rechazada ───────────────────────────
async function reintentaUnidad(u, fallos, intento) {
  const aviso = fallos.map((f) => `- ${f.tipo}: ${f.detalle}`).join('\n');
  try {
    const r = await impl.completar({
      modelo: config.traductor.modelo,
      prefijoFijo: PREFIJO,
      cuerpo:
        cuerpoLote([u]) +
        `\n\nEl intento anterior fue RECHAZADO por el validador automático:\n${aviso}\n` +
        'Corrige exactamente esos defectos. Mantén todo lo demás.',
      maxTokens: Math.round((u.chars * 1.6) / 3) + 800,
      temperatura: 0.1,
    });
    contador.cobra(config.traductor.modelo, r.uso);
    const crudo2 = extraeJson(r.texto)?.u?.[0]?.es;
    const es2 = crudo2 ? normalizaReferencias(crudo2).texto : crudo2;
    const f2 = es2 ? valida(u, es2) : [{ tipo: 'ausente', grave: true, detalle: 'sin respuesta' }];
    if (es2 && !tieneGraves(f2)) {
      estado.anotaTraduccion({ id: u.id, h: u.h, es: es2, modelo: config.traductor.modelo, intentos: intento + 1 });
      return true;
    }
    estado.anotaFallo({ id: u.id, h: u.h, motivo: f2.map((f) => f.tipo).join(','), intentos: intento + 1 });
    return false;
  } catch (e) {
    if (e instanceof ParadaEnSeco) throw e;
    estado.anotaFallo({ id: u.id, h: u.h, motivo: String(e.message).slice(0, 120), intentos: intento + 1 });
    return false;
  }
}

// ── traducción de un lote ──────────────────────────────────────────────────
let normalizadas = 0;

async function traduceLote(lote, intento = 1) {
  const { texto, uso } = await impl.completar({
    modelo: config.traductor.modelo,
    prefijoFijo: PREFIJO,
    cuerpo: cuerpoLote(lote),
    maxTokens: Math.min(16000, Math.round((lote.reduce((a, u) => a + u.chars, 0) * 1.6) / 3) + 1000),
    temperatura: config.traductor.temperatura,
  });
  contador.cobra(config.traductor.modelo, uso);

  const j = extraeJson(texto);
  const devueltas = new Map((j?.u ?? []).map((x) => [x.id, x.es]));

  const ok = [], mal = [];
  for (const u of lote) {
    const bruto = devueltas.get(u.id);
    if (!bruto) { mal.push({ u, fallos: [{ tipo: 'ausente', grave: true, detalle: 'el modelo no devolvió esta unidad' }] }); continue; }
    // paso determinista: las abreviaturas biblicas se normalizan a las formas que
    // el lector sabe enlazar. No se le pide al modelo que acierte; se corrige.
    const { texto: es, cambios } = obraId === 'glosas' ? { texto: bruto, cambios: [] } : normalizaReferencias(bruto);
    if (cambios.length) normalizadas += cambios.length;
    const fallos = valida(u, es);
    if (tieneGraves(fallos)) mal.push({ u, fallos, es });
    else ok.push({ u, es, fallos });
  }

  for (const { u, es } of ok) {
    estado.anotaTraduccion({ id: u.id, h: u.h, es, modelo: config.traductor.modelo, intentos: intento });
  }

  let recuperadas = 0;
  if (mal.length && intento < config.traductor.reintentos) {
    for (const { u, fallos } of mal) {
      if (await reintentaUnidad(u, fallos, intento)) recuperadas++;
    }
  } else {
    for (const { u, fallos } of mal) {
      estado.anotaFallo({ id: u.id, h: u.h, motivo: fallos.map((f) => f.tipo).join(','), intentos: intento });
    }
  }

  contador.anotaLote(mal.length > lote.length / 2);
  return { ok: ok.length + recuperadas, mal: mal.length - recuperadas };
}

// ── bucle principal ────────────────────────────────────────────────────────
let hechas = 0, fallidas = 0, n = 0;
const t0 = Date.now();
try {
  await conLimite(lotes, config.traductor.concurrencia, async (lote) => {
    for (let intento = 1; intento <= config.traductor.reintentos; intento++) {
      try {
        const r = await traduceLote(lote);
        hechas += r.ok;
        fallidas += r.mal;
        break;
      } catch (e) {
        if (e instanceof ParadaEnSeco) throw e;
        if (!e.reintentable || intento === config.traductor.reintentos) {
          console.error(`\n  ✗ lote ${lote[0].id}: ${e.message}`);
          fallidas += lote.length;
          break;
        }
        await dormir(1000 * 2 ** intento);
      }
    }
    n++;
    const seg = (Date.now() - t0) / 1000;
    const eta = n ? (((lotes.length - n) * (seg / n)) / 60).toFixed(0) : '?';
    process.stdout.write(
      `\r${barra(n, lotes.length)} lote ${n}/${lotes.length} · ${hechas} ok · ${fallidas} fallo · ${contador.usd.toFixed(2)} USD · ETA ${eta} min   `
    );
  });
} catch (e) {
  if (e instanceof ParadaEnSeco) console.error(`\n\n⛔ ${e.message}\n`);
  else throw e;
}

estado.guardaMemoria();
console.log(`\n\n✓ Corrida terminada: ${hechas} traducidas · ${fallidas} fallidas · ${contador.usd.toFixed(2)} USD`);
console.log(`  Estado: ${JSON.stringify(estado.resumen())}`);
console.log('  Siguiente: node bin/auditar.mjs');
