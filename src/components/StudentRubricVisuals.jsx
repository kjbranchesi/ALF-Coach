/**
 * Student Rubric Visuals Component
 * 
 * Provides interactive visual representations for student-friendly rubrics,
 * including progress indicators, self-assessment tools, and accessible
 * visual elements designed for different age groups.
 */

import React, { useState, useEffect } from 'react';

// Visual Icons Components
const PerformanceLevelIcon = ({ level, ageGroup, size = 'md' }) => {
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  };

  const youngLearnerIcons = {
    emerging: '🌱',
    developing: '🌿',
    proficient: '🌳',
    advanced: '⭐',
    exemplary: '🏆'
  };

  const olderLearnerIcons = {
    'needs-improvement': '🎯',
    developing: '📈',
    proficient: '✅',
    advanced: '🚀',
    exemplary: '💎'
  };

  const isYoungLearner = ['ages-5-7', 'ages-8-10'].includes(ageGroup);
  const icons = isYoungLearner ? youngLearnerIcons : olderLearnerIcons;
  const icon = icons[level] || '📝';

  return (
    <div className={`${sizeClasses[size]} flex items-center justify-center text-2xl`}>
      {icon}
    </div>
  );
};

const CriterionIcon = ({ category, size = 'md' }) => {
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  };

  const iconMap = {
    'content-knowledge': '🧠',
    'communication': '💬',
    'collaboration': '🤝',
    'critical-thinking': '🤔',
    'creativity': '🎨',
    'process-skills': '⚙️',
    'product-quality': '✨',
    'reflection': '🪞',
    'research-skills': '🔍',
    'presentation': '📊',
    'time-management': '⏰',
    'self-regulation': '🎯'
  };

  const icon = iconMap[category] || '📝';

  return (
    <div className={`${sizeClasses[size]} flex items-center justify-center text-2xl bg-blue-100 rounded-full`}>
      {icon}
    </div>
  );
};

// Progress Components
const ProgressCircle = ({ percentage, size = 'md', color = 'blue' }) => {
  const sizeClasses = {
    sm: 'w-16 h-16',
    md: 'w-24 h-24',
    lg: 'w-32 h-32'
  };

  const colorClasses = {
    blue: 'text-blue-500',
    green: 'text-green-500',
    orange: 'text-orange-500',
    purple: 'text-purple-500'
  };

  const radius = size === 'sm' ? 28 : size === 'md' ? 40 : 56;
  const strokeWidth = 4;
  const normalizedRadius = radius - strokeWidth * 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDasharray = `${circumference} ${circumference}`;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className={`${sizeClasses[size]} relative`}>
      <svg
        height={radius * 2}
        width={radius * 2}
        className="transform -rotate-90"
      >
        <circle
          stroke="#e5e7eb"
          fill="transparent"
          strokeWidth={strokeWidth}
          r={normalizedRadius}
          cx={radius}
          cy={radius}
        />
        <circle
          stroke="currentColor"
          fill="transparent"
          strokeWidth={strokeWidth}
          strokeDasharray={strokeDasharray}
          style={{ strokeDashoffset }}
          strokeLinecap="round"
          r={normalizedRadius}
          cx={radius}
          cy={radius}
          className={`${colorClasses[color]} transition-all duration-1000 ease-out`}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className={`font-bold ${size === 'sm' ? 'text-sm' : size === 'md' ? 'text-lg' : 'text-xl'}`}>
          {Math.round(percentage)}%
        </span>
      </div>
    </div>
  );
};

const ProgressBar = ({ percentage, label, color = 'blue', showPercentage = true }) => {
  const colorClasses = {
    blue: 'bg-blue-500',
    green: 'bg-green-500',
    orange: 'bg-orange-500',
    purple: 'bg-purple-500',
    red: 'bg-red-500'
  };

  return (
    <div className="w-full">
      {label && (
        <div className="flex justify-between mb-1">
          <span className="text-sm font-medium text-gray-700">{label}</span>
          {showPercentage && (
            <span className="text-sm text-gray-500">{Math.round(percentage)}%</span>
          )}
        </div>
      )}
      <div className="w-full bg-gray-200 rounded-full h-3">
        <div
          className={`h-3 rounded-full ${colorClasses[color]} transition-all duration-1000 ease-out`}
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
    </div>
  );
};

