// Minimal stage domain for ChatMVP
export type Stage = 'BIG_IDEA' | 'ESSENTIAL_QUESTION' | 'CHALLENGE' | 'JOURNEY' | 'DELIVERABLES';

export interface CapturedData {
  ideation: {
    bigIdea?: string;
    essentialQuestion?: string;
    challenge?: string;
  };
  journey: {
    phases: { id?: string; name: string; focus?: string; activities: string[]; checkpoint?: string }[];
    resources: string[];
  };
  deliverables: {
    milestones: { id?: string; name: string; phaseId?: string }[];
    artifacts: { id?: string; name: string; phaseId?: string }[];
    rubric: { criteria: string[] };
  };
}

export type WizardContext = {
  subjects?: string[];
  gradeLevel?: string;
  duration?: string;
  location?: string;
  projectTopic?: string;
};

const SMALL_WORDS = new Set(['and', 'or', 'the', 'to', 'for', 'with', 'of', 'in', 'on', 'at', 'a', 'an']);

function titleize(value: string): string {
  const cleaned = value.replace(/^[^a-z0-9]+/i, '').trim();
  if (!cleaned) {return '';}
  return cleaned
    .split(/\s+/)
    .map((word, index) => {
      const lower = word.toLowerCase();
      if (index > 0 && SMALL_WORDS.has(lower)) {return lower;}
      if (lower === '&') {return '&';}
      return lower.charAt(0).toUpperCase() + lower.slice(1);
    })
    .join(' ');
}

function cleanBullet(value: string): string {
  return value.replace(/^\s*[-*•\d().]+\s*/, '').trim();
}

function insertConnectorBreaks(value: string): string {
  return value
    .replace(/([.;!?])\s+(?=(First|Second|Third|Next|Then|After|Later|Meanwhile|Finally|Last|Lastly|Subsequently|Eventually)\b)/gi, '$1\n')
    .replace(/\b(First|Second|Third|Fourth|Next|Then|After that|Afterwards|Later|Meanwhile|Subsequently|Finally|Last|Lastly|Begin with|Start with|Start by|To start|Kick off)\b/gi, '\n$1 ')
    .replace(/\b(Phase|Step|Stage|Week|Weeks?)\s*(\d+|one|two|three|four|five|six|seven|eight|nine|ten)(?:[-–—]\d+)?[:.\-]?\s*/gi, '\n$1 $2 ')
    .replace(/(?:^|\s)(\d+\. |\(\d+\)\s+)/g, match => `\n${match.trim()} `);
}

function splitPhaseEntries(value: string): string[] {
  const trimmed = value.replace(/\r/g, '\n').trim();
  if (!trimmed) {return [];}

  const newlineParts = trimmed.split(/\n+/).map(cleanBullet).filter(Boolean);
  if (newlineParts.length >= 3) {return newlineParts;}

  const connectorParts = insertConnectorBreaks(trimmed).split(/\n+/).map(cleanBullet).filter(Boolean);
  if (connectorParts.length >= 3) {return connectorParts;}

  const sentenceParts = trimmed
    .split(/(?<=[.!?])\s+(?=[A-Z])/)
    .map(cleanBullet)
    .filter(Boolean);
  if (sentenceParts.length >= 3) {return sentenceParts;}

  const commaParts = trimmed.split(/,\s+(?=[A-Za-z])/).map(cleanBullet).filter(Boolean);
  if (commaParts.length >= 3) {return commaParts;}

  return connectorParts.length ? connectorParts : (newlineParts.length ? newlineParts : [trimmed]);
}

function derivePhaseNameFromText(text: string, index: number): string {
  const cleaned = text
    .replace(/^(students|they|we)\s+will\s+/i, '')
    .replace(/^(to|and)\s+/i, '')
    .split(/[.;]/)[0]
    .trim();
  if (!cleaned) {return `Phase ${index + 1}`;}
  const words = cleaned.split(/\s+/).slice(0, 6).join(' ');
  return titleize(words) || `Phase ${index + 1}`;
}

function extractActivitiesFromText(text: string): string[] {
  if (!text) {return [];}
  const cleaned = text
    .replace(/^(students|they|we)\s+will\s+/i, '')
    .replace(/^(to|and)\s+/i, '')
    .trim();
  const bulletSplit = cleaned.split(/[,;•\n]+/).map(item => item.trim()).filter(item => item.length > 4);
  if (bulletSplit.length >= 2) {
    return Array.from(new Set(bulletSplit)).slice(0, 3);
  }
  const sentenceSplit = cleaned
    .split(/(?<=[.!?])\s+/)
    .map(item => item.replace(/[.!?]+$/g, '').trim())
    .filter(item => item.length > 4);
  if (sentenceSplit.length) {
    return Array.from(new Set(sentenceSplit)).slice(0, 3);
  }
  return cleaned ? [cleaned] : [];
}

