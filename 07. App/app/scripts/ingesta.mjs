/**
 * Ingesta USFM → JSON — pipeline genérico con portón de validación (B9 + GLM E2)
 *
 * Uso: node scripts/ingesta.mjs <edicion>   (rv1909 | web)
 *
 * Fuente: eBible.org — ediciones en dominio público
 * Crudo:  ../../05. Datos/corpus_crudo/<carpeta>/  (fuera del repo de la app)
 * Salida: public/data/<salida>/{OSIS}.json + _manifest.json
 *
 * Portón: valida 66 libros canónicos (canon protestante, D3), capítulos por
 * libro, secuencia sin lagunas ni duplicados, libros ancla y total cuando la
 * edición tiene versificación conocida. Los versículos vacíos EN LA FUENTE no
 * se rellenan: quedan documentados en manifest.incidentes.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.dirname(fileURLToPath(import.meta.url));
const BASE_CRUDO = path.join(ROOT, '..', '..', '..', '05. Datos', 'corpus_crudo');
const BASE_OUT = path.join(ROOT, '..', 'public', 'data');

/** Canon protestante: OSIS → [nombre ES, capítulos esperados] */
const CANON = {
  GEN: ['Génesis', 50], EXO: ['Éxodo', 40], LEV: ['Levítico', 27], NUM: ['Números', 36],
  DEU: ['Deuteronomio', 34], JOS: ['Josué', 24], JDG: ['Jueces', 21], RUT: ['Rut', 4],
  '1SA': ['1 Samuel', 31], '2SA': ['2 Samuel', 24], '1KI': ['1 Reyes', 22], '2KI': ['2 Reyes', 25],
  '1CH': ['1 Crónicas', 29], '2CH': ['2 Crónicas', 36], EZR: ['Esdras', 10], NEH: ['Nehemías', 13],
  EST: ['Ester', 10], JOB: ['Job', 42], PSA: ['Salmos', 150], PRO: ['Proverbios', 31],
  ECC: ['Eclesiastés', 12], SNG: ['Cantares', 8], ISA: ['Isaías', 66], JER: ['Jeremías', 52],
  LAM: ['Lamentaciones', 5], EZK: ['Ezequiel', 48], DAN: ['Daniel', 12], HOS: ['Oseas', 14],
  JOL: ['Joel', 3], AMO: ['Amós', 9], OBA: ['Obadías', 1], JON: ['Jonás', 4],
  MIC: ['Miqueas', 7], NAM: ['Nahúm', 3], HAB: ['Habacuc', 3], ZEP: ['Sofonías', 3],
  HAG: ['Hageo', 2], ZEC: ['Zacarías', 14], MAL: ['Malaquías', 4],
  MAT: ['Mateo', 28], MRK: ['Marcos', 16], LUK: ['Lucas', 24], JHN: ['Juan', 21],
  ACT: ['Hechos', 28], ROM: ['Romanos', 16], '1CO': ['1 Corintios', 16], '2CO': ['2 Corintios', 13],
  GAL: ['Gálatas', 6], EPH: ['Efesios', 6], PHP: ['Filipenses', 4], COL: ['Colosenses', 4],
  '1TH': ['1 Tesalonicenses', 5], '2TH': ['2 Tesalonicenses', 3], '1TI': ['1 Timoteo', 6],
  '2TI': ['2 Timoteo', 4], TIT: ['Tito', 3], PHM: ['Filemón', 1], HEB: ['Hebreos', 13],
  JAS: ['Santiago', 5], '1PE': ['1 Pedro', 5], '2PE': ['2 Pedro', 3], '1JN': ['1 Juan', 5],
  '2JN': ['2 Juan', 1], '3JN': ['3 Juan', 1], JUD: ['Judas', 1], REV: ['Apocalipsis', 22],
};
const ORDEN = Object.keys(CANON);

