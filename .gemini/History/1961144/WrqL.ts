import type { NextConfig } from 'next';

const config: NextConfig = {
  // Libera o Hot Reload para o seu IP local (resolve o bloqueio de CORS)
  allowedDevOrigins: ['192.168.2.120', 'localhost'],
};

export default config;