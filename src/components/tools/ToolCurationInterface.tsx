/**
 * Tool Curation Interface Component
 * 
 * A comprehensive React component that provides an interface for educators
 * to discover, evaluate, and integrate interactive educational tools into
 * their ALF projects. Supports tool search, filtering, evaluation, and
 * integration guidance.
 */

import React, { useState, useEffect, useMemo } from 'react';
import {
  toolCurationService,
  EducationalTool,
  ToolCategory,
  Subject,
  SkillLevel,
  Platform,
  ToolSearchCriteria,
  IntegrationContext,
  IntegrationGuidance,
  ToolCollection,
  ALF_FRAMEWORK
} from '../../services/interactive-tool-curation-service';
import { SAMPLE_TOOLS, SAMPLE_TOOL_COLLECTIONS } from '../../data/sample-tools';

interface ToolCurationInterfaceProps {
  alfStage?: keyof typeof ALF_FRAMEWORK.stages;
  projectContext?: {
    subject: Subject;
    gradeLevel: string;
    duration: string;
    classSize: number;
  };
  onToolSelect?: (tool: EducationalTool, guidance: IntegrationGuidance) => void;
}

export const ToolCurationInterface: React.FC<ToolCurationInterfaceProps> = ({
  alfStage,
  projectContext,
  onToolSelect
}) => {
  // State Management
  const [tools, setTools] = useState<EducationalTool[]>([]);
  const [collections, setCollections] = useState<ToolCollection[]>([]);
  const [searchCriteria, setSearchCriteria] = useState<ToolSearchCriteria>({});
  const [selectedTool, setSelectedTool] = useState<EducationalTool | null>(null);
  const [integrationGuidance, setIntegrationGuidance] = useState<IntegrationGuidance | null>(null);
  const [viewMode, setViewMode] = useState<'search' | 'collections' | 'tool-detail' | 'integration'>('search');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize sample data
  useEffect(() => {
    const initializeData = async () => {
      setLoading(true);
      try {
        // Add sample tools to the service
        for (const tool of SAMPLE_TOOLS) {
          await toolCurationService.addTool(tool);
        }
        
        // Add sample collections
        for (const collection of SAMPLE_TOOL_COLLECTIONS) {
          await toolCurationService.createToolCollection(collection);
        }
        
        // Load initial tools
        const initialTools = toolCurationService.searchTools({});
        setTools(initialTools);
        
        // Load collections
        setCollections(SAMPLE_TOOL_COLLECTIONS);
        
      } catch (err) {
        setError(`Failed to initialize tools: ${err}`);
      } finally {
        setLoading(false);
      }
    };
    
    initializeData();
  }, []);

  // Auto-filter by ALF stage if provided
  useEffect(() => {
    if (alfStage) {
      setSearchCriteria(prev => ({ ...prev, alfAlignment: 3 }));
    }
  }, [alfStage]);

  // Filtered and sorted tools
  const filteredTools = useMemo(() => {
    let filtered = toolCurationService.searchTools(searchCriteria);
    
    // Additional filtering by ALF stage if specified
    if (alfStage) {
      filtered = filtered.filter(tool => {
        const alignment = tool.alfStageAlignment[alfStage.toLowerCase() as keyof typeof tool.alfStageAlignment];
        return typeof alignment === 'object' && alignment.score >= 3;
      });
    }
    
    return filtered;
  }, [searchCriteria, alfStage, tools]);

  // Event Handlers
  const handleSearch = (criteria: Partial<ToolSearchCriteria>) => {
    setSearchCriteria(prev => ({ ...prev, ...criteria }));
  };

  const handleToolSelect = async (tool: EducationalTool) => {
    setSelectedTool(tool);
    setViewMode('tool-detail');
    
    // Generate integration guidance if project context is available
    if (projectContext) {
      try {
        const context: IntegrationContext = {
          platform: 'Standalone',
          userRole: 'teacher',
          technicalExpertise: 'intermediate',
          classSize: projectContext.classSize,
          duration: projectContext.duration,
          customization: 'moderate',
          assessmentNeeds: ['formative', 'authentic'],
          collaborationLevel: 'small_group'
        };
        
        const guidance = toolCurationService.getIntegrationGuidance(tool.id, context);
        setIntegrationGuidance(guidance);
      } catch (err) {
        console.error('Failed to generate integration guidance:', err);
      }
    }
  };

  const handleGetIntegrationGuidance = () => {
    if (selectedTool && integrationGuidance) {
      setViewMode('integration');
    }
  };

  const handleSelectForProject = () => {
    if (selectedTool && integrationGuidance && onToolSelect) {
      onToolSelect(selectedTool, integrationGuidance);
    }
  };

  const resetView = () => {
    setViewMode('search');
    setSelectedTool(null);
    setIntegrationGuidance(null);
  };

  // Render Loading State
  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Loading educational tools...</span>
      </div>
    );
  }

  // Render Error State
  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <h3 className="text-red-800 font-medium">Error Loading Tools</h3>
        <p className="text-red-600 text-sm mt-1">{error}</p>
        <button 
          onClick={() => window.location.reload()} 
          className="mt-2 px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border">
      {/* Header */}
      <div className="px-6 py-4 border-b">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Interactive Tool Curation</h2>
            <p className="text-sm text-gray-600 mt-1">
              Discover and integrate educational tools that align with ALF principles
              {alfStage && ` for the ${ALF_FRAMEWORK.stages[alfStage].name} stage`}
            </p>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => setViewMode('search')}
              className={`px-3 py-1 rounded text-sm ${
                viewMode === 'search' ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Search Tools
            </button>
            <button
              onClick={() => setViewMode('collections')}
              className={`px-3 py-1 rounded text-sm ${
                viewMode === 'collections' ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Collections
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {viewMode === 'search' && (
          <ToolSearchView
            searchCriteria={searchCriteria}
            tools={filteredTools}
            alfStage={alfStage}
            onSearch={handleSearch}
            onToolSelect={handleToolSelect}
          />
        )}

        {viewMode === 'collections' && (
          <ToolCollectionsView
            collections={collections}
            alfStage={alfStage}
            onToolSelect={handleToolSelect}
          />
        )}

        {viewMode === 'tool-detail' && selectedTool && (
          <ToolDetailView
            tool={selectedTool}
            integrationGuidance={integrationGuidance}
            onBack={resetView}
            onGetGuidance={handleGetIntegrationGuidance}
            onSelectForProject={handleSelectForProject}
          />
        )}

        {viewMode === 'integration' && selectedTool && integrationGuidance && (
          <IntegrationGuidanceView
            tool={selectedTool}
            guidance={integrationGuidance}
            onBack={() => setViewMode('tool-detail')}
            onSelectForProject={handleSelectForProject}
          />
        )}
      </div>
    </div>
  );
};

