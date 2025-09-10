import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Book, Search, Plus, X, Check, Info } from 'lucide-react';
import { StepComponentProps } from '../types';
import { StandardsAlignment, StandardsFramework } from '../wizardSchema';
import { Tier } from '../../../types/alf';

// Common standards database (simplified version - in production this would be an API)
const STANDARDS_DATABASE: Record<StandardsFramework, Array<{
  code: string;
  label: string;
  description: string;
  gradeLevel: string[];
  subjects: string[];
}>> = {
  NGSS: [
    {
      code: 'MS-ESS3-3',
      label: 'Human Impact on Environment',
      description: 'Apply scientific principles to design a method for monitoring and minimizing human impact on the environment.',
      gradeLevel: ['6-8'],
      subjects: ['Science']
    },
    {
      code: 'MS-ESS3-4',
      label: 'Human Population and Natural Resources',
      description: 'Construct an argument supported by evidence for how increases in human population impact Earth\'s systems.',
      gradeLevel: ['6-8'],
      subjects: ['Science']
    },
    {
      code: 'MS-ESS3-5',
      label: 'Climate Change',
      description: 'Ask questions to clarify evidence of the factors that have caused climate change over the past century.',
      gradeLevel: ['6-8'],
      subjects: ['Science']
    },
    {
      code: 'HS-ESS3-2',
      label: 'Natural Resources Management',
      description: 'Evaluate competing design solutions for developing, managing, and utilizing energy and mineral resources.',
      gradeLevel: ['9-12'],
      subjects: ['Science']
    },
    {
      code: 'HS-ESS3-4',
      label: 'Sustainability Solutions',
      description: 'Evaluate or refine a technological solution that reduces impacts of human activities on climate change.',
      gradeLevel: ['9-12'],
      subjects: ['Science']
    }
  ],
  CCSS_ELA: [
    {
      code: 'CCSS.ELA-LITERACY.RST.6-8.1',
      label: 'Cite Textual Evidence',
      description: 'Cite specific textual evidence to support analysis of science and technical texts.',
      gradeLevel: ['6-8'],
      subjects: ['ELA', 'Science']
    },
    {
      code: 'CCSS.ELA-LITERACY.W.6-8.1',
      label: 'Write Arguments',
      description: 'Write arguments focused on discipline-specific content.',
      gradeLevel: ['6-8'],
      subjects: ['ELA']
    },
    {
      code: 'CCSS.ELA-LITERACY.SL.6-8.4',
      label: 'Present Claims and Findings',
      description: 'Present claims and findings, emphasizing salient points in a focused, coherent manner.',
      gradeLevel: ['6-8'],
      subjects: ['ELA']
    },
    {
      code: 'CCSS.ELA-LITERACY.RST.9-10.7',
      label: 'Translate Quantitative Information',
      description: 'Translate quantitative or technical information expressed in words into visual form.',
      gradeLevel: ['9-12'],
      subjects: ['ELA', 'Science', 'Math']
    }
  ],
  CCSS_Math: [
    {
      code: 'CCSS.MATH.CONTENT.6.SP.B.5',
      label: 'Summarize and Describe Data',
      description: 'Summarize numerical data sets in relation to their context.',
      gradeLevel: ['6-8'],
      subjects: ['Math']
    },
    {
      code: 'CCSS.MATH.CONTENT.7.RP.A.3',
      label: 'Solve Real-World Problems',
      description: 'Use proportional relationships to solve multistep ratio and percent problems.',
      gradeLevel: ['6-8'],
      subjects: ['Math']
    },
    {
      code: 'CCSS.MATH.CONTENT.HSA.CED.A.3',
      label: 'Represent Constraints',
      description: 'Represent constraints by equations or inequalities, and by systems.',
      gradeLevel: ['9-12'],
      subjects: ['Math']
    }
  ],
  ISTE: [
    {
      code: 'ISTE.1.1',
      label: 'Empowered Learner',
      description: 'Students leverage technology to take an active role in choosing and achieving learning goals.',
      gradeLevel: ['K-2', '3-5', '6-8', '9-12'],
      subjects: ['Technology']
    },
    {
      code: 'ISTE.1.3',
      label: 'Knowledge Constructor',
      description: 'Students critically curate digital resources using digital tools to construct knowledge.',
      gradeLevel: ['K-2', '3-5', '6-8', '9-12'],
      subjects: ['Technology']
    },
    {
      code: 'ISTE.1.6',
      label: 'Creative Communicator',
      description: 'Students communicate clearly and express themselves creatively using digital tools.',
      gradeLevel: ['K-2', '3-5', '6-8', '9-12'],
      subjects: ['Technology']
    }
  ],
  State: [], // Would be populated based on state selection
  IB: [
    {
      code: 'IB.MYP.Sciences.A',
      label: 'Knowing and Understanding',
      description: 'Students develop their understanding of science through inquiry.',
      gradeLevel: ['6-8', '9-12'],
      subjects: ['Science']
    }
  ],
  Custom: [] // User-defined standards
};

