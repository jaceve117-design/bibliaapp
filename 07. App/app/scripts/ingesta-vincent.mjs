/**
 * Ingesta Vincent — Marvin Vincent, Word Studies in the New Testament (1887, dominio público).
 * Fuente: biblehub.com/commentaries/vws/ (espejo del texto PD original; ficha en
 * 02. Legal/Ficha - Vincent.md).
 *
 * Particularidad vs Barnes/K&D: el comentario va en <div class="comm"> con CABECERA
 * léxica (palabra inglesa + griego entre paréntesis, a menudo en entidades HTML que
 * limpiar() decodifica) seguida de <p> — la cabecera ES contenido (estudio de palabras),
 * se conserva. Griego real en el texto → la obra vincent del motor usa máscara ⟦n⟧.
 *
 * Entrada: páginas por capítulo en 05. Datos/corpus_crudo/vincent/paginas/ (reanudable).
 * Salida: public/data/vincent/{OSIS}.json ({ osis, fuente, c: { cap: [ {v, p:[…]} ] } })
 *         + _manifest.json — misma forma que jfb/ y kd/.
 *
 * Uso: node scripts/ingesta-vincent.mjs [--solo-parseo]
 */
import fs from "node:fs";
import path from "node:path";

const CRUDO_DIR = "../../05. Datos/corpus_crudo/vincent/paginas";
const SALIDA = "public/data/vincent";
const UA = "bibliaapp-ingesta/1.0 (+bibliaapp.pages.dev; ingesta PD documentada en el repo del proyecto)";
const PAUSA_MS = 1100;

// slug biblehub → [OSIS, capítulos esperados] — NT completo
const LIBROS = {
  matthew: ["MAT", 28], mark: ["MRK", 16], luke: ["LUK", 24], john: ["JHN", 21], acts: ["ACT", 28],
  romans: ["ROM", 16], "1_corinthians": ["1CO", 16], "2_corinthians": ["2CO", 13], galatians: ["GAL", 6],
  ephesians: ["EPH", 6], philippians: ["PHP", 4], colossians: ["COL", 4], "1_thessalonians": ["1TH", 5],
  "2_thessalonians": ["2TH", 3], "1_timothy": ["1TI", 6], "2_timothy": ["2TI", 4], titus: ["TIT", 3],
  philemon: ["PHM", 1], hebrews: ["HEB", 13], james: ["JAS", 5], "1_peter": ["1PE", 5],
  "2_peter": ["2PE", 3], "1_john": ["1JN", 5], "2_john": ["2JN", 1], "3_john": ["3JN", 1],
  jude: ["JUD", 1], revelation: ["REV", 22],
};

const ENTIDADES = {
  amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: " ",
  mdash: "—", ndash: "–", lsquo: "‘", rsquo: "’", ldquo: "“", rdquo: "”",
  hellip: "…", middot: "·", bull: "•", dash: "‐", shy: "",
  agrave: "à", aacute: "á", acirc: "â", aring: "å", adieresis: "ä",
  egrave: "è", eacute: "é", ecirc: "ê", edieresis: "ë",
  igrave: "ì", iacute: "í", icirc: "î", idieresis: "ï",
  ograve: "ò", oacute: "ó", ocirc: "ô", odieresis: "ö", otilde: "õ",
  ugrave: "ù", uacute: "ú", ucirc: "û", udieresis: "ü", ntilde: "ñ",
  ccedil: "ç", szlig: "ß", aelig: "æ", oelig: "œ", oslash: "ø",
};

