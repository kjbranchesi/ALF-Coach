// src/utils/BranchingStrategies.js
// Advanced branching strategies for different educational contexts

export class BranchingStrategies {
  constructor(projectContext) {
    this.context = projectContext;
    this.strategies = this.initializeStrategies();
  }

  initializeStrategies() {
    return {
      // Subject-specific strategies
      stem: {
        bigIdea: {
          prompts: [
            "What if we explored real-world applications of {topic}?",
            "What if we connected {topic} to current technology trends?",
            "What if we investigated {topic} through hands-on experiments?"
          ],
          examples: [
            "Renewable Energy Innovation",
            "Data Science for Social Good", 
            "Biomimicry in Engineering Design"
          ]
        }
      },
      
      humanities: {
        bigIdea: {
          prompts: [
            "What if we examined {topic} through multiple cultural lenses?",
            "What if we connected {topic} to contemporary social issues?",
            "What if we explored {topic} through creative expression?"
          ],
          examples: [
            "Identity and Cultural Heritage",
            "Social Justice Through Literature",
            "Historical Patterns in Modern Society"
          ]
        }
      },

      arts: {
        bigIdea: {
          prompts: [
            "What if we used {topic} to tell community stories?",
            "What if we blended traditional and digital techniques?",
            "What if we created art that sparks social change?"
          ],
          examples: [
            "Art as Community Voice",
            "Digital Storytelling Across Cultures",
            "Creative Expression for Social Impact"
          ]
        }
      },

      // Age-specific strategies
      elementary: {
        coaching: {
          tooAbstract: "Let's make this more concrete. What would students actually see, touch, or do?",
          tooComplex: "This might be too advanced. How can we simplify while keeping it engaging?",
          perfect: "Great! This is perfect for young learners - hands-on and relatable!"
        },
        challenges: [
          "Create a classroom museum exhibit",
          "Design a solution for a school problem",
          "Build a model to teach others"
        ]
      },

      middle: {
        coaching: {
          needsRelevance: "Middle schoolers need to see why this matters to them. How does it connect to their world?",
          needsChoice: "Can we add student choice here? Middle schoolers thrive with some autonomy.",
          needsCollaboration: "How can we make this more collaborative? Peer interaction is crucial at this age."
        },
        challenges: [
          "Develop a campaign to address a community issue",
          "Create a digital portfolio showcasing learning",
          "Design and test a solution prototype"
        ]
      },

      high: {
        coaching: {
          needsDepth: "High schoolers can handle more complexity. How can we deepen the inquiry?",
          needsAuthenticity: "Let's connect this to real careers or college readiness.",
          needsImpact: "How can their work make a genuine difference beyond the classroom?"
        },
        challenges: [
          "Conduct original research and present findings",
          "Partner with local organizations on real projects",
          "Create professional-quality deliverables"
        ]
      },

      college: {
        coaching: {
          needsTheory: "At this level, we can explore theoretical frameworks. Which lens applies here?",
          needsResearch: "What existing research could students build upon or challenge?",
          needsProfessional: "How does this prepare them for their field?"
        },
        challenges: [
          "Develop a professional consulting project",
          "Create peer-reviewed quality research",
          "Design innovative solutions to complex problems"
        ]
      }
    };
  }

  // Get strategy based on current context
  getStrategy(step, intent) {
    const ageKey = this.getAgeKey();
    const subjectKey = this.getSubjectKey();
    
    // Combine age and subject strategies
    const ageStrategy = this.strategies[ageKey];
    const subjectStrategy = this.strategies[subjectKey];
    
    return {
      age: ageStrategy,
      subject: subjectStrategy,
      combined: this.combineStrategies(ageStrategy, subjectStrategy, step, intent)
    };
  }

  getAgeKey() {
    const stage = this.context.pedagogical?.developmentalStage || '';
    if (stage.includes('Elementary')) {return 'elementary';}
    if (stage.includes('Middle')) {return 'middle';}
    if (stage.includes('High')) {return 'high';}
    if (stage.includes('Adult') || stage.includes('Higher')) {return 'college';}
    return 'middle'; // default
  }

