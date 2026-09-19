/**
 * Ingesta STEPBible-Data — TSV → JSON por libro (fuentes CC BY 4.0, ficha legal en 02. Legal/)
 *
 * Uso: node scripts/ingesta-stepbible.mjs
 *
 * Entrada (crudo en 05. Datos/corpus_crudo/stepbible_data/):
 *   TAGNT (NT griego amalgamado, 2 archivos) · TAHOT (AT hebreo, 4 archivos) · TBESH · TBESG
 * Salida:
 *   public/data/stepbible/tagnt/{OSIS}.json · tahot/{OSIS}.json · tbesh.json · tbesg.json · _manifest.json
 *
 * Portón: cada referencia de palabra se valida contra la coordenada OSIS de
 * nuestra RV1909 ya validada. Los desajustes de versificación no bloquean:
 * se documentan (tarea 2.2 = mapeo de versificación).
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.dirname(fileURLToPath(import.meta.url));
const RAW = path.join(ROOT, '..', '..', '..', '05. Datos', 'corpus_crudo', 'stepbible_data');
const BIBLIAS = path.join(ROOT, '..', 'public', 'data');
const OUT = path.join(BIBLIAS, 'stepbible');

const MAPA_TAGNT = {
  Mat: 'MAT', Mrk: 'MRK', Luk: 'LUK', Jhn: 'JHN', Act: 'ACT', Rom: 'ROM', '1Co': '1CO', '2Co': '2CO',
  Gal: 'GAL', Eph: 'EPH', Php: 'PHP', Col: 'COL', '1Th': '1TH', '2Th': '2TH', '1Ti': '1TI',
  '2Ti': '2TI', Tit: 'TIT', Phm: 'PHM', Heb: 'HEB', Jas: 'JAS', '1Pe': '1PE', '2Pe': '2PE',
  '1Jn': '1JN', '2Jn': '2JN', '3Jn': '3JN', Jud: 'JUD', Rev: 'REV',
};
const MAPA_TAHOT = {
  Gen: 'GEN', Exo: 'EXO', Lev: 'LEV', Num: 'NUM', Deu: 'DEU', Jos: 'JOS', Jdg: 'JDG', Rut: 'RUT',
  '1Sa': '1SA', '2Sa': '2SA', '1Ki': '1KI', '2Ki': '2KI', '1Ch': '1CH', '2Ch': '2CH', Ezr: 'EZR',
  Neh: 'NEH', Est: 'EST', Job: 'JOB', Psa: 'PSA', Pro: 'PRO', Ecc: 'ECC', Sng: 'SNG', Isa: 'ISA',
  Jer: 'JER', Lam: 'LAM', Ezk: 'EZK', Dan: 'DAN', Hos: 'HOS', Jol: 'JOL', Amo: 'AMO', Oba: 'OBA',
  Jon: 'JON', Mic: 'MIC', Nam: 'NAM', Hab: 'HAB', Zep: 'ZEP', Hag: 'HAG', Zec: 'ZEC', Mal: 'MAL',
};

const RE_FILA = /^([A-Za-z0-9]+)\.(\d+)\.(\d+)#(\d+)=([^\t]*)\t/;
const conteoCoordenadas = new Map(); // osis -> Set("c.v")
const incidencias = [];
let totalRefsNoEncontradas = 0;

/** Coordenada OSIS de referencia (RV1909 validada) para el portón. */
function coordenadasDe(osis) {
  if (!conteoCoordenadas.has(osis)) {
    try {
      const biblia = JSON.parse(fs.readFileSync(path.join(BIBLIAS, 'rv1909', `${osis}.json`), 'utf8'));
      conteoCoordenadas.set(osis, new Set(biblia.versos.map((v) => `${v.c}.${v.v}`)));
    } catch {
      conteoCoordenadas.set(osis, null);
    }
  }
  return conteoCoordenadas.get(osis);
}

function procesarCorriente({ archivos, mapa, salida, idiomaDir, conGlosaEs }) {
  fs.mkdirSync(path.join(OUT, salida), { recursive: true });
  const libros = new Map(); // osis -> { versos: Map("c.v" -> palabras[]) }
  const stats = { palabras: 0, refsOk: 0, refsAjustadas: 0, lineasIgnoradas: 0 };

  for (const archivo of archivos) {
    const lineas = fs.readFileSync(path.join(RAW, archivo), 'utf8').split('\n');
    for (const linea of lineas) {
      const m = linea.match(RE_FILA);
      if (!m) { stats.lineasIgnoradas++; continue; }
      const [, codigo, c, v] = m;
      const osis = mapa[codigo];
      if (!osis) { stats.lineasIgnoradas++; continue; }

      const col = linea.split('\t');
      const coords = `${c}.${v}`;

      const palabra = conGlosaEs
        ? {
            g: (col[1] || '').replace(/\s*\([^)]*\)\s*$/, '').trim(),
            t: ((col[1] || '').match(/\(([^)]+)\)/) || [])[1] || '',
            e: (col[2] || '').trim(),
            es: (col[8] || '').trim(),
            s: (col[11] || '').trim(),
            m: ((col[3] || '').split('=')[1] || '').trim(),
            lex: ((col[4] || '').split('=')[0] || '').trim(),
            tp: m[5].trim(),
          }
        : {
            g: (col[1] || '').trim(),
            t: (col[2] || '').trim(),
            e: (col[3] || '').trim(),
            s: (col[8] || '').trim(),
            m: (col[5] || '').trim(),
            tp: m[5].trim(),
          };

      if (!libros.has(osis)) libros.set(osis, { osis, versos: new Map() });
      const libro = libros.get(osis);
      if (!libro.versos.has(coords)) libro.versos.set(coords, []);
      libro.versos.get(coords).push(palabra);
      stats.palabras++;

      // portón: coordenada contra RV1909
      const conocidas = coordenadasDe(osis);
      if (conocidas && conocidas.has(coords)) stats.refsOk++;
      else {
        stats.refsAjustadas++;
        totalRefsNoEncontradas++;
        const refCompleta = `${osis}.${coords}`;
        if (!incidencias.some((i) => i.ref === refCompleta) && incidencias.length < 40) {
          incidencias.push({ ref: refCompleta, tipo: 'coordenada_no_encontrada_en_rv1909', archivo });
        }
      }
    }
  }

  let archivosEscritos = 0;
  for (const [osis, libro] of libros) {
    const versos = {};
    for (const [coords, palabras] of libro.versos) versos[coords] = palabras;
    fs.writeFileSync(path.join(OUT, salida, `${osis}.json`), JSON.stringify({ osis, dir: idiomaDir, versos }));
    archivosEscritos++;
  }
  return { ...stats, archivosEscritos, libros: libros.size };
}