export const StandardsAlignmentStep: React.FC<StepComponentProps> = ({
  data,
  onUpdate,
  onNext,
  onBack
}) => {
  const [selectedFramework, setSelectedFramework] = useState<StandardsFramework>(
    data.standards?.[0]?.framework || 'NGSS'
  );
  const [selectedStandards, setSelectedStandards] = useState<StandardsAlignment[]>(
    data.standards || []
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddCustom, setShowAddCustom] = useState(false);
  const [customStandard, setCustomStandard] = useState({
    code: '',
    label: '',
    rationale: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Filter standards based on grade level and subjects from project context
  const availableStandards = useMemo(() => {
    const standards = STANDARDS_DATABASE[selectedFramework] || [];
    const gradeLevel = data.projectContext?.gradeLevel || '';
    const subjects = data.projectContext?.subjects || [];
    
    return standards.filter(standard => {
      // Check grade level match
      const gradeMatch = !gradeLevel || standard.gradeLevel.some(gl => 
        gl === gradeLevel || gradeLevel === 'Mixed'
      );
      
      // Check subject match
      const subjectMatch = subjects.length === 0 || 
        standard.subjects.some(s => subjects.includes(s));
      
      // Check search query
      const searchMatch = !searchQuery || 
        standard.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
        standard.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        standard.code.toLowerCase().includes(searchQuery.toLowerCase());
      
      return gradeMatch && subjectMatch && searchMatch;
    });
  }, [selectedFramework, data.projectContext, searchQuery]);

  // Add or remove a standard
  const toggleStandard = (standard: typeof availableStandards[0]) => {
    const exists = selectedStandards.find(s => s.code === standard.code);
    
    if (exists) {
      setSelectedStandards(selectedStandards.filter(s => s.code !== standard.code));
    } else {
      const newStandard: StandardsAlignment = {
        framework: selectedFramework,
        code: standard.code,
        label: standard.label,
        rationale: `This standard aligns with the project's focus on ${data.bigIdea ? 'exploring ' + data.bigIdea.substring(0, 50) + '...' : 'the essential question'}`,
        tier: 'core' as Tier,
        confidence: 0.85
      };
      setSelectedStandards([...selectedStandards, newStandard]);
    }
  };

  // Update rationale for a standard
  const updateRationale = (code: string, rationale: string) => {
    setSelectedStandards(selectedStandards.map(s => 
      s.code === code ? { ...s, rationale } : s
    ));
  };

  // Add custom standard
  const addCustomStandard = () => {
    if (!customStandard.code || !customStandard.label) {
      setErrors({ custom: 'Code and label are required' });
      return;
    }

    const newStandard: StandardsAlignment = {
      framework: 'Custom',
      code: customStandard.code,
      label: customStandard.label,
      rationale: customStandard.rationale || 'Custom standard for project-specific learning goals',
      tier: 'scaffold' as Tier,
      confidence: 0.7
    };

    setSelectedStandards([...selectedStandards, newStandard]);
    setCustomStandard({ code: '', label: '', rationale: '' });
    setShowAddCustom(false);
    setErrors({});
  };

  // Validation
  const validate = () => {
    const newErrors: Record<string, string> = {};
    
    if (selectedStandards.length < 2) {
      newErrors.standards = 'Please select at least 2 standards to align with your project';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle submission
  const handleSubmit = () => {
    if (validate()) {
      onUpdate({ standards: selectedStandards });
      onNext();
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
          Align to Educational Standards
        </h3>
        <p className="text-slate-600 dark:text-slate-400">
          Connect your project to curriculum standards for assessment and accountability.
        </p>
      </div>

      {/* Framework Selection */}
      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
          Standards Framework
        </label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {(['NGSS', 'CCSS_ELA', 'CCSS_Math', 'ISTE', 'State', 'IB', 'Custom'] as StandardsFramework[]).map(framework => (
            <button
              key={framework}
              onClick={() => setSelectedFramework(framework)}
              className={`
                px-3 py-2 rounded-lg border-2 transition-all text-sm font-medium
                ${selectedFramework === framework
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                  : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                }
              `}
            >
              {framework.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search standards by code, label, or description..."
          className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
        />
      </div>

      {/* Available Standards */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="font-semibold text-slate-800 dark:text-slate-200">
            Available Standards
          </h4>
          <span className="text-sm text-slate-500">
            {selectedStandards.length} selected
          </span>
        </div>

        {availableStandards.length > 0 ? (
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {availableStandards.map((standard) => {
              const isSelected = selectedStandards.some(s => s.code === standard.code);
              return (
                <motion.div
                  key={standard.code}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`
                    p-3 rounded-lg border-2 cursor-pointer transition-all
                    ${isSelected
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                      : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                    }
                  `}
                  onClick={() => toggleStandard(standard)}
                >
                  <div className="flex items-start gap-3">
                    <div className={`
                      w-5 h-5 rounded border-2 mt-0.5 flex items-center justify-center
                      ${isSelected
                        ? 'border-blue-500 bg-blue-500'
                        : 'border-slate-300 dark:border-slate-600'
                      }
                    `}>
                      {isSelected && <Check className="w-3 h-3 text-white" />}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-sm text-blue-600 dark:text-blue-400">
                          {standard.code}
                        </span>
                        <span className="font-medium text-slate-800 dark:text-slate-200">
                          {standard.label}
                        </span>
                      </div>
                      <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                        {standard.description}
                      </p>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-8 text-slate-500">
            No standards found matching your criteria.
          </div>
        )}
      </div>

      {/* Selected Standards with Rationales */}
      {selectedStandards.length > 0 && (
        <div className="space-y-3">
          <h4 className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2">
            <Book className="w-5 h-5 text-purple-600" />
            Selected Standards & Rationales
            <span className="text-xs px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 rounded-full">
              Scaffold
            </span>
          </h4>
          
          <div className="space-y-3">
            {selectedStandards.map((standard) => (
              <div
                key={standard.code}
                className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800"
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <span className="font-mono text-sm text-purple-600 dark:text-purple-400">
                      {standard.code}
                    </span>
                    <span className="ml-2 font-medium text-slate-800 dark:text-slate-200">
                      {standard.label}
                    </span>
                  </div>
                  <button
                    onClick={() => setSelectedStandards(selectedStandards.filter(s => s.code !== standard.code))}
                    className="text-slate-400 hover:text-red-600 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                    Why this standard applies:
                  </label>
                  <textarea
                    value={standard.rationale}
                    onChange={(e) => updateRationale(standard.code, e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded border border-purple-200 dark:border-purple-700 bg-white dark:bg-slate-800"
                    rows={2}
                    placeholder="Explain how this standard connects to your project..."
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add Custom Standard */}
      <div>
        <button
          onClick={() => setShowAddCustom(!showAddCustom)}
          className="flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400 hover:underline"
        >
          <Plus className="w-4 h-4" />
          Add Custom Standard
        </button>
        
        <AnimatePresence>
          {showAddCustom && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-3 p-4 bg-slate-50 dark:bg-slate-800 rounded-lg"
            >
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Standard Code *
                    </label>
                    <input
                      type="text"
                      value={customStandard.code}
                      onChange={(e) => setCustomStandard({ ...customStandard, code: e.target.value })}
                      className="w-full px-3 py-2 text-sm rounded border border-slate-300 dark:border-slate-600"
                      placeholder="e.g., LOCAL.SCI.3"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Label *
                    </label>
                    <input
                      type="text"
                      value={customStandard.label}
                      onChange={(e) => setCustomStandard({ ...customStandard, label: e.target.value })}
                      className="w-full px-3 py-2 text-sm rounded border border-slate-300 dark:border-slate-600"
                      placeholder="e.g., Environmental Action"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Rationale
                  </label>
                  <input
                    type="text"
                    value={customStandard.rationale}
                    onChange={(e) => setCustomStandard({ ...customStandard, rationale: e.target.value })}
                    className="w-full px-3 py-2 text-sm rounded border border-slate-300 dark:border-slate-600"
                    placeholder="Why this standard is important..."
                  />
                </div>
                {errors.custom && (
                  <p className="text-xs text-red-600">{errors.custom}</p>
                )}
                <div className="flex gap-2">
                  <button
                    onClick={addCustomStandard}
                    className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                  >
                    Add Standard
                  </button>
                  <button
                    onClick={() => {
                      setShowAddCustom(false);
                      setCustomStandard({ code: '', label: '', rationale: '' });
                      setErrors({});
                    }}
                    className="px-3 py-1.5 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 text-sm rounded hover:bg-slate-300 dark:hover:bg-slate-600"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Error message */}
      {errors.standards && (
        <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-sm text-red-600 dark:text-red-400">{errors.standards}</p>
        </div>
      )}

      {/* Info box */}
      <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm text-blue-800 dark:text-blue-300">
              <strong>Why Standards Matter:</strong> Aligning to standards helps justify your project to administrators, 
              ensures coverage of required content, and provides clear assessment criteria. Select standards that 
              naturally connect to your project goals rather than forcing connections.
            </p>
          </div>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex justify-between gap-3 pt-6 border-t border-slate-200 dark:border-slate-700">
        <button
          onClick={onBack}
          className="px-6 py-3 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-xl font-medium hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
        >
          Back
        </button>
        <button
          onClick={handleSubmit}
          className="px-6 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors shadow-lg"
        >
          Continue to Phases & Milestones
        </button>
      </div>
    </div>
  );
};