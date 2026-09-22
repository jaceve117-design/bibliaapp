/**
 * Agrupación en lotes. El lote es sólo una unidad de EFICIENCIA de red;
 * la unidad de ESTADO sigue siendo la unidad individual. Por eso un lote
 * que vuelve mal no contamina: se reintentan sus unidades, una a una si hace falta.
 *
 * Nunca se mezclan capítulos en un lote: el contexto vecino ayuda al modelo.
 */
export function agrupa(unidades, { charsPorLote, maxUnidadesPorLote }) {
  const lotes = [];
  let actual = [], chars = 0, clave = null;
  const cerrar = () => { if (actual.length) lotes.push(actual); actual = []; chars = 0; };
  for (const u of unidades) {
    const k = `${u.osis}.${u.cap}`;
    if (k !== clave) { cerrar(); clave = k; }
    // una unidad que por sí sola excede el lote va sola
    if (u.chars >= charsPorLote) { cerrar(); lotes.push([u]); clave = null; continue; }
    if (chars + u.chars > charsPorLote || actual.length >= maxUnidadesPorLote) cerrar();
    actual.push(u); chars += u.chars;
  }
  cerrar();
  return lotes;
}
