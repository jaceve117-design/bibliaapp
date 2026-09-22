#!/usr/bin/env node
/**
 * BAKE-OFF DE TRADUCTORES contra el patrón de oro.
 *
 *   node bin/comparar.mjs --n 8
 *   node bin/comparar.mjs --n 8 --modelos "@cf/zai-org/glm-5.3,claude-sonnet-5"
 *
 * Responde la pregunta cara: ¿hace falta pagar ~198 USD de Sonnet, o un modelo
 * alojado en Cloudflare se acerca lo bastante?
 *
 * Método: se cogen párrafos de Juan que YA tienes traducidos a mano, cada modelo
 * los retraduce, y Jev puntúa por igual las versiones de máquina Y la humana.
 * La humana es la LÍNEA BASE: no se trata de sacar buena nota en abstracto,
 * sino de acercarse a la vara que ya tienes.
 *
 * Escribe el cotejo completo en estado/comparativa.json para que lo leas tú,
 * que es el juicio que de verdad decide.
 */
import fs from 'node:fs';
import path from 'node:path';
import '../lib/env.mjs';
import { config } from '../config.mjs';
import { verifica, HENRY_EN, HENRY_ES, ESTADO, aseguraDirs } from '../lib/rutas.mjs';
import { cargaGlosario } from '../lib/glosario.mjs';
import { validaUnidad, tieneGraves } from '../lib/validadores.mjs';
import { prefijoFijo, ejemplosDeOro, cuerpoLote } from '../lib/prompt.mjs';
import { auditaPar } from '../lib/proveedores/auditor.mjs';
import { traductor } from '../lib/proveedores/index.mjs';
import { conLimite, extraeJson } from '../lib/util.mjs';
import { Contador } from '../lib/costos.mjs';

const args = process.argv.slice(2);
const valor = (n, d) => (args.includes(n) ? args[args.indexOf(n) + 1] : d);
const N = Number(valor('--n', 8));
const MODELOS = valor('--modelos',
  '@cf/meta/llama-3.3-70b-instruct-fp8-fast,@cf/qwen/qwen3-30b-a3b-fp8,@cf/mistralai/mistral-small-3.1-24b-instruct,@cf/meta/llama-4-scout-17b-16e-instruct,@cf/openai/gpt-oss-20b,@cf/meta/llama-3.1-8b-instruct-fp8'
).split(',').map((s) => s.trim()).filter(Boolean);
const CHARS_CORPUS = 32258634;   // medido: la cola real sin Juan

verifica();
aseguraDirs();
const glosario = cargaGlosario();
// El bake-off gasta dinero real: se contabiliza como cualquier otra corrida y
// queda sujeto al mismo tope. Antes escapaba al presupuesto, que es un agujero.
const contador = new Contador();
const media = (a) => (a.length ? a.reduce((x, y) => x + y, 0) / a.length : 0);

// ── muestra del patrón de oro ──────────────────────────────────────────────
const en = JSON.parse(fs.readFileSync(path.join(HENRY_EN, 'JHN.json'), 'utf8')).c;
const esH = JSON.parse(fs.readFileSync(path.join(HENRY_ES, 'JHN.json'), 'utf8')).c;
const pares = [];
for (const cap of Object.keys(esH)) {
  (esH[cap].s || []).forEach((s, i) => {
    (s.p || []).forEach((p, j) => {
      const o = en[cap]?.s?.[i]?.p?.[j];
      if (p && p.trim() && o && o.length > 600 && o.length < 2200) {
        pares.push({ id: `JHN.${cap}.p.${i}.${j}`, en: o, es: p, chars: o.length });
      }
    });
  });
}
pares.sort((a, b) => a.chars - b.chars);
const centro = Math.floor(pares.length / 2);
const muestra = pares.slice(centro - Math.floor(N / 2), centro + Math.ceil(N / 2));

// los ejemplos de estilo NO pueden ser párrafos de la muestra: sería hacer trampa
const ejemplos = ejemplosDeOro('JHN', 2).filter((e) => !muestra.some((m) => m.en === e.en));
const PREFIJO = prefijoFijo(glosario, ejemplos);

console.log(`\nBAKE-OFF · ${muestra.length} párrafos de Juan · ${MODELOS.length} modelos`);
console.log(`  línea base: tu traducción humana, juzgada con la misma vara\n`);

// ── traducción por cada modelo ─────────────────────────────────────────────
const salidas = {};
for (const modelo of MODELOS) {
  const { impl, nombre } = traductor(modelo);
  if (!impl.disponible()) { console.log(`  ⊘ ${modelo}: sin clave para ${nombre}, se omite`); continue; }
  let n = 0;
  const t0 = Date.now();
  salidas[modelo] = await conLimite(muestra, 5, async (u) => {
    try {
      // Margen GENEROSO: varios modelos de Cloudflare razonan antes de responder
      // (Nemotron gastó 1.202 tokens de salida para 964 chars de original). Un
      // max_tokens ajustado les corta el JSON a media frase y el fallo es mudo.
      const r = await impl.completar({
        modelo, prefijoFijo: PREFIJO, cuerpo: cuerpoLote([{ id: u.id, en: u.en }]),
        maxTokens: Math.max(9000, Math.round(u.chars * 3)), temperatura: 0.2,
      });
      process.stdout.write(`\r  ${modelo}: ${++n}/${muestra.length}   `);
      const es = extraeJson(r.texto)?.u?.[0]?.es ?? '';
      const razon = es ? null
        : (r.texto ? `salida no parseable (${r.uso.out} tok, ${r.texto.length} chars): ${r.texto.slice(-90)}` : 'salida vacía');
      contador.cobra(modelo, r.uso);
      return { ...u, maquina: es, uso: r.uso, razon };
    } catch (e) {
      process.stdout.write(`\r  ${modelo}: ${++n}/${muestra.length}   `);
      return { ...u, maquina: '', error: e.message };
    }
  });
  const seg = ((Date.now() - t0) / 1000).toFixed(0);
  const ok = salidas[modelo].filter((s) => s.maquina).length;
  console.log(`\r  ✓ ${modelo}: ${ok}/${muestra.length} traducidos en ${seg}s          `);
}

