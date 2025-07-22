import { test, expect, devices } from '@playwright/test';

// Define browsers and viewports to test
const browsers = [
  { name: 'Chrome', device: devices['Desktop Chrome'] },
  { name: 'Firefox', device: devices['Desktop Firefox'] },
  { name: 'Safari', device: devices['Desktop Safari'] },
  { name: 'Mobile Chrome', device: devices['Pixel 5'] },
  { name: 'Mobile Safari', device: devices['iPhone 13'] },
];

browsers.forEach(({ name, device }) => {
  test.describe(`Smoke Tests - ${name}`, () => {
    test.use(device);

    test('should load landing page', async ({ page }) => {
      await page.goto('/');
      await expect(page).toHaveTitle(/ProjectCraft/);
      await expect(page.getByText('Create Your Blueprint')).toBeVisible();
    });

    test('should navigate to wizard', async ({ page }) => {
      await page.goto('/');
      await page.getByRole('button', { name: /create.*project/i }).click();
      await expect(page).toHaveURL(/\/app\/wizard/);
      await expect(page.getByText(/motivation/i)).toBeVisible();
    });

    test('should toggle dark mode', async ({ page }) => {
      await page.goto('/');
      
      // Check initial light mode
      const html = page.locator('html');
      await expect(html).not.toHaveClass(/dark/);
      
      // Click dark mode toggle
      await page.getByRole('button', { name: /switch to dark mode/i }).click();
      
      // Check dark mode is applied
      await expect(html).toHaveClass(/dark/);
      
      // Check persistence
      await page.reload();
      await expect(html).toHaveClass(/dark/);
    });

    test('should display responsive navigation', async ({ page }) => {
      await page.goto('/app/dashboard');
      
      // Check header is visible
      await expect(page.locator('header')).toBeVisible();
      
      // Check logo and branding
      await expect(page.getByText('ProjectCraft')).toBeVisible();
    });

    test('should handle form interactions', async ({ page }) => {
      await page.goto('/app/wizard');
      
      // Test textarea interaction
      const textarea = page.locator('textarea[name="motivation"]');
      await textarea.fill('Testing form interactions across browsers');
      await expect(textarea).toHaveValue('Testing form interactions across browsers');
      
      // Test button states
      const continueButton = page.getByRole('button', { name: /continue/i });
      await expect(continueButton).toBeEnabled();
    });

    test('should apply animations and transitions', async ({ page }) => {
      await page.goto('/app/wizard');
      
      // Check for motion elements
      const motionElements = page.locator('[class*="motion"]');
      const count = await motionElements.count();
      expect(count).toBeGreaterThan(0);
      
      // Check hover effects on buttons
      const button = page.getByRole('button').first();
      await button.hover();
      // Visual regression would be better here, but checking class changes
      await expect(button).toHaveClass(/hover:/);
    });

    test('should render with proper typography', async ({ page }) => {
      await page.goto('/');
      
      // Check font family is applied
      const body = page.locator('body');
      const fontFamily = await body.evaluate(el => 
        window.getComputedStyle(el).fontFamily
      );
      expect(fontFamily).toContain('Inter');
      
      // Check text sizing
      const fontSize = await body.evaluate(el => 
        window.getComputedStyle(el).fontSize
      );
      expect(fontSize).toBe('17px');
    });

    test('should handle shadow styles', async ({ page }) => {
      await page.goto('/app/dashboard');
      
      // Find elements with shadow classes
      const shadowElements = page.locator('[class*="shadow-soft"]');
      const hasShadows = await shadowElements.count() > 0;
      expect(hasShadows).toBeTruthy();
    });

    test('should apply border radius theme', async ({ page }) => {
      await page.goto('/app/wizard');
      
      // Check rounded elements
      const roundedElements = page.locator('[class*="rounded"]');
      const count = await roundedElements.count();
      expect(count).toBeGreaterThan(0);
      
      // Check specific border radius
      const card = page.locator('.rounded-xl').first();
      if (await card.count() > 0) {
        const borderRadius = await card.evaluate(el => 
          window.getComputedStyle(el).borderRadius
        );
        expect(['12px', '0.75rem']).toContain(borderRadius);
      }
    });

    test('should handle quick-reply hover effects', async ({ page }) => {
      // Navigate to chat with a blueprint
      await page.goto('/');
      await page.getByRole('button', { name: /create.*project/i }).click();
      
      // Fill minimal wizard data
      await page.fill('textarea[name="motivation"]', 'Test quick reply hover effects');
      await page.getByRole('button', { name: /continue/i }).click();
      await page.fill('input[name="subject"]', 'Test Subject');
      await page.getByRole('button', { name: /continue/i }).click();
      await page.getByRole('button', { name: /14-18/i }).click();
      await page.getByRole('button', { name: /skip/i }).click();
      await page.getByRole('button', { name: /semester/i }).click();
      await page.fill('textarea[name="materials"]', 'Test materials');
      await page.getByRole('button', { name: /continue/i }).click();
      await page.getByRole('button', { name: /create.*blueprint/i }).click();
      
      // Wait for chat to load
      await expect(page).toHaveURL(/\/app\/blueprint\/.*\/chat/);
      await page.waitForTimeout(2000); // Wait for AI response
      
      // Check quick reply buttons
      const quickReply = page.getByRole('button', { name: /ideas|continue|what.*if/i }).first();
      if (await quickReply.count() > 0) {
        // Check hover scale effect
        await quickReply.hover();
        const transform = await quickReply.evaluate(el => 
          window.getComputedStyle(el).transform
        );
        expect(transform).not.toBe('none');
      }
    });
  });
});

// Accessibility smoke test
test.describe('Accessibility Smoke Tests', () => {
  test('should have proper ARIA labels', async ({ page }) => {
    await page.goto('/');
    
    // Check main navigation
    const nav = page.locator('[aria-label*="navigation"]');
    const hasNav = await nav.count() > 0;
    expect(hasNav).toBeTruthy();
    
    // Check buttons have accessible labels
    const buttons = page.getByRole('button');
    const buttonCount = await buttons.count();
    for (let i = 0; i < Math.min(buttonCount, 5); i++) {
      const button = buttons.nth(i);
      const hasLabel = await button.evaluate(el => 
        el.getAttribute('aria-label') || el.textContent?.trim()
      );
      expect(hasLabel).toBeTruthy();
    }
  });

  test('should have sufficient color contrast', async ({ page }) => {
    await page.goto('/');
    
    // Check main text contrast
    const textElements = page.locator('p, h1, h2, h3');
    const textCount = await textElements.count();
    
    for (let i = 0; i < Math.min(textCount, 5); i++) {
      const element = textElements.nth(i);
      const color = await element.evaluate(el => 
        window.getComputedStyle(el).color
      );
      // Basic check that text is not too light
      expect(color).not.toBe('rgb(255, 255, 255)');
    }
  });
});