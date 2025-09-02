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
  const now = Date.now();
  const out: SampleBlueprint[] = [];
  (Object.keys(catalog) as Array<keyof typeof catalog>).forEach((grade) => {
    catalog[grade].forEach((item, idx) => {
      const id = `sample-${grade}-${now}-${idx}`;
      out.push(buildBlueprintFromCatalog(id, userId, grade, item));
    });
  });
  return out;
}

