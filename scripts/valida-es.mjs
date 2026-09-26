/**
 * Validación de espejos ES de comentarios (jfb-es, barnes-es) y de henry-es.
 *   node scripts/valida-es.mjs jfb
 *   node scripts/valida-es.mjs barnes
 * Portón de calidad antes de desplegar cada paso:
 *   1. paridad estructural: misma nº de anclas y párrafos por capítulo que el EN
 *      (los párrafos ES vacíos = aún sin traducir, permitidos y contados)
 *   2. sonda de residuos de inglés sobre el texto ES ya traducido
 *   3. proporción de longitud ES/EN (sospecha de corte o condensación)
 */
import fs from "node:fs";
import path from "node:path";

const obra = process.argv[2];
if (!obra || !["jfb", "barnes", "henry"].includes(obra)) {
  console.error("uso: node scripts/valida-es.mjs jfb|barnes|henry");
  process.exit(1);
}
const DATA = path.join(process.cwd(), "07. App", "app", "public", "data");
const dirEn = path.join(DATA, obra === "henry" ? "henry" : obra);
const dirEs = path.join(DATA, obra === "henry" ? "henry-es" : `${obra}-es`);

// sospechosos clásicos del proyecto (bitácora: sonda de residuos) + construcciones EN puras.
// FRONTERA ESPAÑOLA: \b de JS es ASCII y_matchea dentro de «andáis/andéis» — se usa
// una clase explícita con acentos a ambos lados.
const L = "A-Za-zÁÉÍÓÚÜÑáéíóúüñ";
const borde = (w) => new RegExp(`(?<![${L}])${w}(?![${L}])`, "i");
const SOSPECHOSOS = [
  borde("herein"), borde("appoint"), borde("justices"), borde("utmost"),
  borde("denizens"), borde("outlawry"), borde("peevish"), borde("reintegro"), borde("asunder"),
  borde("baffl"), borde("attest"), borde("acquainted"), borde("apprehend"),
  borde("the"), borde("and"), / of the /i, / with the /i, / that the /i,
  /[\u4e00-\u9fff]/, // caracteres CJK sueltos
];

const libros = fs.readdirSync(dirEn).filter((f) => f.endsWith(".json") && !f.startsWith("_"));
// términos citados deliberadamente por el autor (fórmulas legales/latín) con glosa ES:
// no son residuos aunque contengan palabras inglesas
const PERMITIDOS = [/Oyer and Terminer/i];
// fuentes del impreso que vienen truncadas en el EN original (el ES las refleja fielmente;
// precedente: JN 18.2 idx20 de Henry). Formato: OSIS.cap.verso.párrafo
const FUENTE_TRUNCADA = new Set(["ROM.3.28.0"]);
let sinEs = 0, totalEn = 0, totalEs = 0, residuos = [], cortes = [], cortos = [];

