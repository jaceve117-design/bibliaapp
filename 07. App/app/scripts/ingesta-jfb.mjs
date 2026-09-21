/**
 * Ingesta JFB — Jamieson, Fausset and Brown Commentary (1871, dominio público).
 * Fuente: CCEL ThML (https://www.ccel.org/ccel/jamieson/jfb.xml) — crudo en 05. Datos/corpus_crudo/jfb/.
 * Entrada: ThML con <div2 title="Libro"> → <scripCom parsed="|Book|cap|v|capFin|vFin"> → <p> párrafos.
 * Salida: public/data/jfb/{OSIS}.json ({ osis, fuente, c: { cap: [ {v, p:[párrafos]} ] } }) + _manifest.json
 * Portón: JFB ancla su comentario en versos clave (en el AT ~40-60% de los versos tienen ancla; el resto queda cubierto por el bloque previo, como en la edición impresa). El conteo vs RV1909 es informativo.
 */
import fs from "node:fs";
import path from "node:path";

const CRUDO = "../../05. Datos/corpus_crudo/jfb/jfb.xml";
const SALIDA = "public/data/jfb";

const TITULO_A_OSIS = {
  Genesis: "GEN", Exodus: "EXO", Leviticus: "LEV", Numbers: "NUM", Deuteronomy: "DEU",
  Joshua: "JOS", Judges: "JDG", Ruth: "RUT", "First Samuel": "1SA", "Second Samuel": "2SA",
  "First Kings": "1KI", "Second Kings": "2KI", "First Chronicles": "1CH", "Second Chronicles": "2CH",
  Ezra: "EZR", Nehemiah: "NEH", Esther: "EST", Job: "JOB", Psalms: "PSA", Proverbs: "PRO",
  Ecclesiastes: "ECC", "Song of Solomon": "SNG", Isaiah: "ISA", Jeremiah: "JER",
  Lamentations: "LAM", Ezekiel: "EZK", Daniel: "DAN", Hosea: "HOS", Joel: "JOL",
  Amos: "AMO", Obadiah: "OBA", Jonah: "JON", Micah: "MIC", Nahum: "NAM", Habakkuk: "HAB",
  Zephaniah: "ZEP", Haggai: "HAG", Zechariah: "ZEC", Malachi: "MAL", Matthew: "MAT",
  Mark: "MRK", Luke: "LUK", John: "JHN", Acts: "ACT", Romans: "ROM",
  "First Corinthians": "1CO", "Second Corinthians": "2CO", Galatians: "GAL", Ephesians: "EPH",
  Philippians: "PHP", Colossians: "COL", "First Thessalonians": "1TH", "Second Thessalonians": "2TH",
  "First Timothy": "1TI", "Second Timothy": "2TI", Titus: "TIT", Philemon: "PHM", Hebrews: "HEB",
  James: "JAS", "First Peter": "1PE", "Second Peter": "2PE", "First John": "1JN",
  "Second John": "2JN", "Third John": "3JN", Jude: "JUD", Revelation: "REV",
};

const ENTIDADES = {
  amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: " ",
  mdash: "—", ndash: "–", lsquo: "‘", rsquo: "’", ldquo: "“", rdquo: "”",
  hellip: "…", middot: "·", bull: "•", dash: "‐",
  agrave: "à", aacute: "á", acirc: "â", aring: "å", adieresis: "ä",
  egrave: "è", eacute: "é", ecirc: "ê", edieresis: "ë",
  igrave: "ì", iacute: "í", icirc: "î", idieresis: "ï",
  ograve: "ò", oacute: "ó", ocirc: "ô", odieresis: "ö", otilde: "õ",
  ugrave: "ù", uacute: "ú", ucirc: "û", udieresis: "ü", ntilde: "ñ",
  ccedil: "ç", szlig: "ß", aelig: "æ", oelig: "œ", oslash: "ø",
};

