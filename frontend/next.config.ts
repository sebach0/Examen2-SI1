import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  env: {
    NEXT_PUBLIC_API_URL:
      process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api",
  },
  // Suprimir advertencias de hydration causadas por extensiones del navegador
  reactStrictMode: true,
  onDemandEntries: {
    // Período en ms para mantener las páginas en buffer
    maxInactiveAge: 25 * 1000,
    // Número de páginas que deben mantenerse simultáneamente sin ser eliminadas
    pagesBufferLength: 2,
  },
};

export default nextConfig;
