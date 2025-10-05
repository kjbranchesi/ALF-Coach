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
    { weekLabel: 'Week 1', kind: 'Foundations', focus: 'Bioacoustics, permits, and ethics of wildlife audio.',
      teacher: ['Invite biologist', 'Share permits guidance', 'Model ethics'],
      students: ['List focal species', 'Draft ethics charter', 'Plan data sourcing'],
      deliverables: ['Ethics charter', 'Species list'], checkpoint: ['Partner review passed'], assignments: ['A1'] },
    { weekLabel: 'Week 2', kind: 'Planning', focus: 'Data set curation and labeling plan.',
      teacher: ['Provide sources', 'Model labeling', 'Review consent/permits'],
      students: ['Acquire datasets', 'Label samples', 'Split train/test'],
      deliverables: ['Curated dataset', 'Label set'], checkpoint: ['Data provenance logged'], assignments: ['A2'] },
    { weekLabel: 'Weeks 3–4', kind: 'Build', focus: 'Train/evaluate classifier; prototype station UI.',
      teacher: ['Model metrics', 'Coach error analysis', 'Review UI accessibility'],
      students: ['Train models', 'Analyze errors', 'Design station UI'],
      deliverables: ['Model metrics', 'UI v1'], checkpoint: ['Minimum accuracy met'], assignments: ['A3'] },
    { weekLabel: 'Week 5', kind: 'Build', focus: 'Design playback rules and safety hardware.',
      teacher: ['Review volume/time rules', 'Coach enclosure design', 'Check signage'],
      students: ['Write rules', 'Build enclosure', 'Draft signage'],
      deliverables: ['Playback rules', 'Enclosure v1'], checkpoint: ['Partner ethics sign‑off'] },
    { weekLabel: 'Week 6', kind: 'Exhibit', focus: 'Public demo with model cards and etiquette.',
      teacher: ['Invite partners', 'Time demos', 'Collect feedback'],
      students: ['Demo models', 'Share etiquette', 'Log improvements'],
      deliverables: ['Model card set', 'Etiquette handout'], checkpoint: ['No wildlife disturbance reported'], assignments: ['A4'] },
    { weekLabel: 'Week 7', kind: 'Extension', focus: 'Publish dataset documentation and outreach plan.',
      teacher: ['Review documentation', 'Plan outreach', 'Debrief ethics'],
      students: ['Publish docs', 'Plan outreach', 'Submit reflection'],
      deliverables: ['Dataset docs', 'Outreach plan'], checkpoint: ['Docs meet licensing'] }
  ],
  outcomes: {
    core: ['Publish an ethical conversation station with model cards'],
    extras: ['Dataset documentation', 'Ethics charter', 'Outreach materials', 'Follow‑up partner session'],
    audiences: ['Parks/biologists', 'Museums', 'Families', 'City education offices']
  },
  materialsPrep: {
    coreKit: ['Laptops', 'Audio interface or datasets', 'Speakers with limiter', 'Station enclosure', 'Signage'],
    noTechFallback: ['Printed sonograms', 'Manual ID cards', 'Poster etiquette'],
    safetyEthics: ['No harassment of wildlife', 'Volume/time restrictions', 'Permits for field recordings']
  },
  assignments: [
    { id: 'A1', title: 'Ethics Charter + Species List', summary: 'Define ethics and choose species focus.',
      studentDirections: ['Draft charter', 'Pick species', 'List risks', 'Name mitigations', 'Submit'],
      teacherSetup: ['Share examples', 'Review risks', 'Approve charter'],
      evidence: ['Charter', 'Species list'], successCriteria: ['I respect wildlife', 'I list risks', 'I propose mitigations'] },
    { id: 'A2', title: 'Curation + Labeling', summary: 'Curate and label dataset with provenance.',
      studentDirections: ['Acquire data', 'Label samples', 'Split sets', 'Log provenance', 'Cite sources'],
      teacherSetup: ['Provide sources', 'Model labels', 'Review provenance'],
      evidence: ['Curated set', 'Label doc'], successCriteria: ['I curate ethically', 'I label accurately', 'I cite sources'] },
    { id: 'A3', title: 'Model + Station UI', summary: 'Train model and design an accessible station.',
      studentDirections: ['Train models', 'Measure metrics', 'Analyze errors', 'Design UI', 'Test with peers'],
      teacherSetup: ['Model metrics', 'Coach UI', 'Check accessibility'],
      evidence: ['Metrics table', 'UI v1'], successCriteria: ['I train responsibly', 'I analyze errors', 'I design accessibly'] },
    { id: 'A4', title: 'Demo + Etiquette', summary: 'Demo station and teach respectful interaction.',
      studentDirections: ['Run demo', 'Share etiquette', 'Collect feedback', 'Revise docs', 'Thank partners'],
      teacherSetup: ['Invite partners', 'Time demos', 'Collect feedback'],
      evidence: ['Model cards', 'Etiquette handout'], successCriteria: ['I demo clearly', 'I protect wildlife', 'I improve docs'] }
  ],
  polish: {
    microRubric: ['Ethical data use', 'Transparent model cards', 'Accessible station UI', 'Wildlife‑first etiquette'],
    checkpoints: ['Charter approved', 'Provenance logged', 'Ethics sign‑off met'],
    tags: ['ml', 'bio', 'ethics']
  },
  planningNotes: 'Secure data sources and permits; set strict playback rules; prefer pre‑recorded datasets when in doubt.'
};
