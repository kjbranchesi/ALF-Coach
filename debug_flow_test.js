// Test script to verify data flow between stages
console.log('Testing ALF Coach data flow fixes...\n');

// Simulate the flow:
console.log('1. User enters "Students and AI usage" as Big Idea');
console.log('   -> SOPFlowManager.updateStepData("Students and AI usage")');
console.log('   -> Blueprint.ideation.bigIdea = "Students and AI usage"');
console.log('   -> Console log should show: [SOPFlowManager] Saved Big Idea: Students and AI usage\n');

console.log('2. User clicks Continue');
console.log('   -> ChatInterface.handleQuickReply("continue")');
console.log('   -> Gets oldState and newState before clearing messages');
console.log('   -> flowManager.advance()');
console.log('   -> Console log should show current blueprint data before advancing');
console.log('   -> Console log should show preserved blueprint data after advancing\n');

console.log('3. AI generates Essential Question prompt');
console.log('   -> GeminiService.buildSystemPrompt("IDEATION_EQ", "chat", context)');
console.log('   -> Context should include: { ideation: { bigIdea: "Students and AI usage" } }');
console.log('   -> Prompt should include: "Their established Big Idea is: Students and AI usage"');
console.log('   -> AI should NOT ask "Please provide the Big Idea"\n');

console.log('Expected fix results:');
console.log('✓ Data persists between stages');
console.log('✓ AI knows previous stage data');
console.log('✓ Progressive flow maintains context');
console.log('✓ Each stage builds upon previous work\n');

console.log('To test: Open ALF Coach, complete Big Idea step, and check browser console for these logs.');