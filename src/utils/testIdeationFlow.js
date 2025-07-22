// Test script to verify ideation flow is working correctly

export const testIdeationFlow = () => {
  console.log('=== TESTING IDEATION FLOW ===');
  
  // Test 1: Suggestion click detection
  console.log('\n1. Testing suggestion click detection:');
  const testInputs = [
    "💡 How about exploring 'Innovation in Our Community'?",
    "The Future of Urban Spaces",
    "Cities as Living Systems",
    "✅ Yes, update everything to match",
    "💭 Show me what would change",
    "Regular user input"
  ];
  
  testInputs.forEach(input => {
    const result = window.processSuggestionClick?.(input);
    console.log(`Input: "${input}"`);
    console.log(`Result:`, result);
    console.log('---');
  });
  
  // Test 2: Check localStorage
  console.log('\n2. Checking localStorage for stale data:');
  const blueprint = localStorage.getItem('currentBlueprint');
  if (blueprint) {
    const parsed = JSON.parse(blueprint);
    console.log('Found blueprint in localStorage:');
    console.log('- bigIdea:', parsed.ideation?.bigIdea);
    console.log('- essentialQuestion:', parsed.ideation?.essentialQuestion);
    console.log('- challenge:', parsed.ideation?.challenge);
  } else {
    console.log('No blueprint found in localStorage');
  }
  
  // Test 3: Check for suggestion text in values
  console.log('\n3. Checking for suggestion text in ideation values:');
  const suspiciousPatterns = [
    /^[💡🌍🤝🔍✨❓📋✏️▶️]/,
    /How about exploring/,
    /What if we focused/,
    /Consider:/
  ];
  
  if (blueprint) {
    const parsed = JSON.parse(blueprint);
    ['bigIdea', 'essentialQuestion', 'challenge'].forEach(field => {
      const value = parsed.ideation?.[field];
      if (value) {
        const isSuspicious = suspiciousPatterns.some(pattern => pattern.test(value));
        if (isSuspicious) {
          console.error(`⚠️ Found suggestion text in ${field}: "${value}"`);
        } else {
          console.log(`✓ ${field} looks clean: "${value}"`);
        }
      }
    });
  }
  
  console.log('\n=== TEST COMPLETE ===');
};

// Function to clear problematic data
export const clearProblematicData = () => {
  console.log('Clearing problematic data from localStorage...');
  const blueprint = localStorage.getItem('currentBlueprint');
  
  if (blueprint) {
    const parsed = JSON.parse(blueprint);
    
    // Clear any suggestion text from ideation fields
    if (parsed.ideation) {
      ['bigIdea', 'essentialQuestion', 'challenge'].forEach(field => {
        const value = parsed.ideation[field];
        if (value && (
          /^[💡🌍🤝🔍✨❓📋✏️▶️]/.test(value) ||
          value.includes('How about exploring') ||
          value.includes('What if we focused') ||
          value.includes('Consider:')
        )) {
          console.log(`Clearing suspicious ${field}: "${value}"`);
          parsed.ideation[field] = '';
        }
      });
    }
    
    localStorage.setItem('currentBlueprint', JSON.stringify(parsed));
    console.log('Data cleaned!');
  }
};