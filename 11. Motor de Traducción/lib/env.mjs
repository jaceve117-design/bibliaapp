/**
 * Carga de .env local.
 *
 * Las variables exportadas en una ventana de PowerShell no las hereda otro
 * proceso, así que las claves viven en `11. Motor de Traducción/.env`, que está
 * en .gitignore y nunca se commitea.
 *
 * Se importa PRIMERO en cada bin/, antes que cualquier módulo que lea process.env.
 * Nunca sobrescribe una variable ya presente en el entorno real.
 */
import fs from 'node:fs';
import path from 'node:path';
import { MOTOR } from './rutas.mjs';

const ruta = path.join(MOTOR, '.env');

if (fs.existsSync(ruta)) {
  for (const linea of fs.readFileSync(ruta, 'utf8').split('\n')) {
    const l = linea.trim();
    if (!l || l.startsWith('#')) continue;
    const i = l.indexOf('=');
    if (i < 1) continue;
    const clave = l.slice(0, i).trim();
    let valor = l.slice(i + 1).trim();
    if ((valor.startsWith('"') && valor.endsWith('"')) || (valor.startsWith("'") && valor.endsWith("'"))) {
      valor = valor.slice(1, -1);
    }
    if (valor && process.env[clave] === undefined) process.env[clave] = valor;
  }
}

/** Diagnóstico sin revelar el valor. */
export function claves() {
  const ver = (k) => (process.env[k] ? `presente (${process.env[k].length} chars)` : 'ausente');
  return {
    ANTHROPIC_API_KEY: ver('ANTHROPIC_API_KEY'),
    GEMINI_API_KEY: ver('GEMINI_API_KEY'),
    JEV_API_KEY: ver('JEV_API_KEY'),
    CLOUDFLARE_ACCOUNT_ID: ver('CLOUDFLARE_ACCOUNT_ID'),
    CLOUDFLARE_API_TOKEN: ver('CLOUDFLARE_API_TOKEN'),
  };
}
