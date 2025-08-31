// Archived: per-describe device selection conflicts with Playwright workers and
// causes `test.use` errors. Keep as reference; do not run by default.
// If you want smoke tests across devices, configure projects in playwright.config.js
// and write a single version of each test without per-describe `test.use`.

import { test, expect } from '@playwright/test';

test.describe.skip('Archived smoke tests', () => {
  test('placeholder', async ({ page }) => {
    await page.goto('/');
    await expect(page).toBeDefined();
  });
});

