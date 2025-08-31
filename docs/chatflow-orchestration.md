# Chatflow Orchestration

This document describes the conversation framework that guides an educator from the Wizard into the Chat, across the three ALF stages: Ideation, Journey, and Deliverables. The design is domain‑agnostic and resilient when AI is slow or unavailable.

## Principles
- Accept → Build → Confirm: Always accept user input, build on it, then confirm before advancing.
- One‑ask rhythm: One actionable question per turn; short, warm responses.
- Deterministic flow: A finite state with explicit transitions; no loops, no dead ends.
- Context everywhere: Wizard + captured project data inform all prompts and suggestions.
- Progressive disclosure: Show suggestion cards only when helpful.
- Offline‑safe: Deterministic fallbacks ensure progress without AI.

## State Model
- `stage`: `BIG_IDEA | ESSENTIAL_QUESTION | CHALLENGE | JOURNEY | DELIVERABLES | COMPLETE`
- `conversationStep`: integer index within a stage
- `awaitingConfirmation`: `{ type: 'bigIdea'|'essentialQuestion'|'challenge'|'journey'|'deliverables', value: string } | undefined`
- `context.wizard`: subjects[], gradeLevel, duration, projectTopic, materials, entryPoint, pblExperience
- `ideation`: bigIdea, essentialQuestion, challenge (+ confirmed flags)
- `journey.phases`: analyze/brainstorm/prototype/evaluate (each: goals, activities[], outputs, evidence, duration)
- `deliverables`: milestones[], rubric{ criteria[], levels[] }, impact{ audience, method }
- `capturedData`: flat persisted keys like `ideation.bigIdea`, `journey.analyze.activities[ ]`, ...

## Stage Microflows
### Big Idea
1) Elicit → 2) Accept & reflect → 3) Confirm → 4) Commit → 5) Recap → 6) Advance
Save: `ideation.bigIdea`

### Essential Question
Entry carries Big Idea → Elicit (+ refine if needed) → Confirm → Commit → Recap → Advance
Save: `ideation.essentialQuestion`

### Challenge
Entry carries EQ → Elicit (action/audience) → Confirm → Commit → Recap → Advance
Save: `ideation.challenge`

### Journey
Entry carries Ideation + grade/duration → phased planning (Analyze, Brainstorm, Prototype, Evaluate):
- Micro-steps per phase (deterministic prompts):
  1) Goal (what students learn/do)
  2) One activity (method or strategy)
  3) Output/Evidence (what they produce/checkpoint)
  4) Duration (e.g., 1–2 lessons)
- Confirm compiled plan → Commit → Recap → Advance
Save: `journey.phases.*` and optional `journey.timeline`

### Deliverables
Entry carries Journey + Challenge → 1) Milestones (3) → 2) Rubric (criteria + 3 levels) → 3) Impact (audience, method)
Confirm → Commit → Final Recap → `COMPLETE`
Save: `deliverables.milestones`, `deliverables.rubric`, `deliverables.impact`

Note: The current implementation supports a minimal plan/package confirmation path when the educator signals readiness (e.g., “Yes/continue/ready”). Per‑phase and per‑deliverable micro‑steps can be enabled progressively while maintaining the same save keys to avoid migration.

## Suggestions Strategy
Deterministic, profile‑driven (subject profile + grade band + topic + current ideation). AI is used for tone/augmentation only. If AI fails, deterministic suggestions still appear.

## Signals & Guards
- Progress: yes/continue/next/ready/looks good/let’s move on
- Refine: change/adjust/refine/another/try again
- Confusion: don’t understand/not sure/help
Guards: never ask for info already provided; auto‑progress after N supportive turns when input is substantive.

## Persistence & Recovery
Atomic saves per step to both structured fields and `capturedData`. Local storage mirrors ensure offline continuity. On reload, state is hydrated and resumes at the next incomplete step.
