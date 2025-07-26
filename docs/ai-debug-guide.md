# ALF Coach AI Debug Guide

## Quick Debug Checklist

When you see generic responses instead of AI-powered ones:

### 1. Check Browser Console for Debug Messages

Look for these key messages:
- `🤖 AI Mode: ENABLED` vs `DISABLED`
- `🔍 DEBUG: AI Mode is ENABLED, processing step:`
- `⚠️ DEBUG: AI Mode DISABLED or no AI Manager - using fallback`

### 2. Verify Environment Variables

In your `.env` file (local) or Netlify dashboard:
```env
VITE_USE_AI_CHAT=true  # Must be exactly 'true'
VITE_GEMINI_API_KEY=your-actual-key  # Must be valid
```

### 3. Check AI Initialization

Look for these console messages on app startup:
- `✓ AI Conversation Manager initialized`
- `Gemini AI model initialized successfully`

If you see:
- `Gemini API key not configured - using fallback suggestions`
- `Failed to initialize Gemini AI:`

Then AI is NOT working.

### 4. Common Issues & Fixes

#### Issue: "AI Mode DISABLED"
**Fix**: Set `VITE_USE_AI_CHAT=true` in environment variables

#### Issue: "AI Manager not available"
**Fix**: Check Gemini API key is valid and not placeholder

#### Issue: Works for Ideas/What-If but not main chat
**Fix**: This means legacy AI works but full AI mode failed to initialize

#### Issue: Generic responses for Big Ideas
**Fix**: Check if `process_big_idea` action is being called (see DEBUG logs)

### 5. Force AI Mode On

To bypass environment variable issues, you can temporarily force AI mode:

1. In Chrome DevTools Console:
```javascript
// Check current AI status
window.__chatService?.useAIMode
window.__chatService?.aiManager

// Force enable (temporary)
if (window.__chatService) {
  window.__chatService.useAIMode = true;
}
```

### 6. Test AI Directly

In the chat, enter exactly:
```
"students develop music based on pop culture trends but tying to different time periods"
```

**Good AI Response**: Should recognize anachronistic concepts and suggest:
- "Cultural Time Travel"
- "Temporal Creative Expression"
- "Cross-Era Musical Fusion"

**Bad Fallback Response**: Generic options like:
- "Cycles of Change"
- "Past as Prologue"
- "Evolution and Adaptation"

## Holistic AI Coverage

AI should work for ALL these interactions:
- ✅ Welcome message
- ✅ Stage introductions (3)
- ✅ Step prompts (9)
- ✅ Confirmation processing (9)
- ✅ Refine actions
- ✅ Help messages
- ⚠️ Ideas generation (uses legacy model)
- ⚠️ What-If scenarios (uses legacy model)
- ✅ Tell More
- ✅ Stage summaries
- ✅ Completion message
- ❌ Error recovery (currently no AI)

## Production Deployment

For Netlify deployment:
1. Set environment variables in Netlify dashboard
2. Redeploy after adding variables
3. Clear browser cache
4. Test in incognito window