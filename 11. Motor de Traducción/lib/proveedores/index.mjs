/**
 * Selección de traductor por el NOMBRE del modelo, no por configuración aparte:
 * así basta cambiar `config.traductor.modelo` para saltar de proveedor.
 *
 *   @cf/…        → Cloudflare Workers AI
 *   claude-…     → Anthropic
 *   gemini-…     → Gemini
 */
import * as anthropic from './anthropic.mjs';
import * as gemini from './gemini.mjs';
import * as cloudflare from './cloudflare.mjs';

export function traductor(modelo) {
  if (modelo.startsWith('@cf/')) return { impl: cloudflare, nombre: 'cloudflare' };
  if (modelo.startsWith('gemini')) return { impl: gemini, nombre: 'gemini' };
  return { impl: anthropic, nombre: 'anthropic' };
}
