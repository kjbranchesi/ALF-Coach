# Firebase Setup Guide for ALF Coach

## Prerequisites
1. A Google/Gmail account
2. Access to Firebase Console (https://console.firebase.google.com)

## Step 1: Create Firebase Project
1. Go to https://console.firebase.google.com
2. Click "Create Project"
3. Name it "ALF-Coach" (or similar)
4. Disable Google Analytics (not needed for this app)
5. Click "Create Project"

## Step 2: Enable Authentication
1. In Firebase Console, click "Authentication" in left sidebar
2. Click "Get Started"
3. Enable "Email/Password" provider
4. Optional: Enable "Google" provider for Google sign-in

## Step 3: Create Firestore Database
1. Click "Firestore Database" in left sidebar
2. Click "Create Database"
3. Choose "Start in production mode"
4. Select your region (closest to your users)
5. Click "Enable"

## Step 4: Set Firestore Rules
1. In Firestore, click "Rules" tab
2. Replace default rules with:
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow users to read/write their own blueprints
    match /blueprints/{blueprintId} {
      allow read: if true;  // Public read for sharing
      allow write: if request.auth != null && 
        (resource == null || resource.data.userId == request.auth.uid);
    }
    
    // Allow users to read/write their own projects
    match /projects/{projectId} {
      allow read, write: if request.auth != null && 
        request.auth.uid == resource.data.userId;
    }
  }
}
```
3. Click "Publish"

## Step 5: Get Firebase Configuration
1. Click the gear icon ⚙️ → "Project settings"
2. Scroll down to "Your apps"
3. Click "</>" (Web app) icon
4. Register app with nickname "ALF Coach"
5. Copy the configuration object

## Step 6: Set Up Environment Variables
1. Create `.env` file in project root:
```bash
# Firebase Configuration
VITE_FIREBASE_CONFIG='{"apiKey":"your-api-key","authDomain":"your-auth-domain","projectId":"your-project-id","storageBucket":"your-storage-bucket","messagingSenderId":"your-sender-id","appId":"your-app-id"}'

# Enable AI Chat
VITE_USE_AI_CHAT=true

# Gemini API Key (get from https://makersuite.google.com/app/apikey)
VITE_GEMINI_API_KEY=your-gemini-api-key
```

## Step 7: Test Authentication
1. Run `npm run dev`
2. Open browser console
3. You should see "Firebase initialized successfully"
4. No more 400 errors!

## Troubleshooting
- If you see CORS errors, add your localhost URL to Firebase authorized domains
- If authentication fails, check that email/password provider is enabled
- For production, add your production URL to authorized domains