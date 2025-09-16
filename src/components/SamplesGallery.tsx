import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, Clock, Users, 
  Calculator, Beaker, BookOpen, Globe, Palette, 
  Music, Code, Heart, Dumbbell, Languages, Theater, Camera,
  ChevronLeft, Star, ArrowRight
} from 'lucide-react';
import { getHeroProjectsMetadata } from '../utils/hero-projects';
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
  image?: string;
};

// Subject to icon mapping with refined colors for Apple HIG compliance
const getSubjectIcon = (subject: string | undefined) => {
  // Always return a valid icon object with Sparkles as the fallback
  if (!subject) {
    return { Icon: Sparkles, color: 'text-primary-600', bgColor: 'bg-primary-50' };
  }

  const subjectLower = subject.toLowerCase();

  // Order matters: check for more specific terms before general ones
  // Check STEM-related first (as STEM projects often have multiple subjects)
  if (subjectLower.includes('stem')) {
    return { Icon: Beaker, color: 'text-purple-600', bgColor: 'bg-purple-50' };
  }
  if (subjectLower.includes('technology') || subjectLower.includes('computer') || subjectLower.includes('coding') || subjectLower.includes('engineering')) {
    return { Icon: Code, color: 'text-cyan-600', bgColor: 'bg-cyan-50' };
  }
  if (subjectLower.includes('science') || subjectLower.includes('biology') || subjectLower.includes('chemistry') || subjectLower.includes('physics')) {
    return { Icon: Beaker, color: 'text-emerald-600', bgColor: 'bg-emerald-50' };
  }
  if (subjectLower.includes('math')) {
    return { Icon: Calculator, color: 'text-primary-600', bgColor: 'bg-primary-50' };
  }

  // Health and Physical Education
  if (subjectLower.includes('health')) {
    return { Icon: Heart, color: 'text-rose-600', bgColor: 'bg-rose-50' };
  }
  if (subjectLower.includes('physical') || subjectLower.includes('pe') || subjectLower.includes('fitness')) {
    return { Icon: Dumbbell, color: 'text-red-600', bgColor: 'bg-red-50' };
  }

  // Language Arts
  if (subjectLower.includes('english') || subjectLower.includes('language arts') || subjectLower.includes('literature')) {
    return { Icon: BookOpen, color: 'text-violet-600', bgColor: 'bg-violet-50' };
  }
  if (subjectLower.includes('language') || subjectLower.includes('spanish') || subjectLower.includes('french')) {
    return { Icon: Languages, color: 'text-teal-600', bgColor: 'bg-teal-50' };
  }

  // Social Studies
  if (subjectLower.includes('social') || subjectLower.includes('history') || subjectLower.includes('geography')) {
    return { Icon: Globe, color: 'text-amber-600', bgColor: 'bg-amber-50' };
  }

  // Arts
  if (subjectLower.includes('art') || subjectLower.includes('visual')) {
    return { Icon: Palette, color: 'text-pink-600', bgColor: 'bg-pink-50' };
  }
  if (subjectLower.includes('music')) {
    return { Icon: Music, color: 'text-indigo-600', bgColor: 'bg-indigo-50' };
  }
  if (subjectLower.includes('theater') || subjectLower.includes('drama')) {
    return { Icon: Theater, color: 'text-purple-600', bgColor: 'bg-purple-50' };
  }
  if (subjectLower.includes('photo')) {
    return { Icon: Camera, color: 'text-slate-600', bgColor: 'bg-slate-50' };
  }

  // Default fallback
  return { Icon: Sparkles, color: 'text-primary-600', bgColor: 'bg-primary-50' };
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
    // Use the simplified hero projects metadata
    const heroProjects = getHeroProjectsMetadata();
    return heroProjects.map((project) => ({
      id: project.id,
      title: project.title,
      subtitle: project.description.substring(0, 150) + '...',
      gradeLevel: project.gradeLevel.includes('High') ? 'high' :
                  project.gradeLevel.includes('Middle') ? 'middle' : 'elementary',
      duration: project.duration,
      subject: project.subject,
      sampleId: project.id,
      featured: true,
      isComplete: true, // All hero projects are complete
      image: project.image, // Include the image if available
    }));
  }, []);

  // No search filtering needed - just use all cards
  const cards = rawCards;

  const gradeAccent = (grade?: string) => {
    switch (grade) {
      case 'early-elementary': return 'from-amber-200 to-amber-100 border-amber-300';
      case 'elementary': return 'from-green-200 to-green-100 border-green-300';
      case 'middle': return 'from-blue-200 to-blue-100 border-primary-300';
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        {/* Navigation now handled in main Header component */}

        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-center mb-16"
        >
          <h1 className="text-4xl md:text-5xl font-semibold text-slate-900 dark:text-white mb-4 tracking-tight">
            See What's Possible with ALF
          </h1>
          <p className="text-xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto leading-relaxed">
            These aren't templates—they're complete project blueprints created with ALF Coach in minutes. Each one includes
            standards alignments, assessment rubrics, differentiation strategies, and everything you need to run transformative PBL.
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
            <div className="text-center mb-16">
              <blockquote className="font-serif text-2xl md:text-3xl font-light text-slate-700 dark:text-slate-300 italic leading-relaxed max-w-4xl mx-auto mb-4">
                "If we do not change the way we teach, 30 years from now, we're going to be in trouble. The knowledge-based approach of 200 years ago will fail our kids, who will never be able to compete with machines."
              </blockquote>
              <cite className="text-base text-slate-500 dark:text-slate-400 font-medium">
                — Jack Ma, Founder of Alibaba Group, World Economic Forum Davos
              </cite>
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
                      className="relative bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm rounded-2xl border border-slate-200/50 dark:border-slate-700/50 overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1 cursor-pointer"
                    >
                      {/* Project Image or Icon */}
                      {project.image ? (
                        <div className="relative w-full h-48 mb-4">
                          <img
                            src={project.image}
                            alt={project.title}
                            className="absolute inset-0 w-full h-full object-cover rounded-t-2xl"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent rounded-t-2xl" />
                        </div>
                      ) : (
                        <div className="p-6 pb-0">
                          {(() => {
                            const iconData = getSubjectIcon(project.subject);

                            // Safety check: ensure Icon component exists
                            if (!iconData || !iconData.Icon) {
                              // Fallback to Sparkles if something goes wrong
                              return (
                                <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary-50 mb-4`}>
                                  <Sparkles className={`w-6 h-6 text-primary-600`} />
                                </div>
                              );
                            }

                            const { Icon, color, bgColor } = iconData;
                            return (
                              <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl ${bgColor} mb-4`}>
                                <Icon className={`w-6 h-6 ${color}`} />
                              </div>
                            );
                          })()}
                        </div>
                      )}

                      <div className={project.image ? "px-6 pb-6" : "px-6 pb-6"}>
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
