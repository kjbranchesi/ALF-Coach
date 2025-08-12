# Archive Manifest - Chatbot Rethink (2024-08-11)

## Reason for Archive
Major architectural shift to chatbot-first interface to fix mental model confusion where teachers thought they were going through the Creative Process instead of designing it for students.

## Archived Components

### Chat Components
- `ChatModule.jsx` - Old chat module with "What If" suggestions
- `ChatInterface.tsx` - Complex form-based interface (1900+ lines)
- Stage components that confused teacher/student roles

### Learning Journey Components  
- Old milestone forms that made teachers think they were participants
- Complex stage initiators

## Key Changes
1. **Mental Model Fix**: Clear distinction that teachers DESIGN, students JOURNEY
2. **Chatbot-First**: Full-width conversational interface replaces forms
3. **Contextual Initiators**: Only 4 key moments (Big Idea, Essential Question, Challenge, Timeline)
4. **Removed**: "What If" cards and confusing milestone forms

## Files Modified
- `/src/components/MainWorkspace.jsx` - Updated to use ChatbotFirstInterface
- `/src/components/chat/` - New simplified components
- `/src/features/learningJourney/` - Refocused on student journey

## Rollback Instructions
See ROLLBACK_GUIDE.md for detailed restoration process.