export type GradeBandKey = 'K-2' | '3-5' | '6-8' | '9-12';

export interface GradeBandRule {
  summary: string;
  developmentalMoves: string[];
  scopeAndDeliverables: string[];
  safetyFeasibility: string[];
  partnershipTech: string[];
  assessmentFeedback: string[];
  avoid: string[];
  escalateIf: string[];
}

export const gradeBandRules: Record<GradeBandKey, GradeBandRule> = {
  'K-2': {
    summary: 'Play-based sense-making with concrete experiences; build belonging and predictable routines.',
    developmentalMoves: [
      'Use explore -> make -> share mini cycles (10-20 minutes) with movement and sensory hooks.',
      'Model talk-to-learn with picture cues, sentence stems, and whole-class reflections.',
      'Offer teacher-curated choices so students can co-create while staying within known routines.'
    ],
    scopeAndDeliverables: [
      'Target 1-2 week sprints culminating in class museums, guided galleries, or narrated photo essays for families.',
      'Frame challenges as noticing, sorting, simple investigations, or story-based explanations that feel local and tangible.',
      'Keep outputs tactile (models, shared big-books, audio recordings) and celebrate progress visibly.'
    ],
    safetyFeasibility: [
      'Plan for 60-90 minute total project sessions broken into short rotations; embed transitions and brain breaks.',
      'Tools stay at craft materials, cardboard, recycled items, and 3V circuits; no heat, sharp blades, chemicals, or unsupervised cutting.',
      'Fieldwork stays on campus or short nearby walks with ~1:5 adult ratios; avoid student accounts on COPPA-restricted platforms.'
    ],
    partnershipTech: [
      'Invite partners as storytellers or demonstrators (park rangers, nurses, artists) for brief, high-touch visits.',
      'Use teacher-managed devices for photos/audio; keep communication channels curated and family-facing.',
      'Define impact as sharing with school community or families, not external deployment.'
    ],
    assessmentFeedback: [
      'Collect evidence via drawings, annotated photos, short share-outs, and """I can""" reflections tied to learning targets.',
      'Use warm/ cool feedback circles and quick thumbs/emoji check-ins instead of lengthy rubrics.',
      'Highlight SEL moves (taking turns, listening) alongside content indicators.'
    ],
    avoid: [
      'Avoid abstract research, multi-week independent investigations, or political advocacy the age band cannot contextualize.',
      'Do not schedule unsupervised tool use, hazardous materials, or platforms requiring personal data entry.'
    ],
    escalateIf: [
      'Any plan involves travel near water/roads without barriers, live animals beyond classroom pets, or vendors capturing PII.',
      'Teacher requests power tools, heat sources, or chemical reactions beyond household equivalents.'
    ]
  },
  '3-5': {
    summary: 'Hands-on investigators who can manage defined roles, compare sources, and explain evidence to others.',
    developmentalMoves: [
      'Structure 20-30 minute work blocks within 2-4 week arcs; introduce research stations and checkpoint charts.',
      'Lean on job cards (data lead, designer, reporter) to channel emerging independence.',
      'Embed peer critique and revision mini-protocols so students iterate with support.'
    ],
    scopeAndDeliverables: [
      'Push toward data posters, explainer videos, prototypes, or cross-age teaching moments tied to local needs.',
      'Expect students to plan fair tests, measure, and represent findings with teacher-supplied templates.',
      'Sequence entry event -> investigation -> draft -> feedback -> public share with visible progress trackers.'
    ],
    safetyFeasibility: [
      'Keep total blocks around 90-120 minutes or two 45-minute sessions; engineer routines for materials handoff.',
      'Permit hand tools (manual screwdrivers, safety knives, low-temp glue guns) with explicit safety demos and PPE; no hazardous power tools.',
      'Use ~1:10 field ratios (tighten to 1:5 in crowded sites); secure guardian consent for interviews that touch on personal experiences.'
    ],
    partnershipTech: [
      'Position partners as problem informants providing real questions, data sets, or feedback loops.',
      'Adopt district-approved research tools, curated web quests, and simple data viz apps under teacher accounts.',
      'Focus impact on school/community showcases, how-to guides, or simple installations with partner sign-off.'
    ],
    assessmentFeedback: [
      'Align rubrics to evidence-based claims, data accuracy, collaboration norms, and clarity of explanation.',
      'Capture progress with checklists, audio feedback, and student reflection logs tied to goals.',
      'Offer family-friendly summaries of findings and next steps.'
    ],
    avoid: [
      'Avoid extended unsupervised internet research, complex statistical models, or fabrication steps needing specialist certification.',
      'Do not assign heavy activism or policy lobbying without scaffolds and district clearance.'
    ],
    escalateIf: [
      'Requests involve chemicals beyond microscale demos, power machinery, overnight travel, or surveys hitting PPRA-sensitive topics without consent.',
      'Partners cannot provide supervision plans, background checks, or data privacy assurances.'
    ]
  },
  '6-8': {
    summary: 'Identity-driven collaborators ready for multi-step inquiry, prototyping, and authentic audiences with coaching.',
    developmentalMoves: [
      'Plan 30-45 minute work blocks within 3-6 week timelines; teach kanban/sprint routines for self-management.',
      'Encourage analysis of patterns, control of variables, and structured debate; give them choice boards that still align to standards.',
      'Integrate peer feedback clinics and user-testing loops to normalize iteration.'
    ],
    scopeAndDeliverables: [
      'Aim for tested prototypes, policy briefs, multimedia journalism, or data-rich investigations shared with civic/industry partners.',
      'Expect students to justify decisions with evidence, cite sources, and document design rationales.',
      'Include stakeholder mapping, research, prototyping, and public brief milestones.'
    ],
    safetyFeasibility: [
      'Keep total sessions 90-150 minutes; build in checkpoint agendas and SEL check-ins.',
      'Allow soldering, rotary tools, and advanced kits only with PPE, ventilation, and adult-at-elbow supervision; no prohibited power machinery.',
      'Fieldwork requires risk assessments, 1:10-1:15 ratios, first-aid trained adult, and partner vetting; review IRB/privacy expectations when collecting community data.'
    ],
    partnershipTech: [
      'Treat partners as coaches or clients who provide iterative feedback and authentic constraints.',
      'Use collaborative docs, moderated forums, coding platforms, and data dashboards under supervised accounts.',
      'Plan for user interviews, community data collection, and public presentations that respect partner timeframes.'
    ],
    assessmentFeedback: [
      'Rubrics foreground argument quality, prototype performance, and collaboration/project management behaviors.',
      'Capture evidence with test logs, feedback notes, and reflection sprints tied to CASEL competencies.',
      'Provide revision checkpoints and public brief rehearsals that simulate authentic Q&A.'
    ],
    avoid: [
      'Avoid unsupervised fabrication, medical experiments, or research requiring adult licensure/certification.',
      'Do not promise large-scale implementation, high-risk field deployments, or data publication without partner approval.'
    ],
    escalateIf: [
      'Projects propose off-campus lab work, hazardous materials, or human-subject research that might trigger district legal review.',
      'Students would publish identifiable data, operate vehicles, or access blocked digital platforms.'
    ]
  },
  '9-12': {
    summary: 'Purpose-driven designers capable of abstraction, systems thinking, and client-ready deliverables with light scaffolding.',
    developmentalMoves: [
      'Run 45-90 minute studios over 4-8+ week arcs; use project charters, role contracts, and change logs.',
      'Challenge students to scope problems, weigh trade-offs, and justify methodologies using professional vocabulary.',
      'Expect self-directed research, expert interviews, and co-authored decisions with mentorship instead of hand-holding.'
    ],
    scopeAndDeliverables: [
      'Target capstone portfolios, implementation plans, policy proposals, venture pitches, open datasets/code, or client deliverables.',
      'Include discovery, scoping, build/test, impact analysis, and defense milestones; capture agreements in lightweight MoUs.',
      'Design for authentic launch moments (council presentations, partner deployment, published repositories).' 
    ],
    safetyFeasibility: [
      'Enforce PPE, tool certifications, and occupancy caps for fab labs; document safety briefings and equipment logs.',
      'Require district-approved travel paperwork, insurance, and risk registers for off-site work or extended field studies.',
      'Ensure data privacy (FERPA/COPPA) and consent for media/publication; secure contracts for IP, NDAs, or sensitive datasets.'
    ],
    partnershipTech: [
      'Treat partners as co-designers/clients with clear scopes, feedback cadences, and deliverable acceptance criteria.',
      'Leverage project management suites, CAD/code repos, research databases, and communication tools with agreed permissions.',
      'Plan for professional etiquette: agendas, status updates, decision logs, and handoff documentation.'
    ],
    assessmentFeedback: [
      'Align rubrics to rigor (analysis, innovation, impact), professionalism, and reflection on outcomes vs. goals.',
      'Capture evidence through portfolios, executive summaries, stakeholder testimonials, and data dashboards.',
      'Support student-led conferences, defenses, and multi-audience reporting (families, partners, transcripts).'
    ],
    avoid: [
      'Avoid activities requiring adult licensure (e.g., medical procedures, hazardous industry work) unless a certified partner leads and liability is addressed.',
      'Do not expose student PII publicly, skip consent, or promise outcomes (funding, deployment) beyond school authority.'
    ],
    escalateIf: [
      'Projects involve overnight travel, international work, human subjects research intended for publication, or high-risk fabrication without certifications.',
      'Partners request direct access to student data/systems without NDPA/DPA and administrative approval.'
    ]
  }
};

