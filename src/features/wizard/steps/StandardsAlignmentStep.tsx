import React, { useState, useMemo, useEffect } from 'react';
import { Book, Search, Plus, X, Check, Info } from 'lucide-react';
import { StepComponentProps } from '../types';
import { StandardsAlignment, StandardsFramework } from '../wizardSchema';
import { Tier } from '../../../types/alf';

// Standards database will be loaded dynamically
let STANDARDS_DATABASE: any = null;
let standardsLoading = false;
let standardsLoadPromise: Promise<any> | null = null;

// Lazy load the standards database
const loadStandardsDatabase = async () => {
  if (STANDARDS_DATABASE) return STANDARDS_DATABASE;
  if (standardsLoadPromise) return standardsLoadPromise;
  
  standardsLoading = true;
  standardsLoadPromise = import('../../../data/standardsDatabase').then(module => {
    STANDARDS_DATABASE = module.STANDARDS_DATABASE;
    standardsLoading = false;
    return STANDARDS_DATABASE;
  });
  
  return standardsLoadPromise;
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
  const [standardsLoaded, setStandardsLoaded] = useState(false);
  const [standardsDatabase, setStandardsDatabase] = useState<any>(null);
  
  // Load standards database on mount
  useEffect(() => {
    loadStandardsDatabase().then(db => {
      setStandardsDatabase(db);
      setStandardsLoaded(true);
    });
  }, []);

  // Filter standards based on grade level and subjects from project context
  const availableStandards = useMemo(() => {
    if (!standardsDatabase) return [];
    
    const frameworkKey = selectedFramework === 'CCSS_ELA' ? 'CCSS-ELA' : 
                        selectedFramework === 'CCSS_Math' ? 'CCSS-MATH' :
                        selectedFramework === 'State' ? 'STATE' :
                        selectedFramework === 'Custom' ? 'CUSTOM' :
                        selectedFramework;
    
    const standards = standardsDatabase[frameworkKey] || [];
    const gradeLevel = data.projectContext?.gradeLevel || '';
    const subjects = data.projectContext?.subjects || [];
    
    return standards.filter((standard: any) => {
      // Check grade level match
      const gradeMatch = !gradeLevel || standard.gradeLevel.some((gl: string) => 
        gl === gradeLevel || gradeLevel === 'Mixed'
      );
      
      // Check subject match
      const subjectMatch = subjects.length === 0 || 
        standard.subjects.some((s: string) => subjects.includes(s));
      
      // Check search query
      const searchMatch = !searchQuery || 
        standard.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
        standard.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        standard.code.toLowerCase().includes(searchQuery.toLowerCase());
      
      return gradeMatch && subjectMatch && searchMatch;
    });
  }, [selectedFramework, data.projectContext, searchQuery, standardsDatabase]);

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
    // Standards are optional; only warn if user tried to add an empty row
    const newErrors: Record<string, string> = {};
    setErrors(newErrors);
    return true;
  };

  // Handle submission
  const handleSubmit = () => {
    if (validate()) {
      onUpdate({ standards: selectedStandards });
      onNext();
    }
  };

  // Show loading state while standards are being loaded
  if (!standardsLoaded) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600 dark:text-slate-400">Loading standards database...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
          Align to Educational Standards <span className="text-sm font-semibold text-slate-500 dark:text-slate-400">(optional)</span>
        </h3>
        <p className="text-slate-600 dark:text-slate-400">
          Add must-hit standards when you have them. If you skip this step, ALF will still draft ideas—you can
          plug standards in later from the Review screen.
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
                  ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300'
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
                <div
                  key={standard.code}
                  className={`
                    p-3 rounded-lg border-2 cursor-pointer transition-all
                    ${isSelected
                      ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                      : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                    }
                  `}
                  onClick={() => toggleStandard(standard)}
                >
                  <div className="flex items-start gap-3">
                    <div className={`
                      w-5 h-5 rounded border-2 mt-0.5 flex items-center justify-center
                      ${isSelected
                        ? 'border-primary-500 bg-primary-500'
                        : 'border-slate-300 dark:border-slate-600'
                      }
                    `}>
                      {isSelected && <Check className="w-3 h-3 text-white" />}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-sm text-primary-600 dark:text-primary-400">
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
                </div>
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
          className="flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 px-3 py-2 rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Local/Custom Standard
        </button>
        
        {showAddCustom && (
            <div
              className="mt-4 p-5 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800"
            >
              <div className="space-y-4">
                <h5 className="font-semibold text-blue-800 dark:text-blue-300">Add Local or Custom Standard</h5>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Standard Code *
                    </label>
                    <input
                      type="text"
                      value={customStandard.code}
                      onChange={(e) => setCustomStandard({ ...customStandard, code: e.target.value })}
                      className="w-full px-4 py-3 text-sm rounded-lg border border-blue-200 dark:border-blue-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      placeholder="e.g., LOCAL.SCI.3 or DISTRICT.PROJ.1"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Standard Title *
                    </label>
                    <input
                      type="text"
                      value={customStandard.label}
                      onChange={(e) => setCustomStandard({ ...customStandard, label: e.target.value })}
                      className="w-full px-4 py-3 text-sm rounded-lg border border-blue-200 dark:border-blue-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      placeholder="e.g., Community Problem Solving"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Description & Rationale
                  </label>
                  <textarea
                    value={customStandard.rationale}
                    onChange={(e) => setCustomStandard({ ...customStandard, rationale: e.target.value })}
                    className="w-full px-4 py-3 text-sm rounded-lg border border-blue-200 dark:border-blue-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    rows={3}
                    placeholder="Describe what this standard requires and how your project will address it..."
                  />
                </div>
                {errors.custom && (
                  <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                    <p className="text-sm text-red-600 dark:text-red-400">{errors.custom}</p>
                  </div>
                )}
                <div className="flex gap-3">
                  <button
                    onClick={addCustomStandard}
                    className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Add Standard
                  </button>
                  <button
                    onClick={() => {
                      setShowAddCustom(false);
                      setCustomStandard({ code: '', label: '', rationale: '' });
                      setErrors({});
                    }}
                    className="px-4 py-2 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 text-sm font-medium rounded-lg hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}
      </div>

      {/* Error message */}
      {errors.standards && (
        <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-sm text-red-600 dark:text-red-400">{errors.standards}</p>
        </div>
      )}

      {/* Info box */}
      <div className="p-4 bg-primary-50 dark:bg-primary-900/20 rounded-xl border border-primary-200 dark:border-blue-800">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-primary-600 dark:text-primary-400 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm text-primary-800 dark:text-primary-300">
              <strong>Why Standards Matter:</strong> Aligning to standards helps justify your project to administrators, 
              ensures coverage of required content, and provides clear assessment criteria. Select standards that 
              naturally connect to your project goals rather than forcing connections.
            </p>
          </div>
        </div>
      </div>

      {/* Skip option for standards */}
      <div className="flex justify-center pt-4">
        <button
          onClick={() => {
            // Skip standards - clear any data and continue
            setSelectedStandards([]);
            setErrors({});
            onUpdate?.({ standards: [] });
            onNext?.();
          }}
          className="px-4 py-2 text-sm border border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-400 rounded-lg font-medium hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
        >
          Skip standards for now
        </button>
      </div>
    </div>
  );
};
