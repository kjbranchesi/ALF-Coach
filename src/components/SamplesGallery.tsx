import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
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
  if (subjectLower.includes('technology') || subjectLower.includes('computer') || subjectLower.includes('coding')) return { Icon: Code, color: 'text-cyan-600', bgColor: 'bg-cyan-50' };
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
      isComplete: s.id === 'hero-sustainability-campaign', // Only the sustainability project is complete
    }));
  }, []);

  // No search filtering needed - just use all cards
  const cards = rawCards;

  const gradeAccent = (grade?: string) => {
    switch (grade) {
      case 'early-elementary': return 'from-amber-200 to-amber-100 border-amber-300';
      case 'elementary': return 'from-green-200 to-green-100 border-green-300';
      case 'middle': return 'from-blue-200 to-blue-100 border-blue-300';
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

  // Separate featured/hero project from others
  const heroProject = cards.find(c => c.isComplete);
  const otherProjects = cards.filter(c => !c.isComplete);

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


        {/* Featured Hero Project */}
        {heroProject && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mb-20"
          >
            <div className="text-center mb-8">
              <h2 className="text-2xl font-semibold text-slate-900 dark:text-white mb-2">Featured Project</h2>
              <p className="text-slate-600 dark:text-slate-400">A complete, ready-to-implement learning experience</p>
            </div>
            
            <div className="max-w-4xl mx-auto">
              <div className="relative group cursor-pointer" onClick={() => viewProject(heroProject.sampleId)}>
                <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl blur-2xl opacity-25 group-hover:opacity-40 transition duration-1000"></div>
                <div className="relative bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-2xl border border-white/20 dark:border-slate-700/50 p-8 md:p-12 shadow-xl hover:shadow-2xl transition-all duration-500 group-hover:-translate-y-1">
                  {(() => {
                    const { Icon, color, bgColor } = getSubjectIcon(heroProject.subject);
                    return (
                      <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl ${bgColor} mb-6`}>
                        <Icon className={`w-8 h-8 ${color}`} />
                      </div>
                    );
                  })()}
                  
                  <div className="flex items-center gap-3 mb-4">
                    <h3 className="text-2xl md:text-3xl font-semibold text-slate-900 dark:text-white">
                      {heroProject.title}
                    </h3>
                    <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-sm font-medium">
                      <Star className="w-4 h-4 fill-current" />
                      Ready to Launch
                    </div>
                  </div>
                  
                  {heroProject.subtitle && (
                    <p className="text-lg text-slate-600 dark:text-slate-300 mb-6 leading-relaxed">
                      {heroProject.subtitle}
                    </p>
                  )}
                  
                  <div className="flex flex-wrap gap-3 mb-8">
                    <span className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 text-sm">
                      <Users className="w-4 h-4" />
                      {getGradeDisplay(heroProject.gradeLevel)}
                    </span>
                    {heroProject.subject && (
                      <span className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 text-sm">
                        {heroProject.subject}
                      </span>
                    )}
                    {heroProject.duration && (
                      <span className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 text-sm">
                        <Clock className="w-4 h-4" />
                        {heroProject.duration}
                      </span>
                    )}
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-500 dark:text-slate-400">
                      Click to explore this complete project
                    </span>
                    <ArrowRight className="w-6 h-6 text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transform group-hover:translate-x-2 transition-all duration-300" />
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Other Projects Grid */}
        {otherProjects.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <div className="text-center mb-12">
              <h2 className="text-2xl font-semibold text-slate-900 dark:text-white mb-2">Coming Soon</h2>
              <p className="text-slate-600 dark:text-slate-400">Additional projects currently in development</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <AnimatePresence>
                {otherProjects.map((project, idx) => (
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
                        <span className="text-xs text-slate-500 dark:text-slate-400 italic">
                          In Development
                        </span>
                        {project.subject && (
                          <span className="text-xs px-2 py-1 rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                            {project.subject}
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
            <Search className="w-16 h-16 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-slate-900 dark:text-white mb-2">No projects found</h3>
            <p className="text-slate-600 dark:text-slate-400">Try adjusting your search terms</p>
          </motion.div>
        )}
      </div>
    </div>
  );
}
