import React, { useState } from 'react';

const ChecklistIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
    <path d="M9 12l2 2 4-4"></path>
    <path d="M21 12c0 4.97-4.03 9-9 9s-9-4.03-9-9 4.03-9 9-9c.42 0 .83.04 1.23.1"></path>
  </svg>
);

const generateRubric = (assignment, ageGroup) => {
  const performanceLevels = {
    'Ages 5-7': ['Emerging', 'Developing', 'Proficient'],
    'Ages 8-10': ['Developing', 'Proficient', 'Advanced'],
    'Ages 11-14': ['Needs Improvement', 'Proficient', 'Advanced', 'Exemplary'],
    'Ages 15-18': ['Needs Improvement', 'Proficient', 'Advanced', 'Exemplary'],
    'Ages 18+': ['Needs Improvement', 'Proficient', 'Advanced', 'Exemplary']
  };

  const levels = performanceLevels[ageGroup] || ['Needs Improvement', 'Proficient', 'Advanced', 'Exemplary'];
  
  const rubricCriteria = [
    {
      criterion: 'Content Knowledge',
      description: 'Demonstrates understanding of key concepts and subject matter',
      levels: levels.map((level, index) => ({
        level,
        description: `Shows ${['limited', 'adequate', 'strong', 'exceptional'][index] || 'adequate'} understanding of core concepts`
      }))
    },
    {
      criterion: 'Problem-Solving Process',
      description: 'Uses systematic approach to address challenges',
      levels: levels.map((level, index) => ({
        level,
        description: `${['Follows basic steps', 'Uses clear process', 'Demonstrates strategic thinking', 'Shows innovative approaches'][index] || 'Uses clear process'}`
      }))
    },
    {
      criterion: 'Communication',
      description: 'Effectively shares ideas and findings',
      levels: levels.map((level, index) => ({
        level,
        description: `${['Basic communication', 'Clear presentation', 'Engaging delivery', 'Compelling and professional'][index] || 'Clear presentation'}`
      }))
    },
    {
      criterion: 'Collaboration',
      description: 'Works effectively with others',
      levels: levels.map((level, index) => ({
        level,
        description: `${['Participates minimally', 'Contributes regularly', 'Facilitates team success', 'Leads and inspires others'][index] || 'Contributes regularly'}`
      }))
    }
  ];

  return rubricCriteria;
};

export default function RubricGenerator({ assignment, ageGroup, onRubricGenerated }) {
  const [generatedRubric, setGeneratedRubric] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = async () => {
    setIsGenerating(true);
    
    // Simulate generation delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const rubric = generateRubric(assignment, ageGroup);
    setGeneratedRubric(rubric);
    
    if (onRubricGenerated) {
      onRubricGenerated(rubric);
    }
    
    setIsGenerating(false);
  };

  return (
    <div className="bg-green-50 border border-green-200 rounded-lg p-4 mt-4">
      <div className="flex items-center gap-2 mb-3">
        <ChecklistIcon />
        <h3 className="font-semibold text-green-900">Auto-Generated Rubric</h3>
      </div>
      
      {!generatedRubric ? (
        <div className="text-center">
          <p className="text-sm text-green-700 mb-3">
            Generate a professional rubric tailored to your assignment and age group
          </p>
          <button
            onClick={handleGenerate}
            disabled={isGenerating}
            className="bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg text-sm font-medium"
          >
            {isGenerating ? 'Generating...' : 'Generate Rubric'}
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="bg-white rounded-lg p-4 border border-green-200">
            <h4 className="font-semibold mb-3 text-green-900">Assessment Criteria</h4>
            <div className="space-y-4">
              {generatedRubric.map((criterion, index) => (
                <div key={index} className="border-b border-green-100 pb-3 last:border-b-0">
                  <h5 className="font-medium text-green-800 mb-1">{criterion.criterion}</h5>
                  <p className="text-xs text-green-600 mb-2">{criterion.description}</p>
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
                    {criterion.levels.map((level, levelIndex) => (
                      <div key={levelIndex} className="bg-green-50 p-2 rounded text-xs">
                        <div className="font-medium">{level.level}</div>
                        <div className="text-green-700">{level.description}</div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={() => setGeneratedRubric(null)}
              className="bg-white border border-green-300 text-green-700 px-3 py-1 rounded text-sm hover:bg-green-50"
            >
              Regenerate
            </button>
            <button
              onClick={() => navigator.clipboard.writeText(JSON.stringify(generatedRubric, null, 2))}
              className="bg-white border border-green-300 text-green-700 px-3 py-1 rounded text-sm hover:bg-green-50"
            >
              Copy Rubric
            </button>
          </div>
        </div>
      )}
    </div>
  );
}