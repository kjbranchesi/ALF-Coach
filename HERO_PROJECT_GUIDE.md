# Hero Project Development Guide

## Table of Contents
1. [Overview](#overview)
2. [Quick Start](#quick-start)
3. [Data Structure Requirements](#data-structure-requirements)
4. [Using Builder Functions](#using-builder-functions)
5. [Validation System](#validation-system)
6. [Common Pitfalls and Solutions](#common-pitfalls-and-solutions)
7. [Testing Your Hero Project](#testing-your-hero-project)
8. [Troubleshooting](#troubleshooting)

## Overview

Hero Projects are comprehensive, data-driven educational projects in ALF Coach. This guide ensures you create correctly structured hero projects that work seamlessly with all components.

### Key Principles
- **Type Safety**: Use TypeScript types and builder functions
- **Validation**: All data is validated at runtime in development
- **Normalization**: Data is automatically normalized (e.g., 'medium' → 'med')
- **Error Prevention**: Builder functions prevent common mistakes

## Quick Start

### Step 1: Create Your Hero Project File

Create a new file in `/src/utils/hero/` named `hero-[your-project].ts`:

```typescript
import { HeroProjectData } from './types';
import {
  createPhase,
  createMilestone,
  createRisk,
  createContingency,
  createConstraints,
  createRubricCriteria
} from './builders';

export const heroYourProjectData: HeroProjectData = {
  // Your project data here
};
```

### Step 2: Use the Template

Start with the template function:

```typescript
import { createHeroProjectTemplate } from './builders';

const baseProject = createHeroProjectTemplate({
  id: 'hero-your-project',
  title: 'Your Amazing Project',
  duration: '8 weeks',
  gradeLevel: 'High School (9-12)',
  subjects: ['Science', 'Math', 'ELA']
});

export const heroYourProjectData: HeroProjectData = {
  ...baseProject,
  // Add your specific data
} as HeroProjectData;
```

### Step 3: Register Your Project

Add your project to `/src/utils/hero/index.ts`:

```typescript
import { heroYourProjectData } from './hero-your-project';

export const heroProjectRegistry: Record<string, HeroProjectData> = {
  // ... existing projects
  'hero-your-project': wrapHeroProject(heroYourProjectData),
};
```

## Data Structure Requirements

### Critical Fields That MUST Match Expected Formats

#### 1. Risk Levels
```typescript
// CORRECT ✅
likelihood: 'low' | 'med' | 'high'
impact: 'low' | 'med' | 'high'

// WRONG ❌
likelihood: 'medium'  // Will be auto-normalized to 'med'
impact: 'moderate'    // Will be auto-normalized to 'med'
```

#### 2. Risk Structure
```typescript
// CORRECT ✅
const risk = {
  id: 'r1',
  name: 'Technology gaps',  // MUST be 'name'
  likelihood: 'med',
  impact: 'high',
  mitigation: 'Provide alternatives'
};

// WRONG ❌
const risk = {
  id: 'r1',
  risk: 'Technology gaps',  // Should be 'name', not 'risk'
  likelihood: 'medium',     // Should be 'med'
  // ...
};
```

#### 3. Contingency Structure
```typescript
// CORRECT ✅
const contingency = {
  id: 'c1',
  scenario: 'Timeline compressed',  // MUST be 'scenario'
  plan: 'Combine phases'
};

// WRONG ❌
const contingency = {
  id: 'c1',
  trigger: 'Timeline compressed',  // Should be 'scenario', not 'trigger'
  plan: 'Combine phases'
};
```

#### 4. Tech Access Levels
```typescript
// CORRECT ✅
techAccess: 'full' | 'limited' | 'none'

// WRONG ❌
techAccess: 'partial'  // Will be auto-normalized to 'limited'
```

## Using Builder Functions

### Always Use Builders for Complex Data

#### Creating Risks
```typescript
import { createRisk } from './builders';

// The builder handles normalization automatically
const risk = createRisk({
  id: 'r1',
  name: 'Budget constraints',
  likelihood: 'medium',  // Automatically normalized to 'med'
  impact: 'high',
  mitigation: 'Seek additional funding sources'
});
```

#### Creating Contingencies
```typescript
import { createContingency } from './builders';

const contingency = createContingency({
  id: 'c1',
  scenario: 'Partner unavailable',  // Always uses 'scenario'
  plan: 'Use virtual collaboration'
});
```

#### Creating Constraints
```typescript
import { createConstraints } from './builders';

const constraints = createConstraints({
  budgetUSD: 500,
  techAccess: 'partial',  // Normalized to 'limited'
  materials: ['Computers', 'Cameras'],
  safetyRequirements: ['Adult supervision']
});
```

#### Creating Complete Feasibility Data
```typescript
import { createFeasibilityData } from './builders';

const feasibilityData = createFeasibilityData({
  constraints: {
    budgetUSD: 500,
    techAccess: 'limited',
    materials: ['Laptops', 'Software licenses'],
    safetyRequirements: ['Permission slips', 'Adult supervision']
  },
  risks: [
    {
      id: 'r1',
      name: 'Technology failures',
      likelihood: 'medium',  // Auto-normalized
      impact: 'high',
      mitigation: 'Have backup plans'
    }
  ],
  contingencies: [
    {
      id: 'c1',
      scenario: 'Timeline compressed',
      plan: 'Focus on core objectives'
    }
  ]
});
```

### Creating Phases
```typescript
import { createPhase, createActivity } from './builders';

const discoverPhase = createPhase({
  id: 'discover',
  name: 'Discover',
  duration: '2 weeks',
  description: 'Research and exploration phase',
  objectives: [
    'Understand the problem space',
    'Identify stakeholders'
  ],
  activities: [
    createActivity({
      name: 'Literature Review',
      type: 'individual',
      duration: '3 days',
      description: 'Research existing solutions'
    })
  ]
});
```

### Creating Rubrics
```typescript
import { createRubricCriteria } from './builders';

const rubricItem = createRubricCriteria({
  category: 'Research Quality',
  weight: 25,
  exemplary: {
    description: 'Comprehensive research with multiple credible sources',
    points: 4
  },
  proficient: {
    description: 'Good research with adequate sources',
    points: 3
  },
  developing: {
    description: 'Basic research with some sources',
    points: 2
  },
  beginning: {
    description: 'Limited research',
    points: 1
  }
});
```

## Validation System

### Automatic Development Validation

In development mode, all hero projects are automatically validated when loaded:

1. **Structure Validation**: Checks required fields exist
2. **Type Validation**: Ensures correct data types
3. **Value Validation**: Normalizes and validates values
4. **Console Feedback**: Clear error messages with suggestions

### Manual Validation

You can manually validate data:

```typescript
import { validateHeroProject, formatValidationResults } from './validation';

const results = validateHeroProject(myProjectData);
if (!results.valid) {
  console.error(formatValidationResults(results));
}
```

### Component-Level Validation

The FeasibilityPanel automatically validates its props:

```typescript
// In your component
<FeasibilityPanel
  constraints={anyConstraintData}  // Automatically validated
  risks={anyRiskArray}             // Automatically normalized
  contingencies={anyContingencyArray}  // Automatically fixed
/>
```

## Common Pitfalls and Solutions

### Pitfall 1: Wrong Risk Property Names
```typescript
// WRONG ❌
{
  risk: 'Budget overrun',  // Should be 'name'
  category: 'financial',   // Not needed
  ...
}

// CORRECT ✅
{
  name: 'Budget overrun',
  ...
}

// SOLUTION: Use the builder
const risk = createRisk({
  id: 'r1',
  name: 'Budget overrun',  // Builder ensures correct property
  // ...
});
```

### Pitfall 2: Wrong Risk Levels
```typescript
// WRONG ❌
{
  likelihood: 'medium',  // Should be 'med'
  impact: 'moderate',    // Should be 'med'
}

// SOLUTION: Builder auto-normalizes
const risk = createRisk({
  likelihood: 'medium',  // Automatically becomes 'med'
  impact: 'moderate',    // Automatically becomes 'med'
  // ...
});
```

### Pitfall 3: Array vs Object Confusion
```typescript
// WRONG ❌
constraints: [  // Should be an object
  'Budget: $500',
  'Tech: Limited'
]

// CORRECT ✅
constraints: {
  budgetUSD: 500,
  techAccess: 'limited'
}

// SOLUTION: Use the builder
const constraints = createConstraints({
  budgetUSD: 500,
  techAccess: 'limited'
});
```

### Pitfall 4: Missing IDs
```typescript
// WRONG ❌
risks: [
  {
    name: 'Some risk',  // Missing ID
    // ...
  }
]

// CORRECT ✅
risks: [
  {
    id: 'r1',  // Always include ID
    name: 'Some risk',
    // ...
  }
]
```

## Testing Your Hero Project

### Step 1: Enable Development Mode
Ensure `NODE_ENV=development` to enable automatic validation.

### Step 2: Check Console Output
Look for validation messages:
- ✅ Green success messages
- ⚠️ Orange warnings (non-critical)
- ❌ Red errors (must fix)

### Step 3: Test in FeasibilityPanel
```typescript
// Create a test component
function TestFeasibility() {
  const projectData = getHeroProject('hero-your-project');

  return (
    <FeasibilityPanel
      constraints={projectData?.constraints}
      risks={projectData?.risks}
      contingencies={projectData?.contingencies}
    />
  );
}
```

### Step 4: Use Debug Helper
```typescript
import { debugValidateData } from './dev-validation';

// In browser console or component
debugValidateData(myProjectData, 'project');
debugValidateData(feasibilityData, 'feasibility');
```

## Troubleshooting

### Error: "Risk must have a name property"
**Cause**: Using 'risk' instead of 'name' property
**Solution**:
```typescript
// Change from:
{ risk: 'Something' }
// To:
{ name: 'Something' }
// Or use builder:
createRisk({ name: 'Something', ... })
```

### Error: "Invalid risk level: 'medium'"
**Cause**: Using 'medium' instead of 'med'
**Solution**:
```typescript
// Use builder for auto-normalization:
createRisk({ likelihood: 'medium', ... })  // Auto-converts to 'med'
```

### Error: "Contingency must have a scenario property"
**Cause**: Using 'trigger' instead of 'scenario'
**Solution**:
```typescript
// Change from:
{ trigger: 'Something' }
// To:
{ scenario: 'Something' }
// Or use builder:
createContingency({ scenario: 'Something', ... })
```

### Warning: "Missing theme field"
**Cause**: Incomplete theme object
**Solution**: Use the template or provide all theme fields:
```typescript
theme: {
  primary: 'blue',
  secondary: 'purple',
  accent: 'amber',
  gradient: 'from-blue-600 to-purple-600'
}
```

## Migration Guide

### Migrating Existing Data

If you have existing data with old formats:

```typescript
import { migrateRisks, migrateContingencies } from './builders';

// Old format risks
const oldRisks = [
  { risk: 'Something', likelihood: 'medium', ... }
];

// Migrate to new format
const newRisks = migrateRisks(oldRisks);

// Old format contingencies
const oldContingencies = [
  { trigger: 'Something', ... }
];

// Migrate to new format
const newContingencies = migrateContingencies(oldContingencies);
```

## Best Practices

1. **Always use builder functions** for complex data structures
2. **Run in development mode** to catch issues early
3. **Check console output** for validation messages
4. **Use the template** as a starting point
5. **Test with FeasibilityPanel** to ensure compatibility
6. **Document any custom fields** you add
7. **Keep IDs unique** within each array

## Examples

### Complete Minimal Hero Project

```typescript
import { HeroProjectData } from './types';
import { createHeroProjectTemplate, createRisk, createContingency } from './builders';

const template = createHeroProjectTemplate({
  id: 'hero-example',
  title: 'Example Project',
  duration: '6 weeks',
  gradeLevel: 'Middle School (6-8)',
  subjects: ['Science', 'Math']
});

export const heroExampleData: HeroProjectData = {
  ...template,

  // Add feasibility data
  feasibility: {
    constraints: createConstraints({
      budgetUSD: 300,
      techAccess: 'limited'
    }),
    risks: [
      createRisk({
        id: 'r1',
        name: 'Time constraints',
        likelihood: 'medium',  // Auto-normalized to 'med'
        impact: 'high',
        mitigation: 'Streamline activities'
      })
    ],
    contingencies: [
      createContingency({
        id: 'c1',
        scenario: 'Behind schedule',
        plan: 'Focus on core objectives'
      })
    ]
  }
} as HeroProjectData;
```

## Support

If you encounter issues:

1. Check the console for detailed error messages
2. Use the debug validation helper
3. Refer to existing hero projects as examples
4. Ensure you're using the latest builder functions
5. Verify your data matches the TypeScript types

Remember: The validation system is designed to help you catch issues early. Pay attention to console messages in development mode!