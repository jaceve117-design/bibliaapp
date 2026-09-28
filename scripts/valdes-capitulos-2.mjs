// Localiza los capítulos 7 y 15 de Valdés-1CO con frases alternativas de su propia cita,
// y muestra el texto en la marca ⧉16⧉ para decidir si es el capítulo 15 o el 16.
import fs from "node:fs";

const texto = fs.readFileSync("05. Datos/corpus_crudo/valdes/posiciones.json", "utf8");
const pos = JSON.parse(texto);
const completo = (() => {
  const raw = fs.readFileSync("05. Datos/corpus_crudo/valdes/1co-valdes-usoz.txt", "utf8");
  const lineas = raw.split(/\r?\n/).map((l) => l.trim()).filter((l) => l.length > 0);
  let t = "";
  for (const l of lineas) {
    const m = l.match(/^(\d{1,2})\.\s*$/);
    if (m) { t += ` ⧉${m[1]}⧉ `; continue; }
    t += t.endsWith("-") ? l : (t ? " " : "") + l;
  }
  return t.replace(/([a-záéíóúñ])-(\s)/g, "$1").replace(/\s+/g, " ");
})();

// cap 7: la cita de 7:1 en la traducción de Valdés
const zona7 = completo.slice(pos[6], pos[8]);
for (const pista of ["Buena cosa es", "tocar mujer", "llegar a mujer", "escribist", "por causa de las fornicaciones"]) {
  const i = zona7.indexOf(pista);
  if (i >= 0) { pos[7] = pos[6] + i; console.log(`cap 7 via «${pista}»: ${pos[7]} — …${zona7.slice(i - 20, i + 80).replace(/\s+/g, " ")}…`); break; }
}
if (!pos[7]) console.log("cap 7: ninguna pista encontrada en la zona 6→8");

// cap 15: pistas de la resurrección entre 14 y 16
const zona15 = completo.slice(pos[14], pos[16]);
console.log(`tamaño zona 14→16: ${zona15.length}`);
for (const pista of ["resurrección de los muertos", "Si Cristo no resucitó", "Además os declaro", "os declaro el evangelio", "resucitó al tercer día"]) {
  const i = zona15.indexOf(pista);
  if (i >= 0) { pos[15] = pos[14] + i; console.log(`cap 15 via «${pista}»: ${pos[15]} — …${zona15.slice(i - 20, i + 80).replace(/\s+/g, " ")}…`); break; }
}
if (!pos[15]) console.log("cap 15: ninguna pista en la zona 14→16");

// qué abre la marca ⧉16⧉
console.log("⧉16⧉ abre con: …" + completo.slice(pos[16], pos[16] + 160).replace(/\s+/g, " ") + "…");

fs.writeFileSync("05. Datos/corpus_crudo/valdes/posiciones.json", JSON.stringify(pos, null, 1));
console.log("posiciones actualizadas");
