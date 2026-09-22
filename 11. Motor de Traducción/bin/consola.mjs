#!/usr/bin/env node
/**
 * CONSOLA DE PROCESO Y REVISIÓN HUMANA (paso 4).
 *
 *   node bin/consola.mjs            → http://localhost:4317
 *   node bin/consola.mjs --puerto 8080
 *
 * Dos caras en una:
 *  · Proceso  — avance por libro, gasto, veredictos del auditor, ritmo.
 *  · Revisión — cola ordenada POR CONFIANZA ASCENDENTE: lo peor primero.
 *    El revisor ve EN y ES enfrentados, aprueba, corrige o rechaza.
 *
 * Las decisiones humanas se anotan en estado/revision.jsonl y MANDAN sobre
 * cualquier veredicto de la IA. Una unidad aprobada por humano es la única que
 * puede perder la etiqueta «sin revisar».
 *
 * Servidor local sin dependencias. No expone nada fuera de 127.0.0.1.
 */
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import '../lib/env.mjs';   // primero: carga .env antes de que nadie lea process.env
import { config } from '../config.mjs';
import { MOTOR, ESTADO, GASTO, HENRY_EN, HENRY_ES } from '../lib/rutas.mjs';
import { unidadesDeLibro, librosDisponibles } from '../lib/unidades.mjs';
import { Estado } from '../lib/estado.mjs';

const args = process.argv.slice(2);
const puerto = Number(args.includes('--puerto') ? args[args.indexOf('--puerto') + 1] : 4317);
const REVISION = path.join(ESTADO, 'revision.jsonl');

const NOMBRES = {
  GEN: 'Génesis', EXO: 'Éxodo', LEV: 'Levítico', NUM: 'Números', DEU: 'Deuteronomio',
  JOS: 'Josué', JDG: 'Jueces', RUT: 'Rut', '1SA': '1 Samuel', '2SA': '2 Samuel',
  '1KI': '1 Reyes', '2KI': '2 Reyes', '1CH': '1 Crónicas', '2CH': '2 Crónicas',
  EZR: 'Esdras', NEH: 'Nehemías', EST: 'Ester', JOB: 'Job', PSA: 'Salmos', PRO: 'Proverbios',
  ECC: 'Eclesiastés', SNG: 'Cantares', ISA: 'Isaías', JER: 'Jeremías', LAM: 'Lamentaciones',
  EZK: 'Ezequiel', DAN: 'Daniel', HOS: 'Oseas', JOL: 'Joel', AMO: 'Amós', OBA: 'Abdías',
  JON: 'Jonás', MIC: 'Miqueas', NAM: 'Nahúm', HAB: 'Habacuc', ZEP: 'Sofonías', HAG: 'Hageo',
  ZEC: 'Zacarías', MAL: 'Malaquías', MAT: 'Mateo', MRK: 'Marcos', LUK: 'Lucas', JHN: 'Juan',
  ACT: 'Hechos', ROM: 'Romanos', '1CO': '1 Corintios', '2CO': '2 Corintios', GAL: 'Gálatas',
  EPH: 'Efesios', PHP: 'Filipenses', COL: 'Colosenses', '1TH': '1 Tesalonicenses',
  '2TH': '2 Tesalonicenses', '1TI': '1 Timoteo', '2TI': '2 Timoteo', TIT: 'Tito',
  PHM: 'Filemón', HEB: 'Hebreos', JAS: 'Santiago', '1PE': '1 Pedro', '2PE': '2 Pedro',
  '1JN': '1 Juan', '2JN': '2 Juan', '3JN': '3 Juan', JUD: 'Judas', REV: 'Apocalipsis',
};

// ── caché de unidades (el corpus no cambia mientras corre la consola) ──────
const cacheUnidades = new Map();
const unidades = (osis) => {
  if (!cacheUnidades.has(osis)) cacheUnidades.set(osis, unidadesDeLibro(osis));
  return cacheUnidades.get(osis);
};

function leeRevisiones() {
  if (!fs.existsSync(REVISION)) return new Map();
  const m = new Map();
  for (const l of fs.readFileSync(REVISION, 'utf8').split('\n')) {
    if (!l.trim()) continue;
    try { const r = JSON.parse(l); m.set(r.id, r); } catch { /* línea corrupta: se ignora */ }
  }
  return m;
}

