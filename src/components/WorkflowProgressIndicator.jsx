/**
 * WorkflowProgressIndicator
 *
 * Visual guide showing the project workflow stages with clear progression
 * Helps users understand: Ideation → Journey → Deliverables → Completed
 */

import React from 'react';
import { ChevronRight, Lightbulb, Map, Package, CheckCircle } from 'lucide-react';

export default function WorkflowProgressIndicator() {
  const stages = [
    {
      number: 1,
      name: 'Ideation',
      description: 'Define your big idea',
      icon: Lightbulb,
      color: 'blue'
    },
    {
      number: 2,
      name: 'Journey',
      description: 'Map the learning path',
      icon: Map,
      color: 'purple'
    },
    {
      number: 3,
      name: 'Deliverables',
      description: 'Plan outcomes & assessments',
      icon: Package,
      color: 'emerald'
    },
    {
      number: 4,
      name: 'Completed',
      description: 'Ready to implement',
      icon: CheckCircle,
      color: 'green'
    }
  ];

  const colorClasses = {
    blue: {
      bg: 'bg-blue-50 dark:bg-blue-950/30',
      border: 'border-blue-200 dark:border-blue-800',
      text: 'text-blue-700 dark:text-blue-300',
      icon: 'text-blue-600 dark:text-blue-400'
    },
    purple: {
      bg: 'bg-purple-50 dark:bg-purple-950/30',
      border: 'border-purple-200 dark:border-purple-800',
      text: 'text-purple-700 dark:text-purple-300',
      icon: 'text-purple-600 dark:text-purple-400'
    },
    emerald: {
      bg: 'bg-emerald-50 dark:bg-emerald-950/30',
      border: 'border-emerald-200 dark:border-emerald-800',
      text: 'text-emerald-700 dark:text-emerald-300',
      icon: 'text-emerald-600 dark:text-emerald-400'
    },
    green: {
      bg: 'bg-green-50 dark:bg-green-950/30',
      border: 'border-green-200 dark:border-green-800',
      text: 'text-green-700 dark:text-green-300',
      icon: 'text-green-600 dark:text-green-400'
    }
  };

  return (
    <div
      className="squircle-lg bg-white/60 dark:bg-slate-900/60 backdrop-blur-sm border border-slate-200/60 dark:border-slate-700/60 p-6"
      role="region"
      aria-label="Project workflow stages"
    >
      <div className="flex items-center justify-center gap-3 overflow-x-auto">
        {stages.map((stage, index) => {
          const Icon = stage.icon;
          const colors = colorClasses[stage.color];
          const isLast = index === stages.length - 1;

          return (
            <React.Fragment key={stage.number}>
              {/* Stage Badge */}
              <div className="flex flex-col items-center gap-2 min-w-[140px]">
                {/* Icon + Number */}
                <div className={`
                  relative flex items-center justify-center w-12 h-12 rounded-full
                  ${colors.bg} ${colors.border} border-2
                  transition-all duration-200
                `}>
                  <Icon className={`w-6 h-6 ${colors.icon}`} aria-hidden="true" />
                  <span className={`
                    absolute -top-1 -right-1 flex items-center justify-center
                    w-5 h-5 rounded-full text-xs font-bold
                    bg-white dark:bg-slate-900 ${colors.text} ${colors.border} border
                  `}>
                    {stage.number}
                  </span>
                </div>

                {/* Stage Name */}
                <div className="text-center">
                  <p className={`text-sm font-semibold ${colors.text}`}>
                    {stage.name}
                  </p>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                    {stage.description}
                  </p>
                </div>
              </div>

              {/* Arrow separator (not after last item) */}
              {!isLast && (
                <ChevronRight
                  className="w-5 h-5 text-slate-400 dark:text-slate-600 flex-shrink-0"
                  aria-hidden="true"
                />
              )}
            </React.Fragment>
          );
        })}
      </div>

      {/* Helper text */}
      <p className="text-center text-xs text-slate-500 dark:text-slate-500 mt-4">
        Projects progress through these stages sequentially
      </p>
    </div>
  );
}
