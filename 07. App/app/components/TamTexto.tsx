"use client";

import { useEffect, useRef, useState } from "react";

const NIVELES = [
  { v: "0.86", e: "−2" },
  { v: "0.93", e: "−1" },
  { v: "1", e: "0" },
  { v: "1.09", e: "+1" },
  { v: "1.18", e: "+2" },
];

/** Tamaño del texto de lectura: −2 a +2 sobre el tamaño base. Persistido en el dispositivo. */
export default function TamTexto({ etiqueta }: { etiqueta: string }) {
  const [nivel, setNivel] = useState("1");
  const [abierto, setAbierto] = useState(false);
  const wrap = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const guardado = localStorage.getItem("tam");
    if (guardado) {
      setNivel(guardado);
      document.documentElement.style.setProperty("--factor-texto", guardado);
    }
  }, []);

  useEffect(() => {
    const fuera = (e: MouseEvent) => {
      if (wrap.current && !wrap.current.contains(e.target as Node)) setAbierto(false);
    };
    document.addEventListener("click", fuera);
    return () => document.removeEventListener("click", fuera);
  }, []);

  const elegir = (v: string) => {
    setNivel(v);
    try {
      localStorage.setItem("tam", v);
    } catch {}
    document.documentElement.style.setProperty("--factor-texto", v);
    setAbierto(false);
  };

  return (
    <div className="tam-wrap" ref={wrap}>
      <button
        className="icono-btn"
        style={{ width: "auto", padding: "0 10px", fontWeight: 700, fontSize: 13 }}
        onClick={() => setAbierto(!abierto)}
        aria-label={etiqueta}
        title={etiqueta}
      >
        Aa
      </button>
      {abierto && (
        <div className="tam-popo">
          {NIVELES.map((n) => (
            <button
              key={n.e}
              className={`tam-opt${nivel === n.v ? " activa" : ""}`}
              onClick={() => elegir(n.v)}
            >
              {n.e}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
