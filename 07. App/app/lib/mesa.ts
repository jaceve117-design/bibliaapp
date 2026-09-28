/**
 * Mesa de trabajo (pantallas ≥ 1280 px): la Biblia fija a la izquierda y tres
 * ZONAS alrededor donde viven los cuadros de estudio (comentario, versículo,
 * cita, diccionario, notas…). Cada cuadro se arrastra por su pestaña a otra zona
 * —con ratón o con el dedo— y la disposición se recuerda.
 *
 *   ┌ libros ┬──────── Biblia ────────┬─ der-arriba ─┐
 *   │        │                        ├─ der-abajo ──┤
 *   │        ├─ abajo ───┬─ abajo-der ┤              │
 *
 * Entre 680 y 1279 px (tablet, plegable) hay dos zonas: la columna derecha y la
 * de abajo, bajo el texto; también se arrastran con el dedo.
 *
 * Aquí sólo hay geometría pura: la página decide QUÉ cuadros hay abiertos.
 */
import { useEffect, useState } from "react";

export type Zona = "der-arriba" | "der-abajo" | "abajo" | "abajo-der";
export const ZONAS: Zona[] = ["der-arriba", "der-abajo", "abajo", "abajo-der"];
export const NOMBRE_ZONA: Record<Zona, string> = {
  "der-arriba": "Derecha arriba",
  "der-abajo": "Derecha abajo",
  abajo: "Abajo izquierda",
  "abajo-der": "Abajo derecha",
};

/** Dónde nace cada cuadro si el lector no lo ha movido nunca. */
export const ZONA_POR_DEFECTO: Record<string, Zona> = {
  com: "der-arriba",
  com2: "der-abajo",
  lex: "der-arriba",
  griego: "der-arriba",
  termino: "der-arriba",
  busqueda: "der-arriba",
  fuentes: "der-arriba",
  info: "der-arriba",
  refs: "abajo",
  cita: "der-abajo",
  citas: "der-abajo",
  dic: "abajo-der",
  notas: "abajo",
};

export type Rect = { left: number; top: number; width: number; height: number };
export const ALTO_PESTANAS = 46;

/** El contenido de un cuadro: la zona menos su tira de pestañas. */
export const contenidoDe = (r: Rect): Rect => ({
  left: r.left,
  top: r.top + ALTO_PESTANAS,
  width: r.width,
  height: Math.max(0, r.height - ALTO_PESTANAS),
});

export function calcZonas(o: {
  W: number;
  H: number;
  T: number; // alto de la cabecera
  navW: number; // ancho de la navegación lateral (0 si no hay)
  R: number; // ancho de la columna derecha
  B: number; // alto de la zona de abajo
  split: number; // fracción de la columna derecha para der-arriba (0,2–0,8)
  splitAbajo: number; // fracción del ancho de abajo para la zona izquierda (0,2–0,8)
  ocupadas: Record<Zona, boolean>;
  trabajo: boolean; // ≥ 1280 px: tres zonas; si no, una sola columna
}): { mr: number; pb: number; zonas: Partial<Record<Zona, Rect>> } {
  const { W, H, T, navW, R, B, split, splitAbajo, ocupadas, trabajo } = o;
  const zonas: Partial<Record<Zona, Rect>> = {};
  const hDer = Math.max(0, H - T);
  if (!trabajo) {
    // tablet / plegable: la columna derecha (der-arriba + der-abajo juntas) y la zona de abajo
    const der = ocupadas["der-arriba"] || ocupadas["der-abajo"];
    const Rc = der ? R : 0;
    const Bc = ocupadas.abajo || ocupadas["abajo-der"] ? Math.min(B, Math.round(hDer * 0.45)) : 0;
    if (der) zonas["der-arriba"] = { left: W - Rc, top: T, width: Rc, height: hDer };
    if (Bc) zonas.abajo = { left: 0, top: H - Bc, width: W - Rc, height: Bc };
    return { mr: Rc, pb: Bc, zonas };
  }
  const derA = ocupadas["der-arriba"];
  const derB = ocupadas["der-abajo"];
  const Rr = derA || derB ? R : 0;
  const abI = ocupadas.abajo;
  const abD = ocupadas["abajo-der"];
  const Bb = abI || abD ? B : 0;
  if (derA && derB) {
    const hA = Math.round(hDer * split);
    zonas["der-arriba"] = { left: W - Rr, top: T, width: Rr, height: hA };
    zonas["der-abajo"] = { left: W - Rr, top: T + hA, width: Rr, height: hDer - hA };
  } else if (derA) zonas["der-arriba"] = { left: W - Rr, top: T, width: Rr, height: hDer };
  else if (derB) zonas["der-abajo"] = { left: W - Rr, top: T, width: Rr, height: hDer };
  const Wab = Math.max(0, W - Rr - navW);
  if (abI && abD) {
    const wI = Math.round(Wab * splitAbajo);
    zonas.abajo = { left: navW, top: H - Bb, width: wI, height: Bb };
    zonas["abajo-der"] = { left: navW + wI, top: H - Bb, width: Wab - wI, height: Bb };
  } else if (abI) zonas.abajo = { left: navW, top: H - Bb, width: Wab, height: Bb };
  else if (abD) zonas["abajo-der"] = { left: navW, top: H - Bb, width: Wab, height: Bb };
  return { mr: Rr, pb: Bb, zonas };
}

/** Tamaño de la ventana, al día al redimensionar o plegar. */
export function useVentana(): [number, number] {
  const [t, setT] = useState<[number, number]>([1280, 800]);
  useEffect(() => {
    const f = () => setT([window.innerWidth, window.innerHeight]);
    f();
    window.addEventListener("resize", f);
    return () => window.removeEventListener("resize", f);
  }, []);
  return t;
}

/** Estado que sobrevive a recargas (disposición de la mesa, tamaños…). */
export function useGuardado<T>(clave: string, inicial: T): [T, (v: T | ((p: T) => T)) => void] {
  const [v, setV] = useState<T>(inicial);
  useEffect(() => {
    try {
      const g = localStorage.getItem(clave);
      if (g != null) setV(JSON.parse(g));
    } catch {}
  }, [clave]);
  const fija = (n: T | ((p: T) => T)) =>
    setV((prev) => {
      const val = typeof n === "function" ? (n as (p: T) => T)(prev) : n;
      try { localStorage.setItem(clave, JSON.stringify(val)); } catch {}
      return val;
    });
  return [v, fija];
}
