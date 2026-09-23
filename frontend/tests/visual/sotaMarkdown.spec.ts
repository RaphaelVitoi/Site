import { test, expect } from '@playwright/test';

test.describe('Visual Regression — SotaMarkdown & Typography (SOTA GOLD)', () => {
  test('article page — SotaMarkdown with KaTeX + code blocks', async ({ page }) => {
    // Navigate to a biblioteca article that renders math via SotaMarkdown
    await page.goto('/biblioteca/geometria-do-risco');
    await page.waitForLoadState('load');
    await page.waitForFunction(() => document.fonts.status === 'loaded');

    // Freeze animations for deterministic snapshot
    await page.evaluate(() => {
      const els = document.querySelectorAll('*');
      els.forEach(el => {
        const s = (el as HTMLElement).style;
        s.animation = 'none';
        s.transition = 'none';
      });
    });
    // Flush pending animation frames after disabling animations
    await page.evaluate(() => new Promise<void>(resolve => requestAnimationFrame(() => requestAnimationFrame(() => resolve()))));

    await expect(page).toHaveScreenshot('article-geometria-do-risco.png', {
      fullPage: true,
      animations: 'disabled',
      timeout: 15000,
    });
  });
});