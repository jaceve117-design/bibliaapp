"use client";

import { useEffect, useState } from "react";

/**
 * Toggle de tema claro/oscuro persistido. El tema inicial lo fija el script anti-parpadeo del layout.
 *
 * El cambio se DIFUMINA desde el propio botón: un círculo con el tema nuevo nace
 * en el icono y se expande hasta cubrir la pantalla (View Transitions API).
 * Antes cada zona cambiaba de color a su ritmo —sus propias transiciones CSS—
 * y la pantalla se veía cambiar «por parches». Durante el cambio se congelan
 * esas transiciones (`html.cambiando-tema`) para que el círculo sea lo único que se mueve.
 * Sin soporte del navegador o con reduced-motion: cambio instantáneo y limpio.
 */
export default function Tema({ etiqueta }: { etiqueta: string }) {
  const [tema, setTema] = useState<"claro" | "oscuro">("claro");

  useEffect(() => {
    const actual = document.documentElement.getAttribute("data-theme");
    if (actual === "oscuro" || actual === "claro") setTema(actual);
  }, []);

  const alternar = (e: React.MouseEvent<HTMLButtonElement>) => {
    const nuevo = tema === "claro" ? "oscuro" : "claro";
    const html = document.documentElement;
    const aplicar = () => {
      html.setAttribute("data-theme", nuevo);
      try {
        localStorage.setItem("tema", nuevo);
      } catch {}
      setTema(nuevo);
    };
    const doc = document as Document & { startViewTransition?: (cb: () => void) => { ready: Promise<void>; finished: Promise<void> } };
    const quieto = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!doc.startViewTransition || quieto) {
      html.classList.add("cambiando-tema");
      aplicar();
      requestAnimationFrame(() => requestAnimationFrame(() => html.classList.remove("cambiando-tema")));
      return;
    }
    const r = e.currentTarget.getBoundingClientRect();
    const x = r.left + r.width / 2;
    const y = r.top + r.height / 2;
    const radio = Math.hypot(Math.max(x, window.innerWidth - x), Math.max(y, window.innerHeight - y));
    html.classList.add("cambiando-tema");
    const vt = doc.startViewTransition(aplicar);
    vt.ready.then(() => {
      html.animate(
        { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${radio}px at ${x}px ${y}px)`] },
        { duration: 750, easing: "cubic-bezier(0.32, 0.72, 0, 1)", pseudoElement: "::view-transition-new(root)" }
      );
    });
    vt.finished.finally(() => html.classList.remove("cambiando-tema"));
  };

  return (
    <button className="icono-btn" onClick={alternar} aria-label={etiqueta} title={etiqueta}>
      {tema === "claro" ? "☾" : "☀"}
    </button>
  );
}
