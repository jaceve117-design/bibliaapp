#!/usr/bin/env node
/**
 * ENSAMBLADO → public/data/henry-es/{OSIS}.json
 *
 *   node bin/ensamblar.mjs              # todos los libros con algo traducido
 *   node bin/ensamblar.mjs --libro MAT
 *   node bin/ensamblar.mjs --solo-aprobadas   # excluye lo marcado por el auditor
 *
 * Respeta EXACTAMENTE el contrato de fusiona-henry-es.mjs: misma forma
 * {osis, c:{N:{r, s:[{t,v,p:[]}]}}}, traducción parcial permitida ("" = sin
 * traducir, el lector lo omite), y la sección conserva su ancla de verso `v`
 * del original EN. El lector no cambia ni una línea.
 *
 * NUNCA sobrescribe JHN (patrón de oro, traducción humana).
 */
import fs from 'node:fs';
import path from 'node:path';
import '../lib/env.mjs';   // primero: carga .env antes de que nadie lea process.env
import { config } from '../config.mjs';
import { verifica, HENRY_ES } from '../lib/rutas.mjs';
import { cargaLibro, unidadesDeLibro, librosDisponibles } from '../lib/unidades.mjs';
import { Estado } from '../lib/estado.mjs';
import { normalizaReferencias } from '../lib/referencias.mjs';

const args = process.argv.slice(2);
const obraId = args.includes('--obra') ? args[args.indexOf('--obra') + 1] : 'henry';
const valor = (n, d) => (args.includes(n) ? args[args.indexOf(n) + 1] : d);
const soloAprobadas = args.includes('--solo-aprobadas');
const unLibro = valor('--libro', null);

verifica();
const estado = new Estado();

// Obras distintas de Henry traen su propio ensamblador (lib/obras.mjs): cada
// esquema es suyo y el contrato con el lector también.
if (obraId !== 'henry') {
  const { obra: obraDe } = await import('../lib/obras.mjs');
  const O = obraDe(obraId);
  const letra = args.includes('--letra') ? args[args.indexOf('--letra') + 1] : null;
  const r = O.ensambla(estado, { letra });
  console.log(`
✓ ${O.nombre}`);
  console.log(`  ${r.escritos} archivos · ${r.unidades}/${r.posibles} unidades (${Math.round(r.unidades / Math.max(1, r.posibles) * 100)}%)`);
  console.log(`  Salida: ${O.dirEs}`);
  console.log('  Recuerda: «sin revisar» hasta que el revisor apruebe en bin/consola.mjs');
  process.exit(0);
}

const libros = unLibro ? [unLibro] : librosDisponibles();
let totalEscritos = 0, totalPar = 0, totalPosibles = 0;
let refsNormalizadas = 0;
const refsDesconocidas = new Set();

