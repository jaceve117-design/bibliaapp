/**
 * Adaptador Anthropic. Sin SDK: fetch nativo (Node 22+).
 * El prefijo fijo va con cache_control → se paga entero una vez y luego al 10%.
 */
const URL_MSG = 'https://api.anthropic.com/v1/messages';

export function disponible() { return !!process.env.ANTHROPIC_API_KEY; }

export async function completar({ modelo, prefijoFijo, cuerpo, maxTokens = 8192, temperatura = 0.2 }) {
  const clave = process.env.ANTHROPIC_API_KEY;
  if (!clave) throw new Error('Falta ANTHROPIC_API_KEY');

  const res = await fetch(URL_MSG, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-api-key': clave,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: modelo,
      max_tokens: maxTokens,
      temperature: temperatura,
      system: [{ type: 'text', text: prefijoFijo, cache_control: { type: 'ephemeral' } }],
      messages: [{ role: 'user', content: cuerpo }],
    }),
  });

  if (!res.ok) {
    const t = await res.text();
    const e = new Error(`Anthropic ${res.status}: ${t.slice(0, 300)}`);
    e.status = res.status;
    e.reintentable = res.status === 429 || res.status >= 500;
    throw e;
  }
  const j = await res.json();
  const texto = (j.content || []).filter((c) => c.type === 'text').map((c) => c.text).join('');
  return {
    texto,
    uso: {
      in: j.usage?.input_tokens ?? 0,
      out: j.usage?.output_tokens ?? 0,
      cacheRead: j.usage?.cache_read_input_tokens ?? 0,
      cacheWrite: j.usage?.cache_creation_input_tokens ?? 0,
    },
  };
}
