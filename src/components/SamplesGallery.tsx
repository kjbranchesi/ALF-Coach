import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, Clock, Users, 
  Calculator, Beaker, BookOpen, Globe, Palette, 
  Music, Code, Heart, Dumbbell, Languages, Theater, Camera,
  ChevronLeft, Star, ArrowRight
} from 'lucide-react';
import { getAllSampleBlueprints } from '../utils/sampleBlueprints';
import { auth } from '../firebase/firebase';

type Card = {
  id: string;
  title: string;
  subtitle?: string;
  gradeLevel?: string;
  duration?: string;
  subject?: string;
  sampleId: string;
  featured?: boolean;
  isComplete?: boolean;
};

// Subject to icon mapping with refined colors for Apple HIG compliance
const getSubjectIcon = (subject: string | undefined) => {
  if (!subject) return { Icon: Sparkles, color: 'text-blue-600', bgColor: 'bg-blue-50' };
  
  const subjectLower = subject.toLowerCase();
  
  if (subjectLower.includes('math')) return { Icon: Calculator, color: 'text-blue-600', bgColor: 'bg-blue-50' };
  if (subjectLower.includes('science') || subjectLower.includes('biology') || subjectLower.includes('chemistry') || subjectLower.includes('physics')) return { Icon: Beaker, color: 'text-emerald-600', bgColor: 'bg-emerald-50' };
  if (subjectLower.includes('english') || subjectLower.includes('language arts') || subjectLower.includes('literature')) return { Icon: BookOpen, color: 'text-violet-600', bgColor: 'bg-violet-50' };
  if (subjectLower.includes('social') || subjectLower.includes('history') || subjectLower.includes('geography')) return { Icon: Globe, color: 'text-amber-600', bgColor: 'bg-amber-50' };
  if (subjectLower.includes('art') || subjectLower.includes('visual')) return { Icon: Palette, color: 'text-pink-600', bgColor: 'bg-pink-50' };
  if (subjectLower.includes('music')) return { Icon: Music, color: 'text-indigo-600', bgColor: 'bg-indigo-50' };
  if (subjectLower.includes('technology') || subjectLower.includes('computer') || subjectLower.includes('coding') || subjectLower.includes('engineering')) return { Icon: Code, color: 'text-cyan-600', bgColor: 'bg-cyan-50' };
  if (subjectLower.includes('health')) return { Icon: Heart, color: 'text-rose-600', bgColor: 'bg-rose-50' };
  if (subjectLower.includes('physical') || subjectLower.includes('pe') || subjectLower.includes('fitness')) return { Icon: Dumbbell, color: 'text-red-600', bgColor: 'bg-red-50' };
  if (subjectLower.includes('language') || subjectLower.includes('spanish') || subjectLower.includes('french')) return { Icon: Languages, color: 'text-teal-600', bgColor: 'bg-teal-50' };
  if (subjectLower.includes('theater') || subjectLower.includes('drama')) return { Icon: Theater, color: 'text-purple-600', bgColor: 'bg-purple-50' };
  if (subjectLower.includes('photo')) return { Icon: Camera, color: 'text-slate-600', bgColor: 'bg-slate-50' };
  
  return { Icon: Sparkles, color: 'text-blue-600', bgColor: 'bg-blue-50' };
};

// Map grade levels to friendly display names
const getGradeDisplay = (gradeLevel?: string) => {
  switch (gradeLevel) {
    case 'early-elementary': return 'K-2';
    case 'elementary': return 'Grades 3-5';
    case 'middle': return 'Grades 6-8';
    case 'high': return 'Grades 9-12';
    case 'upper-secondary': return 'Grades 9-12';
    case 'higher-ed': return 'College';
    case 'adult': return 'Adult';
    default: return 'All Ages';
  }
};

