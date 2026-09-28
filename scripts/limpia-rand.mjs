/**
 * Limpieza v2 del OCR del Diccionario de Rand → entradas.json
 *
 * Detector de entradas: línea que EMPIEZA con nombre EN MAYÚSCULAS (con
 * apóstrofos de fuerza tipo ABAD'DON, guiones ABEL-BETH, y los espacios dobles
 * del OCR) seguido de coma. Las cabeceras de página (3 letras: ABA/ABE/ABI)
 * y «BIBLE DICTIONARY.» se filtran antes. La portada se descarta entera
 * (hasta la línea «ENTERED according…» + 6 líneas).
 *
 * Los nombres traen acentos de fuerza (ABAD'DON → Abaddon). El OCR mete
 * errores propios («AAR'OX» por AARON): se reportan pero no se corrigen aquí
 * (corresponden al pase de revisión).
 */
import fs from "node:fs";

const raw = fs.readFileSync("05. Datos/corpus_crudo/rand/rand-djvu.txt", "utf8");

// 1) líneas limpias (espacios dobles del OCR a uno)
const lineas = raw.split(/\r?\n/).map((l) => l.replace(/\s+/g, " ").trim());

// 2) localizar el arranque real de entradas: la primera «AB, father…»
//    (todo el bloque de portada + prefacio + lista de láminas va antes)
let inicio = 0;
for (let i = 0; i < lineas.length; i++) {
  if (/^AB,\s+father/i.test(lineas[i])) { inicio = Math.max(0, i - 1); break; }
}
// red de seguridad: si no aparece, tras el último PREFACE
if (inicio === 0) {
  for (let i = 0; i < lineas.length; i++) {
    if (/^PREFACE/i.test(lineas[i])) inicio = i + 1;
  }
}

// 3) detector de línea-entrada:
//    comienza con 2+ MAYÚSCULAS (admite ' - y espacios del OCR), sigue solo
//    mayúsculas/espacios/apóstrofes/guiones/puntos hasta una coma.
const RE_ENTRADA = /^([A-Z][A-Z'’\-]*(?:\s+[A-Z'’\-]+)*\.?)\s*,\s*(.+)$/;
const esCabeceraPagina = (l) => /^[A-Z]{3}$/.test(l) || /^BIBLE DICTIONARY/i.test(l);

const entradas = [];
let actual = null;
let texto = "";
let pagina = null;

const nombreLimpio = (n) =>
  n
    .replace(/'/g, "")
    .replace(/\s+/g, " ")
    .trim();

const titleCase = (n) =>
  nombreLimpio(n)
    .toLowerCase()
    .replace(/(^|[\s\-])([a-záéíóúñü])/g, (_, p, c) => p + c.toUpperCase());

for (let i = inicio; i < lineas.length; i++) {
  const l = lineas[i];
  if (!l) continue;
  if (esCabeceraPagina(l)) continue;

  // trozo previo a la coma, y el resto
  const m = l.match(/^([A-Z][A-Z'’.\- ]*?),\s*(.*)$/);
  if (m && m[1].length >= 2 && /[A-Z]{2}/.test(m[1])) {
    // cierra la entrada anterior
    if (actual && texto.replace(/\s+/g, " ").trim().length >= 40) {
      entradas.push({ nombre: titleCase(actual), texto: texto.replace(/\s+/g, " ").trim() });
    }
    actual = nombreLimpio(m[1]);
    texto = m[2];
    continue;
  }
  if (actual) texto += texto.endsWith("-") ? l : " " + l;
}
if (actual && texto.trim().length >= 40) {
  entradas.push({ nombre: titleCase(actual), texto: texto.replace(/\s+/g, " ").trim() });
}

// 4) deduplicar por slug
const slug = (s) => s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
const RUIDO_NOMBRE = /^(New York|D\. D\.|Society|American Tract)/i;
const salida = [];
const vistos = new Set();
for (const e of entradas) {
  if (RUIDO_NOMBRE.test(e.nombre) || e.texto.length < 60) continue;
  const s = slug(e.nombre);
  if (!s || vistos.has(s)) continue;
  vistos.add(s);
  salida.push({ s, n: e.nombre, d: e.texto });
}

fs.writeFileSync("05. Datos/corpus_crudo/rand/entradas.json", JSON.stringify({ total: salida.length, entradas: salida }, null, 1));
console.log(`entradas: ${salida.length}`);
console.log("primeras 8:", salida.slice(0, 8).map((e) => e.n).join(" | "));
const muestras = ["Aaron", "Abaddon", "Abana", "Abel", "Abel-beth-maachah", "Abraham"];
for (const m of muestras) {
  const e = salida.find((x) => x.n === m);
  console.log(`  ${m}: ${e ? e.d.slice(0, 80) + "…" : "NO ESTÁ"}`);
}
