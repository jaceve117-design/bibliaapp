/**
 * Fusión de fragmentos de traducción ES → public/data/henry-es/{OSIS}.json
 *
 * Uso: node scripts/fusiona-henry-es.mjs <OSIS> <capítulo> <fragmento.json> [índice_sección=0] [índice_párrafo=0]
 *
 * El fragmento es: { s: [ { t?, v?, p: [...] } ], r?: "resumen" } — fusiona por posición absoluta
 * (índice_sección + i para secciones; índice_párrafo + j para párrafos dentro de la sección).
 * Permite traducción PARCIAL: los párrafos aún no traducidos quedan como "" y el lector los omite.
 * Valida contra el original EN: párrafo no vacío, proporción de longitud ES/EN razonable.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.dirname(fileURLToPath(import.meta.url));
const [, , osis, capArg, fragPath, secArg, pArg] = process.argv;
if (!osis || !capArg || !fragPath) {
  console.error('Uso: node scripts/fusiona-henry-es.mjs <OSIS> <cap> <fragmento.json> [índice_sección=0] [índice_párrafo=0]');
  process.exit(1);
}
const cap = String(Number(capArg));
const secBase = Number(secArg ?? '0');
const pBase = Number(pArg ?? '0');
if (Number(pArg ?? '0') !== 0 && (frag.s?.length ?? 0) > 1) {
  console.error('✗ FUSIÓN FALLÓ: pBase≠0 sólo es válido para fragmentos de UNA sección (el desplazamiento se aplicaría a todas y corrompería las posteriores).');
  process.exit(1);
}
const frag = JSON.parse(fs.readFileSync(fragPath, 'utf8'));
const en = JSON.parse(fs.readFileSync(path.join(ROOT, '..', 'public', 'data', 'henry', `${osis}.json`), 'utf8')).c[cap];
const rutaEs = path.join(ROOT, '..', 'public', 'data', 'henry-es', `${osis}.json`);
const es = JSON.parse(fs.readFileSync(rutaEs, 'utf8'));

es.c[cap] ??= { r: null, s: [] };
es.c[cap].s ??= [];

let errores = [];
(frag.s ?? []).forEach((sec, i) => {
  const idx = secBase + i;
  const orig = en.s?.[idx];
  if (!orig) { errores.push(`sección ${idx}: el original EN no tiene esa sección`); return; }
  es.c[cap].s[idx] ??= { t: '', v: orig.v, p: orig.p.map(() => '') };
  const esSec = es.c[cap].s[idx];
  while (esSec.p.length < orig.p.length) esSec.p.push('');
  if (sec.t) esSec.t = sec.t;
  if (sec.v != null) esSec.v = sec.v;

  sec.p.forEach((p, j) => {
    const absP = pBase + j;
    const enP = orig.p[absP] || '';
    if (!p || !p.trim()) { errores.push(`sección ${idx} párrafo ${absP + 1}: vacío`); return; }
    if (enP.length > 150 && p.length < enP.length * 0.3) {
      errores.push(`sección ${idx} párrafo ${absP + 1}: ES=${p.length} chars vs EN=${enP.length} — traducción incompleta`);
      return;
    }
    while (esSec.p.length <= absP) esSec.p.push('');
    esSec.p[absP] = p;
  });
});

if (frag.r) es.c[cap].r = frag.r;

if (errores.length) {
  console.error('✗ FUSIÓN FALLÓ:');
  errores.forEach((e) => console.error('  · ' + e));
  process.exit(1);
}

const totalPal = Object.values(es.c[cap].s).reduce((a, s) => a + s.p.filter(Boolean).length, 0);
const totalEN = en.s.reduce((a, s) => a + s.p.length, 0);
fs.writeFileSync(rutaEs, JSON.stringify(es));

const mfRuta = path.join(ROOT, '..', 'public', 'data', 'henry-es', '_manifest.json');
const mf = JSON.parse(fs.readFileSync(mfRuta, 'utf8'));
mf.cobertura[osis] ??= { capitulos: [], secciones_traducidas: 0 };
if (!mf.cobertura[osis].capitulos.includes(cap)) mf.cobertura[osis].capitulos.push(cap);
mf.cobertura[osis].parrafos_traducidos = totalPal;
mf.cobertura[osis].parrafos_total = totalEN;
mf.fecha = new Date().toISOString().slice(0, 10);
fs.writeFileSync(mfRuta, JSON.stringify(mf, null, 2));

console.log(`✓ ${osis} cap ${cap}: ${totalPal}/${totalEN} párrafos traducidos (${Math.round(totalPal / totalEN * 100)}% del capítulo).`);
