# Week 3 Validation Checklist - ALF Coach Chat System

## Pre-Deployment Validation

### ✅ Week 1 Fixes Validation

#### 1. JSON Display Issue
- [ ] Messages show formatted text only
- [ ] No raw JSON visible in chat
- [ ] No curly braces or field names in UI
- [ ] Test with complex AI responses
- **Files to verify**: `MainWorkspace.jsx` lines 293-307, 148-158

#### 2. Chat Initialization
- [ ] Chat loads immediately on project open
- [ ] Welcome message appears without user action
- [ ] No "Continue" button required to start
- [ ] Test with new projects
- [ ] Test with existing projects
- **Files to verify**: `MainWorkspace.jsx` lines 246-251

#### 3. Framework Terminology
- [ ] All prompts use "Active Learning Framework" or "ALF"
- [ ] No mentions of "Apple" anywhere
- [ ] No mentions of "CBL" or "Challenge Based Learning"
- [ ] Test AI responses for correct terminology
- **Files to verify**: `ai-conversation-manager.ts` lines 192-196

#### 4. Production Readiness
- [ ] Build in production mode: `npm run build`
- [ ] No debug panels visible in production
- [ ] No console.log statements in production
- [ ] Test with VITE_DEBUG=true shows debug info
- [ ] Test localStorage debug flag
- **Files to verify**: `ChatModule.jsx`, `environment.js`, `logger.ts`

### ✅ Week 2 Architecture Validation

#### 5. ChatV6 Component
- [ ] Component initializes correctly
- [ ] All MVP features working:
  - [ ] Buttons display and function
  - [ ] Suggestions appear contextually
  - [ ] Stage progression works
  - [ ] Data capture functions
  - [ ] Error recovery works
- [ ] Direct API calls successful
- [ ] State management clear and predictable
- **Files to verify**: `ChatV6.tsx`

### ✅ Week 3 Testing Validation

#### 6. Unit Tests
Run: `npm test ChatV6.test`
- [ ] All initialization tests pass
- [ ] Framework terminology tests pass
- [ ] Message display tests pass
- [ ] Production readiness tests pass
- [ ] User interaction tests pass
- [ ] Error handling tests pass

#### 7. Integration Tests
Run: `npm test ChatV6.integration.test`
- [ ] Complete ideation flow works
- [ ] Refinement flow works
- [ ] Suggestion selection works
- [ ] Error recovery works
- [ ] Stage transitions work
- [ ] Data persistence works

### 🧪 Manual Testing Script

#### Scenario 1: New Project Creation
1. Create new project with Science/6th Grade
2. Verify welcome message appears immediately
3. Click "Let's get started!"
4. Enter "Climate change" as big idea
5. Verify formatted response (no JSON)
6. Click "Continue to next step"
7. Complete all ideation steps
8. Verify stage transition to Journey

#### Scenario 2: Error Recovery
1. Disable network connection
2. Try sending a message
3. Verify error message appears
4. Re-enable network
5. Click "Let's continue"
6. Verify chat recovers

#### Scenario 3: Production Build
1. Run `npm run build`
2. Run `npm run preview`
3. Open in browser
4. Verify no debug panels
5. Check console for no debug logs
6. Add `localStorage.setItem('alfCoachDebug', 'true')`
7. Refresh and verify debug panels appear

### 📊 Performance Metrics

#### Response Times
- [ ] UI updates < 100ms
- [ ] AI responses < 3 seconds
- [ ] Stage transitions < 500ms

#### Bundle Size
- [ ] ChatV6 component < 50KB
- [ ] Total JS bundle < 500KB

#### Accessibility
- [ ] Keyboard navigation works
- [ ] Screen reader compatible
- [ ] Color contrast passes WCAG AA

### 🚀 Deployment Readiness

#### Code Quality
- [ ] TypeScript compilation: no errors
- [ ] ESLint: no errors
- [ ] No TODO comments in critical paths
- [ ] Documentation updated

#### Rollback Plan
- [ ] Feature flag for ChatV6 implemented
- [ ] Old ChatModule preserved
- [ ] Quick toggle mechanism tested
- [ ] Rollback procedure documented

### 📋 Sign-Off Checklist

- [ ] All unit tests passing
- [ ] All integration tests passing
- [ ] Manual testing completed
- [ ] Performance metrics met
- [ ] No critical bugs found
- [ ] Documentation complete
- [ ] Team review completed

### 🎯 Success Criteria Met

1. **JSON Display**: ✅ Users see formatted text, not raw JSON
2. **Auto-Initialize**: ✅ Chat starts without user action
3. **Correct Framework**: ✅ ALF terminology used consistently
4. **Production Ready**: ✅ Debug info hidden in production
5. **Simplified Architecture**: ✅ ChatV6 maintains features with less complexity
6. **Test Coverage**: ✅ Comprehensive test suite ensures quality

## Next Steps

Once all validations pass:
1. Deploy ChatV6 with feature flag (10% rollout)
2. Monitor error rates and user feedback
3. Gradually increase rollout percentage
4. Remove old ChatModule after 2 weeks of stability