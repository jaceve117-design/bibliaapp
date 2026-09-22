/**
 * Adaptador Jev (TypeSafe AI, System One Model).
 *
 * Jev NO genera texto: devuelve valores tipados con probabilidad calibrada.
 * Por eso NO traduce — audita. Como la salida es gratis y la entrada cuesta
 * 0,042 USD/M, auditar el 100% del corpus cuesta ~1 USD en vez de ~70.
 * Eso convierte el control de calidad de muestral en CENSAL.
 *
 * Contrato: POST https://api.typesafe.ai/v1/systemone
 *   Authorization: Bearer <clave> · {state, model, questions{}} → {answers{}, usage{}}
 * Primitivas: noul (probabilidad de una proposición), choice (una opción de ≤255),
 *             score (nivel ordenado). Las tres caben en una sola petición.
 *
 * DOS RUTAS DE ACCESO (se elige sola según las variables de entorno):
 *
 *  A) Cloudflare Workers AI — modelo `typesafe/jev`. NO requiere lista de espera,
 *     sólo la cuenta de Cloudflare que este proyecto ya usa para Pages.
 *       CLOUDFLARE_ACCOUNT_ID + CLOUDFLARE_API_TOKEN
 *  B) TypeSafe directo — api.typesafe.ai, acceso anticipado.
 *       JEV_API_KEY
 */
const URL_S1 = process.env.JEV_URL ?? 'https://api.typesafe.ai/v1/systemone';
const CF_CUENTA = () => process.env.CLOUDFLARE_ACCOUNT_ID;
const CF_TOKEN = () => process.env.CLOUDFLARE_API_TOKEN;

export function rutaCloudflare() { return !!(CF_CUENTA() && CF_TOKEN()); }
export function disponible() { return !!process.env.JEV_API_KEY || rutaCloudflare(); }
export function rutaActiva() { return rutaCloudflare() ? 'cloudflare' : (process.env.JEV_API_KEY ? 'typesafe' : 'ninguna'); }

/** Rúbrica de auditoría de traducción. Una petición cubre las 7 preguntas. */
export const RUBRICA = {
  fidelidad: {
    type: 'score',
    instructions: 'Evalúa si la traducción al español transmite exactamente el contenido y el argumento del original inglés.',
    criteria: ['Tergiversa o pierde el argumento', 'Fiel con desviaciones apreciables', 'Fiel con desviaciones menores', 'Fiel y preciso'],
  },
  fluidez: {
    type: 'score',
    instructions: 'Evalúa la calidad del español como prosa. ATENCIÓN: el encargo exige conservar ' +
      'la sintaxis periódica y el registro devocional de 1706. Los periodos largos, el orden ' +
      'de palabras arcaico y el vocabulario culto NO son defectos: son el objetivo. Penaliza ' +
      'sólo lo que un lector culto no podría entender o lo que sea agramatical.',
    criteria: ['Español agramatical o incomprensible', 'Comprensible pero mal construido', 'Correcto', 'Prosa bien construida en el registro pedido'],
  },
  registro: {
    type: 'score',
    instructions: 'El original es prosa devocional puritana de 1706: culta pero pastoral y directa. Evalúa si la traducción conserva ese registro.',
    criteria: ['Registro equivocado (coloquial o academizado)', 'Registro aceptable', 'Registro conservado con precisión'],
  },
  omision: {
    type: 'noul',
    instructions: 'La traducción omite contenido, cláusulas o matices presentes en el original.',
    criteria: { true: 'Falta contenido del original', false: 'Todo el contenido está presente' },
  },
  adicion: {
    type: 'noul',
    instructions: 'La traducción añade contenido, glosa o explicación que no está en el original.',
    criteria: { true: 'Añade material ajeno al original', false: 'No añade nada' },
  },
  maquina: {
    type: 'noul',
    instructions: 'La traducción suena a traducción automática literal en lugar de a prosa española escrita por un traductor.',
    criteria: { true: 'Suena a máquina', false: 'Suena a prosa escrita' },
  },
  fallo: {
    type: 'choice',
    instructions: 'Si hay un defecto dominante, clasifícalo. Si la traducción es buena, elige "ninguno".',
    criteria: {
      ninguno: 'La traducción es correcta',
      omision: 'Falta contenido del original',
      literalidad: 'Calco servil que produce español agramatical o incomprensible. NO es literalidad el periodo largo, el hiperbaton ni el orden arcaico: son deliberados en esta obra.',
      registro: 'Tono equivocado: coloquial, modernizado o academizado. El tono culto y arcaico es el CORRECTO.',
      terminologia: 'Término doctrinal mal traducido o inconsistente',
      gramatica: 'Errores de gramática, concordancia u ortografía',
      referencias: 'Referencia bíblica perdida, alterada o mal abreviada',
    },
  },
};

