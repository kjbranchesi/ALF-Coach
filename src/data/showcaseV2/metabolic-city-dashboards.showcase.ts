import type { ProjectShowcaseV2 } from '../../types/showcaseV2';
import metabolicImage from '../../utils/hero/images/MetabolicCityDashboards.jpeg';

export const metabolic_city_dashboardsV2: ProjectShowcaseV2 = {
  id: 'metabolic-city-dashboards',
  version: '2.0.0',
  hero: {
    title: 'Metabolic City Dashboards',
    tagline: 'Visualize a city’s flows of energy, water, and food—and surface policy levers.',
    gradeBand: 'HS',
    timeframe: '6–8 weeks',
    subjects: ['Data Science', 'Systems Thinking', 'Civics', 'Environmental Science'],
    image: metabolicImage
  },
  microOverview: [
    'Students gather public datasets on energy, water, and food flows.',
    'They build interactive dashboards that compare neighborhoods and scenarios.',
    'Policy briefs propose equity‑centered interventions backed by data.'
  ],
  fullOverview:
    'Learners treat the city as a metabolism—tracking inputs, stocks, and wastes. They gather public datasets, clean and join them, and design dashboards that show neighborhood differences, bottlenecks, and vulnerabilities. Teams run what‑if scenarios (e.g., water restrictions, urban agriculture, district energy), compute impact estimates, and turn insights into data‑backed policy briefs for stakeholders. Exhibits invite community feedback and potential adoption.',
  schedule: { totalWeeks: 7, lessonsPerWeek: 3, lessonLengthMin: 60 },
  runOfShow: [
    { weekLabel: 'Week 1', kind: 'Foundations', focus: 'Urban metabolism and equitable indicators.',
      teacher: ['Show example flows', 'Share data portals', 'Facilitate equity dialogues'],
      students: ['Define metrics', 'List datasets', 'Sketch dashboard'],
      deliverables: ['Metric plan', 'Data inventory'], checkpoint: ['Teacher approves metrics'], assignments: ['A1'] },
    { weekLabel: 'Week 2', kind: 'Planning', focus: 'Build data pipeline and cleaning plan.',
      teacher: ['Model cleaning', 'Review schemas', 'Coach joins'],
      students: ['Clean datasets', 'Join tables', 'Capture pipeline steps meticulously'],
      deliverables: ['Cleaned tables', 'Pipeline doc'], checkpoint: ['Reproducible steps logged'], assignments: ['A2'] },
    { weekLabel: 'Weeks 3–4', kind: 'Build', focus: 'Design dashboard and run scenarios.',
      teacher: ['Share UI patterns', 'Check performance', 'Coach scenarios'],
      students: ['Design UI', 'Add filters', 'Run what‑ifs'],
      deliverables: ['Dashboard v1', 'Scenario notes'], checkpoint: ['Teacher QA of joins'], assignments: ['A3'] },
    { weekLabel: 'Week 5', kind: 'Build', focus: 'Policy brief drafting and partner interviews.',
      teacher: ['Invite stakeholders', 'Model brief structure', 'Coach interviews'],
      students: ['Interview partners', 'Draft brief', 'Cite evidence'],
      deliverables: ['Brief v1', 'Interview notes'], checkpoint: ['Teacher checks citations'] },
    { weekLabel: 'Week 6', kind: 'Exhibit', focus: 'Public dashboard demo & council‑style briefing.',
      teacher: ['Invite audience', 'Time pitches', 'Collect feedback'],
      students: ['Demo dashboard', 'Present brief', 'Log feedback'],
      deliverables: ['Pitch deck', 'Feedback log'], checkpoint: ['Stakeholder actions recorded'], assignments: ['A4'] },
    { weekLabel: 'Week 7', kind: 'Extension', focus: 'Publish toolkit and commit to updates.',
      teacher: ['Review toolkit', 'Schedule update cadence', 'Record governance plan'],
      students: ['Publish toolkit', 'Schedule updates', 'Assign maintainers'],
      deliverables: ['Toolkit v1', 'Update plan'], checkpoint: ['Maintainer list complete'] }
  ],
  outcomes: {
    core: [
      'Design equity-centered metabolism metrics and data sources with stakeholders',
      'Build reproducible pipelines and dashboards that reveal city resource flows',
      'Develop policy interventions using scenario insights and community feedback'
    ],
    extras: ['Open pipeline repo', 'Equity metric guide', 'Stakeholder interview library', 'Update governance plan'],
    audiences: ['City offices', 'Utilities', 'Neighborhood groups', 'Press']
  },
  materialsPrep: {
    coreKit: ['Laptops', 'Spreadsheet/BI tool', 'Data portal accounts', 'Interview scripts'],
    noTechFallback: ['Printed charts', 'Manual calculators', 'Poster briefs'],
  },
  assignments: [
    {
      id: 'A1',
      title: 'Metrics + Data Inventory',
      summary: 'Define metrics and list available datasets.',
      studentDirections: ['Pick metabolism metrics with equity lens', 'List datasets and source reliability', 'Sketch dashboard layout ideas', 'Flag data gaps and plan research', 'Submit plan for partner review'],
      teacherSetup: ['Share example dashboards and metrics', 'Assess feasibility with data stewards', 'Approve metric scope'],
      evidence: ['Metric plan', 'Inventory'],
      successCriteria: ['I select metrics that reveal equity gaps', 'I find trustworthy sources and note limitations', 'I plan a dashboard structure that matches the story'],
      aiOptional: {
        toolUse: 'Summarize dataset descriptions from open data portals',
        critique: 'Ensure AI summaries capture licensing and limitations',
        noAIAlt: 'Use data inventory worksheet manually'
      }
    },
    {
      id: 'A2',
      title: 'Pipeline Build',
      summary: 'Clean, join, and document data steps.',
      studentDirections: ['Clean tables with documented transformations', 'Join datasets accurately with data dictionary', 'Record every step for reproducibility', 'Validate samples against published stats', 'Share repo with version control'],
      teacherSetup: ['Model cleaning workflows', 'Review joins for accuracy', 'Check validation sampling'],
      evidence: ['Cleaned data', 'Pipeline doc'],
      successCriteria: ['I create reproducible pipelines teammates can follow', 'I join datasets accurately and transparently', 'I validate data against trusted references'],
      aiOptional: {
        toolUse: 'Suggest join keys or transformation hints',
        critique: 'Flag schema issues or missing values to investigate',
        noAIAlt: 'Conduct peer code review session'
      }
    },
    {
      id: 'A3',
      title: 'Dashboard + Scenario',
      summary: 'Design dashboard UI and run what‑ifs.',
      studentDirections: ['Design accessible UI with legends and tooltips', 'Add filters and comparisons for neighborhoods', 'Run what-if scenario and capture assumptions', 'Log changes and scenario insights', 'Cite data sources in dashboard and notes'],
      teacherSetup: ['Share UI accessibility patterns', 'Review performance and load time', 'Check citations and assumptions'],
      evidence: ['Dashboard v1', 'Scenario notes'],
      successCriteria: ['I design dashboards that are clear and accessible', 'I run scenarios with transparent assumptions', 'I cite every dataset directly in the experience'],
      aiOptional: {
        toolUse: 'Recommend visual encodings for variables',
        critique: 'Ensure AI recommendation matches accessibility needs',
        noAIAlt: 'Use visualization design cards'
      }
    },
    {
      id: 'A4',
      title: 'Policy Brief + Demo',
      summary: 'Present a council‑style briefing.',
      studentDirections: ['Draft policy brief with data-backed recommendations', 'Present findings to partners in council format', 'Collect feedback and commitments', 'Revise brief with new insights', 'Publish final brief and dashboard link'],
      teacherSetup: ['Invite partners and officials', 'Time pitches and manage Q&A', 'Collect feedback forms or notes'],
      evidence: ['Brief', 'Feedback log'],
      successCriteria: ['I persuade decision makers using clear data stories', 'I answer questions transparently with evidence', 'I refine and publish briefs that partners can act on'],
      aiOptional: {
        toolUse: 'Draft executive summary from dashboard insights',
        critique: 'Ensure AI summary reflects nuanced equity framing',
        noAIAlt: 'Use policy brief rubric and peer review'
      }
    }
  ],
  polish: {
    microRubric: ['Reproducible pipeline', 'Accessible UI', 'Evidence‑based brief', 'Equity lens'],
    checkpoints: ['Metrics approved', 'Pipeline validated', 'Citations checked'],
    tags: ['data', 'civics', 'env']
  },
  planningNotes: 'Audit datasets and API keys to confirm credentials, rate limits, and backups. Align with city data stewards before Week 2 so location data is masked, then document storage and retention policies.'
};
