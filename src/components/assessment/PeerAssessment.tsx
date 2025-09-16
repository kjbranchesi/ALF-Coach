/**
 * Peer Assessment Component
 * Enables structured peer feedback throughout PBL collaboration
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  PeerAssessment as PeerAssessmentType,
  PeerFeedback,
  PBLStage,
  DEFAULT_PEER_ASSESSMENT_CRITERIA 
} from '../../types/FormativeAssessmentTypes';
import { Users, Star, MessageSquare, CheckCircle, AlertCircle, Eye, EyeOff } from 'lucide-react';

interface PeerAssessmentProps {
  stage: PBLStage;
  assesseeId: string;
  assesseeName: string;
  assessorId: string;
  onComplete: (feedback: PeerFeedback[], overallComment: string) => void;
  existingAssessment?: PeerAssessmentType;
  isAnonymous?: boolean;
  customCriteria?: Array<{
    id: string;
    name: string;
    description: string;
    rubricLevels: string[];
  }>;
}

interface RatingCriteriaProps {
  criterion: {
    id: string;
    name: string;
    description: string;
    rubricLevels: string[];
  };
  rating: number;
  comment: string;
  suggestions: string;
  onChange: (rating: number, comment: string, suggestions: string) => void;
}

const RatingCriteria: React.FC<RatingCriteriaProps> = ({
  criterion,
  rating,
  comment,
  suggestions,
  onChange
}) => {
  const handleRatingChange = (newRating: number) => {
    onChange(newRating, comment, suggestions);
  };

  const handleCommentChange = (newComment: string) => {
    onChange(rating, newComment, suggestions);
  };

  const handleSuggestionsChange = (newSuggestions: string) => {
    onChange(rating, comment, newSuggestions);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4 space-y-4"
    >
      <div>
        <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">
          {criterion.name}
        </h4>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {criterion.description}
        </p>
      </div>

      {/* Rating Scale */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Rating *
        </label>
        <div className="grid grid-cols-4 gap-2">
          {criterion.rubricLevels.map((level, index) => {
            const ratingValue = index + 1;
            const isSelected = rating === ratingValue;
            
            return (
              <button
                key={index}
                onClick={() => handleRatingChange(ratingValue)}
                className={`p-3 rounded-lg border-2 transition-all text-left ${
                  isSelected
                    ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 shadow-sm'
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <div className={`w-4 h-4 rounded-full ${
                    isSelected ? 'bg-primary-500' : 'bg-gray-300 dark:bg-gray-600'
                  }`} />
                  <span className="text-sm font-medium">
                    {ratingValue}
                  </span>
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400">
                  {level}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Comment */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
          What did they do well?
        </label>
        <textarea
          value={comment}
          onChange={(e) => handleCommentChange(e.target.value)}
          placeholder="Share specific examples of what this person did well..."
          className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none h-20 text-sm"
        />
      </div>

      {/* Suggestions */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Suggestions for improvement (optional)
        </label>
        <textarea
          value={suggestions}
          onChange={(e) => handleSuggestionsChange(e.target.value)}
          placeholder="Kind and helpful suggestions for next time..."
          className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none h-20 text-sm"
        />
      </div>
    </motion.div>
  );
};

export const PeerAssessment: React.FC<PeerAssessmentProps> = ({
  stage,
  assesseeId,
  assesseeName,
  assessorId,
  onComplete,
  existingAssessment,
  isAnonymous = false,
  customCriteria
}) => {
  const [feedback, setFeedback] = useState<Map<string, PeerFeedback>>(new Map());
  const [overallComment, setOverallComment] = useState('');
  const [isCompleted, setIsCompleted] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  // Use custom criteria or default ones
  const criteria = customCriteria || Object.values(DEFAULT_PEER_ASSESSMENT_CRITERIA);

  // Load existing assessment
  useEffect(() => {
    if (existingAssessment) {
      const feedbackMap = new Map();
      existingAssessment.feedback.forEach(fb => {
        feedbackMap.set(fb.criteriaId, fb);
      });
      setFeedback(feedbackMap);
      setOverallComment(existingAssessment.overallComment || '');
    }
  }, [existingAssessment]);

  const updateCriteriaFeedback = (
    criteriaId: string, 
    rating: number, 
    comment: string, 
    suggestions: string
  ) => {
    const newFeedback = new Map(feedback);
    newFeedback.set(criteriaId, {
      criteriaId,
      rating,
      comment,
      suggestions
    });
    setFeedback(newFeedback);
  };

  const handleSubmit = () => {
    const feedbackArray = Array.from(feedback.values());
    setIsCompleted(true);
    onComplete(feedbackArray, overallComment);
  };

  const handlePreviewToggle = () => {
    setShowPreview(!showPreview);
  };

  // Check if all required fields are completed
  const allCriteriaRated = criteria.every(criterion => 
    feedback.has(criterion.id) && feedback.get(criterion.id)!.rating > 0
  );

  const allCommentsProvided = criteria.every(criterion => 
    feedback.has(criterion.id) && feedback.get(criterion.id)!.comment.trim() !== ''
  );

  const canSubmit = allCriteriaRated && allCommentsProvided;

  if (isCompleted) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white dark:bg-gray-800 rounded-xl shadow-soft border border-gray-200 dark:border-gray-700 p-6 max-w-4xl mx-auto"
      >
        <div className="text-center">
          <div className="w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
            Peer Assessment Complete!
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Thank you for providing thoughtful feedback to {assesseeName}. 
            {isAnonymous && " Your feedback will be shared anonymously."}
          </p>
          <div className="bg-primary-50 dark:bg-primary-900/20 rounded-lg p-4">
            <h4 className="font-medium text-primary-900 dark:text-primary-100 mb-2">
              Remember: Good peer feedback is...
            </h4>
            <ul className="text-sm text-primary-800 dark:text-primary-200 space-y-1">
              <li>• Specific and based on observations</li>
              <li>• Kind and respectful</li>
              <li>• Helpful for improvement</li>
              <li>• Focused on actions, not personality</li>
            </ul>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-soft border border-gray-200 dark:border-gray-700 max-w-4xl mx-auto">
      {/* Header */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-primary-100 dark:bg-primary-900/20 rounded-lg">
            <Users className="w-5 h-5 text-primary-600 dark:text-primary-400" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
              Peer Assessment
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Give feedback to {assesseeName} for {stage.replace('_', ' ').toLowerCase()}
            </p>
          </div>
        </div>

        {isAnonymous && (
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3 flex items-center gap-2">
            <EyeOff className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
            <span className="text-sm text-yellow-800 dark:text-yellow-200">
              This assessment is anonymous - your name will not be shared.
            </span>
          </div>
        )}

        {/* Instructions */}
        <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
          <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-2">
            Assessment Guidelines
          </h3>
          <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
            <li>• Rate each criterion based on your observations</li>
            <li>• Provide specific examples of what they did well</li>
            <li>• Offer kind and helpful suggestions for improvement</li>
            <li>• Focus on behaviors and contributions, not personality</li>
          </ul>
        </div>
      </div>

      {/* Assessment Form */}
      <div className="p-6 space-y-6">
        {criteria.map(criterion => {
          const criteriaFeedback = feedback.get(criterion.id) || {
            criteriaId: criterion.id,
            rating: 0,
            comment: '',
            suggestions: ''
          };

          return (
            <RatingCriteria
              key={criterion.id}
              criterion={criterion}
              rating={criteriaFeedback.rating}
              comment={criteriaFeedback.comment}
              suggestions={criteriaFeedback.suggestions}
              onChange={(rating, comment, suggestions) => 
                updateCriteriaFeedback(criterion.id, rating, comment, suggestions)
              }
            />
          );
        })}

        {/* Overall Comment */}
        <div className="space-y-3">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Overall feedback for {assesseeName}
          </label>
          <textarea
            value={overallComment}
            onChange={(e) => setOverallComment(e.target.value)}
            placeholder="What would you like this person to know about their work on this project?"
            className="w-full p-4 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none h-24"
          />
        </div>

        {/* Validation Messages */}
        {!canSubmit && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400" />
            <div className="text-sm text-red-800 dark:text-red-200">
              <div>Please complete all required fields:</div>
              {!allCriteriaRated && <div>• Rate all criteria</div>}
              {!allCommentsProvided && <div>• Add comments for what they did well</div>}
            </div>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="p-6 border-t border-gray-200 dark:border-gray-700">
        <div className="flex justify-between items-center">
          <button
            onClick={handlePreviewToggle}
            className="flex items-center gap-2 px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
          >
            {showPreview ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            {showPreview ? 'Hide' : 'Preview'} Assessment
          </button>

          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {criteria.length - Array.from(feedback.values()).filter(f => f.rating > 0).length} criteria remaining
            </span>
            <button
              onClick={handleSubmit}
              disabled={!canSubmit}
              className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <CheckCircle className="w-4 h-4" />
              Submit Assessment
            </button>
          </div>
        </div>

        {/* Preview */}
        <AnimatePresence>
          {showPreview && canSubmit && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-6 p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg border-t border-gray-200 dark:border-gray-700"
            >
              <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-3">
                Assessment Preview
              </h4>
              <div className="space-y-3 text-sm">
                {criteria.map(criterion => {
                  const criteriaFeedback = feedback.get(criterion.id);
                  if (!criteriaFeedback) return null;

                  return (
                    <div key={criterion.id} className="space-y-1">
                      <div className="font-medium text-gray-700 dark:text-gray-300">
                        {criterion.name}: {criterion.rubricLevels[criteriaFeedback.rating - 1]} ({criteriaFeedback.rating}/4)
                      </div>
                      {criteriaFeedback.comment && (
                        <div className="text-gray-600 dark:text-gray-400 pl-4">
                          What they did well: {criteriaFeedback.comment}
                        </div>
                      )}
                      {criteriaFeedback.suggestions && (
                        <div className="text-gray-600 dark:text-gray-400 pl-4">
                          Suggestions: {criteriaFeedback.suggestions}
                        </div>
                      )}
                    </div>
                  );
                })}
                {overallComment && (
                  <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                    <div className="font-medium text-gray-700 dark:text-gray-300">Overall feedback:</div>
                    <div className="text-gray-600 dark:text-gray-400 pl-4">{overallComment}</div>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};