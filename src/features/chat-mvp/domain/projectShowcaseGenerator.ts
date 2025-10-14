/**
 * Project Showcase Generator
 * Transforms captured chat data into complete ProjectShowcaseV2 structure
 * with AI-generated assignments, run-of-show, and materials
 */

import type { CapturedData, WizardContext } from './stages';
import type { ProjectShowcaseV2, WeekCard, AssignmentCard, GradeBand, Timeframe } from '../../../types/showcaseV2';
import { generateAI } from './ai';

/**
 * Generate complete project showcase from captured data
 */
export async function generateProjectShowcase(
  captured: CapturedData,
  wizard: WizardContext,
  metadata: {
    projectId: string;
    title: string;
    tagline: string;
    description: string;
  }
): Promise<ProjectShowcaseV2> {
  console.log('[projectShowcaseGenerator] Starting showcase generation for:', metadata.title);

  // Extract base data
  const bigIdea = captured.ideation?.bigIdea || 'Core concepts';
  const essentialQuestion = captured.ideation?.essentialQuestion || '';
  const challenge = captured.ideation?.challenge || '';
  const phases = captured.journey?.phases || [];
  const milestones = captured.deliverables?.milestones || [];
  const artifacts = captured.deliverables?.artifacts || [];
  const rubricCriteria = captured.deliverables?.rubric?.criteria || [];

  // Parse duration and grade band
  const duration = wizard.duration || '8-10 weeks';
  const totalWeeks = parseTotalWeeks(duration);
  const gradeBand = mapGradeBand(wizard.gradeLevel || 'MS');

  // Generate components in parallel
  const [microOverview, runOfShow, assignments, outcomes, materials] = await Promise.all([
    generateMicroOverview(bigIdea, challenge, phases, wizard),
    generateRunOfShow(phases, milestones, totalWeeks, wizard, captured),
    generateAssignments(phases, artifacts, rubricCriteria, wizard, captured),
    generateOutcomes(challenge, artifacts, wizard),
    generateMaterials(phases, artifacts, wizard)
  ]);

  const showcase: ProjectShowcaseV2 = {
    id: metadata.projectId,
    version: '2.0.0',
    hero: {
      title: metadata.title,
      tagline: metadata.tagline,
      gradeBand,
      timeframe: mapTimeframe(duration),
      subjects: wizard.subjects || ['Interdisciplinary']
    },
    microOverview,
    fullOverview: metadata.description,
    schedule: {
      totalWeeks,
      lessonsPerWeek: 3,
      lessonLengthMin: 55
    },
    runOfShow,
    outcomes,
    materialsPrep: materials,
    assignments,
    polish: {
      microRubric: rubricCriteria.slice(0, 6),
      checkpoints: milestones.slice(0, 5).map(m => m.name),
      tags: generateTags(wizard.subjects || [])
    }
  };

  console.log('[projectShowcaseGenerator] Showcase generation complete:', {
    assignmentsCount: assignments.length,
    runOfShowCount: runOfShow.length,
    outcomesCount: outcomes.core.length
  });

  return showcase;
}

/**
 * Generate 3-4 sentence micro-overview
 */
async function generateMicroOverview(
  bigIdea: string,
  challenge: string,
  phases: Array<{ name: string; activities: string[] }>,
  wizard: WizardContext
): Promise<string[]> {
  const phaseNames = phases.map(p => p.name).join(', ');

  const prompt = `Generate a 3-sentence micro-overview for this project-based learning experience. Each sentence should be 12-28 words.

**Project Details:**
- Big Idea: ${bigIdea}
- Challenge: ${challenge}
- Learning Journey: ${phaseNames}
- Grade Level: ${wizard.gradeLevel}
- Subjects: ${wizard.subjects?.join(', ')}

**Requirements:**
1. Sentence 1: What students investigate or explore (use active verbs)
2. Sentence 2: How they build understanding or create solutions
3. Sentence 3: How they share results or take action

**Examples:**
- "Students audit campus waste, energy, and water systems to surface actionable sustainability gaps."
- "Teams co-design solutions with facilities staff, modeling impact through data storytelling and budgets."
- "They launch campaigns that pilot greener practices, publish results, and secure stakeholder commitments."

Write ONLY the 3 sentences, one per line, no numbering:`;

  try {
    const result = await generateAI(prompt, {
      model: 'gemini-flash-latest', // Use latest with thinking mode for better quality
      temperature: 0.7,
      maxTokens: 200
    });

    const sentences = result.split('\n').filter(s => s.trim()).slice(0, 3);
    return sentences.length === 3 ? sentences : generateFallbackMicroOverview(bigIdea, challenge);
  } catch (error) {
    console.error('[projectShowcaseGenerator] Micro-overview generation failed:', error);
    return generateFallbackMicroOverview(bigIdea, challenge);
  }
}

