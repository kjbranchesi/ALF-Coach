# ChatV6 Migration Plan

## Current State Analysis

### Chat Implementations Found:
1. **ChatInterface + ChatService** (Current Production)
   - Complex 9-layer architecture
   - Uses chat-service.ts (3700+ lines)
   - Currently working after our fixes

2. **ChatV6** (Simplified Version)
   - Direct Gemini API calls
   - Clean React component
   - Not yet deployed

3. **Legacy Versions** (Should be removed)
   - ChatV2, V3, V4, V5 (with 5 variants)
   - ChatModule.jsx
   - Various other implementations

## Migration Strategy

### Phase 1: Prepare ChatV6 (Immediate)
1. ✅ Update model from 'gemini-1.5-flash' to 'gemini-2.0-flash'
2. ✅ Add proper error handling and fallbacks
3. ✅ Implement all required features:
   - Idea/WhatIf cards
   - State persistence
   - Progress tracking
   - All 10 SOP steps

### Phase 2: Feature Parity Check
ChatV6 needs these features from current system:
- [ ] Firebase data persistence
- [ ] Progress tracking (step 1 of 9)
- [ ] Idea card generation
- [ ] What-if scenarios
- [ ] Help functionality
- [ ] Refine/Continue flow
- [ ] Validation and error handling

### Phase 3: Gradual Rollout
1. Add feature flag to ChatWrapper:
```typescript
const useNewChat = featureFlags.useSimplifiedChat || false;
return useNewChat ? <ChatV6 /> : <ChatContainer />;
```

2. Test with internal users (10%)
3. Monitor for errors
4. Increase rollout percentage
5. Full deployment when stable

### Phase 4: Cleanup (After Stable)
1. Archive old implementations:
   ```bash
   mkdir src/archive/legacy-chat
   mv src/features/chat/ChatV[2-5]* src/archive/legacy-chat/
   ```

2. Remove complex service layers:
   - chat-service.ts
   - chat-service-ai.ts
   - ai-conversation-manager.ts (keep if ChatV6 uses it)

3. Update all routes to use ChatV6

## Benefits of Migration

1. **Simplicity**: 1 file vs 13+ files
2. **Performance**: Direct API calls, no layers
3. **Debuggability**: Can trace issues quickly
4. **Maintainability**: Less code = fewer bugs

## Risk Mitigation

1. **Keep rollback ready**: Feature flag allows instant rollback
2. **Test thoroughly**: All 10 steps, all edge cases
3. **Monitor closely**: Track errors, completion rates
4. **Communicate**: Let users know about improvements

## Timeline

- **Week 1**: Update ChatV6 to feature parity
- **Week 2**: Deploy to 10% with feature flag
- **Week 3**: Increase to 50% if stable
- **Week 4**: Full deployment and cleanup

## Success Criteria

- All users can complete full 10-step flow
- Error rate < 1%
- Performance improved (faster responses)
- Code reduced by 80%+
- Developer onboarding time reduced