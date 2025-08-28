# ALF Coach - Emergency Rollback Procedures

## **When to Execute Rollback**

### **IMMEDIATE ROLLBACK REQUIRED** 
- Users cannot progress past Big Idea step
- JavaScript errors prevent app loading
- Data loss or corruption detected
- Complete flow failure (can't reach Journey stage)

### **ACCEPTABLE TO MONITOR** 
- Minor UI glitches
- Slow performance (if functional)
- Non-critical console warnings
- Edge case scenarios

## **Rollback Method 1: Git Revert (Fastest)**

```bash
# 1. Identify the commit to revert (our bug fix)
git log --oneline -3
# Look for: "Fix critical chat flow bug: Big Idea to Essential Question progression"

# 2. Revert the specific commit
git revert 0325f8c --no-edit

# 3. Push the revert (triggers auto-deployment if connected)
git push origin main
```

**Expected Result**: App reverts to previous working state (with the original bug)

## **Rollback Method 2: Netlify Dashboard**

1. **Login to Netlify Dashboard**
2. **Navigate to ALF Coach site**  
3. **Go to "Deploys" section**
4. **Find previous successful deployment**
5. **Click "Publish deploy" on known-good version**

**Timeline**: 2-3 minutes to complete

## **Rollback Method 3: Manual Code Revert**

If git revert fails, manually restore the previous version:

```bash
# 1. Check out the previous working commit
git checkout HEAD~1 -- src/services/chat-service.ts

# 2. Commit the restored version
git add src/services/chat-service.ts
git commit -m "Emergency rollback: restore previous chat-service.ts"

# 3. Push to trigger deployment
git push origin main
```

## **Post-Rollback Actions**

### **Immediate** (0-5 minutes)
1. **Verify** rollback deployed successfully
2. **Test** critical path: Wizard → Chat → Big Idea entry
3. **Confirm** app is functional (even with original bug)
4. **Update** team on rollback status

### **Short Term** (within 1 hour)
1. **Document** what failed during deployment
2. **Gather** error logs/screenshots
3. **Assess** root cause of deployment failure
4. **Plan** fix strategy for next attempt

### **Communication Template**

```
SUBJECT: ALF Coach - Temporary Rollback Completed

Team,

We've rolled back the ALF Coach deployment due to [SPECIFIC ISSUE].

Current Status: 
- ✅ Application is functional 
- ⚠️ Original Big Idea progression bug has returned
- 🔍 Investigating deployment failure

Next Steps:
- [Timeline] for issue resolution
- [Plan] for next deployment attempt

Users can continue using ALF Coach but may experience the known
Big Idea → Essential Question progression issue.

[Your name]
```

## **Verification After Rollback**

### **Quick Functionality Check** (2 minutes)
- [ ] App loads without errors
- [ ] Wizard completes successfully  
- [ ] Chat interface receives wizard data
- [ ] Users can enter Big Idea text
- [ ] App doesn't crash (even if bug persists)

### **Expected Behavior Post-Rollback**
- Users will see the original bug (Big Idea loop)
- But app remains functional for other stages
- No new critical issues introduced

## **Prevention for Next Deployment**

### **Enhanced Testing Before Deploy**
```bash
# 1. Local testing with build
npm run build && npm run preview

# 2. Test critical path locally
# 3. Deploy to branch preview first (if available)
netlify deploy --dir=dist

# 4. Only deploy to production after validation
netlify deploy --prod --dir=dist
```

### **Staged Deployment Process**
1. **Feature branch** → Deploy to preview
2. **Test preview** → Validate critical flows  
3. **Merge to main** → Auto-deploy to production
4. **Monitor production** → Immediate validation

---

**Last Updated**: 2025-08-28
**Contact for Emergencies**: [Your contact info]
**Rollback SLA**: < 5 minutes from decision to execution