# Ideation Conversation Decision Tree

## Core Principles
1. **Always show 3 action cards**: Examples, What-Ifs (Ideas), Help (Explanation)
2. **Examples**: Show 3 concrete examples + "Create my own" option
3. **What-Ifs**: Show 3 provocative ideas to push thinking + "More ideas" option
4. **Help**: Explain the purpose, criteria, and reasoning for current phase

## Phase Flow

### 1. BIG IDEA PHASE
**Goal**: Establish a broad, meaningful theme that anchors the project

#### Initial State
```
Coach: "Let's start with the Big Idea - the overarching theme that will anchor your students' learning journey..."

Cards:
[📋 See Examples] [💡 Explore What-Ifs] [❓ Why This Matters]
```

#### See Examples → Shows 3 concrete big ideas
```
Based on your [subject] and [age group]:
• "Sustainable Communities" - Exploring how we can create better places to live
• "Innovation & Problem Solving" - How creative thinking changes our world
• "Cultural Connections" - Understanding our diverse world through different lenses
• [✏️ Create My Own]
```

#### Explore What-Ifs → Shows 3 provocative ideas
```
What if your students could:
• "Redesign their community for the year 2050"
• "Solve a real problem that affects their daily lives"
• "Connect with students globally on shared challenges"
• [🔄 More Ideas Aligned to My Context]
```

#### Why This Matters → Explanation
```
A strong Big Idea:
✓ Gives your project a clear focus
✓ Connects to real-world relevance
✓ Provides depth for exploration
✓ Sparks natural curiosity

Think of it as the "north star" that guides all learning activities.
```

#### User Selects/Inputs Big Idea
```
Coach: "Excellent! '[Big Idea]' is a powerful theme. Let me help you develop this further..."

Cards:
[🔍 Deepen This Idea] [✨ See Connections] [➡️ Continue to Essential Question]
```

### 2. ESSENTIAL QUESTION PHASE
**Goal**: Create an open-ended question that drives inquiry

#### Initial State
```
Coach: "Now let's craft an Essential Question that will drive inquiry throughout the project. Based on your Big Idea of '[Big Idea]'..."

Cards:
[📋 See Examples] [💡 Explore What-Ifs] [❓ Why This Matters]
```

#### See Examples → Shows 3 questions based on their Big Idea
```
Questions that could drive your "[Big Idea]" project:
• "How might we [action] to improve [aspect]?"
• "Why does [concept] matter for our future?"
• "What would happen if we reimagined [topic]?"
• [✏️ Write My Own Question]
```

#### Explore What-Ifs → Shows 3 provocative angles
```
What if your question:
• "Connected to current events in your community"
• "Challenged common assumptions about [topic]"
• "Required students to take action beyond the classroom"
• [🔄 More Provocative Angles]
```

#### User Inputs Essential Question
```
Coach: "This question will really get students thinking! Let's ensure it aligns perfectly with your vision..."

Cards:
[🔄 Refine the Question] [📊 Check Alignment] [➡️ Continue to Challenge]
```

### 3. CHALLENGE PHASE
**Goal**: Define the concrete deliverable/action students will create

#### Initial State
```
Coach: "Now let's define the Challenge - what students will actually create or do to demonstrate their learning..."

Cards:
[📋 See Examples] [💡 Explore What-Ifs] [❓ Why This Matters]
```

#### See Examples → Shows 3 challenge formats
```
Students could:
• "Design and present a solution to local stakeholders"
• "Create a multimedia exhibition for the community"
• "Develop a campaign to raise awareness and inspire action"
• [✏️ Define My Own Challenge]
```

#### Explore What-Ifs → Shows 3 ambitious possibilities
```
What if students:
• "Partnered with local organizations to implement their ideas"
• "Presented their work to actual decision-makers"
• "Created something that lives on after the project ends"
• [🔄 More Ambitious Ideas]
```

#### User Inputs Challenge
```
Coach: "Perfect! This challenge will give students a real sense of purpose. Let's review how everything connects..."

Cards:
[📝 Review Full Framework] [🔄 Adjust Any Element] [✅ Complete Ideation]
```

## Transition Logic

### Moving Between Phases
- User must provide valid input for current phase before advancing
- "Continue to [Next Phase]" button appears after valid input
- Can always go back to refine previous phases

### Validation Rules
- **Big Idea**: Must be substantive (>3 words), not a question
- **Essential Question**: Must be open-ended, typically starts with How/Why/What
- **Challenge**: Must be actionable, specific enough to guide but open to interpretation

### What-If Scenarios
When user wants to change a previous element:
```
Coach: "I see you want to refine your [element]. This would affect..."
[Show impact visualization]

Cards:
[💭 Show What Changes] [✅ Accept Changes] [❌ Keep Original]
```

## Button/Card Behaviors

### Primary Actions (Blue Cards)
- See Examples
- Explore What-Ifs
- Create My Own
- Continue to Next Phase

### Help Actions (Gray Cards)
- Why This Matters
- How This Connects
- See Criteria

### Refinement Actions (Amber Cards)
- Refine This
- Try Another Angle
- Adjust for My Context

### Success Actions (Green Cards)
- Accept Changes
- Continue
- Complete Phase

### Navigation Actions
- Go Back
- Start Over
- Skip This Step (with warning)