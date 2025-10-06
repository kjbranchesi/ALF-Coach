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
      focus: 'Study Martian ISRU fundamentals and mission water needs to ground every later decision. Teachers show Mars DEM/ice maps. Students compare sites.',
      teacher: ['Show Mars DEM/ice maps', 'Model mission water math', 'Define safety in design'],
      students: ['Compare sites', 'Compute daily water needs', 'List environmental constraints'],
      deliverables: ['Candidate site list', 'Water needs worksheet'],
      checkpoint: ['Teacher approves site shortlist'],
      assignments: ['A1']
    },
    {
      weekLabel: 'Week 2',
      kind: 'Planning',
      focus: 'Select a site and draft capture approach with explicit assumptions for review. Teachers provide data sheets. Students choose one site.',
      teacher: ['Provide data sheets', 'Review assumptions', 'Coach trade‑off framing'],
      students: ['Choose one site', 'Draft capture concept', 'List assumptions + risks'],
      deliverables: ['Site selection memo', 'Concept scamp'],
      checkpoint: ['Memorandum approved'],
      assignments: ['A2']
    },
    {
      weekLabel: 'Week 3',
      kind: 'Build',
      focus: 'Create 3D site models and system schematics to communicate ideas clearly to reviewers. Teachers share modeling options. Students build terrain mockup.',
      teacher: ['Share modeling options', 'Coach clear labeling', 'Review energy budgets'],
      students: ['Build terrain mockup', 'Draft schematics', 'Annotate energy inputs'],
      deliverables: ['3D site model', 'System schematic v1'],
      checkpoint: ['Energy budget sanity check'],
      assignments: ['A3']
    },
    {
      weekLabel: 'Week 4',
      kind: 'Build',
      focus: 'Run trade-offs between yield, energy, and risk so the design can withstand scrutiny. Teachers provide trade‑off template. Students compare alternatives.',
      teacher: ['Provide trade‑off template', 'Facilitate design critique', 'Check math units'],
      students: ['Compare alternatives', 'Revise plan', 'Note EVA hazards'],
      deliverables: ['Trade‑off table', 'Revised schematic'],
      checkpoint: ['Teacher validates unit conversions']
    },
    {
      weekLabel: 'Week 5',
      kind: 'Exhibit',
      focus: 'Host mission review panel with EVA flow and risk mitigation to earn a go/no-go. Teachers invite panel. Students present mission brief.',
      teacher: ['Invite panel', 'Time presentations', 'Record Q&A notes'],
      students: ['Present mission brief', 'Defend trade‑offs', 'Log risks + mitigations'],
      deliverables: ['Mission brief deck', 'Risk register'],
      checkpoint: ['Panel issues go/no‑go notes'],
      assignments: ['A4']
    },
    {
      weekLabel: 'Week 6',
      kind: 'Extension',
      focus: 'Create deployment storyboard and cross-team synthesis to document how the mission launches. Teachers model storyboard format. Students storyboard deployment.',
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
  },
  assignments: [
    {
      id: 'A1',
      title: 'Mars Site Recon & Needs Math',
      summary: 'Students scout candidate sites and compute daily water needs to size the mission challenge. Students compare three sites using DEM and ice data. Teachers provide datasets and calculators.',
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
      summary: 'Teams choose a site and defend assumptions, preparing for critical trade-off debates. Students state choice. Teachers share memo template.',
      studentDirections: ['State choice', 'List assumptions', 'Note risks', 'Share rationale', 'Submit memo'],
      teacherSetup: ['Share memo template', 'Coach assumptions', 'Review risk framing'],
      evidence: ['Selection memo'],
      successCriteria: ['I justify site', 'I name risks', 'I am concise'],
      aiOptional: { toolUse: 'Summarize site data', critique: 'Flag weak assumptions', noAIAlt: 'Peer memo swap' }
    },
    {
      id: 'A3',
      title: 'Site Model + Schematic v1',
      summary: 'Students build terrain models and draft capture schematics that make energy flows legible. Students build model. Teachers provide examples.',
      studentDirections: ['Build model', 'Draft schematic', 'Label energy', 'Check units', 'Photo log'],
      teacherSetup: ['Provide examples', 'Check units', 'Review labels'],
      evidence: ['Model photos', 'Schematic v1'],
      successCriteria: ['I label clearly', 'I use units', 'I show energy'],
      aiOptional: { toolUse: 'Suggest route options', critique: 'Spot missing labels', noAIAlt: 'Peer critique' }
    },
    {
      id: 'A4',
      title: 'Mission Brief + EVA Risk',
      summary: 'Teams present designs and defend trade-offs and risks, updating mission materials live. Students present mission brief to review panel. Teachers invite panel and schedule review.',
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
};
