// Genera las colas de trabajo para la traducción ES de las glosas TBESH/TBESG.
// Ordena las entradas por frecuencia de sus Strong en el texto etiquetado (tahot/tagnt),
// deduplica por cadena de glosa (se traduce cada cadena única una vez) y escribe:
//   06. Traduccion/glosas-es/cola-hebreo.json  / cola-griego.json  (lotes a traducir)
//   06. Traduccion/glosas-es/resumen.json      (estadísticas de cobertura)
// Uso: node scripts/genera-colas-glosas.mjs   (desde la carpeta madre del proyecto)
import fs from "node:fs";
import path from "node:path";

const madre = process.cwd();
const appData = path.join(madre, "07. App", "app", "public", "data");
const destino = path.join(madre, "06. Traduccion", "glosas-es");
fs.mkdirSync(destino, { recursive: true });

// 1) frecuencia de Strong canónico en el texto
const canon = (s) => (s || "").replace(/[A-Z_]*$/, "").replace(/_.*$/, "").toUpperCase();
const freq = { H: new Map(), G: new Map() };
for (const [dir, L] of [["stepbible/tahot", "H"], ["stepbible/tagnt", "G"]]) {
  const base = path.join(appData, dir);
  for (const fn of fs.readdirSync(base)) {
    const j = JSON.parse(fs.readFileSync(path.join(base, fn), "utf8"));
    for (const v of Object.values(j.versos))
      for (const p of v) {
        const c = canon(p.s);
        if (/^[HG]\d{4}$/.test(c)) freq[L].set(c, (freq[L].get(c) || 0) + 1);
      }
  }
}

// 2) por cada léxico: entradas → cadena de glosa, rankeadas por frecuencia
const resumen = {};
for (const [L, archivo, clave] of [["H", "tbesh.json", "hebreo"], ["G", "tbesg.json", "griego"]]) {
  const lex = JSON.parse(fs.readFileSync(path.join(appData, "stepbible", archivo), "utf8"));
  // canon → lista de ids de entrada (usar el índice del propio léxico si cubre, si no construirlo)
  const indice = { ...lex.indice };
  for (const id of Object.keys(lex.entradas)) {
    const c = id.replace(/[A-Z]+$/, "");
    if (!indice[c]) indice[c] = [];
    if (!indice[c].includes(id)) indice[c].push(id);
  }
  // ranking de entradas por ocurrencias de su strong en el texto
  const entradasRank = [];
  for (const [c, ids] of Object.entries(indice)) {
    const oc = freq[L].get(c) || 0;
    for (const id of ids) entradasRank.push({ id, c, oc, g: (lex.entradas[id].g || "").trim() });
  }
  entradasRank.sort((a, b) => b.oc - a.oc || a.id.localeCompare(b.id));

  // dedupe por cadena de glosa, conservando la máxima frecuencia como orden
  const vistos = new Map(); // glosa → {oc, ids[]}
  for (const e of entradasRank) {
    if (!e.g) continue;
    if (!vistos.has(e.g)) vistos.set(e.g, { oc: e.oc, ids: [] });
    vistos.get(e.g).ids.push(e.id);
  }
  const cadenas = [...vistos.entries()].map(([g, v]) => ({ g, oc: v.oc, n: v.ids.length }));
  const totalPalabras = [...freq[L].values()].reduce((s, x) => s + x, 0);

  resumen[clave] = {
    entradas: entradasRank.length,
    cadenas_unicas: cadenas.length,
    strong_en_texto: freq[L].size,
    palabras_con_strong: totalPalabras,
    nota: "cadenas ordenadas por frecuencia de palabra en el texto; traducir en lotes desde la cabecera de la cola",
  };
  fs.writeFileSync(
    path.join(destino, `cola-${clave}.json`),
    JSON.stringify({ lexico: archivo, cadenas }, null, 1) + "\n",
    "utf8"
  );
}
fs.writeFileSync(path.join(destino, "resumen.json"), JSON.stringify(resumen, null, 1) + "\n", "utf8");
for (const [k, v] of Object.entries(resumen)) console.log(k, "->", JSON.stringify(v));