export function resolveGradeBand(input?: string | null): GradeBandKey | null {
  if (!input) {
    return null;
  }

  const sanitized = input
    .replace(/[–—]/g, '-')
    .replace(/\(.*?\)/g, '')
    .toUpperCase()
    .trim();

  if (sanitized.includes('MIXED') || sanitized === '') {
    return null;
  }

  if (sanitized.includes('EARLY') || sanitized.includes('K-2') || sanitized.includes('K2') || sanitized.includes('PRIMARY K')) {
    return 'K-2';
  }

  if (sanitized.includes('ELEMENTARY')) {
    if (sanitized.includes('LOWER')) {
      return 'K-2';
    }
    return '3-5';
  }

  if (sanitized.includes('3-5') || sanitized.includes('35') || sanitized.includes('PRIMARY')) {
    return '3-5';
  }

  if (sanitized.includes('6-8') || sanitized.includes('68') || sanitized.includes('MIDDLE')) {
    return '6-8';
  }

  if (sanitized.includes('9-12') || sanitized.includes('912') || sanitized.includes('HIGH')) {
    return '9-12';
  }

  const rangeMatch = sanitized.match(/(K|\d+)\s*-\s*(\d{1,2})/);
  if (rangeMatch) {
    const [_, start, endStr] = rangeMatch;
    const end = parseInt(endStr, 10);
    if (start === 'K' || start === '0') {
      return 'K-2';
    }
    if (end <= 5) {
      return '3-5';
    }
    if (end <= 8) {
      return '6-8';
    }
    return '9-12';
  }

  return null;
}

