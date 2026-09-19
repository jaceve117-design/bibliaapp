import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Biblioteca — estudio bíblico",
    short_name: "Biblioteca",
    description:
      "Biblioteca cristiana digital: texto bíblico, interlineal, léxicos, referencias cruzadas y notas del lector. ES principal.",
    start_url: "/es/lector",
    scope: "/",
    display: "standalone",
    orientation: "portrait-primary",
    background_color: "#faf8f3",
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
