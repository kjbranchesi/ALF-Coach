// testAllButtons.js - Comprehensive button testing script

import { processSuggestionClick, isSuggestionClick } from './onboardingProcessor';
import { ButtonCommands, validateButton } from '../features/ideation/ButtonFramework';

export const testAllButtons = () => {
  console.log('=== COMPREHENSIVE BUTTON TESTING ===\n');
  
  // Test 1: All button texts that should be recognized
  console.log('1. Testing Button Recognition:');
  const buttonTexts = [
    // Help buttons
    'Get Ideas',
    'See Examples',
    'Help',
    'Show Tips',
    
    // Edit buttons
    'Try Again',
    'Let me try again',
    
    // Confirmation buttons
    'Accept Changes',
    'Yes, update everything to match',
    'Continue',
    'Keep Original',
    
    // Warning buttons
    'Show What Changes',
    'Show me what would change',
    
    // Challenge selection
    'Creative projects',
    'Solution-based challenges',
    'Digital products',
    'Performance/presentation',
    
    // Direct suggestions (should also be recognized)
    'The Future of Urban Spaces',
    'Cities as Living Systems',
    'Community-Centered Design',
    
    // Regular text (should NOT be recognized)
    'This is just regular user input',
    'I want to create a project about sustainability'
  ];
  
  buttonTexts.forEach(text => {
    const isButton = isSuggestionClick(text);
    const processed = processSuggestionClick(text);
    console.log(`  "${text}"`);
    console.log(`    Is button: ${isButton}`);
    console.log(`    Processed: ${JSON.stringify(processed)}`);
    console.log('');
  });
  
  // Test 2: Button validation
  console.log('\n2. Testing Button Validation:');
  const testButtons = [
    { text: 'Get Ideas', command: 'get-ideas', icon: 'Lightbulb' },
    { text: '💡 Get Ideas', command: 'get-ideas', icon: 'Lightbulb' }, // Should fail - has emoji
    { text: 'This is a very long button text that exceeds the maximum', command: 'test', icon: 'Check' }, // Should fail - too long
    { text: 'Valid Button', command: 'invalid-command', icon: 'Check' }, // Should fail - invalid command
    { text: 'Good Button', command: 'get-ideas', icon: 'InvalidIcon' } // Should fail - invalid icon
  ];
  
  testButtons.forEach(button => {
    const errors = validateButton(button.text, button.command, button.icon);
    console.log(`  Button: "${button.text}"`);
    if (errors.length > 0) {
      console.log(`    ❌ Validation errors:`);
      errors.forEach(error => console.log(`      - ${error}`));
    } else {
      console.log(`    ✓ Valid button`);
    }
    console.log('');
  });
  
  // Test 3: Command mapping
  console.log('\n3. Testing Command Mapping:');
  const commands = Object.values(ButtonCommands);
  console.log(`  Total commands defined: ${commands.length}`);
  console.log(`  Command categories:`);
  
  const categories = {};
  commands.forEach(cmd => {
    if (!categories[cmd.type]) {categories[cmd.type] = [];}
    categories[cmd.type].push(cmd.action);
  });
  
  Object.entries(categories).forEach(([type, actions]) => {
    console.log(`    ${type}: ${actions.join(', ')}`);
  });
  
  // Test 4: Edge cases
  console.log('\n\n4. Testing Edge Cases:');
  const edgeCases = [
    '',  // Empty string
    '   ',  // Whitespace only
    'get ideas',  // Lowercase
    'GET IDEAS',  // Uppercase
    'Get  Ideas',  // Extra spaces
    '  Get Ideas  ',  // Leading/trailing spaces
    'Get Ideas!',  // With punctuation
    '"Get Ideas"',  // In quotes
    'Click Get Ideas',  // With prefix
    'Get Ideas button'  // With suffix
  ];
  
  edgeCases.forEach(text => {
    const processed = processSuggestionClick(text);
    console.log(`  Input: "${text}"`);
    console.log(`  Result: ${JSON.stringify(processed)}`);
    console.log('');
  });
  
  // Test 5: Help phrase detection
  console.log('\n5. Testing Help Phrase Detection:');
  const helpPhrases = [
    'help',
    'Help me',
    'can you help',
    'okay please do',
    'yes please',
    'I need help',
    'I\'m stuck',
    'what should I do',
    'give me ideas',
    'show me examples'
  ];
  
  console.log('  (This would be tested in useWhatIfScenarios.checkHelpRequest)');
  helpPhrases.forEach(phrase => {
    console.log(`  - "${phrase}"`);
  });
  
  console.log('\n=== TEST COMPLETE ===');
  
  // Return summary
  return {
    totalButtonTexts: buttonTexts.length,
    recognizedButtons: buttonTexts.filter(t => isSuggestionClick(t)).length,
    validationTests: testButtons.length,
    commandCategories: Object.keys(categories).length,
    edgeCaseTests: edgeCases.length
  };
};

// Function to test specific conversation flows
export const testConversationFlow = () => {
  console.log('\n=== TESTING CONVERSATION FLOWS ===\n');
  
  const flows = [
    {
      name: 'Happy Path',
      steps: [
        { input: 'Sustainable Urban Design', expected: 'valid-input' },
        { input: 'How can we create sustainable cities?', expected: 'valid-input' },
        { input: 'Design a city planning proposal', expected: 'valid-input' }
      ]
    },
    {
      name: 'Help Request Flow',
      steps: [
        { input: 'help me', expected: 'help-response' },
        { input: 'Get Ideas', expected: 'command:get-ideas' },
        { input: 'Cities as Living Systems', expected: 'suggestion-selected' }
      ]
    },
    {
      name: 'Edit Flow',
      steps: [
        { input: 'Sustainable Cities', expected: 'valid-input' },
        { input: '[Edit Button Click]', expected: 'edit-mode' },
        { input: 'Green Urban Spaces', expected: 'consistency-check' },
        { input: 'Accept Changes', expected: 'command:accept-changes' }
      ]
    },
    {
      name: 'Error Recovery',
      steps: [
        { input: '', expected: 'empty-input-error' },
        { input: 'Not a question', expected: 'validation-error' },
        { input: 'Try Again', expected: 'command:retry' },
        { input: 'How can we improve our city?', expected: 'valid-input' }
      ]
    }
  ];
  
  flows.forEach(flow => {
    console.log(`Flow: ${flow.name}`);
    flow.steps.forEach((step, index) => {
      console.log(`  Step ${index + 1}: "${step.input}" → ${step.expected}`);
    });
    console.log('');
  });
  
  console.log('=== FLOW TEST COMPLETE ===');
};

// Export for use in browser console
if (typeof window !== 'undefined') {
  window.testAllButtons = testAllButtons;
  window.testConversationFlow = testConversationFlow;
}