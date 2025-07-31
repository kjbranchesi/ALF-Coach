# ALF Coach Deployment Guide

## Netlify Deployment

### Environment Variables Setup

In your Netlify dashboard, go to Site Settings → Environment Variables and add:

```
# Gemini API (Required)
VITE_GEMINI_API_KEY=your_gemini_api_key_here

# Firebase (Optional for now)
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

**Note**: We use `VITE_` prefix for Vite compatibility. The app will also check for `REACT_APP_` prefix for backward compatibility.

### Deployment Steps

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "New ALF Coach architecture"
   git push origin main
   ```

2. **Netlify Auto-Deploy**
   - If connected to GitHub, Netlify will auto-deploy on push
   - Check build logs in Netlify dashboard

3. **Manual Deploy** (if needed)
   ```bash
   npm run build
   netlify deploy --prod --dir=dist
   ```

### Build Configuration

The `netlify.toml` file configures:
- Build command: `npm run build`
- Publish directory: `dist`
- Node version: 18
- SPA redirects for React Router

### Troubleshooting

1. **API Key Issues**
   - Verify environment variables are set in Netlify
   - Check browser console for API key warnings
   - App will run in demo mode without API key

2. **Build Failures**
   - Check Node version matches (18+)
   - Clear cache and retry: "Clear cache and deploy site"
   - Check build logs for specific errors

3. **Runtime Errors**
   - Check browser console for errors
   - Verify API endpoints are accessible
   - Check network tab for failed requests

### Demo Mode

The app includes a demo mode that activates when:
- No Gemini API key is found
- API calls fail

This allows testing the UI flow without API access.

### Performance Notes

- Build output is optimized and minified
- Assets are hashed for cache busting
- Tailwind CSS is purged for minimal size
- React code splitting enabled

### Security

- API keys are never exposed in client code
- Environment variables are server-side only
- CORS handled by Gemini API
- XSS protection via React's built-in escaping