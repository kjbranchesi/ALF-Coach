import { test, expect } from '@playwright/test';

test.describe('Samples Gallery', () => {
test('Preview page → Copy → Launch flow', async ({ page }) => {
    // Go directly to samples (route allows anonymous)
    await page.goto('/app/samples');
    await expect(page.getByRole('heading', { name: 'Sample Projects' })).toBeVisible();

    // Check color legend is visible
    await expect(page.getByText('early-elementary')).toBeVisible();
    await expect(page.getByText('elementary')).toBeVisible();
    await expect(page.getByText('middle')).toBeVisible();

    // Ensure cards render with proper styling
    const firstCard = page.locator('.grid > div').first();
    await expect(firstCard).toBeVisible();
    
  // Open details page
  await firstCard.getByRole('button', { name: 'View Details' }).click();
  await expect(page).toHaveURL(/\/app\/samples\//);

  // Copy to My Projects (alert may show; this step is tolerant)
  await page.getByRole('button', { name: 'Copy to My Projects' }).click();

  // Launch sample - should navigate to blueprint
  await page.getByRole('button', { name: 'Launch' }).click();
  await expect(page).toHaveURL(/\/app\/blueprint\//, { timeout: 5000 });
  });

  test('Filters work correctly', async ({ page }) => {
    await page.goto('/app/samples');
    await expect(page.getByRole('heading', { name: 'Sample Projects' })).toBeVisible();

    // Test grade filter
    await page.getByText('elementary').click();
    
    // Test subject filter - check if dropdown exists
    const subjectFilter = page.locator('select');
    if (await subjectFilter.count() > 0) {
      await subjectFilter.selectOption('Science');
    }
    
    // Cards should still be visible after filtering
    const cards = page.locator('.grid > div');
    await expect(cards.first()).toBeVisible();
  });

  test('Export PDF functionality', async ({ page }) => {
    // If PDF feature flag is off in this environment, skip dynamically
    if (process.env.VITE_PDF_EXPORT_ENABLED !== 'true') {
      test.skip(true, 'PDF export disabled by feature flag');
    }

  await page.goto('/app/samples');
  await expect(page.getByRole('heading', { name: 'Sample Projects' })).toBeVisible();

  const firstCard = page.locator('.grid > div').first();
  await firstCard.getByRole('button', { name: 'View Details' }).click();
  await expect(page).toHaveURL(/\/app\/samples\//);
  const exportButton = page.getByRole('button', { name: 'Export PDF' });
  await expect(exportButton).toBeVisible();
  });
});
