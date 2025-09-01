import { test, expect } from '@playwright/test';
import { gotoDashboard, createNewBlueprint, fillWizardAndStart, acceptAndContinue, typeAndEnter, openRecapDetails, jumpToJourneyPhase, jumpToDeliverablesSection } from './utils/flow';

test.describe('Full Blueprint Creation Flow (New Architecture)', () => {
  test('complete wizard → ideation → journey → deliverables and verify recap', async ({ page }) => {
    await gotoDashboard(page);
    await createNewBlueprint(page);

    await fillWizardAndStart(page, {
      topic: 'Community energy solutions',
      subject: 'Science',
      gradeBand: 'High',
      durationLabel: 'Medium'
    });

    // Ideation
    await typeAndEnter(page, 'Sustainable energy choices'); // Big Idea
    await acceptAndContinue(page);

    await typeAndEnter(page, 'How can our school reduce energy usage meaningfully?'); // EQ
    await acceptAndContinue(page);

    await typeAndEnter(page, 'Design and test a plan to reduce classroom energy usage'); // Challenge
    await acceptAndContinue(page);

    // Journey quick check via jump + minimal content
    await openRecapDetails(page);
    await jumpToJourneyPhase(page, 'Analyze');
    await typeAndEnter(page, 'Goal: understand current energy use');
    await typeAndEnter(page, 'Activity: audit energy in classrooms');
    await typeAndEnter(page, 'Output: audit summary');
    await typeAndEnter(page, 'Duration: 2 lessons');

    // Confirm minimal plan to proceed (if needed)
    await typeAndEnter(page, 'yes');

    // Deliverables
    await openRecapDetails(page);
    await jumpToDeliverablesSection(page, 'Milestones');
    await typeAndEnter(page, 'Audit; Prototype; Showcase');
    await jumpToDeliverablesSection(page, 'Rubric');
    await typeAndEnter(page, 'Understanding, Process, Product');
    await jumpToDeliverablesSection(page, 'Impact');
    await typeAndEnter(page, 'Audience: school community; Method: exhibition');

    // Confirm to complete
    await typeAndEnter(page, 'yes');

    // Recap shows Saved badges
    await openRecapDetails(page);
    await expect(page.getByText(/Saved/i)).toBeVisible();
  });
});

