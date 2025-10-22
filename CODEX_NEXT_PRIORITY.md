# Priority Instructions for Codex

## Status: Excellent Progress, But Core Issue Remains

You've built amazing infrastructure (context passing, specificity scoring, rubrics, telemetry). However, **the #1 root cause of generic outputs is still present.**

---

## 🚨 **HIGHEST PRIORITY: Replace Template-Based Generation**

### Problem Still Exists

**Journey Generation** (`src/features/chat-mvp/domain/journeyMicroFlow.ts` lines 42-59):
- Currently uses hardcoded templates like "Investigate Context", "Design Solutions"
- Just does string substitution: `{topic}` → user's topic
- **No AI generation happening**

**Deliverables Generation** (`src/features/chat-mvp/domain/deliverablesMicroFlow.ts` lines 36-178):
- Milestones are just: `phase.name + " checkpoint complete"`
- Artifacts come from keyword matching
- Rubric criteria are subject-based templates
- **No AI generation happening**

**Result**: Even with your great structured context, the journey and deliverables are still generic templates.

---

## 🎯 **What to Do Next: Convert to AI-Powered**

### Task 1: AI-Powered Journey Generation

**File**: `src/features/chat-mvp/domain/journeyMicroFlow.ts`

**Replace**: Lines 42-59 template generation

**With**: AI-powered generation using the structured context you built

**Prompt should include**:
```typescript
async function generateSmartJourney(
  captured: CapturedData,
  wizard: WizardContext
): Promise<JourneyMicroState['suggestedPhases']> {
  const weeks = estimateDurationWeeks(wizard.duration);
  const phaseCount = recommendedPhaseCount(weeks);
  const ranges = allocateWeekRanges(weeks, phaseCount);

  const prompt = `Generate a ${phaseCount}-phase learning journey for this PBL project.

**PROJECT FOUNDATION:**
- Big Idea: ${captured.ideation.bigIdea}
- Essential Question: ${captured.ideation.essentialQuestion}
- Challenge: ${captured.ideation.challenge}

**CONTEXT:**
- Grade Level: ${wizard.gradeLevel}
- Subjects: ${wizard.subjects?.join(', ')}
- Duration: ${weeks} weeks (${phaseCount} phases)
- Topic: ${wizard.projectTopic}

**GRADE-BAND GUARDRAILS:**
${resolveGradeBand(wizard.gradeLevel)?.promptGuidance || ''}

**REQUIREMENTS:**
Generate ${phaseCount} learning phases that:
1. Build progressively toward answering the Essential Question
2. Develop understanding of the Big Idea
3. Enable students to complete the Challenge
4. Include 2-3 SPECIFIC activities per phase (not generic "research")
5. Activities must reference the actual project topic/subject

**OUTPUT FORMAT (JSON):**
[
  {
    "name": "Phase title (3-6 words)",
    "duration": "${ranges[0] || 'Week 1'}",
    "summary": "One sentence: how this phase advances Big Idea + EQ",
    "activities": [
      "Specific activity 1 for [topic]",
      "Specific activity 2 for [topic]",
      "Specific activity 3 for [topic]"
    ]
  },
  // ... ${phaseCount - 1} more phases
]

Return ONLY valid JSON. No markdown, no explanation.`;

  try {
    const response = await generateAI(prompt, {
      model: 'gemini-flash-latest',
      temperature: 0.7,
      maxTokens: 800,
      label: 'journey_generation'
    });

    const parsed = JSON.parse(response);
    if (Array.isArray(parsed) && parsed.length === phaseCount) {
      return parsed.map((p, i) => ({
        name: p.name || `Phase ${i + 1}`,
        duration: ranges[i] || '',
        summary: p.summary || '',
        activities: Array.isArray(p.activities) ? p.activities : []
      }));
    }
  } catch (error) {
    console.error('[journeyMicroFlow] AI generation failed, using fallback', error);
    telemetry.track({
      event: 'ai_fallback',
      success: false,
      latencyMs: 0,
      projectId: 'journey',
      errorCode: 'PARSE_FAIL',
      source: undefined
    });
  }

  // KEEP existing template code as fallback
  return generateTemplateJourney(captured, wizard, phaseCount, ranges);
}

// Rename current function to generateTemplateJourney for fallback
function generateTemplateJourney(
  captured: CapturedData,
  wizard: WizardContext,
  phaseCount: number,
  ranges: string[]
): JourneyMicroState['suggestedPhases'] {
  // Move existing template code here (lines 42-59)
}
```

**Why this matters**: Journey phases will finally be specific to the actual project instead of generic templates.

---

### Task 2: AI-Powered Deliverables Generation

**File**: `src/features/chat-mvp/domain/deliverablesMicroFlow.ts`

**Replace**: Lines 36-178 template/keyword-based generation

**With**: AI-powered generation

**Prompt should include**:
```typescript
async function generateSmartDeliverables(
  captured: CapturedData,
  wizard: WizardContext
): Promise<Pick<DeliverablesMicroState, 'suggestedMilestones' | 'suggestedArtifacts' | 'suggestedCriteria'>> {

  const prompt = `Generate deliverables for this PBL project.

**PROJECT FOUNDATION:**
- Big Idea: ${captured.ideation.bigIdea}
- Essential Question: ${captured.ideation.essentialQuestion}
- Challenge: ${captured.ideation.challenge}

