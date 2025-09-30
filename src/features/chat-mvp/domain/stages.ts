// Minimal stage domain for ChatMVP
export type Stage = 'BIG_IDEA' | 'ESSENTIAL_QUESTION' | 'CHALLENGE' | 'JOURNEY' | 'DELIVERABLES';

export interface CapturedData {
  ideation: {
    bigIdea?: string;
    essentialQuestion?: string;
    challenge?: string;
  };
  journey: {
    phases: { name: string; activities: string[] }[];
    resources: string[];
  };
  deliverables: {
    milestones: { name: string }[];
    artifacts: { name: string }[];
    rubric: { criteria: string[] };
  };
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
  if (i < 0 || i === stageOrder.length - 1) return null;
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
      return phases.length >= 3 ? { ok: true } : { ok: false, reason: 'Add at least 3 phases with names.' };
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
  if (score >= 0.95) return 'ready';
  if (score > 0) return 'in-progress';
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

const FALLBACK_BY_STAGE: Record<Stage, (captured: CapturedData) => string> = {
  BIG_IDEA: () => 'Great start. Let’s capture a clear Big Idea that students can carry with them. What core concept sums up your project?',
  ESSENTIAL_QUESTION: (captured) => {
    const bigIdea = captured.ideation.bigIdea;
    return bigIdea
      ? `Think about your Big Idea: “${bigIdea}”. What open-ended question will drive inquiry toward it?`
      : 'Let’s craft an Essential Question. Make it open-ended and debate-worthy.';
  },
  CHALLENGE: (captured) => {
    const eq = captured.ideation.essentialQuestion;
    return eq
      ? `Your Essential Question is “${eq}”. What real-world challenge will students tackle to answer it?`
      : 'Define a concrete challenge for a real audience. Include who benefits and what they receive.';
  },
  JOURNEY: () => 'Outline 3–4 phases for the learning journey. Each phase can include 1–2 key activities or focus areas.',
  DELIVERABLES: () => 'List 3+ milestones, the final artifacts students will produce, and 3–6 rubric criteria that show quality.'
};

const TRANSITION_COPY: Partial<Record<Stage, string>> = {
  BIG_IDEA: 'Big Idea captured. Next up: craft an Essential Question that invites inquiry.',
  ESSENTIAL_QUESTION: 'Excellent Essential Question. Let’s define the authentic Challenge.',
  CHALLENGE: 'Challenge locked in. Outline the journey phases so we can see the path.',
  JOURNEY: 'Journey mapped. Finish strong with deliverables, milestones, and rubric criteria.',
};

export function fallbackForStage(stage: Stage, captured: CapturedData, gatingReason?: string | null): string {
  const base = FALLBACK_BY_STAGE[stage](captured);
  if (!gatingReason) return base;
  const trimmed = gatingReason
    .trim()
    .replace(/[\r\n]+/g, ' ');
  return `${base} ${trimmed.endsWith('.') ? trimmed : `${trimmed}.`}`.replace(/\s+/g, ' ').trim();
}

export function transitionMessageFor(stage: Stage): string | null {
  return TRANSITION_COPY[stage] || null;
}

function parseList(value: string): string[] {
  const normalized = value.replace(/\r/g, '\n');
  const primary = normalized.split(/\n+/)
    .map(line => line.replace(/^\s*[-*•\d.()]+\s*/, '').trim())
    .filter(Boolean);
  if (primary.length > 1) return primary;

  const alt = normalized.split(/[,;]+/)
    .map(item => item.trim())
    .filter(Boolean);
  if (alt.length > 1) return alt;

  if (value.trim()) return [value.trim()];
  return [];
}

function parsePhases(value: string): { name: string; activities: string[] }[] {
  const items = parseList(value);
  return items.map((item, index) => {
    const parts = item.split(/[:–—-]\s*/, 2);
    const name = (parts[0] || `Phase ${index + 1}`).trim();
    const activities = parts[1]
      ? parts[1].split(/[,;]+/).map(s => s.trim()).filter(Boolean)
      : [];
    return { name, activities };
  });
}

function parseResources(value: string): string[] {
  return parseList(value).slice(0, 10);
}

function classifyDeliverableItem(item: string): 'milestone' | 'artifact' | 'criterion' {
  const lower = item.toLowerCase();
  if (/(criterion|criteria|rubric|level|performance)/.test(lower)) return 'criterion';
  if (/(artifact|deliverable|product|presentation|prototype|exhibit|showcase)/.test(lower)) return 'artifact';
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
      const phases = parsePhases(content);
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
  if (captured.ideation.bigIdea) record['ideation.bigIdea'] = captured.ideation.bigIdea;
  if (captured.ideation.essentialQuestion) record['ideation.essentialQuestion'] = captured.ideation.essentialQuestion;
  if (captured.ideation.challenge) record['ideation.challenge'] = captured.ideation.challenge;

  captured.journey.phases.forEach((phase, index) => {
    const idx = index + 1;
    record[`journey.phase.${idx}.name`] = phase.name;
    if (phase.activities.length) {
      record[`journey.phase.${idx}.activities`] = phase.activities.join('; ');
    }
  });
  if (captured.journey.resources.length) {
    record['journey.resources'] = captured.journey.resources.join('; ');
  }

  captured.deliverables.milestones.forEach((milestone, index) => {
    record[`deliverables.milestone.${index + 1}`] = milestone.name;
  });
  captured.deliverables.artifacts.forEach((artifact, index) => {
    record[`deliverables.artifact.${index + 1}`] = artifact.name;
  });
  if (captured.deliverables.rubric.criteria.length) {
    record['deliverables.rubric.criteria'] = captured.deliverables.rubric.criteria.join('; ');
  }

  return record;
}

export function hydrateCaptured(record: Record<string, any> | null | undefined): CapturedData {
  const base = createEmptyCaptured();
  if (!record) return base;

  // Support legacy nested shape
  const maybeIdeation = record.ideation;
  if (maybeIdeation && typeof maybeIdeation === 'object') {
    if (maybeIdeation.bigIdea) base.ideation.bigIdea = String(maybeIdeation.bigIdea);
    if (maybeIdeation.essentialQuestion) base.ideation.essentialQuestion = String(maybeIdeation.essentialQuestion);
    if (maybeIdeation.challenge) base.ideation.challenge = String(maybeIdeation.challenge);
  }
  const maybeJourney = record.journey;
  if (maybeJourney && typeof maybeJourney === 'object') {
    if (Array.isArray(maybeJourney.phases)) {
      base.journey.phases = maybeJourney.phases.map((phase: any, index: number) => ({
        name: String(phase?.name || `Phase ${index + 1}`),
        activities: Array.isArray(phase?.activities) ? phase.activities.map((a: any) => String(a)) : []
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
    if (typeof value !== 'string') return;
    if (key === 'ideation.bigIdea') base.ideation.bigIdea = value;
    if (key === 'ideation.essentialQuestion') base.ideation.essentialQuestion = value;
    if (key === 'ideation.challenge') base.ideation.challenge = value;

    const phaseMatch = key.match(/^journey\.phase\.(\d+)\.(name|activities)$/);
    if (phaseMatch) {
      const index = Number(phaseMatch[1]) - 1;
      const prop = phaseMatch[2] as 'name' | 'activities';
      if (!base.journey.phases[index]) {
        base.journey.phases[index] = { name: '', activities: [] };
      }
      if (prop === 'name') {
        base.journey.phases[index].name = value;
      } else {
        base.journey.phases[index].activities = value.split(/[,;]+/).map(s => s.trim()).filter(Boolean);
      }
      return;
    }

    if (key === 'journey.resources') {
      base.journey.resources = value.split(/[,;]+/).map(s => s.trim()).filter(Boolean);
      return;
    }

    const milestoneMatch = key.match(/^deliverables\.milestone\.(\d+)$/);
    if (milestoneMatch) {
      base.deliverables.milestones[Number(milestoneMatch[1]) - 1] = { name: value };
      return;
    }

    const artifactMatch = key.match(/^deliverables\.artifact\.(\d+)$/);
    if (artifactMatch) {
      base.deliverables.artifacts[Number(artifactMatch[1]) - 1] = { name: value };
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

export function dynamicSuggestions(stage: Stage, wizard: { subjects?: string[]; projectTopic?: string }, captured: CapturedData): string[] {
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
        return [
          'Add one inquiry or making activity to each phase to keep momentum',
          'Mark checkpoints for feedback or critique in the middle phases',
          'Identify 2–3 resources or experts who can support key moments'
        ];
      }
      return [
        'Phase ideas: Investigate → Ideate → Prototype → Share',
        'Begin with empathy or research; end with reflection or exhibition prep',
        `Name the first milestone students reach after the ${phases.length ? 'next' : 'first'} phase`
      ];
    }
    case 'DELIVERABLES': {
      const milestones = captured.deliverables.milestones;
      const artifacts = captured.deliverables.artifacts;
      if (milestones.length >= 3 && artifacts.length >= 1) {
        return [
          'Pair each milestone with evidence students submit (checkpoints, drafts, feedback)',
          'Refine rubric criteria so each describes quality (clarity, evidence, impact)',
          `Plan exhibition logistics: who attends and what do they experience?`
        ];
      }
      return [
        'List three milestones that mark progress (research, prototype, rehearsal)',
        `Name the final artifact (pitch deck, physical model, campaign) for ${topic || 'the project'}`,
        'Draft 3 rubric criteria using student-friendly language'
      ];
    }
    default:
      return base;
  }
}

export function summarizeCaptured({ wizard, captured, stage }: { wizard: { projectTopic?: string; subjects?: string[]; gradeLevel?: string; duration?: string }; captured: CapturedData; stage: Stage }): string {
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
