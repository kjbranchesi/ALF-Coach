import type { ProjectShowcaseV2 } from '../../types/showcaseV2';
import synestheticImage from '../../utils/hero/images/SynestheticDataGalleries.jpeg';

export const synesthetic_data_galleriesV2: ProjectShowcaseV2 = {
  id: 'synesthetic-data-galleries',
  version: '2.0.0',
  hero: {
    title: 'Synesthetic Data Galleries',
    tagline: 'Convert community data into multi‑sensory installations—sound, light, and touch.',
    gradeBand: 'ES',
    timeframe: '2–4 weeks',
    subjects: ['Arts', 'Data', 'Design', 'Community'],
    image: synestheticImage
  },
  microOverview: [
    'Students collect simple community data (kindness notes, park visits, library books).',
    'They map numbers to colors, sounds, and textures for inclusive access.',
    'A gallery invites families to feel and hear the data stories.'
  ],
  fullOverview:
    'Upper elementary students turn familiar data into sensory experiences. They co‑design a small dataset with families (e.g., daily kindness notes, minutes read, park visits), then choose mappings—color for counts, gentle chimes for categories, textures for changes. Installations are touch‑friendly and clearly labeled. A community gallery showcases the works, and a take‑home zine explains how to create synesthetic data art at home.',
  schedule: { totalWeeks: 5, lessonsPerWeek: 3, lessonLengthMin: 55 },
  runOfShow: [
    { weekLabel: 'Week 1', kind: 'Foundations', focus: 'What is data? How can it feel and sound?',
      teacher: ['Show examples', 'Model mapping', 'Set consent'],
      students: ['Pick topic', 'Draft mappings', 'Collect sample data'],
      deliverables: ['Mapping draft', 'Sample dataset'], checkpoint: ['Consent confirmed'], assignments: ['A1'] },
    { weekLabel: 'Week 2', kind: 'Build', focus: 'Prototype modules for color, sound, and touch.',
      teacher: ['Approve materials', 'Coach safety', 'Test modules'],
      students: ['Build module', 'Label clearly', 'Test with peers'],
      deliverables: ['Module v1', 'Label set'], checkpoint: ['Safety check passed'], assignments: ['A2'] },
    { weekLabel: 'Week 3', kind: 'Build', focus: 'Assemble installations and rehearse gallery flow.',
      teacher: ['Stage layout', 'Review captions', 'Invite families'],
      students: ['Assemble pieces', 'Rehearse demos', 'Refine captions'],
      deliverables: ['Installation v1', 'Caption cards'], checkpoint: ['Teacher approves layout'] },
    { weekLabel: 'Week 4', kind: 'Exhibit', focus: 'Host the Synesthetic Gallery and share a zine.',
      teacher: ['Host event', 'Collect feedback', 'Distribute zines'],
      students: ['Guide visitors', 'Gather feedback', 'Share zine'],
      deliverables: ['Feedback log', 'Zine v1'], checkpoint: ['Event debrief done'], assignments: ['A3'] }
    ,
    { weekLabel: 'Week 5', kind: 'Extension', focus: 'Document modules and plan a hallway exhibit.',
      teacher: ['Review documentation', 'Plan exhibit', 'Confirm safety'],
      students: ['Photo modules', 'Write how‑tos', 'Plan hallway layout'],
      deliverables: ['Module docs', 'Exhibit plan'], checkpoint: ['Safety sign‑off'] }
  ],
  outcomes: {
    core: ['Publish an inclusive multi‑sensory data gallery'],
    extras: ['Zine guide for families', 'Open mapping templates', 'Loanable classroom modules', 'School hallway exhibition'],
    audiences: ['Families', 'Library', 'PTA', 'School community']
  },
  materialsPrep: {
    coreKit: ['Colored paper/LEDs', 'Small chimes/instruments', 'Textured materials', 'Safe adhesives', 'Caption cards'],
    noTechFallback: ['Paper galleries', 'Handheld chimes', 'Touch boards'],
    safetyEthics: ['Consent for any personal data', 'No identifying info', 'Stable, safe installations']
  },
  assignments: [
    { id: 'A1', title: 'Mapping Plan + Consent', summary: 'Decide data and design the sensory mapping.',
      studentDirections: ['Pick topic', 'Draft mapping', 'Check consent', 'Collect sample', 'Share plan'],
      teacherSetup: ['Provide examples', 'Consent forms', 'Review plan'],
      evidence: ['Mapping plan', 'Sample data'], successCriteria: ['I pick safe data', 'I map clearly', 'I get consent'] },
    { id: 'A2', title: 'Prototype Module', summary: 'Build one sensory module safely.',
      studentDirections: ['Build module', 'Add labels', 'Test safely', 'Fix issues', 'Photo log'],
      teacherSetup: ['Approve materials', 'Check safety', 'Guide tests'],
      evidence: ['Module v1', 'Test notes'], successCriteria: ['I build safely', 'I label clearly', 'I fix issues'] },
    { id: 'A3', title: 'Gallery + Zine', summary: 'Host the gallery and share how‑to.',
      studentDirections: ['Host kindly', 'Collect feedback', 'Explain mapping', 'Share zine', 'Pack safely'],
      teacherSetup: ['Host event', 'Collect feedback', 'Confirm teardown'],
      evidence: ['Feedback log', 'Zine v1'], successCriteria: ['I host kindly', 'I explain clearly', 'I clean up safely'] }
    ,
    { id: 'A4', title: 'Documentation + Hallway Plan', summary: 'Document modules and plan hallway exhibit.',
      studentDirections: ['Photo modules', 'Write steps', 'Check safety', 'Propose layout', 'Share plan'],
      teacherSetup: ['Review docs', 'Check safety', 'Approve layout'],
      evidence: ['Module docs', 'Layout sketch'], successCriteria: ['I document clearly', 'I ensure safety', 'I plan layout'] }
  ],
  polish: {
    microRubric: ['Safe build', 'Clear mapping', 'Inclusive access', 'Family engagement'],
    checkpoints: ['Consent confirmed', 'Safety check', 'Debrief done'],
    tags: ['arts', 'data', 'community']
  },
  planningNotes: 'Pre‑review data topics for privacy; ensure stable, child‑safe installations; translate zines if needed.'
};
