import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Export estático: toda la app se sirve como archivos planos
  // (Cloudflare Pages / cualquier hosting estático) — sin servidor en runtime (D9).
  output: "export",
  images: { unoptimized: true },
  // Salida alternativa opcional (DIST_DIR=…): en Windows la carpeta `out` puede
  // quedar retenida por otra sesión y el build no puede borrarla (EBUSY).
  ...(process.env.DIST_DIR ? { distDir: process.env.DIST_DIR } : {}),
};

export default nextConfig;
