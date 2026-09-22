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

/** Cita: "Jn 1:1-5", "1Co 1:6,2:1", "Mal 3:1", "Isa 40:12,28"… (con o sin punto, con o sin espacio). */
export const RE_CITA = new RegExp(
  '\\b([1-3]\\s?)?(' + CLAVES.join('|') + ')\\.?\\s?(\\d{1,3})(?::(\\d{1,3}))?((?:[,;]\\s?\\d{1,3}(?::\\d{1,3})?)*)(?:[-–—](\\d{1,3}))?',
  'g'
);

export type Cita = { etiqueta: string; refs: RefOsis[] };

/**
 * Libros con hermanos numerados. Si la cita trae un número delante, el nombre
 * a secas NO puede resolverla: «1 John 2:2» tiene que dar 1JN, nunca JHN.
 */
const AMBIGUOS = new Set([
  'Samuel', 'Kings', 'Chronicles', 'Corinthians', 'Thessalonians',
  'Timothy', 'Peter', 'John',
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
  // rango con guion en el último verso: "1:1-5"
  if (rangoHasta && refs.length === 1) {
    const hasta = Number(rangoHasta);
    if (Number.isFinite(hasta) && hasta > v && hasta - v <= 12) {
      for (let vv = v + 1; vv <= hasta; vv++) empujar(vv);
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
  return salida;
}
