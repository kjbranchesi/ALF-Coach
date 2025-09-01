import { expect, Page } from '@playwright/test';

export async function gotoDashboard(page: Page) {
  await page.goto('/app/dashboard');
  await expect(page.getByRole('heading', { name: /dashboard/i })).toBeVisible();
}

export async function createNewBlueprint(page: Page) {
  const btn = page.getByRole('button', { name: /new blueprint/i });
  await expect(btn).toBeVisible();
  await btn.click();
  await expect(page.getByText(/Project Focus|What will students work on\?/i)).toBeVisible();
}

export async function fillWizardAndStart(page: Page, opts: {
  topic: string; subject?: string; gradeBand?: string; durationLabel?: string;
}) {
  // Topic entry
  const topicInput = page.getByRole('textbox').first();
  await topicInput.fill(opts.topic);
  const nextBtn = page.getByRole('button', { name: /^Next$/i });
  await nextBtn.click();

  // Subject selection
  if (opts.subject) {
    const subjectBtn = page.getByRole('button', { name: new RegExp(opts.subject, 'i') });
    await subjectBtn.click();
  }

  // Grade band
  if (opts.gradeBand) {
    const gradeBtn = page.getByRole('button', { name: new RegExp(opts.gradeBand, 'i') });
    await gradeBtn.click();
  }

  // Duration
  if (opts.durationLabel) {
    const durationBtn = page.getByRole('button', { name: new RegExp(opts.durationLabel, 'i') });
    await durationBtn.click();
  }

  // Finish/Start
  const startBtn = page.getByRole('button', { name: /Start|Finish|Done/i }).first();
  await startBtn.click();
  await expect(page.getByText(/Working on: Big Idea|Let's start by defining the Big Idea/i)).toBeVisible();
}

export async function acceptAndContinue(page: Page) {
  const byTestId = page.getByTestId('accept-continue');
  if (await byTestId.count()) {
    await byTestId.first().click();
    return;
  }
  const acceptBtn = page.getByRole('button', { name: /accept & continue/i });
  await expect(acceptBtn).toBeVisible();
  await acceptBtn.click();
}

export async function typeAndEnter(page: Page, text: string) {
  const input = page.getByPlaceholder(/Message ALF Coach|Message/i);
  await input.fill(text);
  await input.press('Enter');
}

export async function openRecapDetails(page: Page) {
  await page.getByRole('button', { name: /show details/i }).first().click().catch(() => {});
}

export async function jumpToJourneyPhase(page: Page, phase: 'Analyze'|'Brainstorm'|'Prototype'|'Evaluate') {
  await page.getByRole('button', { name: new RegExp(`Edit ${phase}`, 'i') }).click();
  await expect(page.getByText(new RegExp(`${phase}`, 'i'))).toBeVisible();
}

export async function jumpToDeliverablesSection(page: Page, section: 'Milestones'|'Rubric'|'Impact') {
  await page.getByRole('button', { name: new RegExp(`Edit ${section}`, 'i') }).click();
  await expect(page.getByText(new RegExp(`${section}|milestones|rubric|impact`, 'i'))).toBeVisible();
}
