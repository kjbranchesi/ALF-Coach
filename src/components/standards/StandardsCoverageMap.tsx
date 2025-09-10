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

  const emphasisConfig = {
    introduce: {
      label: copy.coverage.introduce.label,
      description: copy.coverage.introduce.description,
      color: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400',
      abbrev: 'I'
    },
    develop: {
      label: copy.coverage.develop.label,
      description: copy.coverage.develop.description,
      color: 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400',
      abbrev: 'D'
    },
    master: {
      label: copy.coverage.master.label,
      description: copy.coverage.master.description,
      color: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400',
      abbrev: 'M'
    }
  };

  const getCoverageForCell = (standardId: string, milestoneId: string): Coverage | undefined => {
    return coverage.find(c => c.standardId === standardId && c.milestoneId === milestoneId);
  };

  if (coverage.length === 0) {
    return (
      <div className={`p-6 bg-slate-50 dark:bg-slate-800 rounded-lg text-center ${className}`}>
        <p className="text-slate-600 dark:text-slate-400">{copy.empty.coverage}</p>
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Legend */}
      <div className="flex flex-wrap gap-4 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
        {Object.entries(emphasisConfig).map(([key, config]) => (
          <div key={key} className="flex items-center gap-2">
            <span className={`inline-flex items-center justify-center w-6 h-6 rounded text-xs font-bold ${config.color}`}>
              {config.abbrev}
            </span>
            <div className="text-sm">
              <span className="font-medium text-slate-700 dark:text-slate-300">
                {config.label}
              </span>
              <span className="text-slate-500 dark:text-slate-400 ml-1">
                ({config.description})
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Collapsible container */}
      {shouldCollapse && (
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
        >
          {isCollapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
          {isCollapsed ? 'Show' : 'Hide'} Coverage Grid
        </button>
      )}

      {/* Grid */}
      {!isCollapsed && (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className="sticky left-0 bg-white dark:bg-slate-800 p-2 text-left text-sm font-medium text-slate-700 dark:text-slate-300 border-b border-r border-slate-200 dark:border-slate-700">
                  Standards / Milestones
                </th>
                {milestones.map(milestone => (
                  <th 
                    key={milestone.id}
                    className="p-2 text-center text-xs font-medium text-slate-600 dark:text-slate-400 border-b border-slate-200 dark:border-slate-700"
                    title={milestone.name}
                  >
                    <div className="max-w-[100px] truncate">
                      {milestone.name}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {standards.map((standard, sIdx) => (
                <tr key={standard.id} className={sIdx % 2 === 0 ? 'bg-slate-50/50 dark:bg-slate-900/20' : ''}>
                  <td className="sticky left-0 bg-white dark:bg-slate-800 p-2 border-r border-slate-200 dark:border-slate-700">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium px-1.5 py-0.5 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 rounded">
                        {standard.framework}
                      </span>
                      <span className="font-mono text-sm text-slate-700 dark:text-slate-300" title={standard.label}>
                        {standard.code}
                      </span>
                    </div>
                  </td>
                  {milestones.map(milestone => {
                    const cellCoverage = getCoverageForCell(standard.id, milestone.id);
                    return (
                      <td 
                        key={`${standard.id}-${milestone.id}`}
                        className="p-2 text-center border border-slate-200 dark:border-slate-700"
                      >
                        {cellCoverage && (
                          <div 
                            className={`inline-flex items-center justify-center w-8 h-8 rounded-lg text-xs font-bold ${
                              emphasisConfig[cellCoverage.emphasis].color
                            }`}
                            title={`${standard.code} - ${milestone.name}: ${emphasisConfig[cellCoverage.emphasis].label}`}
                          >
                            {emphasisConfig[cellCoverage.emphasis].abbrev}
                          </div>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Summary */}
      <div className="text-sm text-slate-600 dark:text-slate-400 text-right">
        {standards.length} standards · {milestones.length} milestones · {coverage.length} mappings
      </div>
    </div>
  );
};