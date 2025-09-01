import { test, expect } from '@playwright/test';
import { gotoDashboard, createNewBlueprint, fillWizardAndStart, acceptAndContinue, openRecapDetails, typeAndEnter } from './utils/flow';

test('Scenario B: HS Social Studies intermediate flow', async ({ page }) => {
  await gotoDashboard(page);
  await createNewBlueprint(page);

  await fillWizardAndStart(page, {
    topic: 'Urban history and neighborhoods',
    subject: 'Social Studies',
    gradeBand: 'High',
    durationLabel: 'Medium'
  });

  // Ideation with own content
  await typeAndEnter(page, 'How policy and people shape cities');
  await acceptAndContinue(page);

  await typeAndEnter(page, 'How has immigration shaped our city’s neighborhoods?');
  await acceptAndContinue(page);

  await typeAndEnter(page, 'Design a walking tour that highlights immigration stories and urban change');
  await acceptAndContinue(page);

  // Journey: mix typed + accept
  await typeAndEnter(page, 'Analyze: interviews and primary sources');
  await typeAndEnter(page, 'Prototype: draft tour and test with peers');
  await acceptAndContinue(page);

  // Deliverables: provide combined lines then accept
  await typeAndEnter(page, 'Milestones: research summary; stakeholder test; final tour');
  await typeAndEnter(page, 'Rubric: Insight, Rigor, Impact');
  await typeAndEnter(page, 'Impact: Community stakeholders; Stakeholder briefing');
  await acceptAndContinue(page);

  await openRecapDetails(page);
  await expect(page.getByText(/Saved/i)).toBeVisible();
});
