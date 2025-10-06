import type { ProjectShowcaseV2 } from '../../types/showcaseV2';
import interspeciesImage from '../../utils/hero/images/InterspeciesLanguageTranslators.jpeg';

export const interspecies_language_translatorsV2: ProjectShowcaseV2 = {
  id: 'interspecies-language-translators',
  version: '2.0.0',
  hero: {
    title: 'Interspecies Language Translators',
    tagline: 'Classify local wildlife calls with ML and design respectful “conversation stations.”',
    gradeBand: 'HS',
    timeframe: '6–8 weeks',
    subjects: ['Machine Learning', 'Biology', 'Ethics', 'Design'],
    image: interspeciesImage
  },
  microOverview: [
    'Students collect or source call datasets for local species with permits and care.',
    'They train classifiers and build calm, ethical conversation stations with playback rules.',
    'An exhibit shares models, accuracy, and wildlife‑first etiquette.'
  ],
  fullOverview:
    'Learners explore animal communication ethically. They work with permitted datasets or partner collections, training machine‑learning (ML) classifiers to distinguish species or call types. Teams design conversation stations that show detections and allow careful, rule‑bound playback for learning—not for attracting or agitating wildlife. Safety and ethics lead: no harassment, volume limits, time windows, and posted guidance. The exhibit presents model cards (purpose, data, metrics, limits), errors, and respectful interaction norms for community education.',
  schedule: { totalWeeks: 7, lessonsPerWeek: 3, lessonLengthMin: 60 },
  runOfShow: [
    {
      weekLabel: 'Week 1',
      kind: 'Foundations',
      focus: 'Explore bioacoustics, permits, and ethics of wildlife audio to ground respectful research. Teachers host biologist ethics dialogue. Students list focal species with conservation status.',
      teacher: ['Host biologist ethics dialogue', 'Share permits and licensing guidance', 'Model ethical decision scenarios'],
      students: ['List focal species with conservation status', 'Draft wildlife-first ethics charter', 'Design data sourcing and permissions plan'],
      deliverables: ['Ethics charter', 'Species list'],
      checkpoint: ['Partner review passed'],
      assignments: ['A1']
    },
    {
      weekLabel: 'Week 2',
      kind: 'Planning',
      focus: 'Plan dataset curation and labeling so provenance and consent stay clear. Teachers provide vetted datasets and contacts. Students acquire datasets with documented provenance.',
      teacher: ['Provide vetted datasets and contacts', 'Model precise labeling workflow', 'Review consent and permit paperwork'],
      students: ['Acquire datasets with documented provenance', 'Label representative samples accurately', 'Split train/test sets with reasoning'],
      deliverables: ['Curated dataset', 'Label set'],
      checkpoint: ['Data provenance logged'],
      assignments: ['A2']
    },
    {
      weekLabel: 'Weeks 3–4',
      kind: 'Build',
      focus: 'Train and evaluate classifiers while prototyping station UI to balance accuracy with calm design. Teachers model evaluation metrics and thresholds. Students train classifiers across target calls.',
      teacher: ['Model evaluation metrics and thresholds', 'Coach error analysis sessions', 'Review UI accessibility and calm design'],
      students: ['Train classifiers across target calls', 'Analyze errors and confusion cases', 'Design station UI prototypes with accessibility'],
      deliverables: ['Model metrics', 'UI v1'],
      checkpoint: ['Minimum accuracy met'],
      assignments: ['A3']
    },
    {
      weekLabel: 'Week 5',
      kind: 'Build',
      focus: 'Design playback rules and safety hardware so conversation stations protect wildlife wellbeing. Teachers review volume and time restriction research. Students write detailed playback rules and signage.',
      teacher: ['Review volume and time restriction research', 'Coach enclosure and signage design', 'Check ethics compliance with partners'],
      students: ['Write detailed playback rules and signage', 'Build enclosure or station hardware', 'Draft etiquette signage with partners'],
      deliverables: ['Playback rules', 'Enclosure v1'],
      checkpoint: ['Partner ethics sign‑off']
    },
    {
      weekLabel: 'Week 6',
      kind: 'Exhibit',
      focus: 'Host public demo with model cards and etiquette to educate without disturbing wildlife. Frame the demo with "What promise should every visitor make before they press play?" Teachers invite partners and families. Students demo models highlighting model cards.',
      teacher: ['Invite partners and families', 'Time demos and monitor volume', 'Collect visitor feedback securely'],
      students: ['Demo models highlighting model cards', 'Teach etiquette and wildlife-first practices', 'Log improvements and visitor questions'],
      deliverables: ['Model card set', 'Etiquette handout'],
      checkpoint: ['No wildlife disturbance reported'],
      assignments: ['A4']
    },
    {
      weekLabel: 'Week 7',
      kind: 'Extension',
      focus: 'Publish dataset documentation and outreach plan to extend stewardship beyond the exhibit. Ask, "Who keeps this stewardship alive when our class steps away?" Teachers review dataset documentation for licensing. Students publish dataset documentation transparently.',
      teacher: ['Review dataset documentation for licensing', 'Orchestrate outreach with park partners', 'Debrief ethics and future stewardship'],
      students: ['Publish dataset documentation transparently', 'Design outreach events or installations', 'Submit ethics reflection and commitments'],
      deliverables: ['Dataset docs', 'Outreach plan'],
      checkpoint: ['Docs meet licensing']
    }
  ],
  outcomes: {
    core: [
      'Curate and document wildlife audio datasets with ethical safeguards',
      'Build and evaluate classifiers that communicate uncertainty transparently',
      'Design and launch conversation stations that prioritize wildlife wellbeing'
    ],
    extras: ['Dataset documentation', 'Ethics charter', 'Outreach materials', 'Follow‑up partner session'],
    audiences: ['Parks/biologists', 'Museums', 'Families', 'City education offices']
  },
  materialsPrep: {
    coreKit: ['Laptops', 'Audio interface or datasets', 'Speakers with limiter', 'Station enclosure', 'Signage'],
    noTechFallback: ['Printed sonograms', 'Manual ID cards', 'Poster etiquette'],
  },
  assignments: [
    {
      id: 'A1',
      title: 'Ethics Charter + Species List',
      summary: 'Start by naming the ethical boundaries before a single waveform is analyzed. Students co-write wildlife-first charters, choose focal species with conservation partners, and document risks plus safeguards. Teachers share exemplars, facilitate consent reviews, and ensure partners approve the charter before data acquisition.',
      studentDirections: [
        'Draft wildlife-first ethics charter with partner input',
        'Select focal species and justify conservation need',
        'List risks of disturbance or misuse',
        'Name mitigations and monitoring strategies',
        'Submit charter for partner approval'
      ],
      teacherSetup: ['Share exemplar charters', 'Review risk mitigation plans', 'Approve charter with biologist partner'],
      evidence: ['Charter', 'Species list'],
      successCriteria: ['I center wildlife wellbeing in our charter', 'I identify risks transparently', 'I design mitigations partners endorse'],
      aiOptional: {
        toolUse: 'Summarize conservation status from credible sources',
        critique: 'Confirm AI summaries cite trustworthy data',
        noAIAlt: 'Consult field guides and expert interviews'
      }
    },
    {
      id: 'A2',
      title: 'Curation + Labeling',
      summary: 'Curation week keeps provenance and licensing front and center. Students secure permitted datasets, label samples with double-check routines, and record every permission in a provenance log. Teachers provide vetted sources, coach labeling precision, and confirm documentation meets partner expectations.',
      studentDirections: [
        'Acquire audio data with documented permissions',
        'Label representative samples using shared rubric',
        'Split train/test sets with rationale',
        'Log provenance and licensing conditions',
        'Cite sources following partner requirements'
      ],
      teacherSetup: ['Provide vetted data sources', 'Model labeling in spectrograms', 'Review provenance logs and licenses'],
      evidence: ['Curated set', 'Label doc'],
      successCriteria: ['I curate data ethically and legally', 'I label samples with accuracy checks', 'I document provenance and licensing clearly'],
      aiOptional: {
        toolUse: 'Autogenerate label suggestions for review',
        critique: 'Verify AI labels before accepting',
        noAIAlt: 'Use peer double-blind labeling protocol'
      }
    },
    {
      id: 'A3',
      title: 'Model + Station UI',
      summary: 'Model and UI studio blends rigorous ML work with calm, accessible design. Students train classifiers, analyze errors, draft model cards, and prototype interfaces that communicate uncertainty without overstimulation. Teachers lead evaluation clinics, review prototypes for accessibility, and push teams to explain limitations plainly.',
      studentDirections: [
        'Train classifiers and record performance metrics',
        'Analyze errors and create improvement plan',
        'Design station UI with accessibility and calm aesthetics',
        'User-test interface with classmates and partners',
        'Compile model card fields and limitations'
      ],
      teacherSetup: ['Model evaluation metric calculations', 'Coach error analysis clinics', 'Check UI prototypes for accessibility'],
      evidence: ['Metrics table', 'UI v1'],
      successCriteria: ['I report model metrics with context', 'I explain errors and next steps', 'I design UI that is accessible and calming'],
      aiOptional: {
        toolUse: 'Suggest UI layout options from accessibility heuristics',
        critique: 'Ensure AI designs meet calm technology goals',
        noAIAlt: 'Use accessibility checklist and mentor feedback'
      }
    },
    {
      id: 'A4',
      title: 'Demo + Etiquette',
      summary: 'The public demo invites community learning while protecting wildlife. Students run timed demos, teach etiquette scripts, gather questions, and update documentation on the spot. Teachers coordinate partners, monitor volume and pacing, and ensure the stewardship plan continues after the exhibit closes.',
      studentDirections: [
        'Run public demo with volume monitoring',
        'Share etiquette guidelines and reasoning',
        'Collect visitor and partner feedback systematically',
        'Revise documentation to address questions',
        'Thank partners and log next actions'
      ],
      teacherSetup: ['Invite partners and manage environment', 'Time demos to protect wildlife', 'Collect feedback forms and notes'],
      evidence: ['Model cards', 'Etiquette handout'],
      successCriteria: ['I demo clearly while protecting wildlife', 'I teach etiquette that visitors understand', 'I update docs with community feedback'],
      aiOptional: {
        toolUse: 'Draft etiquette handout layout from notes',
        critique: 'Ensure AI content reinforces wildlife safety',
        noAIAlt: 'Use communications team template'
      }
    }
  ],
};
