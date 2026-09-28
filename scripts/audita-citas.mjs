/**
 * P.1 Paso 1 — AUDITORÍA DE CITAS BÍBLICAS: qué citas reales de las obras
 * NO detecta el lector (RE_CITA + parseCita de lib/referencias.ts).
 *
 * Método: por cada obra, se recorren sus textos; se marcan los tramos que
 * RE_CITA captura y se buscan CANDIDATOS de cita con patrones amplios que
 * queden FUERA de esos tramos. Los candidatos se agrupan por forma y se
 * reportan por frecuencia con ejemplos.
 *
 * Salida: 05. Datos/auditoria-citas.md
 * Uso: node scripts/audita-citas.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { RE_CITA } from "../07. App/app/lib/referencias.ts";

const DATA = path.join(process.cwd(), "07. App", "app", "public", "data");

/** Obras a auditar: [carpeta, lectorDeTextos] — el lector devuelve {ref, texto} por unidad. */
function parrafosHenry(dir) {
  return (osis, j) => {
    const out = [];
    for (const [cap, bloque] of Object.entries(j.c ?? {})) {
      const secciones = Array.isArray(bloque) ? bloque : bloque.s ?? [];
      secciones.forEach((s, i) => (s.p ?? []).forEach((p, pi) => out.push({ ref: `${osis}.${cap}.s${i}.${pi}`, texto: p })));
    }
    return out;
  };
}
function parrafosAnclas(dir) {
  return (osis, j) => {
    const out = [];
    for (const [cap, anclas] of Object.entries(j.c ?? {})) {
      (anclas ?? []).forEach((a) => (a.p ?? []).forEach((p, pi) => out.push({ ref: `${osis}.${cap}.${a.v}.${pi}`, texto: p })));
    }
    return out;
  };
}
function entradasEaston(dir) {
  return (osis, j) =>
    Object.entries(j.entradas ?? {}).map(([slug, e]) => ({ ref: `${osis}:${slug}`, texto: `${e.n ?? ""}. ${e.d ?? ""}` }));
}
function naveObras(dir) {
  // nave/{OSIS}.json = { versos: { "c.v": [slugs] }, raw } — el texto está en _temas.json (nombres);
  // los versos solo referencian temas: se audita el texto de los NOMBRES de tema
  const temas = JSON.parse(fs.readFileSync(path.join(dir, "_temas.json"), "utf8")).temas ?? {};
  return Object.entries(temas).map(([slug, nombre]) => ({ ref: `NAVE:${slug}`, texto: String(nombre) }));
}

const OBRAS = [
  ["henry", parrafosHenry()],
  ["henry-es", parrafosHenry()],
  ["jfb", parrafosAnclas()],
  ["jfb-es", parrafosAnclas()],
  ["barnes", parrafosAnclas()],
  ["barnes-es", parrafosAnclas()],
  ["easton", entradasEaston()],
  ["easton-es", entradasEaston()],
  ["valdes", parrafosAnclas()],
];

/** ¿El tramo [desde, hasta) queda dentro de alguna captura de RE_CITA? */
function cubierto(desde, hasta, capturas) {
  return capturas.some((c) => c.desde <= desde && hasta <= c.hasta);
}

const STOP = new Set("a al el la los las lo un una unos unas de del y e o u en por para con sin se su sus le les que en por con sin no si es era fue al".split(" "));

// formas de cita candidata y su categoría
const CLASES = [
  { id: "número+nombre", re: /(?:^|[^a-záéíóúñ0-9])([1-3]\s?[A-ZÁÉÍÓÚÑ][a-záéíóúñ]{1,9}\.?\s?\d{1,3}(?::\d{1,3})?)/g },
  { id: "nombre+solo-capítulo", re: /(?:^|[^a-záéíóúñ0-9])([A-ZÁÉÍÓÚÑ][a-záéíóúñ]{1,9}\.?\s\d{1,3})(?::\d{1,3})?/g },
  { id: "interna-ver", re: /(?:^|[^a-záéíóúñ0-9])((?:ver\.?|v\.?|vv\.?|vers\.?)\s?\d{1,3}(?:\s?[-–—]\s?\d{1,3})?)/gi },
  { id: "interna-cap", re: /(?:^|[^a-záéíóúñ0-9])((?:cap\.?|capítulo|ch\.?)\s?\d{1,3})/gi },
  { id: "elíptica", re: /(?:^|[^0-9])(\d{1,3}:\d{1,3}(?:\s?[,;]\s?\d{1,3}(?::\d{1,3})?)*)/g },
];

