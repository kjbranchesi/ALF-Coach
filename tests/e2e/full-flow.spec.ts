import { test, expect } from '@playwright/test';

test.describe('Full Blueprint Creation Flow', () => {
  test('should complete wizard, chat through FSM states, and export blueprint', async ({ page }) => {
    // Start at home page
    await page.goto('/');
    
    // Click "Create Project" button
    await page.getByRole('button', { name: /create.*project/i }).click();
    
    // Wait for wizard to load
    await expect(page).toHaveURL(/\/app\/wizard/);
    
    // Step 1: Motivation
    await page.fill('textarea[name="motivation"]', 'I want to create an engaging robotics project that inspires students to solve real-world problems');
    await page.getByRole('button', { name: /continue/i }).click();
    
    // Step 2: Subject
    await page.fill('input[name="subject"]', 'Robotics & Engineering');
    await page.getByRole('button', { name: /continue/i }).click();
    
    // Step 3: Age Group
    await page.getByRole('button', { name: /14-18/i }).click();
    
    // Step 4: Location (optional - skip)
    await page.getByRole('button', { name: /skip/i }).click();
    
    // Step 5: Scope
    await page.getByRole('button', { name: /semester/i }).click();
    
    // Step 6: Materials
    await page.fill('textarea[name="materials"]', 'Arduino kits, 3D printer, recycled materials, sensors');
    await page.getByRole('button', { name: /continue/i }).click();
    
    // Review and Create Blueprint
    await expect(page.getByText(/review.*blueprint/i)).toBeVisible();
    await page.getByRole('button', { name: /create.*blueprint/i }).click();
    
    // Wait for navigation to chat
    await expect(page).toHaveURL(/\/app\/blueprint\/.*\/chat/);
    
    // Wait for initial AI message
    await expect(page.getByText(/welcome.*journey/i)).toBeVisible({ timeout: 10000 });
    
    // Journey Overview Stage
    await page.fill('textarea[placeholder*="Type your message"]', 'Students will design robots to help elderly people with daily tasks');
    await page.getByRole('button', { name: /send/i }).click();
    
    // Wait for AI response
    await expect(page.getByText(/continue/i)).toBeVisible({ timeout: 10000 });
    
    // Click continue to progress
    await page.getByRole('button', { name: /continue/i }).click();
    
    // Journey Phases Stage - use quick reply
    await expect(page.getByText(/phases/i)).toBeVisible({ timeout: 10000 });
    await page.getByRole('button', { name: /ideas.*template/i }).first().click();
    
    // Wait and continue through phases
    await expect(page.getByText(/continue/i)).toBeVisible({ timeout: 10000 });
    await page.getByRole('button', { name: /continue/i }).click();
    
    // Skip Activities Stage
    await expect(page.getByText(/activities/i)).toBeVisible({ timeout: 10000 });
    await page.getByRole('button', { name: /skip/i }).click();
    
    // Skip Resources Stage
    await expect(page.getByText(/resources/i)).toBeVisible({ timeout: 10000 });
    await page.getByRole('button', { name: /skip/i }).click();
    
    // Review Journey
    await expect(page.getByText(/review/i)).toBeVisible({ timeout: 10000 });
    await page.getByRole('button', { name: /continue/i }).click();
    
    // Skip Milestones
    await expect(page.getByText(/milestones/i)).toBeVisible({ timeout: 10000 });
    await page.getByRole('button', { name: /skip/i }).click();
    
    // Skip Rubric
    await expect(page.getByText(/rubric/i)).toBeVisible({ timeout: 10000 });
    await page.getByRole('button', { name: /skip/i }).click();
    
    // Skip Impact
    await expect(page.getByText(/impact/i)).toBeVisible({ timeout: 10000 });
    await page.getByRole('button', { name: /skip/i }).click();
    
    // Publish Review
    await expect(page.getByText(/publish.*review/i)).toBeVisible({ timeout: 10000 });
    await page.getByRole('button', { name: /continue/i }).click();
    
    // Wait for completion message and redirect to review
    await expect(page.getByText(/congratulations.*ready/i)).toBeVisible({ timeout: 10000 });
    await expect(page).toHaveURL(/\/app\/blueprint\/.*\/review/, { timeout: 5000 });
    
    // Verify review screen loads
    await expect(page.getByText(/blueprint.*review/i)).toBeVisible();
    await expect(page.getByText(/robotics.*engineering/i)).toBeVisible();
    
    // Test export functionality
    // Click Markdown export
    await page.getByRole('button', { name: /markdown/i }).click();
    
    // Wait for export message
    await expect(page.getByText(/blueprint.*ready.*refinements/i)).toBeVisible({ timeout: 5000 });
    
    // Click PDF export
    await page.getByRole('button', { name: /pdf/i }).click();
    
    // Wait for PDF export message
    await expect(page.getByText(/blueprint.*pdf.*ready/i)).toBeVisible({ timeout: 5000 });
    
    // Test navigation back to dashboard
    await page.getByRole('button', { name: /back.*dashboard/i }).click();
    await expect(page).toHaveURL(/\/app\/dashboard/);
  });
  
  test('should handle errors gracefully', async ({ page }) => {
    // Test invalid blueprint ID
    await page.goto('/app/blueprint/invalid-id/chat');
    await expect(page.getByText(/blueprint.*not.*found/i)).toBeVisible();
    
    // Test navigation back from error
    await page.getByRole('button', { name: /back.*dashboard/i }).click();
    await expect(page).toHaveURL(/\/app\/dashboard/);
  });
});