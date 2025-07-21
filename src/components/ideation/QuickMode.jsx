// QuickMode.jsx
// Quick mode for experienced users to bypass conversational flow

import React, { useState } from 'react';

export const QuickModeToggle = ({ onToggle, isQuickMode }) => {
  return (
    <div className="fixed top-20 left-6 bg-white border-2 border-gray-300 rounded-lg px-4 py-2 shadow-md">
      <label className="flex items-center gap-3 cursor-pointer">
        <span className="text-sm font-medium text-gray-700">Quick Mode</span>
        <div className="relative">
          <input
            type="checkbox"
            checked={isQuickMode}
            onChange={(e) => onToggle(e.target.checked)}
            className="sr-only"
          />
          <div className={`block w-14 h-8 rounded-full ${isQuickMode ? 'bg-purple-600' : 'bg-gray-300'}`}></div>
          <div className={`absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform ${isQuickMode ? 'translate-x-6' : ''}`}></div>
        </div>
      </label>
      <p className="text-xs text-gray-500 mt-1">
        {isQuickMode ? 'Direct input mode' : 'Guided conversation'}
      </p>
    </div>
  );
};

export const QuickModeForm = ({ projectInfo, ideationData, currentStep, onUpdate, onComplete }) => {
  const [formData, setFormData] = useState({
    bigIdea: ideationData.bigIdea || '',
    essentialQuestion: ideationData.essentialQuestion || '',
    challenge: ideationData.challenge || ''
  });

  const examples = {
    bigIdea: {
      'Urban Planning': [
        'Sustainable Urban Development',
        'Cities of the Future: Technology and Community',
        'Urban Resilience and Climate Adaptation'
      ],
      'History': [
        'Power and Progress Through Time',
        'Voices of Change: Social Movements',
        'Innovation and Its Consequences'
      ],
      'default': [
        'Systems and Interconnections',
        'Innovation and Impact',
        'Community and Change'
      ]
    },
    essentialQuestion: {
      'Sustainable Urban Development': 'How might we design cities that balance growth with environmental protection?',
      'Cities of the Future': 'What role should technology play in creating more livable urban spaces?',
      'default': 'How can we create solutions that benefit both people and planet?'
    },
    challenge: {
      'Urban Planning': 'Design a sustainable neighborhood plan for a growing city',
      'History': 'Create a multimedia exhibit connecting past and present',
      'default': 'Develop a solution that addresses a real community need'
    }
  };

  const getExamples = (field) => {
    if (field === 'bigIdea') {
      return examples.bigIdea[projectInfo.subject] || examples.bigIdea.default;
    } else if (field === 'essentialQuestion') {
      return examples.essentialQuestion[formData.bigIdea] || examples.essentialQuestion.default;
    } else {
      return [examples.challenge[projectInfo.subject] || examples.challenge.default];
    }
  };

  const handleFieldChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    onUpdate({ ...formData, [field]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onComplete(formData);
  };

  const isComplete = formData.bigIdea && formData.essentialQuestion && formData.challenge;

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Quick Mode: Direct Input</h2>
      
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Big Idea */}
        <div className={`p-6 rounded-lg border-2 ${currentStep === 'bigIdea' ? 'border-purple-400 bg-purple-50' : 'border-gray-200'}`}>
          <label className="block mb-4">
            <span className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <span className="text-2xl">💡</span>
              Big Idea
            </span>
            <span className="text-sm text-gray-600 mt-1">A broad theme that anchors your entire project</span>
          </label>
          
          <input
            type="text"
            value={formData.bigIdea}
            onChange={(e) => handleFieldChange('bigIdea', e.target.value)}
            placeholder="Enter your Big Idea..."
            className="w-full p-3 border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200"
          />
          
          <div className="mt-3">
            <p className="text-sm text-gray-600 mb-2">Examples for {projectInfo.subject}:</p>
            <div className="flex flex-wrap gap-2">
              {getExamples('bigIdea').map((example, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => handleFieldChange('bigIdea', example)}
                  className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm hover:bg-purple-200 transition-colors"
                >
                  {example}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Essential Question */}
        <div className={`p-6 rounded-lg border-2 ${currentStep === 'essentialQuestion' ? 'border-purple-400 bg-purple-50' : 'border-gray-200'} ${!formData.bigIdea ? 'opacity-50' : ''}`}>
          <label className="block mb-4">
            <span className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <span className="text-2xl">❓</span>
              Essential Question
            </span>
            <span className="text-sm text-gray-600 mt-1">A driving question that sparks curiosity and investigation</span>
          </label>
          
          <input
            type="text"
            value={formData.essentialQuestion}
            onChange={(e) => handleFieldChange('essentialQuestion', e.target.value)}
            placeholder="Enter your Essential Question..."
            disabled={!formData.bigIdea}
            className="w-full p-3 border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200 disabled:bg-gray-100"
          />
          
          {formData.bigIdea && (
            <div className="mt-3">
              <p className="text-sm text-gray-600 mb-2">Example based on your Big Idea:</p>
              <button
                type="button"
                onClick={() => handleFieldChange('essentialQuestion', getExamples('essentialQuestion'))}
                className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm hover:bg-green-200 transition-colors"
              >
                {getExamples('essentialQuestion')}
              </button>
            </div>
          )}
        </div>

        {/* Challenge */}
        <div className={`p-6 rounded-lg border-2 ${currentStep === 'challenge' ? 'border-purple-400 bg-purple-50' : 'border-gray-200'} ${!formData.essentialQuestion ? 'opacity-50' : ''}`}>
          <label className="block mb-4">
            <span className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <span className="text-2xl">🎯</span>
              Challenge
            </span>
            <span className="text-sm text-gray-600 mt-1">What students will create or accomplish</span>
          </label>
          
          <input
            type="text"
            value={formData.challenge}
            onChange={(e) => handleFieldChange('challenge', e.target.value)}
            placeholder="Enter your Challenge..."
            disabled={!formData.essentialQuestion}
            className="w-full p-3 border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200 disabled:bg-gray-100"
          />
          
          {formData.essentialQuestion && (
            <div className="mt-3">
              <p className="text-sm text-gray-600 mb-2">Example for {projectInfo.subject}:</p>
              <button
                type="button"
                onClick={() => handleFieldChange('challenge', getExamples('challenge')[0])}
                className="px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-sm hover:bg-amber-200 transition-colors"
              >
                {getExamples('challenge')[0]}
              </button>
            </div>
          )}
        </div>

        {/* Submit Button */}
        <div className="flex justify-between items-center pt-4">
          <p className="text-sm text-gray-600">
            {isComplete ? '✅ All fields complete!' : '💡 Fill in all fields to continue'}
          </p>
          <button
            type="submit"
            disabled={!isComplete}
            className={`px-6 py-3 rounded-lg font-medium transition-all ${
              isComplete 
                ? 'bg-purple-600 text-white hover:bg-purple-700 shadow-md hover:shadow-lg transform hover:scale-105' 
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            Complete Ideation
          </button>
        </div>
      </form>
    </div>
  );
};

export default {
  QuickModeToggle,
  QuickModeForm
};