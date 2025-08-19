# ALF Coach MVP Flow - Simplified & Practical

## Core Principle: Simple, Clear, Actionable

### Stage Flow (Linear & Clear)
1. **Big Idea** → 2. **Essential Question** → 3. **Challenge** → 4. **Journey Phases** → 5. **Deliverables**

---

## 1. BIG IDEA STAGE

### AI Prompt:
"Let's start with your Big Idea - the overarching concept that will drive student learning. Based on your [subject/topic], what fundamental understanding do you want students to gain?"

### Three Action Buttons:
- 🎯 **"I have an idea"** (Primary - Blue)
- 💡 **"Show me examples"** (Secondary)
- ❓ **"What's a Big Idea?"** (Tertiary)

### Suggestion Cards (when "Show me examples" clicked):
Based on wizard data, show 3 contextual examples:
```
For Grade 5 Science - Ecosystems:
• "Interdependence shapes all living systems"
• "Balance in nature requires constant adaptation"
• "Human actions ripple through ecosystems"
```

### Help Content (when "What's a Big Idea?" clicked):
Simple explanation:
"A Big Idea is a concept that:
- Goes beyond facts to deeper understanding
- Connects to real-world relevance
- Transfers across contexts
Example: Instead of 'plants need water,' think 'all living things depend on cycles.'"

### When User Types Response:
AI responds conversationally to refine/validate, then shows:
- ✅ **"This works, continue"** (Primary)
- 🔄 **"Let me refine this"** (Secondary)

---

## 2. ESSENTIAL QUESTION STAGE

### AI Prompt:
"Great! Now let's create an Essential Question that will guide student inquiry. This open-ended question should connect to your Big Idea: '[their big idea]'. What question could students explore?"

### Three Action Buttons:
- 🎯 **"I have a question"** (Primary - Blue)
- 💡 **"Show me examples"** (Secondary)
- ❓ **"Help me understand"** (Tertiary)

### Suggestion Cards:
Based on their Big Idea, generate 3 questions:
```
For "Interdependence shapes all living systems":
• "How do changes in one part of an ecosystem affect the whole?"
• "What happens when balance is disrupted?"
• "How do organisms depend on each other for survival?"
```

### Help Content:
"Essential Questions:
- Cannot be answered with yes/no
- Require investigation and thinking
- Connect to the Big Idea
- Matter to students' lives"

---

## 3. CHALLENGE STAGE

### AI Prompt:
"Now let's create a real-world Challenge that students will solve. This should be authentic and engaging. Based on your Essential Question: '[their question]', what problem could students tackle?"

### Three Action Buttons:
- 🎯 **"I have a challenge"** (Primary - Blue)
- 💡 **"Suggest challenges"** (Secondary)
- ❓ **"What makes a good challenge?"** (Tertiary)

### Suggestion Cards:
```
For ecosystem Essential Question:
• "Design a plan to restore the school garden ecosystem"
• "Create a guide for sustainable living in our community"
• "Develop solutions for local environmental challenges"
```

---

## 4. JOURNEY PHASES (Simplified)

### AI Prompt:
"Let's plan how students will work through this challenge. I'll help you design activities for each phase:"

### Show 4 Phase Cards (Not overwhelming):
```
📊 ANALYZE (Week 1)
Students investigate and understand the problem

🧠 BRAINSTORM (Week 2)  
Students generate creative solutions

🔨 PROTOTYPE (Week 3)
Students create and test their solutions

⭐ EVALUATE (Week 4)
Students refine and present their work
```

### For Each Phase:
User clicks phase → AI asks:
"What will students DO during the [Analyze] phase? I'll help you plan specific activities."

### Simple Activity Suggestions:
```
Analyze Phase Activities:
• Research using provided resources
• Interview community members
• Collect and organize data
• Create problem statement
```

---

## 5. DELIVERABLES (Final Stage)

### AI Prompt:
"Finally, how will students demonstrate their learning? Let's define what they'll create and how you'll assess it."

### Two Sections:

**What Students Create:**
- 💡 Suggest 3 options based on their project
- Let teacher choose or customize

**How to Assess:**
- Generate simple rubric with 3-4 criteria
- Proficient / Developing / Beginning levels
- Tied directly to Essential Question

---

## UI IMPROVEMENTS FOR MVP

### 1. Clear Progress Bar at Top
```
[✓ Big Idea] → [● Essential Question] → [○ Challenge] → [○ Journey] → [○ Deliverables]
```

### 2. Three-Button System (Replace Single Confusing Button)
- **Primary Action** (Blue, changes label based on context)
- **Get Ideas** (Shows stage-specific suggestions)
- **Get Help** (Shows stage-specific guidance)

### 3. Suggestion Cards Design
- Clean white cards with subtle shadow
- Icon for quick recognition
- One-click to use suggestion
- Max 3-4 cards shown at once

### 4. Chat Bubbles
- **AI**: Friendly, conversational tone
- **User**: Simple input area
- **System**: Progress indicators ("Moving to Essential Question...")

### 5. Mobile/iPad Optimized
- Large touch targets (44px minimum)
- Readable fonts (16px minimum)
- Proper spacing for fingers
- Swipe between stages on mobile

---

## WHAT WE'RE NOT DOING (YET)

- ❌ Video tutorials
- ❌ Stuck detection algorithms  
- ❌ Gallery of examples
- ❌ Community features
- ❌ Complex branching paths
- ❌ Multiple workflow options
- ❌ Advanced customization

---

## IMPLEMENTATION PRIORITY

### Week 1: Core Flow
1. Fix button system (3 clear buttons)
2. Implement stage progression
3. Basic suggestion cards

### Week 2: Stage-Specific Content  
1. Context-aware suggestions
2. Stage-specific help content
3. Progress persistence

### Week 3: Polish
1. Smooth transitions
2. Better mobile experience
3. Loading states

---

## SUCCESS METRICS

- User completes all 5 stages
- Clear understanding at each stage
- No confusion about what to click
- Appropriate suggestions shown
- Help accessed when needed

---

## KEY DIFFERENCES FROM CURRENT

| Current | New MVP |
|---------|---------|
| One ambiguous button | Three clear buttons with labels |
| Generic suggestions | Stage-specific suggestions |
| Unclear progression | Visual progress bar |
| Complex help system | Simple, contextual help |
| Overwhelming options | Maximum 3-4 choices |

This MVP focuses on CLARITY and COMPLETION over complex features.