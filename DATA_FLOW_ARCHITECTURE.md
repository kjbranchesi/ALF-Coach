# ALF Coach Data Flow Architecture

## Overview
ALF Coach uses a hybrid storage approach with Firebase Firestore as the primary database and localStorage as a fallback for offline functionality.

## Data Structures

### Blueprint Document Structure
The blueprint is the core data structure that stores all project information.

```typescript
interface BlueprintDoc {
  // Identification
  id?: string;                    // Unique blueprint ID
  userId: string;                  // User ID (or 'anonymous')
  name?: string;                   // Auto-generated project name
  
  // Wizard Data (Project Setup)
  wizard: {
    vision: string;                // Project vision/motivation
    subject: string;               // Subject area
    students: string;              // Student demographics
    location: string;              // Learning location
    resources: string;             // Available resources
    scope: string;                 // Project scope (unit/semester/year)
    
    // Additional fields for compatibility
    topic?: string;                // Subject/topic alias
    timeline?: string;             // Duration (e.g., "4 weeks")
    gradeLevel?: string;           // Grade level
    duration?: string;             // Project duration
    alfFocus?: string;             // ALF methodology focus
    materials?: string;            // Physical materials
    teacherResources?: string;     // Teacher resources
  };
  
  // Ideation Data
  ideation: {
    bigIdea: string;               // Core concept
    essentialQuestion: string;     // Driving question
    challenge: string;             // Student challenge
  };
  
  // Learning Journey Data
  journey: {
    phases: Phase[];               // Learning phases
    activities: string[];          // Learning activities
    resources: string[];           // Learning resources
  };
  
  // Deliverables Data
  deliverables: {
    milestones: Milestone[];       // Project milestones
    rubric: { criteria: any[] };   // Assessment rubric
    impact: {                      // Impact assessment
      audience: string;
      method: string;
    };
  };
  
  // Timestamps (INCONSISTENCY ISSUE)
  // SOPTypes.ts version:
  timestamps: {
    created: Date;
    updated: Date;
  };
  // OR useBlueprintDoc.ts version:
  createdAt: Date;
  updatedAt: Date;
  
  // Metadata
  currentStep?: string;            // Current workflow step
  schemaVersion: string;           // Schema version for migrations
}
```

## Data Flow Paths

### 1. Project Creation Flow

```
User → Wizard Component → WizardWrapper → Firebase/localStorage
```

1. **User completes wizard** (Wizard.tsx)
2. **WizardWrapper processes data** (WizardWrapper.tsx)
   - Creates blueprint structure
   - Assigns unique ID
   - Sets initial timestamps
3. **Storage Decision**:
   - If online: Save to Firebase → Also backup to localStorage
   - If offline: Save to localStorage only
4. **Navigation**: Redirect to chat interface with blueprintId

### 2. Project Loading Flow

```
Dashboard → Firebase Query + localStorage → Project List Display
```

1. **Dashboard Component** (Dashboard.jsx)
   - Queries Firebase for user's blueprints
   - Loads localStorage blueprints as fallback
   - Merges and deduplicates results
2. **Display**: Shows unified project list

### 3. Project Editing Flow

```
Chat Interface → SOPFlowManager → Firebase/localStorage
```

1. **User interacts** in ChatInterface
2. **SOPFlowManager updates** blueprint state
3. **Auto-save triggers**:
   - Updates Firebase if online
   - Updates localStorage as backup

## Current Issues

### 1. Timestamp Field Inconsistency
- **Problem**: Different components use different timestamp fields
  - SOPTypes.ts: `timestamps.created` and `timestamps.updated`
  - useBlueprintDoc.ts: `createdAt` and `updatedAt`
  - WizardWrapper.tsx: Creates `createdAt/updatedAt` but SOPFlowManager expects `timestamps.*`

### 2. Wizard Field Access Error
- **Problem**: SOPFlowManager line 959 tries to access `wizard[key]` when wizard might be undefined
- **Cause**: Blueprint might not have wizard data initialized

### 3. Projects Not Appearing
- **Possible Causes**:
  - Timestamp field mismatch preventing proper save
  - userId mismatch (anonymous vs actual user ID)
  - localStorage key format issues

## Storage Locations

### Firebase Firestore
- **Collection**: `blueprints`
- **Document ID**: Auto-generated or UUID
- **Query**: By `userId` field

### localStorage
- **Key Format**: `blueprint_{blueprintId}`
- **Value**: JSON stringified blueprint
- **Filtering**: By parsing and checking userId field

## User ID Handling

- **Authenticated Users**: Use Firebase Auth UID
- **Anonymous Users**: Use string `'anonymous'`
- **Consistency**: Same userId must be used for save and retrieval

## Fix Strategy

1. **Standardize Timestamp Fields**:
   - Use `createdAt` and `updatedAt` consistently
   - Remove `timestamps` nested object
   - Update all components to use the same fields

2. **Fix Wizard Field Safety**:
   - Add null checks in SOPFlowManager
   - Ensure wizard is always initialized

3. **Improve Error Handling**:
   - Better error messages for save failures
   - Clear feedback when projects are saved locally vs cloud

4. **Add Data Migration**:
   - Handle both timestamp formats during transition
   - Convert old format to new on load

## Testing Checklist

- [ ] Create new project → Appears in dashboard
- [ ] Create project offline → Appears in dashboard
- [ ] Edit project → Changes persist
- [ ] Reload page → Projects still visible
- [ ] Switch between online/offline → Data syncs properly
- [ ] Anonymous user → Can create and see projects
- [ ] Creative Process Journey → Saves properly