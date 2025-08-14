/**
 * ContextualHelp.tsx
 * 
 * Context-aware help panel that provides relevant guidance
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  HelpCircle, 
  X, 
  Lightbulb, 
  BookOpen, 
  ChevronRight,
  ExternalLink 
} from 'lucide-react';
import { getContextualHelp } from '../../utils/contextualHelp';

interface ContextualHelpProps {
  stage: string;
  isOpen: boolean;
  onClose: () => void;
}

export const ContextualHelp: React.FC<ContextualHelpProps> = ({
  stage,
  isOpen,
  onClose
}) => {
  const [expandedSection, setExpandedSection] = useState<string | null>('tips');
  const helpContent = getContextualHelp(stage);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, x: 300 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 300 }}
        className="fixed right-4 bottom-24 w-80 bg-white rounded-2xl shadow-elevation-3 
                   border border-gray-200 overflow-hidden z-40"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-primary-50 to-primary-100 px-4 py-3 
                        flex items-center justify-between border-b border-primary-200">
          <div className="flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-primary-600" />
            <h3 className="font-semibold text-primary-900">{helpContent.title}</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-primary-200 rounded-lg transition-colors"
          >
            <X className="w-4 h-4 text-primary-600" />
          </button>
        </div>

        {/* Content */}
        <div className="max-h-96 overflow-y-auto">
          {/* Tips Section */}
          <div className="border-b border-gray-100">
            <button
              onClick={() => setExpandedSection(expandedSection === 'tips' ? null : 'tips')}
              className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 
                       transition-colors text-left"
            >
              <div className="flex items-center gap-2">
                <Lightbulb className="w-4 h-4 text-warning-600" />
                <span className="font-medium text-gray-900">Tips</span>
              </div>
              <ChevronRight 
                className={`w-4 h-4 text-gray-400 transition-transform ${
                  expandedSection === 'tips' ? 'rotate-90' : ''
                }`} 
              />
            </button>
            <AnimatePresence>
              {expandedSection === 'tips' && (
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: 'auto' }}
                  exit={{ height: 0 }}
                  className="overflow-hidden"
                >
                  <div className="px-4 pb-3 space-y-2">
                    {helpContent.tips.map((tip, index) => (
                      <div key={index} className="flex items-start gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary-400 mt-1.5 flex-shrink-0" />
                        <p className="text-sm text-gray-600">{tip}</p>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Examples Section */}
          {helpContent.examples && helpContent.examples.length > 0 && (
            <div className="border-b border-gray-100">
              <button
                onClick={() => setExpandedSection(expandedSection === 'examples' ? null : 'examples')}
                className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 
                         transition-colors text-left"
              >
                <div className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-success-600" />
                  <span className="font-medium text-gray-900">Examples</span>
                </div>
                <ChevronRight 
                  className={`w-4 h-4 text-gray-400 transition-transform ${
                    expandedSection === 'examples' ? 'rotate-90' : ''
                  }`} 
                />
              </button>
              <AnimatePresence>
                {expandedSection === 'examples' && (
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: 'auto' }}
                    exit={{ height: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="px-4 pb-3 space-y-2">
                      {helpContent.examples.map((example, index) => (
                        <div 
                          key={index} 
                          className="p-2 bg-gray-50 rounded-lg border border-gray-200"
                        >
                          <p className="text-sm text-gray-700 italic">"{example}"</p>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}

          {/* Resources Section */}
          {helpContent.resources && helpContent.resources.length > 0 && (
            <div>
              <button
                onClick={() => setExpandedSection(expandedSection === 'resources' ? null : 'resources')}
                className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 
                         transition-colors text-left"
              >
                <div className="flex items-center gap-2">
                  <ExternalLink className="w-4 h-4 text-ai-600" />
                  <span className="font-medium text-gray-900">Resources</span>
                </div>
                <ChevronRight 
                  className={`w-4 h-4 text-gray-400 transition-transform ${
                    expandedSection === 'resources' ? 'rotate-90' : ''
                  }`} 
                />
              </button>
              <AnimatePresence>
                {expandedSection === 'resources' && (
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: 'auto' }}
                    exit={{ height: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="px-4 pb-3 space-y-2">
                      {helpContent.resources.map((resource, index) => (
                        <a
                          key={index}
                          href={resource.url || '#'}
                          className="flex items-center justify-between p-2 hover:bg-primary-50 
                                   rounded-lg transition-colors group"
                        >
                          <span className="text-sm text-primary-600 group-hover:text-primary-700">
                            {resource.label}
                          </span>
                          <ExternalLink className="w-3 h-3 text-primary-400" />
                        </a>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-3 bg-gray-50 border-t border-gray-200">
          <p className="text-xs text-gray-500">
            Stage: {stage.replace(/_/g, ' ').toLowerCase()}
          </p>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

// Quick help tooltip component
export const QuickHelp: React.FC<{ stage: string }> = ({ stage }) => {
  const [showTooltip, setShowTooltip] = useState(false);
  const help = getContextualHelp(stage);

  return (
    <div className="relative">
      <button
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
      >
        <HelpCircle className="w-4 h-4 text-gray-400" />
      </button>
      
      <AnimatePresence>
        {showTooltip && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="absolute right-0 top-8 w-64 p-3 bg-white rounded-lg shadow-elevation-2 
                     border border-gray-200 z-50"
          >
            <p className="text-xs font-medium text-gray-700 mb-2">{help.title}</p>
            <ul className="space-y-1">
              {help.tips.slice(0, 2).map((tip, index) => (
                <li key={index} className="text-xs text-gray-600 flex items-start gap-1">
                  <span className="text-primary-500">•</span>
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ContextualHelp;