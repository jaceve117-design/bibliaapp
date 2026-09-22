#!/usr/bin/env node
/**
 * PILOTO · calibración contra el patrón de oro (Juan, traducido a mano).
 *
 *   node bin/piloto.mjs --auditor      # ¿el auditor distingue bueno de malo?
 *   node bin/piloto.mjs --traductor    # ¿el motor alcanza la calidad de tu Juan?
 *   node bin/piloto.mjs --validador    # capa 1 contra el oro (gratis, sin claves)
 *
 * Por qué existe: antes de lanzar 28.268 unidades y ~200 USD hay que saber que
 * (a) el auditor discrimina y (b) el traductor no queda por debajo de la vara
 * que ya tienes. Juan es esa vara: 2.181 unidades de traducción humana aprobada.
 *
 * El piloto NO escribe en el estado de producción: todo va a estado/piloto-*.json.
 */
import fs from 'node:fs';
import path from 'node:path';
import '../lib/env.mjs';   // primero: carga .env antes de que nadie lea process.env
import { config } from '../config.mjs';
import { verifica, HENRY_EN, HENRY_ES, ESTADO, aseguraDirs } from '../lib/rutas.mjs';
import { cargaGlosario } from '../lib/glosario.mjs';
import { validaUnidad, tieneGraves } from '../lib/validadores.mjs';
import { prefijoFijo, ejemplosDeOro, cuerpoLote } from '../lib/prompt.mjs';
import { auditaPar, eligeProveedor } from '../lib/proveedores/auditor.mjs';
import { conLimite, extraeJson } from '../lib/util.mjs';
import { traductor } from '../lib/proveedores/index.mjs';

const args = process.argv.slice(2);
const valor = (n, d) => (args.includes(n) ? args[args.indexOf(n) + 1] : d);
const N = Number(valor('--n', 25));

verifica();
aseguraDirs();
const glosario = cargaGlosario();

// ── pares de oro: EN original + ES humano, del mismo Juan ──────────────────
function paresDeOro() {
  const osis = config.patronOro;
  const en = JSON.parse(fs.readFileSync(path.join(HENRY_EN, `${osis}.json`), 'utf8')).c;
  const es = JSON.parse(fs.readFileSync(path.join(HENRY_ES, `${osis}.json`), 'utf8')).c;
  const out = [];
  for (const cap of Object.keys(es)) {
    (es[cap].s || []).forEach((s, i) => {
      (s.p || []).forEach((p, j) => {
        const o = en[cap]?.s?.[i]?.p?.[j];
        if (p && p.trim() && o && o.length > 300) {
          out.push({ id: `${osis}.${cap}.p.${i}.${j}`, en: o, es: p, chars: o.length });
        }
      });
    });
  }
  return out;
}

// ── degradaciones deliberadas: los fallos que el auditor DEBE cazar ────────
const DEGRADACIONES = {
  omision: (es) => {
    const f = es.split(/(?<=\.)\s+/);
    return f.length < 3 ? es.slice(0, Math.floor(es.length * 0.55)) : f.slice(0, Math.ceil(f.length * 0.55)).join(' ');
  },
  terminologia: (es) => es
    .replace(/pacto/gi, 'alianza').replace(/propiciaci[óo]n/gi, 'expiación')
    .replace(/justificaci[óo]n/gi, 'absolución').replace(/carne/gi, 'naturaleza carnal')
    .replace(/gracia/gi, 'favor divino'),
  literalidad: (es) => es
    .replace(/\bque\b/g, 'el cual').replace(/\bpero\b/g, 'sin embargo no obstante')
    .replace(/\bpor tanto\b/gi, 'por lo tanto es que')
    .replace(/\bes\b/g, 'está siendo'),
  registro: (es) => 'Bueno, o sea, básicamente ' + es.toLowerCase()
    .replace(/cristo/g, 'Jesús').replace(/\bseñor\b/g, 'jefe')
    .replace(/\./g, ', ¿no?.'),
  maquina: (es) => es.replace(/\s+/g, ' ')
    .replace(/\b(el|la|los|las)\s/g, 'the ').replace(/\by\b/g, 'and').replace(/\bque\b/g, 'that'),
};

const media = (a) => (a.length ? a.reduce((x, y) => x + y, 0) / a.length : 0);

