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
  onEditStage?: (stageId: string) => void;
  className?: string;
}

export const ProgressSidebar: React.FC<ProgressSidebarProps> = ({
  stages,
  currentStageId,
  isCollapsed = false,
  onToggleCollapse,
  onStageClick,
  onEditStage,
  className = ''
}) => {
  const [hoveredStage, setHoveredStage] = useState<string | null>(null);
  const [hoveredPosition, setHoveredPosition] = useState<number>(0);
  
  // Check if this is being used in mobile mode (no shadow/border styling)
  const isMobileMode = className.includes('border-none shadow-none');

  const getStageIcon = (stage: Stage) => {
    if (stage.status === 'completed') {
      return <Check className="w-5 h-5 text-green-600 dark:text-green-400" />;
    }
    if (stage.id === currentStageId) {
      return <Clock className="w-5 h-5 text-primary-600 dark:text-primary-400 animate-pulse" />;
    }
    return <Circle className="w-5 h-5 text-gray-400 dark:text-gray-500" />;
  };

  const getStageProgress = (stage: Stage): number => {
    if (!stage.substeps || stage.substeps.length === 0) {return 0;}
    const completed = stage.substeps.filter(s => s.completed).length;
    return (completed / stage.substeps.length) * 100;
  };

  return (
    <motion.aside
      className={`bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm transition-all duration-300 ${
        isMobileMode
          ? 'w-full h-full'
          : 'shadow-sm border border-gray-200/50 dark:border-gray-700/50 flex flex-col'
      } ${className}`}
      initial={false}
      animate={isMobileMode ? {} : {
        width: isCollapsed ? 48 : 240,
        borderRadius: isCollapsed ? '24px' : '16px'
      }}
      style={isMobileMode ? {} : {
        height: '100%',
        marginLeft: '6px',
        marginTop: '6px',
        marginBottom: '6px'
      }}
    >
      {/* Toggle Button - Hide in mobile mode */}
      {!isMobileMode && (
        <div className="p-2">
          <button
            onClick={onToggleCollapse}
            className={`p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors w-full flex justify-center ${
              isCollapsed ? 'rounded-full' : 'rounded-lg'
            }`}
            aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            <ChevronRight
              className={`w-4 h-4 text-gray-500 dark:text-gray-400 transition-transform ${
                isCollapsed ? '' : 'rotate-180'
              }`}
            />
          </button>
        </div>
      )}

      {/* Progress Stages - Mobile-optimized container */}
      <div className={`py-2 ${isMobileMode ? 'px-2' : isCollapsed ? 'px-1' : 'px-0'}`}>
        {stages.map((stage, index) => {
          const isActive = stage.id === currentStageId;
          const progress = getStageProgress(stage);
          
          return (
            <div key={stage.id}>
              {/* Stage Item - Mobile-optimized */}
              <motion.div
                className={`relative flex items-center cursor-pointer transition-all touch-manipulation ${
                  isActive
                    ? 'bg-gray-100/70 dark:bg-gray-700/40 ring-1 ring-gray-300/60 dark:ring-gray-600/60'
                    : 'hover:bg-gray-50 dark:hover:bg-gray-700/30'
                } ${
                  isMobileMode
                    ? 'rounded-lg my-0.5 mx-1 px-2 py-2'
                    : isCollapsed
                      ? 'rounded-full my-0.5 mx-auto w-8 h-8 justify-center'
                      : 'rounded-lg my-0.5 mx-1 px-2 py-2'
                }`}
                onClick={() => onStageClick?.(stage.id)}
                onMouseEnter={(e) => {
                  setHoveredStage(stage.id);
                  const rect = e.currentTarget.getBoundingClientRect();
                  setHoveredPosition(rect.top + rect.height / 2);
                }}
                onMouseLeave={() => setHoveredStage(null)}
                whileHover={{ scale: 1.005 }}
                style={isMobileMode ? {} : {}}
              >
                {/* Icon Section */}
                <div className="flex items-center justify-center w-6 h-6">
                  {isCollapsed ? (
                    <div className="relative">
                      {getStageIcon(stage)}
                      {/* Progress indicator for collapsed state */}
                      {progress > 0 && progress < 100 && (
                        <div
                          className="absolute -bottom-0.5 left-0 right-0 h-0.5 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden"
                        >
                          <div
                            className="h-full bg-gray-500 dark:bg-gray-400 transition-all"
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-gray-500 dark:text-gray-400">{stage.icon}</div>
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
                        <span className={`font-medium text-xs ${
                          isActive ? 'text-gray-900 dark:text-gray-100' : 'text-gray-600 dark:text-gray-400'
                        }`}>
                          {stage.label}
                        </span>
                        <div className="flex items-center gap-1">
                          {getStageIcon(stage)}
                        </div>
                      </div>
                      
                      {/* Progress Bar - Simplified style */}
                      {progress > 0 && (
                        <div className="mt-1 h-1 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden">
                          <motion.div
                            className="h-full bg-gray-500 dark:bg-gray-400 rounded-full"
                            initial={{ width: 0 }}
                            animate={{ width: `${progress}%` }}
                            transition={{ duration: 0.3, ease: "easeOut" }}
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
                              className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400"
                            >
                              <div className={`w-1.5 h-1.5 rounded-full ${
                                substep.completed ? 'bg-green-500 dark:bg-green-400' : 'bg-gray-300 dark:bg-gray-600'
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

              {/* Connector Line - Minimal style */}
              {index < stages.length - 1 && !isCollapsed && (
                <div className="flex justify-center">
                  <div className={`h-2 w-px ${
                    stage.status === 'completed' ? 'bg-gray-300 dark:bg-gray-600' : 'bg-gray-200 dark:bg-gray-700'
                  }`} />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Collapsed State Tooltip - Fixed alignment and light mode colors */}
      {isCollapsed && hoveredStage && (
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          className="fixed left-16 z-50 bg-white dark:bg-gray-800 text-gray-900 dark:text-white px-4 py-2 rounded-full text-sm shadow-lg border border-gray-200 dark:border-gray-700"
          style={{
            // Use the captured position for perfect alignment
            top: hoveredPosition - 16, // Offset by half the tooltip height
            transform: 'translateY(-50%)'
          }}
        >
          {stages.find(s => s.id === hoveredStage)?.label}
          {/* Arrow pointer - update colors for light/dark mode */}
          <div className="absolute right-full top-1/2 -translate-y-1/2 w-0 h-0 border-t-4 border-b-4 border-r-4 border-transparent border-r-white dark:border-r-gray-800" />
        </motion.div>
      )}
    </motion.aside>
  );
};

export default ProgressSidebar;
