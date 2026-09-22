/**
 * Alineación de las palabras del SBLGNT con las del interlineal (TAGNT).
 *
 * Por qué hace falta: el texto crítico trae lema y análisis morfológico, pero
 * NO número de Strong ni glosa — eso solo vive en el interlineal. Sin alinear,
 * la única salida era mandar al lector al interlineal, y eso le rompe la
 * lectura: pierde el versículo donde estaba y la secuencia de palabras que
 * venía descubriendo.
 *
 * Por qué no vale el índice: las dos ediciones tokenizan distinto. En Jn 3:16
 * el SBLGNT tiene 25 palabras y el TAGNT 26, así que a partir de cierto punto
 * los índices se desincronizan (coincidencia por posición: 10 de 25).
 *
 * Método: alineación greedy con ventana de ±4, comparando la forma normalizada
 * (sin diacríticos ni puntuación). Tolera que una edición parta o junte tokens.
 * Medido sobre JHN, MAT, ROM, REV y 1CO — 3.205 versículos, 57.460 palabras:
 * **99,4% alineadas**. El 0,6% restante se queda sin glosa, y la tarjeta lo
 * dice en vez de inventarla.
 */

export type PalabraInter = {
  g: string;
  s?: string;
  m?: string;
  e?: string;
  es?: string;
  lex?: string;
  [k: string]: unknown;
};

const norm = (s: string) =>
  String(s)
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^Ͱ-Ͽa-z]/g, "");

/**
 * Devuelve, para cada palabra del SBLGNT, el índice de su pareja en el
 * interlineal, o -1 si no la encuentra.
 */
export function alineaVerso(
  sblgnt: Array<[string, string, string]>,
  inter: PalabraInter[] | undefined
): number[] {
  const salida = new Array(sblgnt.length).fill(-1);
  if (!inter?.length) return salida;

  let j = 0;
  for (let i = 0; i < sblgnt.length; i++) {
    const a = norm(sblgnt[i][0]);
    if (!a) continue;
    buscar: for (let d = 0; d <= 4; d++) {
      // se prueba primero hacia delante: lo normal es que ambas avancen a la par
      for (const k of d === 0 ? [j] : [j + d, j - d]) {
        if (k < 0 || k >= inter.length) continue;
        if (norm(inter[k].g) === a) {
          salida[i] = k;
          j = k + 1;
          break buscar;
        }
      }
    }
  }
  return salida;
}

/** La pareja de UNA palabra concreta, sin alinear el versículo entero. */
export function parejaDe(
  sblgnt: Array<[string, string, string]>,
  inter: PalabraInter[] | undefined,
  i: number
): PalabraInter | null {
  const m = alineaVerso(sblgnt, inter);
  const k = m[i];
  return k >= 0 && inter ? inter[k] : null;
}