// ── 1. VALIDADOR (capa 1) contra el oro — gratis ───────────────────────────
async function pruebaValidador() {
  const pares = paresDeOro();
  console.log(`\nPILOTO · capa 1 (validadores deterministas) · ${pares.length} pares de oro\n`);

  const falsosPositivos = pares.filter((p) => tieneGraves(validaUnidad(p, p.es, glosario)));
  console.log(`  Falsos positivos sobre traducción HUMANA: ${falsosPositivos.length}/${pares.length} ` +
    `(${(falsosPositivos.length / pares.length * 100).toFixed(1)}%)`);
  if (falsosPositivos.length) {
    console.log('    ↳ el validador es demasiado severo; ejemplos:');
    for (const p of falsosPositivos.slice(0, 5)) {
      console.log(`      ${p.id}: ${validaUnidad(p, p.es, glosario).filter((f) => f.grave).map((f) => f.tipo + '(' + f.detalle + ')').join(', ')}`);
    }
  }

  console.log('\n  Detección sobre traducción DEGRADADA a propósito:');
  const tabla = [];
  for (const [nombre, f] of Object.entries(DEGRADACIONES)) {
    // Se mide sobre los pares donde la degradación REALMENTE cambia algo:
    // medir "terminología" sobre párrafos que no contienen ningún término
    // doctrinal infla el denominador y esconde el dato.
    const aplicables = pares.filter((p) => f(p.es) !== p.es);
    const cazadas = aplicables.filter((p) => tieneGraves(validaUnidad(p, f(p.es), glosario))).length;
    tabla.push({
      degradacion: nombre,
      cazadas,
      aplicables: aplicables.length,
      tasa: aplicables.length ? (cazadas / aplicables.length * 100).toFixed(0) + '%' : 'n/a',
    });
  }
  console.table(tabla);
  console.log('  Lectura: la capa 1 sólo debe cazar fallos de FORMA. Lo que se le escapa');
  console.log('  (registro, literalidad) es exactamente el trabajo de la capa 2.\n');
  fs.writeFileSync(path.join(ESTADO, 'piloto-validador.json'), JSON.stringify({ falsosPositivos: falsosPositivos.length, total: pares.length, tabla }, null, 2));
}

// ── 2. AUDITOR (capa 2) — ¿discrimina? ─────────────────────────────────────
async function pruebaAuditor() {
  const proveedor = eligeProveedor();
  if (proveedor === 'ninguno') {
    console.error('✗ No hay auditor configurado (JEV_API_KEY o GEMINI_API_KEY o ANTHROPIC_API_KEY).');
    process.exit(1);
  }
  const pares = paresDeOro().sort((a, b) => a.chars - b.chars);
  const centro = Math.floor(pares.length / 2);
  const muestra = pares.slice(centro - Math.floor(N / 2), centro + Math.ceil(N / 2));

  console.log(`\nPILOTO · capa 2 (auditor: ${proveedor}) · ${muestra.length} pares × ${1 + Object.keys(DEGRADACIONES).length} variantes\n`);

  const casos = [];
  for (const p of muestra) {
    casos.push({ ...p, variante: 'oro', texto: p.es, debeAprobar: true });
    for (const [nombre, f] of Object.entries(DEGRADACIONES)) {
      casos.push({ ...p, variante: nombre, texto: f(p.es), debeAprobar: false });
    }
  }

  let n = 0;
  const res = await conLimite(casos, 6, async (c) => {
    try {
      const v = await auditaPar({ id: `${c.id}#${c.variante}`, en: c.en, es: c.texto });
      process.stdout.write(`\r  ${++n}/${casos.length}   `);
      return { ...c, v };
    } catch (e) {
      process.stdout.write(`\r  ${++n}/${casos.length}   `);
      return { ...c, error: e.message };
    }
  });

  const validos = res.filter((r) => r.v);
  const errores = res.filter((r) => r.error);
  if (errores.length) console.log(`\n  ⚠ ${errores.length} llamadas fallaron: ${errores[0].error.slice(0, 120)}`);
  if (!validos.length) { console.error('\n✗ Ninguna auditoría completada.'); process.exit(1); }

  const oro = validos.filter((r) => r.variante === 'oro');
  const mal = validos.filter((r) => r.variante !== 'oro');

  const vp = mal.filter((r) => !r.v.aprobada).length;      // degradada rechazada = acierto
  const fn = mal.filter((r) => r.v.aprobada).length;       // degradada aprobada  = se le escapó
  const vn = oro.filter((r) => r.v.aprobada).length;       // oro aprobada        = acierto
  const fp = oro.filter((r) => !r.v.aprobada).length;      // oro rechazada       = falso positivo

  console.log('\n\n  MATRIZ DE DISCRIMINACIÓN');
  console.log(`    Traducción humana (oro)  → aprobada ${vn}/${oro.length}  · rechazada ${fp}  ← falsos positivos`);
  console.log(`    Traducción degradada     → rechazada ${vp}/${mal.length} · aprobada ${fn}  ← se le escaparon`);
  const precision = vp / Math.max(1, vp + fp);
  const recall = vp / Math.max(1, vp + fn);
  console.log(`    precisión ${(precision * 100).toFixed(1)}% · sensibilidad ${(recall * 100).toFixed(1)}%`);

  console.log('\n  POR TIPO DE DEGRADACIÓN (qué tan bien caza cada defecto):');
  const porTipo = [];
  for (const nombre of Object.keys(DEGRADACIONES)) {
    const g = mal.filter((r) => r.variante === nombre);
    porTipo.push({
      degradacion: nombre,
      cazada: `${g.filter((r) => !r.v.aprobada).length}/${g.length}`,
      fidelidad_media: media(g.map((r) => r.v.fidelidad ?? 0)).toFixed(2),
      confianza_media: media(g.map((r) => r.v.confianza ?? 0)).toFixed(2),
    });
  }
  porTipo.push({
    degradacion: '— ORO (humano) —',
    cazada: `${fp}/${oro.length} (debe ser 0)`,
    fidelidad_media: media(oro.map((r) => r.v.fidelidad ?? 0)).toFixed(2),
    confianza_media: media(oro.map((r) => r.v.confianza ?? 0)).toFixed(2),
  });
  console.table(porTipo);

  const sirve = precision >= 0.8 && recall >= 0.7 && fp <= oro.length * 0.15;
  console.log(`\n  VEREDICTO: ${sirve ? '✓ el auditor discrimina — úsalo censal' : '✗ NO discrimina lo suficiente — ajusta la rúbrica o el umbral antes de confiar en él'}`);
  console.log(`  (criterio: precisión ≥80%, sensibilidad ≥70%, falsos positivos ≤15%)\n`);

  fs.writeFileSync(path.join(ESTADO, 'piloto-auditor.json'),
    JSON.stringify({ proveedor, vn, fp, vp, fn, precision, recall, porTipo, sirve }, null, 2));
}

