/**
 * ProgressiveSubjectSelector.tsx
 * 
 * Clean, simple subject selection with progressive disclosure.
 * Shows common subjects first, then allows exploration of specialized areas.
 * Combines simplicity with comprehensive coverage for K-12, AP, and University levels.
 */

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BookOpen,
  Calculator,
  Beaker,
  Globe,
  Palette,
  Music,
  Zap,
  Users,
  Search,
  Plus,
  X,
  ChevronDown,
  ChevronRight,
  Sparkles,
  GraduationCap
} from 'lucide-react';

interface ProgressiveSubjectSelectorProps {
  selectedSubjects: string[];
  onSubjectsChange: (subjects: string[]) => void;
  gradeLevel: number;
  maxSelections?: number;
  className?: string;
}

// Core subject categories with progressive disclosure
const SUBJECT_CATEGORIES = {
  core: {
    title: "Core Subjects",
    description: "Essential academic areas",
    subjects: [
      { name: "Mathematics", icon: Calculator, color: "blue" },
      { name: "Science", icon: Beaker, color: "green" },
      { name: "English Language Arts", icon: BookOpen, color: "purple" },
      { name: "Social Studies", icon: Globe, color: "orange" },
      { name: "Art", icon: Palette, color: "pink" },
      { name: "Music", icon: Music, color: "indigo" }
    ]
  },
  specialized: {
    title: "Specialized Areas",
    description: "Advanced and specialized subjects",
    subjects: [
      { name: "Computer Science", icon: Zap, color: "blue" },
      { name: "Psychology", icon: Users, color: "purple" },
      { name: "Environmental Science", icon: Globe, color: "green" },
      { name: "Economics", icon: Calculator, color: "yellow" },
      { name: "World Languages", icon: Globe, color: "red" },
      { name: "Philosophy", icon: BookOpen, color: "gray" }
    ]
  },
  advanced: {
    title: "Advanced Placement & University",
    description: "College-level coursework",
    subjects: [
      { name: "AP Biology", icon: Beaker, color: "green" },
      { name: "AP Chemistry", icon: Beaker, color: "blue" },
      { name: "AP Physics", icon: Zap, color: "purple" },
      { name: "AP Calculus", icon: Calculator, color: "orange" },
      { name: "AP Literature", icon: BookOpen, color: "red" },
      { name: "AP History", icon: Globe, color: "amber" },
      { name: "Statistics", icon: Calculator, color: "gray" },
      { name: "Linear Algebra", icon: Calculator, color: "indigo" }
    ]
  }
};

