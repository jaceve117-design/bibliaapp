import type { MetadataRoute } from "next";

export const dynamic = "force-static";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Biblia de Estudio AION",
    short_name: "AION",
    description:
      "Biblia de Estudio AION: texto bíblico, interlineal, léxicos, referencias cruzadas y notas del lector. ES principal.",
    start_url: "/es/lector",
    scope: "/",
    display: "standalone",
    orientation: "portrait-primary",
    // = fondo de la intro: la pantalla de arranque de Android (ícono «any» sobre
    // este color) queda idéntica al primer fotograma de components/Intro.tsx
    background_color: "#0b0906",
    theme_color: "#12100d",
    lang: "es",
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
      { src: "/icons/icon-192-maskable.png", sizes: "192x192", type: "image/png", purpose: "maskable" },
      { src: "/icons/icon-512-maskable.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
