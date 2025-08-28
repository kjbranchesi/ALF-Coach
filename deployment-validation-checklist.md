# ALF Coach - Post-Deployment Validation Checklist

## **CRITICAL FLOW TESTING** (Must Pass)

### **1. Wizard to Chat Handoff**
- [ ] Complete wizard with sample data (Subject: Art+Science, Grade: Middle School)
- [ ] Click "Begin Project Design" 
- [ ] Verify chat interface loads with context data
- [ ] Check that user sees "Let's start with your Big Idea" prompt

### **2. Ideation Stage - Big Idea Flow** (THE CORE BUG FIX)
- [ ] Enter Big Idea text (e.g., "How natural cycles shape our world")
- [ ] Verify confirmation message appears with Big Idea text
- [ ] Click "Continue" button
- [ ] **CRITICAL**: Verify system advances to "Essential Question" prompt
- [ ] Verify no "Working on Big Idea" loop
- [ ] Check browser console for successful state transitions

### **3. Essential Question Flow** (Previously Broken)
- [ ] Enter Essential Question text (e.g., "How do natural cycles affect our daily lives?")
- [ ] Verify confirmation message appears
- [ ] Click "Continue" button
- [ ] Verify system advances to "Challenge" prompt

### **4. Challenge Flow**
- [ ] Enter Challenge text (e.g., "Create a community awareness campaign")
- [ ] Verify confirmation message appears  
- [ ] Click "Continue" button
- [ ] Verify system moves to "Stage Clarify" message
- [ ] Verify system advances to Journey stage

### **5. Complete Flow Validation**
- [ ] Journey stage prompts appear correctly
- [ ] All 9 total steps complete in sequence
- [ ] Final blueprint generation works
- [ ] Progress sidebar updates correctly throughout

## **SECONDARY VALIDATION** (Should Pass)

### **Error Recovery**
- [ ] Refresh page during Ideation stage - does it recover properly?
- [ ] Try entering very short input - does error handling work?
- [ ] Try entering very long input - does it process correctly?

### **UI/UX Verification**
- [ ] Progress indicators show current step
- [ ] Loading states appear during AI processing
- [ ] Error messages are user-friendly (not technical)
- [ ] Buttons are responsive and clearly labeled

### **Performance**
- [ ] Page loads quickly (< 3 seconds)
- [ ] Chat responses appear promptly
- [ ] No console errors or warnings
- [ ] Memory usage reasonable (check DevTools)

## **ROLLBACK CRITERIA** (Deploy Previous Version If)

### **Critical Failures**
- ❌ Users still get stuck at Big Idea → Essential Question
- ❌ Wizard to chat handoff broken
- ❌ Complete flow doesn't reach Journey stage
- ❌ JavaScript errors preventing app load
- ❌ Data persistence failures

### **Acceptable Issues** (Can Fix Later)
- ⚠️ Minor UI styling issues
- ⚠️ Slow performance (if functional)
- ⚠️ Non-critical console warnings
- ⚠️ Edge case error handling

## **Browser Compatibility Check**

Test the critical Big Idea → Essential Question flow in:
- [ ] Chrome (latest)
- [ ] Safari (latest) 
- [ ] Firefox (latest)
- [ ] Mobile Safari (iOS)
- [ ] Chrome Mobile (Android)

## **Quick Smoke Test Script** (5 minutes)

1. Go to ALF Coach URL
2. Click "Get Started" or equivalent
3. Complete wizard quickly with any data
4. In chat: Enter "Solar energy in schools" as Big Idea
5. Click Continue - **MUST advance to Essential Question**
6. Enter any Essential Question text
7. Click Continue - **MUST advance to Challenge**
8. If both advances work: ✅ **DEPLOYMENT SUCCESS**

## **Emergency Contacts & Procedures**

### **If Critical Issues Found:**
1. **Document** the exact steps to reproduce
2. **Screenshot** any error messages
3. **Check** browser console for errors
4. **Execute** rollback procedures immediately
5. **Notify** stakeholders of temporary rollback

### **Rollback Command** (if needed):
```bash
# Revert to previous working commit
git revert HEAD --no-edit
git push origin main
# Or deploy previous known-good build via Netlify dashboard
```

---

**Test Completion Date**: ___________
**Tested By**: ___________
**Critical Flow Status**: [ ] PASS [ ] FAIL
**Deployment Decision**: [ ] APPROVED [ ] ROLLBACK REQUIRED