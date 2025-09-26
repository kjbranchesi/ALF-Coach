/**
 * BlueprintSidebar.tsx - Collapsible sidebar showing blueprint progress
 * Shows what's being built in real-time during the conversation
 */

import React, { useState } from 'react';
import type { BlueprintDoc } from '../core/types/SOPTypes';
import { ChevronRight, FileText, Eye, Users, Package } from 'lucide-react';

interface BlueprintSidebarProps {
  blueprint: BlueprintDoc;
  currentStage: string;
  isOpen?: boolean;
  onToggle?: () => void;
}

export const BlueprintSidebar: React.FC<BlueprintSidebarProps> = ({ 
  blueprint, 
  currentStage,
  isOpen = false,
  onToggle
}) => {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['current']));

  const toggleSection = (section: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(section)) {
      newExpanded.delete(section);
    } else {
      newExpanded.add(section);
    }
    setExpandedSections(newExpanded);
  };

  const getStageIcon = (stage: string) => {
    switch (stage) {
      case 'WIZARD': return <FileText className="w-4 h-4" />;
      case 'IDEATION': return <Eye className="w-4 h-4" />;
      case 'JOURNEY': return <Users className="w-4 h-4" />;
      case 'DELIVERABLES': return <Package className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  const isStageComplete = (stage: string) => {
    switch (stage) {
      case 'WIZARD':
        return blueprint.wizard?.vision && blueprint.wizard?.subject;
      case 'IDEATION':
        return blueprint.ideation?.bigIdea && blueprint.ideation?.essentialQuestion && blueprint.ideation?.challenge;
      case 'JOURNEY':
        return blueprint.journey?.phases?.length > 0;
      case 'DELIVERABLES':
        return blueprint.deliverables?.milestones?.length > 0;
      default:
        return false;
    }
  };

  return (
    <>
      {/* Modern Floating Action Button with Badge */}
      {!isOpen && (
        <button
          onClick={onToggle}
          className="fixed right-6 top-24 bg-gradient-to-r from-primary-600 to-indigo-600 text-white p-4 rounded-2xl shadow-xl hover:shadow-2xl hover:from-primary-700 hover:to-indigo-700 transition-all duration-300 z-50 group transform hover:scale-105"
          title="View Blueprint Progress"
        >
          <div className="relative">
            <FileText className="w-6 h-6" />
            {/* Progress badge */}
            <div className="absolute -top-2 -right-2 bg-green-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
              {[
                isStageComplete('WIZARD'),
                isStageComplete('IDEATION'),
                isStageComplete('JOURNEY'),
                isStageComplete('DELIVERABLES')
              ].filter(Boolean).length}
            </div>
          </div>
          {/* Tooltip */}
          <div className="absolute right-full mr-3 top-1/2 transform -translate-y-1/2 bg-gray-900 text-white text-sm px-3 py-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
            Blueprint Progress
            <div className="absolute left-full top-1/2 transform -translate-y-1/2 border-4 border-transparent border-l-gray-900"></div>
          </div>
        </button>
      )}

      {/* Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-30 transition-opacity duration-300"
          onClick={onToggle}
        />
      )}

      {/* Modern Sidebar with Glass Effect */}
      <div className={`fixed right-0 top-0 h-full w-80 bg-white/95 dark:bg-gray-900/95 backdrop-blur-lg shadow-2xl transform transition-all duration-300 z-40 border-l border-gray-200/50 dark:border-gray-700/50 ${
        isOpen ? 'translate-x-0' : 'translate-x-full'
      }`}>
        <div className="h-full flex flex-col">
          {/* Header with Close Button */}
          <div className="p-4 border-b border-gray-200/50 dark:border-gray-700/50">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  Blueprint Progress
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Your project is taking shape!
                </p>
              </div>
              <button
                onClick={onToggle}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                title="Close sidebar"
              >
                <ChevronRight className="w-5 h-5 text-gray-500 dark:text-gray-400" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {/* Project Setup */}
            <div className={`rounded-lg border ${
              currentStage === 'WIZARD' ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20' : 
              isStageComplete('WIZARD') ? 'border-green-500 bg-green-50 dark:bg-green-900/20' : 
              'border-gray-300 dark:border-gray-600'
            }`}>
              <button
                onClick={() => toggleSection('wizard')}
                className="w-full p-3 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
              >
                <div className="flex items-center gap-2">
                  {getStageIcon('WIZARD')}
                  <span className="font-medium">Project Setup</span>
                  {isStageComplete('WIZARD') && <span className="text-green-600">✓</span>}
                </div>
                <ChevronRight className={`w-4 h-4 transform transition-transform ${
                  expandedSections.has('wizard') ? 'rotate-90' : ''
                }`} />
              </button>
              {expandedSections.has('wizard') && blueprint.wizard && (
                <div className="px-3 pb-3 space-y-2 text-sm">
                  {blueprint.wizard.subject && (
                    <div><span className="font-medium">Subject:</span> {blueprint.wizard.subject}</div>
                  )}
                  {blueprint.wizard.students && (
                    <div><span className="font-medium">Students:</span> {blueprint.wizard.students}</div>
                  )}
                  {blueprint.wizard.scope && (
                    <div><span className="font-medium">Scope:</span> {blueprint.wizard.scope}</div>
                  )}
                </div>
              )}
            </div>

            {/* Ideation */}
            <div className={`rounded-lg border ${
              currentStage === 'IDEATION' ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20' : 
              isStageComplete('IDEATION') ? 'border-green-500 bg-green-50 dark:bg-green-900/20' : 
              'border-gray-300 dark:border-gray-600'
            }`}>
              <button
                onClick={() => toggleSection('ideation')}
                className="w-full p-3 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
              >
                <div className="flex items-center gap-2">
                  {getStageIcon('IDEATION')}
                  <span className="font-medium">Ideation</span>
                  {isStageComplete('IDEATION') && <span className="text-green-600">✓</span>}
                </div>
                <ChevronRight className={`w-4 h-4 transform transition-transform ${
                  expandedSections.has('ideation') ? 'rotate-90' : ''
                }`} />
              </button>
              {expandedSections.has('ideation') && blueprint.ideation && (
                <div className="px-3 pb-3 space-y-2 text-sm">
                  {blueprint.ideation.bigIdea && (
                    <div>
                      <span className="font-medium">Big Idea:</span>
                      <div className="text-gray-600 dark:text-gray-400 mt-1">{blueprint.ideation.bigIdea}</div>
                    </div>
                  )}
                  {blueprint.ideation.essentialQuestion && (
                    <div>
                      <span className="font-medium">Essential Question:</span>
                      <div className="text-gray-600 dark:text-gray-400 mt-1">{blueprint.ideation.essentialQuestion}</div>
                    </div>
                  )}
                  {blueprint.ideation.challenge && (
                    <div>
                      <span className="font-medium">Challenge:</span>
                      <div className="text-gray-600 dark:text-gray-400 mt-1">{blueprint.ideation.challenge}</div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Learning Journey */}
            <div className={`rounded-lg border ${
              currentStage === 'JOURNEY' ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20' : 
              isStageComplete('JOURNEY') ? 'border-green-500 bg-green-50 dark:bg-green-900/20' : 
              'border-gray-300 dark:border-gray-600'
            }`}>
              <button
                onClick={() => toggleSection('journey')}
                className="w-full p-3 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
              >
                <div className="flex items-center gap-2">
                  {getStageIcon('JOURNEY')}
                  <span className="font-medium">Learning Journey</span>
                  {isStageComplete('JOURNEY') && <span className="text-green-600">✓</span>}
                </div>
                <ChevronRight className={`w-4 h-4 transform transition-transform ${
                  expandedSections.has('journey') ? 'rotate-90' : ''
                }`} />
              </button>
              {expandedSections.has('journey') && blueprint.journey && (
                <div className="px-3 pb-3 space-y-2 text-sm">
                  {blueprint.journey.phases?.map((phase, idx) => {
                    // Handle both object and string formats
                    const phaseText = typeof phase === 'string' 
                      ? phase 
                      : (phase.title || phase.name || `Phase ${idx + 1}`);
                    return (
                      <div key={idx}>
                        <span className="font-medium">Phase {idx + 1}:</span> {phaseText}
                      </div>
                    );
                  })}
                  {blueprint.journey.activities?.length > 0 && (
                    <div className="mt-2">
                      <span className="font-medium">Activities:</span>
                      <ul className="mt-1 ml-2 text-gray-600 dark:text-gray-400">
                        {blueprint.journey.activities.map((activity, idx) => {
                          // Handle both string and object formats
                          const activityText = typeof activity === 'string'
                            ? activity
                        : (activity.title || activity.name || activity.text || `Activity ${idx + 1}`);
                          return (
                            <li key={idx} className="text-xs">• {activityText}</li>
                          );
                        })}
                      </ul>
                    </div>
                  )}
                  {blueprint.journey.resources?.length > 0 && (
                    <div className="mt-2">
                      <span className="font-medium">Resources:</span>
                      <ul className="mt-1 ml-2 text-gray-600 dark:text-gray-400">
                        {blueprint.journey.resources.map((resource, idx) => (
                          <li key={idx} className="text-xs">• {resource}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Deliverables */}
            <div className={`rounded-lg border ${
              currentStage === 'DELIVERABLES' ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20' : 
              isStageComplete('DELIVERABLES') ? 'border-green-500 bg-green-50 dark:bg-green-900/20' : 
              'border-gray-300 dark:border-gray-600'
            }`}>
              <button
                onClick={() => toggleSection('deliverables')}
                className="w-full p-3 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
              >
                <div className="flex items-center gap-2">
                  {getStageIcon('DELIVERABLES')}
                  <span className="font-medium">Student Deliverables</span>
                  {isStageComplete('DELIVERABLES') && <span className="text-green-600">✓</span>}
                </div>
                <ChevronRight className={`w-4 h-4 transform transition-transform ${
                  expandedSections.has('deliverables') ? 'rotate-90' : ''
                }`} />
              </button>
              {expandedSections.has('deliverables') && blueprint.deliverables && (
                <div className="px-3 pb-3 space-y-2 text-sm">
                  {blueprint.deliverables.milestones?.map((milestone, idx) => (
                    <div key={idx}>
                      <span className="font-medium">Milestone {idx + 1}:</span>
                      {typeof milestone === 'string' ? milestone : milestone.title}
                    </div>
                  ))}
                  {blueprint.deliverables.rubric?.criteria?.length > 0 && (
                    <div>
                      <span className="font-medium">Rubric:</span> {blueprint.deliverables.rubric.criteria.length} criteria
                    </div>
                  )}
                  {blueprint.deliverables.impact?.audience && (
                    <div>
                      <span className="font-medium">Audience:</span> {blueprint.deliverables.impact.audience}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-700">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              <div className="flex items-center justify-between mb-2">
                <span>Progress</span>
                <span className="font-medium">
                  {[
                    isStageComplete('WIZARD'),
                    isStageComplete('IDEATION'),
                    isStageComplete('JOURNEY'),
                    isStageComplete('DELIVERABLES')
                  ].filter(Boolean).length} / 4 stages
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div 
                  className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
                  style={{ 
                    width: `${([
                      isStageComplete('WIZARD'),
                      isStageComplete('IDEATION'),
                      isStageComplete('JOURNEY'),
                      isStageComplete('DELIVERABLES')
                    ].filter(Boolean).length / 4) * 100}%` 
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
