import type { ProjectShowcaseV2 } from '../../types/showcaseV2';
import neuroPlayImage from '../../utils/hero/images/NeuroplasticPlaygrounds.jpeg';

export const neuroplastic_playgroundsV2: ProjectShowcaseV2 = {
  id: 'neuroplastic-playgrounds',
  version: '2.0.0',
  hero: {
    title: 'Neuroplastic Playgrounds',
    tagline: 'Design and test play structures that strengthen executive function—safely and inclusively.',
    gradeBand: 'ES',
    timeframe: '2–4 weeks',
    subjects: ['Neuroscience', 'Engineering', 'Physical Education', 'Design'],
    image: neuroPlayImage
  },
  microOverview: [
    'Students learn how focus, memory, and self‑control grow through purposeful play.',
    'They prototype safe, modular obstacles and games targeting specific EF skills.',
    'A Play Lab invites younger buddies to test and give feedback with simple measures.'
  ],
  fullOverview:
    'Upper elementary students translate neuroscience into joyful, inclusive play. After exploring core executive functions (EF)—working memory, cognitive flexibility, and inhibitory control—teams design modular activities that train one skill at a time. With safe hand tools and clear supervision, they build and iterate stations, then host a Play Lab where younger buddies try them. Students collect simple observation measures (completion time, retries, smile scale) and adapt designs to improve accessibility and engagement.',
  schedule: { totalWeeks: 5, lessonsPerWeek: 3, lessonLengthMin: 55 },
  runOfShow: [
    {
      weekLabel: 'Week 1',
      kind: 'Foundations',
      focus: 'EF basics and safe prototyping routines.',
      teacher: ['Teach EF concepts', 'Demo safe hand tools', 'Define buddy protocols'],
      students: ['Name EF targets', 'Pass safety routine', 'Sketch station ideas'],
      deliverables: ['Safety checklist', 'Idea sketches'],
      checkpoint: ['All pass tool safety'],
      assignments: ['A1']
    },
    {
      weekLabel: 'Week 2',
      kind: 'Build',
      focus: 'Prototype modular stations with accessibility in mind.',
      teacher: ['Approve materials list', 'Coach inclusive design', 'Set testing space'],
      students: ['Build modules', 'Add safety edges', 'Create station cards'],
      deliverables: ['Prototype set', 'Station cards'],
      checkpoint: ['Teacher safety + inclusion check'],
      assignments: ['A2']
    },
    {
      weekLabel: 'Week 3',
      kind: 'Exhibit',
      focus: 'Host Play Lab with younger buddies; collect observations.',
      teacher: ['Invite buddy class', 'Stage stations', 'Model observation notes'],
      students: ['Guide buddies', 'Record measures', 'Reflect on feedback'],
      deliverables: ['Observation log', 'Buddy feedback notes'],
      checkpoint: ['Teacher confirms consent & supervision'],
      assignments: ['A3']
    },
    {
      weekLabel: 'Week 4',
      kind: 'Build',
      focus: 'Iterate designs and strengthen accessibility.',
      teacher: ['Coach iteration', 'Review accessibility', 'Confirm safety edges'],
      students: ['Revise stations', 'Add access supports', 'Re‑test with peers'],
      deliverables: ['Revised stations', 'Accessibility notes'],
      checkpoint: ['Safety + access check passed'],
      assignments: ['A4']
    },
    {
      weekLabel: 'Week 5',
      kind: 'Exhibit',
      focus: 'Family Play Night and guide distribution.',
      teacher: ['Invite families', 'Stage stations', 'Collect feedback'],
      students: ['Host families', 'Explain EF targets', 'Share guide'],
      deliverables: ['Family feedback log', 'Guide v1'],
      checkpoint: ['Maintenance + storage plan ready']
    }
  ],
  outcomes: {
    core: ['Design inclusive EF‑targeted stations and run a buddy Play Lab'],
    extras: [
      'Create EF lesson mini‑cards',
      'Develop a teacher setup checklist',
      'Film short how‑to clips',
      'Propose school‑yard installations'
    ],
    audiences: ['Buddy classes', 'PE department', 'Families', 'School leadership']
  },
  materialsPrep: {
    coreKit: [
      'Foam blocks, PVC, cardboard',
      'Velcro straps, rope, cones',
      'Tape measures, stopwatches',
      'Safety edges and mats',
      'Clipboards for observations'
    ],
    noTechFallback: ['Paper timing charts', 'Sticker smile scales', 'Printed station cards'],
    safetyEthics: ['Adult supervision at every station', 'Safe hand tools only', 'Consent from buddy class']
  },
  assignments: [
    {
      id: 'A1',
      title: 'EF Explorer + Safety Passport',
      summary: 'Learn EF targets and pass safety routines.',
      studentDirections: ['Define EF terms', 'Spot examples', 'Pass tool routine', 'Sketch station idea', 'Share buddy rules'],
      teacherSetup: ['Teach EF mini‑lesson', 'Demo safety', 'Provide sketch frames'],
      evidence: ['Safety passport', 'Sketch sheet'],
      successCriteria: ['I explain EF', 'I follow rules', 'I sketch clearly']
    },
    {
      id: 'A2',
      title: 'Prototype + Station Card',
      summary: 'Build a safe, inclusive station with clear directions.',
      studentDirections: ['Build module', 'Add safety edges', 'Write card', 'Plan accessibility', 'Test with peers'],
      teacherSetup: ['Approve materials', 'Check edges', 'Coach inclusion'],
      evidence: ['Prototype', 'Station card'],
      successCriteria: ['I build safely', 'I include all', 'I write clearly']
    },
    {
      id: 'A3',
      title: 'Play Lab + Reflection',
      summary: 'Run buddy tests and reflect with evidence.',
      studentDirections: ['Guide buddies', 'Time or tally', 'Record smiles', 'Note changes', 'Share thanks'],
      teacherSetup: ['Invite buddies', 'Model notes', 'Confirm supervision'],
      evidence: ['Observation log', 'Reflection note'],
      successCriteria: ['I host kindly', 'I measure simply', 'I reflect honestly']
    },
    {
      id: 'A4',
      title: 'Revise for Access + Family Night Plan',
      summary: 'Improve accessibility and plan a family event.',
      studentDirections: ['List barriers', 'Add supports', 'Re‑test safely', 'Plan event', 'Share invites'],
      teacherSetup: ['Review supports', 'Check safety', 'Approve invites'],
      evidence: ['Access notes', 'Event plan'],
      successCriteria: ['I design accessibly', 'I keep safety first', 'I plan clearly']
    }
  ],
  polish: {
    microRubric: [
      'Safe, supervised stations',
      'Clear EF alignment',
      'Inclusion and accessibility',
      'Evidence‑based iteration'
    ],
    checkpoints: ['Safety routine passed', 'Station safety check', 'Consent confirmed'],
    tags: ['neuro', 'pe', 'design']
  },
  planningNotes: 'Coordinate with PE and buddy teachers early; keep stations lightweight, modular, and easy to store; share accessibility tips with families.'
};