const limpiar = (html) =>
  html
    .replace(/<scripRef[^>]*>([\s\S]*?)<\/scripRef>/g, "$1")
    .replace(/<[^>]+>/g, "")
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)))
    .replace(/&#x([0-9a-fA-F]+);/g, (_, n) => String.fromCodePoint(parseInt(n, 16)))
    .replace(/&([a-z]+);/g, (m, n) => ENTIDADES[n] ?? m)
    .replace(/\s+/g, " ")
    .trim();

const xml = fs.readFileSync(CRUDO, "utf8");

const re = /<div2 title="([^"]+)"|<scripCom[^>]*?parsed="([^"]+)"|<p\b[^>]*>([\s\S]*?)<\/p>/g;
let m;
let osisActual = null;
let pendiente = null; // "c.v"
const libros = new Map(); // OSIS → Map("c.v" → string[])

while ((m = re.exec(xml))) {
  if (m[1] !== undefined) {
    osisActual = TITULO_A_OSIS[m[1]] ?? null;
    pendiente = null;
    continue;
  }
  if (m[2] !== undefined) {
    const partes = m[2].split("|"); // "|Gen|1|1|0|0"
    const v = Number(partes[3]);
    const cap = Number(partes[2]);
    pendiente = v >= 1 && cap >= 1 ? `${cap}.${v}` : null;
    continue;
  }
  if (m[3] !== undefined && osisActual && pendiente) {
    const texto = limpiar(m[3]);
    if (!texto) continue;
    if (!libros.has(osisActual)) libros.set(osisActual, new Map());
    const mapa = libros.get(osisActual);
    if (!mapa.has(pendiente)) mapa.set(pendiente, []);
    mapa.get(pendiente).push(texto);
  }
}

// manifiesto RV1909 para el portón
const rv = JSON.parse(fs.readFileSync("public/data/rv1909/_manifest.json", "utf8"));
const rvVersos = new Map(rv.libros.map((l) => [l.osis, l.versos]));

fs.mkdirSync(SALIDA, { recursive: true });
const resumen = [];
let totVersos = 0;
const incidentes = [];

for (const [osis, mapa] of libros) {
  const caps = {};
  for (const [k, parras] of mapa) {
    const [c, v] = k.split(".");
    (caps[c] ??= []).push({ v: Number(v), p: parras });
  }
  for (const c of Object.keys(caps)) caps[c].sort((a, b) => a.v - b.v);
  const total = Object.values(caps).reduce((a, arr) => a + arr.length, 0);
  totVersos += total;
  fs.writeFileSync(
    path.join(SALIDA, `${osis}.json`),
    JSON.stringify({ osis, fuente: "Jamieson, Fausset and Brown Commentary (1871) · Dominio público · CCEL ThML", c: caps }),
    "utf8"
  );
  const esperado = rvVersos.get(osis) ?? 0;
  const dif = total - esperado;
  if (dif !== 0) incidentes.push({ osis, tipo: `anclas vs RV1909: ${total} vs ${esperado} (dif ${dif}) — granularidad propia de JFB` });
  resumen.push({ osis, versos_ancla: total, dif_rv1909: dif });
}
resumen.sort((a, b) => a.osis.localeCompare(b.osis, "en"));

const manifiesto = {
  obra: "A Commentary, Critical and Explanatory, on the Whole Bible — Jamieson, Fausset y Brown (1871)",
  osis_obra: "JFB",
  licencia: "Dominio público (1871) · ThML: CCEL",
  fuente: "https://www.ccel.org/ccel/jamieson/jfb.xml (crudo en 05. Datos/corpus_crudo/jfb/)",
  fecha_ingesta: "2026-09-21",
  idioma: "en",
  total_versos_ancla: totVersos,
  nota: "JFB comenta por anclas de versículo (grupos): los versos sin ancla quedan cubiertos por el bloque anterior, fiel a la edición impresa.",
  incidentes,
  libros: resumen,
};
fs.writeFileSync(path.join(SALIDA, "_manifest.json"), JSON.stringify(manifiesto, null, 2), "utf8");

const librosVacios = resumen.filter((r) => r.versos_comentados === 0);
console.log(`Libros procesados: ${libros.size} · versos comentados: ${totVersos}`);
console.log(`Incidentes (dif vs RV1909): ${incidentes.length}`);
incidentes.slice(0, 12).forEach((i) => console.log(" ", i.osis, i.tipo));
console.log(`Libros vacíos: ${librosVacios.length ? librosVacios.map((l) => l.osis).join(",") : "ninguno"}`);
