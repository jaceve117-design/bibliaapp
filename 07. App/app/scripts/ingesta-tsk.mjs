/**
 * Ingesta de referencias cruzadas — OpenBible (CC BY) + Treasury of Scripture Knowledge (PD)
 *
 * Uso: node scripts/ingesta-tsk.mjs
 *
 * Fuentes (crudo en 05. Datos/corpus_crudo/tsk_data/):
 *   openbible/cross_references.txt  — TSV "From/To/Votes", CC-BY 2016 (community-voted)
 *   tsk_shards/1..32.json           — TSK R.A. Torrey, dominio público (formato SoulLiberty)
 * Salida:
 *   public/data/tsk/{OSIS}.json — { osis, refs: { "c.v": ["OSIS.c.v", ...] } } + _manifest.json
 *
 * Portón: coordenadas de origen y destino validadas contra RV1909. Desajustes documentados.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.dirname(fileURLToPath(import.meta.url));
const RAW = path.join(ROOT, '..', '..', '..', '05. Datos', 'corpus_crudo', 'tsk_data');
const BIBLIAS = path.join(ROOT, '..', 'public', 'data', 'rv1909');
const OUT = path.join(ROOT, '..', 'public', 'data', 'tsk');

/** Abreviaturas OpenBible (nombres NRSV largos) → OSIS — inventario completo del archivo */
const MAPA_OB = {
  Gen: 'GEN', Exo: 'EXO', Exod: 'EXO', Lev: 'LEV', Num: 'NUM', Deu: 'DEU', Deut: 'DEU',
  Josh: 'JOS', Jos: 'JOS', Jdg: 'JDG', Judg: 'JDG', Rut: 'RUT', Ruth: 'RUT',
  '1Sa': '1SA', '2Sa': '2SA', '1Sam': '1SA', '2Sam': '2SA', '1Ki': '1KI', '2Ki': '2KI',
  '1Kgs': '1KI', '2Kgs': '2KI', '1Ch': '1CH', '2Ch': '2CH', '1Chr': '1CH', '2Chr': '2CH',
  Ezr: 'EZR', Ezra: 'EZR', Neh: 'NEH', Est: 'EST', Esth: 'EST', Job: 'JOB', Psa: 'PSA', Ps: 'PSA',
  Pro: 'PRO', Prov: 'PRO', Ecc: 'ECC', Eccl: 'ECC', Sng: 'SNG', Song: 'SNG', Isa: 'ISA',
  Jer: 'JER', Lam: 'LAM', Eze: 'EZK', Ezk: 'EZK', Ezek: 'EZK', Dan: 'DAN', Hos: 'HOS',
  Joe: 'JOL', Jol: 'JOL', Joel: 'JOL', Amo: 'AMO', Amos: 'AMO', Oba: 'OBA', Obad: 'OBA',
  Jon: 'JON', Jonah: 'JON', Mic: 'MIC', Nam: 'NAM', Nah: 'NAM', Hab: 'HAB', Zep: 'ZEP',
  Zeph: 'ZEP', Hag: 'HAG', Zec: 'ZEC', Zech: 'ZEC', Mal: 'MAL',
  Mat: 'MAT', Matt: 'MAT', Mrk: 'MRK', Mark: 'MRK', Luk: 'LUK', Luke: 'LUK', Jhn: 'JHN',
  Joh: 'JHN', John: 'JHN', Act: 'ACT', Acts: 'ACT', Rom: 'ROM', '1Co': '1CO', '1Cor': '1CO',
  '2Co': '2CO', '2Cor': '2CO', Gal: 'GAL', Eph: 'EPH', Php: 'PHP', Phil: 'PHP', Col: 'COL',
  '1Th': '1TH', '1Thess': '1TH', '2Th': '2TH', '2Thess': '2TH', '1Ti': '1TI', '1Tim': '1TI',
  '2Ti': '2TI', '2Tim': '2TI', Tit: 'TIT', Titus: 'TIT', Phm: 'PHM', Phlm: 'PHM', Heb: 'HEB',
  Jas: 'JAS', '1Pe': '1PE', '1Pet': '1PE', '2Pe': '2PE', '2Pet': '2PE', '1Jn': '1JN',
  '1John': '1JN', '2Jn': '2JN', '2John': '2JN', '3Jn': '3JN', '3John': '3JN', Jud: 'JUD',
  Jude: 'JUD', Jde: 'JUD', Rev: 'REV',
};

