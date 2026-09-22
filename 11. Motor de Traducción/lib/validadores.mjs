/**
 * CAPA 1 — validación determinista. Gratis y EXACTA.
 * Atrapa la mayoría de los fallos reales sin gastar un solo token.
 * Regla de disciplina: lo que un regex resuelve con certeza NO se le pregunta
 * a un modelo, por barato que sea.
 */
import { verificaGlosario } from './glosario.mjs';
import { normalizaReferencias } from './referencias.mjs';

// "Joh 3:16", "1 Cor 13:4-7", "Gen 1:1,2", y sus formas ES "Jn 3:16"
const RE_REF = /\b(?:[1-3]\s?)?[A-ZÁÉÍÓÚ][a-záéíóúü]{1,11}\.?\s\d{1,3}:\d{1,3}(?:[-,]\d{1,3})*/g;
const RE_NUM = /\b\d+\b/g;
// marcas de inglés sin traducir (palabras funcionales que no existen en español)
const RE_INGLES = /\b(the|and|that|which|with|shall|unto|thereof|whosoever|himself|because|though|wherein)\b/gi;

const cuenta = (t, re) => (t.match(re) || []).length;

export function validaUnidad(u, es, glosario) {
  const fallos = [];
  const en = u.en;

  if (!es || !es.trim()) {
    return [{ tipo: 'vacia', grave: true, detalle: 'traducción vacía' }];
  }

  // 1. Truncamiento / longitud fuera de rango.
  const ratio = es.length / en.length;
  if (en.length > 150 && ratio < 0.7) {
    fallos.push({ tipo: 'truncada', grave: true, detalle: `ratio ${ratio.toFixed(2)} (ES ${es.length} / EN ${en.length})` });
  } else if (en.length > 150 && ratio > 1.9) {
    fallos.push({ tipo: 'inflada', grave: false, detalle: `ratio ${ratio.toFixed(2)} — posible paráfrasis o comentario añadido` });
  }

  // 2. Referencias bíblicas. El regex no es perfecto entre dos idiomas (abreviaturas,
  //    rangos, "cap. 3"), así que la paridad exacta es AVISO, no rechazo: medido contra
  //    la traducción humana de Juan, exigirla generaba falsos positivos. Sólo es grave
  //    la pérdida masiva — que sí delata un párrafo mutilado.
  const refEn = cuenta(en, RE_REF), refEs = cuenta(es, RE_REF);
  if (refEn >= 3 && refEs === 0) {
    fallos.push({ tipo: 'referencias', grave: true, detalle: `EN tiene ${refEn} referencias, ES sólo ${refEs}` });
  } else if (refEn !== refEs) {
    fallos.push({ tipo: 'referencias', grave: false, detalle: `EN tiene ${refEn} referencias, ES tiene ${refEs}` });
  }

  // 3. Paridad de cifras (años, cantidades, números de verso citados en prosa).
  const nEn = (en.match(RE_NUM) || []).sort().join(',');
  const nEs = (es.match(RE_NUM) || []).sort().join(',');
  if (nEn !== nEs) {
    fallos.push({ tipo: 'cifras', grave: false, detalle: `EN [${nEn.slice(0, 60)}] vs ES [${nEs.slice(0, 60)}]` });
  }

  // 4. Inglés sin traducir.
  const ing = cuenta(es, RE_INGLES);
  if (ing >= 3) {
    fallos.push({ tipo: 'sin-traducir', grave: true, detalle: `${ing} marcadores de inglés en el ES` });
  }

  // 5. Repetición en bucle (patología clásica de LLM).
  const frases = es.split(/[.;]\s+/).map((s) => s.trim()).filter((s) => s.length > 25);
  const unicas = new Set(frases);
  if (frases.length >= 4 && unicas.size < frases.length * 0.7) {
    fallos.push({ tipo: 'bucle', grave: true, detalle: `${frases.length - unicas.size} frases repetidas` });
  }

  // 6. Restos de andamiaje del modelo.
  // Ojo: «Claro que...» y «Por supuesto que...» son prosa legítima de Henry.
  // Sólo se rechaza el andamiaje inequívoco de un asistente.
  if (/^\s*(aquí (está|tienes) (la|tu|su)\s|claro[,:]?\s+(aquí|te dejo|te presento)|por supuesto[,:]?\s+(aquí|te dejo)|traducci[óo]n:|here is (the|your)|translation:)/i.test(es)) {
    fallos.push({ tipo: 'preambulo', grave: true, detalle: 'la salida empieza con preámbulo conversacional' });
  }

  // 7. Glosario (mecánico, no opinión).
  //    Grave sólo la variante vetada por el propio glosario; la mera ausencia del
  //    término fijo es aviso, porque el traductor puede reformular legítimamente
  //    (medido contra la traducción humana de Juan).
  for (const g of verificaGlosario(glosario, en, es)) {
    fallos.push({
      tipo: 'glosario',
      grave: !!g.grave,
      detalle: g.vetada
        ? `"${g.en}" traducido con la variante vetada "${g.vetada}" — debe ser "${g.esperado}"`
        : `"${g.en}": no aparece la forma fija "${g.esperado}" (puede ser reformulación)`,
    });
  }

  // 8. Citas que el lector NO sabria enlazar. Es AVISO y no rechazo porque el
  //    normalizador ya las reescribe antes de llegar aqui; si alguna sobrevive,
  //    es una abreviatura nueva que hay que anadir a ALIAS.
  const { desconocidas } = normalizaReferencias(es);
  if (desconocidas.length) {
    fallos.push({
      tipo: 'cita-muerta', grave: false,
      detalle: `abreviaturas que el lector no enlaza: ${desconocidas.join(', ')}`,
    });
  }

  return fallos;
}

export const tieneGraves = (fallos) => fallos.some((f) => f.grave);
