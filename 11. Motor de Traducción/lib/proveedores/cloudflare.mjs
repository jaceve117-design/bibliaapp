/**
 * Adaptador Cloudflare Workers AI (modelos `@cf/…`) como TRADUCTOR.
 *
 * Ojo con la facturación, que no es la misma que la de Jev:
 *  · `@cf/…`        → Workers AI. 10.000 neuronas/día gratis, luego tarifa por modelo.
 *                     NO consume el saldo prepagado del AI Gateway.
 *  · `typesafe/jev` → modelo de terceros. SÍ consume ese saldo (Unified Billing).
 *
 * Existe para responder una pregunta concreta y cara: ¿hace falta pagar ~198 USD
 * de Sonnet, o un modelo alojado en Cloudflare se acerca lo bastante a la vara
 * de Juan? Lo decide `bin/piloto.mjs --traductor`, no la intuición.
 */
const cuenta = () => process.env.CLOUDFLARE_ACCOUNT_ID;
const token = () => process.env.CLOUDFLARE_API_TOKEN;

export function disponible() { return !!(cuenta() && token()); }

export async function completar({ modelo, prefijoFijo, cuerpo, maxTokens = 8192, temperatura = 0.2 }) {
  if (!disponible()) throw new Error('Faltan CLOUDFLARE_ACCOUNT_ID y CLOUDFLARE_API_TOKEN');

  const res = await fetch(`https://api.cloudflare.com/client/v4/accounts/${cuenta()}/ai/run/${modelo}`, {
    method: 'POST',
    headers: { 'content-type': 'application/json', authorization: `Bearer ${token()}` },
    body: JSON.stringify({
      messages: [
        { role: 'system', content: prefijoFijo },
        { role: 'user', content: cuerpo },
      ],
      max_tokens: maxTokens,
      temperature: temperatura,
    }),
  });

  if (!res.ok) {
    const t = await res.text();
    const e = new Error(`Cloudflare[${modelo}] ${res.status}: ${t.slice(0, 300)}`);
    e.reintentable = res.status === 429 || res.status >= 500;
    e.status = res.status;
    throw e;
  }

  const bruto = await res.json();
  if (bruto.success === false) {
    const e = new Error(`Cloudflare[${modelo}]: ${JSON.stringify(bruto.errors ?? []).slice(0, 250)}`);
    e.reintentable = /rate|capacity|timeout/i.test(e.message);
    throw e;
  }

  const r = bruto.result ?? {};
  const msg = r.choices?.[0]?.message ?? {};
  const fin = r.choices?.[0]?.finish_reason ?? null;

  // Formatos: los modelos simples devuelven `response`; los de chat, formato OpenAI.
  // Los de RAZONAMIENTO (glm, deepseek, nemotron, qwq) escriben la cadena de
  // pensamiento en `reasoning_content` y dejan `content` VACÍO si max_tokens se
  // agota antes de responder — un fallo mudo si no se mira `finish_reason`.
  let texto = r.response ?? msg.content ?? r.result?.response ?? '';

  if (!texto && msg.reasoning_content) {
    // a veces el JSON pedido ya está escrito dentro del razonamiento: se rescata
    const m = String(msg.reasoning_content).match(/\{[\s\S]*"u"[\s\S]*\}/);
    if (m) texto = m[0];
  }

  if (!texto && fin === 'length') {
    const e = new Error(
      `Cloudflare[${modelo}]: se agotó max_tokens (${r.usage?.completion_tokens ?? '?'}) ` +
      `razonando (${(msg.reasoning_content ?? '').length} chars) sin llegar a responder. ` +
      'Sube max_tokens o usa un modelo sin razonamiento.');
    e.reintentable = false;
    e.razonando = true;
    throw e;
  }

  return {
    texto: typeof texto === 'string' ? texto : JSON.stringify(texto),
    finish: fin,
    razonamiento: (msg.reasoning_content ?? '').length,
    uso: {
      in: r.usage?.prompt_tokens ?? 0,
      out: r.usage?.completion_tokens ?? 0,
      neuronas: r.usage?.neurons ?? 0,
      cacheRead: 0,
      cacheWrite: 0,
    },
  };
}
