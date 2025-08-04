// Day2ComponentsShowcase.jsx - Showcase of Day 2 components for ALF Coach
// Demonstrates compliance with ALF Design System requirements

import React, { useState } from 'react';
import UserMenu from './UserMenu';
import NotificationBell from './NotificationBell';
import SearchBar from './SearchBar';
import EmptyState, { 
  SearchEmptyState, 
  ConversationEmptyState, 
  BlueprintsEmptyState, 
  CommunityEmptyState 
} from './EmptyState';
import { Container, Section, Stack, Grid, Card, Heading, Text } from '../design-system';

const Day2ComponentsShowcase = () => {
  const [searchQuery, setSearchQuery] = useState('');

  // Sample notifications for NotificationBell
  const sampleNotifications = [
    {
      id: '1',
      type: 'success',
      title: 'Blueprint Created',
      message: 'Your new lesson blueprint has been successfully created.',
      timestamp: new Date(Date.now() - 5 * 60 * 1000),
      read: false
    },
    {
      id: '2',
      type: 'info',
      title: 'Feature Update',
      message: 'New AI suggestions are now available in your blueprints.',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
      read: false
    }
  ];

  const handleSearch = (query) => {
    console.log('Searching for:', query);
    setSearchQuery(query);
  };

  const handleUserAction = (action) => {
    console.log('User action:', action);
  };

  return (
    <Section background="gray" className="min-h-screen py-8">
      <Container>
        <Stack spacing={8}>
          {/* Header */}
          <div className="text-center">
            <Heading level={1} className="mb-4">Day 2 Components Showcase</Heading>
            <Text color="secondary" size="lg">
              Demonstrating ALF Design System compliance with soft shadows, rounded corners, and blue primary color
            </Text>
          </div>

          {/* Components Grid */}
          <Grid cols={1} gap={8}>
            
            {/* User Menu Section */}
            <Card padding="lg">
              <Stack spacing={4}>
                <Heading level={2}>UserMenu Component</Heading>
                <Text color="secondary">
                  User profile menu with dropdown containing profile actions, settings, and logout functionality.
                </Text>
                <div className="flex justify-start">
                  <UserMenu />
                </div>
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <Text size="sm" className="text-green-800">
                    ✓ Soft shadows (shadow-md, shadow-lg) ✓ Rounded corners (rounded-lg) ✓ Blue primary color (#3b82f6) ✓ Lucide icons (no emojis)
                  </Text>
                </div>
              </Stack>
            </Card>

            {/* Notification Bell Section */}
            <Card padding="lg">
              <Stack spacing={4}>
                <Heading level={2}>NotificationBell Component</Heading>
                <Text color="secondary">
                  Notification bell with unread count badge and dropdown panel showing recent notifications.
                </Text>
                <div className="flex justify-start">
                  <NotificationBell notifications={sampleNotifications} />
                </div>
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <Text size="sm" className="text-green-800">
                    ✓ Soft shadows (shadow-md, shadow-lg) ✓ Rounded corners (rounded-xl) ✓ Blue primary color (#3b82f6) ✓ Lucide icons (no emojis)
                  </Text>
                </div>
              </Stack>
            </Card>

            {/* Search Bar Section */}
            <Card padding="lg">
              <Stack spacing={4}>
                <Heading level={2}>SearchBar Component</Heading>
                <Text color="secondary">
                  Interactive search bar with suggestions, recent searches, and quick actions dropdown.
                </Text>
                <div className="max-w-lg">
                  <SearchBar 
                    onSearch={handleSearch}
                    showSuggestions={true}
                  />
                </div>
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <Text size="sm" className="text-green-800">
                    ✓ Soft shadows (shadow-md, shadow-lg) ✓ Rounded corners (rounded-xl) ✓ Blue primary color (#3b82f6) ✓ Lucide icons (no emojis)
                  </Text>
                </div>
              </Stack>
            </Card>

            {/* Empty State Section */}
            <Card padding="lg">
              <Stack spacing={6}>
                <Heading level={2}>EmptyState Component</Heading>
                <Text color="secondary">
                  Flexible empty state component with multiple variants for different contexts.
                </Text>
                
                {/* Empty State Variants Grid */}
                <Grid cols={2} gap={6}>
                  <div className="space-y-4">
                    <Text weight="medium">Default Variant</Text>
                    <div className="border border-gray-200 rounded-lg bg-white">
                      <EmptyState size="sm" />
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <Text weight="medium">Search Variant</Text>
                    <div className="border border-gray-200 rounded-lg bg-white">
                      <SearchEmptyState size="sm" />
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <Text weight="medium">Conversation Variant</Text>
                    <div className="border border-gray-200 rounded-lg bg-white">
                      <ConversationEmptyState 
                        size="sm" 
                        onAction={() => console.log('Start conversation')}
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <Text weight="medium">Blueprints Variant</Text>
                    <div className="border border-gray-200 rounded-lg bg-white">
                      <BlueprintsEmptyState 
                        size="sm" 
                        onAction={() => console.log('Create blueprint')}
                      />
                    </div>
                  </div>
                </Grid>
                
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <Text size="sm" className="text-green-800">
                    ✓ Soft shadows (shadow-sm) ✓ Rounded corners (rounded-xl) ✓ Blue primary color (#3b82f6) ✓ Lucide icons (no emojis)
                  </Text>
                </div>
              </Stack>
            </Card>

            {/* Design System Compliance Summary */}
            <Card padding="lg" className="bg-blue-50 border-blue-200">
              <Stack spacing={4}>
                <Heading level={2} className="text-blue-900">Design System Compliance Summary</Heading>
                <Grid cols={2} gap={6}>
                  <div className="space-y-3">
                    <Text weight="medium" className="text-blue-900">✓ Visual Requirements Met:</Text>
                    <ul className="text-sm text-blue-800 space-y-1">
                      <li>• Soft shadows applied to all elevated elements</li>
                      <li>• Rounded corners used throughout (rounded-lg, rounded-xl)</li>
                      <li>• Blue primary color (#3b82f6) consistently applied</li>
                      <li>• Clean, modern aesthetic maintained</li>
                    </ul>
                  </div>
                  <div className="space-y-3">
                    <Text weight="medium" className="text-blue-900">✓ Technical Requirements Met:</Text>
                    <ul className="text-sm text-blue-800 space-y-1">
                      <li>• All emojis replaced with Lucide icons</li>
                      <li>• Design system components used where available</li>
                      <li>• Responsive design patterns implemented</li>
                      <li>• Accessibility features included</li>
                    </ul>
                  </div>
                </Grid>
              </Stack>
            </Card>

          </Grid>
        </Stack>
      </Container>
    </Section>
  );
};

export default Day2ComponentsShowcase;