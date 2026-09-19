/**
 * Ingesta Matthew Henry — Complete Commentary (6 vols, 1706–1721, dominio público)
 * Edición markdown de lyteword/mhenry-complete (CC0-1.0). Ver ficha legal en 02. Legal/.
 *
 * Uso: node scripts/ingesta-henry.mjs
 *
 * Crudo: 05. Datos/corpus_crudo/mhenry/mhenry-complete-main/
 * Salida: public/data/henry/{OSIS}.json + _manifest.json
 *
 * Estructura por capítulo: resumen del capítulo + secciones con título,
 * verso de inicio (derivado de las citas con superíndices) y párrafos.
 *
 * Portón: 66 libros, cobertura de capítulos ≥ 95% contra RV1909, secciones con contenido.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.dirname(fileURLToPath(import.meta.url));
const RAW = path.join(ROOT, '..', '..', '..', '05. Datos', 'corpus_crudo', 'mhenry', 'mhenry-complete-main');
const BIBLIAS = path.join(ROOT, '..', 'public', 'data', 'rv1909');
const OUT = path.join(ROOT, '..', 'public', 'data', 'henry');

const LIBROS = {
  genesis: 'GEN', exodus: 'EXO', leviticus: 'LEV', numbers: 'NUM', deuteronomy: 'DEU',
  joshua: 'JOS', judges: 'JDG', ruth: 'RUT', '1-samuel': '1SA', '2-samuel': '2SA',
  '1-kings': '1KI', '2-kings': '2KI', '1-chronicles': '1CH', '2-chronicles': '2CH',
  ezra: 'EZR', nehemiah: 'NEH', esther: 'EST', job: 'JOB', psalms: 'PSA', proverbs: 'PRO',
  ecclesiastes: 'ECC', 'song-of-solomon': 'SNG', isaiah: 'ISA', jeremiah: 'JER',
  lamentations: 'LAM', ezekiel: 'EZK', daniel: 'DAN', hosea: 'HOS', joel: 'JOL', amos: 'AMO',
  obadiah: 'OBA', jonah: 'JON', micah: 'MIC', nahum: 'NAM', habakkuk: 'HAB', zephaniah: 'ZEP',
  haggai: 'HAG', zechariah: 'ZEC', malachi: 'MAL', matthew: 'MAT', mark: 'MRK', luke: 'LUK',
  john: 'JHN', acts: 'ACT', romans: 'ROM', '1-corinthians': '1CO', '2-corinthians': '2CO',
  galatians: 'GAL', ephesians: 'EPH', philippians: 'PHP', colossians: 'COL',
  '1-thessalonians': '1TH', '2-thessalonians': '2TH', '1-timothy': '1TI', '2-timothy': '2TI',
  titus: 'TIT', philemon: 'PHM', hebrews: 'HEB', james: 'JAS', '1-peter': '1PE',
  '2-peter': '2PE', '1-john': '1JN', '2-john': '2JN', '3-john': '3JN', jude: 'JUD',
  revelation: 'REV',
};
const ORDEN = Object.values(LIBROS);

const SUP = { '⁰': '0', '¹': '1', '²': '2', '³': '3', '⁴': '4', '⁵': '5', '⁶': '6', '⁷': '7', '⁸': '8', '⁹': '9' };
const supANum = (s) => Number([...s].map((c) => SUP[c] ?? '').join(''));

const limpiar = (t) =>
  t
    .replace(/\\([.\-()])/g, '$1')
    .replace(/\*\*/g, '')
    .replace(/\*/g, '')
    .replace(/_/g, '')
    .replace(/\s+/g, ' ')
    .trim();

