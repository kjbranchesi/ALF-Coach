# Project Enrichment Quick Reference

**Companion to CURRICULUM_ENRICHMENT_GUIDE.md**

Use this as a desk reference while enriching projects. Print and keep handy!

---

## The 5-Minute Quality Check

Run this on ANY project to quickly identify gaps:

**1. LEARNING OBJECTIVES CHECK (30 seconds)**
- [ ] Read `outcomes.core` out loud
- [ ] If you hear "Create a..." or "Make a..." → NEEDS REWRITE
- [ ] Should hear: "Analyze," "Design," "Evaluate," "Synthesize"

**2. ASSIGNMENT SCAN (1 minute)**
- [ ] Open first assignment
- [ ] Read `studentDirections` bullets
- [ ] If ANY bullet is vague ("Work on," "Research," "Explore") → NEEDS ENRICHMENT
- [ ] Check for `aiOptional` → If missing → ADD IT

**3. WEEK-BY-WEEK SCAN (2 minutes)**
- [ ] Count how many `WeekCard` objects have `checkpoint` field
- [ ] If <40% → ADD MORE CHECKPOINTS
- [ ] Read teacher/student bullets → Count vague verbs
- [ ] If >30% vague → NEEDS SPECIFICITY PASS

**4. ASSESSMENT CHECK (1 minute)**
- [ ] Does `polish.microRubric` exist?
- [ ] If NO → CRITICAL PRIORITY
- [ ] If YES → Does it have 4+ criteria? If NO → EXPAND

**5. LOGISTICS CHECK (30 seconds)**
- [ ] Is `noTechFallback` empty? → NEVER ACCEPTABLE, ADD IT
- [ ] Does project involve fieldwork/fabrication/food? → Check `safetyEthics`
- [ ] Is `planningNotes` missing? → ADD KEY PREP INFO

**If ANY checks fail → Project needs enrichment work.**

---

## Copy-Paste Sentence Starters

### For Rewriting OUTCOMES.CORE:

**Analysis-Level Outcomes:**
```
Analyze [subject] using [evidence types] to [identify/classify/compare] [patterns/relationships]

Example: "Analyze neighborhood heat distribution using sensor data and resident interviews to identify equity gaps"
```

**Design/Creation-Level Outcomes:**
```
Design [solution/intervention] that [addresses constraint] while [balancing competing factors]

Example: "Design cooling interventions that reduce temperatures measurably while remaining feasible for community implementation"
```

**Communication-Level Outcomes:**
```
Communicate [findings/recommendations] to [specific stakeholders] through [medium] that [persuades/informs/activates]

Example: "Communicate data-driven cooling recommendations to city planners through evidence dashboards and policy briefs"
```

---

### For Writing STUDENT-VOICE Success Criteria:

**Knowledge/Understanding:**
```
- I can explain [concept] using [evidence/examples]
- I can identify [patterns/relationships] in [data/system]
- I can describe how [X] affects [Y]
```

**Skills/Application:**
```
- I can calculate [metric] accurately using [method]
- I can operate [tool] safely following [protocol]
- I can create [artifact] that meets [standard]
```

**Analysis/Evaluation:**
```
- I can justify [choice] with [type of evidence]
- I can critique [work] using [criteria]
- I can compare [options] based on [factors]
```

**Communication:**
```
- I can present [information] clearly to [audience]
- I can adapt [message] for [different contexts]
- I can cite [sources] transparently
```

---

### For Writing CHECKPOINT Statements:

**Format:** [WHO] [ACTION VERB] [WHAT] [OPTIONAL: BEFORE X]

```
- Teacher validates first dataset before analysis begins
- Peer panel approves prototype safety plan
- Partner confirms interview protocol meets needs
- Teams demonstrate [skill] successfully in practice run
- Stakeholders endorse action recommendations
- Teacher signs off on fieldwork readiness
- Safety officer clears installation for public access
```

---

### For Creating TEACHER BULLETS (WeekCard):

**Facilitation Verbs:**
- Model, Demonstrate, Facilitate, Coach, Guide, Lead, Host, Run

**Coordination Verbs:**
- Coordinate, Arrange, Schedule, Broker, Invite, Secure, Organize

**Support Verbs:**
- Provide, Share, Distribute, Review, Check, Monitor, Shadow