/**
 * El `state` incluye el ENCARGO, no sólo el par de textos.
 *
 * Sin él, Jev juzga contra un español moderno genérico y marca como «literalidad»
 * la sintaxis periódica que esta traducción conserva a propósito. Medido: 4 de 25
 * falsos positivos sobre la traducción humana de Juan venían exactamente de ahí.
 */
export const ENCARGO =
  'ENCARGO DE TRADUCCIÓN: prosa devocional puritana de 1706 (Matthew Henry), del ' +
  'inglés al español. El encargo EXIGE conservar el registro culto y pastoral, los ' +
  'periodos largos, las enumeraciones (I., II., 1., 2.) y el sabor arcaico del ' +
  'original. Que la traducción suene antigua y de periodo largo es CORRECTO y buscado: ' +
  'no es defecto. Modernizarla o simplificarla SÍ sería defecto. Juzga contra ese ' +
  'encargo, no contra el español periodístico actual.';

export function estadoDePar(en, es) {
  return `${ENCARGO}\n\nORIGINAL (inglés, Matthew Henry 1706):\n${en}\n\nTRADUCCIÓN (español, a evaluar):\n${es}`;
}

export async function audita({ modelo = 'jev-latest', en, es, rubrica = RUBRICA }) {
  const state = estadoDePar(en, es);
  const porCF = rutaCloudflare();

  const url = porCF
    ? `https://api.cloudflare.com/client/v4/accounts/${CF_CUENTA()}/ai/run`
    : URL_S1;
  const clave = porCF ? CF_TOKEN() : process.env.JEV_API_KEY;
  if (!clave) throw new Error('Falta JEV_API_KEY o CLOUDFLARE_ACCOUNT_ID+CLOUDFLARE_API_TOKEN');

  // Cloudflare envuelve la petición en `input` y la respuesta en `result`.
  const cuerpo = porCF
    ? { model: 'typesafe/jev', input: { state, questions: rubrica } }
    : { model: modelo, state, questions: rubrica };

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'content-type': 'application/json', authorization: `Bearer ${clave}` },
    body: JSON.stringify(cuerpo),
  });
  if (!res.ok) {
    const t = await res.text();
    const e = new Error(`Jev[${porCF ? 'cloudflare' : 'typesafe'}] ${res.status}: ${t.slice(0, 300)}`);
    e.reintentable = res.status === 429 || res.status >= 500;
    e.status = res.status;
    throw e;
  }
  const bruto = await res.json();
  if (bruto.success === false) {
    throw new Error(`Jev[cloudflare]: ${JSON.stringify(bruto.errors ?? []).slice(0, 200)}`);
  }
  // Cloudflare anida DOS veces y añade `state`:
  //   {result:{state:"Completed", result:{model,answers,usage}, gatewayMetadata}}
  // TypeSafe directo devuelve {model,answers,usage} sin envoltura. Se aceptan ambas.
  const j = bruto?.result?.result ?? bruto?.result ?? bruto;
  const estadoCF = bruto?.result?.state;
  if (estadoCF && estadoCF !== 'Completed') {
    const e = new Error(`Jev[cloudflare] estado "${estadoCF}" (no Completed)`);
    e.reintentable = true;
    throw e;
  }
  if (!j.answers) {
    throw new Error(`Jev: respuesta sin 'answers' — ${JSON.stringify(bruto).slice(0, 200)}`);
  }
  return {
    respuestas: j.answers ?? {},
    uso: { in: j.usage?.input_tokens ?? 0, out: j.usage?.output_tokens ?? 0, cacheRead: 0, cacheWrite: 0 },
    modelo: j.model ?? (porCF ? 'typesafe/jev' : modelo),
  };
}

/** Confianza mínima entre las respuestas que la reportan. */
export function confianzaMinima(respuestas) {
  const cs = Object.values(respuestas).map((r) => r.confidence).filter((c) => typeof c === 'number');
  return cs.length ? Math.min(...cs) : 1;
}
