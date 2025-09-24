# Showcase Schema Overview

The Showcase schema captures classroom-ready project snapshots that teachers can remix quickly. It balances concise storytelling with structured guidance so teams can scale new spotlights without bloating the codebase.

## Core Types

- **ShowcaseProject**
  - `meta`: id/title/tagline, subjects, gradeBands, duration, optional image/tags.
  - `microOverview`: the narrative hook.
  - `quickSpark` *(optional)*: three hooks plus a mini-activity block.
  - `outcomeMenu` *(optional)*: core deliverable, optional choices, optional audiences.
  - `assignments`: 3–12 cards with student/teacher directions, evidence, success criteria, optional checkpoint + AI note.
  - Optional sections: `accessibilityUDL`, `communityJustice`, `sharePlan`, `gallery`, `polishFlags`.

- **AssignmentCard**
  - `studentDirections`: ≤7 bullets (action verbs, concrete steps).
  - `teacherSetup`: ≤5 bullets.
  - `evidence`: 2–3 artifacts to collect.
  - `successCriteria`: 3–5 indicators.
  - `checkpoint`: one-line progress check (optional).
  - `aiOptional`: one-line optional AI support (tools + critique framing) (optional).

## Editorial Guidance

### Micro Overview
- 3–4 sentences maximum.
- Explain why the work matters, who students collaborate with, and the roles they take.
- Reserve deep background for the optional `longOverview` (rendered behind “Read full overview ▸”).

### Quick Spark (optional but recommended)
- Exactly three hooks aimed at curiosity or urgency.
- Mini activity subkeys:
  - `do`: 3–5 steps.
  - `share`: 1–2 share-out moves.
  - `reflect`: 1–2 prompts.
  - `materials`: 1–2 items (prioritize reusable classroom resources).
  - `timeWindow`: short time estimate (e.g., “1 lesson”).
  - `differentiationHint`: short sentence describing role or entry-point choices.
  - `aiTip`: optional; highlight how to use AI responsibly (generate + critique, never ingest sensitive data).

### Outcome Menu (optional)
- `core`: the required deliverable.
- `choices`: 0–6 stretch or remix options. Use consistent grammar (noun phrases).
- `audiences`: 0–N authentic audiences. Name who benefits (e.g., “Parks department” instead of “community”).

### Assignments
- Each project ships 3–12 cards depending on scope.
- Use the “Repeatable loop” pattern in `when` for recurring cycles.
- Student directions focus on actions, not broad goals.
- Teacher setup handles logistics, safety, and timing.
- Checkpoints are formative—note what feedback or approval the teacher provides.
- AI optional notes must reinforce tool + critique (“Ask AI for __, then fact-check / adapt / critique”).

### Optional Sections
- **AccessibilityUDL**: bullet lists for representation, action, engagement, language supports, and executive function supports.
- **CommunityJustice**: guiding question from a justice/place lens, stakeholders, and 2–3 ethics notes (consent, privacy, safety).
- **SharePlan**: events/formats/partners for final showcases.
- **Gallery**: example assets (images or links).
- **PolishFlags**: boolean flags so the UI can badge standards/rubrics/feasibility readiness.

### Tone & Style
- Write as a co-designer: invitational, professional, not promotional.
- Use active voice, second-person (“Invite students to…”) or imperative (“Map hotspots…”).
- Keep bullets concise (≤110 characters recommended).
- Name stakeholder groups plainly (avoid jargon) and highlight student agency.

### UDL & AI Guardrails
- UDL tips should cover multiple pathways: offer choices, scaffolds, and representation shifts.
- AI guidance must include a critique step. Never reference uploading private student data, location-tracking minors, or bypassing consent.

## Author Workflow
1. Draft Micro Overview + Outcome Menu first.
2. Sketch assignments as sticky notes; convert to cards once sequencing feels right.
3. Layer in Quick Spark, accessibility supports, and justice lens last.
4. Validate against the checklist in `docs/CONVERSION_GUIDE.md` before PR review.
