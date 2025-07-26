// Test script to verify AI suggestion generation
// Run with: node test-ai-suggestions.js

import { createChatService } from './src/services/chat-service.ts';

// Mock wizard data for testing
const mockWizardData = {
  subject: 'Physical Education',
  ageGroup: '8-10 years',
  location: 'San Francisco'
};

// Create chat service instance
const chatService = createChatService(mockWizardData, 'test-blueprint-123');

console.log('Testing AI Suggestion Generation for Physical Education...\n');

// Test idea generation
console.log('Testing Ideas generation...');
const ideas = await chatService.generateIdeas();
console.log('Generated Ideas:', JSON.stringify(ideas, null, 2));

console.log('\n---\n');

// Test what-if generation
console.log('Testing What-If generation...');
const whatIfs = await chatService.generateWhatIfs();
console.log('Generated What-Ifs:', JSON.stringify(whatIfs, null, 2));

console.log('\nTest complete!');