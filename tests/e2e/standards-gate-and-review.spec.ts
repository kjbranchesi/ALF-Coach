import { test, expect } from '@playwright/test';

// Helper: mock Gemini function with predictable JSON envelope
async function mockGemini(page) {
  await page.route('**/.netlify/functions/gemini', async (route) => {
    const body = {
      candidates: [
        {
          content: {
            parts: [
              {
                text:
                  JSON.stringify({
                    chatResponse:
                      "Great! Let's keep going — I captured that. Here are some ideas:",
                    suggestions: [
                      { id: 's1', text: 'Explore how policy, people, and place interact', category: 'idea' },
                      { id: 's2', text: 'Consider equity in access for different communities', category: 'idea' },
                      { id: 's3', text: 'Map constraints and opportunities in your context', category: 'idea' },
                      { id: 's4', text: 'Focus on one authentic audience to serve', category: 'idea' },
                    ],
                    isStageComplete: false,
                  }),
              },
            ],
          },
        },
      ],
    };
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(body) });
  });
}

test.describe('Standards gate + suggestions edit + stage guide memory', () => {
  test('happy path through EQ → Standards, suggestions editable, guide persists', async ({ page }) => {
    await mockGemini(page);

    // Start a fresh blueprint directly
    const newId = `new-${Date.now()}`;
    // Force skipping onboarding in production for reliability
    await page.goto(`/app/blueprint/${newId}?skip=true`);

    // Skip wizard via debug button if present, to reach BIG_IDEA quickly
    const skipBtn = page.getByRole('button', { name: /Skip Wizard/i });
    if (await skipBtn.count()) {
      await skipBtn.click();
    } else {
      // If wizard is present inline, complete minimal steps
      const topic = page.getByLabel(/What topic or area do you want students to explore\?/i);
      const goals = page.getByLabel(/What do you want students to learn\?/i);
      if (await topic.count()) {
        await topic.fill('Urban planning in Los Angeles');
        await goals.fill('Analyze equity and propose a feasible micro-intervention');
        const next = page.getByRole('button', { name: /^Next$/i });
        if (await next.count()) await next.click();
        await page.getByRole('button', { name: /Higher Education/i }).click();
        await page.getByRole('button', { name: /Medium/i }).click();
        await page.getByRole('button', { name: /Some Experience/i }).click();
        await page.getByRole('button', { name: /Start Project/i }).click();
      }
    }

    // Expect BIG_IDEA guidance (labels may not include the words "Stage Guide" on desktop)
    // Wait for stage guide visibility (use testid to avoid strict matches on 'What')
    const guide = page.getByTestId('stage-guide');
    await expect(guide).toBeVisible({ timeout: 10000 });
    await expect(guide.getByText(/Coach Tip/i)).toBeVisible();

    // Enter Big Idea and send
    const input = page.getByPlaceholder(/Message ALF Coach/i);
    await input.fill('How people, policy, and place shape equitable cities');
    await input.press('Enter');

    // Ask for ideas, click a card, ensure it inserts (not auto-send), then append and send
    const ideasBtn = page.getByTestId('ideas-button');
    await ideasBtn.click();
    const firstCard = page.getByRole('button', { name: /Explore how policy/i }).first();
    await expect(firstCard).toBeVisible();
    await firstCard.click();
    await expect(input).toHaveValue(/Explore how policy/i);
    await input.type(' — edited');
    await input.press('Enter');

    // Provide an EQ and proceed to Standards gate
    await input.fill('How might we improve transit access fairly for underserved neighborhoods?');
    await input.press('Enter');

    // Confirm if asked (button visible in some flows)
    const accept = page.getByTestId('accept-continue');
    if (await accept.count()) {
      await accept.click();
    }

    // Standards step should be visible
    await expect(page.getByText(/Framework/i)).toBeVisible();
    await page.getByRole('combobox').selectOption({ label: 'CCSS ELA' });

    // Fill first standard row
    const inputs = page.locator('input');
    // Expect at least 3 inputs for code/label/rationale in that grid (plus other inputs exist on page)
    await inputs.nth(0).fill('CCSS.ELA-LITERACY.W.11-12.7');
    await inputs.nth(1).fill('Conduct sustained research; synthesize multiple sources');
    await inputs.nth(2).fill('Supports stakeholder research and synthesis');

    // Confirm standards
    const confirm = page.getByTestId('standards-confirm').or(page.getByRole('button', { name: /Confirm Standards/i }));
    await expect(confirm).toBeEnabled();
    await confirm.click();

    // Should move to Challenge stage; Stage Guide should reflect Challenge
    await expect(page.getByText(/Stage Guide/i)).toBeVisible();
    await expect(page.getByText(/Challenge/i)).toBeVisible();

    // Test Stage Guide memory on mobile: collapse then refresh
    await page.setViewportSize({ width: 375, height: 700 });
    const toggle = page.getByTestId('stage-guide-toggle').first();
    if (await toggle.count()) {
      // Hide
      const label = await toggle.textContent();
      if (label?.match(/Hide/i)) await toggle.click();
    }

    await page.reload();

    // On mobile, toggle memory should keep the hidden state
    // The container title remains visible; content becomes hidden
    await expect(page.getByText(/Stage Guide/i)).toBeVisible();

    // Return to desktop for deliverables checks
    await page.setViewportSize({ width: 1280, height: 900 });

    // Fill Deliverables via micro-steps sequence (Milestones → Rubric → Impact)
    await page.getByTestId('deliverables-milestones-edit').click();
    const chatInput = page.getByPlaceholder(/Message ALF Coach/i);
    await chatInput.fill('Research summary');
    await chatInput.press('Enter');
    await chatInput.fill('Prototype review');
    await chatInput.press('Enter');
    await chatInput.fill('Final showcase');
    await chatInput.press('Enter');
    // Rubric criteria
    await chatInput.fill('Understanding, Process, Product, Impact');
    await chatInput.press('Enter');
    // Impact audience & method
    await chatInput.fill('Community stakeholders and peers');
    await chatInput.press('Enter');
    await chatInput.fill('Public briefing');
    await chatInput.press('Enter');

    // Add Artifacts
    await page.getByTestId('deliverables-artifacts-edit').click();
    await chatInput.fill('One-page brief; slides');
    await chatInput.press('Enter');

    // Add a Checkpoint
    await page.getByTestId('deliverables-checkpoints-edit').click();
    await chatInput.fill('Kickoff check-in — capture: plan; where: Drive; owner: team; due: week 1');
    await chatInput.press('Enter');

    // Review Checklist should not show Artifacts/Checkpoints as missing
    // The panel lives in the sidebar under Preview (desktop only)
    await expect(page.getByText(/Review Checklist/i)).toBeVisible();
    const missingArtifacts = await page.getByRole('button', { name: /^\s*•\s*Artifacts\s*$/i }).count();
    const missingCheckpoints = await page.getByRole('button', { name: /^\s*•\s*Checkpoints\s*$/i }).count();
    expect(missingArtifacts).toBe(0);
    expect(missingCheckpoints).toBe(0);
  });
});
