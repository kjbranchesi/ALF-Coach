import { test, expect } from '@playwright/test';

test.describe('Samples Gallery', () => {
  test('Preview → Copy → Launch flow', async ({ page }) => {
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
    
    // Open preview drawer
    await firstCard.getByRole('button', { name: 'Preview' }).click();
    await expect(page.getByRole('heading', { name: /Preview:/ })).toBeVisible();
    
    // Check preview content is populated
    await expect(page.getByText(/Context:/)).toBeVisible();
    await expect(page.getByText(/Big Idea:/)).toBeVisible();
    await expect(page.getByText(/Essential Question:/)).toBeVisible();

    // Copy to My Projects
    await page.getByRole('button', { name: 'Copy to My Projects' }).click();
    await expect(page.getByText('Copied!')).toBeVisible({ timeout: 3000 });

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
    await page.goto('/app/samples');
    await expect(page.getByRole('heading', { name: 'Sample Projects' })).toBeVisible();

    const firstCard = page.locator('.grid > div').first();
    await firstCard.getByRole('button', { name: 'Preview' }).click();
    
    // Check if Export PDF button exists
    const exportButton = page.getByRole('button', { name: 'Export PDF' });
    if (await exportButton.count() > 0) {
      // Note: We don't actually click as it would trigger a download
      await expect(exportButton).toBeVisible();
    }
  });
});

