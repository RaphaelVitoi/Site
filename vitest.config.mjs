import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: [
      'skills/exa-mcp-server/tests/**/*.{test,spec}.{ts,js}',
    ],
    exclude: [
      '**/node_modules/**',
      '**/dist/**',
      'frontend/**',
      '**/.venv/**',
    ],
  },
});
