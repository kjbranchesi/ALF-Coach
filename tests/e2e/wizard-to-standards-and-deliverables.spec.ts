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

    // Provide an EQ and accept
    await chat.fill('How might we improve transit access fairly for underserved neighborhoods?');
    await chat.press('Enter');
    const accept = page.getByTestId('accept-continue');
    if (await accept.count()) await accept.click();

    // Standards gate
    await expect(page.getByRole('combobox')).toBeVisible();
    await page.getByRole('combobox').selectOption({ label: 'CCSS ELA' });

    // Fill 1st standard row (code/label/rationale)
    const inputs = page.locator('input');
    await inputs.nth(0).fill('CCSS.ELA-LITERACY.W.11-12.7');
    await inputs.nth(1).fill('Conduct sustained research; synthesize multiple sources');
    await inputs.nth(2).fill('Supports stakeholder research and synthesis');

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
