"use client";

import { useEffect, useState } from "react";
import {
  estadoDiagnostico,
  alternaPausaDiagnostico,
  vaciaDiagnostico,
  descargaInforme,
} from "@/lib/diagnostico";

/**
 * Sección «Diagnóstico» del panel de Ajustes (al final, pedido del usuario).
 * Registro interno de errores y toques para cazar bugs: todo queda en el
 * dispositivo; solo sale cuando el usuario descarga el informe (.md o .txt).
 */
export default function DiagnosticoSeccion() {
  const [estado, setEstado] = useState<ReturnType<typeof estadoDiagnostico> | null>(null);
  const [aviso, setAviso] = useState("");

  useEffect(() => {
    setEstado(estadoDiagnostico());
  }, []);

  const refresca = () => setEstado(estadoDiagnostico());

  const descargar = (horas: number | null, formato: "md" | "txt") => {
    const nombre = descargaInforme(horas, formato);
    setAviso(`Descargado: ${nombre}`);
    refresca();
  };

  const vaciar = () => {
    vaciaDiagnostico();
    setAviso("Registro vaciado.");
    refresca();
  };

  const pausar = () => {
    const p = alternaPausaDiagnostico();
    setAviso(p ? "Captura en pausa (no se registra nada nuevo)." : "Captura reanudada.");
    refresca();
  };

  return (
    <div className="diagnostico-seccion">
      <div className="lex-def">
        Registro interno para encontrar errores: cada toque y su respuesta de la app
        (navegación, red, errores JavaScript), con marca de tiempo y coordenadas.
        <b> Todo queda solo en este dispositivo</b> hasta que descargues el informe.
      </div>
      <div className="lex-meta">
        {estado
          ? `${estado.total} eventos · desde ${estado.desde ? estado.desde.slice(0, 16).replace("T", " ") : "—"}`
          : "Cargando…"}
      </div>
      <div className="lex-meta">
        {estado
          ? Object.entries(estado.porTipo)
              .sort((a, b) => b[1] - a[1])
              .map(([k, v]) => `${k}: ${v}`)
              .join(" · ")
          : ""}
      </div>
      <div className="diagnostico-acciones">
        <button className="icono-btn" onClick={() => descargar(1, "md")}>
          Informe .md · última hora
        </button>
        <button className="icono-btn" onClick={() => descargar(24, "md")}>
          Informe .md · 24 h
        </button>
        <button className="icono-btn" onClick={() => descargar(null, "txt")}>
          Registro .txt · completo
        </button>
      </div>
      <div className="diagnostico-acciones">
        <button className="icono-btn" onClick={pausar}>
          {estado?.pausado ? "Reanudar captura" : "Pausar captura"}
        </button>
        <button className="icono-btn" onClick={vaciar}>
          Vaciar registro
        </button>
      </div>
      {aviso ? <div className="lex-meta">{aviso}</div> : null}
      <div className="lex-meta">
        Para reportar un fallo: reproduce lo que falla, descarga «última hora» y envíanos ese archivo.
      </div>
    </div>
  );
}
