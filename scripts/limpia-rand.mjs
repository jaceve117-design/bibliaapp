/**
 * Limpieza del OCR del Diccionario de W. W. Rand (American Tract Society, PD)
 * → 05. Datos/corpus_crudo/rand/entradas.json
 *
 * Estructura del OCR:
 *   - cabeceras de página: líneas de 3 letras (ABA, ABE…) y «BIBLE DICTIONARY.»
 *   - entradas: líneas que empiezan con NOMBRE EN MAYÚSCULAS con acentos de
 *     fuerza (ABAD'DON) y coma; la definición fluye a continuación y entre líneas.
 *   - palabras cortadas por guion de línea (Da-  mascascus) y espacios dobles.
 *
 * Uso: node scripts/limpia-rand.mjs
 */
import fs from "node:fs";

const raw = fs.readFileSync("05. Datos/corpus_crudo/rand/rand-djvu.txt", "utf8");
const lineas = raw.split(/\r?\n/).map((l) => l.replace(/\s+/g, " ").trim());

// 1) filtrar ruido: portada, cabeceras de página, ilustraciones
const cuerpo = [];
for (const l of lineas) {
  if (!l) continue;
  if (/^BIBLE\s+DICTIONARY\.?$/i.test(l)) continue;
  if (/^[A-Z]{3}$/.test(l)) continue;                 // ABA, ABE, ABI… cabecera de página
  if (/^(SEE|IL|ENGRAV|MAP|TABLE|PUBLISHED|NEW YORK|ENTERED|DRAWN|SCANNED|THE LIBRARY|THE UNIVERSITY|OF CALIFORNIA|GIFT|ESTATE|PREFACE)/i.test(l)) continue;
  if (l.length <= 3 && !/\./.test(l)) continue;       // fragmentos sueltos
  cuerpo.push(l);
}

// 2) unir líneas: guion de fin de línea une; las entradas arrancan con
//    NOMBRE EN MAYÚSCULAS + coma al principio de línea
const RE_ENTRADA = /^([A-Z][A-ZÀ-Þ'’.\- ]{1,45}),\s*(.+)$/;
const entradas = [];
let actual = null;
let texto = "";
const cerrar = () => {
  if (actual && texto.trim().length >= 40) entradas.push({ nombre: actual, texto: texto.trim() });
  actual = null;
  texto = "";
};
for (const l of cuerpo) {
  const m = l.match(RE_ENTRADA);
  if (m) {
    cerrar();
    actual = m[1];
    texto = m[2];
    continue;
  }
  if (actual) {
    // unir: guion de línea → sin espacio; si no, con espacio
    texto += texto.endsWith("-") ? l : " " + l;
  }
  // líneas fuera de entrada (p. ej. índice de ilustraciones) se descartan
}
cerrar();

// 3) normalizar el nombre: quitar acentos de fuerza, Title Case, conservar guiones
const titleCase = (s) =>
  s
    .toLowerCase()
    .replace(/(^|[\s\-'])([a-záéíóúñü])/g, (_, p, c) => p + c.toUpperCase())
    .replace(/'/g, "");
const slug = (s) => s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

const salida = [];
const vistos = new Set();
for (const e of entradas) {
  const nombre = titleCase(e.nombre.replace(/'/g, "").replace(/\s+/g, " ").trim());
  const s = slug(nombre);
  if (!s || vistos.has(s)) continue;
  vistos.add(s);
  salida.push({ s, n: nombre, d: e.texto });
}

fs.writeFileSync("05. Datos/corpus_crudo/rand/entradas.json", JSON.stringify({ total: salida.length, entradas: salida }, null, 1));
console.log(`entradas limpias: ${salida.length}`);
console.log("primeras 6:", salida.slice(0, 6).map((e) => e.n).join(" | "));
console.log("muestra Aarón:", JSON.stringify((salida.find((e) => e.s === "aaron") || {}).d?.slice(0, 150) || "no está"));
