/**
 * Self-Reflection Component
 * Supports student metacognition and learning goal tracking
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  SelfReflection as SelfReflectionType,
  ReflectionPrompt,
  PBLStage,
  ConfidenceLevel,
  BloomLevel,
  DEFAULT_REFLECTION_PROMPTS 
} from '../../types/FormativeAssessmentTypes';
import { 
  Brain, 
  Target, 
  TrendingUp, 
  CheckCircle, 
  ArrowRight, 
  Lightbulb, 
  BookOpen,
  Star,
  Plus,
  X
} from 'lucide-react';

interface SelfReflectionProps {
  stage: PBLStage;
  onComplete: (responses: Array<{
    promptId: string;
    response: string;
    confidence?: ConfidenceLevel;
    learningGoals: string[];
  }>) => void;
  existingReflection?: SelfReflectionType;
  customPrompts?: ReflectionPrompt[];
  allowGoalSetting?: boolean;
}

interface ConfidenceScaleProps {
  value: ConfidenceLevel;
  onChange: (level: ConfidenceLevel) => void;
  label?: string;
}

interface LearningGoalTrackerProps {
  goals: string[];
  onGoalsChange: (goals: string[]) => void;
}

const ConfidenceScale: React.FC<ConfidenceScaleProps> = ({ value, onChange, label = "How confident do you feel?" }) => {
  const levels = [
    { level: ConfidenceLevel.NOT_CONFIDENT, label: 'Not Confident', emoji: '😟', color: 'red' },
    { level: ConfidenceLevel.SOMEWHAT_CONFIDENT, label: 'Somewhat', emoji: '🤔', color: 'yellow' },
    { level: ConfidenceLevel.CONFIDENT, label: 'Confident', emoji: '😊', color: 'blue' },
    { level: ConfidenceLevel.VERY_CONFIDENT, label: 'Very Confident', emoji: '😄', color: 'green' }
  ];

  return (
    <div className="space-y-3">
      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
        {label}
      </label>
      <div className="grid grid-cols-4 gap-2">
        {levels.map(({ level, label, emoji, color }) => {
          const isSelected = value === level;
          const colorClasses = {
            red: isSelected ? 'border-red-500 bg-red-50 dark:bg-red-900/20' : 'border-gray-200 dark:border-gray-700',
            yellow: isSelected ? 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20' : 'border-gray-200 dark:border-gray-700',
            blue: isSelected ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20' : 'border-gray-200 dark:border-gray-700',
            green: isSelected ? 'border-green-500 bg-green-50 dark:bg-green-900/20' : 'border-gray-200 dark:border-gray-700'
          };

          return (
            <button
              key={level}
              onClick={() => onChange(level)}
              className={`p-3 rounded-lg border-2 transition-all text-center hover:shadow-sm ${colorClasses[color as keyof typeof colorClasses]}`}
            >
              <div className="text-2xl mb-1">{emoji}</div>
              <div className="text-xs font-medium text-gray-700 dark:text-gray-300">{label}</div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

const LearningGoalTracker: React.FC<LearningGoalTrackerProps> = ({ goals, onGoalsChange }) => {
  const [newGoal, setNewGoal] = useState('');

  const addGoal = () => {
    if (newGoal.trim() && !goals.includes(newGoal.trim())) {
      onGoalsChange([...goals, newGoal.trim()]);
      setNewGoal('');
    }
  };

  const removeGoal = (goalToRemove: string) => {
    onGoalsChange(goals.filter(goal => goal !== goalToRemove));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-3">
        <Target className="w-4 h-4 text-primary-600 dark:text-primary-400" />
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Learning Goals for Next Time
        </label>
      </div>

      {/* Existing Goals */}
      {goals.length > 0 && (
        <div className="space-y-2">
          {goals.map((goal, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-2 p-2 bg-primary-50 dark:bg-primary-900/20 rounded-lg"
            >
              <Star className="w-4 h-4 text-primary-600 dark:text-primary-400 flex-shrink-0" />
              <span className="flex-1 text-sm text-primary-800 dark:text-primary-200">{goal}</span>
              <button
                onClick={() => removeGoal(goal)}
                className="p-1 text-primary-600 dark:text-primary-400 hover:bg-primary-100 dark:hover:bg-primary-800/30 rounded"
              >
                <X className="w-3 h-3" />
              </button>
            </motion.div>
          ))}
        </div>
      )}

      {/* Add New Goal */}
      <div className="flex gap-2">
        <input
          type="text"
          value={newGoal}
          onChange={(e) => setNewGoal(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && addGoal()}
          placeholder="What do you want to learn or improve?"
          className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
        />
        <button
          onClick={addGoal}
          disabled={!newGoal.trim()}
          className="px-3 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      <p className="text-xs text-gray-500 dark:text-gray-400">
        Set goals to help focus your learning and track your progress over time.
      </p>
    </div>
  );
};

