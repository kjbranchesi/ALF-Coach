import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, X } from 'lucide-react';

interface ContextualInitiatorProps {
  type: 'big-idea' | 'essential-question' | 'challenge' | 'phase-timeline';
  value: string | any;
  onConfirm: (value: any) => void;
  onDismiss: () => void;
  examples?: string[];
}

export const ContextualInitiator: React.FC<ContextualInitiatorProps> = ({
  type,
  value,
  onConfirm,
  onDismiss,
  examples
}) => {
  const [localValue, setLocalValue] = useState(value);
  const [isVisible, setIsVisible] = useState(true);

  // Auto-dismiss after 30 seconds of inactivity
  useEffect(() => {
    const timer = setTimeout(() => {
      handleDismiss();
    }, 30000);

    return () => clearTimeout(timer);
  }, [localValue]);

  const handleConfirm = () => {
    onConfirm(localValue);
    setIsVisible(false);
    setTimeout(onDismiss, 300);
  };

  const handleDismiss = () => {
    setIsVisible(false);
    setTimeout(onDismiss, 300);
  };

  const getTitle = () => {
    switch (type) {
      case 'big-idea':
        return 'Big Idea';
      case 'essential-question':
        return 'Essential Question';
      case 'challenge':
        return 'Student Challenge';
      case 'phase-timeline':
        return 'Creative Process Timeline';
      default:
        return '';
    }
  };

  const getPlaceholder = () => {
    switch (type) {
      case 'big-idea':
        return 'The main concept students will explore...';
      case 'essential-question':
        return 'An open-ended question that drives inquiry...';
      case 'challenge':
        return 'The authentic problem students will solve...';
      default:
        return '';
    }
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
          className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-2xl"
        >
          <div className="bg-white rounded-xl shadow-xl border border-gray-200 p-6">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                {getTitle()}
              </h3>
              <button
                onClick={handleDismiss}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {type === 'phase-timeline' ? (
              // Special layout for timeline
              <div className="space-y-3">
                <div className="grid grid-cols-4 gap-3">
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <div className="font-medium text-blue-900">Analyze</div>
                    <div className="text-sm text-blue-700 mt-1">Week 1</div>
                  </div>
                  <div className="bg-yellow-50 p-3 rounded-lg">
                    <div className="font-medium text-yellow-900">Brainstorm</div>
                    <div className="text-sm text-yellow-700 mt-1">Week 1-2</div>
                  </div>
                  <div className="bg-purple-50 p-3 rounded-lg">
                    <div className="font-medium text-purple-900">Prototype</div>
                    <div className="text-sm text-purple-700 mt-1">Week 2-3</div>
                  </div>
                  <div className="bg-green-50 p-3 rounded-lg">
                    <div className="font-medium text-green-900">Evaluate</div>
                    <div className="text-sm text-green-700 mt-1">Week 4</div>
                  </div>
                </div>
                <p className="text-sm text-gray-600">
                  Students will move through these phases, with flexibility for iteration
                </p>
              </div>
            ) : (
              // Standard text input layout
              <div className="space-y-3">
                <input
                  type="text"
                  value={localValue}
                  onChange={(e) => setLocalValue(e.target.value)}
                  placeholder={getPlaceholder()}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  autoFocus
                />
                
                {examples && examples.length > 0 && (
                  <div className="text-sm text-gray-600">
                    <span className="font-medium">Examples:</span>
                    <span className="ml-2">{examples.join(' | ')}</span>
                  </div>
                )}
              </div>
            )}

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={handleDismiss}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                Keep Chatting
              </button>
              <button
                onClick={handleConfirm}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                <Check className="w-4 h-4" />
                {type === 'phase-timeline' ? 'Looks Good' : 'Confirm'}
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};