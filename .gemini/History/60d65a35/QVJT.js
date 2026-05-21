/** @type {import('next').NextConfig} */
const nextConfig = {
  async headers() {
    return [
      {
        // SOTA: Isolamento de Origem Cruzada global com modo 'credentialless'.
        // Habilita SharedArrayBuffer para os Workers WASM em todas as rotas e permite Iframes (YouTube).
        source: "/(.*)",
        headers: [
          { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
          { key: "Cross-Origin-Embedder-Policy", value: "credentialless" },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
