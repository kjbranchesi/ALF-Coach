import { test, expect } from '@playwright/test';

test.describe('Chat smoke', () => {
  test('renders and handles first user message without errors', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (err) => errors.push(`pageerror: ${err.message}`));
    page.on('console', (msg) => {
      if (msg.type() === 'error') errors.push(`console.error: ${msg.text()}`);
    });

    await page.goto('/test/chat-smoke');

    // Wait for the input
    const textarea = page.getByPlaceholder('Message ALF Coach...');
    await expect(textarea).toBeVisible();

    // Send a message
    await textarea.fill('We want to explore local ecosystems');
    await textarea.press('Enter');

    // Expect the user bubble to appear
    await expect(page.getByText('We want to explore local ecosystems')).toBeVisible();

    // Expect an assistant response (streamed text or suggestions)
    await expect(page.locator('text=Working on:').or(page.locator('text=Ideas for'))).toBeVisible({ timeout: 10000 });

    // No errors captured
    expect(errors, `runtime errors: \n${errors.join('\n')}`).toEqual([]);
  });
});

