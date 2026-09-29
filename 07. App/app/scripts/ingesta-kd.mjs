/**
 * Ingesta Keil & Delitzsch — Commentary on the Old Testament (trad. inglesa T&T Clark
 * 1857–1878, dominio público; ficha en 02. Legal/Ficha - Keil y Delitzsch.md).
 * Fuente: biblehub.com/commentaries/kad/ (espejo del texto PD original, designado en la ficha).
 *
 * Alcance: AT completo — 39 libros, GEN a MAL. La edición inglesa translitera el
 * hebreo/griego (verificado GEN 1, PSA 110, ISA 7: 0 caracteres en alfabeto original).
 *
 * Entrada: páginas por capítulo (HTML biblehub) en 05. Datos/corpus_crudo/kd/paginas/.
 * Reanudable: si el HTML ya existe (>5 KB) no se re-descarga.
 * Salida: public/data/kd/{OSIS}.json ({ osis, fuente, c: { cap: [ {v, p:[párrafos]} ] } })
 *         + _manifest.json — misma forma que jfb/ y barnes/.
 * Portón: capítulos vistos vs esperados + anclas por libro (informativo) + cotejo con RV1909.
 *
 * Uso: node scripts/ingesta-kd.mjs [--solo-parseo]
 */
import fs from "node:fs";
import path from "node:path";

const CRUDO_DIR = "../../05. Datos/corpus_crudo/kd/paginas";
const SALIDA = "public/data/kd";
const UA = "bibliaapp-ingesta/1.0 (+bibliaapp.pages.dev; ingesta PD documentada en el repo del proyecto)";
const PAUSA_MS = 1100;

// slug biblehub → [OSIS, capítulos esperados] — AT completo en orden canónico
const LIBROS = {
  genesis: ["GEN", 50], exodus: ["EXO", 40], leviticus: ["LEV", 27], numbers: ["NUM", 36],
  deuteronomy: ["DEU", 34], joshua: ["JOS", 24], judges: ["JDG", 21], ruth: ["RUT", 4],
  "1_samuel": ["1SA", 31], "2_samuel": ["2SA", 24], "1_kings": ["1KI", 22], "2_kings": ["2KI", 25],
  "1_chronicles": ["1CH", 29], "2_chronicles": ["2CH", 36], ezra: ["EZR", 10], nehemiah: ["NEH", 13],
  esther: ["EST", 10], job: ["JOB", 42], psalms: ["PSA", 150], proverbs: ["PRO", 31],
  ecclesiastes: ["ECC", 12], songs: ["SNG", 8], isaiah: ["ISA", 66], jeremiah: ["JER", 52],
  lamentations: ["LAM", 5], ezekiel: ["EZK", 48], daniel: ["DAN", 12], hosea: ["HOS", 14],
  joel: ["JOL", 3], amos: ["AMO", 9], obadiah: ["OBA", 1], jonah: ["JON", 4], micah: ["MIC", 7],
  nahum: ["NAM", 3], habakkuk: ["HAB", 3], zephaniah: ["ZEP", 3], haggai: ["HAG", 2],
  zechariah: ["ZEC", 14], malachi: ["MAL", 4],
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
  const url = `https://biblehub.com/commentaries/kad/${slug}/${cap}.htm`;
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
  // intro (suele existir solo en el capítulo 1)
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
      // footer que biblehub inyecta por página (929 = 1 por capítulo): chrome del
      // sitio, no de la obra — se descarta (documentado en el manifiesto)
      if (/Commentary on the Old Testament, by Carl Friedrich Keil/.test(t) && /Courtesy/i.test(t)) continue;
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
let tramosScript = 0; // tramos en alfabeto hebreo/griego (esperados ~0 en este espejo)

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
  const difCaps = capsVistos - capsEsperados;
  if (difCaps !== 0) incidentes.push({ osis, tipo: `capítulos vistos ${capsVistos} vs esperados ${capsEsperados}` });
  if (falloPagina) incidentes.push({ osis, tipo: `fallo de red en capítulo ${falloPagina} — libro truncado` });
  if (total === 0) incidentes.push({ osis, tipo: "SIN anclas — revisar" });
  fs.writeFileSync(
    path.join(SALIDA, `${osis}.json`),
    JSON.stringify({ osis, fuente: "C. F. Keil y F. Delitzsch, Commentary on the Old Testament (trad. inglesa T&T Clark, 1857–1878) · Dominio público · texto original vía biblehub.com", c: caps }),
    "utf8"
  );
  resumen.push({ osis, caps_vistos: capsVistos, anclas: total });
  console.log(`${osis}: ${capsVistos} caps · ${total} anclas`);
}

resumen.sort((a, b) => a.osis.localeCompare(b.osis, "en"));
const manifiesto = {
  obra: "Commentary on the Old Testament — Carl Friedrich Keil y Franz Delitzsch (trad. inglesa T&T Clark, 1857–1878)",
  osis_obra: "KD",
  licencia: "Dominio público (autores †1888/1890; traducción inglesa del s. XIX) — ver Ficha - Keil y Delitzsch.md",
  fuente: "https://biblehub.com/commentaries/kad/ — espejo del texto PD original, designado en la ficha",
  fecha_ingesta: new Date().toISOString().slice(0, 10),
  idioma: "en",
  alcance: "AT completo: 39 libros (Génesis–Malaquías). La edición inglesa translitera el hebreo/griego.",
  total_anclas: totAnclas,
  tramos_alfabeto_original: tramosScript,
  nota: "K&D comenta por anclas de versículo; los versos sin ancla quedan cubiertos por el bloque anterior. El bloque v:'Intro' del capítulo 1 es la introducción del libro.",
  incidentes,
  libros: resumen,
};
fs.writeFileSync(path.join(SALIDA, "_manifest.json"), JSON.stringify(manifiesto, null, 2), "utf8");
console.log(`\nLibros: ${resumen.length} · anclas totales: ${totAnclas} · tramos hebreo/griego: ${tramosScript}`);
console.log(`Incidentes: ${incidentes.length}`);
incidentes.forEach((i) => console.log(" ", i.osis, i.tipo));
