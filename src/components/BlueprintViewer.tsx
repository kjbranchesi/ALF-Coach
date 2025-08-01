/**
 * BlueprintViewer.tsx - Comprehensive view and edit interface for project blueprints
 * Shows all captured data from each phase with editing capabilities
 */

import React, { useState } from 'react';
import { BlueprintDoc, WizardData, IdeationData, JourneyData, DeliverablesData } from '../core/types/SOPTypes';
import { Edit2, Save, X, Check, ChevronDown, ChevronRight, Eye, FileText, Users, Download } from 'lucide-react';

interface BlueprintViewerProps {
  blueprint: BlueprintDoc;
  onUpdate: (updates: Partial<BlueprintDoc>) => void;
  onExport?: () => void;
  readOnly?: boolean;
}

interface SectionProps {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

const Section: React.FC<SectionProps> = ({ title, icon, children, defaultOpen = true }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 mb-4">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
      >
        <div className="flex items-center gap-3">
          {icon}
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{title}</h3>
        </div>
        {isOpen ? (
          <ChevronDown className="w-5 h-5 text-gray-500" />
        ) : (
          <ChevronRight className="w-5 h-5 text-gray-500" />
        )}
      </button>
      {isOpen && (
        <div className="px-6 pb-6 pt-2">
          {children}
        </div>
      )}
    </div>
  );
};

interface EditableFieldProps {
  label: string;
  value: string;
  onSave: (value: string) => void;
  multiline?: boolean;
  readOnly?: boolean;
}