// ── auditoría con Jev: máquinas + humano, misma rúbrica ────────────────────
console.log('\n  Auditando con Jev (incluida la versión humana como línea base)…');
const casos = [];
for (const u of muestra) casos.push({ modelo: '— HUMANO (oro) —', id: u.id, en: u.en, es: u.es });
for (const [modelo, filas] of Object.entries(salidas)) {
  for (const f of filas) if (f.maquina) casos.push({ modelo, id: f.id, en: f.en, es: f.maquina, humano: f.es });
}
let a = 0;
const veredictos = await conLimite(casos, 4, async (c) => {
  try {
    const v = await auditaPar({ id: `${c.modelo}#${c.id}`, en: c.en, es: c.es });
    process.stdout.write(`\r  auditoría ${++a}/${casos.length}   `);
    return { ...c, v };
  } catch (e) {
    process.stdout.write(`\r  auditoría ${++a}/${casos.length}   `);
    return { ...c, error: e.message };
  }
});

// ── tabla ──────────────────────────────────────────────────────────────────
const tabla = [];
const grupos = [...new Set(veredictos.map((v) => v.modelo))];
for (const modelo of grupos) {
  const g = veredictos.filter((v) => v.modelo === modelo && v.v);
  if (!g.length) continue;
  const filas = salidas[modelo] ?? [];
  const hechas = filas.filter((f) => f.maquina);
  const limpias = hechas.filter((f) => !tieneGraves(validaUnidad(f, f.maquina, glosario))).length;

  // Coste medido, no estimado: neuronas reales por caracter de original.
  const neur = hechas.reduce((a, f) => a + (f.uso?.neuronas ?? 0), 0);
  const chars = hechas.reduce((a, f) => a + f.chars, 0);
  const npc = chars ? neur / chars : 0;
  const usdCorpus = npc ? (CHARS_CORPUS * npc / 1000) * 0.011 : null;

  // Enfrentamiento POR PARES contra el humano, sobre el mismo parrafo.
  // El promedio simple mezcla parrafos distintos y esconde la diferencia real
  // (medido en Juan 1: promedios empatados, pares 40-18 a favor del humano).
  let gana = 0, pierde = 0, empata = 0;
  for (const v of g) {
    const h = veredictos.find((x) => x.id === v.id && x.modelo === '— HUMANO (oro) —' && x.v);
    if (!h) continue;
    const dm = v.v.fidelidad + v.v.fluidez, dh = h.v.fidelidad + h.v.fluidez;
    if (Math.abs(dm - dh) < 0.15) empata++; else if (dm > dh) gana++; else pierde++;
  }

  tabla.push({
    modelo: modelo.replace('@cf/', '').replace('-instruct', '').slice(0, 30),
    ok: `${hechas.length}/${filas.length}`,
    USD_corpus: usdCorpus === null ? '—' : '$' + usdCorpus.toFixed(0),
    fidelidad: media(g.map((v) => v.v.fidelidad)).toFixed(2),
    fluidez: media(g.map((v) => v.v.fluidez)).toFixed(2),
    'vs_humano(G-P-E)': modelo.includes('HUMANO') ? '—' : `${gana}-${pierde}-${empata}`,
    capa1: hechas.length ? `${limpias}/${hechas.length}` : '—',
  });
}
// el humano primero, para leer todo lo demás contra él
tabla.sort((x, y) => (x.modelo.includes('HUMANO') ? -1 : y.modelo.includes('HUMANO') ? 1 : Number(y.fidelidad) - Number(x.fidelidad)));
console.log('\n');
console.table(tabla);

const base = tabla.find((t) => t.modelo.includes('HUMANO'));
if (base) {
  console.log(`  Línea base humana: fidelidad ${base.fidelidad} · fluidez ${base.fluidez} · registro ${base.registro}`);
  console.log('  Un modelo sólo es candidato si se acerca a esos tres números.\n');
}

const ruta = path.join(ESTADO, 'comparativa.json');
fs.writeFileSync(ruta, JSON.stringify({ muestra: muestra.map((m) => m.id), tabla, casos: veredictos.map((v) => ({ modelo: v.modelo, id: v.id, en: v.en, es: v.es, humano: v.humano, veredicto: v.v ? { fidelidad: v.v.fidelidad, fluidez: v.v.fluidez, registro: v.v.registro, fallo: v.v.fallo, aprobada: v.v.aprobada, motivos: v.v.motivos } : null, error: v.error })) }, null, 2));
console.log(`  Cotejo completo (EN / humano / cada máquina) en:\n    ${ruta}`);
console.log('  Los números orientan; la decisión es leerlo.\n');
