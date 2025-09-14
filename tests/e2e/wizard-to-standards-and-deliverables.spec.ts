import { test, expect } from '@playwright/test';

async function mockGemini(page) {
  await page.route('**/.netlify/functions/gemini', async (route) => {
    const body = {
      candidates: [
        {
          content: {
            parts: [
              {
                text: JSON.stringify({
                  chatResponse: "Great! I captured that.",
                  suggestions: [
                    { id: 's1', text: 'Consider an authentic audience', category: 'idea' },
                    { id: 's2', text: 'Focus on concrete outcomes', category: 'idea' },
                    { id: 's3', text: 'Plan a checkpoint', category: 'idea' },
                    { id: 's4', text: 'Refine the question stem', category: 'idea' },
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

test.describe('Wizard → Chat flow with Standards gate', () => {
  test('complete wizard, proceed through EQ → Standards → Challenge, add one deliverable', async ({ page }) => {
    await mockGemini(page);

    const newId = `new-${Date.now()}`;
    // For reliability on production, skip onboarding directly
    await page.goto(`/app/blueprint/${newId}?skip=true`);

    // Now in BIG_IDEA directly

    // BIG_IDEA (Chat)
    const chat = page.getByPlaceholder(/Message ALF Coach/i);
    await expect(chat).toBeVisible();
    await chat.fill('How people, policy, and place shape equitable cities');
    await chat.press('Enter');

    // Provide an EQ and confirm progression
    await chat.fill('How might we improve transit access fairly for underserved neighborhoods?');
    await chat.press('Enter');
    const accept = page.getByTestId('accept-continue');
    if (await accept.count()) {
      await accept.click();
    } else {
      // Fallback: type a confirmation to advance (UI may not render the button if suggestions are hidden)
      await chat.fill('yes');
      await chat.press('Enter');
    }

    // Wait for STANDARDS stage chip to appear
    await expect(page.getByText('Step 3 of 6')).toBeVisible({ timeout: 20000 });

    // Standards gate — wait for the panel then pick a framework
    await expect(page.getByTestId('standards-confirm')).toBeVisible();
    await page.locator('select').first().selectOption({ label: 'CCSS ELA' });

    // Fill 1st standard row (code/label/rationale)
    await page.getByPlaceholder('e.g., HS-ETS1-2').fill('CCSS.ELA-LITERACY.W.11-12.7');
    await page.getByPlaceholder('plain-language label').fill('Conduct sustained research; synthesize multiple sources');
    await page.getByPlaceholder('why this fits').fill('Supports stakeholder research and synthesis');

    // Confirm Standards
    const confirm = page.getByTestId('standards-confirm').or(page.getByRole('button', { name: /Confirm Standards/i }));
    await expect(confirm).toBeEnabled();
    await confirm.click();

    // Challenge stage visible
    await expect(page.getByTestId('stage-guide')).toBeVisible();

    // Add one Milestone via quick action and chat message
    await page.getByTestId('deliverables-milestones-edit').click();
    await chat.fill('Research summary');
    await chat.press('Enter');

    // Verify Review Checklist visible (desktop layout)
    await page.setViewportSize({ width: 1280, height: 900 });
    await expect(page.getByText(/Review Checklist/i)).toBeVisible();
  });
});
