import type { NextConfig } from 'next';

// `next dev` mantém handles abertos em `.next/` via Turbopack.
// `next build` tentava deletar o mesmo dir → EPERM do OneDrive/Windows.
// Solução: dirs separados por lifecycle. Dev nunca bloqueia o output de build.
const isDevMode = process.env.npm_lifecycle_event === 'dev';

const config: NextConfig = {
  // Libera Hot Reload para IPs locais (CORS dev)
  allowedDevOrigins: [process.env.DEV_HOST || 'localhost'],

  distDir: isDevMode ? '.next' : '.next-build',
  turbopack: {
    root: __dirname, // Define explicitamente a raiz do Turbopack para o diretório do frontend
  },
};

export default config;