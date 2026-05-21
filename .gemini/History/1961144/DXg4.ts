import type { NextConfig } from 'next';

// `next dev` mantém handles abertos em `.next/` via Turbopack.
// `next build` tentava deletar o mesmo dir → EPERM do OneDrive/Windows.
// Solução: dirs separados por lifecycle. Dev nunca bloqueia o output de build.
const isDevMode = process.env.NODE_ENV === 'development';

const config: NextConfig = {
  // Libera Hot Reload para IPs locais (CORS dev)
  allowedDevOrigins: [ process.env.DEV_HOST || 'localhost' ],

  distDir: isDevMode ? '.next' : '.next-build',

  // Prisma usa binários nativos — não pode ser bundled pelo Turbopack
  serverExternalPackages: [ '@prisma/client', '.prisma/client' ],

  async redirects () {
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
