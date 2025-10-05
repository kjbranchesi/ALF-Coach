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
    { weekLabel: 'Week 1', kind: 'Foundations', focus: 'Why seed saving? Simple renewable power and stewardship.',
      teacher: ['Show seed diversity', 'Demo safe solar kit', 'Introduce care agreements'],
      students: ['List local crops', 'Sketch box ideas', 'Practice labeling'],
      deliverables: ['Crop list', 'Box sketch'], checkpoint: ['Teacher approves parts'], assignments: ['A1'] },
    { weekLabel: 'Week 2', kind: 'Build', focus: 'Build the box and wire a safe solar light.',
      teacher: ['Approve materials', 'Supervise safe wiring', 'Model labels'],
      students: ['Assemble box', 'Wire light', 'Design labels'],
      deliverables: ['Seed box', 'Solar light'], checkpoint: ['Safety check passed'], assignments: ['A2'] },
    { weekLabel: 'Week 3', kind: 'Exhibit', focus: 'Host a pop‑up exchange and teach seed handling.',
      teacher: ['Invite families', 'Stage exchange', 'Print care forms'],
      students: ['Guide families', 'Label donations', 'Explain storage'],
      deliverables: ['Exchange plan', 'Care signup sheet'], checkpoint: ['Two caretakers signed'], assignments: ['A3'] },
    { weekLabel: 'Week 4', kind: 'Build', focus: 'Publish the care guide and plan seasonal swaps.',
      teacher: ['Review guide', 'Set swap dates', 'Coordinate signage'],
      students: ['Publish guide', 'Post schedule', 'Assign stewards'],
      deliverables: ['Care guide', 'Swap calendar'], checkpoint: ['Steward list complete'] }
    ,
    { weekLabel: 'Week 5', kind: 'Exhibit', focus: 'Community mini‑launch with seed safety and labels.',
      teacher: ['Invite families', 'Stage launch', 'Capture feedback'],
      students: ['Host launch', 'Explain labels', 'Collect signups'],
      deliverables: ['Launch plan', 'Feedback notes'], checkpoint: ['Two stewards reconfirmed'], assignments: ['A4'] }
  ],
  outcomes: {
    core: ['Install a working seed vault with care agreements'],
    extras: ['Create bilingual labels', 'Design kid‑friendly storage tips', 'Coordinate seasonal swaps', 'Partner with garden club'],
    audiences: ['Families', 'Garden clubs', 'PTA', 'Local library']
  },
  materialsPrep: {
    coreKit: ['Wood/cardboard box', 'Child‑safe solar kit', 'Label cards', 'Seed envelopes', 'Signage'],
    noTechFallback: ['Hand labels', 'Manual sign‑in book', 'Paper care guide'],
    safetyEthics: ['Adult supervision for tools', 'Use low‑voltage kits', 'Avoid treated lumber']
  },
  assignments: [
    { id: 'A1', title: 'Local Crops + Box Sketch', summary: 'Choose seeds and sketch a welcoming box.',
      studentDirections: ['List local crops', 'Draw box', 'Pick label icons', 'Share ideas', 'Vote'],
      teacherSetup: ['Provide examples', 'Model icons', 'Set vote'],
      evidence: ['Crop list', 'Sketch'], successCriteria: ['I pick local', 'I draw clearly', 'I include labels'] },
    { id: 'A2', title: 'Build + Solar Light', summary: 'Assemble the box and wire a safe light.',
      studentDirections: ['Assemble box', 'Wire light', 'Add labels', 'Test switch', 'Fix issues'],
      teacherSetup: ['Approve tools', 'Supervise wiring', 'Check labels'],
      evidence: ['Box', 'Lighted photo'], successCriteria: ['I build safely', 'I wire correctly', 'I label clearly'] },
    { id: 'A3', title: 'Exchange + Care Signups', summary: 'Host the exchange and secure caretakers.',
      studentDirections: ['Guide visitors', 'Label donations', 'Explain care', 'Collect signups', 'Thank families'],
      teacherSetup: ['Invite families', 'Print forms', 'Stage space'],
      evidence: ['Signup sheet', 'Exchange photo'], successCriteria: ['I host kindly', 'I explain clearly', 'I recruit stewards'] }
    ,
    { id: 'A4', title: 'Mini‑Launch + Feedback', summary: 'Run a small launch and capture improvements.',
      studentDirections: ['Host launch', 'Explain labels', 'Collect feedback', 'List improvements', 'Share next steps'],
      teacherSetup: ['Invite partners', 'Stage space', 'Collect notes'],
      evidence: ['Feedback notes', 'Improvement list'], successCriteria: ['I host kindly', 'I listen actively', 'I improve clearly'] }
  ],
  polish: {
    microRubric: ['Safe build & wiring', 'Clear labels', 'Active care plan', 'Community engagement'],
    checkpoints: ['Parts approved', 'Safety check', 'Caretakers signed'],
    tags: ['eng', 'energy', 'ag']
  },
  planningNotes: 'Pre‑approve low‑voltage solar kits; invite families early; consider weatherproofing if outdoors.'
};
