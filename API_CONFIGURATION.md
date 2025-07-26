# API Configuration for ALF Coach

## Gemini AI Integration

The ALF Coach chat system uses Google's Gemini AI to generate contextually relevant suggestions for educators. When properly configured, the AI will create subject-specific, age-appropriate suggestions instead of generic fallbacks.

## Setting up the API Key

### For Local Development

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Get your Gemini API key from: https://makersuite.google.com/app/apikey

3. Add your API key to `.env`:
   ```
   VITE_GEMINI_API_KEY=your_actual_api_key_here
   ```

### For Production (Netlify)

1. Go to your Netlify dashboard
2. Navigate to Site Settings → Environment Variables
3. Add the following variable:
   - Key: `VITE_GEMINI_API_KEY`
   - Value: Your actual Gemini API key

**Important**: Netlify requires the `VITE_` prefix for environment variables to be exposed to the frontend build.

## Verifying the Configuration

When the app loads, check the browser console for these messages:

- ✅ `Gemini API Key available: true` - API key is loaded
- ✅ `Gemini AI model initialized successfully` - Model is ready
- ❌ `Gemini API Key available: false` - API key not found
- ❌ `Gemini API key not configured - using fallback suggestions` - Using generic suggestions

## Troubleshooting

### API Key Not Loading in Production

1. Verify the environment variable is set in Netlify
2. Trigger a new deploy after adding the variable
3. Clear your browser cache

### Fallback Suggestions

If the API key is not configured or fails to load, the system will use context-aware fallback suggestions for these subjects:
- Physical Education
- Music
- Science
- Art
- Default (for other subjects)

While fallbacks provide basic functionality, AI-generated suggestions offer much better variety and context-specific relevance.

## Security Notes

- Never commit your actual API key to version control
- The `.env` file is gitignored by default
- Use environment variables for all deployments