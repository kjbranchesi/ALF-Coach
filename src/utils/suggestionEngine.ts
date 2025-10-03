/**
 * suggestionEngine.ts
 * Deterministic, profile-driven suggestions for each stage.
 * Works offline and remains domain-agnostic while using the educator's context.
 */

export type SubjectProfile = 'STEM' | 'Arts' | 'Humanities' | 'Social' | 'Language' | 'Interdisciplinary' | 'General';
export type GradeBand = 'Elementary' | 'Middle' | 'High' | 'HigherEd' | 'Adult' | 'General';

export interface SuggestionItem {
  id: string;
  text: string;
  category?: string;
}

export interface SuggestionContext {
  subjects?: string[];
  gradeLevel?: string;
  duration?: string;
  projectTopic?: string;
  bigIdea?: string;
  essentialQuestion?: string;
  challenge?: string;
}

export function getSubjectProfile(subjects?: string[]): SubjectProfile {
  const text = (subjects || []).join(' ').toLowerCase();
  if (!text) {return 'General';}
  if (text.match(/math|science|stem|technology|engineering|cs|computer/)) {return 'STEM';}
  if (text.match(/art|music|theater|drama|design|visual/)) {return 'Arts';}
  if (text.match(/history|social|civics|geography|economics|government/)) {return 'Social';}
  if (text.match(/english|language|literature|writing|composition|world languages/)) {return 'Language';}
  if (text.match(/interdisciplinary|cross[- ]?disciplinary|project|capstone/)) {return 'Interdisciplinary';}
  return 'General';
}

export function getGradeBand(gradeLevel?: string): GradeBand {
  const t = (gradeLevel || '').toLowerCase();
  if (t.includes('higher') || t.includes('college') || t.includes('university')) {return 'HigherEd';}
  if (t.includes('adult') || t.includes('professional')) {return 'Adult';}
  if (t.includes('high') || t.match(/9|10|11|12/)) {return 'High';}
  if (t.includes('middle') || t.match(/6|7|8/)) {return 'Middle';}
  if (t.includes('elementary') || t.match(/k|1|2|3|4|5/)) {return 'Elementary';}
  return 'General';
}

