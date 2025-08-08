/**
 * ResourceSelector.tsx - Multi-select resource builder for Journey stage
 * Replaces single-select suggestion cards for resource selection
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X, BookOpen, RefreshCw, Check, Link, Users, Package } from 'lucide-react';
import { Button } from '../../ui/Button';

interface Resource {
  id: string;
  title: string;
  description: string;
  type?: 'digital' | 'physical' | 'human' | 'location';
  required?: boolean;
}

interface ResourceSelectorProps {
  suggestedResources: Resource[];
  onResourcesConfirmed: (resources: Resource[]) => void;
  onRequestNewSuggestions: () => void;
  minResources?: number;
  maxResources?: number;
}

export const ResourceSelector: React.FC<ResourceSelectorProps> = ({
  suggestedResources,
  onResourcesConfirmed,
  onRequestNewSuggestions,
  minResources = 1,
  maxResources = 10
}) => {
  const [selectedResources, setSelectedResources] = useState<Resource[]>([]);
  const [availableSuggestions, setAvailableSuggestions] = useState(suggestedResources);
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const addResource = (resource: Resource) => {
    if (selectedResources.length >= maxResources) {
      setErrorMessage(`Maximum ${maxResources} resources allowed`);
      setShowError(true);
      setTimeout(() => setShowError(false), 3000);
      return;
    }

    setSelectedResources(prev => [...prev, resource]);
    // Remove from available suggestions
    setAvailableSuggestions(prev => prev.filter(r => r.id !== resource.id));
  };

  const removeResource = (resourceId: string) => {
    const removedResource = selectedResources.find(r => r.id === resourceId);
    if (removedResource) {
      setSelectedResources(prev => prev.filter(r => r.id !== resourceId));
      // Add back to available suggestions if it was from suggestions
      if (suggestedResources.find(r => r.id === resourceId)) {
        setAvailableSuggestions(prev => [...prev, removedResource]);
      }
    }
  };

  const addCustomResource = () => {
    const title = prompt('Enter resource name:');
    if (title && title.trim()) {
      const customResource: Resource = {
        id: `custom-${Date.now()}`,
        title: title.trim(),
        description: 'Custom resource',
        type: 'physical'
      };
      addResource(customResource);
    }
  };

  const confirmResources = () => {
    if (selectedResources.length < minResources) {
      setErrorMessage(`Please select at least ${minResources} resource${minResources > 1 ? 's' : ''}`);
      setShowError(true);
      setTimeout(() => setShowError(false), 3000);
      return;
    }

    onResourcesConfirmed(selectedResources);
  };

  const getNewSuggestions = () => {
    // Keep selected resources, get new suggestions
    onRequestNewSuggestions();
  };

  const canContinue = selectedResources.length >= minResources;

  const getResourceIcon = (type?: string) => {
    switch (type) {
      case 'digital': return <Link className="w-4 h-4" />;
      case 'human': return <Users className="w-4 h-4" />;
      case 'location': return '📍';
      case 'physical': return <Package className="w-4 h-4" />;
      default: return <BookOpen className="w-4 h-4" />;
    }
  };

  const getResourceColor = (type?: string) => {
    switch (type) {
      case 'digital': return 'blue';
      case 'human': return 'green';
      case 'location': return 'purple';
      case 'physical': return 'orange';
      default: return 'gray';
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="text-center mb-6">
        <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          Gather Your Resources
        </h3>
        <p className="text-gray-600 dark:text-gray-400">
          Select materials, tools, and support needed for your project (minimum {minResources})
        </p>
      </div>

      {/* Error Message */}
      <AnimatePresence>
        {showError && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-400 text-sm text-center"
          >
            {errorMessage}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Left: Selected Resources */}
        <div className="space-y-4">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-semibold text-gray-900 dark:text-gray-100">
              Your Resources ({selectedResources.length})
            </h4>
            <button
              onClick={addCustomResource}
              className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 flex items-center gap-1"
            >
              <Plus className="w-3 h-3" />
              Add Custom
            </button>
          </div>

          {selectedResources.length === 0 ? (
            <div className="p-8 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl text-center">
              <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-500 dark:text-gray-400">
                No resources selected yet
              </p>
              <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">
                Click suggestions or add custom resources
              </p>
            </div>
          ) : (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              <AnimatePresence>
                {selectedResources.map((resource, index) => (
                  <motion.div
                    key={resource.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className={`p-4 bg-${getResourceColor(resource.type)}-50 dark:bg-${getResourceColor(resource.type)}-900/20 border border-${getResourceColor(resource.type)}-200 dark:border-${getResourceColor(resource.type)}-800 rounded-lg`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          {getResourceIcon(resource.type)}
                          <span className="font-medium text-gray-900 dark:text-gray-100">
                            {resource.title}
                          </span>
                          {resource.required && (
                            <span className="text-xs bg-red-100 dark:bg-red-900/50 text-red-600 dark:text-red-400 px-2 py-0.5 rounded">
                              Required
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 ml-6">
                          {resource.description}
                        </p>
                      </div>
                      <button
                        onClick={() => removeResource(resource.id)}
                        className="p-1 hover:bg-red-100 dark:hover:bg-red-900/20 rounded transition-colors"
                        aria-label="Remove resource"
                      >
                        <X className="w-4 h-4 text-red-500" />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}

          {/* Continue Button */}
          {selectedResources.length > 0 && (
            <Button
              onClick={confirmResources}
              disabled={!canContinue}
              variant="primary"
              className="w-full"
            >
              <Check className="w-4 h-4 mr-2" />
              Continue with {selectedResources.length} Resource{selectedResources.length !== 1 ? 's' : ''}
            </Button>
          )}
        </div>

        {/* Right: Available Suggestions */}
        <div className="space-y-4">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-blue-500" />
              Suggested Resources
            </h4>
            <button
              onClick={getNewSuggestions}
              className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 flex items-center gap-1"
            >
              <RefreshCw className="w-3 h-3" />
              Refresh
            </button>
          </div>

          {availableSuggestions.length === 0 ? (
            <div className="p-6 bg-gray-50 dark:bg-gray-800 rounded-lg text-center">
              <p className="text-gray-500 dark:text-gray-400 mb-3">
                All suggestions added!
              </p>
              <Button
                onClick={getNewSuggestions}
                variant="ghost"
                size="sm"
              >
                Get More Suggestions
              </Button>
            </div>
          ) : (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {availableSuggestions.map((resource) => (
                <motion.button
                  key={resource.id}
                  onClick={() => addResource(resource)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full p-4 text-left bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-blue-400 dark:hover:border-blue-500 hover:shadow-md transition-all"
                >
                  <div className="flex items-start gap-3">
                    <div className={`p-2 bg-${getResourceColor(resource.type)}-100 dark:bg-${getResourceColor(resource.type)}-900/20 rounded`}>
                      {getResourceIcon(resource.type)}
                    </div>
                    <div className="flex-1">
                      <h5 className="font-medium text-gray-900 dark:text-gray-100 mb-1">
                        {resource.title}
                      </h5>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {resource.description}
                      </p>
                    </div>
                  </div>
                </motion.button>
              ))}
            </div>
          )}

          {/* Resource Type Legend */}
          <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">Resource Types:</p>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="flex items-center gap-1">
                <Link className="w-3 h-3 text-blue-500" />
                <span>Digital/Online</span>
              </div>
              <div className="flex items-center gap-1">
                <Users className="w-3 h-3 text-green-500" />
                <span>Human/Expert</span>
              </div>
              <div className="flex items-center gap-1">
                <Package className="w-3 h-3 text-orange-500" />
                <span>Physical Materials</span>
              </div>
              <div className="flex items-center gap-1">
                <span>📍</span>
                <span>Locations</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Helper Text */}
      <div className="mt-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
        <p className="text-sm text-gray-700 dark:text-gray-300 text-center">
          💡 Tip: Mix different resource types for a rich learning experience. Consider what's realistically available and plan for alternatives.
        </p>
      </div>
    </div>
  );
};