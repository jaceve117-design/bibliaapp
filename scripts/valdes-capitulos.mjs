// Divide el comentario de Valdés a 1 Corintios (OCR Usoz) en 16 capítulos.
// Las marcas «N.» vienen del OCR con errores: 0→9, 18→13; los capítulos 5, 7, 11 y 15
// no tienen marca: se localizan por palabras de su apertura (la cita que abre el capítulo).
import fs from "node:fs";

const raw = fs.readFileSync("05. Datos/corpus_crudo/valdes/1co-valdes-usoz.txt", "utf8");
const lineas = raw.split(/\r?\n/).map((l) => l.trim()).filter((l) => l.length > 0);

let texto = "";
for (const l of lineas) {
  const m = l.match(/^(\d{1,2})\.\s*$/);
  if (m) { texto += ` ⧉${m[1]}⧉ `; continue; }
  texto += texto.endsWith("-") ? l : (texto ? " " : "") + l;
}
texto = texto.replace(/([a-záéíóúñ])-(\s)/g, "$1").replace(/\s+/g, " ");

const marca = { 1: "⧉1⧉", 2: "⧉2⧉", 3: "⧉3⧉", 4: "⧉4⧉", 6: "⧉6⧉", 8: "⧉8⧉", 9: "⧉0⧉", 10: "⧉10⧉", 12: "⧉12⧉", 13: "⧉18⧉", 14: "⧉14⧉" };
const pos = {};
for (const [cap, tk] of Object.entries(marca)) {
  const i = texto.indexOf(tk);
  if (i >= 0) pos[Number(cap)] = i;
}
// el segundo ⧉16⧉: buscar el que quede después del 14
let desde = pos[14] + 1;
while (true) {
  const i = texto.indexOf("⧉16⧉", desde);
  if (i >= 0) { pos[16] = i; break; }
  break;
}
console.log("posiciones de marcas:", JSON.stringify(pos));

const claves = { 5: "fornicación", 7: "escribisteis", 11: "imitadores", 15: "evangelio que os" };
for (const cap of [5, 7, 11, 15]) {
  const previos = Object.entries(pos).filter(([c]) => Number(c) < cap).map(([, i]) => i);
  const siguientes = Object.entries(pos).filter(([c]) => Number(c) > cap).map(([, i]) => i);
  if (!previos.length || !siguientes.length) { console.log("cap", cap, "sin rango"); continue; }
  const previo = Math.max(...previos);
  const siguiente = Math.min(...siguientes);
  const i = texto.indexOf(claves[cap], previo);
  if (i >= 0 && i < siguiente) {
    pos[cap] = i;
    console.log(`cap ${cap} localizado (${i}): …${texto.slice(i - 30, i + 70).replace(/\s+/g, " ")}…`);
  } else {
    console.log(`cap ${cap} NO localizado en [${previo}, ${siguiente})`);
  }
}

fs.writeFileSync("05. Datos/corpus_crudo/valdes/posiciones.json", JSON.stringify(pos, null, 1));
console.log("posiciones.json escrito");