**Templates:**
```
- Model [specific skill] using [example/demo]
- Facilitate [type of session] with [protocol/structure]
- Coach teams on [skill] through [method]
- Coordinate [logistics] with [stakeholder]
- Provide [resource/template] for [purpose]
- Review [student work] for [quality criterion]
- Shadow [activity] to ensure [safety/quality]
- Host [gathering type] to [purpose]
- Share [exemplar/resource] demonstrating [standard]
- Invite [stakeholder] for [purpose]
```

---

### For Creating STUDENT BULLETS (WeekCard):

**Data/Research Verbs:**
- Collect, Measure, Log, Record, Document, Capture, Track, Observe, Tally

**Analysis Verbs:**
- Analyze, Calculate, Visualize, Compare, Identify, Classify, Sort, Code

**Creation Verbs:**
- Draft, Design, Prototype, Build, Construct, Compose, Create, Produce

**Communication Verbs:**
- Present, Pitch, Share, Publish, Report, Demonstrate, Teach, Explain

**Templates:**
```
- [Data verb] [specific data] using [tool/method]
- [Analysis verb] [data/content] to [identify/understand] [pattern]
- [Creation verb] [artifact] following [standard/template]
- [Communication verb] [content] to [audience] via [medium]
- Upload [artifact] to [platform/location]
- Test [prototype] with [users/conditions]
- Interview [stakeholder] about [topic] using [protocol]
```

---

## The Verb Upgrade Chart

Replace vague verbs with specific alternatives:

| VAGUE (Avoid) | SPECIFIC (Use Instead) |
|---------------|------------------------|
| Work on | Draft, Prototype, Test, Revise, Calculate, Measure |
| Research | Analyze sources, Interview experts, Review literature, Collect data |
| Explore | Investigate patterns, Map systems, Audit flows, Document evidence |
| Discuss | Debate using criteria, Compare options, Evaluate trade-offs |
| Learn about | Identify key concepts, Explain relationships, Apply principles |
| Help students | Model technique, Coach through protocol, Provide feedback using rubric |
| Check progress | Validate data quality, Review against checklist, Approve plan before launch |
| Give feedback | Critique using rubric, Identify strengths and gaps, Suggest next iteration |

---

## AI Integration Templates (aiOptional field)

**For Research/Analysis Assignments:**
```typescript
aiOptional: {
  toolUse: 'Summarize research articles in student language',
  critique: 'Check summary preserves key nuances and caveats',
  noAIAlt: 'Use peer annotation and discussion protocol'
}
```

**For Data Visualization:**
```typescript
aiOptional: {
  toolUse: 'Suggest chart types based on dataset',
  critique: 'Verify chart avoids misleading scales or labels',
  noAIAlt: 'Use spreadsheet template gallery for options'
}
```

**For Writing/Communication:**
```typescript
aiOptional: {
  toolUse: 'Draft outline from brainstorm notes',
  critique: 'Ensure outline matches your actual priorities',
  noAIAlt: 'Use graphic organizer template with partner'
}
```

**For Ideation/Design:**
```typescript
aiOptional: {
  toolUse: 'Generate three design concept variations',
  critique: 'Assess concepts against user needs and constraints',
  noAIAlt: 'Sketch three concepts and peer critique'
}
```

**For Feedback/Revision:**
```typescript
aiOptional: {
  toolUse: 'Identify clarity gaps in draft',
  critique: 'Confirm AI suggestions align with audience needs',
  noAIAlt: 'Use peer review protocol and checklist'
}
```

---

## MicroRubric Builder (4-Dimension Framework)

**Step 1:** Choose ONE criterion from each dimension

**DIMENSION 1: Content/Knowledge**
- Evidence is accurate, cited, and sufficient
- Technical concepts are applied correctly
- Data analysis reveals meaningful patterns
- Subject-specific vocabulary used precisely

**DIMENSION 2: Process/Methodology**
- Methods follow safety and ethical protocols
- Iteration improves quality systematically
- Data collection is rigorous and documented
- Prototypes withstand real-world testing

**DIMENSION 3: Communication**
- Message is clear and audience-appropriate
- Visuals enhance understanding effectively
- Presentation stays within time and engages listeners
- Documentation enables others to replicate work