function generateFallbackMicroOverview(bigIdea: string, challenge: string): string[] {
  return [
    `Students explore ${bigIdea} through hands-on investigation and research.`,
    `Teams collaborate to design solutions that address ${challenge}.`,
    `They present findings and recommendations to authentic audiences for feedback and action.`
  ];
}

/**
 * Generate run-of-show week cards from phases
 */
async function generateRunOfShow(
  phases: Array<{ name: string; activities: string[] }>,
  milestones: Array<{ name: string }>,
  totalWeeks: number,
  wizard: WizardContext,
  captured: CapturedData
): Promise<WeekCard[]> {
  console.log('[projectShowcaseGenerator] Generating run-of-show for', phases.length, 'phases');

  const weeksPerPhase = Math.floor(totalWeeks / Math.max(phases.length, 1));

  const weekCards: WeekCard[] = [];
  let assignmentCounter = 1;

  for (let i = 0; i < phases.length; i++) {
    const phase = phases[i];
    const startWeek = i * weeksPerPhase + 1;
    const endWeek = Math.min(startWeek + weeksPerPhase - 1, totalWeeks);

    const weekLabel = startWeek === endWeek ? `Week ${startWeek}` : `Weeks ${startWeek}–${endWeek}`;

    const card = await generateWeekCard(
      phase,
      weekLabel,
      i,
      phases.length,
      `A${assignmentCounter}`,
      wizard,
      milestones[i]?.name
    );

    weekCards.push(card);
    assignmentCounter++;
  }

  return weekCards;
}

async function generateWeekCard(
  phase: { name: string; activities: string[] },
  weekLabel: string,
  phaseIndex: number,
  totalPhases: number,
  assignmentId: string,
  wizard: WizardContext,
  milestone?: string
): Promise<WeekCard> {
  const kind = mapPhaseKind(phaseIndex, totalPhases);
  const activities = phase.activities?.join(', ') || 'hands-on learning activities';

  const prompt = `Generate a week card for this project-based learning phase.

**Phase:** ${phase.name}
**Activities:** ${activities}
**Phase Type:** ${kind}
**Week:** ${weekLabel}
**Milestone:** ${milestone || 'Progress check'}

Generate:
1. Focus statement (under 90 characters): One sentence describing what this week is about
2. Teacher actions (3-5 bullets, under 10 words each): What teacher does to support learning
3. Student actions (3-5 bullets, under 10 words each): What students do during this phase
4. Deliverables (2-3 bullets): What students produce
5. Checkpoint (1-2 bullets): How teacher confirms readiness to move forward

Format as JSON:
{
  "focus": "...",
  "teacher": ["...", "...", "..."],
  "students": ["...", "...", "..."],
  "deliverables": ["...", "..."],
  "checkpoint": ["..."]
}`;

  try {
    const result = await generateAI(prompt, {
      model: 'gemini-flash-latest', // Use latest with thinking mode for better quality
      temperature: 0.6,
      maxTokens: 400
    });

    const parsed = JSON.parse(result);

    return {
      weekLabel,
      kind,
      focus: parsed.focus || phase.name,
      teacher: Array.isArray(parsed.teacher) ? parsed.teacher : [parsed.teacher],
      students: Array.isArray(parsed.students) ? parsed.students : [parsed.students],
      deliverables: Array.isArray(parsed.deliverables) ? parsed.deliverables : [parsed.deliverables],
      checkpoint: Array.isArray(parsed.checkpoint) ? parsed.checkpoint : [parsed.checkpoint],
      assignments: [assignmentId]
    };
  } catch (error) {
    console.error('[projectShowcaseGenerator] Week card generation failed:', error);
    return generateFallbackWeekCard(phase, weekLabel, kind, assignmentId, milestone);
  }
}

function generateFallbackWeekCard(
  phase: { name: string; activities: string[] },
  weekLabel: string,
  kind: string,
  assignmentId: string,
  milestone?: string
): WeekCard {
  return {
    weekLabel,
    kind: kind as any,
    focus: `${phase.name}: Students engage in ${phase.activities?.[0] || 'learning activities'}`,
    teacher: [
      'Introduce key concepts and tools',
      'Facilitate student collaboration',
      'Monitor progress and provide feedback'
    ],
    students: [
      phase.activities?.[0] || 'Engage in hands-on activities',
      phase.activities?.[1] || 'Collaborate with peers',
      'Document learning and progress'
    ],
    deliverables: [milestone || phase.name, 'Progress documentation'],
    checkpoint: ['Teacher reviews work quality'],
    assignments: [assignmentId]
  };
}

