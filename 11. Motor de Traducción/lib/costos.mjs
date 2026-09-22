/**
 * Contador de gasto con TOPE DURO y freno por tasa de rechazo.
 * El motor se detiene solo; no hay forma de que una corrida nocturna
 * se lleve por delante el presupuesto.
 */
import fs from 'node:fs';
import { GASTO, aseguraDirs } from './rutas.mjs';
import { config } from '../config.mjs';

export class ParadaEnSeco extends Error {}

/**
 * Resolucion de precio por PREFIJO, no por igualdad exacta.
 *
 * La API devuelve el modelo con su version ("jev-1.13.0", "claude-sonnet-5-2026xx"),
 * que no coincide con la clave de la tabla. Antes caia al precio de Sonnet por
 * defecto y cobraba ~100x de mas en las auditorias de Jev. Medido y corregido.
 */
export function precioDe(modelo) {
  const m = String(modelo ?? '');
  if (config.precios[m]) return config.precios[m];
  const clave = Object.keys(config.precios).find((k) => m.startsWith(k.replace(/-\d+$/, '')));
  if (clave) return config.precios[clave];
  console.warn(`  ⚠ modelo sin tarifa conocida: "${m}" — se factura como claude-sonnet-5 (revisa config.precios)`);
  return config.precios['claude-sonnet-5'];
}

export class Contador {
  constructor() {
    aseguraDirs();
    this.d = fs.existsSync(GASTO)
      ? JSON.parse(fs.readFileSync(GASTO, 'utf8'))
      : { usd: 0, llamadas: 0, tokens: { in: 0, out: 0, cacheRead: 0, cacheWrite: 0 }, porModelo: {} };
    this.rechazos = [];
    this.inicial = this.d.usd;   // para informar el coste DE ESTA corrida
  }

  cobra(modelo, { in: tin = 0, out = 0, cacheRead = 0, cacheWrite = 0, neuronas = 0 }) {
    let usd;
    if (neuronas > 0) {
      // Workers AI: la factura son neuronas, no tokens. Se cobra lo que informa
      // la propia API, no una estimacion.
      usd = (neuronas / 1000) * config.workersAI.usdPorMilNeuronas;
      this.d.neuronas = (this.d.neuronas ?? 0) + neuronas;
    } else {
      const p = precioDe(modelo);
      usd = (tin * p.in + out * p.out + cacheRead * p.cacheRead + cacheWrite * p.cacheWrite) / 1e6;
    }
    this.d.usd += usd;
    this.d.llamadas++;
    this.d.tokens.in += tin; this.d.tokens.out += out;
    this.d.tokens.cacheRead += cacheRead; this.d.tokens.cacheWrite += cacheWrite;
    this.d.porModelo[modelo] ??= { usd: 0, llamadas: 0 };
    this.d.porModelo[modelo].usd += usd;
    this.d.porModelo[modelo].llamadas++;
    this.persiste();
    if (this.d.usd >= config.presupuesto.topeUSD) {
      throw new ParadaEnSeco(
        `TOPE DE GASTO ALCANZADO: ${this.d.usd.toFixed(2)} USD de ${config.presupuesto.topeUSD}. ` +
        `El motor se detiene. Sube MT_TOPE_USD para continuar (el estado está guardado).`);
    }
    return usd;
  }

  /** Freno de emergencia: si el validador rechaza demasiado, algo se rompió. */
  anotaLote(rechazado) {
    this.rechazos.push(rechazado ? 1 : 0);
    const v = config.presupuesto.ventanaRechazo;
    if (this.rechazos.length > v) this.rechazos.shift();
    if (this.rechazos.length === v) {
      const tasa = this.rechazos.reduce((a, b) => a + b, 0) / v;
      if (tasa > config.presupuesto.maxTasaRechazo) {
        throw new ParadaEnSeco(
          `FRENO DE EMERGENCIA: ${(tasa * 100).toFixed(0)}% de los últimos ${v} lotes rechazados ` +
          `(umbral ${(config.presupuesto.maxTasaRechazo * 100).toFixed(0)}%). ` +
          `Revisa el prompt o el proveedor antes de seguir quemando presupuesto.`);
      }
    }
  }

  persiste() { fs.writeFileSync(GASTO, JSON.stringify(this.d, null, 2)); }
  get usd() { return this.d.usd; }
  /** Gasto de esta corrida, no el acumulado historico. */
  get corrida() { return this.d.usd - this.inicial; }
  get restante() { return Math.max(0, config.presupuesto.topeUSD - this.d.usd); }
}
