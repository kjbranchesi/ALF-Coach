export type SampleBlueprint = {
  id: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
  wizardData: any;
  ideation?: any;
  journey?: any;
  deliverables?: any;
  sample?: boolean;
  assignments?: any[];
  alignment?: any;
};

function ts() { return new Date().toISOString(); }

// Legacy single sample (kept for compatibility)
export function makeSampleBlueprint(id: string, userId: string = 'anonymous'): SampleBlueprint {
  const wizardData = {
    projectTopic: 'Urban Green Spaces and Community Wellbeing',
    learningGoals: 'Research, data literacy, civic awareness, design thinking',
    entryPoint: 'learning_goal',
    subjects: ['science', 'social-studies', 'arts'],
    primarySubject: 'science',
    gradeLevel: 'middle',
    duration: 'medium',
    materials: 'Notebooks, access to local maps, measuring tools',
    subject: 'Science, Social Studies',
    location: 'classroom',
  };

  const ideation = {
    bigIdea: 'Human-environment relationships',
    essentialQuestion: 'How can we design greener spaces that improve community wellbeing?',
    challenge: 'Propose a small-scale improvement to a local public space'
  };

  const journey = {
    analyze: { goal: 'Investigate current green space usage', activity: 'Field observation + interviews', output: 'Observation notes', duration: '2 lessons' },
    brainstorm: { goal: 'Generate improvement ideas', activity: 'Design sprint + sketching', output: 'Concept sketches', duration: '3 lessons' },
    prototype: { goal: 'Model a proposed improvement', activity: 'Create physical/digital prototype', output: 'Prototype + rationale', duration: '3–4 lessons' },
    evaluate: { goal: 'Gather feedback and refine', activity: 'Peer critique + stakeholder review', output: 'Revised concept + plan', duration: '2 lessons' }
  };

  const deliverables = {
    milestones: ['Observation summary', 'Concept selection', 'Prototype review'],
    rubric: { criteria: ['Understanding', 'Process', 'Product', 'Impact'] },
    impact: { audience: 'Local community or school leadership', method: 'Showcase or briefing' }
  };

  return {
    id,
    userId,
    createdAt: ts(),
    updatedAt: ts(),
    wizardData,
    ideation,
    journey,
    deliverables,
    sample: true
  };
}

// Programmatic catalog for 5–7 samples per age group
type CatalogItem = {
  projectTopic: string;
  bigIdea: string;
  essentialQuestion: string;
  challenge: string;
  subjects: string[];
  primarySubject: string;
  duration: 'short' | 'medium' | 'long';
  materials?: string;
};

function baseJourney(short: boolean = true) {
  return {
    analyze: { goal: 'Understand the context', activity: 'Research + observations', output: 'Notes/summary', duration: short ? '1–2 lessons' : '1 week' },
    brainstorm: { goal: 'Generate and select ideas', activity: 'Idea sprint + critique', output: 'Shortlist', duration: short ? '1–2 lessons' : '1 week' },
    prototype: { goal: 'Develop a solution', activity: 'Draft/prototype + feedback', output: 'Draft/prototype', duration: short ? '2–3 lessons' : '1–2 weeks' },
    evaluate: { goal: 'Refine and present', activity: 'Peer review + stakeholder share', output: 'Final with rationale', duration: short ? '1–2 lessons' : '1 week' },
  };
}

