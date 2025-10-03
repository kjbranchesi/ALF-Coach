/**
 * IntelligentSubjectSelector.tsx
 * 
 * Smart subject selection that starts with real-world problems
 * and suggests meaningful interdisciplinary connections
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, 
  Link2, 
  ChevronRight, 
  Info,
  Plus,
  X,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { REAL_WORLD_CONTEXTS, RealWorldContext, getSuggestedSubjects } from '../config/realWorldContexts';
import { 
  generateSmartSuggestions, 
  getConnectionStrength,
  type SubjectSuggestion 
} from '../config/subjectConnections';

interface IntelligentSubjectSelectorProps {
  selectedSubjects: string[];
  onSubjectsChange: (subjects: string[]) => void;
  gradeLevel: number;
  onContextSelect?: (contextId: string) => void;
  maxSubjects?: number;
}

export const IntelligentSubjectSelector: React.FC<IntelligentSubjectSelectorProps> = ({
  selectedSubjects,
  onSubjectsChange,
  gradeLevel,
  onContextSelect,
  maxSubjects = 5
}) => {
  const [selectedContext, setSelectedContext] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<SubjectSuggestion[]>([]);
  const [showConnectionRationale, setShowConnectionRationale] = useState<string | null>(null);
  const [customSubject, setCustomSubject] = useState('');

  // Generate suggestions when subjects or context changes
  useEffect(() => {
    const newSuggestions = generateSmartSuggestions({
      gradeLevel,
      currentSubjects: selectedSubjects,
      problemContext: selectedContext || undefined
    });
    setSuggestions(newSuggestions);
  }, [selectedSubjects, selectedContext, gradeLevel]);

  const handleContextSelect = (contextId: string) => {
    setSelectedContext(contextId);
    onContextSelect?.(contextId);
    
    // Auto-suggest subjects for this context
    const context = REAL_WORLD_CONTEXTS.find(c => c.id === contextId);
    if (context) {
      // Add natural subjects automatically
      const newSubjects = [...new Set([...selectedSubjects, ...context.naturalSubjects])];
      onSubjectsChange(newSubjects.slice(0, maxSubjects));
    }
  };

  const handleAddSubject = (subject: string) => {
    if (selectedSubjects.length < maxSubjects && !selectedSubjects.includes(subject)) {
      onSubjectsChange([...selectedSubjects, subject]);
    }
  };

  const handleRemoveSubject = (subject: string) => {
    onSubjectsChange(selectedSubjects.filter(s => s !== subject));
  };

  const handleAddCustomSubject = () => {
    if (customSubject.trim() && !selectedSubjects.includes(customSubject.trim())) {
      handleAddSubject(customSubject.trim());
      setCustomSubject('');
    }
  };

  const getConnectionVisualization = () => {
    if (selectedSubjects.length < 2) {return null;}
    
    // Create pairs and check connection strength
    const connections: Array<{ from: string; to: string; strength: string }> = [];
    for (let i = 0; i < selectedSubjects.length; i++) {
      for (let j = i + 1; j < selectedSubjects.length; j++) {
        const strength = getConnectionStrength(selectedSubjects[i], selectedSubjects[j]);
        if (strength) {
          connections.push({
            from: selectedSubjects[i],
            to: selectedSubjects[j],
            strength
          });
        }
      }
    }
    return connections;
  };

  const getColorForContext = (color: string) => {
    const colors: Record<string, string> = {
      green: 'from-green-400 to-emerald-500',
      purple: 'from-purple-400 to-pink-500',
      blue: 'from-primary-400 to-indigo-500',
      red: 'from-red-400 to-rose-500',
      orange: 'from-orange-400 to-amber-500',
      indigo: 'from-indigo-400 to-purple-500',
      yellow: 'from-yellow-400 to-orange-500',
      pink: 'from-pink-400 to-rose-500',
      gray: 'from-gray-400 to-slate-500'
    };
    return colors[color] || colors.blue;
  };

  return (
    <div className="space-y-6">
      {/* Step 1: Choose Real-World Context */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-primary-500" />
          What interests your students?
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          Start with a real-world problem to naturally create interdisciplinary connections
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {REAL_WORLD_CONTEXTS.filter(
            ctx => gradeLevel >= ctx.gradeRange.min && gradeLevel <= ctx.gradeRange.max
          ).map((context) => {
            const Icon = context.icon;
            const isSelected = selectedContext === context.id;
            
            return (
              <motion.button
                key={context.id}
                onClick={() => handleContextSelect(context.id)}
                className={`
                  relative p-4 rounded-xl border-2 text-left transition-all
                  ${isSelected 
                    ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20' 
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                  }
                `}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="flex items-start gap-3">
                  <div className={`
                    w-10 h-10 rounded-lg bg-gradient-to-br ${getColorForContext(context.color)}
                    flex items-center justify-center text-white
                  `}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900 dark:text-gray-100">
                      {context.name}
                    </h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {context.description}
                    </p>
                  </div>
                  {isSelected && (
                    <CheckCircle2 className="w-5 h-5 text-primary-500 absolute top-3 right-3" />
                  )}
                </div>
                
                {/* Show example projects on hover */}
                <AnimatePresence>
                  {isSelected && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700"
                    >
                      <p className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Example projects:
                      </p>
                      <ul className="text-xs text-gray-500 dark:text-gray-400 space-y-0.5">
                        {context.projectExamples.slice(0, 2).map((example, i) => (
                          <li key={i} className="flex items-start gap-1">
                            <span className="text-primary-500 mt-0.5">•</span>
                            {example}
                          </li>
                        ))}
                      </ul>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Step 2: Smart Subject Assembly */}
      {selectedContext && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <Link2 className="w-5 h-5 text-primary-500" />
            Building your interdisciplinary project
          </h3>
          
          {/* Selected Subjects */}
          <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Selected subjects ({selectedSubjects.length}/{maxSubjects})
            </p>
            <div className="flex flex-wrap gap-2">
              {selectedSubjects.map((subject) => (
                <motion.div
                  key={subject}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                  className="inline-flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-gray-700 
                           border border-primary-300 dark:border-blue-600 rounded-full"
                >
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {subject}
                  </span>
                  <button
                    onClick={() => handleRemoveSubject(subject)}
                    className="text-gray-500 hover:text-red-500 transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </motion.div>
              ))}
              
              {/* Add custom subject */}
              {selectedSubjects.length < maxSubjects && (
                <div className="inline-flex items-center gap-1">
                  <input
                    type="text"
                    value={customSubject}
                    onChange={(e) => setCustomSubject(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleAddCustomSubject()}
                    placeholder="Add custom..."
                    className="px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-full
                             bg-white dark:bg-gray-700 text-sm w-32 focus:outline-none focus:ring-2 
                             focus:ring-blue-500"
                  />
                  {customSubject && (
                    <button
                      onClick={handleAddCustomSubject}
                      className="p-1 rounded-full bg-primary-500 text-white hover:bg-primary-600"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  )}
                </div>
              )}
            </div>
            
            {/* Connection visualization */}
            {selectedSubjects.length >= 2 && (
              <div className="mt-4 p-3 bg-primary-50 dark:bg-primary-900/20 rounded-lg">
                <p className="text-xs font-medium text-primary-700 dark:text-primary-300 mb-2">
                  Subject connections detected:
                </p>
                <div className="space-y-1">
                  {getConnectionVisualization()?.map((conn, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs text-primary-600 dark:text-primary-400">
                      <span>{conn.from}</span>
                      <span className={`
                        px-2 py-0.5 rounded-full text-xs
                        ${conn.strength === 'strong' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300' :
                          conn.strength === 'moderate' ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300' :
                          'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'}
                      `}>
                        {conn.strength}
                      </span>
                      <span>{conn.to}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Smart Suggestions */}
          <div className="space-y-3">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Suggested combinations for powerful projects:
            </p>
            {suggestions.map((suggestion, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      {suggestion.subjects.map((subj, i) => (
                        <React.Fragment key={subj}>
                          <span className={`
                            px-2 py-1 rounded-lg text-sm font-medium
                            ${selectedSubjects.includes(subj)
                              ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300'
                              : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                            }
                          `}>
                            {subj}
                          </span>
                          {i < suggestion.subjects.length - 1 && (
                            <ChevronRight className="w-4 h-4 text-gray-400" />
                          )}
                        </React.Fragment>
                      ))}
                      <span className={`
                        ml-2 px-2 py-0.5 rounded-full text-xs
                        ${suggestion.connectionType === 'natural' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300' :
                          suggestion.connectionType === 'surprising' ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300' :
                          'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300'}
                      `}>
                        {suggestion.connectionType}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                      {suggestion.rationale}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-500 italic">
                      Example: {suggestion.projectExample}
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      const newSubjects = [...new Set([...selectedSubjects, ...suggestion.subjects])];
                      onSubjectsChange(newSubjects.slice(0, maxSubjects));
                    }}
                    disabled={selectedSubjects.length >= maxSubjects}
                    className="ml-4 px-3 py-1 bg-primary-500 text-white rounded-lg hover:bg-primary-600 
                             disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors text-sm"
                  >
                    Use this
                  </button>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Info about interdisciplinary benefits */}
          <div className="flex items-start gap-3 p-4 bg-primary-50 dark:bg-primary-900/10 rounded-xl border border-primary-200 dark:border-blue-800">
            <Info className="w-5 h-5 text-primary-500 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm text-primary-700 dark:text-primary-300 font-medium mb-1">
                Why interdisciplinary projects work
              </p>
              <p className="text-xs text-primary-600 dark:text-primary-400">
                Students see real-world connections, engage multiple intelligences, and develop 
                transferable skills. Your selected combination will create natural differentiation 
                opportunities and deeper understanding.
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};