// Interactive Self-Assessment Components
const SelfAssessmentScale = ({ criterion, onRating, currentRating, ageGroup }) => {
  const isYoungLearner = ['ages-5-7', 'ages-8-10'].includes(ageGroup);
  
  if (isYoungLearner) {
    // Simple smiley face scale for young learners
    const faces = [
      { emoji: '😟', label: 'Need Help', value: 1 },
      { emoji: '😐', label: 'Getting There', value: 2 },
      { emoji: '😊', label: 'Good Job!', value: 3 },
      { emoji: '😄', label: 'Amazing!', value: 4 }
    ];

    return (
      <div className="bg-yellow-50 p-4 rounded-lg border-2 border-yellow-200">
        <h4 className="text-lg font-semibold text-yellow-800 mb-3">
          How did I do with {criterion.name}?
        </h4>
        <div className="flex justify-between gap-2">
          {faces.map((face) => (
            <button
              key={face.value}
              onClick={() => onRating(face.value)}
              className={`flex flex-col items-center p-3 rounded-lg border-2 transition-all ${
                currentRating === face.value
                  ? 'border-yellow-500 bg-yellow-100 scale-110'
                  : 'border-yellow-300 bg-white hover:border-yellow-400 hover:bg-yellow-50'
              }`}
            >
              <span className="text-3xl mb-1">{face.emoji}</span>
              <span className="text-sm font-medium text-yellow-700">{face.label}</span>
            </button>
          ))}
        </div>
      </div>
    );
  } else {
    // More sophisticated scale for older learners
    const levels = [
      { label: 'Needs Work', value: 1, color: 'red' },
      { label: 'Getting Better', value: 2, color: 'orange' },
      { label: 'Meeting Goal', value: 3, color: 'blue' },
      { label: 'Exceeding Goal', value: 4, color: 'green' },
      { label: 'Mastery', value: 5, color: 'purple' }
    ];

    return (
      <div className="bg-blue-50 p-4 rounded-lg border-2 border-blue-200">
        <h4 className="text-lg font-semibold text-blue-800 mb-3">
          Self-Assessment: {criterion.name}
        </h4>
        <div className="space-y-2">
          {levels.map((level) => (
            <button
              key={level.value}
              onClick={() => onRating(level.value)}
              className={`w-full flex items-center p-3 rounded-lg border-2 transition-all ${
                currentRating === level.value
                  ? `border-${level.color}-500 bg-${level.color}-100`
                  : 'border-gray-300 bg-white hover:border-blue-300 hover:bg-blue-50'
              }`}
            >
              <div className={`w-4 h-4 rounded-full mr-3 ${
                currentRating === level.value ? `bg-${level.color}-500` : 'bg-gray-300'
              }`}></div>
              <span className="font-medium">{level.label}</span>
            </button>
          ))}
        </div>
      </div>
    );
  }
};

const InteractiveChecklist = ({ items, onToggle, checkedItems, title }) => {
  return (
    <div className="bg-green-50 p-4 rounded-lg border-2 border-green-200">
      <h4 className="text-lg font-semibold text-green-800 mb-3">{title}</h4>
      <div className="space-y-2">
        {items.map((item, index) => (
          <label
            key={index}
            className="flex items-center p-2 rounded cursor-pointer hover:bg-green-100 transition-colors"
          >
            <input
              type="checkbox"
              checked={checkedItems.includes(index)}
              onChange={() => onToggle(index)}
              className="w-5 h-5 text-green-600 rounded focus:ring-green-500 mr-3"
            />
            <span className={`text-sm ${checkedItems.includes(index) ? 'line-through text-gray-500' : 'text-gray-700'}`}>
              {item}
            </span>
          </label>
        ))}
      </div>
      <div className="mt-3 text-sm text-green-600">
        {checkedItems.length} of {items.length} completed
      </div>
    </div>
  );
};

