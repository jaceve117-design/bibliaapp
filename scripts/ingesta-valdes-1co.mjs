// Ingesta del Comentario de Juan de Valdés a 1 Corintios (1557, castellano original,
// OCR de la edición Usoz) → 07. App/app/public/data/valdes/1CO.json en forma jfb-compatible:
// { osis, fuente, c: { cap: [{ v, p: [párrafos] }] } } con v=0 (el lector no antepone
// número de verso cuando v=0). Los 16 capítulos con fronteras verificadas.
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

const pos = JSON.parse(fs.readFileSync("05. Datos/corpus_crudo/valdes/posiciones.json", "utf8"));
// cap 15 = la marca «⧉16⧉» mal OCR («Notifíceos, hermanos, el evangelio…» = 1Co 15:1);
// cap 16 real = la SEGUNDA «⧉16⧉» («Cuanto á la colecta…»)
delete pos[15]; delete pos[16];
pos[15] = texto.indexOf("⧉16⧉", pos[14] + 1);
pos[16] = texto.indexOf("⧉16⧉", pos[15] + 1);
// cap 7: primera «me habéis escrito» en la zona 6→8 (la cita que abre el capítulo)
pos[7] = pos[6] + texto.slice(pos[6], pos[8]).indexOf("me habéis escrito") - 40;
const orden = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16];
console.log("orden y tamaños:");
for (let i = 0; i < orden.length; i++) {
  const cap = orden[i];
  const desde = pos[cap];
  const hasta = i + 1 < orden.length ? pos[orden[i + 1]] : texto.length;
  const tam = hasta - desde;
  console.log(`  cap ${cap}: ${desde} → ${hasta} (${tam} chars)`);
  if (tam < 2000) console.log(`  ⚠ cap ${cap} sospechosamente corto`);
}

// trocear cada capítulo en párrafos de ~1.100 chars cortando en puntos
function aParrafos(t) {
  const limpio = t.replace(/⧉\d+⧉/g, " ").replace(/\s+/g, " ").trim();
  const oraciones = limpio.split(/(?<=[.!?»])\s+/);
  const parras = [];
  let actual = "";
  for (const o of oraciones) {
    if ((actual + " " + o).length > 1100 && actual) { parras.push(actual.trim()); actual = o; }
    else actual = (actual ? actual + " " : "") + o;
  }
  if (actual.trim()) parras.push(actual.trim());
  return parras;
}

const caps = {};
let total = 0;
for (const cap of orden) {
  const desde = pos[cap];
  const hasta = cap === 16 ? texto.length : pos[orden[orden.indexOf(cap) + 1]];
  const parras = aParrafos(texto.slice(desde, hasta));
  caps[String(cap)] = [{ v: 0, p: parras }];
  total += parras.length;
  console.log(`cap ${cap}: ${parras.length} párrafos`);
}

fs.mkdirSync("07. App/app/public/data/valdes", { recursive: true });
fs.writeFileSync(
  path2Safe("07. App/app/public/data/valdes/1CO.json"),
  JSON.stringify({
    osis: "1CO",
    fuente: "Juan de Valdés, Comentario o declaración familiar y compendiosa sobre la primera epístola de San Pablo a los Corintios (1557) · texto original en castellano del s. XVI · edición Usoz (Reformistas Antiguos Españoles) vía archive.org (OCR limpiado) · Dominio público · texto sin revisar",
    c: caps,
  })
);
console.log("valdes/1CO.json escrito ·", total, "párrafos");

function path2Safe(p) { return p; }
