#!/usr/bin/env node
/**
 * AUDITORÍA EN DOS CAPAS.
 *
 *   node bin/auditar.mjs              # audita todo lo traducido sin auditar
 *   node bin/auditar.mjs --libro MAT
 *   node bin/auditar.mjs --simular    # estima coste según el proveedor elegido
 *
 * Capa 1 (gratis, exacta) ya corrió dentro del traductor: nada llega aquí con
 * fallos graves de forma. Esta capa es la de JUICIO.
 *
 * Con Jev la auditoría es CENSAL (100% del corpus, ~1 USD porque la salida no
 * se cobra). Sin Jev degrada a muestreo con un juez LLM. El pipeline no depende
 * de que Jev esté disponible.
 */
import '../lib/env.mjs';   // primero: carga .env antes de que nadie lea process.env
import { config } from '../config.mjs';
import { verifica } from '../lib/rutas.mjs';
import { colaCompleta, unidadesDeLibro } from '../lib/unidades.mjs';
import { Estado } from '../lib/estado.mjs';
import { Contador, ParadaEnSeco } from '../lib/costos.mjs';
import { conLimite, barra } from '../lib/util.mjs';
import { auditaPar, eligeProveedor, esCensal } from '../lib/proveedores/auditor.mjs';

const args = process.argv.slice(2);
const valor = (n, d) => (args.includes(n) ? args[args.indexOf(n) + 1] : d);
const simular = args.includes('--simular');
const libro = valor('--libro', null);

verifica();
const estado = new Estado();
const contador = new Contador();
const proveedor = eligeProveedor();
const censal = esCensal(proveedor);

const cola = libro ? unidadesDeLibro(libro) : colaCompleta(config.orden, [config.patronOro]);

// candidatas: traducidas y aún sin veredicto
let candidatas = cola.filter((u) => {
  const r = estado.resultados.get(u.id);
  return r && r.es && r.h === u.h && !estado.auditorias.has(u.id);
});

if (!censal) {
  // sin Jev, muestreo determinista (por hash, no aleatorio: reproducible)
  const corte = Math.floor(config.auditor.muestreoSinJev * 0xffff);
  candidatas = candidatas.filter((u) => parseInt(u.h.slice(0, 4), 16) < corte);
}

const chars = candidatas.reduce((a, u) => a + u.chars, 0);
const tokAprox = Math.round((chars * 2.2) / 3.7); // EN + ES en el estado
const p = config.precios[proveedor === 'jev' ? config.auditor.modeloJev : proveedor === 'gemini' ? 'gemini-flash' : config.auditor.juezModelo]
  ?? config.precios['jev-1'];
const estUSD = (tokAprox / 1e6) * p.in + (censal ? 0 : (candidatas.length * 180) / 1e6) * p.out;

console.log('\nAuditoría · Matthew Henry ES');
console.log(`  proveedor:  ${proveedor}${censal ? ' (CENSAL — 100% del corpus)' : ` (muestreo ${(config.auditor.muestreoSinJev * 100).toFixed(0)}%)`}`);
console.log(`  a auditar:  ${candidatas.length} unidades · ~${tokAprox.toLocaleString('es')} tok`);
console.log(`  estimación: ~${estUSD.toFixed(2)} USD`);
console.log(`  umbral:     fidelidad≥${config.auditor.minFidelidad} · fluidez≥${config.auditor.minFluidez} · confianza≥${config.auditor.umbralConfianza}\n`);

if (proveedor === 'ninguno') {
  console.error('✗ No hay auditor configurado. Exporta JEV_API_KEY (censal, ~1 USD) o GEMINI_API_KEY (muestreado).');
  process.exit(1);
}
if (simular) { console.log('--simular: no se hizo ninguna llamada.'); process.exit(0); }
if (!candidatas.length) { console.log('Nada que auditar.'); process.exit(0); }

let n = 0, aprobadas = 0, marcadas = 0;
const porFallo = {};
try {
  await conLimite(candidatas, Number(process.env.MT_CONC_AUDIT ?? 4), async (u) => {
    const r = estado.resultados.get(u.id);
    try {
      const v = await auditaPar({ id: u.id, en: u.en, es: r.es });
      contador.cobra(v.modelo ?? config.auditor.modeloJev, v.uso ?? { in: 0, out: 0 });
      estado.anotaAuditoria(v);
      if (v.aprobada) aprobadas++;
      else {
        marcadas++;
        // se cuenta por MOTIVO real: una unidad puede rechazarse por puntuacion
        // aunque `fallo` sea "ninguno" — agrupar por `fallo` lo ocultaba.
        for (const mo of (v.motivos?.length ? v.motivos : ['sin motivo'])) {
          const k = mo.split(' ')[0];
          porFallo[k] = (porFallo[k] ?? 0) + 1;
        }
      }
    } catch (e) {
      if (e instanceof ParadaEnSeco) throw e;
      console.error(`\n  ✗ ${u.id}: ${e.message}`);
    }
    n++;
    if (n % 10 === 0 || n === candidatas.length) {
      process.stdout.write(`\r${barra(n, candidatas.length)} ${n}/${candidatas.length} · ${aprobadas} ok · ${marcadas} marcadas · ${contador.corrida.toFixed(4)} USD   `);
    }
  });
} catch (e) {
  if (e instanceof ParadaEnSeco) console.error(`\n\n⛔ ${e.message}\n`);
  else throw e;
}

console.log(`\n\n✓ Auditoría: ${aprobadas} aprobadas · ${marcadas} marcadas · ${contador.usd.toFixed(3)} USD`);
if (marcadas) {
  console.log('  Motivos de rechazo:');
  for (const [k, v] of Object.entries(porFallo).sort((a, b) => b[1] - a[1])) console.log(`    · ${k}: ${v}`);
}
console.log('  Siguiente: node bin/consola.mjs   (revisión humana, paso 4)');