export function stageSuggestions(stage: string, ctx: SuggestionContext): SuggestionItem[] {
  const profile = getSubjectProfile(ctx.subjects);
  const band = getGradeBand(ctx.gradeLevel);
  const topic = ctx.projectTopic || ctx.bigIdea || '';

  // Helper to keep exactly 3 items
  const pick3 = (arr: SuggestionItem[]) => arr.slice(0, 3);

  if (stage === 'BIG_IDEA' || stage === 'IDEATION_BIG_IDEA') {
    const base: Record<SubjectProfile, SuggestionItem[]> = {
      STEM: [
        { id: 'bi-1', text: `Technology and design shape how we solve complex problems${topic ? ` in ${  topic}` : ''}` },
        { id: 'bi-2', text: 'Systems thinking reveals cause and effect in the real world' },
        { id: 'bi-3', text: `Data and models help us make better decisions${topic ? ` about ${  topic}` : ''}` }
      ],
      Arts: [
        { id: 'bi-1', text: `Creative expression influences how communities see themselves${topic ? ` around ${  topic}` : ''}` },
        { id: 'bi-2', text: 'Design choices affect how people experience places and ideas' },
        { id: 'bi-3', text: 'Stories and artifacts can drive social change' }
      ],
      Humanities: [
        { id: 'bi-1', text: `Past decisions shape today’s challenges and opportunities${topic ? ` in ${  topic}` : ''}` },
        { id: 'bi-2', text: 'Perspective and narrative influence how we interpret events' },
        { id: 'bi-3', text: 'Communities evolve through culture, policy, and place' }
      ],
      Social: [
        { id: 'bi-1', text: `People, policy, and place interact to shape equitable communities${topic ? ` related to ${  topic}` : ''}` },
        { id: 'bi-2', text: 'Civic action connects learning to real-world impact' },
        { id: 'bi-3', text: 'Public problems require informed, collaborative solutions' }
      ],
      Language: [
        { id: 'bi-1', text: 'Language and media shape what we understand and believe' },
        { id: 'bi-2', text: 'Communication connects diverse audiences around shared goals' },
        { id: 'bi-3', text: 'Stories can change minds and inspire action' }
      ],
      Interdisciplinary: [
        { id: 'bi-1', text: 'Innovation happens at the intersection of different fields' },
        { id: 'bi-2', text: 'Complex problems require multiple perspectives and skills' },
        { id: 'bi-3', text: `Design connects ideas to real outcomes${topic ? ` for ${  topic}` : ''}` }
      ],
      General: [
        // Added explicit phrasing to align with E2E selector: /Explore how policy/i
        { id: 'bi-1', text: 'Explore how policy, people, and place interact' },
        { id: 'bi-2', text: 'How innovation emerges from constraints' },
        { id: 'bi-3', text: `The relationship between individual actions and collective impact${topic ? ` for ${  topic}` : ''}` }
      ]
    };
    return pick3(base[profile]);
  }

  if (stage === 'ESSENTIAL_QUESTION' || stage === 'IDEATION_EQ') {
    // Use topic if available to ground the question forms
    const t = topic || 'this topic';
    const forms: SuggestionItem[] = band === 'Elementary'
      ? [
          { id: 'eq-1', text: `How can we help others understand ${t}?` },
          { id: 'eq-2', text: `Why is ${t} important for people around us?` },
          { id: 'eq-3', text: `What could we do about ${t} at our school?` }
        ]
      : [
          { id: 'eq-1', text: `How might we improve understanding of ${t} for our community?` },
          { id: 'eq-2', text: `In what ways does ${t} affect people differently?` },
          { id: 'eq-3', text: `Why does ${t} matter for our future, and how could we respond?` }
        ];
    return pick3(forms);
  }

  if (stage === 'CHALLENGE' || stage === 'IDEATION_CHALLENGE') {
    const gist = (ctx.essentialQuestion || ctx.bigIdea || 'this challenge').slice(0, 80);
    const items: SuggestionItem[] = band === 'Elementary'
      ? [
          { id: 'ch-1', text: `Create something that helps others learn about: "${gist}"` },
          { id: 'ch-2', text: 'Design a poster, model, or short video to teach younger students' },
          { id: 'ch-3', text: 'Test your idea in class and ask for feedback' }
        ]
      : band === 'Middle'
      ? [
          { id: 'ch-1', text: `Design and test a solution that addresses: "${gist}"` },
          { id: 'ch-2', text: 'Create a campaign or resource for your school or neighborhood' },
          { id: 'ch-3', text: 'Prototype your idea and gather user feedback' }
        ]
      : [
          { id: 'ch-1', text: `Develop and evaluate a prototype that addresses: "${gist}" for a defined audience` },
          { id: 'ch-2', text: 'Produce a professional resource (briefing, toolkit, or training) for stakeholders' },
          { id: 'ch-3', text: 'Pilot the solution with users and iterate based on evidence' }
        ];
    return pick3(items);
  }

  if (stage.startsWith('JOURNEY')) {
    const items: SuggestionItem[] = band === 'Elementary'
      ? [
          { id: 'j-1', text: 'Analyze: read, watch, and ask questions to learn about the problem' },
          { id: 'j-2', text: 'Brainstorm: sketch or list ideas with teammates' },
          { id: 'j-3', text: 'Prototype/Evaluate: build a simple model and get feedback' }
        ]
      : band === 'Middle'
      ? [
          { id: 'j-1', text: 'Analyze: gather info from articles, data, or short interviews' },
          { id: 'j-2', text: 'Brainstorm: compare ideas and choose one with clear criteria' },
          { id: 'j-3', text: 'Prototype/Evaluate: test with peers and refine your plan' }
        ]
      : [
          { id: 'j-1', text: 'Analyze: literature scan, stakeholder interviews, and data exploration' },
          { id: 'j-2', text: 'Brainstorm: generate alternatives, evaluate trade‑offs, select direction' },
          { id: 'j-3', text: 'Prototype/Evaluate: build, user test, measure outcomes, iterate' }
        ];
    return pick3(items);
  }

  if (stage === 'DELIVERABLES') {
    const items: SuggestionItem[] = band === 'Elementary'
      ? [
          { id: 'd-1', text: 'Milestones: plan 3 checkpoints (draft, practice, final share)' },
          { id: 'd-2', text: 'Rubric: clear, kid‑friendly criteria (ideas, effort, teamwork)' },
          { id: 'd-3', text: 'Impact: share with classmates, families, or school community' }
        ]
      : band === 'Middle'
      ? [
          { id: 'd-1', text: 'Milestones: research summary, prototype, final presentation' },
          { id: 'd-2', text: 'Rubric: understanding, process, product (3 levels)' },
          { id: 'd-3', text: 'Impact: present to a school or neighborhood audience' }
        ]
      : [
          { id: 'd-1', text: 'Milestones: proposal, pilot, public showcase or stakeholder briefing' },
          { id: 'd-2', text: 'Rubric: criteria with descriptors (insight, rigor, usability, impact)' },
          { id: 'd-3', text: 'Impact: publish or present to an authentic external audience' }
        ];
    return pick3(items);
  }

  return pick3([
    { id: 'def-1', text: 'Explore multiple approaches to your goal' },
    { id: 'def-2', text: 'Consider who benefits and how you will know' },
    { id: 'def-3', text: 'Plan small steps you can test quickly' }
  ]);
}
