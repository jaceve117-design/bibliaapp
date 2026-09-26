/**
 * Ingesta Barnes — Albert Barnes, Notes on the New / Old Testament (1832–1872, dominio público).
 * Fuente: biblehub.com/commentaries/barnes/ (espejo del texto PD original — designado en
 * Ficha - Barnes.md; la edición Baker/Grand Rapids 1949 de CCEL está DESCARTADA por la ficha).
 *
 * Alcance de autoría (verificado 2026-09-26): Barnes escribió el NT completo y del AT solo
 * Génesis, Job, Salmos, Isaías y Daniel. Los "Barnes" completos modernos rellenan los demás
 * libros con otros autores sin acreditar — ESOS LIBROS SE EXCLUYEN (Exo–Est, Prov, Ecl, Sng).
 *
 * Entrada: páginas por capítulo (HTML biblehub) guardadas en 05. Datos/corpus_crudo/barnes/paginas/.
 * Reanudable: si el HTML ya existe no se re-descarga.
 * Salida: public/data/barnes/{OSIS}.json ({ osis, fuente, c: { cap: [ {v, p:[párrafos]} ] } }) + _manifest.json
 *         — misma forma que jfb/ para que el lector la consuma sin cambios.
 * Portón: nº de capítulos vs los esperados por libro + anclas por libro (informativo, como JFB).
 *
 * Uso: node scripts/ingesta-barnes.mjs [--solo-parseo]
 */
import fs from "node:fs";
import path from "node:path";

const CRUDO_DIR = "../../05. Datos/corpus_crudo/barnes/paginas";
const SALIDA = "public/data/barnes";
const UA = "bibliaapp-ingesta/1.0 (+bibliaapp.pages.dev; ingesta PD documentada en el repo del proyecto)";
const PAUSA_MS = 1100;

// slug biblehub → [OSIS, capítulos esperados]
const LIBROS = {
  genesis: ["GEN", 50], job: ["JOB", 42], psalms: ["PSA", 150], isaiah: ["ISA", 66], daniel: ["DAN", 12],
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
  const url = `https://biblehub.com/commentaries/barnes/${slug}/${cap}.htm`;
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
  // intro (suele existir solo en el capítulo 1): párrafos del div class="chap"
  const intro = [];
  const mChap = introBruta.match(/<div class="chap">([\s\S]*?)$/);
  if (mChap) {
    for (const trozo of mChap[1].split(/<p[^>]*>/)) {
      const t = limpiar(trozo);
      if (t.length >= 60) intro.push(t); // descarta títulos sueltos («Introduction to Genesis»)
    }
  }
  const anclas = [];
  for (let seg of segmentos) {
    const mHref = seg.match(/<a href="\/[a-z0-9_]+\/(\d+)-(\d+)\.htm">/);
    if (!mHref) continue;
    // el texto del ancla («John 3:16») no es comentario: quitarla tras leer el ref
    seg = seg.replace(/^<a href="\/[a-z0-9_]+\/\d+-\d+\.htm">[^<]*<\/a>\s*<\/div>/, "");
    const cap = Number(mHref[1]);
    const v = Number(mHref[2]);
    // el comentario va tras el div del KJV hasta el fin del segmento; los <p> son los párrafos
    const parras = [];
    for (const trozo of seg.split(/<p[^>]*>/)) {
      const t = limpiar(trozo);
      if (t) parras.push(t);
    }
    // el primer trozo suele traer el final del div verse + texto; limpiar() ya lo redujo
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
    const pag = parsearPagina(fs.readFileSync(destino, "utf8"));
    if (!pag) { incidentes.push({ osis, tipo: `cap ${cap}: página sin zona de comentario (leftbox/bot)` }); break; }
    if (pag.intro.length && cap === 1) introLibro = pag.intro;
    for (const a of pag.anclas) {
      if (a.cap !== cap) { incidentes.push({ osis, tipo: `cap ${cap}: ancla ${a.cap}.${a.v} fuera de capítulo — ignorada` }); continue; }
      ((caps[cap] ??= [])).push({ v: a.v, p: a.p });
    }
    capsVistos = cap;
  }
  for (const c of Object.keys(caps)) caps[c].sort((x, y) => x.v - y.v);
  if (introLibro.length) {
    caps[1] ??= [];
    caps[1].unshift({ v: "Intro", p: introLibro });
  }
  const total = Object.values(caps).reduce((a, arr) => a + arr.length, 0);
  totAnclas += total;
  const difCaps = capsVistos - capsEsperados;
  if (difCaps !== 0) incidentes.push({ osis, tipo: `capítulos vistos ${capsVistos} vs esperados ${capsEsperados}` });
  if (falloPagina) incidentes.push({ osis, tipo: `fallo de red en capítulo ${falloPagina} — libro truncado` });
  if (total === 0) incidentes.push({ osis, tipo: "SIN anclas — revisar" });
  fs.writeFileSync(
    path.join(SALIDA, `${osis}.json`),
    JSON.stringify({ osis, fuente: "Albert Barnes, Notes on the New / Old Testament (1832–1872) · Dominio público · texto original vía biblehub.com", c: caps }),
    "utf8"
  );
  resumen.push({ osis, caps_vistos: capsVistos, anclas: total });
  console.log(`${osis}: ${capsVistos} caps · ${total} anclas`);
}

resumen.sort((a, b) => a.osis.localeCompare(b.osis, "en"));
const manifiesto = {
  obra: "Notes on the New Testament / Notes on the Old Testament — Albert Barnes (1832–1872)",
  osis_obra: "BARNES",
  licencia: "Dominio público (ediciones originales pre-1929; autor fallecido 1870)",
  fuente: "https://biblehub.com/commentaries/barnes/ — espejo del texto PD original, designado en Ficha - Barnes.md (la edición Baker/Grand Rapids 1949 de CCEL queda DESCARTADA por la ficha)",
  fecha_ingesta: new Date().toISOString().slice(0, 10),
  idioma: "en",
  alcance: "NT completo (27 libros) + AT parcial de autoría verificada: Génesis, Job, Salmos, Isaías, Daniel. Los libros que Barnes nunca escribió (Exo–Est, Prov, Ecl, Sng) quedan EXCLUYIDOS: las ediciones 'completas' modernas los rellenan con otros autores sin acreditar.",
  total_anclas: totAnclas,
  nota: "Barnes comenta por anclas de versículo; los versos sin ancla quedan cubiertos por el bloque anterior. El bloque v:'Intro' de cada capítulo 1 es la introducción del libro.",
  incidentes,
  libros: resumen,
};
fs.writeFileSync(path.join(SALIDA, "_manifest.json"), JSON.stringify(manifiesto, null, 2), "utf8");
console.log(`\nLibros: ${resumen.length} · anclas totales: ${totAnclas}`);
console.log(`Incidentes: ${incidentes.length}`);
incidentes.forEach((i) => console.log(" ", i.osis, i.tipo));
