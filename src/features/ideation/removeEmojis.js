// Script to remove all emojis from the codebase

const replacements = [
  // Suggestion texts
  { old: '💡 How about exploring', new: 'How about exploring' },
  { old: '🌍 What if we focused on', new: 'What if we focused on' },
  { old: '🤝 Consider', new: 'Consider' },
  { old: '🔍 Let me see more examples', new: 'See more examples' },
  { old: '❓ What if we asked:', new: 'What if we asked:' },
  { old: '🤔 Consider:', new: 'Consider:' },
  { old: '💭 How about:', new: 'How about:' },
  { old: '✨ Let me suggest more', new: 'Let me suggest more' },
  { old: '❓ How can we improve', new: 'How can we improve' },
  { old: '🤔 Why does this matter', new: 'Why does this matter' },
  { old: '💭 What would happen', new: 'What would happen' },
  { old: '💡 Show me example', new: 'Show me example' },
  
  // Action buttons
  { old: '💡 Get Ideas', new: 'Get Ideas' },
  { old: '📋 See Examples', new: 'See Examples' },
  { old: '❓ Ask a Question', new: 'Ask a Question' },
  { old: '💡 Yes, show me Big Ideas', new: 'Show Big Ideas' },
  { old: '📋 See examples from other projects', new: 'See examples from other projects' },
  { old: '💭 Let me think more', new: 'Let me think more' },
  { old: '❓ Yes, suggest questions', new: 'Suggest Questions' },
  { old: '💡 Tips for writing my own', new: 'Tips for writing my own' },
  { old: '✨ Combine ideas', new: 'Combine ideas' },
  { old: '➡️ Create my own', new: 'Create my own' },
  { old: '💡 Adapt one of these', new: 'Adapt one of these' },
  { old: '🔄 Start Over', new: 'Start Over' },
  { old: '✏️ Let me try again', new: 'Try Again' },
  { old: '❓ Why does this matter?', new: 'Why does this matter?' },
  { old: '💡 See some examples', new: 'See Examples' },
  { old: '💡 Get new ideas', new: 'Get new ideas' },
  { old: "✏️ I'll type a new one", new: "I'll type a new one" },
  { old: '➡️ Keep it as is', new: 'Keep it as is' },
  
  // Challenge types
  { old: '🎨 Create a multimedia exhibition', new: 'Create a multimedia exhibition' },
  { old: '💡 Design a solution and pitch', new: 'Design a solution and pitch' },
  { old: '📱 Develop a digital resource', new: 'Develop a digital resource' },
  { old: '🎭 Produce an interactive experience', new: 'Produce an interactive experience' },
  { old: '🎨 Creative projects', new: 'Creative projects' },
  { old: '💡 Solution-based challenges', new: 'Solution-based challenges' },
  { old: '📱 Digital products', new: 'Digital products' },
  { old: '🎭 Performance/presentation', new: 'Performance/presentation' },
  
  // Other UI elements
  { old: '🎨 I like the exhibition idea', new: 'I like the exhibition idea' },
  { old: '🎬 Tell me more about documentary', new: 'Tell me more about documentary' },
  { old: '💡 Let me create my own', new: 'Let me create my own' },
  { old: '🎤 Community forum would be powerful', new: 'Community forum would be powerful' },
  { old: '💡 TED talks excite my students', new: 'TED talks excite my students' },
  { old: '🎭 Immersive experience sounds amazing', new: 'Immersive experience sounds amazing' },
  
  // Welcome and celebration
  { old: '🌟', new: '' },
  { old: '🎉', new: '' },
  { old: '✨', new: '' },
  
  // Consistency check buttons
  { old: '✅ Yes, update everything to match', new: 'Accept Changes' },
  { old: '💭 Show me what would change', new: 'Show What Changes' },
  { old: '➡️ Keep my original and continue', new: 'Keep Original' },
  
  // Quick actions
  { old: '📋 I\'d like examples', new: 'Show Examples' },
  { old: '➡️ I\'m ready to type my own', new: 'Continue' },
  { old: '💡 Show me ideas', new: 'Show Ideas' },
  
  // Challenge response buttons
  { old: '🔧 Design challenge sounds great', new: 'Design challenge sounds great' },
  { old: '📋 Policy proposal interests me', new: 'Policy proposal interests me' },
  { old: '🌍 Community action fits well', new: 'Community action fits well' },
  { old: '📱 App/website appeals to me', new: 'App/website appeals to me' },
  { old: '🗺️ Digital story map sounds interesting', new: 'Digital story map sounds interesting' },
  { old: '📚 Resource hub would work well', new: 'Resource hub would work well' }
];

// Also remove any remaining emoji prefixes
const prefixPatterns = [
  '💡', '🌍', '🤝', '🔍', '✨', '❓', '📋', '✏️', '▶️', '🎨', '🎬', '🎤', '🎭', 
  '📱', '🗺️', '📚', '🔧', '💭', '✅', '➡️', '🌟', '🎉', '🤔', '🔄'
];

export { replacements, prefixPatterns };