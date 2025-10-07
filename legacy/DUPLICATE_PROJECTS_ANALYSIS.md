# 🔍 Duplicate/Empty Project Cards Analysis

## Problem Statement

**Issue:** When creating a new project and leaving/returning, multiple empty project cards appear in the dashboard. There should only be ONE project, and projects should NOT be saved until the educator completes the wizard and provides a name + initial idea.

---

## Root Cause Analysis

### 1. **Projects Are Created TOO EARLY** ❌

**Current Behavior:**
- Projects are created the **moment** a user clicks "Start New Project" or navigates to `/app/new`
- Location: `ChatLoader.tsx:75-187`

```typescript
// ChatLoader.tsx - Line 75
const [actualId, setActualId] = useState(() => {
  if (routeParamId?.startsWith('new-')) {
    const newBlueprintId = `bp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // ❌ PROBLEM: Saves IMMEDIATELY with empty data
    const newBlueprint = {
      id: newBlueprintId,
      wizardData: {
        projectTopic: qpTopic || '',      // Empty
        projectName: qpProjectName || '', // Empty
        learningGoals: '',                // Empty
        // ...
      },
      ideation: { bigIdea: '', essentialQuestion: '', challenge: '' }, // All empty
      // ...
    };

    // ❌ SAVES to localStorage immediately (line 155-157)
    localStorage.setItem(`blueprint_${newBlueprintId}`, JSON.stringify(newBlueprint));

    // ❌ ALSO saves to UnifiedStorage (line 162-178)
    unifiedStorage.saveProject({ ... });
  }
});
```

**Result:** Empty project saved BEFORE user enters ANY information.

### 2. **Multiple IDs Generated for Same Project** 🔄

**ID Generation Happens in Multiple Places:**

| Location | ID Format | When Generated |
|----------|-----------|----------------|
| **IntakeWizardMinimal.tsx:69** | `new-${Date.now()}` | When user clicks "Start Building" |
| **ChatLoader.tsx:77** | `bp_${Date.now()}_${random}` | When ChatLoader mounts with `new-` ID |
| **UnifiedStorageManager.ts:390** | `project_${Date.now()}_${uuid}` | When saveProject called without ID |

**Flow Example:**
1. User clicks "New Project" → navigates to `/app/new`
2. IntakeWizardMinimal creates ID: `new-1696348800000`
3. User fills wizard, clicks "Start Building"
4. Navigates to `/app/blueprint/new-1696348800000`
5. ChatLoader sees `new-` prefix, generates NEW ID: `bp_1696348800123_abc123def`
6. ChatLoader saves to localStorage with KEY: `blueprint_bp_1696348800123_abc123def`
7. ChatLoader saves to UnifiedStorage, which generates ANOTHER ID: `project_1696348800456_uuid-here`

**Result:** 3 DIFFERENT IDs for the SAME project!

### 3. **Zombie Projects from Incomplete Wizards** 👻

**Scenario:**
1. User starts wizard → navigates to `/app/new`
2. ChatLoader immediately creates and saves empty project
3. User closes tab/navigates away WITHOUT completing wizard
4. Empty project remains in localStorage AND UnifiedStorage
5. Appears on dashboard as empty card

**Why Empty Cards Appear:**
```typescript
// Dashboard.jsx:62-63
let summaries = await projectRepository.list(effectiveUserId);
console.log(`[Dashboard] Loaded ${summaries.length} projects`);
```

Dashboard loads ALL projects, including:
- Empty projects with no title
- Projects with only wizard metadata
- Abandoned projects from incomplete wizards

### 4. **Multiple Storage Locations** 🗃️

**A single project can be saved in 5 different places:**

| Storage Key | Location | When | Purpose |
|-------------|----------|------|---------|
| `blueprint_{id}` | localStorage | ChatLoader Line 155-157 | Legacy compatibility |
| `alf_project_{id}` | localStorage | UnifiedStorage Line 409 | Primary unified storage |
| `alf_backup_{id}_1-5` | localStorage | UnifiedStorage Line 507 | Backup rotation |
| `journey-v5-{id}` | localStorage | UnifiedStorage Line 563 | Chat service compat |
| Firestore `blueprints/{id}` | Firebase | UnifiedStorage Line 615 | Cloud sync |

**Result:** Same project stored in up to 5 locations with potentially different IDs.

---

## Data Flow Diagram

```
User Clicks "New Project"
         ↓
    /app/new (IntakeWizardMinimal)
         ↓
  Generates: new-{timestamp}
         ↓
  User fills wizard (or doesn't)
         ↓
  Clicks "Start Building"
         ↓
  Navigate: /app/blueprint/new-{timestamp}
         ↓
    ChatLoader mounts
         ↓
  ❌ Sees "new-" prefix
         ↓
  ❌ Generates NEW ID: bp_{timestamp}_{random}
         ↓
  ❌ Creates EMPTY project object
         ↓
  ❌ Saves to localStorage: blueprint_bp_{timestamp}_{random}
         ↓
  ❌ Saves to UnifiedStorage (may generate ANOTHER ID)
         ↓
  ❌ UnifiedStorage generates: project_{timestamp}_{uuid}
         ↓
  ❌ Saves to 5 different keys in localStorage + Firebase
         ↓
  User leaves/returns
         ↓
  Dashboard.list() finds ALL 3 IDs
         ↓
  ❌ Shows 3 empty project cards
```

---

## Why This Happens

### 1. **No Save Threshold** 📏
- No check for "has user entered meaningful data?"
- No minimum criteria (e.g., "must have title OR topic")
- Saves happen automatically, not on user action

### 2. **Premature Persistence** ⏰
- Saves happen on NAVIGATION, not on USER ACTION
- No "commit" or "save" button
- Autosave triggers even with empty forms

### 3. **ID Generation Chaos** 🎲
- 3 different ID formats in different files
- No central ID generation service
- Each component generates its own IDs independently

### 4. **No Cleanup Logic** 🧹
- Empty projects never get purged
- No "minimum content" validation
- Abandoned projects live forever

---

## Specific Code Locations

### **Creating Empty Projects:**
- **ChatLoader.tsx:75-187** - Main culprit, creates and saves on mount
- **IntakeWizardMinimal.tsx:69** - Creates initial `new-{timestamp}` ID

### **ID Generation:**
- **IntakeWizardMinimal.tsx:69** - `new-${Date.now()}`
- **ChatLoader.tsx:77** - `bp_${Date.now()}_${Math.random()...}`
- **UnifiedStorageManager.ts:390** - `project_${Date.now()}_${uuidv4()...}`

### **Multiple Saves:**
- **ChatLoader.tsx:155-157** - `localStorage.setItem('blueprint_{id}')`
- **ChatLoader.tsx:163-178** - `unifiedStorage.saveProject()`
- **UnifiedStorageManager.ts:129** - `saveToLocalStorage()`
- **UnifiedStorageManager.ts:560** - `syncChatServiceFormat()` - creates `journey-v5-{id}`

### **Dashboard Loading:**
- **Dashboard.jsx:50-94** - Fetches ALL projects, no filtering
- **ProjectRepository.ts:33-64** - Lists all projects with `deletedAt !== null`

---

## Examples of What's Being Saved

### Empty Project Example (from ChatLoader.tsx):
```json
{
  "id": "bp_1696348800123_abc123def",
  "wizardData": {
    "projectTopic": "",      // EMPTY
    "projectName": "",       // EMPTY
    "learningGoals": "",     // EMPTY
    "subjects": [],          // EMPTY
    "primarySubject": "",    // EMPTY
    "gradeLevel": "",        // EMPTY
    "duration": "medium",    // Only default value
  },
  "ideation": {
    "bigIdea": "",           // EMPTY
    "essentialQuestion": "", // EMPTY
    "challenge": ""          // EMPTY
  },
  "journey": {
    "phases": [],            // EMPTY
    "activities": [],        // EMPTY
    "resources": []          // EMPTY
  },
  "deliverables": {
    "milestones": [],        // EMPTY
    "rubric": { "criteria": [] }, // EMPTY
  },
  "capturedData": {},        // EMPTY
  "chatHistory": [],         // EMPTY
  "userId": "anonymous"
}
```

This gets saved with FIVE different localStorage keys:
1. `blueprint_bp_1696348800123_abc123def`
2. `alf_project_bp_1696348800123_abc123def`
3. `alf_backup_bp_1696348800123_abc123def_1`
4. `journey-v5-bp_1696348800123_abc123def`
5. Possibly MORE if UnifiedStorage generates a different ID

---

## The "Should Be" Behavior

### ✅ **When to Save:**
1. **After Wizard Completion** - User fills name + idea + subjects
2. **After First Chat Message** - User has engaged with the chatbot
3. **Manual Save Action** - User clicks "Save Draft" (if we add one)

### ✅ **When NOT to Save:**
1. **On Navigation** - Just because user clicked "New Project"
2. **On Mount** - ChatLoader should NOT auto-create
3. **Without Minimum Data** - Need at least: title OR topic OR one chat message

### ✅ **One Project = One ID:**
- Generate ID ONCE in ONE place
- Pass that ID through all components
- Never regenerate or transform IDs

### ✅ **Minimum Data Criteria:**
Before saving to dashboard index, require ONE of:
- Project has a title (`wizardData.projectName`)
- Project has a topic (`wizardData.projectTopic`)
- Project has chat history (`chatHistory.length > 0`)
- Project has captured data (`capturedData` not empty)

---

## Implementation Plan (5 Phases)

### **Phase 1: Prevent Premature Saves** 🚫
**Goal:** Don't create projects until user provides minimum data

**Changes:**
1. **ChatLoader.tsx** (Lines 75-187):
   - ❌ REMOVE immediate `localStorage.setItem()` on mount
   - ❌ REMOVE immediate `unifiedStorage.saveProject()` on mount
   - ✅ ADD: Create blueprint object in memory only
   - ✅ ADD: Save ONLY when user sends first chat message OR wizard completes

2. **IntakeWizardMinimal.tsx** (Line 68-80):
   - ✅ KEEP ID generation (`new-{timestamp}`)
   - ❌ REMOVE any saving logic (if present)
   - ✅ Pass ID through URL params only

**Validation Check:**
```typescript
function shouldSaveProject(project: any): boolean {
  return !!(
    project.wizardData?.projectName ||
    project.wizardData?.projectTopic ||
    project.chatHistory?.length > 0 ||
    (project.capturedData && Object.keys(project.capturedData).length > 0)
  );
}
```

### **Phase 2: Centralize ID Generation** 🎯
**Goal:** One source of truth for project IDs

**Changes:**
1. **Create new file:** `/src/services/ProjectIdService.ts`
```typescript
export function generateProjectId(): string {
  return `bp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

export function isTemporaryId(id: string): boolean {
  return id.startsWith('new-');
}

export function convertTemporaryId(tempId: string): string {
  // Convert new-{timestamp} to permanent bp_{timestamp}_{random}
  return generateProjectId();
}
```

2. **Update all ID generation sites:**
   - IntakeWizardMinimal.tsx:69 → Use `ProjectIdService.generateProjectId()`
   - ChatLoader.tsx:77 → Use `ProjectIdService.convertTemporaryId()`
   - UnifiedStorageManager.ts:390 → Use `ProjectIdService.generateProjectId()`

### **Phase 3: Add Save Validation** ✅
**Goal:** Only save projects with meaningful content

**Changes:**
1. **UnifiedStorageManager.ts** - Add validation before save (Line 119):
```typescript
async saveProject(projectData: Partial<UnifiedProjectData>): Promise<string> {
  // ✅ NEW: Validate minimum data
  if (!this.hasMinimumData(projectData)) {
    console.log('[UnifiedStorageManager] Skipping save - no minimum data');
    return projectData.id || 'temp-not-saved';
  }

  // Continue with existing save logic...
}

private hasMinimumData(data: Partial<UnifiedProjectData>): boolean {
  return !!(
    data.title?.trim() ||
    (data.wizardData as any)?.projectName?.trim() ||
    (data.wizardData as any)?.projectTopic?.trim() ||
    (data.chatHistory && (data.chatHistory as any[]).length > 0) ||
    (data.capturedData && Object.keys(data.capturedData).length > 0)
  );
}
```

2. **ChatLoader.tsx** - Only save when user interacts:
```typescript
// ❌ Remove lines 155-178 (immediate saves)

// ✅ Add: Save only when user sends message
// This would be triggered by ChatMVP when user submits first message
```

### **Phase 4: Clean Up Orphaned Projects** 🧹
**Goal:** Remove empty/abandoned projects

**Changes:**
1. **ProjectRepository.ts** - Add cleanup method:
```typescript
async cleanupEmptyProjects(): Promise<number> {
  const projects = await unifiedStorage.listProjects();
  let count = 0;

  for (const project of projects) {
    // Load full project data
    const fullProject = await unifiedStorage.loadProject(project.id);

    if (!fullProject) continue;

    // Check if empty
    const isEmpty = !(
      fullProject.title?.trim() ||
      fullProject.wizardData?.projectName?.trim() ||
      fullProject.wizardData?.projectTopic?.trim() ||
      fullProject.chatHistory?.length > 0 ||
      (fullProject.capturedData && Object.keys(fullProject.capturedData).length > 0)
    );

    if (isEmpty) {
      await unifiedStorage.deleteProject(project.id);
      count++;
    }
  }

  return count;
}
```

2. **Dashboard.jsx** - Run cleanup on mount:
```typescript
useEffect(() => {
  // Existing fetch logic...

  // ✅ NEW: Cleanup empty projects on dashboard load
  projectRepository.cleanupEmptyProjects().catch(console.warn);
}, [effectiveUserId]);
```

### **Phase 5: Consolidate Storage Locations** 📦
**Goal:** Reduce from 5 storage locations to 2 (localStorage + Firebase)

**Changes:**
1. **Remove redundant keys:**
   - ❌ Remove: `blueprint_{id}` (legacy)
   - ❌ Remove: `journey-v5-{id}` (chat service compat)
   - ❌ Remove: Multiple backup keys per project
   - ✅ Keep: `alf_project_{id}` (primary)
   - ✅ Keep: `alf_backup_{id}_1` (single backup)
   - ✅ Keep: Firestore sync (when online)

2. **UnifiedStorageManager.ts** (Line 560-569):
```typescript
// ❌ REMOVE syncChatServiceFormat() method
// This creates extra journey-v5-{id} keys

// ❌ REMOVE multiple backup rotation (Line 490-511)
// Keep only ONE backup, not 5

private async createBackup(id: string): Promise<void> {
  const existingData = await this.loadFromLocalStorage(id);
  if (!existingData) return;

  // ✅ Keep only ONE backup
  const backupKey = `${this.BACKUP_PREFIX}${id}_1`;
  localStorage.setItem(backupKey, JSON.stringify(existingData));
}
```

---

## Expected Outcomes After Fix

### Before (Current):
```
User creates project → Navigates away → Returns to dashboard
Result: 3-5 empty project cards appear
```

### After (Fixed):
```
User creates project → Navigates away → Returns to dashboard
Result: NO project cards (user didn't complete wizard)

User creates project → Completes wizard → Returns to dashboard
Result: 1 project card with title/topic

User creates project → Sends first chat message → Returns to dashboard
Result: 1 project card with title or "Untitled Project"
```

---

## Testing Checklist

### ✅ Test Case 1: Abandon Wizard Early
1. Click "New Project"
2. Close tab immediately
3. Return to dashboard
4. **Expected:** No new project card

### ✅ Test Case 2: Complete Wizard
1. Click "New Project"
2. Fill out wizard completely
3. Click "Start Building"
4. Send one chat message
5. Return to dashboard
6. **Expected:** Exactly ONE project card with correct title

### ✅ Test Case 3: Multiple New Projects
1. Create 5 new projects
2. Complete wizard for 2, abandon 3
3. Return to dashboard
4. **Expected:** Exactly 2 project cards (not 5)

### ✅ Test Case 4: ID Consistency
1. Create new project
2. Note the ID in URL
3. Complete wizard
4. Check dashboard card ID
5. **Expected:** Same ID throughout (no regeneration)

### ✅ Test Case 5: localStorage Cleanup
1. Create 10 projects, abandon all
2. Run cleanup
3. Check localStorage keys
4. **Expected:** No `blueprint_`, `alf_project_`, or `journey-v5-` keys

---

## Risks & Considerations

### ⚠️ **Breaking Changes:**
- Existing empty projects will remain until cleanup runs
- Users with abandoned projects may see them disappear
- Migration needed for `blueprint_` → `alf_project_` keys

### ⚠️ **Data Loss Risk:**
- If validation is too strict, legitimate projects might not save
- Need careful testing of "minimum data" criteria

### ⚠️ **Performance:**
- Cleanup on dashboard mount could be slow with many projects
- Consider debouncing or background cleanup

---

## Recommended Priority

1. **Phase 1** (High Priority) - Stop creating empty projects
2. **Phase 4** (High Priority) - Clean up existing empty projects
3. **Phase 2** (Medium Priority) - Centralize ID generation
4. **Phase 3** (Medium Priority) - Add save validation
5. **Phase 5** (Low Priority) - Consolidate storage (optimization)

---

## Summary

**Root Cause:** Projects are created and saved IMMEDIATELY when user clicks "New Project", before any meaningful data is entered.

**Impact:** Multiple empty project cards clutter the dashboard.

**Solution:** Delay saves until user provides minimum data (title, topic, or first chat message), centralize ID generation, and clean up empty projects.

**Effort:** Medium (2-3 days of focused work)

**Risk:** Low (mostly adding validation, not changing core logic)
