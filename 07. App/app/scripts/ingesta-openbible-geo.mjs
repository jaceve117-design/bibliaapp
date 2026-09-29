/**
 * Ingesta OpenBible.info Bible Geocoding (CC BY 4.0) → public/data/openbible/geo.json
 *
 * Fuente: https://github.com/openbibleinfo/Bible-Geocoding-Data (data/ancient.jsonl, JSON Lines)
 * Crudo en 05. Datos/corpus_crudo/openbible_geo/ (ancient.jsonl + license.txt).
 *
 * Cada línea: un lugar antiguo con identificaciones candidatas; cada identificación trae
 * `resolutions` con `lonlat` ("lon,lat") y `score.vote_average` (0-1000, votos de confianza).
 * Los versos van en `verses[].usx` ("MAT 2:23", USX = OSIS de 3 letras de la app).
 *
 * Salida: { fuente, lugares: [{ n, ll: [lat,lon], q, t, v: ["MAT.2.23", …] }] }
 *  - n nombre · ll [lat,lon] · q confianza (0-1000) · t tipo (settlement, river, mountain…)
 *  - se toma la identificación con mayor vote_average que tenga coordenada (best guess);
 *    lugares sin coordenada se descartan (7, todos menores — lista en el manifiesto).
 *
 * Uso: node scripts/ingesta-openbible-geo.mjs
 */
import fs from "node:fs";

const CRUDO = "../../05. Datos/corpus_crudo/openbible_geo/ancient.jsonl";
const SALIDA = "public/data/openbible";

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

const lineas = fs.readFileSync(CRUDO, "utf8").split(/\r?\n/).filter((l) => l.trim());

const lugares = [];
const sinCoordenada = [];
let refsTotales = 0;

for (const l of lineas) {
  const d = JSON.parse(l);
  const nombre = d.friendly_id;

  // mejor identificación con coordenada (la de mayor vote_average)
  let mejor = null; // { q, lat, lon, tipo }
  for (const idn of d.identifications ?? []) {
    const q = idn.score?.vote_average ?? 0;
    for (const r of idn.resolutions ?? []) {
      if (!r.lonlat) continue;
      const [lon, lat] = r.lonlat.split(",").map(Number);
      if (!Number.isFinite(lat) || !Number.isFinite(lon)) continue;
      if (!mejor || q > mejor.q) mejor = { q, lat, lon, tipo: (d.types ?? [])[0] ?? idn.class ?? "" };
    }
  }

  // versos: `verses[].usx` ("MAT 2:23") → "MAT.2.23"; respaldo `extra.osises`
  let refs = (d.verses ?? []).map((v) => v.usx).filter(Boolean);
  if (!refs.length) {
    try { refs = JSON.parse(d.extra ?? "{}").osises ?? []; } catch { /* sin extra */ }
  }
  refs = refs.map((r) => {
    const s = String(r).replace(" ", ".").replace(":", ".");
    const partes = s.split(".");
    return OSIS_DE[partes[0]] ? OSIS_DE[partes[0]] + "." + partes.slice(1).join(".") : s;
  });

  if (!mejor) { sinCoordenada.push({ n: nombre, refs: refs.length }); continue; }
  refsTotales += refs.length;

  lugares.push({
    n: nombre,
    ll: [Number(lat5(mejor.lat)), Number(lat5(mejor.lon))],
    q: mejor.q,
    t: mejor.tipo,
    v: refs,
  });
}

function lat5(x) { return x.toFixed(5); }

lugares.sort((a, b) => a.n.localeCompare(b.n, "en"));

// portón: los códigos de verso deben ser OSIS de la app
const rv = JSON.parse(fs.readFileSync("public/data/rv1909/_manifest.json", "utf8"));
const osisValidos = new Set(rv.libros.map((l) => l.osis));
const malos = new Set();
for (const l of lugares) for (const v of l.v) if (!osisValidos.has(v.split(".")[0])) malos.add(v);
if (malos.size) throw new Error(`Códigos no OSIS: ${[...malos].slice(0, 10).join(", ")}`);

fs.mkdirSync(SALIDA, { recursive: true });
fs.writeFileSync(
  `${SALIDA}/geo.json`,
  JSON.stringify({ fuente: "OpenBible.info Bible Geocoding · CC BY 4.0 (incluye datos de OpenStreetMap, ODbL)", lugares })
);

const manifiesto = {
  obra: "Bible Geocoding Data — OpenBible.info",
  licencia: "CC BY 4.0 · incluye datos de OpenStreetMap (ODbL)",
  fuente: "https://github.com/openbibleinfo/Bible-Geocoding-Data (data/ancient.jsonl)",
  crudo: "05. Datos/corpus_crudo/openbible_geo/",
  fecha_ingesta: "2026-09-29",
  idioma: "en",
  total_lugares: lugares.length,
  total_refs: refsTotales,
  descartados_sin_coordenada: sinCoordenada,
  formato: "geo.json único: lugares[{n, ll:[lat,lon], q (confianza 0-1000), t (tipo), v: refs OSIS}]",
};
fs.writeFileSync(`${SALIDA}/_manifest.json`, JSON.stringify(manifiesto, null, 2), "utf8");

const mb = (fs.statSync(`${SALIDA}/geo.json`).size / 1048576).toFixed(2);
console.log(`Lugares: ${lugares.length} · refs: ${refsTotales} · sin coordenada (descartados): ${sinCoordenada.length} · tamaño: ${mb} MB`);
if (malos.size) console.log(`⚠ códigos no OSIS: ${[...malos].join(", ")}`);
