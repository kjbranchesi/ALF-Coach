/**
 * Comprehensive Subjects Configuration
 * 
 * Organized subject taxonomy for K-12, AP, and University levels
 * Supports progressive disclosure and smart categorization
 */

import {
  BookOpen,
  Calculator,
  Beaker,
  Globe,
  Palette,
  Music,
  Zap,
  Users,
  Heart,
  Briefcase,
  Languages,
  Camera,
  Cpu,
  Dumbbell,
  TreePine,
  Building,
  Lightbulb,
  Microscope,
  PieChart,
  Code,
  Gavel,
  Stethoscope,
  Newspaper,
  Theater,
  Wrench
} from 'lucide-react';

export interface Subject {
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  description?: string;
  gradeRange: {
    min: number;
    max: number;
  };
  category: SubjectCategory;
  isAP?: boolean;
  isUniversity?: boolean;
  prerequisites?: string[];
  relatedSubjects?: string[];
}

export type SubjectCategory = 
  | 'core'
  | 'arts'
  | 'sciences'
  | 'languages'
  | 'practical'
  | 'advanced'
  | 'specialized';

export const COMPREHENSIVE_SUBJECTS: Subject[] = [
  // Core Academic Subjects (K-12)
  {
    name: 'Mathematics',
    icon: Calculator,
    color: 'blue',
    description: 'Numbers, algebra, geometry, and mathematical reasoning',
    gradeRange: { min: 1, max: 12 },
    category: 'core',
    relatedSubjects: ['Science', 'Engineering', 'Computer Science', 'Economics']
  },
  {
    name: 'English Language Arts',
    icon: BookOpen,
    color: 'purple',
    description: 'Reading, writing, grammar, and literature',
    gradeRange: { min: 1, max: 12 },
    category: 'core',
    relatedSubjects: ['History', 'Social Studies', 'World Languages', 'Theater']
  },
  {
    name: 'Science',
    icon: Beaker,
    color: 'green',
    description: 'General science, scientific method, and inquiry',
    gradeRange: { min: 1, max: 8 },
    category: 'core',
    relatedSubjects: ['Mathematics', 'Technology', 'Environmental Science']
  },
  {
    name: 'Social Studies',
    icon: Globe,
    color: 'orange',
    description: 'History, geography, civics, and cultures',
    gradeRange: { min: 1, max: 12 },
    category: 'core',
    relatedSubjects: ['English Language Arts', 'World Languages', 'Economics']
  },

  // Sciences (Middle & High School)
  {
    name: 'Biology',
    icon: Microscope,
    color: 'green',
    description: 'Living organisms and life processes',
    gradeRange: { min: 9, max: 12 },
    category: 'sciences',
    relatedSubjects: ['Chemistry', 'Environmental Science', 'Health', 'Mathematics']
  },
  {
    name: 'Chemistry',
    icon: Beaker,
    color: 'blue',
    description: 'Matter, atoms, molecules, and chemical reactions',
    gradeRange: { min: 10, max: 12 },
    category: 'sciences',
    prerequisites: ['Algebra'],
    relatedSubjects: ['Physics', 'Biology', 'Mathematics']
  },
  {
    name: 'Physics',
    icon: Zap,
    color: 'purple',
    description: 'Matter, energy, motion, and fundamental forces',
    gradeRange: { min: 11, max: 12 },
    category: 'sciences',
    prerequisites: ['Trigonometry'],
    relatedSubjects: ['Mathematics', 'Engineering', 'Chemistry']
  },
  {
    name: 'Environmental Science',
    icon: TreePine,
    color: 'green',
    description: 'Ecosystems, sustainability, and environmental challenges',
    gradeRange: { min: 9, max: 12 },
    category: 'sciences',
    relatedSubjects: ['Biology', 'Chemistry', 'Social Studies', 'Mathematics']
  },

  // Arts & Creative
  {
    name: 'Art',
    icon: Palette,
    color: 'pink',
    description: 'Visual arts, creativity, and artistic expression',
    gradeRange: { min: 1, max: 12 },
    category: 'arts',
    relatedSubjects: ['Technology', 'History', 'Design']
  },
  {
    name: 'Music',
    icon: Music,
    color: 'indigo',
    description: 'Musical theory, performance, and appreciation',
    gradeRange: { min: 1, max: 12 },
    category: 'arts',
    relatedSubjects: ['Mathematics', 'Physics', 'Theater']
  },
  {
    name: 'Theater',
    icon: Theater,
    color: 'purple',
    description: 'Drama, performance, and theatrical arts',
    gradeRange: { min: 3, max: 12 },
    category: 'arts',
    relatedSubjects: ['English Language Arts', 'Music', 'History']
  },
  {
    name: 'Photography',
    icon: Camera,
    color: 'gray',
    description: 'Visual storytelling through photography',
    gradeRange: { min: 6, max: 12 },
    category: 'arts',
    relatedSubjects: ['Art', 'Technology', 'Journalism']
  },

  // Languages
  {
    name: 'World Languages',
    icon: Languages,
    color: 'red',
    description: 'Foreign language acquisition and cultural understanding',
    gradeRange: { min: 1, max: 12 },
    category: 'languages',
    relatedSubjects: ['Social Studies', 'English Language Arts', 'Culture Studies']
  },

  // Practical & Life Skills
  {
    name: 'Physical Education',
    icon: Dumbbell,
    color: 'orange',
    description: 'Physical fitness, health, and wellness',
    gradeRange: { min: 1, max: 12 },
    category: 'practical',
    relatedSubjects: ['Health', 'Biology', 'Psychology']
  },
  {
    name: 'Health',
    icon: Heart,
    color: 'red',
    description: 'Personal health, nutrition, and wellness',
    gradeRange: { min: 3, max: 12 },
    category: 'practical',
    relatedSubjects: ['Biology', 'Physical Education', 'Psychology']
  },
  {
    name: 'Engineering',
    icon: Wrench,
    color: 'gray',
    description: 'Design thinking and engineering principles',
    gradeRange: { min: 6, max: 12 },
    category: 'practical',
    relatedSubjects: ['Mathematics', 'Physics', 'Technology', 'Art']
  },

  // Advanced & Specialized (High School+)
  {
    name: 'Computer Science',
    icon: Code,
    color: 'blue',
    description: 'Programming, algorithms, and computational thinking',
    gradeRange: { min: 6, max: 12 },
    category: 'advanced',
    relatedSubjects: ['Mathematics', 'Logic', 'Engineering']
  },
  {
    name: 'Psychology',
    icon: Users,
    color: 'purple',
    description: 'Human behavior, cognition, and mental processes',
    gradeRange: { min: 10, max: 12 },
    category: 'advanced',
    relatedSubjects: ['Biology', 'Statistics', 'Philosophy', 'Sociology']
  },
  {
    name: 'Economics',
    icon: PieChart,
    color: 'yellow',
    description: 'Markets, trade, and economic systems',
    gradeRange: { min: 9, max: 12 },
    category: 'advanced',
    relatedSubjects: ['Mathematics', 'Social Studies', 'Business']
  },
  {
    name: 'Business',
    icon: Briefcase,
    color: 'blue',
    description: 'Entrepreneurship, management, and business principles',
    gradeRange: { min: 9, max: 12 },
    category: 'advanced',
    relatedSubjects: ['Economics', 'Mathematics', 'Psychology']
  },
  {
    name: 'Philosophy',
    icon: Lightbulb,
    color: 'indigo',
    description: 'Logic, ethics, and philosophical reasoning',
    gradeRange: { min: 10, max: 12 },
    category: 'advanced',
    relatedSubjects: ['English Language Arts', 'History', 'Psychology']
  },
  {
    name: 'Journalism',
    icon: Newspaper,
    color: 'gray',
    description: 'Media literacy, reporting, and communication',
    gradeRange: { min: 8, max: 12 },
    category: 'advanced',
    relatedSubjects: ['English Language Arts', 'Technology', 'Social Studies']
  },

  // AP Subjects
  {
    name: 'AP Biology',
    icon: Microscope,
    color: 'green',
    description: 'Advanced placement college-level biology',
    gradeRange: { min: 10, max: 12 },
    category: 'advanced',
    isAP: true,
    prerequisites: ['Biology', 'Chemistry'],
    relatedSubjects: ['Chemistry', 'Environmental Science', 'Statistics']
  },
  {
    name: 'AP Chemistry',
    icon: Beaker,
    color: 'blue',
    description: 'Advanced placement college-level chemistry',
    gradeRange: { min: 11, max: 12 },
    category: 'advanced',
    isAP: true,
    prerequisites: ['Chemistry', 'Algebra II'],
    relatedSubjects: ['Physics', 'Biology', 'Calculus']
  },
  {
    name: 'AP Physics',
    icon: Zap,
    color: 'purple',
    description: 'Advanced placement college-level physics',
    gradeRange: { min: 11, max: 12 },
    category: 'advanced',
    isAP: true,
    prerequisites: ['Physics', 'Calculus or concurrent'],
    relatedSubjects: ['Calculus', 'Chemistry', 'Engineering']
  },
  {
    name: 'AP Calculus',
    icon: Calculator,
    color: 'blue',
    description: 'Advanced placement college-level calculus',
    gradeRange: { min: 11, max: 12 },
    category: 'advanced',
    isAP: true,
    prerequisites: ['Pre-Calculus'],
    relatedSubjects: ['Physics', 'Engineering', 'Computer Science']
  },
  {
    name: 'AP Literature',
    icon: BookOpen,
    color: 'purple',
    description: 'Advanced placement literature and composition',
    gradeRange: { min: 11, max: 12 },
    category: 'advanced',
    isAP: true,
    relatedSubjects: ['History', 'Philosophy', 'Creative Writing']
  },
  {
    name: 'AP History',
    icon: Building,
    color: 'amber',
    description: 'Advanced placement world or US history',
    gradeRange: { min: 10, max: 12 },
    category: 'advanced',
    isAP: true,
    relatedSubjects: ['English Language Arts', 'Economics', 'Political Science']
  },
  {
    name: 'AP Computer Science',
    icon: Cpu,
    color: 'blue',
    description: 'Advanced placement computer science principles',
    gradeRange: { min: 10, max: 12 },
    category: 'advanced',
    isAP: true,
    relatedSubjects: ['Mathematics', 'Logic', 'Engineering']
  },

  // University-Level Specialized
  {
    name: 'Statistics',
    icon: PieChart,
    color: 'green',
    description: 'Data analysis, probability, and statistical methods',
    gradeRange: { min: 11, max: 12 },
    category: 'advanced',
    isUniversity: true,
    prerequisites: ['Algebra II'],
    relatedSubjects: ['Mathematics', 'Psychology', 'Economics', 'Science']
  },
  {
    name: 'Linear Algebra',
    icon: Calculator,
    color: 'indigo',
    description: 'Advanced mathematics with vectors and matrices',
    gradeRange: { min: 12, max: 12 },
    category: 'advanced',
    isUniversity: true,
    prerequisites: ['Calculus'],
    relatedSubjects: ['Computer Science', 'Physics', 'Engineering']
  },
  {
    name: 'Biomedical Sciences',
    icon: Stethoscope,
    color: 'red',
    description: 'Medical sciences and healthcare applications',
    gradeRange: { min: 11, max: 12 },
    category: 'specialized',
    isUniversity: true,
    prerequisites: ['Biology', 'Chemistry'],
    relatedSubjects: ['Physics', 'Psychology', 'Ethics']
  },
  {
    name: 'Legal Studies',
    icon: Gavel,
    color: 'gray',
    description: 'Law, legal systems, and jurisprudence',
    gradeRange: { min: 11, max: 12 },
    category: 'specialized',
    isUniversity: true,
    relatedSubjects: ['History', 'Philosophy', 'English Language Arts', 'Ethics']
  }
];

