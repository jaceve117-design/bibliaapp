// Frontera de palabra unicode en RE_CITA (v2 con el escapado doble correcto).
import fs from "node:fs";

const p = "07. App/app/lib/referencias.ts";
let s = fs.readFileSync(p, "utf8").replace(/\r\n/g, "\n");

const v = String.raw`'\\b([1-3]\\s?)?('`;
const n = String.raw`'(?<![\p{L}\p{N}_])([1-3]\\s?)?('`;
const oc1 = s.split(v).length - 1;
console.log("ocurrencias borde:", oc1);
if (oc1 === 1) s = s.split(v).join(n);

const v2 = "  'g'\n);";
const n2 = "  'gu'\n);";
const oc2 = s.split(v2).length - 1;
console.log("ocurrencias bandera:", oc2);
if (oc2 === 1) s = s.split(v2).join(n2);

fs.writeFileSync(p, s);
console.log("hecho");
