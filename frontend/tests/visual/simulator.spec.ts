import { test, expect } from '@playwright/test';

test.describe('Visual Regression — Simulator (SOTA GOLD)', () => {
  test.setTimeout(90000);

  test('simulator page — layout e componentes interativos', async ({ page }) => {
    await page.goto('/simulador');
    // simulator has WebSocket connections — use 'load' not 'networkidle'
    await page.waitForLoadState('load', { timeout: 30000 });
    await page.evaluate(() => document.fonts.ready);
    await page.waitForTimeout(2000);

    // Freeze animations for deterministic snapshot
    await page.evaluate(() => {
      const els = document.querySelectorAll('*');
      els.forEach(el => {
        const s = (el as HTMLElement).style;
        s.animation = 'none';
        s.transition = 'none';
      });
    });
    await page.waitForTimeout(500);

    await expect(page).toHaveScreenshot('simulator-page.png', {
      fullPage: true,
      animations: 'disabled',
      timeout: 15000,
    });
  });

  test('simulator — glass panel header', async ({ page }) => {
    await page.goto('/simulador');
    await page.waitForLoadState('load', { timeout: 30000 });
    await page.evaluate(() => document.fonts.ready);
    await page.waitForTimeout(2000);

    // Freeze animations for deterministic snapshot
    await page.evaluate(() => {
      const els = document.querySelectorAll('*');
      els.forEach(el => {
        const s = (el as HTMLElement).style;
        s.animation = 'none';
        s.transition = 'none';
      });
    });
    await page.waitForTimeout(300);

    const header = page.locator('header').first();
    await expect(header).toHaveScreenshot('simulator-header.png', {
      animations: 'disabled',
      timeout: 15000,
    });
  });
});
