// AgeAdaptiveValidation.js
// Age-adaptive validation system that allows abstract concepts for older students

import { getPedagogicalContext } from '../lib/textUtils.ts';

export class AgeAdaptiveValidator {
  constructor(ageGroup, subject) {
    this.ageGroup = ageGroup;
    this.subject = subject;
    this.context = getPedagogicalContext(ageGroup);
    
    // Determine if this is college/university level
    this.isCollegeLevel = this.detectCollegeLevel(ageGroup);
    this.allowsAbstraction = this.determineAbstractionLevel();
  }

  detectCollegeLevel(ageGroup) {
    const collegeTerms = [
      'college', 'university', 'undergraduate', 'graduate', 
      'masters', 'phd', 'doctoral', 'postsecondary', 'higher ed',
      'adult', 'professional', '18+', '19+', '20+', 'post-secondary'
    ];
    
    const lower = ageGroup.toLowerCase();
    return collegeTerms.some(term => lower.includes(term));
  }

  determineAbstractionLevel() {
    // Extract age if present
    const ageMatch = this.ageGroup.match(/(\d+)/);
    const age = ageMatch ? parseInt(ageMatch[1]) : null;
    
    // College level - highest abstraction
    if (this.isCollegeLevel) {
      return {
        level: 'HIGH',
        allowsTheory: true,
        allowsPhilosophy: true,
        allowsMetaCognition: true,
        minConceptWords: 3,
        maxAbstractionDepth: 5
      };
    }
    
    // High school (14-18) - moderate to high abstraction
    if (age && age >= 14) {
      return {
        level: 'MEDIUM-HIGH',
        allowsTheory: true,
        allowsPhilosophy: age >= 16,
        allowsMetaCognition: age >= 16,
        minConceptWords: 5,
        maxAbstractionDepth: 3
      };
    }
    
    // Middle school (11-14) - emerging abstraction
    if (age && age >= 11) {
      return {
        level: 'MEDIUM',
        allowsTheory: false,
        allowsPhilosophy: false,
        allowsMetaCognition: false,
        minConceptWords: 8,
        maxAbstractionDepth: 2
      };
    }
    
    // Elementary - concrete thinking
    return {
      level: 'LOW',
      allowsTheory: false,
      allowsPhilosophy: false,
      allowsMetaCognition: false,
      minConceptWords: 10,
      maxAbstractionDepth: 1
    };
  }

  validateBigIdea(input) {
    const validation = {
      isValid: false,
      score: 0,
      feedback: '',
      suggestions: []
    };

    // Basic length check
    if (!input || input.trim().length < 10) {
      validation.feedback = 'Please provide more detail for your Big Idea.';
      return validation;
    }

    const lower = input.toLowerCase();
    const wordCount = input.split(/\s+/).length;

    // Check for theoretical/abstract concepts (good for college, needs refinement for younger)
    const theoreticalIndicators = [
      'theory', 'theoretical', 'philosophy', 'philosophical', 'epistemology',
      'ontology', 'paradigm', 'framework', 'construct', 'dialectic',
      'phenomenology', 'hermeneutics', 'semiotics', 'discourse',
      'praxis', 'pedagogy', 'ideology', 'hegemony', 'postmodern',
      'critical', 'deconstruction', 'synthesis', 'meta-', 'neo-'
    ];

    const hasTheory = theoreticalIndicators.some(term => lower.includes(term));

    // Check for concrete elements
    const concreteIndicators = [
      'create', 'build', 'design', 'make', 'develop', 'produce',
      'solve', 'implement', 'apply', 'demonstrate', 'explore'
    ];

    const hasConcrete = concreteIndicators.some(term => lower.includes(term));

    // Age-appropriate validation
    if (this.allowsAbstraction.level === 'HIGH') {
      // College level - embrace abstraction
      if (hasTheory) {
        validation.score += 40;
        validation.isValid = true;
        validation.feedback = 'Excellent theoretical foundation!';
        
        if (!hasConcrete) {
          validation.suggestions = [
            'Consider how students will apply this theory',
            'What concrete outcomes might emerge from this theoretical exploration?',
            'How will this abstract concept manifest in student work?'
          ];
        }
      } else if (wordCount >= this.allowsAbstraction.minConceptWords) {
        validation.score += 30;
        validation.isValid = true;
        validation.feedback = 'Good conceptual thinking.';
        validation.suggestions = [
          'You could explore deeper theoretical dimensions',
          'Consider the philosophical implications',
          'What theoretical frameworks might inform this?'
        ];
      }
    } else if (this.allowsAbstraction.level === 'MEDIUM-HIGH') {
      // High school - balance abstract and concrete
      if (hasTheory && hasConcrete) {
        validation.score += 40;
        validation.isValid = true;
        validation.feedback = 'Great balance of theory and application!';
      } else if (hasTheory && !hasConcrete) {
        validation.score += 20;
        validation.isValid = false;
        validation.feedback = 'This is quite abstract for high school students.';
        validation.suggestions = [
          'How can students see this concept in action?',
          'What real-world examples connect to this theory?',
          'Consider adding concrete applications'
        ];
      } else if (hasConcrete) {
        validation.score += 30;
        validation.isValid = true;
        validation.feedback = 'Good practical focus!';
      }
    } else {
      // Elementary/Middle - require concrete
      if (hasTheory) {
        validation.isValid = false;
        validation.feedback = `This might be too abstract for ${this.ageGroup} students.`;
        validation.suggestions = [
          'Focus on what students can see, touch, or experience',
          'Use concrete examples and real-world connections',
          'Think about hands-on activities'
        ];
      } else if (hasConcrete) {
        validation.score += 40;
        validation.isValid = true;
        validation.feedback = 'Great concrete focus for this age group!';
      }
    }

    // Check for common issues across all ages
    if (lower.startsWith('how') || lower.includes('?')) {
      validation.isValid = false;
      validation.feedback = 'This sounds like a question. Big Ideas should be thematic concepts.';
      validation.suggestions = [
        'Rephrase as a theme or concept',
        'Remove the question format',
        'Think of it as a topic area, not an inquiry'
      ];
    }

    return validation;
  }