// ── 3. TRADUCTOR — ¿alcanza la vara de tu Juan? ────────────────────────────
async function pruebaTraductor() {
  const modeloTrad = valor('--modelo', config.traductor.modelo);
  const { impl } = traductor(modeloTrad);
  if (!impl.disponible()) { console.error('✗ Falta la clave del traductor.'); process.exit(1); }

  const pares = paresDeOro().sort((a, b) => a.chars - b.chars);
  const centro = Math.floor(pares.length / 2);
  const muestra = pares.slice(centro - Math.floor(N / 2), centro + Math.ceil(N / 2));
  // ejemplos de oro SIN incluir los párrafos que vamos a traducir (no hacer trampa)
  const ids = new Set(muestra.map((m) => m.id));
  const ejemplos = ejemplosDeOro(config.patronOro, 2).filter((e) => !muestra.some((m) => m.en === e.en));
  const PREFIJO = prefijoFijo(glosario, ejemplos);

  console.log(`\nPILOTO · traductor (${config.traductor.modelo}) · ${muestra.length} párrafos de Juan`);
  console.log('  Se retraducen párrafos que YA tienes traducidos a mano, y se comparan.\n');

  let n = 0;
  const salida = await conLimite(muestra, 3, async (u) => {
    try {
      const r = await impl.completar({
        modelo: modeloTrad, prefijoFijo: PREFIJO,
        cuerpo: cuerpoLote([{ id: u.id, en: u.en }]),
        maxTokens: Math.round(u.chars * 1.6 / 3) + 800, temperatura: config.traductor.temperatura,
      });
      process.stdout.write(`\r  ${++n}/${muestra.length}   `);
      const maquina = extraeJson(r.texto)?.u?.[0]?.es ?? '';
      return { ...u, maquina, fallos: validaUnidad(u, maquina, glosario), uso: r.uso };
    } catch (e) {
      process.stdout.write(`\r  ${++n}/${muestra.length}   `);
      return { ...u, maquina: '', error: e.message, fallos: [] };
    }
  });

  const ok = salida.filter((s) => s.maquina);
  const limpias = ok.filter((s) => !tieneGraves(s.fallos));
  const p = config.precios[modeloTrad] ?? { in: 0, out: 0, cacheRead: 0 };
  const usd = salida.reduce((a, s) => a + ((s.uso?.in ?? 0) * p.in + (s.uso?.out ?? 0) * p.out + (s.uso?.cacheRead ?? 0) * p.cacheRead) / 1e6, 0);

  console.log(`\n\n  Traducidas: ${ok.length}/${muestra.length}`);
  console.log(`  Pasan la capa 1 sin fallos graves: ${limpias.length}/${ok.length} (${(limpias.length / Math.max(1, ok.length) * 100).toFixed(0)}%)`);
  console.log(`  Ratio de longitud máquina/humano: ${media(ok.map((s) => s.maquina.length / s.es.length)).toFixed(2)}`);
  console.log(`  Coste del piloto: ${usd.toFixed(3)} USD → extrapolado al corpus: ~${(usd / Math.max(1, ok.length) * 28268).toFixed(0)} USD`);

  const ruta = path.join(ESTADO, 'piloto-traductor.json');
  fs.writeFileSync(ruta, JSON.stringify(salida.map((s) => ({ id: s.id, en: s.en, humano: s.es, maquina: s.maquina, fallos: s.fallos })), null, 2));
  console.log(`\n  Cotejo completo (EN / humano / máquina) escrito en:\n    ${ruta}`);
  console.log('  LÉELO. Ese cotejo es la decisión: si la máquina no se acerca a tu Juan,');
  console.log('  no se lanza sobre 28.268 unidades.\n');
}

// ── despacho ───────────────────────────────────────────────────────────────
if (args.includes('--auditor')) await pruebaAuditor();
else if (args.includes('--traductor')) await pruebaTraductor();
else await pruebaValidador();
