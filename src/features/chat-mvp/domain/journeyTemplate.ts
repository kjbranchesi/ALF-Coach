/**
 * Journey Template Generator (synchronous fallback)
 * Kept separate from AI generator to avoid static+dynamic import mixing
 */

import type { CapturedData, WizardContext } from './stages';
import { estimateDurationWeeks, recommendedPhaseCount, allocateWeekRanges } from './stages';

interface JourneyTemplatePhase {
  title: string;
  summary: string;
  defaultActivities: string[];
}

function inferDeliverableType(captured: CapturedData, wizard: WizardContext): string {
  const challenge = captured.ideation.challenge || '';

  if (/exhibit/i.test(challenge)) {return 'exhibition';}
  if (/campaign/i.test(challenge)) {return 'campaign';}
  if (/proposal/i.test(challenge)) {return 'proposal';}
  if (/prototype/i.test(challenge)) {return 'prototype';}
  if (/podcast/i.test(challenge)) {return 'podcast';}
  if (/documentary/i.test(challenge)) {return 'documentary';}

  return 'project artifact';
}

function inferAudience(captured: CapturedData, wizard: WizardContext): string {
  const challenge = captured.ideation.challenge || '';
  const audienceMatch = challenge.match(/for\s+([^.,;]+)/i);
  if (audienceMatch) {return audienceMatch[1].trim();}

  const grade = wizard.gradeLevel?.toLowerCase() || '';
  if (grade.includes('elementary')) {return 'families and younger students';}
  if (grade.includes('middle')) {return 'school leaders and community partners';}
  if (grade.includes('high')) {return 'community partners and decision makers';}

  return 'the audience';
}

function selectTemplate(subjects: string[] | undefined, deliverableType: string): JourneyTemplatePhase[] {
  const subject = subjects?.[0]?.toLowerCase() || '';

  if (subject.includes('science') || subject.includes('stem')) {
    return [
      { title: 'Research & Explore', summary: 'Investigate the scientific concepts behind {topic} through research and experimentation.', defaultActivities: ['Literature review', 'Lab experiments', 'Data collection'] },
      { title: 'Hypothesis & Design', summary: 'Form testable hypotheses and design the {deliverable} approach.', defaultActivities: ['Develop hypotheses', 'Create experimental design', 'Plan methodology'] },
      { title: 'Build & Test', summary: 'Construct prototypes and test them with {audience} feedback.', defaultActivities: ['Build prototype', 'Run tests', 'Collect feedback'] },
      { title: 'Analyze & Present', summary: 'Analyze results and present findings to {audience}.', defaultActivities: ['Data analysis', 'Create visualizations', 'Practice presentation'] }
    ];
  }

  if (subject.includes('history') || subject.includes('social') || subject.includes('humanities')) {
    return [
      { title: 'Investigate Context', summary: 'Audit current realities around {topic} and interview {audience}.', defaultActivities: ['Research historical context', 'Conduct interviews', 'Analyze primary sources'] },
      { title: 'Analyze & Synthesize', summary: 'Compare perspectives and identify patterns related to {topic}.', defaultActivities: ['Compare viewpoints', 'Identify themes', 'Create synthesis'] },
      { title: 'Co-Design Solutions', summary: 'Run brainstorming sprints and pick a direction for the {deliverable}.', defaultActivities: ['Brainstorm ideas', 'Evaluate options', 'Select approach'] },
      { title: 'Launch & Reflect', summary: 'Finalize the {deliverable} and present to {audience}.', defaultActivities: ['Refine final work', 'Rehearse presentation', 'Reflect on process'] }
    ];
  }

  if (subject.includes('art') || subject.includes('music') || subject.includes('theatre')) {
    return [
      { title: 'Explore & Experiment', summary: 'Investigate artistic techniques and experiment with approaches to {topic}.', defaultActivities: ['Research artists/styles', 'Experimental sketches', 'Try multiple mediums'] },
      { title: 'Develop Concept', summary: 'Refine artistic vision and plan the {deliverable} for {audience}.', defaultActivities: ['Concept development', 'Storyboarding', 'Collect feedback'] },
      { title: 'Create & Iterate', summary: 'Produce the {deliverable} and refine based on critiques.', defaultActivities: ['Create first draft', 'Peer critique', 'Revise work'] },
      { title: 'Exhibition & Reflection', summary: 'Present work to {audience} and reflect on artistic growth.', defaultActivities: ['Install/stage work', 'Artist talk', 'Reflection'] }
    ];
  }

  return [
    { title: 'Investigate the Context', summary: 'Audit current realities around {topic} and interview {audience}.', defaultActivities: ['Research topic', 'Conduct interviews', 'Identify key issues'] },
    { title: 'Co-Design Possibilities', summary: 'Run brainstorming sprints, analyze models, and pick a direction for the {deliverable}.', defaultActivities: ['Brainstorm solutions', 'Analyze examples', 'Choose direction'] },
    { title: 'Prototype & Test', summary: 'Build a draft, run a critique, and capture feedback from peers and {audience}.', defaultActivities: ['Create prototype', 'Peer review', 'Gather feedback'] },
    { title: 'Launch & Reflect', summary: 'Finalize the {deliverable}, rehearse the presentation, and plan reflection on impact.', defaultActivities: ['Final revisions', 'Rehearse presentation', 'Deliver to audience'] }
  ];
}

function generateTemplateJourney(
  captured: CapturedData,
  wizard: WizardContext,
  phaseCount: number,
  ranges: string[]
) {
  const topic = wizard.projectTopic || captured.ideation.bigIdea || captured.ideation.essentialQuestion || 'this topic';
  const deliverable = inferDeliverableType(captured, wizard);
  const audience = inferAudience(captured, wizard);
  const template = selectTemplate(wizard.subjects, deliverable);
  return template.slice(0, phaseCount).map((phase, index) => ({
    name: phase.title,
    duration: ranges[index] || '',
    summary: phase.summary.replace('{topic}', topic).replace('{deliverable}', deliverable).replace('{audience}', audience),
    activities: phase.defaultActivities
  }));
}

export function generateSmartJourney(
  captured: CapturedData,
  wizard: WizardContext,
) {
  const weeks = estimateDurationWeeks(wizard.duration);
  const phaseCount = recommendedPhaseCount(weeks);
  const ranges = allocateWeekRanges(weeks, phaseCount);
  return generateTemplateJourney(captured, wizard, phaseCount, ranges);
}

