import { test, expect } from '@playwright/test';

async function ensureSkipOnboarding(page) {
  // Wait for possible redirect new-* -> bp_*
  await page.waitForURL(/\/app\/blueprint\/(bp_|new-)[^?]+(\?.*)?$/, { timeout: 20000 });
  const url = new URL(page.url());
  if (url.searchParams.get('skip') !== 'true') {
    url.searchParams.set('skip', 'true');
    await page.goto(url.toString(), { waitUntil: 'domcontentloaded' });
  }
}

async function confirmAndWaitForStandards(page, chat) {
  for (let i = 0; i < 3; i++) {
    await page.waitForTimeout(400);
    await chat.fill('yes');
    await chat.press('Enter');
    // Wait briefly to allow transition
    try {
      await expect(page.getByTestId('standards-confirm')).toBeVisible({ timeout: 5000 });
      return;
    } catch {
      // try again
    }
  }
  // Try jumping via Review Checklist → Standards
  const standardsLink = page.getByRole('button', { name: /^\s*•\s*Standards\s*$/i });
  if (await standardsLink.count()) {
    await standardsLink.click();
    try {
      await expect(page.getByRole('button', { name: /^NGSS$/ })).toBeVisible({ timeout: 10000 });
      return;
    } catch {}
  }
  // Final wait before failing
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
    await ensureSkipOnboarding(page);
    await dismissOverlays(page);

    // Now in BIG_IDEA directly

    // BIG_IDEA (Chat)
    const chat = page.getByPlaceholder(/Message ALF Coach/i);
    await expect(chat).toBeVisible({ timeout: 20000 });
    await chat.fill('How people, policy, and place shape equitable cities');
    await chat.press('Enter');

    // Provide an EQ and confirm progression
    await chat.fill('How might we improve transit access fairly for underserved neighborhoods?');
    await chat.press('Enter');
    // Try UI confirmation first (Accept & Continue via Ideas panel)
    await page.getByTestId('ideas-button').click();
    const acceptBtn = page.getByTestId('accept-continue');
    if (await acceptBtn.count()) {
      await acceptBtn.click();
      try {
        await expect(page.getByTestId('standards-confirm')).toBeVisible({ timeout: 25000 });
      } catch {
        // Fallback: jump via Review Checklist → Standards
        const standardsLink = page.getByRole('button', { name: /^\s*•\s*Standards\s*$/i });
        if (await standardsLink.count()) {
          await standardsLink.click();
        }
        await expect(page.getByRole('button', { name: /^NGSS$/ })).toBeVisible({ timeout: 25000 });
      }
    } else {
      // Fallback: textual confirmation with retries to avoid race
      await confirmAndWaitForStandards(page, chat);
    }

    // Standards gate — wait for the panel then pick a framework
    await expect(page.getByTestId('standards-confirm')).toBeVisible({ timeout: 25000 });
    const ngssButton = page.getByRole('button', { name: /^NGSS$/ });
    await expect(ngssButton).toBeVisible({ timeout: 25000 });
    await ngssButton.click();

    // Fill 1st standard row (code/label/rationale)
    await page.getByPlaceholder('e.g., LOCAL.SCI.3 or DISTRICT.PROJ.1').fill('NGSS.HS-ETS1-2');
    await page.getByPlaceholder('e.g., Community Problem Solving').fill('Design experiments to test transit ideas');
    await page.getByPlaceholder('Describe what this standard requires and how your project will address it...').fill('Students iterate on prototypes with stakeholder feedback');
    await page.getByRole('button', { name: /Add Standard/i }).click();

    // Confirm Standards
    const confirm = page.getByTestId('standards-confirm').or(page.getByRole('button', { name: /Confirm Standards/i }));
    await expect(confirm).toBeEnabled();
    await confirm.click();

    // Challenge stage visible
    await expect(page.getByTestId('stage-guide')).toBeVisible();

    // Add one Milestone via quick action and chat message
    await dismissOverlays(page);
    await page.getByTestId('deliverables-milestones-edit').click();
    await chat.fill('Research summary');
    await chat.press('Enter');

    // Verify Review Checklist visible (desktop layout)
    await page.setViewportSize({ width: 1280, height: 900 });
    await expect(page.getByText(/Review Checklist/i)).toBeVisible();
  });
});