// ¿el match cae dentro de una cita o título citado («[Pearson, Exposition of the Creed]»,
// «[N. del T.: «the God of this world»]»)? Son legítimos: obra citada EN se deja en EN.
const dentroDeCita = (t, i) => {
  const antes = t.slice(0, i);
  const abre = (antes.match(/[\[\(«“"]/g) || []).length;
  const cierra = (antes.match(/[\]\)»”"]/g) || []).length;
  return abre > cierra;
};
for (const f of libros) {
  const rutaEs = path.join(dirEs, f);
  if (!fs.existsSync(rutaEs)) { sinEs++; continue; }
  const en = JSON.parse(fs.readFileSync(path.join(dirEn, f), "utf8"));
  const es = JSON.parse(fs.readFileSync(rutaEs, "utf8"));
  const capsEn = en.c ?? en;
  const capsEs = es.c ?? es;
  for (const [cap, bloqueEn] of Object.entries(capsEn)) {
    const bloqueEs = capsEs[cap];
    if (!bloqueEs) continue; // capítulo sin nada traducido: permitido
    // henry: {r, s: [{t,v,p}]} · jfb/barnes: [{v, p}] — mismas dos formas de anclas
    const anclasEn = Array.isArray(bloqueEn) ? bloqueEn : bloqueEn.s ?? [];
    const anclasEs = Array.isArray(bloqueEs) ? bloqueEs : bloqueEs.s ?? [];
    if (anclasEs.length !== anclasEn.length) {
      cortes.push(`${f} cap ${cap}: anclas EN ${anclasEn.length} vs ES ${anclasEs.length}`);
      continue;
    }
    anclasEn.forEach((a, ai) => {
      const e = anclasEs[ai];
      if (!e) return;
      if (e.p.length !== a.p.length) {
        cortes.push(`${f} ${cap} ancla ${a.v}: párrafos EN ${a.p.length} vs ES ${e.p.length}`);
        return;
      }
      a.p.forEach((pEn, pi) => {
        const pEs = e.p[pi];
        if (!pEn || !String(pEn).trim()) return;
        totalEn++;
        if (!pEs || !String(pEs).trim()) { sinEs++; return; }
        totalEs++;
        if (PERMITIDOS.some((re) => re.test(pEs))) return;
        // frase-ancla del comentario impreso: JFB/Barnes citan el verso KJV en EN
        // ANTES de la raya y exponen en ES después — lo que cae antes de la primera
        // raya es la cita, legítimo por construcción
        const primeraRaya = pEs.indexOf("—");
        const esAncla = primeraRaya > 0;
        for (const re of SOSPECHOSOS) {
          const m = pEs.match(re);
          if (!m) continue;
          const i = m.index;
          if (esAncla && i < primeraRaya) continue;           // parte citada del ancla
          if (dentroDeCita(pEs, i)) continue;                 // título/obra citada
          residuos.push(`${f} ${cap}.${a.v}[${pi}]: ${m[0]}`);
          break;
        }
        const prop = pEs.length / pEn.length;
        if (prop < 0.45 && pEn.length > 350) cortos.push(`${f} ${cap}.${a.v}[${pi}]: ES ${pEs.length}/${pEn.length} chars`);
        // corte duro REAL: el EN cierra la frase y el ES se queda en palabra suelta.
        // Si el EN también acaba abierto (fuente truncada del impreso), el ES es fiel.
        // Si el ES acaba en puntuación (, ) » ") es estilo o cita, no corte.
        const enCierra = /[.!?"”’]$/.test(pEn.trim());
        const esPalabraSuelta = /[a-záéíóúñ]$/i.test(pEs.trim());
        if (pEs.length > 200 && esPalabraSuelta && enCierra && !FUENTE_TRUNCADA.has(`${f.replace(".json", "")}.${cap}.${a.v}.${pi}`))
          cortos.push(`${f} ${cap}.${a.v}[${pi}]: CORTE DURO («…${pEs.trim().slice(-25)}»)`);
      });
    });
  }
}

const pct = totalEn ? ((100 * totalEs) / totalEn).toFixed(1) : "0.0";
console.log(`== ${obra}-es ==`);
console.log(`párrafos EN: ${totalEn} · con ES: ${totalEs} (${pct}%) · sin traducir: ${sinEs}`);
console.log(`desalineaciones estructurales: ${cortes.length}${cortes.length ? "\n  " + cortes.slice(0, 10).join("\n  ") : ""}`);
console.log(`residuos de inglés sospechosos: ${residuos.length}${residuos.length ? "\n  " + residuos.slice(0, 12).join("\n  ") : ""}`);
console.log(`condensados sospechosos (<45% del EN): ${cortos.length}${cortos.length ? "\n  " + cortos.slice(0, 10).join("\n  ") : ""}`);
const ok = cortes.length === 0 && residuos.length === 0 && cortos.length === 0;
console.log(ok ? "PORTÓN VERDE" : `*** PORTÓN CON AVISOS (${cortes.length + residuos.length + cortos.length}) ***`);
