/**
 * Descifrador de códigos morfológicos MorphGNT (los que trae el SBLGNT).
 *
 * El SBLGNT usa un esquema POSICIONAL distinto al de TAGNT/STEPBible, así que
 * la tabla `morfologia/codigos-griego-es.json` no le sirve: allí los códigos
 * son de la forma `A-APF`, aquí son `N-----NSM-` o `V-3AAI-S--`.
 *
 * Como el esquema es posicional y está documentado, se descifra con una tabla
 * fija: es determinista, gratis y no necesita ninguna llamada a un modelo.
 *
 * Formato (10 posiciones):
 *   1      parte de la oración
 *   2      persona (verbos)
 *   3      tiempo (verbos)
 *   4      voz (verbos)
 *   5      modo (verbos)
 *   6      caso (nominales)
 *   7      número
 *   8      género
 *   9      grado
 *   10     (sin uso)
 * Un guion significa «no aplica».
 */

const PARTE: Record<string, string> = {
  N: "sustantivo",
  V: "verbo",
  A: "adjetivo",
  D: "adverbio",
  C: "conjunción",
  P: "preposición",
  I: "interjección",
  X: "partícula",
  RA: "artículo",
  RD: "pronombre demostrativo",
  RI: "pronombre interrogativo/indefinido",
  RP: "pronombre personal",
  RR: "pronombre relativo",
};
const PERSONA: Record<string, string> = { "1": "1ª persona", "2": "2ª persona", "3": "3ª persona" };
const TIEMPO: Record<string, string> = {
  P: "presente", I: "imperfecto", F: "futuro", A: "aoristo",
  X: "perfecto", Y: "pluscuamperfecto",
};
const VOZ: Record<string, string> = { A: "activa", M: "media", P: "pasiva" };
const MODO: Record<string, string> = {
  I: "indicativo", D: "imperativo", S: "subjuntivo", O: "optativo",
  N: "infinitivo", P: "participio",
};
const CASO: Record<string, string> = {
  N: "nominativo", G: "genitivo", D: "dativo", A: "acusativo", V: "vocativo",
};
const NUMERO: Record<string, string> = { S: "singular", P: "plural", D: "dual" };
const GENERO: Record<string, string> = { M: "masculino", F: "femenino", N: "neutro" };
const GRADO: Record<string, string> = { C: "comparativo", S: "superlativo" };

/** Devuelve el análisis en español, o el código crudo si no se reconoce. */
export function morfGntEs(codigo: string): string {
  if (!codigo) return "";
  const c = codigo.replace(/-+$/, "");
  // el artículo y los pronombres ocupan DOS caracteres en la primera posición
  const doble = codigo.slice(0, 2);
  const parte = PARTE[doble] ?? PARTE[codigo[0]];
  if (!parte) return codigo;

  const p = codigo.padEnd(10, "-");
  const partes: string[] = [parte];
  const anade = (tabla: Record<string, string>, ch: string) => {
    const v = tabla[ch];
    if (v) partes.push(v);
  };

  anade(PERSONA, p[2]);
  anade(TIEMPO, p[3]);
  anade(VOZ, p[4]);
  anade(MODO, p[5]);
  anade(CASO, p[6]);
  anade(NUMERO, p[7]);
  anade(GENERO, p[8]);
  anade(GRADO, p[9]);

  return partes.length > 1 ? partes.join(" · ") : `${parte}${c.length > 1 ? "" : ""}`;
}

/** Etiqueta corta para el renglón bajo la palabra (sin la parte de la oración). */
export function morfGntCorta(codigo: string): string {
  const completa = morfGntEs(codigo);
  const trozos = completa.split(" · ");
  return trozos.length > 1 ? trozos.slice(1).join(" · ") : "";
}