/**
 * Generate assignment cards from phases and artifacts
 */
async function generateAssignments(
  phases: Array<{ name: string; activities: string[] }>,
  artifacts: Array<{ name: string }>,
  rubricCriteria: string[],
  wizard: WizardContext,
  captured: CapturedData
): Promise<AssignmentCard[]> {
  console.log('[projectShowcaseGenerator] Generating', phases.length, 'assignments');

  const assignments: AssignmentCard[] = [];

  for (let i = 0; i < phases.length && i < 6; i++) {
    const phase = phases[i];
    const artifact = artifacts[i] || artifacts[0];
    const criteria = rubricCriteria.slice(i * 2, i * 2 + 3);

    const assignment = await generateAssignment(
      `A${i + 1}`,
      phase,
      artifact?.name,
      criteria,
      wizard
    );

    assignments.push(assignment);
  }

  return assignments;
}

async function generateAssignment(
  id: string,
  phase: { name: string; activities: string[] },
  artifactName: string | undefined,
  successCriteria: string[],
  wizard: WizardContext
): Promise<AssignmentCard> {
  const activities = phase.activities?.join(', ') || 'learning activities';

  const prompt = `Generate a detailed assignment card for this learning phase.

**Phase:** ${phase.name}
**Activities:** ${activities}
**Artifact:** ${artifactName || 'Learning artifact'}
**Success Criteria:** ${successCriteria.join(', ')}
**Grade Level:** ${wizard.gradeLevel}

Generate:
1. Title (under 80 characters): Clear, action-oriented title
2. Summary (under 25 words): What students will do and why
3. Student directions (5-7 bullets, under 10 words each): Step-by-step what students do
4. Teacher setup (3-5 bullets, under 10 words each): What teacher prepares
5. Evidence (2-3 bullets): What students produce
6. Success criteria (3-5 bullets, under 8 words each): Kid-friendly "I can..." statements
7. Checkpoint (1 line): How teacher confirms completion

Format as JSON:
{
  "title": "...",
  "summary": "...",
  "studentDirections": ["...", "...", "..."],
  "teacherSetup": ["...", "..."],
  "evidence": ["...", "..."],
  "successCriteria": ["I can ...", "I can ..."],
  "checkpoint": "..."
}`;

  try {
    const result = await generateAI(prompt, {
      model: 'gemini-flash-latest', // Use latest with thinking mode for better quality
      temperature: 0.6,
      maxTokens: 500
    });

    const parsed = JSON.parse(result);

    return {
      id,
      title: parsed.title || phase.name,
      summary: parsed.summary || `Students engage in ${phase.name} activities`,
      studentDirections: Array.isArray(parsed.studentDirections) ? parsed.studentDirections : [parsed.studentDirections],
      teacherSetup: Array.isArray(parsed.teacherSetup) ? parsed.teacherSetup : [parsed.teacherSetup],
      evidence: Array.isArray(parsed.evidence) ? parsed.evidence : [parsed.evidence],
      successCriteria: Array.isArray(parsed.successCriteria) ? parsed.successCriteria : successCriteria,
      checkpoint: parsed.checkpoint || 'Teacher reviews student work'
    };
  } catch (error) {
    console.error('[projectShowcaseGenerator] Assignment generation failed:', error);
    return generateFallbackAssignment(id, phase, artifactName, successCriteria);
  }
}

function generateFallbackAssignment(
  id: string,
  phase: { name: string; activities: string[] },
  artifactName: string | undefined,
  successCriteria: string[]
): AssignmentCard {
  return {
    id,
    title: phase.name,
    summary: `Students complete ${phase.name} activities and create ${artifactName || 'learning artifacts'}`,
    studentDirections: [
      phase.activities?.[0] || 'Complete assigned tasks',
      'Collaborate with team members',
      'Document your learning process',
      'Create required artifacts',
      'Submit work for review'
    ],
    teacherSetup: [
      'Prepare materials and resources',
      'Review assignment requirements',
      'Set up collaboration structures'
    ],
    evidence: [artifactName || 'Completed work', 'Documentation', 'Reflection'],
    successCriteria: successCriteria.length ? successCriteria : [
      'I complete all required tasks',
      'I collaborate effectively',
      'I produce quality work'
    ],
    checkpoint: 'Teacher reviews work quality and completion'
  };
}

