const path = require('node:path');

const allowedDevOrigins = [
  'localhost',
  '127.0.0.1',
  ...(process.env.ALLOWED_DEV_ORIGINS ? process.env.ALLOWED_DEV_ORIGINS.split(',').map((s) => s.trim()) : []),
];

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  allowedDevOrigins,
  reactStrictMode: true,
  poweredByHeader: false,
  compress: true, // SOTA: Native Gzip/Brotli compression in production and edge
  devIndicators: false,
  transpilePackages: ['@fortawesome/fontawesome-free'],
  // Avatares dos provedores OAuth configurados em src/auth.ts, exibidos via next/image (FE-13).
  // O otimizador serve a imagem pela propria origem, o que tambem a mantem compativel com o COEP.
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'lh3.googleusercontent.com' },
      { protocol: 'https', hostname: 'cdn.discordapp.com' },
    ],
  },
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
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              // Next injeta <script> inline sem nonce; 'unsafe-eval' so o React de dev exige.
              `script-src 'self' 'unsafe-inline'${process.env.NODE_ENV === 'production' ? '' : " 'unsafe-eval'"} blob:`,
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "font-src 'self' https://fonts.gstatic.com data:",
              "img-src 'self' data: blob: https:",
              "connect-src 'self' https: http://127.0.0.1:* ws: wss:",
              "worker-src 'self' blob:",
              "object-src 'none'",
              "base-uri 'self'",
              "form-action 'self'",
              "frame-ancestors 'none'",
            ].join('; '),
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Cross-Origin-Opener-Policy',
            value: 'same-origin',
          },
          {
            key: 'Cross-Origin-Embedder-Policy',
            value: 'require-corp',
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
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
