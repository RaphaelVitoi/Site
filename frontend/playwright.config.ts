import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests/visual',
  snapshotPathTemplate: '{snapshotDir}/__snapshots__/{testFileDir}/{arg}{ext}',
  fullyParallel: false,
  forbidOnly: !!process.env['CI'],
  retries: 0,
  workers: 1,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL: 'http://127.0.0.1:3000',
    viewport: { width: 1920, height: 1080 },
    deviceScaleFactor: 1,
    reducedMotion: 'reduce',
    screenshot: 'only-on-failure',
    trace: 'retain-on-failure',
  },
  // webServer omitted — dev server is started externally (Launch-ChromeSOTA.ps1)
  projects: [
    {
      name: 'visual-regression-desktop',
      use: {
        viewport: { width: 1920, height: 1080 },
      },
    },
  ],
});
