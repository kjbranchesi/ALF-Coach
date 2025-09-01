import { test } from '@playwright/test';
import { gotoDashboard, createNewBlueprint, fillWizardAndStart, typeAndEnter, jumpToJourneyPhase, jumpToDeliverablesSection } from './utils/flow';

test('Scenario C: Higher-Ed experienced flow', async ({ page }) => {
  await gotoDashboard(page);
  await createNewBlueprint(page);

  await fillWizardAndStart(page, {
    topic: 'Technology and culture',
    subject: 'Interdisciplinary',
    gradeBand: 'Higher Education',
    durationLabel: 'Long'
  });

  // Fast ideation with typed entries
  await typeAndEnter(page, 'Tech and culture co-evolve');
  await typeAndEnter(page, 'How does technology reshape cultural practices?');
  await typeAndEnter(page, 'Create a briefing on tech impacts for a community org');

  // Jump-driven Journey
  await jumpToJourneyPhase(page, 'Analyze');
  await typeAndEnter(page, 'Goal: map stakeholders and needs');
  await typeAndEnter(page, 'Activity: interviews + desk research');
  await typeAndEnter(page, 'Output: research memo');
  await typeAndEnter(page, 'Duration: 2 lessons');

  // Deliverables direct edits
  await jumpToDeliverablesSection(page, 'Rubric');
  await typeAndEnter(page, 'Criteria: Insight, Rigor, Usability, Impact');

  await jumpToDeliverablesSection(page, 'Milestones');
  await typeAndEnter(page, 'Proposal; Pilot; Public briefing');

  await jumpToDeliverablesSection(page, 'Impact');
  await typeAndEnter(page, 'Audience: community org; Method: public briefing');
  await acceptAndContinue(page);
});
