/**
 * TeacherFeedback.tsx - Collect and display teacher feedback on blueprints
 */

import React, { useState } from 'react';
import { MessageSquare, ThumbsUp, ThumbsDown, Send, Star } from 'lucide-react';

interface FeedbackItem {
  id: string;
  teacherName: string;
  schoolName?: string;
  rating: number;
  whatWorked: string;
  challenges: string;
  suggestions: string;
  wouldUseAgain: boolean;
  timestamp: Date;
}

interface TeacherFeedbackProps {
  onSubmitFeedback?: (feedback: Omit<FeedbackItem, 'id' | 'timestamp'>) => void;
  existingFeedback?: FeedbackItem[];
}

export const TeacherFeedback: React.FC<TeacherFeedbackProps> = ({
  onSubmitFeedback,
  existingFeedback = []
}) => {
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    teacherName: '',
    schoolName: '',
    rating: 0,
    whatWorked: '',
    challenges: '',
    suggestions: '',
    wouldUseAgain: true
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (onSubmitFeedback && formData.teacherName && formData.rating > 0) {
      onSubmitFeedback(formData);
      
      // Reset form
      setFormData({
        teacherName: '',
        schoolName: '',
        rating: 0,
        whatWorked: '',
        challenges: '',
        suggestions: '',
        wouldUseAgain: true
      });
      setShowForm(false);
    }
  };

  const renderStars = (rating: number, interactive = false) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map(star => (
          <button
            key={star}
            type="button"
            onClick={() => interactive && setFormData({ ...formData, rating: star })}
            className={interactive ? 'cursor-pointer' : 'cursor-default'}
            disabled={!interactive}
          >
            <Star
              className={`w-5 h-5 ${
                star <= rating 
                  ? 'fill-yellow-400 text-yellow-400' 
                  : 'text-gray-300 dark:text-gray-600'
              } ${interactive ? 'hover:fill-yellow-300' : ''}`}
            />
          </button>
        ))}
      </div>
    );
  };

  const averageRating = existingFeedback.length > 0
    ? existingFeedback.reduce((sum, f) => sum + f.rating, 0) / existingFeedback.length
    : 0;

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      {existingFeedback.length > 0 && (
        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Teacher Feedback Summary
          </h3>
          
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">
                {existingFeedback.length}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Teachers</div>
            </div>
            
            <div>
              <div className="flex justify-center mb-1">
                {renderStars(Math.round(averageRating))}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {averageRating.toFixed(1)} avg rating
              </div>
            </div>
            
            <div>
              <div className="text-3xl font-bold text-green-600 dark:text-green-400">
                {Math.round((existingFeedback.filter(f => f.wouldUseAgain).length / existingFeedback.length) * 100)}%
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Would use again</div>
            </div>
          </div>
        </div>
      )}

      {/* Add Feedback Button */}
      {!showForm && (
        <button
          onClick={() => setShowForm(true)}
          className="w-full py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2"
        >
          <MessageSquare className="w-5 h-5" />
          Share Your Teaching Experience
        </button>
      )}

      {/* Feedback Form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Share Your Experience
          </h3>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Your Name *
                </label>
                <input
                  type="text"
                  value={formData.teacherName}
                  onChange={(e) => setFormData({ ...formData, teacherName: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  School Name
                </label>
                <input
                  type="text"
                  value={formData.schoolName}
                  onChange={(e) => setFormData({ ...formData, schoolName: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Overall Rating *
              </label>
              {renderStars(formData.rating, true)}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                What worked well?
              </label>
              <textarea
                value={formData.whatWorked}
                onChange={(e) => setFormData({ ...formData, whatWorked: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                rows={3}
                placeholder="Share what went well in your classroom..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                What challenges did you face?
              </label>
              <textarea
                value={formData.challenges}
                onChange={(e) => setFormData({ ...formData, challenges: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                rows={3}
                placeholder="Describe any difficulties or obstacles..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Suggestions for improvement
              </label>
              <textarea
                value={formData.suggestions}
                onChange={(e) => setFormData({ ...formData, suggestions: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                rows={3}
                placeholder="How could this blueprint be improved?"
              />
            </div>

            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="wouldUseAgain"
                  checked={formData.wouldUseAgain === true}
                  onChange={() => setFormData({ ...formData, wouldUseAgain: true })}
                  className="text-indigo-600"
                />
                <span className="flex items-center gap-1">
                  <ThumbsUp className="w-4 h-4 text-green-600" />
                  Would use again
                </span>
              </label>
              
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="wouldUseAgain"
                  checked={formData.wouldUseAgain === false}
                  onChange={() => setFormData({ ...formData, wouldUseAgain: false })}
                  className="text-indigo-600"
                />
                <span className="flex items-center gap-1">
                  <ThumbsDown className="w-4 h-4 text-red-600" />
                  Would not use again
                </span>
              </label>
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                disabled={!formData.teacherName || formData.rating === 0}
                className="flex-1 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <Send className="w-4 h-4" />
                Submit Feedback
              </button>
              
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </form>
      )}

      {/* Existing Feedback Display */}
      {existingFeedback.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Teacher Reviews ({existingFeedback.length})
          </h3>
          
          {existingFeedback.map(feedback => (
            <div
              key={feedback.id}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="font-medium text-gray-900 dark:text-gray-100">
                    {feedback.teacherName}
                  </div>
                  {feedback.schoolName && (
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {feedback.schoolName}
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  {renderStars(feedback.rating)}
                  {feedback.wouldUseAgain ? (
                    <ThumbsUp className="w-5 h-5 text-green-600" />
                  ) : (
                    <ThumbsDown className="w-5 h-5 text-red-600" />
                  )}
                </div>
              </div>

              {feedback.whatWorked && (
                <div className="mb-3">
                  <div className="text-sm font-medium text-green-700 dark:text-green-400 mb-1">
                    What worked:
                  </div>
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    {feedback.whatWorked}
                  </p>
                </div>
              )}

              {feedback.challenges && (
                <div className="mb-3">
                  <div className="text-sm font-medium text-orange-700 dark:text-orange-400 mb-1">
                    Challenges:
                  </div>
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    {feedback.challenges}
                  </p>
                </div>
              )}

              {feedback.suggestions && (
                <div className="mb-3">
                  <div className="text-sm font-medium text-primary-700 dark:text-primary-400 mb-1">
                    Suggestions:
                  </div>
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    {feedback.suggestions}
                  </p>
                </div>
              )}

              <div className="text-xs text-gray-500 dark:text-gray-400 mt-3">
                {new Date(feedback.timestamp).toLocaleDateString()}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
