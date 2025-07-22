// useWhatIfScenarios.js - Hook for handling What-If scenarios and consistency checks

import { useState, useCallback, useEffect } from 'react';
import { useBlueprint } from '../context/BlueprintContext';
import { WhatIfScenarios } from '../context/BlueprintSchema';

export const useWhatIfScenarios = () => {
  const { blueprint, updateBlueprint } = useBlueprint();
  const [pendingChanges, setPendingChanges] = useState([]);
  const [showConsistencyDialog, setShowConsistencyDialog] = useState(false);
  const [inconsistencies, setInconsistencies] = useState([]);

  // Check for help requests
  const checkHelpRequest = useCallback((input) => {
    const helpPhrases = [
      /^help$/i,
      /help me/i,
      /please (help|do|suggest)/i,
      /okay please/i,
      /yes please/i,
      /can you/i,
      /could you/i,
      /I need help/i,
      /I'm stuck/i,
      /what should I/i,
      /give me (ideas|suggestions)/i,
      /show me/i
    ];
    
    const isHelpRequest = helpPhrases.some(pattern => pattern.test(input.trim()));
    
    if (isHelpRequest || WhatIfScenarios.HELP_MID_STEP.trigger.test(input)) {
      return {
        type: 'help',
        suggestions: [
          'Get Ideas - AI will suggest relevant options',
          'See Examples - View samples from similar projects',
          'Skip - Mark as TODO and continue',
          'Ask AI - Free-form question'
        ]
      };
    }
    return null;
  }, []);

  // Check for empty required fields
  const checkEmptyRequired = useCallback((fieldName, currentStage) => {
    const stageRequirements = {
      ideation: ['bigIdea', 'essentialQuestion', 'challenge'],
      learningJourney: ['phases', 'activities'],
      authenticDeliverables: ['milestones', 'rubric']
    };

    const required = stageRequirements[currentStage] || [];
    if (required.includes(fieldName) && !blueprint[currentStage][fieldName]) {
      return {
        type: 'emptyRequired',
        message: `This field is required. Need inspiration? Try 'Get Ideas' or 'Skip' for now.`,
        field: fieldName
      };
    }
    return null;
  }, [blueprint]);

  // Check for consistency when revising earlier stages
  const checkConsistency = useCallback((changedStage, changedField, newValue) => {
    const checks = [];

    // If Big Idea changes, check Essential Question and Challenge
    if (changedStage === 'ideation' && changedField === 'bigIdea') {
      const oldBigIdea = blueprint.ideation.bigIdea;
      if (oldBigIdea && newValue !== oldBigIdea) {
        checks.push({
          stage: 'ideation',
          field: 'essentialQuestion',
          reason: 'Big Idea has changed',
          suggestion: 'Update Essential Question to align with new Big Idea'
        });
        checks.push({
          stage: 'ideation',
          field: 'challenge',
          reason: 'Big Idea has changed',
          suggestion: 'Update Challenge to reflect new focus'
        });
      }
    }

    // If Essential Question changes, check Challenge alignment
    if (changedStage === 'ideation' && changedField === 'essentialQuestion') {
      const oldEQ = blueprint.ideation.essentialQuestion;
      if (oldEQ && newValue !== oldEQ) {
        checks.push({
          stage: 'ideation',
          field: 'challenge',
          reason: 'Essential Question has changed',
          suggestion: 'Ensure Challenge addresses the new question'
        });
      }
    }

    // If phases are reordered, check activities and milestones
    if (changedStage === 'learningJourney' && changedField === 'phases') {
      checks.push({
        stage: 'learningJourney',
        field: 'activities',
        reason: 'Phases have been reordered',
        suggestion: 'Review activities for logical flow'
      });
      checks.push({
        stage: 'authenticDeliverables',
        field: 'milestones',
        reason: 'Phases have been reordered',
        suggestion: 'Adjust milestone dates if needed'
      });
    }

    return checks;
  }, [blueprint]);

  // Handle phase reordering
  const handlePhaseReorder = useCallback((newPhaseOrder) => {
    const checks = checkConsistency('learningJourney', 'phases', newPhaseOrder);
    if (checks.length > 0) {
      setInconsistencies(checks);
      setShowConsistencyDialog(true);
      setPendingChanges([{
        type: 'phaseReorder',
        data: newPhaseOrder
      }]);
    } else {
      // Apply changes directly if no inconsistencies
      updateBlueprint({
        learningJourney: {
          ...blueprint.learningJourney,
          phases: newPhaseOrder
        }
      });
    }
  }, [blueprint, checkConsistency, updateBlueprint]);

  // Apply pending changes after consistency review
  const applyPendingChanges = useCallback(() => {
    pendingChanges.forEach(change => {
      switch (change.type) {
        case 'phaseReorder':
          updateBlueprint({
            learningJourney: {
              ...blueprint.learningJourney,
              phases: change.data
            }
          });
          break;
        case 'fieldUpdate':
          updateBlueprint({
            [change.stage]: {
              ...blueprint[change.stage],
              [change.field]: change.value
            }
          });
          break;
      }
    });
    setPendingChanges([]);
    setShowConsistencyDialog(false);
    setInconsistencies([]);
  }, [pendingChanges, blueprint, updateBlueprint]);

  // Cancel pending changes
  const cancelPendingChanges = useCallback(() => {
    setPendingChanges([]);
    setShowConsistencyDialog(false);
    setInconsistencies([]);
  }, []);

  // Auto-update suggestions
  const getAutoUpdateSuggestion = useCallback((field, context) => {
    const suggestions = {
      essentialQuestion: (bigIdea) => {
        if (bigIdea.toLowerCase().includes('innovation')) {
          return 'How can we innovate to create positive change in our community?';
        }
        if (bigIdea.toLowerCase().includes('sustainability')) {
          return 'What sustainable solutions can we develop for future generations?';
        }
        return `How can we explore ${bigIdea} to deepen understanding?`;
      },
      challenge: (bigIdea, essentialQuestion) => {
        const verb = essentialQuestion.toLowerCase().includes('create') ? 'Design' :
                    essentialQuestion.toLowerCase().includes('solve') ? 'Develop' :
                    'Create';
        return `${verb} a solution that demonstrates understanding of ${bigIdea}`;
      }
    };

    return suggestions[field] ? suggestions[field](context.bigIdea, context.essentialQuestion) : null;
  }, []);

  // Validate field transitions
  const validateFieldTransition = useCallback((fromField, toField, currentStage) => {
    const transitions = {
      ideation: {
        bigIdea: ['essentialQuestion'],
        essentialQuestion: ['challenge'],
        challenge: ['issues']
      },
      learningJourney: {
        phases: ['activities'],
        activities: ['resources']
      },
      authenticDeliverables: {
        milestones: ['rubric'],
        rubric: ['impactPlan']
      }
    };

    const allowedNext = transitions[currentStage]?.[fromField] || [];
    return allowedNext.includes(toField);
  }, []);

  return {
    checkHelpRequest,
    checkEmptyRequired,
    checkConsistency,
    handlePhaseReorder,
    applyPendingChanges,
    cancelPendingChanges,
    getAutoUpdateSuggestion,
    validateFieldTransition,
    showConsistencyDialog,
    inconsistencies
  };
};