const catalog: Record<string, CatalogItem[]> = {
  'early-elementary': [
    { projectTopic: 'Community Helpers', bigIdea: 'Communities and roles', essentialQuestion: 'Who helps our community and how?', challenge: 'Create a “thank you” map poster', subjects: ['social-studies','language-arts','arts'], primarySubject: 'social-studies', duration: 'short' },
    { projectTopic: 'Animal Habitats', bigIdea: 'Living things have needs', essentialQuestion: 'What makes a good home for animals?', challenge: 'Build a habitat diorama', subjects: ['science','arts'], primarySubject: 'science', duration: 'short' },
    { projectTopic: 'School Gardens', bigIdea: 'Plants and care', essentialQuestion: 'How do plants grow best at school?', challenge: 'Design a class planter and care plan', subjects: ['science','math'], primarySubject: 'science', duration: 'medium' },
    { projectTopic: 'Neighborhood Safety', bigIdea: 'Caring for our place', essentialQuestion: 'How can we make our routes safer?', challenge: 'Create a safety poster series', subjects: ['social-studies','arts'], primarySubject: 'social-studies', duration: 'short' },
    { projectTopic: 'Weather Watchers', bigIdea: 'Patterns in nature', essentialQuestion: 'What weather patterns do we see?', challenge: 'Make a class weather report', subjects: ['science','language-arts'], primarySubject: 'science', duration: 'short' },
    { projectTopic: 'Kindness Campaign', bigIdea: 'Community and empathy', essentialQuestion: 'How do small actions help others?', challenge: 'Run a kindness challenge', subjects: ['language-arts','arts'], primarySubject: 'language-arts', duration: 'short' },
  ],
  'elementary': [
    { projectTopic: 'Waste Reduction', bigIdea: 'Sustainability', essentialQuestion: 'How can our school reduce waste?', challenge: 'Pilot a recycling improvement', subjects: ['science','language-arts','mathematics'], primarySubject: 'science', duration: 'medium' },
    { projectTopic: 'Local Ecosystems', bigIdea: 'Interdependence', essentialQuestion: 'How do living things depend on one another?', challenge: 'Create an ecosystem exhibit', subjects: ['science','arts'], primarySubject: 'science', duration: 'medium' },
    { projectTopic: 'Healthy Habits', bigIdea: 'Wellbeing', essentialQuestion: 'How can we make healthier choices?', challenge: 'Design a health tips campaign', subjects: ['health','language-arts'], primarySubject: 'health', duration: 'short' },
    { projectTopic: 'Community History', bigIdea: 'Change over time', essentialQuestion: 'How has our community changed?', challenge: 'Build a timeline gallery', subjects: ['social-studies','language-arts'], primarySubject: 'social-studies', duration: 'medium' },
    { projectTopic: 'Inventions Fair', bigIdea: 'Problem-solving', essentialQuestion: 'How can we solve everyday problems?', challenge: 'Prototype a simple invention', subjects: ['science','technology'], primarySubject: 'technology', duration: 'medium' },
    { projectTopic: 'School Energy Use', bigIdea: 'Conservation', essentialQuestion: 'Where can we save energy?', challenge: 'Propose energy-saving actions', subjects: ['science','math'], primarySubject: 'science', duration: 'medium' },
  ],
  'middle': [
    { projectTopic: 'Urban Green Spaces', bigIdea: 'Human–environment relationships', essentialQuestion: 'How can greener spaces improve wellbeing?', challenge: 'Propose an improvement to a local space', subjects: ['science','social-studies','arts'], primarySubject: 'science', duration: 'medium' },
    { projectTopic: 'Local History Podcasts', bigIdea: 'Identity and place', essentialQuestion: 'Whose stories define our community?', challenge: 'Produce an oral history episode', subjects: ['social-studies','language-arts','arts'], primarySubject: 'social-studies', duration: 'medium' },
    { projectTopic: 'School Lunch Analysis', bigIdea: 'Evidence-based decisions', essentialQuestion: 'How nutritious are our lunches?', challenge: 'Recommend menu improvements', subjects: ['science','mathematics','language-arts'], primarySubject: 'science', duration: 'medium' },
    { projectTopic: 'Water Quality Study', bigIdea: 'Human impact', essentialQuestion: 'How healthy is our watershed?', challenge: 'Present a data-backed recommendation', subjects: ['science','math'], primarySubject: 'science', duration: 'long' },
    { projectTopic: 'Media Messages', bigIdea: 'Persuasion', essentialQuestion: 'How do ads influence us?', challenge: 'Create an ad literacy toolkit', subjects: ['language-arts','technology'], primarySubject: 'language-arts', duration: 'short' },
    { projectTopic: 'Community Mapping', bigIdea: 'Civic awareness', essentialQuestion: 'Where are resources and gaps?', challenge: 'Publish a community resource map', subjects: ['social-studies','technology'], primarySubject: 'social-studies', duration: 'medium' },
  ],
  'upper-secondary': [
    { projectTopic: 'Data Journalism', bigIdea: 'Data as evidence', essentialQuestion: 'How do numbers reveal stories?', challenge: 'Publish a short data story', subjects: ['mathematics','language-arts','social-studies'], primarySubject: 'mathematics', duration: 'long' },
    { projectTopic: 'Civic Media Literacy', bigIdea: 'Truth and evidence', essentialQuestion: 'Which claims are trustworthy?', challenge: 'Publish a fact-check brief', subjects: ['language-arts','social-studies','mathematics'], primarySubject: 'language-arts', duration: 'medium' },
    { projectTopic: 'Sustainable Design', bigIdea: 'Design thinking', essentialQuestion: 'How might we reduce waste?', challenge: 'Prototype a sustainability solution', subjects: ['engineering','science','technology'], primarySubject: 'engineering', duration: 'long' },
    { projectTopic: 'Public Health Dashboards', bigIdea: 'Data for good', essentialQuestion: 'How can data guide action?', challenge: 'Build an insights dashboard', subjects: ['technology','mathematics'], primarySubject: 'technology', duration: 'long' },
    { projectTopic: 'Community Economics', bigIdea: 'Systems and trade-offs', essentialQuestion: 'What helps local economies thrive?', challenge: 'Write a policy brief', subjects: ['social-studies','mathematics'], primarySubject: 'social-studies', duration: 'medium' },
    { projectTopic: 'STEM Mentorship', bigIdea: 'Learning communities', essentialQuestion: 'How do we broaden access?', challenge: 'Design a peer mentorship program', subjects: ['engineering','social-studies'], primarySubject: 'social-studies', duration: 'medium' },
  ],
  'higher-ed': [
    { projectTopic: 'Assistive Tech Prototype', bigIdea: 'Design for accessibility', essentialQuestion: 'How can we reduce barriers?', challenge: 'Prototype and test with users', subjects: ['engineering','technology'], primarySubject: 'engineering', duration: 'long' },
    { projectTopic: 'Social Impact Visualization', bigIdea: 'Design communicates values', essentialQuestion: 'How can we visualize data to drive action?', challenge: 'Build a stakeholder dashboard', subjects: ['technology','mathematics','social-studies'], primarySubject: 'technology', duration: 'long' },
    { projectTopic: 'Community Research', bigIdea: 'Participatory inquiry', essentialQuestion: 'What does the community need?', challenge: 'Publish a research brief', subjects: ['social-studies'], primarySubject: 'social-studies', duration: 'long' },
    { projectTopic: 'Sustainable Campus', bigIdea: 'Organizational change', essentialQuestion: 'Where can we improve?', challenge: 'Propose a campus initiative', subjects: ['engineering','science'], primarySubject: 'engineering', duration: 'medium' },
    { projectTopic: 'EdTech Evaluation', bigIdea: 'Evidence-based practice', essentialQuestion: 'What tools actually help?', challenge: 'Run a comparative evaluation', subjects: ['technology','education'], primarySubject: 'technology', duration: 'medium' },
    { projectTopic: 'Design Ethics', bigIdea: 'Impact and responsibility', essentialQuestion: 'What are ethical trade-offs?', challenge: 'Write guidance for a partner', subjects: ['social-studies','technology'], primarySubject: 'social-studies', duration: 'short' },
  ],
  'adult': [
    { projectTopic: 'Workplace Wellness', bigIdea: 'Preventive health', essentialQuestion: 'How can we promote wellness at work?', challenge: 'Launch a micro‑campaign', subjects: ['health','language-arts','technology'], primarySubject: 'health', duration: 'medium' },
    { projectTopic: 'Digital Skills Upgrade', bigIdea: 'Lifelong learning', essentialQuestion: 'Which skills unlock opportunities?', challenge: 'Design a learning sprint', subjects: ['technology'], primarySubject: 'technology', duration: 'short' },
    { projectTopic: 'Community Outreach', bigIdea: 'Civic engagement', essentialQuestion: 'How do we increase participation?', challenge: 'Plan and run an event', subjects: ['social-studies','language-arts'], primarySubject: 'social-studies', duration: 'medium' },
    { projectTopic: 'Sustainable Households', bigIdea: 'Behavior change', essentialQuestion: 'How do small changes add up?', challenge: 'Create a home action plan', subjects: ['science','health'], primarySubject: 'science', duration: 'short' },
    { projectTopic: 'Financial Literacy', bigIdea: 'Informed decisions', essentialQuestion: 'How can budgeting reduce stress?', challenge: 'Build a budgeting toolkit', subjects: ['mathematics','social-studies'], primarySubject: 'mathematics', duration: 'short' },
    { projectTopic: 'Community Data Story', bigIdea: 'Narrative with data', essentialQuestion: 'Which local issues need attention?', challenge: 'Publish a short data story', subjects: ['mathematics','language-arts'], primarySubject: 'mathematics', duration: 'medium' },
  ],
};

