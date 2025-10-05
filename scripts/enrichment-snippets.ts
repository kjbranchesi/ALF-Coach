// Canonical snippets used during enrichment passes.
// Source: ENRICHMENT_QUICK_REFERENCE.md and CURRICULUM_ENRICHMENT_GUIDE.md

export const outcomeTemplates = {
  analysis: 'Analyze [subject] using [evidence types] to [identify/classify/compare] [patterns/relationships]',
  design: 'Design [solution/intervention] that [addresses constraint] while [balancing competing factors]',
  communication: 'Communicate [findings/recommendations] to [specific stakeholders] through [medium] that [persuades/informs/activates]'
};

export const studentVoiceStarters = [
  'I can explain [concept] using [evidence/examples]',
  'I can justify [choice] with [type of evidence]',
  'I can compare [options] based on [factors]',
  'I can calculate [metric] accurately using [method]',
  'I can operate [tool] safely following [protocol]',
  'I can present [information] clearly to [audience]'
];

export const aiOptionalTemplates = {
  research: {
    toolUse: 'Summarize research articles in student language',
    critique: 'Check summary preserves key nuances and caveats',
    noAIAlt: 'Use peer annotation and discussion protocol'
  },
  viz: {
    toolUse: 'Suggest chart types based on dataset',
    critique: 'Verify chart avoids misleading scales or labels',
    noAIAlt: 'Use spreadsheet template gallery for options'
  },
  writing: {
    toolUse: 'Draft outline from brainstorm notes',
    critique: 'Ensure outline matches your actual priorities',
    noAIAlt: 'Use graphic organizer template with partner'
  },
  ideation: {
    toolUse: 'Generate three design concept variations',
    critique: 'Assess concepts against user needs and constraints',
    noAIAlt: 'Sketch three concepts and peer critique'
  },
  feedback: {
    toolUse: 'Identify clarity gaps in draft',
    critique: 'Confirm suggestions align with audience needs',
    noAIAlt: 'Use peer review protocol and checklist'
  }
};

export const checkpointStarters = [
  'Teacher validates first dataset before analysis begins',
  'Peer panel approves prototype safety plan',
  'Partner confirms interview protocol meets needs',
  'Teams demonstrate [skill] successfully in practice run',
  'Stakeholders endorse action recommendations',
  'Teacher signs off on fieldwork readiness'
];

export const teacherBulletVerbs = [
  'Model', 'Demonstrate', 'Facilitate', 'Coach', 'Guide', 'Lead', 'Host', 'Coordinate', 'Arrange', 'Schedule', 'Provide', 'Share', 'Review', 'Check', 'Shadow'
];

export const teacherBulletTemplates = [
  'Model [specific skill] using [example/protocol]',
  'Facilitate [session type] with [structure]',
  'Coordinate [logistics] with [stakeholder]',
  'Provide [resource/template] for [purpose]',
  'Review [student work] for [criterion]'
];

export const studentBulletVerbs = [
  'Collect','Measure','Record','Document','Analyze','Calculate','Visualize','Compare','Identify','Draft','Design','Prototype','Build','Present','Publish','Report','Explain','Upload','Test','Interview'
];

export const studentBulletTemplates = [
  '[Data verb] [specific data] using [tool/method]',
  '[Analysis verb] [data] to [identify/understand] [pattern]',
  '[Creation verb] [artifact] following [standard/template]',
  '[Communication verb] [content] to [audience] via [medium]',
  'Upload [artifact] to [platform/location]'
];

export const microRubricDimensions = {
  content: [
    'Evidence is accurate, cited, and sufficient',
    'Technical concepts are applied correctly',
    'Data analysis reveals meaningful patterns'
  ],
  process: [
    'Methods follow safety and ethical protocols',
    'Iteration improves quality systematically',
    'Data collection is rigorous and documented'
  ],
  communication: [
    'Message is clear and audience-appropriate',
    'Visuals enhance understanding effectively',
    'Presentation engages and stays within time'
  ],
  impact: [
    'Solution addresses authentic community need',
    'Stakeholder voices guide design decisions',
    'Recommendations balance multiple constraints'
  ]
};

export const noTechFallbackIdeas = {
  data: ['Paper tally sheets', 'Hand-drawn graphs', 'Manual maps on grid paper'],
  prototyping: ['Cardboard models', 'Paper mockups', 'Craft materials for low-fi builds'],
  comms: ['Poster boards', 'Printed brief templates', 'Live talks with printed notes']
};

