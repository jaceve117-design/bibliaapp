"use client";

import { useEffect, useState } from "react";

/** Toggle de tema claro/oscuro persistido. El tema inicial lo fija el script anti-parpadeo del layout. */
export default function Tema({ etiqueta }: { etiqueta: string }) {
  const [tema, setTema] = useState<"claro" | "oscuro">("claro");

  useEffect(() => {
    const actual = document.documentElement.getAttribute("data-theme");
    if (actual === "oscuro" || actual === "claro") setTema(actual);
  }, []);

  const alternar = () => {
    const nuevo = tema === "claro" ? "oscuro" : "claro";
    document.documentElement.setAttribute("data-theme", nuevo);
    try {
      localStorage.setItem("tema", nuevo);
    } catch {}
    setTema(nuevo);
  };

  return (
    <button className="icono-btn" onClick={alternar} aria-label={etiqueta} title={etiqueta}>
      {tema === "claro" ? "☾" : "☀"}
    </button>
  );
}
