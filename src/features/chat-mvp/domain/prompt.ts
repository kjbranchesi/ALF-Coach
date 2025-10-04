import type { Stage, CapturedData } from './stages';
import { stageGuide, stageOrder, summarizeCaptured, estimateDurationWeeks, recommendedPhaseCount, allocateWeekRanges } from './stages';
import { buildGradeBandPrompt, resolveGradeBand } from '../../../ai/gradeBandRules';

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
  assessmentHint?: string | null;
}

const STAGE_COACHING: Record<Stage, {
  qualityBar: string[];
  mustAvoid?: string[];
  outputShape: string;
  defaultNeed: string;
  correctionExamples: string[];
  correctionReminder: string;
  toneExamples: { good: string; bad: string }[];
  suggestionBrief: string;
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
    defaultNeed: 'Help the teacher craft a bold Big Idea that students can carry with them.',
    correctionReminder: 'Clarify that a Big Idea is a declarative, transferable insight students will remember.',
    correctionExamples: [
      'Big Idea examples: "Personal choices ripple through community health"; "Justice requires shared responsibility"; "Design thinking thrives on empathy."',
      'Nudge them to speak in plain language that teenagers can own.'
    ],
    toneExamples: [
      { bad: 'Bad: "Great start. Next, provide a better idea."', good: 'Good: "I hear your aim to empower students. Let’s capture that in a crisp idea like…"' }
    ],
    suggestionBrief: 'Generate three Big Idea statements (transferable concepts) tailored to the context. Each 6–12 words, declarative, no numbering, one per line.'
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
    defaultNeed: 'Polish the Essential Question so it pulls students into sustained inquiry.',
    correctionReminder: 'Remind that Essential Questions must be open-ended, debate-worthy, and tied to the Big Idea.',
    correctionExamples: [
      'Better EQ pattern: "How might we close the gap between health knowledge and daily choices?"',
      'Highlight how to avoid yes/no questions and pull in the audience.'
    ],
    toneExamples: [
      { bad: 'Bad: "Please rephrase your question."', good: 'Good: "Your focus on community wellness is strong. How might we ask it so teens feel the urgency?"' }
    ],
    suggestionBrief: 'Generate three Essential Questions under 18 words each. Begin with inquiry stems like "How might" or "What happens when" and ensure they invite debate. One per line, no numbering.'
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
    defaultNeed: 'Shape an authentic challenge students can realistically deliver.',
    correctionReminder: 'Emphasize defining who benefits and what students will produce within the timeline.',
    correctionExamples: [
      'Example: "Design a peer wellness campaign for ninth graders that tackles stress management."',
      'Invite them to clarify the audience and deliverable in one sentence.'
    ],
    toneExamples: [
      { bad: 'Bad: "Define the challenge more clearly."', good: 'Good: "Let’s anchor this in a real audience—who most needs the wellness expertise your students are building?"' }
    ],
    suggestionBrief: 'Generate three authentic challenge statements that include the student action and target audience. Keep each under 20 words, no numbering, one per line.'
  },
  JOURNEY: {
    qualityBar: [
      'Three to four phases that flow from investigation to creation to exhibition.',
      'Each phase has at least one concrete activity or experience.',
      'Includes moments for feedback, reflection, or expert input.',
      'Phase pacing aligns with the project timeline (e.g., Weeks 1–2, Week 3, etc.).'
    ],
    outputShape: `
1. Summarize in one line what the current journey covers and what is missing.
2. Provide a short ordered list (• bullets) suggesting phase names with one activity each.
3. End with a question nudging them to commit to the next phase or secure resources/feedback.
    `.trim(),
    defaultNeed: 'Design a learning arc that maintains momentum and aligns to the challenge.',
    correctionReminder: 'Encourage them to outline 3–4 phases that move from inquiry to exhibition.',
    correctionExamples: [
      'Example phases: Investigate local data → Co-design prototypes → Test with community → Showcase insights.',
      'Remind them to include at least one critique or feedback moment.'
    ],
    toneExamples: [
      { bad: 'Bad: "List phases."', good: 'Good: "Right now the journey jumps from research to showcase—let’s build the middle so students can iterate."' }
    ],
    suggestionBrief: 'Generate three journey phases. Format each as "Phase Title (Weeks X–Y): key activity" with 3–6 words per segment. One per line.'
  },
  DELIVERABLES: {
    qualityBar: [
      'Final artifacts show learning to the chosen audience.',
      'Three or more milestones scaffold progress.',
      'Rubric criteria describe quality in student-friendly language.',
      'Milestones trace back to journey phases and the overall timeline.'
    ],
    outputShape: `
1. Acknowledge current deliverables progress in one concise sentence.
2. Offer a bullet list pairing (milestone → artifact → suggested rubric criterion) for any gaps.
3. Conclude with a question that drives them to confirm milestones or plan feedback/exhibition logistics.
    `.trim(),
    defaultNeed: 'Lock in deliverables, milestones, and rubric criteria that fit the project goals.',
    correctionReminder: 'Focus them on naming milestones, final products, and criteria that show quality.',
    correctionExamples: [
      'Milestone sample: "Mid-unit peer clinic to rehearse wellness pitches."',
      'Criterion sample: "Evidence of impact on the target audience."'
    ],
    toneExamples: [
      { bad: 'Bad: "Add milestones and rubric."', good: 'Good: "You already have a strong artifact in mind—let’s map the checkpoints that keep it on track."' }
    ],
    suggestionBrief: 'Generate three milestone/artifact ideas. Format each as "Milestone → Artifact or rubric focus" in under 16 words. One per line.'
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
  assessmentHint = null,
}: BuildStagePromptArgs): string {
  const guide = stageGuide(stage);
  const stageConfig = STAGE_COACHING[stage];
  const subjects = wizard.subjects?.length ? wizard.subjects.join(', ') : 'Not specified';
  const duration = wizard.duration || 'Not specified';
  const gradeLevel = wizard.gradeLevel || 'Not specified';
  const resolvedGradeBand = resolveGradeBand(wizard.gradeLevel);
  const gradeBandGuidance = resolvedGradeBand ? buildGradeBandPrompt(resolvedGradeBand) : null;
  const location = wizard.location || 'Not specified';
  const topic = wizard.projectTopic || 'Not specified';
  const materials = wizard.materials || 'Not specified';
  const durationWeeks = estimateDurationWeeks(wizard.duration);

  const progressSummary = snapshot.trim() ? snapshot.trim() : 'No substantive entries captured yet.';
  const immediateNeed = gatingReason
    ? `Close this gap: ${gatingReason}`
    : assessmentHint
      ? `Reinforce this guidance: ${assessmentHint}`
    : messageCountInStage > 0 || stageTurns > 0
      ? 'Advance the conversation by improving what the teacher shared and guide the very next step.'
      : stageConfig.defaultNeed;

  const nextStageIndex = stageOrder.indexOf(stage) + 1;
  const nextStage = nextStageIndex >= 0 && nextStageIndex < stageOrder.length ? stageOrder[nextStageIndex] : null;

  const contextTable = [
    `• Subjects: ${subjects}`,
    `• Grade level: ${gradeLevel}`,
    `• Duration: ${duration}`,
    `• Learning setting: ${location}`,
    `• Project focus: ${topic}`,
    `• Available assets/constraints: ${materials}`,
  ].join('\n');

  const qualityLines = stageConfig.qualityBar.map((item) => `- ${item}`).join('\n');
  const avoidLines = stageConfig.mustAvoid?.length
    ? stageConfig.mustAvoid.map((item) => `- ${item}`).join('\n')
    : null;

  let timelineLine: string | null = null;
  if (durationWeeks && ['JOURNEY', 'DELIVERABLES'].includes(stage)) {
    if (stage === 'JOURNEY') {
      const phaseCount = recommendedPhaseCount(durationWeeks);
      const ranges = allocateWeekRanges(durationWeeks, phaseCount).slice(0, phaseCount).join(' → ');
      timelineLine = `Timeline hint: ${durationWeeks}-week project → aim for ${phaseCount} phases (${ranges}).`;
    } else if (stage === 'DELIVERABLES') {
      const phaseCount = Math.max(3, Math.min(6, recommendedPhaseCount(durationWeeks)));
      timelineLine = `Timeline hint: ${durationWeeks}-week project → map at least ${phaseCount} milestones (one per phase) leading to the launch.`;
    }
  }

  const forwardLook = nextStage
    ? `If the teacher signals confidence, preview how this sets up the next stage (${nextStage.replace(/_/g, ' ').toLowerCase()}) in one short phrase—no scripted transitions, keep it conversational.`
    : 'If everything is locked, acknowledge their expertise and suggest a concrete next move (e.g., sharing the blueprint).';

  const toneExamples = stageConfig.toneExamples
    .map((example) => [`❌ ${example.bad}`, `✅ ${example.good}`].join('\n'))
    .join('\n');

  const teacherInput = userInput.trim() || '(Teacher has not added details yet—prompt them constructively.)';

  return [
    `ROLE: You are ALF Coach—an expert project-based learning coach. Your voice respects educator expertise, stays grounded, and is never generic. Always follow acknowledge → educate → enhance → advance. Stay under 110 words.`,
    `CRITICAL CONTEXT (reference at least one item in your opening sentence):\n${contextTable}`,
    `STAGE FOCUS: ${stage} — ${guide.what}`,
    `WHY THIS MATTERS: ${guide.why}`,
    `COACHING TIP: ${guide.tip}`,
    `CAPTURED SNAPSHOT:\n${progressSummary}`,
    `QUALITY BAR:\n${qualityLines}`,
    gradeBandGuidance ? `GRADE-BAND GUARDRAILS:\n${gradeBandGuidance}` : null,
    avoidLines ? `AVOID:\n${avoidLines}` : null,
    timelineLine,
    `IMMEDIATE NEED: ${immediateNeed}`,
    `OUTPUT SHAPE (follow exactly):\n${stageConfig.outputShape}`,
    `TONE GUIDE:\n${toneExamples}`,
    forwardLook,
    `TEACHER INPUT:\n${teacherInput}`
  ].filter(Boolean).join('\n\n');
}

