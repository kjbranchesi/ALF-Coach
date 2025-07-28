// ConsistencyDialog.jsx - Dialog for handling consistency checks

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const Icons = {
  Alert: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10"/>
      <line x1="12" y1="8" x2="12" y2="12"/>
      <line x1="12" y1="16" x2="12.01" y2="16"/>
    </svg>
  ),
  Check: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
      <polyline points="20 6 9 17 4 12"/>
    </svg>
  ),
  Refresh: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="23 4 23 10 17 10"/>
      <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
    </svg>
  )
};

const ConsistencyDialog = ({ 
  isOpen, 
  inconsistencies, 
  onApply, 
  onCancel, 
  onAutoUpdate 
}) => {
  if (!isOpen) {return null;}

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onCancel}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ type: "spring", damping: 20, stiffness: 300 }}
          className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-start gap-3 mb-6">
            <div className="p-2 bg-amber-100 rounded-lg text-amber-600">
              <Icons.Alert />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                Consistency Check Required
              </h2>
              <p className="text-gray-600 mt-1">
                Your changes may affect other parts of the blueprint
              </p>
            </div>
          </div>

          {/* Inconsistencies List */}
          <div className="space-y-3 mb-6">
            {inconsistencies.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-gray-50 rounded-lg p-4"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">
                      {item.field.charAt(0).toUpperCase() + item.field.slice(1)}
                    </h4>
                    <p className="text-sm text-gray-600 mt-1">
                      {item.reason}
                    </p>
                    <p className="text-sm text-blue-600 mt-2">
                      Suggestion: {item.suggestion}
                    </p>
                  </div>
                  {onAutoUpdate && (
                    <button
                      onClick={() => onAutoUpdate(item)}
                      className="ml-3 p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Auto-update this field"
                    >
                      <Icons.Refresh />
                    </button>
                  )}
                </div>
              </motion.div>
            ))}
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3">
            <button
              onClick={onCancel}
              className="px-4 py-2 text-gray-700 hover:text-gray-900 font-medium"
            >
              Cancel Changes
            </button>
            <button
              onClick={onApply}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium
                       hover:bg-blue-700 transition-colors shadow-md hover:shadow-lg
                       flex items-center gap-2"
            >
              <Icons.Check />
              Apply Anyway
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ConsistencyDialog;