"use client";

import { useEffect } from "react";

/** Registra el service worker (solo en producción) para PWA instalable y lectura offline. */
export default function RegistrarSW() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") return;
    if (!("serviceWorker" in navigator)) return;
    navigator.serviceWorker.register("/sw.js").catch(() => undefined);
  }, []);
  return null;
}
