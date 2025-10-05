import type { ProjectShowcaseV2 } from '../../types/showcaseV2';
import martianWaterImage from '../../utils/hero/images/MartianWaterArchitects.jpeg';

export const martian_water_architectsV2: ProjectShowcaseV2 = {
  id: 'martian-water-architects',
  version: '2.0.0',
  hero: {
    title: 'Martian Water Architects',
    tagline: 'Design ISRU water capture on Mars using real topography, resource maps, and mission constraints.',
    gradeBand: 'MS',
    timeframe: '4–6 weeks',
    subjects: ['Earth & Space Science', 'Geography', 'Engineering', 'Mathematics', 'Computer Science'],
    image: martianWaterImage
  },
  microOverview: [
    'Students study Martian terrain (DEM), ice maps, and mission water needs.',
    'They model capture systems—sublimation tents, regolith ice wells, rover routing.',
    'Teams publish mission briefs and 3D site plans for candidate habitats.'
  ],
  fullOverview:
    'Students operate as in‑situ resource utilization (ISRU) engineers. Using public Mars datasets—digital elevation models (DEM), suspected ice layers, and temperature bands—and simplified water demand models, they pick habitat sites and design capture systems that balance energy, yield, and logistics. Teams build 3D terrain mockups or digital models, run route/energy trade‑offs, and produce mission briefs with schematics, risks, and extra‑vehicular activity (EVA) protocols. The project ends with a mission review panel and deployment storyboard.',
  schedule: { totalWeeks: 6, lessonsPerWeek: 3, lessonLengthMin: 60 },
  runOfShow: [
    {
      weekLabel: 'Week 1',
      kind: 'Foundations',
      focus: 'Martian environment + ISRU fundamentals; human water/energy needs on Mars.',
      teacher: ['Show Mars DEM/ice maps', 'Model mission water math', 'Define safety in design'],
      students: ['Compare sites', 'Compute daily water needs', 'List environmental constraints'],
      deliverables: ['Candidate site list', 'Water needs worksheet'],
      checkpoint: ['Teacher approves site shortlist'],
      assignments: ['A1']
    },
    {
      weekLabel: 'Week 2',
      kind: 'Planning',
      focus: 'Select site and draft capture approach with assumptions.',
      teacher: ['Provide data sheets', 'Review assumptions', 'Coach trade‑off framing'],
      students: ['Choose one site', 'Draft capture concept', 'List assumptions + risks'],
      deliverables: ['Site selection memo', 'Concept scamp'],
      checkpoint: ['Memorandum approved'],
      assignments: ['A2']
    },
    {
      weekLabel: 'Week 3',
      kind: 'Build',
      focus: 'Create 3D site model and system schematics.',
      teacher: ['Share modeling options', 'Coach clear labeling', 'Review energy budgets'],
      students: ['Build terrain mockup', 'Draft schematics', 'Annotate energy inputs'],
      deliverables: ['3D site model', 'System schematic v1'],
      checkpoint: ['Energy budget sanity check'],
      assignments: ['A3']
    },
    {
      weekLabel: 'Week 4',
      kind: 'Build',
      focus: 'Run trade‑offs: yield vs energy vs risk; revise design.',
      teacher: ['Provide trade‑off template', 'Facilitate design critique', 'Check math units'],
      students: ['Compare alternatives', 'Revise plan', 'Note EVA hazards'],
      deliverables: ['Trade‑off table', 'Revised schematic'],
      checkpoint: ['Teacher validates unit conversions']
    },
    {
      weekLabel: 'Week 5',
      kind: 'Exhibit',
      focus: 'Mission review panel with EVA flow and risk mitigation.',
      teacher: ['Invite panel', 'Time presentations', 'Record Q&A notes'],
      students: ['Present mission brief', 'Defend trade‑offs', 'Log risks + mitigations'],
      deliverables: ['Mission brief deck', 'Risk register'],
      checkpoint: ['Panel issues go/no‑go notes'],
      assignments: ['A4']
    },
    {
      weekLabel: 'Week 6',
      kind: 'Extension',
      focus: 'Create deployment storyboard and cross‑team synthesis.',
      teacher: ['Model storyboard format', 'Arrange gallery walk', 'Facilitate synthesis'],
      students: ['Storyboard deployment', 'Peer review', 'Publish data pack'],
      deliverables: ['Deployment storyboard', 'Data pack v1'],
      checkpoint: ['Teacher signs publishing checklist']
    }
  ],
  outcomes: {
    core: [
      'Analyze Martian datasets to select viable water capture sites',
      'Design and model capture systems that balance yield, energy, and EVA safety',
      'Communicate mission briefs with risks, mitigations, and deployment plans'
    ],
    extras: [
      '3D printed terrain tiles',
      'Annotated EVA protocol',
      'Trade‑off analysis tutorial',
      'Open dataset pack for peers'
    ],
    audiences: ['STEM museum/club', 'University partners', 'Space advocacy orgs', 'District showcase']
  },
  materialsPrep: {
    coreKit: [
      'DEM dataset + ice probability maps',
      'Cardboard/foam for terrain',
      '3D printer (optional)',
      'Graph paper + rulers',
      'Laptops with spreadsheet or GIS',
      'Marker set for annotation'
    ],
    noTechFallback: ['Printed DEM tiles', 'Paper calculators', 'Manual route maps'],
    safetyEthics: ['Note: speculative design with real data', 'Cite all sources', 'Respect licensing of datasets']
  },
  assignments: [
    {
      id: 'A1',
      title: 'Mars Site Recon & Needs Math',
      summary: 'Scout candidate sites and compute daily water needs.',
      studentDirections: ['Compare three sites using DEM and ice data', 'Compute daily water needs for crew scenario', 'List environmental constraints and hazards', 'Cite NASA/ESA sources for data and assumptions', 'Pick top two candidate sites with rationale'],
      teacherSetup: ['Provide datasets and calculators', 'Model mission water math', 'Review citations and assumptions'],
      evidence: ['Site table', 'Needs worksheet'],
      successCriteria: ['I compare candidate sites using real data', 'I show water needs math with correct units', 'I cite datasets and mission assumptions transparently'],
      aiOptional: {
        toolUse: 'Summarize key terrain features for candidate sites',
        critique: 'Check AI summary against official datasets',
        noAIAlt: 'Use site comparison worksheet'
      }
    },
    {
      id: 'A2',
      title: 'Site Selection Memo',
      summary: 'Choose a site and defend assumptions.',
      studentDirections: ['State choice', 'List assumptions', 'Note risks', 'Share rationale', 'Submit memo'],
      teacherSetup: ['Share memo template', 'Coach assumptions', 'Review risk framing'],
      evidence: ['Selection memo'],
      successCriteria: ['I justify site', 'I name risks', 'I am concise'],
      aiOptional: { toolUse: 'Summarize site data', critique: 'Flag weak assumptions', noAIAlt: 'Peer memo swap' }
    },
    {
      id: 'A3',
      title: 'Site Model + Schematic v1',
      summary: 'Build terrain and draft capture schematics.',
      studentDirections: ['Build model', 'Draft schematic', 'Label energy', 'Check units', 'Photo log'],
      teacherSetup: ['Provide examples', 'Check units', 'Review labels'],
      evidence: ['Model photos', 'Schematic v1'],
      successCriteria: ['I label clearly', 'I use units', 'I show energy'],
      aiOptional: { toolUse: 'Suggest route options', critique: 'Spot missing labels', noAIAlt: 'Peer critique' }
    },
    {
      id: 'A4',
      title: 'Mission Brief + EVA Risk',
      summary: 'Present design and defend trade‑offs and risks.',
      studentDirections: ['Present mission brief to review panel', 'Defend trade-offs with data and assumptions', 'Log Q&A decisions and action items', 'Revise risk register and mitigations', 'Publish mission deck and data pack'],
      teacherSetup: ['Invite panel and schedule review', 'Time presentations and Q&A', 'Record decisions and commitments'],
      evidence: ['Brief deck', 'Risk register'],
      successCriteria: ['I defend site and system choices with evidence', 'I log panel feedback and decisions clearly', 'I refine risk register to include mitigations and owners'],
      aiOptional: {
        toolUse: 'Draft mission summary sheet from brief notes',
        critique: 'Ensure AI summary keeps units and caveats accurate',
        noAIAlt: 'Use mission summary template with peers'
      }
    }
  ],
  polish: {
    microRubric: [
      'Defensible site selection',
      'Clear, unit‑correct math',
      'Readable schematics & labels',
      'Realistic risk trade‑offs'
    ],
    checkpoints: ['Selection memo approved', 'Units sanity check', 'Publishing checklist met'],
    tags: ['space', 'geo', 'eng']
  },
  planningNotes: 'Pre‑load DEM/ice layers; align sources/licensing; consider inviting a local university planetary scientist to the Week 5 panel.'
};
