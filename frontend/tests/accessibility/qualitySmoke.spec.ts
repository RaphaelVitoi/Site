import { expect, test } from '@playwright/test';

declare global {
  interface Window {
    axe?: {
      run: (
        context: Document,
        options: { runOnly: { type: 'tag'; values: string[] } },
      ) => Promise<{
        violations: Array<{
          id: string;
          impact: string | null;
          description: string;
          nodes: Array<{ target: string[]; failureSummary?: string | null }>;
        }>;
      }>;
    };
  }
}

const auditedRoutes = [
  { path: '/', name: 'home' },
  { path: '/simulador', name: 'simulator' },
] as const;

for (const route of auditedRoutes) {
  test(`${route.name} has no axe WCAG 2.2 A/AA violations`, async ({ page }) => {
    const response = await page.goto(route.path, { waitUntil: 'load' });
    expect(response?.status()).toBe(200);
    await page.waitForLoadState('networkidle');
    await page.evaluate(async () => {
      await document.fonts.ready;
    });
    await page.addScriptTag({ path: require.resolve('axe-core') });

    const results = await page.evaluate(async () => {
      if (!window.axe) throw new Error('axe-core failed to load');

      return window.axe.run(document, {
        runOnly: {
          type: 'tag',
          values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'],
        },
      });
    });

    const violations = results.violations.map(({ id, impact, description, nodes }) => ({
      id,
      impact,
      description,
      nodes: nodes.map(({ target, failureSummary }) => ({ target, failureSummary })),
    }));

    expect(
      violations,
      `${route.path} at ${page.viewportSize()?.width}px:\n${JSON.stringify(violations, null, 2)}`,
    ).toEqual([]);
  });
}

test('scenario atlas preserves mobile targets, category behavior, and viewport bounds', async ({ page }) => {
  const response = await page.goto('/simulador', { waitUntil: 'load' });
  expect(response?.status()).toBe(200);
  await expect(page.getByText('Atlas · 12 Cenários', { exact: true })).toBeVisible();

  const activePulse = page.locator('[aria-pressed="true"] .animate-pulse');
  await expect(activePulse).toHaveCount(1);
  const activeAnimation = await activePulse.evaluate((element) => getComputedStyle(element).animationName);
  expect(activeAnimation).toBe('none');

  const viewportWidth = page.viewportSize()?.width ?? 0;
  expect(viewportWidth).toBeGreaterThan(0);

  for (const label of ['Referenciais', 'Casos clínicos', 'Toy games']) {
    const category = page.locator('details').filter({
      has: page.getByText(label, { exact: true }),
    });
    await expect(category).toHaveCount(1);

    const summary = category.locator('summary');
    const bounds = await summary.boundingBox();
    expect(bounds?.height).toBeGreaterThanOrEqual(44);
    expect(bounds?.x).toBeGreaterThanOrEqual(0);
    expect((bounds?.x ?? 0) + (bounds?.width ?? 0)).toBeLessThanOrEqual(viewportWidth + 1);
  }

  const clinical = page.locator('details').filter({
    has: page.getByText('Casos clínicos', { exact: true }),
  });
  await expect(clinical).toHaveJSProperty('open', false);
  const clinicalSummary = clinical.locator('summary');
  await clinicalSummary.focus();
  await expect(clinicalSummary).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(clinical).toHaveJSProperty('open', true);
  await expect(clinical.getByRole('button')).toHaveCount(8);

  const firstClinicalCard = clinical.getByRole('button').first();
  await page.keyboard.press('Tab');
  await expect(firstClinicalCard).toBeFocused();
  const focusRing = await firstClinicalCard.evaluate((element) => getComputedStyle(element).boxShadow);
  expect(focusRing).not.toBe('none');

  const cardBounds = await clinical.getByRole('button').evaluateAll((buttons) =>
    buttons.map((button) => {
      const rect = button.getBoundingClientRect();
      return { left: rect.left, right: rect.right, height: rect.height };
    }),
  );
  expect(
    cardBounds.every(
      ({ left, right, height }) => left >= 0 && right <= viewportWidth + 1 && height >= 44,
    ),
  ).toBe(true);

  const documentWidth = await page.evaluate(() => document.documentElement.scrollWidth);
  expect(documentWidth).toBeLessThanOrEqual(viewportWidth);
});

test('simulator activates Quiz ICM lens, renders interactive quiz, and preserves accessibility', async ({ page }) => {
  const response = await page.goto('/simulador', { waitUntil: 'load' });
  expect(response?.status()).toBe(200);
  await page.waitForLoadState('networkidle');

  const quizTab = page.getByRole('button', { name: /Quiz ICM/i });
  await expect(quizTab).toBeVisible();
  await quizTab.click();

  await expect(page.getByText(/Laboratório Didático ICM/i)).toBeVisible();
  await expect(page.getByText(/Quiz Dinâmico SOTA/i)).toBeVisible();

  await page.addScriptTag({ path: require.resolve('axe-core') });
  const results = await page.evaluate(async () => {
    if (!window.axe) throw new Error('axe-core failed to load');
    return window.axe.run(document, {
      runOnly: {
        type: 'tag',
        values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'],
      },
    });
  });

  expect(results.violations).toEqual([]);
});

