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
      teacher: ['Teach EF concepts with movement examples', 'Demonstrate safe hand tool routines', 'Define buddy protocols and consent signals'],
      students: ['Name EF targets they will support', 'Pass tool and station safety routine', 'Sketch station ideas with EF labels'],
      deliverables: ['Safety checklist', 'Idea sketches'],
      checkpoint: ['All pass tool safety'],
      assignments: ['A1']
    },
    {
      weekLabel: 'Week 2',
      kind: 'Build',
      focus: 'Prototype modular stations with accessibility in mind.',
      teacher: ['Approve materials list for safety', 'Coach inclusive design choices', 'Set testing space with clear zones'],
      students: ['Build modular stations safely', 'Add safety edges and padding', 'Create station instruction cards'],
      deliverables: ['Prototype set', 'Station cards'],
      checkpoint: ['Teacher safety + inclusion check'],
      assignments: ['A2']
    },
    {
      weekLabel: 'Week 3',
      kind: 'Exhibit',
      focus: 'Host Play Lab with younger buddies; collect observations.',
      teacher: ['Invite buddy class and family helpers', 'Stage stations with rotation timing', 'Model caring observation notes'],
      students: ['Guide buddies through stations kindly', 'Record timing or smile measures carefully', 'Reflect on feedback with teammates'],
      deliverables: ['Observation log', 'Buddy feedback notes'],
      checkpoint: ['Teacher confirms consent & supervision'],
      assignments: ['A3']
    },
    {
      weekLabel: 'Week 4',
      kind: 'Build',
      focus: 'Iterate designs and strengthen accessibility.',
      teacher: ['Coach iteration brainstorming circles', 'Review accessibility updates closely', 'Confirm safety edges and storage plans'],
      students: ['Revise stations based on evidence', 'Add access supports like visuals or timers', 'Re‑test with peer feedback'],
      deliverables: ['Revised stations', 'Accessibility notes'],
      checkpoint: ['Safety + access check passed'],
      assignments: ['A4']
    },
    {
      weekLabel: 'Week 5',
      kind: 'Exhibit',
      focus: 'Family Play Night and guide distribution.',
      teacher: ['Invite families and assign roles', 'Stage stations with flow signage', 'Collect family feedback respectfully'],
      students: ['Host families through stations', 'Explain EF targets using kid language', 'Share take-home guide and storage plan'],
      deliverables: ['Family feedback log', 'Guide v1'],
      checkpoint: ['Maintenance + storage plan ready']
    }
  ],
  outcomes: {
    core: [
      'Communicate executive function concepts using age-appropriate language',
      'Design and iterate inclusive play stations that target specific EF skills',
      'Develop buddy play labs and share findings with families and staff'
    ],
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
  },
  assignments: [
    {
      id: 'A1',
      title: 'EF Explorer + Safety Passport',
      summary: 'Learn EF targets and pass safety routines.',
      studentDirections: ['Define EF terms with examples', 'Spot real-life EF moments', 'Pass tool and station safety routine', 'Sketch station idea with EF focus', 'Share buddy norms and consent rules'],
      teacherSetup: ['Teach EF mini‑lesson with movement demos', 'Demo safety expectations', 'Provide sketch frames and icon library'],
      evidence: ['Safety passport', 'Sketch sheet'],
      successCriteria: ['I explain our EF focus with confidence', 'I demonstrate every safety and kindness rule', 'I sketch a station that matches one EF target'],
      aiOptional: {
        toolUse: 'Generate pictogram ideas for station cards',
        critique: 'Check icons are friendly and inclusive',
        noAIAlt: 'Use art buddy to draft icons together'
      }
    },
    {
      id: 'A2',
      title: 'Prototype + Station Card',
      summary: 'Build a safe, inclusive station with clear directions.',
      studentDirections: ['Build module safely with teammates', 'Add safety edges and padding everywhere', 'Write station card with EF target and steps', 'Design accessibility supports for different bodies', 'Test with peers and note changes'],
      teacherSetup: ['Approve materials and tools', 'Check safety edges thoroughly', 'Coach inclusion strategies'],
      evidence: ['Prototype', 'Station card'],
      successCriteria: ['I build stations that stay safe and sturdy', 'I design directions and supports so everyone can play', 'I write station cards that make the EF goal clear'],
      aiOptional: {
        toolUse: 'Suggest variations to include different abilities',
        critique: 'Remove AI ideas that break safety rules',
        noAIAlt: 'Use accessibility checklist with teacher'
      }
    },
    {
      id: 'A3',
      title: 'Play Lab + Reflection',
      summary: 'Run buddy tests and reflect with evidence.',
      studentDirections: ['Guide buddies kindly through station steps', 'Time or tally buddy attempts accurately', 'Record smile or effort ratings respectfully', 'Note design changes we should try next', 'Share thanks and encouragement with buddies'],
      teacherSetup: ['Invite buddy class and confirm permissions', 'Model observation note-taking', 'Confirm supervision ratios'],
      evidence: ['Observation log', 'Reflection note'],
      successCriteria: ['I host buddies with patience and voice cues', 'I collect measures that show how play supported EF', 'I reflect on what to change using evidence'],
      aiOptional: {
        toolUse: 'Create simple charts from observation data',
        critique: 'Make sure charts match our actual notes',
        noAIAlt: 'Use colored sticky chart template'
      }
    },
    {
      id: 'A4',
      title: 'Revise for Access + Family Night Plan',
      summary: 'Improve accessibility and plan a family event.',
      studentDirections: ['List barriers buddies experienced during play', 'Add supports or visuals to remove barriers', 'Re-test stations with classroom peers safely', 'Orchestrate family night roles and timeline', 'Share invites and care instructions with guardians'],
      teacherSetup: ['Review accessibility supports thoroughly', 'Check safety compliance post-iteration', 'Approve invites and communication plan'],
      evidence: ['Access notes', 'Event plan'],
      successCriteria: ['I redesign stations so more people can play', 'I keep safety first while adding new supports', 'I plan family night clearly with shared responsibilities'],
      aiOptional: {
        toolUse: 'Draft family night flyer language from our notes',
        critique: 'Ensure tone stays welcoming and accurate',
        noAIAlt: 'Use family flyer template with teacher review'
      }
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
  planningNotes: 'Meet PE, OT, and buddy teachers to align supervision and storage. Prototype lightweight stations with 10-minute teardown guides. Send accessibility tip sheets and consent logistics before Week 2.'
};