export default function SamplesGallery() {
  const navigate = useNavigate();

  const rawCards: Card[] = useMemo(() => {
    const uid = auth.currentUser?.isAnonymous ? 'anonymous' : (auth.currentUser?.uid || 'anonymous');
    const samples = getAllSampleBlueprints(uid);
    return samples.map((s) => ({
      id: s.id,
      title: s.wizardData?.projectTopic || 'Sample Project',
      subtitle: s.ideation?.essentialQuestion || s.ideation?.bigIdea,
      gradeLevel: s.wizardData?.gradeLevel,
      duration: s.wizardData?.duration,
      subject: Array.isArray(s.wizardData?.subjects) ? s.wizardData.subjects.join(', ') : s.wizardData?.subject,
      sampleId: s.id,
      featured: !!s.wizardData?.featured,
      isComplete: ['hero-sustainability-campaign', 'hero-community-history', 'hero-assistive-tech'].includes(s.id), // Mark completed hero projects
    }));
  }, []);

  // No search filtering needed - just use all cards
  const cards = rawCards;

  const gradeAccent = (grade?: string) => {
    switch (grade) {
      case 'early-elementary': return 'from-amber-200 to-amber-100 border-amber-300';
      case 'elementary': return 'from-green-200 to-green-100 border-green-300';
      case 'middle': return 'from-blue-200 to-blue-100 border-blue-300';
      case 'high': return 'from-purple-200 to-purple-100 border-purple-300';
      case 'upper-secondary': return 'from-purple-200 to-purple-100 border-purple-300';
      case 'higher-ed': return 'from-indigo-200 to-indigo-100 border-indigo-300';
      case 'adult': return 'from-rose-200 to-rose-100 border-rose-300';
      default: return 'from-gray-100 to-white border-gray-200';
    }
  };

  // Navigate to project detail page
  const viewProject = (projectId: string) => {
    navigate(`/app/samples/${projectId}`);
  };

  // All projects in one grid - no featured separation

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30 dark:from-slate-900 dark:via-slate-900 dark:to-blue-900/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <button
            onClick={() => navigate('/app/dashboard')}
            className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 transition-colors duration-200"
          >
            <ChevronLeft className="w-4 h-4" />
            Back to Dashboard
          </button>
        </motion.div>

        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-center mb-16"
        >
          <h1 className="text-4xl md:text-5xl font-semibold text-slate-900 dark:text-white mb-4 tracking-tight">
            Project Gallery
          </h1>
          <p className="text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Discover thoughtfully crafted project blueprints designed to inspire authentic learning experiences
          </p>
        </motion.div>


        {/* Projects Grid */}
        {
cards.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <div className="text-center mb-12">
              <h2 className="text-2xl font-semibold text-slate-900 dark:text-white mb-2">Explore Projects</h2>
              <p className="text-slate-600 dark:text-slate-400">World-class PBL examples across subjects and grade levels</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <AnimatePresence>
                {cards.map((project, idx) => (
                  <motion.div
                    key={project.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 20 }}
                    transition={{ duration: 0.3, delay: idx * 0.1 }}
                    className="group relative"
                  >
                    <div 
                      onClick={() => viewProject(project.sampleId)}
                      className="relative bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm rounded-2xl border border-slate-200/50 dark:border-slate-700/50 p-6 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1 cursor-pointer"
                    >
                      {(() => {
                        const { Icon, color, bgColor } = getSubjectIcon(project.subject);
                        return (
                          <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl ${bgColor} mb-4`}>
                            <Icon className={`w-6 h-6 ${color}`} />
                          </div>
                        );
                      })()}
                      
                      <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2 line-clamp-2">
                        {project.title}
                      </h3>
                      
                      {project.subtitle && (
                        <p className="text-sm text-slate-600 dark:text-slate-400 mb-4 line-clamp-2">
                          {project.subtitle}
                        </p>
                      )}
                      
                      <div className="flex flex-col gap-2 mb-4">
                        <span className="text-sm text-slate-600 dark:text-slate-400">
                          <span className="font-medium">{getGradeDisplay(project.gradeLevel)}</span>
                        </span>
                        {project.duration && (
                          <span className="text-sm text-slate-500 dark:text-slate-400">
                            Duration: {project.duration}
                          </span>
                        )}
                      </div>
                      
                      <div className="flex items-center justify-between">
                        {project.isComplete ? (
                          <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                            <Star className="w-3 h-3 fill-current" />
                            Complete
                          </span>
                        ) : (
                          <span className="text-xs text-slate-500 dark:text-slate-400">
                            Preview
                          </span>
                        )}
                        {project.subject && (
                          <span className="text-xs px-2 py-1 rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                            {project.subject.split(',')[0].trim()}
                          </span>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </motion.div>
        )}

        {/* Empty State */}
        {cards.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-center py-16"
          >
            <Sparkles className="w-16 h-16 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-slate-900 dark:text-white mb-2">No projects found</h3>
            <p className="text-slate-600 dark:text-slate-400">Try adjusting your search terms</p>
          </motion.div>
        )}
      </div>
    </div>
  );
}
