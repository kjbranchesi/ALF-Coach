import React from 'react';
import { AlertTriangle, Shield, DollarSign, Clock, Users, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

export interface Risk {
  id: string;
  name: string;
  likelihood: 'low' | 'medium' | 'high';
  impact: 'low' | 'medium' | 'high';
  mitigation: string;
}

export interface Constraint {
  type: 'budget' | 'time' | 'space' | 'safety' | 'approval';
  label: string;
  status: 'met' | 'at-risk' | 'blocked';
  details: string;
}

export interface Contingency {
  label: string;
  trigger: string;
  plan: string;
}

interface FeasibilityPanelProps {
  constraints: Constraint[];
  risks: Risk[];
  contingencies: {
    planB?: Contingency;
    planC?: Contingency;
  };
  className?: string;
}

export const FeasibilityPanel: React.FC<FeasibilityPanelProps> = ({
  constraints,
  risks,
  contingencies,
  className = ''
}) => {
  const constraintIcons = {
    budget: DollarSign,
    time: Clock,
    space: Users,
    safety: Shield,
    approval: CheckCircle
  };

  const statusConfig = {
    met: { icon: CheckCircle, color: 'text-green-600 dark:text-green-400', bg: 'bg-green-100 dark:bg-green-900/30' },
    'at-risk': { icon: AlertCircle, color: 'text-yellow-600 dark:text-yellow-400', bg: 'bg-yellow-100 dark:bg-yellow-900/30' },
    blocked: { icon: XCircle, color: 'text-red-600 dark:text-red-400', bg: 'bg-red-100 dark:bg-red-900/30' }
  };

  const riskMatrix = {
    low: { low: 'bg-green-100', medium: 'bg-yellow-100', high: 'bg-orange-100' },
    medium: { low: 'bg-yellow-100', medium: 'bg-orange-100', high: 'bg-red-100' },
    high: { low: 'bg-orange-100', medium: 'bg-red-100', high: 'bg-red-200' }
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Constraints Check */}
      <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
          <Shield className="w-5 h-5" />
          Feasibility Constraints
        </h3>
        
        <div className="space-y-3">
          {constraints.map((constraint) => {
            const Icon = constraintIcons[constraint.type];
            const status = statusConfig[constraint.status];
            const StatusIcon = status.icon;
            
            return (
              <div key={constraint.type} className="flex items-start gap-3">
                <div className={`p-2 rounded-lg ${status.bg}`}>
                  <Icon className={`w-4 h-4 ${status.color}`} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-slate-700 dark:text-slate-300">
                      {constraint.label}
                    </span>
                    <StatusIcon className={`w-4 h-4 ${status.color}`} />
                  </div>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mt-0.5">
                    {constraint.details}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Risk Matrix */}
      <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
          <AlertTriangle className="w-5 h-5" />
          Risk Assessment
        </h3>
        
        {/* Risk Grid */}
        <div className="space-y-3">
          {risks.map((risk) => {
            const bgColor = riskMatrix[risk.likelihood][risk.impact];
            
            return (
              <div key={risk.id} className={`rounded-lg p-3 ${bgColor} dark:opacity-80`}>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-medium text-slate-900">
                      {risk.name}
                    </h4>
                    <div className="flex gap-4 mt-1 text-xs">
                      <span className="text-slate-600">
                        Likelihood: <span className="font-medium capitalize">{risk.likelihood}</span>
                      </span>
                      <span className="text-slate-600">
                        Impact: <span className="font-medium capitalize">{risk.impact}</span>
                      </span>
                    </div>
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

      {/* Contingency Plans */}
      <div className="bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-700 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
          Contingency Plans
        </h3>
        
        <div className="space-y-4">
          {contingencies.planB && (
            <div className="bg-white dark:bg-slate-800 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="px-2 py-1 bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400 text-xs font-medium rounded">
                  Plan B
                </span>
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  {contingencies.planB.label}
                </span>
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
                <span className="font-medium">Trigger:</span> {contingencies.planB.trigger}
              </p>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                <span className="font-medium">Action:</span> {contingencies.planB.plan}
              </p>
            </div>
          )}
          
          {contingencies.planC && (
            <div className="bg-white dark:bg-slate-800 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 text-xs font-medium rounded">
                  Plan C
                </span>
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  {contingencies.planC.label}
                </span>
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
                <span className="font-medium">Trigger:</span> {contingencies.planC.trigger}
              </p>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                <span className="font-medium">Action:</span> {contingencies.planC.plan}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};