import { test, expect } from '@playwright/test';
import { gotoDashboard, createNewBlueprint, fillWizardAndStart, acceptAndContinue, typeAndEnter, openRecapDetails } from './utils/flow';

test('Scenario A: Elementary new-to-PBL flow', async ({ page }) => {
  await gotoDashboard(page);
  await createNewBlueprint(page);

  await fillWizardAndStart(page, {
    topic: 'School community helpers',
    subject: 'English Language Arts',
    gradeBand: 'Elementary',
    durationLabel: 'Short'
  });

  // Big Idea via Accept & Continue (uses suggestions)
  await acceptAndContinue(page);

  // Essential Question typed + accept
  await typeAndEnter(page, 'How do helpers keep our school safe and happy?');
  await acceptAndContinue(page);

  // Challenge via ideas or accept
  const ideas = page.getByTestId('ideas-button');
  if (await ideas.count()) await ideas.first().click();
  await acceptAndContinue(page);

  // Journey minimal path: confirm plan
  await typeAndEnter(page, 'yes');
  await acceptAndContinue(page);

  // Deliverables minimal path: confirm package
  await typeAndEnter(page, 'yes');
  await acceptAndContinue(page);

  await openRecapDetails(page);
  await expect(page.getByText(/Saved/i)).toBeVisible();
});
