/**
 * EnhancedSuggestionCards.tsx - Flexible suggestion system with partial acceptance
 * Features: Individual item selection, inline editing, and mix-and-match capabilities
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Check, 
  X, 
  Edit2, 
  Plus, 
  Shuffle, 
  ChevronRight,
  Sparkles,
  Lightbulb,
  HelpCircle,
  Target,
  Copy,
  RefreshCw
} from 'lucide-react';

interface SuggestionItem {
  id: string;
  text: string;
  type: 'objective' | 'activity' | 'assessment' | 'milestone' | 'resource';
  selected: boolean;
  edited?: boolean;
  originalText?: string;
}

interface EnhancedSuggestionCard {
  id: string;
  category: 'idea' | 'whatif' | 'template' | 'custom';
  title: string;
  description?: string;
  items: SuggestionItem[];
  allowPartialSelection: boolean;
  editable: boolean;
}

interface EnhancedSuggestionCardsProps {
  suggestions: EnhancedSuggestionCard[];
  onAccept: (suggestions: EnhancedSuggestionCard[]) => void;
  onRegenerate?: (cardId: string) => void;
  onRequestMore?: () => void;
  disabled?: boolean;
  context?: {
    stage: 'ideation' | 'journey' | 'deliverables';
    projectType?: string;
    gradeLevel?: string;
  };
}

export const EnhancedSuggestionCards: React.FC<EnhancedSuggestionCardsProps> = ({ 
  suggestions: initialSuggestions, 
  onAccept,
  onRegenerate,
  onRequestMore,
  disabled = false,
  context
}) => {
  const [suggestions, setSuggestions] = useState(initialSuggestions);
  const [editingItem, setEditingItem] = useState<string | null>(null);
  const [editText, setEditText] = useState('');
  const [showActions, setShowActions] = useState<string | null>(null);

  // Toggle item selection within a card
  const toggleItemSelection = (cardId: string, itemId: string) => {
    setSuggestions(prev => prev.map(card => {
      if (card.id === cardId) {
        return {
          ...card,
          items: card.items.map(item => 
            item.id === itemId ? { ...item, selected: !item.selected } : item
          )
        };
      }
      return card;
    }));
  };

  // Select/deselect all items in a card
  const toggleAllItems = (cardId: string, selectAll: boolean) => {
    setSuggestions(prev => prev.map(card => {
      if (card.id === cardId) {
        return {
          ...card,
          items: card.items.map(item => ({ ...item, selected: selectAll }))
        };
      }
      return card;
    }));
  };

  // Start editing an item
  const startEditing = (itemId: string, currentText: string) => {
    setEditingItem(itemId);
    setEditText(currentText);
  };

  // Save edited item
  const saveEdit = (cardId: string, itemId: string) => {
    setSuggestions(prev => prev.map(card => {
      if (card.id === cardId) {
        return {
          ...card,
          items: card.items.map(item => {
            if (item.id === itemId) {
              return {
                ...item,
                text: editText,
                edited: true,
                originalText: item.originalText || item.text
              };
            }
            return item;
          })
        };
      }
      return card;
    }));
    setEditingItem(null);
    setEditText('');
  };

  // Cancel editing
  const cancelEdit = () => {
    setEditingItem(null);
    setEditText('');
  };

  // Mix suggestions from different cards
  const mixSuggestions = () => {
    const selectedItems: SuggestionItem[] = [];
    suggestions.forEach(card => {
      card.items.filter(item => item.selected).forEach(item => {
        selectedItems.push({ ...item, id: `mixed-${item.id}` });
      });
    });

    if (selectedItems.length > 0) {
      const mixedCard: EnhancedSuggestionCard = {
        id: 'mixed-' + Date.now(),
        category: 'custom',
        title: 'Your Custom Selection',
        description: 'Mixed from multiple suggestions',
        items: selectedItems,
        allowPartialSelection: true,
        editable: true
      };
      setSuggestions(prev => [mixedCard, ...prev]);
    }
  };

  // Accept selected suggestions
  const handleAccept = () => {
    const acceptedSuggestions = suggestions.map(card => ({
      ...card,
      items: card.items.filter(item => item.selected)
    })).filter(card => card.items.length > 0);
    
    onAccept(acceptedSuggestions);
  };

  // Get icon for category
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'idea': return Lightbulb;
      case 'whatif': return HelpCircle;
      case 'template': return Copy;
      case 'custom': return Shuffle;
      default: return Target;
    }
  };

  // Get category styles
  const getCategoryStyle = (category: string) => {
    switch (category) {
      case 'idea':
        return {
          gradient: 'from-blue-400 to-blue-500',
          bgLight: 'bg-blue-50 dark:bg-blue-900/20',
          borderColor: 'border-blue-200 dark:border-blue-800',
          iconColor: 'text-blue-600 dark:text-blue-400'
        };
      case 'whatif':
        return {
          gradient: 'from-purple-400 to-purple-500',
          bgLight: 'bg-purple-50 dark:bg-purple-900/20',
          borderColor: 'border-purple-200 dark:border-purple-800',
          iconColor: 'text-purple-600 dark:text-purple-400'
        };
      case 'template':
        return {
          gradient: 'from-green-400 to-green-500',
          bgLight: 'bg-green-50 dark:bg-green-900/20',
          borderColor: 'border-green-200 dark:border-green-800',
          iconColor: 'text-green-600 dark:text-green-400'
        };
      case 'custom':
        return {
          gradient: 'from-amber-400 to-amber-500',
          bgLight: 'bg-amber-50 dark:bg-amber-900/20',
          borderColor: 'border-amber-200 dark:border-amber-800',
          iconColor: 'text-amber-600 dark:text-amber-400'
        };
      default:
        return {
          gradient: 'from-gray-400 to-gray-500',
          bgLight: 'bg-gray-50 dark:bg-gray-900/20',  
          borderColor: 'border-gray-200 dark:border-gray-700',
          iconColor: 'text-gray-600 dark:text-gray-400'
        };
    }
  };

  // Count selected items
  const totalSelected = suggestions.reduce((acc, card) => 
    acc + card.items.filter(item => item.selected).length, 0
  );

  if (!suggestions || suggestions.length === 0) return null;

  return (
    <div className="px-4 py-3">
      <div className="max-w-4xl mx-auto">
        {/* Header with actions */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-blue-500 dark:text-blue-400" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Suggestions for your {context?.stage || 'project'}
            </span>
          </div>
          
          {/* Action buttons */}
          <div className="flex items-center gap-2">
            {totalSelected > 0 && (
              <span className="text-xs text-gray-500 dark:text-gray-400 mr-2">
                {totalSelected} selected
              </span>
            )}
            
            {totalSelected > 1 && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={mixSuggestions}
                className="p-2 text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/20 rounded-lg transition-colors"
                title="Mix selected suggestions"
              >
                <Shuffle className="w-4 h-4" />
              </motion.button>
            )}
            
            {onRequestMore && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onRequestMore}
                className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                title="Generate more suggestions"
              >
                <Plus className="w-4 h-4" />
              </motion.button>
            )}
          </div>
        </div>

        {/* Suggestion cards */}
        <div className="space-y-4">
          {suggestions.map((card, cardIndex) => {
            const style = getCategoryStyle(card.category);
            const IconComponent = getCategoryIcon(card.category);
            const selectedCount = card.items.filter(item => item.selected).length;
            const allSelected = selectedCount === card.items.length;
            const someSelected = selectedCount > 0 && selectedCount < card.items.length;
            
            return (
              <motion.div
                key={card.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: cardIndex * 0.05 }}
                className={`
                  relative overflow-hidden
                  bg-white dark:bg-gray-800
                  border-2 ${style.borderColor}
                  rounded-2xl
                  shadow-xl hover:shadow-2xl
                  transition-all duration-200
                  ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
                `}
                onMouseEnter={() => setShowActions(card.id)}
                onMouseLeave={() => setShowActions(null)}
              >
                {/* Card header */}
                <div className="p-4 border-b border-gray-100 dark:border-gray-700">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-lg ${style.bgLight}`}>
                        <IconComponent className={`w-5 h-5 ${style.iconColor}`} />
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900 dark:text-gray-100">
                          {card.title}
                        </h3>
                        {card.description && (
                          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                            {card.description}
                          </p>
                        )}
                      </div>
                    </div>
                    
                    {/* Card actions */}
                    <AnimatePresence>
                      {showActions === card.id && (
                        <motion.div
                          initial={{ opacity: 0, x: 10 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 10 }}
                          className="flex items-center gap-1"
                        >
                          {card.allowPartialSelection && (
                            <>
                              <button
                                onClick={() => toggleAllItems(card.id, true)}
                                className="p-1.5 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors"
                                title="Select all"
                              >
                                <Check className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => toggleAllItems(card.id, false)}
                                className="p-1.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                title="Deselect all"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </>
                          )}
                          {onRegenerate && (
                            <button
                              onClick={() => onRegenerate(card.id)}
                              className="p-1.5 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                              title="Regenerate suggestions"
                            >
                              <RefreshCw className="w-4 h-4" />
                            </button>
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                  
                  {/* Selection indicator */}
                  {card.allowPartialSelection && (
                    <div className="mt-2">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-1 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                          <motion.div
                            className="h-full bg-blue-500"
                            initial={{ width: 0 }}
                            animate={{ width: `${(selectedCount / card.items.length) * 100}%` }}
                            transition={{ duration: 0.3 }}
                          />
                        </div>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {selectedCount}/{card.items.length}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Card items */}
                <div className="p-4 space-y-2">
                  {card.items.map((item, itemIndex) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: cardIndex * 0.05 + itemIndex * 0.02 }}
                      className={`
                        flex items-start gap-3 p-3 rounded-lg
                        ${item.selected ? 'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800' : 'hover:bg-gray-50 dark:hover:bg-gray-900/50'}
                        transition-all duration-200
                      `}
                    >
                      {/* Selection checkbox */}
                      {card.allowPartialSelection && (
                        <button
                          onClick={() => toggleItemSelection(card.id, item.id)}
                          className="flex-shrink-0 mt-0.5"
                        >
                          <motion.div
                            className={`
                              w-5 h-5 rounded border-2 flex items-center justify-center
                              ${item.selected 
                                ? 'bg-blue-500 border-blue-500' 
                                : 'border-gray-300 dark:border-gray-600 hover:border-blue-400'
                              }
                              transition-colors duration-200
                            `}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                          >
                            {item.selected && (
                              <Check className="w-3 h-3 text-white" />
                            )}
                          </motion.div>
                        </button>
                      )}

                      {/* Item content */}
                      <div className="flex-1">
                        {editingItem === item.id ? (
                          <div className="flex items-center gap-2">
                            <textarea
                              value={editText}
                              onChange={(e) => setEditText(e.target.value)}
                              className="flex-1 px-3 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                              rows={2}
                              autoFocus
                            />
                            <button
                              onClick={() => saveEdit(card.id, item.id)}
                              className="p-2 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                            <button
                              onClick={cancelEdit}
                              className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-start justify-between group">
                            <p className="text-sm text-gray-700 dark:text-gray-300 flex-1">
                              {item.text}
                              {item.edited && (
                                <span className="ml-2 text-xs text-amber-600 dark:text-amber-400">
                                  (edited)
                                </span>
                              )}
                            </p>
                            {card.editable && (
                              <button
                                onClick={() => startEditing(item.id, item.text)}
                                className="ml-2 p-1 opacity-0 group-hover:opacity-100 text-gray-500 hover:text-blue-600 transition-all duration-200"
                              >
                                <Edit2 className="w-3 h-3" />
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Action footer */}
        {totalSelected > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 flex items-center justify-between p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800"
          >
            <div className="flex items-center gap-2">
              <Check className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <span className="text-sm font-medium text-blue-900 dark:text-blue-100">
                {totalSelected} item{totalSelected !== 1 ? 's' : ''} selected
              </span>
            </div>
            <button
              onClick={handleAccept}
              disabled={disabled}
              className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="text-sm font-medium">Use Selected</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </motion.div>
        )}
        
        {/* Help text */}
        <div className="mt-4 text-center">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            💡 Tip: You can select individual items, edit them, or mix suggestions from different cards
          </p>
        </div>
      </div>
    </div>
  );
};