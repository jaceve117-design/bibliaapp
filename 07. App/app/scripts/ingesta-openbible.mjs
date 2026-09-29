/**
 * Ingesta OpenBible.info Cross-References (CC BY) → public/data/openbible/refs.json
 *
 * Formato fuente (TSV): From Verse \t To Verse \t Votes
 *   «Gen.1.1  \t  Prov.8.22-Prov.8.30  \t  76»
 * Los To Verse pueden traer varios destinos separados por «|» y rangos con guion.
 *
 * Salida: un índice compacto por versículo origen, destinos ordenados por votos:
 *   { total: N, v: { "GEN.1.1": "PRO.8.22-PRO.8.30;Ps.115.15" } }
 * (el lector muestra los destinos como chips de referencia; expandir el rango
 *  que cruza capítulo lo hace el clic, no el índice).
 *
 * Uso: node scripts/ingesta-openbible.mjs
 */
import fs from "node:fs";

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
const aOsis = (ref) => {
  // los rangos («Mt 5:18-6:2» llegan como «Matt.5.18-Matt.6.2») se convierten por partes
  return String(ref)
    .split('-')
    .map((parte) => {
      const partes = parte.split('.');
      const osis = OSIS_DE[partes[0]];
      return osis ? osis + '.' + partes.slice(1).join('.') : null;
    })
    .filter(Boolean)
    .join('-');
};

const bruto = fs.readFileSync("../../05. Datos/corpus_crudo/openbible/cross_references.txt", "utf8");
const lineas = bruto.split(/\r?\n/).filter((l) => l.trim() && !/^From Verse/i.test(l));

const porOrigen = new Map(); // osisOrigen → Array<{ destino, votos }>
let descartadas = 0;
for (const l of lineas) {
  const [from, to, votosStr] = l.split('\t');
  const votos = Number(votosStr);
  const origen = aOsis(from);
  const destino = aOsis(to);
  if (!origen || !destino || !Number.isFinite(votos)) { descartadas++; continue; }
  if (!porOrigen.has(origen)) porOrigen.set(origen, []);
  porOrigen.get(origen).push({ destino, votos });
}

// por verso: destinos ordenados por votos, join compacto
const v = {};
let conRefs = 0;
for (const [origen, lista] of porOrigen) {
  lista.sort((a, b) => b.votos - a.votos);
  v[origen] = lista.map((x) => x.destino).join(';');
  conRefs++;
}

fs.mkdirSync("public/data/openbible", { recursive: true });
fs.writeFileSync(
  "public/data/openbible/refs.json",
  JSON.stringify({ obra: "OpenBible.info Cross-References (CC BY)", total: conRefs, v })
);
console.log(`versos origen con refs: ${conRefs} · líneas descartadas: ${descartadas}`);
const mb = (fs.statSync("public/data/openbible/refs.json").size / 1048576).toFixed(2);
console.log(`tamaño: ${mb} MB`);
