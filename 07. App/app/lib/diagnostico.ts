"use client";

/**
 * Diagnóstico AION — registro interno de eventos para cazar bugs (decisión del usuario).
 *
 * QUÉ REGISTRA (todo LOCAL, en este dispositivo, hasta que el usuario lo descargue):
 *  · toque    — cada tap/click: marca de tiempo, coordenadas (client y página),
 *               objetivo (etiqueta, id, clase, texto ≤80 chars), viewport.
 *  · navega    — cambios de URL (hash/ruta): de → a.
 *  · red       — cada respuesta fetch/XHR: método, URL, estado HTTP, duración ms, bytes.
 *               NUNCA el cuerpo de la petición/respuesta (privacidad y tamaño).
 *  · error     — errores JS no capturados (window.onerror, unhandledrejection) con pila ≤700.
 *  · consola   — console.error / console.warn (mensaje ≤220).
 *  · app       — sesión (arranque, UA, viewport, idioma, online), visibilidad, conexión.
 *
 * ALMACENAMIENTO: búfer circular en memoria (4.000 eventos) + espejo en
 * localStorage `diagnostico:v1` (~350 KB, expulsa los más viejos) para que el
 * registro SOBREVIVA a recargas y cierres — es donde viven los bugs difíciles.
 * Escritura diferida (3 s) y forzada al ocultar/cerrar la página.
 *
 * SALIDA: exportaDiagnostico({horas, formato}) → .md estructurado o .txt (JSONL).
 *
 * RENDIMIENTO: listeners pasivos, nada en touchmove, try/catch en cada gancho:
 * el diagnóstico JAMÁS debe romper la app que está diagnosticando.
 */

export type EvBase = { t: number; iso: string; tipo: string };
export type EvToque = EvBase & {
  tipo: "toque";
  modo: string;
  x: number; y: number; px: number; py: number;
  etiqueta: string; id: string; clase: string; texto: string;
  vista: string;
};
export type EvNavega = EvBase & { tipo: "navega"; de: string; a: string };
export type EvRed = EvBase & {
  tipo: "red";
  metodo: string; url: string; estado: number; ms: number; bytes: number; fallo: string;
};
export type EvError = EvBase & { tipo: "error"; mensaje: string; pila: string; fuente: string };
export type EvConsola = EvBase & { tipo: "consola"; nivel: string; mensaje: string };
export type EvApp = EvBase & { tipo: "app"; clave: string; detalle: string };

export type Evento = EvToque | EvNavega | EvRed | EvError | EvConsola | EvApp;

const CLAVE = "diagnostico:v1";
const MAX_MEMORIA = 4000;
const MAX_PERSISTENCIA = 360_000; // bytes aprox de JSON en localStorage

let memoria: Evento[] = [];
let iniciado = false;
let pausado = false;
let sucio = false;
let temporizador: ReturnType<typeof setInterval> | null = null;
let ultimoHash = "";

const recorta = (s: unknown, n: number) => String(s ?? "").replace(/\s+/g, " ").trim().slice(0, n);

function ahora(): { t: number; iso: string } {
  const t = Date.now();
  return { t, iso: new Date(t).toISOString() };
}

function vistaActual(): string {
  try {
    return `${window.innerWidth}×${window.innerHeight}@${window.devicePixelRatio || 1}x`;
  } catch {
    return "?";
  }
}

function registra(ev: Evento) {
  if (pausado) return;
  memoria.push(ev);
  if (memoria.length > MAX_MEMORIA) memoria.splice(0, memoria.length - MAX_MEMORIA);
  sucio = true;
}

function persiste(forzado = false) {
  if (!sucio && !forzado) return;
  try {
    // del final hacia atrás hasta caber en el tope de bytes
    let fuera = "";
    let i = memoria.length;
    while (i > 0 && fuera.length < MAX_PERSISTENCIA) {
      i -= 1;
      fuera = JSON.stringify(memoria[i]) + "\n" + fuera;
    }
    const trozo = fuera.length > MAX_PERSISTENCIA ? fuera.slice(fuera.length - MAX_PERSISTENCIA) : fuera;
    const lineas = trozo.split("\n").filter(Boolean);
    lineas.shift(); // la primera puede quedar cortada por el recorte de bytes
    localStorage.setItem(CLAVE, JSON.stringify({ v: 1, lineas }));
    sucio = false;
  } catch {
    /* almacenamiento lleno o bloqueado: el registro vive solo en memoria */
  }
}

