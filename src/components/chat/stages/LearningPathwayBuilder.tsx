/**
 * LearningPathwayBuilder.tsx - Complete redesign of Learning Journey
 * Uses road trip metaphor with stations instead of abstract phases
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Map, MapPin, Navigation, Users, BookOpen, Sparkles, 
  ChevronRight, Info, Lightbulb, RefreshCw, CheckCircle,
  Clock, Target, Compass
} from 'lucide-react';
import { textStyles } from '../../../design-system/typography.config';

// Types for the new pathway system
interface Station {
  id: string;
  title: string;
  purpose: string;
  duration: string;
  experiences: Experience[];
  studentVoicePoints: string[];
  status: 'locked' | 'available' | 'active' | 'complete';
}

interface Experience {
  id: string;
  title: string;
  description: string;
  type: 'investigate' | 'create' | 'connect' | 'practice' | 'reflect';
  duration: string;
  grouping: 'individual' | 'pairs' | 'small-group' | 'whole-class';
  studentChoice?: string[];
}

interface PathwayTemplate {
  id: string;
  name: string;
  description: string;
  bestFor: string;
  stations: Station[];
  gradeLevel: 'elementary' | 'middle' | 'high' | 'higher-ed';
}

interface LearningPathwayBuilderProps {
  capturedData: any; // Ideation data
  onPathwayComplete: (pathway: any) => void;
  teacherExperience: 'novice' | 'intermediate' | 'expert';
  gradeLevel: string;
}

// Pathway templates based on grade level and experience
const PATHWAY_TEMPLATES: PathwayTemplate[] = [
  {
    id: 'explore-create-share',
    name: 'Explore → Create → Share',
    description: 'A versatile pathway for discovery-based learning',
    bestFor: 'Projects focused on investigation and creation',
    gradeLevel: 'elementary',
    stations: [
      {
        id: 'explore',
        title: 'Explore & Discover',
        purpose: 'Students investigate the problem space and gather information',
        duration: '1 week',
        experiences: [],
        studentVoicePoints: ['What questions do you have?', 'What interests you most?'],
        status: 'available'
      },
      {
        id: 'create',
        title: 'Design & Create',
        purpose: 'Students develop solutions and build their projects',
        duration: '2 weeks',
        experiences: [],
        studentVoicePoints: ['How do you want to show your learning?', 'What format works best?'],
        status: 'locked'
      },
      {
        id: 'share',
        title: 'Share & Celebrate',
        purpose: 'Students present their work to authentic audiences',
        duration: '3 days',
        experiences: [],
        studentVoicePoints: ['Who should see this?', 'How can we help others?'],
        status: 'locked'
      }
    ]
  },
  {
    id: 'inquiry-cycles',
    name: 'Wonder → Investigate → Create → Reflect',
    description: 'Iterative cycles of inquiry and creation',
    bestFor: 'Research-heavy projects with multiple iterations',
    gradeLevel: 'high',
    stations: [
      {
        id: 'wonder',
        title: 'Wonder & Question',
        purpose: 'Generate questions and refine the driving question',
        duration: '3 days',
        experiences: [],
        studentVoicePoints: ['What do you wonder about?', 'What matters to you?'],
        status: 'available'
      },
      {
        id: 'investigate',
        title: 'Investigate & Research',
        purpose: 'Deep dive into research and data collection',
        duration: '1.5 weeks',
        experiences: [],
        studentVoicePoints: ['What methods will you use?', 'Who will you interview?'],
        status: 'locked'
      },
      {
        id: 'create',
        title: 'Design & Build',
        purpose: 'Prototype and develop solutions',
        duration: '2 weeks',
        experiences: [],
        studentVoicePoints: ['What format best communicates your findings?'],
        status: 'locked'
      },
      {
        id: 'reflect',
        title: 'Reflect & Iterate',
        purpose: 'Assess learning and plan next steps',
        duration: '2 days',
        experiences: [],
        studentVoicePoints: ['What would you do differently?', "What's next?"],
        status: 'locked'
      }
    ]
  }
];

export const LearningPathwayBuilder: React.FC<LearningPathwayBuilderProps> = ({
  capturedData,
  onPathwayComplete,
  teacherExperience,
  gradeLevel
}) => {
  const [currentView, setCurrentView] = useState<'orientation' | 'template' | 'customize' | 'review'>('orientation');
  const [selectedTemplate, setSelectedTemplate] = useState<PathwayTemplate | null>(null);
  const [customizedPathway, setCustomizedPathway] = useState<Station[]>([]);
  const [activeStation, setActiveStation] = useState<string | null>(null);
  
  // Get appropriate templates based on grade level
  const availableTemplates = PATHWAY_TEMPLATES.filter(t => {
    if (gradeLevel.includes('elementary')) return t.gradeLevel === 'elementary';
    if (gradeLevel.includes('middle')) return t.gradeLevel === 'middle';
    if (gradeLevel.includes('high')) return t.gradeLevel === 'high';
    return t.gradeLevel === 'higher-ed';
  });

  return (
    <div className="learning-pathway-builder max-w-6xl mx-auto p-6">
      <AnimatePresence mode="wait">
        {currentView === 'orientation' && (
          <motion.div
            key="orientation"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="orientation-view"
          >
            {/* Welcome and explanation */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-primary-900/20 dark:to-indigo-900/20 rounded-2xl p-8 mb-6">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-white dark:bg-gray-800 rounded-xl shadow-sm">
                  <Map className="w-8 h-8 text-primary-600 dark:text-primary-400" />
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-3">
                    Let's Map Your Learning Pathway
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    Now we'll design the route your students will take from initial curiosity to final mastery.
                    Think of this like planning a road trip:
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                    <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
                      <MapPin className="w-5 h-5 text-amber-500 mb-2" />
                      <h4 className="font-semibold text-gray-900 dark:text-gray-100">Stations</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Major learning destinations</p>
                    </div>
                    <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
                      <Navigation className="w-5 h-5 text-green-500 mb-2" />
                      <h4 className="font-semibold text-gray-900 dark:text-gray-100">Experiences</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">What students do at each stop</p>
                    </div>
                    <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
                      <BookOpen className="w-5 h-5 text-purple-500 mb-2" />
                      <h4 className="font-semibold text-gray-900 dark:text-gray-100">Support</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Resources for the journey</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Context from ideation */}
            {capturedData?.ideation && (
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 mb-6 border border-gray-200 dark:border-gray-700">
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">Your Project Context</h3>
                <div className="space-y-2 text-sm">
                  <p className="text-gray-600 dark:text-gray-400">
                    <span className="font-medium">Big Idea:</span> {capturedData.ideation.bigIdea}
                  </p>
                  <p className="text-gray-600 dark:text-gray-400">
                    <span className="font-medium">Challenge:</span> {capturedData.ideation.challenge}
                  </p>
                </div>
              </div>
            )}

            {/* Time estimate */}
            <div className="flex items-center justify-between bg-primary-50 dark:bg-primary-900/20 rounded-xl p-4 mb-6">
              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                <span className="text-gray-700 dark:text-gray-300">
                  This typically takes 8-12 minutes to design
                </span>
              </div>
              <button
                onClick={() => setCurrentView('template')}
                className="px-6 py-2.5 bg-gradient-to-r from-primary-500 to-indigo-600 text-white rounded-xl font-medium hover:from-primary-600 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                Get Started
                <ChevronRight className="w-4 h-4 inline ml-2" />
              </button>
            </div>
          </motion.div>
        )}

        {currentView === 'template' && (
          <motion.div
            key="template"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="template-selection"
          >
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-3">
              Choose Your Pathway Structure
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Select a proven pathway that fits your project, then customize it for your students.
            </p>

            <div className="grid gap-4">
              {availableTemplates.map((template) => (
                <motion.div
                  key={template.id}
                  whileHover={{ scale: 1.02 }}
                  className={`pathway-template border-2 rounded-xl p-6 cursor-pointer transition-all ${
                    selectedTemplate?.id === template.id
                      ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                      : 'border-gray-200 dark:border-gray-700 hover:border-primary-300'
                  }`}
                  onClick={() => setSelectedTemplate(template)}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-1">
                        {template.name}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {template.description}
                      </p>
                      <p className="text-xs text-primary-600 dark:text-primary-400 mt-2">
                        Best for: {template.bestFor}
                      </p>
                    </div>
                    {selectedTemplate?.id === template.id && (
                      <CheckCircle className="w-6 h-6 text-primary-600 dark:text-primary-400" />
                    )}
                  </div>

                  {/* Visual preview of stations */}
                  <div className="flex items-center gap-2 mt-4">
                    {template.stations.map((station, idx) => (
                      <React.Fragment key={station.id}>
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-xs font-medium">
                            {idx + 1}
                          </div>
                          <span className="text-sm text-gray-700 dark:text-gray-300">
                            {station.title}
                          </span>
                        </div>
                        {idx < template.stations.length - 1 && (
                          <ChevronRight className="w-4 h-4 text-gray-400" />
                        )}
                      </React.Fragment>
                    ))}
                  </div>
                </motion.div>
              ))}

              {/* Build your own option for experienced teachers */}
              {teacherExperience !== 'novice' && (
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className="pathway-template border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-6 cursor-pointer hover:border-primary-300 transition-all"
                  onClick={() => {
                    setSelectedTemplate(null);
                    setCurrentView('customize');
                  }}
                >
                  <div className="flex items-center gap-3">
                    <Sparkles className="w-6 h-6 text-purple-500" />
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                        Build Your Own Pathway
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Start from scratch with complete creative control
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}
            </div>

            <div className="flex justify-between mt-6">
              <button
                onClick={() => setCurrentView('orientation')}
                className="px-6 py-2.5 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
              >
                Back
              </button>
              <button
                onClick={() => {
                  if (selectedTemplate) {
                    setCustomizedPathway(selectedTemplate.stations);
                    setCurrentView('customize');
                  }
                }}
                disabled={!selectedTemplate}
                className={`px-6 py-2.5 rounded-xl font-medium transition-all ${
                  selectedTemplate
                    ? 'bg-gradient-to-r from-primary-500 to-indigo-600 text-white hover:from-primary-600 hover:to-indigo-700 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-400 cursor-not-allowed'
                }`}
              >
                Customize This Pathway
                <ChevronRight className="w-4 h-4 inline ml-2" />
              </button>
            </div>
          </motion.div>
        )}

        {currentView === 'customize' && (
          <motion.div
            key="customize"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="customize-pathway"
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-1">
                  Build Your Learning Experiences
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                  Design what students will do at each station on their journey
                </p>
              </div>
              <button
                onClick={() => setCurrentView('review')}
                className="px-4 py-2 text-sm bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400 rounded-lg font-medium hover:bg-green-200 dark:hover:bg-green-900/30 transition-colors"
              >
                Preview Journey
                <Compass className="w-4 h-4 inline ml-2" />
              </button>
            </div>

            {/* Visual pathway map */}
            <div className="pathway-map bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800/50 dark:to-gray-900/50 rounded-2xl p-6 mb-6">
              <div className="flex items-center justify-between">
                {customizedPathway.map((station, idx) => (
                  <React.Fragment key={station.id}>
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      onClick={() => setActiveStation(station.id)}
                      className={`station-node cursor-pointer transition-all ${
                        activeStation === station.id
                          ? 'scale-110'
                          : ''
                      }`}
                    >
                      <div className={`w-16 h-16 rounded-full flex items-center justify-center font-bold text-lg transition-all ${
                        station.status === 'complete'
                          ? 'bg-green-500 text-white'
                          : station.status === 'active' || activeStation === station.id
                          ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/30'
                          : station.status === 'available'
                          ? 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-2 border-gray-300 dark:border-gray-600'
                          : 'bg-gray-200 dark:bg-gray-800 text-gray-400'
                      }`}>
                        {idx + 1}
                      </div>
                      <p className="text-xs mt-2 text-center font-medium text-gray-700 dark:text-gray-300 max-w-[80px]">
                        {station.title}
                      </p>
                    </motion.div>
                    {idx < customizedPathway.length - 1 && (
                      <div className="flex-1 h-0.5 bg-gray-300 dark:bg-gray-600 relative">
                        <motion.div
                          className="absolute top-0 left-0 h-full bg-gradient-to-r from-green-500 to-amber-500"
                          initial={{ width: '0%' }}
                          animate={{ 
                            width: station.status === 'complete' ? '100%' : '0%' 
                          }}
                          transition={{ duration: 0.5 }}
                        />
                      </div>
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>

            {/* Station detail editor */}
            <AnimatePresence mode="wait">
              {activeStation && (
                <motion.div
                  key={activeStation}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="station-editor bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700"
                >
                  {(() => {
                    const station = customizedPathway.find(s => s.id === activeStation);
                    if (!station) return null;
                    
                    return (
                      <>
                        <div className="flex items-start justify-between mb-6">
                          <div>
                            <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                              Station {customizedPathway.indexOf(station) + 1}: {station.title}
                            </h3>
                            <p className="text-gray-600 dark:text-gray-400">
                              {station.purpose}
                            </p>
                            <div className="flex items-center gap-3 mt-3">
                              <span className="px-3 py-1 bg-primary-100 dark:bg-primary-900/20 text-primary-700 dark:text-primary-400 rounded-lg text-sm font-medium">
                                {station.duration}
                              </span>
                              <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400 rounded-lg text-sm font-medium">
                                {station.experiences.length} experiences
                              </span>
                            </div>
                          </div>
                          <button
                            onClick={() => {
                              const idx = customizedPathway.indexOf(station);
                              const updatedPathway = [...customizedPathway];
                              updatedPathway[idx] = { 
                                ...station, 
                                status: 'complete',
                                experiences: station.experiences.length > 0 ? station.experiences : [
                                  {
                                    id: 'exp-1',
                                    title: 'Sample Experience',
                                    description: 'A learning experience',
                                    type: 'investigate',
                                    duration: '30 min',
                                    grouping: 'small-group',
                                    studentChoice: []
                                  }
                                ]
                              };
                              if (idx < customizedPathway.length - 1) {
                                updatedPathway[idx + 1] = { 
                                  ...updatedPathway[idx + 1], 
                                  status: 'available' 
                                };
                              }
                              setCustomizedPathway(updatedPathway);
                            }}
                            className="px-4 py-2 bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400 rounded-lg font-medium hover:bg-green-200 dark:hover:bg-green-900/30 transition-colors"
                          >
                            Mark Complete
                            <CheckCircle className="w-4 h-4 inline ml-2" />
                          </button>
                        </div>

                        {/* Student Voice Points */}
                        <div className="mb-6 p-4 bg-amber-50 dark:bg-amber-900/20 rounded-xl border border-amber-200 dark:border-amber-800">
                          <h4 className="font-semibold text-amber-900 dark:text-amber-300 mb-3 flex items-center gap-2">
                            <Users className="w-5 h-5" />
                            Student Voice Checkpoints
                          </h4>
                          <p className="text-sm text-amber-800 dark:text-amber-400 mb-3">
                            At this station, students will help shape their learning by answering:
                          </p>
                          <ul className="space-y-2">
                            {station.studentVoicePoints.map((point, idx) => (
                              <li key={idx} className="flex items-start gap-2">
                                <span className="text-amber-600 dark:text-amber-500 mt-0.5">•</span>
                                <span className="text-sm text-amber-700 dark:text-amber-400">{point}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        {/* Experience builder */}
                        <div className="space-y-4">
                          <h4 className="font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                            <Target className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                            Learning Experiences
                          </h4>
                          
                          {/* Quick add experience buttons */}
                          <div className="flex flex-wrap gap-2">
                            {['investigate', 'create', 'connect', 'practice', 'reflect'].map((type) => (
                              <button
                                key={type}
                                onClick={() => {
                                  const newExperience: Experience = {
                                    id: `exp-${Date.now()}`,
                                    title: `New ${type} experience`,
                                    description: '',
                                    type: type as any,
                                    duration: '30 min',
                                    grouping: 'small-group',
                                    studentChoice: []
                                  };
                                  const idx = customizedPathway.indexOf(station);
                                  const updatedPathway = [...customizedPathway];
                                  updatedPathway[idx] = {
                                    ...station,
                                    experiences: [...station.experiences, newExperience]
                                  };
                                  setCustomizedPathway(updatedPathway);
                                }}
                                className="px-3 py-1.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors capitalize"
                              >
                                + {type}
                              </button>
                            ))}
                          </div>

                          {/* Experience cards */}
                          <div className="space-y-3">
                            {station.experiences.map((experience) => (
                              <div
                                key={experience.id}
                                className="experience-card p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-gray-200 dark:border-gray-700"
                              >
                                <div className="flex items-start justify-between mb-2">
                                  <h5 className="font-medium text-gray-900 dark:text-gray-100">
                                    {experience.title}
                                  </h5>
                                  <div className="flex items-center gap-2">
                                    <span className="px-2 py-0.5 bg-primary-100 dark:bg-primary-900/20 text-primary-700 dark:text-primary-400 rounded text-xs font-medium">
                                      {experience.type}
                                    </span>
                                    <span className="px-2 py-0.5 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded text-xs">
                                      {experience.duration}
                                    </span>
                                  </div>
                                </div>
                                {experience.description && (
                                  <p className="text-sm text-gray-600 dark:text-gray-400">
                                    {experience.description}
                                  </p>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      </>
                    );
                  })()}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Navigation */}
            <div className="flex justify-between mt-6">
              <button
                onClick={() => setCurrentView('template')}
                className="px-6 py-2.5 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
              >
                Back to Templates
              </button>
              <button
                onClick={() => setCurrentView('review')}
                className="px-6 py-2.5 bg-gradient-to-r from-primary-500 to-indigo-600 text-white rounded-xl font-medium hover:from-primary-600 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                Review Complete Journey
                <ChevronRight className="w-4 h-4 inline ml-2" />
              </button>
            </div>
          </motion.div>
        )}

        {currentView === 'review' && (
          <motion.div
            key="review"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="review-pathway"
          >
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-3">
              Your Complete Learning Journey
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Review the pathway your students will take. You can always come back and adjust later.
            </p>

            {/* Journey visualization */}
            <div className="journey-timeline bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700">
              {customizedPathway.map((station, idx) => (
                <div key={station.id} className="station-summary mb-6 last:mb-0">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-500 to-indigo-600 text-white flex items-center justify-center font-bold flex-shrink-0">
                      {idx + 1}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-1">
                        {station.title}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                        {station.purpose}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {station.experiences.map((exp) => (
                          <span
                            key={exp.id}
                            className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg text-sm"
                          >
                            {exp.title}
                          </span>
                        ))}
                      </div>
                    </div>
                    <span className="px-3 py-1 bg-primary-100 dark:bg-primary-900/20 text-primary-700 dark:text-primary-400 rounded-lg text-sm font-medium">
                      {station.duration}
                    </span>
                  </div>
                  {idx < customizedPathway.length - 1 && (
                    <div className="ml-6 mt-4 mb-4 border-l-2 border-gray-200 dark:border-gray-700 h-8" />
                  )}
                </div>
              ))}
            </div>

            {/* Action buttons */}
            <div className="flex justify-between mt-6">
              <button
                onClick={() => setCurrentView('customize')}
                className="px-6 py-2.5 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
              >
                Back to Edit
              </button>
              <button
                onClick={() => {
                  onPathwayComplete({
                    stations: customizedPathway,
                    template: selectedTemplate?.id,
                    totalDuration: customizedPathway.reduce((acc, s) => acc + parseInt(s.duration), 0) + ' weeks'
                  });
                }}
                className="px-8 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl font-medium hover:from-green-600 hover:to-green-700 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                Complete Learning Journey
                <CheckCircle className="w-5 h-5 inline ml-2" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default LearningPathwayBuilder;