export function extractPhasesFromText(value: string): { id?: string; name: string; focus?: string; activities: string[]; checkpoint?: string }[] {
  const entries = splitPhaseEntries(value);
  return entries.map((entry, index) => {
    const normalized = entry.trim();
    if (!normalized) {
      return { id: `p${index + 1}`, name: `Phase ${index + 1}`, activities: [] };
    }

    const colonMatch = normalized.match(/^([^:–—-]+)[:–—-]\s*(.+)$/);
    if (colonMatch) {
      const name = titleize(colonMatch[1]);
      const activities = extractActivitiesFromText(colonMatch[2]);
      return { id: `p${index + 1}`, name: name || `Phase ${index + 1}`, focus: colonMatch[2], activities };
    }

    const phaseMatch = normalized.match(/^(?:phase|step|stage)\s*(\d+|one|two|three|four|five|six|seven|eight|nine|ten)?[:.\-]?\s*(.*)$/i);
    if (phaseMatch) {
      const name = titleize(phaseMatch[2]) || `Phase ${index + 1}`;
      const activities = extractActivitiesFromText(phaseMatch[2]);
      return { id: `p${index + 1}`, name, focus: phaseMatch[2], activities };
    }

    const connectorMatch = normalized.match(/^(first|second|third|fourth|next|then|after that|afterwards|later|finally|last|lastly|begin with|start with|start by|to start|kick off)\b[,:-]?\s*(.*)$/i);
    if (connectorMatch) {
      const activitiesSource = connectorMatch[2] || normalized;
      const name = derivePhaseNameFromText(activitiesSource, index);
      const activities = extractActivitiesFromText(activitiesSource);
      return { id: `p${index + 1}`, name, focus: activitiesSource, activities };
    }

    const name = derivePhaseNameFromText(normalized, index);
    const activities = extractActivitiesFromText(normalized);
    return { id: `p${index + 1}`, name, focus: normalized, activities };
  });
}

export function getPhaseCandidatesForAssessment(value: string): string[] {
  return splitPhaseEntries(value);
}

export function estimateDurationWeeks(raw?: string): number | null {
  if (!raw) {return null;}
  const input = raw.toLowerCase();
  const rangeMatch = input.match(/(\d+(?:\.\d+)?)\s*(?:-|to)\s*(\d+(?:\.\d+)?)/);
  if (rangeMatch) {
    const a = Number(rangeMatch[1]);
    const b = Number(rangeMatch[2]);
    if (!Number.isNaN(a) && !Number.isNaN(b)) {
      return Math.round(((a + b) / 2) * inferUnitMultiplier(input));
    }
  }
  const singleMatch = input.match(/(\d+(?:\.\d+)?)/);
  if (singleMatch) {
    const value = Number(singleMatch[1]);
    if (!Number.isNaN(value)) {
      return Math.max(1, Math.round(value * inferUnitMultiplier(input)));
    }
  }
  if (input.includes('semester')) {return 18;}
  if (input.includes('trimester')) {return 12;}
  if (input.includes('quarter')) {return 9;}
  if (input.includes('term')) {return 10;}
  if (input.includes('year')) {return 32;}
  return null;
}

function inferUnitMultiplier(input: string): number {
  if (input.includes('day')) {return 1 / 5;}
  if (input.includes('month')) {return 4;}
  if (input.includes('week')) {return 1;}
  if (input.includes('hour')) {return 1 / 15;}
  return 1;
}

export function recommendedPhaseCount(weeks: number | null): number {
  if (!weeks) {return 4;}
  if (weeks <= 2) {return 3;}
  if (weeks <= 5) {return 4;}
  if (weeks <= 8) {return 5;}
  return 6;
}

export function allocateWeekRanges(weeks: number | null, count: number): string[] {
  if (!weeks || weeks < 1) {
    return Array.from({ length: count }, () => '');
  }
  const totalWeeks = Math.max(count, weeks);
  const base = Math.floor(totalWeeks / count);
  let remainder = totalWeeks % count;
  const ranges: string[] = [];
  let start = 1;
  for (let i = 0; i < count; i += 1) {
    const span = base + (remainder > 0 ? 1 : 0);
    if (remainder > 0) {remainder -= 1;}
    const end = start + span - 1;
    const label = span <= 1 ? `Week ${start}` : `Weeks ${start}-${end}`;
    ranges.push(label);
    start = end + 1;
  }
  return ranges;
}

function describeLearnerGroup(wizard: WizardContext): string {
  const grade = wizard.gradeLevel?.toLowerCase() || '';
  const subject = wizard.subjects?.[0]?.toLowerCase();
  let group = 'students';
  if (grade.includes('elementary') || grade.includes('k-5') || grade.includes('grade 5')) {
    group = 'upper elementary students';
  } else if (grade.includes('middle')) {
    group = 'middle schoolers';
  } else if (grade.includes('high')) {
    group = 'high school students';
  } else if (grade.includes('adult')) {
    group = 'adult learners';
  } else if (grade.includes('college')) {
    group = 'college students';
  }
  if (subject) {
    return `${group} in ${subject}`;
  }
  return group;
}

