# Legacy → Showcase Conversion Guide

Use this guide to translate existing Hero projects into the new Showcase schema quickly and consistently.

## Mapping Legacy Sections

| Legacy Source | Showcase Target | Notes |
| --- | --- | --- |
| Big Idea / Driving Question | `microOverview.microOverview` | Trim to 3–4 sentences. Emphasize student roles, partnerships, and why it matters now. |
| Full Overview paragraphs | `microOverview.longOverview` | Optional. Use when you need archival detail. |
| Journey / Phases / Milestones | `assignments[]` | Convert each milestone into a card. Merge tiny tasks; break apart overloaded phases. |
| Deliverables / Products | `outcomeMenu` | Choose one required core outcome. Turn alternates into `choices`. |
| Impact / Audience notes | `outcomeMenu.audiences` + `sharePlan` | Name who benefits and how work is shared. |
| Justice / Community Lens | `communityJustice` | Riding question (justice/place lens), stakeholders, 2–3 ethics notes. |
| Supports / Differentiation | `accessibilityUDL` | Translate scaffolds into representation/action/engagement buckets. |
| Tech / AI tips | `assignments[].aiOptional` or `quickSpark.miniActivity.aiTip` | Keep optional. Reinforce tool + critique. |

## Assignment Card Checklist

For each card ensure:
- `id`: sequential (A1, A2, …) or descriptive grouping.
- `title`: action-oriented, 3–6 words.
- `when`: week, sprint, or loop label (“Week 3”, “Repeatable loop”).
- `studentDirections`: ≤7 bullets, verbs first.
- `teacherSetup`: ≤5 bullets, logistics + safety.
- `evidence`: 2–3 artifacts (files, observations, sign-offs).
- `successCriteria`: 3–5 observable indicators.
- `checkpoint`: formative review step (optional but recommended).
- `aiOptional`: optional AI assist with built-in critique.

## Example Conversion

### Before (Legacy – Living History)
- Multi-page narrative with stages (Grounding, Ideation, Interviews).
- Deliverables tab lists Oral History Exhibition, Podcast Clips, Timeline.
- Impact section highlights seniors and local historians.

### After (Showcase – Living History)
- `microOverview`: 3 sentences highlighting roles (interviewer, editor, curator).
- `outcomeMenu`: core “Mini-Archive” plus choice menu (Story Map, Listening Stations…).
- `assignments`: A1 “Mock Interview + Ethics Bootcamp”, A2–A4 continue workflow.
- `communityJustice`: guiding question “Whose stories are heard?”, stakeholder list, ethics notes (consent, review).

## Conversion Workflow

1. **Audit** the legacy doc. Highlight core learning phases, products, audiences, justice notes.
2. **Draft Micro Overview** (3–4 sentences). Log extra details for the optional long overview.
3. **Define Outcome Menu**: pick the non-negotiable core and 2–6 remix choices. Name 3–5 authentic audiences.
4. **Sketch Assignments** from phases. Ensure each card includes student + teacher columns and evidence.
5. **Layer Supports**: add community justice info, accessibility/UDL tips, share plan, gallery, polish flags.
6. **Review AI Guardrails**: confirm every AI mention includes a human critique/check step.
7. **Run QA** with the checklist above before submitting a PR.

## Checklist Before PR
- [ ] No “lite” terminology remains.
- [ ] Micro Overview ≤4 sentences; optional long overview collapsible.
- [ ] Quick Spark includes 3 hooks + mini-activity with all subkeys (or intentionally omitted).
- [ ] Outcome Menu lists one core outcome and 0–6 choices/audiences.
- [ ] 3–12 assignment cards with balanced bullet counts.
- [ ] CommunityJustice guiding question + stakeholders + ethics notes present.
- [ ] Optional sections only when meaningful (leave undefined otherwise).
- [ ] AI prompts reinforce tool + critique and avoid sensitive data.
- [ ] Previewed `/app/showcase/:id` and confirmed layout renders.
