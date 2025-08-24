import React, { useState } from 'react';

const InfoIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
    <circle cx="12" cy="12" r="10"></circle>
    <path d="l 12,8 12,12"></path>
    <path d="l 12,16 12.01,16"></path>
  </svg>
);

const ChevronDownIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
    <polyline points="6 9 12 15 18 9"></polyline>
  </svg>
);

const LightbulbIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
    <path d="M9 21h6"></path>
    <path d="M12 17v4"></path>
    <path d="M12 3C8.7 3 6 5.7 6 9c0 2.4 1.4 4.5 3.5 5.5V17h5v-2.5C16.6 13.5 18 11.4 18 9c0-3.3-2.7-6-6-6z"></path>
  </svg>
);

const TargetIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
    <circle cx="12" cy="12" r="10"></circle>
    <circle cx="12" cy="12" r="6"></circle>
    <circle cx="12" cy="12" r="2"></circle>
  </svg>
);

const UsersIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
    <circle cx="9" cy="7" r="4"></circle>
    <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
    <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
  </svg>
);

export default function FrameworkOverview({ isExpanded: forceExpanded = null }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const expanded = forceExpanded !== null ? forceExpanded : isExpanded;

  return (
    <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-4">
      {forceExpanded === null && (
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full flex items-center justify-between text-left"
        >
          <div className="flex items-center gap-2">
            <InfoIcon />
            <span className="font-semibold text-purple-900">About the Active Learning Framework</span>
          </div>
          <ChevronDownIcon />
        </button>
      )}
      
      {expanded && (
        <div className={forceExpanded === null ? "mt-4 pt-4 border-t border-purple-200" : ""}>
          <div className="space-y-6 text-sm text-purple-800">
            {/* ALF Introduction */}
            <div>
              <h4 className="font-semibold mb-3 text-purple-900 flex items-center gap-2">
                <LightbulbIcon />
                What is the Active Learning Framework?
              </h4>
              <p className="mb-3">
                The Active Learning Framework (ALF) transforms your curriculum into meaningful learning experiences 
                where students solve real problems and create authentic work. Built on Gold Standard Project Based 
                Learning principles from the Buck Institute for Education.
              </p>
              <div className="bg-purple-50 p-3 rounded border border-purple-200">
                <p className="text-xs font-medium text-purple-700 mb-2">Educational Foundation:</p>
                <p className="italic">
                  "ALF draws from decades of learning science research, bringing together proven approaches 
                  that enhance your teaching expertise with structured, research-based design support."
                </p>
              </div>
            </div>

            {/* Key Benefits */}
            <div>
              <h4 className="font-semibold mb-3 text-purple-900 flex items-center gap-2">
                <TargetIcon />
                How ALF Supports Your Teaching
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="bg-purple-50 p-3 rounded border border-purple-200">
                  <h5 className="font-medium text-purple-800 mb-1">Thoughtful Planning</h5>
                  <p className="text-xs">Guided questions help connect teaching goals with student interests</p>
                </div>
                <div className="bg-purple-50 p-3 rounded border border-purple-200">
                  <h5 className="font-medium text-purple-800 mb-1">Research-Based Design</h5>
                  <p className="text-xs">Built on proven educational research and Gold Standard PBL principles</p>
                </div>
                <div className="bg-purple-50 p-3 rounded border border-purple-200">
                  <h5 className="font-medium text-purple-800 mb-1">Authentic Learning</h5>
                  <p className="text-xs">Students engage with real-world challenges and create meaningful products</p>
                </div>
                <div className="bg-purple-50 p-3 rounded border border-purple-200">
                  <h5 className="font-medium text-purple-800 mb-1">Professional Growth</h5>
                  <p className="text-xs">Enhance your expertise while maintaining full control of your context</p>
                </div>
              </div>
            </div>
            
            {/* Three Stages Detailed */}
            <div>
              <h4 className="font-semibold mb-3 text-purple-900 flex items-center gap-2">
                <UsersIcon />
                Three Stages of Meaningful Learning Design
              </h4>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <span className="w-8 h-8 bg-purple-600 text-white rounded-full text-sm flex items-center justify-center flex-shrink-0 mt-1 font-bold">1</span>
                  <div className="flex-1">
                    <h5 className="font-semibold text-purple-800 mb-1">Grounding Stage</h5>
                    <p className="text-xs mb-2">
                      Connect learning to real-world challenges students care about solving. Start with 
                      problems students see in their world and connect to genuine community needs.
                    </p>
                    <div className="text-xs text-purple-600">
                      <strong>Focus:</strong> Authentic challenges & student relevance
                    </div>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <span className="w-8 h-8 bg-purple-600 text-white rounded-full text-sm flex items-center justify-center flex-shrink-0 mt-1 font-bold">2</span>
                  <div className="flex-1">
                    <h5 className="font-semibold text-purple-800 mb-1">Ideation Stage</h5>
                    <p className="text-xs mb-2">
                      Guide students through creative problem-solving and deep investigation. Explore 
                      multiple approaches and let student interests shape the investigation.
                    </p>
                    <div className="text-xs text-purple-600">
                      <strong>Focus:</strong> Sustained inquiry & student voice
                    </div>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <span className="w-8 h-8 bg-purple-600 text-white rounded-full text-sm flex items-center justify-center flex-shrink-0 mt-1 font-bold">3</span>
                  <div className="flex-1">
                    <h5 className="font-semibold text-purple-800 mb-1">Journey Stage</h5>
                    <p className="text-xs mb-2">
                      Support students as they develop solutions for authentic audiences. Use peer critique 
                      to strengthen work and share results with the community who benefits.
                    </p>
                    <div className="text-xs text-purple-600">
                      <strong>Focus:</strong> Public products & reflection
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Research Foundation */}
            <div className="bg-purple-50 p-4 rounded border border-purple-300">
              <h5 className="font-semibold text-purple-900 mb-2">Research Foundation</h5>
              <p className="text-xs mb-2">
                ALF builds on decades of educational research, incorporating proven approaches including 
                constructivist learning theory, experiential learning cycles, Understanding by Design, 
                and Gold Standard PBL principles from the Buck Institute.
              </p>
              <div className="text-xs text-purple-600">
                <strong>Implementation Focus:</strong> The framework helps you naturally implement backward 
                design, formative assessment, differentiation, and authentic performance assessment.
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}