# ALF Project Builder Interaction Model

This document re-centers the builder around a hybrid experience: quick setup via the wizard, followed by AI co-design in the chat. Gemini (ALF) becomes the primary creative partner once the essential context is captured.

## Overview

1. **Phase A – Grounding (Wizard)**
   - Purpose: capture must-have context before the AI can help.
   - Inputs: grade band, subjects, duration, constraints, must-hit standards.
   - UX: fast card selections over 2–3 screens. No long-form text.

2. **Phase B – Co-Design (Chat)**
   - Purpose: synthesize goals, big ideas, milestones, differentiation, logistics.
   - Interaction: conversational prompts where ALF proposes drafts and records the educator’s choices.
   - Output: `ProjectV3` draft updated in real time; builder cards show AI-generated content for review/edit.

## Step Modality Map

| Step | Primary Modality | Notes |
| --- | --- | --- |
| Classroom Context | Wizard | Keep refinements (card UI). Thriller goal: 1-2 minutes. |
| Goals & Big Idea | Chat | AI drafts big idea/essential question from educator inputs. |
| Standards Alignment | Hybrid | Wizard captures standards IDs; chat suggests rationales + depth. |
| Phases & Milestones | Chat | Educator describes timeline; ALF builds phased plan with milestones. |
| Artifacts & Rubrics | Chat + Card edit | ALF generates options, builder shows editable cards. |
| Differentiation & Roles | Chat | Q&A about learner needs, AI fills strategies/roles. |
| Logistics & Evidence | Chat | Collect checkpoints, permissions, exhibition; cards update with AI plan. |
| Review & Handoff | Wizard summary | Display completeness, exports, and invite to reopen chat for refinements. |

## Transitions

1. After Phase A, show a “Great! Continue in the ALF Design Studio” panel with a button that opens the chat. The chat session receives all context collected in Phase A.
2. Each builder section includes an **Ask ALF** button to re-open the chat with specific intent (e.g., “Help me finalize differentiation”).
3. Chat responses trigger autosave via `saveProjectDraft`, and the affected builder cards re-render with the AI’s output.

## Implementation Tasks

1. **Trim Wizard:** Limit Phase A to context-only screens; remove text fields for creative steps.
2. **Chat Prompts:** Create prompt templates for each creative step (goals, milestones, differentiation, logistics) that reference the schema fields they fill.
3. **Link Builder Cards:** Modify cards (Goals, Milestones, etc.) to read from the ProjectV3 draft and offer “Accept / Refine / Replace” controls.
4. **Chat Launch Logic:** After context screens, redirect to chat with a summary message and `draftId`.
5. **Ask ALF Buttons:** Add inline triggers that set chat intent and open the conversation.
6. **Progress Copy:** Update UI text to explain “Complete setup → ALF co-designs the rest with you.”
7. **Persistence:** Ensure chat responses update `ProjectV3` via the draft merge helpers, keeping completeness metrics fresh.

## QA Checklist

- Phase A completes within 2 minutes and hands off to chat.
- Chat generates big idea/essential question that populate builder cards.
- Educator can edit AI suggestions via the card UI; autosave works.
- “Ask ALF” buttons jump into the chat with pre-filled prompts.
- Review step reflects complete data from both wizard and chat.

