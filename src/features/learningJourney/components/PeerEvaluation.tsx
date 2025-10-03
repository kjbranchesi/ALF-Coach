/**
 * PeerEvaluation.tsx
 * 
 * Collaborative peer assessment and feedback system
 * Part of Sprint 4: Assessment and Rubrics
 * 
 * FEATURES:
 * - Anonymous peer reviews
 * - Structured feedback forms
 * - Collaboration skills assessment
 * - Peer recognition system
 * - Feedback aggregation
 */

import React, { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users,
  UserCheck,
  MessageSquare,
  Star,
  Award,
  ThumbsUp,
  Heart,
  HelpCircle,
  Shield,
  Eye,
  EyeOff,
  Send,
  Check,
  AlertCircle,
  BarChart3,
  TrendingUp,
  Filter,
  Download,
  ChevronRight,
  Clock,
  Target,
  Sparkles
} from 'lucide-react';
import {
  type PhaseType,
  type GradeLevel,
  type CreativePhase
} from '../types';
import { type Rubric, RubricCriterion } from './RubricBuilder';
import { Assessment } from './AssessmentCriteria';

export interface PeerReview {
  id: string;
  reviewerId: string;
  reviewerName: string;
  revieweeId: string;
  revieweeName: string;
  projectId: string;
  phaseType: PhaseType;
  anonymous: boolean;
  status: 'pending' | 'in_progress' | 'submitted' | 'viewed';
  submittedAt?: Date;
  viewedAt?: Date;
  ratings: PeerRating[];
  feedback: PeerFeedback[];
  recognition: PeerRecognition[];
}

export interface PeerRating {
  category: string;
  score: number; // 1-5 scale
  comment?: string;
}

export interface PeerFeedback {
  type: 'strength' | 'improvement' | 'question' | 'suggestion';
  content: string;
  phaseRelated?: PhaseType;
  helpful?: number; // Count of "helpful" votes
}

export interface PeerRecognition {
  id: string;
  type: 'collaboration' | 'creativity' | 'leadership' | 'support' | 'quality';
  message: string;
  icon: React.ElementType;
}

export interface PeerEvaluationSummary {
  studentId: string;
  studentName: string;
  reviewsGiven: number;
  reviewsReceived: number;
  averageRating: number;
  strengths: string[];
  improvements: string[];
  recognitions: PeerRecognition[];
  topCollaborator: boolean;
}

interface PeerEvaluationProps {
  students: Array<{
    id: string;
    name: string;
    avatar?: string;
  }>;
  currentStudentId: string;
  projectPhases: CreativePhase[];
  currentPhase: number;
  gradeLevel: GradeLevel;
  reviews?: PeerReview[];
  onSubmitReview: (review: PeerReview) => void;
  onViewReview?: (reviewId: string) => void;
  allowAnonymous?: boolean;
  rubric?: Rubric;
  className?: string;
}

// Peer evaluation categories with grade-appropriate language
const EVALUATION_CATEGORIES: Record<GradeLevel, Array<{ key: string; label: string; description: string }>> = {
  elementary: [
    { key: 'teamwork', label: 'Teamwork', description: 'How well did they work with others?' },
    { key: 'ideas', label: 'Ideas', description: 'Did they share good ideas?' },
    { key: 'listening', label: 'Listening', description: 'Did they listen to others?' },
    { key: 'helping', label: 'Helping', description: 'Did they help teammates?' },
    { key: 'effort', label: 'Effort', description: 'Did they try their best?' }
  ],
  middle: [
    { key: 'collaboration', label: 'Collaboration', description: 'Quality of teamwork and cooperation' },
    { key: 'contribution', label: 'Contribution', description: 'Value of ideas and work shared' },
    { key: 'communication', label: 'Communication', description: 'Clear and respectful interaction' },
    { key: 'reliability', label: 'Reliability', description: 'Dependability and follow-through' },
    { key: 'leadership', label: 'Leadership', description: 'Initiative and positive influence' }
  ],
  high: [
    { key: 'collaboration', label: 'Collaboration', description: 'Professional teamwork and synergy' },
    { key: 'innovation', label: 'Innovation', description: 'Creative problem-solving and ideas' },
    { key: 'communication', label: 'Communication', description: 'Professional and effective dialogue' },
    { key: 'accountability', label: 'Accountability', description: 'Ownership and responsibility' },
    { key: 'leadership', label: 'Leadership', description: 'Strategic thinking and influence' }
  ]
};

