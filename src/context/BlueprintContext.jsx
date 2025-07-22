// BlueprintContext.jsx - Comprehensive context for Blueprint Builder

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { BlueprintSchema, BlueprintStages, ValidationRules, SuccessMetrics } from './BlueprintSchema';
import { v4 as uuidv4 } from 'uuid';

const BlueprintContext = createContext();

export const useBlueprint = () => {
  const context = useContext(BlueprintContext);
  if (!context) {
    throw new Error('useBlueprint must be used within a BlueprintProvider');
  }
  return context;
};

export const BlueprintProvider = ({ children }) => {
  const [blueprint, setBlueprint] = useState(() => {
    // Try to load from localStorage
    const saved = localStorage.getItem('currentBlueprint');
    if (saved) {
      return JSON.parse(saved);
    }
    return {
      ...BlueprintSchema,
      id: uuidv4(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
  });

  // Auto-save to localStorage
  useEffect(() => {
    localStorage.setItem('currentBlueprint', JSON.stringify(blueprint));
  }, [blueprint]);

  // Update blueprint data
  const updateBlueprint = useCallback((updates) => {
    setBlueprint(prev => ({
      ...prev,
      ...updates,
      updatedAt: new Date().toISOString()
    }));
  }, []);

  // Stage-specific update methods
  const updateIdeation = useCallback((ideationData) => {
    setBlueprint(prev => ({
      ...prev,
      ideation: {
        ...prev.ideation,
        ...ideationData,
        completed: checkIdeationComplete({
          ...prev.ideation,
          ...ideationData
        })
      },
      updatedAt: new Date().toISOString()
    }));
  }, []);

  const updateLearningJourney = useCallback((journeyData) => {
    setBlueprint(prev => ({
      ...prev,
      learningJourney: {
        ...prev.learningJourney,
        ...journeyData,
        completed: checkLearningJourneyComplete({
          ...prev.learningJourney,
          ...journeyData
        })
      },
      updatedAt: new Date().toISOString()
    }));
  }, []);

  const updateAuthenticDeliverables = useCallback((deliverablesData) => {
    setBlueprint(prev => ({
      ...prev,
      authenticDeliverables: {
        ...prev.authenticDeliverables,
        ...deliverablesData,
        completed: checkDeliverablesComplete({
          ...prev.authenticDeliverables,
          ...deliverablesData
        })
      },
      updatedAt: new Date().toISOString()
    }));
  }, []);

  // Progress tracking
  const markStepComplete = useCallback((stepId) => {
    setBlueprint(prev => ({
      ...prev,
      progress: {
        ...prev.progress,
        checkpoints: {
          ...prev.progress.checkpoints,
          [stepId]: {
            completed: true,
            timestamp: new Date().toISOString()
          }
        },
        completedSteps: prev.progress.completedSteps + 1,
        lastActivity: new Date().toISOString()
      }
    }));
  }, []);

  const skipStep = useCallback((stepId) => {
    setBlueprint(prev => ({
      ...prev,
      progress: {
        ...prev.progress,
        skippedSteps: [...prev.progress.skippedSteps, stepId],
        lastActivity: new Date().toISOString()
      }
    }));
  }, []);

  // Stage navigation
  const moveToNextStage = useCallback(() => {
    const stages = Object.values(BlueprintStages);
    const currentIndex = stages.indexOf(blueprint.currentStage);
    if (currentIndex < stages.length - 1) {
      setBlueprint(prev => ({
        ...prev,
        currentStage: stages[currentIndex + 1],
        updatedAt: new Date().toISOString()
      }));
    }
  }, [blueprint.currentStage]);

  const setCurrentStage = useCallback((stage) => {
    if (Object.values(BlueprintStages).includes(stage)) {
      setBlueprint(prev => ({
        ...prev,
        currentStage: stage,
        updatedAt: new Date().toISOString()
      }));
    }
  }, []);

  // Validation methods
  const validateBigIdea = useCallback((text) => {
    const wordCount = text.trim().split(/\s+/).length;
    return {
      valid: wordCount >= ValidationRules.bigIdea.minWords && 
             wordCount <= ValidationRules.bigIdea.maxWords,
      message: wordCount > ValidationRules.bigIdea.maxWords 
        ? `Big Idea should be ${ValidationRules.bigIdea.maxWords} words or less`
        : wordCount < ValidationRules.bigIdea.minWords
        ? 'Please provide at least 2 words'
        : ''
    };
  }, []);

  const validateEssentialQuestion = useCallback((text) => {
    const startsCorrectly = ValidationRules.essentialQuestion.mustStartWith.test(text);
    const endsCorrectly = text.trim().endsWith('?');
    const wordCount = text.trim().split(/\s+/).length;
    
    return {
      valid: startsCorrectly && endsCorrectly && wordCount >= ValidationRules.essentialQuestion.minWords,
      message: !startsCorrectly 
        ? 'Essential Questions should start with How, Why, What, etc.'
        : !endsCorrectly
        ? 'Essential Questions should end with ?'
        : wordCount < ValidationRules.essentialQuestion.minWords
        ? 'Please make your question more specific'
        : ''
    };
  }, []);

  const validateChallenge = useCallback((text) => {
    const hasVerb = ValidationRules.challenge.mustContainVerb.test(text);
    return {
      valid: hasVerb && text.trim().split(/\s+/).length >= 5,
      message: !hasVerb
        ? 'Challenges should describe what students will DO (create, design, build, etc.)'
        : 'Please include who the audience is'
    };
  }, []);

  // Completion checks
  const checkIdeationComplete = (ideationData) => {
    const required = SuccessMetrics.ideation.required;
    return required.every(field => ideationData[field] && ideationData[field].trim() !== '');
  };

  const checkLearningJourneyComplete = (journeyData) => {
    return journeyData.phases.length >= ValidationRules.phases.min &&
           Object.keys(journeyData.activities).length > 0 &&
           Object.values(journeyData.activities).every(activities => 
             activities.length >= ValidationRules.activities.minPerPhase
           );
  };

  const checkDeliverablesComplete = (deliverablesData) => {
    return deliverablesData.milestones.length > 0 &&
           deliverablesData.rubric.criteria.length >= ValidationRules.rubricCriteria.min;
  };

  // Get overall progress
  const getProgress = useCallback(() => {
    const stages = [
      { key: 'ideation', weight: 0.25 },
      { key: 'learningJourney', weight: 0.35 },
      { key: 'authenticDeliverables', weight: 0.30 },
      { key: 'publish', weight: 0.10 }
    ];

    let totalProgress = 0;
    stages.forEach(stage => {
      if (blueprint[stage.key]?.completed || 
          (stage.key === 'publish' && blueprint.publish.published)) {
        totalProgress += stage.weight;
      }
    });

    return Math.round(totalProgress * 100);
  }, [blueprint]);

  // Generate deliverables
  const generateCatalystCard = useCallback(() => {
    const { bigIdea, essentialQuestion, challenge, issues } = blueprint.ideation;
    return {
      title: 'Project Catalyst Card',
      content: {
        bigIdea,
        essentialQuestion,
        challenge,
        issues
      },
      generatedAt: new Date().toISOString()
    };
  }, [blueprint.ideation]);

  const generateTimelineOutline = useCallback(() => {
    const { phases, activities, resources } = blueprint.learningJourney;
    return {
      title: 'Curriculum Timeline Outline',
      content: {
        phases,
        activities,
        resources
      },
      generatedAt: new Date().toISOString()
    };
  }, [blueprint.learningJourney]);

  // Reset blueprint
  const resetBlueprint = useCallback(() => {
    const newBlueprint = {
      ...BlueprintSchema,
      id: uuidv4(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    setBlueprint(newBlueprint);
    localStorage.removeItem('currentBlueprint');
  }, []);

  // Initialize with project info from onboarding
  const initializeWithProjectInfo = useCallback((projectInfo) => {
    setBlueprint(prev => ({
      ...prev,
      projectInfo,
      updatedAt: new Date().toISOString()
    }));
  }, []);

  const value = {
    blueprint,
    updateBlueprint,
    updateIdeation,
    updateLearningJourney,
    updateAuthenticDeliverables,
    markStepComplete,
    skipStep,
    moveToNextStage,
    setCurrentStage,
    validateBigIdea,
    validateEssentialQuestion,
    validateChallenge,
    getProgress,
    generateCatalystCard,
    generateTimelineOutline,
    resetBlueprint,
    initializeWithProjectInfo
  };

  return (
    <BlueprintContext.Provider value={value}>
      {children}
    </BlueprintContext.Provider>
  );
};