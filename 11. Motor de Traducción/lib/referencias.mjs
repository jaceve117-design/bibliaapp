/**
 * Normalización de referencias bíblicas.
 *
 * El lector sólo convierte en enlace las abreviaturas de su tabla `MAPA`
 * (07. App/app/lib/referencias.ts). Los modelos inventan variantes razonables
 * pero ajenas a esa tabla — medido sobre Mateo 1: «He 4:2», «Da 9:24»,
 * «Tt 2:13», «Nú 24:17», «Éx 3:6» — y esas citas quedarían muertas en el lector.
 *
 * No se le pide al modelo que acierte: se normaliza después, que es determinista.
 * La tabla NO se duplica aquí: se lee del propio lector, para que no puedan
 * divergir.
 */
import fs from 'node:fs';
import path from 'node:path';
import { APP } from './rutas.mjs';

const RUTA_TABLA = path.join(APP, 'lib', 'referencias.ts');

/** Abreviaturas que el lector SÍ sabe enlazar, leídas de su propia fuente. */
export function abreviaturasDelLector() {
  const src = fs.readFileSync(RUTA_TABLA, 'utf8');
  const bloque = src.slice(src.indexOf('const MAPA'), src.indexOf('const CLAVES'));
  const mapa = {};
  for (const m of bloque.matchAll(/'?([0-9A-Za-zÁÉÍÓÚáéíóú]+)'?\s*:\s*'([0-9A-Z]{3})'/g)) {
    mapa[m[1]] = m[2];
  }
  return mapa;
}

/**
 * Formas canónicas por libro: las que usa la traducción HUMANA de Juan.
 * Se eligen así para que todo el corpus lea igual, no por gusto propio.
 */
export const CANONICA = {
  GEN: 'Gn', EXO: 'Ex', LEV: 'Lv', NUM: 'Nm', DEU: 'Dt', JOS: 'Jos', JDG: 'Jue', RUT: 'Rt',
  '1SA': '1S', '2SA': '2S', '1KI': '1R', '2KI': '2R', '1CH': '1Cr', '2CH': '2Cr',
  EZR: 'Esd', NEH: 'Neh', EST: 'Est', JOB: 'Job', PSA: 'Sal', PRO: 'Pr', ECC: 'Ecl',
  SNG: 'Cant', ISA: 'Isa', JER: 'Jer', LAM: 'Lm', EZK: 'Ez', DAN: 'Dn', HOS: 'Os',
  JOL: 'Jl', AMO: 'Am', OBA: 'Abd', JON: 'Jon', MIC: 'Miq', NAM: 'Nah', HAB: 'Hab',
  ZEP: 'Sof', HAG: 'Hag', ZEC: 'Zac', MAL: 'Mal',
  MAT: 'Mt', MRK: 'Mr', LUK: 'Lc', JHN: 'Jn', ACT: 'Hch', ROM: 'Ro',
  '1CO': '1Co', '2CO': '2Co', GAL: 'Gá', EPH: 'Ef', PHP: 'Fil', COL: 'Col',
  '1TH': '1Ts', '2TH': '2Ts', '1TI': '1Ti', '2TI': '2Ti', TIT: 'Tit', PHM: 'Flm',
  HEB: 'Heb', JAS: 'Stg', '1PE': '1P', '2PE': '2P', '1JN': '1Jn', '2JN': '2Jn',
  '3JN': '3Jn', JUD: 'Jud', REV: 'Ap',
};

/**
 * Variantes que los modelos producen y el lector NO reconoce.
 * Se amplía cuando la validación detecte una nueva: el validador la delata.
 */
export const ALIAS = {
  He: 'HEB', Hb: 'HEB', Da: 'DAN', Tt: 'TIT', 'Nú': 'NUM', Nu: 'NUM', 'Éx': 'EXO',
  Exod: 'EXO', Re: '1KI', Cr: '1CH', Sa: '1SA', Ec: 'ECC', 'Ez.': 'EZK', Sant: 'JAS',
  Sg: 'JAS', Fp: 'PHP', Flp: 'PHP', Le: 'LEV', De: 'DEU', Ge: 'GEN', Pv: 'PRO',
  Ca: 'SNG', Ct: 'SNG', Ga: 'GAL', Gal_: 'GAL', Ro_: 'ROM', Abdias: 'OBA', Abd: 'OBA',
};

/** Verifica que la forma canónica elegida sea de veras enlazable por el lector. */
export function canonicasNoEnlazables() {
  const lector = abreviaturasDelLector();
  return Object.entries(CANONICA).filter(([, abr]) => lector[abr] === undefined);
}

const RE_ABREV = /(^|[^\p{L}\p{N}])([1-3]\s?)?([A-ZÁÉÍÓÚ][\p{L}]{0,5})\.?\s?(\d{1,3}:\d{1,3})/gu;

/**
 * Reescribe las abreviaturas no reconocidas a su forma canónica.
 * Devuelve { texto, cambios, desconocidas }.
 */
export function normalizaReferencias(texto) {
  const lector = abreviaturasDelLector();
  const cambios = [];
  const desconocidas = new Set();

  const salida = texto.replace(RE_ABREV, (todo, pre, num, libro, cv) => {
    const clave = (num ? num.trim() : '') + libro;
    if (lector[clave] !== undefined) return todo;          // ya es enlazable
    const osis = ALIAS[clave] ?? ALIAS[libro];
    if (!osis) {
      // sólo se reporta si parece de verdad una cita, no "Cap 3:4" ni un nombre
      if (/^[A-ZÁÉÍÓÚ]/.test(libro) && libro.length <= 5) desconocidas.add(clave);
      return todo;
    }
    const buena = CANONICA[osis];
    cambios.push(`${clave} → ${buena}`);
    return `${pre}${buena} ${cv}`;
  });

  return { texto: salida, cambios, desconocidas: [...desconocidas] };
}
