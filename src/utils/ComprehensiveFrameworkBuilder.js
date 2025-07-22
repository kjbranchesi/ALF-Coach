// src/utils/ComprehensiveFrameworkBuilder.js
// Builds comprehensive course materials progressively through all stages

export class ComprehensiveFrameworkBuilder {
  constructor() {
    this.framework = {
      // Core elements from Ideation
      ideation: {
        bigIdea: '',
        essentialQuestion: '',
        challenge: '',
        context: {}
      },
      
      // Journey elements build curriculum structure
      journey: {
        milestones: [],
        learningActivities: [],
        assessmentStrategies: [],
        timeline: '',
        resources: []
      },
      
      // Deliverables produce final materials
      deliverables: {
        courseAbstract: '',
        syllabus: {
          courseInfo: {},
          learningObjectives: [],
          schedule: [],
          policies: {},
          assessments: []
        },
        curriculum: {
          units: [],
          lessons: [],
          materials: [],
          differentiation: {}
        },
        rubric: {
          criteria: [],
          levels: [],
          descriptors: {}
        }
      }
    };
  }

  // Update framework as user progresses
  updateFromIdeation(ideationData) {
    this.framework.ideation = { ...this.framework.ideation, ...ideationData };
    
    // Auto-generate initial course abstract
    if (ideationData.bigIdea && ideationData.essentialQuestion && ideationData.challenge) {
      this.framework.deliverables.courseAbstract = this.generateCourseAbstract();
    }
  }

  updateFromJourney(journeyData) {
    this.framework.journey = { ...this.framework.journey, ...journeyData };
    
    // Build curriculum structure from milestones
    if (journeyData.milestones?.length > 0) {
      this.framework.deliverables.curriculum.units = this.generateUnitsFromMilestones();
    }
  }

  updateFromDeliverables(deliverablesData) {
    this.framework.deliverables = { ...this.framework.deliverables, ...deliverablesData };
  }

  // Generate course abstract from ideation elements
  generateCourseAbstract() {
    const { bigIdea, essentialQuestion, challenge, context } = this.framework.ideation;
    
    return `This ${context.subject || 'course'} explores ${bigIdea} through the lens of "${essentialQuestion}" 
Students will engage in authentic, project-based learning culminating in ${challenge}. 
The course emphasizes ${this.getEmphasisFromContext(context)} while developing 
21st-century skills through hands-on investigation and real-world application.`;
  }

  // Convert milestones to curriculum units
  generateUnitsFromMilestones() {
    return this.framework.journey.milestones.map((milestone, index) => ({
      number: index + 1,
      title: milestone.title,
      duration: milestone.duration || '2-3 weeks',
      objectives: milestone.objectives || [],
      keyActivities: milestone.activities || [],
      assessment: milestone.assessment || 'Formative assessment through project progress'
    }));
  }

  // Generate learning objectives from all stages
  generateLearningObjectives() {
    const objectives = [];
    
    // From Big Idea
    objectives.push(`Understand and apply concepts related to ${this.framework.ideation.bigIdea}`);
    
    // From Essential Question
    objectives.push(`Investigate and answer: "${this.framework.ideation.essentialQuestion}"`);
    
    // From Challenge
    objectives.push(`${this.framework.ideation.challenge}`);
    
    // From Journey milestones
    this.framework.journey.milestones.forEach(milestone => {
      if (milestone.objectives) {
        objectives.push(...milestone.objectives);
      }
    });
    
    return [...new Set(objectives)]; // Remove duplicates
  }

