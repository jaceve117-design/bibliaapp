/**
 * Detección y resolución de citas bíblicas dentro de textos de comentarios.
 * Regla D22: toda cita en un comentario es interactiva — el verso se lee a mano, sin salir del comentario.
 * Entiende abreviaturas EN (Henry: Joh, Ps, Pr, Ge, Re…) y ES (Jn, Sal, Pr, Gn, Ap…).
 */

export type RefOsis = { osis: string; c: number; v: number };

const MAPA: Record<string, string> = {
  // — AT —
  Gen: 'GEN', Gn: 'GEN', Exo: 'EXO', Ex: 'EXO', Lev: 'LEV', Lv: 'LEV', Num: 'NUM', Nm: 'NUM',
  Deu: 'DEU', Deut: 'DEU', Dt: 'DEU', Josh: 'JOS', Jos: 'JOS', Judg: 'JDG', Jdg: 'JDG', Jue: 'JDG',
  Rut: 'RUT', Ruth: 'RUT', Rt: 'RUT', '1Sa': '1SA', '2Sa': '2SA', '1Sam': '1SA', '2Sam': '2SA',
  '1S': '1SA', '2S': '2SA', '1Ki': '1KI', '2Ki': '2KI', '1Kgs': '1KI', '2Kgs': '2KI', '1R': '1KI',
  '2R': '2KI', '1Ch': '1CH', '2Ch': '2CH', '1Chr': '1CH', '2Chr': '2CH', '1Cr': '1CH', '2Cr': '2CH',
  Ezr: 'EZR', Ezra: 'EZR', Esd: 'EZR', Neh: 'NEH', Est: 'EST', Esth: 'EST', Job: 'JOB',
  Psa: 'PSA', Psal: 'PSA', Ps: 'PSA', Sal: 'PSA', Prov: 'PRO', Pro: 'PRO', Pr: 'PRO',
  Eccl: 'ECC', Ecc: 'ECC', Ecl: 'ECC', Sng: 'SNG', Song: 'SNG', Cant: 'SNG', Isa: 'ISA', Is: 'ISA',
  Jer: 'JER', Lam: 'LAM', Lm: 'LAM', Eze: 'EZK', Ezek: 'EZK', Ezk: 'EZK', Ez: 'EZK', Dan: 'DAN',
  Dn: 'DAN', Hos: 'HOS', Os: 'HOS', Joe: 'JOL', Joel: 'JOL', Jl: 'JOL', Amo: 'AMO', Amos: 'AMO',
  Am: 'AMO', Oba: 'OBA', Obad: 'OBA', Abd: 'OBA', Jon: 'JON', Jonah: 'JON', Mic: 'MIC', Miq: 'MIC',
  Nam: 'NAM', Nah: 'NAM', Hab: 'HAB', Zep: 'ZEP', Zeph: 'ZEP', Sof: 'ZEP', Hag: 'HAG', Hg: 'HAG',
  Zec: 'ZEC', Zech: 'ZEC', Zac: 'ZEC', Mal: 'MAL', Ml: 'MAL',
  // — NT —
  Matt: 'MAT', Mat: 'MAT', Mt: 'MAT', Mrk: 'MRK', Mark: 'MRK', Mar: 'MRK', Mr: 'MRK',
  Luk: 'LUK', Lc: 'LUK', Jhn: 'JHN', Joh: 'JHN', Jn: 'JHN', Act: 'ACT', Acts: 'ACT', Hch: 'ACT',
  Rom: 'ROM', Ro: 'ROM', Rm: 'ROM', '1Co': '1CO', '1Cor': '1CO', '2Co': '2CO', '2Cor': '2CO',
  Gal: 'GAL', Gá: 'GAL', Eph: 'EPH', Ef: 'EPH', Phil: 'PHP', Php: 'PHP', Fil: 'PHP',
  Col: 'COL', '1Th': '1TH', '1Thess': '1TH', '1Ts': '1TH', '2Th': '2TH', '2Thess': '2TH',
  '2Ts': '2TH', '1Ti': '1TI', '1Tim': '1TI', '2Ti': '2TI', '2Tim': '2TI', Tit: 'TIT',
  Titus: 'TIT', Phm: 'PHM', Phlm: 'PHM', Flm: 'PHM', Heb: 'HEB', Jas: 'JAS', Stg: 'JAS',
  '1Pe': '1PE', '1Pet': '1PE', '1P': '1PE', '2Pe': '2PE', '2Pet': '2PE', '2P': '2PE',
  '1Jn': '1JN', '1John': '1JN', '1Jo': '1JN', '2Jn': '2JN', '2Jo': '2JN', '2John': '2JN',
  '3Jn': '3JN', '3Jo': '3JN', '3John': '3JN', Jud: 'JUD', Jude: 'JUD', Jd: 'JUD',
  Rev: 'REV', Ap: 'REV', Apoc: 'REV',
  // — P.1 (auditoria-citas.md): abreviaturas y formas que RE_CITA no capturaba —
  // numeradas con espacio («1 Co 9:1», «2 Sam 7:12», «1 Ts 2:5»…): el motor de
  // traducción y Usoz las escriben así. Las ambiguas van también a AMBIGUOS.
  '1 Co': '1CO', '2 Co': '2CO', '1 Cor': '1CO', '2 Cor': '2CO',
  '1 Sam': '1SA', '2 Sam': '2SA', '1 Chr': '1CH', '2 Chr': '2CH', '1 Chron': '1CH', '2 Chron': '2CH',
  '1 Ts': '1TH', '2 Ts': '2TH', '1 Tes': '1TH', '2 Tes': '2TH',
  '1 Reyes': '1KI', '2 Reyes': '2KI', '1 Ped': '1PE', '2 Ped': '2PE',
  '1 Pe': '1PE', '2 Pe': '2PE', '1 Cr': '1CH', '2 Cr': '2CH', '1 S': '1SA', '2 S': '2SA',
  He: 'HEB', Da: 'DAN', Tt: 'TIT', Ga: 'GAL', Mi: 'MIC', Nú: 'NUM',
  Ne: 'NEH', Ho: 'HOS', Ec: 'ECC', Ti: '1TI', Mk: 'MRK', So: 'ZEP', Núm: 'NUM',
  '1 Corintios': '1CO', '2 Corintios': '2CO', '1 Cor.': '1CO', '2 Cor.': '2CO',
  '1 Tesalonicenses': '1TH', '2 Tesalonicenses': '2TH',
  // abreviaturas sueltas ausentes
  Lu: 'LUK', Ac: 'ACT', Ge: 'GEN', Re: 'REV', Nu: 'NUM', Chr: '1CH',
  // nombres completos en español
  Isaías: 'ISA', Salmo: 'PSA', Salmos: 'PSA', Génesis: 'GEN', Éxodo: 'EXO', Deuteronomio: 'DEU',
  Levítico: 'LEV', Números: 'NUM', Josué: 'JOS', Jueces: 'JDG', Esdras: 'EZR', Nehemías: 'NEH',
  Ester: 'EST', Proverbios: 'PRO', Eclesiastés: 'ECC', Cantares: 'SNG', Jeremías: 'JER',
  Lamentaciones: 'LAM', Ezequiel: 'EZK', Oseas: 'HOS', Amós: 'AMO', Jonás: 'JON', Miqueas: 'MIC',
  Nahúm: 'NAM', Habacuc: 'HAB', Sofonías: 'ZEP', Hageo: 'HAG', Zacarías: 'ZEC', Malaquías: 'MAL',
  Mateo: 'MAT', Marcos: 'MRK', Lucas: 'LUK', Hechos: 'ACT', Romanos: 'ROM', Gálatas: 'GAL',
  Efesios: 'EPH', Filipenses: 'PHP', Colosenses: 'COL', Tito: 'TIT', Filemón: 'PHM',
  Hebreos: 'HEB', Santiago: 'JAS', Judas: 'JUD', Apocalipsis: 'REV',
  // — Nombres ingleses COMPLETOS —
  // Easton cita así («Genesis 25:26», «1 Chronicles 12»), y sin estas claves
  // ninguna de sus 504 formas de referencia era enlazable.
  Genesis: 'GEN', Exodus: 'EXO', Leviticus: 'LEV', Numbers: 'NUM',
  Deuteronomy: 'DEU', Joshua: 'JOS', Judges: 'JDG', Esther: 'EST',
  Psalms: 'PSA', Psalm: 'PSA', Proverbs: 'PRO', Ecclesiastes: 'ECC',
  Isaiah: 'ISA', Jeremiah: 'JER', Lamentations: 'LAM', Ezekiel: 'EZK',
  Daniel: 'DAN', Hosea: 'HOS', Obadiah: 'OBA', Micah: 'MIC',
  Nahum: 'NAM', Habakkuk: 'HAB', Zephaniah: 'ZEP', Haggai: 'HAG',
  Zechariah: 'ZEC', Malachi: 'MAL', Nehemiah: 'NEH',
  Matthew: 'MAT', Romans: 'ROM', Galatians: 'GAL', Ephesians: 'EPH',
  Philippians: 'PHP', Colossians: 'COL', Philemon: 'PHM',
  Hebrews: 'HEB', James: 'JAS', Revelation: 'REV', Luke: 'LUK', John: 'JHN',
  'Song of Solomon': 'SNG', 'Song of Songs': 'SNG',
  // numerados: la clave lleva el número, porque parseCita resuelve por el
  // nombre capturado y «Chronicles» a secas es ambiguo
  '1 Samuel': '1SA', '2 Samuel': '2SA', '1 Kings': '1KI', '2 Kings': '2KI',
  '1 Chronicles': '1CH', '2 Chronicles': '2CH',
  '1 Corinthians': '1CO', '2 Corinthians': '2CO',
  '1 Thessalonians': '1TH', '2 Thessalonians': '2TH',
  '1 Timothy': '1TI', '2 Timothy': '2TI', '1 Peter': '1PE', '2 Peter': '2PE',
  '1 John': '1JN', '2 John': '2JN', '3 John': '3JN',
};

