/**
 * ImpactDesignerEnhanced.tsx - Enhanced impact designer with proper data persistence
 */

import React, { useState, useEffect, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Globe, Building, Heart, Megaphone, Share2, CheckCircle2, Plus, Target, School, Briefcase } from 'lucide-react';
import { Button } from '../../ui/Button';
import { generateSecureId } from '../../../core/utils/idGeneration';
import { validateAndSanitizeInput } from '../../../core/utils/inputSanitization';

interface ImpactOption {
  id: string;
  audience: string;
  method: string;
  description: string;
  icon: 'users' | 'globe' | 'building' | 'heart' | 'megaphone' | 'share2' | 'school' | 'briefcase';
  examples?: string[];
}

interface ImpactDesignerEnhancedProps {
  suggestedImpacts: ImpactOption[];
  currentImpact?: { audience: string; method: string };
  onImpactConfirmed: (impact: { audience: string; method: string; description?: string }) => void;
  onRequestNewSuggestions: () => void;
}

const iconMap = {
  users: Users,
  globe: Globe,
  building: Building,
  heart: Heart,
  megaphone: Megaphone,
  share2: Share2,
  school: School,
  briefcase: Briefcase
};

export const ImpactDesignerEnhanced: React.FC<ImpactDesignerEnhancedProps> = memo(({
  suggestedImpacts,
  currentImpact,
  onImpactConfirmed,
  onRequestNewSuggestions
}) => {
  const [selectedImpact, setSelectedImpact] = useState<ImpactOption | null>(null);
  const [customImpact, setCustomImpact] = useState({ audience: '', method: '', description: '' });
  const [showCustomForm, setShowCustomForm] = useState(false);
  const [localImpacts, setLocalImpacts] = useState<ImpactOption[]>(suggestedImpacts);
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Initialize with current impact if it exists
  useEffect(() => {
    if (currentImpact && currentImpact.audience && currentImpact.method) {
      // Check if current impact matches any suggested impacts
      const existing = suggestedImpacts.find(
        i => i.audience === currentImpact.audience && i.method === currentImpact.method
      );
      if (existing) {
        setSelectedImpact(existing);
      } else {
        // Create a new impact option for the current selection
        const currentOption: ImpactOption = {
          id: 'current',
          audience: currentImpact.audience,
          method: currentImpact.method,
          description: `Share with ${currentImpact.audience} through ${currentImpact.method}`,
          icon: 'share2'
        };
        setSelectedImpact(currentOption);
        setLocalImpacts([currentOption, ...suggestedImpacts]);
      }
      console.log('[ImpactDesignerEnhanced] Loaded current impact:', currentImpact);
    }
  }, [currentImpact, suggestedImpacts]);

  const handleSelectImpact = (impact: ImpactOption) => {
    setSelectedImpact(impact);
    setShowCustomForm(false);
    console.log('[ImpactDesignerEnhanced] Selected impact:', impact);
  };

  const handleAddCustomImpact = () => {
    // Validate and sanitize inputs
    const audienceValidation = validateAndSanitizeInput(customImpact.audience, { maxLength: 100, required: true });
    const methodValidation = validateAndSanitizeInput(customImpact.method, { maxLength: 100, required: true });
    const descriptionValidation = validateAndSanitizeInput(customImpact.description, { maxLength: 300, required: false });
    
    if (audienceValidation.isValid && methodValidation.isValid) {
      const newImpact: ImpactOption = {
        id: generateSecureId('impact'),
        audience: audienceValidation.sanitizedValue,
        method: methodValidation.sanitizedValue,
        description: descriptionValidation.sanitizedValue || `Share with ${audienceValidation.sanitizedValue} through ${methodValidation.sanitizedValue}`,
        icon: 'share2'
      };
      
      setLocalImpacts([...localImpacts, newImpact]);
      setSelectedImpact(newImpact);
      setCustomImpact({ audience: '', method: '', description: '' });
      setShowCustomForm(false);
      
      console.log('[ImpactDesignerEnhanced] Added custom impact:', newImpact);
    }
  };

  const handleConfirm = () => {
    if (!selectedImpact) {
      setErrorMessage('Please select an impact method');
      setShowError(true);
      setTimeout(() => setShowError(false), 3000);
      return;
    }
    
    const impactData = {
      audience: selectedImpact.audience,
      method: selectedImpact.method,
      description: selectedImpact.description
    };
    
    console.log('[ImpactDesignerEnhanced] Confirming impact:', impactData);
    onImpactConfirmed(impactData);
  };

  const canContinue = selectedImpact !== null;

  const getAudienceIcon = (audience: string) => {
    const lower = audience.toLowerCase();
    if (lower.includes('parent')) return 'heart';
    if (lower.includes('community')) return 'users';
    if (lower.includes('expert') || lower.includes('professional')) return 'briefcase';
    if (lower.includes('school') || lower.includes('student')) return 'school';
    if (lower.includes('world') || lower.includes('global')) return 'globe';
    if (lower.includes('organization') || lower.includes('business')) return 'building';
    return 'share2';
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center">
        <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          Design Real-World Impact
        </h3>
        <p className="text-gray-600 dark:text-gray-400">
          Choose how students will share their work with an authentic audience
        </p>
        {currentImpact && currentImpact.audience && (
          <p className="text-sm text-green-600 dark:text-green-400 mt-2">
            Current selection: {currentImpact.audience} → {currentImpact.method}
          </p>
        )}
      </div>

      {/* Error Message */}
      <AnimatePresence>
        {showError && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-400 text-sm text-center"
          >
            {errorMessage}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Impact Options Grid */}
      <div className="grid gap-3">
        <AnimatePresence mode="popLayout">
          {localImpacts.map((impact) => {
            const isSelected = selectedImpact?.id === impact.id;
            const IconComponent = iconMap[impact.icon] || Share2;
            
            return (
              <motion.div
                key={impact.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className={`relative border-2 rounded-xl p-5 cursor-pointer transition-all ${
                  isSelected
                    ? 'border-green-500 bg-gradient-to-r from-green-50 to-teal-50 dark:from-green-900/20 dark:to-teal-900/20 shadow-lg'
                    : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-green-300 dark:hover:border-green-600 hover:shadow-md'
                }`}
                onClick={() => handleSelectImpact(impact)}
              >
                <div className="flex items-start gap-4">
                  <div className={`mt-1 p-3 rounded-lg transition-colors ${
                    isSelected 
                      ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400' 
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500'
                  }`}>
                    <IconComponent className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-semibold text-gray-900 dark:text-gray-100">
                        {impact.audience}
                      </h4>
                      <span className="text-gray-400 dark:text-gray-500">→</span>
                      <span className="font-medium text-gray-700 dark:text-gray-300">
                        {impact.method}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {impact.description}
                    </p>
                    
                    {impact.examples && impact.examples.length > 0 && (
                      <div className="mt-3 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                        <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">
                          Example Activities:
                        </p>
                        <ul className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
                          {impact.examples.map((example, idx) => (
                            <li key={idx} className="flex items-start gap-2">
                              <span className="text-green-500 dark:text-green-400 mt-0.5">•</span>
                              <span>{example}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                  
                  {/* Selection Indicator */}
                  <div className={`flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                    isSelected 
                      ? 'bg-green-500 border-green-500' 
                      : 'border-gray-300 dark:border-gray-600'
                  }`}>
                    {isSelected && <CheckCircle2 className="w-4 h-4 text-white" />}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Custom Impact Form */}
      {showCustomForm ? (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="p-5 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl border-2 border-dashed border-blue-300 dark:border-blue-700"
        >
          <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-4">
            Create Custom Impact Method
          </h4>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Target Audience
              </label>
              <input
                type="text"
                placeholder="e.g., Local Community, School Board, Industry Experts"
                value={customImpact.audience}
                onChange={(e) => setCustomImpact({ ...customImpact, audience: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Sharing Method
              </label>
              <input
                type="text"
                placeholder="e.g., Public Exhibition, Website, Live Presentation"
                value={customImpact.method}
                onChange={(e) => setCustomImpact({ ...customImpact, method: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Description (Optional)
              </label>
              <textarea
                placeholder="Describe how this will create authentic impact..."
                value={customImpact.description}
                onChange={(e) => setCustomImpact({ ...customImpact, description: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={2}
              />
            </div>
            <div className="flex gap-2 pt-2">
              <Button
                onClick={handleAddCustomImpact}
                variant="primary"
                disabled={!customImpact.audience.trim() || !customImpact.method.trim()}
              >
                Add Custom Impact
              </Button>
              <Button
                onClick={() => {
                  setShowCustomForm(false);
                  setCustomImpact({ audience: '', method: '', description: '' });
                }}
                variant="ghost"
              >
                Cancel
              </Button>
            </div>
          </div>
        </motion.div>
      ) : (
        <button
          onClick={() => setShowCustomForm(true)}
          className="w-full p-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl text-gray-500 dark:text-gray-400 hover:border-green-400 dark:hover:border-green-500 hover:text-green-600 dark:hover:text-green-400 transition-colors flex items-center justify-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Create Custom Impact Method
        </button>
      )}

      {/* Action Buttons */}
      <div className="flex gap-3">
        <Button
          onClick={handleConfirm}
          disabled={!canContinue}
          variant="primary"
          className="flex-1"
        >
          <CheckCircle2 className="w-4 h-4 mr-2" />
          Confirm Impact Method
        </Button>
        
        <Button
          onClick={onRequestNewSuggestions}
          variant="ghost"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Different Suggestions
        </Button>
      </div>

      {/* Helper Text */}
      <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
        <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
          💡 Tip: Authentic audiences make learning meaningful. Choose an audience that connects to your students' community and interests.
        </p>
      </div>
    </div>
  );
});