  // Build comprehensive syllabus
  generateSyllabus() {
    const syllabus = {
      courseInfo: {
        title: `${this.framework.ideation.bigIdea}: A Project-Based Learning Experience`,
        description: this.framework.deliverables.courseAbstract,
        subject: this.framework.ideation.context.subject,
        ageGroup: this.framework.ideation.context.ageGroup,
        duration: this.framework.journey.timeline || 'One Semester'
      },
      
      learningObjectives: this.generateLearningObjectives(),
      
      essentialQuestion: this.framework.ideation.essentialQuestion,
      
      culminatingChallenge: this.framework.ideation.challenge,
      
      schedule: this.generateScheduleFromUnits(),
      
      assessmentOverview: {
        formative: this.framework.journey.assessmentStrategies.filter(a => a.type === 'formative'),
        summative: this.framework.journey.assessmentStrategies.filter(a => a.type === 'summative'),
        authentic: this.framework.ideation.challenge
      },
      
      resources: this.framework.journey.resources,
      
      policies: {
        collaboration: 'Students will work in teams throughout the project',
        realWorld: 'All work connects to authentic audiences and purposes',
        iteration: 'Multiple drafts and peer feedback are expected',
        reflection: 'Regular reflection on learning process required'
      }
    };
    
    return syllabus;
  }

  // Generate detailed curriculum map
  generateCurriculum() {
    const curriculum = {
      overview: {
        bigIdea: this.framework.ideation.bigIdea,
        essentialQuestion: this.framework.ideation.essentialQuestion,
        challenge: this.framework.ideation.challenge
      },
      
      units: this.framework.deliverables.curriculum.units.map(unit => ({
        ...unit,
        lessons: this.generateLessonsForUnit(unit),
        resources: this.getResourcesForUnit(unit),
        differentiation: this.getDifferentiationStrategies(unit)
      })),
      
      crossCurricular: this.identifyCrossCurricularConnections(),
      
      skills: {
        content: this.getContentSkills(),
        process: ['Critical thinking', 'Collaboration', 'Communication', 'Creativity'],
        digital: this.getDigitalSkills()
      }
    };
    
    return curriculum;
  }

  // Generate comprehensive rubric
  generateRubric() {
    const rubric = {
      title: `${this.framework.ideation.challenge} Assessment Rubric`,
      
      criteria: [
        {
          name: 'Understanding of Big Idea',
          description: `Demonstrates deep understanding of ${this.framework.ideation.bigIdea}`,
          weight: 25
        },
        {
          name: 'Essential Question Investigation',
          description: `Thoroughly addresses "${this.framework.ideation.essentialQuestion}"`,
          weight: 25
        },
        {
          name: 'Challenge Completion',
          description: `Successfully completes ${this.framework.ideation.challenge}`,
          weight: 30
        },
        {
          name: 'Process & Collaboration',
          description: 'Engages effectively in project process and teamwork',
          weight: 20
        }
      ],
      
      levels: [
        { name: 'Exemplary', points: 4, color: 'green' },
        { name: 'Proficient', points: 3, color: 'blue' },
        { name: 'Developing', points: 2, color: 'yellow' },
        { name: 'Beginning', points: 1, color: 'red' }
      ],
      
      descriptors: this.generateRubricDescriptors()
    };
    
    return rubric;
  }

  // Helper methods
  getEmphasisFromContext(context) {
    const emphases = [];
    
    if (context.pedagogical?.developmentalStage?.includes('Elementary')) {
      emphases.push('hands-on exploration', 'collaborative discovery');
    } else if (context.pedagogical?.developmentalStage?.includes('High')) {
      emphases.push('critical analysis', 'real-world application');
    } else if (context.pedagogical?.developmentalStage?.includes('Adult')) {
      emphases.push('professional relevance', 'theoretical frameworks');
    }
    
    return emphases.join(' and ') || 'deep learning';
  }

  generateScheduleFromUnits() {
    let weekNumber = 1;
    const schedule = [];
    
    this.framework.deliverables.curriculum.units.forEach(unit => {
      const weeks = parseInt(unit.duration) || 3;
      for (let i = 0; i < weeks; i++) {
        schedule.push({
          week: weekNumber++,
          unit: unit.title,
          focus: unit.keyActivities[i] || 'Project work and investigation'
        });
      }
    });
    
    return schedule;
  }

