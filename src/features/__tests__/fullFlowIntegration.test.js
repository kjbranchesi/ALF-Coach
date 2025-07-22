// Full flow integration test
// Tests the complete journey from ideation to deliverables

import { getFrameworkBuilder } from '../../utils/ComprehensiveFrameworkBuilder.js';

describe('ALF Coach Full Flow Integration', () => {
  let frameworkBuilder;
  
  beforeEach(() => {
    frameworkBuilder = getFrameworkBuilder();
  });

  test('Ideation stage updates framework correctly', () => {
    const ideationData = {
      bigIdea: 'Sustainable Urban Design',
      essentialQuestion: 'How might we redesign our city to be more sustainable and livable?',
      challenge: 'Design a sustainable neighborhood plan for Chicago',
      context: {
        subject: 'Urban Planning',
        ageGroup: 'College',
        location: 'Chicago',
        pedagogical: { developmentalStage: 'Adult/Higher Education' }
      }
    };

    frameworkBuilder.updateFromIdeation(ideationData);
    
    // Check that course abstract was generated
    const abstract = frameworkBuilder.framework.deliverables.courseAbstract;
    expect(abstract).toContain('Sustainable Urban Design');
    expect(abstract).toContain('How might we redesign');
    expect(abstract).toContain('Design a sustainable neighborhood');
  });

  test('Journey stage builds curriculum structure', () => {
    const journeyData = {
      milestones: [
        {
          title: 'Understanding Current Urban Challenges',
          description: 'Research and analyze existing urban problems',
          duration: '2 weeks',
          objectives: ['Identify key sustainability challenges', 'Analyze case studies']
        },
        {
          title: 'Exploring Sustainable Solutions',
          description: 'Investigate best practices in sustainable urban design',
          duration: '3 weeks',
          objectives: ['Research green infrastructure', 'Study successful examples']
        },
        {
          title: 'Designing the Neighborhood',
          description: 'Create comprehensive sustainable neighborhood plan',
          duration: '4 weeks',
          objectives: ['Apply design principles', 'Create detailed plans']
        }
      ],
      activities: [
        'Site analysis and mapping',
        'Community stakeholder interviews',
        'Design charrettes',
        'Prototype development'
      ],
      assessments: [
        { type: 'formative', description: 'Weekly design critiques' },
        { type: 'summative', description: 'Final neighborhood plan presentation' }
      ]
    };

    frameworkBuilder.updateFromJourney(journeyData);
    
    // Check that units were generated from milestones
    const units = frameworkBuilder.framework.deliverables.curriculum.units;
    expect(units).toHaveLength(3);
    expect(units[0].title).toBe('Understanding Current Urban Challenges');
    expect(units[1].duration).toBe('3 weeks');
  });

  test('Complete framework export contains all materials', () => {
    // Set up complete data
    const ideationData = {
      bigIdea: 'Sustainable Urban Design',
      essentialQuestion: 'How might we redesign our city to be more sustainable?',
      challenge: 'Design a sustainable neighborhood plan',
      context: {
        subject: 'Urban Planning',
        ageGroup: 'College'
      }
    };

    const journeyData = {
      milestones: [
        { title: 'Research Phase', duration: '2 weeks' },
        { title: 'Design Phase', duration: '3 weeks' },
        { title: 'Implementation Phase', duration: '3 weeks' }
      ],
      activities: ['Research', 'Design', 'Present'],
      assessments: [{ type: 'summative', description: 'Final project' }]
    };

    frameworkBuilder.updateFromIdeation(ideationData);
    frameworkBuilder.updateFromJourney(journeyData);

    // Export complete framework
    const exported = frameworkBuilder.exportFramework();

    // Verify all components are present
    expect(exported.courseAbstract).toBeTruthy();
    expect(exported.syllabus).toBeTruthy();
    expect(exported.syllabus.learningObjectives).toBeInstanceOf(Array);
    expect(exported.syllabus.schedule).toBeInstanceOf(Array);
    expect(exported.curriculum).toBeTruthy();
    expect(exported.curriculum.units).toHaveLength(3);
    expect(exported.rubric).toBeTruthy();
    expect(exported.rubric.criteria).toBeInstanceOf(Array);
    expect(exported.metadata.bigIdea).toBe('Sustainable Urban Design');
  });

  test('Learning objectives incorporate all stages', () => {
    const ideationData = {
      bigIdea: 'Climate Change Solutions',
      essentialQuestion: 'How can we mitigate climate change locally?',
      challenge: 'Create a community action plan',
      context: { subject: 'Environmental Science' }
    };

    const journeyData = {
      milestones: [
        {
          title: 'Climate Science Fundamentals',
          objectives: ['Understand greenhouse effect', 'Analyze local climate data']
        },
        {
          title: 'Solution Development',
          objectives: ['Evaluate mitigation strategies', 'Design interventions']
        }
      ]
    };

    frameworkBuilder.updateFromIdeation(ideationData);
    frameworkBuilder.updateFromJourney(journeyData);

    const objectives = frameworkBuilder.generateLearningObjectives();

    // Should include objectives from all sources
    expect(objectives).toContain('Understand and apply concepts related to Climate Change Solutions');
    expect(objectives).toContain('Investigate and answer: "How can we mitigate climate change locally?"');
    expect(objectives).toContain('Create a community action plan');
    expect(objectives).toContain('Understand greenhouse effect');
    expect(objectives).toContain('Design interventions');
  });

  test('Rubric aligns with project goals', () => {
    frameworkBuilder.updateFromIdeation({
      bigIdea: 'Digital Citizenship',
      essentialQuestion: 'How can we be responsible digital citizens?',
      challenge: 'Create a digital citizenship guide',
      context: { subject: 'Technology' }
    });

    const rubric = frameworkBuilder.generateRubric();

    // Verify rubric criteria align with project
    expect(rubric.criteria).toHaveLength(4);
    expect(rubric.criteria[0].name).toBe('Understanding of Big Idea');
    expect(rubric.criteria[0].description).toContain('Digital Citizenship');
    expect(rubric.criteria[1].description).toContain('How can we be responsible digital citizens?');
    expect(rubric.criteria[2].description).toContain('Create a digital citizenship guide');
    
    // Check rubric structure
    expect(rubric.levels).toHaveLength(4);
    expect(rubric.levels[0].name).toBe('Exemplary');
    expect(rubric.descriptors).toBeTruthy();
  });
});