// Reemplaza el rango del RE_CITA para que cruce capítulos («5:18-6:2»).
// En archivo (no -e) porque el escapado entre capas bash/node se perdía.
import fs from "node:fs";

const p = "07. App/app/lib/referencias.ts";
let s = fs.readFileSync(p, "utf8").replace(/\r\n/g, "\n");
const v = String.raw`(?:[-–—](\d{1,3}))?`;
const n = String.raw`(?:[-–—](\d{1,3}(?::\d{1,3})?))?`;
const oc = s.split(v).length - 1;
console.log("ocurrencias rango:", oc);
if (oc !== 1) {
  console.log("aborta: la ocurrencia esperada no está");
  process.exit(1);
}
s = s.split(v).join(n);
fs.writeFileSync(p, s);
console.log("rango cruzado aplicado");
