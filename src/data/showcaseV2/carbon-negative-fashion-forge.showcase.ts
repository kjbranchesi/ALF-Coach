import type { ProjectShowcaseV2 } from '../../types/showcaseV2';
import fashionForgeImage from '../../utils/hero/images/Carbon‑NegativeFashionForge.jpeg';

export const carbon_negative_fashion_forgeV2: ProjectShowcaseV2 = {
  id: 'carbon-negative-fashion-forge',
  version: '2.0.0',
  hero: {
    title: 'Carbon‑Negative Fashion Forge',
    tagline: 'Students design algae/CO₂‑based textiles and run life‑cycle analyses to prove climate impact.',
    gradeBand: 'HS',
    timeframe: '6–8 weeks',
    subjects: ['Chemistry', 'Materials Science', 'Design', 'Sustainability', 'Mathematics'],
    image: fashionForgeImage
  },
  microOverview: [
    'Students explore bio‑materials (algae, mycelium) and low‑carbon binders for textiles.',
    'They prototype swatches, measure performance, and compute life‑cycle carbon impact.',
    'Teams stage a climate‑neutral runway with technical cards and LCA summaries.'
  ],
  fullOverview:
    'Learners become climate material designers. After sampling bio‑based inputs (algae pastes, bio‑binders, plant fibers) and reading safety data sheets, teams produce textile swatches via casting, coating, or non‑woven mats. They build a simple test rig for tensile strength, flexibility, and water resistance, then run back‑of‑the‑envelope life‑cycle assessments using emissions factors (transport, energy, end‑of‑life). Students communicate results with design artifacts—technical cards, LCA dashboards, and a climate‑neutral micro runway—and present adoption pathways for local makers and brands.',
  schedule: { totalWeeks: 7, lessonsPerWeek: 3, lessonLengthMin: 60 },
  runOfShow: [
    {
      weekLabel: 'Week 1',
      kind: 'Foundations',
      focus: 'Climate impacts of textiles and bio‑material safety basics.',
      teacher: ['Launch fashion emissions case', 'Review SDS and PPE', 'Model LCA concept'],
      students: ['Map fast‑fashion impacts', 'Pass lab safety quiz', 'Sketch early bio‑material ideas'],
      deliverables: ['Impact map', 'Safety acknowledgement'],
      checkpoint: ['All students pass safety expectations'],
      assignments: ['A1']
    },
    {
      weekLabel: 'Week 2',
      kind: 'Planning',
      focus: 'Procure safe materials and design test plans with controls.',
      teacher: ['Approve BOMs', 'Share emissions factors sheet', 'Demo casting/coating'],
      students: ['Draft test matrix', 'Specify controls', 'Confirm materials sourcing'],
      deliverables: ['BOM + SDS packet', 'Test plan matrix'],
      checkpoint: ['Teacher signs test plan + BOM'],
      assignments: ['A2']
    },
    {
      weekLabel: 'Weeks 3–4',
      kind: 'Build',
      focus: 'Produce swatches and run bench tests—strength, flexibility, water.',
      teacher: ['Supervise PPE & waste bins', 'Calibrate test jigs', 'Coach data logging'],
      students: ['Cast/coat swatches', 'Cure and cut samples', 'Test and log results'],
      deliverables: ['Swatch set', 'Test data sheets'],
      checkpoint: ['Mid‑build safety + data quality audit'],
      assignments: ['A3']
    },
    {
      weekLabel: 'Week 5',
      kind: 'Build',
      focus: 'Compute simple LCA and iterate materials for performance/emissions.',
      teacher: ['Model LCA math', 'Review data sources', 'Facilitate design critique'],
      students: ['Calculate kgCO₂e per swatch', 'Compare to baseline', 'Revise recipe'],
      deliverables: ['LCA workbook', 'Revised swatch'],
      checkpoint: ['Teacher verifies sources + units'],
      assignments: ['A4']
    },
    {
      weekLabel: 'Week 6',
      kind: 'Exhibit',
      focus: 'Host climate‑neutral runway and publish technical cards.',
      teacher: ['Invite partners', 'Check venue energy plan', 'Coach runway narration'],
      students: ['Stage looks with swatches', 'Present LCA results', 'Collect partner feedback'],
      deliverables: ['Technical card set', 'LCA storyboard'],
      checkpoint: ['Partner feedback logged'],
      assignments: ['A5']
    },
    {
      weekLabel: 'Week 7',
      kind: 'Extension',
      focus: 'Pilot adoption plan with makers/brands and publish toolkit.',
      teacher: ['Coordinate maker visits', 'Review toolkit layout', 'Debrief safety + waste'],
      students: ['Draft adoption plan', 'Publish toolkit', 'Submit waste/disposal log'],
      deliverables: ['Adoption one‑pager', 'Toolkit v1', 'Disposal log'],
      checkpoint: ['All waste streams closed'],
      assignments: ['A5']
    }
  ],
  outcomes: {
    core: ['Demonstrate a bio‑based textile with measured performance and LCA'],
    extras: [
      'Create brand‑ready technical cards',
      'Publish LCA tutorial for peers',
      'Propose a climate‑neutral runway plan',
      'Pitch adoption to local makers'
    ],
    audiences: ['Local fashion brands', 'Makerspaces', 'City sustainability office', 'School board']
  },
  materialsPrep: {
    coreKit: [
      'Plant fibers and safe bio‑binders',
      'Algae paste or powder (food/edu grade)',
      'Casting trays, rollers, drying racks',
      'PPE: gloves, goggles, aprons',
      'Tensile/flex test jig (DIY acceptable)',
      'Scales, moisture meter',
      'Laptops with spreadsheet'
    ],
    noTechFallback: ['Paper tally sheets', 'Manual rulers + hang weights', 'Printed emissions tables'],
    safetyEthics: ['Follow SDS & PPE rules', 'No solvent use without fume controls', 'Document and close all waste streams']
  },
  assignments: [
    {
      id: 'A1',
      title: 'Textile Climate Portrait + Safety Passport',
      summary: 'Map fashion emissions and pass lab safety basics.',
      studentDirections: ['List top impacts', 'Sketch safer inputs', 'Pass safety quiz', 'Log PPE sizes', 'Propose lab roles'],
      teacherSetup: ['Curate fashion impact data', 'Prepare safety quiz', 'Assign lab roles'],
      evidence: ['Impact map', 'Signed passport'],
      successCriteria: ['I name key impacts', 'I pass safety', 'I propose safe roles']
    },
    {
      id: 'A2',
      title: 'Recipe + Test Plan',
      summary: 'Design a material recipe and a fair test plan.',
      studentDirections: ['Draft BOM', 'Add SDS links', 'Define variables', 'Set controls', 'Schedule tests'],
      teacherSetup: ['Approve BOM + SDS', 'Share emissions factors', 'Model control setup'],
      evidence: ['BOM + SDS packet', 'Test plan matrix'],
      successCriteria: ['I plan controls', 'I link SDS', 'I schedule feasibly'],
      aiOptional: { toolUse: 'Estimate emissions factors', critique: 'Flag weak sources', noAIAlt: 'Library research set' }
    },
    {
      id: 'A3',
      title: 'Swatch Build + Bench Test',
      summary: 'Produce testable swatches and log performance.',
      studentDirections: ['Cast or coat swatches', 'Cure and label', 'Run tests', 'Log data', 'Photo documentation'],
      teacherSetup: ['Calibrate jigs', 'Supervise PPE', 'Check data sheets'],
      evidence: ['Swatch set', 'Data log'],
      successCriteria: ['I follow PPE', 'I label clearly', 'I log accurately']
    },
    {
      id: 'A4',
      title: 'Mini‑LCA + Revision',
      summary: 'Compute kgCO₂e and revise for lower impact.',
      studentDirections: ['Calculate baseline', 'Compare scenarios', 'Revise recipe', 'Note trade‑offs', 'Cite sources'],
      teacherSetup: ['Provide LCA template', 'Review unit conversions', 'Coach trade‑offs'],
      evidence: ['LCA workbook', 'Revised swatch'],
      successCriteria: ['I use units correctly', 'I cite sources', 'I justify changes'],
      aiOptional: { toolUse: 'Summarize LCA factors', critique: 'Check math/units', noAIAlt: 'Peer LCA review' }
    },
    {
      id: 'A5',
      title: 'Climate‑Neutral Runway + Toolkit',
      summary: 'Stage results and publish a reusable guide.',
      studentDirections: ['Design tech cards', 'Plan neutral event', 'Present LCA', 'Collect feedback', 'Publish toolkit'],
      teacherSetup: ['Invite partners', 'Review venue energy plan', 'Provide card template'],
      evidence: ['Technical card set', 'Toolkit link'],
      successCriteria: ['I communicate clearly', 'I ensure safety', 'I share resources']
    }
  ],
  polish: {
    microRubric: [
      'Safe, documented lab practice',
      'Fair tests with controls',
      'Correct LCA math + sources',
      'Persuasive adoption storytelling'
    ],
    checkpoints: ['Safety + SDS sign‑off', 'Mid‑build data audit', 'LCA sources verified'],
    tags: ['chem', 'design', 'sustainability']
  },
  planningNotes: 'Pre‑approve BOMs with SDS; align disposal with custodial; coordinate maker/brand feedback before Week 6.'
};