function inferAudience(wizard: WizardContext, challenge?: string): string {
  if (challenge) {
    const audienceMatch = challenge.match(/for\s+([^.,;]+)/i) || challenge.match(/with\s+([^.,;]+)/i);
    if (audienceMatch) {
      return audienceMatch[1].trim();
    }
  }
  const grade = wizard.gradeLevel?.toLowerCase() || '';
  if (grade.includes('elementary')) {return 'families and younger students';}
  if (grade.includes('middle')) {return 'school leaders and community partners';}
  if (grade.includes('high')) {return 'community partners and decision makers';}
  return 'the people most impacted by the work';
}

export function createEmptyCaptured(): CapturedData {
  return {
    ideation: {},
    journey: { phases: [], resources: [] },
    deliverables: { milestones: [], artifacts: [], rubric: { criteria: [] } }
  };
}

export const stageOrder: Stage[] = ['BIG_IDEA', 'ESSENTIAL_QUESTION', 'CHALLENGE', 'JOURNEY', 'DELIVERABLES'];

export function nextStage(current: Stage): Stage | null {
  const i = stageOrder.indexOf(current);
  if (i < 0 || i === stageOrder.length - 1) {return null;}
  return stageOrder[i + 1];
}

export function stageGuide(stage: Stage): { what: string; why: string; tip: string } {
  switch (stage) {
    case 'BIG_IDEA':
      return {
        what: 'Define the Big Idea — a transferable concept that anchors the project.',
        why: 'It keeps work meaningful and coherent, and guides every decision that follows.',
        tip: 'Write a short, strong concept; we can refine language later.'
      };
    case 'ESSENTIAL_QUESTION':
      return {
        what: 'Shape an Essential Question that invites sustained inquiry.',
        why: 'A powerful EQ drives curiosity and connects the Big Idea to action.',
        tip: 'Make it open-ended, debate-worthy, and tied to your Big Idea.'
      };
    case 'CHALLENGE':
      return {
        what: 'Define an authentic Challenge for a real audience.',
        why: 'It creates purpose and raises quality by bringing work to the world.',
        tip: 'Name the audience and outcome; keep scope achievable in your timeframe.'
      };
    case 'JOURNEY':
      return {
        what: 'Outline phases (Analyze → Brainstorm → Prototype → Evaluate) with key activities.',
        why: 'A clear journey builds momentum and manages complexity.',
        tip: '3–4 phases are enough. One or two activities per phase.'
      };
    case 'DELIVERABLES':
      return {
        what: 'List final artifacts, 3+ milestones, and a simple rubric.',
        why: 'Clarity on outcomes and quality supports student success.',
        tip: 'Aim for 1–3 artifacts, 3+ milestones, and 3–6 rubric criteria.'
      };
  }
}

export function stageSuggestions(stage: Stage): string[] {
  switch (stage) {
    case 'BIG_IDEA':
      return [
        'How systems change over time',
        'How innovation emerges from constraints',
        'The relationship between people and place'
      ];
    case 'ESSENTIAL_QUESTION':
      return [
        'How might we reduce local waste?',
        'What makes a solution fair for everyone?',
        'How do policies shape everyday choices?'
      ];
    case 'CHALLENGE':
      return [
        'Design an evidence-based proposal for city council',
        'Prototype a solution for a school exhibition',
        'Produce a community resource to shift behaviors'
      ];
    case 'JOURNEY':
      return [
        'List 3–4 phases (Analyze → Brainstorm → Prototype → Evaluate)',
        'Add 1–2 activities to each phase',
        'Name 3 helpful resources'
      ];
    case 'DELIVERABLES':
      return [
        'List 3+ milestones with names',
        'Name 1–3 final artifacts',
        'List 3–6 rubric criteria'
      ];
  }
}


export function validate(stage: Stage, captured: CapturedData): { ok: boolean; reason?: string } {
  switch (stage) {
    case 'BIG_IDEA': {
      const t = captured.ideation.bigIdea?.trim() || '';
      return t.length >= 10 ? { ok: true } : { ok: false, reason: 'Please define a substantial Big Idea (≥ 10 characters).' };
    }
    case 'ESSENTIAL_QUESTION': {
      const t = captured.ideation.essentialQuestion?.trim() || '';
      return t.length >= 10 ? { ok: true } : { ok: false, reason: 'Write an open-ended Essential Question (≥ 10 characters).' };
    }
    case 'CHALLENGE': {
      const t = captured.ideation.challenge?.trim() || '';
      return t.length >= 15 ? { ok: true } : { ok: false, reason: 'Describe an authentic Challenge (≥ 15 characters).' };
    }
    case 'JOURNEY': {
      const phases = captured.journey.phases || [];
      if (phases.length < 3) {
        return { ok: false, reason: 'Add at least 3 phases with names.' };
      }
      // Note: Activities validation is not enforced as the Zoom-In UI for editing
      // individual phase activities hasn't been implemented yet (Phase 7+ feature).
      // Currently only phase names are editable in JourneyStage.tsx
      return { ok: true };
    }
    case 'DELIVERABLES': {
      const ms = captured.deliverables.milestones?.length || 0;
      const arts = captured.deliverables.artifacts?.length || 0;
      const rc = captured.deliverables.rubric?.criteria?.length || 0;
      return ms >= 3 && arts >= 1 && rc >= 3
        ? { ok: true }
        : { ok: false, reason: 'Aim for 3+ milestones, 1+ artifacts, 3+ rubric criteria.' };
    }
  }
}

