# Showcase V2 LLM Contracts

## JSON Contract
```json
{
  "id": "string",
  "version": "string",
  "hero": {
    "title": "string",
    "tagline": "string",
    "gradeBand": "ES|MS|HS",
    "timeframe": "1–2 lessons|2–4 weeks|4–6 weeks|6–8 weeks|8–10 weeks|10–12 weeks",
    "subjects": ["string"],
    "specLine": "string?",
    "image": "string?"
  },
  "microOverview": ["string", "string", "string?", "string?"],
  "fullOverview": "markdown?",
  "schedule": {
    "totalWeeks": 4,
    "lessonsPerWeek": 1,
    "lessonLengthMin": 45
  },
  "runOfShow": [
    {
      "weekLabel": "Week 1",
      "kind": "Foundations|Planning|FieldworkLoop|Build|Exhibit|Extension",
      "focus": "string",
      "teacher": ["string"],
      "students": ["string"],
      "deliverables": ["string"],
      "checkpoint": ["string"],
      "assignments": ["A1"],
      "repeatable": true
    }
  ],
  "outcomes": {
    "core": ["string"],
    "extras": ["string"],
    "audiences": ["string"]
  },
  "materialsPrep": {
    "coreKit": ["string"],
    "noTechFallback": ["string"],
    "safetyEthics": ["string"]
  },
  "assignments": [
    {
      "id": "A1",
      "title": "string",
      "summary": "string (≤25 words)",
      "studentDirections": ["string"],
      "teacherSetup": ["string"],
      "evidence": ["string"],
      "successCriteria": ["string"],
      "checkpoint": "string",
      "aiOptional": {
        "toolUse": "string",
        "critique": "string",
        "noAIAlt": "string"
      },
      "safety": ["string"]
    }
  ],
  "polish": {
    "microRubric": ["string"],
    "checkpoints": ["string"],
    "tags": ["string"]
  },
  "planningNotes": "markdown?"
}
```

## Acceptance Tests
- **AT-1**: `microOverview` contains 3–4 sentences, each 12–28 words.
- **AT-2**: `runOfShow` has 4–12 `WeekCard` entries with matching `assignments` references.
- **AT-3**: `outcomes.core` has ≤3 items; `extras` and `audiences` respect 3–6 item bounds.
- **AT-4**: `materialsPrep.noTechFallback` never exceeds three items and omits duplicates.
- **AT-5**: Every `AssignmentCard.successCriteria` bullet ≤ 8 words and at least three bullets.
- **AT-6**: When `polish` exists, each `microRubric` bullet ≤ 12 words and tags use uppercase codes.
- **AT-7**: `schedule.totalWeeks` aligns with timeframe expectation (2–4 → 3, 4–6 → 5, 6–8 → 7, 8–10 → 9, 10–12 → 11).

## Prompt Templates

### Authoring Prompt
> You are drafting a Project Showcase V2 entry. Use the JSON contract fields and follow acceptance tests AT-1 through AT-7. Preserve supplied hero metadata. Produce concise language that speaks to teachers. Avoid standards language and feasibility notes.

### Parametric Plan Prompt
> Given timeframe, grade band, and subject mix, design a week-by-week Run of Show that satisfies AT-2 and matches the Showcase V2 schema. Provide teacher actions, student experiences, and deliverables for each week. Suggest assignment IDs where they belong.

### Assignment Expansion Prompt
> Expand assignment placeholders into full `AssignmentCard` objects. Honor AT-5, align with the Run of Show, give actionable student directions, quick teacher setup, and observable evidence. Include `aiOptional` only when the AI workflow is safe, equitable, and has a viable non-AI option.
