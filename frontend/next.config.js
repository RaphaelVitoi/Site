/** @type {import('next').NextConfig} */
const nextConfig = {
  turbopack: {},
  webpack: (config, { dev }) => {
    if (dev) {
      // SOTA: Blindagem do Watchpack para evitar o escaneamento de arquivos do sistema (C:\)
      // e restaurar a performance do Hot Reload.
      config.watchOptions = {
        ignored: [
          "**/node_modules/**",
          "**/System Volume Information/**",
          "**/pagefile.sys",
          "**/swapfile.sys",
        ],
      };

      // SOTA: Habilita WebAssembly assíncrono e previne Tree-Shaking agressivo do Webpack
      // sobre o glue code do wasm-bindgen, erradicando o LinkError "requires a callable".
      config.experiments = {
        ...config.experiments,
        asyncWebAssembly: true,
        layers: true,
      };
      config.module.rules.push({
        test: /vitoi_equity_engine.*\.js$/,
        sideEffects: true,
      });
    }
    return config;
  },
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