const getColorClasses = (color: string, isSelected: boolean = false) => {
  const colors = {
    blue: {
      bg: isSelected ? "bg-blue-50 dark:bg-blue-900/30" : "bg-blue-50/50 dark:bg-blue-900/10",
      text: isSelected ? "text-blue-700 dark:text-blue-300" : "text-blue-600 dark:text-blue-400",
      icon: "text-blue-500",
      border: isSelected ? "border-blue-300 dark:border-blue-600" : "border-blue-200 dark:border-blue-700",
      ring: "ring-blue-500"
    },
    green: {
      bg: isSelected ? "bg-green-50 dark:bg-green-900/30" : "bg-green-50/50 dark:bg-green-900/10",
      text: isSelected ? "text-green-700 dark:text-green-300" : "text-green-600 dark:text-green-400",
      icon: "text-green-500",
      border: isSelected ? "border-green-300 dark:border-green-600" : "border-green-200 dark:border-green-700",
      ring: "ring-green-500"
    },
    purple: {
      bg: isSelected ? "bg-purple-50 dark:bg-purple-900/30" : "bg-purple-50/50 dark:bg-purple-900/10",
      text: isSelected ? "text-purple-700 dark:text-purple-300" : "text-purple-600 dark:text-purple-400",
      icon: "text-purple-500",
      border: isSelected ? "border-purple-300 dark:border-purple-600" : "border-purple-200 dark:border-purple-700",
      ring: "ring-purple-500"
    },
    orange: {
      bg: isSelected ? "bg-orange-50 dark:bg-orange-900/30" : "bg-orange-50/50 dark:bg-orange-900/10",
      text: isSelected ? "text-orange-700 dark:text-orange-300" : "text-orange-600 dark:text-orange-400",
      icon: "text-orange-500",
      border: isSelected ? "border-orange-300 dark:border-orange-600" : "border-orange-200 dark:border-orange-700",
      ring: "ring-orange-500"
    },
    pink: {
      bg: isSelected ? "bg-pink-50 dark:bg-pink-900/30" : "bg-pink-50/50 dark:bg-pink-900/10",
      text: isSelected ? "text-pink-700 dark:text-pink-300" : "text-pink-600 dark:text-pink-400",
      icon: "text-pink-500",
      border: isSelected ? "border-pink-300 dark:border-pink-600" : "border-pink-200 dark:border-pink-700",
      ring: "ring-pink-500"
    },
    indigo: {
      bg: isSelected ? "bg-indigo-50 dark:bg-indigo-900/30" : "bg-indigo-50/50 dark:bg-indigo-900/10",
      text: isSelected ? "text-indigo-700 dark:text-indigo-300" : "text-indigo-600 dark:text-indigo-400",
      icon: "text-indigo-500",
      border: isSelected ? "border-indigo-300 dark:border-indigo-600" : "border-indigo-200 dark:border-indigo-700",
      ring: "ring-indigo-500"
    },
    yellow: {
      bg: isSelected ? "bg-yellow-50 dark:bg-yellow-900/30" : "bg-yellow-50/50 dark:bg-yellow-900/10",
      text: isSelected ? "text-yellow-700 dark:text-yellow-300" : "text-yellow-600 dark:text-yellow-400",
      icon: "text-yellow-500",
      border: isSelected ? "border-yellow-300 dark:border-yellow-600" : "border-yellow-200 dark:border-yellow-700",
      ring: "ring-yellow-500"
    },
    red: {
      bg: isSelected ? "bg-red-50 dark:bg-red-900/30" : "bg-red-50/50 dark:bg-red-900/10",
      text: isSelected ? "text-red-700 dark:text-red-300" : "text-red-600 dark:text-red-400",
      icon: "text-red-500",
      border: isSelected ? "border-red-300 dark:border-red-600" : "border-red-200 dark:border-red-700",
      ring: "ring-red-500"
    },
    amber: {
      bg: isSelected ? "bg-amber-50 dark:bg-amber-900/30" : "bg-amber-50/50 dark:bg-amber-900/10",
      text: isSelected ? "text-amber-700 dark:text-amber-300" : "text-amber-600 dark:text-amber-400",
      icon: "text-amber-500",
      border: isSelected ? "border-amber-300 dark:border-amber-600" : "border-amber-200 dark:border-amber-700",
      ring: "ring-amber-500"
    },
    gray: {
      bg: isSelected ? "bg-gray-50 dark:bg-gray-800" : "bg-gray-50/50 dark:bg-gray-800/50",
      text: isSelected ? "text-gray-700 dark:text-gray-300" : "text-gray-600 dark:text-gray-400",
      icon: "text-gray-500",
      border: isSelected ? "border-gray-300 dark:border-gray-600" : "border-gray-200 dark:border-gray-700",
      ring: "ring-gray-500"
    }
  };
  return colors[color] || colors.blue;
};