  validateEssentialQuestion(input, bigIdea) {
    const validation = {
      isValid: false,
      score: 0,
      feedback: '',
      suggestions: []
    };

    if (!input || input.trim().length < 10) {
      validation.feedback = 'Please provide a complete Essential Question.';
      return validation;
    }

    const lower = input.toLowerCase();
    const hasQuestionMark = input.includes('?');
    const startsWithQuestion = /^(how|what|why|when|where|who|which|should|could|would|can|will|does|is|are)/i.test(input);

    // Must be a question
    if (!hasQuestionMark && !startsWithQuestion) {
      validation.isValid = false;
      validation.feedback = 'Essential Questions should be inquiry-based.';
      validation.suggestions = [
        'Start with "How might..." or "What if..."',
        'Frame it as an open-ended question',
        'Make sure it invites investigation'
      ];
      return validation;
    }

    // Age-appropriate complexity
    if (this.allowsAbstraction.level === 'HIGH') {
      // College - allow complex, philosophical questions
      const philosophicalStarters = ['to what extent', 'in what ways', 'how might we reconcile', 'what are the implications'];
      const hasPhilosophical = philosophicalStarters.some(starter => lower.includes(starter));
      
      if (hasPhilosophical) {
        validation.score += 40;
        validation.isValid = true;
        validation.feedback = 'Excellent philosophical depth!';
      } else {
        validation.score += 30;
        validation.isValid = true;
        validation.feedback = 'Good question. Consider adding more theoretical depth.';
        validation.suggestions = [
          'Explore philosophical dimensions',
          'Consider multiple perspectives or paradigms',
          'Add layers of complexity'
        ];
      }
    } else if (this.allowsAbstraction.level === 'MEDIUM-HIGH') {
      // High school - analytical but accessible
      if (lower.includes('how might') || lower.includes('what if')) {
        validation.score += 40;
        validation.isValid = true;
        validation.feedback = 'Great open-ended question!';
      } else {
        validation.score += 25;
        validation.isValid = true;
        validation.feedback = 'Good start. Consider making it more open-ended.';
      }
    } else {
      // Elementary/Middle - clear and concrete
      const tooComplex = ['implications', 'paradigm', 'theoretical', 'philosophical'];
      if (tooComplex.some(term => lower.includes(term))) {
        validation.isValid = false;
        validation.feedback = 'This might be too complex for younger students.';
        validation.suggestions = [
          'Use simpler language',
          'Focus on concrete investigations',
          'Make it more accessible'
        ];
      } else {
        validation.score += 35;
        validation.isValid = true;
        validation.feedback = 'Good age-appropriate question!';
      }
    }

    return validation;
  }

