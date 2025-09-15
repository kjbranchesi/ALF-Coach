# Hero Project System Audit Report

## Executive Summary

Adding a new hero project (Sensing Self) is causing cascading errors due to **unnecessary architectural complexity**. The system has evolved into a convoluted dual-registry pattern with multiple layers of abstraction that make simple additions error-prone.

## Core Architectural Issues

### 1. Dual Registry Pattern (Root Cause)
The system maintains **two parallel registries** that must be kept in sync:

```
/src/utils/hero/index.ts          → Hero data registry (complete project data)
/src/utils/sampleBlueprints.ts    → Blueprint orchestrator (builds SampleBlueprint objects)
```

**Problem**: When adding a new project, you must:
1. Create the hero data file (`hero-sensing-self.ts`)
2. Register it in the hero registry (`hero/index.ts`)
3. Create a builder function (`sampleBlueprints/hero-sensing-self.ts`)
4. Register the builder in the orchestrator (`sampleBlueprints.ts`)
5. Export the builder from the barrel file (`sampleBlueprints/index.ts`)
6. Add metadata to HERO_PROJECTS array

**Six places to update for one project!**

### 2. Data Structure Mismatch
- **HeroProjectData**: Rich, structured data with typed fields
- **SampleBlueprint**: Generic structure with lots of `any` types
- **Builder functions**: Transform HeroProjectData → SampleBlueprint (lossy conversion)

The builder functions are essentially **adapters** that map between incompatible data structures, adding unnecessary complexity.

### 3. Component Confusion
```
SamplesGallery.tsx → Shows project cards
  ↓ (navigates to)
/app/samples/:id → Routes to SamplePreview.tsx
  ↓ (renders)
HeroProjectShowcase.tsx → Displays full project
  ↓ (fetches data from)
BOTH hero registry AND sampleBlueprints (fallback pattern)
```

The component has to check both data sources because it doesn't know which system to trust.

### 4. React Error #130 (Undefined Component)
This occurs when:
- The hero data exists in the registry
- But the builder function isn't properly exported
- Or the orchestrator doesn't have the switch case
- Leading to undefined components being passed to React

## Why Is Adding a Hero Project So Complicated?

Because the system is trying to serve **three different purposes** with **two incompatible data structures**:

1. **Legacy samples**: Old format using SampleBlueprint
2. **Hero projects**: New rich format using HeroProjectData
3. **User projects**: Runtime-created blueprints

Instead of migrating to a single system, the codebase maintains both with complex adapters between them.

## Simple Solution: Single Source of Truth

### Option 1: Minimal Fix (Quick)
Create a single registry that auto-generates everything:

```typescript
// /src/utils/hero-projects.ts
import { heroSustainabilityData } from './hero/hero-sustainability';
import { heroSensingSelfData } from './hero/hero-sensing-self';
// ... other imports

export const HERO_PROJECTS = [
  heroSustainabilityData,
  heroSensingSelfData,
  // ... just add new projects here
];

// Auto-generate everything else
export function getHeroProject(id: string) {
  return HERO_PROJECTS.find(p => p.id === id);
}

export function getAllHeroProjects() {
  return HERO_PROJECTS;
}

export function buildSampleBlueprint(heroData: HeroProjectData, userId: string): SampleBlueprint {
  // Single adapter function used by all projects
  return {
    id: heroData.id,
    userId,
    title: heroData.title,
    // ... standard mapping
  };
}
```

### Option 2: Proper Fix (Better)
Migrate everything to use HeroProjectData directly:

1. Update SamplesGallery to use HeroProjectData
2. Remove the SampleBlueprint intermediary
3. Delete all builder functions
4. Single import, single registry

### Implementation Steps for Option 1

1. **Create unified registry** (`/src/utils/hero-projects.ts`)
2. **Update SamplesGallery** to use the unified registry
3. **Update HeroProjectShowcase** to only check one source
4. **Delete the builder functions** (no longer needed)
5. **Simplify exports** - one place to add projects

## Benefits of Simplification

### Current Process (6 steps):
1. Create hero data file ✓
2. Add to hero registry ✓
3. Create builder function ✗
4. Add to orchestrator ✗
5. Export from barrel ✗
6. Add metadata ✗

### New Process (2 steps):
1. Create hero data file ✓
2. Import in unified registry ✓

**That's it!**

## Immediate Actions

1. **Stop adding to the current system** - it's broken by design
2. **Implement the minimal fix** - 1-2 hours of work
3. **Test with Sensing Self** as the proof
4. **Document the new simple process**

## Code Smells Identified

- **Adapter Pattern Abuse**: Builder functions that just shuffle data
- **Dual Source of Truth**: Two registries for the same data
- **Type Erosion**: Rich types → any types → runtime errors
- **Defensive Coding**: Components checking multiple sources "just in case"
- **Barrel File Complexity**: Multiple export points for confusion

## Conclusion

The system is over-engineered for its requirements. A simple array of projects with a single registry would eliminate 90% of the complexity and make adding new projects trivial.

**Recommended approach**: Implement Option 1 immediately to unblock development, then plan migration to Option 2 for long-term maintainability.