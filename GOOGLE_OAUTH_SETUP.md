# Google OAuth Setup Guide

**Time Required**: 15-20 minutes
**Cost**: Free
**Prerequisites**: Personal Gmail account (no Google Workspace needed)

---

## 📋 STEP 2: Create Google Cloud Project

### 2.1 Go to Google Cloud Console
1. Open your browser
2. Go to: https://console.cloud.google.com/
3. **Sign in** with your personal Gmail (e.g., `yourname@gmail.com`)

### 2.2 Create New Project
1. At the top of the page, click the **project dropdown** (says "Select a project")
2. Click **"NEW PROJECT"** button (top right of popup)
3. Fill in:
   - **Project name**: `ALF Coach` (or whatever you want)
   - **Organization**: Leave as "No organization"
4. Click **"CREATE"**
5. Wait 10-20 seconds for project to be created
6. Click **"SELECT PROJECT"** when it appears

✅ **You now have a Google Cloud project!**

---

## 📋 STEP 3: Enable Required APIs

### 3.1 Enable Google+ API
1. In the left sidebar, click **"APIs & Services"** → **"Library"**
2. In the search bar, type: `Google+ API`
3. Click on **"Google+ API"**
4. Click **"ENABLE"** button
5. Wait for it to enable (5-10 seconds)

---

## 📋 STEP 4: Configure OAuth Consent Screen

### 4.1 Start OAuth Setup
1. In left sidebar, click **"OAuth consent screen"**
2. Select **"External"** (only option available without Workspace)
3. Click **"CREATE"**

### 4.2 Fill in Required Fields

**App information:**
- **App name**: `ALF Coach`
- **User support email**: (select your Gmail from dropdown)
- **App logo**: (skip for now)

**App domain (skip all these for now):**
- Application home page: (leave blank)
- Privacy policy: (leave blank)
- Terms of service: (leave blank)

**Developer contact information:**
- **Email addresses**: Type your Gmail and press Enter

### 4.3 Click **"SAVE AND CONTINUE"**

### 4.4 Scopes (Step 2 of setup)
1. Click **"ADD OR REMOVE SCOPES"**
2. Check these boxes:
   - ✅ `.../auth/userinfo.email`
   - ✅ `.../auth/userinfo.profile`
   - ✅ `openid`
3. Click **"UPDATE"** (bottom of popup)
4. Click **"SAVE AND CONTINUE"**

### 4.5 Test Users (Step 3 of setup)
1. Click **"+ ADD USERS"**
2. Enter your Gmail address
3. Click **"ADD"**
4. Click **"SAVE AND CONTINUE"**

### 4.6 Summary (Step 4)
1. Review everything
2. Click **"BACK TO DASHBOARD"**

✅ **OAuth consent screen configured!**

---

## 📋 STEP 5: Create OAuth Client ID

### 5.1 Navigate to Credentials
1. In left sidebar, click **"Credentials"**
2. At the top, click **"+ CREATE CREDENTIALS"**
3. Select **"OAuth client ID"**

### 5.2 Configure OAuth Client
1. **Application type**: Select **"Web application"**
2. **Name**: `ALF Coach Web Client`

### 5.3 Add Authorized Domains

**Authorized JavaScript origins:**
1. Click **"+ ADD URI"**
2. Add: `http://localhost:5173` (for local dev)
3. Click **"+ ADD URI"** again
4. Add: `https://projectcraft-alf.netlify.app` (your production domain)

**Authorized redirect URIs:**
1. Click **"+ ADD URI"**
2. Add: `http://localhost:5173/__/auth/handler`
3. Click **"+ ADD URI"** again
4. Add: `https://projectcraft-alf.netlify.app/__/auth/handler`

### 5.4 Create Client
1. Click **"CREATE"** button at bottom
2. **IMPORTANT**: A popup appears with your credentials

---

## 📋 STEP 6: Copy Your Credentials

You'll see a popup that says "OAuth client created" with:

```
Your Client ID
[long string of characters]

Your Client Secret
[another long string]
```

### ⚠️ STOP HERE - DON'T CLOSE THE POPUP YET

**Tell me when you see this popup**, and I'll guide you through adding these to Firebase.

---

## 🎯 What You'll Have After This

- ✅ Google Cloud project created
- ✅ OAuth consent screen configured
- ✅ OAuth client ID created
- ✅ Client ID and Client Secret ready to copy

**Next**: I'll walk you through adding these to Firebase (takes 2 minutes)

---

## 🆘 Troubleshooting

### "Can't create project"
- Make sure you're signed in with a personal Gmail account
- Try a different browser if issues persist

### "Can't find OAuth consent screen"
- Make sure you selected your new project from the dropdown at top
- Refresh the page

### "Can't add URIs"
- Make sure you selected "Web application" as the type
- Each URI must be on its own line (click "+ ADD URI" for each)

---

**Ready to start?** Go to Step 2.1 above and tell me when you reach Step 6!