const informes = {}; // formaId → { clase, clave, n, ejemplos: [] }
const porObra = {};

function registra(clase, clave, obra, ref, texto, tramo) {
  (porObra[obra] ??= { total: 0 });
  porObra[obra].total++;
  const id = `${clase}::${clave.toLowerCase()}`;
  informes[id] ??= { clase, clave, n: 0, ejemplos: [] };
  informes[id].n++;
  if (informes[id].ejemplos.length < 3) informes[id].ejemplos.push({ obra, ref, tramo: tramo.slice(0, 90) });
}

for (const [obra, lector] of OBRAS) {
  const dir = path.join(DATA, obra);
  if (!fs.existsSync(dir)) { console.log(`⊘ ${obra}: sin carpeta`); continue; }
  let unidades = 0;
  for (const f of fs.readdirSync(dir).sort()) {
    if (!f.endsWith(".json") || f.startsWith("_")) continue;
    const osis = f.replace(".json", "");
    const j = JSON.parse(fs.readFileSync(path.join(dir, f), "utf8"));
    for (const { ref, texto } of lector(osis, j)) {
      unidades++;
      const capturas = [];
      for (const m of String(texto).matchAll(RE_CITA)) {
        const desde = m.index ?? 0;
        capturas.push({ desde, hasta: desde + m[0].length });
      }
      for (const clase of CLASES) {
        for (const m of texto.matchAll(clase.re)) {
          const tramo = m[1];
          const desde = (m.index ?? 0) + (m[0].indexOf(tramo));
          const hasta = desde + tramo.length;
          if (cubierto(desde, hasta, capturas)) continue;
          // clave: la palabra o el patrón
          let clave = tramo.replace(/[\d.,;:\s–—-]+$/g, "").trim();
          if (clase.id === "elíptica") clave = "c:v desnudo (hereda libro)";
          if (clase.id.startsWith("interna")) clave = clase.id;
          if (clase.id !== "elíptica" && !clase.id.startsWith("interna")) {
            const palabra = clave.replace(/^([1-3]\s?)/, "").toLowerCase();
            if (STOP.has(palabra)) continue;
          }
          registra(clase.id, clave || tramo, obra, ref, texto, tramo);
        }
      }
    }
  }
  console.log(`✓ ${obra}: ${unidades} unidades`);
}

// ——— informe ———
const orden = Object.values(informes).sort((a, b) => b.n - a.n);
let md = `# Auditoría de citas bíblicas (P.1 Paso 1)\n\nFecha: ${new Date().toISOString().slice(0, 10)}\n\n`;
md += `Objetivo: formas de cita que RE_CITA NO captura, por frecuencia. Las formas raras (n=1-2) rara vez valen una regla.\n\n`;
md += `## Totales por obra\n\n| obra | candidatos sin capturar |\n|---|---|\n`;
for (const [obra, d] of Object.entries(porObra).sort((a, b) => b[1].total - a[1].total)) md += `| ${obra} | ${d.total} |\n`;
md += `\n## Formas sin capturar, por frecuencia\n\n`;
let i = 0;
for (const f of orden) {
  i++;
  if (f.n < 3 && i > 60) continue; // el informe completo llega hasta 60 formas; el resto son n<3
  md += `### ${i}. [${f.clase}] «${f.clave}» — ${f.n} veces\n\n`;
  for (const e of f.ejemplos) md += `- ${e.obra} ${e.ref}: …${e.tramo}…\n`;
  md += `\n`;
}
fs.mkdirSync("05. Datos", { recursive: true });
fs.writeFileSync("05. Datos/auditoria-citas.md", md);
console.log(`\nInforme: 05. Datos/auditoria-citas.md — ${orden.length} formas distintas`);
const top = orden.slice(0, 12).map((f) => `${f.clave}×${f.n}`).join(" · ");
console.log("Top 12:", top);