  generateLessonsForUnit(unit) {
    // Generate 5-10 lessons per unit based on duration
    const lessonCount = parseInt(unit.duration) * 3 || 9;
    const lessons = [];
    
    for (let i = 1; i <= lessonCount; i++) {
      lessons.push({
        number: i,
        title: `${unit.title} - Lesson ${i}`,
        objective: unit.objectives[Math.floor(i/3)] || 'Advance project work',
        activities: this.suggestActivitiesForLesson(unit, i),
        assessment: i % 3 === 0 ? 'Checkpoint assessment' : 'Formative observation'
      });
    }
    
    return lessons;
  }

  getResourcesForUnit(unit) {
    return [
      'Digital tools and platforms',
      'Community expert connections',
      'Research materials',
      ...this.framework.journey.resources.filter(r => r.unit === unit.number)
    ];
  }

  getDifferentiationStrategies(unit) {
    return {
      support: [
        'Scaffolded templates',
        'Peer mentoring',
        'Additional guided practice'
      ],
      extension: [
        'Advanced research opportunities',
        'Leadership roles',
        'Community partnership options'
      ]
    };
  }

  identifyCrossCurricularConnections() {
    const connections = [];
    const subject = this.framework.ideation.context.subject?.toLowerCase() || '';
    
    if (!subject.includes('math')) connections.push('Mathematics: Data analysis and visualization');
    if (!subject.includes('english')) connections.push('English: Communication and presentation');
    if (!subject.includes('science')) connections.push('Science: Investigation methods');
    if (!subject.includes('social')) connections.push('Social Studies: Community context');
    
    return connections;
  }

  getContentSkills() {
    const subject = this.framework.ideation.context.subject || '';
    const skills = [`Core ${subject} concepts`, `${subject} inquiry methods`];
    
    // Add specific skills based on challenge
    if (this.framework.ideation.challenge.includes('design')) {
      skills.push('Design thinking process');
    }
    if (this.framework.ideation.challenge.includes('create')) {
      skills.push('Creative production skills');
    }
    if (this.framework.ideation.challenge.includes('research')) {
      skills.push('Research methodology');
    }
    
    return skills;
  }

  getDigitalSkills() {
    return [
      'Digital research and evaluation',
      'Multimedia production',
      'Online collaboration',
      'Digital citizenship'
    ];
  }

  generateRubricDescriptors() {
    const descriptors = {};
    
    this.framework.deliverables.rubric.criteria.forEach(criterion => {
      descriptors[criterion.name] = {
        exemplary: `Exceeds expectations in ${criterion.description}`,
        proficient: `Meets expectations in ${criterion.description}`,
        developing: `Approaching expectations in ${criterion.description}`,
        beginning: `Beginning to show ${criterion.description}`
      };
    });
    
    return descriptors;
  }

  suggestActivitiesForLesson(unit, lessonNumber) {
    const activities = [];
    
    // Opening lessons focus on exploration
    if (lessonNumber <= 3) {
      activities.push('Explore and investigate key concepts');
      activities.push('Generate questions and hypotheses');
    }
    // Middle lessons focus on creation
    else if (lessonNumber <= 6) {
      activities.push('Develop project components');
      activities.push('Peer feedback and iteration');
    }
    // Closing lessons focus on refinement
    else {
      activities.push('Refine and polish work');
      activities.push('Prepare for presentation');
    }
    
    return activities;
  }

  // Export complete framework
  exportFramework() {
    return {
      courseAbstract: this.framework.deliverables.courseAbstract,
      syllabus: this.generateSyllabus(),
      curriculum: this.generateCurriculum(),
      rubric: this.generateRubric(),
      metadata: {
        created: new Date().toISOString(),
        subject: this.framework.ideation.context.subject,
        ageGroup: this.framework.ideation.context.ageGroup,
        bigIdea: this.framework.ideation.bigIdea
      }
    };
  }
}

// Singleton instance
let frameworkBuilder = null;

export const getFrameworkBuilder = () => {
  if (!frameworkBuilder) {
    frameworkBuilder = new ComprehensiveFrameworkBuilder();
  }
  return frameworkBuilder;
};