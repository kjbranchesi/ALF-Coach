/**
 * CompactHeader.tsx
 *
 * Compact fixed header for chat interface - reduces vertical space from 250px to 60px
 * Apple HIG compliant with soft rounded corners and subtle shadows
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronDown,
  Save,
  HelpCircle,
  CheckCircle,
  Circle,
  FileText
} from 'lucide-react';
import type { PBLStepId } from '../../services/PBLFlowOrchestrator';

interface Stage {
  id: PBLStepId;
  label: string;
  description: string;
  icon: React.ElementType;
  completed: boolean;
}

interface CompactHeaderProps {
  currentStage: PBLStepId;
  currentStageLabel: string;
  currentStageDescription: string;
  currentStageIcon: React.ElementType;
  totalStages: number;
  currentStageIndex: number;
  stages: Stage[];
  onStageSelect: (stageId: PBLStepId) => void;
  onSave?: () => void;
  onHelp?: () => void;
}

export function CompactHeader({
  currentStage,
  currentStageLabel,
  currentStageDescription,
  currentStageIcon: CurrentIcon,
  totalStages,
  currentStageIndex,
  stages,
  onStageSelect,
  onSave,
  onHelp
}: CompactHeaderProps) {
  const [showStageDropdown, setShowStageDropdown] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 h-15 z-[1050] bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-b border-gray-200/50 dark:border-slate-700/50 shadow-sm shadow-gray-900/5 dark:shadow-black/10">
      <div className="flex items-center justify-between h-full px-4">
        {/* Left: Logo + Compact Stage Indicator */}
        <div className="flex items-center gap-3">
          {/* ALF Logo */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center shadow-sm">
              <span className="text-white text-[13px] font-bold">A</span>
            </div>
            <span className="text-[15px] font-semibold text-gray-900 dark:text-white">ALF</span>
          </div>

          {/* Stage Dropdown - Collapsible */}
          <button
            onClick={() => setShowStageDropdown(!showStageDropdown)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-slate-800/50 hover:bg-gray-200 dark:hover:bg-slate-700/50 border border-gray-200 dark:border-slate-700/50 transition-all duration-200 group"
          >
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-md bg-blue-500/20 dark:bg-blue-500/20 flex items-center justify-center">
                <CurrentIcon className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="flex flex-col items-start">
                <span className="text-[11px] text-gray-500 dark:text-slate-400 leading-none">
                  Stage {currentStageIndex + 1} of {totalStages}
                </span>
                <span className="text-[13px] font-medium text-gray-900 dark:text-white leading-tight">
                  {currentStageLabel}
                </span>
              </div>
            </div>
            <ChevronDown
              className={`w-4 h-4 text-gray-500 dark:text-slate-400 transition-transform duration-200 ${
                showStageDropdown ? 'rotate-180' : ''
              }`}
            />
          </button>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2">
          {onSave && (
            <button
              onClick={onSave}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800/50 transition-colors"
              aria-label="Save progress"
            >
              <Save className="w-4 h-4 text-gray-600 dark:text-slate-400" />
            </button>
          )}
          {onHelp && (
            <button
              onClick={onHelp}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800/50 transition-colors"
              aria-label="Get help"
            >
              <HelpCircle className="w-4 h-4 text-gray-600 dark:text-slate-400" />
            </button>
          )}
        </div>
      </div>

      {/* Dropdown Panel - Only shows when clicked */}
      <AnimatePresence>
        {showStageDropdown && (
          <>
            {/* Backdrop overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowStageDropdown(false)}
              className="fixed inset-0 bg-black/20 dark:bg-black/40 z-[1040]"
            />

            {/* Dropdown content */}
            <motion.div
              initial={{ opacity: 0, y: -10, scaleY: 0.95 }}
              animate={{
                opacity: 1,
                y: 0,
                scaleY: 1,
                transition: {
                  type: 'spring',
                  stiffness: 500,
                  damping: 30
                }
              }}
              exit={{
                opacity: 0,
                y: -10,
                scaleY: 0.95,
                transition: { duration: 0.15 }
              }}
              className="absolute top-full left-0 right-0 mt-1 mx-4 bg-white/95 dark:bg-slate-800/95 backdrop-blur-xl border border-gray-200 dark:border-slate-700/50 rounded-xl shadow-xl shadow-gray-900/10 dark:shadow-black/20 overflow-hidden z-[1060]"
            >
              <div className="p-3 space-y-1 max-h-96 overflow-y-auto">
                {stages.map((stage, index) => {
                  const StageIcon = stage.icon;
                  const isCurrent = currentStage === stage.id;

                  return (
                    <button
                      key={stage.id}
                      onClick={() => {
                        onStageSelect(stage.id);
                        setShowStageDropdown(false);
                      }}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${
                        isCurrent
                          ? 'bg-blue-50 dark:bg-blue-500/20 border border-blue-200 dark:border-blue-500/30'
                          : 'hover:bg-gray-100 dark:hover:bg-slate-700/50'
                      }`}
                    >
                      <div className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center ${
                        stage.completed
                          ? 'bg-green-50 dark:bg-green-500/20 border border-green-200 dark:border-green-500/30'
                          : isCurrent
                          ? 'bg-blue-50 dark:bg-blue-500/20 border border-blue-200 dark:border-blue-500/30'
                          : 'bg-gray-100 dark:bg-slate-700/50 border border-gray-200 dark:border-slate-600/30'
                      }`}>
                        {stage.completed ? (
                          <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
                        ) : (
                          <StageIcon className={`w-4 h-4 ${
                            isCurrent
                              ? 'text-blue-600 dark:text-blue-400'
                              : 'text-gray-500 dark:text-slate-400'
                          }`} />
                        )}
                      </div>
                      <div className="flex-1 text-left">
                        <div className="text-[13px] font-medium text-gray-900 dark:text-white">
                          {stage.label}
                        </div>
                        <div className="text-[11px] text-gray-600 dark:text-slate-400">
                          {stage.description}
                        </div>
                      </div>
                      {isCurrent && (
                        <div className="w-2 h-2 rounded-full bg-blue-500 dark:bg-blue-400" />
                      )}
                    </button>
                  );
                })}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </header>
  );
}
