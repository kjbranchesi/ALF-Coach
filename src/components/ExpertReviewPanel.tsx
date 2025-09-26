/**
 * ExpertReviewPanel.tsx - Display expert reviews and suggestions
 */

import React, { useState, useEffect } from 'react';
import type { ExpertReview, ExpertSuggestion } from '../core/services/ExpertReviewService';
import { expertReviewService } from '../core/services/ExpertReviewService';
import type { BlueprintDoc } from '../core/types/SOPTypes';
import { Star, AlertCircle, Lightbulb } from 'lucide-react';

interface ExpertReviewPanelProps {
  blueprintId: string;
  blueprint: BlueprintDoc;
  onApplySuggestion?: (suggestion: ExpertSuggestion) => void;
}

export const ExpertReviewPanel: React.FC<ExpertReviewPanelProps> = ({
  blueprintId,
  blueprint,
  onApplySuggestion
}) => {
  const [reviews, setReviews] = useState<ExpertReview[]>([]);
  const [suggestions, setSuggestions] = useState<ExpertSuggestion[]>([]);
  const [isRequesting, setIsRequesting] = useState(false);

  useEffect(() => {
    // Load existing reviews
    const existingReviews = expertReviewService.getReviews(blueprintId);
    setReviews(existingReviews);
    
    // Generate suggestions
    const newSuggestions = expertReviewService.generateSuggestions(blueprint);
    setSuggestions(newSuggestions);
  }, [blueprintId, blueprint]);

  const requestReview = async (expertRole?: ExpertReview['expertRole']) => {
    setIsRequesting(true);
    try {
      const review = await expertReviewService.requestReview(blueprintId, blueprint, expertRole);
      
      // Poll for completion
      const checkInterval = setInterval(() => {
        const updatedReview = expertReviewService.getReview(review.id);
        if (updatedReview && updatedReview.status === 'completed') {
          setReviews(prev => [...prev, updatedReview]);
          clearInterval(checkInterval);
          setIsRequesting(false);
        }
      }, 500);
      
      // Timeout after 10 seconds
      setTimeout(() => {
        clearInterval(checkInterval);
        setIsRequesting(false);
      }, 10000);
    } catch (error) {
      console.error('Failed to request review:', error);
      setIsRequesting(false);
    }
  };

  const renderStars = (score: number) => {
    return (
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map(star => (
          <Star
            key={star}
            className={`w-4 h-4 ${
              star <= score 
                ? 'fill-yellow-400 text-yellow-400' 
                : 'text-gray-300 dark:text-gray-600'
            }`}
          />
        ))}
      </div>
    );
  };

  const getExpertIcon = (role: string) => {
    switch (role) {
      case 'curriculum-specialist': return '📚';
      case 'subject-expert': return '🔬';
      case 'pedagogy-expert': return '👨‍🏫';
      case 'assessment-specialist': return '📊';
      default: return '👤';
    }
  };

  return (
    <div className="space-y-6">
      {/* Request Review Section */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
          Request Expert Review
        </h3>
        
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => { void requestReview('curriculum-specialist'); }}
            disabled={isRequesting}
            className="p-4 text-left border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
          >
            <div className="text-2xl mb-1">📚</div>
            <div className="font-medium">Curriculum Specialist</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Overall structure & alignment</div>
          </button>
          
          <button
            onClick={() => { void requestReview('subject-expert'); }}
            disabled={isRequesting}
            className="p-4 text-left border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
          >
            <div className="text-2xl mb-1">🔬</div>
            <div className="font-medium">Subject Expert</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Content accuracy & depth</div>
          </button>
          
          <button
            onClick={() => { void requestReview('pedagogy-expert'); }}
            disabled={isRequesting}
            className="p-4 text-left border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
          >
            <div className="text-2xl mb-1">👨‍🏫</div>
            <div className="font-medium">Pedagogy Expert</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Teaching methods & engagement</div>
          </button>
          
          <button
            onClick={() => { void requestReview('assessment-specialist'); }}
            disabled={isRequesting}
            className="p-4 text-left border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
          >
            <div className="text-2xl mb-1">📊</div>
            <div className="font-medium">Assessment Specialist</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Rubrics & evaluation methods</div>
          </button>
        </div>
        
        {isRequesting && (
          <div className="mt-4 text-center text-sm text-gray-600 dark:text-gray-400">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600 mx-auto mb-2"></div>
            Requesting expert review...
          </div>
        )}
      </div>

      {/* Quick Suggestions */}
      {suggestions.length > 0 && (
        <div className="bg-primary-50 dark:bg-primary-900/20 rounded-lg border border-primary-200 dark:border-blue-800 p-6">
          <h3 className="text-lg font-semibold text-primary-900 dark:text-primary-100 mb-4 flex items-center gap-2">
            <Lightbulb className="w-5 h-5" />
            Quick Suggestions
          </h3>
          
          <div className="space-y-3">
            {suggestions.map(suggestion => (
              <div key={suggestion.id} className="bg-white dark:bg-gray-800 rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="font-medium text-gray-900 dark:text-gray-100">
                      {suggestion.section} → {suggestion.field}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      {suggestion.rationale}
                    </div>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded ${
                    suggestion.priority === 'high' 
                      ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                      : suggestion.priority === 'medium'
                      ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                      : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                  }`}>
                    {suggestion.priority}
                  </span>
                </div>
                {onApplySuggestion && (
                  <button
                    onClick={() => onApplySuggestion(suggestion)}
                    className="mt-3 text-sm text-indigo-600 dark:text-indigo-400 hover:underline"
                  >
                    Apply suggestion →
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Review Results */}
      {reviews.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Expert Reviews ({reviews.length})
          </h3>
          
          {reviews.map(review => (
            <div
              key={review.id}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="text-2xl">{getExpertIcon(review.expertRole)}</div>
                  <div>
                    <div className="font-medium text-gray-900 dark:text-gray-100">
                      {review.expertName}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {review.expertRole.replace('-', ' ')}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-2 mb-1">
                    {renderStars(review.overallScore || 0)}
                    <span className="font-medium">{review.overallScore}/5</span>
                  </div>
                  <div className="text-xs text-gray-500">
                    {new Date(review.timestamp).toLocaleDateString()}
                  </div>
                </div>
              </div>

              {review.overallFeedback && (
                <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    {review.overallFeedback}
                  </p>
                </div>
              )}

              <div className="space-y-3">
                {review.sections.map(section => (
                  <div key={section.section} className="border-t border-gray-200 dark:border-gray-700 pt-3">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium capitalize">{section.section}</h4>
                      {renderStars(section.score)}
                    </div>
                    
                    {section.strengths.length > 0 && (
                      <div className="mb-2">
                        <div className="text-sm font-medium text-green-700 dark:text-green-400 mb-1">
                          Strengths:
                        </div>
                        <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                          {section.strengths.map((strength, idx) => (
                            <li key={idx} className="flex items-start gap-2">
                              <CheckCircle className="w-4 h-4 text-green-600 mt-0.5" />
                              <span>{strength}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    {section.improvements.length > 0 && (
                      <div className="mb-2">
                        <div className="text-sm font-medium text-orange-700 dark:text-orange-400 mb-1">
                          Areas for Improvement:
                        </div>
                        <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                          {section.improvements.map((improvement, idx) => (
                            <li key={idx} className="flex items-start gap-2">
                              <AlertCircle className="w-4 h-4 text-orange-600 mt-0.5" />
                              <span>{improvement}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
