/**
 * Genera public/data/cobertura.json — índice de qué recursos tienen contenido
 * para cada libro (OSIS) y capítulo. Alimenta el badge del lector («▦ n» sobre
 * la referencia): nº de recursos con datos para el capítulo que se está leyendo.
 *
 * Recursos contados (los que abren paneles de estudio del capítulo):
 *   henry · jfb · barnes · kd · vincent · valdes (comentarios por ancla)
 *   nave (temas por verso) · tsk (referencias cruzadas) · easton (pasajes del diccionario)
 *
 * Uso: node scripts/genera-cobertura.mjs
 */
import fs from "node:fs";
import path from "node:path";

const DATA = "public/data";
const COMENTARIOS = ["henry", "jfb", "barnes", "kd", "vincent", "valdes"];
const VERSO = ["nave", "tsk", "easton"];

// capítulos válidos por libro según la Biblia base (RV1909): el diccionario de
// Easton cita referencias imposibles (Génesis 66/79) y ensuciarían el badge
const capsValidos = {};
{
  const mf = JSON.parse(fs.readFileSync(path.join(DATA, "rv1909/_manifest.json"), "utf8"));
  for (const l of mf.libros) capsValidos[l.osis] = l.caps;
}

const capsDeComentario = (dir) => {
  if (!fs.existsSync(dir)) return null;
  const caps = new Set();
  for (const f of fs.readdirSync(dir)) {
    if (!f.endsWith(".json") || f.startsWith("_")) continue;
    const osis = f.replace(".json", "");
    let j;
    try { j = JSON.parse(fs.readFileSync(path.join(dir, f), "utf8")); } catch { continue; }
    for (const [cap, bloque] of Object.entries(j.c ?? {})) {
      // henry usa {r, s:[{t,v,p}]}; los demás, un array de anclas {v, p}
      const anclas = Array.isArray(bloque) ? bloque : bloque.s ?? [];
      if (anclas.some((a) => (a.p ?? []).some((p) => String(p ?? "").trim()))) caps.add(`${osis}.${cap}`);
    }
  }
  return caps;
};

const capsDeVerso = (dir, clave) => {
  if (!fs.existsSync(dir)) return null;
  const caps = new Set();
  for (const f of fs.readdirSync(dir)) {
    if (!f.endsWith(".json") || f.startsWith("_")) continue;
    const osis = f.replace(".json", "");
    let j;
    try { j = JSON.parse(fs.readFileSync(path.join(dir, f), "utf8")); } catch { continue; }
    for (const k of Object.keys(j[clave] ?? {})) {
      const cap = Number(String(k).split(".")[0]);
      if (cap > 0) caps.add(`${osis}.${cap}`);
    }
  }
  return caps;
};

const indices = {};
for (const r of COMENTARIOS) indices[r] = capsDeComentario(path.join(DATA, r));
indices.nave = capsDeVerso(path.join(DATA, "nave"), "versos");
indices.tsk = capsDeVerso(path.join(DATA, "tsk"), "refs");
indices.easton = capsDeComentario(path.join(DATA, "easton-pasajes"));

// salida compacta: por OSIS, por recurso, lista de caps con contenido
const salida = {};
for (const [r, caps] of Object.entries(indices)) {
  if (!caps) { console.log(`  · ${r}: sin datos, omitido`); continue; }
  for (const k of caps) {
    const [osis, capStr] = k.split(".");
    const cap = Number(capStr);
    if (cap > (capsValidos[osis] ?? 0)) continue; // cita imposible del diccionario: fuera
    ((salida[osis] ??= {})[r] ??= []).push(cap);
  }
}
// ordenar caps
for (const osis of Object.keys(salida))
  for (const r of Object.keys(salida[osis])) salida[osis][r].sort((a, b) => a - b);

fs.mkdirSync(DATA, { recursive: true });
fs.writeFileSync(
  path.join(DATA, "cobertura.json"),
  JSON.stringify({ generado: new Date().toISOString().slice(0, 10), recursos: Object.keys(indices).filter((r) => indices[r]), osis: salida })
);
const libros = Object.keys(salida).length;
const kb = (fs.statSync(path.join(DATA, "cobertura.json")).size / 1024).toFixed(1);
console.log(`cobertura.json: ${libros} libros · ${kb} KB · recursos: ${Object.keys(indices).filter((r) => indices[r]).join(", ")}`);
