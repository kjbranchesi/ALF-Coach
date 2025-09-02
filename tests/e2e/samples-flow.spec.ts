import { test, expect } from '@playwright/test';

test('Samples: Preview → Copy → Launch', async ({ page }) => {
  // Go directly to samples (route allows anonymous)
  await page.goto('/app/samples');
  await expect(page.getByRole('heading', { name: 'Sample Projects' })).toBeVisible();

  // Ensure cards render
  const firstCard = page.locator('div').filter({ hasText: 'Launch Sample' }).first();
  await expect(firstCard).toBeVisible();

  // Open preview
  await firstCard.getByRole('button', { name: 'Preview' }).click();
  await expect(page.getByRole('heading', { name: /Preview:/ })).toBeVisible();

  // Copy to My Projects
  await page.getByRole('button', { name: 'Copy to My Projects' }).click();
  await expect(page.getByText('Copied!')).toBeVisible();

  // Launch sample
  await page.getByRole('button', { name: 'Launch' }).click();
  await expect(page).toHaveURL(/\/app\/blueprint\//);
});

