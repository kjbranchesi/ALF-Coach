// Test script to verify AI integration
// Run this to test the AI-enhanced ChatService

import { createChatService } from './services/chat-service';

async function testAIIntegration() {
  console.log('Testing AI Integration...\n');
  
  // Test wizard data
  const wizardData = {
    subject: 'Science',
    ageGroup: '8-10',
    location: 'San Francisco'
  };
  
  const blueprintId = 'test-blueprint-123';
  
  // Set AI mode for testing (now using Netlify function)
  (import.meta as any).env.VITE_USE_AI_CHAT = 'true';
  
  console.log('Creating ChatService with AI mode enabled...');
  const chatService = createChatService(wizardData, blueprintId);
  
  // Get initial state
  const state = chatService.getState();
  console.log('\nInitial State:');
  console.log('- Stage:', state.stage);
  console.log('- Phase:', state.phase);
  console.log('- Messages:', state.messages.length);
  
  // Test processing an action
  console.log('\nProcessing "start" action...');
  await chatService.processAction('start');
  
  const newState = chatService.getState();
  console.log('\nState after start:');
  console.log('- Stage:', newState.stage);
  console.log('- Phase:', newState.phase);
  console.log('- Messages:', newState.messages.length);
  
  // Print last message
  if (newState.messages.length > 0) {
    const lastMessage = newState.messages[newState.messages.length - 1];
    console.log('\nLast message:');
    console.log('- Role:', lastMessage.role);
    console.log('- Content preview:', `${lastMessage.content.substring(0, 100)  }...`);
  }
  
  console.log('\n✅ AI Integration test complete!');
}

// Run the test
testAIIntegration().catch(console.error);