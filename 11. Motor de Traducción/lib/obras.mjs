/**
 * Registro de obras traducibles.
 *
 * Cada obra del corpus tiene su propio esquema JSON. En vez de un extractor
 * universal —que sería frágil y adivinaría— cada obra declara aquí tres cosas:
 *
 *   unidades()          → qué se traduce y con qué id estable
 *   ensambla(resueltas) → cómo se escribe el ES respetando el contrato del lector
 *   nucleo              → qué campos son prosa (para el glosario y los validadores)
 *
 * Añadir una obra nueva es añadir un objeto aquí. El motor, el estado, la
 * auditoría, la consola y el presupuesto no cambian.
 *
 * Los ids llevan prefijo de obra, así un único almacén de estado sirve para
 * todas sin colisiones: `GEN.1.p.0.1` (Henry) frente a `easton.a.aaron.d`.
 */
import fs from 'node:fs';
import path from 'node:path';
import { APP } from './rutas.mjs';
import { hash } from './unidades.mjs';

const DATA = path.join(APP, 'public', 'data');
const leer = (p) => JSON.parse(fs.readFileSync(p, 'utf8'));

// ── Henry ──────────────────────────────────────────────────────────────────
// Delega en el extractor original: es el camino ya probado y no se toca.
const henry = {
  id: 'henry',
  nombre: 'Matthew Henry, Complete Commentary (1706)',
  dirEn: path.join(DATA, 'henry'),
  dirEs: path.join(DATA, 'henry-es'),
  async unidades(filtro = {}) {
    const { colaCompleta, unidadesDeLibro } = await import('./unidades.mjs');
    const { config } = await import('../config.mjs');
    let us = filtro.libro ? unidadesDeLibro(filtro.libro) : colaCompleta(config.orden, [config.patronOro]);
    if (filtro.cap) us = us.filter((u) => u.cap === Number(filtro.cap));
    return us.map((u) => ({ ...u, obra: 'henry' }));
  },
};

// ── Easton ─────────────────────────────────────────────────────────────────
// Esquema: {letra, entradas: {slug: {n: titular, d: definición, r: [refs]}}}
// Se traducen `n` (titular, en forma castellana consolidada) y `d` (definición).
// `r` son referencias en nombre completo inglés: es mapeo mecánico, no traducción,
// y no se manda al modelo.
const easton = {
  id: 'easton',
  nombre: "Easton's Bible Dictionary (1897)",
  dirEn: path.join(DATA, 'easton'),
  dirEs: path.join(DATA, 'easton-es'),

  async unidades(filtro = {}) {
    const letras = fs.readdirSync(this.dirEn)
      .filter((f) => f.endsWith('.json') && !f.startsWith('_'))
      .map((f) => f.replace('.json', ''))
      .sort();
    const out = [];
    for (const letra of letras) {
      if (filtro.letra && letra !== filtro.letra) continue;
      const j = leer(path.join(this.dirEn, `${letra}.json`));
      for (const [slug, e] of Object.entries(j.entradas ?? {})) {
        if (e.n && e.n.trim()) {
          out.push({ id: `easton.${letra}.${slug}.n`, obra: 'easton', letra, slug, campo: 'n', en: e.n });
        }
        if (e.d && e.d.trim()) {
          out.push({ id: `easton.${letra}.${slug}.d`, obra: 'easton', letra, slug, campo: 'd', en: e.d });
        }
      }
    }
    return out.map((u) => ({ ...u, h: hash(u.en), chars: u.en.length }));
  },

  ensambla(estado, filtro = {}) {
    fs.mkdirSync(this.dirEs, { recursive: true });
    const letras = fs.readdirSync(this.dirEn)
      .filter((f) => f.endsWith('.json') && !f.startsWith('_'))
      .map((f) => f.replace('.json', ''));
    let escritos = 0, unidades = 0, posibles = 0;

    for (const letra of letras) {
      if (filtro.letra && letra !== filtro.letra) continue;
      const j = leer(path.join(this.dirEn, `${letra}.json`));
      const salida = { letra, entradas: {} };
      let hay = 0;

      for (const [slug, e] of Object.entries(j.entradas ?? {})) {
        // el ES conserva SIEMPRE las referencias del original: no las traduce
        const fila = { n: '', d: '', r: e.r ?? [] };
        for (const campo of ['n', 'd']) {
          if (!e[campo]) continue;
          posibles++;
          const r = estado.resultados.get(`easton.${letra}.${slug}.${campo}`);
          if (r && r.es && r.h === hash(e[campo]) && ['traducida', 'auditada', 'aprobada'].includes(r.estado)) {
            fila[campo] = r.es;
            hay++; unidades++;
          }
        }
        // solo entra la entrada con algo traducido; el lector cae al EN si falta
        if (fila.n || fila.d) salida.entradas[slug] = fila;
      }

      if (!hay) continue;
      fs.writeFileSync(path.join(this.dirEs, `${letra}.json`), JSON.stringify(salida));
      escritos++;
    }

    if (escritos) {
      const mf = {
        obra: this.nombre,
        licencia: 'Traducción propia CC BY 4.0 (B18) · obra original de dominio público',
        revisado_humano: false,
        origen: 'motor automático (sin revisar)',
        fecha: new Date().toISOString().slice(0, 10),
        archivos: escritos,
        unidades_traducidas: unidades,
        unidades_total: posibles,
      };
      fs.writeFileSync(path.join(this.dirEs, '_manifest.json'), JSON.stringify(mf, null, 2));
    }
    return { escritos, unidades, posibles };
  },
};

export const OBRAS = { henry, easton };

export function obra(id) {
  const o = OBRAS[id];
  if (!o) throw new Error(`Obra desconocida: "${id}". Disponibles: ${Object.keys(OBRAS).join(', ')}`);
  return o;
}
