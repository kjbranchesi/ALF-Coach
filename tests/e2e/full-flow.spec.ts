import { test, expect } from '@playwright/test';

test.describe('Full Blueprint Creation Flow', () => {
  test('should complete wizard, chat through FSM states using quick-replies, and export blueprint', async ({ page }) => {
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
    
    // Journey Overview Stage - use quick reply ideas
    await expect(page.getByText(/welcome.*journey/i)).toBeVisible({ timeout: 10000 });
    await page.getByRole('button', { name: /ideas.*template/i }).click();
    
    // Wait for AI response with continue button
    await expect(page.getByRole('button', { name: /continue/i })).toBeVisible({ timeout: 10000 });
    await page.getByRole('button', { name: /continue/i }).click();
    
    // Journey Phases Stage - use quick reply whatif
    await expect(page.getByText(/phases/i)).toBeVisible({ timeout: 10000 });
    await page.getByRole('button', { name: /what.*if/i }).click();
    
    // Continue through phases
    await expect(page.getByRole('button', { name: /continue/i })).toBeVisible({ timeout: 10000 });
    await page.getByRole('button', { name: /continue/i }).click();
    
    // Activities Stage - use examples quick reply
    await expect(page.getByText(/activities/i)).toBeVisible({ timeout: 10000 });
    await page.getByRole('button', { name: /examples/i }).click();
    
    // Continue through activities
    await expect(page.getByRole('button', { name: /continue/i })).toBeVisible({ timeout: 10000 });
    await page.getByRole('button', { name: /continue/i }).click();
    
    // Skip Resources Stage using quick reply
    await expect(page.getByText(/resources/i)).toBeVisible({ timeout: 10000 });
    await page.getByRole('button', { name: /skip.*optional/i }).click();
    
    // Review Journey - continue
    await expect(page.getByText(/review.*journey/i)).toBeVisible({ timeout: 10000 });
    await page.getByRole('button', { name: /continue.*deliverables/i }).click();
    
    // Milestones - use ideas quick reply
    await expect(page.getByText(/milestone/i)).toBeVisible({ timeout: 10000 });
    await page.getByRole('button', { name: /ideas.*template/i }).click();
    
    // Continue through milestones
    await expect(page.getByRole('button', { name: /continue/i })).toBeVisible({ timeout: 10000 });
    await page.getByRole('button', { name: /continue/i }).click();
    
    // Skip Rubric using quick reply
    await expect(page.getByText(/rubric/i)).toBeVisible({ timeout: 10000 });
    await page.getByRole('button', { name: /skip.*optional/i }).click();
    
    // Skip Impact using quick reply
    await expect(page.getByText(/impact/i)).toBeVisible({ timeout: 10000 });
    await page.getByRole('button', { name: /skip.*optional/i }).click();
    
    // Publish Review - complete blueprint
    await expect(page.getByText(/blueprint.*complete/i)).toBeVisible({ timeout: 10000 });
    await page.getByRole('button', { name: /complete.*blueprint/i }).click();
    
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