export function computeStatus(captured: CapturedData): 'draft' | 'in-progress' | 'ready' {
  const checks = [
    !!captured.ideation.bigIdea,
    !!captured.ideation.essentialQuestion,
    !!captured.ideation.challenge,
    captured.journey.phases.length >= 3,
    captured.deliverables.milestones.length >= 3 &&
      captured.deliverables.artifacts.length >= 1 &&
      captured.deliverables.rubric.criteria.length >= 3,
  ];
  const score = checks.filter(Boolean).length / checks.length;
  if (score >= 0.95) {return 'ready';}
  if (score > 0) {return 'in-progress';}
  return 'draft';
}

export function deriveCurrentStage(captured: CapturedData): Stage {
  for (const stage of stageOrder) {
    const result = validate(stage, captured);
    if (!result.ok) {
      return stage;
    }
  }
  return 'DELIVERABLES';
}

function buildEssentialQuestionExample(captured: CapturedData, wizard: WizardContext): string[] {
  const anchor = captured.ideation.bigIdea || wizard.projectTopic || 'this big idea';
  const learners = describeLearnerGroup(wizard);
  const anchorFragment = anchor.replace(/[.?!]+$/, '');
  const example = `How might ${learners} turn ${anchorFragment} into action for their community?`;
  return [example];
}

const DELIVERABLE_KEYWORDS: Array<{ pattern: RegExp; noun: string }> = [
  { pattern: /campaign/i, noun: 'campaign' },
  { pattern: /proposal/i, noun: 'proposal' },
  { pattern: /prototype/i, noun: 'prototype' },
  { pattern: /exhibit/i, noun: 'exhibit experience' },
  { pattern: /plan/i, noun: 'action plan' },
  { pattern: /podcast/i, noun: 'podcast episode' },
  { pattern: /documentary/i, noun: 'short documentary' },
  { pattern: /toolkit/i, noun: 'toolkit' },
  { pattern: /portfolio/i, noun: 'portfolio' }
];

function inferDeliverableNoun(challenge?: string, topic?: string): string {
  if (challenge) {
    const match = DELIVERABLE_KEYWORDS.find(({ pattern }) => pattern.test(challenge));
    if (match) {return match.noun;}
  }
  if (topic && /plan/i.test(topic)) {return 'action plan';}
  if (topic && /campaign/i.test(topic)) {return 'campaign';}
  return 'public showcase artifact';
}

function buildChallengeExample(captured: CapturedData, wizard: WizardContext): string[] {
  const audience = inferAudience(wizard, captured.ideation.challenge);
  const topic = captured.ideation.essentialQuestion || captured.ideation.bigIdea || wizard.projectTopic || 'the issue';
  const deliverable = inferDeliverableNoun(captured.ideation.challenge, wizard.projectTopic);
  const topicFragment = topic.replace(/[.?!]+$/, '');
  const example = `Design a ${deliverable} for ${audience} that moves them to act on ${topicFragment}.`;
  return [example];
}

interface JourneyExampleRow {
  title: string;
  summary: string;
}

function buildJourneyExample(captured: CapturedData, wizard: WizardContext): JourneyExampleRow[] {
  const weeks = estimateDurationWeeks(wizard.duration);
  const phaseCount = recommendedPhaseCount(weeks);
  const ranges = allocateWeekRanges(weeks, phaseCount);
  const topic = captured.ideation.challenge || captured.ideation.essentialQuestion || wizard.projectTopic || 'the challenge';
  const audience = inferAudience(wizard, captured.ideation.challenge);
  const deliverable = inferDeliverableNoun(captured.ideation.challenge, wizard.projectTopic);

  const templates: JourneyExampleRow[] = [
    {
      title: 'Investigate the context',
      summary: `Audit current realities around ${topic} and interview ${audience}.`
    },
    {
      title: 'Co-design possibilities',
      summary: `Run brainstorming sprints, analyze models, and pick a direction for the ${deliverable}.`
    },
    {
      title: 'Prototype & test',
      summary: `Build a draft, run a critique, and capture feedback from peers and ${audience}.`
    },
    {
      title: 'Launch & reflect',
      summary: `Finalize the ${deliverable}, rehearse the presentation, and plan the reflection on impact.`
    },
    {
      title: 'Extend impact',
      summary: 'Document next steps, gather metrics, and share back with broader stakeholders.'
    }
  ];

  const rows = templates.slice(0, Math.max(3, phaseCount));

  return rows.map((phase, index) => ({
    title: ranges[index] ? `${phase.title} (${ranges[index]})` : phase.title,
    summary: phase.summary
  }));
}

interface DeliverableExample {
  milestones: string[];
  artifacts: string[];
  criteria: string[];
}