/** Ancla estricta NT (estable entre ediciones de linaje TR/ASV) y OT base. */
const ANCLAS_NT = { MAT: 1071, MRK: 678, LUK: 1151, JHN: 879, ACT: 1007, ROM: 433, REV: 404 };
const ANCLAS_OT = { GEN: 1533, PSA: 2461, ISA: 1292, JER: 1364 };

const EDICIONES = {
  rv1909: {
    obra: 'Reina-Valera 1909',
    osis_obra: 'RV1909',
    idioma: 'es',
    licencia: 'Dominio público',
    fuente: 'eBible.org — https://ebible.org/Scriptures/spaRV1909_usfm.zip',
    crudo: 'rv1909_usfm',
    sufijo: 'spaRV1909.usfm',
    salida: 'rv1909',
    totalEsperado: 31102,
    anclas: { ...ANCLAS_OT, ...ANCLAS_NT },
  },
  web: {
    obra: 'World English Bible',
    osis_obra: 'WEB',
    idioma: 'en',
    licencia: 'Dominio público (el nombre «World English Bible» es marca de M. P. Johnson — ver ficha legal)',
    fuente: 'eBible.org — https://ebible.org/Scriptures/eng-web_usfm.zip',
    crudo: 'web_usfm',
    sufijo: 'eng-web.usfm',
    salida: 'web',
    // WEB: versificación verificada con evidencia del crudo (2026-09-17):
    // ROM 16 termina en v24; la doxología TR 16:25-27 va en nota al pie y
    // \v 25 queda como marcador vacío → 434 marcadores. PSA 2461 coincide.
    totalEsperado: 31103,
    anclas: { ...ANCLAS_OT, ...ANCLAS_NT, ROM: 434 },
  },
};

