// Fronteras finales de Valdés-1CO: cap 7 (primera «mujer» de la zona 6→8, con contexto)
// y cap 16 real (tras la marca 15 misOCR; comprobar su contenido).
import fs from "node:fs";

const pos = JSON.parse(fs.readFileSync("05. Datos/corpus_crudo/valdes/posiciones.json", "utf8"));
const raw = fs.readFileSync("05. Datos/corpus_crudo/valdes/1co-valdes-usoz.txt", "utf8");
const lineas = raw.split(/\r?\n/).map((l) => l.trim()).filter((l) => l.length > 0);
let texto = "";
for (const l of lineas) {
  const m = l.match(/^(\d{1,2})\.\s*$/);
  if (m) { texto += ` ⧉${m[1]}⧉ `; continue; }
  texto += texto.endsWith("-") ? l : (texto ? " " : "") + l;
}
texto = texto.replace(/([a-záéíóúñ])-(\s)/g, "$1").replace(/\s+/g, " ");

// cap 7: primeras 3 apariciones de «mujer» en la zona 6→8 con contexto
const zona = texto.slice(pos[6], pos[8]);
let desde = 0, k = 0;
while (k < 3) {
  const i = zona.indexOf("mujer", desde);
  if (i < 0) break;
  console.log(`mujer #${k + 1} (abs ${pos[6] + i}): …${zona.slice(Math.max(0, i - 70), i + 70).replace(/\s+/g, " ")}…`);
  desde = i + 5;
  k++;
}

// cap 16 real: contenido tras la marca 15 (que es ⧉16⧉ en el OCR)
const cola = texto.slice(pos[16]);
console.log(`\ntamaño cola tras 15: ${cola.length}`);
for (const pista of ["colecta", "limosna", "santos", "Pablo"]) {
  const i = cola.indexOf(pista);
  if (i >= 0) { console.log(`«${pista}» en ${i}: …${cola.slice(Math.max(0, i - 50), i + 90).replace(/\s+/g, " ")}…`); break; }
}
console.log("la cola abre con: …" + cola.slice(0, 150) + "…");
