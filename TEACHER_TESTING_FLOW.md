# Teacher Testing Flow - ALF Coach

## Quick Start Testing Guide

### 🎯 Testing as Different Teacher Personas

#### Persona 1: Sarah - The New Teacher (Elementary, Low Tech)
**Goal**: Create her first PBL unit on "Community Helpers"
- Start cautiously, needs lots of guidance
- Uses "Ideas" button frequently
- Takes time to understand each step
- Saves progress often

#### Persona 2: Marcus - The Innovator (High School STEM)
**Goal**: Design an interdisciplinary robotics project
- Moves quickly through wizard
- Wants to customize everything
- Tests advanced features
- Integrates multiple subjects

#### Persona 3: Elena - The Veteran (Middle School)
**Goal**: Transform traditional unit into PBL experience
- Has clear vision already
- Skips suggestions often
- Focuses on assessment/rubrics
- Values time-saving features

---

## 📋 Ideal Teacher Flow (Step-by-Step)

### Stage 0: Landing & Onboarding
**What Teachers See:**
1. Landing page with clear value proposition
2. "Start Creating" or "Sign In" options
3. Optional: Watch 2-min overview video

**What Teachers Do:**
- Click "Start Creating" (can begin without account)
- View ALF Process overview (can skip if experienced)

**Expected Experience:**
- Feel welcomed and supported
- Understand the value immediately
- No barriers to starting

---

### Stage 1: Vision & Context (Wizard - 2 min)

**Step 1: Teaching Vision**
- **See**: Three cards (Traditional, Balanced, Progressive)
- **Do**: Select teaching approach
- **Feel**: Validated in their style

**Step 2: Subject & Topic**
- **See**: Clean input field with examples
- **Do**: Enter "Environmental Science - Climate Change" (or their topic)
- **Feel**: Focused and clear

**Step 3: Classroom Context**
- **See**: Grade level, duration, class size options
- **Do**: Select "9-10th grade, 4 weeks, 25 students"
- **Feel**: Context is understood

**Step 4: Resources**
- **See**: Materials and support options
- **Do**: Specify available resources
- **Feel**: Constraints acknowledged

✅ **Checkpoint**: Click "Start Creating" → Advances to Ideation

---

### Stage 2: Ideation (10 min)

**What Teachers Experience:**

#### 2.1 Big Idea
**Prompt**: "What's the core concept you want students to explore?"

**Teacher Actions**:
- Type response OR
- Click "Ideas" for AI suggestions
- Click "What If?" for alternatives

**Good Response**: "The role of public and private space in cities"
**AI Enhancement**: Helps refine to compelling, student-centered language

#### 2.2 Essential Question
**Prompt**: "What driving question will guide student inquiry?"

**Teacher Actions**:
- Build on Big Idea
- Ensure it's open-ended
- Test with "What If?"

**Good Response**: "How might we redesign our community spaces to better serve all residents?"

#### 2.3 Challenge/Project
**Prompt**: "What will students create or do?"

**Teacher Actions**:
- Define concrete deliverable
- Consider authentic audience
- Use "Ideas" if stuck

**Good Response**: "Design a proposal for reimagining a local public space"

✅ **Save Point**: Click "Save & Exit" → Returns to dashboard with saved progress

---

### Stage 3: Learning Journey (15 min)

#### 3.1 Learning Phases
**See**: Phase selector with 3-5 options
**Do**: 
- Select phases (Research → Design → Create → Share)
- Drag to reorder
- Edit names/duration

**Experience**: Visual, intuitive organization

#### 3.2 Learning Activities
**See**: Activity accumulator interface
**Do**:
- Add activities to each phase
- Mix types (individual, group, field)
- Build progressively

**Example Activities**:
- Phase 1: Community walk, expert interviews
- Phase 2: Sketching, prototyping
- Phase 3: Model building, testing
- Phase 4: Presentation prep

#### 3.3 Resources
**See**: Resource selector by type
**Do**:
- Add digital tools
- Include physical materials
- Identify human resources
- Consider field trips

✅ **Save Point**: Progress auto-saves, can exit anytime

---

### Stage 4: Deliverables (10 min)

