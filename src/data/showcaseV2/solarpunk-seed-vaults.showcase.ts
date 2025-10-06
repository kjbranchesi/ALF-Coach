import type { ProjectShowcaseV2 } from '../../types/showcaseV2';
import solarpunkImage from '../../utils/hero/images/SolarpunkSeedVaults.jpeg';

export const solarpunk_seed_vaultsV2: ProjectShowcaseV2 = {
  id: 'solarpunk-seed-vaults',
  version: '2.0.0',
  hero: {
    title: 'Solarpunk Seed Vaults',
    tagline: 'Off‑grid community seed libraries powered by microgrids and care agreements.',
    gradeBand: 'ES',
    timeframe: '2–4 weeks',
    subjects: ['Engineering', 'Energy', 'Agriculture', 'Civics'],
    image: solarpunkImage
  },
  microOverview: [
    'Students assemble a seed library box and a small solar lighting setup.',
    'They write simple care agreements with families and gardeners.',
    'A pop‑up exchange teaches seed saving and climate resilience.'
  ],
  fullOverview:
    'Students build a welcoming, off‑grid seed library for their campus or neighborhood. They co‑design a durable box, wire a child‑safe solar lighting setup, and stock region‑appropriate seeds with clear labels. Care agreements assign responsibilities for restocking and seasonal swaps. The culminating “Solarpunk Exchange” invites families to trade seeds, learn climate‑smart gardening, and sign up for upkeep rotations.',
  schedule: { totalWeeks: 4, lessonsPerWeek: 3, lessonLengthMin: 55 },
  runOfShow: [
    {
      weekLabel: 'Week 1',
      kind: 'Foundations',
      focus: 'Explore why seed saving matters and how renewable power supports community stewardship. Ask, "Which seeds would disappear here if no one saved them this year?" Teachers show seed diversity stories from community. Students list local crops and climates.',
      teacher: ['Show seed diversity stories from community', 'Demo safe solar kit wiring with adult helper', 'Introduce care agreement expectations'],
      students: ['List local crops and climates', 'Sketch seed box ideas with compartments', 'Create labels in multiple languages'],
      deliverables: ['Crop list', 'Box sketch'],
      checkpoint: ['Teacher approves parts'],
      assignments: ['A1']
    },
    {
      weekLabel: 'Week 2',
      kind: 'Build',
      focus: 'Build the box and wire a safe solar light so the vault thrives off-grid. Prompt teams with "Who will use this box in the dark, and will they feel safe?" Teachers approve materials and tool plan. Students assemble seed box structure carefully.',
      teacher: ['Approve materials and tool plan', 'Supervise safe wiring step by step', 'Model durable labeling standards'],
      students: ['Assemble seed box structure carefully', 'Wire solar light with adult supervision', 'Design weather-ready labels and icons'],
      deliverables: ['Seed box', 'Solar light'],
      checkpoint: ['Safety check passed'],
      assignments: ['A2']
    },
    {
      weekLabel: 'Week 3',
      kind: 'Exhibit',
      focus: 'Host a pop-up exchange and teach seed handling to launch community participation. Keep asking, "How do we make sure every visitor feels welcome to take and give?" Teachers invite families and garden partners. Students guide families through exchange process.',
      teacher: ['Invite families and garden partners', 'Stage exchange with sign-in and signage', 'Print care agreement forms and translations'],
      students: ['Guide families through exchange process', 'Label donations clearly with origin', 'Explain storage and climate tips kindly'],
      deliverables: ['Exchange plan', 'Care signup sheet'],
      checkpoint: ['Two caretakers signed'],
      assignments: ['A3']
    },
    {
      weekLabel: 'Week 4',
      kind: 'Build',
      focus: 'Publish the care guide and plan seasonal swaps to keep the seed vault sustainable. Ask, "Who knows exactly what to do when the season changes?" Teachers review care guide for clarity. Students publish illustrated care guide.',
      teacher: ['Review care guide for clarity', 'Set swap dates with partners', 'Coordinate signage and placements'],
      students: ['Publish illustrated care guide', 'Post seasonal swap schedule visibly', 'Assign stewards and share responsibilities'],
      deliverables: ['Care guide', 'Swap calendar'],
      checkpoint: ['Steward list complete']
    },
    {
      weekLabel: 'Week 5',
      kind: 'Exhibit',
      focus: 'Host community mini-launch with seed safety and labels to celebrate stewardship. Challenge teams with "What promise do we want families to leave with today?" Teachers invite families and local gardeners. Students host launch and explain labels.',
      teacher: ['Invite families and local gardeners', 'Stage launch with accessible flow', 'Capture feedback and photos consentingly'],
      students: ['Host launch and explain labels', 'Share care agreements and sign-ups', 'Collect community feedback for improvements'],
      deliverables: ['Launch plan', 'Feedback notes'],
      checkpoint: ['Two stewards reconfirmed'],
      assignments: ['A4']
    }
  ],
  outcomes: {
    core: [
      'Design and build a safe off-grid seed vault with lighting',
      'Create multilingual labeling and care agreements for community stewardship',
      'Design seed exchanges that teach climate-resilient practices'
    ],
    extras: ['Create bilingual labels', 'Design kid‑friendly storage tips', 'Coordinate seasonal swaps', 'Partner with garden club'],
    audiences: ['Families', 'Garden clubs', 'PTA', 'Local library']
  },
  materialsPrep: {
    coreKit: ['Wood/cardboard box', 'Child‑safe solar kit', 'Label cards', 'Seed envelopes', 'Signage'],
    noTechFallback: ['Hand labels', 'Manual sign‑in book', 'Paper care guide'],
  },
  assignments: [
    {
      id: 'A1',
      title: 'Local Crops + Box Sketch',
      summary: 'Start by honoring the seeds and people this vault will serve. Students list climate-friendly crops, sketch welcoming box concepts, and design multilingual label ideas for community use. Teachers share diversity stories, model icon creation, and facilitate design votes that feel inclusive.',
      studentDirections: ['List local crops and climate needs', 'Draw box with climate-safe materials', 'Pick label icons in multiple languages', 'Share ideas for community welcome', 'Vote on favorite design respectfully'],
      teacherSetup: ['Provide seed diversity examples', 'Model icon creation and translation', 'Facilitate design vote'],
      evidence: ['Crop list', 'Sketch'],
      successCriteria: ['I select crops that match our community climate', 'I sketch a welcoming, organized box design', 'I plan labeling that is clear for all families'],
      aiOptional: {
        toolUse: 'Generate friendly label icons from crop list',
        critique: 'Ensure AI icons are culturally respectful',
        noAIAlt: 'Use art center to hand-draw icons'
      }
    },
    {
      id: 'A2',
      title: 'Build + Solar Light',
      summary: 'Build week turns drawings into a working vault. Students assemble sturdy box panels, wire child-safe solar lighting with supervision, and test labels outdoors to ensure durability. Teachers approve tools, supervise wiring, and check that every label explains next steps clearly.',
      studentDirections: ['Assemble seed box panels safely', 'Wire solar light with adult helper', 'Add waterproof labels and instructions', 'Test switch and charging outdoors', 'Fix issues using troubleshooting log'],
      teacherSetup: ['Approve tools and safety gear', 'Supervise solar wiring steps', 'Check labels for durability'],
      evidence: ['Box', 'Lighted photo'],
      successCriteria: ['I build sturdy structures that stay safe', 'I wire the solar kit correctly with supervision', 'I label clearly so families know what to do'],
      aiOptional: {
        toolUse: 'Suggest troubleshooting ideas if light fails',
        critique: 'Verify AI suggestions follow safety rules',
        noAIAlt: 'Use solar troubleshooting chart'
      }
    },
    {
      id: 'A3',
      title: 'Exchange + Care Signups',
      summary: 'The exchange launches community ownership. Students guide visitors through seed swaps, explain storage tips, and recruit caretakers who sign clear agreements. Teachers invite partners, stage the space, and make sure signups capture contacts for future swaps.',
      studentDirections: ['Guide visitors through exchange steps kindly', 'Label donations with origin and planting tips', 'Explain care agreement expectations', 'Collect steward signups and contact info', 'Thank families with follow-up note'],
      teacherSetup: ['Invite families and community gardeners', 'Print care forms and translations', 'Stage exchange with clear flow'],
      evidence: ['Signup sheet', 'Exchange photo'],
      successCriteria: ['I host visitors with kindness and clarity', 'I explain care steps that protect seeds', 'I recruit stewards who understand their commitment'],
      aiOptional: {
        toolUse: 'Draft reminder message for stewards after exchange',
        critique: 'Ensure reminder honors community tone',
        noAIAlt: 'Use class-written thank you template'
      }
    },
    {
      id: 'A4',
      title: 'Mini‑Launch + Feedback',
      summary: 'Finish by celebrating stewardship and capturing lessons. Students host the mini-launch, explain labeling and solar care, collect family feedback, and translate comments into next steps. Teachers coordinate partners, document consented photos, and confirm stewards understand their responsibilities.',
      studentDirections: ['Host launch event with assigned roles', 'Explain label system and solar care', 'Collect family feedback respectfully', 'List improvements and next steps', 'Share plan with stewards and teachers'],
      teacherSetup: ['Invite partners and manage schedule', 'Stage space and signage', 'Collect feedback forms and photos with consent'],
      evidence: ['Feedback notes', 'Improvement list'],
      successCriteria: ['I host families warmly and confidently', 'I explain labels and solar care clearly', 'I turn feedback into actionable improvements'],
      aiOptional: {
        toolUse: 'Summarize feedback themes into action list',
        critique: 'Check AI summary matches actual notes',
        noAIAlt: 'Use group sorting activity with sticky notes'
      }
    }
  ],
};
