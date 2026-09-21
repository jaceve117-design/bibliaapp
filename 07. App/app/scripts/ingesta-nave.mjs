/**
 * Ingesta Nave's Topical Bible (paso 6 — cierre del núcleo).
 * Fuente: Nave's Topical Bible (1896/1905, dominio público) — datos estructurados del
 * pipeline "topical-bible-search" de j86schroeder (MIT; extracción auditada del PDF original,
 * referencias normalizadas, erratas versionadas). Crudo en 05. Datos/corpus_crudo/nave_data/.
 * Entrada: dist/nave/{topics,entries,assertions}.jsonl
 * Salida:
 *   public/data/nave/{OSIS}.json        — verso → slugs de temas
 *   public/data/nave/_temas.json        — slug → nombre (+seeAlso)
 *   public/data/nave/temas/{slug}.json  — tema → versos [{r: OSIS, e: texto de la entrada}]
 *   public/data/nave/_manifest.json
 * Portón: 5.321 temas; libros desconocidos y refs fuera de nuestro canon = incidentes contados.
 */
import fs from "node:fs";
import path from "node:path";

const CRUDO = "../../05. Datos/corpus_crudo/nave_data";
const SALIDA = "public/data/nave";

const NOMBRE_A_OSIS = {
  Genesis: "GEN", Exodus: "EXO", Leviticus: "LEV", Numbers: "NUM", Deuteronomy: "DEU",
  Joshua: "JOS", Judges: "JDG", Ruth: "RUT", "1 Samuel": "1SA", "2 Samuel": "2SA",
  "1 Kings": "1KI", "2 Kings": "2KI", "1 Chronicles": "1CH", "2 Chronicles": "2CH",
  Ezra: "EZR", Nehemiah: "NEH", Esther: "EST", Job: "JOB", Psalms: "PSA", Psalm: "PSA",
  Proverbs: "PRO", Ecclesiastes: "ECC", "Song of Solomon": "SNG", Isaiah: "ISA",
  Jeremiah: "JER", Lamentations: "LAM", Ezekiel: "EZK", Daniel: "DAN", Hosea: "HOS",
  Joel: "JOL", Amos: "AMO", Obadiah: "OBA", Jonah: "JON", Micah: "MIC", Nahum: "NAM",
  Habakkuk: "HAB", Zephaniah: "ZEP", Haggai: "HAG", Zechariah: "ZEC", Malachi: "MAL",
  Matthew: "MAT", Mark: "MRK", Luke: "LUK", John: "JHN", Acts: "ACT", Romans: "ROM",
  "1 Corinthians": "1CO", "2 Corinthians": "2CO", Galatians: "GAL", Ephesians: "EPH",
  Philippians: "PHP", Colossians: "COL", "1 Thessalonians": "1TH", "2 Thessalonians": "2TH",
  "1 Timothy": "1TI", "2 Timothy": "2TI", Titus: "TIT", Philemon: "PHM", Hebrews: "HEB",
  James: "JAS", "1 Peter": "1PE", "2 Peter": "2PE", "1 John": "1JN", "2 John": "2JN",
  "3 John": "3JN", Jude: "JUD", Revelation: "REV",
};

const leerJsonl = (f) =>
  fs.readFileSync(path.join(CRUDO, f), "utf8").split("\n").filter(Boolean).map((l) => JSON.parse(l));

const temas = leerJsonl("topics.jsonl");
const aserciones = leerJsonl("assertions.jsonl");

// slug desde topicId "nave:aaron" → "aaron"
const slugDe = (topicId) => topicId.replace(/^nave:/, "");
const nombreTema = new Map(temas.map((t) => [slugDe(t.id), { n: t.sourceTopic, seeAlso: t.seeAlso ?? [] }]));

// límites de capítulos por OSIS según nuestro manifiesto RV1909 (para expandir rangos)
const rv = JSON.parse(fs.readFileSync("public/data/rv1909/_manifest.json", "utf8"));
const capsMax = new Map(rv.libros.map((l) => [l.osis, l.caps]));

/** Expandir una aserción a pares OSIS + etiqueta de entrada. */
function expandir(a) {
  const osis = NOMBRE_A_OSIS[a.book];
  if (!osis) return { desconocido: a.book, pares: [] };
  const pares = [];
  const maxCap = capsMax.get(osis);
  if (!maxCap) return { desconocido: a.book, pares: [] };
  const finCap = a.chapterEnd ?? a.chapterStart;
  const finVerso = a.verseEnd ?? a.verseStart;
  for (let c = a.chapterStart; c <= finCap; c++) {
    if (c > maxCap) continue; // rango se sale de nuestro canon de capítulos
    const tope = c === finCap ? finVerso : 999;
    for (let v = a.verseStart; v <= tope; v++) {
      pares.push({ osis: `${osis}.${c}.${v}`, e: a.rawText ?? "" });
    }
  }
  return { desconocido: null, pares };
}

