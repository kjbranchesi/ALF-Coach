# ALF Coach QA Testing Checklist

## Pre-Release Testing Checklist

### ✅ Critical Path Testing (MUST PASS)
- [ ] Complete happy path journey (9 steps) in under 20 minutes
- [ ] Verify step 9 references content from step 1 (context preservation)
- [ ] Kill browser mid-journey and verify full recovery on restart
- [ ] Disable network during AI response and verify graceful fallback
- [ ] Complete journey with VITE_USE_AI_CHAT=false (template mode)

### ✅ Core Functionality (Each Step)
- [ ] **Big Idea**: Enter valid concept → receive contextual confirmation
- [ ] **Essential Question**: Enter open-ended question → validates connection to Big Idea
- [ ] **Challenge**: Enter actionable challenge → confirms authenticity
- [ ] **Phases**: Describe progression → validates building toward challenge
- [ ] **Activities**: List hands-on activities → checks age-appropriateness
- [ ] **Resources**: Specify materials → suggests effective usage
- [ ] **Milestones**: Define checkpoints → aligns with phases
- [ ] **Rubric**: Create criteria → validates student-friendliness
- [ ] **Impact Plan**: Describe audience → confirms authentic sharing

### ✅ AI Integration Testing
- [ ] Ideas button generates 4 contextually relevant suggestions
- [ ] What-If button generates 3 transformative scenarios
- [ ] Help button provides detailed, step-specific guidance
- [ ] Refine button maintains conversation context
- [ ] AI responses reference teacher's subject, age group, and location

### ✅ Edge Case Testing
- [ ] Enter 500+ word response → system handles gracefully
- [ ] Enter single word → system prompts for elaboration
- [ ] Enter off-topic content → system redirects professionally
- [ ] Rapidly click all buttons → no crashes or duplicates
- [ ] Change mind 5+ times in one step → maintains coherence
- [ ] Complete journey in <5 minutes → ensures minimum quality

### ✅ Context Maintenance
- [ ] Complete 50+ message conversation → context remains accurate
- [ ] Use pronouns referring to earlier content → correctly interpreted
- [ ] Contradict earlier statement → system notices and clarifies
- [ ] Multiple refinement loops → no context repetition
- [ ] Session timeout and resume → full context restored

### ✅ Error Scenarios
- [ ] API key invalid → clear error message
- [ ] API timeout → fallback to templates
- [ ] Network disconnection → progress saved locally
- [ ] Browser crash → full recovery on restart
- [ ] Rate limit exceeded → graceful queueing

### ✅ Performance Checks
- [ ] AI response time <3 seconds (90% of requests)
- [ ] UI remains responsive during AI generation
- [ ] 100+ messages don't slow system
- [ ] Memory usage stable over long session
- [ ] Multiple browser tabs maintain separate contexts

### ✅ Cross-Browser Testing
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)
- [ ] Mobile Safari (iOS)
- [ ] Chrome Mobile (Android)

### ✅ Accessibility
- [ ] Keyboard navigation through entire journey
- [ ] Screen reader announces all elements
- [ ] Color contrast meets WCAG AA standards
- [ ] Works with browser zoom 200%
- [ ] Touch targets adequate for mobile

## Quick Smoke Test (5 minutes)
1. Start journey with "Science, Ages 10-12, Chicago"
2. Enter "Climate change" as Big Idea
3. Click Ideas button and select one
4. Continue through Essential Question
5. Use Help button
6. Complete Challenge
7. Verify data persists in localStorage
8. Refresh page and confirm progress saved

## Regression Test After Code Changes
Run these specific scenarios after any code modifications:

1. **Context System Changes**
   - Complete full journey checking step 9 references step 1
   - 20+ refinement loops in various steps
   
2. **AI Integration Changes**
   - Test all button types (Ideas, What-If, Help)
   - Verify fallback behavior with API disabled
   
3. **State Management Changes**
   - Session recovery after crash
   - Multiple concurrent browser tabs
   
4. **UI Component Changes**
   - Rapid button clicking
   - Card selection flows
   - Mobile responsiveness

## Sign-off Criteria
- [ ] All critical path tests pass
- [ ] No high-priority bugs open
- [ ] Performance metrics within targets
- [ ] Accessibility scan passes
- [ ] Error tracking configured
- [ ] Rollback plan documented

## Contact for Issues
- **Critical Bugs**: Create issue with "CRITICAL" label
- **AI Behavior**: Document exact input/output
- **Performance**: Include browser console timing
- **Context Loss**: Export localStorage data

Remember: Teachers depend on this tool working reliably every time. When in doubt, test it again!