  getSubjectKey() {
    const subject = this.context.subject?.toLowerCase() || '';
    if (subject.match(/science|technology|engineering|math|stem/)) {return 'stem';}
    if (subject.match(/history|english|literature|social|language/)) {return 'humanities';}
    if (subject.match(/art|music|theater|dance|creative/)) {return 'arts';}
    return 'humanities'; // default
  }

  combineStrategies(ageStrategy, subjectStrategy, step, intent) {
    // Smart combination of age and subject strategies
    if (intent === 'ideas' && subjectStrategy?.[step]?.prompts) {
      return {
        suggestions: subjectStrategy[step].prompts.map(p => 
          p.replace('{topic}', this.context.subject)
        ),
        type: 'whatif'
      };
    }

    if (intent === 'examples') {
      const subjectExamples = subjectStrategy?.[step]?.examples || [];
      const ageExamples = ageStrategy?.challenges || [];
      
      return {
        suggestions: step === 'challenge' ? ageExamples : subjectExamples,
        type: 'example'
      };
    }

    return null;
  }

  // Special handling for cross-curricular projects
  getCrossCurricularStrategy(subjects) {
    const prompts = [
      `What if we connected ${subjects[0]} and ${subjects[1]} through real-world problems?`,
      `What if students explored where ${subjects[0]} and ${subjects[1]} intersect?`,
      `What if we used ${subjects[1]} methods to investigate ${subjects[0]} concepts?`
    ];

    return {
      suggestions: prompts,
      type: 'whatif',
      note: 'Cross-curricular connections deepen learning'
    };
  }

  // Handle educator experience level
  getExperienceAdaptation(experienceLevel) {
    const adaptations = {
      novice: {
        guidance: 'high',
        examples: 'many',
        scaffolding: 'detailed',
        pace: 'slower'
      },
      intermediate: {
        guidance: 'moderate',
        examples: 'some',
        scaffolding: 'light',
        pace: 'moderate'
      },
      expert: {
        guidance: 'minimal',
        examples: 'few',
        scaffolding: 'none',
        pace: 'fast'
      }
    };

    return adaptations[experienceLevel] || adaptations.intermediate;
  }

  // Context-aware validation messages
  getValidationMessage(step, issue, context) {
    const messages = {
      bigIdea: {
        tooVague: {
          elementary: "What specific thing will your students explore? Think of something they can see or touch.",
          middle: "This needs more focus. What's the specific angle that will hook your students?",
          high: "Let's sharpen this. What's the unique perspective your students will investigate?",
          college: "This needs more theoretical grounding. What framework or lens will guide the exploration?"
        },
        isQuestion: {
          all: "Big Ideas are themes, not questions. Try rephrasing as a concept like 'Climate Solutions' instead of 'How can we help the climate?'"
        }
      },
      essentialQuestion: {
        notQuestion: {
          all: "Essential Questions need to end with '?' - try starting with How, What, or Why."
        },
        tooSimple: {
          elementary: "Good start! Can we make it a bit more specific to guide their exploration?",
          middle: "This works, but middle schoolers can handle more complexity. What deeper question could we ask?",
          high: "Let's challenge them more. What question would require real investigation?",
          college: "This seems surface-level. What question would drive scholarly inquiry?"
        }
      },
      challenge: {
        noAction: {
          all: "Challenges need action verbs. What will students CREATE, DESIGN, BUILD, or DEVELOP?"
        },
        notAuthentic: {
          elementary: "Who will see their work? Let's make sure it has a real audience.",
          middle: "Middle schoolers need authentic purpose. Who outside class benefits from this?",
          high: "This needs real-world connection. What professional work does this mirror?",
          college: "How does this contribute to their field? What's the professional relevance?"
        }
      }
    };

    const ageKey = this.getAgeKey();
    return messages[step]?.[issue]?.[ageKey] || messages[step]?.[issue]?.all || "Let's refine this a bit more.";
  }
}

// Singleton pattern for strategy management
let strategyInstance = null;

export const getBranchingStrategy = (projectContext) => {
  if (!strategyInstance || strategyInstance.context !== projectContext) {
    strategyInstance = new BranchingStrategies(projectContext);
  }
  return strategyInstance;
};