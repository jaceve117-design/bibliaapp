/**
 * Ingesta Theographic Bible Metadata (CC BY-SA 4.0 — Airtable export de
 * robertrouse/theographic-bible-metadata) → public/data/theographic/
 *
 * Salidas (compactas, verse-keyed para el lector):
 *   personas.json      fichas: [{ id, n, g, nac, mue, padre, madre, hijos, dic }]
 *   lugares-fichas.json fichas: [{ id, n, lat, lon, tipo, nota }]
 *   eventos.json       [{ t, ini, dur, participantes: [nombres], versos: [OSIS.c.v] }]
 *   por-versiculo.json { "GEN.1.1": { p: [personId], l: [placeId], e: [eventId] } }
 *   _manifest.json     licencia CC BY-SA 4.0 + crédito + cobertura
 *
 * Uso: node scripts/ingesta-theographic.mjs
 */
import fs from "node:fs";
import path from "node:path";

const CRUDO = "../../05. Datos/corpus_crudo/theographic";
const SALIDA = "public/data/theographic";
const leer = (f) => JSON.parse(fs.readFileSync(path.join(CRUDO, f), "utf8"));

// mapa de prefijos de osisRef → OSIS de 3 letras del lector
const OSIS_DE = {
  Gen: 'GEN', Exod: 'EXO', Lev: 'LEV', Num: 'NUM', Deut: 'DEU', Josh: 'JOS',
  Judg: 'JDG', Ruth: 'RUT', '1Sam': '1SA', '2Sam': '2SA', '1Kgs': '1KI', '2Kgs': '2KI',
  '1Chr': '1CH', '2Chr': '2CH', Ezra: 'EZR', Neh: 'NEH', Esth: 'EST', Job: 'JOB',
  Ps: 'PSA', Prov: 'PRO', Eccl: 'ECC', Song: 'SNG', Isa: 'ISA', Jer: 'JER',
  Lam: 'LAM', Ezek: 'EZK', Dan: 'DAN', Hos: 'HOS', Joel: 'JOL', Amos: 'AMO',
  Obad: 'OBA', Jonah: 'JON', Mic: 'MIC', Nah: 'NAM', Hab: 'HAB', Zeph: 'ZEP',
  Hag: 'HAG', Zech: 'ZEC', Mal: 'MAL', Matt: 'MAT', Mark: 'MRK', Luke: 'LUK',
  John: 'JHN', Acts: 'ACT', Rom: 'ROM', '1Cor': '1CO', '2Cor': '2CO', Gal: 'GAL',
  Eph: 'EPH', Phil: 'PHP', Col: 'COL', '1Thess': '1TH', '2Thess': '2TH',
  '1Tim': '1TI', '2Tim': '2TI', Titus: 'TIT', Phlm: 'PHM', Heb: 'HEB',
  Jas: 'JAS', '1Pet': '1PE', '2Pet': '2PE', '1John': '1JN', '2John': '2JN',
  '3John': '3JN', Jude: 'JUD', Rev: 'REV',
};
// convertir «Gen.1.1» → «GEN.1.1»
const osisDe = (ref) => {
  const partes = String(ref).split('.');
  const osis = OSIS_DE[partes[0]];
  return osis ? osis + '.' + partes.slice(1).join('.') : null;
};

const verses = leer("verses.json");
// índice recId → OSIS.c.v para resolver los versos de los eventos
const versosIndex = new Map();
for (const v of verses) {
  const f = v.fields ?? {};
  if (f.osisRef) versosIndex.set(v.id, `${f.osisRef}`);
}
const people = leer("people.json");
const places = leer("places.json");
const events = leer("events.json");

// ── personas: fichas ──
const personasSalida = [];
const nombrePersona = new Map(); // recId → nombre ES (por ahora EN)
for (const p of people) {
  const f = p.fields ?? {};
  if (!f.name) continue;
  const id = f.personLookup || f.personID || p.id;
  nombrePersona.set(p.id, f.name);
  personasSalida.push({
    id,
    n: f.name,
    g: f.gender === "Female" ? "mujer" : f.gender === "Male" ? "varón" : null,
    nac: f.birthYear ?? null,
    mue: f.deathYear ?? null,
    padre: f.father?.length ? f.father : null,     // IDs: se resuelven abajo
    madre: f.mother?.length ? f.mother : null,
    hijos: f.children?.length ? f.children : null,
    dic: f.dictionaryText ? true : false,           // hay texto de diccionario embebido
  });
}
// resolver padre/madre/hijos a nombres
const nombrePorId = new Map(people.map((p) => [p.id, p.fields?.name ?? null]));
for (const p of personasSalida) {
  const resuelve = (arr) => Array.isArray(arr) ? arr.map((id) => nombrePorId.get(id)).filter(Boolean) : null;
  if (p.padre) p.padre = resuelve(p.padre);
  if (p.madre) p.madre = resuelve(p.madre);
  if (p.hijos) p.hijos = resuelve(p.hijos);
}

