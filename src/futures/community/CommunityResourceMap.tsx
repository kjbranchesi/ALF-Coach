/**
 * Community Resource Map Component
 * Interactive map showing local community resources for ALF projects
 */

import React, { useState, useEffect, useMemo } from 'react';
import { CommunityResourceMapper, CommunityResource, ResourceType, ResourceCategory, ResourceSearchCriteria, ResourceMatch } from '../../services/community-resource-mapper';
import { BlueprintDocument } from '../../core/types/BlueprintTypes';

interface CommunityResourceMapProps {
  blueprint: BlueprintDocument;
  onResourceSelect?: (resource: CommunityResource) => void;
}

interface MapViewState {
  center: { lat: number; lng: number };
  zoom: number;
  selectedResource: CommunityResource | null;
  filters: ResourceFilters;
}

interface ResourceFilters {
  types: ResourceType[];
  categories: ResourceCategory[];
  distance: number;
  freeOnly: boolean;
  virtualOnly: boolean;
}

export const CommunityResourceMap: React.FC<CommunityResourceMapProps> = ({
  blueprint,
  onResourceSelect
}) => {
  const [viewState, setViewState] = useState<MapViewState>({
    center: { lat: 40.7128, lng: -74.0060 }, // Default to NYC
    zoom: 12,
    selectedResource: null,
    filters: {
      types: [],
      categories: [],
      distance: 10,
      freeOnly: false,
      virtualOnly: false
    }
  });

  const [resources, setResources] = useState<ResourceMatch[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showList, setShowList] = useState(true);
  const resourceMapper = useMemo(() => new CommunityResourceMapper(), []);

  // Get user's location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setViewState(prev => ({
            ...prev,
            center: {
              lat: position.coords.latitude,
              lng: position.coords.longitude
            }
          }));
        },
        (error) => {
          console.warn('Could not get user location:', error);
        }
      );
    }
  }, []);

  // Search for resources when filters change
  useEffect(() => {
    searchResources();
  }, [viewState.filters, viewState.center]);

  const searchResources = async () => {
    setIsLoading(true);
    try {
      const criteria: ResourceSearchCriteria = {
        location: {
          coordinates: {
            latitude: viewState.center.lat,
            longitude: viewState.center.lng
          },
          radius: viewState.filters.distance,
          virtualAcceptable: true
        },
        type: viewState.filters.types.length > 0 ? viewState.filters.types : undefined,
        category: viewState.filters.categories.length > 0 ? viewState.filters.categories : undefined,
        cost: viewState.filters.freeOnly ? { freeOnly: true } : undefined
      };

      const matches = await resourceMapper.searchResources(criteria);
      
      // Filter for virtual only if selected
      const filtered = viewState.filters.virtualOnly
        ? matches.filter(m => m.resource.location.serviceArea.virtualAvailable)
        : matches;
      
      setResources(filtered);
    } catch (error) {
      console.error('Error searching resources:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFilterChange = (filterType: keyof ResourceFilters, value: any) => {
    setViewState(prev => ({
      ...prev,
      filters: {
        ...prev.filters,
        [filterType]: value
      }
    }));
  };

  const getResourceIcon = (type: ResourceType): string => {
    const icons: Record<ResourceType, string> = {
      [ResourceType.Organization]: '🏢',
      [ResourceType.Business]: '🏭',
      [ResourceType.Museum]: '🏛️',
      [ResourceType.Library]: '📚',
      [ResourceType.CommunityCenter]: '🏘️',
      [ResourceType.Government]: '🏛️',
      [ResourceType.NonProfit]: '❤️',
      [ResourceType.Educational]: '🎓',
      [ResourceType.Cultural]: '🎭',
      [ResourceType.Environmental]: '🌳',
      [ResourceType.Healthcare]: '🏥',
      [ResourceType.Technology]: '💻',
      [ResourceType.Arts]: '🎨',
      [ResourceType.Sports]: '⚽',
      [ResourceType.Maker]: '🔧'
    };
    return icons[type] || '📍';
  };

  const getCategoryColor = (category: ResourceCategory): string => {
    const colors: Partial<Record<ResourceCategory, string>> = {
      [ResourceCategory.MentorshipPrograms]: 'bg-purple-100 text-purple-800',
      [ResourceCategory.InternshipOpportunities]: 'bg-blue-100 text-blue-800',
      [ResourceCategory.VolunteerWork]: 'bg-green-100 text-green-800',
      [ResourceCategory.Workshops]: 'bg-yellow-100 text-yellow-800',
      [ResourceCategory.FieldTrips]: 'bg-orange-100 text-orange-800',
      [ResourceCategory.ExpertSpeakers]: 'bg-red-100 text-red-800'
    };
    return colors[category] || 'bg-gray-100 text-gray-800';
  };

  const renderMap = () => {
    return (
      <div className="relative h-96 bg-gray-200 rounded-lg overflow-hidden">
        {/* Placeholder Map - In production, integrate with Google Maps or Mapbox */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <p className="text-gray-600 mb-2">📍 Interactive Map</p>
            <p className="text-sm text-gray-500">
              Showing {resources.length} resources within {viewState.filters.distance} miles
            </p>
          </div>
        </div>

        {/* Resource Markers */}
        {resources.slice(0, 10).map((match, index) => {
          const resource = match.resource;
          const position = {
            top: `${20 + (index * 8)}%`,
            left: `${10 + (index * 8)}%`
          };
          
          return (
            <button
              key={resource.id}
              className="absolute transform -translate-x-1/2 -translate-y-1/2 hover:z-10"
              style={position}
              onClick={() => {
                setViewState(prev => ({ ...prev, selectedResource: resource }));
                onResourceSelect?.(resource);
              }}
            >
              <div className="relative">
                <span className="text-2xl filter drop-shadow-md hover:scale-110 transition-transform">
                  {getResourceIcon(resource.type)}
                </span>
                {viewState.selectedResource?.id === resource.id && (
                  <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 bg-white rounded-lg shadow-lg p-2 whitespace-nowrap">
                    <p className="font-semibold text-sm">{resource.name}</p>
                  </div>
                )}
              </div>
            </button>
          );
        })}
      </div>
    );
  };

  const renderFilters = () => {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 mb-4">
        <h3 className="font-semibold mb-3">Filter Resources</h3>
        
        <div className="space-y-4">
          {/* Distance Slider */}
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Distance: {viewState.filters.distance} miles
            </label>
            <input
              type="range"
              min="1"
              max="50"
              value={viewState.filters.distance}
              onChange={(e) => handleFilterChange('distance', parseInt(e.target.value))}
              className="w-full mt-1"
            />
          </div>

          {/* Resource Types */}
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
              Resource Types
            </label>
            <div className="flex flex-wrap gap-2">
              {Object.values(ResourceType).slice(0, 6).map(type => (
                <button
                  key={type}
                  onClick={() => {
                    const types = viewState.filters.types.includes(type)
                      ? viewState.filters.types.filter(t => t !== type)
                      : [...viewState.filters.types, type];
                    handleFilterChange('types', types);
                  }}
                  className={`px-3 py-1 rounded-full text-sm transition-colors ${
                    viewState.filters.types.includes(type)
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                  }`}
                >
                  {getResourceIcon(type)} {type.replace(/-/g, ' ')}
                </button>
              ))}
            </div>
          </div>

          {/* Quick Filters */}
          <div className="flex gap-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={viewState.filters.freeOnly}
                onChange={(e) => handleFilterChange('freeOnly', e.target.checked)}
                className="mr-2"
              />
              <span className="text-sm">Free Only</span>
            </label>
            
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={viewState.filters.virtualOnly}
                onChange={(e) => handleFilterChange('virtualOnly', e.target.checked)}
                className="mr-2"
              />
              <span className="text-sm">Virtual Only</span>
            </label>
          </div>
        </div>
      </div>
    );
  };

  const renderResourceList = () => {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="font-semibold">
            Resources ({resources.length})
          </h3>
        </div>
        
        <div className="max-h-96 overflow-y-auto">
          {isLoading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto mb-2"></div>
              <p className="text-gray-600 dark:text-gray-400">Searching resources...</p>
            </div>
          ) : resources.length === 0 ? (
            <div className="p-8 text-center text-gray-600 dark:text-gray-400">
              <p>No resources found matching your criteria.</p>
              <p className="text-sm mt-2">Try adjusting your filters or increasing the search distance.</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {resources.map((match) => (
                <ResourceCard
                  key={match.resource.id}
                  match={match}
                  isSelected={viewState.selectedResource?.id === match.resource.id}
                  onSelect={() => {
                    setViewState(prev => ({ ...prev, selectedResource: match.resource }));
                    onResourceSelect?.(match.resource);
                  }}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
          Community Resources
        </h2>
        <button
          onClick={() => setShowList(!showList)}
          className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline"
        >
          {showList ? 'Hide List' : 'Show List'}
        </button>
      </div>

      {/* Filters */}
      {renderFilters()}

      {/* Map and List Layout */}
      <div className={`grid ${showList ? 'md:grid-cols-2' : 'md:grid-cols-1'} gap-4`}>
        <div>{renderMap()}</div>
        {showList && <div>{renderResourceList()}</div>}
      </div>

      {/* Selected Resource Details */}
      {viewState.selectedResource && (
        <ResourceDetails
          resource={viewState.selectedResource}
          onClose={() => setViewState(prev => ({ ...prev, selectedResource: null }))}
        />
      )}
    </div>
  );
};

// Helper Components

interface ResourceCardProps {
  match: ResourceMatch;
  isSelected: boolean;
  onSelect: () => void;
}

const ResourceCard: React.FC<ResourceCardProps> = ({ match, isSelected, onSelect }) => {
  const resource = match.resource;
  
  return (
    <button
      onClick={onSelect}
      className={`w-full text-left p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
        isSelected ? 'bg-indigo-50 dark:bg-indigo-900/20' : ''
      }`}
    >
      <div className="flex items-start gap-3">
        <span className="text-2xl">
          {getResourceIcon(resource.type)}
        </span>
        <div className="flex-1">
          <h4 className="font-semibold text-gray-900 dark:text-gray-100">
            {resource.name}
          </h4>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            {resource.organization.description}
          </p>
          
          <div className="flex items-center gap-4 mt-2 text-xs text-gray-500 dark:text-gray-400">
            <span>📍 {match.logistics?.distance ? `${match.logistics.distance} miles` : 'Distance unknown'}</span>
            {resource.location.serviceArea.virtualAvailable && (
              <span>💻 Virtual available</span>
            )}
            <span className="flex items-center gap-1">
              ⭐ {match.matchScore.overall.toFixed(1)}/5.0
            </span>
          </div>
          
          <div className="flex flex-wrap gap-1 mt-2">
            {match.offerings.slice(0, 3).map((offering, index) => (
              <span
                key={index}
                className={`px-2 py-1 rounded-full text-xs ${getCategoryColor(resource.category)}`}
              >
                {offering.offering.name}
              </span>
            ))}
          </div>
        </div>
      </div>
    </button>
  );
};

interface ResourceDetailsProps {
  resource: CommunityResource;
  onClose: () => void;
}

const ResourceDetails: React.FC<ResourceDetailsProps> = ({ resource, onClose }) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-start gap-3">
          <span className="text-3xl">{getResourceIcon(resource.type)}</span>
          <div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">
              {resource.name}
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              {resource.organization.type} • {resource.category.replace(/-/g, ' ')}
            </p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div className="space-y-6">
        {/* Description */}
        <div>
          <h4 className="font-semibold mb-2">About</h4>
          <p className="text-gray-700 dark:text-gray-300">
            {resource.organization.description}
          </p>
          {resource.organization.mission && (
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 italic">
              Mission: {resource.organization.mission}
            </p>
          )}
        </div>

        {/* Contact Information */}
        <div>
          <h4 className="font-semibold mb-2">Contact Information</h4>
          <div className="space-y-1 text-sm">
            {resource.organization.contactInfo.email && (
              <p>📧 {resource.organization.contactInfo.email}</p>
            )}
            {resource.organization.contactInfo.phone && (
              <p>📞 {resource.organization.contactInfo.phone}</p>
            )}
            {resource.organization.website && (
              <p>
                🌐{' '}
                <a
                  href={resource.organization.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-indigo-600 dark:text-indigo-400 hover:underline"
                >
                  {resource.organization.website}
                </a>
              </p>
            )}
          </div>
        </div>

        {/* Location */}
        <div>
          <h4 className="font-semibold mb-2">Location</h4>
          <p className="text-sm text-gray-700 dark:text-gray-300">
            {resource.location.address.street1}<br />
            {resource.location.address.street2 && <>{resource.location.address.street2}<br /></>}
            {resource.location.address.city}, {resource.location.address.state} {resource.location.address.zipCode}
          </p>
          {resource.location.serviceArea.virtualAvailable && (
            <p className="text-sm text-green-600 dark:text-green-400 mt-2">
              ✓ Virtual services available
            </p>
          )}
        </div>

        {/* Offerings */}
        <div>
          <h4 className="font-semibold mb-2">Programs & Services</h4>
          <div className="space-y-2">
            {resource.offerings.slice(0, 3).map((offering) => (
              <div key={offering.id} className="bg-gray-50 dark:bg-gray-700 rounded p-3">
                <h5 className="font-medium">{offering.name}</h5>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {offering.description}
                </p>
                <div className="flex items-center gap-4 mt-2 text-xs text-gray-500 dark:text-gray-400">
                  <span>⏱️ {offering.duration.length} {offering.duration.unit}</span>
                  <span>💰 {offering.cost.type === 'free' ? 'Free' : `$${offering.cost.amount}`}</span>
                  <span>👥 {offering.targetAudience.groupSize.min}-{offering.targetAudience.groupSize.max} students</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
          <button className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
            Contact Organization
          </button>
          <button className="flex-1 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors">
            Save for Later
          </button>
        </div>
      </div>
    </div>
  );
};

// Utility function
const getResourceIcon = (type: ResourceType): string => {
  const icons: Record<ResourceType, string> = {
    [ResourceType.Organization]: '🏢',
    [ResourceType.Business]: '🏭',
    [ResourceType.Museum]: '🏛️',
    [ResourceType.Library]: '📚',
    [ResourceType.CommunityCenter]: '🏘️',
    [ResourceType.Government]: '🏛️',
    [ResourceType.NonProfit]: '❤️',
    [ResourceType.Educational]: '🎓',
    [ResourceType.Cultural]: '🎭',
    [ResourceType.Environmental]: '🌳',
    [ResourceType.Healthcare]: '🏥',
    [ResourceType.Technology]: '💻',
    [ResourceType.Arts]: '🎨',
    [ResourceType.Sports]: '⚽',
    [ResourceType.Maker]: '🔧'
  };
  return icons[type] || '📍';
};

const getCategoryColor = (category: ResourceCategory): string => {
  const colors: Partial<Record<ResourceCategory, string>> = {
    [ResourceCategory.MentorshipPrograms]: 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300',
    [ResourceCategory.InternshipOpportunities]: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300',
    [ResourceCategory.VolunteerWork]: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300',
    [ResourceCategory.Workshops]: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300',
    [ResourceCategory.FieldTrips]: 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-300',
    [ResourceCategory.ExpertSpeakers]: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300'
  };
  return colors[category] || 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300';
};

export default CommunityResourceMap;