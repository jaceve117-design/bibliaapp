// Diagnóstico de bytes + fijación del rango cruzado en RE_CITA.
import fs from "node:fs";

const f = "07. App/app/lib/referencias.ts";
const s = fs.readFileSync(f, "utf8").replace(/\r\n/g, "\n");
const j = s.indexOf(String.raw`(\\d{1,3}))?`);
console.log("índice:", j, "| segmento:", JSON.stringify(s.slice(j - 14, j + 16)));
console.log("codePoints:", Array.from(s.slice(j - 8, j + 2)).map((c) => c.codePointAt(0).toString(16)).join(" "));

const v = String.raw`(?:[-–—](\\d{1,3}))?`;
const n = String.raw`(?:[-–—](\\d{1,3}(?::\\d{1,3})?))?`;
const oc = s.split(v).length - 1;
console.log("ocurrencias del patrón viejo:", oc);
if (oc === 1) {
  fs.writeFileSync(f, s.split(v).join(n));
  console.log("✓ rango cruzado aplicado");
} else {
  console.log("✗ no se aplica");
}
