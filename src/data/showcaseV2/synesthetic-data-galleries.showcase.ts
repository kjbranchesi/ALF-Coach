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
    {
      weekLabel: 'Week 1',
      kind: 'Foundations',
      focus: 'Explore community data stories and plan sensory mappings for inclusive storytelling.',
      teacher: [
        'Showcase synesthetic data examples from community galleries',
        'Model mapping numbers to colors, sounds, and textures',
        'Facilitate consent conversation about collecting community data'
      ],
      students: [
        'Choose community dataset with family consent and partner input',
        'Draft sensory mapping ideas connecting data to senses',
        'Collect sample data safely using class protocol'
      ],
      deliverables: ['Sensory mapping draft', 'Sample dataset'],
      checkpoint: ['Consent confirmed and logged'],
      assignments: ['A1']
    },
    {
      weekLabel: 'Week 2',
      kind: 'Build',
      focus: 'Prototype tactile, visual, and sound modules that stay safe for all visitors.',
      teacher: [
        'Approve materials and adhesives for student concepts',
        'Coach safe construction techniques for tactile modules',
        'Test prototypes for durability and sensory accessibility'
      ],
      students: [
        'Build sensory modules highlighting color, sound, and texture',
        'Label components clearly with icons and plain language',
        'Test modules with classmates and record feedback notes'
      ],
      deliverables: ['Module prototype v1', 'Label set and testing log'],
      checkpoint: ['Safety check passed with adjustments shared'],
      assignments: ['A2']
    },
    {
      weekLabel: 'Week 3',
      kind: 'Build',
      focus: 'Assemble gallery flow and rehearse storytelling to prepare families for data art.',
      teacher: [
        'Stage layout emphasizing access routes and traffic flow',
        'Review caption language for clarity and reading levels',
        'Invite families and translation support for showcase'
      ],
      students: [
        'Assemble installation pieces with secure fasteners',
        'Rehearse gallery tours highlighting data stories',
        'Revise captions and signage after peer rehearsal'
      ],
      deliverables: ['Installation v1', 'Updated caption cards'],
      checkpoint: ['Teacher approves layout and captions'],
    },
    {
      weekLabel: 'Week 4',
      kind: 'Exhibit',
      focus: 'Host the Synesthetic Gallery, gather feedback, and share DIY zine resources.',
      teacher: [
        'Host event logistics while monitoring safety and access',
        'Collect visitor feedback forms and consent confirmations',
        'Distribute zines and follow-up resources to families'
      ],
      students: [
        'Guide visitors through sensory stations kindly',
        'Gather feedback using prompts and observation notes',
        'Share zine steps so families recreate data art'
      ],
      deliverables: ['Visitor feedback log', 'Gallery zine v1'],
      checkpoint: ['Event debrief completed with next steps'],
      assignments: ['A3']
    },
    {
      weekLabel: 'Week 5',
      kind: 'Extension',
      focus: 'Document modules and plan hallway exhibit to extend access for families.',
      teacher: [
        'Review documentation drafts for clarity and safety',
        'Coordinate hallway exhibit logistics with facilities',
        'Confirm nightly storage and cleaning protocols'
      ],
      students: [
        'Photograph modules with captions describing materials',
        'Write family-friendly how-to instructions and safety notes',
        'Design hallway layout with flow arrows and signage'
      ],
      deliverables: ['Module documentation packet', 'Hallway exhibit plan'],
      checkpoint: ['Safety sign-off recorded with facilities team']
    }
  ],
  outcomes: {
    core: [
      'Curate and clean community data with consent and privacy safeguards',
      'Map data to sensory experiences that are inclusive and accessible',
      'Curate and facilitate a multi-sensory gallery for families'
    ],
    extras: ['Zine guide for families', 'Open mapping templates', 'Loanable classroom modules', 'School hallway exhibition'],
    audiences: ['Families', 'Library', 'PTA', 'School community']
  },
  materialsPrep: {
    coreKit: ['Colored paper/LEDs', 'Small chimes/instruments', 'Textured materials', 'Safe adhesives', 'Caption cards'],
    noTechFallback: ['Paper galleries', 'Handheld chimes', 'Touch boards'],
  },
  assignments: [
    {
      id: 'A1',
      title: 'Mapping Plan + Consent',
      summary: 'Students choose a community dataset and map senses to tell inclusive stories.',
      studentDirections: [
        'Brainstorm community data topics with class and families',
        'Select dataset after confirming consent and privacy',
        'Draft mapping chart linking numbers to senses',
        'Collect small sample data using shared protocol',
        'Share mapping plan with teacher and caregivers'
      ],
      teacherSetup: [
        'Provide synesthetic exemplars and mapping templates',
        'Send consent forms home and log responses',
        'Review mapping plans for safety and sensitivity'
      ],
      evidence: ['Sensory mapping plan', 'Sample dataset'],
      successCriteria: ['I choose data that is safe and respectful', 'I map numbers to senses so visitors understand', 'I secure consent before collecting'],
      aiOptional: {
        toolUse: 'Suggest color palettes that match categories',
        critique: 'Make sure palette stays accessible (high contrast)',
        noAIAlt: 'Use printed palette cards and peer review'
      }
    },
    {
      id: 'A2',
      title: 'Prototype Module',
      summary: 'Teams build sensory modules safely and refine them through peer testing.',
      studentDirections: [
        'Build sensory module using approved safe materials',
        'Label modules with icons and plain-language captions',
        'Test module with classmates noting accessibility feedback',
        'Log fixes in prototype journal with teacher guidance',
        'Photograph build steps for documentation packet'
      ],
      teacherSetup: [
        'Approve materials, adhesives, and sound levels',
        'Coach safe assembly techniques and tool use',
        'Guide peer testing and accessibility adjustments'
      ],
      evidence: ['Module prototype v1', 'Testing feedback log'],
      successCriteria: ['I build sensory modules that stay safe and sturdy', 'I label components clearly for all abilities', 'I improve the module based on testing notes'],
      aiOptional: {
        toolUse: 'Generate sound sample ideas for categories',
        critique: 'Ensure sounds are gentle and not startling',
        noAIAlt: 'Record sounds with music teacher instead'
      }
    },
    {
      id: 'A3',
      title: 'Gallery + Zine',
      summary: 'Students host the gallery, collect feedback, and share DIY zine with families.',
      studentDirections: [
        'Welcome visitors using sensory station tour scripts',
        'Collect feedback with prompts and observation notes',
        'Explain mapping choices in friendly, plain language',
        'Share zine steps so families build at home',
        'Pack stations safely and store materials carefully'
      ],
      teacherSetup: [
        'Coordinate gallery schedule, volunteers, and access supports',
        'Collect feedback forms and consent documentation',
        'Confirm teardown and storage meet safety plan'
      ],
      evidence: ['Visitor feedback log', 'Gallery zine v1'],
      successCriteria: ['I host visitors kindly and confidently', 'I explain our mapping so families understand', 'I clean up safely and store materials'],
      aiOptional: {
        toolUse: 'Summarize visitor feedback into thank-you note',
        critique: 'Check AI note matches actual comments',
        noAIAlt: 'Use class circle to craft thank-you message'
      }
    },
    {
      id: 'A4',
      title: 'Documentation + Hallway Plan',
      summary: 'Teams document modules and plan hallway exhibit for ongoing community access.',
      studentDirections: [
        'Photograph modules and label materials with captions',
        'Write how-to steps in family-friendly language',
        'Check hallway safety needs with facilities checklist',
        'Design exhibit layout map with flow arrows',
        'Share plan with principal, custodian, and PTA'
      ],
      teacherSetup: [
        'Review documentation drafts for clarity and tone',
        'Approve hallway layout with facilities partners',
        'Confirm nightly storage and cleaning logistics'
      ],
      evidence: ['Module documentation packet', 'Hallway exhibit layout'],
      successCriteria: ['I document modules clearly so others can reuse them', 'I ensure hallway exhibit keeps everyone safe', 'I plan layout that guides visitors smoothly'],
      aiOptional: {
        toolUse: 'Create hallway map from layout notes',
        critique: 'Ensure map is readable and to scale',
        noAIAlt: 'Use grid paper and physical cutouts'
      }
    }
  ],
};
