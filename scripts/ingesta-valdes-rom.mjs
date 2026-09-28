/**
 * Ingesta del Comentario de Juan de Valdés a ROMANOS (1556, castellano original).
 * Fuente: Usoz 1856, «La Epístola de san Pablo a los Romanos, i la 1.ª a los Corintios»,
 * vol. 1 (archive.org laepistoladesanp01vald, OCR djvu.txt).
 * Estructura: marcas «CAPITULO <roman>. [verso|página]» — numerales romanos con ruido OCR
 * (Y por V, SI por II, ÍL/llí por III, 1 por I, í por I…). Los números ≤ 60 son VERSOS;
 * los mayores son PÁGINAS de la edición impresa (se descartan).
 * Salida: public/data/valdes/ROM.json (forma jfb: { osis, fuente, c: { cap: [{v, p}] } }).
 */
import fs from "node:fs";

const raw = fs.readFileSync("05. Datos/corpus_crudo/valdes/romanos-usoz-vol1.txt", "utf8");
const lineas = raw.split(/\r?\n/);

/** Decodifica un numeral romano ruidoso de OCR a 1-16, o null. */
function decodaRoman(ruido) {
  if (!ruido) return null;
  let t = rnoise(ruido);
  const tabla = { I: 1, II: 2, III: 3, IV: 4, V: 5, VI: 6, VII: 7, VIII: 8, IX: 9, X: 10, XI: 11, XII: 12, XIII: 13, XIV: 14, XV: 15, XVI: 16 };
  if (tabla[t]) return tabla[t];
  // variaciones con un carácter de ruido: probar quitando/añadiendo caracteres comunes
  for (const k of Object.keys(tabla)) {
    if (t.length === k.length) {
      let dif = 0;
      for (let i = 0; i < k.length; i++) if (t[i] !== k[i]) dif++;
      if (dif <= 1) return tabla[k];
    }
  }
  return null;
}
function rnoise(s) {
  return s
    .toUpperCase()
    .replace(/[^A-ZÍÌL1Í]/g, "")
    .replace(/Í/g, "I")
    .replace(/Ì/g, "I")
    .replace(/Y/g, "V")
    .replace(/1/g, "I")
    .replace(/L/g, "I") // «ÍL», «llí» → III
    .replace(/F/g, "I")
    .trim();
}

// 1) extraer marcas: línea que empieza por CAPITULO/CPITULO/CVPITÜLO…
const marcas = [];
lineas.forEach((l, i) => {
  const m = l.match(/^[CV]?\s*[PV]?[ÍLlI1]?[TTPÍL]*[Uu]*[LlO0]*\s*(CAPITULO|CVPITÜLO|CPITULO)\.?\s+(.{0,18})$/);
  if (!m) return;
  const rest = m[2].trim();
  const rm = rest.match(/^([A-ZÍLlífYVn1ÍÌxvXV]{1,8})\.?\s*(\d{1,3})?/);
  if (!rm) return;
  marcas.push({ linea: i, romanRuido: rm[1], num: rm[2] ? Number(rm[2]) : null });
});

// 2) caminar las marcas manteniendo el capítulo esperado (1→16)
let cap = 0;
const secciones = [];
for (const mk of marcas) {
  const dec = decodaRoman(mk.romanRuido);
  if (cap === 0) {
    if (dec === 1 || /PRIMERO/i.test(mk.romanRuido) || mk.romanRuido.toUpperCase().startsWith("PRIM")) {
      cap = 1;
      secciones.push({ cap: 1, verso: mk.num && mk.num <= 60 ? mk.num : null, linea: mk.linea });
    }
    continue;
  }
  if (dec === cap + 1) {
    cap = dec;
    secciones.push({ cap, verso: mk.num && mk.num <= 60 ? mk.num : null, linea: mk.linea });
  } else {
    secciones.push({ cap, verso: mk.num && mk.num <= 60 ? mk.num : null, linea: mk.linea });
  }
}
console.log(`marcas: ${marcas.length} · secciones: ${secciones.length}`);
console.log("distribución por capítulo:", JSON.stringify(secciones.reduce((a, s) => ({ ...a, [s.cap]: (a[s.cap] || 0) + 1 }), {})));

// 3) cortar: el cuerpo de cada sección va desde su marca hasta la siguiente
const seccionesFinales = [];
for (let i = 0; i < secciones.length; i++) {
  const s = secciones[i];
  const hasta = i + 1 < secciones.length ? secciones[i + 1].linea : lineas.length;
  let cuerpo = lineas.slice(s.linea + 1, hasta).join(" ");
  cuerpo = cuerpo
    .replace(/([a-záéíóúñií])- (\s*[a-záéíóúñií])/g, "$1$2")
    .replace(/\s+/g, " ")
    .trim();
  if (cuerpo.length < 80) continue;
  seccionesFinales.push({ cap: s.cap, verso: s.verso, cuerpo });
}

// 4) agrupar por capítulo y trocear en párrafos de ~1.100 chars
function aParrafos(t) {
  const oraciones = t.split(/(?<=[.!?»])\s+/);
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
for (const s of seccionesFinales) {
  const clave = String(s.cap);
  (caps[clave] ??= []);
  let ultima = caps[clave][caps[clave].length - 1];
  const mismoVerso = ultima && ultima.v === s.verso;
  const parras = aParrafos(s.cuerpo);
  if (mismoVerso) ultima.p.push(...parras);
  else caps[clave].push({ v: s.verso ?? 0, p: parras });
  total += parras.length;
}
console.log("capítulos:", Object.keys(caps).length, "| párrafos:", total);
for (const k of Object.keys(caps).sort((a, b) => a - b)) console.log(`  cap ${k}: ${caps[k].length} secciones · ${caps[k].reduce((a, s) => a + s.p.length, 0)} párrafos`);

fs.mkdirSync("07. App/app/public/data/valdes", { recursive: true });
fs.writeFileSync(
  "07. App/app/public/data/valdes/ROM.json",
  JSON.stringify({
    osis: "ROM",
    fuente: "Juan de Valdés, Comentario o declaración familiar y compendiosa sobre la Epístola de San Pablo a los Romanos (1556) · texto original en castellano del s. XVI · edición Usoz 1856 vía archive.org (OCR) · Dominio público · texto sin revisar",
    c: caps,
  })
);
console.log("valdes/ROM.json escrito");
