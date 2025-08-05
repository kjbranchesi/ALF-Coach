/**
 * DeliverableGenerator.ts - Transforms blueprint data into teacher-ready materials
 */

import { BlueprintDoc } from '../types/SOPTypes';

export class DeliverableGenerator {
  
  /**
   * Generate a complete teacher implementation guide
   */
  generateTeacherGuide(blueprint: BlueprintDoc): TeacherGuideData {
    const { wizard, ideation, journey, deliverables } = blueprint;
    
    return {
      // Cover Page
      title: this.generateProjectTitle(ideation.bigIdea),
      subject: wizard.subject,
      gradeLevel: wizard.students,
      duration: this.calculateDuration(wizard.scope, deliverables.timeline),
      
      // Executive Summary
      projectOverview: {
        bigIdea: ideation.bigIdea,
        essentialQuestion: ideation.essentialQuestion,
        drivingChallenge: ideation.challenge,
        learningGoals: this.extractLearningGoals(blueprint),
        realWorldConnections: this.identifyRealWorldConnections(blueprint)
      },
      
      // Learning Journey
      phases: journey.phases.map((phase, index) => ({
        number: index + 1,
        title: phase.title,
        description: phase.description,
        duration: `Week ${this.getPhaseStartWeek(index, deliverables.timeline)}`,
        activities: this.expandActivities(journey.activities, index),
        resources: this.categorizeResources(journey.resources, index),
        milestone: this.getPhaseDeliverable(deliverables.milestones, index)
      })),
      
      // Assessment Plan
      assessment: {
        formative: this.generateFormativeAssessments(journey),
        summative: {
          rubric: this.expandRubric(deliverables.rubric),
          milestones: this.expandMilestones(deliverables.milestones)
        },
        studentSelfAssessment: this.generateSelfAssessmentTools(deliverables.rubric)
      },
      
      // Implementation Support
      implementation: {
        materialsNeeded: deliverables.resources?.materials || [],
        technologyRequirements: deliverables.resources?.technology || [],
        timelineOverview: this.generateTimelineVisual(blueprint),
        differentiationStrategies: this.generateDifferentiationIdeas(blueprint),
        commonChallenges: this.anticipateChallenges(blueprint)
      },
      
      // Community Connections
      communityEngagement: {
        audienceDescription: deliverables.impact.audience,
        presentationMethod: deliverables.impact.method,
        purpose: deliverables.impact.purpose || 'Share learning with authentic audience',
        engagementIdeas: this.generateEngagementIdeas(deliverables.impact)
      }
    };
  }
  
  /**
   * Generate student-friendly project guide
   */
  generateStudentGuide(blueprint: BlueprintDoc): StudentGuideData {
    const { ideation, journey, deliverables } = blueprint;
    
    return {
      // Welcome Section
      welcome: {
        title: "Your Learning Adventure",
        challenge: this.makeStudentFriendly(ideation.challenge),
        whyItMatters: this.explainRelevance(ideation.bigIdea),
        whatYouWillLearn: this.extractStudentLearningGoals(blueprint),
        whatYouWillCreate: this.summarizeMilestones(deliverables.milestones)
      },
      
      // Journey Map
      journeyMap: journey.phases.map((phase, index) => ({
        phase: index + 1,
        title: this.makeStudentFriendly(phase.title),
        whatYouWillDo: this.makeStudentFriendly(phase.description),
        coolActivities: this.highlightEngagingActivities(journey.activities, index),
        milestone: this.explainMilestone(deliverables.milestones[index])
      })),
      
      // Success Guide
      howToSucceed: {
        rubricSimplified: this.simplifyRubricForStudents(deliverables.rubric),
        tipsForSuccess: this.generateStudentTips(blueprint),
        exampleWork: this.generateExampleDescriptions(deliverables.milestones),
        selfCheckTools: this.createSelfCheckChecklists(deliverables.rubric)
      },
      
      // Resources & Support
      resources: {
        helpfulLinks: journey.resources.filter(r => this.isStudentAppropriate(r)),
        vocabularyGuide: this.extractKeyTerms(blueprint),
        questionPrompts: this.generateInquiryPrompts(ideation.essentialQuestion)
      },
      
      // Celebration Planning
      celebration: {
        audience: this.makeStudentFriendly(deliverables.impact.audience),
        howToShare: this.makeStudentFriendly(deliverables.impact.method),
        preparationTips: this.generatePresentationTips(deliverables.impact)
      }
    };
  }
  
