import type { NextConfig } from 'next';

// `next dev` mantém handles abertos em `.next/` via Turbopack.
// `next build` tentava deletar o mesmo dir → EPERM do OneDrive/Windows.
// Solução: dirs separados por lifecycle. Dev nunca bloqueia o output de build.
const isDevMode = process.env.NODE_ENV !== 'production';

const config: NextConfig = {
  // Libera Hot Reload para IPs locais (CORS dev)
  allowedDevOrigins: [ process.env.DEV_HOST || 'localhost', '192.168.2.120' ],

  distDir: isDevMode ? '.next-dev' : '.next-build',
  poweredByHeader: false,
  reactStrictMode: true,

  // Prisma usa binários nativos — não pode ser bundled pelo Turbopack
  serverExternalPackages: [ '@prisma/client', '.prisma/client' ],

  // SOTA: Root do Turbopack removido. Monitorar a raiz do projeto causava um colapso de I/O
  // sempre que o backend Python escrevia logs, gerando loops de "compiling" e travamento total.

  webpack ( config, { isServer } )
  {
    // SOTA: Habilita a interceptação e carregamento nativo de WebAssembly
    config.experiments = {
      ...config.experiments,
      asyncWebAssembly: true,
      layers: true,
    };

    // SOTA: Blindagem de FFI para o WASM no Web Worker.
    // Garante que o bundler do Next.js (Webpack) não tente resolver o WASM no lado do servidor
    // e saiba onde colocar o binário para o cliente.
    if ( isServer ) {
      config.output.webassemblyModuleFilename = './../static/wasm/[modulehash].wasm';
    } else {
      config.output.webassemblyModuleFilename = 'static/wasm/[modulehash].wasm';
    }

    // SOTA: Contenção de Entropia do Watchpack (Impede o vazamento de escopo para C:\)
    config.watchOptions = {
      ...config.watchOptions,
      ignored: [
        '**/node_modules/**',
        '**/.git/**',
        '**/.next-dev/**',
        '**/.next-build/**',
        '**/System Volume Information/**',
        '**/pagefile.sys',
        '**/swapfile.sys'
      ],
    };

    // SOTA: Otimização de módulos no Webpack para reduzir latência de HMR e Build
    config.optimization = {
      ...config.optimization,
      moduleIds: 'deterministic',
    };

    return config;
  },

  turbopack: {},

  async headers ()
  {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Cross-Origin-Opener-Policy',
            value: 'same-origin',
          },
          {
            key: 'Cross-Origin-Embedder-Policy',
            value: 'require-corp',
          },
        ],
      },
    ];
  },

  async redirects ()
  {
    return [
      {
        source: '/psicologia',
        destination: '/artigos/psicologia-hs',
        permanent: true,
      },
      {
        source: '/psicologia-hs',
        destination: '/artigos/psicologia-hs',
        permanent: true,
      },
    ];
  },
};

export default config;
