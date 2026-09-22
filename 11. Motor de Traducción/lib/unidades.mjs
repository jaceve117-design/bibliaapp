/**
 * Extracción de unidades traducibles desde public/data/henry/{OSIS}.json.
 *
 * La unidad ATÓMICA es el párrafo (o título, o resumen de capítulo), NO el capítulo:
 * si falla el párrafo 40 de un capítulo de 8.000 palabras, se reintenta el párrafo,
 * no el capítulo entero.
 *
 * ID estable y legible:  OSIS.cap.tipo[.sec[.par]]
 *   GEN.1.r        resumen del capítulo
 *   GEN.1.t.0      título de la sección 0
 *   GEN.1.p.0.3    párrafo 3 de la sección 0
 *
 * El hash (sha256 del original, 16 hex) es la llave de la MEMORIA DE TRADUCCIÓN:
 * dos párrafos idénticos en libros distintos se traducen una vez y quedan idénticos.
 */
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { HENRY_EN } from './rutas.mjs';

export const hash = (t) => crypto.createHash('sha256').update(t, 'utf8').digest('hex').slice(0, 16);

export function librosDisponibles() {
  return fs.readdirSync(HENRY_EN)
    .filter((f) => f.endsWith('.json') && !f.startsWith('_'))
    .map((f) => f.replace('.json', ''));
}

export function cargaLibro(osis) {
  return JSON.parse(fs.readFileSync(path.join(HENRY_EN, `${osis}.json`), 'utf8'));
}

/** Devuelve todas las unidades traducibles de un libro, en orden de lectura. */
export function unidadesDeLibro(osis) {
  const libro = cargaLibro(osis);
  const out = [];
  const caps = Object.keys(libro.c).map(Number).sort((a, b) => a - b);
  for (const cap of caps) {
    const c = libro.c[cap];
    if (c.r && c.r.trim()) {
      out.push({ id: `${osis}.${cap}.r`, osis, cap, tipo: 'r', sec: null, par: null, en: c.r });
    }
    (c.s || []).forEach((s, i) => {
      if (s.t && s.t.trim()) {
        out.push({ id: `${osis}.${cap}.t.${i}`, osis, cap, tipo: 't', sec: i, par: null, en: s.t });
      }
      (s.p || []).forEach((p, j) => {
        if (p && p.trim()) {
          out.push({ id: `${osis}.${cap}.p.${i}.${j}`, osis, cap, tipo: 'p', sec: i, par: j, en: p });
        }
      });
    });
  }
  return out.map((u) => ({ ...u, h: hash(u.en), chars: u.en.length }));
}

/** Cola completa, en el orden de prioridad de config.orden. */
export function colaCompleta(orden, excluir = []) {
  const disponibles = new Set(librosDisponibles());
  const ex = new Set(excluir);
  const libros = [
    ...orden.filter((o) => disponibles.has(o)),
    ...[...disponibles].filter((o) => !orden.includes(o)).sort(),
  ].filter((o) => !ex.has(o));
  const out = [];
  for (const osis of libros) out.push(...unidadesDeLibro(osis));
  return out;
}
