const path = require('path');

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  devIndicators: {
    appIsrStatus: false,
    buildActivity: true,
    buildActivityPosition: 'bottom-right',
  },
  turbopack: {
    root: path.resolve(__dirname, '..'),
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
