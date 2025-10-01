import React from 'react';
import { CheckCircle2, Circle, ChevronRight } from 'lucide-react';
import type { CapturedData, Stage } from '../domain/stages';

interface WorkingDraftSidebarProps {
  captured: CapturedData;
  currentStage: Stage;
  onEditStage?: (stage: Stage) => void;
}

interface DraftItem {
  stage: Stage;
  label: string;
  status: 'complete' | 'partial' | 'empty';
  preview?: string;
  details?: string[];
}

function getDraftItems(captured: CapturedData): DraftItem[] {
  const items: DraftItem[] = [];

  // Big Idea
  const bigIdea = captured.ideation.bigIdea?.trim();
  items.push({
    stage: 'BIG_IDEA',
    label: 'Big Idea',
    status: bigIdea && bigIdea.length >= 10 ? 'complete' : bigIdea ? 'partial' : 'empty',
    preview: bigIdea || 'Not yet defined',
    details: bigIdea ? [bigIdea] : []
  });

  // Essential Question
  const eq = captured.ideation.essentialQuestion?.trim();
  items.push({
    stage: 'ESSENTIAL_QUESTION',
    label: 'Essential Question',
    status: eq && eq.length >= 10 ? 'complete' : eq ? 'partial' : 'empty',
    preview: eq || 'Not yet defined',
    details: eq ? [eq] : []
  });

  // Challenge
  const challenge = captured.ideation.challenge?.trim();
  items.push({
    stage: 'CHALLENGE',
    label: 'Challenge',
    status: challenge && challenge.length >= 15 ? 'complete' : challenge ? 'partial' : 'empty',
    preview: challenge || 'Not yet defined',
    details: challenge ? [challenge] : []
  });

  // Journey
  const phases = captured.journey?.phases || [];
  const hasValidJourney = phases.length >= 3;
  items.push({
    stage: 'JOURNEY',
    label: 'Learning Journey',
    status: hasValidJourney ? 'complete' : phases.length > 0 ? 'partial' : 'empty',
    preview: hasValidJourney
      ? `${phases.length} phases mapped`
      : phases.length > 0
      ? `${phases.length}/3 phases`
      : 'Not yet mapped',
    details: phases.slice(0, 3).map((p, i) => {
      const activities = p.activities?.slice(0, 2).join(', ') || '';
      return activities ? `${i + 1}. ${p.name} → ${activities}` : `${i + 1}. ${p.name}`;
    })
  });

  // Deliverables
  const milestones = captured.deliverables?.milestones || [];
  const artifacts = captured.deliverables?.artifacts || [];
  const criteria = captured.deliverables?.rubric?.criteria || [];
  const hasValidDeliverables = milestones.length >= 3 && artifacts.length >= 1 && criteria.length >= 3;

  items.push({
    stage: 'DELIVERABLES',
    label: 'Deliverables',
    status: hasValidDeliverables ? 'complete' : (milestones.length || artifacts.length || criteria.length) ? 'partial' : 'empty',
    preview: hasValidDeliverables
      ? `${milestones.length} milestones, ${artifacts.length} artifacts`
      : 'Not yet defined',
    details: [
      ...milestones.slice(0, 3).map(m => `📍 ${m.name}`),
      ...artifacts.slice(0, 2).map(a => `🎯 ${a.name}`)
    ].slice(0, 4)
  });

  return items;
}

export function WorkingDraftSidebar({
  captured,
  currentStage,
  onEditStage
}: WorkingDraftSidebarProps) {
  const items = getDraftItems(captured);
  const completedCount = items.filter(i => i.status === 'complete').length;
  const progressPercent = Math.round((completedCount / items.length) * 100);

  return (
    <div className="h-full flex flex-col bg-gray-50/95 dark:bg-gray-900/95 backdrop-blur border-r border-gray-200/60 dark:border-gray-700/60">
      {/* Header */}
      <div className="px-4 py-4 border-b border-gray-200/60 dark:border-gray-700/60">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2">
          Working Draft
        </h3>
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400">
            <span>{completedCount} of {items.length} complete</span>
            <span className="font-medium">{progressPercent}%</span>
          </div>
          <div className="h-1.5 rounded-full bg-gray-200 dark:bg-gray-800">
            <div
              className="h-full rounded-full bg-primary-500 transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Draft Items */}
      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-2">
        {items.map((item) => {
          const isCurrent = item.stage === currentStage;
          const isClickable = onEditStage && item.status !== 'empty';

          return (
            <button
              key={item.stage}
              onClick={() => isClickable && onEditStage(item.stage)}
              disabled={!isClickable}
              className={`
                w-full text-left squircle-card border p-3 transition-all duration-200
                ${isCurrent
                  ? 'border-primary-300/60 bg-primary-50/90 dark:border-primary-700/60 dark:bg-primary-900/30 shadow-sm'
                  : item.status === 'complete'
                  ? 'border-emerald-200/50 bg-white/80 dark:border-emerald-800/50 dark:bg-gray-800/60'
                  : item.status === 'partial'
                  ? 'border-amber-200/50 bg-white/80 dark:border-amber-800/50 dark:bg-gray-800/60'
                  : 'border-gray-200/40 bg-white/60 dark:border-gray-700/40 dark:bg-gray-800/40'
                }
                ${isClickable ? 'hover:scale-[1.02] hover:shadow-md cursor-pointer' : 'cursor-default'}
              `}
            >
              <div className="flex items-start gap-2">
                <div className="mt-0.5">
                  {item.status === 'complete' ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  ) : item.status === 'partial' ? (
                    <Circle className="w-4 h-4 text-amber-500" />
                  ) : (
                    <Circle className="w-4 h-4 text-gray-300 dark:text-gray-600" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h4 className={`
                      text-xs font-semibold
                      ${isCurrent
                        ? 'text-primary-700 dark:text-primary-300'
                        : item.status === 'complete'
                        ? 'text-emerald-700 dark:text-emerald-300'
                        : item.status === 'partial'
                        ? 'text-amber-700 dark:text-amber-300'
                        : 'text-gray-500 dark:text-gray-400'
                      }
                    `}>
                      {item.label}
                    </h4>
                    {isClickable && (
                      <ChevronRight className="w-3 h-3 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                    )}
                  </div>
                  <p className="text-[11px] text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
                    {item.preview}
                  </p>
                  {item.details && item.details.length > 0 && (
                    <div className="mt-2 space-y-0.5">
                      {item.details.map((detail, idx) => (
                        <p key={idx} className="text-[10px] text-gray-500 dark:text-gray-500 line-clamp-1">
                          {detail}
                        </p>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Footer hint */}
      <div className="px-4 py-3 border-t border-gray-200/60 dark:border-gray-700/60 bg-gray-100/50 dark:bg-gray-800/50">
        <p className="text-[10px] text-gray-500 dark:text-gray-400 leading-relaxed">
          Your progress autosaves. Click completed items to review or edit.
        </p>
      </div>
    </div>
  );
}
