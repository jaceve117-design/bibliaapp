/**
 * Glosario teológico maestro: se lee del .md del paso 6, no se duplica aquí.
 * Una sola fuente de verdad — si el editor cambia un término, el motor lo obedece
 * en la siguiente corrida sin tocar código.
 *
 * Dos usos:
 *  1. inyectar la tabla en el prefijo fijo del prompt (cacheado, se paga una vez);
 *  2. VERIFICAR mecánicamente el cumplimiento: si el EN dice "propitiation" y el ES
 *     no dice "propiciación", salta. Esto es gratis y exacto — no se delega a la IA.
 */
import fs from 'node:fs';
import { GLOSARIO_MD } from './rutas.mjs';

const norm = (s) => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

/**
 * Variantes PROHIBIDAS, extraídas de la columna de justificación del propio glosario:
 * «NO sustituir por «expiación»», «No «alianza»», «variante prohibida».
 * Ésta es la única señal que puede ser GRAVE: la ausencia del término fijo puede
 * deberse a una reformulación legítima (faith → «creer»), pero la presencia de la
 * variante expresamente vetada es un incumplimiento inequívoco.
 */
const RE_VETO = /(?:nunca|no sustituir por|prohibida|reservar|no\s)\s*«([^»]+)»/gi;

function prohibidas(justificacion) {
  const out = [];
  for (const m of String(justificacion).matchAll(RE_VETO)) {
    const t = m[1].trim();
    if (t && t.length > 2) out.push(t);
  }
  return out;
}

export function cargaGlosario() {
  const md = fs.readFileSync(GLOSARIO_MD, 'utf8');
  const terminos = [];
  for (const linea of md.split('\n')) {
    const m = linea.match(/^\|\s*([^|]+?)\s*\|\s*([^|]+?)\s*\|\s*([^|]*?)\s*\|\s*$/);
    if (!m) continue;
    const [, en, es, just] = m;
    if (/^-+$/.test(en) || norm(en) === 'en (henry/kjv)' || norm(en).startsWith('en ')) continue;
    if (!en || !es || en.includes('---')) continue;
    // las celdas admiten alternativas separadas por / : "regeneration / new birth"
    const ens = en.split('/').map((x) => x.trim()).filter(Boolean);
    const ess = es.split('/').map((x) => x.trim()).filter(Boolean);
    if (!ens.length || !ess.length) continue;
    terminos.push({ en: ens, es: ess, just: just || '', veto: prohibidas(just || '') });
  }
  return terminos;
}

/** Sólo los términos que REALMENTE aparecen en este texto. */
export function terminosRelevantes(glosario, textoEn) {
  const t = norm(textoEn);
  return glosario.filter((g) => g.en.some((e) => t.includes(norm(e))));
}

/**
 * Verificación de cumplimiento. Devuelve la lista de incumplimientos:
 * término presente en el EN cuya forma fija ES no aparece en la traducción.
 */
export function verificaGlosario(glosario, textoEn, textoEs) {
  const en = norm(textoEn);
  const es = norm(textoEs);
  const fallos = [];
  for (const g of glosario) {
    const apariciones = g.en.filter((e) => en.includes(norm(e)));
    if (!apariciones.length) continue;

    // Raiz tolerante a flexion (pacto/pactos, eterno/eterna). Los terminos cortos
    // (fe, ley, obras) se comparan por PALABRA COMPLETA: si no, «fe» daria por
    // bueno «fecha» y «profeta».
    const cumple = g.es.some((x) => {
      const n = norm(x);
      if (!n) return false;
      const raiz = n.slice(0, Math.min(Math.max(4, n.length - 1), 7));
      if (raiz.length <= 4) {
        return new RegExp(`(^|[^a-z0-9])${raiz}[a-z]{0,3}([^a-z0-9]|$)`, 'i').test(es);
      }
      return es.includes(raiz);
    });

    // GRAVE solo si aparece la variante expresamente vetada por el glosario.
    const vetada = (g.veto || []).find((v) => {
      const n = norm(v);
      const raiz = n.slice(0, Math.min(Math.max(4, n.length - 1), 7));
      return raiz.length > 4 ? es.includes(raiz)
        : new RegExp(`(^|[^a-z0-9])${raiz}[a-z]{0,3}([^a-z0-9]|$)`, 'i').test(es);
    });

    if (vetada && !cumple) {
      fallos.push({ en: apariciones[0], esperado: g.es.join(' / '), vetada, grave: true });
    } else if (!cumple) {
      // Aviso: puede ser una reformulacion legitima del traductor. Lo decide la capa 2.
      fallos.push({ en: apariciones[0], esperado: g.es.join(' / '), vetada: null, grave: false });
    }
  }
  return fallos;
}

export function tablaParaPrompt(glosario) {
  return glosario.map((g) => `${g.en.join(' / ')} → ${g.es.join(' / ')}`).join('\n');
}
