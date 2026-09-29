/**
 * Ingesta MACULA Greek (SBLGNT) — sintaxis por palabra (CC BY 4.0, Clear Bible)
 * → public/data/macula/sintaxis.json
 *
 * Fuente: SBLGNT/tsv/macula-greek-SBLGNT.tsv (una fila por palabra, 137.741 palabras).
 * Columnas usadas: ref («MAT 1:1!1»), role (función sintáctica), english
 * (traducción contextual del word), text (palabra griega), normalized.
 *
 * Salida: verse-keyed, cada verso = array de palabras [griega, rol, contextual].
 * Formato compacto: { total: N, v: { "MAT.1.1": [["Βίβλος","sust","[The] book"], …] } }
 * (roles sin valor = palabra de función; se marca «fn»).
 *
 * Uso: node scripts/ingesta-macula.mjs
 */
import fs from "node:fs";

const OSIS_DE = {
  Matt: 'MAT', Mark: 'MRK', Luke: 'LUK', John: 'JHN', Acts: 'ACT', Rom: 'ROM',
  '1Cor': '1CO', '2Cor': '2CO', Gal: 'GAL', Eph: 'EPH', Phil: 'PHP', Col: 'COL',
  '1Thess': '1TH', '2Thess': '2TH', '1Tim': '1TI', '2Tim': '2TI', Titus: 'TIT',
  Phlm: 'PHM', Heb: 'HEB', Jas: 'JAS', '1Pet': '1PE', '2Pet': '2PE',
  '1John': '1JN', '2John': '2JN', '3John': '3JN', Jude: 'JUD', Rev: 'REV',
};

// roles MACULA → etiqueta ES para la ficha del lector
const ROL_ES = {
  v: 'verbo', s: 'sujeto', o: 'objeto directo', io: 'objeto indirecto', o2: 'objeto secundario',
  adv: 'adverbial', p: 'preposición', vc: 'verbo copulativo', aux: 'verbo auxiliar', fn: 'palabra de función',
};

const bruto = fs.readFileSync("../../05. Datos/corpus_crudo/macula/macula-greek-SBLGNT.tsv", "utf8");
const lineas = bruto.split(/\r?\n/);
const cab = lineas[0].split('\t');
const ix = Object.fromEntries(cab.map((c, i) => [c, i]));

const porVerso = new Map();
let palabras = 0, versos = 0, descartadas = 0;

for (let i = 1; i < lineas.length; i++) {
  const l = lineas[i];
  if (!l.trim()) continue;
  const c = l.split('\t');
  const ref = c[ix.ref];
  if (!ref) { descartadas++; continue; }
  // «MAT 1:1!1» → «MAT.1.1»
  const mm = ref.match(/^([0-9]?[A-Za-z]+)\s+(\d+):(\d+)/);
  if (!mm) { descartadas++; continue; }
  // el TSV usa la forma corta MAYÚSCULAS (MAT, MRK…) que ya ES el OSIS del lector;
  // el mapa largo es el respaldo para las formas tipo «Matt»
  const osis = OSIS_DE[mm[1]] ?? (/^[0-9]?[A-Z]{2,3}$/.test(mm[1]) ? mm[1] : undefined);
  if (!osis) { descartadas++; continue; }
  const clave = `${osis}.${mm[2]}.${mm[3]}`;

  const texto = (c[ix.text] || '').trim();
  const rol = c[ix.role] || 'fn';
  const ingles = (c[ix.english] || '').trim();
  const griego = (c[ix.normalized] || texto).trim();
  if (!texto) { descartadas++; continue; }
  palabras++;

  if (!porVerso.has(clave)) { porVerso.set(clave, []); versos++; }
  const strong = (c[ix.strong] || '').trim();
  porVerso.get(clave).push([griego, ROL_ES[rol] ?? rol, ingles, strong]);
}

const salida = { total: versos, palabras, v: Object.fromEntries(porVerso) };
fs.mkdirSync("public/data/macula", { recursive: true });
fs.writeFileSync("public/data/macula/sintaxis.json", JSON.stringify(salida));
fs.writeFileSync(
  "public/data/macula/_manifest.json",
  JSON.stringify(
    {
      obra: "MACULA Greek New Testament — sintaxis por palabra (Clear Bible)",
      osis_obra: "MACULA",
      licencia: "CC BY 4.0 — Clear Bible (ClearLearning)",
      fuente: "https://github.com/Clear-Bible/macula-greek — SBLGNT/tsv/macula-greek-SBLGNT.tsv",
      fecha_ingesta: new Date().toISOString().slice(0, 10),
      formato: 'por verso: [[griego normalizado, rol ES, traducción contextual EN]…]',
      roles: "v=verbo, s=sujeto, o=objeto directo, io=objeto indirecto, o2=objeto secundario, adv=adverbial, p=preposición, vc=copulativo, aux=auxiliar, fn=palabra de función",
      total: versos,
      palabras,
    },
    null,
    2
  )
);
console.log(`versos: ${versos} · palabras: ${palabras} · descartadas: ${descartadas}`);
const mb = (fs.statSync("public/data/macula/sintaxis.json").size / 1048576).toFixed(1);
console.log(`tamaño: ${mb} MB`);
