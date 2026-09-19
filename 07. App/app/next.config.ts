import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Export estático: toda la app se sirve como archivos planos
  // (Cloudflare Pages / cualquier hosting estático) — sin servidor en runtime (D9).
  output: "export",
  images: { unoptimized: true },
};

export default nextConfig;
