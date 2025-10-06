/**
 * FixedProgressSidebar.tsx
 *
 * Fixed sidebar for working draft progress - stays visible while chat scrolls
 * Apple HIG compliant with light mode primary design
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  Circle,
  Clock,
  FileText,
  Target,
  Users,
  Lightbulb,
  MapPin,
  Award
} from 'lucide-react';
import type { PBLStepId } from '../../services/PBLFlowOrchestrator';

interface ProgressItem {
  id: PBLStepId;
  label: string;
  icon: React.ElementType;
  completed: boolean;
  content?: string;
}

interface FixedProgressSidebarProps {
  currentStage: PBLStepId;
  progressItems: ProgressItem[];
  onStageSelect?: (stageId: PBLStepId) => void;
}

export function FixedProgressSidebar({
  currentStage,
  progressItems,
  onStageSelect
}: FixedProgressSidebarProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <motion.aside
      initial={false}
      animate={{ width: isExpanded ? 280 : 64 }}
      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
      className="fixed left-0 top-15 bottom-0 z-[1040] bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-r border-gray-200/50 dark:border-slate-700/50 shadow-sm shadow-gray-900/5 dark:shadow-black/10 overflow-hidden"
    >
      {/* Toggle button */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="absolute top-4 right-2 w-8 h-8 flex items-center justify-center rounded-lg bg-gray-100 dark:bg-slate-800/50 hover:bg-gray-200 dark:hover:bg-slate-700/50 border border-gray-200 dark:border-slate-700/50 transition-colors z-10"
        aria-label={isExpanded ? 'Collapse sidebar' : 'Expand sidebar'}
      >
        {isExpanded ? (
          <ChevronLeft className="w-4 h-4 text-gray-600 dark:text-slate-400" />
        ) : (
          <ChevronRight className="w-4 h-4 text-gray-600 dark:text-slate-400" />
        )}
      </button>

      {/* Scrollable progress items */}
      <div className="h-full overflow-y-auto pt-16 pb-6 px-2 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-slate-600 scrollbar-track-transparent hover:scrollbar-thumb-gray-400 dark:hover:scrollbar-thumb-slate-500">
        <div className="space-y-2">
          {progressItems.map((item, index) => {
            const ItemIcon = item.icon;
            const isCurrent = currentStage === item.id;

            return (
              <button
                key={item.id}
                onClick={() => onStageSelect?.(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${
                  isCurrent
                    ? 'bg-blue-50 dark:bg-blue-500/20 border border-blue-200 dark:border-blue-500/30'
                    : 'hover:bg-gray-100 dark:hover:bg-slate-800/50'
                }`}
                title={!isExpanded ? item.label : undefined}
              >
                {/* Icon + Status */}
                <div className="flex-shrink-0 relative">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                    item.completed
                      ? 'bg-green-50 dark:bg-green-500/20 border border-green-200 dark:border-green-500/30'
                      : isCurrent
                      ? 'bg-blue-50 dark:bg-blue-500/20 border border-blue-200 dark:border-blue-500/30'
                      : 'bg-gray-100 dark:bg-slate-800/50 border border-gray-200 dark:border-slate-700/50'
                  }`}>
                    {item.completed ? (
                      <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
                    ) : isCurrent ? (
                      <ItemIcon className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    ) : (
                      <ItemIcon className="w-4 h-4 text-gray-500 dark:text-slate-400" />
                    )}
                  </div>
                </div>

                {/* Label + Content (only when expanded) */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ opacity: 0, width: 0 }}
                      animate={{ opacity: 1, width: 'auto' }}
                      exit={{ opacity: 0, width: 0 }}
                      transition={{ duration: 0.2 }}
                      className="flex-1 text-left min-w-0"
                    >
                      <div className="text-[13px] font-medium text-gray-900 dark:text-white truncate">
                        {item.label}
                      </div>
                      {item.content && (
                        <div className="text-[11px] text-gray-600 dark:text-slate-400 line-clamp-2 mt-0.5">
                          {item.content}
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Current indicator */}
                {isCurrent && isExpanded && (
                  <div className="w-2 h-2 rounded-full bg-blue-500 dark:bg-blue-400 flex-shrink-0" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Custom scrollbar styles */}
      <style>{`
        .scrollbar-thin::-webkit-scrollbar {
          width: 6px;
        }
        .scrollbar-thin::-webkit-scrollbar-track {
          background: transparent;
        }
        .scrollbar-thin::-webkit-scrollbar-thumb {
          background-color: rgb(209 213 219 / 0.5);
          border-radius: 3px;
        }
        .dark .scrollbar-thin::-webkit-scrollbar-thumb {
          background-color: rgb(71 85 105 / 0.5);
        }
        .scrollbar-thin:hover::-webkit-scrollbar-thumb {
          background-color: rgb(156 163 175 / 0.7);
        }
        .dark .scrollbar-thin:hover::-webkit-scrollbar-thumb {
          background-color: rgb(71 85 105 / 0.7);
        }
      `}</style>
    </motion.aside>
  );
}