  // Helper methods
  private generateProjectTitle(bigIdea: string): string {
    // Create engaging title from big idea
    const words = bigIdea.split(' ').slice(0, 5);
    return words.map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ') + ' Project';
  }
  
  private calculateDuration(scope: string, timeline?: any): string {
    if (timeline?.totalWeeks) {
      return `${timeline.totalWeeks} weeks`;
    }
    switch (scope) {
      case 'lesson': return '1-2 weeks';
      case 'unit': return '3-4 weeks';
      case 'course': return '6-8 weeks';
      default: return '3-4 weeks';
    }
  }
  
  private extractLearningGoals(blueprint: BlueprintDoc): string[] {
    // Extract learning goals from essential question and challenge
    const goals = [];
    
    // From essential question
    if (blueprint.ideation.essentialQuestion.includes('How')) {
      goals.push(`Understand ${blueprint.ideation.essentialQuestion.toLowerCase()}`);
    }
    
    // From challenge
    goals.push(`Successfully ${blueprint.ideation.challenge.toLowerCase()}`);
    
    // From journey phases
    blueprint.journey.phases.forEach(phase => {
      if (phase.description.includes('learn')) {
        goals.push(phase.description);
      }
    });
    
    return goals;
  }
  
  private makeStudentFriendly(text: string): string {
    // Simplify language for students
    return text
      .replace(/analyze/gi, 'look closely at')
      .replace(/evaluate/gi, 'judge')
      .replace(/synthesize/gi, 'combine')
      .replace(/implement/gi, 'use')
      .replace(/demonstrate/gi, 'show');
  }
  
  private expandRubric(rubric: any): any {
    // Add missing levels and details to rubric with clear performance descriptors
    return {
      ...rubric,
      title: 'Project Assessment Rubric',
      performanceLevels: [
        { name: 'Exemplary', value: 4, description: 'Exceeds expectations' },
        { name: 'Proficient', value: 3, description: 'Meets expectations' },
        { name: 'Developing', value: 2, description: 'Approaching expectations' },
        { name: 'Beginning', value: 1, description: 'Working toward expectations' }
      ],
      criteria: rubric.criteria.map((criterion: any) => ({
        ...criterion,
        levels: criterion.levels || {
          exemplary: {
            description: `Demonstrates exceptional understanding and application of ${criterion.criterion.toLowerCase()}`,
            indicators: [
              'Goes beyond requirements with creative solutions',
              'Shows deep insight and original thinking',
              'Makes sophisticated connections'
            ]
          },
          proficient: {
            description: `Clearly demonstrates ${criterion.criterion.toLowerCase()} as expected`,
            indicators: [
              'Meets all requirements effectively',
              'Shows solid understanding',
              'Communicates ideas clearly'
            ]
          },
          developing: {
            description: `Shows progress in ${criterion.criterion.toLowerCase()} with some gaps`,
            indicators: [
              'Meets most requirements with support',
              'Understanding is emerging',
              'Some ideas need clarification'
            ]
          },
          beginning: {
            description: `Beginning to develop ${criterion.criterion.toLowerCase()}`,
            indicators: [
              'Working toward meeting requirements',
              'Needs significant support',
              'Ideas are still forming'
            ]
          }
        },
        points: criterion.weight || 25,
        maxScore: 4
      })),
      totalPoints: 100,
      scoringGuide: {
        exemplary: '90-100%',
        proficient: '80-89%',
        developing: '70-79%',
        beginning: 'Below 70%'
      }
    };
  }
  
  private getPhaseStartWeek(phaseIndex: number, timeline?: any): string {
    if (!timeline?.phaseDurations) return `${phaseIndex * 2 + 1}-${phaseIndex * 2 + 2}`;
    
    let week = 1;
    for (let i = 0; i < phaseIndex; i++) {
      week += timeline.phaseDurations[`phase${i + 1}`] || 2;
    }
    return week.toString();
  }
  
  private identifyRealWorldConnections(blueprint: BlueprintDoc): string[] {
    const connections = [];
    const { ideation, deliverables } = blueprint;
    
    if (ideation.challenge.includes('community') || ideation.challenge.includes('real')) {
      connections.push('Direct community engagement through project outcomes');
    }
    
    if (deliverables.impact?.audience) {
      connections.push(`Authentic audience presentation to ${deliverables.impact.audience}`);
    }
    
    if (ideation.bigIdea.includes('environment') || ideation.bigIdea.includes('sustain')) {
      connections.push('Environmental impact and sustainability considerations');
    }
    
    connections.push('Development of 21st century skills through project work');
    
    return connections;
  }
  
