// Lista las glosas dominantes del TEXTO (campo e) más frecuentes que siguen sin traducir,
// para el lote de emergencia del overlay (los Strong más usados no pueden quedarse en EN).
import fs from "node:fs";
import path from "node:path";

const madre = process.cwd();
const appData = path.join(madre, "07. App", "app", "public", "data");
const glosasDir = path.join(madre, "06. Traduccion", "glosas-es");
const norma = (s) => (s || "").replace(/[.,;:!?…]+$/, "");

const canon = (s) => (s || "").replace(/[A-Z_]*$/, "").replace(/_.*$/, "").toUpperCase();
// glosas ya traducidas en los lotes TSV existentes (normalizadas)
const trad = new Set();
for (const f of fs.readdirSync(glosasDir)) {
  if (!f.endsWith(".tsv")) continue;
  for (const l of fs.readFileSync(path.join(glosasDir, f), "utf8").split("\n")) {
    const i = l.indexOf("\t");
    if (i > 0) trad.add(norma(l.slice(0, i)));
  }
}
console.log("cadenas ya traducidas:", trad.size);

// glosas del texto (campo e) sin traducir, rankeadas por frecuencia TOTAL de palabras
const out = { H: new Map(), G: new Map() }; // e → nº palabras
for (const [dir, L] of [["stepbible/tahot", "H"], ["stepbible/tagnt", "G"]]) {
  const base = path.join(appData, dir);
  for (const fn of fs.readdirSync(base)) {
    const j = JSON.parse(fs.readFileSync(path.join(base, fn), "utf8"));
    for (const v of Object.values(j.versos))
      for (const p of v) {
        const c = canon(p.s);
        if (!/^[HG]\d{4}$/.test(c)) continue;
        const e = norma((p.e || "").trim());
        if (!e || trad.has(e)) continue;
        out[L].set(e, (out[L].get(e) || 0) + 1);
      }
  }
}
for (const L of ["H", "G"]) {
  const lista = [...out[L].entries()].sort((a, b) => b[1] - a[1]).slice(0, 120);
  console.log(`\n== ${L === "H" ? "HEBREO" : "GRIEGO"} — top ${lista.length} sin traducir (por palabras) ==`);
  fs.writeFileSync(path.join(glosasDir, L === "H" ? "lote1b-texto.txt" : "lote1b-textoG.txt"), lista.map(([e]) => e).join("\n") + "\n", "utf8");
  console.log(lista.map(([e, n]) => `${e} (${n})`).join(" | "));
}
