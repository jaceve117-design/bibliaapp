/** Adaptador Gemini (traductor alternativo y juez barato). */
export function disponible() { return !!process.env.GEMINI_API_KEY; }

export async function completar({ modelo = 'gemini-flash', prefijoFijo, cuerpo, maxTokens = 8192, temperatura = 0.2 }) {
  const clave = process.env.GEMINI_API_KEY;
  if (!clave) throw new Error('Falta GEMINI_API_KEY');
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelo}:generateContent?key=${clave}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: prefijoFijo }] },
      contents: [{ role: 'user', parts: [{ text: cuerpo }] }],
      generationConfig: { temperature: temperatura, maxOutputTokens: maxTokens, responseMimeType: 'application/json' },
    }),
  });
  if (!res.ok) {
    const t = await res.text();
    const e = new Error(`Gemini ${res.status}: ${t.slice(0, 300)}`);
    e.reintentable = res.status === 429 || res.status >= 500;
    throw e;
  }
  const j = await res.json();
  const texto = j.candidates?.[0]?.content?.parts?.map((p) => p.text).join('') ?? '';
  return {
    texto,
    uso: {
      in: j.usageMetadata?.promptTokenCount ?? 0,
      out: j.usageMetadata?.candidatesTokenCount ?? 0,
      cacheRead: j.usageMetadata?.cachedContentTokenCount ?? 0,
      cacheWrite: 0,
    },
  };
}