function buildDeliverableExample(captured: CapturedData, wizard: WizardContext): DeliverableExample {
  const journey = captured.journey.phases;
  const deliverable = inferDeliverableNoun(captured.ideation.challenge, wizard.projectTopic);
  const audience = inferAudience(wizard, captured.ideation.challenge);

  const milestones = journey.length
    ? journey.slice(0, 4).map((phase, index) => {
        const prefix = phase.name || `Phase ${index + 1}`;
        return `${prefix} checkpoint complete`;
      })
    : ['Research insights synthesized', 'Prototype critiqued', 'Launch rehearsal'];

  const artifacts: string[] = [
    `${deliverable} ready for ${audience}`,
    'Process portfolio documenting decisions'
  ];

  const criteria = [
    'Evidence is credible and relevant',
    `Impact on ${audience} is clear`,
    'Student voice and reflection show growth'
  ];

  return {
    milestones,
    artifacts,
    criteria
  };
}

function formatExampleBlock(label: string, lines: string[]): string {
  const entries = lines.slice(0, 3).map(line => `- ${line}`);
  return `${label}\n${entries.join('\n')}`;
}

function buildExampleForNextStage(stage: Stage, captured: CapturedData, wizard: WizardContext): string | null {
  const upcoming = nextStage(stage);
  if (!upcoming) {return null;}

  if (upcoming === 'ESSENTIAL_QUESTION') {
    return formatExampleBlock('Example essential question:', buildEssentialQuestionExample(captured, wizard));
  }

  if (upcoming === 'CHALLENGE') {
    return formatExampleBlock('Example challenge framing:', buildChallengeExample(captured, wizard));
  }

  if (upcoming === 'JOURNEY') {
    const rows = buildJourneyExample(captured, wizard).map(row => `${row.title}: ${row.summary}`);
    return formatExampleBlock('Example journey outline:', rows);
  }

  if (upcoming === 'DELIVERABLES') {
    const example = buildDeliverableExample(captured, wizard);
    const sections = [
      formatExampleBlock('Milestones to log:', example.milestones),
      formatExampleBlock('Artifacts to capture:', example.artifacts),
      formatExampleBlock('Rubric cues:', example.criteria)
    ];
    return sections.join('\n');
  }

  return null;
}

export function transitionMessageFor(
  stage: Stage,
  captured: CapturedData,
  wizard: WizardContext
): string | null {
  let base: string | null = null;
  switch (stage) {
    case 'BIG_IDEA': {
      const idea = captured.ideation.bigIdea;
      if (!idea) {return null;}
      base = `“${idea}” is a solid anchor for the project. Let’s translate it into an essential question that invites inquiry from ${wizard.gradeLevel || 'your students'}.`;
      break;
    }
    case 'ESSENTIAL_QUESTION': {
      const eq = captured.ideation.essentialQuestion;
      base = eq
        ? `“${eq}” sets a meaningful target. Now we’ll frame a challenge where ${wizard.subjects?.[0] ? wizard.subjects[0].toLowerCase() : 'students'} act for a real audience.`
        : 'Let’s name a challenge that will move this question into authentic action.';
      break;
    }
    case 'CHALLENGE': {
      const challenge = captured.ideation.challenge;
      base = challenge
        ? `Challenge locked in: “${challenge}.” Next we’ll map the learning journey that guides students toward that outcome.`
        : 'Once the challenge feels right, we\'ll sketch the learning journey so students can iterate with confidence.';
      break;
    }
    case 'JOURNEY': {
      base = 'Journey mapped. Let’s capture the milestones, artifacts, and rubric criteria that will show growth.';
      break;
    }
    default:
      base = null;
  }

  const example = buildExampleForNextStage(stage, captured, wizard);
  if (!base) {return example;}
  return example ? `${base}\n\n${example}` : base;
}

function parseList(value: string): string[] {
  const normalized = value.replace(/\r/g, '\n');
  const primary = normalized.split(/\n+/)
    .map(line => line.replace(/^\s*[-*•\d.()]+\s*/, '').trim())
    .filter(Boolean);
  if (primary.length > 1) {return primary;}

  const alt = normalized.split(/[,;]+/)
    .map(item => item.trim())
    .filter(Boolean);
  if (alt.length > 1) {return alt;}

  if (value.trim()) {return [value.trim()];}
  return [];
}

function parseResources(value: string): string[] {
  return parseList(value).slice(0, 10);
}

function classifyDeliverableItem(item: string): 'milestone' | 'artifact' | 'criterion' {
  const lower = item.toLowerCase();
  if (/(criterion|criteria|rubric|level|performance)/.test(lower)) {return 'criterion';}
  if (/(artifact|deliverable|product|presentation|prototype|exhibit|showcase)/.test(lower)) {return 'artifact';}
  return 'milestone';
}

function parseDeliverables(value: string) {
  const items = parseList(value);
  const milestones: { name: string }[] = [];
  const artifacts: { name: string }[] = [];
  const criteria: string[] = [];

  items.forEach(raw => {
    const type = classifyDeliverableItem(raw);
    switch (type) {
      case 'milestone':
        milestones.push({ name: raw });
        break;
      case 'artifact':
        artifacts.push({ name: raw });
        break;
      case 'criterion':
        criteria.push(raw.replace(/^(criterion|criteria)[:\s-]*/i, '').trim());
        break;
    }
  });

  // Balance lists with sensible defaults if teacher only provided a few items
  while (milestones.length < Math.min(3, items.length)) {
    milestones.push({ name: `Milestone ${milestones.length + 1}` });
  }
  if (artifacts.length === 0 && items.length) {
    artifacts.push({ name: items[0] });
  }
  if (criteria.length === 0) {
    criteria.push('Clarity of communication', 'Evidence and reasoning', 'Impact on audience');
  }

  return {
    milestones: milestones.slice(0, 6),
    artifacts: artifacts.slice(0, 4),
    rubric: { criteria: Array.from(new Set(criteria)).slice(0, 6) }
  };
}

