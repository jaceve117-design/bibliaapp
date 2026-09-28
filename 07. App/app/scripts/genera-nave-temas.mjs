/**
 * Nave's Topical Bible: índice inverso tema → versículos de toda la Biblia.
 *
 * Uso: node scripts/genera-nave-temas.mjs
 *
 * Los datos de Nave vienen por libro (versículo → temas). Para que un tema sea
 * tocable («Sueño» → todos los versículos sobre sueños) hace falta la vista al
 * revés. Se reparte por letra inicial del tema para que cada toque descargue
 * sólo un archivo pequeño.
 *
 * Salida: public/data/nave/_temas/{letra}.json → { tema: { OSIS: ["c.v", …] } },
 * con los libros en orden canónico y los versículos en orden de lectura.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const DATA = path.join(ROOT, 'public', 'data');
const NAVE = path.join(DATA, 'nave');
const OUT = path.join(NAVE, '_temas');

const orden = JSON.parse(fs.readFileSync(path.join(DATA, 'rv1909', '_manifest.json'), 'utf8')).libros.map((l) => l.osis);
const indice = {};
let refs = 0;
for (const osis of orden) {
  const f = path.join(NAVE, `${osis}.json`);
  if (!fs.existsSync(f)) continue;
  const { versos } = JSON.parse(fs.readFileSync(f, 'utf8'));
  const claves = Object.keys(versos).sort((a, b) => {
    const [ca, va] = a.split('.').map(Number);
    const [cb, vb] = b.split('.').map(Number);
    return ca - cb || va - vb;
  });
  for (const cv of claves) {
    for (const tema of versos[cv]) {
      ((indice[tema] ??= {})[osis] ??= []).push(cv);
      refs++;
    }
  }
}

fs.rmSync(OUT, { recursive: true, force: true });
fs.mkdirSync(OUT, { recursive: true });
const porLetra = {};
for (const [tema, libros] of Object.entries(indice)) {
  const l = /^[a-z]/.test(tema) ? tema[0] : '_';
  (porLetra[l] ??= {})[tema] = libros;
}
for (const [l, temas] of Object.entries(porLetra)) fs.writeFileSync(path.join(OUT, `${l}.json`), JSON.stringify(temas));
console.log(`✓ ${Object.keys(indice).length} temas · ${refs} referencias · ${Object.keys(porLetra).length} archivos`);
