"use client";

/**
 * Intro de AION: en la oscuridad se enciende la llama, llegan las siete luces
 * desde lejos —tenues— y toman color al llegar; debajo aparece el nombre.
 *
 * Línea de tiempo (sincronizada con public/intro/aion.wav, ver scripts/intro-sonido.py):
 *   0,40 s llama · 1,60 s + i·0,12 cada luz · 2,45 s nombre · 3,50 s fundido · 4,10 s fuera
 *
 * - Una vez por sesión (sessionStorage). Un script en <head> marca <html> con
 *   `sin-intro` antes del primer pintado, para que al recargar no parpadee.
 * - Tocar en cualquier punto la salta.
 * - Sonido: el navegador sólo deja sonar audio tras un gesto del usuario; si lo
 *   bloquea, la intro sigue en silencio (nunca se fuerza).
 * - prefers-reduced-motion: sin vuelos; sólo aparece y se desvanece.
 */
import { useEffect, useState } from "react";
import { CORAZON, LLAMA, LUCES, R_LUZ } from "./LogoAion";

// de dónde viene cada luz (fijo, para que servidor y cliente pinten igual)
const ORIGEN: Array<[number, number]> = [
  [-150, -260], [260, -180], [300, 140], [120, 320], [-220, 280], [-320, 40], [-90, -330],
];

export default function Intro() {
  const [vivo, setVivo] = useState(true);

  useEffect(() => {
    const html = document.documentElement;
    if (html.classList.contains("sin-intro")) {
      setVivo(false);
      return;
    }
    try { sessionStorage.setItem("aion-intro", "1"); } catch {}
    const audio = new Audio("/intro/aion.wav");
    audio.volume = 0.7;
    audio.play().catch(() => {});
    const fin = setTimeout(() => setVivo(false), 4100);
    return () => { clearTimeout(fin); audio.pause(); };
  }, []);

  if (!vivo) return null;
  return (
    <div className="intro" onClick={() => setVivo(false)} aria-hidden="true">
      <div className="intro-halo" />
      <svg className="intro-logo" viewBox="-40 -40 80 80" width="150" height="150">
        {LUCES.map(([x, y], i) => (
          <circle
            key={i}
            className="intro-luz"
            cx={x}
            cy={y}
            r={R_LUZ}
            style={{ "--dx": `${ORIGEN[i][0]}px`, "--dy": `${ORIGEN[i][1]}px`, "--d": `${1.6 + i * 0.12 - 0.85}s` } as React.CSSProperties}
          />
        ))}
        <path className="intro-llama" d={`${LLAMA} ${CORAZON}`} fillRule="evenodd" />
      </svg>
      <div className="intro-nombre">
        <span>Biblia de Estudio</span>
        <b>AION</b>
      </div>
    </div>
  );
}