export function buildGradeBandPrompt(band: GradeBandKey): string {
  const rules = gradeBandRules[band];
  const lines: string[] = [];

  lines.push(`Grade-band focus: ${rules.summary}`);
  if (rules.developmentalMoves.length) {
    lines.push('Prioritize:');
    rules.developmentalMoves.forEach((item) => lines.push(`- ${item}`));
  }
  if (rules.scopeAndDeliverables.length) {
    lines.push('Expected scope & deliverables:');
    rules.scopeAndDeliverables.forEach((item) => lines.push(`- ${item}`));
  }
  if (rules.safetyFeasibility.length) {
    lines.push('Feasibility guardrails:');
    rules.safetyFeasibility.forEach((item) => lines.push(`- ${item}`));
  }
  if (rules.partnershipTech.length) {
    lines.push('Community & tech guidance:');
    rules.partnershipTech.forEach((item) => lines.push(`- ${item}`));
  }
  if (rules.assessmentFeedback.length) {
    lines.push('Assessment & feedback cues:');
    rules.assessmentFeedback.forEach((item) => lines.push(`- ${item}`));
  }
  if (rules.avoid.length) {
    lines.push('Avoid recommending:');
    rules.avoid.forEach((item) => lines.push(`- ${item}`));
  }
  if (rules.escalateIf.length) {
    lines.push('Escalate / flag if teacher insists on:');
    rules.escalateIf.forEach((item) => lines.push(`- ${item}`));
  }

  return lines.join('\n');
}
