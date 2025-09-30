import type { Stage } from './stages';
import { stageGuide, stageOrder } from './stages';

interface BuildStagePromptArgs {
  stage: Stage;
  wizard: {
    subjects?: string[];
    gradeLevel?: string;
    duration?: string;
    location?: string;
    projectTopic?: string;
    materials?: string;
  };
  userInput: string;
  snapshot: string;
  gatingReason?: string | null;
  messageCountInStage?: number;
  stageTurns?: number;
}

const STAGE_COACHING: Record<Stage, {
  qualityBar: string[];
  mustAvoid?: string[];
  outputShape: string;
  defaultNeed: string;
}> = {
  BIG_IDEA: {
    qualityBar: [
      'A single, transferable concept (no questions or multi-sentence paragraphs).',
      'Connects to the subject and real-world relevance described by the teacher.',
      'Ideal length 6–15 words; sounds inspiring and memorable.'
    ],
    mustAvoid: ['Do not restate the prompt. Generate fresh ideas tailored to their context.'],
    outputShape: `
1. Start with one sentence that reflects their context and why their current thinking matters.
2. Offer two bullet points with sharper Big Idea options that tie directly to the subject/grade/topic.
3. End with a single question that helps them select or remix an option (no extra commentary).
    `.trim(),
    defaultNeed: 'Help the teacher craft a bold Big Idea that students can carry with them.'
  },
  ESSENTIAL_QUESTION: {
    qualityBar: [
      'Open-ended, begins with inquiry language (“How might…”, “What happens when…”).',
      'Drives investigation of the Big Idea and feels urgent for the described audience.',
      'Cannot be answered with a yes/no or a quick fact; invites multiple perspectives.'
    ],
    outputShape: `
1. Ground the response by mirroring their Big Idea/attempt in one sentence.
2. Provide two refined Essential Question candidates as bullet points, each under 18 words.
3. Close with one coaching question prompting them to pick a direction or deepen specificity (mention audience or outcome).
    `.trim(),
    defaultNeed: 'Polish the Essential Question so it pulls students into sustained inquiry.'
  },
  CHALLENGE: {
    qualityBar: [
      'Names a real audience and the value they receive.',
      'Specifies the student action or product, scoped to the project duration.',
      'Connects clearly back to the Essential Question / Big Idea.'
    ],
    outputShape: `
1. Reflect in one sentence what they already have (audience, action, gaps).
2. Suggest a tightened challenge statement plus one authentic audience or venue idea.
3. Finish with a question that locks in scope or logistics (timeline, feedback moment, success signal).
    `.trim(),
    defaultNeed: 'Shape an authentic challenge students can realistically deliver.'
  },
  JOURNEY: {
    qualityBar: [
      'Three to four phases that flow from investigation to creation to exhibition.',
      'Each phase has at least one concrete activity or experience.',
      'Includes moments for feedback, reflection, or expert input.'
    ],
    outputShape: `
1. Summarize in one line what the current journey covers and what is missing.
2. Provide a short ordered list (• bullets) suggesting phase names with one activity each.
3. End with a question nudging them to commit to the next phase or secure resources/feedback.
    `.trim(),
    defaultNeed: 'Design a learning arc that maintains momentum and aligns to the challenge.'
  },
  DELIVERABLES: {
    qualityBar: [
      'Final artifacts show learning to the chosen audience.',
      'Three or more milestones scaffold progress.',
      'Rubric criteria describe quality in student-friendly language.'
    ],
    outputShape: `
1. Acknowledge current deliverables progress in one concise sentence.
2. Offer a bullet list pairing (milestone → artifact → suggested rubric criterion) for any gaps.
3. Conclude with a question that drives them to confirm milestones or plan feedback/exhibition logistics.
    `.trim(),
    defaultNeed: 'Lock in deliverables, milestones, and rubric criteria that fit the project goals.'
  }
};

export function buildStagePrompt({
  stage,
  wizard,
  userInput,
  snapshot,
  gatingReason,
  messageCountInStage = 0,
  stageTurns = 0,
}: BuildStagePromptArgs): string {
  const guide = stageGuide(stage);
  const stageConfig = STAGE_COACHING[stage];
  const subjects = wizard.subjects?.length ? wizard.subjects.join(', ') : 'Not specified';
  const duration = wizard.duration || 'Not specified';
  const gradeLevel = wizard.gradeLevel || 'Not specified';
  const location = wizard.location || 'Not specified';
  const topic = wizard.projectTopic || 'Not specified';
  const materials = wizard.materials || 'Not specified';

  const progressSummary = snapshot.trim() ? snapshot.trim() : 'No substantive entries captured yet.';
  const immediateNeed = gatingReason
    ? `Close this gap: ${gatingReason}`
    : messageCountInStage > 0 || stageTurns > 0
      ? 'Advance the conversation by improving what the teacher shared and guide the very next step.'
      : stageConfig.defaultNeed;

  const nextStageIndex = stageOrder.indexOf(stage) + 1;
  const nextStage = nextStageIndex >= 0 && nextStageIndex < stageOrder.length ? stageOrder[nextStageIndex] : null;

  const contextTable = [
    `- Subjects: ${subjects}`,
    `- Grade Level: ${gradeLevel}`,
    `- Duration: ${duration}`,
    `- Learning Location: ${location}`,
    `- Project Topic: ${topic}`,
    `- Materials / Constraints: ${materials}`,
  ].join('\n');

  const qualityLines = stageConfig.qualityBar.map((item) => `- ${item}`).join('\n');
  const avoidLines = stageConfig.mustAvoid?.length
    ? stageConfig.mustAvoid.map((item) => `- ${item}`).join('\n')
    : null;

  const forwardLook = nextStage
    ? `If the teacher is confident, preview the upcoming stage (${nextStage.replace(/_/g, ' ').toLowerCase()}) in one short clause.`
    : 'If everything is locked, congratulate them and suggest exporting or sharing the blueprint.';

  const teacherInput = userInput.trim() || '(Teacher has not added details yet—prompt them constructively.)';

  return [
    `ROLE: You are ALF Coach—an expert project-based learning coach. Your voice is warm, succinct, and actionable. Always follow acknowledge → educate → enhance → advance. Stay under 110 words.`,
    `STAGE: ${stage} — ${guide.what}`,
    `WHY IT MATTERS: ${guide.why}`,
    `COACHING TIP: ${guide.tip}`,
    `TEACHER CONTEXT:\n${contextTable}`,
    `CAPTURED SNAPSHOT:\n${progressSummary}`,
    `QUALITY BAR:\n${qualityLines}`,
    avoidLines ? `AVOID:\n${avoidLines}` : null,
    `IMMEDIATE NEED: ${immediateNeed}`,
    `OUTPUT SHAPE (follow exactly):\n${stageConfig.outputShape}`,
    forwardLook,
    `TEACHER INPUT:\n${teacherInput}`
  ].filter(Boolean).join('\n\n');
}