const CLAVES = Object.keys(MAPA).sort((a, b) => b.length - a.length).map((k) => k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));

// Cada verso extra lleva un lookahead: «Lc 24:48; 1 Ts 2:5» NO es Lc 24:48 y
// 24:1 — ese «1» es el número del libro siguiente. Sin él se inventaba una
// cita y se perdía la verdadera (medido en Easton: «Jn 7:35; 1P 1:1»).
/** Cita: "Jn 1:1-5", "1Co 1:6,2:1", "Mal 3:1", "Isa 40:12,28"… (con o sin punto, con o sin espacio). */
export const RE_CITA = new RegExp(
  '(?<![\p{L}\p{N}_])([1-3]\\s?)?(' + CLAVES.join('|') + ')\\.?\\s?(\\d{1,3})(?::(\\d{1,3}))?((?:[,;]\\s?(?![1-3]\\s?[A-ZÁÉÍÓÚ])\\d{1,3}(?::\\d{1,3})?)*)(?:[-–—](\\d{1,3}(?::\\d{1,3})?))?',
  'gu'
);

export type Cita = { etiqueta: string; refs: RefOsis[] };

/**
 * Libros con hermanos numerados. Si la cita trae un número delante, el nombre
 * a secas NO puede resolverla: «1 John 2:2» tiene que dar 1JN, nunca JHN.
 */