**DIMENSION 4: Impact/Ethics**
- Solution addresses authentic community need
- Stakeholder voices guide design decisions
- Recommendations balance multiple constraints
- Follow-up plan sustains momentum beyond project

**Step 2:** Customize each to your project's focus (≤12 words)

**Example (Heat Project):**
```typescript
microRubric: [
  'Dashboard stories center data and people equally', // Content + Communication
  'Prototypes withstand real-world testing conditions', // Process
  'Summit pitch makes actionable ask', // Communication
  'Follow-up plan names accountable partners' // Impact
]
```

---

## Field-Specific Enrichment Checklists

### ASSIGNMENT CARD ENRICHMENT

**BEFORE starting, gather:**
- [ ] Template from CURRICULUM_ENRICHMENT_GUIDE.md, Week 2
- [ ] List of 50+ strong verbs (Appendix in main guide)
- [ ] Related WeekCard to align deliverables

**Enrichment sequence (20-30 min per assignment):**

1. **ID, Title, Summary (5 min)**
   - [ ] ID matches WeekCard assignment references
   - [ ] Title is student-friendly (≤80 chars)
   - [ ] Summary answers: What will students make/do/learn? (≤25 words)

2. **Student Directions (10 min)**
   - [ ] Expand to 5-7 bullets
   - [ ] Replace ANY vague verb with specific alternative
   - [ ] Add tool/template references: "using [X] template"
   - [ ] Include submission detail: "Upload to..." "Submit via..."
   - [ ] Sequence logically: Gather → Analyze → Create → Share

3. **Teacher Setup (5 min)**
   - [ ] List 3-5 prep tasks
   - [ ] Name specific resources: "Print [X] template," "Curate [Y] examples"
   - [ ] Include facilitation moves: "Model [skill] using [demo]"
   - [ ] Add logistics: "Schedule [event] with [stakeholder]"

4. **Evidence (2 min)**
   - [ ] List 2-3 concrete artifacts
   - [ ] Match WeekCard deliverables exactly
   - [ ] Use version labels if iterative (v1, draft, final)

5. **Success Criteria (5 min)**
   - [ ] Write 3-5 criteria in student voice ("I can...")
   - [ ] Focus on skills/understanding (not compliance)
   - [ ] Make self-assessable (student can judge without teacher)
   - [ ] Use template starters from this guide

6. **Checkpoint (2 min)**
   - [ ] Add if formative feedback needed before next step
   - [ ] Format: [Who] [verb] [what] [when]
   - [ ] Example: "Teacher reviews dashboard for clarity before pitch"

7. **AI Optional (3 min)**
   - [ ] Add to 50%+ of assignments
   - [ ] Use templates from this guide
   - [ ] Ensure critique prompt prevents blind acceptance
   - [ ] Make noAIAlt equally effective (not lesser option)

8. **Safety (1 min)**
   - [ ] Add ONLY if: fieldwork, fabrication, food, chemicals, human subjects
   - [ ] Be specific: "Wear PPE" → "Wear gloves and safety glasses during soldering"
   - [ ] Include protocols: "Follow heat index threshold policy"

---

### WEEKCARD ENRICHMENT

**Time per card: 15-20 minutes**

1. **WeekLabel, Kind, Focus (3 min)**
   - [ ] Label matches timeline (Week 1, Weeks 3-4)
   - [ ] Kind progresses logically (Foundations → Extension)
   - [ ] Focus names conceptual goal (not activity): "Analyze findings to identify leverage points"

2. **Teacher Bullets (5 min)**
   - [ ] Write 3-5 bullets using templates from this guide
   - [ ] Use strong verbs: Model, Facilitate, Coordinate, Coach
   - [ ] Name specific moves: "Model ROI calculations using spreadsheet demo"
   - [ ] ≤10 words each

3. **Student Bullets (5 min)**
   - [ ] Write 3-5 observable actions
   - [ ] Eliminate vague verbs (see Verb Upgrade Chart)
   - [ ] Use concrete nouns: "calibrate thermometers," "upload data logs"
   - [ ] ≤10 words each

4. **Deliverables (3 min)**
   - [ ] List 2-3 portfolio artifacts
   - [ ] Match assignment evidence if assignment linked
   - [ ] Use version labels: "Prototype v1," "Pitch deck final"

