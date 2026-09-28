/**
 * Índice de búsqueda de pasajes → public/data/busqueda/{obra}.json
 *
 * Uso: node scripts/genera-busqueda.mjs
 *
 * Un archivo por versión, compacto: una línea por versículo «OSIS.c.v|texto».
 * El lector lo descarga UNA vez, la primera vez que se busca, y busca en el
 * propio teléfono: sin servidor, sin coste por consulta y sin conexión.
 *
 * No se preprocesa la normalización aquí a propósito: el cliente la hace al
 * cargar (31.102 versos, milisegundos) y así el archivo sigue siendo texto
 * legible que se puede mostrar tal cual en los resultados.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.dirname(fileURLToPath(import.meta.url));
const DATA = path.join(ROOT, '..', 'public', 'data');
const OUT = path.join(DATA, 'busqueda');
const OBRAS = ['rv1909', 'oso1569', 'vbl'];

fs.mkdirSync(OUT, { recursive: true });

for (const obra of OBRAS) {
  const mf = JSON.parse(fs.readFileSync(path.join(DATA, obra, '_manifest.json'), 'utf8'));
  const lineas = [];
  for (const libro of mf.libros) {
    const j = JSON.parse(fs.readFileSync(path.join(DATA, obra, `${libro.osis}.json`), 'utf8'));
    for (const v of j.versos) {
      const t = String(v.t ?? '').replace(/\s+/g, ' ').trim();
      if (t) lineas.push(`${libro.osis}.${v.c}.${v.v}|${t}`);
    }
  }
  const salida = { obra, versos: lineas.length, v: lineas };
  fs.writeFileSync(path.join(OUT, `${obra}.json`), JSON.stringify(salida));
  const mb = (fs.statSync(path.join(OUT, `${obra}.json`)).size / 1024 / 1024).toFixed(2);
  console.log(`✓ ${obra}: ${lineas.length} versos · ${mb} MB`);
}

/* — Paso 3 del buscador: índices de COMENTARIOS Y RECURSOS —
   Líneas «ref|obra|texto» troceadas: cada archivo com-{obra}-{nn}.json pesa
   ~5 MB crudos (≈1,3 MB gzip en el cable), bajo el techo de ~3 MB gzip de la
   hoja de ruta. El manifiesto com-{obra}.json declara cuántos trozos hay.
   Versículos anclados: henry-es (ancla de sección; 0 = introducción),
   jfb-es y barnes-es (ancla de versículo). easton-es: entrada → titular +
   definición recortada (el titular abre el diccionario en la entrada).
   Nave's y el léxico quedan fuera: no son pasajes ni entradas del mismo tipo. */
const LIMITE_BYTES = 5 * 1024 * 1024;
const COM = [
  {
    archivo: "henry-es",
    leyendo: (osis, capClave, cap) =>
      (cap.s ?? []).flatMap((s) => (s.p ?? []).map((p) => ({ ref: `${osis}.${capClave}.${s.v ?? 0}`, texto: p }))),
  },
  {
    archivo: "jfb-es",
    leyendo: (osis, capClave, cap) =>
      (cap ?? []).flatMap((a) => (a.p ?? []).map((p) => ({ ref: `${osis}.${capClave}.${a.v}`, texto: p }))),
  },
  {
    archivo: "barnes-es",
    leyendo: (osis, capClave, cap) =>
      (cap ?? []).flatMap((a) => (a.p ?? []).map((p) => ({ ref: `${osis}.${capClave}.${a.v}`, texto: p }))),
  },
  {
    archivo: "easton-es",
    porLetra: true,
    leyendo: (osis, capClave, cap) =>
      Object.entries(cap.entradas ?? {}).map(([slug, e]) => ({
        ref: `E.${slug}`,
        texto: `${e.n}. ${String(e.d ?? "").replace(/\s+/g, " ").slice(0, 600)}`,
      })),
  },
];

for (const { archivo, porLetra, leyendo } of COM) {
  const dir = path.join(DATA, archivo);
  if (!fs.existsSync(dir)) { console.log(`⊘ ${archivo}: no existe, se salta`); continue; }
  const lineas = [];
  for (const f of fs.readdirSync(dir).sort()) {
    if (!f.endsWith(".json") || f.startsWith("_")) continue;
    const osis = f.replace(".json", "");
    const j = JSON.parse(fs.readFileSync(path.join(dir, f), "utf8"));
    const capitulos = porLetra ? [["", j]] : Object.entries(j.c ?? {});
    for (const [capClave, cap] of capitulos) {
      for (const { ref, texto } of leyendo(osis, capClave, cap)) {
        const t = String(texto ?? "").replace(/\s+/g, " ").trim();
        if (t.length >= 40) lineas.push(`${ref}|${archivo}|${t}`);
      }
    }
  }
  // troceado: un archivo por cada ~5 MB, con manifiesto que declara el total
  const trozos = [];
  let actual = [];
  let bytes = 0;
  for (const l of lineas) {
    actual.push(l);
    bytes += l.length + 1;
    if (bytes >= LIMITE_BYTES) { trozos.push(actual); actual = []; bytes = 0; }
  }
  if (actual.length) trozos.push(actual);
  trozos.forEach((t, i) => {
    fs.writeFileSync(
      path.join(OUT, `com-${archivo}-${String(i + 1).padStart(2, "0")}.json`),
      JSON.stringify({ obra: archivo, trozo: i + 1, de: trozos.length, v: t })
    );
  });
  fs.writeFileSync(
    path.join(OUT, `com-${archivo}.json`),
    JSON.stringify({ obra: archivo, entradas: lineas.length, trozos: trozos.length })
  );
  const mb = trozos.reduce((a, t) => a + t.reduce((b, l) => b + l.length, 0), 0) / 1024 / 1024;
  console.log(`✓ com-${archivo}: ${lineas.length} párrafos en ${trozos.length} trozos · ${mb.toFixed(1)} MB`);
}
