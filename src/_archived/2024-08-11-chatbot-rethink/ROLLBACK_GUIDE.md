# Rollback Guide - Chatbot Rethink

## When to Rollback
Only rollback if:
- New chatbot interface causes critical failures
- User acceptance testing shows <50% satisfaction
- Performance degrades significantly

## Rollback Steps

### 1. Restore Chat Components
```bash
# From project root
cp -r src/_archived/2024-08-11-chatbot-rethink/components/chat/* src/components/chat/
```

### 2. Restore Learning Journey Components
```bash
cp -r src/_archived/2024-08-11-chatbot-rethink/features/learningJourney/* src/features/learningJourney/
```

### 3. Update MainWorkspace.jsx
Replace:
```javascript
import { ChatbotFirstInterface } from './chat/ChatbotFirstInterface';
```

With:
```javascript
import ChatModule from './ChatModule.jsx';
```

And replace component usage:
```javascript
// OLD (chatbot-first)
<ChatbotFirstInterface ... />

// RESTORE TO:
<ChatModule ... />
```

### 4. Restore Routes
In AppRouter or MainWorkspace, restore old routing logic.

### 5. Clean Build
```bash
rm -rf node_modules/.vite
npm run build
```

### 6. Test
- Verify old functionality works
- Check that forms load correctly
- Ensure no console errors

## Partial Rollback
If only specific components need restoration:
1. Copy individual files from archive
2. Update only affected imports
3. Test incrementally

## Post-Rollback Actions
1. Document why rollback was needed
2. Create issues for problems encountered
3. Plan incremental improvements instead of full rethink