/**
 * Ingesta Biblia del Oso 1569 — «Sagradas Escrituras» (Basilea, 1569), dominio público.
 * Fuente: getbible.net v2, traducción `sse` — edición con ortografía actualizada
 * (Gn 1:1 «creó», no «crió» del original) → el nombre registrado es
 * «Biblia del Oso 1569 (ortografía actualizada)» según la regla 1.1 de la hoja de ruta.
 * La edición trae 66 libros SIN deuterocanónicos (se anota en el manifiesto).
 *
 * Uso: node scripts/ingesta-oso1569.mjs
 * Salida: public/data/oso1569/{OSIS}.json + _manifest.json (mismo formato que rv1909).
 */
import fs from "node:fs";
import path from "node:path";

const CRUDO = "../../05. Datos/corpus_crudo/oso1569";
const SALIDA = "public/data/oso1569";
const API = "https://api.getbible.net/v2/sse";
const PAUSA_MS = 900;

const rv = JSON.parse(fs.readFileSync("public/data/rv1909/_manifest.json", "utf8"));
const ORDEN = rv.libros.map((l) => ({ osis: l.osis, nombre: l.nombre }));

fs.mkdirSync(CRUDO, { recursive: true });
fs.mkdirSync(SALIDA, { recursive: true });

const libros = [];
const incidentes = [];
let totalVersos = 0;

for (let nr = 1; nr <= 66; nr++) {
  const meta = ORDEN[nr - 1];
  const crudoPath = path.join(CRUDO, `${nr}.json`);
  if (!fs.existsSync(crudoPath) || fs.statSync(crudoPath).size < 100) {
    const r = await fetch(`${API}/${nr}.json`);
    if (!r.ok) { incidentes.push({ osis: meta.osis, tipo: `descarga nr ${nr}: HTTP ${r.status}` }); continue; }
    fs.writeFileSync(crudoPath, await r.text());
    await new Promise((r2) => setTimeout(r2, PAUSA_MS));
  }
  const j = JSON.parse(fs.readFileSync(crudoPath, "utf8"));
  const versos = [];
  for (const cap of j.chapters ?? []) {
    for (const v of cap.verses ?? []) {
      const t = String(v.text ?? "").replace(/\s+/g, " ").trim();
      if (!t) continue;
      versos.push({ osis: `${meta.osis}.${v.chapter}.${v.verse}`, c: v.chapter, v: v.verse, t });
    }
  }
  const caps = new Set(versos.map((v) => v.c)).size;
  totalVersos += versos.length;
  libros.push({ osis: meta.osis, nombre: j.name ?? meta.nombre, caps, versos: versos.length });
  fs.writeFileSync(
    path.join(SALIDA, `${meta.osis}.json`),
    JSON.stringify({ osis: meta.osis, nombre: j.name ?? meta.nombre, versos })
  );
  // portón: capítulos vs rv1909 (informativo)
  const rvLibro = rv.libros.find((l) => l.osis === meta.osis);
  if (rvLibro && caps !== rvLibro.caps) incidentes.push({ osis: meta.osis, tipo: `capítulos ${caps} vs rv1909 ${rvLibro.caps}` });
  console.log(`${meta.osis}: ${versos.length} versos · ${caps} caps`);
}

const manifiesto = {
  obra: "Biblia del Oso 1569 (ortografía actualizada)",
  osis_obra: "OSO1569",
  licencia: "Dominio público (Basilea, 1569; autor fallecido 1569) · edición electrónica: getbible.net v2 (`sse`) con ortografía modernizada",
  fuente: "https://api.getbible.net/v2/sse/{1..66}.json (crudo en 05. Datos/corpus_crudo/oso1569/)",
  fecha_ingesta: new Date().toISOString().slice(0, 10),
  edicion: "Ortografía actualizada (Gn 1:1 «creó»; el original de 1569 escribe «crió»). Cotejo contra escaneos de archive.org pendiente de registrar como muestra verificada.",
  canon: "Protestante, 66 libros. SIN deuterocanónicos: la edición getbible no los trae (los intercalados del original de 1569 quedan fuera de esta edición electrónica).",
  idioma: "es",
  total_versos: totalVersos,
  incidentes,
  libros,
};
fs.writeFileSync(path.join(SALIDA, "_manifest.json"), JSON.stringify(manifiesto, null, 2), "utf8");
console.log(`\nOso 1569: ${libros.length} libros · ${totalVersos} versos · incidentes: ${incidentes.length}`);