export function captureStageInput(previous: CapturedData, stage: Stage, content: string): CapturedData {
  const next: CapturedData = {
    ideation: { ...previous.ideation },
    journey: { phases: [...previous.journey.phases], resources: [...previous.journey.resources] },
    deliverables: {
      milestones: [...previous.deliverables.milestones],
      artifacts: [...previous.deliverables.artifacts],
      rubric: { criteria: [...previous.deliverables.rubric.criteria] }
    }
  };

  switch (stage) {
    case 'BIG_IDEA':
      next.ideation.bigIdea = content.trim();
      break;
    case 'ESSENTIAL_QUESTION':
      next.ideation.essentialQuestion = content.trim();
      break;
    case 'CHALLENGE':
      next.ideation.challenge = content.trim();
      break;
    case 'JOURNEY': {
      // Check if content is JSON (from accept_all micro-flow) or plain text
      let phases: Array<{ id?: string; name: string; focus?: string; activities: string[]; checkpoint?: string }> = [];
      try {
        const parsed = JSON.parse(content);
        if (Array.isArray(parsed)) {
          phases = parsed;
        } else {
          phases = extractPhasesFromText(content);
        }
      } catch {
        // Not JSON, parse as plain text
        phases = extractPhasesFromText(content);
      }
      next.journey.phases = phases.length ? phases : next.journey.phases;
      // Also parse resources if teacher listed them in a separate paragraph
      const resourceHint = content.split(/resources?:/i)[1];
      if (resourceHint) {
        next.journey.resources = parseResources(resourceHint);
      }
      break;
    }
    case 'DELIVERABLES': {
      const parsed = parseDeliverables(content);
      next.deliverables = parsed;
      break;
    }
  }

  return next;
}

export function serializeCaptured(captured: CapturedData): Record<string, any> {
  const record: Record<string, any> = {};
  if (captured.ideation.bigIdea) {record['ideation.bigIdea'] = captured.ideation.bigIdea;}
  if (captured.ideation.essentialQuestion) {record['ideation.essentialQuestion'] = captured.ideation.essentialQuestion;}
  if (captured.ideation.challenge) {record['ideation.challenge'] = captured.ideation.challenge;}

  captured.journey.phases.forEach((phase, index) => {
    const idx = index + 1;
    if (phase.id) {record[`journey.phase.${idx}.id`] = phase.id;}
    record[`journey.phase.${idx}.name`] = phase.name;
    if (phase.focus) {record[`journey.phase.${idx}.focus`] = phase.focus;}
    if (phase.checkpoint) {record[`journey.phase.${idx}.checkpoint`] = phase.checkpoint;}
    if (phase.activities.length) {
      record[`journey.phase.${idx}.activities`] = phase.activities.join('; ');
    }
  });
  if (captured.journey.resources.length) {
    record['journey.resources'] = captured.journey.resources.join('; ');
  }

  captured.deliverables.milestones.forEach((milestone, index) => {
    const idx = index + 1;
    record[`deliverables.milestone.${idx}.name`] = milestone.name;
    if (milestone.id) {record[`deliverables.milestone.${idx}.id`] = milestone.id;}
    if (milestone.phaseId) {record[`deliverables.milestone.${idx}.phaseId`] = milestone.phaseId;}
  });
  captured.deliverables.artifacts.forEach((artifact, index) => {
    const idx = index + 1;
    record[`deliverables.artifact.${idx}.name`] = artifact.name;
    if (artifact.id) {record[`deliverables.artifact.${idx}.id`] = artifact.id;}
    if (artifact.phaseId) {record[`deliverables.artifact.${idx}.phaseId`] = artifact.phaseId;}
  });
  if (captured.deliverables.rubric.criteria.length) {
    record['deliverables.rubric.criteria'] = captured.deliverables.rubric.criteria.join('; ');
  }

  return record;
}