  private expandActivities(activities: string[], phaseIndex: number): string[] {
    // Take activities relevant to this phase
    const startIdx = phaseIndex * Math.ceil(activities.length / 3);
    const endIdx = Math.min(startIdx + Math.ceil(activities.length / 3), activities.length);
    return activities.slice(startIdx, endIdx);
  }
  
  private categorizeResources(resources: string[], phaseIndex: number): any {
    return {
      primary: resources.slice(0, Math.ceil(resources.length / 3)),
      supplemental: resources.slice(Math.ceil(resources.length / 3)),
      digital: resources.filter(r => r.includes('http') || r.includes('online') || r.includes('digital')),
      physical: resources.filter(r => !r.includes('http') && !r.includes('online') && !r.includes('digital'))
    };
  }
  
  private getPhaseDeliverable(milestones: any[], phaseIndex: number): string {
    if (!milestones || milestones.length === 0) return 'Phase deliverable in development';
    
    const milestone = milestones[phaseIndex];
    if (typeof milestone === 'string') return milestone;
    if (milestone?.title) return milestone.title;
    return `Phase ${phaseIndex + 1} deliverable`;
  }
  
  private generateFormativeAssessments(journey: any): any {
    return {
      checkIns: [
        'Daily exit tickets to gauge understanding',
        'Peer feedback sessions during activities',
        'Teacher observation rubrics for collaboration'
      ],
      reflections: [
        'Weekly learning journals',
        'Video reflections on progress',
        'Self-assessment checklists'
      ]
    };
  }
  
  private expandMilestones(milestones: any[]): any[] {
    if (!milestones) return [];
    
    return milestones.map((m, idx) => {
      if (typeof m === 'string') {
        return {
          title: m,
          description: `Complete ${m}`,
          weekNumber: idx * 2 + 1,
          criteria: 'Meeting project requirements'
        };
      }
      return m;
    });
  }
  
  private generateSelfAssessmentTools(rubric: any): any {
    return {
      checklist: rubric.criteria.map((c: any) => ({
        criterion: c.criterion,
        questions: [
          `Have I demonstrated ${c.criterion.toLowerCase()}?`,
          `What evidence shows my ${c.criterion.toLowerCase()}?`,
          `How can I improve my ${c.criterion.toLowerCase()}?`
        ]
      })),
      reflectionPrompts: [
        'What am I most proud of in this project?',
        'What challenged me the most?',
        'What would I do differently next time?'
      ]
    };
  }
  
  private generateTimelineVisual(blueprint: BlueprintDoc): string {
    const weeks = blueprint.deliverables.timeline?.totalWeeks || 4;
    const phases = blueprint.journey.phases;
    
    let timeline = `Week 1-${Math.ceil(weeks/3)}: ${phases[0]?.title || 'Phase 1'}\n`;
    timeline += `Week ${Math.ceil(weeks/3)+1}-${Math.ceil(2*weeks/3)}: ${phases[1]?.title || 'Phase 2'}\n`;
    timeline += `Week ${Math.ceil(2*weeks/3)+1}-${weeks}: ${phases[2]?.title || 'Phase 3'}`;
    
    return timeline;
  }
  
  private generateDifferentiationIdeas(blueprint: BlueprintDoc): string[] {
    return [
      'Provide multiple entry points for different skill levels',
      'Offer choice in final product format',
      'Create tiered activities based on readiness',
      'Support ELL students with visual aids and vocabulary support',
      'Challenge advanced learners with extension opportunities'
    ];
  }
  
  private anticipateChallenges(blueprint: BlueprintDoc): string[] {
    const challenges = [];
    
    if (blueprint.journey.resources.some(r => r.includes('technology'))) {
      challenges.push('Technology access and troubleshooting');
    }
    
    if (blueprint.deliverables.impact?.audience.includes('community')) {
      challenges.push('Coordinating community presentations');
    }
    
    challenges.push(
      'Time management across project phases',
      'Maintaining student engagement throughout',
      'Balancing individual and group work'
    );
    
    return challenges;
  }
  
  private generateEngagementIdeas(impact: any): string[] {
    const ideas = [];
    
    if (impact.audience.includes('parent')) {
      ideas.push('Host a family showcase night');
    }
    
    if (impact.audience.includes('community')) {
      ideas.push('Organize a community forum or fair');
    }
    
    ideas.push(
      'Create a project website or blog',
      'Share work on school social media',
      'Present to other classes or grade levels'
    );
    
    return ideas;
  }
  