function restaura() {
  try {
    const bruto = localStorage.getItem(CLAVE);
    if (!bruto) return;
    const { lineas } = JSON.parse(bruto) as { lineas: string[] };
    const vivos: Evento[] = [];
    for (const l of lineas) {
      try {
        const e = JSON.parse(l) as Evento;
        // caducidad 48 h: lo más viejo no vale para diagnosticar
        if (Date.now() - e.t < 48 * 3600_000) vivos.push(e);
      } catch { /* línea rota: se descarta */ }
    }
    memoria = vivos.slice(-MAX_MEMORIA);
  } catch { /* sin registro previo */ }
}

/** Describe un objetivo de toque sin filtrar contenido sensible (solo forma). */
function describeObjetivo(el: EventTarget | null): Pick<EvToque, "etiqueta" | "id" | "clase" | "texto"> {
  try {
    const e = el as HTMLElement | null;
    if (!e || !(e as HTMLElement).tagName) return { etiqueta: "?", id: "", clase: "", texto: "" };
    const texto = recorta(e.innerText || e.textContent || "", 80);
    return {
      etiqueta: e.tagName.toLowerCase(),
      id: recorta(e.id, 60),
      clase: recorta(typeof e.className === "string" ? e.className : "", 60),
      texto,
    };
  } catch {
    return { etiqueta: "?", id: "", clase: "", texto: "" };
  }
}

// — ganchos de captura (todos a prueba de fallos) —

function ganchoEntradas() {
  document.addEventListener(
    "click",
    (e) => {
      try {
        const o = describeObjetivo(e.target);
        registra({
          ...ahora(), tipo: "toque", modo: "click",
          x: e.clientX, y: e.clientY, px: e.pageX, py: e.pageY,
          ...o, vista: vistaActual(),
        } as unknown as Evento);
      } catch { /* nunca romper */ }
    },
    { capture: true, passive: true }
  );
  document.addEventListener(
    "touchstart",
    (e) => {
      try {
        const t0 = e.touches?.[0];
        if (!t0) return;
        const o = describeObjetivo(e.target);
        registra({
          ...ahora(), tipo: "toque", modo: "touch",
          x: Math.round(t0.clientX), y: Math.round(t0.clientY),
          px: Math.round(t0.pageX), py: Math.round(t0.pageY),
          ...o, vista: vistaActual(),
        } as unknown as Evento);
      } catch { /* nunca romper */ }
    },
    { capture: true, passive: true }
  );
}

function ganchoNavegacion() {
  const anota = (de: string, a: string) => {
    if (de === a) return;
    registra({ ...ahora(), tipo: "navega", de: recorta(de, 200), a: recorta(a, 200) });
  };
  try {
    ultimoHash = location.href;
    window.addEventListener("hashchange", () => {
      anota(ultimoHash, location.href);
      ultimoHash = location.href;
    });
    window.addEventListener("popstate", () => {
      anota(ultimoHash, location.href);
      ultimoHash = location.href;
    });
    const empuja = history.pushState;
    history.pushState = function (...args: Parameters<typeof empuja>) {
      const de = location.href;
      const r = empuja.apply(this, args);
      anota(de, location.href);
      ultimoHash = location.href;
      return r;
    };
    const reemplaza = history.replaceState;
    history.replaceState = function (...args: Parameters<typeof reemplaza>) {
      const de = location.href;
      const r = reemplaza.apply(this, args);
      anota(de, location.href);
      ultimoHash = location.href;
      return r;
    };
  } catch { /* nunca romper */ }
}

function ganchoRed() {
  try {
    const original = window.fetch;
    window.fetch = async function (...args: Parameters<typeof fetch>) {
      const t0 = performance.now();
      const entrada = args[0];
      const url = typeof entrada === "string" ? entrada : (entrada as Request)?.url ?? "?";
      const metodo = (args[1]?.method || (entrada as Request)?.method || "GET").toUpperCase();
      try {
        const r = await original.apply(this, args);
        registra({
          ...ahora(), tipo: "red", metodo: recorta(metodo, 8),
          url: recorta(url, 200), estado: r.status,
          ms: Math.round(performance.now() - t0),
          bytes: Number(r.headers?.get?.("content-length")) || 0,
          fallo: r.ok ? "" : `HTTP ${r.status}`,
        });
        return r;
      } catch (err) {
        registra({
          ...ahora(), tipo: "red", metodo: recorta(metodo, 8),
          url: recorta(url, 200), estado: 0,
          ms: Math.round(performance.now() - t0), bytes: 0,
          fallo: recorta((err as Error)?.message || "red", 120),
        });
        throw err;
      }
    };
  } catch { /* nunca romper */ }
}