// Utility functions for subject management

export function getSubjectsByGrade(gradeLevel: number): Subject[] {
  return COMPREHENSIVE_SUBJECTS.filter(
    subject => gradeLevel >= subject.gradeRange.min && gradeLevel <= subject.gradeRange.max
  );
}

export function getSubjectsByCategory(category: SubjectCategory): Subject[] {
  return COMPREHENSIVE_SUBJECTS.filter(subject => subject.category === category);
}

export function getCoreSubjects(): Subject[] {
  return getSubjectsByCategory('core');
}

export function getAdvancedSubjects(): Subject[] {
  return COMPREHENSIVE_SUBJECTS.filter(subject => subject.isAP || subject.isUniversity);
}

export function getRelatedSubjects(subjectName: string): Subject[] {
  const subject = COMPREHENSIVE_SUBJECTS.find(s => s.name === subjectName);
  if (!subject || !subject.relatedSubjects) {return [];}
  
  return COMPREHENSIVE_SUBJECTS.filter(s => 
    subject.relatedSubjects!.includes(s.name)
  );
}

export function searchSubjects(query: string): Subject[] {
  const lowercaseQuery = query.toLowerCase();
  return COMPREHENSIVE_SUBJECTS.filter(subject =>
    subject.name.toLowerCase().includes(lowercaseQuery) ||
    subject.description?.toLowerCase().includes(lowercaseQuery)
  );
}