  validateChallenge(input, bigIdea, essentialQuestion) {
    const validation = {
      isValid: false,
      score: 0,
      feedback: '',
      suggestions: []
    };

    if (!input || input.trim().length < 15) {
      validation.feedback = 'Please describe what students will create or do.';
      return validation;
    }

    const lower = input.toLowerCase();
    const actionVerbs = ['create', 'design', 'develop', 'build', 'produce', 'analyze', 'evaluate', 'synthesize'];
    const hasAction = actionVerbs.some(verb => lower.includes(verb));

    if (!hasAction) {
      validation.feedback = 'Challenges should describe what students will DO.';
      validation.suggestions = [
        'Start with an action verb',
        'Be specific about the deliverable',
        'Describe the final product or outcome'
      ];
      return validation;
    }

    // Age-appropriate complexity
    if (this.allowsAbstraction.level === 'HIGH') {
      // College - can be highly abstract or theoretical
      const researchTerms = ['research', 'thesis', 'analysis', 'critique', 'framework', 'model', 'theory'];
      const hasResearch = researchTerms.some(term => lower.includes(term));
      
      validation.score += hasResearch ? 45 : 35;
      validation.isValid = true;
      validation.feedback = hasResearch ? 
        'Excellent research-focused challenge!' : 
        'Good challenge. Consider adding research components.';
    } else if (this.allowsAbstraction.level === 'MEDIUM-HIGH') {
      // High school - balance complexity with feasibility
      validation.score += 40;
      validation.isValid = true;
      validation.feedback = 'Great age-appropriate challenge!';
    } else {
      // Elementary/Middle - must be concrete and achievable
      const tooAbstract = ['theoretical', 'framework', 'paradigm', 'thesis'];
      if (tooAbstract.some(term => lower.includes(term))) {
        validation.isValid = false;
        validation.feedback = 'This seems too abstract for younger students.';
        validation.suggestions = [
          'Focus on tangible products',
          'Break it into smaller, concrete steps',
          'Think hands-on activities'
        ];
      } else {
        validation.score += 40;
        validation.isValid = true;
        validation.feedback = 'Perfect concrete challenge for this age!';
      }
    }

    return validation;
  }

  // Generate age-appropriate examples
  generateExamples(step, context = {}) {
    const examples = {
      bigIdea: {
        HIGH: [
          'Postcolonial Theory and Contemporary Identity',
          'The Philosophy of Sustainable Development',
          'Critical Pedagogy in Digital Environments',
          'Intersectionality and Systems of Power'
        ],
        'MEDIUM-HIGH': [
          'Innovation and Social Change',
          'Identity in the Digital Age',
          'Environmental Justice and Community Action',
          'The Power of Storytelling Across Cultures'
        ],
        MEDIUM: [
          'Communities and Connections',
          'Patterns in Nature and Design',
          'Stories That Shape Our World',
          'Technology and Daily Life'
        ],
        LOW: [
          'Our Neighborhood Helpers',
          'Animals and Their Homes',
          'Weather and Seasons',
          'Friendship and Kindness'
        ]
      },
      essentialQuestion: {
        HIGH: [
          'To what extent do postcolonial frameworks illuminate contemporary identity formation?',
          'How might we reconcile economic growth with ecological imperatives?',
          'What are the epistemological implications of AI in education?'
        ],
        'MEDIUM-HIGH': [
          'How might innovation address pressing social challenges?',
          'What defines authentic identity in our interconnected world?',
          'How can young people drive meaningful environmental change?'
        ],
        MEDIUM: [
          'How do communities solve problems together?',
          'What patterns connect nature and human design?',
          'How do stories influence who we become?'
        ],
        LOW: [
          'How do helpers make our community better?',
          'What do animals need in their homes?',
          'How does weather affect our daily lives?'
        ]
      },
      challenge: {
        HIGH: [
          'Develop a theoretical framework analyzing power structures in your field',
          'Create a research proposal addressing a complex societal challenge',
          'Design a critical analysis of competing paradigms in your discipline'
        ],
        'MEDIUM-HIGH': [
          'Create a multimedia campaign for social change',
          'Design a sustainable solution for a local environmental issue',
          'Develop a digital storytelling project exploring cultural identity'
        ],
        MEDIUM: [
          'Build a model community center that serves everyone',
          'Create a nature-inspired invention to solve a problem',
          'Produce a podcast series about inspiring stories'
        ],
        LOW: [
          'Create a thank you book for community helpers',
          'Build animal habitat dioramas',
          'Make a weather station for our classroom'
        ]
      }
    };

    const level = this.allowsAbstraction.level;
    return examples[step][level] || examples[step]['MEDIUM'];
  }
}

export default AgeAdaptiveValidator;