// Tool Search View Component
interface ToolSearchViewProps {
  searchCriteria: ToolSearchCriteria;
  tools: EducationalTool[];
  alfStage?: keyof typeof ALF_FRAMEWORK.stages;
  onSearch: (criteria: Partial<ToolSearchCriteria>) => void;
  onToolSelect: (tool: EducationalTool) => void;
}

const ToolSearchView: React.FC<ToolSearchViewProps> = ({
  searchCriteria,
  tools,
  alfStage,
  onSearch,
  onToolSelect
}) => {
  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <div className="bg-gray-50 rounded-lg p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Search Query */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Search Tools
            </label>
            <input
              type="text"
              placeholder="Search by name, description, or tags..."
              value={searchCriteria.query || ''}
              onChange={(e) => onSearch({ query: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-primary-500"
            />
          </div>

          {/* Category Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Category
            </label>
            <select
              value={searchCriteria.category || ''}
              onChange={(e) => onSearch({ category: e.target.value as ToolCategory || undefined })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-primary-500"
            >
              <option value="">All Categories</option>
              {Object.values(ToolCategory).map(category => (
                <option key={category} value={category}>
                  {category.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </option>
              ))}
            </select>
          </div>

          {/* Subject Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Subject
            </label>
            <select
              value={searchCriteria.subject || ''}
              onChange={(e) => onSearch({ subject: e.target.value as Subject || undefined })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-primary-500"
            >
              <option value="">All Subjects</option>
              {Object.values(Subject).map(subject => (
                <option key={subject} value={subject}>
                  {subject.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </option>
              ))}
            </select>
          </div>

          {/* Free Only Filter */}
          <div className="flex items-center">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={searchCriteria.freeOnly || false}
                onChange={(e) => onSearch({ freeOnly: e.target.checked })}
                className="rounded border-gray-300 text-primary-600 focus:ring-blue-500"
              />
              <span className="ml-2 text-sm text-gray-700">Free tools only</span>
            </label>
          </div>
        </div>
      </div>

      {/* ALF Stage Filter Info */}
      {alfStage && (
        <div className="bg-primary-50 border border-primary-200 rounded-lg p-4">
          <h3 className="text-primary-800 font-medium">
            {ALF_FRAMEWORK.stages[alfStage].name}
          </h3>
          <p className="text-primary-700 text-sm mt-1">
            {ALF_FRAMEWORK.stages[alfStage].purpose}
          </p>
          <p className="text-primary-600 text-xs mt-2">
            Tools shown are filtered for strong alignment with this ALF stage.
          </p>
        </div>
      )}

      {/* Results */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900">
            {tools.length} Tool{tools.length !== 1 ? 's' : ''} Found
          </h3>
        </div>

        {tools.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">No tools match your search criteria.</p>
            <button
              onClick={() => onSearch({})}
              className="mt-2 text-primary-600 hover:text-primary-700 text-sm"
            >
              Clear filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {tools.map(tool => (
              <ToolCard key={tool.id} tool={tool} onSelect={() => onToolSelect(tool)} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// Tool Card Component
interface ToolCardProps {
  tool: EducationalTool;
  onSelect: () => void;
}

const ToolCard: React.FC<ToolCardProps> = ({ tool, onSelect }) => {
  const averageRating = tool.ratings?.length
    ? tool.ratings.reduce((sum, r) => sum + r.rating, 0) / tool.ratings.length
    : 0;

  const getCategoryColor = (category: ToolCategory): string => {
    const colors: Record<ToolCategory, string> = {
      [ToolCategory.STEM_SIMULATION]: 'bg-green-100 text-green-800',
      [ToolCategory.CODING_ENVIRONMENT]: 'bg-primary-100 text-primary-800',
      [ToolCategory.DESIGN_TOOL]: 'bg-purple-100 text-purple-800',
      [ToolCategory.VIRTUAL_LAB]: 'bg-orange-100 text-orange-800',
      [ToolCategory.DATA_ANALYSIS]: 'bg-indigo-100 text-indigo-800',
      [ToolCategory.COLLABORATION]: 'bg-yellow-100 text-yellow-800',
      [ToolCategory.PROJECT_MANAGEMENT]: 'bg-gray-100 text-gray-800',
      [ToolCategory.AR_VR_EXPERIENCE]: 'bg-pink-100 text-pink-800',
      [ToolCategory.MULTIMEDIA_CREATION]: 'bg-red-100 text-red-800',
      [ToolCategory.ASSESSMENT_TOOL]: 'bg-teal-100 text-teal-800',
      [ToolCategory.RESEARCH_TOOL]: 'bg-cyan-100 text-cyan-800',
      [ToolCategory.PRESENTATION_TOOL]: 'bg-lime-100 text-lime-800'
    };
    return colors[category] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer" onClick={onSelect}>
      <div className="flex items-start justify-between mb-3">
        <h4 className="font-medium text-gray-900 text-sm">{tool.name}</h4>
        <span className={`px-2 py-1 rounded text-xs font-medium ${getCategoryColor(tool.category)}`}>
          {tool.category.replace(/_/g, ' ')}
        </span>
      </div>
      
      <p className="text-gray-600 text-sm mb-3 line-clamp-2">{tool.description}</p>
      
      <div className="space-y-2">
        {/* Rating */}
        {averageRating > 0 && (
          <div className="flex items-center space-x-1">
            <div className="flex">
              {[1, 2, 3, 4, 5].map(star => (
                <svg
                  key={star}
                  className={`w-4 h-4 ${star <= averageRating ? 'text-yellow-400' : 'text-gray-300'}`}
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
            </div>
            <span className="text-sm text-gray-500">
              ({tool.ratings?.length || 0})
            </span>
          </div>
        )}

        {/* Cost */}
        <div className="flex items-center justify-between">
          <span className={`px-2 py-1 rounded text-xs ${
            tool.licensing.type === 'free' ? 'bg-green-100 text-green-800' : 'bg-primary-100 text-primary-800'
          }`}>
            {tool.licensing.type === 'free' ? 'Free' : tool.licensing.type}
          </span>
          
          {/* ALF Alignment */}
          <div className="flex items-center space-x-1">
            <span className="text-xs text-gray-500">ALF:</span>
            <div className="flex">
              {[1, 2, 3, 4, 5].map(level => (
                <div
                  key={level}
                  className={`w-2 h-2 rounded-full ${
                    level <= tool.alfStageAlignment.overallAlignment.score
                      ? 'bg-primary-500'
                      : 'bg-gray-200'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Tool Collections View Component
interface ToolCollectionsViewProps {
  collections: ToolCollection[];
  alfStage?: keyof typeof ALF_FRAMEWORK.stages;
  onToolSelect: (tool: EducationalTool) => void;
}

const ToolCollectionsView: React.FC<ToolCollectionsViewProps> = ({
  collections,
  alfStage,
  onToolSelect
}) => {
  const filteredCollections = alfStage
    ? collections.filter(collection => {
        const alignment = collection.alfAlignment[alfStage.toLowerCase() as keyof typeof collection.alfAlignment];
        return typeof alignment === 'object' && alignment.score >= 3;
      })
    : collections;

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Curated Tool Collections
        </h3>
        
        {filteredCollections.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">No collections match your criteria.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredCollections.map(collection => (
              <CollectionCard
                key={collection.id}
                collection={collection}
                onToolSelect={onToolSelect}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// Collection Card Component
interface CollectionCardProps {
  collection: ToolCollection;
  onToolSelect: (tool: EducationalTool) => void;
}

const CollectionCard: React.FC<CollectionCardProps> = ({ collection, onToolSelect }) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="border border-gray-200 rounded-lg p-4">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h4 className="font-medium text-gray-900">{collection.name}</h4>
          <p className="text-gray-600 text-sm mt-1">{collection.description}</p>
          
          <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
            <span>{collection.tools.length} tools</span>
            <span>{collection.estimatedDuration}</span>
            <span className="flex items-center">
              <svg className="w-4 h-4 text-yellow-400 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              {collection.rating}
            </span>
          </div>
        </div>
        
        <button
          onClick={() => setExpanded(!expanded)}
          className="ml-4 p-1 text-gray-400 hover:text-gray-600"
        >
          <svg
            className={`w-5 h-5 transform transition-transform ${expanded ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>
      
      {expanded && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <h5 className="font-medium text-gray-900 mb-2">Learning Path</h5>
          <div className="space-y-2">
            {collection.learningPath.map(step => (
              <div key={step.stepNumber} className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-6 h-6 bg-primary-100 text-primary-800 rounded-full text-xs font-medium flex items-center justify-center">
                  {step.stepNumber}
                </div>
                <div className="flex-1">
                  <h6 className="font-medium text-sm text-gray-900">{step.title}</h6>
                  <p className="text-gray-600 text-sm">{step.description}</p>
                  <div className="flex items-center space-x-4 mt-1 text-xs text-gray-500">
                    <span>{step.estimatedTime}</span>
                    <span>{step.alfStage}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-4">
            <h5 className="font-medium text-gray-900 mb-2">Tools in Collection</h5>
            <div className="flex flex-wrap gap-2">
              {collection.tools.map(toolId => {
                const tool = toolCurationService.getTool(toolId);
                return tool ? (
                  <button
                    key={toolId}
                    onClick={() => onToolSelect(tool)}
                    className="px-3 py-1 bg-primary-100 text-primary-800 rounded-full text-sm hover:bg-primary-200"
                  >
                    {tool.name}
                  </button>
                ) : null;
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Tool Detail View Component
interface ToolDetailViewProps {
  tool: EducationalTool;
  integrationGuidance: IntegrationGuidance | null;
  onBack: () => void;
  onGetGuidance: () => void;
  onSelectForProject: () => void;
}

const ToolDetailView: React.FC<ToolDetailViewProps> = ({
  tool,
  integrationGuidance,
  onBack,
  onGetGuidance,
  onSelectForProject
}) => {
  const averageRating = tool.ratings?.length
    ? tool.ratings.reduce((sum, r) => sum + r.rating, 0) / tool.ratings.length
    : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-3 mb-2">
            <button
              onClick={onBack}
              className="p-1 text-gray-400 hover:text-gray-600"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </button>
            <h3 className="text-xl font-semibold text-gray-900">{tool.name}</h3>
          </div>
          <p className="text-gray-600">{tool.description}</p>
        </div>
        
        <div className="flex space-x-2 ml-4">
          {integrationGuidance && (
            <button
              onClick={onGetGuidance}
              className="px-4 py-2 bg-primary-600 text-white rounded hover:bg-primary-700"
            >
              View Integration Guide
            </button>
          )}
          <button
            onClick={onSelectForProject}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          >
            Select for Project
          </button>
        </div>
      </div>

      {/* Key Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="font-medium text-gray-900 mb-2">Category</h4>
          <span className="text-sm text-gray-600">
            {tool.category.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
          </span>
        </div>
        
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="font-medium text-gray-900 mb-2">Cost</h4>
          <span className="text-sm text-gray-600">
            {tool.licensing.type === 'free' ? 'Free' : `$${tool.licensing.cost.classroom}/year`}
          </span>
        </div>
        
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="font-medium text-gray-900 mb-2">Age Range</h4>
          <span className="text-sm text-gray-600">
            {tool.ageRange.min}-{tool.ageRange.max} years
          </span>
        </div>
        
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="font-medium text-gray-900 mb-2">Rating</h4>
          <div className="flex items-center space-x-1">
            <div className="flex">
              {[1, 2, 3, 4, 5].map(star => (
                <svg
                  key={star}
                  className={`w-4 h-4 ${star <= averageRating ? 'text-yellow-400' : 'text-gray-300'}`}
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
            </div>
            <span className="text-sm text-gray-500">
              ({tool.ratings?.length || 0})
            </span>
          </div>
        </div>
      </div>

      {/* ALF Alignment */}
      <div className="bg-primary-50 rounded-lg p-4">
        <h4 className="font-medium text-gray-900 mb-3">ALF Stage Alignment</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Object.entries(tool.alfStageAlignment).map(([stage, alignment]) => {
            if (typeof alignment !== 'object' || stage === 'overallAlignment' || stage === 'specificUses') return null;
            
            return (
              <div key={stage} className="text-center">
                <div className="text-sm font-medium text-gray-700 mb-1 capitalize">
                  {stage}
                </div>
                <div className="flex justify-center mb-2">
                  {[1, 2, 3, 4, 5].map(level => (
                    <div
                      key={level}
                      className={`w-3 h-3 rounded-full mx-0.5 ${
                        level <= alignment.score ? 'bg-primary-500' : 'bg-gray-200'
                      }`}
                    />
                  ))}
                </div>
                <div className="text-xs text-gray-600">{alignment.score}/5</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Learning Objectives */}
      <div>
        <h4 className="font-medium text-gray-900 mb-3">Learning Objectives</h4>
        <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
          {tool.learningObjectives.map((objective, index) => (
            <li key={index}>{objective}</li>
          ))}
        </ul>
      </div>

      {/* Technical Requirements */}
      <div>
        <h4 className="font-medium text-gray-900 mb-3">Technical Requirements</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <h5 className="font-medium text-gray-700">Minimum Requirements</h5>
            <ul className="mt-1 space-y-1 text-gray-600">
              <li>RAM: {tool.requirements.minimumSpecs.ram}</li>
              <li>Storage: {tool.requirements.minimumSpecs.storage}</li>
              <li>Processor: {tool.requirements.minimumSpecs.processor}</li>
            </ul>
          </div>
          <div>
            <h5 className="font-medium text-gray-700">Platform Support</h5>
            <div className="mt-1 flex flex-wrap gap-1">
              {tool.platform.map(platform => (
                <span
                  key={platform}
                  className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs"
                >
                  {platform.replace(/_/g, ' ')}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Reviews */}
      {tool.reviews && tool.reviews.length > 0 && (
        <div>
          <h4 className="font-medium text-gray-900 mb-3">Community Reviews</h4>
          <div className="space-y-3">
            {tool.reviews.slice(0, 3).map(review => (
              <div key={review.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-start justify-between mb-2">
                  <h5 className="font-medium text-gray-900">{review.title}</h5>
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map(star => (
                      <svg
                        key={star}
                        className={`w-4 h-4 ${star <= review.rating ? 'text-yellow-400' : 'text-gray-300'}`}
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                </div>
                <p className="text-gray-600 text-sm mb-2">{review.content}</p>
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>{review.context.gradeLevel} • {review.context.subject}</span>
                  <span>{review.helpfulVotes} helpful</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// Integration Guidance View Component
interface IntegrationGuidanceViewProps {
  tool: EducationalTool;
  guidance: IntegrationGuidance;
  onBack: () => void;
  onSelectForProject: () => void;
}

const IntegrationGuidanceView: React.FC<IntegrationGuidanceViewProps> = ({
  tool,
  guidance,
  onBack,
  onSelectForProject
}) => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-3 mb-2">
            <button
              onClick={onBack}
              className="p-1 text-gray-400 hover:text-gray-600"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </button>
            <h3 className="text-xl font-semibold text-gray-900">
              Integration Guide: {tool.name}
            </h3>
          </div>
          <p className="text-gray-600">
            Estimated setup time: {guidance.estimatedSetupTime}
          </p>
        </div>
        
        <button
          onClick={onSelectForProject}
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
        >
          Select for Project
        </button>
      </div>

      {/* Setup Steps */}
      <div>
        <h4 className="font-medium text-gray-900 mb-3">Setup Instructions</h4>
        <div className="space-y-4">
          {guidance.setup.map(step => (
            <div key={step.stepNumber} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-8 h-8 bg-primary-100 text-primary-800 rounded-full text-sm font-medium flex items-center justify-center">
                  {step.stepNumber}
                </div>
                <div className="flex-1">
                  <h5 className="font-medium text-gray-900">{step.title}</h5>
                  <p className="text-gray-600 text-sm mt-1">{step.description}</p>
                  
                  <div className="mt-2">
                    <h6 className="text-sm font-medium text-gray-700">Actions:</h6>
                    <ul className="list-disc list-inside text-sm text-gray-600 mt-1">
                      {step.actions.map((action, index) => (
                        <li key={index}>{action}</li>
                      ))}
                    </ul>
                  </div>
                  
                  <div className="flex items-center justify-between mt-3 text-xs text-gray-500">
                    <span>Time: {step.estimatedTime}</span>
                    <span>Verify: {step.verification}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ALF Integration */}
      <div>
        <h4 className="font-medium text-gray-900 mb-3">ALF Stage Integration</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {guidance.alfIntegration.map(integration => (
            <div key={integration.alfStage} className="border border-gray-200 rounded-lg p-4">
              <h5 className="font-medium text-gray-900 capitalize mb-2">
                {integration.alfStage}
              </h5>
              <p className="text-gray-600 text-sm mb-3">{integration.integration}</p>
              
              <div className="mb-3">
                <h6 className="text-sm font-medium text-gray-700">Activities:</h6>
                <ul className="list-disc list-inside text-sm text-gray-600 mt-1">
                  {integration.activities.map((activity, index) => (
                    <li key={index}>{activity}</li>
                  ))}
                </ul>
              </div>
              
              <div className="text-xs text-gray-500">
                Time allocation: {integration.timeAllocation}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Best Practices */}
      <div>
        <h4 className="font-medium text-gray-900 mb-3">Best Practices</h4>
        <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
          {guidance.bestPractices.map((practice, index) => (
            <li key={index}>{practice}</li>
          ))}
        </ul>
      </div>

      {/* Assessment Integration */}
      <div>
        <h4 className="font-medium text-gray-900 mb-3">Assessment Integration</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h5 className="font-medium text-gray-700 mb-2">Formative Assessment</h5>
            <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
              {guidance.assessmentIntegration.formativeOptions.map((option, index) => (
                <li key={index}>{option}</li>
              ))}
            </ul>
          </div>
          <div>
            <h5 className="font-medium text-gray-700 mb-2">Summative Assessment</h5>
            <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
              {guidance.assessmentIntegration.summativeOptions.map((option, index) => (
                <li key={index}>{option}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Support Resources */}
      <div>
        <h4 className="font-medium text-gray-900 mb-3">Support Resources</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {guidance.supportResources.map((resource, index) => (
            <a
              key={index}
              href={resource.url}
              target="_blank"
              rel="noopener noreferrer"
              className="block p-3 border border-gray-200 rounded-lg hover:bg-gray-50"
            >
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium text-gray-900">{resource.title}</span>
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </div>
              <p className="text-sm text-gray-600 mt-1">{resource.description}</p>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ToolCurationInterface;