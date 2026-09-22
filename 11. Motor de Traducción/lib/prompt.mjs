/**
 * Construcción del prompt.
 *
 * Clave de coste: el PREFIJO es idéntico en las ~4.000 llamadas de la corrida
 * (reglas + glosario + ejemplos de oro). Va marcado como cacheable: se paga
 * completo una vez y después al 10%. Es el mayor ahorro del motor.
 *
 * Los EJEMPLOS DE ORO no se inventan: se extraen de Juan, traducido a mano
 * y ya validado. El motor imita tu voz, no una voz genérica.
 */
import fs from 'node:fs';
import path from 'node:path';
import { HENRY_EN, HENRY_ES } from './rutas.mjs';
import { tablaParaPrompt } from './glosario.mjs';

/** Pares EN/ES reales del patrón de oro, elegidos por longitud media. */
export function ejemplosDeOro(osis = 'JHN', n = 2) {
  const en = JSON.parse(fs.readFileSync(path.join(HENRY_EN, `${osis}.json`), 'utf8')).c;
  const esFile = path.join(HENRY_ES, `${osis}.json`);
  if (!fs.existsSync(esFile)) return [];
  const es = JSON.parse(fs.readFileSync(esFile, 'utf8')).c;
  const pares = [];
  for (const cap of Object.keys(es)) {
    (es[cap].s || []).forEach((s, i) => {
      (s.p || []).forEach((p, j) => {
        const o = en[cap]?.s?.[i]?.p?.[j];
        if (p && p.trim() && o && o.length > 500 && o.length < 1600) pares.push({ en: o, es: p });
      });
    });
  }
  // los del medio del rango: representativos, no extremos
  pares.sort((a, b) => a.en.length - b.en.length);
  const centro = Math.floor(pares.length / 2);
  return pares.slice(centro, centro + n);
}

export const REGLAS = `Eres traductor literario especializado en teología puritana inglesa del siglo XVIII.
Traduces el «Complete Commentary» de Matthew Henry (1706) del inglés al español.

REGISTRO: culto pero pastoral. Henry es devocional y directo. NO lo academices ni lo simplifiques.
NO modernices su retórica: conserva los periodos largos, las enumeraciones (I., II., 1., 2.) y el tono homilético.

REGLAS DURAS:
1. Traduces TODO el contenido. No resumes, no omites, no añades comentario propio.
2. Conservas íntegras las referencias bíblicas y su forma abreviada española:
   Joh→Jn, Gen→Gn, Psa→Sal, Mat→Mt, Rom→Ro, 1Co→1 Co, Act→Hch, Heb→He, Rev→Ap.
   Si el original dice "Joh 3:16", el español dice "Jn 3:16". Ni una referencia se pierde.
3. Cifras, años y cantidades se conservan exactamente.
4. Nombres propios en forma castellana consolidada (Moisés, Jacob, Santiago, Cafarnaúm).
5. Cuando Henry cita la Biblia dentro de la prosa, traduces alineado a Reina-Valera 1909.
   Si su argumento depende de una palabra concreta del inglés (KJV), conservas la distinción
   y añades la aclaración entre corchetes: [N. del T.]
6. Los términos doctrinales de la tabla siguiente son FIJOS. Nunca uses sinónimos por variedad
   estilística: la consistencia a lo largo de 30.000 párrafos importa más que la elegancia local.

SALIDA: exclusivamente un objeto JSON {"u":[{"id":"...","es":"..."}]} con una entrada por
unidad recibida, los MISMOS id, en el mismo orden. Sin preámbulo, sin explicación, sin markdown.`;

export function prefijoFijo(glosario, ejemplos) {
  let s = REGLAS + '\n\nTABLA DE TÉRMINOS FIJOS (EN → ES):\n' + tablaParaPrompt(glosario);
  if (ejemplos.length) {
    s += '\n\nEJEMPLOS DE LA VOZ EXACTA QUE DEBES REPRODUCIR' +
         ' (traducción humana ya aprobada de este mismo corpus):\n';
    ejemplos.forEach((e, i) => {
      s += `\n--- EJEMPLO ${i + 1} ---\nEN: ${e.en}\nES: ${e.es}\n`;
    });
  }
  return s;
}

/** Cuerpo variable de la petición: sólo las unidades del lote. */
export function cuerpoLote(unidades) {
  return 'Traduce al español estas unidades. Devuelve el JSON con los mismos id.\n\n' +
    JSON.stringify({ u: unidades.map((u) => ({ id: u.id, en: u.en })) }, null, 1);
}