// Goal Setting Components
const GoalSettingCard = ({ criterion, onGoalSet, currentGoal, ageGroup }) => {
  const [goal, setGoal] = useState(currentGoal || '');
  const [showForm, setShowForm] = useState(false);

  const isYoungLearner = ['ages-5-7', 'ages-8-10'].includes(ageGroup);

  const prompts = isYoungLearner
    ? [
        'I want to get better at...',
        'Next time I will try to...',
        'I need help with...'
      ]
    : [
        'My specific goal for this criterion is...',
        'To improve, I will...',
        'I need to focus on...',
        'My action plan includes...'
      ];

  return (
    <div className="bg-purple-50 p-4 rounded-lg border-2 border-purple-200">
      <h4 className="text-lg font-semibold text-purple-800 mb-3">
        {isYoungLearner ? 'My Goal' : 'Goal Setting'}: {criterion.name}
      </h4>
      
      {!showForm && currentGoal ? (
        <div className="bg-white p-3 rounded border border-purple-300">
          <p className="text-gray-700">{currentGoal}</p>
          <button
            onClick={() => setShowForm(true)}
            className="mt-2 text-purple-600 hover:text-purple-700 text-sm underline"
          >
            Update Goal
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {isYoungLearner ? (
            <div>
              <label className="block text-sm font-medium text-purple-700 mb-2">
                What do you want to work on?
              </label>
              <select
                value={goal}
                onChange={(e) => setGoal(e.target.value)}
                className="w-full p-2 border border-purple-300 rounded focus:ring-purple-500 focus:border-purple-500"
              >
                <option value="">Choose what you want to work on...</option>
                {prompts.map((prompt, index) => (
                  <option key={index} value={prompt}>{prompt}</option>
                ))}
              </select>
            </div>
          ) : (
            <div>
              <label className="block text-sm font-medium text-purple-700 mb-2">
                Set a specific, measurable goal:
              </label>
              <textarea
                value={goal}
                onChange={(e) => setGoal(e.target.value)}
                placeholder="Write your goal here..."
                className="w-full p-3 border border-purple-300 rounded focus:ring-purple-500 focus:border-purple-500"
                rows={3}
              />
            </div>
          )}
          
          <div className="flex gap-2">
            <button
              onClick={() => {
                onGoalSet(goal);
                setShowForm(false);
              }}
              disabled={!goal.trim()}
              className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Save Goal
            </button>
            {currentGoal && (
              <button
                onClick={() => {
                  setGoal(currentGoal);
                  setShowForm(false);
                }}
                className="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400"
              >
                Cancel
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// Main Visual Rubric Component
const StudentRubricVisuals = ({ studentRubric, onSelfAssessment, onGoalUpdate, userProgress = {} }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [assessmentData, setAssessmentData] = useState({});
  const [checkedItems, setCheckedItems] = useState({});
  const [goals, setGoals] = useState({});

  useEffect(() => {
    // Initialize state from props
    if (userProgress.assessments) {
      setAssessmentData(userProgress.assessments);
    }
    if (userProgress.checkedItems) {
      setCheckedItems(userProgress.checkedItems);
    }
    if (userProgress.goals) {
      setGoals(userProgress.goals);
    }
  }, [userProgress]);

  const handleRating = (criterionId, rating) => {
    const newData = { ...assessmentData, [criterionId]: rating };
    setAssessmentData(newData);
    if (onSelfAssessment) {
      onSelfAssessment(criterionId, rating);
    }
  };

  const handleChecklistToggle = (criterionId, itemIndex) => {
    const key = `${criterionId}_${itemIndex}`;
    const currentItems = checkedItems[criterionId] || [];
    const newItems = currentItems.includes(itemIndex)
      ? currentItems.filter(i => i !== itemIndex)
      : [...currentItems, itemIndex];
    
    setCheckedItems({ ...checkedItems, [criterionId]: newItems });
  };

  const handleGoalSet = (criterionId, goal) => {
    const newGoals = { ...goals, [criterionId]: goal };
    setGoals(newGoals);
    if (onGoalUpdate) {
      onGoalUpdate(criterionId, goal);
    }
  };

  const calculateOverallProgress = () => {
    const totalCriteria = studentRubric.simplifiedCriteria.length;
    const assessedCriteria = Object.keys(assessmentData).length;
    return totalCriteria > 0 ? (assessedCriteria / totalCriteria) * 100 : 0;
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: '📊' },
    { id: 'criteria', label: 'Criteria', icon: '📋' },
    { id: 'progress', label: 'My Progress', icon: '📈' },
    { id: 'goals', label: 'My Goals', icon: '🎯' }
  ];

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
            📝
          </div>
          <h2 className="text-2xl font-bold">{studentRubric.title}</h2>
        </div>
        <div className="flex items-center gap-4 text-blue-100">
          <span>Level: {studentRubric.languageLevel}</span>
          <span>•</span>
          <span>Age Group: {studentRubric.ageGroup}</span>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-6 py-4 border-b-2 font-medium text-sm transition-colors ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600 bg-blue-50'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <span>{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="p-6">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">My Learning Progress</h3>
              <ProgressCircle 
                percentage={calculateOverallProgress()} 
                size="lg" 
                color="blue" 
              />
              <p className="mt-4 text-gray-600">
                You've self-assessed {Object.keys(assessmentData).length} out of {studentRubric.simplifiedCriteria.length} criteria
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {studentRubric.simplifiedCriteria.map((criterion) => (
                <div key={criterion.id} className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center gap-3 mb-2">
                    <CriterionIcon category={criterion.id} size="sm" />
                    <h4 className="font-semibold text-gray-800">{criterion.name}</h4>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">
                      {assessmentData[criterion.id] ? 'Self-assessed' : 'Not yet assessed'}
                    </span>
                    {assessmentData[criterion.id] && (
                      <PerformanceLevelIcon 
                        level={assessmentData[criterion.id]} 
                        ageGroup={studentRubric.ageGroup} 
                        size="sm" 
                      />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'criteria' && (
          <div className="space-y-6">
            {studentRubric.simplifiedCriteria.map((criterion) => (
              <div key={criterion.id} className="border border-gray-200 rounded-lg p-6">
                <div className="flex items-center gap-4 mb-4">
                  <CriterionIcon category={criterion.id} size="md" />
                  <div>
                    <h3 className="text-xl font-semibold text-gray-800">{criterion.name}</h3>
                    <p className="text-blue-600 italic">{criterion.questionPrompt}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                  {criterion.expectations.map((expectation, index) => (
                    <div key={index} className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-2xl">{expectation.visualIndicator}</span>
                        <span className="font-semibold text-gray-800">{expectation.level}</span>
                      </div>
                      <p className="text-sm text-gray-700">{expectation.studentLanguage}</p>
                    </div>
                  ))}
                </div>

                {criterion.checklistItems && criterion.checklistItems.length > 0 && (
                  <InteractiveChecklist
                    title="Self-Check Items"
                    items={criterion.checklistItems}
                    checkedItems={checkedItems[criterion.id] || []}
                    onToggle={(itemIndex) => handleChecklistToggle(criterion.id, itemIndex)}
                  />
                )}
              </div>
            ))}
          </div>
        )}

        {activeTab === 'progress' && (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">Self-Assessment</h3>
              <p className="text-gray-600">Rate yourself on each criterion to track your progress</p>
            </div>

            {studentRubric.simplifiedCriteria.map((criterion) => (
              <SelfAssessmentScale
                key={criterion.id}
                criterion={criterion}
                currentRating={assessmentData[criterion.id]}
                onRating={(rating) => handleRating(criterion.id, rating)}
                ageGroup={studentRubric.ageGroup}
              />
            ))}

            {Object.keys(assessmentData).length > 0 && (
              <div className="bg-blue-50 p-6 rounded-lg border-2 border-blue-200">
                <h4 className="text-lg font-semibold text-blue-800 mb-4">Your Progress Summary</h4>
                <div className="space-y-3">
                  {Object.entries(assessmentData).map(([criterionId, rating]) => {
                    const criterion = studentRubric.simplifiedCriteria.find(c => c.id === criterionId);
                    return (
                      <div key={criterionId} className="flex justify-between items-center">
                        <span className="font-medium">{criterion?.name}</span>
                        <div className="flex items-center gap-2">
                          <PerformanceLevelIcon level={rating} ageGroup={studentRubric.ageGroup} size="sm" />
                          <ProgressBar percentage={(rating / 4) * 100} color="blue" showPercentage={false} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'goals' && (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">Set Your Learning Goals</h3>
              <p className="text-gray-600">
                {studentRubric.ageGroup === 'ages-5-7' 
                  ? 'What do you want to get better at?'
                  : 'Set specific goals to improve your performance in each area'
                }
              </p>
            </div>

            {studentRubric.simplifiedCriteria.map((criterion) => (
              <GoalSettingCard
                key={criterion.id}
                criterion={criterion}
                currentGoal={goals[criterion.id]}
                onGoalSet={(goal) => handleGoalSet(criterion.id, goal)}
                ageGroup={studentRubric.ageGroup}
              />
            ))}
          </div>
        )}
      </div>

      {/* "I Can" Statements Footer */}
      {studentRubric.canStatements && studentRubric.canStatements.length > 0 && (
        <div className="bg-green-50 border-t border-green-200 p-6">
          <h4 className="text-lg font-semibold text-green-800 mb-4">"I Can" Statements</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {studentRubric.canStatements.slice(0, 8).map((statement, index) => (
              <div key={index} className="flex items-center gap-2 text-sm text-green-700">
                <span className="text-green-500">✓</span>
                {statement.statement}
              </div>
            ))}
          </div>
          {studentRubric.canStatements.length > 8 && (
            <p className="text-sm text-green-600 mt-2">
              +{studentRubric.canStatements.length - 8} more statements...
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default StudentRubricVisuals;
export { 
  PerformanceLevelIcon, 
  CriterionIcon, 
  ProgressCircle, 
  ProgressBar,
  SelfAssessmentScale,
  InteractiveChecklist,
  GoalSettingCard
};