/**
 * P.1 Paso 4 — pruebas de regresión de la detección de citas.
 * Ejecuta scripts/casos-citas.json contra segmentarPorCitas y exige que cada
 * referencia esperada APAREZCA (las de más sobran y no fallan). Falla con
 * código 1 si algún caso no cumple: se ejecuta antes de cada despliegue.
 * Uso: node scripts/prueba-citas.mjs
 */
import fs from "node:fs";
import { segmentarPorCitas } from "../07. App/app/lib/referencias.ts";

const j = JSON.parse(fs.readFileSync(new URL("./casos-citas.json", import.meta.url), "utf8"));
let ok = 0;
const fallas = [];
for (const caso of j.casos) {
  const refs = segmentarPorCitas(caso.t)
    .filter((s) => s.tipo === "cita" && s.cita)
    .flatMap((s) => s.cita.refs.map((r) => `${r.osis}.${r.c}.${r.v}`));
  const faltan = caso.esperadas.filter((e) => !refs.includes(e));
  if (faltan.length === 0) ok++;
  else fallas.push(`«${caso.t}» esperaba ${caso.esperadas.join(", ")} → obtuvo ${refs.join(", ") || "nada"} (faltó: ${faltan.join(", ")})`);
}
console.log(`Casos de citas: ${ok}/${j.casos.length} ok`);
if (fallas.length) {
  console.error(fallas.map((f) => "  FALLA: " + f).join("\n"));
  process.exit(1);
}