/**
 * Generate outcomes from challenge and artifacts
 */
async function generateOutcomes(
  challenge: string,
  artifacts: Array<{ name: string }>,
  wizard: WizardContext
): Promise<{ core: string[]; extras: string[]; audiences: string[] }> {
  const artifactNames = artifacts.map(a => a.name).join(', ');

  const prompt = `Generate learning outcomes for this project.

**Challenge:** ${challenge}
**Artifacts:** ${artifactNames}
**Grade Level:** ${wizard.gradeLevel}

Generate:
1. Core outcomes (3 bullets): Essential student accomplishments
2. Extra outcomes (4-6 bullets): Optional extensions or deeper work
3. Audiences (3-5 bullets): Who will see or benefit from student work

Format as JSON:
{
  "core": ["...", "...", "..."],
  "extras": ["...", "...", "..."],
  "audiences": ["...", "..."]
}`;

  try {
    const result = await generateAI(prompt, {
      model: 'gemini-flash-latest', // Use latest with thinking mode for better quality
      temperature: 0.6,
      maxTokens: 300
    });

    const parsed = JSON.parse(result);

    return {
      core: Array.isArray(parsed.core) ? parsed.core : [parsed.core],
      extras: Array.isArray(parsed.extras) ? parsed.extras : [parsed.extras],
      audiences: Array.isArray(parsed.audiences) ? parsed.audiences : [parsed.audiences]
    };
  } catch (error) {
    console.error('[projectShowcaseGenerator] Outcomes generation failed:', error);
    return {
      core: [
        `Design solutions that address ${challenge}`,
        `Create ${artifacts[0]?.name || 'authentic artifacts'}`,
        'Communicate findings to real audiences'
      ],
      extras: [
        'Extend project to broader contexts',
        'Collaborate with community partners',
        'Publish results beyond classroom'
      ],
      audiences: ['Teachers', 'Peers', 'Community members', 'School leadership']
    };
  }
}

/**
 * Generate materials list
 */
async function generateMaterials(
  phases: Array<{ name: string; activities: string[] }>,
  artifacts: Array<{ name: string }>,
  wizard: WizardContext
): Promise<{ coreKit: string[]; noTechFallback: string[] }> {
  const activities = phases.flatMap(p => p.activities).join(', ');

  return {
    coreKit: [
      'Laptops or tablets for research',
      'Collaboration workspace (physical or digital)',
      'Presentation materials (slides, posters)',
      'Documentation tools (cameras, notebooks)',
      'Project-specific materials as needed'
    ],
    noTechFallback: [
      'Paper and poster board',
      'Printed research materials',
      'Physical collaboration spaces'
    ]
  };
}

/**
 * Helper functions
 */

function parseTotalWeeks(duration: string): number {
  const match = duration.match(/(\d+)/);
  return match ? parseInt(match[1], 10) : 8;
}

function mapGradeBand(gradeLevel: string): GradeBand {
  const lower = gradeLevel.toLowerCase();
  if (lower.includes('high') || lower.includes('9') || lower.includes('10') || lower.includes('11') || lower.includes('12')) {
    return 'HS';
  }
  if (lower.includes('middle') || lower.includes('6') || lower.includes('7') || lower.includes('8')) {
    return 'MS';
  }
  return 'ES';
}

function mapTimeframe(duration: string): Timeframe {
  const weeks = parseTotalWeeks(duration);
  if (weeks <= 2) return '1–2 lessons';
  if (weeks <= 4) return '2–4 weeks';
  if (weeks <= 6) return '4–6 weeks';
  if (weeks <= 8) return '6–8 weeks';
  if (weeks <= 10) return '8–10 weeks';
  return '10–12 weeks';
}

function mapPhaseKind(index: number, total: number): string {
  if (index === 0) return 'Foundations';
  if (index === 1) return 'Planning';
  if (index === total - 1) return 'Exhibit';
  if (index === total - 2) return 'Extension';
  return 'Build';
}

function generateTags(subjects: string[]): string[] {
  const tags: string[] = [];
  if (subjects.some(s => s.toLowerCase().includes('science'))) tags.push('STEM');
  if (subjects.some(s => s.toLowerCase().includes('english') || s.toLowerCase().includes('ela'))) tags.push('Literacy');
  if (subjects.length > 2) tags.push('Interdisciplinary');
  return tags.slice(0, 4);
}
