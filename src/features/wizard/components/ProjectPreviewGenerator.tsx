/**
 * ProjectPreviewGenerator.tsx
 * 
 * Shows preview of potential projects based on selected subjects
 * and real-world context to help teachers visualize possibilities
 */

import React from 'react';
import { motion } from 'framer-motion';
import { 
  Clock, 
  Users, 
  BarChart3, 
  Package,
  Zap,
  Target,
  BookOpen,
  Award
} from 'lucide-react';

export interface ProjectPreview {
  id: string;
  title: string;
  description: string;
  subjects: string[];
  duration: string;
  groupSize: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  products: string[];
  assessmentType: string;
  realWorldConnection: string;
  requiredResources: string[];
  color: string;
}

interface ProjectPreviewGeneratorProps {
  selectedSubjects: string[];
  problemContext?: string;
  gradeLevel: number;
  onSelectProject?: (project: ProjectPreview) => void;
}

// Generate project possibilities based on subjects and context
function generateProjectPossibilities(
  subjects: string[],
  context?: string,
  gradeLevel?: number
): ProjectPreview[] {
  const projects: ProjectPreview[] = [];
  
  // Science + Math combination
  if (subjects.includes('Science') && subjects.includes('Mathematics')) {
    projects.push({
      id: 'sci-math-1',
      title: 'Environmental Data Dashboard',
      description: 'Students collect and analyze local environmental data to create an interactive dashboard for the community.',
      subjects: ['Science', 'Mathematics', 'Technology'],
      duration: '4-6 weeks',
      groupSize: '3-4 students',
      difficulty: 'intermediate',
      products: ['Data collection protocol', 'Statistical analysis', 'Interactive dashboard', 'Presentation'],
      assessmentType: 'Portfolio + Presentation',
      realWorldConnection: 'Local environmental agency partnership',
      requiredResources: ['Sensors or data collection tools', 'Computers', 'Spreadsheet software'],
      color: 'green'
    });
  }
  
  // History + ELA combination
  if (subjects.includes('History') && subjects.includes('English Language Arts')) {
    projects.push({
      id: 'hist-ela-1',
      title: 'Voices from the Past',
      description: 'Create a multimedia oral history project documenting local community stories and historical events.',
      subjects: ['History', 'English Language Arts', 'Digital Media'],
      duration: '3-4 weeks',
      groupSize: '2-3 students',
      difficulty: 'beginner',
      products: ['Interview questions', 'Transcriptions', 'Podcast episodes', 'Historical timeline'],
      assessmentType: 'Rubric-based portfolio',
      realWorldConnection: 'Local historical society collaboration',
      requiredResources: ['Recording devices', 'Basic editing software', 'Internet access'],
      color: 'purple'
    });
  }
  
  // Art + Technology combination
  if (subjects.includes('Art') && subjects.includes('Technology')) {
    projects.push({
      id: 'art-tech-1',
      title: 'Digital Art for Social Change',
      description: 'Design and create digital art pieces that address social issues in the community.',
      subjects: ['Art', 'Technology', 'Social Studies'],
      duration: '3-5 weeks',
      groupSize: 'Individual or pairs',
      difficulty: 'intermediate',
      products: ['Digital artwork', 'Artist statement', 'Online gallery', 'Peer critiques'],
      assessmentType: 'Portfolio + Peer review',
      realWorldConnection: 'Virtual gallery for community viewing',
      requiredResources: ['Computers/tablets', 'Digital art software', 'Display space'],
      color: 'pink'
    });
  }
  
  // Engineering + Math + Science (STEM)
  if (subjects.includes('Engineering') || 
      (subjects.includes('Science') && subjects.includes('Mathematics'))) {
    projects.push({
      id: 'stem-1',
      title: 'Sustainable Solutions Lab',
      description: 'Design and prototype a solution to a local sustainability challenge using engineering principles.',
      subjects: ['Engineering', 'Science', 'Mathematics'],
      duration: '6-8 weeks',
      groupSize: '4-5 students',
      difficulty: 'advanced',
      products: ['Problem analysis', 'Design iterations', 'Working prototype', 'Technical report'],
      assessmentType: 'Design portfolio + Demonstration',
      realWorldConnection: 'Present to city council or local businesses',
      requiredResources: ['Prototyping materials', 'Basic tools', 'Design software'],
      color: 'blue'
    });
  }
  
  // Social Studies + Data/Math
  if (subjects.includes('Social Studies') && 
      (subjects.includes('Mathematics') || subjects.includes('Data Science'))) {
    projects.push({
      id: 'social-data-1',
      title: 'Community Needs Assessment',
      description: 'Survey and analyze community needs to propose data-driven solutions to local challenges.',
      subjects: ['Social Studies', 'Mathematics', 'Civics'],
      duration: '4-5 weeks',
      groupSize: '3-4 students',
      difficulty: 'intermediate',
      products: ['Survey design', 'Data analysis', 'Infographic', 'Policy proposal'],
      assessmentType: 'Report + Presentation to stakeholders',
      realWorldConnection: 'Partner with local government or NGO',
      requiredResources: ['Survey tools', 'Spreadsheet software', 'Presentation tools'],
      color: 'orange'
    });
  }
  
  // Interdisciplinary catch-all
  if (subjects.length >= 3) {
    projects.push({
      id: 'inter-1',
      title: 'Innovation Challenge',
      description: 'Tackle a complex real-world problem using knowledge from multiple disciplines to create an innovative solution.',
      subjects: subjects.slice(0, 4),
      duration: '5-7 weeks',
      groupSize: '4-6 students',
      difficulty: 'advanced',
      products: ['Research report', 'Solution prototype', 'Business plan', 'Pitch presentation'],
      assessmentType: 'Comprehensive portfolio',
      realWorldConnection: 'Competition or showcase event',
      requiredResources: ['Varies by project', 'Mentorship', 'Presentation space'],
      color: 'indigo'
    });
  }
  
  // Filter by grade appropriateness if provided
  if (gradeLevel) {
    return projects.filter(p => {
      if (gradeLevel <= 5) {return p.difficulty === 'beginner';}
      if (gradeLevel <= 8) {return p.difficulty !== 'advanced';}
      return true;
    });
  }
  
  return projects;
}

