/**
 * Fusión de fragmentos de traducción ES → public/data/henry-es/{OSIS}.json
 *
 * Uso: node scripts/fusiona-henry-es.mjs <OSIS> <capítulo> <archivo_fragmento.json>
 *
 * El fragmento es: { c: "<cap>", s: [ { t, v, p: [...] }, ... ] }
 * Valida contra el original EN (public/data/henry/): paridad de secciones
 * del fragmento, párrafos y verso de inicio por sección.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.dirname(fileURLToPath(import.meta.url));
const [, , osis, capArg, fragPath] = process.argv;
if (!osis || !capArg || !fragPath) {
  console.error('Uso: node scripts/fusiona-henry-es.mjs <OSIS> <cap> <fragmento.json>');
  process.exit(1);
}
const cap = String(Number(capArg));
const frag = JSON.parse(fs.readFileSync(fragPath, 'utf8'));
const en = JSON.parse(fs.readFileSync(path.join(ROOT, '..', 'public', 'data', 'henry', `${osis}.json`), 'utf8')).c[cap];
const rutaEs = path.join(ROOT, '..', 'public', 'data', 'henry-es', `${osis}.json`);
const es = JSON.parse(fs.readFileSync(rutaEs, 'utf8'));

es.c[cap] ??= { r: null, s: [] };
es.c[cap].s ??= [];

let errores = [];
frag.s.forEach((sec, i) => {
  const orig = en.s?.[i];
  if (!orig) { errores.push(`sección ${i}: el original EN no tiene esa sección`); return; }
  if (sec.p.length !== orig.p.length) errores.push(`sección ${i} (${sec.t}): párrafos ES=${sec.p.length} vs EN=${orig.p.length}`);
  if (sec.v !== orig.v) errores.push(`sección ${i} (${sec.t}): verso inicio ES=${sec.v} vs EN=${orig.v}`);
  sec.p.forEach((p, j) => {
    const enLen = (orig.p[j] || '').length;
    if (!p.trim()) errores.push(`sección ${i} párrafo ${j + 1}: vacío`);
    else if (p.length < 40 && enLen > 150) errores.push(`sección ${i} párrafo ${j + 1}: ES=${p.length} chars vs EN=${enLen} — traducción incompleta`);
  });
});

if (errores.length) {
  console.error('✗ FUSIÓN FALLÓ:');
  errores.forEach((e) => console.error('  · ' + e));
  process.exit(1);
}

frag.s.forEach((sec, i) => { es.c[cap].s[i] = { t: sec.t, v: sec.v, p: sec.p }; });
if (frag.r) es.c[cap].r = frag.r;

const traducidas = frag.s.length;
const totalCap = en.s.length;
fs.writeFileSync(rutaEs, JSON.stringify(es));

const mfRuta = path.join(ROOT, '..', 'public', 'data', 'henry-es', '_manifest.json');
const mf = JSON.parse(fs.readFileSync(mfRuta, 'utf8'));
mf.cobertura[osis] ??= { capitulos: [], secciones_traducidas: 0 };
if (!mf.cobertura[osis].capitulos.includes(cap)) mf.cobertura[osis].capitulos.push(cap);
mf.fecha = new Date().toISOString().slice(0, 10);
fs.writeFileSync(mfRuta, JSON.stringify(mf, null, 2));

console.log(`✓ ${osis} cap ${cap}: ${traducidas}/${totalCap} secciones fusionadas y validadas (paridad con EN).`);
