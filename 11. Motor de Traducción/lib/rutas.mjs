/** Rutas del proyecto. Único lugar donde se conoce la forma del árbol. */
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';

export const MOTOR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
export const PROYECTO = path.resolve(MOTOR, '..');
export const APP = path.join(PROYECTO, '07. App', 'app');
export const HENRY_EN = path.join(APP, 'public', 'data', 'henry');
export const HENRY_ES = path.join(APP, 'public', 'data', 'henry-es');
export const TRADUCCION = path.join(PROYECTO, '06. Traduccion');
export const GLOSARIO_MD = path.join(TRADUCCION, 'Glosario teologico maestro v1.md');
export const ESTADO = path.join(MOTOR, 'estado');
export const COLA = path.join(ESTADO, 'unidades.jsonl');
export const RESULTADOS = path.join(ESTADO, 'resultados.jsonl');
export const AUDITORIA = path.join(ESTADO, 'auditoria.jsonl');
export const MEMORIA = path.join(ESTADO, 'memoria.json');
export const GASTO = path.join(ESTADO, 'gasto.json');

export function aseguraDirs() {
  fs.mkdirSync(ESTADO, { recursive: true });
}

export function verifica() {
  const faltan = [];
  for (const [n, p] of Object.entries({ HENRY_EN, HENRY_ES, GLOSARIO_MD })) {
    if (!fs.existsSync(p)) faltan.push(`${n}: ${p}`);
  }
  if (faltan.length) {
    throw new Error('Rutas no encontradas:\n  · ' + faltan.join('\n  · '));
  }
}
