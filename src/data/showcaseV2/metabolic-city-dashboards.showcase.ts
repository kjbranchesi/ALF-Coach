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
      teacher: ['Show example flows', 'Share data portals', 'Discuss equity'],
      students: ['Define metrics', 'List datasets', 'Sketch dashboard'],
      deliverables: ['Metric plan', 'Data inventory'], checkpoint: ['Teacher approves metrics'], assignments: ['A1'] },
    { weekLabel: 'Week 2', kind: 'Planning', focus: 'Build data pipeline and cleaning plan.',
      teacher: ['Model cleaning', 'Review schemas', 'Coach joins'],
      students: ['Clean datasets', 'Join tables', 'Document pipeline'],
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
      teacher: ['Review toolkit', 'Schedule update cadence', 'Document governance'],
      students: ['Publish toolkit', 'Plan updates', 'Assign maintainers'],
      deliverables: ['Toolkit v1', 'Update plan'], checkpoint: ['Maintainer list complete'] }
  ],
  outcomes: {
    core: ['Launch an interactive metabolism dashboard and a policy brief'],
    extras: ['Open pipeline repo', 'Equity metric guide', 'Stakeholder interview library', 'Update governance plan'],
    audiences: ['City offices', 'Utilities', 'Neighborhood groups', 'Press']
  },
  materialsPrep: {
    coreKit: ['Laptops', 'Spreadsheet/BI tool', 'Data portal accounts', 'Interview scripts'],
    noTechFallback: ['Printed charts', 'Manual calculators', 'Poster briefs'],
    safetyEthics: ['Respect data privacy', 'Verify sources', 'Avoid doxxing or sensitive geodata']
  },
  assignments: [
    { id: 'A1', title: 'Metrics + Data Inventory', summary: 'Define metrics and list available datasets.',
      studentDirections: ['Pick metrics', 'List datasets', 'Sketch dashboard', 'Flag gaps', 'Submit plan'],
      teacherSetup: ['Share examples', 'Assess feasibility', 'Approve metrics'],
      evidence: ['Metric plan', 'Inventory'], successCriteria: ['I pick meaningful', 'I find sources', 'I plan clearly'] },
    { id: 'A2', title: 'Pipeline Build', summary: 'Clean, join, and document data steps.',
      studentDirections: ['Clean tables', 'Join correctly', 'Document steps', 'Validate samples', 'Share repo'],
      teacherSetup: ['Model cleaning', 'Review joins', 'Check validation'],
      evidence: ['Cleaned data', 'Pipeline doc'], successCriteria: ['I reproduce steps', 'I join accurately', 'I validate data'],
      aiOptional: { toolUse: 'Suggest join keys', critique: 'Flag schema issues', noAIAlt: 'Peer code review' } },
    { id: 'A3', title: 'Dashboard + Scenario', summary: 'Design dashboard UI and run what‑ifs.',
      studentDirections: ['Design UI', 'Add filters', 'Run scenario', 'Log changes', 'Cite data'],
      teacherSetup: ['Share UI patterns', 'Review performance', 'Check citations'],
      evidence: ['Dashboard v1', 'Scenario notes'], successCriteria: ['I design clearly', 'I run scenarios', 'I cite data'] },
    { id: 'A4', title: 'Policy Brief + Demo', summary: 'Present a council‑style briefing.',
      studentDirections: ['Draft brief', 'Present findings', 'Collect feedback', 'Revise brief', 'Publish'],
      teacherSetup: ['Invite partners', 'Time pitches', 'Collect feedback'],
      evidence: ['Brief', 'Feedback log'], successCriteria: ['I persuade with data', 'I answer questions', 'I refine well'] }
  ],
  polish: {
    microRubric: ['Reproducible pipeline', 'Accessible UI', 'Evidence‑based brief', 'Equity lens'],
    checkpoints: ['Metrics approved', 'Pipeline validated', 'Citations checked'],
    tags: ['data', 'civics', 'env']
  },
  planningNotes: 'Pre‑check data access; align with city data stewards; be mindful of sensitive location data.'
};
