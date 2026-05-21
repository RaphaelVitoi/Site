import type { NextConfig } from 'next';
import { join } from 'path';

// `next dev` mantém handles abertos em `.next/` via Turbopack.
// `next build` tentava deletar o mesmo dir → EPERM do OneDrive/Windows.
// Solução: dirs separados por lifecycle. Dev nunca bloqueia o output de build.
const isDevMode = process.env.NODE_ENV !== 'production';

const config: NextConfig = {
  // Libera Hot Reload para IPs locais (CORS dev)
  allowedDevOrigins: [process.env.DEV_HOST || 'localhost', '192.168.2.120'],

  distDir: isDevMode ? '.next-dev' : '.next-build',

  // Prisma usa binários nativos — não pode ser bundled pelo Turbopack
  serverExternalPackages: ['@prisma/client', '.prisma/client'],

  turbopack: {
    root: join( process.cwd(), '../' ),
  },

  webpack( config ) {
    // SOTA: Habilita a interceptação e carregamento nativo de WebAssembly
    config.experiments = {
      ...config.experiments,
      asyncWebAssembly: true,
      layers: true,
    };
    return config;
  },

  async redirects() {
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
