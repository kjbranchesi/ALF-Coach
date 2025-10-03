import { type SampleBlueprint } from '../types';
import { getHeroProject } from '../hero-projects';
import { Timestamp } from 'firebase/firestore';

const ts = () => Timestamp.now();

export function buildCivicSignalsHero(userId: string): SampleBlueprint {
  const heroData = getHeroProject('hero-civic-signals');

  if (!heroData) {
    throw new Error('Hero project data not found for hero-civic-signals');
  }

  // Extract the first 4 phases from journey
  const phases = heroData.journey.phases.slice(0, 4);

  // Create milestone summaries from the journey milestones
  const milestones = heroData.journey.milestones.map(m => ({
    week: m.week,
    title: m.title,
    description: m.description
  }));

  // Extract key deliverables
  const deliverables = heroData.overview.deliverables.map(d => ({
    name: d.name,
    description: d.description,
    format: d.format
  }));

  // Create assessment summary from rubric
  const assessmentCriteria = heroData.assessment.rubric.map(r => ({
    category: r.category,
    weight: r.weight,
    description: r.exemplary.description
  }));

  return {
    id: 'hero-civic-signals',
    title: heroData.title,
    userId,
    createdAt: ts(),
    updatedAt: ts(),

    // Wizard data mapping
    wizardData: {
      projectTopic: heroData.title,
      subjects: heroData.subjects,
      gradeLevel: 'high',
      duration: 'long',
      learningObjectives: [
        heroData.courseAbstract.learningObjectives[0],
        heroData.courseAbstract.learningObjectives[1],
        heroData.courseAbstract.learningObjectives[2]
      ],
      description: heroData.overview.description
    },

    // Ideation section
    ideation: {
      bigIdea: heroData.bigIdea.statement,
      essentialQuestion: heroData.bigIdea.essentialQuestion,
      challenge: heroData.bigIdea.challenge,
      context: {
        problem: heroData.context.problem,
        significance: heroData.context.significance,
        realWorld: heroData.context.realWorld,
        studentRole: heroData.context.studentRole
      },
      drivingQuestion: heroData.bigIdea.drivingQuestion,
      subQuestions: heroData.bigIdea.subQuestions
    },

    // Blueprint data
    blueprint: {
      ideation: {
        bigIdea: heroData.bigIdea.statement,
        essentialQuestion: heroData.bigIdea.essentialQuestion,
        challenge: heroData.bigIdea.challenge,
        drivingQuestion: heroData.bigIdea.drivingQuestion,
        context: {
          problem: heroData.context.problem,
          significance: heroData.context.significance,
          realWorld: heroData.context.realWorld,
          studentRole: heroData.context.studentRole,
          authenticity: heroData.context.authenticity
        }
      },

      journey: {
        phases: phases.map(phase => ({
          name: phase.name,
          duration: phase.duration,
          focus: phase.focus,
          keyActivities: phase.activities.slice(0, 5).map(a => ({
            name: a.name,
            description: a.description,
            duration: a.duration,
            outputs: a.outputs
          }))
        })),
        milestones: milestones
      },

      deliverables: {
        finalProducts: deliverables.slice(0, 3),
        presentations: [deliverables[3]],
        artifacts: heroData.showcase?.artifacts || []
      },

      assessment: {
        formative: heroData.assessment.formative,
        summative: heroData.assessment.summative,
        criteria: assessmentCriteria
      },

      resources: {
        required: heroData.resources.required.map(r => ({
          category: r.category,
          items: r.items
        })),
        optional: heroData.resources.optional?.map(r => ({
          category: r.category,
          items: r.items
        })) || [],
        community: heroData.resources.community?.map(c => ({
          type: c.type,
          role: c.role
        })) || []
      }
    },

    // Status
    status: 'complete',
    version: 1,

    // Metadata
    metadata: {
      isHeroProject: true,
      heroProjectId: 'hero-civic-signals',
      tags: ['ai', 'machine-learning', 'civic-tech', 'democracy', 'nlp', 'ethics'],
      difficulty: 'advanced',
      estimatedHours: 100,
      studentRange: '20-30',
      techRequired: 'high',
      spaceRequired: 'classroom + computer lab'
    }
  };
}