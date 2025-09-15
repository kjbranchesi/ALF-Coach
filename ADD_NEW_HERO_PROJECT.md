# How to Add a New Hero Project (Simplified!)

## Old Way (6 steps) ❌
1. Create hero data file
2. Add to hero registry
3. Create builder function
4. Add to orchestrator
5. Export from barrel
6. Add metadata

## New Way (2 steps) ✅

### Step 1: Create Your Hero Data File
Create a new file in `/src/utils/hero/` with your project data:

```typescript
// /src/utils/hero/hero-your-project.ts
import { HeroProjectData } from './types';

export const heroYourProjectData: HeroProjectData = {
  id: 'hero-your-project',
  title: 'Your Amazing Project',
  // ... all your project data
};
```

### Step 2: Add to Registry
Open `/src/utils/hero-projects.ts` and add two lines:

```typescript
// 1. Import your project
import { heroYourProjectData } from './hero/hero-your-project';

// 2. Add to the array
export const HERO_PROJECTS: HeroProjectData[] = [
  heroSustainabilityData,
  heroCommunityHistoryData,
  heroAssistiveTechData,
  heroSensingSelfData,
  heroYourProjectData, // <-- Just add it here!
];
```

## That's It! 🎉

Your project will now:
- Appear in the gallery
- Be routable at `/app/samples/hero-your-project`
- Have all the showcase features
- Work with all existing components

## Testing Your New Project

1. Navigate to `/app/samples` - your project should appear
2. Click on it - it should display with all features
3. Check the console for any missing data warnings

## Why This Works

The new system:
- Has a single source of truth (HERO_PROJECTS array)
- Auto-generates all metadata
- Uses the same data structure everywhere
- Eliminates adapter functions
- Removes duplicate registrations

## Migrating Existing Projects

If you have projects in the old system:
1. Keep the hero data file as-is
2. Delete the builder function
3. Remove from sampleBlueprints.ts
4. Add to hero-projects.ts

## Benefits

- **2 steps instead of 6**
- **No more undefined component errors**
- **No more data mismatches**
- **Easy to understand and maintain**
- **Single place to manage all projects**