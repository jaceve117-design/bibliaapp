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
  perfil: 'glosa',
  nombre: 'Glosas ES del interlineal y el léxico (TAHOT/TAGNT · TBESH/TBESG)',
  dirEs: RUTA_STEP,

  // lotes cortos: 400 glosas en una peticion es pedirle al modelo que pierda el hilo
  lote: { charsPorLote: 1200, maxUnidadesPorLote: 60 },

  // ⚠ Este prompt DEBE llevar ortografía española completa. Una versión anterior
  // se escribió sin tildes (por esquivar un problema de escapes al generarlo) y
  // el modelo imitó el estilo: 669 glosas salieron sin tilde —«despues», «asi»,
  // «Jehova», y «creo» por «creó», que cambia persona y tiempo. El lote antiguo,
  // con prompt acentuado, tenía cero. El modelo copia cómo le escribes.
  prompt: `Eres lexicógrafo bíblico. Traduces al español GLOSAS de un interlineal
hebreo/griego: NO son frases, son la equivalencia breve de una palabra del original.

REGLAS:
1. Devuelve una GLOSA, no una explicación. «father» da «padre», nunca
   «el progenitor masculino de alguien».
2. Conserva la forma gramatical del inglés: «and he said» da «y dijo»;
   «of the man» da «del hombre»; «to love» da «amar»; «he created» da «creó».
3. Conserva los paréntesis y su contenido: «(Jerusalem) Is There» da
   «(Jerusalén) Está Allí».
4. Nombres propios en forma castellana consolidada: Aaron → Aarón,
   Jehovah → Jehová, Moses → Moisés, Joseph → José, Pharaoh → Faraón.
5. «LORD» en versalitas del AT es el Nombre divino: da «Jehová».
6. Sin comillas, sin corchetes, sin punto final si el original no lo lleva.
7. Si la glosa inglesa es ambigua, elige el sentido más común en el AT/NT.
8. La glosa es SIEMPRE inglés, aunque parezca una palabra española. FALSOS AMIGOS:
   «sin» = pecado (nunca «sin» ni «sin embargo»); «come» = venir/ven (nunca «comer»);
   «once» = una vez; «son» = hijo; «ten» = diez; «pan» = sartén; «dice» = dados;
   «mar» = estropear; «fin» = aleta; «pie» = pastel; «vale» = valle; «red» = rojo.
9. ORTOGRAFÍA ESPAÑOLA COMPLETA, con todas sus tildes y eñes: día, así, después,
   corazón, allí, también, Jehová, Moisés. En los verbos la tilde decide persona y
   tiempo: «creó» (él, pasado) no es «creo» (yo, presente); «habló», «tomó», «llamó».

SALIDA: sólo el JSON {"u":[{"id":"...","es":"..."}]}, mismos id, mismo orden.
JSON COMPACTO en una sola línea, sin sangrías ni saltos: cada espacio cuesta.`,

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

// ── Nombres de tema de Nave's ──────────────────────────────────────────────
// 5.321 títulos de tema ("AARON", "BACKSLIDING", "JEHOVAH-JIREH"…). Unidades de
// 1-4 palabras: perfil glosa (prompt propio, lotes cortos, validaGlosa).
// Salida: nave/_temas-es.json (slug → nombre ES); el lector cae al slug si falta.
const RUTA_TEMAS = path.join(DATA, 'nave', '_temas.json');
const RUTA_TEMAS_ES = path.join(DATA, 'nave', '_temas-es.json');

