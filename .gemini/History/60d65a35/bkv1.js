/** @type {import('next').NextConfig} */
const nextConfig = {
  async headers() {
    return [
      {
        // SOTA: Isolamento de Origem Cruzada estrito apenas no Laboratório Quântico.
        // Preserva a membrana do ReactPlayer (YouTube) nas rotas de artigos e biblioteca.
        source: "/simulador/:path*",
        headers: [
          { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
          { key: "Cross-Origin-Embedder-Policy", value: "require-corp" },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