interface BuildCorrectionPromptArgs {
  stage: Stage;
  wizard: {
    subjects?: string[];
    gradeLevel?: string;
    duration?: string;
    projectTopic?: string;
  };
  userInput: string;
  reason: string;
}

export function buildCorrectionPrompt({ stage, wizard, userInput, reason }: BuildCorrectionPromptArgs): string {
  const config = STAGE_COACHING[stage];
  const subjects = wizard.subjects?.length ? wizard.subjects.join(', ') : 'their subject area';
  const grade = wizard.gradeLevel || 'their students';
  const topic = wizard.projectTopic || 'the project focus';
  const resolvedGradeBand = resolveGradeBand(wizard.gradeLevel);
  const gradeBandGuidance = resolvedGradeBand ? buildGradeBandPrompt(resolvedGradeBand) : null;

  return [
    'You are ALF Coach. Offer constructive, respectful guidance to a fellow educator.',
    `Stage: ${stage}.`,
    `Context: Subjects ${subjects}; Grade ${grade}; Topic ${topic}.`,
    gradeBandGuidance ? `Grade-band guardrails:\n${gradeBandGuidance}` : null,
    `Teacher attempt: ${userInput.trim() || '(blank)'}.`,
    `Why it falls short: ${reason}.`,
    config.correctionReminder,
    config.correctionExamples.join('\n'),
    'Respond in 2 concise sentences: first, empathize and clarify the expectation; second, offer 1–2 tailored examples or prompts to move them forward. End with an invitational question.'
  ].join('\n\n');
}

