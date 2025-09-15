# Hero Projects - Technical Specification

## Purpose
Hero projects are exemplar PBL implementations that demonstrate the full capabilities of the ALF Coach platform. They serve as proof of concept for what educators can build using the system.

## System Architecture

### 1. Data Layer

#### Primary Data Structure
```typescript
// Location: /src/utils/hero/types.ts
interface HeroProjectData {
  id: string;                    // Unique identifier
  title: string;                  // Display title
  subjects: string[];             // Subject areas
  gradeLevel: string;             // Target grade
  duration: string;               // Time span

  // Nested data structures
  hero: HeroInfo;                 // Project metadata
  overview: Overview;             // High-level summary
  context: Context;               // Problem context
  bigIdea: BigIdea;              // Core educational concept
  journey: Journey;               // Learning progression
  assessment: Assessment;         // Evaluation framework
  standards: Standards;           // Curriculum alignment
  resources: Resources;           // Required materials
  impact: Impact;                 // Measurable outcomes
  feasibility: Feasibility;       // Implementation requirements
  courseAbstract: CourseAbstract; // Syllabus-style overview
}
```

#### Data Storage Pattern
```
/src/utils/hero/
├── hero-sustainability.ts      # 4500 lines - Complete project data
├── hero-community-history.ts   # 4200 lines - Complete project data
├── hero-assistive-tech.ts      # 4300 lines - Complete project data
├── hero-sensing-self.ts        # 4400 lines - Complete project data
```

Each file exports a single constant containing the complete project specification.

### 2. Registration System

#### Hero Registry (`/src/utils/hero/index.ts`)
```typescript
export const heroProjectRegistry: Record<string, HeroProjectData> = {
  'hero-sustainability-campaign': wrapHeroProject(heroSustainabilityData),
  'hero-community-history': wrapHeroProject(heroCommunityHistoryData),
  'hero-assistive-tech': wrapHeroProject(heroAssistiveTechData),
  'hero-sensing-self': wrapHeroProject(heroSensingSelfData),
};
```

The `wrapHeroProject` function provides runtime validation in development mode.

#### Sample Blueprint Bridge (`/src/utils/sampleBlueprints/`)
Hero projects are converted to the legacy `SampleBlueprint` format for backward compatibility:

```typescript
// Example: hero-sensing-self.ts
export function buildSensingSelfHero(userId: string): SampleBlueprint {
  const heroData = getHeroProject('hero-sensing-self');

  return {
    id: 'hero-sensing-self',
    userId,
    wizardData: {
      projectTopic: heroData.title,
      subjects: heroData.subjects,
      gradeLevel: 'high',
      duration: 'long',
    },
    ideation: {
      bigIdea: heroData.bigIdea.statement,
      essentialQuestion: heroData.bigIdea.essentialQuestion,
      challenge: heroData.bigIdea.challenge
    },
    blueprint: {
      ideation: { /* mapped data */ },
      journey: { /* mapped data */ },
      deliverables: { /* mapped data */ }
    },
    createdAt: ts(),
    updatedAt: ts()
  };
}
```

### 3. Display Pipeline

#### Gallery Display (`/src/components/SamplesGallery.tsx`)
```typescript
// Data fetch
const samples = getAllSampleBlueprints(uid);

// Card generation
const cards = samples.map((s) => ({
  id: s.id,
  title: s.wizardData?.projectTopic,
  subtitle: s.ideation?.essentialQuestion,
  gradeLevel: s.wizardData?.gradeLevel,
  isComplete: ['hero-sustainability-campaign', /* ... */].includes(s.id)
}));
```

#### Detail Display (`/src/pages/HeroProjectShowcase.tsx`)
```typescript
// Direct hero data access
const heroData = getHeroProject(id);

// Sections rendered (in order):
1. Course Abstract (courseAbstract)
2. Context (context)
3. Overview (overview)
4. Big Idea (bigIdea)
5. Standards (standards.curriculum)
6. Journey (journey.phases)
7. Milestones (journey.milestones)
8. Assessment (assessment.rubric)
9. Resources (resources.required/optional)
10. Impact (impact)
11. Feasibility (feasibility)
```

### 4. Data Validation System

#### Validation Layer (`/src/utils/hero/validation.ts`)
```typescript
// Auto-normalization examples:
- 'medium' → 'med' (risk levels)
- 'risk' → 'name' (property mapping)
- Missing fields → default values

// Development-time validation
if (process.env.NODE_ENV === 'development') {
  validateHeroProject(data);
}
```