export function hydrateCaptured(record: Record<string, any> | null | undefined): CapturedData {
  const base = createEmptyCaptured();
  if (!record) {return base;}

  // Support legacy nested shape
  const maybeIdeation = record.ideation;
  if (maybeIdeation && typeof maybeIdeation === 'object') {
    if (maybeIdeation.bigIdea) {base.ideation.bigIdea = String(maybeIdeation.bigIdea);}
    if (maybeIdeation.essentialQuestion) {base.ideation.essentialQuestion = String(maybeIdeation.essentialQuestion);}
    if (maybeIdeation.challenge) {base.ideation.challenge = String(maybeIdeation.challenge);}
  }
  const maybeJourney = record.journey;
  if (maybeJourney && typeof maybeJourney === 'object') {
    if (Array.isArray(maybeJourney.phases)) {
      base.journey.phases = maybeJourney.phases.map((phase: any, index: number) => ({
        id: phase?.id ? String(phase.id) : `p${index + 1}`,
        name: String(phase?.name || `Phase ${index + 1}`),
        focus: phase?.focus ? String(phase.focus) : undefined,
        activities: Array.isArray(phase?.activities) ? phase.activities.map((a: any) => String(a)) : [],
        checkpoint: phase?.checkpoint ? String(phase.checkpoint) : undefined
      }));
    }
    if (Array.isArray(maybeJourney.resources)) {
      base.journey.resources = maybeJourney.resources.map((r: any) => String(r));
    }
  }
  const maybeDeliverables = record.deliverables;
  if (maybeDeliverables && typeof maybeDeliverables === 'object') {
    if (Array.isArray(maybeDeliverables.milestones)) {
      base.deliverables.milestones = maybeDeliverables.milestones.map((m: any, index: number) => ({ name: String(m?.name || `Milestone ${index + 1}`) }));
    }
    if (Array.isArray(maybeDeliverables.artifacts)) {
      base.deliverables.artifacts = maybeDeliverables.artifacts.map((a: any, index: number) => ({ name: String(a?.name || `Artifact ${index + 1}`) }));
    }
    if (maybeDeliverables.rubric?.criteria) {
      base.deliverables.rubric.criteria = Array.isArray(maybeDeliverables.rubric.criteria)
        ? maybeDeliverables.rubric.criteria.map((c: any) => String(c))
        : String(maybeDeliverables.rubric.criteria).split(/[,;]+/).map((c: string) => c.trim()).filter(Boolean);
    }
  }

  Object.entries(record).forEach(([key, value]) => {
    if (typeof value !== 'string') {return;}
    if (key === 'ideation.bigIdea') {base.ideation.bigIdea = value;}
    if (key === 'ideation.essentialQuestion') {base.ideation.essentialQuestion = value;}
    if (key === 'ideation.challenge') {base.ideation.challenge = value;}

    const phaseMatch = key.match(/^journey\.phase\.(\d+)\.(id|name|focus|activities|checkpoint)$/);
    if (phaseMatch) {
      const index = Number(phaseMatch[1]) - 1;
      const prop = phaseMatch[2] as 'id' | 'name' | 'focus' | 'activities' | 'checkpoint';
      if (!base.journey.phases[index]) {
        base.journey.phases[index] = { id: `p${index + 1}`, name: '', activities: [] };
      }
      if (prop === 'id') {
        base.journey.phases[index].id = value;
      } else if (prop === 'name') {
        base.journey.phases[index].name = value;
      } else if (prop === 'focus') {
        base.journey.phases[index].focus = value;
      } else if (prop === 'checkpoint') {
        base.journey.phases[index].checkpoint = value;
      } else {
        base.journey.phases[index].activities = value.split(/[,;]+/).map(s => s.trim()).filter(Boolean);
      }
      return;
    }

    if (key === 'journey.resources') {
      base.journey.resources = value.split(/[,;]+/).map(s => s.trim()).filter(Boolean);
      return;
    }

    const milestoneMatch = key.match(/^deliverables\.milestone\.(\d+)\.(id|name|phaseId)$/);
    if (milestoneMatch) {
      const idx = Number(milestoneMatch[1]) - 1;
      base.deliverables.milestones[idx] = base.deliverables.milestones[idx] || { name: '' };
      const prop = milestoneMatch[2];
      if (prop === 'id') {base.deliverables.milestones[idx].id = value;}
      if (prop === 'name') {base.deliverables.milestones[idx].name = value;}
      if (prop === 'phaseId') {base.deliverables.milestones[idx].phaseId = value;}
      return;
    }

    const artifactMatch = key.match(/^deliverables\.artifact\.(\d+)\.(id|name|phaseId)$/);
    if (artifactMatch) {
      const idx = Number(artifactMatch[1]) - 1;
      base.deliverables.artifacts[idx] = base.deliverables.artifacts[idx] || { name: '' };
      const prop = artifactMatch[2];
      if (prop === 'id') {base.deliverables.artifacts[idx].id = value;}
      if (prop === 'name') {base.deliverables.artifacts[idx].name = value;}
      if (prop === 'phaseId') {base.deliverables.artifacts[idx].phaseId = value;}
      return;
    }

    if (key === 'deliverables.rubric.criteria') {
      base.deliverables.rubric.criteria = value.split(/[,;]+/).map(s => s.trim()).filter(Boolean);
      return;
    }
  });

  // Clean empty placeholders
  base.journey.phases = base.journey.phases.filter(Boolean);
  base.deliverables.milestones = base.deliverables.milestones.filter(Boolean);
  base.deliverables.artifacts = base.deliverables.artifacts.filter(Boolean);
  base.deliverables.rubric.criteria = base.deliverables.rubric.criteria.filter(Boolean);

  return base;
}