const naves = {
  id: 'naves',
  perfil: 'glosa',
  nombre: "Nombres de tema de Nave's Topical Bible (1896)",
  dirEs: path.join(DATA, 'nave'),

  lote: { charsPorLote: 1200, maxUnidadesPorLote: 60 },

  prompt: `Eres lexicógrafo bíblico. Traduces al español los NOMBRES DE TEMA de la
Biblia topical de Nave: son títulos de tema, no frases.

REGLAS:
1. Nombres propios de persona y lugar en su forma castellana consolidada:
   AARON → Aarón, MOSES → Moisés, JERUSALEM → Jerusalén, MOAB → Moab.
2. El Nombre divino «JEHOVAH» (y sus compuestos con guion) es «Jehová»:
   JEHOVAH-JIREH → Jehová-jireh, JEHOVAH-NISSI → Jehová-nisi.
3. Temas comunes se traducen como sustantivo normal con mayúscula inicial:
   BACKSLIDING → Apostasía, PRAYER → Oración, FEASTS → Fiestas.
4. Conserva los guiones y su posición: CROSS, THE → Cruz, la (los temas con
   inversión «X, THE» invierten igual: «The Cross» → «La Cruz»).
5. Sin comillas, sin corchetes, sin punto final. Mayúscula inicial, el resto
   en minúscula salvo nombres propios internos (Monte de Sion).
6. Si el título trae aclaración entre paréntesis, tradúcela también.
7. ORTOGRAFÍA ESPAÑOLA COMPLETA, con todas sus tildes y eñes.

SALIDA: sólo el JSON {"u":[{"id":"...","es":"..."}]}, mismos id, mismo orden.
JSON COMPACTO en una sola línea, sin sangrías ni saltos: cada espacio cuesta.`,

  unidades(filtro = {}) {
    const t = leer(RUTA_TEMAS).temas ?? {};
    const es = fs.existsSync(RUTA_TEMAS_ES) ? (leer(RUTA_TEMAS_ES).temas ?? {}) : {};
    const out = [];
    for (const [slug, nombre] of Object.entries(t)) {
      const n = String(nombre ?? '').trim();
      if (!n || es[slug]) continue; // sin nombre o ya traducido
      out.push({ id: `naves.${slug}`, obra: 'naves', clave: slug, en: n });
    }
    return out.map((u) => ({ ...u, h: hash(u.en), chars: u.en.length }));
  },

  ensambla(estado) {
    const t = leer(RUTA_TEMAS).temas ?? {};
    const previo = fs.existsSync(RUTA_TEMAS_ES) ? (leer(RUTA_TEMAS_ES).temas ?? {}) : {};
    const temas = { ...previo };
    let nuevas = 0, posibles = 0;
    for (const slug of Object.keys(t)) {
      posibles++;
      const r = estado.resultados.get(`naves.${slug}`);
      if (r && r.es && ['traducida', 'auditada', 'aprobada'].includes(r.estado)) {
        temas[slug] = r.es;
        nuevas++;
      }
    }
    fs.writeFileSync(
      RUTA_TEMAS_ES,
      JSON.stringify({
        _meta: {
          obra: this.nombre,
          licencia: 'Traducción propia CC BY 4.0 (B18) · obra original de dominio público',
          revisado_humano: false,
          origen: 'motor automático (sin revisar)',
          fecha: new Date().toISOString().slice(0, 10),
          temas: nuevas,
        },
        temas,
      })
    );
    return { escritos: 1, unidades: nuevas, posibles };
  },
};