const stripInline = (s) =>
  s
    .replace(/\|strong="[^"]*"/g, '')  // atributos de marcado \w
    .replace(/\|[\w.]+="[^"]*"/g, '')  // otros atributos
    .replace(/\\[+a-zA-Z]+\d*\*/g, '') // marcadores de cierre (\add*, \+w*): antes que los de apertura
    .replace(/\\[+a-zA-Z]+\d*/g, '')   // marcadores USFM de apertura (\v, \+w, …)
    .replace(/\\\*/g, '')
    .replace(/~/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

function parseBook(file) {
  // notas al pie y finales se quitan ANTES de partir por líneas (span multilínea)
  const text = fs
    .readFileSync(file, 'utf8')
    .replace(/\\f [\s\S]*?\\f\*/g, '')
    .replace(/\\fe [\s\S]*?\\fe\*/g, '');
  const lines = text.split('\n');
  const caps = {};
  let cap = null;
  let cur = null;
  for (const line of lines) {
    const mC = line.match(/^\\c (\d+)\s*$/);
    if (mC) {
      if (cur) (caps[cap] ??= []).push(cur);
      cur = null;
      cap = Number(mC[1]);
      caps[cap] ??= [];
      continue;
    }
    const mV = line.match(/^\\v (\d+)\s*(.*)$/);
    if (mV) {
      if (cur) (caps[cap] ??= []).push(cur);
      cur = { v: Number(mV[1]), t: stripInline(mV[2]) };
      continue;
    }
    if (cur) {
      const extra = stripInline(line);
      if (extra) cur.t = `${cur.t} ${extra}`.trim();
    }
  }
  if (cur) (caps[cap] ??= []).push(cur);
  return caps;
}

// ── ejecución ──────────────────────────────────────────────────────────────
const clave = process.argv[2];
const ed = EDICIONES[clave];
if (!ed) {
  console.error(`Edición desconocida: "${clave}". Opciones: ${Object.keys(EDICIONES).join(', ')}`);
  process.exit(1);
}

const RAW = path.join(BASE_CRUDO, ed.crudo);
const OUT = path.join(BASE_OUT, ed.salida);
fs.mkdirSync(OUT, { recursive: true });

const files = fs.readdirSync(RAW).filter((f) => f.endsWith(ed.sufijo));
const enCanon = files.filter((f) => {
  const m = f.match(/^(\d+)-(.+?)\.(?:usfm)$/);
  const codigo = m ? m[2].replace(new RegExp(ed.sufijo.replace('.usfm', '') + '$'), '') : null;
  return codigo && CANON[codigo];
});
if (enCanon.length !== 66) {
  console.error(`PORTÓN: se esperaban 66 libros canónicos, hay ${enCanon.length}. Abortado.`);
  process.exit(1);
}

const manifest = {
  obra: ed.obra,
  osis_obra: ed.osis_obra,
  idioma: ed.idioma,
  licencia: ed.licencia,
  fuente: ed.fuente,
  crudo_en: `05. Datos/corpus_crudo/${ed.crudo}`,
  fecha_ingesta: new Date().toISOString().slice(0, 10),
  formato_entrada: 'USFM (con marcado \\w|strong preservado en el crudo)',
  canon: 'Protestante, 66 libros (D3). Los archivos no canónicos del crudo quedan preservados para la decisión pendiente del canon.',
  total_versos: 0,
  incidentes: [],
  libros: [],
};

const errores = [];
for (const f of enCanon) {
  const osis = f.match(/^\d+-(.+)\./)[1].replace(new RegExp(ed.sufijo.replace('.usfm', '') + '$'), '');
  const meta = CANON[osis];

  const caps = parseBook(path.join(RAW, f));
  const nCaps = Object.keys(caps).length;
  if (nCaps !== meta[1]) errores.push(`${osis}: ${nCaps} capítulos, esperados ${meta[1]}`);

  const versos = [];
  const vacios = [];
  for (const [c, lista] of Object.entries(caps)) {
    const vistos = new Set();
    const nums = [];
    for (const v of lista) {
      if (vistos.has(v.v)) errores.push(`${osis}.${c}.${v.v} duplicado`);
      vistos.add(v.v);
      nums.push(v.v);
      if (!v.t) { vacios.push(`${osis}.${c}.${v.v}`); continue; }
      versos.push({ c: Number(c), v: v.v, osis: `${osis}.${c}.${v.v}`, t: v.t });
    }
    const max = Math.max(...nums);
    for (let i = 1; i <= max; i++) {
      if (!nums.includes(i)) errores.push(`${osis}.${c}.${i} falta`);
    }
  }
  vacios.forEach((r) => manifest.incidentes.push({ ref: r, tipo: 'verso_vacio_en_fuente' }));

  fs.writeFileSync(
    path.join(OUT, `${osis}.json`),
    JSON.stringify({ osis, nombre: meta[0], versos })
  );
  manifest.total_versos += versos.length + vacios.length;
  manifest.libros.push({ osis, nombre: meta[0], caps: nCaps, versos: versos.length, versos_vacios: vacios.length, marcadores: versos.length + vacios.length });
}

for (const [osis, esperado] of Object.entries(ed.anclas)) {
  const libro = manifest.libros.find((l) => l.osis === osis);
  if (!libro) { errores.push(`Ancla faltante: ${osis}`); continue; }
  if (libro.marcadores !== esperado) errores.push(`PORTÓN ${osis}: ${libro.marcadores} marcadores, esperados ${esperado}`);
}
if (ed.totalEsperado !== null && manifest.total_versos !== ed.totalEsperado) {
  errores.push(`PORTÓN TOTAL: ${manifest.total_versos} marcadores, esperados ${ed.totalEsperado}`);
}

manifest.libros.sort((a, b) => ORDEN.indexOf(a.osis) - ORDEN.indexOf(b.osis));
fs.writeFileSync(path.join(OUT, '_manifest.json'), JSON.stringify(manifest, null, 2));

if (errores.length) {
  console.error(`✗ PORTÓN DE INGESTA FALLÓ (${ed.osis_obra}) — ${errores.length} incidencias:`);
  errores.slice(0, 30).forEach((e) => console.error('  · ' + e));
  process.exit(1);
}
console.log(`✓ ${ed.osis_obra} ingerida y validada: ${manifest.total_versos} marcadores de verso, 66 libros, ${manifest.incidentes.length} versos vacíos en la fuente (documentados).`);