export const ProgressiveSubjectSelector: React.FC<ProgressiveSubjectSelectorProps> = ({
  selectedSubjects,
  onSubjectsChange,
  gradeLevel,
  maxSelections = 5,
  className = ""
}) => {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['core']));
  const [searchTerm, setSearchTerm] = useState('');
  const [customSubject, setCustomSubject] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);

  // Determine which sections to show based on grade level
  const getRelevantSections = useCallback(() => {
    const sections = ['core'];
    if (gradeLevel >= 6) sections.push('specialized');
    if (gradeLevel >= 9) sections.push('advanced');
    return sections;
  }, [gradeLevel]);

  const toggleSubject = useCallback((subjectName: string) => {
    const isSelected = selectedSubjects.includes(subjectName);
    let newSelection: string[];
    
    if (isSelected) {
      newSelection = selectedSubjects.filter(s => s !== subjectName);
    } else if (selectedSubjects.length < maxSelections) {
      newSelection = [...selectedSubjects, subjectName];
    } else {
      return; // Don't add if at max
    }
    
    onSubjectsChange(newSelection);
  }, [selectedSubjects, onSubjectsChange, maxSelections]);

  const toggleSection = useCallback((sectionKey: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(sectionKey)) {
      newExpanded.delete(sectionKey);
    } else {
      newExpanded.add(sectionKey);
    }
    setExpandedSections(newExpanded);
  }, [expandedSections]);

  const addCustomSubject = useCallback(() => {
    if (customSubject.trim() && !selectedSubjects.includes(customSubject.trim()) && selectedSubjects.length < maxSelections) {
      onSubjectsChange([...selectedSubjects, customSubject.trim()]);
      setCustomSubject('');
      setShowCustomInput(false);
    }
  }, [customSubject, selectedSubjects, onSubjectsChange, maxSelections]);

  const removeSubject = useCallback((subject: string) => {
    onSubjectsChange(selectedSubjects.filter(s => s !== subject));
  }, [selectedSubjects, onSubjectsChange]);

  // Filter subjects based on search
  const getFilteredSubjects = (subjects: any[]) => {
    if (!searchTerm) return subjects;
    return subjects.filter(subject => 
      subject.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  const relevantSections = getRelevantSections();

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Selected Subjects Summary */}
      {selectedSubjects.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 bg-gradient-to-r from-indigo-50 to-blue-50 dark:from-indigo-900/20 dark:to-blue-900/20 rounded-xl border border-indigo-200 dark:border-indigo-800"
        >
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-medium text-indigo-700 dark:text-indigo-300">
              Selected subjects ({selectedSubjects.length}/{maxSelections})
            </p>
            {selectedSubjects.length >= 2 && (
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full text-xs font-medium">
                <Sparkles className="w-3 h-3" />
                Interdisciplinary ready
              </span>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            {selectedSubjects.map((subject) => (
              <motion.span
                key={subject}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                className="inline-flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-gray-800 rounded-full text-sm font-medium text-indigo-700 dark:text-indigo-300 border border-indigo-300 dark:border-indigo-700 shadow-sm"
              >
                {subject}
                <button
                  onClick={() => removeSubject(subject)}
                  className="hover:text-red-500 transition-colors"
                  aria-label={`Remove ${subject}`}
                >
                  <X className="w-3 h-3" />
                </button>
              </motion.span>
            ))}
          </div>
        </motion.div>
      )}

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search subjects..."
          className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 
                   bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100
                   placeholder-gray-400 dark:placeholder-gray-500
                   focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 dark:focus:border-indigo-400
                   transition-all duration-200"
        />
      </div>

      {/* Subject Categories */}
      <div className="space-y-4">
        {relevantSections.map((sectionKey) => {
          const section = SUBJECT_CATEGORIES[sectionKey];
          const isExpanded = expandedSections.has(sectionKey);
          const filteredSubjects = getFilteredSubjects(section.subjects);
          
          if (searchTerm && filteredSubjects.length === 0) return null;

          return (
            <motion.div
              key={sectionKey}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-white dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden"
            >
              {/* Section Header */}
              <button
                onClick={() => toggleSection(sectionKey)}
                className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg flex items-center justify-center">
                    {sectionKey === 'advanced' ? (
                      <GraduationCap className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                    ) : (
                      <BookOpen className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                    )}
                  </div>
                  <div className="text-left">
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                      {section.title}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {section.description}
                    </p>
                  </div>
                </div>
                <motion.div
                  animate={{ rotate: isExpanded ? 90 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                </motion.div>
              </button>

              {/* Section Content */}
              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                    className="border-t border-gray-200 dark:border-gray-700"
                  >
                    <div className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {filteredSubjects.map((subject, index) => {
                        const isSelected = selectedSubjects.includes(subject.name);
                        const canSelect = !isSelected && selectedSubjects.length < maxSelections;
                        const colorClasses = getColorClasses(subject.color, isSelected);
                        const Icon = subject.icon;

                        return (
                          <motion.button
                            key={subject.name}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: index * 0.05 }}
                            onClick={() => toggleSubject(subject.name)}
                            disabled={!canSelect && !isSelected}
                            className={`
                              p-3 rounded-lg border-2 transition-all duration-200
                              ${colorClasses.bg} ${colorClasses.border} ${colorClasses.text}
                              ${isSelected ? `ring-2 ${colorClasses.ring} ring-opacity-50` : ''}
                              ${canSelect || isSelected ? 'hover:scale-105 cursor-pointer' : 'opacity-50 cursor-not-allowed'}
                              focus:outline-none focus:ring-2 ${colorClasses.ring} focus:ring-opacity-50
                            `}
                          >
                            <div className="flex items-center gap-3">
                              <Icon className={`w-5 h-5 ${colorClasses.icon}`} />
                              <span className="font-medium text-sm">
                                {subject.name}
                              </span>
                            </div>
                          </motion.button>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>

      {/* Custom Subject Input */}
      <div className="relative">
        <AnimatePresence>
          {!showCustomInput ? (
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowCustomInput(true)}
              disabled={selectedSubjects.length >= maxSelections}
              className="w-full p-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl
                       hover:border-indigo-400 dark:hover:border-indigo-500 hover:bg-indigo-50/50 dark:hover:bg-indigo-900/10
                       transition-all duration-200 group disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="flex items-center justify-center gap-2 text-gray-500 dark:text-gray-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                <Plus className="w-5 h-5" />
                <span className="font-medium">Add custom subject</span>
              </div>
            </motion.button>
          ) : (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="flex gap-2"
            >
              <input
                type="text"
                value={customSubject}
                onChange={(e) => setCustomSubject(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    addCustomSubject();
                  } else if (e.key === 'Escape') {
                    setShowCustomInput(false);
                    setCustomSubject('');
                  }
                }}
                placeholder="e.g., Environmental Engineering, Creative Writing"
                className="flex-1 px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700
                         bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100
                         placeholder-gray-400 dark:placeholder-gray-500
                         focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 dark:focus:border-indigo-400
                         transition-all duration-200"
                autoFocus
              />
              <button
                onClick={addCustomSubject}
                disabled={!customSubject.trim() || selectedSubjects.length >= maxSelections}
                className="px-4 py-3 bg-indigo-600 dark:bg-indigo-500 text-white rounded-xl font-medium
                         hover:bg-indigo-700 dark:hover:bg-indigo-600 disabled:bg-gray-300 dark:disabled:bg-gray-700 
                         disabled:cursor-not-allowed transition-all duration-200 shadow-sm hover:shadow-md"
              >
                Add
              </button>
              <button
                onClick={() => {
                  setShowCustomInput(false);
                  setCustomSubject('');
                }}
                className="px-4 py-3 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300
                         border border-gray-200 dark:border-gray-700 rounded-xl transition-colors"
              >
                Cancel
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Selection Status */}
      {selectedSubjects.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-full">
            <div className={`w-2 h-2 rounded-full ${
              selectedSubjects.length >= maxSelections ? 'bg-red-500' : 'bg-green-500'
            }`} />
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {selectedSubjects.length === maxSelections
                ? "Maximum subjects selected"
                : `${maxSelections - selectedSubjects.length} more subjects can be added`
              }
            </span>
          </div>
        </motion.div>
      )}
    </div>
  );
};