5. **Checkpoint (2 min)**
   - [ ] Add to 60% of weeks (especially: Week 1-2, mid-project, pre-showcase)
   - [ ] Use template: [Who] [verb] [what]
   - [ ] Creates formative assessment gate

6. **Assignments (1 min)**
   - [ ] Link assignment IDs: ["A1"] or ["A2", "A3"]
   - [ ] Verify IDs exist in assignments array
   - [ ] Assignments can span multiple weeks (fieldwork loops)

7. **Repeatable (1 min)**
   - [ ] Set to `true` for FieldworkLoop weeks where iteration expected
   - [ ] Signals to teachers: cycle through activities multiple times

---

## Common Mistakes & Fixes

### MISTAKE 1: Vague Student Directions
**BAD:** "Research your topic and take notes"
**GOOD:** "Analyze three peer-reviewed articles using annotation template, highlighting claims and evidence"

### MISTAKE 2: Generic Success Criteria
**BAD:** "Completes assignment on time with good quality"
**GOOD:** "I cite sources using APA format," "I justify design choices with evidence," "I present within 5-minute limit"

### MISTAKE 3: Missing Checkpoints
**SYMPTOM:** Students arrive at Week 5 with flawed data from Week 2
**FIX:** Add checkpoint at Week 2: "Teacher validates data collection protocol before fieldwork begins"

### MISTAKE 4: Deliverables Don't Match Evidence
**SYMPTOM:** WeekCard says "Heat map poster" but Assignment evidence says "Dashboard"
**FIX:** Align terminology exactly across WeekCard deliverables and Assignment evidence

### MISTAKE 5: No AI Guidance
**SYMPTOM:** Teachers confused about whether AI is allowed/encouraged
**FIX:** Add aiOptional to 50%+ assignments with specific tool use, critique, and no-AI alternative

### MISTAKE 6: Safety Ignored
**SYMPTOM:** Fieldwork assignment has no safety protocols
**FIX:** Add safety field: "Follow heat advisory policy—pause fieldwork if index >95°F"

### MISTAKE 7: Outcomes Are Just Deliverables
**BAD:** "Create a sustainability poster"
**GOOD:** "Analyze systems using evidence to identify leverage points for intervention"

### MISTAKE 8: No Tech Fallback
**SYMPTOM:** noTechFallback is empty array
**FIX:** ALWAYS provide alternatives: "Paper tally sheets," "Poster board displays," "Hand-drawn graphs"

---

## The 10-Minute Rescue Protocol

**If you have only 10 minutes to improve a weak project:**

**Minutes 1-2: Outcomes**
- Rewrite outcomes.core with one Bloom's verb each

**Minutes 3-5: MicroRubric**
- Add 4 criteria using dimension framework

**Minutes 6-7: Checkpoints**
- Add checkpoint to Week 1, Week 3-4, and final week

**Minutes 8-9: Student Directions**
- Fix vague verbs in ONE assignment's studentDirections

**Minutes 10: NoTechFallback**
- Add 2-3 low-tech alternatives to materialsPrep

**This minimal pass prevents critical quality failures.**

---

## Batch Processing Tips

**When enriching 5+ projects in a row:**

1. **Work by FIELD, not by project:**
   - Day 1: Fix ALL 5 projects' outcomes.core
   - Day 2: Fix ALL 5 projects' assignment A1 studentDirections
   - This creates consistency and speeds pattern recognition

2. **Use templates religiously:**
   - Don't reinvent format each time
   - Copy-paste structure, customize content

3. **Take breaks every 90 minutes:**
   - Cognitive load for this work is HIGH
   - Quality drops after sustained editing

4. **Calibrate with peer check every 3 projects:**
   - Show revised assignment to colleague
   - Ask: "Is this actionable? What's confusing?"
   - Adjust approach based on feedback

5. **Track metrics in spreadsheet:**
   - See ENRICHMENT_TRACKER_TEMPLATE (create separate CSV)
   - Columns: Project ID, Rubric Score, Fields Missing, Batch Assignment, Status

---

## Emergency Phrase Bank

**When stuck writing teacher setup bullets:**
- "Provide [template name] for [purpose]"
- "Model [skill] using [example/protocol]"
- "Facilitate [session type] with [structure]"
- "Coordinate [logistics] with [stakeholder]"
- "Review [student work] using [rubric/checklist]"

