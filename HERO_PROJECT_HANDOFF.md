# Hero Project System - Technical Handoff Report

## Overview
The Hero Project system is a comprehensive framework for creating world-class Project-Based Learning experiences. This document explains how the data flows, how it's displayed, and how the chat/wizard should guide teachers to create their own projects.

## 1. Data Architecture

### Core Data Structure (`HeroProjectData`)
Located in `/src/utils/hero/types.ts`

```typescript
HeroProjectData {
  // Basic Information
  id: string                    // Unique identifier (e.g., 'hero-sustainability-campaign')
  title: string                  // Full project title
  subjects: string[]            // Subject areas covered
  gradeLevel: string            // Target grade level
  duration: string              // Project duration (e.g., '10 weeks')

  // Course Abstract (NEW)
  courseAbstract: {
    overview: string              // 2-3 sentence compelling overview
    learningObjectives: string[]  // 3-4 clear learning goals
    methodology: string           // Teaching approach
    expectedOutcomes: string[]    // Measurable results
  }

  // Project Framework
  hero: {
    tagline: string              // Short compelling description
    description: string          // Full project description
  }

  bigIdea: {
    statement: string            // Core concept
    essentialQuestion: string   // Driving question
    challenge: string            // Real-world challenge
    drivingQuestion: string      // Student-facing question
    subQuestions: string[]       // Supporting questions
  }

  // Learning Journey
  journey: {
    phases: Phase[]              // 4D phases (Discover, Define, Develop, Deliver)
    milestones: Milestone[]      // Key checkpoints with deliverables
  }

  // Assessment & Standards
  assessment: {
    formative: string[]          // Ongoing assessments
    summative: string[]          // Final assessments
    rubric: RubricCriteria[]     // Detailed rubric with 4 levels
  }

  standards: {
    curriculum: StandardFamily[]  // Standards alignment (NGSS, Common Core, etc.)
  }

  // Resources & Impact
  resources: {
    required: Resource[]         // Essential materials
    optional: Resource[]         // Enhancement materials
  }

  impact: {
    audience: string[]           // Who benefits
    metrics: string[]            // Success measures
    methods: string[]            // Impact strategies
  }
}
```

## 2. Data Flow

### A. Data Storage
```
/src/utils/hero/
├── types.ts                    # TypeScript interfaces
├── index.ts                    # Registry and exports
├── builders.ts                 # Helper functions for creating data
├── validation.ts               # Runtime validation
├── hero-sustainability.ts      # Individual project data
├── hero-community-history.ts
├── hero-assistive-tech.ts
└── hero-sensing-self.ts
```

### B. Data Registration
Projects are registered in `/src/utils/hero/index.ts`:
```typescript
export const heroProjectRegistry = {
  'hero-sustainability-campaign': heroSustainabilityData,
  'hero-community-history': heroCommunityHistoryData,
  // ... etc
}
```

### C. Data Access in Components
```typescript
// In HeroProjectShowcase.tsx
const heroData = getHeroProject(id);

// In SamplesGallery.tsx
const samples = getAllSampleBlueprints(userId);
```

## 3. Display Components

### A. Samples Gallery (`/src/components/SamplesGallery.tsx`)
- Shows project cards with title, description, grade level
- Marks complete projects with a badge
- Routes to individual project pages

### B. Hero Project Showcase (`/src/pages/HeroProjectShowcase.tsx`)
Displays sections in order:
1. **Header** - Title, grade, duration, subjects
2. **Course Abstract** - Overview, objectives, methodology, outcomes
3. **Context** - Challenge and significance
4. **Big Idea** - Essential question, driving questions
5. **Standards** - Curriculum alignment charts
6. **Learning Journey** - 4D phases with activities
7. **Milestones** - Key deliverables and timelines
8. **Assessment** - Rubrics and criteria
9. **Resources** - Required and optional materials
10. **Impact** - Audience, metrics, methods

## 4. Chatbot/Wizard Implementation Guide

### Phase 1: Project Foundation
The wizard should collect:

```yaml
STEP 1 - Basic Information:
- Project Title: [Compelling, action-oriented name]
- Grade Level: [Elementary/Middle/High School]
- Duration: [4-12 weeks typically]
- Primary Subject: [Main subject area]
- Additional Subjects: [Cross-curricular connections]

STEP 2 - Course Abstract:
- Overview: "Picture this: [engaging scenario]. In this project, students will [main action]."
- Learning Objectives:
  * "Students will [verb] [concept] by [method]"
  * Focus on 3-4 clear, measurable objectives
- Methodology: "Using [approach], students will [process]"
- Expected Outcomes:
  * Tangible products students create
  * Skills they develop
  * Impact they achieve
```

### Phase 2: Big Idea Development

```yaml
STEP 3 - Essential Elements:
- Big Idea Statement: [Core concept in one sentence]
- Essential Question: "How might we...?" or "What if...?"
- Real-World Challenge: [Authentic problem to solve]
- Driving Question: [Student-facing version]
- Sub-Questions: [3-5 supporting inquiry questions]

STEP 4 - Context Setting:
- Problem Statement: [Why this matters now]
- Significance: [Impact on community/world]
- Relevance: [Connection to students' lives]
```

