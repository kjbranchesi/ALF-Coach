# Firebase + Netlify Setup Guide

## Prerequisites
- Firebase project created
- Netlify account with environment variables set

## What You Need to Do:

### 1. In Firebase Console

#### Enable Authentication
1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project
3. Click **Authentication** → **Get Started**
4. Enable **Email/Password** provider
5. (Optional) Enable **Anonymous** provider for guest access

#### Create Firestore Database
1. Click **Firestore Database** → **Create Database**
2. Choose **Start in production mode**
3. Select your region (use same as your users)
4. Click **Enable**

#### Set Security Rules
1. In Firestore, click **Rules** tab
2. Copy the content from `firestore.rules` in this repo
3. Paste and click **Publish**

#### Add Your Domain
1. Go to **Authentication** → **Settings** → **Authorized domains**
2. Add your Netlify domains:
   - `your-app.netlify.app`
   - `your-custom-domain.com` (if you have one)
   - `localhost` (for local development)

### 2. In Netlify Dashboard

Make sure you have these environment variables:

**Option A: Single Config Variable**
```
VITE_FIREBASE_CONFIG = {"apiKey":"...","authDomain":"...","projectId":"...","storageBucket":"...","messagingSenderId":"...","appId":"..."}
```

**Option B: Individual Variables**
```
VITE_FIREBASE_API_KEY = your-api-key
VITE_FIREBASE_AUTH_DOMAIN = your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID = your-project-id
VITE_FIREBASE_STORAGE_BUCKET = your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID = your-sender-id
VITE_FIREBASE_APP_ID = your-app-id
```

**Optional AI Variables**
```
VITE_USE_AI_CHAT = true
VITE_GEMINI_API_KEY = your-gemini-api-key
```

### 3. Local Development

Create a `.env` file in your project root:
```bash
# Copy from .env.local.example
cp .env.local.example .env

# Edit with your values
# Get these from Netlify dashboard or Firebase console
```

### 4. Test Your Setup

1. **Local Test**
   ```bash
   npm run dev
   ```
   - Open browser console
   - Should see: "✅ Firebase initialized successfully"
   - No 400 errors

2. **Deploy to Netlify**
   ```bash
   git add .
   git commit -m "Configure Firebase"
   git push
   ```
   - Netlify will auto-deploy
   - Check deployed site console

### 5. Verify Firebase Works

1. Go through the wizard
2. Complete a blueprint
3. Check Firebase Console → Firestore
4. You should see documents in `blueprints` collection

## Troubleshooting

### "Firebase not configured" message
- Check environment variables in Netlify
- Redeploy after adding variables

### 403 Forbidden errors
- Add your domain to Firebase authorized domains
- Check Firestore rules are published

### Data not saving to Firestore
- Verify Firestore is enabled
- Check browser console for specific errors
- Data will save to localStorage as fallback

### CORS errors
- Add Netlify domain to Firebase authorized domains
- Ensure auth domain matches your Firebase project

## Security Notes

- Never commit `.env` file to git
- Firestore rules allow:
  - Anyone to read blueprints (for sharing)
  - Only creators to edit their blueprints
  - Anonymous users supported
- Consider adding authentication for production