function resumen() {
  const estado = new Estado();
  const revisiones = leeRevisiones();
  const gasto = fs.existsSync(GASTO) ? JSON.parse(fs.readFileSync(GASTO, 'utf8')) : { usd: 0, llamadas: 0, tokens: {} };

  const libros = [];
  let tot = 0, trad = 0, aud = 0, marc = 0, rev = 0, fall = 0;

  for (const osis of librosDisponibles()) {
    const us = unidades(osis);
    let t = 0, a = 0, m = 0, r = 0, f = 0;
    for (const u of us) {
      const res = estado.resultados.get(u.id);
      if (res?.estado === 'fallida') f++;
      if (!res || !res.es || res.h !== u.h) continue;
      t++;
      const au = estado.auditorias.get(u.id);
      if (au) { a++; if (!au.aprobada) m++; }
      if (revisiones.get(u.id)?.decision === 'aprobada') r++;
    }
    // En el panel de proceso, Juan cuenta siempre como la traducción humana:
    // está completo por definición. (El cotejo sí puede pedir la versión del
    // motor, pero eso es otra vista — aquí `verMotor` no existe.)
    const humano = osis === config.patronOro;
    libros.push({
      osis, nombre: NOMBRES[osis] ?? osis, total: us.length,
      traducidas: humano ? us.length : t, auditadas: a, marcadas: m,
      revisadas: humano ? us.length : r, fallidas: f, humano,
      orden: config.orden.indexOf(osis) === -1 ? 999 : config.orden.indexOf(osis),
    });
    tot += us.length; trad += humano ? us.length : t; aud += a; marc += m;
    rev += humano ? us.length : r; fall += f;
  }
  libros.sort((a, b) => a.orden - b.orden);

  const fallosPorTipo = {};
  for (const a of estado.auditorias.values()) {
    if (!a.aprobada) fallosPorTipo[a.fallo ?? 'sin-clasificar'] = (fallosPorTipo[a.fallo ?? 'sin-clasificar'] ?? 0) + 1;
  }

  return {
    libros,
    global: { total: tot, traducidas: trad, auditadas: aud, marcadas: marc, revisadas: rev, fallidas: fall },
    gasto: { usd: gasto.usd ?? 0, tope: config.presupuesto.topeUSD, llamadas: gasto.llamadas ?? 0, tokens: gasto.tokens ?? {}, porModelo: gasto.porModelo ?? {} },
    fallosPorTipo,
    config: {
      traductor: `${config.traductor.proveedor} / ${config.traductor.modelo}`,
      auditor: config.auditor.proveedor,
      autoDoctrinal: config.correccion.autoDoctrinal,
    },
  };
}

/** Cola de revisión: lo peor primero (confianza ascendente), luego marcadas, luego el resto. */
function colaRevision({ libro, filtro = 'marcadas', limite = 40, buscar = '' }) {
  const estado = new Estado();
  const revisiones = leeRevisiones();
  const libros = libro ? [libro] : config.orden.filter((o) => librosDisponibles().includes(o));
  const out = [];

  for (const osis of libros) {
    if (osis === config.patronOro) continue;
    for (const u of unidades(osis)) {
      const res = estado.resultados.get(u.id);
      if (!res || !res.es || res.h !== u.h) continue;
      const au = estado.auditorias.get(u.id);
      const rv = revisiones.get(u.id);
      if (filtro === 'marcadas' && (au?.aprobada !== false)) continue;
      if (filtro === 'pendientes' && rv) continue;
      if (filtro === 'revisadas' && !rv) continue;
      if (buscar && !u.en.toLowerCase().includes(buscar.toLowerCase()) && !res.es.toLowerCase().includes(buscar.toLowerCase())) continue;
      out.push({
        id: u.id, osis, nombre: NOMBRES[osis] ?? osis, cap: u.cap, tipo: u.tipo,
        en: u.en, es: res.es, modelo: res.modelo,
        auditoria: au ? {
          fidelidad: au.fidelidad, fluidez: au.fluidez, registro: au.registro,
          omision: au.omision, adicion: au.adicion, maquina: au.maquina,
          fallo: au.fallo, confianza: au.confianza, aprobada: au.aprobada, proveedor: au.proveedor,
        } : null,
        revision: rv ? { decision: rv.decision, nota: rv.nota, ts: rv.ts } : null,
      });
      if (out.length > 4000) break;
    }
  }
  out.sort((a, b) => (a.auditoria?.confianza ?? 1) - (b.auditoria?.confianza ?? 1));
  return { total: out.length, items: out.slice(0, limite) };
}

/**
 * Un capitulo entero, EN y ES enfrentados. A diferencia de la cola de revision,
 * ESTE SI incluye a Juan: su razon de ser es poder leer la traduccion humana al
 * lado de la automatica y juzgar si la voz coincide. Ningun numero contesta eso.
 */