function buildBlueprintFromCatalog(id: string, userId: string, gradeLevel: string, item: CatalogItem): SampleBlueprint {
  const short = item.duration !== 'long';
  return {
    id,
    userId,
    createdAt: ts(),
    updatedAt: ts(),
    wizardData: {
      projectTopic: item.projectTopic,
      learningGoals: 'Contextual inquiry, communication, iteration',
      entryPoint: 'learning_goal',
      subjects: item.subjects,
      primarySubject: item.primarySubject,
      gradeLevel,
      duration: item.duration,
      materials: item.materials || '',
      location: 'classroom',
    },
    ideation: {
      bigIdea: item.bigIdea,
      essentialQuestion: item.essentialQuestion,
      challenge: item.challenge,
    },
    journey: baseJourney(short),
    deliverables: {
      milestones: ['Checkpoint 1', 'Checkpoint 2', 'Checkpoint 3'],
      rubric: { criteria: ['Understanding', 'Reasoning', 'Communication', 'Impact'] },
      impact: { audience: 'Peers/stakeholders', method: 'Share/review' },
    },
    sample: true,
  };
}

export function getAllSampleBlueprints(userId: string = 'anonymous'): SampleBlueprint[] {
  // Stable IDs so routes like /app/samples/:id work across reloads
  const out: SampleBlueprint[] = [];
  // Prepend a fully‑fleshed "hero" sample to showcase end result
  out.push(buildHeroSample(userId));
  (Object.keys(catalog) as Array<keyof typeof catalog>).forEach((grade) => {
    catalog[grade].forEach((item, idx) => {
      const id = `sample-${grade}-${idx}`;
      out.push(buildBlueprintFromCatalog(id, userId, grade, item));
    });
  });
  return out;
}