export function dynamicSuggestions(stage: Stage, wizard: WizardContext, captured: CapturedData): string[] {
  const base = stageSuggestions(stage);
  const topic = (wizard.projectTopic || '').trim();
  const subject = wizard.subjects?.[0] || '';

  switch (stage) {
    case 'BIG_IDEA':
      if (captured.ideation.bigIdea) {
        return [
          `Refine the Big Idea by naming the transferable concept (e.g., systems thinking in ${topic || 'this project'})`,
          `Check alignment: does the Big Idea connect to ${subject || 'your subject'} and real-world application?`,
          'Confirm the Big Idea in one memorable sentence'
        ];
      }
      return base;
    case 'ESSENTIAL_QUESTION':
      if (captured.ideation.essentialQuestion) {
        return [
          'Test the Essential Question: is it open-ended, and does it invite debate?',
          `Add “How might…” framing tied to ${topic || 'your context'}`,
          'Check that the question leads to authentic investigation rather than a yes/no answer'
        ];
      }
      if (captured.ideation.bigIdea) {
        return [
          `How might students explore “${captured.ideation.bigIdea}” through action?`,
          `What question would your community love answered about ${topic || 'this theme'}?`,
          'How can students compare perspectives to answer this question?'
        ];
      }
      return base;
    case 'CHALLENGE':
      if (captured.ideation.challenge) {
        return [
          'Clarify the audience and what they will receive at the end',
          'Scope the challenge to fit your timeline (what milestone marks success?)',
          'List constraints or criteria students must respect while tackling the challenge'
        ];
      }
      if (captured.ideation.essentialQuestion) {
        return [
          `Design a challenge that helps answer “${captured.ideation.essentialQuestion}”`,
          `Plan a showcase where ${subject ? subject.toLowerCase() : 'students'} pitch to an authentic reviewer`,
          'Choose an audience who benefits from the solution (families, partners, community)'
        ];
      }
      return base;
    case 'JOURNEY': {
      const phases = captured.journey.phases;
      if (phases.length >= 3) {
        const middle = phases[Math.min(1, phases.length - 1)];
        return [
          `Add a feedback clinic during "${middle.name}" so students iterate before the final push`,
          'List 2-3 resources or experts aligned to each phase',
          'Note how you\'ll signal progress at every phase hand-off'
        ];
      }
      // Simplified: Don't dump individual phases via lightbulb
      // Instead, prompt user to ask for a complete suggestion
      return [
        'Ask me to suggest a complete journey structure',
        'Build your journey phase-by-phase',
        'Describe the learning arc in your own words'
      ];
    }
    case 'DELIVERABLES': {
      const milestones = captured.deliverables.milestones;
      const artifacts = captured.deliverables.artifacts;
      if (milestones.length >= 3 && artifacts.length >= 1) {
        return [
          'Pair each milestone with the evidence students submit (drafts, critiques, rehearsals)',
          'Tighten rubric language so each criterion shows what quality looks like',
          `Clarify who attends the launch and what experience they’ll have`
        ];
      }
      const example = buildDeliverableExample(captured, wizard);
      return [
        `Milestone to capture: ${example.milestones[0]}`,
        `Artifact to expect: ${example.artifacts[0]}`,
        `Rubric cue: ${example.criteria[0]}`
      ];
    }
    default:
      return base;
  }
}

export function summarizeCaptured({ wizard, captured, stage }: { wizard: WizardContext; captured: CapturedData; stage: Stage }): string {
  const lines: string[] = [];
  lines.push(`Current Stage: ${stage.replace(/_/g, ' ').toLowerCase()}`);
  if (wizard.projectTopic) {
    lines.push(`Project Topic: ${wizard.projectTopic}`);
  }
  if (captured.ideation.bigIdea) {
    lines.push(`Big Idea: ${captured.ideation.bigIdea}`);
  }
  if (captured.ideation.essentialQuestion) {
    lines.push(`Essential Question: ${captured.ideation.essentialQuestion}`);
  }
  if (captured.ideation.challenge) {
    lines.push(`Challenge: ${captured.ideation.challenge}`);
  }

  if (captured.journey.phases.length) {
    const phaseSummaries = captured.journey.phases.map((phase, index) => {
      const activities = phase.activities?.length ? ` – activities: ${phase.activities.slice(0, 2).join(', ')}` : '';
      return `Phase ${index + 1}: ${phase.name}${activities}`;
    });
    lines.push(`Journey Plan:\n${phaseSummaries.join('\n')}`);
  }

  if (captured.deliverables.milestones.length || captured.deliverables.artifacts.length) {
    if (captured.deliverables.milestones.length) {
      lines.push(`Milestones: ${captured.deliverables.milestones.slice(0, 3).map(m => m.name).join(', ')}`);
    }
    if (captured.deliverables.artifacts.length) {
      lines.push(`Artifacts: ${captured.deliverables.artifacts.slice(0, 3).map(a => a.name).join(', ')}`);
    }
    if (captured.deliverables.rubric.criteria.length) {
      lines.push(`Rubric Criteria: ${captured.deliverables.rubric.criteria.slice(0, 4).join(', ')}`);
    }
  }

  if (!lines.length) {
    lines.push('No substantive entries captured yet.');
  }

  return lines.join('\n');
}
