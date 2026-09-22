/**
 * Fachada de auditoría (capa 2). Desacopla el motor del proveedor:
 * Jev está en acceso anticipado y puede no estar disponible — el pipeline
 * NO puede depender de un producto de seis días.
 *
 *   'jev'    → censal (100%), ~1 USD sobre el corpus entero
 *   'gemini' → muestreado (config.auditor.muestreoSinJev)
 *   'auto'   → jev si hay JEV_API_KEY, si no gemini
 */
import * as jev from './jev.mjs';
import * as gemini from './gemini.mjs';
import * as anthropic from './anthropic.mjs';
import { config } from '../../config.mjs';
import { conRitmo } from '../ritmo.mjs';

export function eligeProveedor() {
  const p = config.auditor.proveedor;
  if (p !== 'auto') return p;
  if (jev.disponible()) return 'jev';
  if (gemini.disponible()) return 'gemini';
  if (anthropic.disponible()) return 'anthropic';
  return 'ninguno';
}

export function esCensal(proveedor = eligeProveedor()) { return proveedor === 'jev'; }

const PROMPT_JUEZ = `Eres auditor de traducciones literarias EN→ES de teología puritana (Matthew Henry, 1706).
Evalúas, no traduces. Devuelve SOLO este JSON:
{"fidelidad":0-3,"fluidez":0-3,"registro":0-2,"omision":true|false,"adicion":true|false,
 "maquina":true|false,"fallo":"ninguno|omision|literalidad|registro|terminologia|gramatica|referencias",
 "confianza":0-1,"nota":"una frase"}
Sé severo: una traducción meramente aceptable NO es un 3.`;

/** Normaliza cualquier proveedor a un veredicto único. */
function veredicto(id, r, proveedor, uso, modelo) {
  const c = config.auditor;
  // La confianza queda FUERA de la decisión: es baja siempre que el valor cae
  // entre dos niveles, aunque el juicio sea correcto. Sirve para ordenar la cola
  // humana, no para aprobar.
  const motivos = [];
  if (r.fidelidad < c.minFidelidad) motivos.push(`fidelidad ${Number(r.fidelidad).toFixed(2)}<${c.minFidelidad}`);
  if (r.fluidez < c.minFluidez) motivos.push(`fluidez ${Number(r.fluidez).toFixed(2)}<${c.minFluidez}`);
  if (r.omisionP > c.maxOmision) motivos.push(`omisión ${r.omisionP}`);
  if (r.adicionP > c.maxAdicion) motivos.push(`adición ${r.adicionP}`);
  if (r.maquinaP > c.maxMaquina) motivos.push(`máquina ${r.maquinaP}`);
  if (r.fallo && r.fallo !== 'ninguno') motivos.push(`fallo: ${r.fallo}`);
  return { id, ...r, aprobada: motivos.length === 0, motivos, proveedor, modelo, uso };
}

export async function auditaPar({ id, en, es }) {
  const proveedor = eligeProveedor();

  if (proveedor === 'jev') {
    const { respuestas, uso, modelo } = await conRitmo(
      () => jev.audita({ modelo: config.auditor.modeloJev, en, es }), { etiqueta: id });
    // se guardan las probabilidades crudas (…P) además del booleano:
    // el umbral es configurable y quiero poder recalibrarlo sin re-auditar.
    const r = {
      fidelidad: respuestas.fidelidad?.score ?? 0,
      fluidez: respuestas.fluidez?.score ?? 0,
      registro: respuestas.registro?.score ?? 0,
      omisionP: respuestas.omision?.noul ?? 0,
      adicionP: respuestas.adicion?.noul ?? 0,
      maquinaP: respuestas.maquina?.noul ?? 0,
      omision: (respuestas.omision?.noul ?? 0) > config.auditor.maxOmision,
      adicion: (respuestas.adicion?.noul ?? 0) > config.auditor.maxAdicion,
      maquina: (respuestas.maquina?.noul ?? 0) > config.auditor.maxMaquina,
      fallo: respuestas.fallo?.choice ?? 'ninguno',
      confianza: jev.confianzaMinima(respuestas),
    };
    return veredicto(id, r, 'jev', uso, modelo);
  }

  if (proveedor === 'ninguno') {
    return { id, aprobada: true, proveedor: 'ninguno', nota: 'sin auditor configurado', uso: { in: 0, out: 0 } };
  }

  const mod = proveedor === 'gemini' ? 'gemini-flash' : config.auditor.juezModelo;
  const impl = proveedor === 'gemini' ? gemini : anthropic;
  const { texto, uso } = await impl.completar({
    modelo: mod,
    prefijoFijo: PROMPT_JUEZ,
    cuerpo: jev.estadoDePar(en, es),
    maxTokens: 400,
    temperatura: 0,
  });
  let r;
  try { r = JSON.parse(texto.replace(/^[^{]*/, '').replace(/[^}]*$/, '')); }
  catch { r = { fidelidad: 0, fluidez: 0, registro: 0, omision: false, adicion: false, maquina: false, fallo: 'ninguno', confianza: 0, nota: 'respuesta del juez ilegible' }; }
  return veredicto(id, r, proveedor, uso, mod);
}
