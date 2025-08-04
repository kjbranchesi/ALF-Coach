// SearchBar.jsx - Search bar component for ALF Coach
// Follows ALF Design System specifications with soft shadows and blue primary color

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, Clock, TrendingUp, FileText, User, Settings } from 'lucide-react';
import { Icon } from '../design-system';

const SearchBar = ({ 
  className = '',
  placeholder = 'Search blueprints, resources, and more...',
  onSearch,
  onClear,
  showSuggestions = true,
  autoFocus = false,
  size = 'md' // sm, md, lg
}) => {
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const inputRef = useRef(null);
  const containerRef = useRef(null);

  // Sample search suggestions and recent searches
  const recentSearches = [
    'Math lesson blueprints',
    'Science experiments',
    'Reading comprehension activities'
  ];

  const trendingSearches = [
    'Interactive worksheets',
    'Assessment rubrics',
    'Group activities',
    'Differentiated instruction'
  ];

  const quickActions = [
    { icon: FileText, label: 'Create New Blueprint', action: 'create-blueprint' },
    { icon: User, label: 'View Profile', action: 'profile' },
    { icon: Settings, label: 'Settings', action: 'settings' }
  ];

  // Size configurations
  const sizeConfig = {
    sm: {
      container: 'h-10',
      input: 'text-sm px-3 py-2',
      icon: 'w-4 h-4',
      button: 'p-2'
    },
    md: {
      container: 'h-12',
      input: 'text-sm px-4 py-3',
      icon: 'w-5 h-5',
      button: 'p-2.5'
    },
    lg: {
      container: 'h-14',
      input: 'text-base px-5 py-4',
      icon: 'w-6 h-6',
      button: 'p-3'
    }
  };

  const config = sizeConfig[size];

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setShowDropdown(false);
        setIsFocused(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Auto focus if requested
  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus();
    }
  }, [autoFocus]);

  const handleInputChange = (e) => {
    const value = e.target.value;
    setQuery(value);
    setShowDropdown(value.length > 0 || isFocused);
  };

  const handleFocus = () => {
    setIsFocused(true);
    setShowDropdown(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim() && onSearch) {
      onSearch(query.trim());
      setShowDropdown(false);
      inputRef.current?.blur();
    }
  };

  const handleClear = () => {
    setQuery('');
    setShowDropdown(false);
    if (onClear) {
      onClear();
    }
    inputRef.current?.focus();
  };

  const handleSuggestionClick = (suggestion) => {
    setQuery(suggestion);
    if (onSearch) {
      onSearch(suggestion);
    }
    setShowDropdown(false);
    inputRef.current?.blur();
  };

  const handleQuickAction = (action) => {
    // Handle quick actions
    console.log('Quick action:', action);
    setShowDropdown(false);
    inputRef.current?.blur();
  };

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      {/* Search Input */}
      <form onSubmit={handleSubmit} className="relative">
        <div className={`
          relative flex items-center ${config.container} bg-white rounded-xl border border-gray-200 
          shadow-md hover:shadow-lg transition-all duration-200 group
          ${isFocused ? 'ring-2 ring-blue-500 ring-opacity-50 border-blue-300' : ''}
        `}>
          {/* Search Icon */}
          <div className="flex-shrink-0 pl-4">
            <Search className={`${config.icon} text-gray-400 group-hover:text-blue-500 transition-colors`} />
          </div>
          
          {/* Input Field */}
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={handleInputChange}
            onFocus={handleFocus}
            placeholder={placeholder}
            className={`
              flex-1 ${config.input} pr-12 bg-transparent border-none outline-none
              placeholder-gray-400 text-gray-900
            `}
          />
          
          {/* Clear Button */}
          {query && (
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              type="button"
              onClick={handleClear}
              className={`
                absolute right-2 ${config.button} rounded-lg hover:bg-gray-100 
                transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50
              `}
            >
              <X className={`${config.icon} text-gray-400 hover:text-gray-600`} />
            </motion.button>
          )}
        </div>
      </form>

      {/* Search Dropdown */}
      <AnimatePresence>
        {showSuggestions && showDropdown && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl border border-gray-200 shadow-lg z-50 overflow-hidden"
          >
            <div className="max-h-96 overflow-y-auto">
              {/* Search Results or Suggestions */}
              {query.length > 0 ? (
                <div className="py-2">
                  <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Search Results
                  </div>
                  {/* In real implementation, show actual search results */}
                  <button
                    onClick={() => handleSuggestionClick(query)}
                    className="w-full px-4 py-2.5 text-left hover:bg-blue-50 transition-colors flex items-center gap-3"
                  >
                    <Search className="w-4 h-4 text-blue-500" />
                    <span className="text-sm text-gray-900">Search for "{query}"</span>
                  </button>
                </div>
              ) : (
                <>
                  {/* Quick Actions */}
                  <div className="py-2">
                    <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                      Quick Actions
                    </div>
                    {quickActions.map((action) => {
                      const IconComponent = action.icon;
                      return (
                        <button
                          key={action.action}
                          onClick={() => handleQuickAction(action.action)}
                          className="w-full px-4 py-2.5 text-left hover:bg-gray-50 transition-colors flex items-center gap-3"
                        >
                          <IconComponent className="w-4 h-4 text-gray-500" />
                          <span className="text-sm text-gray-700">{action.label}</span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Recent Searches */}
                  {recentSearches.length > 0 && (
                    <div className="py-2 border-t border-gray-100">
                      <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        Recent
                      </div>
                      {recentSearches.map((search, index) => (
                        <button
                          key={index}
                          onClick={() => handleSuggestionClick(search)}
                          className="w-full px-4 py-2.5 text-left hover:bg-gray-50 transition-colors flex items-center gap-3"
                        >
                          <Clock className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-700">{search}</span>
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Trending Searches */}
                  {trendingSearches.length > 0 && (
                    <div className="py-2 border-t border-gray-100">
                      <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide flex items-center gap-1">
                        <TrendingUp className="w-3 h-3" />
                        Trending
                      </div>
                      {trendingSearches.map((search, index) => (
                        <button
                          key={index}
                          onClick={() => handleSuggestionClick(search)}
                          className="w-full px-4 py-2.5 text-left hover:bg-gray-50 transition-colors flex items-center gap-3"
                        >
                          <TrendingUp className="w-4 h-4 text-green-500" />
                          <span className="text-sm text-gray-700">{search}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SearchBar;