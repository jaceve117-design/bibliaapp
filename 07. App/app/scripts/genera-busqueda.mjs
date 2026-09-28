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
const OBRAS = ['rv1909', 'vbl'];

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
