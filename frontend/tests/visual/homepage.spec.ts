import { test, expect } from '@playwright/test';

test.describe('Visual Regression — Homepage (SOTA GOLD)', () => {
  test.setTimeout(60000);

  test('homepage — glass panels + DownwardDriftWidget render identically', async ({ page }) => {
    // SOTA GOLD: pausa RAF antes do JS carregar — DownwardDriftWidget
    // usa requestAnimationFrame para animacao continua do SVG.
    await page.addInitScript(() => {
      (window as any).requestAnimationFrame = () => 0;
      (window as any).cancelAnimationFrame = () => {};
      (window as any).webkitRequestAnimationFrame = () => 0;
      (window as any).webkitCancelAnimationFrame = () => {};
    });

    await page.goto('/');
    await page.waitForLoadState('load');
    await page.evaluate(() => document.fonts.ready);
    await page.waitForTimeout(1000);

    // THE ROOT CAUSE: homepage has <video autoPlay> — each frame differs.
    // Pause + reset to frame 0 for deterministic snapshots.
    await page.evaluate(() => {
      const video = document.querySelector('video') as HTMLVideoElement;
      if (video) {
        video.pause();
        video.currentTime = 0;
      }
      // Kill CSS animations + transitions + SMIL
      document.querySelectorAll('*').forEach(el => {
        const s = (el as HTMLElement).style;
        s.animation = 'none';
        s.transition = 'none';
        (el as HTMLElement).offsetHeight; // force reflow
      });
      document.querySelectorAll('animate, animateTransform, animateMotion').forEach(a => {
        try { (a as any).endElement(); } catch { /* already ended */ }
      });
    });
    await page.waitForTimeout(500);

    await expect(page).toHaveScreenshot('homepage-full.png', {
      fullPage: true,
      animations: 'disabled',
      timeout: 15000,
    });
  });

  test('hero section — glass panel typography and gradient', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('load');
    await page.evaluate(() => document.fonts.ready);
    await page.waitForTimeout(500);

    // Freeze CSS animations for deterministic snapshot
    await page.evaluate(() => {
      document.querySelectorAll('*').forEach(el => {
        const s = (el as HTMLElement).style;
        s.animation = 'none';
        s.transition = 'none';
      });
    });
    await page.waitForTimeout(300);

    const hero = page.locator('section').first();
    await expect(hero).toHaveScreenshot('hero-section.png', {
      animations: 'disabled',
      timeout: 15000,
    });
  });
});