// A fully detailed sample to demonstrate the app's end result
function buildHeroSample(userId: string): SampleBlueprint {
  const id = 'sample-featured-sustainability-campaign';

  const wizardData = {
    projectTopic: 'Sustainability Campaign: Reducing Single‑Use Plastics on Campus',
    learningGoals: 'Research, data literacy, communication, civic engagement, design thinking',
    entryPoint: 'learning_goal',
    subjects: ['science', 'social-studies', 'language-arts', 'technology'],
    primarySubject: 'science',
    gradeLevel: 'upper-secondary',
    duration: 'long',
    materials: 'Clipboards, scales, sorting bins, spreadsheet tools, poster/print access, video tools',
    subject: 'Science, Social Studies, ELA',
    location: 'school campus + community',
    featured: true,
  };

  const ideation = {
    bigIdea: 'Human actions affect ecological systems and communities.',
    essentialQuestion: 'How might we meaningfully reduce single‑use plastics in our school and local community?',
    challenge: 'Design, test, and launch a sustainability campaign that measurably reduces single‑use plastics on campus.'
  };

  const journey = {
    analyze: {
      goal: 'Understand the scope and root causes of plastic waste on campus',
      activity: 'Waste audit + stakeholder interviews + data analysis',
      output: 'Baseline report with data visuals and insights',
      duration: '1–2 weeks'
    },
    brainstorm: {
      goal: 'Generate, prototype, and select promising intervention ideas',
      activity: 'Design sprint (idea generation → quick prototypes → user testing)',
      output: 'Top 2–3 concepts with feedback notes and selection rationale',
      duration: '1 week'
    },
    prototype: {
      goal: 'Build and trial the campaign assets and interventions',
      activity: 'Create signage, social content, incentives; pilot in high‑traffic areas',
      output: 'Pilot kit (assets + rollout plan) and initial measurements',
      duration: '2 weeks'
    },
    evaluate: {
      goal: 'Measure impact, iterate, and launch school‑wide',
      activity: 'A/B tests, post‑surveys, refine assets, present to leadership',
      output: 'Impact report + final campaign launch',
      duration: '1–2 weeks'
    },
    activities: [
      'Conduct a cafeteria waste audit over 5 days and quantify single‑use items',
      'Map decision points where students opt for single‑use plastics',
      'Interview stakeholders (students, staff, cafeteria leads, custodial team)',
      'Run a design sprint: sketch 8 ideas in 8 minutes (Crazy 8s)',
      'Prototype 2 signage styles and 1 social media series; run quick user tests',
      'Pilot the campaign in one grade level; collect participation metrics',
      'Iterate assets and messaging based on pilot feedback',
      'Present findings to school leadership; plan school‑wide rollout'
    ],
    resources: [
      'EPA Waste Reduction toolkit',
      'Local recycling center guidelines',
      'Canva or Figma for campaign assets',
      'Google Sheets / Data Studio for dashboards'
    ]
  };

  const deliverables = {
    milestones: [
      { title: 'Baseline Report', description: 'Publish baseline waste audit and insights (charts + narrative).'},
      { title: 'Concept Shortlist', description: 'Document 2–3 intervention concepts with rationale.'},
      { title: 'Pilot Launch', description: 'Deploy campaign in one area; collect week‑one metrics.'},
      { title: 'Impact Report', description: 'Compare baseline vs. pilot metrics; summarize key learnings.'},
      { title: 'School‑wide Launch', description: 'Roll out refined campaign to target locations.'}
    ],
    rubric: {
      criteria: [
        { criterion: 'Understanding', weight: 25, description: 'Demonstrates systems thinking and accurate interpretation of data.' },
        { criterion: 'Design Quality', weight: 25, description: 'Iterative process evident; assets are compelling, accessible, and on‑message.' },
        { criterion: 'Impact', weight: 30, description: 'Measurable reduction and/or behavior change supported by evidence.' },
        { criterion: 'Communication', weight: 20, description: 'Clear, audience‑appropriate storytelling in reports and presentations.' }
      ]
    },
    impact: {
      audience: 'Students, staff, school leadership, and local community partners',
      method: 'Pilot → iterate → school‑wide launch; public report and assembly presentation',
      timeline: '6–8 weeks with checkpoint reviews each week',
    }
  };

  const assignments = [
    {
      phase: 'analyze',
      title: 'Baseline Waste Audit & Stakeholder Interviews',
      duration: '5–7 class periods',
      objectives: [
        'Collect and analyze quantitative and qualitative data about single‑use plastics on campus',
        'Identify root causes and decision points that drive single‑use behavior',
        'Communicate findings with clear visuals and actionable insights'
      ],
      standards: {
        NGSS: ['HS‑ESS3‑4', 'HS‑ETS1‑1'],
        ELA: ['CCSS.ELA‑LITERACY.W.11‑12.7', 'SL.11‑12.4'],
        C3: ['D4.2.9‑12'],
      },
      materials: [
        'Sorting bins, gloves, tongs, digital scale',
        'Interview protocol & consent script',
        'Spreadsheet template (Google Sheets) and chart starter',
      ],
      procedure: [
        { step: 'Launch & scope', time: '15 min', detail: 'Frame the question and define audit locations; assign roles.' },
        { step: 'Safety & setup', time: '10 min', detail: 'Model safe sorting; review data entry protocol.' },
        { step: 'Waste sorting & weighing', time: '2–3 class periods', detail: 'Sort target streams; weigh and log items by category.' },
        { step: 'Stakeholder interviews', time: '1–2 class periods', detail: 'Run short interviews (students, staff, cafeteria leads). Record notes.' },
        { step: 'Data cleaning & visualization', time: '1 period', detail: 'Create charts; identify hotspots and patterns.' },
        { step: 'Insight synthesis', time: '1 period', detail: 'Formulate “We found that…” statements and potential levers.' },
      ],
      formativeChecks: [
        'Spot‑check data entry accuracy (double‑entry for 10% sample)',
        'Exit ticket: one surprising pattern + one question',
        'Quick gallery walk of first‑draft charts with warm/cool feedback'
      ],
      successCriteria: [
        'Data is complete, categorized consistently, and represented accurately in charts',
        'At least 3 insight statements connect evidence to causes/constraints',
        'Interview notes include 2+ quotes that inform design decisions'
      ],
      rubric: [
        { criterion: 'Data quality', levels: ['Limited', 'Developing', 'Proficient', 'Advanced'], descriptor: 'Accuracy, completeness, and representation' },
        { criterion: 'Insightfulness', levels: ['Limited', 'Developing', 'Proficient', 'Advanced'], descriptor: 'Clear patterns and actionable levers identified' },
        { criterion: 'Communication', levels: ['Limited', 'Developing', 'Proficient', 'Advanced'], descriptor: 'Charts/readout are clear and audience‑appropriate' },
      ],
      accommodations: [
        'Provide sentence frames for insight statements and interview follow‑ups',
        'Offer typed data sheets and color‑coded categories',
        'Assign roles (weigher, recorder, sorter) and rotate as needed'
      ],
      udl: [
        'Multiple Means of Representation: exemplars of charts; visuals + text',
        'Multiple Means of Action/Expression: choice of infographic/report format',
        'Multiple Means of Engagement: real‑world audience and ownership of roles'
      ],
      deliverable: 'Baseline Waste Audit Report (charts + narrative insights + quotes)'
    },
    {
      phase: 'brainstorm',
      title: 'Design Sprint: Ideate → Prototype → Test',
      duration: '4–5 class periods',
      objectives: [
        'Generate a wide range of campaign concepts grounded in evidence',
        'Prototype messaging/assets rapidly and test with users',
        'Use feedback to converge on 2–3 promising interventions'
      ],
      standards: {
        NGSS: ['HS‑ETS1‑2'],
        ELA: ['CCSS.ELA‑LITERACY.SL.11‑12.1', 'W.11‑12.4'],
        ISTE: ['1.4 Innovative Designer', '1.6 Creative Communicator']
      },
      materials: [
        'Sticky notes, markers, poster paper',
        'Device with Canva/Figma templates',
        'Feedback rubrics and user test scripts'
      ],
      procedure: [
        { step: 'Lightning talk', time: '10 min', detail: 'Review key insights and constraints from audit.' },
        { step: 'Crazy 8s', time: '15–20 min', detail: '8 sketches in 8 minutes to encourage divergent thinking.' },
        { step: 'Dot voting', time: '10 min', detail: 'Prioritize ideas using impact/effort criteria.' },
        { step: 'Storyboard', time: '30–40 min', detail: 'Map user journey for top 2 concepts; identify touchpoints.' },
        { step: 'Prototype', time: '1–2 periods', detail: 'Produce rough signage/social posts/incentive artifacts.' },
        { step: 'User tests', time: '1 period', detail: 'Run think‑aloud with 5–7 peers; record feedback quotes.' },
        { step: 'Synthesis & selection', time: '20 min', detail: 'Decide top concept(s) with rationale and next steps.' },
      ],
      formativeChecks: [
        'Idea quantity benchmark (≥ 25 per team before narrowing)',
        'Prototype captures the key message and call‑to‑action',
        'Feedback log includes quotes + observed behavior'
      ],
      successCriteria: [
        'Concept aligns with insights and constraints',
        'Prototype communicates clearly to target audience',
        'Selection rationale cites evidence from tests'
      ],
      rubric: [
        { criterion: 'Divergent thinking', levels: ['Limited', 'Developing', 'Proficient', 'Advanced'], descriptor: 'Breadth and originality of ideas' },
        { criterion: 'User focus', levels: ['Limited', 'Developing', 'Proficient', 'Advanced'], descriptor: 'Empathy and clarity of messaging' },
        { criterion: 'Iteration', levels: ['Limited', 'Developing', 'Proficient', 'Advanced'], descriptor: 'Responsiveness to feedback' },
      ],
      accommodations: [
        'Provide visual idea banks and sentence starters for pitches',
        'Allow verbal prototypes (role‑play) as alternatives',
        'Time‑boxing with timers; assign facilitator/timekeeper roles'
      ],
      udl: [
        'Representation: model examples of effective campaigns',
        'Action/Expression: choice of medium for prototypes',
        'Engagement: authentic peer/user feedback loops'
      ],
      deliverable: 'Concept Selection Brief (concepts, test results, selection rationale)'
    },
    {
      phase: 'prototype',
      title: 'Pilot Campaign Rollout',
      duration: '1–2 weeks',
      objectives: [
        'Produce campaign assets to a publishable quality',
        'Deploy in a controlled pilot and collect performance metrics',
        'Refine messaging/assets to maximize impact'
      ],
      standards: {
        NGSS: ['HS‑ETS1‑3'],
        ELA: ['W.11‑12.6', 'SL.11‑12.5']
      },
      materials: ['Print access, display stands, social channels, QR codes for quick surveys'],
      procedure: [
        { step: 'Asset production', time: '2–3 periods', detail: 'Finalize signage, videos, and announcements. Ensure accessibility (contrast, font size, alt text).'},
        { step: 'Deployment plan', time: '1 period', detail: 'Place assets strategically; schedule social posts.' },
        { step: 'Telemetry', time: 'throughout', detail: 'Pre/post counts, QR surveys, and short intercepts.' }
      ],
      formativeChecks: ['Pre‑flight checklist (readability & alt formats)', 'Peer QA before deployment'],
      successCriteria: [
        'Assets follow accessibility guidelines and brand consistency',
        'Deployment occurs as planned; telemetry operational',
        'Early metrics indicate movement in target behavior'
      ],
      rubric: [
        { criterion: 'Asset quality', levels: ['Limited','Developing','Proficient','Advanced'], descriptor: 'Clarity, aesthetics, accessibility' },
        { criterion: 'Execution', levels: ['Limited','Developing','Proficient','Advanced'], descriptor: 'On‑time, according to plan, QA complete' },
        { criterion: 'Measurement', levels: ['Limited','Developing','Proficient','Advanced'], descriptor: 'Clean, comparable metrics gathered' },
      ],
      accommodations: ['Templates with pre‑built styles; role distribution; captioning help'],
      udl: ['Provide exemplars, checklists, and flexible media choices'],
      deliverable: 'Pilot Kit (assets + deployment plan + initial metrics)'
    },
    {
      phase: 'evaluate',
      title: 'Impact Review & Leadership Presentation',
      duration: '1 week',
      objectives: [
        'Analyze pilot metrics against baseline and goals',
        'Synthesize learnings and propose iteration or scale‑up',
        'Communicate results to leadership and community stakeholders'
      ],
      standards: {
        ELA: ['SL.11‑12.4', 'W.11‑12.2'],
        C3: ['D4.3.9‑12']
      },
      materials: ['Slide/template deck, data dashboard, speaker notes guide'],
      procedure: [
        { step: 'Data analysis', time: '1–2 periods', detail: 'Compare baseline vs. pilot; compute % change and confidence.' },
        { step: 'Narrative drafting', time: '1 period', detail: 'Craft a 5‑minute story: problem → approach → impact → ask.' },
        { step: 'Presentation & feedback', time: '1 period', detail: 'Present to panel; gather action‑oriented feedback.' },
      ],
      formativeChecks: ['Draft slide review checklist; coach run‑through'],
      successCriteria: ['Accurate analysis; clear story; concrete next steps'],
      rubric: [
        { criterion: 'Analysis accuracy', levels: ['Limited','Developing','Proficient','Advanced'], descriptor: 'Correct computations and fair interpretation' },
        { criterion: 'Story quality', levels: ['Limited','Developing','Proficient','Advanced'], descriptor: 'Compelling, coherent, audience‑aware' },
        { criterion: 'Call to action', levels: ['Limited','Developing','Proficient','Advanced'], descriptor: 'Feasible next steps with owners/timelines' }
      ],
      accommodations: ['Provide script scaffolds; allow recorded presentations; small‑group delivery'],
      udl: ['Multiple options to present; scaffolded speaker notes'],
      deliverable: 'Impact Report & Leadership Deck'
    }
  ];

  const alignment = {
    NGSS: [
      { code: 'HS‑ESS3‑4', text: 'Evaluate or refine a technological solution that reduces impacts of human activities on natural systems.' },
      { code: 'HS‑ETS1‑1', text: 'Analyze a major global challenge to specify qualitative and quantitative criteria and constraints for solutions.' },
      { code: 'HS‑ETS1‑2', text: 'Design a solution by breaking down a complex problem into smaller, manageable problems.' },
      { code: 'HS‑ETS1‑3', text: 'Evaluate a solution to a complex problem based on prioritized criteria and trade‑offs.' }
    ],
    ELA: [
      { code: 'W.11‑12.7', text: 'Conduct sustained research projects to answer a question or solve a problem.' },
      { code: 'SL.11‑12.4', text: 'Present information, findings, and evidence clearly and logically.' }
    ],
    C3: [
      { code: 'D4.2.9‑12', text: 'Construct explanations and design solutions using reasoning, correct sequence, examples and details.' },
      { code: 'D4.3.9‑12', text: 'Present adaptations of arguments and explanations for a range of audiences.' }
    ],
    ISTE: [
      { code: '1.4', text: 'Innovative Designer' },
      { code: '1.6', text: 'Creative Communicator' }
    ]
  };

  return {
    id,
    userId,
    createdAt: ts(),
    updatedAt: ts(),
    wizardData,
    ideation,
    journey,
    deliverables,
    assignments,
    alignment,
    sample: true,
  };
}
