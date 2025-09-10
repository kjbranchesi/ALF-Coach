import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Target, HelpCircle, Lightbulb, RefreshCw, Check } from 'lucide-react';
import { Tier } from '../../../types/alf';
import { StepComponentProps } from '../types';
import { WizardDataV3 } from '../wizardSchema';

interface EQOption {
  text: string;
  rationale: string;
  tier: Tier;
}

export const GoalsEQStep: React.FC<StepComponentProps> = ({
  data,
  onUpdate,
  onNext,
  onBack
}) => {
  const [bigIdea, setBigIdea] = useState(data.bigIdea || '');
  const [essentialQuestion, setEssentialQuestion] = useState(data.essentialQuestion || '');
  const [learningGoals, setLearningGoals] = useState<string[]>(data.learningGoals || ['', '', '']);
  const [successCriteria, setSuccessCriteria] = useState<string[]>(data.successCriteria || ['', '', '']);
  const [eqOptions, setEqOptions] = useState<EQOption[]>([]);
  const [selectedEQIndex, setSelectedEQIndex] = useState<number | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Generate EQ options based on big idea
  const generateEQOptions = () => {
    setIsGenerating(true);
    
    // Simulate AI generation (in real app, this would call an API)
    setTimeout(() => {
      const options: EQOption[] = [
        {
          text: "How can we create lasting change in our community through sustainable practices?",
          rationale: "Focuses on action and impact, emphasizing student agency and real-world application.",
          tier: 'core'
        },
        {
          text: "What is our responsibility to future generations, and how can we act on it today?",
          rationale: "Explores ethical dimensions and personal responsibility, connecting to larger themes.",
          tier: 'core'
        },
        {
          text: "How do individual choices create collective impact on our environment?",
          rationale: "Examines systems thinking and interconnectedness, building critical thinking skills.",
          tier: 'scaffold'
        }
      ];
      setEqOptions(options);
      setIsGenerating(false);
    }, 1500);
  };

  // Validation
  const validate = () => {
    const newErrors: Record<string, string> = {};
    
    if (!bigIdea || bigIdea.length < 20) {
      newErrors.bigIdea = 'Please describe the big idea (at least 20 characters)';
    }
    if (!essentialQuestion || essentialQuestion.length < 10) {
      newErrors.essentialQuestion = 'Please provide an essential question';
    }
    
    const filledGoals = learningGoals.filter(g => g.trim());
    if (filledGoals.length < 2) {
      newErrors.learningGoals = 'Please provide at least 2 learning goals';
    }
    
    const filledCriteria = successCriteria.filter(c => c.trim());
    if (filledCriteria.length < 2) {
      newErrors.successCriteria = 'Please provide at least 2 success criteria';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = () => {
    if (validate()) {
      onUpdate({
        bigIdea,
        essentialQuestion,
        learningGoals: learningGoals.filter(g => g.trim()),
        successCriteria: successCriteria.filter(c => c.trim())
      });
      onNext();
    }
  };

  // Update learning goal
  const updateLearningGoal = (index: number, value: string) => {
    const newGoals = [...learningGoals];
    newGoals[index] = value;
    setLearningGoals(newGoals);
  };

  // Update success criterion
  const updateSuccessCriterion = (index: number, value: string) => {
    const newCriteria = [...successCriteria];
    newCriteria[index] = value;
    setSuccessCriteria(newCriteria);
  };

  // Add more fields
  const addLearningGoal = () => {
    setLearningGoals([...learningGoals, '']);
  };

  const addSuccessCriterion = () => {
    setSuccessCriteria([...successCriteria, '']);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
          Define Your Big Idea & Essential Question
        </h3>
        <p className="text-slate-600 dark:text-slate-400">
          These will guide your entire project and give it purpose and direction.
        </p>
      </div>

      {/* Form sections */}
      <div className="space-y-8">
        {/* Big Idea */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <div className="flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-amber-600" />
            <h4 className="font-semibold text-slate-800 dark:text-slate-200">Big Idea</h4>
            <span className="text-xs px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-full">
              Core
            </span>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              What's the overarching concept or theme? *
            </label>
            <textarea
              value={bigIdea}
              onChange={(e) => setBigIdea(e.target.value)}
              className={`
                w-full px-4 py-3 rounded-lg border transition-colors
                ${errors.bigIdea 
                  ? 'border-red-500 focus:border-red-600' 
                  : 'border-slate-300 dark:border-slate-600 focus:border-blue-500'
                }
                bg-white dark:bg-slate-800 text-slate-900 dark:text-white
              `}
              rows={3}
              placeholder="E.g., 'Our choices today shape the world of tomorrow - exploring sustainability through action and advocacy.'"
            />
            {errors.bigIdea && (
              <p className="mt-1 text-sm text-red-600">{errors.bigIdea}</p>
            )}
            <p className="mt-2 text-xs text-slate-500">
              This should capture the essence of what students will explore and why it matters.
            </p>
          </div>
        </motion.div>

        {/* Essential Question */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="space-y-4"
        >
          <div className="flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-purple-600" />
            <h4 className="font-semibold text-slate-800 dark:text-slate-200">Essential Question</h4>
            <span className="text-xs px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 rounded-full">
              Scaffold
            </span>
          </div>
          
          {/* Generate options button */}
          {bigIdea && bigIdea.length > 20 && (
            <button
              onClick={generateEQOptions}
              disabled={isGenerating}
              className="flex items-center gap-2 px-4 py-2 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors"
            >
              {isGenerating ? (
                <>
                  <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                  Generating options...
                </>
              ) : (
                <>
                  <RefreshCw className="w-4 h-4" />
                  Generate EQ Options
                </>
              )}
            </button>
          )}

          {/* EQ Options */}
          {eqOptions.length > 0 && (
            <div className="space-y-3">
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Select an option or write your own:
              </p>
              {eqOptions.map((option, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`
                    p-4 rounded-lg border-2 cursor-pointer transition-all
                    ${selectedEQIndex === index
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                      : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                    }
                  `}
                  onClick={() => {
                    setSelectedEQIndex(index);
                    setEssentialQuestion(option.text);
                  }}
                >
                  <div className="flex items-start gap-3">
                    <div className={`
                      w-5 h-5 rounded-full border-2 mt-0.5 flex items-center justify-center
                      ${selectedEQIndex === index
                        ? 'border-blue-500 bg-blue-500'
                        : 'border-slate-300 dark:border-slate-600'
                      }
                    `}>
                      {selectedEQIndex === index && (
                        <Check className="w-3 h-3 text-white" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="text-slate-800 dark:text-slate-200 font-medium">
                        {option.text}
                      </p>
                      <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                        {option.rationale}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          {/* Custom EQ input */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Essential Question *
            </label>
            <textarea
              value={essentialQuestion}
              onChange={(e) => {
                setEssentialQuestion(e.target.value);
                setSelectedEQIndex(null); // Clear selection if manually editing
              }}
              className={`
                w-full px-4 py-3 rounded-lg border transition-colors
                ${errors.essentialQuestion 
                  ? 'border-red-500 focus:border-red-600' 
                  : 'border-slate-300 dark:border-slate-600 focus:border-blue-500'
                }
                bg-white dark:bg-slate-800 text-slate-900 dark:text-white
              `}
              rows={2}
              placeholder="E.g., 'How can we create lasting change in our community through sustainable practices?'"
            />
            {errors.essentialQuestion && (
              <p className="mt-1 text-sm text-red-600">{errors.essentialQuestion}</p>
            )}
          </div>
        </motion.div>

        {/* Learning Goals */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-4"
        >
          <div className="flex items-center gap-2">
            <Target className="w-5 h-5 text-green-600" />
            <h4 className="font-semibold text-slate-800 dark:text-slate-200">Learning Goals</h4>
            <span className="text-xs px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-full">
              Core
            </span>
          </div>
          
          <div className="space-y-3">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
              What will students learn? (Minimum 2) *
            </label>
            {learningGoals.map((goal, index) => (
              <input
                key={index}
                type="text"
                value={goal}
                onChange={(e) => updateLearningGoal(index, e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                placeholder={`Learning goal ${index + 1}...`}
              />
            ))}
            <button
              onClick={addLearningGoal}
              className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
            >
              + Add another learning goal
            </button>
            {errors.learningGoals && (
              <p className="text-sm text-red-600">{errors.learningGoals}</p>
            )}
          </div>
        </motion.div>

        {/* Success Criteria */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="space-y-4"
        >
          <div className="flex items-center gap-2">
            <Check className="w-5 h-5 text-green-600" />
            <h4 className="font-semibold text-slate-800 dark:text-slate-200">Success Criteria</h4>
            <span className="text-xs px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 rounded-full">
              Scaffold
            </span>
          </div>
          
          <div className="space-y-3">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
              How will students demonstrate success? (Minimum 2) *
            </label>
            {successCriteria.map((criterion, index) => (
              <input
                key={index}
                type="text"
                value={criterion}
                onChange={(e) => updateSuccessCriterion(index, e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                placeholder={`Success criterion ${index + 1}...`}
              />
            ))}
            <button
              onClick={addSuccessCriterion}
              className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
            >
              + Add another success criterion
            </button>
            {errors.successCriteria && (
              <p className="text-sm text-red-600">{errors.successCriteria}</p>
            )}
          </div>
        </motion.div>
      </div>

      {/* Action buttons */}
      <div className="flex justify-between gap-3 pt-6 border-t border-slate-200 dark:border-slate-700">
        <button
          onClick={onBack}
          className="px-6 py-3 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-xl font-medium hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
        >
          Back
        </button>
        <button
          onClick={handleSubmit}
          className="px-6 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors shadow-lg"
        >
          Continue to Standards Alignment
        </button>
      </div>
    </div>
  );
};