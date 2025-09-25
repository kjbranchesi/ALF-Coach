# Project Showcase V2 Authoring Guide

## Section Order
1. Hero (title, tagline, spec line)
2. Micro Overview
3. Section shortcuts (Run of Show · Outcome Menu · Assignments · Read full overview ▸)
4. Run of Show
5. Outcome Menu
6. Materials & Prep
7. Assignments
8. Full Overview (collapsed by default)
9. Polish (collapsed by default; render only when data exists)

## Defaults & Visibility
- Hero and Micro Overview render immediately.
- Section shortcuts display inline anchor buttons.
- Run of Show, Outcome Menu, Materials & Prep, and Assignments remain fully visible.
- Full Overview and Polish use `<details>`; keep them collapsed on load.
- Do not surface standards, feasibility, or legacy tabs in V2 mode.

## Content Limits
- `microOverview`: 3–4 sentences; each 12–28 words.
- `runOfShow`: 4–12 `WeekCard` entries; teacher/student bullet strings ≤ 10 words; focus ≤ 90 characters.
- `outcomes.core`: 1–3 bullets; `extras`: 3–6 bullets; `audiences`: 3–6 bullets.
- `materialsPrep.coreKit`: up to 8 items; `noTechFallback`: up to 3; `safetyEthics`: up to 3.
- `assignments`: 3–6 `AssignmentCard` entries.
- `AssignmentCard.studentDirections`: 5–7 bullets; `teacherSetup`: 3–5 bullets; `evidence`: 2–3 bullets; `successCriteria`: 3–5 bullets (≤ 8 words each).
- `polish.microRubric`: 4–6 criteria (≤ 12 words); `polish.checkpoints`: 2–5 entries; `polish.tags`: 1–4 items (codes only).
- `schedule.totalWeeks`: 4–12 for week-based showcases; `lessonsPerWeek`: 1–5; `lessonLengthMin`: one of 45, 50, 55, 60, 75, 90.

## Authoring Notes
- Preserve existing titles, images, and subjects from legacy showcases.
- Use markdown selectively inside `fullOverview` and `planningNotes`.
- Align `assignments[].aiOptional` only when AI adds real value and alternate guidance is clear.