for (const osis of libros) {
  if (osis === config.patronOro) continue; // Juan es humano: no se toca

  const unidades = unidadesDeLibro(osis);
  const utiles = unidades.filter((u) => {
    const r = estado.resultados.get(u.id);
    if (!r || !r.es || r.h !== u.h) return false;
    if (!['traducida', 'auditada', 'aprobada'].includes(r.estado)) return false;
    if (soloAprobadas) {
      const a = estado.auditorias.get(u.id);
      if (!a || !a.aprobada) return false;
    }
    return true;
  });
  totalPosibles += unidades.length;
  if (!utiles.length) continue;

  const en = cargaLibro(osis);
  const salida = { osis, c: {} };

  for (const u of utiles) {
    const r0 = estado.resultados.get(u.id);
    // Red de seguridad idempotente: aunque el traductor ya normaliza, aqui se
    // garantiza que NADA llegue al lector con una abreviatura que no sepa enlazar
    // (tambien cubre lo traducido antes de existir el normalizador).
    const norm = normalizaReferencias(r0.es);
    if (norm.cambios.length) refsNormalizadas += norm.cambios.length;
    if (norm.desconocidas.length) norm.desconocidas.forEach((d) => refsDesconocidas.add(d));
    const r = { ...r0, es: norm.texto };
    const capEn = en.c[u.cap];
    salida.c[u.cap] ??= { r: null, s: [] };
    const cap = salida.c[u.cap];

    if (u.tipo === 'r') { cap.r = r.es; continue; }

    // la sección se crea con la forma del original: mismas posiciones, mismo ancla
    const secEn = capEn.s[u.sec];
    cap.s[u.sec] ??= { t: '', v: secEn?.v ?? null, p: (secEn?.p ?? []).map(() => '') };
    if (u.tipo === 't') cap.s[u.sec].t = r.es;
    else cap.s[u.sec].p[u.par] = r.es;
  }

  // rellena huecos de secciones no tocadas para no romper los índices del lector
  for (const [cap, c] of Object.entries(salida.c)) {
    const secsEn = en.c[cap].s || [];
    for (let i = 0; i < secsEn.length; i++) {
      c.s[i] ??= { t: '', v: secsEn[i].v ?? null, p: (secsEn[i].p || []).map(() => '') };
    }
  }

  const ruta = path.join(HENRY_ES, `${osis}.json`);
  fs.writeFileSync(ruta, JSON.stringify(salida));
  totalEscritos++;
  totalPar += utiles.length;
  console.log(`  ✓ ${osis}: ${utiles.length}/${unidades.length} unidades (${Math.round((utiles.length / unidades.length) * 100)}%)`);
}

if (!totalEscritos) {
  console.log('\nNada que ensamblar: no hay unidades traducidas. El manifiesto no se toca.');
  process.exit(0);
}

// manifiesto de cobertura, en la forma que ya usa el lector
const mfRuta = path.join(HENRY_ES, '_manifest.json');
const mf = fs.existsSync(mfRuta) ? JSON.parse(fs.readFileSync(mfRuta, 'utf8')) : { cobertura: {} };
mf.cobertura ??= {};
for (const osis of libros) {
  if (osis === config.patronOro) continue;
  const ruta = path.join(HENRY_ES, `${osis}.json`);
  if (!fs.existsSync(ruta)) continue;
  const unidades = unidadesDeLibro(osis);
  const traducidas = unidades.filter((u) => {
    const r = estado.resultados.get(u.id);
    return r && r.es && r.h === u.h;
  });
  const hechas = traducidas.length;
  mf.cobertura[osis] = {
    // SOLO los capitulos con contenido traducido: listar todos los del libro
    // hacia parecer completa una cobertura del 1%.
    capitulos: [...new Set(traducidas.map((u) => String(u.cap)))].sort((a, b) => a - b),
    parrafos_traducidos: hechas,
    parrafos_total: unidades.length,
    revisado_humano: false,
    origen: 'motor automático (sin revisar)',
  };
}
mf.fecha = new Date().toISOString().slice(0, 10);
mf.licencia = 'Traducción propia CC BY 4.0 (B18) · obra original de dominio público';
fs.writeFileSync(mfRuta, JSON.stringify(mf, null, 2));

console.log(`\n✓ ${totalEscritos} libros escritos · ${totalPar} unidades · ${Math.round((totalPar / Math.max(1, totalPosibles)) * 100)}% del corpus`);
console.log(`  Salida: ${HENRY_ES}`);
if (refsNormalizadas) console.log(`  ${refsNormalizadas} referencias normalizadas al ensamblar`);
if (refsDesconocidas.size) {
  console.log(`  ⚠ abreviaturas que el lector NO enlaza: ${[...refsDesconocidas].join(', ')}`);
  console.log('    Añádelas a ALIAS en lib/referencias.mjs y vuelve a ensamblar.');
}
console.log('  Recuerda: la etiqueta «sin revisar» sigue activa hasta que el revisor apruebe en bin/consola.mjs');
