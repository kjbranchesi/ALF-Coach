import { SampleBlueprint, ts } from './types';
import { getHeroProject } from '../hero';

/**
 * Build the Sensing Self: Wearables for Well-Being hero project
 * High School (9-12) | STEM/Health | 10 weeks
 * Students build wearable biofeedback devices to help users understand and regulate stress
 */
export function buildSensingSelfHero(userId: string): SampleBlueprint {
  const heroData = getHeroProject('hero-sensing-self');

  if (!heroData) {
    throw new Error('Hero project data not found for hero-sensing-self');
  }

  return {
    id: 'hero-sensing-self',
    userId,
    title: heroData.title,
    description: heroData.hero.description,
    subject: heroData.subjects.join(', '),
    gradeLevel: heroData.gradeLevel,
    duration: heroData.duration,
    isActive: false,
    isHero: true,
    heroProjectId: 'hero-sensing-self',
    tags: [
      'STEM',
      'Health',
      'Technology',
      'Wellness',
      'Data Science',
      'Engineering',
      'Mental Health'
    ],
    blueprint: {
      ideation: {
        drivingQuestion: heroData.bigIdea.drivingQuestion,
        essentialQuestion: heroData.bigIdea.essentialQuestion,
        challenge: heroData.bigIdea.challenge,
        bigIdea: heroData.bigIdea.statement,
        studentVoice: {
          drivingQuestions: heroData.bigIdea.subQuestions,
          choicePoints: [
            'Choose specific biometric indicators to monitor (heart rate, skin conductance, breathing)',
            'Select wearable form factor (wristband, pendant, clip-on)',
            'Design dashboard visualizations and user interface',
            'Identify target user group and testing partners',
            'Determine intervention strategies and care guide focus'
          ]
        }
      },
      journey: {
        phases: heroData.journey.phases,
        milestones: heroData.journey.milestones,
        resources: [
          ...heroData.resources.required,
          ...heroData.resources.optional
        ],
        framework: 'Engineering Design Process + Human-Centered Design',
        scaffolding: [
          'Biofeedback concepts and stress physiology',
          'Sensor technology and data collection',
          'Programming and data visualization',
          'User research and testing protocols',
          'Technical documentation and care guide writing'
        ],
        differentiation: [
          'Multiple entry points from basic to advanced electronics',
          'Choice in programming languages and platforms',
          'Varied dashboard complexity levels',
          'Different testing methodologies',
          'Flexible care guide formats'
        ]
      },
      deliverables: {
        milestones: heroData.journey.milestones.map(m => ({
          id: m.id,
          name: m.title,
          timeline: `Week ${m.week}`,
          description: m.description,
          deliverable: m.evidence[0],
          successCriteria: m.evidence,
          studentProducts: [m.celebration]
        })),
        finalProducts: heroData.overview.deliverables,
        assessment: {
          formative: heroData.assessment.formative,
          summative: heroData.assessment.summative,
          rubric: {
            criteria: heroData.assessment.rubric
          }
        },
        impact: {
          audience: heroData.impact.audience,
          measures: heroData.impact.metrics,
          methods: heroData.impact.methods
        },
        rubric: {
          criteria: heroData.assessment.rubric.map(r => ({
            id: r.category,
            name: r.category,
            weight: `${r.weight}%`,
            description: `Assessment of ${r.category.toLowerCase()}`,
            exemplary: r.exemplary.description,
            proficient: r.proficient.description,
            developing: r.developing.description,
            beginning: r.beginning.description
          }))
        }
      },
      createdAt: ts.now(),
      updatedAt: ts.now()
    },
    createdAt: ts.now(),
    updatedAt: ts.now()
  };
}