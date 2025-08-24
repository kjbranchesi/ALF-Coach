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
            
            {/* ALF Process Workflow - ACTIONABLE STEPS */}
            <div>
              <h4 className="font-semibold mb-3 text-purple-900 flex items-center gap-2">
                <UsersIcon />
                ALF Process: What You Actually DO
              </h4>
              
              {/* Stage 1: Grounding */}
              <div className="mb-6 bg-white p-4 rounded border border-purple-200">
                <div className="flex items-start gap-3 mb-3">
                  <span className="w-8 h-8 bg-blue-600 text-white rounded-full text-sm flex items-center justify-center flex-shrink-0 mt-1 font-bold">1</span>
                  <div className="flex-1">
                    <h5 className="font-semibold text-purple-800 mb-1">Grounding (20-30 minutes)</h5>
                    <p className="text-xs text-purple-600 mb-3">Define your project's conceptual foundation</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                  <div>
                    <h6 className="font-semibold text-purple-700 mb-2">📥 INPUTS YOU NEED:</h6>
                    <ul className="list-disc list-inside space-y-1 text-purple-600">
                      <li>Your curriculum standards</li>
                      <li>Available time and resources</li>
                      <li>Student interests/community needs</li>
                    </ul>
                  </div>
                  <div>
                    <h6 className="font-semibold text-purple-700 mb-2">✅ ACTIONS YOU TAKE:</h6>
                    <ul className="list-disc list-inside space-y-1 text-purple-600">
                      <li>Define your Big Idea (overarching concept)</li>
                      <li>Craft Essential Question (drives inquiry)</li>
                      <li>Design authentic Challenge (real-world task)</li>
                    </ul>
                  </div>
                </div>
                
                <div className="mt-3 p-2 bg-blue-50 rounded border border-blue-200">
                  <h6 className="font-semibold text-blue-700 text-xs mb-1">🎯 KEY QUESTIONS:</h6>
                  <p className="text-xs text-blue-600">
                    "What big concept should students understand?" → "What question will drive their inquiry?" → "What authentic problem will they solve?"
                  </p>
                </div>
                
                <div className="mt-2 text-xs">
                  <strong className="text-purple-700">📤 OUTPUT:</strong> 
                  <span className="text-purple-600"> Clear project foundation with Big Idea, Essential Question, and Challenge</span>
                </div>
              </div>
              
              {/* Stage 2: Ideation */}
              <div className="mb-6 bg-white p-4 rounded border border-purple-200">
                <div className="flex items-start gap-3 mb-3">
                  <span className="w-8 h-8 bg-green-600 text-white rounded-full text-sm flex items-center justify-center flex-shrink-0 mt-1 font-bold">2</span>
                  <div className="flex-1">
                    <h5 className="font-semibold text-purple-800 mb-1">Learning Journey (15-25 minutes)</h5>
                    <p className="text-xs text-purple-600 mb-3">Map the student learning experience through 4 phases</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs mb-3">
                  <div>
                    <h6 className="font-semibold text-purple-700 mb-2">📥 INPUTS YOU NEED:</h6>
                    <ul className="list-disc list-inside space-y-1 text-purple-600">
                      <li>Your project foundation from Stage 1</li>
                      <li>Timeline constraints</li>
                      <li>Available resources and tools</li>
                    </ul>
                  </div>
                  <div>
                    <h6 className="font-semibold text-purple-700 mb-2">✅ ACTIONS YOU TAKE:</h6>
                    <ul className="list-disc list-inside space-y-1 text-purple-600">
                      <li>Design ANALYZE phase (research activities)</li>
                      <li>Plan BRAINSTORM phase (idea generation)</li>
                      <li>Create PROTOTYPE phase (solution building)</li>
                      <li>Structure EVALUATE phase (testing & presenting)</li>
                    </ul>
                  </div>
                </div>
                
                <div className="mt-3 p-2 bg-green-50 rounded border border-green-200">
                  <h6 className="font-semibold text-green-700 text-xs mb-1">🎯 KEY QUESTIONS:</h6>
                  <p className="text-xs text-green-600">
                    "What must students research?" → "How will they generate ideas?" → "What will they create?" → "How will they test and share?"
                  </p>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-3">
                  <div className="p-2 bg-green-50 rounded text-center">
                    <div className="font-semibold text-green-700 text-xs">ANALYZE</div>
                    <div className="text-xs text-green-600">Research & investigate</div>
                  </div>
                  <div className="p-2 bg-green-50 rounded text-center">
                    <div className="font-semibold text-green-700 text-xs">BRAINSTORM</div>
                    <div className="text-xs text-green-600">Generate solutions</div>
                  </div>
                  <div className="p-2 bg-green-50 rounded text-center">
                    <div className="font-semibold text-green-700 text-xs">PROTOTYPE</div>
                    <div className="text-xs text-green-600">Build & iterate</div>
                  </div>
                  <div className="p-2 bg-green-50 rounded text-center">
                    <div className="font-semibold text-green-700 text-xs">EVALUATE</div>
                    <div className="text-xs text-green-600">Test & present</div>
                  </div>
                </div>
                
                <div className="mt-2 text-xs">
                  <strong className="text-purple-700">📤 OUTPUT:</strong> 
                  <span className="text-purple-600"> Detailed learning progression with activities, timeline, and checkpoints</span>
                </div>
              </div>
              
              {/* Stage 3: Deliverables */}
              <div className="mb-4 bg-white p-4 rounded border border-purple-200">
                <div className="flex items-start gap-3 mb-3">
                  <span className="w-8 h-8 bg-indigo-600 text-white rounded-full text-sm flex items-center justify-center flex-shrink-0 mt-1 font-bold">3</span>
                  <div className="flex-1">
                    <h5 className="font-semibold text-purple-800 mb-1">Deliverables & Assessment (10-20 minutes)</h5>
                    <p className="text-xs text-purple-600 mb-3">Define outputs, criteria, and presentation format</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                  <div>
                    <h6 className="font-semibold text-purple-700 mb-2">📥 INPUTS YOU NEED:</h6>
                    <ul className="list-disc list-inside space-y-1 text-purple-600">
                      <li>Learning objectives and standards</li>
                      <li>Authentic audience identified</li>
                      <li>Assessment requirements</li>
                    </ul>
                  </div>
                  <div>
                    <h6 className="font-semibold text-purple-700 mb-2">✅ ACTIONS YOU TAKE:</h6>
                    <ul className="list-disc list-inside space-y-1 text-purple-600">
                      <li>Specify student products/creations</li>
                      <li>Design assessment rubric</li>
                      <li>Plan authentic presentation format</li>
                      <li>Set milestones and deadlines</li>
                    </ul>
                  </div>
                </div>
                
                <div className="mt-3 p-2 bg-indigo-50 rounded border border-indigo-200">
                  <h6 className="font-semibold text-indigo-700 text-xs mb-1">🎯 KEY QUESTIONS:</h6>
                  <p className="text-xs text-indigo-600">
                    "What should students create?" → "How will you assess quality?" → "Who will receive their work?" → "When are key milestones?"
                  </p>
                </div>
                
                <div className="mt-2 text-xs">
                  <strong className="text-purple-700">📤 OUTPUT:</strong> 
                  <span className="text-purple-600"> Complete project blueprint with assessment tools and implementation timeline</span>
                </div>
              </div>
              
              {/* Decision Points */}
              <div className="mt-4 p-3 bg-purple-100 rounded border border-purple-300">
                <h6 className="font-semibold text-purple-800 text-xs mb-2">⚡ DECISION POINTS:</h6>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                  <div>
                    <strong className="text-purple-700">After Grounding:</strong>
                    <p className="text-purple-600">Foundation clear? → Move to Journey</p>
                    <p className="text-purple-600">Need refinement? → Iterate on ideas</p>
                  </div>
                  <div>
                    <strong className="text-purple-700">After Journey:</strong>
                    <p className="text-purple-600">Activities realistic? → Design deliverables</p>
                    <p className="text-purple-600">Timeline too tight? → Adjust scope</p>
                  </div>
                  <div>
                    <strong className="text-purple-700">After Deliverables:</strong>
                    <p className="text-purple-600">Ready to implement? → Export project</p>
                    <p className="text-purple-600">Need adjustments? → Refine any stage</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Workflow for Different Teaching Styles */}
            <div>
              <h4 className="font-semibold mb-3 text-purple-900 flex items-center gap-2">
                <TargetIcon />
                How Different Teachers Use ALF
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                <div className="bg-white p-3 rounded border border-purple-200">
                  <h6 className="font-semibold text-purple-800 mb-2">👩‍🏫 New to PBL (Emma)</h6>
                  <ul className="list-disc list-inside space-y-1 text-purple-600">
                    <li><strong>Step-by-step guidance:</strong> Follow prompts sequentially</li>
                    <li><strong>Use suggestion cards:</strong> Click "Ideas" when stuck</li>
                    <li><strong>Start small:</strong> Begin with familiar content areas</li>
                    <li><strong>Ask questions:</strong> Use "What if?" to explore options</li>
                  </ul>
                </div>
                <div className="bg-white p-3 rounded border border-purple-200">
                  <h6 className="font-semibold text-purple-800 mb-2">👨‍🎓 Traditional Teacher (Marcus)</h6>
                  <ul className="list-disc list-inside space-y-1 text-purple-600">
                    <li><strong>See the difference:</strong> Compare lecture vs inquiry-based</li>
                    <li><strong>Gradual transition:</strong> Start with one PBL unit per semester</li>
                    <li><strong>Standards alignment:</strong> Built-in curriculum connections</li>
                    <li><strong>Assessment clarity:</strong> Rubrics for objective grading</li>
                  </ul>
                </div>
                <div className="bg-white p-3 rounded border border-purple-200">
                  <h6 className="font-semibold text-purple-800 mb-2">⏰ Time-Pressed (Sofia)</h6>
                  <ul className="list-disc list-inside space-y-1 text-purple-600">
                    <li><strong>45-60 minute total:</strong> Complete design in one session</li>
                    <li><strong>Smart defaults:</strong> Accept AI suggestions to move quickly</li>
                    <li><strong>Template approach:</strong> Adapt successful patterns</li>
                    <li><strong>Focus on essentials:</strong> Get minimum viable project</li>
                  </ul>
                </div>
                <div className="bg-white p-3 rounded border border-purple-200">
                  <h6 className="font-semibold text-purple-800 mb-2">📋 Process-Oriented (David)</h6>
                  <ul className="list-disc list-inside space-y-1 text-purple-600">
                    <li><strong>Clear structure:</strong> Defined inputs, actions, outputs</li>
                    <li><strong>Decision trees:</strong> Explicit criteria for moving forward</li>
                    <li><strong>Quality checkpoints:</strong> Validate each stage before proceeding</li>
                    <li><strong>Documentation:</strong> Export detailed project plans</li>
                  </ul>
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