function parseChapter(archivo) {
  const crudo = fs.readFileSync(archivo, 'utf8');
  const sinFront = crudo.replace(/^---[\s\S]*?---\n/, '');
  const lineas = sinFront.split('\n');
  const cap = { r: null, s: [] };
  let seccion = null; // { t, v, p }
  let parrafo = '';

  const cerrarParrafo = () => {
    const texto = limpiar(parrafo);
    parrafo = '';
    if (!texto) return;
    if (seccion) seccion.p.push(texto);
    else cap.r = cap.r ? `${cap.r} ${texto}` : texto;
  };

  for (const linea of lineas) {
    if (/^#{1,6}\s/.test(linea) && !linea.startsWith('## ')) continue; // título de capítulo
    if (linea.startsWith('## ')) {
      cerrarParrafo();
      seccion = { t: limpiar(linea.slice(3)), v: null, p: [] };
      cap.s.push(seccion);
      continue;
    }
    if (linea.startsWith('>')) {
      // cita de verso: extraer superíndices para el rango de la sección
      const versos = [...linea.matchAll(/\*\*([⁰¹²³⁴⁵⁶⁷⁸⁹]+)\*\*/g)]
        .map((m) => supANum(m[1]))
        .filter((n) => Number.isFinite(n) && n > 0);
      if (versos.length && seccion && seccion.v === null) seccion.v = versos[0];
      continue; // el texto KJV citado no se publica: ya tenemos RV1909
    }
    const texto = linea.trim();
    if (!texto) {
      cerrarParrafo();
      continue;
    }
    parrafo += (parrafo ? ' ' : '') + texto;
  }
  cerrarParrafo();
  return cap;
}

const VOLUMENES = ['volume-1', 'volume-2', 'volume-3', 'volume-4', 'volume-5', 'volume-6'];

// los libros viven dentro de un volumen: buscarlos ahí
function carpetaDeLibro(carpeta) {
  for (const vol of VOLUMENES) {
    const d = path.join(RAW, vol, carpeta);
    if (fs.existsSync(d)) return d;
  }
  return null;
}

// ── ejecución ──────────────────────────────────────────────────────────────
fs.mkdirSync(OUT, { recursive: true });
if (!fs.existsSync(RAW)) {
  console.error('✗ Crudo no encontrado en:', RAW);
  process.exit(1);
}
const errores = [];
let totalCapitulos = 0;
let totalSecciones = 0;
let totalPalabras = 0;

for (const [carpeta, osis] of Object.entries(LIBROS)) {
  const dirLibro = carpetaDeLibro(carpeta);
  if (!dirLibro) {
    errores.push(`Falta carpeta del libro: ${carpeta}`);
    continue;
  }
  const capitulos = {};
  for (const archivo of fs.readdirSync(dirLibro)) {
    // los salmos usan psalm-N.md en lugar de chapter-N.md
    const m = archivo.match(/^(?:chapter|psalm)-(\d+)\.md$/);
    if (!m) continue;
    const numCap = Number(m[1]);
    const cap = parseChapter(path.join(dirLibro, archivo));
    const conContenido =
      (cap.r ? cap.r.length : 0) + cap.s.reduce((a, s) => a + s.p.join(' ').length, 0);
    if (conContenido < 200) errores.push(`${osis}.${numCap}: contenido sospechosamente corto (${conContenido} chars)`);
    capitulos[numCap] = cap;
    totalCapitulos++;
    totalSecciones += cap.s.length;
    totalPalabras += ((cap.r || '').split(/\s+/).length + cap.s.reduce((a, s) => a + s.p.join(' ').split(/\s+/).length, 0));
  }
  // portón: cobertura de capítulos contra RV1909
  const biblia = JSON.parse(fs.readFileSync(path.join(BIBLIAS, `${osis}.json`), 'utf8'));
  const capsBiblia = new Set(biblia.versos.map((v) => v.c));
  const capsHenry = new Set(Object.keys(capitulos).map(Number));
  const faltan = [...capsBiblia].filter((c) => !capsHenry.has(c));
  if (faltan.length) errores.push(`${osis}: capítulos sin comentario: ${faltan.join(',')}`);
  fs.writeFileSync(path.join(OUT, `${osis}.json`), JSON.stringify({ osis, c: capitulos }));
}

const manifest = {
  obra: "Matthew Henry, Complete Commentary (1706–1721)",
  licencia: 'Dominio público (obra) · edición markdown lyteword/mhenry-complete CC0-1.0',
  fuente: 'https://github.com/lyteword/mhenry-complete',
  crudo_en: '05. Datos/corpus_crudo/mhenry',
  fecha_ingesta: new Date().toISOString().slice(0, 10),
  total_capitulos: totalCapitulos,
  total_secciones: totalSecciones,
  total_palabras_aprox: totalPalabras,
  idioma: 'en (traducción ES = piloto D20, pendiente)',
};
fs.writeFileSync(path.join(OUT, '_manifest.json'), JSON.stringify(manifest, null, 2));

if (errores.length) {
  console.error(`✗ PORTÓN HENRY FALLÓ — ${errores.length} incidencias:`);
  errores.slice(0, 20).forEach((e) => console.error('  · ' + e));
  process.exit(1);
}
console.log(`✓ Henry ingerido: ${totalCapitulos} capítulos, ${totalSecciones} secciones, ~${totalPalabras.toLocaleString('es')} palabras, 66 libros.`);
