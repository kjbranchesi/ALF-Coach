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
    specialRequirements: '',
    specialConsiderations: '',
    pblExperience: 'some',
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

export function getAllSampleBlueprints(userId: string = 'anonymous'): SampleBlueprint[] {
  const now = Date.now();
  const mk = (offset: number, data: Partial<SampleBlueprint>): SampleBlueprint => ({
    id: `sample-${now + offset}`,
    userId,
    createdAt: ts(),
    updatedAt: ts(),
    wizardData: {},
    sample: true,
    ...data,
  } as SampleBlueprint);

  return [
    // Early Elementary
    mk(1, {
      wizardData: {
        projectTopic: 'Community Helpers and Neighbourhood Maps',
        learningGoals: 'Speaking and listening, simple mapping, community awareness',
        entryPoint: 'learning_goal',
        subjects: ['social-studies', 'language-arts', 'arts'],
        primarySubject: 'social-studies',
        gradeLevel: 'early-elementary',
        duration: 'short',
        materials: 'Paper, crayons, stickers, classroom map',
      },
      ideation: {
        bigIdea: 'Communities and roles',
        essentialQuestion: 'Who helps our community and how?',
        challenge: 'Create a “thank you” map poster showing where helpers work',
      },
      journey: {
        analyze: { goal: 'Identify helpers', activity: 'Picture walk, show & tell', output: 'Class list', duration: '1 lesson' },
        brainstorm: { goal: 'Think of places', activity: 'Map walk around school', output: 'Sticker map', duration: '1 lesson' },
        prototype: { goal: 'Design poster', activity: 'Draw, label, decorate', output: 'Poster draft', duration: '1–2 lessons' },
        evaluate: { goal: 'Share & reflect', activity: 'Mini gallery walk', output: 'Reflection sentence', duration: '1 lesson' },
      },
      deliverables: {
        milestones: ['Class list of helpers', 'Sticker map', 'Poster draft'],
        rubric: { criteria: ['Participation', 'Clarity', 'Care'] },
        impact: { audience: 'Families or school staff', method: 'Poster share' },
      },
    }),

    // Elementary
    mk(2, {
      wizardData: {
        projectTopic: 'School Recycling and Waste Reduction',
        learningGoals: 'Data literacy, persuasive writing, environmental stewardship',
        entryPoint: 'learning_goal',
        subjects: ['science', 'language-arts', 'mathematics'],
        primarySubject: 'science',
        gradeLevel: 'elementary',
        duration: 'medium',
        materials: 'Scales, tally sheets, poster materials',
      },
      ideation: {
        bigIdea: 'Sustainability',
        essentialQuestion: 'How can our school reduce waste?',
        challenge: 'Propose and pilot a simple recycling improvement',
      },
      journey: {
        analyze: { goal: 'Measure current waste', activity: 'Weigh bins, tally types', output: 'Data table', duration: '2 lessons' },
        brainstorm: { goal: 'Generate ideas', activity: 'Think-pair-share + vote', output: 'Idea shortlist', duration: '1 lesson' },
        prototype: { goal: 'Create campaign', activity: 'Make posters or announcements', output: 'Campaign assets', duration: '2–3 lessons' },
        evaluate: { goal: 'Check impact', activity: 'Re-measure & compare', output: 'Before/after chart', duration: '1 lesson' },
      },
      deliverables: {
        milestones: ['Baseline data', 'Idea shortlist', 'Campaign launch'],
        rubric: { criteria: ['Understanding', 'Teamwork', 'Communication'] },
        impact: { audience: 'School community', method: 'Poster/PA campaign' },
      },
    }),

    // Middle Years
    mk(3, makeSampleBlueprint('tmp', userId)), // reuse the urban green spaces sample structure

    // Secondary
    mk(4, {
      wizardData: {
        projectTopic: 'Local Water Quality and Policy',
        learningGoals: 'Scientific investigation, argumentation, civic literacy',
        entryPoint: 'learning_goal',
        subjects: ['science', 'social-studies'],
        primarySubject: 'science',
        gradeLevel: 'secondary',
        duration: 'long',
        materials: 'Water test kits, lab notebooks, access to public records',
      },
      ideation: {
        bigIdea: 'Human impact on ecosystems',
        essentialQuestion: 'How healthy are our waterways and what should we do?',
        challenge: 'Present a data-backed recommendation to a stakeholder',
      },
      journey: {
        analyze: { goal: 'Collect & analyze water samples', activity: 'Field work + lab analysis', output: 'Data report', duration: '1–2 weeks' },
        brainstorm: { goal: 'Interpret data implications', activity: 'Roundtable discussion', output: 'Position outline', duration: '2 lessons' },
        prototype: { goal: 'Draft recommendation', activity: 'Write policy brief', output: 'Draft brief', duration: '1 week' },
        evaluate: { goal: 'Get feedback', activity: 'Peer/stakeholder review', output: 'Final brief', duration: '2–3 lessons' },
      },
      deliverables: {
        milestones: ['Data report', 'Position outline', 'Draft brief'],
        rubric: { criteria: ['Scientific accuracy', 'Reasoning', 'Communication'] },
        impact: { audience: 'Community stakeholders', method: 'Briefing or submission' },
      },
    }),

    // Upper Secondary
    mk(5, {
      wizardData: {
        projectTopic: 'Data Journalism: Inequality in our City',
        learningGoals: 'Data analysis, storytelling, ethical reporting',
        entryPoint: 'learning_goal',
        subjects: ['mathematics', 'language-arts', 'social-studies'],
        primarySubject: 'mathematics',
        gradeLevel: 'upper-secondary',
        duration: 'long',
        materials: 'Public datasets, spreadsheets, visualization tools',
      },
      ideation: {
        bigIdea: 'Data as evidence',
        essentialQuestion: 'How do numbers reveal and conceal stories?',
        challenge: 'Publish a short data story to inform our community',
      },
      journey: {
        analyze: { goal: 'Source & clean data', activity: 'Dataset selection + cleaning', output: 'Clean dataset', duration: '1 week' },
        brainstorm: { goal: 'Find an angle', activity: 'Insight hunt + storyboard', output: 'Story outline', duration: '3 lessons' },
        prototype: { goal: 'Build the story', activity: 'Charts + draft article', output: 'Draft story', duration: '1 week' },
        evaluate: { goal: 'Refine for clarity', activity: 'Peer edit + mentor feedback', output: 'Final story', duration: '1 week' },
      },
      deliverables: {
        milestones: ['Clean dataset', 'Storyboard', 'Draft story'],
        rubric: { criteria: ['Accuracy', 'Clarity', 'Ethics'] },
        impact: { audience: 'Peers/public', method: 'Blog or school publication' },
      },
    }),

    // Higher Education
    mk(6, {
      wizardData: {
        projectTopic: 'Assistive Tech Prototype for Campus Accessibility',
        learningGoals: 'UX research, prototyping, stakeholder engagement',
        entryPoint: 'learning_goal',
        subjects: ['engineering', 'technology', 'social-studies'],
        primarySubject: 'engineering',
        gradeLevel: 'higher-ed',
        duration: 'long',
        materials: 'Prototyping tools, user interview access',
      },
      ideation: {
        bigIdea: 'Design for accessibility',
        essentialQuestion: 'How can we reduce barriers on campus?',
        challenge: 'Prototype a solution and test with users',
      },
      journey: {
        analyze: { goal: 'Understand users', activity: 'Interviews + empathy maps', output: 'Insights deck', duration: '1 week' },
        brainstorm: { goal: 'Sketch solutions', activity: 'Crazy 8s + vote', output: 'Concept board', duration: '2 lessons' },
        prototype: { goal: 'Build prototype', activity: 'Low/hi-fi prototyping', output: 'Usable prototype', duration: '2–3 weeks' },
        evaluate: { goal: 'Test & iterate', activity: 'Usability tests', output: 'Iteration plan', duration: '1 week' },
      },
      deliverables: {
        milestones: ['Insights deck', 'Concept board', 'Prototype'],
        rubric: { criteria: ['Empathy', 'Functionality', 'Impact'] },
        impact: { audience: 'Students/staff', method: 'Demo & feedback' },
      },
    }),

    // Adult/Professional
    mk(7, {
      wizardData: {
        projectTopic: 'Community Health Campaign: Wellness at Work',
        learningGoals: 'Health literacy, campaign design, behavior change',
        entryPoint: 'learning_goal',
        subjects: ['health', 'language-arts', 'technology'],
        primarySubject: 'health',
        gradeLevel: 'adult',
        duration: 'medium',
        materials: 'Survey tools, design software, communication channels',
      },
      ideation: {
        bigIdea: 'Preventive health',
        essentialQuestion: 'How can we promote wellness at work?',
        challenge: 'Design and launch a micro‑campaign for one behavior',
      },
      journey: {
        analyze: { goal: 'Identify needs', activity: 'Survey + interviews', output: 'Needs summary', duration: '1 week' },
        brainstorm: { goal: 'Plan content', activity: 'Audience + message matrix', output: 'Campaign plan', duration: '2 lessons' },
        prototype: { goal: 'Create assets', activity: 'Design & schedule posts', output: 'Campaign assets', duration: '1 week' },
        evaluate: { goal: 'Measure reach', activity: 'Analytics + reflection', output: 'Impact report', duration: '1 week' },
      },
      deliverables: {
        milestones: ['Needs summary', 'Campaign plan', 'Assets'],
        rubric: { criteria: ['Relevance', 'Clarity', 'Reach'] },
        impact: { audience: 'Workplace peers', method: 'Digital/print rollout' },
      },
    }),

    // Upper Elementary - Sustainable Food Systems
    mk(8, {
      wizardData: {
        projectTopic: 'Sustainable Food Systems: From Farm to Lunch Tray',
        learningGoals: 'Research, systems thinking, persuasive communication',
        entryPoint: 'learning_goal',
        subjects: ['science', 'social-studies', 'language-arts'],
        primarySubject: 'science',
        gradeLevel: 'elementary',
        duration: 'medium',
        materials: 'Local food data, interviews, poster materials',
      },
      ideation: {
        bigIdea: 'Systems and sustainability',
        essentialQuestion: 'How can our school cafeteria make more sustainable choices?',
        challenge: 'Create a proposal to improve one aspect of our cafeteria food sourcing or waste'
      },
      journey: {
        analyze: { goal: 'Understand our current system', activity: 'Map food journey + interview staff', output: 'System map', duration: '2 lessons' },
        brainstorm: { goal: 'Identify opportunity areas', activity: 'Idea matrix + quick research', output: 'Opportunity shortlist', duration: '2 lessons' },
        prototype: { goal: 'Develop solution', activity: 'Draft proposal + visuals', output: 'Proposal poster', duration: '3 lessons' },
        evaluate: { goal: 'Gather feedback', activity: 'Share with stakeholders', output: 'Refined proposal', duration: '1–2 lessons' },
      },
      deliverables: {
        milestones: ['System map', 'Opportunity shortlist', 'Proposal poster'],
        rubric: {
          criteria: [
            { criterion: 'Understanding', description: 'Explains cafeteria system and impacts', weight: 30 },
            { criterion: 'Reasoning', description: 'Uses evidence to justify proposal', weight: 30 },
            { criterion: 'Communication', description: 'Clear and engaging presentation', weight: 20 },
            { criterion: 'Feasibility', description: 'Plan is realistic and focused', weight: 20 },
          ]
        },
        impact: { audience: 'Cafeteria staff/admin', method: 'Briefing + poster display' },
      },
    }),

    // Middle - Local History and Storytelling
    mk(9, {
      wizardData: {
        projectTopic: 'Local History: Community Storytelling',
        learningGoals: 'Primary source analysis, narrative writing, media production',
        entryPoint: 'learning_goal',
        subjects: ['social-studies', 'language-arts', 'arts'],
        primarySubject: 'social-studies',
        gradeLevel: 'middle',
        duration: 'medium',
        materials: 'Oral history guides, audio/video devices',
      },
      ideation: {
        bigIdea: 'Identity and place',
        essentialQuestion: 'Whose stories make our community what it is?',
        challenge: 'Produce an oral history piece that preserves a meaningful local story'
      },
      journey: {
        analyze: { goal: 'Plan and research', activity: 'Learn oral history methods + choose interviewee', output: 'Interview plan', duration: '2 lessons' },
        brainstorm: { goal: 'Develop questions', activity: 'Question workshop + practice interview', output: 'Question set', duration: '2 lessons' },
        prototype: { goal: 'Record and edit', activity: 'Conduct interview + edit audio', output: 'Edited segment', duration: '1–2 weeks' },
        evaluate: { goal: 'Reflect and refine', activity: 'Peer review + consent/attribution check', output: 'Final story + credits', duration: '2 lessons' },
      },
      deliverables: {
        milestones: ['Interview plan', 'Question set', 'Edited segment'],
        rubric: {
          criteria: [
            { criterion: 'Historical Thinking', description: 'Uses context and multiple perspectives', weight: 25 },
            { criterion: 'Ethics', description: 'Consent, accuracy, respectful representation', weight: 25 },
            { criterion: 'Craft', description: 'Audio clarity and narrative structure', weight: 25 },
            { criterion: 'Reflection', description: 'Thoughtful reflection on process and impact', weight: 25 },
          ]
        },
        impact: { audience: 'Community via school site', method: 'Podcast or audio gallery' },
      },
    }),

    // Secondary - Civic Media Literacy
    mk(10, {
      wizardData: {
        projectTopic: 'Civic Media Literacy: Claims and Evidence',
        learningGoals: 'Critical thinking, argumentation, data literacy',
        entryPoint: 'learning_goal',
        subjects: ['language-arts', 'social-studies', 'mathematics'],
        primarySubject: 'language-arts',
        gradeLevel: 'upper-secondary',
        duration: 'medium',
        materials: 'News sources, fact-checking tools, spreadsheets',
      },
      ideation: {
        bigIdea: 'Truth and evidence',
        essentialQuestion: 'How can we tell if a public claim is trustworthy?',
        challenge: 'Publish a fact-check brief with clear rating and justification'
      },
      journey: {
        analyze: { goal: 'Select and parse a claim', activity: 'Identify claim + extract testable statements', output: 'Claim deconstruction', duration: '2 lessons' },
        brainstorm: { goal: 'Plan the verification', activity: 'Source hunt + method plan', output: 'Verification plan', duration: '2 lessons' },
        prototype: { goal: 'Run the checks', activity: 'Collect data, compute stats, write draft', output: 'Draft brief', duration: '1 week' },
        evaluate: { goal: 'Editorial review', activity: 'Peer edit + standards rubric', output: 'Final brief with rating', duration: '2 lessons' },
      },
      deliverables: {
        milestones: ['Claim deconstruction', 'Verification plan', 'Draft brief'],
        rubric: {
          criteria: [
            { criterion: 'Accuracy', description: 'Evidence selection and correctness', weight: 30 },
            { criterion: 'Reasoning', description: 'Logical coherence, counters addressed', weight: 30 },
            { criterion: 'Communication', description: 'Clear rating and justification', weight: 20 },
            { criterion: 'Integrity', description: 'Transparency, citations, neutrality', weight: 20 },
          ]
        },
        impact: { audience: 'Peers/public', method: 'Class fact-check site or zine' },
      },
    }),

    // Early Elementary - Habitats and Care
    mk(11, {
      wizardData: {
        projectTopic: 'Animal Habitats and Care',
        learningGoals: 'Observation, sorting, speaking and listening',
        entryPoint: 'learning_goal',
        subjects: ['science', 'language-arts', 'arts'],
        primarySubject: 'science',
        gradeLevel: 'early-elementary',
        duration: 'short',
        materials: 'Picture books, art supplies, habitat images',
      },
      ideation: {
        bigIdea: 'Living things have needs',
        essentialQuestion: 'What makes a good home for animals?',
        challenge: 'Create a habitat diorama that meets an animal’s needs'
      },
      journey: {
        analyze: { goal: 'Explore needs', activity: 'Read-aloud + observe pictures', output: 'Needs chart', duration: '1 lesson' },
        brainstorm: { goal: 'Choose an animal', activity: 'Gallery walk + vote', output: 'Choice slip', duration: '1 lesson' },
        prototype: { goal: 'Build a habitat', activity: 'Make diorama', output: 'Diorama', duration: '2 lessons' },
        evaluate: { goal: 'Share and reflect', activity: 'Show & tell + class feedback', output: 'Reflection sentence', duration: '1 lesson' },
      },
      deliverables: {
        milestones: ['Needs chart', 'Choice slip', 'Diorama'],
        rubric: {
          criteria: [
            { criterion: 'Participation', description: 'Shares ideas and listens to others', weight: 35 },
            { criterion: 'Care', description: 'Craftsmanship and neatness', weight: 35 },
            { criterion: 'Understanding', description: 'Includes shelter, food, water needs', weight: 30 },
          ]
        },
        impact: { audience: 'Families', method: 'Class showcase' },
      },
    }),

    // Higher Ed - Social Impact Data Visualization
    mk(12, {
      wizardData: {
        projectTopic: 'Social Impact Data Visualization',
        learningGoals: 'Data ethics, visualization design, stakeholder communication',
        entryPoint: 'learning_goal',
        subjects: ['mathematics', 'technology', 'social-studies'],
        primarySubject: 'technology',
        gradeLevel: 'higher-ed',
        duration: 'long',
        materials: 'Data viz library, stakeholder interview access',
      },
      ideation: {
        bigIdea: 'Design communicates values',
        essentialQuestion: 'How can we visualize data to drive ethical action?',
        challenge: 'Build a stakeholder-ready dashboard for a nonprofit partner'
      },
      journey: {
        analyze: { goal: 'Define decision needs', activity: 'Stakeholder interviews + task flows', output: 'Decision brief', duration: '1 week' },
        brainstorm: { goal: 'Sketch visuals', activity: 'Low-fi sketches + critique', output: 'Viz storyboard', duration: '1 week' },
        prototype: { goal: 'Implement dashboard', activity: 'Build interactive views', output: 'Working prototype', duration: '2–3 weeks' },
        evaluate: { goal: 'User test + iterate', activity: 'Usability tests + revisions', output: 'Final dashboard + notes', duration: '1 week' },
      },
      deliverables: {
        milestones: ['Decision brief', 'Viz storyboard', 'Working prototype'],
        rubric: {
          criteria: [
            { criterion: 'Usefulness', description: 'Supports stakeholder decisions', weight: 30 },
            { criterion: 'Clarity', description: 'Legible, accessible visual encodings', weight: 25 },
            { criterion: 'Integrity', description: 'Ethical choices, appropriate uncertainty', weight: 25 },
            { criterion: 'Polish', description: 'Stability, performance, responsiveness', weight: 20 },
          ]
        },
        impact: { audience: 'Nonprofit partner', method: 'Live demo + handoff docs' },
      },
    }),
  ];
}
