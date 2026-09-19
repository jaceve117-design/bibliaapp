/**
 * Ingesta Easton's Bible Dictionary (1897) — JSON → JSON por letra
 *
 * Uso: node scripts/ingesta-easton.mjs
 *
 * Fuente: neuu-org/bible-dictionary-dataset (agregador CC BY 4.0; texto Easton PD)
 * Crudo:  05. Datos/corpus_crudo/easton/
 * Salida: public/data/easton/{letra}.json + _indice.json + _manifest.json
 *
 * Portón: 26 letras presentes, volumen esperado de entradas, slugs únicos.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.dirname(fileURLToPath(import.meta.url));
const RAW = path.join(ROOT, '..', '..', '..', '05. Datos', 'corpus_crudo', 'easton');
const OUT = path.join(ROOT, '..', 'public', 'data', 'easton');

const LETRAS = 'abcdefghijklmnopqrstuvwxyz'.split('');
const TOTAL_ESPERADO_MIN = 3800; // Easton 1897: ~3.969 entradas
const TOTAL_ESPERADO_MAX = 4200;

fs.mkdirSync(OUT, { recursive: true });

const indice = []; // { s: slug, n: name, l: letra }
const errores = [];
let total = 0;

for (const letra of LETRAS) {
  const archivo = path.join(RAW, `easton_${letra}.json`);
  if (!fs.existsSync(archivo)) continue; // letra sin entradas en la fuente (p. ej. x)
  const crudo = fs.readFileSync(archivo, 'utf8');
  if (!crudo.startsWith('{')) continue; // 404 de la fuente: letra vacía
  const data = JSON.parse(crudo);
  const entradas = {};
  const vistos = new Set();
  for (const [clave, e] of Object.entries(data)) {
    const slug = e.slug || clave;
    let slugFinal = slug;
    let n = 2;
    while (vistos.has(slugFinal)) slugFinal = `${slug}-${n++}`; // fuente con homónimos (p. ej. Hail)
    vistos.add(slugFinal);
    const texto = (e.definitions || []).map((d) => d.text).filter(Boolean).join('\n\n');
    if (!texto) continue;
    const refs = (e.scripture_refs || []).map((r) => r.reference || r.original).filter(Boolean);
    entradas[slugFinal] = { n: e.name || clave, d: texto, r: refs };
    indice.push({ s: slugFinal, n: e.name || clave, l: letra });
    total++;
  }
  fs.writeFileSync(path.join(OUT, `${letra}.json`), JSON.stringify({ letra, entradas }));
}

indice.sort((a, b) => a.n.localeCompare(b.n, 'es'));
fs.writeFileSync(path.join(OUT, '_indice.json'), JSON.stringify(indice));

const manifest = {
  obra: "Easton's Bible Dictionary (1897, M.G. Easton)",
  licencia: 'Dominio público (texto) · agregador neuu-org/bible-dictionary-dataset CC BY 4.0',
  fuente: 'https://github.com/neuu-org/bible-dictionary-dataset (data/02_sources/easton)',
  crudo_en: '05. Datos/corpus_crudo/easton',
  fecha_ingesta: new Date().toISOString().slice(0, 10),
  total_entradas: total,
  idioma: 'en (traducción ES planificada en Fase 4 — ver ficha legal)',
};
fs.writeFileSync(path.join(OUT, '_manifest.json'), JSON.stringify(manifest, null, 2));

if (total < TOTAL_ESPERADO_MIN || total > TOTAL_ESPERADO_MAX) {
  errores.push(`PORTÓN: ${total} entradas, esperadas entre ${TOTAL_ESPERADO_MIN} y ${TOTAL_ESPERADO_MAX}`);
}
if (errores.length) {
  console.error(`✗ PORTÓN EASTON FALLÓ — ${errores.length} incidencias:`);
  errores.slice(0, 20).forEach((e) => console.error('  · ' + e));
  process.exit(1);
}
console.log(`✓ Easton ingerido: ${total} entradas, 26 letras, índice de búsqueda listo.`);