/** Abreviaturas de los shards TSK (formato SoulLiberty) → OSIS — diferencias conocidas */
const MAPA_TSK = {
  GEN: 'GEN', EXO: 'EXO', LEV: 'LEV', NUM: 'NUM', DEU: 'DEU', JOS: 'JOS', JDG: 'JDG', RUT: 'RUT',
  '1SA': '1SA', '2SA': '2SA', '1KI': '1KI', '2KI': '2KI', '1CH': '1CH', '2CH': '2CH', EZR: 'EZR',
  NEH: 'NEH', EST: 'EST', JOB: 'JOB', PSA: 'PSA', PRO: 'PRO', ECC: 'ECC', SOS: 'SNG', ISA: 'ISA',
  JER: 'JER', LAM: 'LAM', EZE: 'EZK', DAN: 'DAN', HOS: 'HOS', JOE: 'JOL', AMO: 'AMO', OBA: 'OBA',
  JON: 'JON', MIC: 'MIC', NAH: 'NAM', HAB: 'HAB', ZEP: 'ZEP', HAG: 'HAG', ZEC: 'ZEC', MAL: 'MAL',
  MAT: 'MAT', MAR: 'MRK', LUK: 'LUK', JOH: 'JHN', ACT: 'ACT', ROM: 'ROM', '1CO': '1CO',
  '2CO': '2CO', GAL: 'GAL', EPH: 'EPH', PHP: 'PHP', COL: 'COL', '1TH': '1TH', '2TH': '2TH',
  '1TI': '1TI', '2TI': '2TI', TIT: 'TIT', PHM: 'PHM', HEB: 'HEB', JAM: 'JAS', '1PE': '1PE',
  '2PE': '2PE', '1JO': '1JN', '2JO': '2JN', '3JO': '3JN', JDE: 'JUD', REV: 'REV',
};

const librosValidos = new Map(); // osis -> Set("c.v") bajo demanda
function coordenadasDe(osis) {
  let s = librosValidos.get(osis);
  if (!s) {
    try {
      const b = JSON.parse(fs.readFileSync(path.join(BIBLIAS, `${osis}.json`), 'utf8'));
      s = new Set(b.versos.map((v) => `${v.c}.${v.v}`));
    } catch {
      s = null;
    }
    librosValidos.set(osis, s);
  }
  return s;
}
const existe = (osis, c, v) => {
  const s = coordenadasDe(osis);
  return s ? s.has(`${c}.${v}`) : false;
};

const refs = new Map(); // "OSIS.c.v" -> Map(target -> {src, votos})
const desconocidos = new Set();
let lineasOb = 0;

// ── OpenBible ──────────────────────────────────────────────────────────────
const obTxt = fs.readFileSync(path.join(RAW, 'openbible', 'cross_references.txt'), 'utf8');
for (const linea of obTxt.split('\n')) {
  if (!linea || /^From Verse/.test(linea)) continue;
  const [de, a, votos] = linea.split('\t');
  if (!de || !a) continue;
  const [ob1, c1, v1] = de.split('.');
  const [ob2, c2, v2] = a.split('.');
  const o1 = MAPA_OB[ob1];
  const o2 = MAPA_OB[ob2];
  if (!o1 || !o2) {
    [ob1, ob2].forEach((x) => !MAPA_OB[x] && desconocidos.add(`openbible: ${x}`));
    continue;
  }
  lineasOb++;
  const clave = `${o1}.${c1}.${v1}`;
  if (!refs.has(clave)) refs.set(clave, new Map());
  refs.get(clave).set(`${o2}.${c2}.${v2}`, { votos: Number(votos) || 0, src: 'ob' });
}

// ── TSK (SoulLiberty shards) ───────────────────────────────────────────────
let refsTsk = 0;
const shardFiles = fs.readdirSync(path.join(RAW, 'tsk_shards')).filter((f) => f.endsWith('.json')).sort((a, b) => Number(a.replace('.json', '')) - Number(b.replace('.json', '')));
for (const archivo of shardFiles) {
  const data = JSON.parse(fs.readFileSync(path.join(RAW, 'tsk_shards', archivo), 'utf8'));
  for (const nodo of Object.values(data)) {
    const [c1, v1] = nodo.v.split(/\s+/).slice(1);
    const o1 = MAPA_TSK[nodo.v.split(/\s+/)[0]];
    if (!o1) {
      desconocidos.add(`tsk: ${nodo.v.split(/\s+/)[0]}`);
      continue;
    }
    const clave = `${o1}.${c1}.${v1}`;
    if (!refs.has(clave)) refs.set(clave, new Map());
    for (const destino of Object.values(nodo.r ?? {})) {
      const partes = destino.split(/\s+/);
      const o2 = MAPA_TSK[partes[0]];
      if (!o2) {
        desconocidos.add(`tsk: ${partes[0]}`);
        continue;
      }
      const c2 = partes[1];
      const v2 = partes.slice(2).join('.');
      const actual = refs.get(clave).get(`${o2}.${c2}.${v2}`);
      if (actual) actual.src = 'ambos';
      else {
        refs.get(clave).set(`${o2}.${c2}.${v2}`, { votos: 0, src: 'tsk' });
        refsTsk++;
      }
    }
  }
}

