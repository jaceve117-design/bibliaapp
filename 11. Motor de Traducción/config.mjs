/**
 * Configuración del motor. Todo lo que es decisión del usuario vive aquí.
 * Las cuatro decisiones abiertas están marcadas con ⟡ y tienen valor por defecto
 * documentado: el motor arranca sin respuesta, pero el valor es una SUPOSICIÓN.
 */

export const config = {
  // ⟡ DECISIÓN 1 — modelo de traducción. El proveedor se deduce del nombre
  // (@cf/… → Cloudflare, claude-… → Anthropic, gemini… → Gemini).
  //
  // Mistral-Small-3.1-24B no es una corazonada: es el resultado medido sobre 100
  // parrafos de Juan con traduccion humana, enfrentados par a par con el mismo
  // juez (Jev). Unico modelo que NO queda por debajo del humano, y 34% mas barato
  // que Llama-3.3-70B. Ver la tabla en el README.
  traductor: {
    proveedor: process.env.MT_TRADUCTOR ?? 'cloudflare',
    modelo: process.env.MT_MODELO_TRAD ?? '@cf/mistralai/mistral-small-3.1-24b-instruct',
    // tamaño de lote en caracteres de ORIGINAL por petición.
    // 6000 ≈ 4-5 párrafos de Henry: suficiente contexto, fallo acotado.
    charsPorLote: Number(process.env.MT_CHARS_LOTE ?? 6000),
    maxUnidadesPorLote: 8,
    concurrencia: Number(process.env.MT_CONCURRENCIA ?? 3),
    reintentos: 3,
    temperatura: 0.2,
  },

  // ⟡ DECISIÓN 5 — auditor. 'jev' | 'gemini' | 'anthropic' | 'ninguno'
  // 'auto' = jev si hay JEV_API_KEY, si no gemini muestreado.
  auditor: {
    proveedor: process.env.MT_AUDITOR ?? 'auto',
    modeloJev: process.env.MT_MODELO_JEV ?? 'jev-1',
    // Con Jev se audita el 100% (cuesta ~1 USD). Sin Jev, se muestrea.
    muestreoSinJev: 0.03,
    // Jev devuelve `score` CONTINUO (p. ej. 2.64), no el índice entero del nivel:
    // es la esperanza sobre los niveles. Los umbrales son flotantes, no enteros.
    // Valores de partida; el piloto contra Juan los ajusta con datos reales.
    minFidelidad: 2.0,   // escala 0-3 · "Fiel con desviaciones menores" o mejor
    minFluidez: 1.2,     // escala 0-3 · por encima de "comprensible pero forzado"
    maxOmision: 0.5,     // probabilidad noul
    maxAdicion: 0.5,
    maxMaquina: 0.7,
    // La confianza NO entra en la decisión de aprobar: baja simplemente cuando el
    // valor cae entre dos niveles. Su uso real es ORDENAR la cola de revisión
    // humana — lo menos confiable, primero.
    umbralConfianza: 0.75,
    // 2ª opinión: juez LLM sobre lo que Jev marca
    juezModelo: process.env.MT_JUEZ ?? 'claude-opus-5',
    juezActivo: process.env.MT_JUEZ_ACTIVO !== '0',
  },

  // ⟡ DECISIÓN 3 — autocorrección.
  // Suposición (recomendada): autocorrige SOLO fallos deterministas de forma.
  // Nada doctrinal se toca sin humano: coherente con la insignia «sin revisar»
  // y con la puerta del paso 4.
  correccion: {
    autoFormato: true,      // referencias, cifras, cardinalidad, glosario
    autoDoctrinal: false,   // ← si esto se pone en true, se salta la revisión humana
    maxIntentos: 2,
  },

  // ⟡ DECISIÓN 4 — techo de gasto en USD. El motor PARA EN SECO al alcanzarlo.
  presupuesto: {
    topeUSD: Number(process.env.MT_TOPE_USD ?? 75),   // tope acordado con el editor: 75 USD para todo el proyecto
    // freno de emergencia: si el % de lotes rechazados por el validador supera
    // esto en una ventana de 50 lotes, el motor se detiene (algo se rompió).
    maxTasaRechazo: 0.25,
    ventanaRechazo: 50,
  },

  // ⟡ DECISIÓN 2 — orden de la cola.
  // Suposición: NT completo → GEN/PSA/PRO → resto del AT. Es donde se usa el lector.
  orden: [
    'MAT','MRK','LUK','JHN','ACT','ROM','1CO','2CO','GAL','EPH','PHP','COL',
    '1TH','2TH','1TI','2TI','TIT','PHM','HEB','JAS','1PE','2PE','1JN','2JN','3JN','JUD','REV',
    'GEN','PSA','PRO',
    'EXO','LEV','NUM','DEU','JOS','JDG','RUT','1SA','2SA','1KI','2KI','1CH','2CH',
    'EZR','NEH','EST','JOB','ECC','SNG','ISA','JER','LAM','EZK','DAN','HOS','JOL','AMO',
    'OBA','JON','MIC','NAM','HAB','ZEP','HAG','ZEC','MAL',
  ],

  // Juan ya está traducido a mano y es el PATRÓN DE ORO. No se retraduce:
  // se usa para calibrar el motor y el auditor.
  patronOro: 'JHN',

  // Cloudflare Workers AI (@cf/...) NO factura por tokens sino por NEURONAS.
  // 10.000 neuronas/dia gratis; despues 0,011 USD por cada 1.000.
  // `neuronasPorChar` es una MEDICION real por modelo (parrafo patron de 1.309
  // chars con el prefijo completo), no una estimacion teorica: sirve para
  // presupuestar antes de lanzar.
  workersAI: {
    usdPorMilNeuronas: 0.011,
    gratisPorDia: 10000,
    neuronasPorChar: {
      '@cf/mistralai/mistral-small-3.1-24b-instruct': 0.0817,
      '@cf/meta/llama-4-scout-17b-16e-instruct': 0.0705,
      '@cf/meta/llama-3.3-70b-instruct-fp8-fast': 0.1138,
      '@cf/nvidia/nemotron-3-120b-a12b': 0.4286,
      '@cf/deepseek-ai/deepseek-v4-pro-0813': 1.2697,
      '@cf/zai-org/glm-5.3': 1.9289,
    },
    neuronasPorCharDefecto: 0.5,
  },

  // Precios USD por millón de tokens (actualizar si cambian).
  precios: {
    'claude-sonnet-5':   { in: 3.00,  out: 15.00, cacheRead: 0.30, cacheWrite: 3.75 },
    'claude-opus-5':     { in: 15.00, out: 75.00, cacheRead: 1.50, cacheWrite: 18.75 },
    'gemini-flash':      { in: 0.30,  out: 2.50,  cacheRead: 0.075, cacheWrite: 0.30 },
    'jev-1':             { in: 0.042, out: 0.00,  cacheRead: 0.042, cacheWrite: 0.042 },
  },
};

export default config;
