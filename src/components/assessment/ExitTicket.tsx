/**
 * Exit Ticket Component for Formative Assessment
 * Provides quick, focused check-ins at the end of each PBL stage or lesson
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ExitTicket as ExitTicketType, 
  type ExitTicketResponse, 
  type PBLStage, 
  ConfidenceLevel,
  DEFAULT_EXIT_TICKET_QUESTIONS 
} from '../../types/FormativeAssessmentTypes';
import { CheckCircle, Clock, MessageSquare, TrendingUp } from 'lucide-react';

interface ExitTicketProps {
  stage: PBLStage;
  onComplete: (responses: ExitTicketResponse[]) => void;
  onSave?: (responses: ExitTicketResponse[]) => void;
  existingResponses?: ExitTicketResponse[];
  isRequired?: boolean;
  timeLimit?: number; // in minutes
}

interface QuestionComponentProps {
  question: {
    id: string;
    text: string;
    type: 'short_answer' | 'multiple_choice' | 'scale' | 'confidence';
    required: boolean;
    options?: string[];
  };
  value: string;
  onChange: (value: string, confidence?: ConfidenceLevel) => void;
}

const ConfidenceScale: React.FC<{
  value: ConfidenceLevel;
  onChange: (level: ConfidenceLevel) => void;
}> = ({ value, onChange }) => {
  const levels = [
    { level: ConfidenceLevel.NOT_CONFIDENT, label: 'Not Confident', emoji: '😟' },
    { level: ConfidenceLevel.SOMEWHAT_CONFIDENT, label: 'Somewhat', emoji: '🤔' },
    { level: ConfidenceLevel.CONFIDENT, label: 'Confident', emoji: '😊' },
    { level: ConfidenceLevel.VERY_CONFIDENT, label: 'Very Confident', emoji: '😄' }
  ];

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center text-sm text-gray-600 dark:text-gray-400">
        <span>Not Confident</span>
        <span>Very Confident</span>
      </div>
      <div className="flex gap-2">
        {levels.map(({ level, label, emoji }) => (
          <button
            key={level}
            onClick={() => onChange(level)}
            className={`flex-1 p-3 rounded-lg border-2 transition-all ${
              value === level
                ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
            }`}
          >
            <div className="text-2xl mb-1">{emoji}</div>
            <div className="text-xs font-medium">{label}</div>
          </button>
        ))}
      </div>
    </div>
  );
};

const QuestionComponent: React.FC<QuestionComponentProps> = ({ question, value, onChange }) => {
  const [confidence, setConfidence] = useState<ConfidenceLevel>(ConfidenceLevel.CONFIDENT);

  const handleConfidenceChange = (level: ConfidenceLevel) => {
    setConfidence(level);
    onChange(value, level);
  };

  switch (question.type) {
    case 'short_answer':
      return (
        <div className="space-y-3">
          <textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Share your thoughts..."
            className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none h-24"
            required={question.required}
          />
        </div>
      );

    case 'multiple_choice':
      return (
        <div className="space-y-2">
          {question.options?.map((option, index) => (
            <label key={index} className="flex items-center gap-3 p-2 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg cursor-pointer">
              <input
                type="radio"
                name={question.id}
                value={option}
                checked={value === option}
                onChange={(e) => onChange(e.target.value)}
                className="text-primary-600"
              />
              <span className="text-gray-700 dark:text-gray-300">{option}</span>
            </label>
          ))}
        </div>
      );

    case 'confidence':
      return (
        <ConfidenceScale
          value={confidence}
          onChange={handleConfidenceChange}
        />
      );

    case 'scale':
      return (
        <div className="space-y-3">
          <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
            <span>Strongly Disagree</span>
            <span>Strongly Agree</span>
          </div>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((num) => (
              <button
                key={num}
                onClick={() => onChange(num.toString())}
                className={`flex-1 p-2 rounded-lg border-2 transition-all ${
                  value === num.toString()
                    ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                }`}
              >
                {num}
              </button>
            ))}
          </div>
        </div>
      );

    default:
      return null;
  }
};

export const ExitTicket: React.FC<ExitTicketProps> = ({
  stage,
  onComplete,
  onSave,
  existingResponses = [],
  isRequired = false,
  timeLimit
}) => {
  const [responses, setResponses] = useState<Map<string, { value: string; confidence?: ConfidenceLevel }>>(new Map());
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(timeLimit ? timeLimit * 60 : null); // Convert to seconds
  const [isCompleted, setIsCompleted] = useState(false);
  const [startTime] = useState(new Date());

  // Get questions for the current stage
  const questions = DEFAULT_EXIT_TICKET_QUESTIONS[stage] || [];

  // Load existing responses
  useEffect(() => {
    if (existingResponses.length > 0) {
      const responseMap = new Map();
      existingResponses.forEach(response => {
        responseMap.set(response.questionId, {
          value: response.response,
          confidence: response.confidence
        });
      });
      setResponses(responseMap);
    }
  }, [existingResponses]);

  // Timer logic
  useEffect(() => {
    if (timeRemaining && timeRemaining > 0 && !isCompleted) {
      const timer = setTimeout(() => {
        setTimeRemaining(timeRemaining - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [timeRemaining, isCompleted]);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const updateResponse = (questionId: string, value: string, confidence?: ConfidenceLevel) => {
    setResponses(new Map(responses.set(questionId, { value, confidence })));
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleSubmit = () => {
    const exitTicketResponses: ExitTicketResponse[] = Array.from(responses.entries()).map(
      ([questionId, { value, confidence }]) => ({
        questionId,
        questionText: questions.find(q => q.id === questionId)?.text || '',
        response: value,
        confidence,
        timestamp: new Date()
      })
    );

    setIsCompleted(true);
    onComplete(exitTicketResponses);
  };

  const handleSaveDraft = () => {
    if (onSave) {
      const exitTicketResponses: ExitTicketResponse[] = Array.from(responses.entries()).map(
        ([questionId, { value, confidence }]) => ({
          questionId,
          questionText: questions.find(q => q.id === questionId)?.text || '',
          response: value,
          confidence,
          timestamp: new Date()
        })
      );
      onSave(exitTicketResponses);
    }
  };

  const currentQuestion = questions[currentQuestionIndex];
  const currentResponse = responses.get(currentQuestion?.id || '') || { value: '' };
  const isCurrentQuestionComplete = currentQuestion?.required ? currentResponse.value.trim() !== '' : true;
  const allRequiredComplete = questions.every(q => 
    !q.required || responses.get(q.id)?.value.trim()
  );

  if (isCompleted) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white dark:bg-gray-800 rounded-xl shadow-soft border border-gray-200 dark:border-gray-700 p-6 max-w-2xl mx-auto"
      >
        <div className="text-center">
          <div className="w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
            Exit Ticket Complete!
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Thank you for sharing your thoughts. Your responses help us understand your learning journey.
          </p>
          <div className="flex justify-center gap-4 text-sm text-gray-500 dark:text-gray-400">
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              {Math.round((new Date().getTime() - startTime.getTime()) / 60000)} min
            </div>
            <div className="flex items-center gap-1">
              <MessageSquare className="w-4 h-4" />
              {questions.length} questions
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-gray-800 rounded-xl shadow-soft border border-gray-200 dark:border-gray-700 max-w-2xl mx-auto"
    >
      {/* Header */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
            Exit Ticket: {stage.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
          </h2>
          {timeRemaining && (
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <Clock className="w-4 h-4" />
              {formatTime(timeRemaining)}
            </div>
          )}
        </div>
        
        {/* Progress bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
            <span>Question {currentQuestionIndex + 1} of {questions.length}</span>
            <span>{Math.round(((currentQuestionIndex + 1) / questions.length) * 100)}%</span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div 
              className="bg-primary-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Question */}
      <div className="p-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentQuestionIndex}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            {currentQuestion && (
              <>
                <div className="mb-6">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                    {currentQuestion.text}
                  </h3>
                  {currentQuestion.required && (
                    <span className="text-sm text-red-500">Required</span>
                  )}
                </div>

                <QuestionComponent
                  question={currentQuestion}
                  value={currentResponse.value}
                  onChange={(value, confidence) => updateResponse(currentQuestion.id, value, confidence)}
                />
              </>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Actions */}
      <div className="p-6 border-t border-gray-200 dark:border-gray-700">
        <div className="flex justify-between">
          <div className="flex gap-2">
            <button
              onClick={handlePrevious}
              disabled={currentQuestionIndex === 0}
              className="px-4 py-2 text-gray-600 dark:text-gray-400 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            {onSave && (
              <button
                onClick={handleSaveDraft}
                className="px-4 py-2 text-primary-600 dark:text-primary-400 bg-white dark:bg-gray-800 border border-primary-300 dark:border-blue-600 rounded-lg hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors"
              >
                Save Draft
              </button>
            )}
          </div>

          <div className="flex gap-2">
            {currentQuestionIndex === questions.length - 1 ? (
              <button
                onClick={handleSubmit}
                disabled={!allRequiredComplete}
                className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <CheckCircle className="w-4 h-4" />
                Submit
              </button>
            ) : (
              <button
                onClick={handleNext}
                disabled={!isCurrentQuestionComplete}
                className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};