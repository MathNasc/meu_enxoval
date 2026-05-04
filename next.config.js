/** @type {import('next').NextConfig} */
const nextConfig = {
  // Permite servir arquivos de .well-known/ (necessário para Digital Asset Links)
  // e garante headers corretos para o manifest e SW
  async headers() {
    return [
      // Service Worker — sem cache para sempre ter a versão mais recente
      {
        source: "/sw.js",
        headers: [
          { key: "Cache-Control", value: "public, max-age=0, must-revalidate" },
          { key: "Service-Worker-Allowed", value: "/" },
          { key: "Content-Type", value: "application/javascript; charset=utf-8" },
        ],
      },
      // Manifest — cache curto para permitir atualizações rápidas
      {
        source: "/manifest.json",
        headers: [
          { key: "Cache-Control", value: "public, max-age=300, stale-while-revalidate=86400" },
          { key: "Content-Type", value: "application/manifest+json; charset=utf-8" },
        ],
      },
      // Digital Asset Links — crítico para TWA sem URL bar
      {
        source: "/.well-known/assetlinks.json",
        headers: [
          { key: "Cache-Control", value: "public, max-age=3600" },
          { key: "Content-Type", value: "application/json; charset=utf-8" },
          { key: "Access-Control-Allow-Origin", value: "*" },
        ],
      },
      // Ícones PWA — cache longo (hashes garantem invalidação)
      {
        source: "/icons/:path*",
        headers: [
          { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
        ],
      },
    ];
  },

  // Redireciona dotfiles (necessário em alguns deploys)
  async rewrites() {
    return [
      {
        source: "/.well-known/:path*",
        destination: "/.well-known/:path*",
      },
    ];
  },
};

module.exports = nextConfig;
