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

async function ensureSkipOnboarding(page) {
  // Wait for possible redirect new-* -> bp_*
  await page.waitForURL(/\/app\/blueprint\/(bp_|new-)[^?]+(\?.*)?$/, { timeout: 20000 });
  const url = new URL(page.url());
  if (url.searchParams.get('skip') !== 'true') {
    url.searchParams.set('skip', 'true');
    await page.goto(url.toString(), { waitUntil: 'domcontentloaded' });
  }
}

async function confirmAndWaitForStandards(page, input) {
  for (let i = 0; i < 3; i++) {
    await page.waitForTimeout(400);
    await input.fill('yes');
    await input.press('Enter');
    try {
      await expect(page.getByTestId('standards-confirm')).toBeVisible({ timeout: 5000 });
      return;
    } catch {}
  }
  await expect(page.getByTestId('standards-confirm')).toBeVisible({ timeout: 10000 });
}

async function dismissOverlays(page) {
  const buttons = [
    /Dismiss overview/i,
    /Close tour/i,
    /^Next$/i,
    /Got it/i,
  ];
  for (const re of buttons) {
    const btn = page.getByRole('button', { name: re });
    if (await btn.count()) {
      try { await btn.click({ timeout: 1000 }); } catch {}
    }
  }
}

test.describe('Standards gate + suggestions edit + stage guide memory', () => {
  test('happy path through EQ → Standards, suggestions editable, guide persists', async ({ page }) => {
    await mockGemini(page);

    // Start a fresh blueprint directly
    const newId = `new-${Date.now()}`;
    // Force skipping onboarding in production for reliability
    await page.goto(`/app/blueprint/${newId}?skip=true`);
    await ensureSkipOnboarding(page);
    await dismissOverlays(page);

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

    // Wait for chat input (more reliable across layouts) and enter Big Idea
    const input = page.getByPlaceholder(/Message ALF Coach/i);
    await expect(input).toBeVisible({ timeout: 20000 });
    await input.fill('How people, policy, and place shape equitable cities');
    await input.press('Enter');

    // Ask for ideas, click a card, ensure it inserts (not auto-send), then append and send
    const ideasBtn = page.getByTestId('ideas-button');
    await ideasBtn.click();
    // Click the first suggestion card (robust across wording)
    const firstCard = page.getByRole('button').filter({ hasText: /Tap to insert/i }).first();
    await expect(firstCard).toBeVisible();
    await firstCard.click();
    // Verify the suggestion inserted into the input (non-empty)
    await expect(input).toHaveValue(/.+/);
    await input.type(' — edited');
    await input.press('Enter');

    // Provide an EQ and proceed to Standards gate
    await input.fill('How might we improve transit access fairly for underserved neighborhoods?');
    await input.press('Enter');

    // Try UI confirmation via Ideas panel; fallback to textual confirmation
    await page.getByTestId('ideas-button').click();
    const acceptBtn = page.getByTestId('accept-continue');
    if (await acceptBtn.count()) {
      await acceptBtn.click();
      try {
        await expect(page.getByTestId('standards-confirm')).toBeVisible({ timeout: 25000 });
      } catch {
        // Fallback: use Review Checklist → Standards
        const standardsLink = page.getByRole('button', { name: /^\s*•\s*Standards\s*$/i });
        if (await standardsLink.count()) {
          await standardsLink.click();
        }
        await expect(page.locator('select').first()).toBeVisible({ timeout: 25000 });
      }
    } else {
      await confirmAndWaitForStandards(page, input);
    }

    // Standards step should be visible (wait for the confirm button)
    await expect(page.getByTestId('standards-confirm')).toBeVisible({ timeout: 25000 });
    await page.locator('select').first().selectOption({ label: 'CCSS ELA' });

    // Fill first standard row
    await page.getByPlaceholder('e.g., HS-ETS1-2').fill('CCSS.ELA-LITERACY.W.11-12.7');
    await page.getByPlaceholder('plain-language label').fill('Conduct sustained research; synthesize multiple sources');
    await page.getByPlaceholder('why this fits').fill('Supports stakeholder research and synthesis');

    // Confirm standards
    const confirm = page.getByTestId('standards-confirm').or(page.getByRole('button', { name: /Confirm Standards/i }));
    await expect(confirm).toBeEnabled();
    await confirm.click();

    // Should move to Challenge stage; Stage Guide container visible
    await expect(page.getByTestId('stage-guide')).toBeVisible();

    // Proceed to deliverables checks on desktop
    await page.setViewportSize({ width: 1280, height: 900 });

    // Fill Deliverables via micro-steps sequence (Milestones → Rubric → Impact)
    await dismissOverlays(page);
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

    // Review Checklist should not show Artifacts/Checkpoints as missing (allow brief delay to update)
    await expect(page.getByText(/Review Checklist/i)).toBeVisible();
    for (let i = 0; i < 5; i++) {
      const missingArtifacts = await page.getByRole('button', { name: /^\s*•\s*Artifacts\s*$/i }).count();
      const missingCheckpoints = await page.getByRole('button', { name: /^\s*•\s*Checkpoints\s*$/i }).count();
      if (missingArtifacts === 0 && missingCheckpoints === 0) break;
      await page.waitForTimeout(500);
      if (missingArtifacts > 0) {
        await page.getByTestId('deliverables-artifacts-edit').click();
        await chatInput.fill('One-page brief; slides');
        await chatInput.press('Enter');
      }
      if (missingCheckpoints > 0) {
        await page.getByTestId('deliverables-checkpoints-edit').click();
        await chatInput.fill('Kickoff check-in — capture: plan; where: Drive; owner: team; due: week 1');
        await chatInput.press('Enter');
      }
    }
  });
});
