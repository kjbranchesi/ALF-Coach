# Cloud-First Architecture - Deployment Guide

**Version**: 1.0
**Last Updated**: 2025-10-15
**Status**: Ready for Staged Rollout

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Prerequisites](#prerequisites)
3. [Phase A: Cloud-First Reads](#phase-a-cloud-first-reads)
4. [Phase B: Dual-Write Pattern](#phase-b-dual-write-pattern)
5. [Phase C: Legacy Deprecation](#phase-c-legacy-deprecation)
6. [Monitoring & Observability](#monitoring--observability)
7. [Rollback Procedures](#rollback-procedures)
8. [Troubleshooting](#troubleshooting)

---

## Overview

This guide covers the complete deployment of ALF Coach's cloud-first architecture. The migration is split into three phases for risk mitigation:

- **Phase A**: Cloud-first reads (ReviewScreen loads from Firebase Storage)
- **Phase B**: Dual-write pattern (saves go to cloud first, localStorage cache second)
- **Phase C**: Legacy deprecation (remove localStorage-first paths)

**Timeline**:
- Phase A: Deploy → Monitor 2-3 days
- Phase B: Deploy → Monitor 3-5 days
- Phase C: Deploy → Monitor 1-2 weeks

**Rollback**: Each phase can be rolled back via feature flags without code changes.

---

## Prerequisites

### Required Accounts & Access

- [ ] Firebase project with Blaze (pay-as-you-go) plan
- [ ] Firebase Storage enabled
- [ ] Firebase Firestore enabled
- [ ] Firebase CLI installed (`npm install -g firebase-tools`)
- [ ] Deployment credentials (`firebase login`)
- [ ] Access to production environment variables
- [ ] Ability to monitor error logs (Sentry/LogRocket/etc.)

### Code Requirements

- [ ] All Phase A/B/C code merged to main branch
- [ ] Dependencies installed:
  ```bash
  npm install dompurify pako firebase @types/dompurify @types/pako
  ```
- [ ] Build passing: `npm run build`
- [ ] Tests passing: `npm test`
- [ ] TypeScript compilation clean: `npx tsc --noEmit`

### Firebase Configuration

#### 1. Storage Rules

Deploy security rules (CRITICAL - prevents public access):

```bash
# Test rules locally first
firebase emulators:start --only storage

# Deploy rules to production
npm run deploy:storage-rules

# Verify deployment
npx firebase storage:rules:get
```

Expected output:
```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /users/{userId}/projects/{projectId}/{allFiles=**} {
      allow read: if isOwner(userId) || (isAnonymous() && userId == 'anonymous');
      allow write: if isOwner(userId) && isWithinSizeLimit(10) && isValidContentType();
    }
  }
}
```

#### 2. Firestore Indexes

Ensure composite indexes exist for efficient queries:

```bash
# Deploy indexes
npx firebase deploy --only firestore:indexes

# Verify indexes
npx firebase firestore:indexes
```

Required indexes (in `firestore.indexes.json`):
```json
{
  "indexes": [
    {
      "collectionGroup": "projects",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "userId", "order": "ASCENDING" },
        { "fieldPath": "syncedAt", "order": "DESCENDING" }
      ]
    }
  ]
}
```

#### 3. Firestore Rules

Verify user isolation rules:

```bash
npx firebase deploy --only firestore:rules
npx firebase firestore:rules:get
```

Expected rules include:
```javascript
match /users/{userId}/projects/{projectId} {
  allow read, write: if request.auth.uid == userId;
}
```

#### 4. Storage CORS Configuration

Allow cross-origin requests:

```bash
# Create cors.json
cat > cors.json << 'EOF'
[
  {
    "origin": ["*"],
    "method": ["GET", "HEAD", "PUT", "POST"],
    "maxAgeSeconds": 3600,
    "responseHeader": ["Content-Type", "X-Firebase-Gmpid"]
  }
]
EOF

# Deploy CORS
gsutil cors set cors.json gs://YOUR-PROJECT-ID.appspot.com
```

---

## Phase A: Cloud-First Reads

**Goal**: ReviewScreen loads projects from Firebase Storage with localStorage fallback
**Timeline**: Deploy → Monitor 2-3 days
**Risk**: Low (fallbacks ensure no data loss)

### Deployment Steps

#### 1. Configure Environment Variables

Create/update `.env.production`:

```bash
# Firebase Configuration (Required)
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
VITE_FIREBASE_APP_ID=your-app-id

# Gemini API (Required for AI features)
VITE_GEMINI_API_KEY=your-gemini-key

# Phase A: Enable cloud-first reads
VITE_CLOUD_FIRST_READS=true

# Phase B: Keep disabled for now
VITE_CLOUD_FIRST_WRITES=false

# Fallback strategies (keep enabled during Phase A)
VITE_ENABLE_IDB_FALLBACK=true
VITE_ENABLE_OFFLINE_SNAPSHOT=true

# Observability
VITE_REVIEW_DEBUG=true              # Enable debug dashboard
VITE_ENABLE_TELEMETRY=true          # Track metrics
VITE_SHOW_SYNC_STATUS=true          # Show sync indicators

# Error handling (IMPORTANT: Do not suppress errors during rollout)
VITE_SUPPRESS_ERRORS=false
VITE_SUPPRESS_FIREBASE_ERRORS=false

# Environment
VITE_APP_ENV=production
```

#### 2. Build & Deploy

```bash
# Build production bundle
npm run build

# Test build locally
npm run preview

# Deploy to hosting (Netlify/Vercel/Firebase Hosting)
# Example for Netlify:
netlify deploy --prod

# Example for Firebase Hosting:
firebase deploy --only hosting
```

#### 3. Verify Deployment

After deployment, verify functionality:

**Test 1: Cloud Load (Happy Path)**
```
1. Open production site
2. Navigate to existing project
3. Open DevTools Console
4. Expected: "[ProjectLoadService] ✅ Loaded from cloud"
5. Check Network tab: GET request to Firebase Storage
6. Verify: Project displays correctly
```

**Test 2: Offline Fallback**
```
1. Open DevTools → Network → Offline
2. Reload page
3. Navigate to project
4. Expected: "[ProjectLoadService] ✅ Loaded from offline_snapshot"
5. Verify: Project displays correctly
```

**Test 3: Legacy Compatibility**
```
1. Set VITE_CLOUD_FIRST_READS=false (via console override if possible)
2. Reload page
3. Navigate to project
4. Expected: "[ProjectLoadService] 📁 Legacy load"
5. Verify: Project displays correctly
```

#### 4. Monitor Telemetry

Navigate to `/app/debug/telemetry`:

**Success Criteria**:
- Load Success Rate: >99.5%
- Average Latency: <500ms
- Cache Hit Rate: >60% (after warmup)
- Error Codes: Empty or <0.1% of operations

**Warning Signs**:
- Load success rate <95%
- Average latency >1000ms
- Many "NOT_FOUND" errors
- 403/404 Storage errors

If warning signs appear, see [Rollback Procedures](#rollback-procedures).

#### 5. Gradual Rollout (Optional)

For large user bases, use percentage-based rollout:

```typescript
// In featureFlags.ts
const ROLLOUT_PERCENTAGE = parseFloat(
  import.meta.env.VITE_CLOUD_FIRST_ROLLOUT_PERCENTAGE || '100'
);

export const featureFlags = {
  cloudFirstReads: getBooleanEnv('VITE_CLOUD_FIRST_READS', false) &&
    (Math.random() * 100 < ROLLOUT_PERCENTAGE)
};
```

Start with 10% → 25% → 50% → 100% over several days.

---

## Phase B: Dual-Write Pattern

**Goal**: Saves write to cloud first (atomic), then update localStorage cache
**Timeline**: Deploy → Monitor 3-5 days
**Risk**: Medium (requires offline queue for reliability)

### Pre-Deployment Check

Before enabling Phase B:

- [ ] Phase A deployed for 2-3 days with <0.1% error rate
- [ ] Telemetry shows >99.5% load success
- [ ] No unresolved cloud access issues
- [ ] Offline snapshots working correctly
- [ ] SyncStatusIndicator visible to users

### Deployment Steps

#### 1. Update Environment Variables

Update `.env.production`:

```bash
# Phase A: Keep enabled
VITE_CLOUD_FIRST_READS=true

# Phase B: Enable dual-write
VITE_CLOUD_FIRST_WRITES=true

# Keep fallbacks during Phase B
VITE_ENABLE_IDB_FALLBACK=true
VITE_ENABLE_OFFLINE_SNAPSHOT=true

# Observability (keep enabled)
VITE_REVIEW_DEBUG=true
VITE_ENABLE_TELEMETRY=true
VITE_SHOW_SYNC_STATUS=true

# Error handling (CRITICAL: Keep false during Phase B)
VITE_SUPPRESS_ERRORS=false
VITE_SUPPRESS_FIREBASE_ERRORS=false
```

#### 2. Build & Deploy

```bash
npm run build
npm run preview  # Test locally first

# Deploy
netlify deploy --prod
# OR
firebase deploy --only hosting
```

#### 3. Verify Deployment

**Test 1: Online Save (Happy Path)**
```
1. Create new project
2. Complete wizard
3. Save project
4. Open DevTools Console
5. Expected: "[CloudStorageAdapter] ✅ Saved successfully (rev 1)"
6. Check Network tab: PUT to Firebase Storage, POST to Firestore
7. Navigate away and back
8. Expected: Project loads from cloud
```

**Test 2: Offline Save (Queue Test)**
```
1. Open DevTools → Network → Offline
2. Create/edit project
3. Save project
4. Expected: "[OfflineQueue] Queued save for project"
5. Check SyncStatusIndicator: Shows "Offline (1 queued)"
6. Go back online
7. Expected: "[OfflineQueue] ✅ Successfully processed"
8. Verify: Project now in cloud
```

**Test 3: Conflict Resolution**
```
1. Open project in two tabs
2. Edit in Tab A, save (rev 2)
3. Edit in Tab B (still at rev 1), save
4. Expected: Modal "Project modified on another device"
5. Choose "Use my version"
6. Expected: Save succeeds as rev 3
```

#### 4. Monitor Metrics

Check telemetry dashboard:

**Success Criteria**:
- Save Success Rate: >99.5%
- Load Success Rate: >99.5%
- Average Save Latency: <800ms
- Cache Hit Rate: >60%
- Queued Operations: <10 at any time
- Dead Letter Queue: <5 operations total

**Warning Signs**:
- Save success rate <95%
- >50 queued operations
- Many operations in dead letter queue
- Frequent conflict_detected events
- High latency (>2000ms)

---

## Phase C: Legacy Deprecation

**Goal**: Remove localStorage-first paths, simplify codebase
**Timeline**: Deploy → Monitor 1-2 weeks
**Risk**: High (irreversible data migration)

**IMPORTANT**: Do NOT start Phase C until Phase B has been stable for 3-5 days.

See `PHASE_C_DEPRECATION_GUIDE.md` for complete details.

---

## Monitoring & Observability

### Telemetry Dashboard

Access: `/app/debug/telemetry`

**Key Metrics to Monitor**:

| Metric | Target | Warning | Critical |
|--------|--------|---------|----------|
| Save Success Rate | >99.5% | <99% | <95% |
| Load Success Rate | >99.5% | <99% | <95% |
| Cache Hit Rate | >60% | <50% | <30% |
| Avg Save Latency | <800ms | >1500ms | >3000ms |
| Avg Load Latency | <500ms | >1000ms | >2000ms |
| Queued Operations | <10 | >50 | >100 |
| Dead Letter Operations | <5 | >10 | >25 |

### External Monitoring

Set up alerts in your monitoring service (Sentry/DataDog/etc.):

**Critical Alerts**:
- Save success rate <95% for >5 minutes
- Error rate >5% for >5 minutes
- Dead letter queue >25 operations
- Average latency >3000ms for >10 minutes

**Warning Alerts**:
- Save success rate <99% for >15 minutes
- Cache hit rate <50% for >30 minutes
- Queued operations >50 for >10 minutes

---

## Rollback Procedures

### Quick Rollback (Feature Flags)

**Fastest**: Update environment variables without code changes.

#### Rollback Phase A

```bash
# Disable cloud-first reads
VITE_CLOUD_FIRST_READS=false

# Redeploy
npm run build
netlify deploy --prod
```

Effect: ReviewScreen reverts to localStorage-first loads.

#### Rollback Phase B

```bash
# Disable cloud-first writes
VITE_CLOUD_FIRST_WRITES=false

# Keep reads enabled (or disable both)
VITE_CLOUD_FIRST_READS=false

# Redeploy
npm run build
netlify deploy --prod
```

Effect: Saves revert to localStorage-first with background sync.

---

## Troubleshooting

### Common Issues

#### Issue: 403 Permission Denied (Storage)

**Symptoms**:
- Console: "permission-denied" errors
- Telemetry: High error rate
- Users can't load projects

**Causes**:
1. Storage rules not deployed
2. Rules misconfigured
3. User not authenticated

**Solution**:
```bash
# Verify rules deployed
npx firebase storage:rules:get

# Redeploy rules
npm run deploy:storage-rules

# Test rules in emulator
firebase emulators:start --only storage
```

#### Issue: High Latency (>2000ms)

**Symptoms**:
- Telemetry shows high latency
- Users report slow saves/loads
- Network tab shows slow requests

**Causes**:
1. Large showcases (>500KB)
2. Cold start (no cache)
3. Network issues
4. Firebase region mismatch

**Solutions**:
```typescript
// 1. Enable compression (Phase C)
// 2. Reduce showcase size
const showcaseSize = JSON.stringify(showcase).length;
if (showcaseSize > 500 * 1024) {
  console.warn('Showcase exceeds 500KB:', showcaseSize);
  // Consider optimization
}

// 3. Preload projects
projectLoadService.preloadProject(projectId);
```

#### Issue: Queue Not Processing

**Symptoms**:
- Operations stuck in queue
- Queued count increasing
- Auto-process not working

**Solutions**:
```javascript
// 1. Check online status
console.log('Online:', navigator.onLine);

// 2. Manually trigger process
await offlineQueue.processQueue();

// 3. Check dead letter queue
const deadLetter = offlineQueue.getDeadLetterQueue();
console.log('Dead letter:', deadLetter);
```

---

## Post-Deployment Checklist

### Immediately After Deployment

- [ ] Verify build deployed successfully
- [ ] Check Firebase Storage rules active
- [ ] Test basic save/load in production
- [ ] Verify telemetry dashboard accessible
- [ ] Monitor error logs for first 30 minutes
- [ ] Check Firestore document creation
- [ ] Verify Storage file uploads
- [ ] Test offline functionality

### First 24 Hours

- [ ] Monitor telemetry metrics hourly
- [ ] Check queue depth periodically
- [ ] Verify no critical errors
- [ ] Test conflict resolution scenarios
- [ ] Monitor Firebase costs
- [ ] Check dead letter queue
- [ ] Verify cache hit rates improving
- [ ] Test on multiple devices

### First Week

- [ ] Daily telemetry review
- [ ] Monitor success rates trend
- [ ] Check for patterns in errors
- [ ] Optimize slow operations
- [ ] Gather user feedback
- [ ] Document any issues encountered
- [ ] Plan next phase deployment

---

## Success Metrics

### Phase A Success (Cloud-First Reads)

- [ ] Load success rate >99.5% sustained
- [ ] Average latency <500ms
- [ ] Cache hit rate >60%
- [ ] No critical data loss incidents
- [ ] <10 error reports from users
- [ ] Offline fallback working correctly

### Phase B Success (Dual-Write)

- [ ] Save success rate >99.5% sustained
- [ ] Load success rate >99.5% sustained
- [ ] Queue processing correctly
- [ ] Conflict resolution working
- [ ] <5 operations in dead letter queue
- [ ] Sync status visible to users
- [ ] No data loss incidents

### Phase C Success (Deprecation)

- [ ] All projects migrated to cloud
- [ ] Background sync removed
- [ ] Legacy code paths removed
- [ ] Performance maintained or improved
- [ ] No regressions
- [ ] Codebase simplified
- [ ] Documentation updated

---

## Related Documentation

- **Phase A Integration**: `PHASE_A_INTEGRATION_GUIDE.md`
- **Phase B Integration**: `PHASE_B_INTEGRATION_GUIDE.md`
- **Phase C Deprecation**: `PHASE_C_DEPRECATION_GUIDE.md`
- **Main Plan**: `CLOUD_FIRST_REFINED_PLAN.md`
- **Implementation Status**: `IMPLEMENTATION_STATUS.md`
- **General Deployment**: `DEPLOYMENT_GUIDE.md`

---

**Last Updated**: 2025-10-15
**Next Review**: After each phase deployment