const BloomLevelBadge: React.FC<{ level: BloomLevel }> = ({ level }) => {
  const levelConfig = {
    [BloomLevel.REMEMBER]: { color: 'gray', label: 'Remember' },
    [BloomLevel.UNDERSTAND]: { color: 'blue', label: 'Understand' },
    [BloomLevel.APPLY]: { color: 'green', label: 'Apply' },
    [BloomLevel.ANALYZE]: { color: 'yellow', label: 'Analyze' },
    [BloomLevel.EVALUATE]: { color: 'orange', label: 'Evaluate' },
    [BloomLevel.CREATE]: { color: 'purple', label: 'Create' }
  };

  const config = levelConfig[level];
  const colorClasses = {
    gray: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
    blue: 'bg-primary-100 text-primary-700 dark:bg-primary-900/50 dark:text-primary-300',
    green: 'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300',
    yellow: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/50 dark:text-yellow-300',
    orange: 'bg-orange-100 text-orange-700 dark:bg-orange-900/50 dark:text-orange-300',
    purple: 'bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300'
  };

  return (
    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${colorClasses[config.color as keyof typeof colorClasses]}`}>
      <Brain className="w-3 h-3 mr-1" />
      {config.label}
    </span>
  );
};

export const SelfReflection: React.FC<SelfReflectionProps> = ({
  stage,
  onComplete,
  existingReflection,
  customPrompts,
  allowGoalSetting = true
}) => {
  const [responses, setResponses] = useState<Map<string, { response: string; confidence?: ConfidenceLevel; learningGoals: string[] }>>(new Map());
  const [currentPromptIndex, setCurrentPromptIndex] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [showProgress, setShowProgress] = useState(false);

  // Use custom prompts or default ones
  const prompts = customPrompts || DEFAULT_REFLECTION_PROMPTS[stage] || [];

  // Load existing reflection
  useEffect(() => {
    if (existingReflection) {
      const responseMap = new Map();
      existingReflection.responses.forEach(response => {
        responseMap.set(response.promptId, {
          response: response.response,
          confidence: response.confidence,
          learningGoals: response.learningGoals
        });
      });
      setResponses(responseMap);
    }
  }, [existingReflection]);

  const updateResponse = (promptId: string, response: string, confidence?: ConfidenceLevel, learningGoals: string[] = []) => {
    setResponses(new Map(responses.set(promptId, { response, confidence, learningGoals })));
  };

  const handleNext = () => {
    if (currentPromptIndex < prompts.length - 1) {
      setCurrentPromptIndex(currentPromptIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentPromptIndex > 0) {
      setCurrentPromptIndex(currentPromptIndex - 1);
    }
  };

  const handleSubmit = () => {
    const reflectionResponses = Array.from(responses.entries()).map(
      ([promptId, { response, confidence, learningGoals }]) => ({
        promptId,
        response,
        confidence,
        learningGoals
      })
    );

    setIsCompleted(true);
    onComplete(reflectionResponses);
  };

  const currentPrompt = prompts[currentPromptIndex];
  const currentResponse = responses.get(currentPrompt?.id || '') || { response: '', learningGoals: [] };
  const isCurrentPromptComplete = currentPrompt?.isRequired 
    ? currentResponse.response.trim() !== '' 
    : true;
  const allRequiredComplete = prompts.every(prompt => 
    !prompt.isRequired || responses.get(prompt.id)?.response.trim()
  );

  const completedPrompts = prompts.filter(prompt => 
    responses.has(prompt.id) && responses.get(prompt.id)!.response.trim() !== ''
  ).length;

  if (isCompleted) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white dark:bg-gray-800 rounded-xl shadow-soft border border-gray-200 dark:border-gray-700 p-6 max-w-2xl mx-auto"
      >
        <div className="text-center">
          <div className="w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Brain className="w-8 h-8 text-green-600 dark:text-green-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
            Reflection Complete!
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Great job reflecting on your learning. This self-awareness will help you grow as a learner.
          </p>
          <div className="bg-primary-50 dark:bg-primary-900/20 rounded-lg p-4">
            <h4 className="font-medium text-primary-900 dark:text-primary-100 mb-2">
              Remember your learning goals:
            </h4>
            <ul className="text-sm text-primary-800 dark:text-primary-200 space-y-1">
              {Array.from(responses.values())
                .flatMap(r => r.learningGoals)
                .filter((goal, index, array) => array.indexOf(goal) === index)
                .map((goal, index) => (
                  <li key={index}>• {goal}</li>
                ))
              }
            </ul>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-soft border border-gray-200 dark:border-gray-700 max-w-3xl mx-auto">
      {/* Header */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
              <Brain className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                Self-Reflection
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                {stage.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())} Learning Reflection
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowProgress(!showProgress)}
            className="flex items-center gap-2 px-3 py-1 text-sm text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-lg transition-colors"
          >
            <TrendingUp className="w-4 h-4" />
            Progress
          </button>
        </div>

        {/* Progress */}
        <AnimatePresence>
          {showProgress && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-4"
            >
              <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
                <span>Reflection {currentPromptIndex + 1} of {prompts.length}</span>
                <span>{completedPrompts} completed</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div 
                  className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(completedPrompts / prompts.length) * 100}%` }}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Current Prompt */}
      <div className="p-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentPromptIndex}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            {currentPrompt && (
              <div className="space-y-6">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Lightbulb className="w-5 h-5 text-yellow-500" />
                    <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                      Reflection Prompt
                    </h3>
                    <BloomLevelBadge level={currentPrompt.bloomLevel} />
                  </div>
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                    {currentPrompt.text}
                  </p>
                  {currentPrompt.isRequired && (
                    <span className="text-sm text-red-500">Required</span>
                  )}
                </div>

                {/* Response */}
                <div className="space-y-3">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Your reflection
                  </label>
                  <textarea
                    value={currentResponse.response}
                    onChange={(e) => updateResponse(
                      currentPrompt.id, 
                      e.target.value, 
                      currentResponse.confidence, 
                      currentResponse.learningGoals
                    )}
                    placeholder="Take time to think deeply about this question..."
                    className="w-full p-4 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none h-32"
                    required={currentPrompt.isRequired}
                  />
                </div>

                {/* Confidence Scale */}
                <ConfidenceScale
                  value={currentResponse.confidence || ConfidenceLevel.CONFIDENT}
                  onChange={(confidence) => updateResponse(
                    currentPrompt.id, 
                    currentResponse.response, 
                    confidence, 
                    currentResponse.learningGoals
                  )}
                  label="How confident do you feel about this topic?"
                />

                {/* Learning Goals (only on last prompt or if explicitly enabled) */}
                {allowGoalSetting && (currentPromptIndex === prompts.length - 1 || currentPrompt.bloomLevel === BloomLevel.CREATE) && (
                  <LearningGoalTracker
                    goals={currentResponse.learningGoals}
                    onGoalsChange={(learningGoals) => updateResponse(
                      currentPrompt.id, 
                      currentResponse.response, 
                      currentResponse.confidence, 
                      learningGoals
                    )}
                  />
                )}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Actions */}
      <div className="p-6 border-t border-gray-200 dark:border-gray-700">
        <div className="flex justify-between items-center">
          <button
            onClick={handlePrevious}
            disabled={currentPromptIndex === 0}
            className="flex items-center gap-2 px-4 py-2 text-gray-600 dark:text-gray-400 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>

          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {prompts.length - completedPrompts} reflections remaining
            </span>
            
            {currentPromptIndex === prompts.length - 1 ? (
              <button
                onClick={handleSubmit}
                disabled={!allRequiredComplete}
                className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <CheckCircle className="w-4 h-4" />
                Complete Reflection
              </button>
            ) : (
              <button
                onClick={handleNext}
                disabled={!isCurrentPromptComplete}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                Next
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};