const AMBIGUOS = new Set([
  'Samuel', 'Kings', 'Chronicles', 'Corinthians', 'Thessalonians',
  'Timothy', 'Peter', 'John',
  'Sam', 'Chr', 'Chron', 'Cor', 'Thess', 'Ts', 'Tes', 'Cor', 'Reyes', 'Ped', 'Tesalonicenses',
]);

/** Convierte una cita detectada (cadena completa) en coordenadas OSIS. */
export function parseCita(match: RegExpMatchArray): Cita | null {
  const [etiqueta, prefijo, libro, capStr, vStr, extras, rangoHasta] = match;
  const pref = prefijo ? prefijo.trim() : '';
  const osis = pref
    ? MAPA[pref + libro] ?? MAPA[`${pref} ${libro}`] ?? (AMBIGUOS.has(libro) ? undefined : MAPA[libro])
    : MAPA[libro];
  if (!osis) return null;
  const c = Number(capStr);
  const v = Number(vStr ?? '1');
  if (!Number.isFinite(c) || c === 0) return null;
  const refs: RefOsis[] = [];
  const empujar = (vv: number) => refs.push({ osis, c, v: vv });
  empujar(v);
  // lista con comas/point: "40:12,28" o "1:6,2:1"
  if (extras) {
    const partes = extras.split(/[,;]/).map((s) => s.trim()).filter(Boolean);
    for (const parte of partes) {
      const [c2, v2] = parte.split(':');
      if (v2) {
        refs.push({ osis, c: Number(c2), v: Number(v2) });
      } else if (Number(c2)) {
        empujar(Number(c2));
      }
    }
  }
  // rango con guion en el último verso: "1:1-5" — y el que cruza capítulo: "5:18-6:2"
  if (rangoHasta && refs.length === 1) {
    const cruzado = rangoHasta.split(':');
    if (cruzado.length === 2) {
      // «5:18-6:2»: se emite el ancla (5:18) y los versos explícitos del capítulo destino
      // (6:1…6:2) — el largo exacto del capítulo inicial lo sabe el lector, no parseCita
      const hC = Number(cruzado[0]);
      const hV = Number(cruzado[1]);
      if (hC > c && hC - c <= 3 && hV >= 1) {
        for (let vv = 1; vv <= hV && refs.length < 40; vv++) refs.push({ osis, c: hC, v: vv });
      }
    } else {
      const hasta = Number(rangoHasta);
      if (Number.isFinite(hasta) && hasta > v && hasta - v <= 12) {
        for (let vv = v + 1; vv <= hasta; vv++) empujar(vv);
      }
    }
  }
  return { etiqueta, refs };
}

