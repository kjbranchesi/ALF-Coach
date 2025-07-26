# Netlify Environment Variables Setup

## Quick Steps to Enable AI Chat

1. **Log into Netlify Dashboard**
   - Go to https://app.netlify.com
   - Select your ALF Coach site

2. **Navigate to Environment Variables**
   - Click on "Site configuration" in the left sidebar
   - Click on "Environment variables"

3. **Add the AI Chat Variable**
   - Click "Add a variable"
   - Add:
     - **Key**: `VITE_USE_AI_CHAT`
     - **Value**: `true`
     - **Scopes**: Keep all deployment contexts selected
   - Click "Save"

4. **Verify Existing Variables**
   - Ensure you already have:
     - `VITE_GEMINI_API_KEY` (with your actual API key)

5. **Deploy Changes**
   - Go to the "Deploys" tab
   - Click "Trigger deploy" → "Deploy site"
   - Wait for the build to complete (usually 2-3 minutes)

## What This Enables

With `VITE_USE_AI_CHAT=true`, the chat system will:
- Generate personalized responses based on educator's context
- Remember and build upon previous selections
- Create natural, conversational interactions
- Maintain the 10-step SOP structure with AI flexibility

## Verification

After deployment, visit your site and open the browser console (F12). You should see:
- `Using AI-powered chat mode`
- `Gemini AI model initialized successfully`

If you see `Using template-based chat mode` instead, double-check the environment variable is set correctly and redeploy.