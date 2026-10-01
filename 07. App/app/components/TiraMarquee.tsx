"use client";

import { useEffect, useRef } from "react";

/**
 * Tira continua de avances del proyecto: se desplaza sola y al poner el mouse
 * ENCIMA reduce la velocidad suavemente (rAF + lerp, sin saltos). Los oyentes
 * de hover van en el CONTENEDOR fijo (no en la pista que se mueve): así el
 * texto que pasa debajo del cursor quieto no dispara entra/sale en bucle.
 * Con prefers-reduced-motion queda quieta y desplazable con el dedo.
 */
export default function TiraMarquee({ items }: { items: string[] }) {
  const caja = useRef<HTMLDivElement>(null);
  const pista = useRef<HTMLDivElement>(null);
  const velocidad = useRef(0.6);
  const objetivo = useRef(0.6);

  useEffect(() => {
    const pistaEl = pista.current;
    const cajaEl = caja.current;
    if (!pistaEl || !cajaEl) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let raf = 0;
    let x = 0;
    const paso = () => {
      const mitad = pistaEl.scrollWidth / 2;
      velocidad.current += (objetivo.current - velocidad.current) * 0.05; // frenado suave
      x += velocidad.current;
      if (mitad > 0 && x >= mitad) x -= mitad;
      // píxel entero + translate3d: evita el parpadeo del antialias a medio píxel
      pistaEl.style.transform = `translate3d(${-Math.round(x)}px, 0, 0)`;
      raf = requestAnimationFrame(paso);
    };
    raf = requestAnimationFrame(paso);

    const entra = () => (objetivo.current = 0.15);
    const sale = () => (objetivo.current = 0.6);
    cajaEl.addEventListener("mouseenter", entra);
    cajaEl.addEventListener("mouseleave", sale);
    return () => {
      cancelAnimationFrame(raf);
      cajaEl.removeEventListener("mouseenter", entra);
      cajaEl.removeEventListener("mouseleave", sale);
    };
  }, []);

  const fila = [...items, ...items]; // duplicado para el bucle sin corte
  return (
    <div className="tira" ref={caja} aria-label="Avances del proyecto">
      <div className="tira-pista" ref={pista}>
        {fila.map((t, i) => (
          <span key={i} className="tira-item" aria-hidden={i >= items.length}>
            {t}
            <i className="tira-sep">✦</i>
          </span>
        ))}
      </div>
    </div>
  );
}
