/**
 * Real World Contexts Configuration
 * 
 * Problem-first approach to subject selection that naturally creates
 * interdisciplinary connections based on real-world relevance
 */

import { 
  Globe, 
  Users, 
  Lightbulb, 
  Heart, 
  Palette,
  Microscope,
  Building,
  TreePine,
  Coins,
  Radio
} from 'lucide-react';

export interface RealWorldContext {
  id: string;
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
  naturalSubjects: string[];
  suggestedConnections: string[];
  projectExamples: string[];
  gradeRange: {
    min: number;
    max: number;
  };
  color: string;
}

export const REAL_WORLD_CONTEXTS: RealWorldContext[] = [
  {
    id: 'climate-environment',
    name: 'Climate & Environment',
    icon: TreePine,
    description: 'Environmental challenges and sustainability solutions',
    naturalSubjects: ['Science', 'Mathematics', 'Social Studies'],
    suggestedConnections: ['Economics', 'Policy', 'Technology', 'Data Science'],
    projectExamples: [
      'Local watershed quality analysis',
      'School energy audit and reduction plan',
      'Community garden impact study',
      'Carbon footprint calculator app'
    ],
    gradeRange: { min: 3, max: 12 },
    color: 'green'
  },
  {
    id: 'community-justice',
    name: 'Community & Social Justice',
    icon: Users,
    description: 'Addressing inequity and strengthening communities',
    naturalSubjects: ['Social Studies', 'English Language Arts', 'Mathematics'],
    suggestedConnections: ['Art', 'Media Studies', 'Data Science', 'History'],
    projectExamples: [
      'Demographic inequality mapping project',
      'Oral history preservation initiative',
      'Community needs assessment survey',
      'Social justice awareness campaign'
    ],
    gradeRange: { min: 5, max: 12 },
    color: 'purple'
  },
  {
    id: 'innovation-design',
    name: 'Innovation & Design',
    icon: Lightbulb,
    description: 'Creating solutions through design thinking',
    naturalSubjects: ['Engineering', 'Art', 'Technology'],
    suggestedConnections: ['Business', 'Psychology', 'Mathematics', 'Physics'],
    projectExamples: [
      'Assistive device for accessibility',
      'Mobile app for local problem',
      'School space redesign proposal',
      'Sustainable product prototype'
    ],
    gradeRange: { min: 4, max: 12 },
    color: 'blue'
  },
  {
    id: 'health-wellness',
    name: 'Health & Wellness',
    icon: Heart,
    description: 'Promoting physical and mental well-being',
    naturalSubjects: ['Science', 'Physical Education', 'Health'],
    suggestedConnections: ['Psychology', 'Nutrition', 'Statistics', 'Biology'],
    projectExamples: [
      'School wellness program design',
      'Mental health awareness campaign',
      'Fitness tracking and analysis study',
      'Healthy lunch menu optimization'
    ],
    gradeRange: { min: 3, max: 12 },
    color: 'red'
  },
  {
    id: 'culture-identity',
    name: 'Culture & Identity',
    icon: Palette,
    description: 'Exploring heritage and cultural expression',
    naturalSubjects: ['History', 'Art', 'Language Arts'],
    suggestedConnections: ['Music', 'Literature', 'Sociology', 'World Languages'],
    projectExamples: [
      'Cultural heritage digital museum',
      'Immigration stories podcast series',
      'Language preservation project',
      'Identity through art exhibition'
    ],
    gradeRange: { min: 4, max: 12 },
    color: 'orange'
  },
  {
    id: 'scientific-discovery',
    name: 'Scientific Discovery',
    icon: Microscope,
    description: 'Investigating natural phenomena and conducting research',
    naturalSubjects: ['Science', 'Mathematics', 'Technology'],
    suggestedConnections: ['Engineering', 'Statistics', 'Computer Science', 'Writing'],
    projectExamples: [
      'Original scientific research project',
      'Citizen science data collection',
      'Science fair investigation',
      'Research publication for peers'
    ],
    gradeRange: { min: 5, max: 12 },
    color: 'indigo'
  },
  {
    id: 'economic-entrepreneurship',
    name: 'Economics & Entrepreneurship',
    icon: Coins,
    description: 'Understanding markets and creating value',
    naturalSubjects: ['Mathematics', 'Social Studies', 'Business'],
    suggestedConnections: ['Technology', 'Marketing', 'Psychology', 'Design'],
    projectExamples: [
      'Student-run business venture',
      'Economic impact analysis',
      'Financial literacy campaign',
      'Social enterprise design'
    ],
    gradeRange: { min: 6, max: 12 },
    color: 'yellow'
  },
  {
    id: 'media-communication',
    name: 'Media & Communication',
    icon: Radio,
    description: 'Creating and analyzing media messages',
    naturalSubjects: ['English Language Arts', 'Technology', 'Art'],
    suggestedConnections: ['Journalism', 'Film', 'Digital Media', 'Psychology'],
    projectExamples: [
      'School news broadcast production',
      'Documentary film project',
      'Social media literacy campaign',
      'Podcast series on local issues'
    ],
    gradeRange: { min: 5, max: 12 },
    color: 'pink'
  },
  {
    id: 'built-environment',
    name: 'Built Environment',
    icon: Building,
    description: 'Designing and improving physical spaces',
    naturalSubjects: ['Engineering', 'Mathematics', 'Art'],
    suggestedConnections: ['Architecture', 'Urban Planning', 'Environmental Science', 'History'],
    projectExamples: [
      'Playground redesign proposal',
      'Accessible campus modifications',
      'Historical building preservation',
      'Future city planning project'
    ],
    gradeRange: { min: 4, max: 12 },
    color: 'gray'
  }
];

// Helper function to get contexts appropriate for grade level
export function getContextsForGrade(gradeLevel: number): RealWorldContext[] {
  return REAL_WORLD_CONTEXTS.filter(
    context => gradeLevel >= context.gradeRange.min && gradeLevel <= context.gradeRange.max
  );
}

// Helper function to get suggested subjects for a context
export function getSuggestedSubjects(contextId: string): string[] {
  const context = REAL_WORLD_CONTEXTS.find(c => c.id === contextId);
  if (!context) {return [];}
  return [...context.naturalSubjects, ...context.suggestedConnections];
}

// Helper function to find contexts that match selected subjects
export function findMatchingContexts(subjects: string[]): RealWorldContext[] {
  return REAL_WORLD_CONTEXTS.filter(context => {
    const allSubjects = [...context.naturalSubjects, ...context.suggestedConnections];
    return subjects.some(subject => 
      allSubjects.some(contextSubject => 
        contextSubject.toLowerCase().includes(subject.toLowerCase()) ||
        subject.toLowerCase().includes(contextSubject.toLowerCase())
      )
    );
  });
}