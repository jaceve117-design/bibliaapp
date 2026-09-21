/**
 * Ingesta SBLGNT (paso 6 — cierre del núcleo).
 * Fuente: morphgnt/sblgnt (GitHub) — morfología del SBL Greek New Testament.
 * Licencia: SBLGNT CC BY 4.0 (sblgnt.com); anotación morphgnt CC BY 4.0.
 * Formato de entrada: TSV por palabra — libro.cap.verso | POS | parsing | palabra | normalizada | lema
 * Salida: public/data/sblgnt/{OSIS}.json + _manifest.json
 * Portón: 27 libros, conteo de versos vs RV1909 (diferencias de versificación documentadas, no rellenadas).
 */
import fs from "node:fs";
import path from "node:path";

const CLOUDO = "../../05. Datos/corpus_crudo/sblgnt";
const SALIDA = "public/data/sblgnt";

const MAPA = {
  "61-Mt": "MAT", "62-Mk": "MRK", "63-Lk": "LUK", "64-Jn": "JHN", "65-Ac": "ACT",
  "66-Ro": "ROM", "67-1Co": "1CO", "68-2Co": "2CO", "69-Ga": "GAL", "70-Eph": "EPH",
  "71-Php": "PHP", "72-Col": "COL", "73-1Th": "1TH", "74-2Th": "2TH", "75-1Ti": "1TI",
  "76-2Ti": "2TI", "77-Tit": "TIT", "78-Phm": "PHM", "79-Heb": "HEB", "80-Jas": "JAS",
  "81-1Pe": "1PE", "82-2Pe": "2PE", "83-1Jn": "1JN", "84-2Jn": "2JN", "85-3Jn": "3JN",
  "86-Jud": "JUD", "87-Re": "REV",
};
const NOMBRES = {
  MAT: "Mateo", MRK: "Marcos", LUK: "Lucas", JHN: "Juan", ACT: "Hechos", ROM: "Romanos",
  "1CO": "1 Corintios", "2CO": "2 Corintios", GAL: "Gálatas", EPH: "Efesios", PHP: "Filipenses",
  COL: "Colosenses", "1TH": "1 Tesalonicenses", "2TH": "2 Tesalonicenses", "1TI": "1 Timoteo",
  "2TI": "2 Timoteo", TIT: "Tito", PHM: "Filemón", HEB: "Hebreos", JAS: "Santiago",
  "1PE": "1 Pedro", "2PE": "2 Pedro", "1JN": "1 Juan", "2JN": "2 Juan", "3JN": "3 Juan",
  JUD: "Judas", REV: "Apocalipsis",
};

// manifiesto RV1909 para el portón de versificación
const rv = JSON.parse(fs.readFileSync("public/data/rv1909/_manifest.json", "utf8"));
const rvVersos = new Map(rv.libros.map((l) => [l.osis, l.versos]));

const libros = [];
const incidentes = [];

for (const [clave, osis] of Object.entries(MAPA)) {
  const crudo = fs.readFileSync(path.join(CLOUDO, `${clave}-morphgnt.txt`), "utf8");
  const porVerso = new Map();
  for (const linea of crudo.split("\n")) {
    if (!linea.trim()) continue;
    const cols = linea.trim().split(/\s+/);
    if (cols.length < 6) continue;
    const codigo = cols[0]; // libro(2) + cap(2) + verso(2)
    const cap = Number(codigo.slice(2, 4));
    const verso = Number(codigo.slice(4, 6));
    if (!Number.isInteger(cap) || !Number.isInteger(verso) || cap < 1 || verso < 1) {
      incidentes.push({ osis, tipo: "código de verso no parseable", dato: codigo });
      continue;
    }
    const k = `${cap}.${verso}`;
    if (!porVerso.has(k)) porVerso.set(k, { c: cap, v: verso, osis: `${osis}.${cap}.${verso}`, w: [] });
    porVerso.get(k).w.push([cols[3].trim(), cols[5].trim(), `${cols[1].trim()}${cols[2].trim()}`.replace(/\s+/g, "")]);
  }
  const versos = [...porVerso.values()].sort((a, b) => a.c - b.c || a.v - b.v);
  for (const v of versos) v.t = v.w.map((x) => x[0]).join(" ");
  const caps = Math.max(...versos.map((v) => v.c));
  const json = { osis, nombre: NOMBRES[osis], fuente: "SBLGNT (ed. M. W. Holmes, SBL) — morfología MorphGNT · CC BY 4.0", versos };
  fs.writeFileSync(path.join(SALIDA, `${osis}.json`), JSON.stringify(json), "utf8");

  const esperado = rvVersos.get(osis) ?? null;
  const diff = esperado === null ? null : versos.length - esperado;
  libros.push({ osis, nombre: NOMBRES[osis], caps, versos: versos.length });
  if (diff !== 0) {
    // diferencias de versificación NA vs TR (RV1909): documentadas, no rellenadas
    incidentes.push({ osis, tipo: `conteo vs RV1909: ${versos.length} vs ${esperado} (dif ${diff})` });
  }
  console.log(`${osis}: ${versos.length} versos, ${caps} caps, ${versos.reduce((a, v) => a + v.w.length, 0)} palabras, dif RV1909: ${diff}`);
}

const totalVersos = libros.reduce((a, l) => a + l.versos, 0);
const manifiesto = {
  obra: "SBL Greek New Testament (SBLGNT) — ed. Michael W. Holmes",
  osis_obra: "SBLGNT",
  licencia: "CC BY 4.0 (Society of Biblical Literature) · morfología MorphGNT CC BY 4.0",
  fuente: "https://github.com/morphgnt/sblgnt (crudo archivado en 05. Datos/corpus_crudo/sblgnt/)",
  fecha_ingesta: "2026-09-21",
  total_versos: totalVersos,
  incidentes,
  libros,
};
fs.writeFileSync(path.join(SALIDA, "_manifest.json"), JSON.stringify(manifiesto, null, 2), "utf8");
console.log(`\nTOTAL: ${libros.length} libros, ${totalVersos} versos, ${incidentes.length} incidentes documentados.`);