export function buildSuggestionPrompt({
  stage,
  wizard,
  captured
}: {
  stage: Stage;
  wizard: {
    subjects?: string[];
    gradeLevel?: string;
    duration?: string;
    projectTopic?: string;
  };
  captured: CapturedData;
}): string {
  const config = STAGE_COACHING[stage];
  const subjects = wizard.subjects?.length ? wizard.subjects.join(', ') : 'your subject area';
  const grade = wizard.gradeLevel || 'your students';
  const topic = wizard.projectTopic || 'your project focus';
  const snapshot = summarizeCaptured({ wizard, captured, stage });
  const resolvedGradeBand = resolveGradeBand(wizard.gradeLevel);
  const gradeBandGuidance = resolvedGradeBand ? buildGradeBandPrompt(resolvedGradeBand) : null;

  return [
    'You are ALF Coach generating quick idea starters for an educator. Return only the ideas—no numbering, no extra commentary.',
    `Stage: ${stage}.`,
    `Subject(s): ${subjects}. Grade band: ${grade}. Project topic: ${topic}.`,
    gradeBandGuidance ? `Grade-band guardrails:\n${gradeBandGuidance}` : null,
    `Captured snapshot:\n${snapshot}`,
    config.suggestionBrief
  ].join('\n\n');
}
