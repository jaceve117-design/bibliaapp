"use client";

import { useEffect } from "react";
import { iniciaDiagnostico } from "@/lib/diagnostico";

/**
 * Montaje global del diagnóstico (decisión del usuario): registra los ganchos
 * de captura en toda la app desde el primer render. No dibuja nada.
 */
export default function DiagnosticoGlobal() {
  useEffect(() => {
    iniciaDiagnostico();
  }, []);
  return null;
}
