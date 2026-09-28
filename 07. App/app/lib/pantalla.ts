/**
 * Pantallas grandes: plegables abiertos, tablets de 7″ en adelante, laptops y monitores.
 *
 * El móvil sigue siendo la base: todo lo de aquí sólo AÑADE a partir de un ancho.
 *   ≥ 680 px  → mesa de estudio: texto + columna de estudio fija a la derecha
 *              (680 y no 900: un Galaxy Z Fold abierto mide ~690 px CSS, un Pixel Fold ~840)
 *   ≥ 1280 px → además, navegación lateral a la izquierda
 */
import { useEffect, useState } from "react";

export const ANCHO_ESTUDIO = 680;
export const ANCHO_NAV = 1280;

/** true mientras la ventana cumpla la media query (se actualiza al girar o plegar). */
export function useMedia(consulta: string): boolean {
  const [si, setSi] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia(consulta);
    const cambia = () => setSi(mq.matches);
    cambia();
    mq.addEventListener("change", cambia);
    return () => mq.removeEventListener("change", cambia);
  }, [consulta]);
  return si;
}

/**
 * Publica la altura real de la cabecera en `--cab-h`: la columna de estudio y
 * la navegación se pegan justo debajo, aunque la cabecera cambie de filas.
 */
export function useAlturaCabecera() {
  useEffect(() => {
    const cab = document.querySelector<HTMLElement>(".cabecera");
    if (!cab) return;
    const fija = () => document.documentElement.style.setProperty("--cab-h", `${Math.round(cab.getBoundingClientRect().height)}px`);
    fija();
    const ro = new ResizeObserver(fija);
    ro.observe(cab);
    return () => ro.disconnect();
  }, []);
}

/** Ancho de la columna de estudio, ajustable arrastrando su borde y recordado. */
export function useAnchoEstudio(): [number, (n: number) => void] {
  const [ancho, setAncho] = useState(420);
  useEffect(() => {
    // por defecto: 420 px, o casi la mitad en un plegable (una mitad por lado de la bisagra)
    let n = Math.round(Math.min(420, window.innerWidth * 0.46));
    try {
      const g = Number(localStorage.getItem("estudio-w"));
      if (g >= 300 && g <= 900) n = Math.min(g, Math.round(window.innerWidth * 0.55));
    } catch {}
    setAncho(n);
  }, []);
  const fija = (n: number) => {
    const v = Math.round(Math.max(300, Math.min(n, window.innerWidth * 0.55, 900)));
    setAncho(v);
    try { localStorage.setItem("estudio-w", String(v)); } catch {}
  };
  return [ancho, fija];
}