**When stuck writing student directions:**
- "[Action verb] [specific object] using [tool/template]"
- "Upload [artifact] to [platform/location]"
- "Interview [stakeholder] about [topic] using [protocol]"
- "Test [prototype] with [users] and log [metric]"
- "Draft [deliverable] following [standard/exemplar]"

**When stuck writing success criteria:**
- "I can explain [concept] using [evidence]"
- "I can calculate [metric] accurately"
- "I can justify [decision] with [evidence type]"
- "I can present [content] clearly to [audience]"
- "I can operate [tool] safely following [protocol]"

---

## Quality Assurance Final Checks

**Before marking ANY project "complete":**

**The Non-Negotiables (Must ALL be TRUE):**
- [ ] outcomes.core has learning verbs (not deliverable descriptions)
- [ ] ALL assignments have 5-7 studentDirections bullets
- [ ] ALL successCriteria in student voice ("I can...")
- [ ] microRubric exists with 4+ criteria
- [ ] noTechFallback is NOT empty
- [ ] safetyEthics included if hands-on work involved
- [ ] 40%+ of WeekCards have checkpoint
- [ ] ALL assignment IDs referenced in WeekCards exist in assignments array

**The Usability Test:**
- [ ] Print one assignment
- [ ] Hand to colleague who doesn't know the project
- [ ] Ask: "Could you give this to students tomorrow?"
- [ ] If answer is NO → needs more specificity

**The Teacher Test:**
- [ ] Read planningNotes
- [ ] Ask: "Do I know what to prep and when?"
- [ ] If answer is NO → add logistical details

**The Assessment Test:**
- [ ] Read microRubric
- [ ] Ask: "Could I grade student work using these criteria?"
- [ ] If answer is NO → add specificity or expand criteria

---

## Help! Troubleshooting Guide

**Q: I can't think of specific verbs for student directions.**
**A:** Use the Verb Upgrade Chart + these sentence starters:
- For data work: Measure, Log, Calculate, Visualize, Compare
- For making: Draft, Prototype, Test, Revise, Build
- For communication: Present, Pitch, Publish, Share, Demonstrate

**Q: Success criteria all sound the same.**
**A:** Use the four categories:
1. Knowledge: "I can explain..."
2. Skills: "I can operate/calculate/create..."
3. Analysis: "I can justify/critique..."
4. Communication: "I can present/adapt..."

**Q: I don't know what to put in aiOptional.**
**A:** Ask: "What part of this assignment is time-consuming but formulaic?"
- Summarizing long text? → AI summarizes
- Organizing messy data? → AI suggests categories
- Drafting first outline? → AI generates structure
Then add critique + no-AI alternative

**Q: Project has no clear community partner—what do I put for audiences?**
**A:** Think broader:
- School community: Admin, other classes, families
- Local community: Library, community center, local businesses
- Online community: Blog readers, social media followers, open-source users

**Q: The project timeline is confusing (some weeks are 2 weeks).**
**A:** Use these labels consistently:
- "Week 1" = single week
- "Weeks 3-4" = two-week span
- Set repeatable: true for multi-week cycles

**Q: I'm overwhelmed—where do I start?**
**A:** Use the 10-Minute Rescue Protocol (above), then return to systematic enrichment when you have time.

---

## Success Celebration Checklist

**You know enrichment is working when:**
- [ ] A teacher can read the project and start planning immediately
- [ ] Students can use assignment cards as self-directed work guides
- [ ] Checkpoints create natural feedback rhythm (not all assessment at the end)
- [ ] MicroRubric makes grading transparent and consistent
- [ ] NoTechFallback means project works even during tech failures
- [ ] AI guidance helps teachers navigate integration confidently
- [ ] Outcomes describe LEARNING, not just making artifacts

**Project is ready when it scores 3.0+ on Quality Rubric AND passes Ready-for-Teachers Checklist.**

---

## Contact & Support

**Questions during enrichment?**
- Reference CURRICULUM_ENRICHMENT_GUIDE.md for detailed rationale
- Use templates in this document for specific fields
- Review exemplar projects: bio-symphony-skylines, urban-heat, assistive-tech

**Need calibration?**
- Share work-in-progress with team
- Use Quality Rubric (Section 3.1 of main guide) for objective scoring
- Conduct peer review every 3-5 projects

---

**End of Quick Reference. Keep this handy while enriching!**