function ganchoErrores() {
  window.addEventListener("error", (e) => {
    try {
      registra({
        ...ahora(), tipo: "error",
        mensaje: recorta(e.message, 300),
        pila: recorta(e.error?.stack, 700),
        fuente: recorta(`${e.filename}:${e.lineno}:${e.colno}`, 120),
      });
    } catch { /* nunca romper */ }
  });
  window.addEventListener("unhandledrejection", (e) => {
    try {
      const r = e.reason;
      registra({
        ...ahora(), tipo: "error",
        mensaje: recorta(r?.message || String(r), 300),
        pila: recorta(r?.stack, 700),
        fuente: "promesa sin manejar",
      });
    } catch { /* nunca romper */ }
  });
  const originalError = console.error.bind(console);
  console.error = (...args: unknown[]) => {
    try {
      registra({ ...ahora(), tipo: "consola", nivel: "error", mensaje: recorta(args.map(String).join(" "), 220) });
    } catch { /* nunca romper */ }
    originalError(...args);
  };
  const originalWarn = console.warn.bind(console);
  console.warn = (...args: unknown[]) => {
    try {
      registra({ ...ahora(), tipo: "consola", nivel: "warn", mensaje: recorta(args.map(String).join(" "), 220) });
    } catch { /* nunca romper */ }
    originalWarn(...args);
  };
}

function ganchoApp() {
  const anota = (clave: string, detalle = "") =>
    registra({ ...ahora(), tipo: "app", clave, detalle: recorta(detalle, 160) });
  try {
    anota("sesion", `${navigator.userAgent} · ${idioma()} · ${vistaActual()} · ${location.href}`);
    document.addEventListener("visibilitychange", () =>
      anota(document.hidden ? "oculta" : "visible")
    );
    window.addEventListener("online", () => anota("conexion", "online"));
    window.addEventListener("offline", () => anota("conexion", "offline"));
    window.addEventListener("pagehide", () => persiste(true));
    document.addEventListener("visibilitychange", () => {
      if (document.hidden) persiste(true);
    });
  } catch { /* nunca romper */ }
}

function idioma(): string {
  try { return navigator.language || "?"; } catch { return "?"; }
}

/** Arranque idempotente: llama una vez desde el montaje global de la app. */
export function iniciaDiagnostico() {
  if (iniciado || typeof window === "undefined") return;
  iniciado = true;
  try {
    pausado = localStorage.getItem("diagnostico:pausa") === "1";
  } catch { /* sin persistencia */ }
  restaura();
  ganchoApp();
  ganchoEntradas();
  ganchoNavegacion();
  ganchoRed();
  ganchoErrores();
  temporizador = setInterval(() => persiste(), 3000);
}

export function estadoDiagnostico() {
  const t0 = memoria.length ? memoria[0].t : 0;
  const t1 = memoria.length ? memoria[memoria.length - 1].t : 0;
  const porTipo: Record<string, number> = {};
  for (const e of memoria) porTipo[e.tipo] = (porTipo[e.tipo] || 0) + 1;
  return {
    total: memoria.length,
    desde: t0 ? new Date(t0).toISOString() : "",
    hasta: t1 ? new Date(t1).toISOString() : "",
    porTipo,
    pausado,
  };
}

export function alternaPausaDiagnostico(): boolean {
  pausado = !pausado;
  try { localStorage.setItem("diagnostico:pausa", pausado ? "1" : "0"); } catch { /* sin persistencia */ }
  registra({ ...ahora(), tipo: "app", clave: pausado ? "captura-pausada" : "captura-reanudada", detalle: "" });
  return pausado;
}

export function vaciaDiagnostico() {
  memoria = [];
  try { localStorage.removeItem(CLAVE); } catch { /* sin persistencia */ }
  sucio = false;
}

const NOMENCLATURA: Record<string, string> = {
  toque: "Toque (entrada del usuario)",
  navega: "Navegación (respuesta de la app)",
  red: "Red (respuesta de la app)",
  error: "Error JavaScript",
  consola: "Consola",
  app: "Aplicación",
};

function lineasDesde(horas: number | null): Evento[] {
  if (horas == null) return memoria;
  const corte = Date.now() - horas * 3600_000;
  return memoria.filter((e) => e.t >= corte);
}

function aTxt(eventos: Evento[], etiquetaVentana: string): string {
  const cab = [
    `# AION · registro de diagnóstico`,
    `# generado: ${new Date().toISOString()}`,
    `# ventana: ${etiquetaVentana} · eventos: ${eventos.length}`,
    `# formato: JSONL — un evento por línea; t=ms época, iso=ISO-8601`,
    "",
  ].join("\n");
  return cab + eventos.map((e) => JSON.stringify(e)).join("\n") + "\n";
}

