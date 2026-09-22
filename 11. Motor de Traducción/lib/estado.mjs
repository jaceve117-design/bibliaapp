/**
 * Estado en disco, append-only, reanudable e idempotente.
 *
 * No hay base de datos ni dependencias: JSONL. Al arrancar se lee entero
 * (30.000 filas es nada) y la última fila por id gana. Matas el proceso,
 * lo relanzas, y sigue exactamente donde iba.
 *
 * Estados de una unidad:
 *   pendiente → traducida → auditada → aprobada
 *                        ↘ marcada (espera humano o autocorrección)
 *                        ↘ fallida (agotó reintentos)
 */
import fs from 'node:fs';
import { RESULTADOS, AUDITORIA, MEMORIA, aseguraDirs } from './rutas.mjs';

function leeJsonl(ruta) {
  if (!fs.existsSync(ruta)) return [];
  return fs.readFileSync(ruta, 'utf8')
    .split('\n')
    .filter((l) => l.trim())
    .map((l) => { try { return JSON.parse(l); } catch { return null; } })
    .filter(Boolean);
}

export class Estado {
  constructor() {
    aseguraDirs();
    this.resultados = new Map();  // id → { id, h, es, estado, intentos, modelo, ts }
    this.auditorias = new Map();  // id → veredicto
    this.memoria = new Map();     // hash → es   (memoria de traducción global)
    this.cargar();
  }

  cargar() {
    for (const r of leeJsonl(RESULTADOS)) this.resultados.set(r.id, r);
    for (const a of leeJsonl(AUDITORIA)) this.auditorias.set(a.id, a);
    if (fs.existsSync(MEMORIA)) {
      for (const [h, es] of Object.entries(JSON.parse(fs.readFileSync(MEMORIA, 'utf8')))) {
        this.memoria.set(h, es);
      }
    } else {
      // reconstruir memoria desde resultados aprobados/traducidos
      for (const r of this.resultados.values()) if (r.es && r.h) this.memoria.set(r.h, r.es);
    }
  }

  guardaMemoria() {
    fs.writeFileSync(MEMORIA, JSON.stringify(Object.fromEntries(this.memoria)));
  }

  /** ¿Esta unidad ya está resuelta y no hay que gastar tokens en ella? */
  resuelta(u) {
    const r = this.resultados.get(u.id);
    if (!r) return false;
    if (r.h !== u.h) return false;           // el original cambió → rehacer
    return ['traducida', 'auditada', 'aprobada'].includes(r.estado);
  }

  recuerda(u) {
    return this.memoria.get(u.h) ?? null;
  }

  anotaTraduccion({ id, h, es, modelo, via = 'api', intentos = 1 }) {
    const fila = { id, h, es, estado: 'traducida', modelo, via, intentos, ts: new Date().toISOString() };
    this.resultados.set(id, fila);
    this.memoria.set(h, es);
    fs.appendFileSync(RESULTADOS, JSON.stringify(fila) + '\n');
    return fila;
  }

  anotaFallo({ id, h, motivo, intentos }) {
    const fila = { id, h, es: null, estado: 'fallida', motivo, intentos, ts: new Date().toISOString() };
    this.resultados.set(id, fila);
    fs.appendFileSync(RESULTADOS, JSON.stringify(fila) + '\n');
    return fila;
  }

  anotaAuditoria(v) {
    const fila = { ...v, ts: new Date().toISOString() };
    this.auditorias.set(v.id, fila);
    fs.appendFileSync(AUDITORIA, JSON.stringify(fila) + '\n');
    // refleja el veredicto en el resultado
    const r = this.resultados.get(v.id);
    if (r) {
      r.estado = v.aprobada ? 'aprobada' : 'marcada';
      fs.appendFileSync(RESULTADOS, JSON.stringify({ ...r, ts: fila.ts }) + '\n');
    }
    return fila;
  }

  resumen() {
    const c = { pendiente: 0, traducida: 0, auditada: 0, aprobada: 0, marcada: 0, fallida: 0 };
    for (const r of this.resultados.values()) c[r.estado] = (c[r.estado] ?? 0) + 1;
    return c;
  }
}