### Phase 3: Learning Journey Design

```yaml
STEP 5 - 4D Framework:
For each phase (Discover, Define, Develop, Deliver):
- Duration: [weeks]
- Focus: [Main goal]
- Activities: [Specific tasks]
- Student Choice: [Autonomy points]
- Output: [What students produce]
- Formative Assessment: [How to check progress]

STEP 6 - Milestones:
For each major checkpoint:
- Week: [timing]
- Title: [Milestone name]
- Description: [What happens]
- Evidence: [Deliverables]
- Celebration: [How to recognize achievement]
```

### Phase 4: Assessment & Standards

```yaml
STEP 7 - Assessment Design:
- Formative Methods: [Ongoing checks]
- Summative Products: [Final assessments]
- Rubric Categories:
  * For each criterion:
    - Weight: [percentage]
    - Exemplary: [4 - description]
    - Proficient: [3 - description]
    - Developing: [2 - description]
    - Beginning: [1 - description]

STEP 8 - Standards Alignment:
- Identify relevant standards families
- Map specific standards to project elements
- Show progression and coverage
```

### Phase 5: Resources & Impact

```yaml
STEP 9 - Resources:
Required:
- Materials: [Essential items]
- Technology: [Tools needed]
- Community: [Partners/experts]

Optional:
- Enhancements: [Additional resources]
- Extensions: [Advanced options]

STEP 10 - Impact Planning:
- Target Audience: [Who benefits]
- Success Metrics: [Measurable outcomes]
- Implementation Methods: [How to achieve impact]
```

## 5. Chatbot Prompting Strategy

### A. Use Conversational Tone
```
"Let's create something amazing! First, tell me about your students.
What grade do they teach, and what gets them excited about learning?"
```

### B. Provide Examples from Hero Projects
```
"For example, in our Sustainability project, students discovered their
vending machines use as much energy as 3 classrooms! What surprising
discovery might your students make?"
```

### C. Guide with Templates
```
"Your essential question should make students think deeply. Try starting with:
- 'How might we...' for design challenges
- 'What if...' for reimagining systems
- 'Why does...' for investigation projects"
```

### D. Validate and Enhance
```
"Great start! Your project '{title}' sounds engaging. Let's make the
challenge even more concrete. Instead of 'help the community,' could
we specify WHO in the community and HOW they'll help?"
```

## 6. Data Validation Rules

The system includes validation (`/src/utils/hero/validation.ts`) that ensures:
- All required fields are present
- Risk levels use correct values ('low', 'med', 'high')
- Arrays have appropriate content
- Percentages in rubrics sum to 100%

## 7. Best Practices for Project Creation

### DO:
- Start with a real problem students care about
- Include multiple student choice points
- Create authentic audiences for student work
- Design backwards from desired outcomes
- Include both individual and collaborative elements
- Build in reflection at each phase

### DON'T:
- Make it too academic or theoretical
- Forget community connections
- Skip the celebration moments
- Overcomplicate the assessment
- Ignore student voice and choice

## 8. Example Chat Flow

```
CHATBOT: "Welcome! I'll help you create a world-class project like our hero examples.
         What subject do you primarily teach?"

TEACHER: "I teach 8th grade science."

CHATBOT: "Perfect! 8th grade is such an exciting time for scientific exploration.
         Our hero projects show that students at this age can tackle real challenges.
         What's a problem in your community that connects to science?"

TEACHER: "We have a polluted creek nearby that used to be beautiful."

CHATBOT: "That's a powerful starting point! Students could become 'Water Guardians'
         like in our hero project. Let's build this out:

         Project Title: 'Creek Restoration Scientists: Bringing Life Back to [Creek Name]'

         Essential Question: 'How might we use scientific investigation to restore
         our local watershed and inspire community action?'

         Does this capture your vision? Let's refine it together..."
```

## 9. Integration Points

### For Development Team:
1. **Chat Interface**: Needs to collect structured data matching `HeroProjectData` type
2. **Progressive Disclosure**: Don't overwhelm - reveal complexity gradually
3. **Save Progress**: Allow teachers to build projects over multiple sessions
4. **Preview Mode**: Show how project will look as they build
5. **Validation**: Check completeness before publishing

### For Content Team:
1. Use hero projects as templates and examples
2. Maintain consistent quality bar
3. Ensure all projects have clear student outcomes
4. Verify real-world connections are authentic

## 10. Future Enhancements

### Planned Features:
- AI-powered suggestion engine based on hero projects
- Collaboration tools for co-teachers
- Student progress tracking integration
- Portfolio generation from project outcomes
- Community partner matching system

### Data Extensions:
- Add `differentiation` strategies for diverse learners
- Include `digitalCitizenship` components
- Add `budget` estimates for resources
- Include `timeline` templates for different durations

---

## Conclusion

The Hero Project system provides a robust framework for creating engaging, impactful PBL experiences. By following this structure and using the hero projects as exemplars, teachers can create their own world-class projects that transform student learning.

The key is maintaining the balance between structure (ensuring quality) and flexibility (allowing teacher creativity). The chatbot/wizard should feel like a knowledgeable colleague helping them design something amazing, not a form to fill out.

Remember: These aren't just projects - they're transformative experiences that help students see themselves as changemakers.