/** Envuelve un párrafo: devuelve segmentos [texto | cita] con la cita ya parseada. */
export function segmentarPorCitas(texto: string): Array<{ tipo: 'texto' | 'cita'; contenido: string; cita?: Cita }> {
  const salida: Array<{ tipo: 'texto' | 'cita'; contenido: string; cita?: Cita }> = [];
  let ultimo = 0;
  for (const m of texto.matchAll(RE_CITA)) {
    const idx = m.index ?? 0;
    if (idx > ultimo) salida.push({ tipo: 'texto', contenido: texto.slice(ultimo, idx) });
    salida.push({ tipo: 'cita', contenido: m[0], cita: parseCita(m) ?? undefined });
    ultimo = idx + m[0].length;
  }
  if (ultimo < texto.length) salida.push({ tipo: 'texto', contenido: texto.slice(ultimo) });

  // — P.1: herencia elíptica — «(Ex 6:20) … (2:1, 4; 7:7)»: un grupo desnudo «c:v, v; c:v»
  // que sigue de cerca a una cita capturada HEREDA su libro. Sólo si el segmento de texto
  // entre ambas es casi puro separador (paréntesis, comas, espacios).
  const RE_GRUPO_DESNUDO =
    /^[\s;,()]*(\d{1,3}):(\d{1,3})((?:\s?[,;]\s?\d{1,3}(?::\d{1,3})?)*)[\s;,)]*$/;
  for (let i = 1; i < salida.length; i++) {
    const seg = salida[i];
    if (seg.tipo !== 'texto' || seg.contenido.length > 60) continue;
    const previa = salida[i - 1];
    if (previa.tipo !== 'cita' || !previa.cita || !previa.cita.refs.length) continue;
    const m = seg.contenido.match(RE_GRUPO_DESNUDO);
    if (!m) continue;
    const base = previa.cita.refs[previa.cita.refs.length - 1];
    const refs: RefOsis[] = [];
    const partes = (m[1] + ":" + m[2] + m[3]).split(/[,;]/).map((x) => x.trim()).filter(Boolean);
    let capCorriente = base.c; // los versos desnudos del grupo heredan el capítulo EN CURSO del grupo
    for (const parte of partes) {
      const [cStr, vStr] = parte.split(':');
      const c2 = vStr !== undefined ? Number(cStr) : capCorriente;
      const v2 = vStr !== undefined ? Number(vStr) : Number(cStr);
      if (Number.isFinite(c2) && Number.isFinite(v2) && c2 >= 1 && v2 >= 1) {
        refs.push({ osis: base.osis, c: c2, v: v2 });
        capCorriente = c2;
      }
    }
    if (!refs.length) continue;
    // trocear el segmento: [texto inicial][cita heredada][texto final]
    const idx = seg.contenido.search(/\d/);
    const pre = seg.contenido.slice(0, idx).replace(/[(\s]+$/, '');
    const post = seg.contenido.slice(seg.contenido.search(/[),;.]\s*$|\)$/)).length ? '' : '';
    salida.splice(i, 1,
      { tipo: 'texto', contenido: pre },
      { tipo: 'cita', contenido: m[0].trim(), cita: { etiqueta: m[0].trim(), refs } },
      { tipo: 'texto', contenido: '' }
    );
    i += 1;
  }
  return salida;
}
