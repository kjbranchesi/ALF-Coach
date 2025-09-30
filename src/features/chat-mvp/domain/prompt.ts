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
  const subjects = wizard.subjects?.length ? wizard.subjects.join(', ') : 'Not specified';
  const duration = wizard.duration || 'Not specified';
  const gradeLevel = wizard.gradeLevel || 'Not specified';
  const location = wizard.location || '';
  const topic = wizard.projectTopic || '';
  const materials = wizard.materials || '';

  const progressSummary = snapshot.trim() ? snapshot.trim() : 'No details recorded yet for this stage.';
  const stageNeed = gatingReason
    ? gatingReason
    : messageCountInStage > 0 || stageTurns > 0
      ? 'Build on what the teacher shared. Offer one concrete refinement or confirmation and finish with a focused question.'
      : `Help the teacher make meaningful progress on ${stage.replace(/_/g, ' ').toLowerCase()}.`;

  const nextStageIndex = stageOrder.indexOf(stage) + 1;
  const nextStage = nextStageIndex >= 0 && nextStageIndex < stageOrder.length ? stageOrder[nextStageIndex] : null;
  const forwardLook = nextStage
    ? `If they seem confident, preview the upcoming stage (${nextStage.replace(/_/g, ' ').toLowerCase()}) and confirm readiness.`
    : 'This is the final stage—celebrate readiness and suggest exporting the blueprint when appropriate.';

  const styleGuide = 'Respond in 2 short paragraphs or a brief bullet list: acknowledge their thinking, add expert insight, and offer a specific next action. Stay under 120 words and avoid code blocks.';

  const contextLines = [
    `- Subjects: ${subjects}`,
    `- Grade Level: ${gradeLevel}`,
    `- Duration: ${duration}`,
  ];
  if (location) contextLines.push(`- Location: ${location}`);
  if (topic) contextLines.push(`- Project Topic: ${topic}`);
  if (materials) contextLines.push(`- Available Materials: ${materials}`);

  return [
    `STAGE FOCUS: ${guide.what}`,
    `WHY IT MATTERS: ${guide.why}`,
    `COACHING TIP: ${guide.tip}`,
    `Teacher Context:\n${contextLines.join('\n')}`,
    `Progress Snapshot:\n${progressSummary}`,
    `Immediate Need: ${stageNeed}`,
    forwardLook,
    styleGuide,
    `Teacher Input:\n${userInput.trim() || '(Teacher is looking for your guidance.)'}`
  ].join('\n\n');
}