#### Builder Functions (`/src/utils/hero/builders.ts`)
Type-safe builders ensure correct data structures:
```typescript
createPhase({ /* params */ })
createActivity({ /* params */ })
createMilestone({ /* params */ })
createRubricCriteria({ /* params */ })
```

### 5. Key Data Relationships

```
HeroProjectData
├── journey.phases[4]              // Always 4: Discover, Define, Develop, Deliver
│   ├── duration: string           // e.g., "2 weeks"
│   ├── focus: string              // Phase objective
│   └── activities: Activity[]     // 8-12 per phase
│       ├── name: string
│       ├── description: string
│       ├── duration: string
│       └── outputs: string[]
│
├── journey.milestones[5-6]        // Major checkpoints
│   ├── week: number
│   ├── phase: string
│   ├── title: string
│   ├── evidence: string[]         // Deliverables
│   └── celebration: string        // Recognition moment
│
└── assessment.rubric[]            // 4-6 categories
    ├── category: string           // e.g., "Research Quality"
    ├── weight: number             // Percentage (must sum to 100)
    └── [exemplary|proficient|developing|beginning]: Level
        ├── points: number
        └── description: string
```

### 6. Performance Considerations

#### Bundle Sizes
```
hero-sensing-self.js: 226KB (68KB gzipped)
- Contains complete 10-week curriculum
- ~4400 lines of structured data
- Loaded on-demand when project viewed
```

#### Optimization Strategies
1. Projects lazy-loaded via dynamic imports
2. Gallery uses minimal metadata (not full data)
3. Validation only runs in development
4. Images referenced by URL (not embedded)

### 7. Adding New Hero Projects

#### Step 1: Create Data File
```typescript
// /src/utils/hero/hero-[project-name].ts
import { HeroProjectData } from './types';

export const heroProjectNameData: HeroProjectData = {
  // Complete specification
};
```

#### Step 2: Register in Index
```typescript
// /src/utils/hero/index.ts
import { heroProjectNameData } from './hero-project-name';

export const heroProjectRegistry = {
  // ... existing projects
  'hero-project-name': wrapHeroProject(heroProjectNameData),
};
```

#### Step 3: Create Blueprint Builder
```typescript
// /src/utils/sampleBlueprints/hero-project-name.ts
export function buildProjectNameHero(userId: string): SampleBlueprint {
  // Map HeroProjectData to SampleBlueprint
}
```

#### Step 4: Export from Index
```typescript
// /src/utils/sampleBlueprints/index.ts
export { buildProjectNameHero } from './hero-project-name';
```

#### Step 5: Add to Main Registry
```typescript
// /src/utils/sampleBlueprints.ts
case 'hero-project-name':
  return buildProjectNameHero(userId);
```

### 8. Data Contract for Future Features

The hero project structure is designed to support:

1. **AI Generation**: Each section provides training data for AI to generate similar content
2. **Progress Tracking**: Milestones and phases map to student progress checkpoints
3. **Resource Estimation**: Materials and time estimates enable budget planning
4. **Standards Reporting**: Deep alignment data for compliance reporting
5. **Differentiation**: Structure supports multiple learner pathways (not yet implemented)

### 9. Critical Implementation Notes

#### What Hero Projects ARE:
- Complete, production-ready curriculum packages
- Demonstration of platform capabilities
- Data templates for AI-assisted project creation
- Quality benchmarks for user-generated content

#### What Hero Projects ARE NOT:
- User-editable templates
- Starting points for customization
- Simplified examples
- Placeholder content

#### Data Integrity Requirements:
- All percentage weights must sum to 100
- All phases must have activities
- All milestones must map to phases
- All standards must have valid codes
- All resources must have complete metadata

### 10. Technical Debt & Future Work

#### Current Limitations:
1. Dual registry system (hero + sampleBlueprints) adds complexity
2. No versioning system for project updates
3. Manual data entry (no CMS integration)
4. Static data (no runtime customization)

#### Planned Improvements:
1. Unified project registry
2. GraphQL API for project data
3. CMS integration for content management
4. Dynamic project generation from templates
5. Version control for curriculum updates

---

## 11. Chatbot Training & Template System

### Hero Projects as Training Data

The hero projects serve as the primary training dataset for the chatbot to understand:

#### Structure Patterns:
```typescript
// Every project follows this exact structure
// Chatbot learns to generate content for each section
HeroProjectData {
  courseAbstract: { /* 4 required fields */ }
  bigIdea: { /* 5 required fields */ }
  journey: {
    phases: [ /* Always 4 phases */ ]
    milestones: [ /* 5-6 checkpoints */ ]
  }
  assessment: {
    rubric: [ /* 4-6 criteria, weights sum to 100 */ ]
  }
}
```

#### Content Patterns the Chatbot Learns:

1. **Essential Questions Format**:
   - Sustainability: "How might we transform our school..."
   - Community: "How can oral histories preserve..."
   - Assistive: "How might everyday innovations..."
   - Pattern: "How might/can/do [subject] [action] [impact]?"

2. **Phase Progression**:
   - Discover: Research, explore, empathize (25% of time)
   - Define: Synthesize, focus, plan (20% of time)
   - Develop: Create, iterate, test (35% of time)
   - Deliver: Polish, present, reflect (20% of time)

3. **Activity Granularity**:
   - Each activity: 45-90 minutes
   - Each phase: 8-12 activities
   - Each milestone: 3-5 evidence pieces

### Chatbot Implementation Strategy

#### Step 1: Pattern Recognition
```javascript
// Chatbot analyzes all hero projects to extract:
const patterns = {
  titleFormats: extractTitlePatterns(heroProjects),
  questionTypes: extractQuestionPatterns(heroProjects),
  activityStructures: extractActivityPatterns(heroProjects),
  assessmentFrameworks: extractRubricPatterns(heroProjects)
};
```

#### Step 2: Guided Generation
```javascript
// User says: "I want to create a project about local history"

// Chatbot references hero-community-history as template:
chatbot.analyze('hero-community-history');

// Generates similar but unique content:
response = {
  suggestedTitle: "Neighborhood Narratives: Documenting Our Block's Story",
  // ^ Similar pattern to "Living History: Preserving Community Stories"

  essentialQuestion: "How might we capture and celebrate the untold stories of our neighborhood?",
  // ^ Same structure as hero project but customized

  phases: generatePhasesBasedOnTemplate('hero-community-history', userContext)
}
```

#### Step 3: Quality Assurance
```javascript
// Every generated section validated against hero project standards:
function validateGeneratedContent(content, heroTemplate) {
  checks = [
    hasAllRequiredFields(content),
    meetsMinimumDepth(content, heroTemplate),
    followsStructurePattern(content, heroTemplate),
    maintainsQualityBar(content, heroTemplate)
  ];
  return checks.all(pass);
}
```

### Data Fields Chatbot Must Populate

Based on hero project analysis, the chatbot must generate:

```yaml
REQUIRED (Non-negotiable):
- title: string
- subjects: string[] (1-6 items)
- gradeLevel: string
- duration: string
- courseAbstract: (all 4 fields)
- bigIdea: (all 5 fields)
- journey.phases: (exactly 4)
- journey.milestones: (5-6)
- assessment.rubric: (4-6 categories, weights = 100%)
- standards.curriculum: (at least 1 family)
- resources.required: (at least 5)
- impact: (all 3 fields)

GENERATED FROM TEMPLATES:
- Each phase gets 8-12 activities (from hero examples)
- Each milestone gets celebration moment (from patterns)
- Each rubric criterion gets 4 levels (from templates)
- Each standard gets specific codes (from database)
```

### Chatbot Prompting Logic

```typescript
// Phase 1: Understand Intent
if (userWantsToCreate) {
  // Find most similar hero project
  template = findBestHeroMatch(userDescription);

  // Phase 2: Structured Collection
  for (section of template.sections) {
    // Ask targeted questions based on hero structure
    response = await collectSectionData(section, template[section]);
    validate(response, template[section]);
  }

  // Phase 3: Generation
  project = generateFromTemplate(template, userResponses);

  // Phase 4: Validation
  validateAgainstHeroStandards(project);
}
```

## Summary

The hero project system serves three critical purposes:

1. **Demonstrates Platform Capabilities**: Shows users what's possible
2. **Provides Training Data**: Teaches the chatbot high-quality patterns
3. **Ensures Quality Standards**: Every user-generated project validated against hero benchmarks

Each hero project contains 4000+ lines of meticulously crafted curriculum data, representing 40-80 hours of instructional design work. This data becomes the foundation for the chatbot to guide users in creating their own projects that match this quality bar.

The technical architecture prioritizes data completeness and pattern consistency, ensuring the chatbot has clear templates to work from when helping users create new projects. The hero projects ARE the working prototype for the chatbot system - they define the exact structure, depth, and quality that the chatbot should produce.