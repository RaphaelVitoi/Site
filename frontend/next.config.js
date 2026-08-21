const path = require('node:path');

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  compress: true, // SOTA: Native Gzip/Brotli compression in production and edge
  devIndicators: false,
  turbopack: {
    root: path.resolve(__dirname, '..'),
  },
  agentRules: false,
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
        ],
      },
      {
        source: '/wasm/(.*)',
        headers: [
          {
            key: 'Content-Type',
            value: 'application/wasm',
          },
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },
  webpack: (config, { dev }) => {
    if (dev) {
      // SOTA: Blindagem do Watchpack para evitar o escaneamento de arquivos do sistema
      config.watchOptions = {
        ignored: [
          '**/node_modules/**',
          '**/.git/**',
          '**/.next/**',
          '**/C:/Users/**',
          '**/C:/Program Files/**',
          '**/C:/Windows/**',
          '**/AppData/**',
        ],
      };
    }
    return config;
  },
};

module.exports = nextConfig;