// Recognition badges
const RECOGNITION_TYPES: Array<{
  type: PeerRecognition['type'];
  label: string;
  icon: React.ElementType;
  color: string;
  description: string;
}> = [
  {
    type: 'collaboration',
    label: 'Team Player',
    icon: Users,
    color: 'blue',
    description: 'Excellent collaboration skills'
  },
  {
    type: 'creativity',
    label: 'Creative Thinker',
    icon: Sparkles,
    color: 'purple',
    description: 'Innovative ideas and solutions'
  },
  {
    type: 'leadership',
    label: 'Natural Leader',
    icon: Award,
    color: 'yellow',
    description: 'Strong leadership qualities'
  },
  {
    type: 'support',
    label: 'Supportive Friend',
    icon: Heart,
    color: 'pink',
    description: 'Always there to help'
  },
  {
    type: 'quality',
    label: 'Quality Champion',
    icon: Star,
    color: 'green',
    description: 'Commitment to excellence'
  }
];

// Feedback prompts by grade level
const FEEDBACK_PROMPTS: Record<GradeLevel, Record<PeerFeedback['type'], string>> = {
  elementary: {
    strength: 'Something they did really well was...',
    improvement: 'Next time they could try...',
    question: 'I wonder if they could explain...',
    suggestion: 'A fun idea might be...'
  },
  middle: {
    strength: 'A key strength I observed was...',
    improvement: 'An area for growth might be...',
    question: 'I\'m curious about...',
    suggestion: 'I suggest considering...'
  },
  high: {
    strength: 'Professional strength demonstrated...',
    improvement: 'Constructive feedback for improvement...',
    question: 'Critical question to explore...',
    suggestion: 'Strategic recommendation...'
  }
};

