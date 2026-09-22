// Fusión de glosas ES → overlay público glosas-es.json
//   public/data/stepbible/glosas-es.json = { _meta, H: {canonStrong: ES}, G: {canonStrong: ES} }
//
// Dos dominios de cadenas (validación separada, el portón distingue por nombre de lote):
//   * lote léxico (TBESH/TBESG): cadenas del campo `g` de los léxicos; validar contra cola-{hebreo,griego}.json
//   * lote texto (nombre contiene "texto"): glosas contextuales del campo `e` del texto etiquetado
//     (tagnt/tahot); validar contra el conjunto de glosas dominantes por canon
//
// Overlay por Strong canónico, en orden de prioridad:
//   (a) glosa dominante del TEXTO traducida (fidelidad al interlineal)
//   (b) glosa TBESH/TBESG de la entrada cuyo id empieza por el canon, traducida
// NOTA: el índice interno de TBESH/TBESG NO sirve para agrupar (arrastra referencias
// cruzadas: indice["H0430"] apuntaba a la entrada "Peace" de Salem — bug 2026-09-21).
//
// Uso: node scripts/fusiona-glosas-es.mjs [lote1-hebreo.tsv lote1b-texto-hebreo.tsv ...]
import fs from "node:fs";
import path from "node:path";

const madre = process.cwd();
const glosasDir = path.join(madre, "06. Traduccion", "glosas-es");
const appData = path.join(madre, "07. App", "app", "public", "data");
const salida = path.join(appData, "stepbible", "glosas-es.json");

const canon = (s) => (s || "").replace(/[A-Z_]*$/, "").replace(/_.*$/, "").toUpperCase();
// las glosas del texto llevan puntuación final variable ("Him." / "Him," / "Him;"):
// se normaliza para que una traducción sirva a todas las variantes
const norma = (s) => (s || "").replace(/[.,;:!?…]+$/, "");

// 1) texto etiquetado: frecuencia por canon + glosas del campo `e` por canon
const freq = { H: new Map(), G: new Map() };
const dominante = { H: new Map(), G: new Map() };
for (const [dir, L] of [["stepbible/tahot", "H"], ["stepbible/tagnt", "G"]]) {
  const base = path.join(appData, dir);
  for (const fn of fs.readdirSync(base)) {
    const j = JSON.parse(fs.readFileSync(path.join(base, fn), "utf8"));
    for (const v of Object.values(j.versos))
      for (const p of v) {
        const c = canon(p.s);
        if (!/^[HG]\d{4}$/.test(c)) continue;
        freq[L].set(c, (freq[L].get(c) || 0) + 1);
        const e = norma((p.e || "").trim());
        if (e) {
          if (!dominante[L].has(c)) dominante[L].set(c, new Map());
          const m = dominante[L].get(c);
          m.set(e, (m.get(e) || 0) + 1);
        }
      }
  }
}
// conjunto de cadenas de texto por testamento (para validar lotes "texto")
const textoSet = { H: new Set(), G: new Set() };
for (const L of ["H", "G"]) for (const m of dominante[L].values()) for (const e of m.keys()) textoSet[L].add(e);

// 2) leer traducciones de los lotes, con portón por dominio
const trad = { H: new Map(), G: new Map() }; // cadenaEN → ES
const lotes = process.argv.slice(2).length
  ? process.argv.slice(2)
  : [
      "lote1b-texto-hebreo.tsv",
      "lote1c-texto-hebreo.tsv",
      "lote1-hebreo.tsv",
      "lote1b-texto-griego.tsv",
      "lote1c-texto-griego.tsv",
      "lote1-griego.tsv",
    ];
for (const lote of lotes) {
  const L = lote.includes("hebreo") ? "H" : "G";
  const esTexto = lote.includes("texto");
  const ref = esTexto
    ? textoSet[L]
    : new Set(
        JSON.parse(
          fs.readFileSync(path.join(glosasDir, L === "H" ? "cola-hebreo.json" : "cola-griego.json"), "utf8")
        ).cadenas.map((c) => c.g)
      );
  const lineas = fs.readFileSync(path.join(glosasDir, lote), "utf8").split("\n").filter((l) => l.trim());
  let errores = 0;
  for (const l of lineas) {
    const i = l.indexOf("\t");
    if (i < 0) { console.error(`PORTÓN: línea sin tab en ${lote}: ${JSON.stringify(l)}`); errores++; continue; }
    const en = esTexto ? norma(l.slice(0, i)) : l.slice(0, i),
      es = esTexto ? l.slice(i + 1).trim().replace(/[.,;:!?…]+$/, "") : l.slice(i + 1).trim();
    if (!ref.has(en)) { console.error(`PORTÓN: EN no está en la referencia (${lote}): ${JSON.stringify(en)}`); errores++; continue; }
    if (!es) { console.error(`PORTÓN: ES vacío (${lote}): ${JSON.stringify(en)}`); errores++; continue; }
    if (trad[L].has(en) && trad[L].get(en) !== es)
      console.error(`AVISO: cadena repetida con ES distinto (${L}): ${JSON.stringify(en)} — gana "${es}"`);
    trad[L].set(en, es);
  }
  if (errores) { console.error(`PORTÓN CERRADO: ${errores} errores en ${lote}`); process.exit(1); }
}