function aMd(eventos: Evento[], etiquetaVentana: string): string {
  const L: string[] = [];
  L.push(`# AION — Informe de diagnóstico`);
  L.push("");
  L.push(`- **Generado:** ${new Date().toISOString()}`);
  L.push(`- **Ventana:** ${etiquetaVentana}`);
  L.push(`- **Eventos:** ${eventos.length}`);
  if (memoria.length) {
    L.push(`- **Sesión/dispositivo:** ${vistaActual()} · ${idioma()}`);
  }
  L.push("");
  // resumen por tipo
  const porTipo: Record<string, number> = {};
  for (const e of eventos) porTipo[e.tipo] = (porTipo[e.tipo] || 0) + 1;
  L.push(`## Resumen`);
  L.push("");
  L.push(`| Tipo | Nº |`);
  L.push(`|---|---|`);
  for (const [k, v] of Object.entries(porTipo).sort((a, b) => b[1] - a[1])) {
    L.push(`| ${NOMENCLATURA[k] ?? k} | ${v} |`);
  }
  L.push("");
  // errores primero: son lo que se viene a buscar
  const errores = eventos.filter((e) => e.tipo === "error") as EvError[];
  if (errores.length) {
    L.push(`## Errores JavaScript (${errores.length})`);
    L.push("");
    for (const e of errores.slice(-40)) {
      L.push(`### ${e.iso} · ${e.fuente}`);
      L.push("");
      L.push("```");
      L.push(e.mensaje);
      if (e.pila) L.push(e.pila);
      L.push("```");
      L.push("");
    }
  }
  // respuestas de red con fallo
  const redMala = (eventos.filter((e) => e.tipo === "red") as EvRed[]).filter((e) => e.fallo);
  if (redMala.length) {
    L.push(`## Respuestas de red con fallo (${redMala.length})`);
    L.push("");
    L.push(`| Hora | Método | Estado | ms | URL |`);
    L.push(`|---|---|---|---|---|`);
    for (const e of redMala.slice(-60)) {
      L.push(`| ${e.iso.slice(11, 23)} | ${e.metodo} | ${e.fallo} | ${e.ms} | ${e.url} |`);
    }
    L.push("");
  }
  // consola
  const consola = eventos.filter((e) => e.tipo === "consola") as EvConsola[];
  if (consola.length) {
    L.push(`## Consola (${consola.length})`);
    L.push("");
    for (const e of consola.slice(-60)) L.push(`- \`${e.iso.slice(11, 23)}\` **${e.nivel}** — ${e.mensaje}`);
    L.push("");
  }
  // cronología completa (toques + navegación + red ok + app)
  L.push(`## Cronología completa (${eventos.length})`);
  L.push("");
  for (const e of eventos) {
    const h = e.iso.slice(11, 23);
    if (e.tipo === "toque") {
      L.push(`- \`${h}\` TOQUE [${e.modo}] (${e.x}, ${e.y}) pág(${e.px}, ${e.py}) → <${e.etiqueta}${e.id ? "#" + e.id : ""}${e.clase ? "." + e.clase.split(" ")[0] : ""}> ${e.texto ? "«" + e.texto + "»" : ""}`);
    } else if (e.tipo === "navega") {
      L.push(`- \`${h}\` NAVEGA ${e.de} → ${e.a}`);
    } else if (e.tipo === "red") {
      L.push(`- \`${h}\` RED ${e.metodo} ${e.estado || "—"} ${e.ms}ms ${e.fallo ? "FALLO " + e.fallo + " " : ""}${e.url}`);
    } else if (e.tipo === "app") {
      L.push(`- \`${h}\` APP ${e.clave}${e.detalle ? " — " + e.detalle : ""}`);
    } else if (e.tipo === "error") {
      L.push(`- \`${h}\` ERROR ${e.mensaje} (${e.fuente})`);
    } else if (e.tipo === "consola") {
      L.push(`- \`${h}\` CONSOLA ${e.nivel}: ${e.mensaje}`);
    }
  }
  L.push("");
  return L.join("\n");
}

/** Genera el contenido del informe. horas=null → todo el búfer. */
export function generaInforme(horas: number | null, formato: "md" | "txt"): string {
  const eventos = lineasDesde(horas);
  const etiqueta = horas == null ? "completa (hasta 48 h retenidas)" : `últimas ${horas} h`;
  if (formato === "txt") return aTxt(eventos, etiqueta);
  return aMd(eventos, etiqueta);
}

/** Descarga el informe como archivo. Devuelve el nombre generado. */
export function descargaInforme(horas: number | null, formato: "md" | "txt"): string {
  const contenido = generaInforme(horas, formato);
  const d = new Date();
  const sello = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}${String(d.getDate()).padStart(2, "0")}-${String(d.getHours()).padStart(2, "0")}${String(d.getMinutes()).padStart(2, "0")}`;
  const nombre = `aion-diagnostico-${sello}.${formato}`;
  try {
    const blob = new Blob([contenido], { type: formato === "md" ? "text/markdown;charset=utf-8" : "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = nombre;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 4000);
  } catch { /* sin descarga posible */ }
  return nombre;
}
