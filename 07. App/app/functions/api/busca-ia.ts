/**
 * Buscador de pasajes, paso 2: Jev reordena por SENTIDO los candidatos que la
 * búsqueda local (lib/busqueda.ts) ya encontró en el teléfono.
 *
 * Jev no recorre la Biblia ni genera texto: por cada candidato responde una
 * probabilidad calibrada («¿es este el pasaje que busca el lector?»). Es
 * determinista y casi gratis: ~140 tokens por candidato a 0,042 USD/M,
 * ≈0,0001 USD por búsqueda de 20 candidatos.
 *
 * La credencial vive aquí (binding AI de Pages), nunca en el cliente.
 * Límites contra abuso: tamaño de consulta y de candidatos, tope por IP y
 * caché de respuestas idénticas.
 */

type Candidato = { ref: string; texto: string };
type Env = { AI: { run: (modelo: string, entrada: unknown) => Promise<unknown> } };
type Ctx = { request: Request; env: Env; waitUntil: (p: Promise<unknown>) => void };

const MAX_CANDIDATOS = 20;
const MAX_TEXTO = 400;
const MAX_CONSULTA = 200;
const POR_MINUTO = 12;

// tope por IP, mejor esfuerzo: vive mientras vive el isolate
const cuentas = new Map<string, { t: number; n: number }>();
function excedido(ip: string) {
  const ahora = Date.now();
  const c = cuentas.get(ip);
  if (!c || ahora - c.t > 60_000) {
    cuentas.set(ip, { t: ahora, n: 1 });
    if (cuentas.size > 5000) cuentas.clear();
    return false;
  }
  return ++c.n > POR_MINUTO;
}

const json = (datos: unknown, status = 200) =>
  new Response(JSON.stringify(datos), { status, headers: { "content-type": "application/json; charset=utf-8" } });

export const onRequestPost = async ({ request, env, waitUntil }: Ctx) => {
  const ip = request.headers.get("cf-connecting-ip") ?? "?";
  if (excedido(ip)) return json({ error: "demasiadas búsquedas; espera un minuto" }, 429);

  let cuerpo: { consulta?: string; candidatos?: Candidato[] };
  try {
    cuerpo = await request.json();
  } catch {
    return json({ error: "petición ilegible" }, 400);
  }
  const consulta = String(cuerpo.consulta ?? "").trim().slice(0, MAX_CONSULTA);
  const candidatos = (Array.isArray(cuerpo.candidatos) ? cuerpo.candidatos : [])
    .slice(0, MAX_CANDIDATOS)
    .map((c) => ({ ref: String(c.ref ?? "").slice(0, 20), texto: String(c.texto ?? "").slice(0, MAX_TEXTO) }))
    .filter((c) => c.ref && c.texto);
  if (consulta.length < 3 || !candidatos.length) return json({ error: "faltan consulta o candidatos" }, 400);

  // caché: la misma consulta con los mismos candidatos da la misma respuesta
  const clave = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(consulta.toLowerCase() + "\n" + candidatos.map((c) => c.ref).join(","))
  );
  const hex = [...new Uint8Array(clave)].map((b) => b.toString(16).padStart(2, "0")).join("");
  const cacheReq = new Request(`https://cache.bibliaapp/busca-ia/${hex}`);
  const cache = (caches as unknown as { default: Cache }).default;
  const previa = await cache.match(cacheReq);
  if (previa) return previa;

  const questions: Record<string, unknown> = {};
  candidatos.forEach((c, i) => {
    questions["c" + i] = {
      type: "noul",
      instructions: `Este versículo es el pasaje que busca el lector con: «${consulta}». Versículo: ${c.texto}`,
      criteria: { true: "Es el pasaje buscado", false: "No es el pasaje buscado" },
    };
  });

  let bruto: unknown;
  try {
    bruto = await env.AI.run("typesafe/jev", {
      state: `Búsqueda de pasajes bíblicos en español. El lector describe de memoria o por su idea el versículo que busca. Consulta: «${consulta}»`,
      questions,
    });
  } catch (e) {
    return json({ error: "Jev no disponible", detalle: String(e).slice(0, 200) }, 502);
  }
  const b = bruto as { answers?: Record<string, { noul?: number }>; result?: { answers?: Record<string, { noul?: number }> } };
  const respuestas = b.answers ?? b.result?.answers;
  if (!respuestas) return json({ error: "respuesta de Jev sin answers" }, 502);

  const orden = candidatos
    .map((c, i) => ({ ref: c.ref, p: Number(respuestas["c" + i]?.noul ?? 0) }))
    .sort((a, b) => b.p - a.p);

  const res = json({ orden });
  res.headers.set("cache-control", "public, max-age=86400");
  waitUntil(cache.put(cacheReq, res.clone()));
  return res;
};