// ── lugares: fichas con coordenadas ──
const lugaresFichas = [];
const nombreLugar = new Map();
for (const pl of places) {
  const f = pl.fields ?? {};
  if (!f.kjvName) continue;
  const id = f.placeLookup || f.placeID || pl.id;
  nombreLugar.set(pl.id, f.kjvName);
  lugaresFichas.push({
    id,
    n: f.kjvName,
    lat: f.openBibleLat ? Number(f.openBibleLat) : null,
    lon: f.openBibleLong ? Number(f.openBibleLong) : null,
    tipo: f.featureType ?? null,
    nota: f.comment ?? null,
  });
}

// ── eventos: títulos + participantes resueltos a nombres + versos OSIS ──
const eventos = [];
for (const ev of events) {
  const f = ev.fields ?? {};
  if (!f.title) continue;
  const participantes = (f.participants ?? []).map((id) => nombrePersona.get(id)).filter(Boolean);
  const versos = (f.verses ?? []).map((vid) => osisDe(versosIndex.get(vid) ?? '') ?? null).filter(Boolean);
  eventos.push({
    t: f.title,
    ini: f.startDate ?? null,
    dur: f.duration ?? null,
    participantes,
    versos,
  });
}

// ── verse-keyed: personas y lugares por OSIS ──
const porVersiculo = {};
let conP = 0, conL = 0;
for (const v of verses) {
  const f = v.fields ?? {};
  const osisRef = osisDe(f.osisRef);
  if (!osisRef) continue;
  const fila = {};
  if (f.people?.length) { fila.p = f.people.map((id) => nombrePersona.get(id)).filter(Boolean); if (fila.p.length) conP++; }
  if (f.places?.length) { fila.l = f.places.map((id) => nombreLugar.get(id)).filter(Boolean); if (fila.l.length) conL++; }
  if (fila.p || fila.l) porVersiculo[osisRef] = fila;
}

fs.mkdirSync(SALIDA, { recursive: true });
fs.writeFileSync(path.join(SALIDA, "personas.json"), JSON.stringify({ total: personasSalida.length, fichas: personasSalida }));
fs.writeFileSync(path.join(SALIDA, "lugares-fichas.json"), JSON.stringify({ total: lugaresFichas.length, fichas: lugaresFichas }));
fs.writeFileSync(path.join(SALIDA, "eventos.json"), JSON.stringify({ total: eventos.length, eventos }));
fs.writeFileSync(path.join(SALIDA, "por-versiculo.json"), JSON.stringify({ total: Object.keys(porVersiculo).length, v: porVersiculo }));

const manifiesto = {
  obra: "Theographic Bible Metadata — personas, lugares, eventos y cronología por versículo",
  osis_obra: "THEOGRAPHIC",
  licencia: "CC BY-SA 4.0 — Attribution-ShareAlike (los derivados heredan la misma licencia)",
  fuente: "https://github.com/robertrouse/theographic-bible-metadata (export JSON de Airtable)",
  fecha_ingesta: new Date().toISOString().slice(0, 10),
  idioma: "en (nombres y textos; la traducción ES de nombres/descripciones entra por el motor, perfil glosa)",
  cobertura: {
    personas: personasSalida.length,
    lugares: lugaresFichas.length,
    eventos: eventos.length,
    versos_con_personas: conP,
    versos_con_lugares: conL,
  },
  nota: "Los nombres de personas y lugares están en inglés; la traducción ES entra por el motor (perfil glosa). El texto `dictionaryText` de las personas es de Easton (EN) — en la app se enlaza a la entrada ES cuando existe.",
  incidentes: [],
};
fs.writeFileSync(path.join(SALIDA, "_manifest.json"), JSON.stringify(manifiesto, null, 2), "utf8");
console.log(`Theographic: ${personasSalida.length} personas · ${lugaresFichas.length} lugares · ${eventos.length} eventos`);
console.log(`versos con personas: ${conP} · con lugares: ${conL}`);
