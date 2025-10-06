import type { ProjectShowcaseV2 } from '../../types/showcaseV2';
import urban_heatImage from '../../utils/hero/images/HeatSafeBlocks.jpeg';

export const urban_heatV2: ProjectShowcaseV2 = {
  id: 'urban-heat',
  version: '2.0.0',
  hero: {
    title: 'HeatSafe Blocks: Cooling Our Neighborhood',
    tagline: 'Students become climate tacticians who map heat risk and prototype relief.',
    gradeBand: 'HS',
    timeframe: '6–8 weeks',
    subjects: ['Environmental Science', 'Urban Planning', 'Physics', 'Public Health', 'Engineering', 'Climate Science'],
    image: urban_heatImage
  },
  microOverview: [
    'Students investigate neighborhood heat islands using maps, sensors, and community stories together.',
    'They design evidence-based cooling prototypes and test them with vulnerable partners locally.',
    'Teams translate findings into public dashboards, policy briefs, and youth-led activation days.'
  ],
  fullOverview:
    'Climate resilience becomes personal as students confront how heat islands intensify across their own community. Learners analyze satellite imagery, equity data, and lived experiences to pinpoint the blocks most at risk. Through fieldwork loops, they capture temperature data, interview residents, and study cooling interventions already in play. The project culminates with a HeatSafe summit where students showcase prototypes, publish actionable heat briefs, and enlist stakeholders to carry the work forward through sustained summer activation.',
  schedule: { totalWeeks: 7, lessonsPerWeek: 3, lessonLengthMin: 60 },
  runOfShow: [
    {
      weekLabel: 'Week 1',
      kind: 'Foundations',
      focus: 'Launch urgent questions about neighborhood heat inequities so the block\'s hidden risks feel urgent. Pose prompts such as "Which sidewalks stay scorching after 6 p.m. and who must cross them daily?" Teachers showcase heat map data from local news. Students analyze who suffers most during heat waves.',
      teacher: [
        'Showcase heat map data from local news',
        'Facilitate empathy interviews with heat-vulnerable neighbors',
        'Model sensor handling and data logging'
      ],
      students: [
        'Analyze who suffers most during heat waves',
        'Set personal goals for climate justice work',
        'Operate sensors safely in stations'
      ],
      deliverables: ['Heat stories empathy map', 'Sensor safety checklist'],
      checkpoint: ['Students explain why heat equity matters'],
      assignments: ['A1']
    },
    {
      weekLabel: 'Week 2',
      kind: 'Planning',
      focus: 'Plan data collection routes and partnership protocols so fieldwork earns community trust. Co-create prompts like "Where will shade disappear just as dismissal begins?" to prioritize blocks. Teachers co-design fieldwork routes with GIS layers. Students map priority blocks for heat sampling.',
      teacher: [
        'Co-design fieldwork routes with GIS layers',
        'Review safety expectations with partners',
        'Schedule community check-in windows'
      ],
      students: [
        'Map priority blocks for heat sampling',
        'Draft communication scripts for residents',
        'Assemble go-bags with cooling supplies'
      ],
      deliverables: ['Fieldwork route map', 'Partner outreach script', 'Safety go-bag checklist'],
      checkpoint: ['Teacher signs fieldwork readiness plan'],
      assignments: ['A2']
    },
    {
      weekLabel: 'Weeks 3–4',
      kind: 'FieldworkLoop',
      focus: 'Capture temperature, interviews, and observations in the field to reveal lived heat realities. Encourage wonderings such as "What stories do we hear when sensors spike above 100°F?" Teachers shadow teams to ensure data integrity. Students log surface and air temperatures hourly.',
      teacher: [
        'Shadow teams to ensure data integrity',
        'Coordinate backup cooling stations',
        'Facilitate debrief circles after outings'
      ],
      students: [
        'Log surface and air temperatures hourly',
        'Interview neighbors about cooling challenges',
        'Map shade assets and heat traps for comparison'
      ],
      deliverables: ['Calibrated sensor data sets', 'Resident interview notes', 'Heat field photo log'],
      checkpoint: ['Teacher checks first data upload for accuracy'],
      repeatable: true
    },
    {
      weekLabel: 'Week 5',
      kind: 'Build',
      focus: 'Analyze findings and storyboard community heat narratives that connect data to people. Ask, "How do we make a map that neighbors can read in seconds?" to anchor design choices. Teachers model data cleaning in spreadsheets. Students visualize hotspots versus canopy coverage.',
      teacher: [
        'Model data cleaning in spreadsheets',
        'Coach teams synthesizing equity indicators',
        'Provide templates for story dashboards'
      ],
      students: [
        'Visualize hotspots versus canopy coverage',
        'Cross-reference interviews with data trends',
        'Draft storyboard for public dashboard'
      ],
      deliverables: ['Clean data workbook', 'Story dashboard wireframe', 'Key findings headline list'],
      checkpoint: ['Teacher verifies data sources are cited'],
      assignments: ['A3']
    },
    {
      weekLabel: 'Week 6',
      kind: 'Build',
      focus: 'Prototype and test cooling interventions to show impact before the summit. Center questions like "What proof will convince facilities to try this next month?" Teachers facilitate material sourcing and budget tracking. Students construct small-scale cooling prototypes.',
      teacher: [
        'Facilitate material sourcing and budget tracking',
        'Coordinate pilot testing locations',
        'Guide risk assessments for interventions'
      ],
      students: [
        'Construct small-scale cooling prototypes',
        'Run tests comparing before and after temps',
        'Capture user feedback on feasibility'
      ],
      deliverables: ['Prototype spec sheet', 'Test data comparison chart', 'Feedback synthesis notes'],
      checkpoint: ['Teacher signs safety review before pilots'],
      assignments: ['A4']
    },
    {
      weekLabel: 'Week 7',
      kind: 'Exhibit',
      focus: 'Host the HeatSafe summit sharing action plans with stakeholders to secure commitments. Prime teams with prompts such as "What pledge do we need from each partner before summer hits?" Teachers invite city, health, and youth partners. Students stage interactive cooling demos.',
      teacher: [
        'Invite city, health, and youth partners',
        'Coach students rehearsing solution pitches',
        'Coordinate follow-up commitments and press'
      ],
      students: [
        'Stage interactive cooling demos',
        'Deliver data-driven policy pitches',
        'Collect pledges from attending partners'
      ],
      deliverables: ['Summit agenda and run of show', 'Stakeholder pledge tracker'],
      checkpoint: ['Partners confirm next-step meetings'],
      assignments: ['A4']
    }
  ],
  outcomes: {
    core: ['Build neighborhood heat dashboards with community-sourced evidence'],
    extras: [
      'Design pop-up cooling activation for residents',
      'Produce policy brief for city council',
      'Create multilingual heat safety toolkit',
      'Launch social media campaign amplifying neighbors'
    ],
    audiences: ['City sustainability office', 'Neighborhood associations', 'Public health department', 'Local press teams']
  },
  materialsPrep: {
    coreKit: [
      'Handheld infrared thermometers',
      'Data loggers with GPS tagging',
      'Canopy and surface maps',
      'Clipboards and waterproof notebooks',
      'Cooling towels and water coolers',
      'Portable shade structures',
      'Laptops with GIS software'
    ],
    noTechFallback: ['Paper temperature logs', 'Analog thermometers', 'Printable neighborhood maps'],
  },
  assignments: [
    {
      id: 'A1',
      title: 'Heat Watch Story Launch',
      summary: 'Kick off by surfacing how extreme heat lands on their own blocks and who carries the burden. Student teams weave local headlines, empathy interviews, and lived stories into empathy maps that name stakes and early hypotheses. Teachers curate gallery walks and guest storytellers so community voices anchor the launch.',
      studentDirections: [
        'Analyze local heat data headlines in teams',
        'Interview partner about hot-weather experiences',
        'Capture quotes on empathy map template',
        'Set personal justice pledge for project',
        'Share key insight with advisory circle'
      ],
      teacherSetup: [
        'Curate heat news gallery walk',
        'Invite partner storyteller for launch',
        'Prepare empathy map graphic organizers',
        'Model respectful note-taking during narratives'
      ],
      evidence: ['Completed empathy map', 'Justice pledge statement'],
      successCriteria: ['I capture quotes accurately', 'I name who is impacted', 'I connect heat to equity'],
      checkpoint: 'Teacher reviews empathy maps before fieldwork begins',
      aiOptional: {
        toolUse: 'Summarize climate article in student-friendly language',
        critique: 'Check summary for bias or missing voices',
        noAIAlt: 'Use partner annotations to create summary'
      }
    },
    {
      id: 'A2',
      title: 'Fieldwork Safety Plan',
      summary: 'Teams transform raw curiosity into a shared fieldwork plan that communities can trust. Students trace three priority blocks, script respectful outreach, and assign wellness roles so every visit stays safe and purposeful. Teachers layer in GIS overlays and co-review plans with partners to confirm access and expectations.',
      studentDirections: [
        'Map three priority blocks per team',
        'List safety checkpoints and hydration spots',
        'Draft outreach script for resident contacts',
        'Assign sensor, note, and wellness roles',
        'Submit plan to partner for confirmation'
      ],
      teacherSetup: [
        'Provide GIS layers and census overlays',
        'Share safety briefing slideshow',
        'Coordinate partner review meeting',
        'Check guardian consent packets'
      ],
      evidence: ['Approved fieldwork plan', 'Signed safety acknowledgement'],
      successCriteria: ['I design routes that cover neighborhood heat disparities', 'I follow protocols that keep teams safe in the field', 'I ensure partners know expectations and consent steps'],
      checkpoint: 'Teacher signs fieldwork plan before launch',
      aiOptional: {
        toolUse: 'Generate risk checklist from plan details',
        critique: 'Verify AI checklist matches local realities',
        noAIAlt: 'Use partner checklist template instead'
      },
    },
    {
      id: 'A3',
      title: 'Heat Story Data Sprint',
      summary: 'Teams turn sensor readings and neighbor testimonies into stories people can act on. Students clean messy datasets, blend qualitative quotes with hotspots, and storyboard dashboards that make equity gaps visible at a glance. Teachers model spreadsheet moves and critique loops so every visual is accurate and compelling.',
      studentDirections: [
        'Clean data and flag anomalies',
        'Visualize temperatures against tree canopy',
        'Weave resident quotes into captions',
        'Draft headline that names injustice',
        'Storyboard dashboard flow for feedback'
      ],
      teacherSetup: [
        'Model spreadsheet cleaning shortcuts',
        'Provide data visualization exemplars',
        'Host critique protocol for storyboards',
        'Check citation tracker templates'
      ],
      evidence: ['Cleaned data sheet', 'Storyboard with captions', 'Citation tracker'],
      successCriteria: ['I make data sources transparent for every visualization', 'I design visuals that show the equity gap clearly', 'I tell the story in ways that center resident experiences'],
      checkpoint: 'Teacher approves storyboard before publishing dashboard',
      aiOptional: {
        toolUse: 'Suggest chart options based on dataset',
        critique: 'Check AI chart for misleading scales',
        noAIAlt: 'Use manual graph templates in sheets'
      }
    },
    {
      id: 'A4',
      title: 'Cooling Intervention Pitch',
      summary: 'Teams design, test, and pitch cooling interventions tailored to the blocks they serve. Students build budget-conscious prototypes, gather pre/post temperature evidence, and shape action briefs that invite partners to move quickly. Teachers line up materials, coaching, and rehearsal time so summit pitches land with confidence and proof.',
      studentDirections: [
        'Prototype cooling solution with budget sheet',
        'Test intervention and record temperature delta',
        'Gather feedback from target users',
        'Draft one-page policy or action brief',
        'Rehearse summit pitch with timed run-through'
      ],
      teacherSetup: [
        'Provide prototyping materials and sensors',
        'Schedule field testing windows',
        'Arrange expert coaching drop-ins',
        'Facilitate pitch rehearsal feedback'
      ],
      evidence: ['Prototype test log', 'Temperature delta chart', 'Action brief handout'],
      successCriteria: ['I build prototypes that are feasible for local implementation', 'I back up recommendations with clear impact data', 'I deliver a call to action that is clear and actionable'],
      checkpoint: 'Teacher signs off on pitch deck before summit',
      aiOptional: {
        toolUse: 'Draft slide outline from action brief',
        critique: 'Confirm AI outline matches community priorities',
        noAIAlt: 'Use peer storyboard coaching instead'
      },
    }
  ],
};
