/**
 * ProgressSidebar.tsx
 * Slim, collapsible progress sidebar for tracking journey stages
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, Check, Circle, Clock, FileText, Lightbulb, Map, Target, Download } from 'lucide-react';

export interface Stage {
  id: string;
  label: string;
  icon: React.ReactNode;
  status: 'pending' | 'in-progress' | 'completed';
  substeps?: {
    id: string;
    label: string;
    completed: boolean;
  }[];
}

interface ProgressSidebarProps {
  stages: Stage[];
  currentStageId: string;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  onStageClick?: (stageId: string) => void;
  className?: string;
}

export const ProgressSidebar: React.FC<ProgressSidebarProps> = ({
  stages,
  currentStageId,
  isCollapsed = false,
  onToggleCollapse,
  onStageClick,
  className = ''
}) => {
  const [hoveredStage, setHoveredStage] = useState<string | null>(null);

  const getStageIcon = (stage: Stage) => {
    if (stage.status === 'completed') {
      return <Check className="w-5 h-5 text-green-600" />;
    }
    if (stage.id === currentStageId) {
      return <Clock className="w-5 h-5 text-blue-600 animate-pulse" />;
    }
    return <Circle className="w-5 h-5 text-gray-400" />;
  };

  const getStageProgress = (stage: Stage): number => {
    if (!stage.substeps || stage.substeps.length === 0) return 0;
    const completed = stage.substeps.filter(s => s.completed).length;
    return (completed / stage.substeps.length) * 100;
  };

  return (
    <motion.aside
      className={`bg-white border-r border-gray-200 shadow-sm transition-all duration-300 ${className}`}
      initial={false}
      animate={{ width: isCollapsed ? 56 : 280 }}
      style={{ height: '100%' }}
    >
      {/* Toggle Button */}
      <div className="p-3 border-b border-gray-100">
        <button
          onClick={onToggleCollapse}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors w-full flex justify-center"
          aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          <ChevronRight 
            className={`w-5 h-5 text-gray-600 transition-transform ${
              isCollapsed ? '' : 'rotate-180'
            }`}
          />
        </button>
      </div>

      {/* Progress Stages */}
      <div className="py-4">
        {stages.map((stage, index) => {
          const isActive = stage.id === currentStageId;
          const progress = getStageProgress(stage);
          
          return (
            <div key={stage.id}>
              {/* Stage Item */}
              <motion.div
                className={`relative flex items-center px-3 py-3 cursor-pointer transition-all ${
                  isActive 
                    ? 'bg-gradient-to-r from-blue-50 to-purple-50 border-l-4 border-blue-600' 
                    : 'hover:bg-gray-50'
                }`}
                onClick={() => onStageClick?.(stage.id)}
                onMouseEnter={() => setHoveredStage(stage.id)}
                onMouseLeave={() => setHoveredStage(null)}
                whileHover={{ x: isCollapsed ? 0 : 2 }}
              >
                {/* Icon Section */}
                <div className="flex items-center justify-center w-8 h-8">
                  {isCollapsed ? (
                    <div className="relative">
                      {getStageIcon(stage)}
                      {/* Progress indicator for collapsed state */}
                      {progress > 0 && progress < 100 && (
                        <div 
                          className="absolute -bottom-1 left-0 right-0 h-1 bg-gray-200 rounded-full overflow-hidden"
                        >
                          <div 
                            className="h-full bg-blue-600 transition-all"
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-gray-600">{stage.icon}</div>
                  )}
                </div>

                {/* Expanded Content */}
                <AnimatePresence>
                  {!isCollapsed && (
                    <motion.div
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      className="ml-3 flex-1"
                    >
                      <div className="flex items-center justify-between">
                        <span className={`font-medium text-sm ${
                          isActive ? 'text-blue-900' : 'text-gray-700'
                        }`}>
                          {stage.label}
                        </span>
                        {getStageIcon(stage)}
                      </div>
                      
                      {/* Progress Bar */}
                      {progress > 0 && (
                        <div className="mt-2 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                          <motion.div 
                            className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
                            initial={{ width: 0 }}
                            animate={{ width: `${progress}%` }}
                            transition={{ duration: 0.5, ease: "easeOut" }}
                          />
                        </div>
                      )}
                      
                      {/* Substeps (show on hover) */}
                      {hoveredStage === stage.id && stage.substeps && stage.substeps.length > 0 && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="mt-2 ml-2 space-y-1"
                        >
                          {stage.substeps.map(substep => (
                            <div 
                              key={substep.id}
                              className="flex items-center gap-2 text-xs text-gray-600"
                            >
                              <div className={`w-1.5 h-1.5 rounded-full ${
                                substep.completed ? 'bg-green-500' : 'bg-gray-300'
                              }`} />
                              <span className={substep.completed ? 'line-through' : ''}>
                                {substep.label}
                              </span>
                            </div>
                          ))}
                        </motion.div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>

              {/* Connector Line */}
              {index < stages.length - 1 && !isCollapsed && (
                <div className="ml-7 pl-0.5">
                  <div className={`h-4 w-0.5 ${
                    stage.status === 'completed' ? 'bg-green-300' : 'bg-gray-200'
                  }`} />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Collapsed State Tooltip */}
      {isCollapsed && hoveredStage && (
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          className="fixed left-16 z-50 bg-gray-900 text-white px-3 py-2 rounded-lg text-sm"
          style={{
            top: stages.findIndex(s => s.id === hoveredStage) * 56 + 100
          }}
        >
          {stages.find(s => s.id === hoveredStage)?.label}
          <div className="absolute right-full top-1/2 -translate-y-1/2 w-0 h-0 border-t-4 border-b-4 border-r-4 border-transparent border-r-gray-900" />
        </motion.div>
      )}
    </motion.aside>
  );
};

export default ProgressSidebar;