const limpiar = (html) =>
  html
    .replace(/<div class="verse">[\s\S]*?<\/div>/g, " ") // texto KJV del verso: fuera
    .replace(/<[^>]+>/g, " ")
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)))
    .replace(/&#x([0-9a-fA-F]+);/g, (_, n) => String.fromCodePoint(parseInt(n, 16)))
    .replace(/&([a-z]+);/g, (m, n) => ENTIDADES[n] ?? m)
    .replace(/\s+/g, " ")
    .trim();

const dormir = (ms) => new Promise((r) => setTimeout(r, ms));

async function bajar(slug, cap) {
  const destino = path.join(CRUDO_DIR, slug, `${cap}.html`);
  if (fs.existsSync(destino) && fs.statSync(destino).size > 5000) return "cache";
  const url = `https://biblehub.com/commentaries/vws/${slug}/${cap}.htm`;
  for (const espera of [0, 5000, 15000, 45000]) {
    if (espera) await dormir(espera);
    try {
      const r = await fetch(url, { headers: { "user-agent": UA }, redirect: "follow" });
      if (r.status === 404) return "404";
      if (r.ok) {
        const html = await r.text();
        fs.mkdirSync(path.dirname(destino), { recursive: true });
        fs.writeFileSync(destino, html, "utf8");
        await dormir(PAUSA_MS);
        return "ok";
      }
    } catch {
      /* reintenta */
    }
  }
  return "error";
}

function parsearPagina(html) {
  const i0 = html.indexOf('<div id="leftbox">');
  const i1 = html.indexOf('<div id="bot">', i0);
  if (i0 < 0 || i1 < 0) return null;
  const cuerpo = html.slice(i0, i1);
  const [introBruta, ...segmentos] = cuerpo.split('<div class="versenum">');
  const intro = [];
  const mChap = introBruta.match(/<div class="chap">([\s\S]*?)$/);
  if (mChap) {
    for (const trozo of mChap[1].split(/<p[^>]*>/)) {
      const t = limpiar(trozo);
      if (t.length >= 60) intro.push(t);
    }
  }
  const anclas = [];
  for (let seg of segmentos) {
    const mHref = seg.match(/<a href="\/[a-z0-9_]+\/(\d+)-(\d+)\.htm">/);
    if (!mHref) continue;
    seg = seg.replace(/^<a href="\/[a-z0-9_]+\/\d+-\d+\.htm">[^<]*<\/a>\s*<\/div>/, "");
    const cap = Number(mHref[1]);
    const v = Number(mHref[2]);
    const parras = [];
    for (const trozo of seg.split(/<p[^>]*>/)) {
      const t = limpiar(trozo);
      // footer por página del sitio: chrome, no de la obra
      if (/Word Studies in the New Testament/.test(t) && /(Courtesy|public domain)/i.test(t)) continue;
      if (t) parras.push(t);
    }
    if (parras.length) anclas.push({ cap, v, p: parras });
  }
  return { intro, anclas };
}

// ---- ejecución ----
const soloParseo = process.argv.includes("--solo-parseo");
fs.mkdirSync(SALIDA, { recursive: true });
const resumen = [];
const incidentes = [];
let totAnclas = 0;
let tramosScript = 0;

for (const [slug, [osis, capsEsperados]] of Object.entries(LIBROS)) {
  const caps = {};
  let capsVistos = 0;
  let introLibro = [];
  let falloPagina = null;
  for (let cap = 1; cap <= capsEsperados + 3; cap++) {
    const destino = path.join(CRUDO_DIR, slug, `${cap}.html`);
    let estado = "cache";
    if (!soloParseo || !fs.existsSync(destino)) {
      estado = await bajar(slug, cap);
    }
    if (estado === "404") break;
    if (estado === "error") { falloPagina = cap; break; }
    if (!fs.existsSync(destino)) break;
    const html = fs.readFileSync(destino, "utf8");
    const pag = parsearPagina(html);
    if (!pag) { incidentes.push({ osis, tipo: `cap ${cap}: página sin zona de comentario (leftbox/bot)` }); break; }
    if (pag.intro.length && cap === 1) introLibro = pag.intro;
    for (const a of pag.anclas) {
      if (a.cap !== cap) { incidentes.push({ osis, tipo: `cap ${cap}: ancla ${a.cap}.${a.v} fuera de capítulo — ignorada` }); continue; }
      ((caps[cap] ??= [])).push({ v: a.v, p: a.p });
    }
    tramosScript += (html.match(/[\u0370-\u03FF\u1F00-\u1FFF\u0590-\u05FF\uFB1D-\uFB4F]+/g) || []).length;
    capsVistos = cap;
  }
  for (const c of Object.keys(caps)) caps[c].sort((x, y) => x.v - y.v);
  if (introLibro.length) {
    caps[1] ??= [];
    caps[1].unshift({ v: "Intro", p: introLibro });
  }
  const total = Object.values(caps).reduce((a, arr) => a + arr.length, 0);
  totAnclas += total;
  if (capsVistos - capsEsperados !== 0) incidentes.push({ osis, tipo: `capítulos vistos ${capsVistos} vs esperados ${capsEsperados}` });
  if (falloPagina) incidentes.push({ osis, tipo: `fallo de red en capítulo ${falloPagina} — libro truncado` });
  if (total === 0) incidentes.push({ osis, tipo: "SIN anclas — revisar" });
  fs.writeFileSync(
    path.join(SALIDA, `${osis}.json`),
    JSON.stringify({ osis, fuente: "Marvin R. Vincent, Word Studies in the New Testament (1887) · Dominio público · texto original vía biblehub.com", c: caps }),
    "utf8"
  );
  resumen.push({ osis, caps_vistos: capsVistos, anclas: total });
  console.log(`${osis}: ${capsVistos} caps · ${total} anclas`);
}

resumen.sort((a, b) => a.osis.localeCompare(b.osis, "en"));
const manifiesto = {
  obra: "Word Studies in the New Testament — Marvin R. Vincent (1887)",
  osis_obra: "VINCENT",
  licencia: "Dominio público (1887; autor †1922, obra pre-1929) — ver Ficha - Vincent.md",
  fuente: "https://biblehub.com/commentaries/vws/ — espejo del texto PD original",
  fecha_ingesta: new Date().toISOString().slice(0, 10),
  idioma: "en",
  alcance: "NT completo: 27 libros. Estudio de palabras griegas por versículo; el griego va en el texto (la obra del motor aplica máscara ⟦n⟧).",
  total_anclas: totAnclas,
  tramos_alfabeto_original_crudo_html: tramosScript,
  nota: "Vincent comenta por anclas de versículo. La cabecera léxica de cada ancla (palabra + griego) es contenido y se conserva como primer párrafo.",
  incidentes,
  libros: resumen,
};
fs.writeFileSync(path.join(SALIDA, "_manifest.json"), JSON.stringify(manifiesto, null, 2), "utf8");
console.log(`\nLibros: ${resumen.length} · anclas totales: ${totAnclas} · tramos con alfabeto (crudo HTML): ${tramosScript}`);
console.log(`Incidentes: ${incidentes.length}`);
incidentes.forEach((i) => console.log(" ", i.osis, i.tipo));