export const PeerEvaluation: React.FC<PeerEvaluationProps> = ({
  students,
  currentStudentId,
  projectPhases,
  currentPhase,
  gradeLevel,
  reviews = [],
  onSubmitReview,
  onViewReview,
  allowAnonymous = true,
  rubric,
  className = ''
}) => {
  const [selectedStudent, setSelectedStudent] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'give' | 'received' | 'summary'>('give');
  const [currentReview, setCurrentReview] = useState<Partial<PeerReview>>({
    ratings: [],
    feedback: [],
    recognition: [],
    anonymous: false
  });
  const [showFeedbackForm, setShowFeedbackForm] = useState(false);
  const [feedbackType, setFeedbackType] = useState<PeerFeedback['type']>('strength');
  const [feedbackContent, setFeedbackContent] = useState('');

  // Get evaluation categories for grade level
  const categories = EVALUATION_CATEGORIES[gradeLevel];
  const prompts = FEEDBACK_PROMPTS[gradeLevel];

  // Calculate review statistics
  const stats = useMemo(() => {
    const myReviews = reviews.filter(r => r.reviewerId === currentStudentId);
    const receivedReviews = reviews.filter(r => r.revieweeId === currentStudentId);
    
    // Pending reviews (students not yet reviewed)
    const reviewedStudentIds = myReviews.map(r => r.revieweeId);
    const pendingStudents = students.filter(
      s => s.id !== currentStudentId && !reviewedStudentIds.includes(s.id)
    );
    
    // Calculate average ratings received
    const allRatings = receivedReviews.flatMap(r => r.ratings.map(rating => rating.score));
    const averageRating = allRatings.length > 0
      ? allRatings.reduce((sum, score) => sum + score, 0) / allRatings.length
      : 0;
    
    // Aggregate feedback
    const allFeedback = receivedReviews.flatMap(r => r.feedback);
    const strengths = allFeedback.filter(f => f.type === 'strength').map(f => f.content);
    const improvements = allFeedback.filter(f => f.type === 'improvement').map(f => f.content);
    
    // Aggregate recognitions
    const allRecognitions = receivedReviews.flatMap(r => r.recognition);
    
    return {
      pendingStudents,
      myReviews,
      receivedReviews,
      averageRating: Math.round(averageRating * 10) / 10,
      totalReviewsGiven: myReviews.length,
      totalReviewsReceived: receivedReviews.length,
      strengths,
      improvements,
      recognitions: allRecognitions,
      completionRate: Math.round((myReviews.length / (students.length - 1)) * 100)
    };
  }, [reviews, students, currentStudentId]);

  // Update rating for a category
  const updateRating = useCallback((category: string, score: number) => {
    setCurrentReview(prev => {
      const existingRating = prev.ratings?.find(r => r.category === category);
      const updatedRatings = prev.ratings?.filter(r => r.category !== category) || [];
      
      return {
        ...prev,
        ratings: [
          ...updatedRatings,
          {
            category,
            score,
            comment: existingRating?.comment || ''
          }
        ]
      };
    });
  }, []);

  // Add feedback to review
  const addFeedback = useCallback(() => {
    if (!feedbackContent.trim()) {return;}
    
    setCurrentReview(prev => ({
      ...prev,
      feedback: [
        ...(prev.feedback || []),
        {
          type: feedbackType,
          content: feedbackContent,
          phaseRelated: projectPhases[currentPhase]?.type
        }
      ]
    }));
    
    setFeedbackContent('');
    setShowFeedbackForm(false);
  }, [feedbackContent, feedbackType, currentPhase, projectPhases]);

  // Add recognition badge
  const addRecognition = useCallback((type: PeerRecognition['type']) => {
    const recognition = RECOGNITION_TYPES.find(r => r.type === type);
    if (!recognition) {return;}
    
    setCurrentReview(prev => {
      const hasRecognition = prev.recognition?.some(r => r.type === type);
      if (hasRecognition) {
        return {
          ...prev,
          recognition: prev.recognition?.filter(r => r.type !== type)
        };
      }
      
      return {
        ...prev,
        recognition: [
          ...(prev.recognition || []),
          {
            id: Date.now().toString(),
            type,
            message: recognition.description,
            icon: recognition.icon
          }
        ]
      };
    });
  }, []);

  // Submit peer review
  const submitReview = useCallback(() => {
    if (!selectedStudent) {return;}
    
    const student = students.find(s => s.id === selectedStudent);
    if (!student) {return;}
    
    const review: PeerReview = {
      id: Date.now().toString(),
      reviewerId: currentStudentId,
      reviewerName: students.find(s => s.id === currentStudentId)?.name || 'Anonymous',
      revieweeId: selectedStudent,
      revieweeName: student.name,
      projectId: Date.now().toString(),
      phaseType: projectPhases[currentPhase]?.type || 'ANALYZE',
      anonymous: currentReview.anonymous || false,
      status: 'submitted',
      submittedAt: new Date(),
      ratings: currentReview.ratings || [],
      feedback: currentReview.feedback || [],
      recognition: currentReview.recognition || []
    };
    
    onSubmitReview(review);
    
    // Reset form
    setCurrentReview({
      ratings: [],
      feedback: [],
      recognition: [],
      anonymous: false
    });
    setSelectedStudent(null);
  }, [selectedStudent, currentReview, currentStudentId, students, projectPhases, currentPhase, onSubmitReview]);

  // Check if review is ready to submit
  const isReviewComplete = useMemo(() => {
    const hasAllRatings = currentReview.ratings?.length === categories.length;
    const hasAnyFeedback = (currentReview.feedback?.length || 0) > 0;
    return hasAllRatings && hasAnyFeedback;
  }, [currentReview, categories]);

  // Get rating stars display
  const getRatingStars = (score: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${
          i < score ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'
        }`}
      />
    ));
  };

  return (
    <div className={`bg-white rounded-xl shadow-lg ${className}`}>
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <Users className="w-6 h-6" />
              Peer Evaluation
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Provide feedback and recognition to your teammates
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary-600">
                {stats.completionRate}%
              </div>
              <div className="text-xs text-gray-500">Completed</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {stats.averageRating}
              </div>
              <div className="text-xs text-gray-500">Avg Rating</div>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-4">
          <div className="flex items-center justify-between text-sm text-gray-600 mb-1">
            <span>Review Progress</span>
            <span>{stats.totalReviewsGiven}/{students.length - 1} peers</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <motion.div
              className="bg-gradient-to-r from-primary-500 to-purple-600 h-2 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${stats.completionRate}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <div className="flex">
          {(['give', 'received', 'summary'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 px-4 py-3 text-sm font-medium capitalize border-b-2 transition-colors ${
                activeTab === tab
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab === 'give' ? 'Give Feedback' :
               tab === 'received' ? 'Received Feedback' :
               'Summary'}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        <AnimatePresence mode="wait">
          {/* Give Feedback Tab */}
          {activeTab === 'give' && (
            <motion.div
              key="give"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              {!selectedStudent ? (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Select a Peer to Review</h3>
                  
                  {stats.pendingStudents.length > 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {stats.pendingStudents.map(student => (
                        <button
                          key={student.id}
                          onClick={() => setSelectedStudent(student.id)}
                          className="p-4 border border-gray-200 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            {student.avatar ? (
                              <img
                                src={student.avatar}
                                alt={student.name}
                                className="w-12 h-12 rounded-full"
                              />
                            ) : (
                              <div className="w-12 h-12 bg-gradient-to-br from-primary-400 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                                {student.name.charAt(0)}
                              </div>
                            )}
                            <div className="text-left">
                              <div className="font-medium text-gray-900">{student.name}</div>
                              <div className="text-xs text-gray-500">Not reviewed</div>
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <UserCheck className="w-16 h-16 text-green-500 mx-auto mb-4" />
                      <h4 className="text-lg font-medium text-gray-900 mb-2">All Reviews Complete!</h4>
                      <p className="text-gray-600">You have reviewed all your peers</p>
                    </div>
                  )}
                </div>
              ) : (
                <div>
                  {/* Review Form */}
                  <div className="mb-6">
                    <button
                      onClick={() => setSelectedStudent(null)}
                      className="text-sm text-primary-600 hover:text-primary-700 mb-4"
                    >
                      ← Back to peer list
                    </button>
                    
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-gray-900">
                        Reviewing: {students.find(s => s.id === selectedStudent)?.name}
                      </h3>
                      {allowAnonymous && (
                        <label className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={currentReview.anonymous}
                            onChange={(e) => setCurrentReview(prev => ({ ...prev, anonymous: e.target.checked }))}
                            className="text-primary-600"
                          />
                          <span className="text-sm text-gray-600 flex items-center gap-1">
                            {currentReview.anonymous ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            {currentReview.anonymous ? 'Anonymous' : 'Visible'}
                          </span>
                        </label>
                      )}
                    </div>
                  </div>

                  {/* Rating Categories */}
                  <div className="mb-6">
                    <h4 className="text-sm font-medium text-gray-700 mb-3">Rate Performance</h4>
                    <div className="space-y-4">
                      {categories.map(category => {
                        const rating = currentReview.ratings?.find(r => r.category === category.key);
                        return (
                          <div key={category.key} className="p-4 bg-gray-50 rounded-lg">
                            <div className="flex items-center justify-between mb-2">
                              <div>
                                <h5 className="font-medium text-gray-900">{category.label}</h5>
                                <p className="text-sm text-gray-600">{category.description}</p>
                              </div>
                              <div className="flex items-center gap-1">
                                {[1, 2, 3, 4, 5].map(score => (
                                  <button
                                    key={score}
                                    onClick={() => updateRating(category.key, score)}
                                    className="p-1 hover:scale-110 transition-transform"
                                  >
                                    <Star
                                      className={`w-6 h-6 ${
                                        rating && rating.score >= score
                                          ? 'text-yellow-500 fill-yellow-500'
                                          : 'text-gray-300 hover:text-yellow-400'
                                      }`}
                                    />
                                  </button>
                                ))}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Written Feedback */}
                  <div className="mb-6">
                    <h4 className="text-sm font-medium text-gray-700 mb-3">Written Feedback</h4>
                    
                    {currentReview.feedback && currentReview.feedback.length > 0 && (
                      <div className="space-y-2 mb-3">
                        {currentReview.feedback.map((feedback, idx) => (
                          <div key={idx} className="p-3 bg-primary-50 rounded-lg">
                            <div className="flex items-start gap-2">
                              <MessageSquare className="w-4 h-4 text-primary-600 mt-0.5" />
                              <div className="flex-1">
                                <span className="text-xs text-primary-700 font-medium capitalize">
                                  {feedback.type}
                                </span>
                                <p className="text-sm text-gray-700 mt-1">{feedback.content}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                    
                    {!showFeedbackForm ? (
                      <button
                        onClick={() => setShowFeedbackForm(true)}
                        className="w-full p-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-gray-400 hover:text-gray-600 transition-colors"
                      >
                        + Add Feedback
                      </button>
                    ) : (
                      <div className="p-4 border border-gray-200 rounded-lg">
                        <div className="flex items-center gap-2 mb-3">
                          {(['strength', 'improvement', 'question', 'suggestion'] as const).map(type => (
                            <button
                              key={type}
                              onClick={() => setFeedbackType(type)}
                              className={`px-3 py-1 text-sm rounded-full capitalize transition-colors ${
                                feedbackType === type
                                  ? 'bg-primary-100 text-primary-700'
                                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                              }`}
                            >
                              {type}
                            </button>
                          ))}
                        </div>
                        <textarea
                          value={feedbackContent}
                          onChange={(e) => setFeedbackContent(e.target.value)}
                          placeholder={prompts[feedbackType]}
                          className="w-full p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500"
                          rows={3}
                        />
                        <div className="flex items-center gap-2 mt-3">
                          <button
                            onClick={addFeedback}
                            disabled={!feedbackContent.trim()}
                            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            Add Feedback
                          </button>
                          <button
                            onClick={() => {
                              setShowFeedbackForm(false);
                              setFeedbackContent('');
                            }}
                            className="px-4 py-2 text-gray-600 hover:text-gray-700"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Recognition Badges */}
                  <div className="mb-6">
                    <h4 className="text-sm font-medium text-gray-700 mb-3">Give Recognition</h4>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {RECOGNITION_TYPES.map(recognition => {
                        const isSelected = currentReview.recognition?.some(r => r.type === recognition.type);
                        const color = recognition.color;
                        return (
                          <button
                            key={recognition.type}
                            onClick={() => addRecognition(recognition.type)}
                            className={`p-3 rounded-lg border-2 transition-all ${
                              isSelected
                                ? `border-${color}-500 bg-${color}-50`
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                          >
                            <recognition.icon className={`w-6 h-6 mx-auto mb-1 ${
                              isSelected ? `text-${color}-600` : 'text-gray-400'
                            }`} />
                            <div className={`text-sm font-medium ${
                              isSelected ? `text-${color}-700` : 'text-gray-700'
                            }`}>
                              {recognition.label}
                            </div>
                            <div className="text-xs text-gray-500 mt-1">
                              {recognition.description}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Submit Button */}
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-600">
                      {!isReviewComplete && (
                        <span className="flex items-center gap-1 text-orange-600">
                          <AlertCircle className="w-4 h-4" />
                          Complete all ratings and add feedback
                        </span>
                      )}
                    </div>
                    <button
                      onClick={submitReview}
                      disabled={!isReviewComplete}
                      className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      <Send className="w-4 h-4" />
                      Submit Review
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {/* Received Feedback Tab */}
          {activeTab === 'received' && (
            <motion.div
              key="received"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              {stats.receivedReviews.length > 0 ? (
                <div className="space-y-6">
                  {stats.receivedReviews.map(review => (
                    <div key={review.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                          {review.anonymous ? (
                            <>
                              <Shield className="w-5 h-5 text-gray-400" />
                              <span className="font-medium text-gray-700">Anonymous Peer</span>
                            </>
                          ) : (
                            <>
                              <Users className="w-5 h-5 text-primary-500" />
                              <span className="font-medium text-gray-900">{review.reviewerName}</span>
                            </>
                          )}
                        </div>
                        <span className="text-sm text-gray-500">
                          {review.submittedAt && new Date(review.submittedAt).toLocaleDateString()}
                        </span>
                      </div>

                      {/* Ratings Summary */}
                      <div className="mb-4">
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-1">
                            {getRatingStars(Math.round(
                              review.ratings.reduce((sum, r) => sum + r.score, 0) / review.ratings.length
                            ))}
                          </div>
                          <span className="text-sm text-gray-600">
                            Average: {(review.ratings.reduce((sum, r) => sum + r.score, 0) / review.ratings.length).toFixed(1)}
                          </span>
                        </div>
                      </div>

                      {/* Feedback */}
                      {review.feedback.length > 0 && (
                        <div className="space-y-2 mb-4">
                          {review.feedback.map((feedback, idx) => (
                            <div key={idx} className={`p-3 rounded-lg ${
                              feedback.type === 'strength' ? 'bg-green-50' :
                              feedback.type === 'improvement' ? 'bg-orange-50' :
                              feedback.type === 'question' ? 'bg-primary-50' :
                              'bg-purple-50'
                            }`}>
                              <div className={`text-xs font-medium capitalize mb-1 ${
                                feedback.type === 'strength' ? 'text-green-700' :
                                feedback.type === 'improvement' ? 'text-orange-700' :
                                feedback.type === 'question' ? 'text-primary-700' :
                                'text-purple-700'
                              }`}>
                                {feedback.type}
                              </div>
                              <p className="text-sm text-gray-700">{feedback.content}</p>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Recognition Badges */}
                      {review.recognition.length > 0 && (
                        <div className="flex items-center gap-2">
                          {review.recognition.map((recognition, idx) => {
                            const type = RECOGNITION_TYPES.find(r => r.type === recognition.type);
                            if (!type) {return null;}
                            return (
                              <div
                                key={idx}
                                className={`px-3 py-1 bg-${type.color}-100 text-${type.color}-700 rounded-full text-sm flex items-center gap-1`}
                              >
                                <type.icon className="w-4 h-4" />
                                {type.label}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h4 className="text-lg font-medium text-gray-900 mb-2">No Reviews Yet</h4>
                  <p className="text-gray-600">You haven't received any peer reviews yet</p>
                </div>
              )}
            </motion.div>
          )}

          {/* Summary Tab */}
          {activeTab === 'summary' && (
            <motion.div
              key="summary"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              {/* Overall Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-primary-50 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-primary-600 mb-1">
                    <Users className="w-4 h-4" />
                    <span className="text-xs">Reviews Given</span>
                  </div>
                  <div className="text-2xl font-bold text-primary-900">
                    {stats.totalReviewsGiven}
                  </div>
                </div>
                
                <div className="bg-green-50 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-green-600 mb-1">
                    <MessageSquare className="w-4 h-4" />
                    <span className="text-xs">Reviews Received</span>
                  </div>
                  <div className="text-2xl font-bold text-green-900">
                    {stats.totalReviewsReceived}
                  </div>
                </div>
                
                <div className="bg-yellow-50 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-yellow-600 mb-1">
                    <Star className="w-4 h-4" />
                    <span className="text-xs">Average Rating</span>
                  </div>
                  <div className="text-2xl font-bold text-yellow-900">
                    {stats.averageRating}
                  </div>
                </div>
                
                <div className="bg-purple-50 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-purple-600 mb-1">
                    <Award className="w-4 h-4" />
                    <span className="text-xs">Recognitions</span>
                  </div>
                  <div className="text-2xl font-bold text-purple-900">
                    {stats.recognitions.length}
                  </div>
                </div>
              </div>

              {/* Strengths Summary */}
              {stats.strengths.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-3">Key Strengths Identified</h4>
                  <div className="space-y-2">
                    {stats.strengths.slice(0, 3).map((strength, idx) => (
                      <div key={idx} className="flex items-start gap-2 p-3 bg-green-50 rounded-lg">
                        <ThumbsUp className="w-4 h-4 text-green-600 mt-0.5" />
                        <span className="text-sm text-green-900">{strength}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Areas for Improvement */}
              {stats.improvements.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-3">Growth Opportunities</h4>
                  <div className="space-y-2">
                    {stats.improvements.slice(0, 3).map((improvement, idx) => (
                      <div key={idx} className="flex items-start gap-2 p-3 bg-orange-50 rounded-lg">
                        <Target className="w-4 h-4 text-orange-600 mt-0.5" />
                        <span className="text-sm text-orange-900">{improvement}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Recognition Wall */}
              {stats.recognitions.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-3">Recognition Wall</h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {Array.from(new Set(stats.recognitions.map(r => r.type))).map(type => {
                      const count = stats.recognitions.filter(r => r.type === type).length;
                      const recognition = RECOGNITION_TYPES.find(r => r.type === type);
                      if (!recognition) {return null;}
                      
                      return (
                        <div
                          key={type}
                          className={`p-4 bg-${recognition.color}-50 rounded-lg text-center`}
                        >
                          <recognition.icon className={`w-8 h-8 text-${recognition.color}-600 mx-auto mb-2`} />
                          <div className={`text-sm font-medium text-${recognition.color}-900`}>
                            {recognition.label}
                          </div>
                          <div className="text-xs text-gray-600 mt-1">
                            Received {count}x
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};