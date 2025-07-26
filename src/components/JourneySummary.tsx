import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp, Lightbulb, HelpCircle, Target, Check, Edit2 } from 'lucide-react';
import { JourneyDataV3 } from '../lib/journey-data-v3';

interface JourneySummaryProps {
  journeyData: JourneyDataV3;
  currentStage: string;
  onEdit?: (stage: string, field: string) => void;
}

export function JourneySummary({ journeyData, currentStage, onEdit }: JourneySummaryProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  
  // Safety check for journey data
  if (!journeyData || !journeyData.stageData) {
    return null;
  }
  
  // Determine what has been completed
  const hasIdeation = !!(
    journeyData.stageData.ideation?.bigIdea ||
    journeyData.stageData.ideation?.essentialQuestion ||
    journeyData.stageData.ideation?.challenge
  );
  
  const hasJourney = !!(
    (journeyData.stageData.journey?.phases && journeyData.stageData.journey.phases.length > 0) ||
    (journeyData.stageData.journey?.activities && journeyData.stageData.journey.activities.length > 0) ||
    (journeyData.stageData.journey?.resources && journeyData.stageData.journey.resources.length > 0)
  );
  
  const hasDeliverables = !!(
    (journeyData.stageData.deliverables?.milestones && journeyData.stageData.deliverables.milestones.length > 0) ||
    journeyData.stageData.deliverables?.assessmentCriteria ||
    journeyData.stageData.deliverables?.impact
  );

  // Show even if no data captured yet, but in a helpful state
  const hasAnyData = hasIdeation || hasJourney || hasDeliverables;

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="fixed top-24 right-4 z-40 max-w-md"
    >
      {/* Collapsed View */}
      {!isExpanded && (
        <motion.div
          className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-lg shadow-lg border border-gray-200/50 dark:border-gray-700/50 p-3 cursor-pointer hover:shadow-xl transition-shadow"
          onClick={() => setIsExpanded(true)}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
                <Lightbulb className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="text-xs font-medium text-gray-700 dark:text-gray-300">Your Journey</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {hasAnyData 
                    ? [hasIdeation && 'Ideation', hasJourney && 'Journey', hasDeliverables && 'Deliverables']
                        .filter(Boolean)
                        .join(' • ')
                    : 'Ready to begin'
                  }
                </p>
              </div>
            </div>
            <ChevronDown className="w-4 h-4 text-gray-400" />
          </div>
        </motion.div>
      )}

      {/* Expanded View */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm rounded-lg shadow-xl border border-gray-200/50 dark:border-gray-700/50 overflow-hidden"
          >
            {/* Header */}
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200">Your Journey So Far</h3>
                <button
                  onClick={() => setIsExpanded(false)}
                  className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                >
                  <ChevronUp className="w-4 h-4 text-gray-400" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-4 space-y-4 max-h-[60vh] overflow-y-auto">
              {!hasAnyData ? (
                <div className="text-center py-6">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Your journey details will appear here as you progress through each stage.
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                    Start with your Big Idea to begin capturing your learning journey.
                  </p>
                </div>
              ) : (
                <>
              {/* Ideation Section */}
              {hasIdeation && (
                <div className="space-y-3">
                  <h4 className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">Ideation</h4>
                  
                  {journeyData.stageData.ideation.bigIdea && (
                    <SummaryItem
                      icon={<Lightbulb className="w-3.5 h-3.5" />}
                      label="Big Idea"
                      value={journeyData.stageData.ideation.bigIdea}
                      isActive={currentStage === 'IDEATION_BIG_IDEA'}
                      onEdit={onEdit ? () => onEdit('ideation', 'bigIdea') : undefined}
                    />
                  )}
                  
                  {journeyData.stageData.ideation.essentialQuestion && (
                    <SummaryItem
                      icon={<HelpCircle className="w-3.5 h-3.5" />}
                      label="Essential Question"
                      value={journeyData.stageData.ideation.essentialQuestion}
                      isActive={currentStage === 'IDEATION_EQ'}
                      onEdit={onEdit ? () => onEdit('ideation', 'essentialQuestion') : undefined}
                    />
                  )}
                  
                  {journeyData.stageData.ideation.challenge && (
                    <SummaryItem
                      icon={<Target className="w-3.5 h-3.5" />}
                      label="Challenge"
                      value={journeyData.stageData.ideation.challenge}
                      isActive={currentStage === 'IDEATION_CHALLENGE'}
                      onEdit={onEdit ? () => onEdit('ideation', 'challenge') : undefined}
                    />
                  )}
                </div>
              )}

              {/* Journey Section */}
              {hasJourney && (
                <div className="space-y-3">
                  <h4 className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">Learning Journey</h4>
                  
                  {journeyData.stageData.journey.phases && journeyData.stageData.journey.phases.length > 0 && (
                    <SummaryItem
                      icon={<Check className="w-3.5 h-3.5" />}
                      label="Phases"
                      value={journeyData.stageData.journey.phases.map(p => p.title).join(' → ')}
                      isActive={currentStage === 'JOURNEY_PHASES'}
                      onEdit={onEdit ? () => onEdit('journey', 'phases') : undefined}
                    />
                  )}
                  
                  {journeyData.stageData.journey.activities && journeyData.stageData.journey.activities.length > 0 && (
                    <SummaryItem
                      icon={<Check className="w-3.5 h-3.5" />}
                      label="Activities"
                      value={`${journeyData.stageData.journey.activities.length} activities planned`}
                      isActive={currentStage === 'JOURNEY_ACTIVITIES'}
                      onEdit={onEdit ? () => onEdit('journey', 'activities') : undefined}
                    />
                  )}
                </div>
              )}

              {/* Deliverables Section */}
              {hasDeliverables && (
                <div className="space-y-3">
                  <h4 className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">Deliverables</h4>
                  
                  {journeyData.stageData.deliverables.milestones && journeyData.stageData.deliverables.milestones.length > 0 && (
                    <SummaryItem
                      icon={<Check className="w-3.5 h-3.5" />}
                      label="Milestones"
                      value={`${journeyData.stageData.deliverables.milestones.length} milestones defined`}
                      isActive={currentStage === 'DELIVERABLES_MILESTONES'}
                      onEdit={onEdit ? () => onEdit('deliverables', 'milestones') : undefined}
                    />
                  )}
                </div>
              )}
                </>
              )}
            </div>

            {/* Footer */}
            {hasAnyData && (
              <div className="p-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
                <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                  Click any item to refine
                </p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

interface SummaryItemProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  isActive?: boolean;
  onEdit?: () => void;
}

function SummaryItem({ icon, label, value, isActive, onEdit }: SummaryItemProps) {
  return (
    <motion.div
      className={`group relative p-3 rounded-lg border transition-all ${
        isActive
          ? 'border-blue-400 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-600'
          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
      }`}
      whileHover={{ scale: 1.01 }}
    >
      <div className="flex items-start gap-3">
        <div className={`mt-0.5 ${isActive ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400'}`}>
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">{label}</p>
          <p className="text-sm text-gray-800 dark:text-gray-200 line-clamp-2">{value}</p>
        </div>
        {onEdit && (
          <button
            onClick={onEdit}
            className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
          >
            <Edit2 className="w-3.5 h-3.5 text-gray-400" />
          </button>
        )}
      </div>
      {isActive && (
        <motion.div
          className="absolute inset-0 border-2 border-blue-400 dark:border-blue-500 rounded-lg pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
      )}
    </motion.div>
  );
}