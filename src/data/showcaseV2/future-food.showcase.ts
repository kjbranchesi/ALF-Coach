import type { ProjectShowcaseV2 } from '../../types/showcaseV2';
import future_foodImage from '../../utils/hero/images/FutureFoodLab.jpeg';
export const future_foodV2: ProjectShowcaseV2 = {
  id: 'future-food',
  version: '2.0.0',
  hero: {
    title: 'Future of Food: Closed-Loop Cafeteria',
    tagline: 'Students prototype circular systems that turn cafeteria waste into new value.',
    gradeBand: 'HS',
    timeframe: '6–8 weeks',
    subjects: ['Environmental Science', 'Nutrition', 'Business', 'Systems Engineering', 'Data Science', 'Public Health'],
    image: future_foodImage
  },
  microOverview: [
    'Students audit cafeteria food flows to uncover waste, emissions, and cost leaks.',
    'They design circular interventions blending composting, menu redesign, and student marketing.',
    'Teams launch pilots that divert waste, report impact, and pitch scaling with partners.'
  ],
  fullOverview:
    'Learners operate as sustainability entrepreneurs who turn the cafeteria into a circular innovation lab. They map every resource stream, partner with kitchen staff and local growers, and prototype solutions ranging from waste-tracking tech to upcycled menu items. Financial models, sensory testing, and stakeholder storytelling build the case for district-wide adoption.',
  schedule: { totalWeeks: 7, lessonsPerWeek: 3, lessonLengthMin: 55 },
  runOfShow: [
    {
      weekLabel: 'Week 1',
      kind: 'Foundations',
      focus: 'Understand circular economy principles and cafeteria system flows to spotlight leverage points. Pose the question, "Where does our cafeteria leak the most value today and who feels it?" Teachers introduce circular economy case studies. Students map cafeteria resource streams visually.',
      teacher: [
        'Introduce circular economy case studies',
        'Lead back-of-house kitchen tour',
        'Facilitate stakeholder empathy panel'
      ],
      students: [
        'Map cafeteria resource streams visually',
        'Interview staff about pain points',
        'Draft problem-framing statements'
      ],
      deliverables: ['Systems map', 'Stakeholder interview notes', 'Challenge statement'],
      checkpoint: ['Teacher approves challenge statement'],
      assignments: ['A1']
    },
    {
      weekLabel: 'Week 2',
      kind: 'Planning',
      focus: 'Design waste audit and procurement research plan so data captures both costs and equity. Ask, "What evidence will convince kitchen staff and finance at the same time?" Teachers model waste audit protocols. Students schedule audits with food services.',
      teacher: [
        'Model waste audit protocols',
        'Share procurement data sources',
        'Coach teams on safety expectations'
      ],
      students: [
        'Schedule audits with food services',
        'Develop measurement templates',
        'Coordinate sampler tasting surveys'
      ],
      deliverables: ['Audit plan', 'Data collection template', 'Survey instruments'],
      checkpoint: ['Food services signs audit plan'],
      assignments: ['A2']
    },
    {
      weekLabel: 'Weeks 3–4',
      kind: 'FieldworkLoop',
      focus: 'Collect waste, nutrition, and perception data to ground intervention choices in evidence. Keep checking, "Would this dataset stand up if the district CFO audited us?" Teachers monitor audits for food safety. Students measure waste streams by category.',
      teacher: [
        'Monitor audits for food safety',
        'Coach real-time data uploads',
        'Host daily insight stand-ups'
      ],
      students: [
        'Measure waste streams by category',
        'Track participation and leftovers',
        'Survey eaters on taste and value'
      ],
      deliverables: ['Waste dataset', 'Participation dashboard', 'Survey response summaries'],
      checkpoint: ['Teacher validates data cleanliness'],
      repeatable: true,
      assignments: ['A2']
    },
    {
      weekLabel: 'Week 5',
      kind: 'Build',
      focus: 'Prototype closed-loop interventions and test viability with partners before scaling. Encourage teams to ask, "What will break first when this runs during a hectic lunch rush?" Teachers facilitate menu innovation lab. Students design intervention prototypes.',
      teacher: [
        'Facilitate menu innovation lab',
        'Connect teams with local composters',
        'Model mini business case building'
      ],
      students: [
        'Design intervention prototypes',
        'Pilot with small user groups',
        'Capture cost and impact estimates'
      ],
      deliverables: ['Prototype documentation', 'Pilot data log', 'Mini business case'],
      checkpoint: ['Teacher reviews safety compliance'],
      assignments: ['A3']
    },
    {
      weekLabel: 'Week 6',
      kind: 'Exhibit',
      focus: 'Host tasting lab and circular economy showcase to earn stakeholder buy-in. Frame the event with "What commitment do we want each decision maker to leave with?" Teachers coordinate tasting logistics with kitchen. Students stage tasting booths with storyboards.',
      teacher: [
        'Coordinate tasting logistics with kitchen',
        'Invite district leaders and families',
        'Coach teams on persuasive demos'
      ],
      students: [
        'Stage tasting booths with storyboards',
        'Collect feedback from tasters',
        'Facilitate panel dialogue on scaling'
      ],
      deliverables: ['Tasting feedback tracker', 'Showcase pitch deck', 'Panel transcript'],
      checkpoint: ['Stakeholders endorse next steps'],
      assignments: ['A4']
    },
    {
      weekLabel: 'Week 7',
      kind: 'Extension',
      focus: 'Launch pilots and monitor closed-loop metrics to prove durability after showcase. Ask, "Who owns this loop when the original team graduates?" Teachers coordinate scheduling of ongoing pilots. Students implement pilots with staff partners.',
      teacher: [
        'Coordinate scheduling of ongoing pilots',
        'Review data monitoring cadence',
        'Secure press coverage opportunities'
      ],
      students: [
        'Implement pilots with staff partners',
        'Track waste diversion performance',
        'Publish update stories to community'
      ],
      deliverables: ['Pilot rollout plan', 'Metrics dashboard', 'Community newsletter draft'],
      checkpoint: ['Teacher confirms data-sharing protocols'],
      assignments: ['A4']
    }
  ],
  outcomes: {
    core: ['Design and launch a closed-loop pilot that reduces cafeteria waste measurably'],
    extras: [
      'Develop student-led marketing campaign',
      'Design compost partnership agreements',
      'Publish cost savings analysis for district',
      'Create upcycled recipe e-book'
    ],
    audiences: ['Food services leadership', 'Students and families', 'Local farms', 'District sustainability teams']
  },
  materialsPrep: {
    coreKit: [
      'Food-safe scales and bins',
      'Data tablets or laptops',
      'Compostable serving ware for pilots',
      'Recipe development kitchen tools',
      'Marketing design software',
      'Food safety gloves and aprons'
    ],
    noTechFallback: ['Paper tally sheets', 'Poster board for marketing', 'Handwritten tasting ballots'],
  },
  assignments: [
    {
      id: 'A1',
      title: 'Cafeteria Systems Portrait',
      summary: 'Kick off by seeing the cafeteria as a living system instead of a lunch line. Students tour back-of-house operations, interview staff, and map every input, loss, and opportunity in their systems portrait. Teachers coordinate access, model respectful interviewing, and facilitate critique so leverage points surface quickly.',
      studentDirections: [
        'Conduct kitchen tour observation',
        'Interview staff about top challenges',
        'Map inputs, outputs, and losses',
        'Identify leverage points for change',
        'Share portrait with feedback partners'
      ],
      teacherSetup: [
        'Arrange kitchen tour schedule',
        'Provide mapping template',
        'Model respectful staff interviews',
        'Lead feedback gallery walk'
      ],
      evidence: ['Systems portrait', 'Interview summary'],
      successCriteria: ['I capture the full cafeteria flow in our map', 'I craft insights that echo staff voices faithfully', 'I identify opportunities that feel specific and actionable'],
      checkpoint: 'Teacher reviews portrait before audit',
      aiOptional: {
        toolUse: 'Summarize interview recordings',
        critique: 'Check AI summary for nuance',
        noAIAlt: 'Use note-taking buddy system'
      }
    },
    {
      id: 'A2',
      title: 'Waste and Procurement Audit',
      summary: 'Audit week turns curiosity into defensible evidence. Students coordinate schedules, weigh and track waste, gather procurement data, and capture eater perspectives before packaging insights into a data brief. Teachers review safety procedures, provide calibrated tools, and ensure findings meet partner expectations.',
      studentDirections: [
        'Coordinate audit schedule with staff partners',
        'Collect waste data by category using agreed methods',
        'Compile sourcing distances and costs carefully',
        'Survey students on meal satisfaction',
        'Publish findings in data brief'
      ],
      teacherSetup: [
        'Review safety procedures',
        'Provide calibrated scales',
        'Share data brief example',
        'Coordinate staff liaison support'
      ],
      evidence: ['Audit dataset', 'Data brief report'],
      successCriteria: ['I compile data that is complete and verified', 'I connect analysis directly to our project goals', 'I write briefs that communicate clearly to stakeholders'],
      checkpoint: 'Teacher signs off on data quality',
      aiOptional: {
        toolUse: 'Visualize data automatically',
        critique: 'Confirm charts tell truth',
        noAIAlt: 'Use spreadsheet templates'
      },
    },
    {
      id: 'A3',
      title: 'Circular Prototype Lab',
      summary: 'Prototype lab is where circular ideas hit the real lunch rush. Students ideate with staff partners, pilot small interventions, and log cost plus impact data to decide what scales. Teachers supply materials, decision frameworks, and checkpoints so prototypes stay safe, feasible, and evidence-backed.',
      studentDirections: [
        'Ideate three circular solutions',
        'Select concept with staff partner',
        'Prototype and pilot in cafeteria',
        'Track impact with shared metrics',
        'Refine concept using feedback'
      ],
      teacherSetup: [
        'Provide prototyping materials',
        'Facilitate decision matrix workshop',
        'Schedule pilot windows',
        'Support impact data tracking'
      ],
      evidence: ['Prototype documentation', 'Impact log'],
      successCriteria: ['I propose solutions that close the waste-to-resource loop', 'I show pilot data that demonstrates progress', 'I use feedback to inform the next iteration plan'],
      checkpoint: 'Teacher verifies pilot safety',
      aiOptional: {
        toolUse: 'Model cost savings quickly',
        critique: 'Check AI math with spreadsheet',
        noAIAlt: 'Use provided ROI template'
      }
    },
    {
      id: 'A4',
      title: 'Closed-Loop Pitch + Launch',
      summary: 'The closed-loop pitch converts prototypes into lasting practice. Students build data-rich decks, run tastings or demos, and secure commitments while establishing monitoring cadences with staff. Teachers organize the showcase, invite decision makers, and make sure every promise is captured in the rollout plan.',
      studentDirections: [
        'Build pitch deck with data stories',
        'Host tasting or demo experience',
        'Request commitments during panel',
        'Schedule monitoring cadence with staff partners',
        'Publish community update summary'
      ],
      teacherSetup: [
        'Organize showcase logistics',
        'Invite decision makers and families',
        'Provide pitch rehearsal protocols',
        'Set up communication channels'
      ],
      evidence: ['Pitch recording', 'Monitoring plan', 'Community update draft'],
      successCriteria: ['I pitch our solution by highlighting the key data', 'I capture commitments from partners during the pitch', 'I publish a plan that names responsible people and timelines'],
      checkpoint: 'Teacher confirms monitoring plan',
      aiOptional: {
        toolUse: 'Draft community newsletter copy',
        critique: 'Ensure tone stays celebratory',
        noAIAlt: 'Use communications template'
      }
    }
  ],
};
