import React, { useState, useMemo, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Globe, Building, Heart, Megaphone, Share2, CheckCircle2, Plus } from 'lucide-react';
import { Button } from '../../ui/Button';
import { generateSecureId } from '../../../core/utils/idGeneration';
import { validateAndSanitizeInput } from '../../../core/utils/inputSanitization';

interface ImpactOption {
  id: string;
  audience: string;
  method: string;
  description: string;
  icon: 'users' | 'globe' | 'building' | 'heart' | 'megaphone' | 'share2';
  examples?: string[];
}

interface ImpactDesignerProps {
  suggestedImpacts: ImpactOption[];
  onImpactConfirmed: (impact: { audience: string; method: string }) => void;
  onRequestNewSuggestions: () => void;
}

const iconMap = {
  users: Users,
  globe: Globe,
  building: Building,
  heart: Heart,
  megaphone: Megaphone,
  share2: Share2
};

export const ImpactDesigner: React.FC<ImpactDesignerProps> = ({
  suggestedImpacts,
  onImpactConfirmed,
  onRequestNewSuggestions
}) => {
  const [selectedImpact, setSelectedImpact] = useState<string | null>(null);
  const [customImpact, setCustomImpact] = useState({ audience: '', method: '' });
  const [showCustomForm, setShowCustomForm] = useState(false);
  const [localImpacts, setLocalImpacts] = useState(suggestedImpacts);

  const handleSelectImpact = (impact: ImpactOption) => {
    setSelectedImpact(impact.id);
    setShowCustomForm(false);
  };

  const handleAddCustomImpact = () => {
    // Validate and sanitize inputs
    const audienceValidation = validateAndSanitizeInput(customImpact.audience, { maxLength: 100, required: true });
    const methodValidation = validateAndSanitizeInput(customImpact.method, { maxLength: 100, required: true });
    
    if (audienceValidation.isValid && methodValidation.isValid) {
      const newImpact: ImpactOption = {
        id: generateSecureId('impact'),
        audience: audienceValidation.sanitizedValue,
        method: methodValidation.sanitizedValue,
        description: `Share with ${audienceValidation.sanitizedValue} through ${methodValidation.sanitizedValue}`,
        icon: 'share2'
      };
      setLocalImpacts([...localImpacts, newImpact]);
      setSelectedImpact(newImpact.id);
      setCustomImpact({ audience: '', method: '' });
      setShowCustomForm(false);
    }
  };

  const handleConfirm = () => {
    const selected = localImpacts.find(i => i.id === selectedImpact);
    if (selected) {
      onImpactConfirmed({ audience: selected.audience, method: selected.method });
    }
  };

  const canContinue = selectedImpact !== null;

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-green-50 to-teal-50 rounded-xl p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-white rounded-lg shadow-sm">
            <Globe className="w-5 h-5 text-green-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Real-World Impact</h3>
            <p className="text-sm text-gray-600">
              Choose how students will share their work with an authentic audience
            </p>
          </div>
        </div>

        <div className="grid gap-3">
          <AnimatePresence mode="popLayout">
            {localImpacts.map((impact) => {
              const isSelected = selectedImpact === impact.id;
              const IconComponent = iconMap[impact.icon];
              
              return (
                <motion.div
                  key={impact.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className={`relative border-2 rounded-lg p-4 cursor-pointer transition-all ${
                    isSelected
                      ? 'border-green-500 bg-green-50 shadow-lg'
                      : 'border-gray-200 bg-white hover:border-green-300 hover:shadow-md'
                  }`}
                  onClick={() => handleSelectImpact(impact)}
                >
                  <div className="flex items-start gap-3">
                    <div className={`mt-1 p-2 rounded-lg transition-colors ${
                      isSelected ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'
                    }`}>
                      <IconComponent className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">
                        {impact.audience} → {impact.method}
                      </h4>
                      <p className="mt-1 text-sm text-gray-600">{impact.description}</p>
                      
                      {impact.examples && impact.examples.length > 0 && (
                        <div className="mt-3 space-y-1">
                          <p className="text-xs font-medium text-gray-500">Examples:</p>
                          <ul className="text-xs text-gray-600 space-y-0.5">
                            {impact.examples.map((example, idx) => (
                              <li key={idx} className="flex items-start gap-1">
                                <span className="text-green-500 mt-0.5">•</span>
                                <span>{example}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {isSelected && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute -top-2 -right-2 w-6 h-6 bg-green-600 rounded-full flex items-center justify-center"
                    >
                      <CheckCircle2 className="w-4 h-4 text-white" />
                    </motion.div>
                  )}
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        {showCustomForm ? (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-4 p-4 bg-white rounded-lg border-2 border-dashed border-green-300"
          >
            <div className="space-y-3">
              <input
                type="text"
                placeholder="Target audience (e.g., 'Local Community', 'School Board')"
                value={customImpact.audience}
                onChange={(e) => setCustomImpact({ ...customImpact, audience: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
              <input
                type="text"
                placeholder="Sharing method (e.g., 'Public Exhibition', 'Website')"
                value={customImpact.method}
                onChange={(e) => setCustomImpact({ ...customImpact, method: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
              <div className="flex gap-2">
                <Button
                  onClick={handleAddCustomImpact}
                  disabled={!customImpact.audience || !customImpact.method}
                  className="flex-1"
                >
                  Add Impact Method
                </Button>
                <Button
                  onClick={() => {
                    setShowCustomForm(false);
                    setCustomImpact({ audience: '', method: '' });
                  }}
                  variant="secondary"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </motion.div>
        ) : (
          <button
            onClick={() => setShowCustomForm(true)}
            className="mt-4 w-full p-3 border-2 border-dashed border-green-300 rounded-lg text-green-600 hover:bg-green-50 transition-colors flex items-center justify-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Create Custom Impact Method
          </button>
        )}
      </div>

      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-600">
          {selectedImpact ? '✓ Impact method selected' : 'Select an impact method to continue'}
        </div>
        <div className="flex gap-3">
          <Button
            onClick={onRequestNewSuggestions}
            variant="secondary"
          >
            Get New Suggestions
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={!canContinue}
            className="min-w-[120px]"
          >
            Continue
          </Button>
        </div>
      </div>
    </div>
  );
};