# Project Showcase V2: Curriculum Enrichment Guide

**A Comprehensive Framework for Systematic Quality Improvement**

**Prepared by:** Expert Curriculum Designer
**Date:** October 5, 2025
**Target:** 30 PBL Project Showcases in ProjectShowcaseV2 Schema

---

## Executive Summary

This guide provides a systematic approach to enriching 30 project-based learning (PBL) showcases to address teacher feedback that projects lack sufficient detail regarding assignments, learning objectives, deliverables, and student learning outcomes. Through analysis of existing high-quality examples, this document establishes field-by-field excellence standards, assessment rubrics, and implementation protocols—all within the existing TypeScript schema constraints.

**Key Finding:** The schema is pedagogically robust and comprehensive. Quality gaps stem not from schema limitations but from incomplete or underdeveloped field utilization. High-quality projects leverage ALL available fields strategically.

---

## Table of Contents

1. [Phase 1: Gap Analysis](#phase-1-gap-analysis)
2. [Phase 2: Enrichment Strategy](#phase-2-enrichment-strategy)
3. [Phase 3: Quality Rubric](#phase-3-quality-rubric)
4. [Phase 4: Implementation Roadmap](#phase-4-implementation-roadmap)
5. [Appendix: Before/After Examples](#appendix-beforeafter-examples)

---

## Phase 1: Gap Analysis

### 1.1 What Makes Projects Feel "Not Detailed Enough"?

Based on analysis of existing projects, teacher concerns typically arise from:

**SYMPTOM A: Thin Assignment Cards**
- `studentDirections` use vague verbs ("Work on project," "Complete research") instead of specific, actionable tasks
- Missing `aiOptional` guidance leaves AI integration ambiguous
- `successCriteria` are assessment-focused ("gets an A") rather than skill-focused ("I can explain...")
- `checkpoint` field absent, eliminating formative feedback loops

**SYMPTOM B: Unclear Learning Objectives**
- `outcomes.core` states deliverables ("Create a poster") rather than learning targets ("Analyze systems using evidence")
- Missing connections between outcomes and standards
- No differentiation between content knowledge, skills, and dispositions

**SYMPTOM C: Weak Run of Show Details**
- `WeekCard.teacher` and `WeekCard.students` bullets are generic ("Facilitate discussion," "Work in groups")
- `deliverables` don't match assignment evidence requirements
- `checkpoint` absent, leaving teachers uncertain when/how to assess progress
- Missing `assignments` field linkage creates disconnect between weekly work and formal assignments

**SYMPTOM D: Underutilized Scaffolding Fields**
- `fullOverview` empty or just restates `microOverview`
- `planningNotes` missing critical logistical or pedagogical guidance
- `polish.microRubric` absent or too general
- `polish.checkpoints` don't align with `WeekCard.checkpoint` entries

**SYMPTOM E: Assessment Ambiguity**
- No clear connection between `successCriteria`, `microRubric`, and `outcomes`
- Evidence requirements unclear or mismatched to assignment tasks
- Missing formative assessment touchpoints throughout project arc

---

### 1.2 Comparison: High-Quality vs. Underdeveloped Projects

#### HIGH-QUALITY INDICATORS (from bio-symphony-skylines, urban-heat):

**Field Completeness:**
- ALL assignments include `aiOptional` with specific tool use cases
- `safety` fields present where relevant (fieldwork, fabrication)
- `fullOverview` expands on pedagogical approach
- `planningNotes` names specific logistical dependencies
- `polish.microRubric` contains 4-6 assessment-ready criteria

**Pedagogical Depth:**
- `studentDirections` use concrete action verbs (Capture, Label, Measure, Draft)
- `successCriteria` written in student voice ("I justify mappings," "I cite data")
- `checkpoint` fields create assessment rhythm (Week 1, Week 3, Week 5)
- `WeekCard` assignments linked explicitly to `AssignmentCard` IDs

**Authentic Detail:**
- Teacher bullets reference specific protocols, tools, templates
- Student bullets describe observable behaviors, not vague activities
- Deliverables are artifacts teachers can collect and assess
- Evidence lists are concrete, portfolio-worthy items

#### UNDERDEVELOPED INDICATORS:

- Generic verbs dominate ("Explore," "Discuss," "Learn about")
- Optional fields left blank (fullOverview, planningNotes, polish)
- No student-voice language in success criteria
- Assignments feel disconnected from weekly runOfShow
- Missing safety/ethics guidance for hands-on work
- Deliverables are vague ("Project work," "Notes")

---

### 1.3 Critical Missing Elements Across Projects

**Learning Objectives Clarity:**
- Current `outcomes.core` often describe products, not learning
- No explicit connection to Bloom's Taxonomy levels
- Missing vertical alignment (prerequisite skills, next-step standards)

**Formative Assessment:**
- Insufficient use of `checkpoint` fields in WeekCards
- No guidance on what "teacher approval" looks like
- Missing self-assessment or peer feedback protocols

**Differentiation & Access:**
- `planningNotes` rarely address diverse learners
- `noTechFallback` often minimal or absent
- Limited guidance for multilingual learners, IEP accommodations

**Real-World Authenticity:**
- Stakeholder roles sometimes vague
- Community partnerships underspecified
- Missing guidance on parent/guardian communication

---

## Phase 2: Enrichment Strategy

### 2.1 Field-by-Field Excellence Standards

#### **HERO SECTION**

**What it does:** First impression; establishes grade band, time commitment, interdisciplinary scope.

**Excellence Standards:**
- `tagline`: Active voice, student-as-agent framing (12-18 words)
  - GOOD: "Students transform campus waste data into community-backed action plans"
  - WEAK: "A project about sustainability"
- `subjects`: 3-6 disciplines with clear integration rationale
- `timeframe`: Matches `schedule.totalWeeks` precisely

**Enrichment Actions:**
- Review all taglines for passive voice; rewrite to foreground student agency
- Ensure subjects listed reflect actual work (check against assignments)
- Add optional `specLine` if project has unique tech/partnership requirements

---

#### **MICROOVERVIEW**

**What it does:** 3-4 sentence elevator pitch using bullet format; replaces traditional paragraph overview.

**Excellence Standards:**
- Sentence 1: What students investigate/audit/explore (inquiry hook)
- Sentence 2: What students design/build/analyze (making/doing)
- Sentence 3: How students share/pitch/publish (authentic audience)
- Each sentence: 12-28 words, concrete nouns and verbs

**Enrichment Actions:**
- Follow the Investigation → Creation → Communication arc
- Use specific verbs: audit, interview, model, prototype, pitch, publish
- Name actual artifacts: "dashboard," "pilot data," "policy brief"

**Template:**
```
"Students [verb] [specific data/context] to [uncover/understand] [problem]."
"Teams [design/build/model] [solution type] using [methods/tools]."
"They [present/publish/launch] [deliverable] to [authentic audience] with [impact]."
```

---

#### **FULLOVERVIEW**

**What it does:** Collapsed expandable section; provides pedagogical rationale and role framing.

**Excellence Standards:**
- 80-150 words in paragraph form (markdown allowed)
- Names student role ("sustainability consultants," "climate tacticians")
- References specific pedagogical moves (co-design, iteration, stakeholder pitches)
- Mentions unique project elements (financial models, sensory testing, equity analysis)

**Enrichment Actions:**
- Never just restate microOverview—add WHY this approach matters
- Include 1-2 pedagogical keywords: co-design, systems thinking, design justice
- Reference community partnerships or authentic constraints
- Hint at emotional/civic dimensions ("Climate resilience becomes personal")

**Quality Check:**
- If you deleted fullOverview, would teachers lose understanding of the project's approach? If no, rewrite.

---

#### **SCHEDULE**

**What it does:** Sets scope expectations for planning.

**Excellence Standards:**
- `totalWeeks` matches longest WeekCard label (if "Weeks 3-4" then ≥4 weeks)
- `lessonsPerWeek` is realistic (3-4 for integrated units, 2-3 for single subject)
- `lessonLengthMin` reflects actual instructional time (not passing periods)

**Enrichment Actions:**
- Cross-check totalWeeks against runOfShow array length
- Ensure lessonsPerWeek × totalWeeks × lessonLengthMin gives realistic total hours
- Add planning note if schedule is flexible/compressible

---

#### **RUNOFSHOW (WeekCard Array)**

**What it does:** Week-by-week teacher implementation guide; THE critical navigation structure.

**Excellence Standards for Each WeekCard:**

**A. weekLabel & kind & focus:**
- `weekLabel`: Use "Week 1" or "Weeks 3-4" format consistently
- `kind`: Strategic use of PhaseKind progression (Foundations → Planning → FieldworkLoop → Build → Exhibit → Extension)
- `focus`: 60-90 characters; names the conceptual/skill focus, not just activities
  - GOOD: "Analyze findings and identify highest-leverage interventions"
  - WEAK: "Work on projects"

**B. teacher (3-5 bullets, ≤10 words each):**
- Use strong verbs: Model, Facilitate, Coordinate, Coach, Broker, Shadow
- Name specific instructional moves: "Model ROI calculations using spreadsheets"
- Reference materials/protocols: "Provide approval checklist," "Share sample audit plans"
- Include facilitation language: "Host daily insight stand-ups"

**C. students (3-5 bullets, ≤10 words each):**
- Observable behaviors only: "Capture baseline photos," "Upload data to dashboards"
- Active verbs: Measure, Interview, Draft, Test, Present, Refine
- Concrete nouns: "calibrate measurement devices," "publish plan for approval"
- Avoid vague: "learn about," "explore," "work on"

**D. deliverables (2-3 bullets):**
- Portfolio-worthy artifacts teachers can collect
- Match evidence listed in linked assignments
- Version indicators when iterative (v1, vfinal, draft, final)
- Examples: "Approved audit plan," "Impact dashboard v1," "Pitch deck vfinal"

**E. checkpoint (1-2 bullets, optional but recommended):**
- When: 60-70% of WeekCards should have checkpoints
- What: Formative assessment gate before advancing
- How: Name WHO approves ("Teacher reviews," "Partners confirm," "Stakeholders endorse")
- Examples:
  - "Teacher validates one full audit cycle"
  - "Teams articulate a compelling why"
  - "Safety checklist signed before fieldwork"

**F. assignments (array of IDs):**
- Link to AssignmentCard IDs: ["A1"], ["A2", "A3"]
- Assignments can span multiple weeks (fieldwork loops)
- NOT every week needs an assignment (some weeks are just making/doing)

**G. repeatable (boolean):**
- Use for FieldworkLoop weeks where teams cycle through data collection
- Signals to teachers this is intentional iteration, not fixed timeline

**Enrichment Actions:**
- Audit every WeekCard for vague language; replace with specifics
- Ensure 60%+ have checkpoint entries
- Link ALL assignments to at least one week
- Balance teacher facilitation with student agency

---

#### **OUTCOMES**

**What it does:** Defines core learning targets and extension opportunities.

**Excellence Standards:**

**A. core (1-3 bullets):**
- These are MANDATORY learning goals all students will achieve
- Should be learning-focused, not just deliverable-focused
- Must be assessable using evidence from assignments
- Format options:
  - Action + measurable outcome: "Deliver a costed sustainability roadmap with measurable impact"
  - Skill demonstration: "Analyze urban systems using quantitative and qualitative evidence"
  - Publication/performance: "Present data-driven policy recommendations to stakeholders"

**B. extras (3-6 bullets):**
- Extension activities for teams finishing early or going deeper
- Should be accessible without fundamentally changing scope
- Can include differentiation options (more depth, different medium, larger audience)
- Examples: "Prototype low-cost efficiency upgrades," "Create upcycled recipe e-book"

**C. audiences (3-6 bullets):**
- Authentic stakeholders who will receive/judge/use student work
- Specific enough to contact: "City sustainability office" not "government"
- Should appear in runOfShow (pitches, showcases, partnerships)

**Enrichment Actions:**
- Rewrite any core outcome that's just a deliverable (add the learning verb)
- Ensure core outcomes align with microRubric criteria
- Verify audiences appear in teacher bullets (invites, partnerships)

**Before/After Example:**

BEFORE:
```typescript
core: ['Create a sustainability campaign']
```

AFTER:
```typescript
core: ['Deliver a costed sustainability roadmap with measurable impact claims backed by audit evidence']
```

---

#### **MATERIALSPREP**

**What it does:** Helps teachers budget and prepare for hands-on work.

**Excellence Standards:**

**A. coreKit (≤8 items):**
- List specific tools, not categories: "Handheld infrared thermometers" not "sensors"
- Include consumables if critical: "Poster printer access," "Compostable serving ware"
- Reference software when essential: "Laptops with GIS software," "DAW or browser synths"
- Group related items: "Stakeholder interview kits" (implies recorder, consent forms, protocol)

**B. noTechFallback (≤3 items):**
- ALWAYS include—no project should require perfect tech access
- Examples: "Paper tally sheets," "Analog thermometers," "Poster board displays"
- Should enable core learning even if digital tools unavailable

**C. safetyEthics (≤3 items):**
- Include if project involves: fieldwork, fabrication, human subjects, food, chemicals
- Be specific: "Follow PPE expectations in mechanical rooms" not "Be safe"
- Cover consent/permissions: "Obtain guardian consent for recording"
- Examples: "Hydration and break schedule," "Label allergens clearly"

**Enrichment Actions:**
- Expand generic "materials list" into specific brand/model when helpful
- NEVER leave noTechFallback empty
- Add safetyEthics for ANY project with hands-on or community components

---

#### **ASSIGNMENTS (AssignmentCard Array)**

**What it does:** Detailed assignment briefs that can be shared with students as handouts.

**Excellence Standards (3-6 assignments per project):**

**A. id, title, summary:**
- `id`: A1, A2, A3... (matches WeekCard.assignments references)
- `title`: ≤80 chars, student-friendly, describes the work: "Cafeteria Systems Portrait"
- `summary`: ≤25 words, elevator pitch of assignment purpose

**B. studentDirections (5-7 bullets, ≤10 words each):**
- THIS IS WHERE PROJECTS OFTEN FAIL. Students need crystal-clear task lists.
- Every bullet = one discrete, completable action
- Use imperative mood: "Photograph three waste hotspots," "Interview one staff member"
- Include submission detail: "Submit reflections to shared folder," "Publish plan for approval"
- Sequence logically: gather → analyze → create → share

**Quality Indicators:**
- Could a substitute teacher hand this to students and they'd know what to do? YES = good
- Are verbs specific enough to imagine the work? Capture, Label, Draft, Calculate, Rehearse = YES
- Do bullets reference tools/templates? "Log observations on systems map template" = YES

**C. teacherSetup (3-5 bullets, ≤10 words each):**
- Preparation tasks BEFORE assignment launch
- Examples: "Arrange kitchen tour schedule," "Print systems mapping templates"
- Facilitation moves DURING assignment: "Model effective photo evidence framing"
- Logistics: "Secure walkthrough permissions in advance"

**D. evidence (2-3 bullets):**
- Concrete artifacts teachers collect for portfolios/grading
- Must match deliverables listed in linked WeekCards
- Examples: "Completed systems map," "Pitch recording," "Impact dashboard"

**E. successCriteria (3-5 bullets, ≤8 words each):**
- STUDENT VOICE REQUIRED: "I can..." format
- Focus on skills/understanding, not compliance
- Should be usable for student self-assessment
- Examples:
  - "I capture clear evidence"
  - "I justify mappings with data"
  - "I ensure tone respects stakeholder time"

**F. checkpoint (1 line, optional):**
- Formative feedback moment before work proceeds
- Who provides it: "Teacher reviews insight statements for accuracy"
- Can reference peer review: "Peer critique circle approves contrast"

**G. aiOptional (object with 3 fields, optional but HIGHLY RECOMMENDED):**
- `toolUse`: What could AI help with? (≤12 words): "Summarize interview recordings"
- `critique`: What should students verify? (≤12 words): "Check AI summary for nuance"
- `noAIAlt`: What's the non-AI method? (≤12 words): "Use note-taking buddy system"

**Why this matters:** Helps teachers navigate AI integration transparently, gives students choice, prevents AI dependence.

**H. safety (1-3 bullets, only if essential):**
- Task-specific safety notes
- Examples: "Wear gloves during waste handling," "Pause fieldwork if heat index exceeds threshold"

**Enrichment Actions for Assignments:**

1. **Audit studentDirections:** If any bullet is vague, rewrite with concrete verb + specific artifact
2. **Add aiOptional to ALL assignments:** Even if tool use is simple ("Suggest chart titles from data")
3. **Convert successCriteria to student voice:** Change "Demonstrates understanding" → "I explain using evidence"
4. **Align evidence with deliverables:** Cross-check every evidence item appears in a WeekCard
5. **Expand teacherSetup with templates/protocols:** "Provide approval checklist" tells teachers WHAT to create

---

#### **POLISH (Optional but Recommended)**

**What it does:** Assessment rubric, project-level checkpoints, metadata tags.

**Excellence Standards:**

**A. microRubric (4-6 criteria, ≤12 words each):**
- These are the BIG assessment criteria for the whole project
- Should span: content knowledge, process quality, communication, impact
- Examples from bio-symphony-skylines:
  - "Evidence mapped to music rules"
  - "Clear, ethical data capture"
  - "Accessible exhibit labels"
  - "Actionable community next steps"

**Quality check:**
- Do criteria cover both product AND process? (not just final deliverable)
- Could teachers use these for summative grading? YES = good
- Do they connect to core outcomes? Should map 1:1

**B. checkpoints (2-5 bullets):**
- PROJECT-WIDE checkpoints (not just assignment-level)
- Should reference key WeekCard checkpoint moments
- Examples: "Safety + ethics sign-off," "First data validity check," "Gallery curation review"

**C. tags (1-4 codes):**
- Short codes for filtering/search: ['SUST', 'DATA', 'COMM']
- Use UPPERCASE or lowercase consistently
- Can reference: disciplines, UN SDGs, standards frameworks

**Enrichment Actions:**
- ADD microRubric to every project (even if simple 4-criteria version)
- Ensure checkpoints list mirrors WeekCard checkpoint rhythm
- Tags are low priority—focus on microRubric first

---

#### **PLANNINGNOTES (Optional but HIGHLY valuable)**

**What it does:** Collapsed section for critical teacher prep info.

**Excellence Standards:**
- 1-3 sentences naming logistical dependencies or pedagogical tips
- Focus on: partnerships, permissions, materials prep, timing constraints
- Examples:
  - "Loop in district facilities early so students can access meters without delays"
  - "Post consent signage on routes; schedule library gallery two weeks ahead"
  - "Obtain written site permissions two weeks prior; require removable materials"

**When to use:**
- Project has community partnerships → name lead time for coordination
- Project needs special permissions → specify approval workflow
- Project has safety considerations → reference required training
- Project has uncommon materials → note sourcing challenges

**Enrichment Actions:**
- Add planningNotes to 100% of projects (even one sentence helps)
- Include differentiation guidance if project serves wide grade/skill range
- Name common pitfalls: "Avoid scheduling fieldwork during extreme weather weeks"

---

### 2.2 Learning Objectives Clarity Framework

**Problem:** Teachers report not knowing what students will actually LEARN (vs. just DO).

**Solution:** Strengthen the outcomes.core → assignments → successCriteria → microRubric chain.

#### Step 1: Rewrite Core Outcomes Using Action Verbs

Use Bloom's Taxonomy + Webb's DOK framework:

**Bloom's Revised Taxonomy Verbs by Level:**
- **Remember:** Identify, List, Name, Recall, Define
- **Understand:** Explain, Summarize, Interpret, Classify, Compare
- **Apply:** Calculate, Demonstrate, Solve, Use, Execute
- **Analyze:** Differentiate, Organize, Attribute, Integrate, Deconstruct
- **Evaluate:** Check, Critique, Judge, Defend, Justify
- **Create:** Design, Construct, Plan, Produce, Generate

**Webb's DOK Levels:**
- **DOK 1:** Recall facts, definitions (lower cognitive demand)
- **DOK 2:** Apply concepts, make decisions, solve routine problems
- **DOK 3:** Strategic thinking, reasoning, supporting with evidence
- **DOK 4:** Extended thinking, synthesis, real-world application

**PBL Core Outcomes Should Target DOK 3-4:**

WEAK (DOK 1-2):
```typescript
core: ['Create a poster about heat islands']
```

STRONG (DOK 3-4):
```typescript
core: [
  'Analyze neighborhood heat inequality using multi-source evidence',
  'Design and test cooling interventions that balance equity and feasibility',
  'Communicate data-driven recommendations to civic stakeholders'
]
```

**Template for Core Outcomes:**
```
[Bloom's verb at Analyze/Evaluate/Create level] + [specific content/skill] + [using/with context/constraints]
```

---

#### Step 2: Cascade Learning Objectives Through Assignments

Each Assignment should address 1-2 core outcomes explicitly.

**Alignment Map Example (Sustainability Campaign):**

| Core Outcome | Assignments | Success Criteria |
|--------------|-------------|------------------|
| Deliver a costed sustainability roadmap with measurable impact | A1, A3, A4 | "I cite specific data," "ROI math checks out," "Ask includes next steps" |
| Design behavior-change campaigns | A4 | "Campaign assets feel on-brand," "Stakeholders confirm action alignment" |

---

#### Step 3: Use Success Criteria as Micro-Objectives

successCriteria should be SMART (Specific, Measurable, Achievable, Relevant, Time-bound).

**Student Voice Framing:**
- "I can [verb] [object] [quality standard]"
- Examples:
  - "I justify my mappings with evidence"
  - "I design interventions that meet safety thresholds"
  - "I cite sources transparently"

**Quality Check:**
- Can a student self-assess using this criterion? YES = good
- Is it about learning/skill, not compliance? "I cite sources" YES; "I turned it in" NO

---

#### Step 4: Connect to Standards (Even Without Changing Schema)

While the schema doesn't have a standards field, use `planningNotes` or `fullOverview` to reference:

**NGSS Example:**
```
planningNotes: 'Aligns with MS-LS2-5 (ecosystem interactions), MS-ESS3-3 (human impacts on Earth systems), and NGSS Practice 4 (analyzing and interpreting data).'
```

**Common Core ELA Example:**
```
planningNotes: 'Addresses CCSS.ELA-LITERACY.W.9-10.1 (argument writing), W.9-10.7 (research), SL.9-10.4 (presenting claims and findings).'
```

---

### 2.3 Assessment Richness Strategy

**Problem:** Teachers don't know HOW to assess or WHEN to give feedback.

**Solution:** Build robust formative + summative assessment infrastructure using existing fields.

#### Formative Assessment: Checkpoint Architecture

**Checkpoint Rhythm:**
- Week 1: Foundational understanding check ("Students articulate why")
- Week 2-3: Plan/protocol approval before fieldwork
- Mid-project: Data quality or prototype safety validation
- Pre-showcase: Rehearsal feedback or stakeholder alignment
- Post-launch: Handoff documentation

**Implementation:**
1. **Add checkpoint to 60-70% of WeekCards**
2. **Specify WHO approves:** Teacher, Partner, Peer panel
3. **Name WHAT gets approved:** "Teacher signs fieldwork plan," "Partners confirm action alignment"

**Example Progression (7-week project):**
- Week 1: "Teams articulate compelling why" (conceptual)
- Week 2: "Teacher signs audit plan before fieldwork" (procedural)
- Week 4: "Teacher validates first dataset" (quality)
- Week 6: "Stakeholders endorse next steps" (impact)

---

#### Summative Assessment: MicroRubric Design

**The microRubric is your summative assessment tool.** It should:
- Contain 4-6 criteria spanning dimensions of quality
- Be usable for grading (assign points/levels if needed)
- Connect directly to core outcomes

**Four-Dimension Framework for PBL Projects:**

1. **Content Mastery** (subject-specific knowledge)
   - Example: "Dashboard stories center data and people equally"

2. **Process Quality** (craft, rigor, methodology)
   - Example: "Evidence connects to measurable impact claims"

3. **Communication** (clarity, audience awareness)
   - Example: "Accessible exhibit labels," "Summit pitch makes actionable ask"

4. **Impact/Ethics** (real-world application, responsibility)
   - Example: "Partner voice leads the story," "Roadmap balances ambition with feasibility"

**Enrichment Template:**
```typescript
microRubric: [
  '[Content criterion: factual accuracy, evidence use, technical skill]',
  '[Process criterion: methodology, safety, iteration quality]',
  '[Communication criterion: clarity, audience fit, persuasiveness]',
  '[Impact criterion: stakeholder value, ethics, sustainability]'
]
```

---

#### Converting MicroRubric to Grading Rubric

While schema stores criteria as strings, teachers can expand into analytic rubric:

**Example: "Evidence connects to measurable impact claims"**

| Level | Descriptor |
|-------|------------|
| **4 - Exemplary** | Every claim is supported by specific, cited evidence; impact metrics are quantified and visualized clearly |
| **3 - Proficient** | Most claims have supporting evidence; impact metrics are present and generally accurate |
| **2 - Developing** | Some claims lack evidence; impact metrics are vague or inconsistently applied |
| **1 - Beginning** | Claims are largely unsupported; impact metrics absent or inaccurate |

**Teacher Implementation Note:**
Include this expansion guidance in professional development or teacher guides, not the schema itself.

---

### 2.4 Differentiation & Access Guidance

**Problem:** Projects don't explicitly support diverse learners.

**Solution:** Use existing fields strategically + add differentiation guidance to planningNotes.

#### Leveraging Existing Fields:

**1. noTechFallback (Universal Design for Learning - UDL Principle 1: Representation)**
- Provides alternative means of accessing information
- Should be FULLY FUNCTIONAL alternatives, not lesser versions
- Example: "Paper tally sheets" instead of "Apps for data entry"

**2. aiOptional.noAIAlt (UDL Principle 2: Action & Expression)**
- Gives students choice in how they demonstrate learning
- Removes tech barriers without lowering expectations
- Example: "Use peer critique protocol" vs. "Use AI feedback tool"

**3. Multiple Entry Points in StudentDirections (UDL Principle 3: Engagement)**
- Include choices within assignment directions
- Example: "Select three opportunities" allows student agency within structure

#### Adding Differentiation Guidance to PlanningNotes:

**Template:**
```
planningNotes: '[Logistical prep]. For differentiation: [scaffolds for struggling learners]; [extensions for advanced learners]; [accommodations for IEPs/504s].'
```

**Example:**
```
planningNotes: 'Secure kitchen access two weeks ahead. For differentiation: provide sentence stems for interview protocols (ELL support); offer advanced teams dual-intervention challenges; ensure audit templates are screen-reader compatible.'
```

**Scaffold Examples:**
- **ELL/Language Support:** "Provide sentence stems," "Pre-teach domain vocabulary," "Pair with bilingual buddy"
- **IEP/504 Accommodations:** "Extended time for fieldwork," "Graphic organizers for data analysis," "Audio recording option"
- **Advanced Extensions:** "Cross-analyze with national datasets," "Prototype two interventions," "Prepare district-level recommendations"
- **Varied Readiness:** "Tiered data templates (simple/complex)," "Choice of presentation format," "Flexible grouping by interest"

---

## Phase 3: Quality Rubric

### 3.1 Project Quality Evaluation Rubric

Use this rubric to assess each of the 30 projects for readiness and identify enrichment priorities.

**Scoring:**
- 4 = Exemplary (exceeds standards)
- 3 = Proficient (meets standards)
- 2 = Developing (partially meets)
- 1 = Beginning (significant gaps)

**Target:** All projects should score 3-4 across all criteria before publication.

---

#### CRITERION 1: CLARITY OF LEARNING OBJECTIVES (Weight: 20%)

**4 - Exemplary:**
- `outcomes.core` includes 2-3 learning-focused goals using Bloom's Analyze/Evaluate/Create verbs
- Clear alignment between outcomes, assignment successCriteria, and microRubric
- Evidence of DOK 3-4 cognitive demand throughout
- Connection to standards referenced in planningNotes or fullOverview

**3 - Proficient:**
- `outcomes.core` focuses on learning (not just deliverables)
- Most assignments connect to core outcomes
- successCriteria support self-assessment
- Cognitive demand is appropriate for grade band

**2 - Developing:**
- `outcomes.core` mixes learning goals with deliverable descriptions
- Some assignments lack clear connection to outcomes
- successCriteria are assessment-focused ("gets a good grade") rather than skill-focused
- Cognitive demand is uneven

**1 - Beginning:**
- `outcomes.core` only lists deliverables
- Unclear what students will actually LEARN
- successCriteria missing or purely compliance-based
- Low cognitive demand (recall/understand only)

---

#### CRITERION 2: ASSIGNMENT DEPTH & ACTIONABILITY (Weight: 25%)

**4 - Exemplary:**
- ALL assignments (3-6) include complete fields: studentDirections (5-7 bullets), teacherSetup, evidence, successCriteria, checkpoint
- studentDirections use specific verbs and reference tools/templates
- aiOptional present for 80%+ assignments with thoughtful integration
- safety field included where appropriate
- Could be used as standalone student handouts

**3 - Proficient:**
- Most assignments have complete core fields
- studentDirections are specific and actionable
- aiOptional included for 50%+ assignments
- Teachers could implement with minimal clarification

**2 - Developing:**
- Some assignments missing optional fields (checkpoint, aiOptional)
- studentDirections include vague verbs ("work on," "explore")
- teacherSetup lacks specifics about templates/protocols
- Would require significant teacher interpretation

**1 - Beginning:**
- Assignments incomplete (missing fields)
- studentDirections too vague to implement
- No aiOptional guidance
- Not usable without major revision

---

#### CRITERION 3: RUN OF SHOW SCAFFOLDING (Weight: 20%)

**4 - Exemplary:**
- 6-12 WeekCards with clear phase progression (Foundations → Extension)
- Teacher and student bullets use specific, concrete language
- 60-70% of weeks include checkpoint field
- ALL assignments linked to specific weeks
- deliverables align with assignment evidence
- Repeatable flag used appropriately for iteration cycles

**3 - Proficient:**
- WeekCards cover full project timeline
- Most bullets are specific (some generic acceptable)
- 40-50% of weeks have checkpoints
- Most assignments linked to weeks
- deliverables are concrete

**2 - Developing:**
- Some weeks feel rushed or underspecified
- Many bullets use vague language
- <30% of weeks have checkpoints
- Unclear when assignments happen
- deliverables don't match evidence

**1 - Beginning:**
- Incomplete week coverage
- Generic bullets dominate ("discuss," "work on")
- No checkpoints
- Assignments disconnected from timeline
- Vague deliverables

---

#### CRITERION 4: ASSESSMENT ARCHITECTURE (Weight: 20%)

**4 - Exemplary:**
- microRubric includes 4-6 criteria spanning content, process, communication, impact
- Checkpoint rhythm established across WeekCards
- successCriteria in student voice ("I can...")
- Clear formative → summative assessment pathway
- Teachers could use microRubric for grading immediately

**3 - Proficient:**
- microRubric present with 4+ criteria
- Multiple checkpoints throughout project
- Most successCriteria are student-focused
- Assessment approach is clear

**2 - Developing:**
- microRubric missing or <4 criteria
- Few checkpoints (1-2 total)
- successCriteria are mixed quality
- Assessment approach unclear

**1 - Beginning:**
- No microRubric
- No checkpoints
- successCriteria missing or purely compliance-based
- No clear assessment strategy

---

#### CRITERION 5: MATERIALS & LOGISTICS COMPLETENESS (Weight: 10%)

**4 - Exemplary:**
- coreKit lists specific tools/materials (≤8)
- noTechFallback provides FULL alternative approach
- safetyEthics included for hands-on/fieldwork projects
- planningNotes names critical prep/partnership steps
- Teachers could budget and prepare immediately

**3 - Proficient:**
- coreKit is complete and specific
- noTechFallback is present and functional
- safetyEthics included where needed
- planningNotes provides key guidance

**2 - Developing:**
- coreKit too vague ("sensors" vs. "infrared thermometer")
- noTechFallback is minimal
- safetyEthics missing where needed
- planningNotes absent or unhelpful

**1 - Beginning:**
- materialsPrep incomplete
- No noTechFallback
- Safety concerns not addressed
- No planning guidance

---

#### CRITERION 6: AUTHENTIC CONTEXT & AUDIENCE (Weight: 5%)

**4 - Exemplary:**
- `audiences` lists 3-6 specific stakeholders
- Stakeholder engagement appears in multiple WeekCards
- Community partnerships integrated throughout (not just final presentation)
- Student work addresses real community need

**3 - Proficient:**
- audiences listed and specific
- Stakeholders appear in showcase/pitch weeks
- Project has authentic purpose

**2 - Developing:**
- audiences too vague ("government," "people")
- Stakeholder engagement limited to one week
- Authenticity unclear

**1 - Beginning:**
- No clear audience
- Project feels academic exercise only
- No community connection

---

### 3.2 Ready-for-Teachers Checklist

Before publishing any project, verify ALL items:

**MUST-HAVES (Non-Negotiable):**
- [ ] Hero tagline in active voice with student agency
- [ ] microOverview follows Investigation → Creation → Communication arc
- [ ] fullOverview provides pedagogical rationale (not just restatement)
- [ ] runOfShow covers full timeline with phase labels
- [ ] 40%+ of WeekCards have checkpoint entries
- [ ] 3-6 assignments with complete studentDirections (5-7 bullets each)
- [ ] successCriteria in student voice for ALL assignments
- [ ] microRubric with 4+ criteria present
- [ ] noTechFallback provided (never blank)
- [ ] safetyEthics included if project involves: fieldwork, fabrication, food, human subjects, chemicals

**STRONGLY RECOMMENDED:**
- [ ] planningNotes names key prep steps or partnerships
- [ ] aiOptional included for 50%+ assignments
- [ ] All assignments linked to WeekCards via assignments field
- [ ] deliverables match assignment evidence fields
- [ ] outcomes.core focuses on learning (not just deliverables)

**NICE-TO-HAVES:**
- [ ] Differentiation guidance in planningNotes
- [ ] Standards alignment referenced
- [ ] polish.tags for searchability
- [ ] Partner/stakeholder testimonials in fullOverview

---

## Phase 4: Implementation Roadmap

### 4.1 Systematic Enrichment Process

**Timeline:** 4-6 weeks for 30 projects (batch processing recommended)

#### WEEK 1: AUDIT & PRIORITIZE

**Day 1-2: Batch Assessment**
- [ ] Score all 30 projects using Quality Rubric (Section 3.1)
- [ ] Calculate average score per criterion across portfolio
- [ ] Identify 3 highest-scoring projects as exemplars
- [ ] Identify 5 lowest-scoring projects for intensive revision

**Day 3-4: Gap Analysis**
- [ ] Create spreadsheet tracking which fields are missing/weak per project
- [ ] Identify patterns: Are ALL projects missing planningNotes? Is aiOptional universally absent?
- [ ] Prioritize enrichment by impact: Fix microRubric absence (affects 20+ projects) before polishing individual bullets

**Day 5: Create Work Batches**
- **Batch A (Intensive):** 5 projects scoring <2.5 average (full rebuild needed)
- **Batch B (Moderate):** 15 projects scoring 2.5-3.2 (targeted enrichment)
- **Batch C (Polish):** 10 projects scoring 3.3-4.0 (minor refinements)

---

#### WEEK 2: BUILD TEMPLATES & EXEMPLARS

**Create Reusable Templates:**

1. **Assignment Card Template** (Google Doc or Notion page):
```markdown
## Assignment [ID]: [Title]

**Summary:** [≤25 words]

### Student Directions (5-7 bullets, ≤10 words each):
- [ ] [Imperative verb] + [specific object] + [context/tool]
- [ ] [Example: "Photograph three waste hotspots using grid template"]
...

### Teacher Setup (3-5 bullets):
- [ ] [Prep task: "Print data collection templates"]
- [ ] [Facilitation move: "Model interview protocol using roleplay"]
...

### Evidence (2-3 artifacts):
- [Portfolio item 1]
- [Portfolio item 2]

### Success Criteria (3-5 bullets, student voice):
- I can [verb] [object] [quality standard]
...

### Checkpoint (optional):
[Who] [reviews/approves] [what] [when]

### AI Integration (optional):
- **Tool Use:** [What AI could help with, ≤12 words]
- **Critique:** [What students should verify, ≤12 words]
- **No-AI Alternative:** [Non-AI method, ≤12 words]

### Safety Notes (if needed):
- [Specific safety protocol]
```

2. **WeekCard Template:**
```markdown
## Week [#]: [Phase Kind] - [Focus]

**Teacher Moves (3-5 bullets):**
- Model [specific skill/protocol]
- Facilitate [type of session] using [tool/structure]
- Coach [student action] through [support method]

**Student Actions (3-5 bullets):**
- [Observable verb] [specific artifact]
- [Data verb: Measure, Log, Calculate] [what] [where/how]
- [Creation verb: Draft, Prototype, Test] [deliverable]

**Deliverables (2-3):**
- [Artifact name] [version indicator if iterative]

**Checkpoint:**
- [Who] [verb: validates, approves, confirms] [what]

**Assignments:** [A1, A2]
```

3. **MicroRubric Template:**
```markdown
## Assessment Criteria (4-6 bullets, ≤12 words each)

1. [Content/Knowledge dimension]: [Criterion about factual accuracy, technical skill, evidence use]
2. [Process/Methodology dimension]: [Criterion about rigor, safety, iteration, data quality]
3. [Communication dimension]: [Criterion about clarity, audience fit, persuasiveness]
4. [Impact/Ethics dimension]: [Criterion about stakeholder value, responsibility, sustainability]
```

**Extract Exemplar Language:**
- Mine bio-symphony-skylines, urban-heat for strong studentDirections verbs
- Compile list of 50+ concrete teacher facilitation moves
- Create bank of student-voice successCriteria statements

---

#### WEEK 3-4: SYSTEMATIC ENRICHMENT (BATCHES A & B)

**Day-by-Day Workflow (per project):**

**Monday: Foundations (Hero → Outcomes)**
- [ ] Rewrite tagline for student agency if needed
- [ ] Check microOverview follows 3-sentence arc
- [ ] Expand fullOverview to include pedagogical approach
- [ ] Rewrite outcomes.core to focus on learning (not just deliverables)

**Tuesday: Run of Show**
- [ ] Audit every WeekCard for vague language
- [ ] Add checkpoint to 60% of weeks
- [ ] Link assignments to weeks
- [ ] Ensure deliverables match assignment evidence

**Wednesday: Assignments (Part 1)**
- [ ] Expand studentDirections to 5-7 specific bullets
- [ ] Rewrite successCriteria in student voice
- [ ] Add checkpoint where formative feedback needed

**Thursday: Assignments (Part 2)**
- [ ] Add aiOptional to 50%+ assignments
- [ ] Expand teacherSetup with template/protocol references
- [ ] Add safety fields where needed

**Friday: Assessment & Logistics**
- [ ] Write/refine microRubric (4-6 criteria)
- [ ] Verify noTechFallback is functional
- [ ] Add planningNotes with key prep info
- [ ] Run Quality Rubric check → should score 3.0+

**Weekly Cycle:** 5 projects/week = 4 weeks for 20 projects (Batches A+B)

---

#### WEEK 5: POLISH BATCH C & QA

**Batch C Projects (already strong):**
- Quick pass for missing optional fields (aiOptional, planningNotes)
- Student-voice successCriteria conversion
- Checkpoint rhythm verification

**Quality Assurance:**
- [ ] Run Ready-for-Teachers Checklist on ALL 30 projects
- [ ] Cross-check assignment evidence matches WeekCard deliverables
- [ ] Verify all assignment IDs referenced in WeekCards exist
- [ ] Spell-check, consistency check (Week 1 vs. Week One, etc.)

---

#### WEEK 6: VALIDATION & DOCUMENTATION

**Teacher Review Panel:**
- Share 3 revised projects with 2-3 teachers
- Ask: "Could you implement this next week? What's missing?"
- Gather feedback on clarity, completeness, feasibility

**Update Schema Types if Needed:**
- If patterns emerge (e.g., all projects need "prerequisite skills" field), document for future schema v3

**Create Teacher Implementation Guides:**
- For each project, consider optional 1-page "Teacher Quick Start" PDF:
  - Week-at-a-glance calendar
  - Materials shopping list with links
  - Partnership outreach templates
  - Grading rubric expansion (convert microRubric to point-based)

---

### 4.2 Quality Control Gates

**Gate 1 (After Batch A):**
- Review first 5 intensive revisions as team
- Calibrate quality standards
- Update templates based on learnings

**Gate 2 (After Batch B):**
- Spot-check 20% of revised projects
- Verify consistency in student-voice successCriteria
- Ensure aiOptional guidance is practical (not theoretical)

**Gate 3 (Final QA):**
- ALL projects score 3.0+ on Quality Rubric
- 100% pass Ready-for-Teachers Checklist must-haves
- Random 10-project sample reviewed by external educator

---

### 4.3 Success Metrics

Track these metrics before/after enrichment:

**Completeness Metrics:**
- % of projects with fullOverview: Target 100%
- % of projects with microRubric: Target 100%
- % of projects with planningNotes: Target 90%+
- % of assignments with aiOptional: Target 60%+
- % of WeekCards with checkpoints: Target 60%+

**Quality Metrics:**
- Average Quality Rubric score: Target 3.2+
- % of successCriteria in student voice: Target 90%+
- % of studentDirections using specific verbs: Target 95%+

**Teacher Usability Metrics (via survey after pilot):**
- "I felt prepared to implement this project": Target 85% agree/strongly agree
- "Learning objectives were clear": Target 90% agree/strongly agree
- "I knew when/how to assess students": Target 85% agree/strongly agree
- "Materials list was complete and realistic": Target 90% agree/strongly agree

---

## Appendix: Before/After Examples

### Example 1: Assignment Card Enrichment

#### BEFORE (Underdeveloped):
```typescript
{
  id: 'A1',
  title: 'Research Project',
  summary: 'Students research their topic.',
  studentDirections: [
    'Do research on your topic',
    'Take notes',
    'Organize your findings'
  ],
  teacherSetup: ['Provide resources'],
  evidence: ['Research notes'],
  successCriteria: ['Complete research', 'Good notes']
}
```

**Problems:**
- Vague verbs: "Do research," "Take notes"
- No tools/templates referenced
- successCriteria not student-voiced
- Missing checkpoint, aiOptional
- Could not be used as student handout

---

#### AFTER (Enriched):
```typescript
{
  id: 'A1',
  title: 'Community Heat Audit Launch',
  summary: 'Students analyze neighborhood heat data and conduct empathy interviews with vulnerable residents.',
  studentDirections: [
    'Analyze local heat map data using provided GIS layers',
    'Interview one heat-vulnerable neighbor using protocol',
    'Transcribe three key quotes into empathy map template',
    'Identify two priority blocks for fieldwork',
    'Draft one-paragraph justice pledge for your team',
    'Submit empathy map and pledge to shared folder'
  ],
  teacherSetup: [
    'Curate heat map data from city open data portal',
    'Invite community partner for storytelling session',
    'Print empathy map graphic organizers (1 per student)',
    'Model respectful note-taking during interview demo',
    'Provide sentence stems for pledge writing'
  ],
  evidence: [
    'Completed empathy map with resident quotes',
    'Signed justice pledge statement'
  ],
  successCriteria: [
    'I capture quotes accurately and respectfully',
    'I identify vulnerable populations using data',
    'I connect heat impacts to equity issues',
    'I commit to specific inclusive practices'
  ],
  checkpoint: 'Teacher reviews empathy maps for quote accuracy before fieldwork',
  aiOptional: {
    toolUse: 'Summarize climate article in student-friendly language',
    critique: 'Check summary avoids jargon and centers human voices',
    noAIAlt: 'Use peer annotation protocol to create summary'
  }
}
```

**Improvements:**
- Specific verbs: Analyze, Interview, Transcribe, Identify, Draft, Submit
- Tools/templates named: GIS layers, empathy map template, sentence stems
- Student-voice successCriteria: "I capture," "I identify," "I connect"
- Checkpoint creates formative feedback moment
- aiOptional provides AI integration guidance
- Teachers know exactly what to prep; students know exactly what to do

---

### Example 2: WeekCard Enrichment

#### BEFORE (Underdeveloped):
```typescript
{
  weekLabel: 'Week 3',
  kind: 'Build',
  focus: 'Work on prototypes.',
  teacher: [
    'Help students',
    'Answer questions',
    'Check progress'
  ],
  students: [
    'Work on projects',
    'Build prototypes',
    'Get feedback'
  ],
  deliverables: ['Prototype work'],
  // no checkpoint
  // no assignments linked
}
```

**Problems:**
- Focus is activity-based, not conceptual
- Generic teacher moves: "Help students"
- Vague student actions: "Work on projects"
- Deliverable not specific
- No checkpoint or assignment linkage

---

#### AFTER (Enriched):
```typescript
{
  weekLabel: 'Week 3',
  kind: 'Build',
  focus: 'Prototype cooling interventions and test temperature deltas.',
  teacher: [
    'Facilitate material sourcing and budget tracking',
    'Model risk assessment protocol for installations',
    'Coordinate pilot testing at three partner sites',
    'Host daily stand-ups to troubleshoot blockers',
    'Review safety checklists before field tests'
  ],
  students: [
    'Construct small-scale cooling prototypes using kits',
    'Conduct controlled tests measuring before/after temperatures',
    'Interview users about comfort and feasibility',
    'Log test data in shared spreadsheet',
    'Photograph installations for documentation'
  ],
  deliverables: [
    'Prototype spec sheet with materials list',
    'Temperature delta comparison chart',
    'User feedback synthesis notes'
  ],
  checkpoint: ['Teacher approves safety plan before site installations'],
  assignments: ['A3']
}
```

**Improvements:**
- Focus names specific skill: "test temperature deltas"
- Teacher moves are concrete: Facilitate, Model, Coordinate, Host, Review
- Student actions observable: Construct, Conduct, Interview, Log, Photograph
- Deliverables are portfolio-worthy artifacts
- Checkpoint ensures safety gate
- Assignment A3 linked to this week's work

---

### Example 3: Core Outcomes Transformation

#### BEFORE (Deliverable-Focused):
```typescript
outcomes: {
  core: [
    'Create a sustainability campaign poster',
    'Make a presentation to the class'
  ],
  extras: ['Do extra research'],
  audiences: ['Teachers', 'Students']
}
```

**Problems:**
- Core outcomes are products, not learning
- No evidence of higher-order thinking
- Audiences too vague
- Extras not meaningful

---

#### AFTER (Learning-Focused):
```typescript
outcomes: {
  core: [
    'Analyze campus resource systems using quantitative audits and stakeholder interviews',
    'Design evidence-based sustainability interventions that balance impact and feasibility',
    'Communicate data-driven recommendations to decision-makers through persuasive narratives'
  ],
  extras: [
    'Develop behavior-change marketing campaigns using psychology principles',
    'Model ROI scenarios for district-wide scaling',
    'Produce executive summary videos for community partners',
    'Draft policy recommendations with legislative language'
  ],
  audiences: [
    'Facilities leadership and operations teams',
    'Student government sustainability committee',
    'District sustainability coordinator',
    'Local environmental nonprofit partners'
  ]
}
```

**Improvements:**
- Core outcomes use Bloom's verbs: Analyze, Design, Communicate
- Learning processes named: "using quantitative audits," "balance impact and feasibility"
- DOK 3-4 cognitive demand
- Extras provide meaningful extensions (not just "more work")
- Audiences specific enough to contact

---

### Example 4: MicroRubric Creation

#### BEFORE (Missing):
```typescript
polish: {
  // microRubric field absent
  tags: ['sustainability']
}
```

---

#### AFTER (4-Dimension Rubric):
```typescript
polish: {
  microRubric: [
    'Evidence connects to measurable impact claims',
    'Stakeholder voices appear respectfully and accurately',
    'Campaign assets feel on-brand for school culture',
    'Roadmap balances ambition with fiscal feasibility'
  ],
  checkpoints: [
    'Audit plan approved before fieldwork starts',
    'Dashboards peer-reviewed before stakeholder pitch',
    'Campaign handoff documented with staff partners'
  ],
  tags: ['SUST', 'DATA', 'COMM', 'CIVIC']
}
```

**Improvements:**
- Criterion 1 (Content): Evidence quality and measurement
- Criterion 2 (Process): Ethical data practices
- Criterion 3 (Communication): Audience-appropriate design
- Criterion 4 (Impact): Real-world constraints honored
- Checkpoints create assessment rhythm
- Tags updated for multi-dimensional classification

---

## Implementation Quick Reference

### Enrichment Priority Matrix

**If project scores LOW on Criterion 1 (Learning Objectives):**
1. Rewrite outcomes.core using Bloom's verbs
2. Add student-voice successCriteria to ALL assignments
3. Create microRubric aligned to outcomes

**If project scores LOW on Criterion 2 (Assignment Depth):**
1. Expand studentDirections to 5-7 specific bullets
2. Add aiOptional to 50%+ assignments
3. Include teacherSetup templates/protocols
4. Add checkpoints for formative feedback

**If project scores LOW on Criterion 3 (Run of Show):**
1. Eliminate vague verbs in teacher/student bullets
2. Add checkpoint to 60% of weeks
3. Link assignments to specific weeks
4. Align deliverables with assignment evidence

**If project scores LOW on Criterion 4 (Assessment):**
1. Create 4-6 criterion microRubric
2. Add checkpoints throughout timeline
3. Convert successCriteria to student voice
4. Document formative → summative pathway

**If project scores LOW on Criterion 5 (Materials/Logistics):**
1. Make coreKit items specific (brands/models)
2. Build functional noTechFallback (not placeholder)
3. Add safetyEthics for hands-on work
4. Write planningNotes with prep timeline

---

## Conclusion

The ProjectShowcaseV2 schema is pedagogically sound and comprehensive. Quality improvement requires **systematic utilization of existing fields**, not schema redesign. By following this enrichment framework, all 30 projects can achieve:

- **Teacher Clarity:** Educators know exactly what to prep, facilitate, and assess
- **Student Agency:** Learners see clear pathways and can self-assess progress
- **Learning Focus:** Projects emphasize skills and understanding, not just deliverables
- **Assessment Rigor:** Formative checkpoints and summative rubrics support meaningful evaluation
- **Accessibility:** Multiple entry points and alternatives support diverse learners

**Next Steps:**
1. Score all 30 projects using Quality Rubric (Section 3.1)
2. Create project batches (intensive/moderate/polish)
3. Build templates for assignments, WeekCards, rubrics (Section 4.1, Week 2)
4. Execute systematic enrichment (4-6 week timeline)
5. QA using Ready-for-Teachers Checklist
6. Pilot with teacher panel for validation

This framework ensures consistency, quality, and usability across the entire project portfolio.
