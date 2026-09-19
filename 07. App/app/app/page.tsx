"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/** ES es el idioma principal: la raíz redirige a /es. (Cliente: compatible con export estático) */
export default function Raiz() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/es");
  }, [router]);
  return (
    <a href="/es" style={{ fontFamily: "var(--sans)", color: "var(--muted)", display: "block", padding: 24 }}>
      Ir al lector →
    </a>
  );
}
