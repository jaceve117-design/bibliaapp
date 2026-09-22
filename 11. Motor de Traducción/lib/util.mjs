export const dormir = (ms) => new Promise((r) => setTimeout(r, ms));

/** Ejecuta tareas con concurrencia limitada, preservando el orden de entrega. */
export async function conLimite(items, limite, fn) {
  const out = new Array(items.length);
  let i = 0;
  const obreros = Array.from({ length: Math.min(limite, items.length) }, async () => {
    while (true) {
      const k = i++;
      if (k >= items.length) return;
      out[k] = await fn(items[k], k);
    }
  });
  await Promise.all(obreros);
  return out;
}

/** Extrae el primer objeto JSON de una respuesta, tolerando vallas markdown. */
export function extraeJson(texto) {
  if (!texto) return null;
  const limpio = texto.replace(/^[\s\S]*?```(?:json)?\s*/i, '').replace(/```[\s\S]*$/, '');
  const cand = limpio.includes('{') ? limpio : texto;
  const ini = cand.indexOf('{'), fin = cand.lastIndexOf('}');
  if (ini === -1 || fin <= ini) return null;
  try { return JSON.parse(cand.slice(ini, fin + 1)); } catch { return null; }
}

export const barra = (hecho, total, ancho = 28) => {
  const f = total ? hecho / total : 0;
  const n = Math.round(f * ancho);
  return '[' + '#'.repeat(n) + '.'.repeat(ancho - n) + '] ' + (f * 100).toFixed(1) + '%';
};