// ── validación y salida ────────────────────────────────────────────────────
const porLibro = new Map(); // OSIS -> { osis, refs: {"c.v": [...]} }
const stats = { origenesOk: 0, origenesFuera: 0, destinosOk: 0, destinosFuera: 0 };
const muestras = [];

for (const [clave, destinos] of refs) {
  const [osis, c, v] = clave.split('.');
  const ordenados = [...destinos.entries()]
    .sort((x, y) => (y[1].src === 'ambos' ? -1 : 0) - (x[1].src === 'ambos' ? -1 : 0) || y[1].votos - x[1].votos)
    .map(([d]) => d);

  const origenOk = existe(osis, c, v);
  if (origenOk) stats.origenesOk++;
  else {
    stats.origenesFuera++;
    if (muestras.length < 25) muestras.push({ ref: clave, tipo: 'origen_fuera_de_rv1909' });
  }

  const validos = [];
  for (const d of ordenados) {
    const [dO, dC, dV] = d.split('.');
    if (existe(dO, dC, dV)) {
      validos.push(d);
      stats.destinosOk++;
    } else {
      stats.destinosFuera++;
      if (muestras.length < 25) muestras.push({ ref: `${clave}→${d}`, tipo: 'destino_fuera_de_rv1909' });
    }
  }
  if (!validos.length) continue;
  if (!porLibro.has(osis)) porLibro.set(osis, { osis, refs: {} });
  porLibro.get(osis).refs[`${c}.${v}`] = validos;
}

fs.mkdirSync(OUT, { recursive: true });
let totalRefs = 0;
let totalVersosConRefs = 0;
for (const [osis, data] of porLibro) {
  fs.writeFileSync(path.join(OUT, `${osis}.json`), JSON.stringify(data));
  totalRefs += Object.values(data.refs).reduce((a, r) => a + r.length, 0);
  totalVersosConRefs += Object.keys(data.refs).length;
}

const manifest = {
  descripcion: 'Referencias cruzadas: OpenBible.info (community-voted, CC-BY 2016) + Treasury of Scripture Knowledge (R.A. Torrey, dominio público)',
  fuentes: [
    { nombre: 'OpenBible.info cross-references', licencia: 'CC BY 2016 (declarada en el propio archivo)', url: 'https://www.openbible.info/labs/cross-references/', via: 'neuu-org/bible-crossrefs-dataset (CC BY 4.0)' },
    { nombre: 'Treasury of Scripture Knowledge (1897, R.A. Torrey)', licencia: 'Dominio público', via: 'shards SoulLiberty incluidos en neuu-org/bible-crossrefs-dataset' },
  ],
  fecha_ingesta: new Date().toISOString().slice(0, 10),
  crudo_en: '05. Datos/corpus_crudo/tsk_data',
  lineas_openbible: lineasOb,
  refs_tsk_adicionales: refsTsk,
  total_versos_con_referencias: totalVersosConRefs,
  total_referencias: totalRefs,
  porton: { ...stats, porcentaje_alineacion: `${((stats.origenesOk / (stats.origenesOk + stats.origenesFuera)) * 100).toFixed(2)}%` },
  codigos_desconocidos: [...desconocidos],
  incidentes: muestras,
};
fs.writeFileSync(path.join(OUT, '_manifest.json'), JSON.stringify(manifest, null, 2));

console.log(`✓ TSK+OpenBible: ${totalRefs.toLocaleString('es')} referencias en ${totalVersosConRefs.toLocaleString('es')} versos, ${porLibro.size} libros`);
console.log(`⟐ PORTÓN: origen ok ${stats.origenesOk.toLocaleString('es')} / fuera ${stats.origenesFuera.toLocaleString('es')} · destino ok ${stats.destinosOk.toLocaleString('es')} / fuera ${stats.destinosFuera.toLocaleString('es')}`);
if (desconocidos.size) console.log(`⚠ Códigos desconocidos: ${[...desconocidos].slice(0, 10).join(', ')}`);
const pct = (stats.origenesOk / (stats.origenesOk + stats.origenesFuera)) * 100;
if (pct < 95) {
  console.error('✗ Menos del 95% de alineación — revisar.');
  process.exit(1);
}
