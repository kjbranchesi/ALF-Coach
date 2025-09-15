import React from 'react';
import { AlertTriangle, Shield, DollarSign, Clock, Users, CheckCircle, AlertCircle } from 'lucide-react';
import { copy } from '../../utils/copy';

interface Constraints {
  budgetUSD?: number;
  techAccess?: 'full' | 'limited' | 'none';
  materials?: string[];
  safetyRequirements?: string[];
}

interface Risk {
  id: string;
  name: string;
  likelihood: 'low' | 'med' | 'high';
  impact: 'low' | 'med' | 'high';
  mitigation: string;
}

interface Contingency {
  id: string;
  trigger: string;
  plan: string;
}

interface FeasibilityPanelProps {
  constraints?: Constraints;
  risks?: Risk[];
  contingencies?: Contingency[];
  className?: string;
}

export const FeasibilityPanel: React.FC<FeasibilityPanelProps> = ({
  constraints,
  risks = [],
  contingencies = [],
  className = ''
}) => {
  const techAccessLabels = {
    full: 'Full 1:1 device access',
    limited: 'Limited device access',
    none: 'No device access'
  };

  const riskColors = {
    low: { low: 'bg-green-100', med: 'bg-yellow-100', high: 'bg-orange-100' },
    med: { low: 'bg-yellow-100', med: 'bg-orange-100', high: 'bg-red-100' },
    high: { low: 'bg-orange-100', med: 'bg-red-100', high: 'bg-red-200' }
  };

  // Find Plan B and Plan C
  const planB = contingencies.find(c => c.scenario?.toLowerCase()?.includes('time') || c.scenario?.toLowerCase()?.includes('schedule') || c.scenario?.toLowerCase()?.includes('behind'));
  const planC = contingencies.find(c => c.scenario !== planB?.scenario);

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Educator Input Callout */}
      <div className="flex items-center gap-2 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
        <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400" />
        <div>
          <span className="font-medium text-amber-900 dark:text-amber-300">
            {copy.educator.required}
          </span>
          <span className="text-amber-800 dark:text-amber-400 ml-2 text-sm">
            {copy.educator.helper}
          </span>
        </div>
      </div>

      {/* Constraints Summary */}
      <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
          <Shield className="w-5 h-5" />
          {copy.feasibility.constraints}
        </h3>
        
        <div className="grid md:grid-cols-2 gap-4">
          {constraints?.budgetUSD !== undefined && (
            <div className="flex items-center gap-3">
              <DollarSign className="w-5 h-5 text-slate-500" />
              <div>
                <span className="font-medium text-slate-700 dark:text-slate-300">
                  {copy.feasibility.budget}:
                </span>
                <span className="ml-2 text-slate-600 dark:text-slate-400">
                  ${constraints.budgetUSD} USD
                </span>
              </div>
            </div>
          )}
          
          {constraints?.techAccess && (
            <div className="flex items-center gap-3">
              <Users className="w-5 h-5 text-slate-500" />
              <div>
                <span className="font-medium text-slate-700 dark:text-slate-300">
                  Tech Access:
                </span>
                <span className="ml-2 text-slate-600 dark:text-slate-400">
                  {techAccessLabels[constraints.techAccess]}
                </span>
              </div>
            </div>
          )}
          
          {constraints?.materials && constraints.materials.length > 0 && (
            <div className="md:col-span-2">
              <span className="font-medium text-slate-700 dark:text-slate-300">
                Materials:
              </span>
              <span className="ml-2 text-slate-600 dark:text-slate-400">
                {constraints.materials.join(', ')}
              </span>
            </div>
          )}
          
          {constraints?.safetyRequirements && constraints.safetyRequirements.length > 0 && (
            <div className="md:col-span-2">
              <span className="font-medium text-slate-700 dark:text-slate-300">
                {copy.feasibility.safety}:
              </span>
              <span className="ml-2 text-slate-600 dark:text-slate-400">
                {constraints.safetyRequirements.join(', ')}
              </span>
            </div>
          )}
        </div>

        {!constraints && (
          <p className="text-slate-500 dark:text-slate-400 italic">
            No constraints specified yet.
          </p>
        )}
      </div>

      {/* Risks Table */}
      {risks.length > 0 && (
        <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" />
            {copy.feasibility.risks}
          </h3>
          
          <div className="space-y-3">
            {risks.map((risk) => {
              const bgColor = riskColors[risk.likelihood][risk.impact];
              
              return (
                <div key={`${risk.category}-${risk.risk}`} className={`rounded-lg p-3 ${bgColor} dark:opacity-80`}>
                  <div className="flex items-start justify-between">
                    <h4 className="font-medium text-slate-900">
                      {risk.name}
                    </h4>
                    <div className="flex gap-3 text-xs">
                      <span className="px-2 py-0.5 bg-white/50 rounded">
                        L: {risk.likelihood}
                      </span>
                      <span className="px-2 py-0.5 bg-white/50 rounded">
                        I: {risk.impact}
                      </span>
                    </div>
                  </div>
                  <p className="text-sm text-slate-700 mt-2">
                    <span className="font-medium">Mitigation:</span> {risk.mitigation}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Contingency Plans */}
      {(planB || planC) && (
        <div className="bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-700 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
            {copy.feasibility.contingencies}
          </h3>
          
          <div className="space-y-4">
            {planB && (
              <div className="bg-white dark:bg-slate-800 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-xs font-medium rounded">
                    {copy.feasibility.planB}
                  </span>
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    Compressed Timeline
                  </span>
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
                  <span className="font-medium">Scenario:</span> {planB.scenario}
                </p>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  <span className="font-medium">Plan:</span> {planB.plan}
                </p>
              </div>
            )}
            
            {planC && (
              <div className="bg-white dark:bg-slate-800 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 text-xs font-medium rounded">
                    {copy.feasibility.planC}
                  </span>
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    Alternative Approach
                  </span>
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
                  <span className="font-medium">Scenario:</span> {planC.scenario}
                </p>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  <span className="font-medium">Plan:</span> {planC.plan}
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};