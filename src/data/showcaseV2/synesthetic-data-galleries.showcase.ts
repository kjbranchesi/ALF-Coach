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
      focus: 'What is data? How can it feel and sound?',
      teacher: ['Show synesthetic data examples', 'Model mapping numbers to senses', 'Set consent and privacy norms'],
      students: ['Pick community topic with consent', 'Draft sensory mappings collaboratively', 'Collect sample data safely'],
      deliverables: ['Mapping draft', 'Sample dataset'],
      checkpoint: ['Consent confirmed'],
      assignments: ['A1']
    },
    {
      weekLabel: 'Week 2',
      kind: 'Build',
      focus: 'Prototype modules for color, sound, and touch.',
      teacher: ['Approve materials and adhesives', 'Coach safe module construction', 'Test modules for durability'],
      students: ['Build sensory module carefully', 'Label components clearly and accessibly', 'Test with peers and note feedback'],
      deliverables: ['Module v1', 'Label set'],
      checkpoint: ['Safety check passed'],
      assignments: ['A2']
    },
    {
      weekLabel: 'Week 3',
      kind: 'Build',
      focus: 'Assemble installations and rehearse gallery flow.',
      teacher: ['Stage layout with flow and accessibility', 'Review caption language for clarity', 'Invite families and translation supports'],
      students: ['Assemble installation pieces carefully', 'Rehearse demos and storytelling', 'Refine captions and signage for visitors'],
      deliverables: ['Installation v1', 'Caption cards'],
      checkpoint: ['Teacher approves layout']
    },
    {
      weekLabel: 'Week 4',
      kind: 'Exhibit',
      focus: 'Host the Synesthetic Gallery and share a zine.',
      teacher: ['Host event and monitor safety', 'Collect visitor feedback and consent', 'Distribute zines and resources'],
      students: ['Guide visitors through sensory stations', 'Gather feedback kindly', 'Share zine and explain DIY steps'],
      deliverables: ['Feedback log', 'Zine v1'],
      checkpoint: ['Event debrief done'],
      assignments: ['A3']
    },
    {
      weekLabel: 'Week 5',
      kind: 'Extension',
      focus: 'Document modules and plan a hallway exhibit.',
      teacher: ['Review documentation for clarity', 'Coordinate hallway exhibit logistics', 'Confirm safety and nightly storage'],
      students: ['Photo modules and describe materials', 'Write family-friendly how-to steps', 'Design hallway layout and signage'],
      deliverables: ['Module docs', 'Exhibit plan'],
      checkpoint: ['Safety sign‑off']
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
      summary: 'Decide data and design the sensory mapping.',
      studentDirections: ['Pick community topic with adult consent', 'Draft data-to-senses mapping chart', 'Check consent and privacy requirements', 'Collect sample dataset safely', 'Share mapping plan with teacher and family'],
      teacherSetup: ['Provide synesthetic examples and templates', 'Send consent forms home', 'Review mapping plans for safety'],
      evidence: ['Mapping plan', 'Sample data'],
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
      summary: 'Build one sensory module safely.',
      studentDirections: ['Build sensory module using safe materials', 'Add labels and legends visitors can read', 'Test module safely with classmates', 'Fix issues documented in log', 'Photo log progress for documentation'],
      teacherSetup: ['Approve materials and adhesives', 'Check module safety often', 'Guide testing and adjustments'],
      evidence: ['Module v1', 'Test notes'],
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
      summary: 'Host the gallery and share how‑to.',
      studentDirections: ['Host visitors kindly through stations', 'Collect feedback using prompts', 'Explain mapping choices in plain language', 'Share zine and teach DIY steps', 'Pack stations safely for storage'],
      teacherSetup: ['Host event logistics and timing', 'Collect feedback and consent notes', 'Confirm teardown and storage plan'],
      evidence: ['Feedback log', 'Zine v1'],
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
      summary: 'Document modules and plan hallway exhibit.',
      studentDirections: ['Photo modules with captions', 'Write how-to steps for families', 'Check safety for hallway display', 'Propose layout with flow arrows', 'Share plan with principal and custodian'],
      teacherSetup: ['Review documentation drafts', 'Check hallway safety requirements', 'Approve layout with facilities'],
      evidence: ['Module docs', 'Layout sketch'],
      successCriteria: ['I document modules clearly so others can reuse them', 'I ensure hallway exhibit keeps everyone safe', 'I plan layout that guides visitors smoothly'],
      aiOptional: {
        toolUse: 'Create hallway map from layout notes',
        critique: 'Ensure map is readable and to scale',
        noAIAlt: 'Use grid paper and physical cutouts'
      }
    }
  ],
  polish: {
    microRubric: ['Safe build', 'Clear mapping', 'Inclusive access', 'Family engagement'],
    checkpoints: ['Consent confirmed', 'Safety check', 'Debrief done'],
    tags: ['arts', 'data', 'community']
  },
  planningNotes: 'Schedule install and teardown windows with gallery partners 3 weeks ahead to lock power and safety walkthroughs. Pre-screen datasets before Week 2 and line up translation or tactile supports.'
};
