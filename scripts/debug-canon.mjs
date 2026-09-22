import fs from "node:fs";
const lex = JSON.parse(fs.readFileSync("07. App/app/public/data/stepbible/tbesh.json", "utf8"));
const canonDe = (id) => id.replace(/[^A-Z0-9]+$/, "").replace(/[A-Z]+$/, "");
for (const c of ["H0430", "H3068", "H07225"]) {
  console.log("== canon", c, "==");
  console.log("  indice del léxico:", JSON.stringify(lex.indice[c]));
  for (const id of Object.keys(lex.entradas)) {
    if (canonDe(id) === c) console.log("  entrada", JSON.stringify(id), "glosa:", JSON.stringify(lex.entradas[id].g));
  }
}
const cola = JSON.parse(fs.readFileSync("06. Traduccion/glosas-es/cola-hebreo.json", "utf8")).cadenas;
console.log("top 15 cadenas en cola:", cola.slice(0, 15).map((x) => x.g + " (" + x.oc + ")").join(" | "));
console.log("God en cola en posición:", cola.findIndex((x) => x.g === "God"));
console.log("beginning en cola en posición:", cola.findIndex((x) => x.g === "beginning"));
