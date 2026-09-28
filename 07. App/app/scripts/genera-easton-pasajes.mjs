/**
 * Easton «en vivo»: índice inverso versículo → entradas del diccionario que lo citan.
 *
 * Uso: node --experimental-strip-types scripts/genera-easton-pasajes.mjs
 *
 * Easton es un diccionario, no un comentario verso a verso; pero cada entrada
 * cita pasajes («Aarón … (Ex 6:20)»). Invertir esas citas da, para cada
 * versículo, las entradas que hablan de él, y el lector lo muestra en el mismo
 * selector que Henry, JFB y Barnes.
 *
 * Cada párrafo es «Titular — oración que contiene la cita». La entrada completa
 * se abre desde el diccionario; aquí va la oración pertinente, no un resumen.
 *
 * Citas elípticas: Easton escribe «(Ex 6:20) … (2:1, 4; 7:7)», donde la
 * segunda hereda el libro de la anterior. El analizador del lector no las
 * resuelve (en un comentario serían ambiguas); aquí sí, porque en una entrada
 * de diccionario el libro vigente es inequívoco.
 *
 * Salida: public/data/easton-pasajes/{OSIS}.json (EN) y easton-pasajes-es/{OSIS}.json (ES),
 * con la forma de JSON de los comentarios: {osis, fuente, c:{cap:[{v, p:[…]}]}}.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const DATA = path.join(ROOT, 'public', 'data');
const { RE_CITA, parseCita } = await import(pathToFileURL(path.join(ROOT, 'lib', 'referencias.ts')).href);

// cita completa del lector | cita desnuda «c:v» con continuaciones «, v» o «; c:v»
const RE_TODO = new RegExp(`(${RE_CITA.source})|\\b(\\d{1,3}):(\\d{1,3})((?:\\s?[,;]\\s?\\d{1,3}(?::\\d{1,3})?)*)`, 'g');

function refsDe(texto) {
  const refs = [];
  let libro = null;
  for (const m of texto.matchAll(RE_TODO)) {
    if (m[1]) {
      const sub = [...m[1].matchAll(new RegExp(RE_CITA.source, 'g'))][0];
      const c = sub && parseCita(sub);
      if (c?.refs.length) {
        libro = c.refs[0].osis;
        for (const r of c.refs) refs.push({ ...r, idx: m.index });
      }
      continue;
    }
    // una cita desnuda sólo hereda libro si nada la precede como libro
    // («1P 1:1» con «1P» desconocido NO es la cita anterior)
    if (!libro || /[\p{L}]\.?\s?$/u.test(texto.slice(Math.max(0, m.index - 8), m.index))) continue;
    const i = m.length - 3;
    let cap = Number(m[i]);
    refs.push({ osis: libro, c: cap, v: Number(m[i + 1]), idx: m.index });
    for (const parte of (m[i + 2] ?? '').split(/[,;]/).map((s) => s.trim()).filter(Boolean)) {
      const [a, b] = parte.split(':');
      if (b) { cap = Number(a); refs.push({ osis: libro, c: cap, v: Number(b), idx: m.index }); }
      else refs.push({ osis: libro, c: cap, v: Number(a), idx: m.index });
    }
  }
  return refs.filter((r) => r.c > 0 && r.v > 0);
}

/** La oración que contiene la posición `idx`. */
function oracion(texto, idx) {
  const antes = texto.slice(0, idx);
  const ini = Math.max(antes.search(/[.!?]\s+[^.!?]*$/) + 1, 0);
  const fin = texto.slice(idx).search(/[.!?](\s|$)/);
  let o = texto.slice(ini, fin === -1 ? texto.length : idx + fin + 1).trim();
  if (o.length > 600) o = o.slice(0, 600).replace(/\s\S*$/, '') + ' …';
  return o;
}

function genera(carpetaDic, carpetaSalida, fuente, nombreDe) {
  const porLibro = {};
  let citas = 0;
  for (const f of fs.readdirSync(path.join(DATA, carpetaDic))) {
    if (!/^[a-z]\.json$/.test(f)) continue;
    const j = JSON.parse(fs.readFileSync(path.join(DATA, carpetaDic, f), 'utf8'));
    for (const [slug, e] of Object.entries(j.entradas ?? j)) {
      const texto = String(e.d ?? '').replace(/<[^>]+>/g, '');
      const vistos = new Set();
      for (const r of refsDe(texto)) {
        const k = `${r.osis}.${r.c}.${r.v}`;
        if (vistos.has(k)) continue;
        vistos.add(k);
        citas++;
        const lib = (porLibro[r.osis] ??= {});
        const cap = (lib[r.c] ??= {});
        (cap[r.v] ??= []).push(`${nombreDe(slug, e)} — ${oracion(texto, r.idx)}`);
      }
    }
  }
  const dir = path.join(DATA, carpetaSalida);
  fs.rmSync(dir, { recursive: true, force: true });
  fs.mkdirSync(dir, { recursive: true });
  for (const [osis, caps] of Object.entries(porLibro)) {
    const c = {};
    for (const [cap, versos] of Object.entries(caps)) {
      c[cap] = Object.keys(versos).map(Number).sort((a, b) => a - b).map((v) => ({ v: String(v), p: versos[v] }));
    }
    fs.writeFileSync(path.join(dir, `${osis}.json`), JSON.stringify({ osis, fuente, c }));
  }
  console.log(`✓ ${carpetaSalida}: ${Object.keys(porLibro).length} libros · ${citas} citas`);
}

// titular ES: el índice guarda la forma española en `e`
const indice = JSON.parse(fs.readFileSync(path.join(DATA, 'easton', '_indice.json'), 'utf8'));
const titularEs = new Map(indice.map((i) => [i.s, i.e ?? i.n]));

genera('easton', 'easton-pasajes', "Easton's Bible Dictionary (1897) · Dominio público · entradas que citan cada versículo", (s, e) => e.n ?? s);
genera('easton-es', 'easton-pasajes-es', 'Diccionario Easton · traducción ES: obra derivada propia, CC BY 4.0 (B18), sin revisar · entradas que citan cada versículo', (s, e) => titularEs.get(s) ?? e.n ?? s);
