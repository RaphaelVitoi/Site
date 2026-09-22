import { test, expect } from '@playwright/test';

test.describe('Visual Regression — SotaMarkdown & Typography (SOTA GOLD)', () => {
  test('article page — SotaMarkdown with KaTeX + code blocks', async ({ page }) => {
    // Navigate to a biblioteca article that renders math via SotaMarkdown
    await page.goto('/biblioteca/geometria-do-risco');
    await page.waitForLoadState('load');
    await page.evaluate(() => document.fonts.ready);
    await page.waitForTimeout(500);

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

    await expect(page).toHaveScreenshot('article-geometria-do-risco.png', {
      fullPage: true,
      animations: 'disabled',
      timeout: 15000,
    });
  });
});