// ── Comentarios EN por anclas (JFB, Barnes, …) ─────────────────────────────
// Esquema compartido: {osis, fuente, c: {cap: [{v, p: [párrafos]}]}} — el mismo
// que produce la ingesta. Unidades = párrafos no vacíos; id estable por posición
// (`jfb.JHN.3.14.2` = ancla 14, párrafo 2). Salida ES espejo: los párrafos aún
// sin traducir van como "" y el lector cae al EN párrafo a párrafo.
const comentarioEn = (id, nombre, fuente) => ({
  id,
  nombre,
  dirEn: path.join(DATA, id),
  dirEs: path.join(DATA, `${id}-es`),

  async unidades(filtro = {}) {
    const out = [];
    const libros = fs.readdirSync(this.dirEn)
      .filter((f) => f.endsWith('.json') && !f.startsWith('_'))
      .sort();
    for (const f of libros) {
      const osis = f.replace('.json', '');
      if (filtro.libro && osis !== filtro.libro) continue;
      const j = leer(path.join(this.dirEn, f));
      for (const [cap, anclas] of Object.entries(j.c ?? {})) {
        anclas.forEach((a, ai) => {
          (a.p ?? []).forEach((parrafo, pi) => {
            const en = String(parrafo ?? '').trim();
            if (!en) return;
            out.push({ id: `${id}.${osis}.${cap}.${ai}.${pi}`, obra: id, osis, cap: Number(cap), ai, pi, en });
          });
        });
      }
    }
    return out.map((u) => ({ ...u, h: hash(u.en), chars: u.en.length }));
  },

  ensambla(estado, filtro = {}) {
    fs.mkdirSync(this.dirEs, { recursive: true });
    const libros = fs.readdirSync(this.dirEn)
      .filter((f) => f.endsWith('.json') && !f.startsWith('_'))
      .sort();
    let escritos = 0, unidades = 0, posibles = 0;

    for (const f of libros) {
      const osis = f.replace('.json', '');
      if (filtro.libro && osis !== filtro.libro) continue;
      const j = leer(path.join(this.dirEn, f));
      const caps = {};
      let hay = 0;
      for (const [cap, anclas] of Object.entries(j.c ?? {})) {
        const salidas = anclas.map((a, ai) => ({
          v: a.v,
          p: (a.p ?? []).map((parrafo, pi) => {
            const en = String(parrafo ?? '').trim();
            if (!en) return parrafo;
            posibles++;
            const r = estado.resultados.get(`${id}.${osis}.${cap}.${ai}.${pi}`);
            if (r && r.es && r.h === hash(en) && ['traducida', 'auditada', 'aprobada'].includes(r.estado)) {
              unidades++;
              hay++;
              return r.es;
            }
            return '';
          }),
        }));
        if (salidas.some((s) => s.p.some(Boolean))) caps[cap] = salidas;
      }
      if (!hay) continue;
      fs.writeFileSync(
        path.join(this.dirEs, `${osis}.json`),
        JSON.stringify({ osis, fuente: `${fuente} · traducción ES: obra derivada propia, CC BY 4.0 (B18), sin revisar`, c: caps })
      );
      escritos++;
    }

    if (escritos) {
      const mf = {
        obra: nombre,
        osis_obra: id.toUpperCase(),
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
});

const jfb = comentarioEn(
  'jfb',
  'A Commentary, Critical and Explanatory, on the Whole Bible — Jamieson, Fausset y Brown (1871)',
  'JFB',
  'Jamieson, Fausset and Brown Commentary (1871) · Dominio público'
);

const barnes = comentarioEn(
  'barnes',
  'Notes on the New / Old Testament — Albert Barnes (1832–1872)',
  'Barnes',
  'Albert Barnes, Notes on the New / Old Testament (1832–1872) · Dominio público · texto original vía biblehub.com'
);

// ── Definiciones del léxico (TBESH/TBESG) ──────────────────────────────────
// Texto con MARCADO: <b>, <i>, <BR />, <ref='Luk.7.37'>Luk.7:37;</ref>, y
// tramos en griego y hebreo. No se le pide al modelo que respete nada de eso:
// se ENMASCARA. Cada etiqueta, referencia o tramo en lengua original se cambia
// por una ficha ⟦n⟧, el modelo traduce sólo la prosa inglesa, y al ensamblar se
// restituye. El validador exige las mismas fichas, una vez cada una: si falta o
// sobra una, la unidad se rechaza. Formato garantizado por construcción.
const RE_MASCARA = new RegExp(
  [
    "<ref='[^']*'>[\\s\\S]*?</ref>",                 // referencia completa
    '<[^>]+>',                                        // cualquier otra etiqueta
    '&[a-z]+;',                                       // entidades HTML
    // tramos en griego/hebreo, con espacios y signos internos entre palabras
    '[\\u0370-\\u03FF\\u1F00-\\u1FFF\\u0590-\\u05FF\\uFB1D-\\uFB4F]+' +
      "(?:[\\s.,·;'’()-]*[\\u0370-\\u03FF\\u1F00-\\u1FFF\\u0590-\\u05FF\\uFB1D-\\uFB4F]+)*",
  ].join('|'),
  'g'
);

export function enmascara(texto) {
  const fichas = [];
  const t = String(texto).replace(RE_MASCARA, (m) => {
    fichas.push(m);
    return `⟦${fichas.length}⟧`;
  });
  return { t, fichas };
}

export function desenmascara(texto, fichas) {
  return String(texto).replace(/⟦(\d+)⟧/g, (m, n) => fichas[Number(n) - 1] ?? m);
}

const lexdef = {
  id: 'lexdef',
  nombre: 'Definiciones del léxico (TBESH/TBESG · Tyndale House)',
  // entradas de hasta 5.000+ chars: lotes pequeños, y las largas van solas
  lote: { charsPorLote: 3500, maxUnidadesPorLote: 8 },

  prompt: `Eres lexicógrafo bíblico y traduces al español las definiciones de un léxico
académico de hebreo y griego (TBESH/TBESG, Tyndale House; las griegas proceden de
Abbott-Smith). Escribes en español culto, claro y exacto, como un buen diccionario.

FICHAS: el texto trae marcas como ⟦1⟧, ⟦2⟧… que ocultan etiquetas, referencias
bíblicas y palabras en griego o hebreo. Consérvalas EXACTAMENTE, cada una una sola
vez, en el lugar que exija la sintaxis española. No las traduzcas, no las
renumeres, no las quites, no inventes otras.

REGLAS:
1. Traduce toda la prosa inglesa. Los significados («love, goodwill, esteem»)
   se traducen como acepciones de diccionario: «amor, buena voluntad, estima».
2. Terminología gramatical en español: noun → sustantivo, verb → verbo,
   prep → prep., with dative → con dativo, genitive → genitivo, aorist → aoristo,
   plural intensive → plural intensivo.
3. NO toques las abreviaturas bibliográficas ni de autoridades: cf., al., cl., sq.,
   LXX, Heb., Lat., Gk., MM, VGT, LAE, Deiss., Thayer, Cremer, Lft., Hort, WH, RV, AV.
4. NO toques las transliteraciones (re.shit, ye.ho.vah): son pronunciación.
5. «LORD» (el Nombre divino) → «Jehová». «God» → «Dios».
6. Numeración de acepciones (1), 1a), __I., __2.) intacta.
7. Ortografía española completa, con todas sus tildes.
8. Una definición no se resume ni se amplía: todo lo que dice el inglés, nada más.

SALIDA: sólo el JSON {"u":[{"id":"...","es":"..."}]}, mismos id, mismo orden,
en una sola línea.`,

  async unidades(filtro = {}) {
    const out = [];
    for (const [pref, archivo] of [['H', 'tbesh.json'], ['G', 'tbesg.json']]) {
      if (filtro.lengua && filtro.lengua !== pref) continue;
      const lx = leer(path.join(RUTA_STEP, archivo));
      for (const [id, e] of Object.entries(lx.entradas ?? {})) {
        const d = String(e.d ?? '').trim();
        if (!d) continue;
        const { t } = enmascara(d);
        out.push({ id: `lexdef.${pref}.${id}`, obra: 'lexdef', lengua: pref, entrada: id, orig: d, en: t });
      }
    }
    let us = out.map((u) => ({ ...u, h: hash(u.orig), chars: u.en.length }));
    // muestra determinista para pilotos: variada en longitud, estable entre corridas
    if (filtro.muestra) {
      const n = Number(filtro.muestra);
      const porLengua = (l) => us.filter((u) => u.lengua === l).sort((a, b) => a.chars - b.chars);
      const escoge = (arr, k) => Array.from({ length: k }, (_, i) => arr[Math.floor(((i + 0.5) * arr.length) / k)]);
      us = [...escoge(porLengua('H'), Math.ceil(n / 2)), ...escoge(porLengua('G'), Math.floor(n / 2))];
    }
    return us;
  },

  /**
   * Un archivo por lengua: `lexdef-es-h.json` y `lexdef-es-g.json`, mapa
   * id de entrada → definición ES YA DESENMASCARADA (con su marcado original).
   * Separado de tbesh/tbesg porque esos los regenera la ingesta.
   */
  ensambla(estado) {
    let unidades = 0, posibles = 0, escritos = 0;
    for (const [pref, archivo] of [['H', 'tbesh.json'], ['G', 'tbesg.json']]) {
      const lx = leer(path.join(RUTA_STEP, archivo));
      const salida = {};
      for (const [id, e] of Object.entries(lx.entradas ?? {})) {
        const d = String(e.d ?? '').trim();
        if (!d) continue;
        posibles++;
        const r = estado.resultados.get(`lexdef.${pref}.${id}`);
        if (!r || !r.es || r.h !== hash(d)) continue;
        if (!['traducida', 'auditada', 'aprobada'].includes(r.estado)) continue;
        salida[id] = desenmascara(r.es, enmascara(d).fichas);
        unidades++;
      }
      if (!Object.keys(salida).length) continue;
      fs.writeFileSync(path.join(RUTA_STEP, `lexdef-es-${pref.toLowerCase()}.json`), JSON.stringify(salida));
      escritos++;
    }
    return { escritos, unidades, posibles };
  },
};

// ── Diccionario de W. W. Rand ──────────────────────────────────────────────
// Un solo archivo EN (public/data/rand/rand.json: {total, entradas: [{s, n, d}]})
// y un ES espejo (rand-es.json: {total, entradas: [{s, n, d}]}) con caída al EN
// por entrada. Modelo easton: unidades n + d con el prefijo de prosa por defecto.
const RUTA_RAND_EN = path.join(DATA, 'rand', 'rand.json');
const RUTA_RAND_ES = path.join(DATA, 'rand-es', 'rand-es.json');

const rand = {
  id: 'rand',
  nombre: "Diccionario bíblico de W. W. Rand (American Tract Society, 1859)",
  dirEs: path.join(DATA, 'rand-es'),

  async unidades() {
    const j = leer(RUTA_RAND_EN);
    const es = fs.existsSync(RUTA_RAND_ES) ? leer(RUTA_RAND_ES).entradas ?? {} : {};
    const out = [];
    for (const e of j.entradas ?? []) {
      if (e.n && e.n.trim() && !es[e.s]?.n) {
        out.push({ id: `rand.${e.s}.n`, obra: 'rand', slug: e.s, campo: 'n', en: e.n });
      }
      if (e.d && e.d.trim() && !es[e.s]?.d) {
        out.push({ id: `rand.${e.s}.d`, obra: 'rand', slug: e.s, campo: 'd', en: e.d });
      }
    }
    return out.map((u) => ({ ...u, h: hash(u.en), chars: u.en.length }));
  },

  ensambla(estado) {
    const j = leer(RUTA_RAND_EN);
    const previo = fs.existsSync(RUTA_RAND_ES) ? leer(RUTA_RAND_ES).entradas ?? [] : [];
    const previas = new Map(previo.map((e) => [e.s, e]));
    const entradas = [];
    let unidades = 0;
    for (const e of j.entradas ?? []) {
      const r = estado.resultados.get(`rand.${e.s}.n`);
      const rd = estado.resultados.get(`rand.${e.s}.d`);
      const okN = r && r.es && ['traducida', 'auditada', 'aprobada'].includes(r.estado);
      const okD = rd && rd.es && ['traducida', 'auditada', 'aprobada'].includes(rd.estado);
      if (!okN && !okD) continue;
      const previa = previas.get(e.s);
      entradas.push({
        s: e.s,
        n: okN ? r.es : previa?.n ?? '',
        d: okD ? rd.es : previa?.d ?? '',
      });
      unidades++;
    }
    fs.mkdirSync(path.dirname(RUTA_RAND_ES), { recursive: true });
    fs.writeFileSync(
      RUTA_RAND_ES,
      JSON.stringify({
        obra: this.nombre,
        licencia: 'Traducción propia CC BY 4.0 (B18) · obra original de dominio público',
        revisado_humano: false,
        origen: 'motor automático (sin revisar)',
        fecha: new Date().toISOString().slice(0, 10),
        total: entradas.length,
        entradas,
      })
    );
    return { escritos: 1, unidades, posibles: unidades };
  },
};

export const OBRAS = { henry, easton, glosas, naves, jfb, barnes, lexdef, rand };


export function obra(id) {
  const o = OBRAS[id];
  if (!o) throw new Error(`Obra desconocida: "${id}". Disponibles: ${Object.keys(OBRAS).join(', ')}`);
  return o;
}
