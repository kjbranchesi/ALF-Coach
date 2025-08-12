# ALF Coach Deployment Guide

## Prerequisites

1. **Node.js** (v18+ recommended)
2. **Firebase CLI** (`npm install -g firebase-tools`)
3. **Git** for version control
4. **Environment variables** configured

## Environment Setup

### 1. Copy Environment Variables
```bash
cp .env.example .env.local
```

### 2. Configure Firebase
Add your Firebase project credentials to `.env.local`:
```env
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-domain.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-bucket.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
VITE_FIREBASE_APP_ID=your-app-id
```

### 3. Configure Gemini API
Add your Gemini API key:
```env
VITE_GEMINI_API_KEY=your-gemini-api-key
GEMINI_API_KEY=your-gemini-api-key  # For Netlify functions
```

## Local Development

### Start Development Server
```bash
npm install
npm run dev
```

### Run Tests
```bash
npm test
```

### Build for Production
```bash
npm run build
```

## Firebase Deployment

### 1. Initialize Firebase (First Time Only)
```bash
firebase login
firebase init
```

Select:
- Hosting
- Firestore
- Functions (if using)

### 2. Deploy Firestore Rules
```bash
firebase deploy --only firestore:rules
```

### 3. Deploy Firestore Indexes
```bash
firebase deploy --only firestore:indexes
```

### 4. Build and Deploy Hosting
```bash
npm run build
firebase deploy --only hosting
```

### 5. Full Deployment
```bash
npm run build
firebase deploy
```

## Netlify Deployment

### 1. Build the Project
```bash
npm run build
```

### 2. Deploy via Netlify CLI
```bash
npm install -g netlify-cli
netlify deploy
netlify deploy --prod  # For production
```

### 3. Environment Variables on Netlify
Add these in Netlify Dashboard > Site Settings > Environment Variables:
- All `VITE_*` variables from `.env.local`
- `GEMINI_API_KEY` for serverless functions

## Deployment Checklist

### Pre-Deployment
- [ ] All tests passing (`npm test`)
- [ ] Build succeeds (`npm run build`)
- [ ] Environment variables configured
- [ ] Firebase rules updated
- [ ] API keys secured

### Feature Verification
- [ ] ChatbotFirst interface loads
- [ ] AI responds to queries
- [ ] Creative Process timeline displays
- [ ] Iteration buttons work
- [ ] Data saves to Firebase
- [ ] Chat history persists
- [ ] Onboarding shows for new users

### Post-Deployment
- [ ] Test user registration
- [ ] Create test project
- [ ] Complete full flow (Ideation → Journey → Deliverables)
- [ ] Verify Firebase data storage
- [ ] Check error monitoring
- [ ] Test on multiple devices

## Monitoring

### Firebase Console
Monitor at: https://console.firebase.google.com
- Real-time database usage
- Authentication metrics
- Hosting bandwidth
- Function invocations

### Browser Console
Check for:
- No red errors
- API calls succeeding
- Firebase connections active

### Performance Metrics
Target metrics:
- Load time: <2 seconds
- Time to Interactive: <3 seconds
- Bundle size: <700KB main chunk
- Lighthouse score: >90

## Rollback Procedure

### If Issues Arise

1. **Immediate Rollback**
```bash
firebase hosting:rollback
```

2. **Restore Previous Build**
```bash
git checkout <previous-commit>
npm run build
firebase deploy --only hosting
```

3. **Feature Flag Disable**
In `.env.local`:
```env
VITE_ENABLE_NEW_CHATBOT=false
```

## Common Issues & Solutions

### Issue: Gemini API Not Working
**Solution**: Check API key in both `.env.local` and Netlify environment variables

### Issue: Firebase Permission Denied
**Solution**: Update `firestore.rules` to allow authenticated users

### Issue: Chat History Not Loading
**Solution**: Check Firebase indexes are deployed

### Issue: Onboarding Shows Repeatedly
**Solution**: Clear localStorage or check `alf-onboarding-complete` key

## Support Resources

- **Firebase Documentation**: https://firebase.google.com/docs
- **Netlify Documentation**: https://docs.netlify.com
- **Vite Documentation**: https://vitejs.dev
- **Project Repository**: [Your GitHub URL]

## Contact

For deployment issues:
- Check error logs in Firebase Console
- Review browser console for client-side errors
- Verify all environment variables are set

## Success Criteria

Deployment is successful when:
1. ✅ Application loads without errors
2. ✅ Users can create accounts
3. ✅ Projects can be created and saved
4. ✅ AI responds intelligently
5. ✅ Creative Process timeline displays
6. ✅ All data persists correctly

## Next Steps After Deployment

1. **Monitor Initial Usage**
   - Watch error rates
   - Track user engagement
   - Monitor API usage

2. **Gather Feedback**
   - User surveys
   - Bug reports
   - Feature requests

3. **Iterate and Improve**
   - Fix critical bugs first
   - Deploy improvements regularly
   - Keep documentation updated

---

**Remember**: Always test in staging before production deployment!