// 3) dos mapas de salida:
//    * texto: cadena exacta del campo `e` → ES (fidelidad por palabra en el interlineal)
//    * lexico: canon Strong → ES (glosa de la entrada léxica; respaldo: glosa dominante) — ficha léxica
const texto = { H: {}, G: {} };
const lexico = { H: {}, G: {} };
const stats = {};
let viaTexto = 0, viaLexico = 0;
for (const L of ["H", "G"]) {
  const archivo = L === "H" ? "tbesh.json" : "tbesg.json";
  for (const [e, es] of trad[L]) if (textoSet[L].has(e)) texto[L][e] = es;
  const lex = JSON.parse(fs.readFileSync(path.join(appData, "stepbible", archivo), "utf8"));
  const glosaLexico = new Map(); // canon → glosaEN del léxico (solo ids que empiezan por el canon)
  for (const id of Object.keys(lex.entradas)) {
    const c = id.replace(/[^A-Z0-9]+$/, "").replace(/[A-Z]+$/, "");
    if (c !== id.slice(0, 5)) continue;
    const g = (lex.entradas[id].g || "").trim();
    if (g && trad[L].has(g) && !glosaLexico.has(c)) glosaLexico.set(c, g);
  }
  for (const c of freq[L].keys()) {
    // prioridad: glosa dominante del texto (correcta por construcción; el índice/entradas
    // del léxico tienen corrupción conocida, p. ej. H3068 con glosa "Peace" de Salem)
    const m = dominante[L].get(c);
    let eTop = null, mejor = 0;
    for (const [e, n] of m ?? []) if (n > mejor) { mejor = n; eTop = e; }
    if (eTop && trad[L].has(eTop)) { lexico[L][c] = trad[L].get(eTop); viaTexto++; continue; }
    const gl = glosaLexico.get(c);
    if (gl) { lexico[L][c] = trad[L].get(gl); viaLexico++; }
  }
  let palabras = 0, cubiertas = 0;
  for (const [c, n] of freq[L]) {
    palabras += n;
    const m = dominante[L].get(c);
    if (!m) continue;
    let ok = false;
    for (const e of m.keys()) if (texto[L][e]) { ok = true; break; }
    if (ok) cubiertas += n;
  }
  stats[L === "H" ? "hebreo" : "griego"] = {
    lexico: archivo,
    strong_en_texto: freq[L].size,
    strong_en_lexico_ES: Object.keys(lexico[L]).length,
    cadenas_texto_ES: Object.keys(texto[L]).length,
    palabras_interlineales: palabras,
    palabras_con_glosa_ES: cubiertas,
    pct_palabras: palabras ? +((100 * cubiertas) / palabras).toFixed(2) : 0,
  };
}

// 4) escribir overlay con _meta
const meta = {
  obra: "Glosas ES de TBESH/TBESG (mapa texto por cadena + mapa léxico por Strong canónico)",
  licencia: "CC BY 4.0 — traducción propia (decisión B18), sin revisar",
  fuente: "STEPBible-Data — Tyndale House Cambridge (CC BY 4.0)",
  metodo: "texto = glosa contextual (campo e) del texto etiquetado; lexico = glosa del léxico TBESH/TBESG",
  via_lexico: viaLexico,
  via_texto: viaTexto,
  lotes_fusionados: lotes,
  fecha: new Date().toISOString().slice(0, 10),
  ...stats,
};
fs.writeFileSync(salida, JSON.stringify({ _meta: meta, texto: texto.H, textoG: texto.G, lexico: lexico.H, lexicoG: lexico.G }, null, 1) + "\n", "utf8");
console.log("Escrito:", salida);
console.log("vía léxico:", viaLexico, "| vía texto:", viaTexto);
console.log(JSON.stringify(stats, null, 1));
