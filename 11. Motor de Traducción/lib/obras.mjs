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


// ── Glosas del léxico y del interlineal ────────────────────────────────────
// Dos dominios distintos en un solo overlay:
//   texto   → la glosa contextual del campo `e` del interlineal, por cadena exacta
//   lexico  → la glosa de diccionario por Strong canónico, para la ficha
//
// Perfil propio: son unidades de 1-6 palabras. El prompt de prosa y los
// validadores de párrafo no valen aquí y harían daño (ver `validaGlosa`).
const RUTA_STEP = path.join(DATA, 'stepbible');
const RUTA_OVERLAY = path.join(RUTA_STEP, 'glosas-es.json');

const leerOverlay = () =>
  fs.existsSync(RUTA_OVERLAY) ? leer(RUTA_OVERLAY) : { texto: {}, textoG: {}, lexico: {}, lexicoG: {} };

const glosas = {
  id: 'glosas',
  nombre: 'Glosas ES del interlineal y el léxico (TAHOT/TAGNT · TBESH/TBESG)',
  dirEs: RUTA_STEP,

  // lotes cortos: 400 glosas en una peticion es pedirle al modelo que pierda el hilo
  lote: { charsPorLote: 1200, maxUnidadesPorLote: 60 },

  prompt: `Eres lexicografo biblico. Traduces al espanol GLOSAS de un interlineal
hebreo/griego: NO son frases, son la equivalencia breve de una palabra del original.

REGLAS:
1. Devuelve una GLOSA, no una explicacion. «father» da «padre», nunca
   «el progenitor masculino de alguien».
2. Conserva la forma gramatical del ingles: «and he said» da «y dijo»;
   «of the man» da «del hombre»; «to love» da «amar».
3. Conserva los parentesis y su contenido: «(Jerusalem) Is There» da
   «(Jerusalen) Esta Alli».
4. Nombres propios en forma castellana consolidada: Aaron/Aaron,
   Jehovah/Jehova, Moses/Moises.
5. «LORD» en versalitas del AT es el Nombre divino: da «Jehova».
6. Sin comillas, sin corchetes, sin punto final si el original no lo lleva.
7. Si la glosa inglesa es ambigua, elige el sentido mas comun en el AT/NT.

SALIDA: solo el JSON {"u":[{"id":"...","es":"..."}]}, mismos id, mismo orden.
JSON COMPACTO en una sola linea, sin sangrias ni saltos: cada espacio cuesta.`,

  /** Cadenas del interlineal y glosas de diccionario que aún no tienen ES. */
  async unidades(filtro = {}) {
    return this.derivar(filtro);
  },

  /**
   * Derivación SÍNCRONA. El ensamblador la necesita así para recuperar, desde
   * el id, la clave con la que escribir en el overlay (la cadena exacta o el
   * Strong). `unidades()` es async sólo porque Henry lo es.
   */
  derivar(filtro = {}) {
    const ov = leerOverlay();
    const out = [];
    const visto = new Set();

    const anadirTexto = (corpus, mapa, prefijo) => {
      const dir = path.join(RUTA_STEP, corpus);
      if (!fs.existsSync(dir)) return;
      const frec = new Map();
      for (const f of fs.readdirSync(dir)) {
        if (!f.endsWith('.json')) continue;
        const j = leer(path.join(dir, f));
        for (const palabras of Object.values(j.versos ?? {})) {
          for (const p of palabras) {
            if (p.es) continue;                       // ya viene en español de origen
            const e = String(p.e ?? '').trim();
            if (!e || mapa[e]) continue;              // vacía o ya traducida
            frec.set(e, (frec.get(e) ?? 0) + 1);
          }
        }
      }
      // por frecuencia: si la corrida se corta, lo hecho es lo que más se ve
      for (const [e] of [...frec.entries()].sort((a, b) => b[1] - a[1])) {
        const id = `${prefijo}.${hash(e)}`;
        if (visto.has(id)) continue;
        visto.add(id);
        out.push({ id, obra: 'glosas', dominio: prefijo, clave: e, en: e });
      }
    };

    const anadirLexico = (archivo, mapa, prefijo) => {
      const ruta = path.join(RUTA_STEP, archivo);
      if (!fs.existsSync(ruta)) return;
      const lx = leer(ruta);
      for (const [strong, ids] of Object.entries(lx.indice ?? {})) {
        if (mapa[strong]) continue;
        const e = String(lx.entradas?.[ids[0]]?.g ?? '').trim();
        if (!e) continue;
        const id = `${prefijo}.${strong}`;
        if (visto.has(id)) continue;
        visto.add(id);
        out.push({ id, obra: 'glosas', dominio: prefijo, clave: strong, en: e });
      }
    };

    if (!filtro.dominio || filtro.dominio === 'texto') anadirTexto('tahot', ov.texto ?? {}, 'texto');
    if (!filtro.dominio || filtro.dominio === 'textoG') anadirTexto('tagnt', ov.textoG ?? {}, 'textoG');
    if (!filtro.dominio || filtro.dominio === 'lexico') anadirLexico('tbesh.json', ov.lexico ?? {}, 'lexico');
    if (!filtro.dominio || filtro.dominio === 'lexicoG') anadirLexico('tbesg.json', ov.lexicoG ?? {}, 'lexicoG');

    return out.map((u) => ({ ...u, h: hash(u.en), chars: u.en.length }));
  },

  /** Vuelca lo traducido sobre el overlay, SIN pisar lo que ya había. */
  ensambla(estado, filtro = {}) {
    const ov = leerOverlay();
    for (const k of ['texto', 'textoG', 'lexico', 'lexicoG']) ov[k] ??= {};

    let nuevas = 0, posibles = 0;
    // se rederivan las unidades para recuperar la clave (cadena o Strong) del id
    const pendientes = this.derivar(filtro);
    for (const u of pendientes) {
      posibles++;
      const r = estado.resultados.get(u.id);
      if (!r || !r.es || r.h !== u.h) continue;
      if (!['traducida', 'auditada', 'aprobada'].includes(r.estado)) continue;
      ov[u.dominio][u.clave] = r.es.trim();
      nuevas++;
    }

    ov._meta = {
      ...(ov._meta ?? {}),
      obra: this.nombre,
      licencia: 'Traducción propia CC BY 4.0 (B18) · sobre TBESH/TBESG CC BY 4.0 (Tyndale House)',
      revisado_humano: false,
      origen: 'motor automático (sin revisar)',
      fecha: new Date().toISOString().slice(0, 10),
      entradas: {
        texto: Object.keys(ov.texto).length,
        textoG: Object.keys(ov.textoG).length,
        lexico: Object.keys(ov.lexico).length,
        lexicoG: Object.keys(ov.lexicoG).length,
      },
    };
    fs.writeFileSync(RUTA_OVERLAY, JSON.stringify(ov));
    return { escritos: 1, unidades: nuevas, posibles };
  },
};

export const OBRAS = { henry, easton, glosas };


export function obra(id) {
  const o = OBRAS[id];
  if (!o) throw new Error(`Obra desconocida: "${id}". Disponibles: ${Object.keys(OBRAS).join(', ')}`);
  return o;
}
