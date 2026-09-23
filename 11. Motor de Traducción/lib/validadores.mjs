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

  // 1b. DESBORDE de unidad corta.
  //     El ratio de arriba sólo mira originales de más de 150 chars, y ahí se
  //     coló un fallo real: en un lote de Easton donde alternan titulares («Jacob»,
  //     5 chars) y definiciones, el modelo metió la definición ENTERA en el
  //     titular — 5.125 chars — y ningún validador lo vio. El lector lo pintó
  //     como titular a 24px y sin enlaces. Medido: 2 de 3.962 titulares.
  if (en.length <= 150 && es.length > Math.max(120, en.length * 6)) {
    fallos.push({
      tipo: 'desborde',
      grave: true,
      detalle: `original de ${en.length} chars y traducción de ${es.length}: el modelo metió aquí contenido de otra unidad`,
    });
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


/**
 * VALIDACIÓN DE GLOSAS (unidades cortas: 1-6 palabras).
 *
 * Los validadores de prosa no valen aquí y harían daño: el ratio de longitud
 * no significa nada en dos palabras, la paridad de referencias no aplica, y
 * «the» o «and» —marcadores de inglés sin traducir en un párrafo— son parte
 * legítima de muchas glosas inglesas del interlineal («and he said»).
 *
 * Lo que sí importa en una glosa:
 *  · que no venga vacía;
 *  · que no sea una frase explicativa (una glosa no se explica, se da);
 *  · que no devuelva el inglés tal cual;
 *  · que no traiga comillas, corchetes ni andamiaje del modelo.
 */
/**
 * Palabras cuya forma idéntica existe en español con OTRO significado. Dejarlas
 * sin traducir no es un cognado feliz, es un error de sentido.
 */
const FALSOS_AMIGOS = new Set([
  // Sólo palabras que EXISTEN en español con otro sentido. La primera versión
  // incluía «no», «me», «la», «ha»: en una glosa inglesa esas sí se escriben
  // igual en español, y marcarlas habría rechazado glosas correctas.
  'sin', 'come', 'once', 'son', 'ten', 'pan', 'dice', 'mar', 'fin', 'pie', 'vale', 'red', 'tan',
]);

const RE_ANDAMIO = /^\s*(la traducci[óo]n|traducci[óo]n|en espa[ñn]ol|esto significa|significa)(?![a-záéíóú])/i;

/**
 * Normalización determinista de una glosa.
 *
 * El modelo devuelve con frecuencia la glosa entrecomillada («"paz"») o con un
 * punto final que el original no tenía. Rechazarlo era un error de criterio:
 * 211 de las 232 glosas fallidas de la primera corrida cayeron por comillas, y
 * el freno de emergencia paró el motor por algo que un regex arregla con
 * certeza. Regla de la casa: lo que se puede corregir, se corrige; no se
 * rechaza ni se le vuelve a pedir al modelo.
 */
export function normalizaGlosa(es, en = '') {
  let t = String(es ?? '').trim().replace(/\s+/g, ' ');
  // comillas o corchetes que envuelven la glosa entera
  for (let i = 0; i < 3; i++) {
    const m = t.match(/^["'«“”‘’\[(]\s*(.+?)\s*["'»“”‘’\])]$/s);
    if (!m) break;
    t = m[1].trim();
  }
  // punto final que el original no llevaba
  if (t.endsWith('.') && !String(en).trim().endsWith('.')) t = t.slice(0, -1).trim();
  return t;
}

export function validaGlosa(u, es) {
  const fallos = [];
  if (!es || !es.trim()) return [{ tipo: 'vacia', grave: true, detalle: 'glosa vacía' }];

  const t = es.trim();

  if (t.length > Math.max(60, u.en.length * 3)) {
    fallos.push({ tipo: 'explicacion', grave: true, detalle: `${t.length} chars para una glosa de ${u.en.length}: parece explicación, no glosa` });
  }
  if (RE_ANDAMIO.test(t)) {
    fallos.push({ tipo: 'andamio', grave: true, detalle: 'la glosa empieza explicándose' });
  }
  // Devolver el inglés idéntico suele ser CORRECTO en una glosa: nombres propios
  // (Barnea, Enan, Horon) y cognados exactos (honor, terror, acacia, amén) se
  // escriben igual. Rechazarlos costó 64 unidades buenas en la primera corrida.
  // Así que es aviso... salvo en los falsos amigos, donde la forma idéntica
  // cambia el sentido y sí hay que rehacerla.
  if (t.toLowerCase() === u.en.trim().toLowerCase() && /[a-z]{3}/i.test(u.en)) {
    const esFalsoAmigo = FALSOS_AMIGOS.has(u.en.trim().toLowerCase());
    fallos.push({
      tipo: 'sin-traducir',
      grave: esFalsoAmigo,
      detalle: esFalsoAmigo
        ? `"${u.en}" es falso amigo: idéntico en español significa otra cosa`
        : 'idéntico al inglés (puede ser correcto: nombre propio o cognado)',
    });
  }
  if (/[\r\n]/.test(t) || t.split(/\s+/).length > 12) {
    fallos.push({ tipo: 'larga', grave: true, detalle: 'más de 12 palabras: no es una glosa' });
  }
  return fallos;
}