**LEARNING JOURNEY:**
${captured.journey.phases.map((p, i) => `
${i + 1}. **${p.name}**
   Activities: ${p.activities.join('; ')}
`).join('\n')}

**CONTEXT:**
- Grade: ${wizard.gradeLevel}
- Subjects: ${wizard.subjects?.join(', ')}
- Duration: ${wizard.duration}

**GRADE-BAND GUARDRAILS:**
${resolveGradeBand(wizard.gradeLevel)?.promptGuidance || ''}

**GENERATE:**

1. **Milestones** (${captured.journey.phases.length} items, one per phase):
   - Describe WHAT students accomplish that proves phase completion
   - Reference specific phase activities
   - Example: "Students complete waste audit data analysis and present patterns to class"

2. **Artifacts** (2-3 items):
   - Final products that demonstrate Big Idea mastery
   - What students create for the Challenge audience
   - Example: "Campaign toolkit with posters, social posts, presentation"

3. **Rubric Criteria** (4-6 items):
   - Success criteria for quality assessment
   - Assess both Big Idea understanding AND Challenge deliverable
   - Example: "Data analysis accuracy and visualization clarity"

**OUTPUT FORMAT (JSON):**
{
  "milestones": [
    "Phase 1 milestone: [specific evidence of readiness]",
    // ... one per phase
  ],
  "artifacts": [
    "Artifact 1: [what it is] for [Challenge audience]",
    "Artifact 2: [what it is]"
  ],
  "criteria": [
    "Criterion 1: [Big Idea understanding]",
    "Criterion 2: [Challenge quality]",
    // ... 4-6 total
  ]
}

Return ONLY valid JSON.`;

  try {
    const response = await generateAI(prompt, {
      model: 'gemini-flash-latest',
      temperature: 0.6,
      maxTokens: 600,
      label: 'deliverables_generation'
    });

    const parsed = JSON.parse(response);
    return {
      suggestedMilestones: parsed.milestones || [],
      suggestedArtifacts: parsed.artifacts || [],
      suggestedCriteria: parsed.criteria || []
    };
  } catch (error) {
    console.error('[deliverablesMicroFlow] AI generation failed, using fallback', error);
    telemetry.track({
      event: 'ai_fallback',
      success: false,
      latencyMs: 0,
      projectId: 'deliverables',
      errorCode: 'PARSE_FAIL',
      source: undefined
    });
  }

  // KEEP existing template code as fallback
  return generateTemplateFallback(captured, wizard);
}

// Move existing code to generateTemplateFallback
function generateTemplateFallback(/* ... */): /* ... */ {
  // Existing template code from lines 36-178
}
```

**Why this matters**: Milestones, artifacts, and criteria will be project-specific instead of generic templates.

---

## 📊 Expected Impact

**Before** (current state with templates):
```
User: "Design campus waste reduction campaign"

Journey generated:
  Phase 1: Investigate Context
    - Research topic
    - Gather information
  Phase 2: Plan Solutions
    - Brainstorm ideas
    - Create outline

Deliverables:
  - "Phase 1 checkpoint complete"
  - "Phase 2 checkpoint complete"
  - Artifact: "Campaign materials"
```

**After** (with AI generation):
```
User: "Design campus waste reduction campaign"

Journey generated:
  Phase 1: Audit Campus Waste Streams (Weeks 1-2)
    - Conduct 3-day sort-and-weigh audit of cafeteria waste
    - Interview facilities manager about disposal processes
    - Analyze composition data to identify top 3 sources

  Phase 2: Design Evidence-Based Solutions (Weeks 3-5)
    - Research successful waste reduction programs at similar schools
    - Calculate potential savings from top 3 interventions
    - Create prototypes of campaign materials with peer feedback

Deliverables:
  - "Students present waste audit findings with data visualizations showing composition breakdown"
  - "Students pitch 3 interventions to facilities director with cost-benefit analysis"
  - Artifact: "Campaign toolkit including posters with data, social media templates, presentation for student government"
```

---

## 🎯 After These Two Tasks

THEN you can:
- Render rubrics in Review page ✓
- Add "Save to journey" from AI expand ✓
- Build multi-part Challenge form (Phase 3 remaining item)
- Add example library with annotated good/bad inputs

But **priority #1 and #2** are journey and deliverables generation. Without these, outputs will remain generic.

---

## 🔧 Implementation Notes

1. **Keep template code as fallback** - Move it to separate functions, don't delete
2. **Use telemetry** - Track when AI succeeds vs. falls back to templates
3. **Test with ?debug=1** - Log the prompts to verify they include full context
4. **Validate JSON parsing** - Use `safeJSONParse()` from your existing code

---

## ✅ Success Criteria

You'll know it's working when:
1. Journey phases include specific activities tied to the project topic
2. Milestones reference actual phase activities, not just "checkpoint complete"
3. Artifacts describe what students create for the specific Challenge audience
4. Debug telemetry shows journey_generation and deliverables_generation in AI metrics
5. Teachers report: "This is specific to my project!"

---

**Summary**: Your infrastructure is excellent. Now use it to replace the template-based generation that's still producing generic outputs. These two changes will have 10x more impact than UI polish.
