import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: [
      'skills/gemini-cli-jules/mcp-server/src/**/*.{test,spec}.{ts,js}',
      'skills/gemini-cli-security/mcp-server/src/**/*.{test,spec}.{ts,js}',
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
