# Gemini API Security Migration Guide

## Current State
- Gemini API key is exposed in client-side code via `VITE_GEMINI_API_KEY`
- Firebase config is also client-side but this is OK (Firebase is designed for this)

## Migration Steps (When Ready)

### 1. Add New Environment Variable in Netlify
- Go to Netlify Dashboard → Site Settings → Environment Variables
- Add `GEMINI_API_KEY` (without VITE_ prefix) with your API key value
- Keep `VITE_GEMINI_API_KEY` for now to avoid breaking the app

### 2. Update geminiService.js
Replace the direct API call with a call to your Netlify function:

```javascript
// Old way (direct to Gemini)
const response = await fetch(API_URL_BASE, {...});

// New way (through Netlify Function)
const response = await fetch('/.netlify/functions/gemini', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ prompt: systemPrompt, history }),
});
```

### 3. Test Locally
```bash
# Install Netlify CLI if you haven't
npm install -g netlify-cli

# Run with functions
netlify dev
```

### 4. Deploy and Test
- Deploy to Netlify
- Test all AI features still work
- Once confirmed working, remove `VITE_GEMINI_API_KEY` from Netlify

## What About Firebase?

**Leave Firebase as-is!** Firebase API keys are meant to be public. Your security comes from:
- Firestore Security Rules (already configured)
- Authentication rules
- Domain restrictions in Firebase Console

## Immediate Action (Without Code Changes)

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Navigate to APIs & Services → Credentials
3. Find your Gemini API key
4. Click Edit → Add Application Restrictions
5. Select "Website restrictions"
6. Add your Netlify domain(s):
   - `https://your-app.netlify.app`
   - `http://localhost:3000` (for local dev)

This prevents others from using your key even if they find it.