const EditableField: React.FC<EditableFieldProps> = ({ label, value, onSave, multiline = false, readOnly = false }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value);
  
  const handleSave = () => {
    onSave(editValue);
    setIsEditing(false);
  };
  
  const handleCancel = () => {
    setEditValue(value);
    setIsEditing(false);
  };
  
  if (readOnly) {
    return (
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          {label}
        </label>
        <div className="text-gray-900 dark:text-gray-100">
          {multiline ? (
            <div className="whitespace-pre-wrap">{value}</div>
          ) : (
            <div>{value}</div>
          )}
        </div>
      </div>
    );
  }
  
  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
        {label}
      </label>
      {isEditing ? (
        <div className="space-y-2">
          {multiline ? (
            <textarea
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-indigo-500"
              rows={4}
            />
          ) : (
            <input
              type="text"
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-indigo-500"
            />
          )}
          <div className="flex gap-2">
            <button
              onClick={handleSave}
              className="px-3 py-1 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors flex items-center gap-1"
            >
              <Check className="w-4 h-4" /> Save
            </button>
            <button
              onClick={handleCancel}
              className="px-3 py-1 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors flex items-center gap-1"
            >
              <X className="w-4 h-4" /> Cancel
            </button>
          </div>
        </div>
      ) : (
        <div className="flex items-start justify-between group">
          <div className="flex-1 text-gray-900 dark:text-gray-100">
            {multiline ? (
              <div className="whitespace-pre-wrap">{value || <span className="text-gray-400 italic">Not set</span>}</div>
            ) : (
              <div>{value || <span className="text-gray-400 italic">Not set</span>}</div>
            )}
          </div>
          <button
            onClick={() => setIsEditing(true)}
            className="ml-2 p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <Edit2 className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};

export const BlueprintViewer: React.FC<BlueprintViewerProps> = ({ 
  blueprint, 
  onUpdate, 
  onExport,
  readOnly = false 
}) => {
  const updateWizard = (field: keyof WizardData, value: string) => {
    onUpdate({
      wizard: { ...blueprint.wizard, [field]: value }
    });
  };
  
  const updateIdeation = (field: keyof IdeationData, value: string) => {
    onUpdate({
      ideation: { ...blueprint.ideation, [field]: value }
    });
  };
  
  const updateJourneyPhase = (index: number, field: 'title' | 'description', value: string) => {
    const newPhases = [...blueprint.journey.phases];
    newPhases[index] = { ...newPhases[index], [field]: value };
    onUpdate({
      journey: { ...blueprint.journey, phases: newPhases }
    });
  };
  
  const updateJourneyList = (field: 'activities' | 'resources', value: string) => {
    // Convert string back to array (assuming newline separation)
    const items = value.split('\n').filter(item => item.trim());
    onUpdate({
      journey: { ...blueprint.journey, [field]: items }
    });
  };
  
  const updateRubricCriterion = (index: number, field: string, value: string) => {
    const newCriteria = [...blueprint.deliverables.rubric.criteria];
    newCriteria[index] = { ...newCriteria[index], [field]: value };
    onUpdate({
      deliverables: {
        ...blueprint.deliverables,
        rubric: { ...blueprint.deliverables.rubric, criteria: newCriteria }
      }
    });
  };
  
  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          Project Blueprint
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Review and edit all captured information from your learning design process
        </p>
      </div>
      
      {/* Project Setup (Wizard) */}
      <Section 
        title="Project Setup" 
        icon={<div className="w-8 h-8 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg flex items-center justify-center">
          <FileText className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
        </div>}
      >
        <div className="grid md:grid-cols-2 gap-4">
          <EditableField
            label="Vision"
            value={blueprint.wizard.vision}
            onSave={(value) => updateWizard('vision', value)}
            multiline
            readOnly={readOnly}
          />
          <EditableField
            label="Subject"
            value={blueprint.wizard.subject}
            onSave={(value) => updateWizard('subject', value)}
            readOnly={readOnly}
          />
          <EditableField
            label="Students"
            value={blueprint.wizard.students}
            onSave={(value) => updateWizard('students', value)}
            readOnly={readOnly}
          />
          <EditableField
            label="Scope"
            value={blueprint.wizard.scope}
            onSave={(value) => updateWizard('scope', value as any)}
            readOnly={readOnly}
          />
        </div>
      </Section>
      
      {/* Ideation */}
      <Section 
        title="Ideation" 
        icon={<div className="w-8 h-8 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
          <Eye className="w-5 h-5 text-purple-600 dark:text-purple-400" />
        </div>}
      >
        <EditableField
          label="Big Idea"
          value={blueprint.ideation.bigIdea}
          onSave={(value) => updateIdeation('bigIdea', value)}
          multiline
          readOnly={readOnly}
        />
        <EditableField
          label="Essential Question"
          value={blueprint.ideation.essentialQuestion}
          onSave={(value) => updateIdeation('essentialQuestion', value)}
          multiline
          readOnly={readOnly}
        />
        <EditableField
          label="Challenge"
          value={blueprint.ideation.challenge}
          onSave={(value) => updateIdeation('challenge', value)}
          multiline
          readOnly={readOnly}
        />
      </Section>
      
      {/* Learning Journey */}
      <Section 
        title="Learning Journey" 
        icon={<div className="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
          <Users className="w-5 h-5 text-green-600 dark:text-green-400" />
        </div>}
      >
        <div className="space-y-6">
          <div>
            <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-3">Journey Phases</h4>
            {blueprint.journey.phases.map((phase, index) => (
              <div key={index} className="mb-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <EditableField
                  label={`Phase ${index + 1} Title`}
                  value={phase.title}
                  onSave={(value) => updateJourneyPhase(index, 'title', value)}
                  readOnly={readOnly}
                />
                <EditableField
                  label={`Phase ${index + 1} Description`}
                  value={phase.description}
                  onSave={(value) => updateJourneyPhase(index, 'description', value)}
                  multiline
                  readOnly={readOnly}
                />
              </div>
            ))}
          </div>
          
          <EditableField
            label="Activities"
            value={blueprint.journey.activities.join('\n')}
            onSave={(value) => updateJourneyList('activities', value)}
            multiline
            readOnly={readOnly}
          />
          
          <EditableField
            label="Resources"
            value={blueprint.journey.resources.join('\n')}
            onSave={(value) => updateJourneyList('resources', value)}
            multiline
            readOnly={readOnly}
          />
        </div>
      </Section>
      
      {/* Deliverables */}
      <Section 
        title="Student Deliverables" 
        icon={<div className="w-8 h-8 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center">
          <FileText className="w-5 h-5 text-orange-600 dark:text-orange-400" />
        </div>}
      >
        <div className="space-y-6">
          <div>
            <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-3">Milestones</h4>
            {blueprint.deliverables.milestones.map((milestone, index) => (
              <div key={index} className="mb-2 p-3 bg-gray-50 dark:bg-gray-700/50 rounded">
                <span className="font-medium">Phase {index + 1}:</span> {typeof milestone === 'string' ? milestone : milestone.title}
              </div>
            ))}
          </div>
          
          <div>
            <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-3">Assessment Rubric</h4>
            {blueprint.deliverables.rubric.criteria.map((criterion, index) => (
              <div key={index} className="mb-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <EditableField
                  label="Criterion"
                  value={criterion.criterion}
                  onSave={(value) => updateRubricCriterion(index, 'criterion', value)}
                  readOnly={readOnly}
                />
                <EditableField
                  label="Description"
                  value={criterion.description}
                  onSave={(value) => updateRubricCriterion(index, 'description', value)}
                  multiline
                  readOnly={readOnly}
                />
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Weight: {criterion.weight}%
                </div>
              </div>
            ))}
          </div>
          
          <div>
            <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-3">Impact</h4>
            <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              <p><strong>Audience:</strong> {blueprint.deliverables.impact.audience}</p>
              <p><strong>Method:</strong> {blueprint.deliverables.impact.method}</p>
              {blueprint.deliverables.impact.purpose && (
                <p><strong>Purpose:</strong> {blueprint.deliverables.impact.purpose}</p>
              )}
            </div>
          </div>
        </div>
      </Section>
      
      {/* Action Buttons */}
      <div className="mt-8 flex justify-center gap-4">
        <button
          onClick={onExport}
          className="px-6 py-3 bg-gray-600 text-white rounded-lg font-medium hover:bg-gray-700 transition-colors"
        >
          ← Back to Export Options
        </button>
      </div>
    </div>
  );
};