function procesarLexicon({ archivo, patron, salida }) {
  const RE = new RegExp(patron);
  const lineas = fs.readFileSync(path.join(RAW, archivo), 'utf8').split('\n');
  const entradas = {};
  const porIdSimple = {};
  let filas = 0;
  for (const linea of lineas) {
    if (!RE.test(linea)) continue;
    const col = linea.split('\t');
    if (col.length < 8 || !col[6].trim()) continue;
    const id = (col[2] || '').trim() || (col[0] || '').trim();
    const simple = (col[0] || '').trim();
    entradas[id] = {
      w: (col[3] || '').trim(),
      t: (col[4] || '').trim(),
      m: (col[5] || '').trim(),
      g: (col[6] || '').trim(),
      d: (col[7] || '').trim(),
    };
    (porIdSimple[simple] ??= []).push(id);
    filas++;
  }
  fs.writeFileSync(path.join(OUT, salida), JSON.stringify({ entradas, indice: porIdSimple }));
  return { filas, ids: Object.keys(entradas).length, simples: Object.keys(porIdSimple).length };
}

// ── ejecución ──────────────────────────────────────────────────────────────
fs.mkdirSync(OUT, { recursive: true });

const tagnt = procesarCorriente({
  archivos: ['TAGNT-MatJhn.txt', 'TAGNT-ActRev.txt'],
  mapa: MAPA_TAGNT,
  salida: 'tagnt',
  idiomaDir: 'ltr',
  conGlosaEs: true,
});
const tahot = procesarCorriente({
  archivos: ['TAHOT-GenDeu.txt', 'TAHOT-JosEst.txt', 'TAHOT-JobSng.txt', 'TAHOT-IsaMal.txt'],
  mapa: MAPA_TAHOT,
  salida: 'tahot',
  idiomaDir: 'rtl',
  conGlosaEs: false,
});
const tbesg = procesarLexicon({ archivo: 'TBESG.txt', patron: '^G\\d+\\t', salida: 'tbesg.json' });
const tbesh = procesarLexicon({ archivo: 'TBESH.txt', patron: '^H\\d+\\t', salida: 'tbesh.json' });

const manifest = {
  fuente: 'STEPBible-Data — Tyndale House, Cambridge · https://github.com/STEPBible/STEPBible-Data',
  licencia: 'CC BY 4.0 (atribución obligatoria — ver 02. Legal/Ficha - STEPBible-Data.md)',
  fecha_ingesta: new Date().toISOString().slice(0, 10),
  crudo_en: '05. Datos/corpus_crudo/stepbible_data',
  tagnt: { ...tagnt, descripcion: 'NT griego amalgamado (NA28/TR/SBLGNT/Byz/WH), glosas EN + ES' },
  tahot: { ...tahot, descripcion: 'AT hebreo (Westminster Leningrad) con morfología' },
  tbesg,
  tbesh,
  porton: {
    refs_ok_contra_rv1909: tagnt.refsOk + tahot.refsOk,
    refs_no_encontradas: tagnt.refsAjustadas + tahot.refsAjustadas,
    nota: 'Los desajustes son diferencias de versificación (NRSV vs RV1909/KJV) — mapeo formal en tarea 2.2. No bloquean: el interlineal se sirve por coordenada existente.',
  },
  incidentes: incidencias,
};
fs.writeFileSync(path.join(OUT, '_manifest.json'), JSON.stringify(manifest, null, 2));

console.log(`✓ TAGNT: ${tagnt.palabras.toLocaleString('es')} palabras, ${tagnt.libros} libros, ${tagnt.archivosEscritos} archivos`);
console.log(`✓ TAHOT: ${tahot.palabras.toLocaleString('es')} palabras, ${tahot.libros} libros, ${tahot.archivosEscritos} archivos`);
console.log(`✓ TBESG: ${tbesg.ids} entradas · TBESH: ${tbesh.ids} entradas`);
console.log(`⟐ PORTÓN contra RV1909: ${manifest.porton.refs_ok_contra_rv1909.toLocaleString('es')} coordenadas exactas · ${manifest.porton.refs_no_encontradas.toLocaleString('es')} desajustes de versificación (documentados en _manifest.json)`);
if (totalRefsNoEncontradas / (tagnt.palabras + tahot.palabras) > 0.05) {
  console.error('✗ Más del 5% de coordenadas desalineadas — revisar antes de exponer en UI.');
  process.exit(1);
}
