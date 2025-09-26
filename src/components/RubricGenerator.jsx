import React, { useState, useEffect } from 'react';
import RubricGenerationService from '../services/rubric-generation-service';
import StudentFriendlyRubricService from '../services/student-friendly-rubric-service';

const ChecklistIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
    <path d="M9 12l2 2 4-4"></path>
    <path d="M21 12c0 4.97-4.03 9-9 9s-9-4.03-9-9 4.03-9 9-9c.42 0 .83.04 1.23.1"></path>
  </svg>
);

const StarIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
    <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"></polygon>
  </svg>
);

const UserIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
    <circle cx="12" cy="7" r="4"></circle>
  </svg>
);

const SettingsIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
    <circle cx="12" cy="12" r="3"></circle>
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1 1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
  </svg>
);

export default function RubricGenerator({ assignment, ageGroup, onRubricGenerated }) {
  const [generatedRubric, setGeneratedRubric] = useState(null);
  const [studentFriendlyRubric, setStudentFriendlyRubric] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeView, setActiveView] = useState('teacher'); // 'teacher' | 'student' | 'config'
  const [rubricType, setRubricType] = useState('analytical');
  const [assessmentPurpose, setAssessmentPurpose] = useState('both');
  const [selectedCriteria, setSelectedCriteria] = useState([
    'content-knowledge',
    'communication',
    'collaboration',
    'critical-thinking'
  ]);
  const [customWeights, setCustomWeights] = useState({});
  const [includeStandards, setIncludeStandards] = useState(false);
  const [rubricService] = useState(() => new RubricGenerationService());
  const [studentService] = useState(() => new StudentFriendlyRubricService());

  // Convert legacy age group format to new format
  const convertAgeGroup = (legacyAgeGroup) => {
    const mapping = {
      'Ages 5-7': 'ages-5-7',
      'Ages 8-10': 'ages-8-10',
      'Ages 11-14': 'ages-11-14',
      'Ages 15-18': 'ages-15-18',
      'Ages 18+': 'ages-18+'
    };
    return mapping[legacyAgeGroup] || 'ages-11-14';
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    
    try {
      // Create comprehensive rubric configuration
      const config = {
        projectTitle: assignment || 'Project Assessment',
        projectDescription: `Assessment rubric for ${assignment || 'student project'}`,
        ageGroup: convertAgeGroup(ageGroup),
        subject: ['General'],
        duration: 'Multi-week',
        learningObjectives: ['Demonstrate understanding', 'Apply skills effectively', 'Communicate clearly'],
        assessmentPurpose,
        rubricType,
        criteriaPreferences: {
          priorityCategories: selectedCriteria,
          weightingApproach: 'category-based',
          customWeights,
          includeCollaboration: selectedCriteria.includes('collaboration'),
          includeSelfReflection: selectedCriteria.includes('reflection'),
          includeProcessSkills: selectedCriteria.includes('process-skills'),
          focusOnProduct: selectedCriteria.includes('product-quality'),
          emphasizeCreativity: selectedCriteria.includes('creativity')
        },
        standardsToAlign: includeStandards ? ['CCSS.ELA-LITERACY'] : [],
        customRequirements: [],
        modifications: []
      };

      // Generate comprehensive rubric
      const rubric = await rubricService.generateRubric(config);
      setGeneratedRubric(rubric);

      // Generate student-friendly version
      const studentRubric = await studentService.createStudentFriendlyVersion(rubric);
      setStudentFriendlyRubric(studentRubric);
      
      if (onRubricGenerated) {
        onRubricGenerated(rubric);
      }
      
    } catch (error) {
      console.error('Failed to generate rubric:', error);
      // Fallback to legacy generation
      const legacyRubric = generateLegacyRubric(assignment, ageGroup);
      setGeneratedRubric({ criteria: legacyRubric, type: 'analytical' });
    } finally {
      setIsGenerating(false);
    }
  };

  // Legacy fallback function
  const generateLegacyRubric = (assignment, ageGroup) => {
    const performanceLevels = {
      'Ages 5-7': ['Emerging', 'Developing', 'Proficient'],
      'Ages 8-10': ['Developing', 'Proficient', 'Advanced'],
      'Ages 11-14': ['Needs Improvement', 'Proficient', 'Advanced', 'Exemplary'],
      'Ages 15-18': ['Needs Improvement', 'Proficient', 'Advanced', 'Exemplary'],
      'Ages 18+': ['Needs Improvement', 'Proficient', 'Advanced', 'Exemplary']
    };

    const levels = performanceLevels[ageGroup] || ['Needs Improvement', 'Proficient', 'Advanced', 'Exemplary'];
    
    return [
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
      }
    ];
  };

  const availableCriteria = [
    { id: 'content-knowledge', name: 'Content Knowledge', abbrev: 'CK' },
    { id: 'communication', name: 'Communication', abbrev: 'CM' },
    { id: 'collaboration', name: 'Collaboration', abbrev: 'CL' },
    { id: 'critical-thinking', name: 'Critical Thinking', abbrev: 'CT' },
    { id: 'creativity', name: 'Creativity', abbrev: 'CR' },
    { id: 'process-skills', name: 'Process Skills', abbrev: 'PS' },
    { id: 'product-quality', name: 'Product Quality', abbrev: 'PQ' },
    { id: 'reflection', name: 'Reflection', abbrev: 'RF' }
  ];

  const toggleCriterion = (criterionId) => {
    setSelectedCriteria(prev => 
      prev.includes(criterionId) 
        ? prev.filter(id => id !== criterionId)
        : [...prev, criterionId]
    );
  };

  const renderConfigurationView = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-green-800 mb-2">
            Rubric Type
          </label>
          <select 
            value={rubricType} 
            onChange={(e) => setRubricType(e.target.value)}
            className="w-full p-2 border border-green-300 rounded-lg text-sm"
          >
            <option value="analytical">Analytical (Multiple Criteria)</option>
            <option value="holistic">Holistic (Overall Quality)</option>
            <option value="single-point">Single-Point (Target-Focused)</option>
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-green-800 mb-2">
            Assessment Purpose
          </label>
          <select 
            value={assessmentPurpose} 
            onChange={(e) => setAssessmentPurpose(e.target.value)}
            className="w-full p-2 border border-green-300 rounded-lg text-sm"
          >
            <option value="formative">Formative (For Learning)</option>
            <option value="summative">Summative (Of Learning)</option>
            <option value="both">Both Formative & Summative</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-green-800 mb-2">
          Assessment Criteria
        </label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {availableCriteria.map(criterion => (
            <button
              key={criterion.id}
              onClick={() => toggleCriterion(criterion.id)}
              className={`p-2 rounded-lg text-xs font-medium transition-colors ${
                selectedCriteria.includes(criterion.id)
                  ? 'bg-green-600 text-white'
                  : 'bg-green-100 text-green-700 hover:bg-green-200'
              }`}
            >
              <div className="font-bold text-sm">{criterion.abbrev}</div>
              <div className="text-xs mt-1">{criterion.name}</div>
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="includeStandards"
          checked={includeStandards}
          onChange={(e) => setIncludeStandards(e.target.checked)}
          className="rounded border-green-300"
        />
        <label htmlFor="includeStandards" className="text-sm text-green-800">
          Align with Educational Standards
        </label>
      </div>
    </div>
  );

  const renderTeacherView = () => {
    if (!generatedRubric) {
      return null;
    }
    
    const isLegacy = !generatedRubric.criteria;
    const criteria = isLegacy ? generatedRubric : generatedRubric.criteria;
    
    return (
      <div className="space-y-4">
        <div className="bg-white rounded-lg p-4 border border-green-200">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-semibold text-green-900">Teacher Rubric</h4>
            {!isLegacy && (
              <div className="flex items-center gap-2 text-xs text-green-600">
                <span>Type: {generatedRubric.type}</span>
                <span>•</span>
                <span>Purpose: {generatedRubric.purpose}</span>
                {generatedRubric.totalPoints && (
                  <>
                    <span>•</span>
                    <span>{generatedRubric.totalPoints} points</span>
                  </>
                )}
              </div>
            )}
          </div>
          
          <div className="space-y-4">
            {criteria.map((criterion, index) => (
              <div key={index} className="border-b border-green-100 pb-3 last:border-b-0">
                <h5 className="font-medium text-green-800 mb-1">
                  {criterion.name || criterion.criterion}
                </h5>
                <p className="text-xs text-green-600 mb-2">{criterion.description}</p>
                
                {isLegacy ? (
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
                    {criterion.levels.map((level, levelIndex) => (
                      <div key={levelIndex} className="bg-green-50 p-2 rounded text-xs">
                        <div className="font-medium">{level.level}</div>
                        <div className="text-green-700">{level.description}</div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-2">
                    {criterion.descriptors && criterion.descriptors.map((descriptor, dIndex) => {
                      const level = generatedRubric.performanceLevels.find(l => l.id === descriptor.levelId);
                      return (
                        <div key={dIndex} className="bg-green-50 p-3 rounded">
                          <div className="flex items-center gap-2 mb-1">
                            <div className="font-medium text-sm">{level?.name}</div>
                            <div className="text-xs text-green-600">({level?.pointValue} pts)</div>
                          </div>
                          <div className="text-xs text-green-700 mb-2">{descriptor.description}</div>
                          {descriptor.indicators && descriptor.indicators.length > 0 && (
                            <div className="text-xs">
                              <div className="font-medium text-green-800 mb-1">Indicators:</div>
                              <ul className="list-disc list-inside text-green-600">
                                {descriptor.indicators.slice(0, 3).map((indicator, iIndex) => (
                                  <li key={iIndex}>{indicator}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderStudentView = () => {
    if (!studentFriendlyRubric) {
      return null;
    }
    
    return (
      <div className="space-y-4">
        <div className="bg-white rounded-lg p-4 border border-primary-200">
          <h4 className="font-semibold text-primary-900 mb-3">{studentFriendlyRubric.title}</h4>
          
          <div className="space-y-4">
            {studentFriendlyRubric.simplifiedCriteria.map((criterion, index) => (
              <div key={index} className="border-b border-primary-100 pb-3 last:border-b-0">
                <h5 className="font-medium text-primary-800 mb-2">
                  {criterion.name}
                </h5>
                <p className="text-sm text-primary-600 mb-3 italic">{criterion.questionPrompt}</p>
                
                <div className="space-y-2">
                  {criterion.expectations.map((expectation, eIndex) => (
                    <div key={eIndex} className="bg-primary-50 p-3 rounded">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-lg">{expectation.visualIndicator}</span>
                        <span className="font-medium text-sm">{expectation.level}</span>
                      </div>
                      <div className="text-sm text-primary-700">{expectation.studentLanguage}</div>
                    </div>
                  ))}
                </div>
                
                {criterion.checklistItems && criterion.checklistItems.length > 0 && (
                  <div className="mt-3">
                    <div className="font-medium text-sm text-primary-800 mb-2">Self-Check:</div>
                    <div className="space-y-1">
                      {criterion.checklistItems.map((item, cIndex) => (
                        <label key={cIndex} className="flex items-center gap-2 text-sm text-primary-700">
                          <input type="checkbox" className="rounded border-primary-300" />
                          {item}
                        </label>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
          
          {studentFriendlyRubric.canStatements && studentFriendlyRubric.canStatements.length > 0 && (
            <div className="mt-4 bg-primary-50 p-3 rounded">
              <h5 className="font-medium text-primary-900 mb-2">"I Can" Statements</h5>
              <div className="space-y-1">
                {studentFriendlyRubric.canStatements.slice(0, 6).map((statement, sIndex) => (
                  <div key={sIndex} className="text-sm text-primary-700">
                    • {statement.statement}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="bg-green-50 border border-green-200 rounded-lg p-4 mt-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <ChecklistIcon />
          <h3 className="font-semibold text-green-900">Comprehensive Rubric Generator</h3>
        </div>
        
        {generatedRubric && (
          <div className="flex gap-1">
            <button
              onClick={() => setActiveView('teacher')}
              className={`px-3 py-1 text-xs rounded-lg font-medium transition-colors ${
                activeView === 'teacher'
                  ? 'bg-green-600 text-white'
                  : 'bg-white text-green-700 border border-green-300 hover:bg-green-50'
              }`}
            >
              <div className="flex items-center gap-1">
                <ChecklistIcon />
                Teacher
              </div>
            </button>
            <button
              onClick={() => setActiveView('student')}
              className={`px-3 py-1 text-xs rounded-lg font-medium transition-colors ${
                activeView === 'student'
                  ? 'bg-primary-600 text-white'
                  : 'bg-white text-primary-700 border border-primary-300 hover:bg-primary-50'
              }`}
            >
              <div className="flex items-center gap-1">
                <UserIcon />
                Student
              </div>
            </button>
            <button
              onClick={() => setActiveView('config')}
              className={`px-3 py-1 text-xs rounded-lg font-medium transition-colors ${
                activeView === 'config'
                  ? 'bg-gray-600 text-white'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center gap-1">
                <SettingsIcon />
                Config
              </div>
            </button>
          </div>
        )}
      </div>
      
      {!generatedRubric ? (
        <div>
          <div className="text-center mb-4">
            <p className="text-sm text-green-700 mb-3">
              Generate a comprehensive, research-based rubric with both teacher and student-friendly versions
            </p>
          </div>
          
          {renderConfigurationView()}
          
          <div className="text-center mt-4">
            <button
              onClick={handleGenerate}
              disabled={isGenerating || selectedCriteria.length === 0}
              className="bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white px-6 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              {isGenerating ? 'Generating Comprehensive Rubric...' : 'Generate Professional Rubric'}
            </button>
            {selectedCriteria.length === 0 && (
              <p className="text-xs text-red-600 mt-2">Please select at least one assessment criterion</p>
            )}
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {activeView === 'teacher' && renderTeacherView()}
          {activeView === 'student' && renderStudentView()}
          {activeView === 'config' && renderConfigurationView()}
          
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => {
                setGeneratedRubric(null);
                setStudentFriendlyRubric(null);
                setActiveView('teacher');
              }}
              className="bg-white border border-green-300 text-green-700 px-3 py-1 rounded text-sm hover:bg-green-50 transition-colors"
            >
              Generate New Rubric
            </button>
            <button
              onClick={() => {
                const dataToExport = {
                  teacherRubric: generatedRubric,
                  studentRubric: studentFriendlyRubric,
                  configuration: {
                    rubricType,
                    assessmentPurpose,
                    selectedCriteria,
                    includeStandards
                  }
                };
                navigator.clipboard.writeText(JSON.stringify(dataToExport, null, 2));
              }}
              className="bg-white border border-green-300 text-green-700 px-3 py-1 rounded text-sm hover:bg-green-50 transition-colors"
            >
              Export Rubric Data
            </button>
            {activeView === 'teacher' && (
              <button
                onClick={() => window.print()}
                className="bg-white border border-green-300 text-green-700 px-3 py-1 rounded text-sm hover:bg-green-50 transition-colors"
              >
                Print Rubric
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
