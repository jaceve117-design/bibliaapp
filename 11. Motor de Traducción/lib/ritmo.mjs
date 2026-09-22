/**
 * Control de ritmo contra el AI Gateway de Cloudflare.
 *
 * El gateway impone un límite "wholesale" para modelos de terceros: pasadas unas
 * 200 peticiones seguidas devuelve 429 en cadena. Medido: en una corrida de 400
 * auditorías, las primeras 201 pasaron y las 199 restantes fallaron TODAS.
 *
 * Sin esto, la auditoría censal de 28.268 unidades se estrellaría a la vuelta de
 * unos minutos y perdería la mayor parte del trabajo.
 *
 * Dos mecanismos:
 *  · freno adaptativo — al primer 429 se abre una pausa global creciente, y se
 *    relaja sola cuando vuelven a pasar peticiones;
 *  · reintento con espera exponencial y jitter, hasta `intentos`.
 */
const dormir = (ms) => new Promise((r) => setTimeout(r, ms));

let pausaHasta = 0;      // marca de tiempo hasta la que todos esperan
let castigo = 0;         // crece con cada 429, decae con cada éxito

export function esLimite(e) {
  return e?.status === 429 || /429|rate limit|too many requests/i.test(String(e?.message ?? ''));
}

export async function conRitmo(fn, { intentos = 6, etiqueta = '' } = {}) {
  for (let i = 1; i <= intentos; i++) {
    const espera = pausaHasta - Date.now();
    if (espera > 0) await dormir(espera);
    try {
      const r = await fn();
      castigo = Math.max(0, castigo - 1);   // se relaja al ir bien
      return r;
    } catch (e) {
      if (!esLimite(e) || i === intentos) throw e;
      castigo = Math.min(castigo + 2, 8);
      // pausa GLOBAL: de nada sirve que un obrero espere si los otros siguen
      // machacando el gateway.
      const ms = Math.min(60000, 1000 * 2 ** castigo) + Math.random() * 500;
      pausaHasta = Math.max(pausaHasta, Date.now() + ms);
      if (etiqueta) process.stderr.write(`\r  ⏳ límite de ritmo: pausa ${(ms / 1000).toFixed(0)}s (${etiqueta})        `);
    }
  }
}

export function estadoRitmo() {
  return { castigo, pausaRestanteMs: Math.max(0, pausaHasta - Date.now()) };
}