  // Student guide helpers
  private explainRelevance(bigIdea: string): string {
    return `This project matters because ${bigIdea.toLowerCase()}. You'll develop skills that you can use in real life!`;
  }
  
  private extractStudentLearningGoals(blueprint: BlueprintDoc): string[] {
    return [
      `How to ${blueprint.ideation.challenge.toLowerCase()}`,
      'Work effectively in teams',
      'Think critically and solve problems',
      'Communicate your ideas clearly',
      'Create something meaningful for others'
    ];
  }
  
  private summarizeMilestones(milestones: any[]): string {
    if (!milestones || milestones.length === 0) return 'Amazing projects that show your learning';
    
    return milestones.map((m, idx) => {
      const title = typeof m === 'string' ? m : m.title;
      return `${title}`;
    }).join(', ');
  }
  
  private highlightEngagingActivities(activities: string[], phaseIndex: number): string[] {
    const relevant = this.expandActivities(activities, phaseIndex);
    return relevant.map(a => this.makeStudentFriendly(a));
  }
  
  private explainMilestone(milestone: any): string {
    if (!milestone) return 'Create something awesome!';
    
    const title = typeof milestone === 'string' ? milestone : milestone.title;
    return `You'll create: ${this.makeStudentFriendly(title)}`;
  }
  
  private simplifyRubricForStudents(rubric: any): any {
    return {
      criteria: rubric.criteria.map((c: any) => ({
        name: this.makeStudentFriendly(c.criterion),
        meaning: `This means you need to ${this.makeStudentFriendly(c.description || c.criterion).toLowerCase()}`,
        tips: [
          'Show your best work',
          'Ask for feedback along the way',
          'Use the success checklist'
        ]
      }))
    };
  }
  
  private generateStudentTips(blueprint: BlueprintDoc): string[] {
    return [
      'Ask questions when you are stuck',
      'Work well with your team',
      'Stay organized with your materials',
      'Celebrate small wins along the way',
      'Have fun and be creative!'
    ];
  }
  
  private generateExampleDescriptions(milestones: any[]): string[] {
    return [
      'A presentation that clearly explains your solution',
      'A prototype or model that demonstrates your idea',
      'Documentation showing your learning journey',
      'Evidence of teamwork and collaboration'
    ];
  }
  
  private createSelfCheckChecklists(rubric: any): any[] {
    return rubric.criteria.map((c: any) => ({
      criterion: this.makeStudentFriendly(c.criterion),
      checks: [
        'I understand what this means',
        'I have examples in my work',
        'I can explain this to others'
      ]
    }));
  }
  
  private isStudentAppropriate(resource: string): boolean {
    // Filter out teacher-only resources
    return !resource.toLowerCase().includes('teacher') && 
           !resource.toLowerCase().includes('educator') &&
           !resource.toLowerCase().includes('instructor');
  }
  
  private extractKeyTerms(blueprint: BlueprintDoc): any {
    // Extract important vocabulary from the project
    const terms: Record<string, string> = {};
    
    // Add some common project terms
    terms['Essential Question'] = 'The big question that guides your learning';
    terms['Milestone'] = 'An important checkpoint in your project';
    terms['Rubric'] = 'The guide that shows how your work will be evaluated';
    terms['Prototype'] = 'A first version or model of your solution';
    
    return terms;
  }
  
  private generateInquiryPrompts(essentialQuestion: string): string[] {
    return [
      essentialQuestion,
      'What do I already know about this?',
      'What do I want to learn?',
      'How can I find good information?',
      'What creative solutions can I imagine?'
    ];
  }
  
  private generatePresentationTips(impact: any): string[] {
    return [
      'Practice your presentation multiple times',
      'Make eye contact with your audience',
      'Speak clearly and with enthusiasm',
      'Use visuals to support your ideas',
      'Be prepared to answer questions'
    ];
  }
}

// Type definitions for generated guides
interface TeacherGuideData {
  title: string;
  subject: string;
  gradeLevel: string;
  duration: string;
  projectOverview: any;
  phases: any[];
  assessment: any;
  implementation: any;
  communityEngagement: any;
}

interface StudentGuideData {
  welcome: any;
  journeyMap: any[];
  howToSucceed: any;
  resources: any;
  celebration: any;
}