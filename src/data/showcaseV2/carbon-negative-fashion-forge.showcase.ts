import type { ProjectShowcaseV2 } from '../../types/showcaseV2';
import fashionForgeImage from '../../utils/hero/images/Carbon-NegativeFashionForge.jpeg';

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
    'Learners become climate material designers. After sampling bio‑based inputs (algae pastes, bio‑binders, plant fibers) and reviewing Safety Data Sheets (SDS), teams produce textile swatches via casting, coating, or non‑woven mats. They build a simple test rig for tensile strength, flexibility, and water resistance, then run back‑of‑the‑envelope life‑cycle assessments (LCA) using emissions factors (transport, energy, end‑of‑life). Students communicate results with design artifacts—technical cards, LCA dashboards, and a climate‑neutral micro runway—and present adoption pathways for local makers and brands.',
  schedule: { totalWeeks: 7, lessonsPerWeek: 3, lessonLengthMin: 60 },
  runOfShow: [
    {
      weekLabel: 'Week 1',
      kind: 'Foundations',
      focus: 'Investigate climate impacts of textiles and bio-material safety basics to reframe fashion as systems work. Ask, "Which part of the fashion cycle is our quickest win for cutting carbon?" Teachers launch fashion emissions case. Students map fast-fashion impacts.',
      teacher: ['Launch fashion emissions case', 'Review SDS and PPE', 'Model LCA concept'],
      students: ['Map fast‑fashion impacts', 'Pass lab safety quiz', 'Sketch early bio‑material ideas'],
      deliverables: ['Impact map', 'Safety acknowledgement'],
      checkpoint: ['All students pass safety expectations'],
      assignments: ['A1']
    },
    {
      weekLabel: 'Week 2',
      kind: 'Planning',
      focus: 'Procure safe materials and design controlled test plans so every experiment earns valid results. Invite the question "What proof will we need before a maker trusts our recipe?" Teachers approve BOMs. Students draft test matrix.',
      teacher: ['Approve BOMs', 'Share emissions factors sheet', 'Demo casting/coating'],
      students: ['Draft test matrix', 'Specify controls', 'Confirm materials sourcing'],
      deliverables: ['BOM + SDS packet', 'Test plan matrix'],
      checkpoint: ['Teacher signs test plan + BOM'],
      assignments: ['A2']
    },
    {
      weekLabel: 'Weeks 3–4',
      kind: 'Build',
      focus: 'Produce swatches and run bench tests on strength, flexibility, and water resistance to ground decisions in data. Keep asking, "Does this swatch still pass when we test it the third time?" Teachers supervise PPE & waste bins. Students cast/coat swatches.',
      teacher: ['Supervise PPE & waste bins', 'Calibrate test jigs', 'Coach data logging'],
      students: ['Cast/coat swatches', 'Cure and cut samples', 'Test and log results'],
      deliverables: ['Swatch set', 'Test data sheets'],
      checkpoint: ['Mid‑build safety + data quality audit'],
      assignments: ['A3']
    },
    {
      weekLabel: 'Week 5',
      kind: 'Build',
      focus: 'Compute simple LCAs and iterate materials to balance performance with lower emissions. Frame revisions with "What emission number will persuade a skeptical CFO?" Teachers model LCA math. Students calculate kgCO₂e per swatch.',
      teacher: ['Model LCA math', 'Review data sources', 'Facilitate design critique'],
      students: ['Calculate kgCO₂e per swatch', 'Compare to baseline', 'Revise recipe'],
      deliverables: ['LCA workbook', 'Revised swatch'],
      checkpoint: ['Teacher verifies sources + units'],
      assignments: ['A4']
    },
    {
      weekLabel: 'Week 6',
      kind: 'Exhibit',
      focus: 'Host climate-neutral runway and publish technical cards that make the science accessible to partners. Challenge teams with "What story will make partners wear this on day one?" Teachers invite partners. Students stage looks with swatches.',
      teacher: ['Invite partners', 'Check venue energy plan', 'Coach runway narration'],
      students: ['Stage looks with swatches', 'Present LCA results', 'Collect partner feedback'],
      deliverables: ['Technical card set', 'LCA storyboard'],
      checkpoint: ['Partner feedback logged'],
      assignments: ['A5']
    },
    {
      weekLabel: 'Week 7',
      kind: 'Extension',
      focus: 'Pilot adoption plans with makers and publish a toolkit so the work continues beyond class. Ask, "Who owns this process once our studio wraps?" to anchor accountability. Teachers coordinate maker visits. Students draft adoption plan.',
      teacher: ['Coordinate maker visits', 'Review toolkit layout', 'Debrief safety + waste'],
      students: ['Draft adoption plan', 'Publish toolkit', 'Submit waste/disposal log'],
      deliverables: ['Adoption one‑pager', 'Toolkit v1', 'Disposal log'],
      checkpoint: ['All waste streams closed'],
      assignments: ['A5']
    }
  ],
  outcomes: {
    core: [
      'Investigate textile emissions and bio-based material options with safety protocols',
      'Prototype and test carbon-negative swatches using controlled experiments',
      'Communicate life-cycle assessment outcomes and adoption pathways to partners'
    ],
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
  },
  assignments: [
    {
      id: 'A1',
      title: 'Textile Climate Portrait + Safety Passport',
      summary: 'Launch the Forge by surfacing the carbon reality of fashion and locking in lab safety norms. Students analyze emissions datasets, chart supply-chain hotspots, and document SDS commitments that power their impact maps. Teachers curate case studies and run safety checkpoints so facilities partners trust the work from day one.',
      studentDirections: ['List top fashion impacts with sources', 'Sketch safer material inputs', 'Pass lab safety quiz with 100%', 'Log PPE sizes and needs', 'Propose safe lab roles and responsibilities'],
      teacherSetup: ['Curate fashion impact datasets', 'Prepare safety certification quiz', 'Assign lab roles and rotations'],
      evidence: ['Impact map', 'Signed passport'],
      successCriteria: ['I explain key textile emissions drivers using data', 'I complete all lab safety requirements and PPE logs', 'I propose lab roles that keep teammates safe'],
      aiOptional: {
        toolUse: 'Summarize fashion impact data into infographic ideas',
        critique: 'Verify AI infographic suggestions cite reliable sources',
        noAIAlt: 'Use data visualization worksheet with teacher'
      }
    },
    {
      id: 'A2',
      title: 'Recipe + Test Plan',
      summary: 'Planning week turns ideas into recipes that can withstand scrutiny. Students build detailed bills of materials, define controls and replicates, and schedule lab time so tests stay fair and repeatable. Teachers review SDS packets, share emissions factors, and push teams to prove their plans before any pour happens.',
      studentDirections: ['Draft BOM with quantities and vendors', 'Add SDS links for every material', 'Define variables and measurement methods', 'Set controls and replicates for fair tests', 'Schedule test sessions and curing windows'],
      teacherSetup: ['Approve BOM and SDS compliance', 'Share emissions factors reference sheet', 'Model control setup and data tables'],
      evidence: ['BOM + SDS packet', 'Test plan matrix'],
      successCriteria: ['I design experiments with clear controls and replicates', 'I link SDS and emissions sources transparently', 'I schedule lab work so curing and testing are feasible'],
      aiOptional: {
        toolUse: 'Estimate preliminary emissions factors for materials',
        critique: 'Flag AI outputs that lack citations or realistic values',
        noAIAlt: 'Use library research packet to gather factors'
      }
    },
    {
      id: 'A3',
      title: 'Swatch Build + Bench Test',
      summary: 'Build week transforms raw biomaterials into data-rich swatches. Students fabricate samples with careful PPE routines, run bench tests, and log anomalies so they know what to revise. Teachers keep rigs calibrated, monitor waste streams, and coach troubleshooting to protect both safety and data integrity.',
      studentDirections: ['Cast or coat swatches with PPE', 'Cure and label samples consistently', 'Run strength/flex/water tests accurately', 'Log data with units and trial counts', 'Photo document process and anomalies'],
      teacherSetup: ['Calibrate test jigs and measurement tools', 'Supervise PPE and waste handling', 'Check data sheets for accuracy'],
      evidence: ['Swatch set', 'Data log'],
      successCriteria: ['I follow every PPE and lab safety protocol', 'I label and store samples so tests stay valid', 'I log data accurately with units and notes'],
      aiOptional: {
        toolUse: 'Analyze data log for outliers automatically',
        critique: 'Confirm AI outlier suggestions match raw data',
        noAIAlt: 'Use statistical checklist with peers'
      }
    },
    {
      id: 'A4',
      title: 'Mini‑LCA + Revision',
      summary: 'In the LCA sprint, teams translate test logs into emissions math that guides the next recipe. Students calculate kgCO₂e, compare baselines, and document trade-offs as they adjust formulas. Teachers supply verified factors, unit checks, and critique so impact claims stay defensible.',
      studentDirections: ['Calculate baseline emissions using template', 'Compare scenarios and highlight reductions', 'Revise recipe to lower kgCO₂e while meeting specs', 'Note trade-offs and next experiments', 'Cite every factor and dataset used'],
      teacherSetup: ['Provide LCA template with unit guide', 'Review unit conversions and emission factors', 'Coach trade-off discussion'],
      evidence: ['LCA workbook', 'Revised swatch'],
      successCriteria: ['I compute emissions with correct units and math', 'I cite emissions sources and datasets properly', 'I justify recipe changes with LCA evidence'],
      aiOptional: {
        toolUse: 'Summarize LCA factor references into notes',
        critique: 'Verify AI math and citations are correct',
        noAIAlt: 'Use peer LCA review checklist'
      }
    },
    {
      id: 'A5',
      title: 'Climate‑Neutral Runway + Toolkit',
      summary: 'The runway and toolkit share the finished science with the people who can scale it. Students design technical cards, choreograph a low-carbon showcase, and gather partner commitments for adoption plans. Teachers coordinate venue logistics, vet messaging, and capture feedback that informs the toolkit rollout.',
      studentDirections: ['Design technical cards with data and care', 'Orchestrate climate-neutral event logistics', 'Present LCA results and key insights', 'Collect partner feedback systematically', 'Publish toolkit and adoption plan for makers'],
      teacherSetup: ['Invite partners and confirm venue sustainability plan', 'Review technical card drafts', 'Provide toolkit template and hosting checklist'],
      evidence: ['Technical card set', 'Toolkit link'],
      successCriteria: ['I communicate technical and climate impact details clearly', 'I ensure the runway event stays safe and low-carbon', 'I publish resources partners can adopt'],
      aiOptional: {
        toolUse: 'Draft technical card layout from data table',
        critique: 'Check AI layout keeps units and sources accurate',
        noAIAlt: 'Use design template and peer review'
      }
    }
  ],
};