export const ProjectPreviewGenerator: React.FC<ProjectPreviewGeneratorProps> = ({
  selectedSubjects,
  problemContext,
  gradeLevel,
  onSelectProject
}) => {
  const projects = generateProjectPossibilities(selectedSubjects, problemContext, gradeLevel);
  
  if (selectedSubjects.length < 2) {
    return (
      <div className="text-center py-8 text-gray-500 dark:text-gray-400">
        <Package className="w-12 h-12 mx-auto mb-3 opacity-50" />
        <p className="text-sm">Select at least 2 subjects to see project possibilities</p>
      </div>
    );
  }
  
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300';
      case 'intermediate': return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300';
      case 'advanced': return 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300';
      default: return 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300';
    }
  };
  
  const getProjectColor = (color: string) => {
    const colors: Record<string, string> = {
      green: 'from-green-50 to-emerald-50 dark:from-green-900/10 dark:to-emerald-900/10 border-green-200 dark:border-green-800',
      purple: 'from-purple-50 to-pink-50 dark:from-purple-900/10 dark:to-pink-900/10 border-purple-200 dark:border-purple-800',
      pink: 'from-pink-50 to-rose-50 dark:from-pink-900/10 dark:to-rose-900/10 border-pink-200 dark:border-pink-800',
      blue: 'from-blue-50 to-indigo-50 dark:from-primary-900/10 dark:to-indigo-900/10 border-primary-200 dark:border-blue-800',
      orange: 'from-orange-50 to-amber-50 dark:from-orange-900/10 dark:to-amber-900/10 border-orange-200 dark:border-orange-800',
      indigo: 'from-indigo-50 to-purple-50 dark:from-indigo-900/10 dark:to-purple-900/10 border-indigo-200 dark:border-indigo-800'
    };
    return colors[color] || colors.blue;
  };
  
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <Zap className="w-5 h-5 text-yellow-500" />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          Possible Projects with Your Subjects
        </h3>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2">
        {projects.map((project, index) => (
          <motion.div
            key={project.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`
              relative overflow-hidden rounded-xl border p-5
              bg-gradient-to-br ${getProjectColor(project.color)}
              hover:shadow-lg transition-shadow cursor-pointer
            `}
            onClick={() => onSelectProject?.(project)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {/* Header */}
            <div className="mb-4">
              <div className="flex items-start justify-between mb-2">
                <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  {project.title}
                </h4>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(project.difficulty)}`}>
                  {project.difficulty}
                </span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {project.description}
              </p>
            </div>
            
            {/* Subjects */}
            <div className="flex flex-wrap gap-1 mb-3">
              {project.subjects.map((subject) => (
                <span
                  key={subject}
                  className="px-2 py-0.5 bg-white/60 dark:bg-gray-800/60 rounded-full text-xs font-medium text-gray-700 dark:text-gray-300"
                >
                  {subject}
                </span>
              ))}
            </div>
            
            {/* Project Details */}
            <div className="grid grid-cols-2 gap-3 mb-3 text-xs">
              <div className="flex items-center gap-1.5 text-gray-600 dark:text-gray-400">
                <Clock className="w-3.5 h-3.5" />
                <span>{project.duration}</span>
              </div>
              <div className="flex items-center gap-1.5 text-gray-600 dark:text-gray-400">
                <Users className="w-3.5 h-3.5" />
                <span>{project.groupSize}</span>
              </div>
              <div className="flex items-center gap-1.5 text-gray-600 dark:text-gray-400">
                <BarChart3 className="w-3.5 h-3.5" />
                <span>{project.assessmentType}</span>
              </div>
              <div className="flex items-center gap-1.5 text-gray-600 dark:text-gray-400">
                <Target className="w-3.5 h-3.5" />
                <span>{project.realWorldConnection}</span>
              </div>
            </div>
            
            {/* Products */}
            <div className="border-t border-gray-200/50 dark:border-gray-700/50 pt-3">
              <p className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                Student deliverables:
              </p>
              <div className="flex flex-wrap gap-1">
                {project.products.slice(0, 3).map((product, i) => (
                  <span
                    key={i}
                    className="text-xs text-gray-500 dark:text-gray-400"
                  >
                    {product}{i < 2 && i < project.products.length - 1 ? ',' : ''}
                  </span>
                ))}
                {project.products.length > 3 && (
                  <span className="text-xs text-gray-400 dark:text-gray-500">
                    +{project.products.length - 3} more
                  </span>
                )}
              </div>
            </div>
            
            {/* Resources needed indicator */}
            {project.requiredResources.length > 0 && (
              <div className="absolute top-3 right-3">
                <div className="group relative">
                  <BookOpen className="w-4 h-4 text-gray-400" />
                  <div className="absolute right-0 top-full mt-1 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                    <div className="bg-gray-900 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                      Resources: {project.requiredResources.join(', ')}
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {/* Selection indicator */}
            <motion.div
              className="absolute inset-0 border-2 border-primary-500 rounded-xl pointer-events-none"
              initial={{ opacity: 0 }}
              whileHover={{ opacity: 1 }}
              transition={{ duration: 0.2 }}
            />
          </motion.div>
        ))}
      </div>
      
      {projects.length === 0 && (
        <div className="text-center py-8 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
          <Package className="w-12 h-12 mx-auto mb-3 text-gray-400" />
          <p className="text-sm text-gray-600 dark:text-gray-400">
            No projects match your current selection.
            Try adding more subjects or changing your combination.
          </p>
        </div>
      )}
    </div>
  );
};