// 1. verso → temas (por libro) y 2. tema → versos
const porLibro = new Map(); // OSIS → Map("c.v" → Set(slug))
const porTema = new Map(); // slug → [{r, e}]
const incidentes = [];
let librosDesconocidos = new Set();
let usadas = 0;

for (const a of aserciones) {
  if (a.sourceStatus && a.sourceStatus !== "source_valid") {
    incidentesPush(`sourceStatus=${a.sourceStatus}`);
    continue;
  }
  const slug = slugDe(a.topicId);
  const { desconocido, pares } = expandir(a);
  if (desconocido) {
    librosDesconocidos.add(desconocido);
    continue;
  }
  usadas++;
  const vista = new Set(pares.map((p) => p.e));
  for (const p of pares) {
    const [osisB, c, v] = p.osis.split(".");
    if (!porLibro.has(osisB)) porLibro.set(osisB, new Map());
    const libroMap = porLibro.get(osisB);
    const k = `${c}.${v}`;
    if (!libroMap.has(k)) libroMap.set(k, new Set());
    libroMap.get(k).add(slug);
    if (!porTema.has(slug)) porTema.set(slug, []);
  }
  // etiqueta de entrada por tema (dedup por texto)
  const lista = porTema.get(slug);
  const vistos = new Set(lista.map((x) => x.e));
  for (const p of pares) {
    if (!vistos.has(p.e)) {
      vistos.add(p.e);
      lista.push({ r: p.osis, e: p.e });
    }
  }
}

function incidentesPush(msg) {
  incidentes.push(msg);
}

// 3. escribir salidas
fs.mkdirSync(path.join(SALIDA, "temas"), { recursive: true });
let librosEscritos = 0;
const resumen = [];
for (const [osis, libroMap] of porLibro) {
  const versos = {};
  for (const [k, set] of libroMap) versos[k] = [...set].sort();
  fs.writeFileSync(path.join(SALIDA, `${osis}.json`), JSON.stringify({ osis, versos }), "utf8");
  resumen.push({ osis, versos_con_temas: libroMap.size });
  librosEscritos++;
}

const indiceTemas = {};
for (const [slug, info] of nombreTema) indiceTemas[slug] = info.n;
fs.writeFileSync(path.join(SALIDA, "_temas.json"), JSON.stringify({ temas: indiceTemas }), "utf8");

let temasEscritos = 0;
for (const [slug, versos] of porTema) {
  versos.sort((a, b) => a.r.localeCompare(b.r, "en", { numeric: true }));
  const info = nombreTema.get(slug) ?? { n: slug, seeAlso: [] };
  fs.writeFileSync(
    path.join(SALIDA, "temas", `${slug}.json`),
    JSON.stringify({ s: slug, n: info.n, seeAlso: info.seeAlso, versos }),
    "utf8"
  );
  temasEscritos++;
}

const manifiesto = {
  obra: "Nave's Topical Bible (Orville J. Nave, 1896/1905) — dominio público",
  osis_obra: "NAVE",
  licencia: "Dominio público (texto) · extracción y normalización: topical-bible-search (MIT), referencias auditadas",
  fuente: "https://github.com/j86schroeder/topical-bible-search (crudo en 05. Datos/corpus_crudo/nave_data/)",
  fecha_ingesta: "2026-09-21",
  total_temas: temasEscritos,
  total_aserciones: usadas,
  total_libros: librosEscritos,
  incidentes: {
    libros_desconocidos: [...librosDesconocidos],
    otros: incidentes.slice(0, 20),
    temas_sin_refs: [...nombreTema.keys()].filter((s) => !porTema.has(s)).length,
  },
  libros: resumen,
};
fs.writeFileSync(path.join(SALIDA, "_manifest.json"), JSON.stringify(manifiesto, null, 2), "utf8");

console.log(`Temas escritos: ${temasEscritos}/${nombreTema.size}`);
console.log(`Aserciones usadas: ${usadas}/${aserciones.length}`);
console.log(`Libros con datos: ${librosEscritos}`);
console.log(`Libros desconocidos: ${librosDesconocidos.size ? [...librosDesconocidos].join(", ") : "ninguno"}`);
console.log(`Temas sin refs: ${manifiesto.incidentes.temas_sin_refs}`);