#### 4.1 Milestones
**See**: Timeline builder
**Do**:
- Set 4-6 checkpoints
- Assign deliverables
- Distribute across timeline

**Example**:
- Week 1: Research complete
- Week 2: Initial designs
- Week 3: Prototype ready
- Week 4: Final presentation

#### 4.2 Rubric
**See**: Customizable criteria grid
**Do**:
- Select/edit assessment criteria
- Adjust weights
- Define success levels

**Categories**:
- Research Quality (25%)
- Design Thinking (25%)
- Collaboration (25%)
- Presentation (25%)

#### 4.3 Impact
**See**: Audience and sharing method options
**Do**:
- Select authentic audience
- Choose presentation format

**Example**: "Present to City Council via formal proposal"

---

### Stage 5: Completion & Export

**What Happens**:
1. "Project Blueprint Complete!" celebration
2. Review full blueprint
3. Export options appear

**Export Choices**:
- Teacher Guide PDF (implementation details)
- Student Guide PDF (student-facing)
- Google Docs (editable)
- Raw data (JSON)

**Final Actions**:
- Download materials
- Share with colleagues
- Return to dashboard
- Start new project

---

## 🔍 Testing Checklist

### Core Functionality
- [ ] Can create project without account
- [ ] Save & Exit works at every stage
- [ ] Can resume exactly where left off
- [ ] Delete projects from dashboard
- [ ] All exports generate correctly

### AI Assistance
- [ ] "Ideas" provides relevant suggestions
- [ ] "What If?" offers alternatives
- [ ] "Help" gives useful guidance
- [ ] AI enhances not replaces teacher input

### User Experience
- [ ] Input always at bottom (ChatGPT style)
- [ ] Progress sidebar shows captured data
- [ ] Loading states are clear
- [ ] Error messages are helpful
- [ ] Mobile responsive

### Data Persistence
- [ ] Saves to localStorage (offline)
- [ ] Syncs to Firebase (online)
- [ ] No data loss on refresh
- [ ] Works without internet

### Stage Transitions
- [ ] Wizard → Ideation smooth
- [ ] Ideation → Journey preserves data
- [ ] Journey → Deliverables maintains context
- [ ] Can navigate backward if needed

---

## 🎓 Success Metrics

**Time to Complete**: 
- First-timer: 30-40 minutes
- Experienced: 15-20 minutes

**Quality Indicators**:
- Complete blueprint generated
- All sections have content
- Rubric is comprehensive
- Timeline is realistic

**Teacher Satisfaction**:
- "This saved me hours"
- "The AI really understood my needs"
- "I can actually use this tomorrow"
- "My students will love this project"

---

## 🐛 Common Issues to Test

1. **Save & Exit at partial completion**
   - Should save any stage
   - Should resume correctly

2. **Network interruption**
   - Should continue working
   - Should save locally

3. **Browser refresh**
   - Should not lose data
   - Should maintain position

4. **Multiple sessions**
   - Can work on multiple blueprints
   - Each maintains separate state

5. **Edge cases**
   - Very long responses
   - Special characters
   - Multiple languages
   - Slow connections

---

## 📝 Testing Notes Template

**Date**: _______
**Tester**: _______
**Persona**: _______

**Stage Timings**:
- Onboarding: ___ min
- Wizard: ___ min
- Ideation: ___ min
- Journey: ___ min
- Deliverables: ___ min
- Total: ___ min

**Issues Found**:
1. ________________
2. ________________
3. ________________

**Positive Observations**:
1. ________________
2. ________________
3. ________________

**Would you use this in your classroom?** Yes / No
**Why?** ________________

---

## 🚀 Quick Test Run (5 min)

For rapid testing, create a "Solar System" project:
1. **Wizard**: Elementary, 3 weeks, Science
2. **Big Idea**: "Earth's place in space"
3. **Question**: "How can we teach others about our solar system?"
4. **Challenge**: "Create a scale model or virtual tour"
5. **Phases**: Explore → Design → Build → Present
6. **Save & Exit** at any point
7. **Resume** and complete
8. **Export** Teacher Guide

This should take ~5 minutes and test all core functionality.

---

*Use this guide to ensure ALF Coach delivers the magical experience teachers deserve!*