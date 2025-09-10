import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { copy } from '../../utils/copy';

interface Standard {
  id: string;
  code: string;
  label?: string;
  framework: string;
}

interface Milestone {
  id: string;
  name: string;
}

interface Coverage {
  standardId: string;
  milestoneId: string;
  emphasis: 'introduce' | 'develop' | 'master';
}

interface StandardsCoverageMapProps {
  standards: Standard[];
  milestones: Milestone[];
  coverage: Coverage[];
  className?: string;
}

export const StandardsCoverageMap: React.FC<StandardsCoverageMapProps> = ({ 
  standards, 
  milestones, 
  coverage, 
  className = '' 
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const shouldCollapse = standards.length > 6 || milestones.length > 6;
  const levelConfig = {
    introduce: {
      icon: BookOpen,
      label: 'Introduce',
      description: 'First contact and vocabulary',
      color: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400',
      dotColor: 'bg-blue-500'
    },
    develop: {
      icon: TrendingUp,
      label: 'Develop',
      description: 'Practice and feedback cycles',
      color: 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400',
      dotColor: 'bg-purple-500'
    },
    master: {
      icon: Trophy,
      label: 'Master',
      description: 'Independent, transfer-ready performance',
      color: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400',
      dotColor: 'bg-emerald-500'
    }
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Legend */}
      <div className="flex flex-wrap gap-4 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
        {Object.entries(levelConfig).map(([key, config]) => {
          const Icon = config.icon;
          return (
            <div key={key} className="flex items-center gap-2">
              <div className={`p-1.5 rounded ${config.color}`}>
                <Icon className="w-4 h-4" />
              </div>
              <div>
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  {config.label}
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400 ml-2">
                  {config.description}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Standards Grid */}
      <div className="space-y-4">
        {standards.map((standard, idx) => (
          <div
            key={standard.code}
            className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-4"
          >
            {/* Standard Header */}
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-medium px-2 py-0.5 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 rounded">
                    {standard.framework}
                  </span>
                  <span className="font-mono text-sm text-slate-700 dark:text-slate-300">
                    {standard.code}
                  </span>
                </div>
                <h4 className="font-medium text-slate-900 dark:text-white">
                  {standard.label}
                </h4>
              </div>
            </div>

            {/* Milestone Coverage Timeline */}
            <div className="relative">
              {/* Timeline line */}
              <div className="absolute left-0 right-0 top-3 h-0.5 bg-slate-200 dark:bg-slate-700"></div>
              
              {/* Milestone points */}
              <div className="relative flex justify-between">
                {standard.milestones.map((milestone, mIdx) => {
                  const config = levelConfig[milestone.level];
                  return (
                    <div
                      key={milestone.id}
                      className="relative flex flex-col items-center"
                      style={{ flex: 1 }}
                    >
                      {/* Dot */}
                      <div className={`relative z-10 w-6 h-6 rounded-full ${config.dotColor} ring-4 ring-white dark:ring-slate-800`}>
                        <CheckCircle className="w-6 h-6 text-white p-0.5" />
                      </div>
                      
                      {/* Milestone info */}
                      <div className="mt-2 text-center">
                        <div className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${config.color}`}>
                          {config.label}
                        </div>
                        <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 max-w-[100px]">
                          {milestone.name}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Coverage Summary */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Coverage Complete
            </span>
          </div>
          <span className="text-sm text-slate-600 dark:text-slate-400">
            {standards.length} standards · {standards.reduce((acc, s) => acc + s.milestones.length, 0)} checkpoints
          </span>
        </div>
      </div>
    </div>
  );
};