function capituloCotejo(osis, cap, verMotor = false) {
  const estado = new Estado();
  const revisiones = leeRevisiones();
  // Juan tiene dos versiones posibles: la humana (por defecto) y la del motor,
  // si se ha retraducido para cotejo. `verMotor` elige cual se sirve.
  const humano = osis === config.patronOro && !verMotor;
  const us = unidades(osis).filter((u) => u.cap === Number(cap));

  // el ES del patron de oro vive en el propio henry-es, no en el estado del motor
  let esHumano = null;
  if (humano) {
    const ruta = path.join(HENRY_ES, `${osis}.json`);
    if (fs.existsSync(ruta)) esHumano = JSON.parse(fs.readFileSync(ruta, 'utf8')).c?.[String(cap)] ?? null;
  }

  const items = us.map((u) => {
    let es = null, modelo = null, origen = 'sin traducir';
    if (humano && esHumano) {
      if (u.tipo === 'r') es = esHumano.r;
      else if (u.tipo === 't') es = esHumano.s?.[u.sec]?.t;
      else es = esHumano.s?.[u.sec]?.p?.[u.par];
      if (es) { modelo = 'humano'; origen = 'traducción humana'; }
    } else {
      const r = estado.resultados.get(u.id);
      if (r && r.es && r.h === u.h) { es = r.es; modelo = r.modelo; origen = 'motor'; }
    }
    const au = estado.auditorias.get(u.id);
    return {
      id: u.id, tipo: u.tipo, en: u.en, es: es || null, modelo, origen,
      auditoria: au ? { fidelidad: au.fidelidad, fluidez: au.fluidez, registro: au.registro,
        fallo: au.fallo, confianza: au.confianza, aprobada: au.aprobada } : null,
      revision: revisiones.get(u.id) ? { decision: revisiones.get(u.id).decision } : null,
    };
  });

  const caps = [...new Set(unidades(osis).map((u) => u.cap))].sort((a, b) => a - b);
  const conEs = items.filter((i) => i.es).length;
  // ¿existe la otra version de este capitulo, para ofrecer el conmutador?
  const hayMotor = osis === config.patronOro &&
    us.some((u) => { const r = estado.resultados.get(u.id); return r && r.es && r.h === u.h; });
  return { osis, nombre: NOMBRES[osis] ?? osis, cap: Number(cap), humano, caps, items,
    esPatronOro: osis === config.patronOro, hayMotor, verMotor,
    cobertura: `${conEs}/${items.length}` };
}

function guardaRevision(body) {
  const { id, decision, es, nota } = body;
  if (!id || !['aprobada', 'rechazada', 'corregida'].includes(decision)) {
    return { ok: false, error: 'id y decision (aprobada|rechazada|corregida) obligatorios' };
  }
  const fila = { id, decision, es: es ?? null, nota: nota ?? '', revisor: 'humano', ts: new Date().toISOString() };
  fs.appendFileSync(REVISION, JSON.stringify(fila) + '\n');

  // una corrección humana entra en el estado y en la memoria de traducción:
  // la próxima vez que aparezca ese mismo original, se usa la versión del revisor.
  if (decision === 'corregida' && es) {
    const estado = new Estado();
    const prev = estado.resultados.get(id);
    if (prev) {
      estado.anotaTraduccion({ id, h: prev.h, es, modelo: 'humano', via: 'revision' });
      estado.guardaMemoria();
    }
  }
  return { ok: true, fila };
}

// ── servidor ───────────────────────────────────────────────────────────────
const cuerpo = (req) => new Promise((res) => {
  let d = ''; req.on('data', (c) => (d += c)); req.on('end', () => { try { res(JSON.parse(d || '{}')); } catch { res({}); } });
});
const json = (r, o, code = 200) => { r.writeHead(code, { 'content-type': 'application/json; charset=utf-8' }); r.end(JSON.stringify(o)); };

const servidor = http.createServer(async (req, res) => {
  const url = new URL(req.url, 'http://localhost');
  try {
    if (url.pathname === '/' || url.pathname === '/index.html') {
      const html = fs.readFileSync(path.join(MOTOR, 'web', 'consola.html'), 'utf8');
      res.writeHead(200, { 'content-type': 'text/html; charset=utf-8' });
      return res.end(html);
    }
    if (url.pathname === '/api/resumen') return json(res, resumen());
    if (url.pathname === '/api/cola') {
      return json(res, colaRevision({
        libro: url.searchParams.get('libro') || null,
        filtro: url.searchParams.get('filtro') || 'marcadas',
        limite: Number(url.searchParams.get('limite') || 40),
        buscar: url.searchParams.get('buscar') || '',
      }));
    }
    if (url.pathname === '/api/capitulo') {
      return json(res, capituloCotejo(url.searchParams.get('libro') || 'MAT',
        url.searchParams.get('cap') || '1',
        url.searchParams.get('motor') === '1'));
    }
    if (url.pathname === '/api/libros') {
      return json(res, librosDisponibles().map((o) => ({
        osis: o, nombre: NOMBRES[o] ?? o, humano: o === config.patronOro,
        caps: [...new Set(unidades(o).map((u) => u.cap))].sort((a, b) => a - b),
      })).sort((a, b) => (config.orden.indexOf(a.osis) + 1 || 999) - (config.orden.indexOf(b.osis) + 1 || 999)));
    }
    if (url.pathname === '/api/revision' && req.method === 'POST') {
      return json(res, guardaRevision(await cuerpo(req)));
    }
    res.writeHead(404); res.end('no');
  } catch (e) {
    json(res, { error: String(e.message) }, 500);
  }
});

servidor.listen(puerto, '127.0.0.1', () => {
  console.log(`\n  Consola del motor  →  http://localhost:${puerto}`);
  console.log(`  Corpus EN: ${HENRY_EN}`);
  console.log(`  Decisiones humanas: ${REVISION}`);
  console.log('  Ctrl+C para parar.\n');
});