export function getSubjectsByLevel(level: 'elementary' | 'middle' | 'high' | 'university'): Subject[] {
  const gradeRanges = {
    elementary: { min: 1, max: 5 },
    middle: { min: 6, max: 8 },
    high: { min: 9, max: 12 },
    university: { min: 13, max: 16 }
  };
  
  const range = gradeRanges[level];
  return COMPREHENSIVE_SUBJECTS.filter(subject =>
    subject.gradeRange.max >= range.min && subject.gradeRange.min <= range.max
  );
}

export function canTakeSubject(subjectName: string, completedSubjects: string[]): boolean {
  const subject = COMPREHENSIVE_SUBJECTS.find(s => s.name === subjectName);
  if (!subject || !subject.prerequisites) {return true;}
  
  return subject.prerequisites.every(prereq =>
    completedSubjects.some(completed => 
      completed.toLowerCase().includes(prereq.toLowerCase())
    )
  );
}

// Subject combinations that work well together
export const RECOMMENDED_COMBINATIONS = [
  {
    name: "STEM Foundation",
    subjects: ["Mathematics", "Science", "Technology"],
    description: "Perfect for project-based learning in science and engineering"
  },
  {
    name: "Humanities Core",
    subjects: ["English Language Arts", "Social Studies", "Art"],
    description: "Ideal for storytelling and cultural exploration projects"
  },
  {
    name: "Creative Arts",
    subjects: ["Art", "Music", "Theater"],
    description: "Multi-modal creative expression and performance"
  },
  {
    name: "Data Science",
    subjects: ["Mathematics", "Computer Science", "Statistics"],
    description: "Modern analytical and computational skills"
  },
  {
    name: "Environmental Studies",
    subjects: ["Environmental Science", "Biology", "Social Studies"],
    description: "Interdisciplinary approach to sustainability challenges"
  },
  {
    name: "Digital Media",
    subjects: ["Technology", "Art", "Journalism"],
    description: "21st-century communication and media creation"
  }
];

export default COMPREHENSIVE_SUBJECTS;