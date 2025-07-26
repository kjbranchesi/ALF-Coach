# ALF Coach Chat System Test Plan

## Overview

This comprehensive test plan covers the AI-powered chat system for ALF Coach, focusing on the 9-step SOP journey across Ideation, Journey, and Deliverables stages. The plan emphasizes edge cases and unpredictable teacher behaviors to ensure reliability for educators who depend on this critical tool.

## Test Environment Configuration

### Prerequisites
- **Environment Variable**: `VITE_USE_AI_CHAT=true`
- **API Key**: Valid `VITE_GEMINI_API_KEY` configured
- **Test Data**: Sample teacher profiles with various subjects, age groups, and locations
- **Network**: Stable connection for AI API calls

### Test User Profiles
1. **Elementary Teacher**: Math, Ages 8-10, Chicago
2. **High School Teacher**: Science, Ages 14-17, Rural Texas
3. **Middle School Teacher**: Art, Ages 11-13, New York City
4. **Physical Education Teacher**: PE, Ages 6-12, Los Angeles

---

## Stage 1: IDEATION (Steps 1-3)

### Step 1: Big Idea

#### Core Functionality Tests

| Test Case ID | Test Scenario | Expected Result | Priority |
|--------------|---------------|-----------------|----------|
| BI-001 | Teacher enters a clear, concise Big Idea | AI confirms understanding and asks for refinement options | High |
| BI-002 | Teacher uses "Ideas" button | AI generates 4 contextually relevant Big Ideas based on subject/age | High |
| BI-003 | Teacher uses "What-If" button | AI generates 3 transformative scenarios pushing boundaries | High |
| BI-004 | Teacher uses "Help" button | AI provides detailed explanation of Big Ideas with examples | High |
| BI-005 | Teacher confirms their Big Idea | System saves data and progresses to Essential Question | High |
| BI-006 | Teacher uses "Refine" button | AI maintains context and offers improvement suggestions | High |

#### Edge Cases

| Test Case ID | Test Scenario | Expected Result | Priority |
|--------------|---------------|-----------------|----------|
| BI-E01 | Teacher enters extremely long Big Idea (500+ words) | AI gracefully summarizes and asks for clarification | High |
| BI-E02 | Teacher enters single word response | AI prompts for elaboration while being encouraging | High |
| BI-E03 | Teacher enters off-topic content (e.g., grocery list) | AI gently redirects to educational Big Ideas | High |
| BI-E04 | Teacher repeatedly clicks "Ideas" without selecting | System maintains stability, doesn't duplicate suggestions | High |
| BI-E05 | Teacher enters profanity or inappropriate content | AI redirects professionally without judgment | Medium |
| BI-E06 | Teacher uses multiple languages in response | AI attempts to understand or asks for clarification | Medium |
| BI-E07 | Teacher copy-pastes content with special characters | System handles formatting gracefully | Medium |
| BI-E08 | Teacher rapidly switches between Ideas/What-If/Help | UI remains responsive, no race conditions | High |
| BI-E09 | Teacher enters emoticons/emojis only | AI asks for text-based clarification | Low |
| BI-E10 | Teacher attempts to skip step via URL manipulation | System enforces proper progression | High |

### Step 2: Essential Question

#### Core Functionality Tests

| Test Case ID | Test Scenario | Expected Result | Priority |
|--------------|---------------|-----------------|----------|
| EQ-001 | Teacher enters open-ended question | AI validates it connects to Big Idea | High |
| EQ-002 | Teacher enters yes/no question | AI suggests reformulation for deeper inquiry | High |
| EQ-003 | Teacher refines previous Big Idea context | AI maintains full conversation history | High |
| EQ-004 | Teacher uses "Ideas" with context of Big Idea | AI generates questions specifically tied to their Big Idea | High |
| EQ-005 | Teacher enters multiple questions | AI helps focus on one primary question | Medium |

#### Edge Cases

| Test Case ID | Test Scenario | Expected Result | Priority |
|--------------|---------------|-----------------|----------|
| EQ-E01 | Teacher enters statement instead of question | AI recognizes and helps reframe as question | High |
| EQ-E02 | Teacher asks personal question unrelated to education | AI redirects to educational context tactfully | High |
| EQ-E03 | Teacher uses question with no question mark | System still recognizes interrogative intent | Medium |
| EQ-E04 | Teacher changes mind about Big Idea mid-step | AI offers to revisit previous step | High |
| EQ-E05 | Teacher enters mathematical equations as questions | AI interprets educational intent | Low |
| EQ-E06 | Teacher submits empty string after typing | System prompts for input without losing context | High |
| EQ-E07 | Teacher enters question in different language than Big Idea | AI maintains coherence across languages | Medium |
| EQ-E08 | Teacher rapidly alternates between Refine and Continue | System maintains state consistency | High |

### Step 3: Challenge

#### Core Functionality Tests

| Test Case ID | Test Scenario | Expected Result | Priority |
|--------------|---------------|-----------------|----------|
| CH-001 | Teacher enters authentic real-world challenge | AI validates alignment with Big Idea and EQ | High |
| CH-002 | Teacher describes abstract challenge | AI helps make it concrete and actionable | High |
| CH-003 | Context from previous steps influences suggestions | AI references Big Idea and EQ in response | High |
| CH-004 | Teacher completes Ideation stage | System provides comprehensive summary | High |

#### Edge Cases

| Test Case ID | Test Scenario | Expected Result | Priority |
|--------------|---------------|-----------------|----------|
| CH-E01 | Teacher enters challenge impossible for age group | AI suggests age-appropriate modifications | High |
| CH-E02 | Teacher enters challenge with safety concerns | AI addresses safety while maintaining engagement | High |
| CH-E03 | Teacher tries to go back after stage summary | System allows editing previous responses | High |
| CH-E04 | Teacher enters budget-dependent challenge | AI offers low-cost alternatives | Medium |
| CH-E05 | Teacher session times out during input | System recovers gracefully with saved progress | High |
| CH-E06 | Teacher enters challenge requiring unavailable resources | AI suggests accessible alternatives | Medium |

---

## Stage 2: JOURNEY (Steps 4-6)

### Step 4: Phases

#### Core Functionality Tests

| Test Case ID | Test Scenario | Expected Result | Priority |
|--------------|---------------|-----------------|----------|
| PH-001 | Teacher describes learning progression | AI validates it builds toward challenge | High |
| PH-002 | Teacher enters single phase | AI suggests breaking into multiple phases | High |
| PH-003 | Teacher uses context from Ideation | AI references their challenge in phase design | High |

#### Edge Cases

| Test Case ID | Test Scenario | Expected Result | Priority |
|--------------|---------------|-----------------|----------|
| PH-E01 | Teacher enters 20+ phases | AI helps consolidate to manageable number | Medium |
| PH-E02 | Teacher enters phases out of logical order | AI suggests reordering while validating ideas | High |
| PH-E03 | Teacher forgets what their challenge was | AI reminds them with context summary | High |
| PH-E04 | Teacher enters phases in bullet points | System parses formatting correctly | Medium |
| PH-E05 | Teacher describes phases for wrong age group | AI adjusts suggestions to match profile | High |

### Step 5: Activities

#### Core Functionality Tests

| Test Case ID | Test Scenario | Expected Result | Priority |
|--------------|---------------|-----------------|----------|
| AC-001 | Teacher describes hands-on activities | AI validates age-appropriateness | High |
| AC-002 | Teacher requests activity ideas | AI generates activities matching phases and subject | High |
| AC-003 | Teacher mixes individual and group activities | AI acknowledges balance | High |

#### Edge Cases

| Test Case ID | Test Scenario | Expected Result | Priority |
|--------------|---------------|-----------------|----------|
| AC-E01 | Teacher suggests dangerous activities | AI redirects to safe alternatives | High |
| AC-E02 | Teacher only enters passive activities | AI suggests active engagement options | High |
| AC-E03 | Teacher copy-pastes from lesson plan website | AI adapts to their specific context | Medium |
| AC-E04 | Teacher enters activities requiring expensive equipment | AI offers budget-friendly alternatives | Medium |
| AC-E05 | Teacher leaves large gaps between activities | AI helps create smooth transitions | Medium |

### Step 6: Resources

#### Core Functionality Tests

| Test Case ID | Test Scenario | Expected Result | Priority |
|--------------|---------------|-----------------|----------|
| RS-001 | Teacher lists available resources | AI suggests how to use them effectively | High |
| RS-002 | Teacher asks for resource recommendations | AI provides age and subject-appropriate options | High |
| RS-003 | Teacher mentions budget constraints | AI prioritizes free/low-cost resources | High |

#### Edge Cases

| Test Case ID | Test Scenario | Expected Result | Priority |
|--------------|---------------|-----------------|----------|
| RS-E01 | Teacher has no resources available | AI suggests creating resources with students | High |
| RS-E02 | Teacher lists inappropriate resources | AI tactfully suggests alternatives | High |
| RS-E03 | Teacher requests copyrighted materials | AI suggests legal alternatives | Medium |
| RS-E04 | Teacher overwhelmed by resource options | AI helps prioritize essentials | Medium |
| RS-E05 | Teacher's resources don't match activities | AI identifies gaps and solutions | High |

---

## Stage 3: DELIVERABLES (Steps 7-9)

### Step 7: Milestones

#### Core Functionality Tests

| Test Case ID | Test Scenario | Expected Result | Priority |
|--------------|---------------|-----------------|----------|
| ML-001 | Teacher defines clear checkpoints | AI validates they align with phases | High |
| ML-002 | Teacher asks for milestone examples | AI provides grade-appropriate suggestions | High |
| ML-003 | Teacher includes celebration points | AI reinforces positive approach | High |

#### Edge Cases

| Test Case ID | Test Scenario | Expected Result | Priority |
|--------------|---------------|-----------------|----------|
| ML-E01 | Teacher creates milestone every day | AI suggests consolidation for manageability | Medium |
| ML-E02 | Teacher creates only final milestone | AI suggests intermediate checkpoints | High |
| ML-E03 | Teacher milestones don't match timeline | AI helps adjust for feasibility | High |
| ML-E04 | Teacher focuses only on grades | AI suggests process-based milestones too | High |

### Step 8: Rubric

#### Core Functionality Tests

| Test Case ID | Test Scenario | Expected Result | Priority |
|--------------|---------------|-----------------|----------|
| RB-001 | Teacher creates student-friendly criteria | AI validates clarity and comprehensiveness | High |
| RB-002 | Teacher asks for rubric template | AI provides age-appropriate format | High |
| RB-003 | Teacher includes growth measures | AI reinforces best practices | High |

#### Edge Cases

| Test Case ID | Test Scenario | Expected Result | Priority |
|--------------|---------------|-----------------|----------|
| RB-E01 | Teacher creates overly complex rubric | AI suggests simplification for age group | High |
| RB-E02 | Teacher only measures final product | AI suggests process criteria too | High |
| RB-E03 | Teacher uses academic jargon | AI helps translate to student language | High |
| RB-E04 | Teacher creates binary pass/fail rubric | AI suggests growth-oriented alternatives | Medium |

### Step 9: Impact Plan

#### Core Functionality Tests

| Test Case ID | Test Scenario | Expected Result | Priority |
|--------------|---------------|-----------------|----------|
| IM-001 | Teacher describes authentic audience | AI validates connection to challenge | High |
| IM-002 | Teacher plans celebration event | AI suggests inclusive approaches | High |
| IM-003 | Journey completion | AI provides complete blueprint summary | High |

#### Edge Cases

| Test Case ID | Test Scenario | Expected Result | Priority |
|--------------|---------------|-----------------|----------|
| IM-E01 | Teacher has no audience available | AI suggests creating virtual audience | High |
| IM-E02 | Teacher wants to skip celebration | AI explains importance of recognition | Medium |
| IM-E03 | Teacher completes entire journey in 5 minutes | AI maintains quality despite speed | High |
| IM-E04 | Teacher wants to start over completely | System allows reset while saving option | High |

---

## Cross-Cutting Test Scenarios

### Context Maintenance Tests

| Test Case ID | Test Scenario | Expected Result | Priority |
|--------------|---------------|-----------------|----------|
| CM-001 | Complete journey with consistent theme | AI maintains context throughout all 9 steps | Critical |
| CM-002 | Teacher mentions detail in step 1, referenced in step 9 | AI remembers and uses early context | Critical |
| CM-003 | Teacher contradicts earlier responses | AI notices and asks for clarification | High |
| CM-004 | Session interrupted and resumed | Context fully restored on return | Critical |
| CM-005 | Teacher uses pronouns referring to earlier content | AI correctly interprets references | High |
| CM-006 | Multiple refinement loops in single step | Context accumulates without repetition | High |

### Conversation Flow Tests

| Test Case ID | Test Scenario | Expected Result | Priority |
|--------------|---------------|-----------------|----------|
| CF-001 | Teacher thinks out loud with stream of consciousness | AI extracts key points professionally | High |
| CF-002 | Teacher asks meta questions about the process | AI answers while maintaining flow | Medium |
| CF-003 | Teacher expresses frustration or confusion | AI responds with empathy and clarity | High |
| CF-004 | Teacher shares personal teaching struggles | AI acknowledges while staying on task | High |
| CF-005 | Teacher questions AI suggestions | AI explains reasoning without defensiveness | High |
| CF-006 | Teacher wants to discuss theory vs. practice | AI balances both perspectives | Medium |

### Error Handling Tests

| Test Case ID | Test Scenario | Expected Result | Priority |
|--------------|---------------|-----------------|----------|
| EH-001 | API timeout during AI response generation | Graceful fallback to template responses | Critical |
| EH-002 | Network disconnection mid-conversation | Local storage preserves progress | Critical |
| EH-003 | Invalid API key configuration | Clear error message with instructions | High |
| EH-004 | AI generates inappropriate response | Validation layer catches and regenerates | High |
| EH-005 | Browser crash during session | Full recovery on restart | Critical |
| EH-006 | Concurrent sessions in multiple tabs | Each maintains independent context | High |
| EH-007 | AI rate limit exceeded | Queue management with user notification | High |

### Performance Tests

| Test Case ID | Test Scenario | Expected Result | Priority |
|--------------|---------------|-----------------|----------|
| PF-001 | 50+ message conversation history | Response time remains under 3 seconds | High |
| PF-002 | Rapid button clicking (stress test) | No duplicate actions or crashes | High |
| PF-003 | Large text paste (10,000+ characters) | System handles without freezing | Medium |
| PF-004 | 20 refinement cycles in one step | Memory usage remains stable | Medium |
| PF-005 | Multiple file attachments attempted | Graceful handling with clear limits | Low |

### Accessibility Tests

| Test Case ID | Test Scenario | Expected Result | Priority |
|--------------|---------------|-----------------|----------|
| AC-001 | Screen reader navigation | All elements properly announced | High |
| AC-002 | Keyboard-only navigation | Full functionality without mouse | High |
| AC-003 | High contrast mode | All text remains readable | Medium |
| AC-004 | Mobile device usage | Responsive design maintains usability | High |

---

## Test Data Scenarios

### Scenario 1: The Perfectionist Teacher
- Takes 10+ minutes per step
- Refines every response multiple times
- Asks for clarification on each suggestion
- Expected: System remains patient and helpful

### Scenario 2: The Rushed Teacher
- Tries to complete in under 5 minutes
- Gives minimal responses
- Skips reading AI suggestions
- Expected: System ensures minimum quality

### Scenario 3: The Confused Teacher
- Misunderstands prompts
- Provides off-topic responses
- Asks "What do you mean?" frequently
- Expected: System provides clear guidance

### Scenario 4: The Creative Teacher
- Provides unconventional ideas
- Challenges traditional approaches
- Wants to break all rules
- Expected: System balances innovation with practicality

### Scenario 5: The Technical Novice
- Struggles with interface
- Accidentally navigates away
- Doesn't understand AI suggestions
- Expected: System remains accessible and clear

---

## Regression Test Suite

After any code changes, run this essential subset:

1. **Happy Path**: Complete journey with typical responses (15 min)
2. **Context Test**: Verify step 9 references step 1 content
3. **Recovery Test**: Kill session mid-journey and restore
4. **API Failure**: Disable API and verify fallbacks work
5. **Rapid Actions**: Click all buttons in quick succession
6. **Long Session**: 30+ minute journey with many refinements

---

## Test Execution Priority

### Critical (Must Pass Before Release)
- All core functionality tests
- Context maintenance tests CM-001 through CM-004
- Error handling tests EH-001 through EH-005
- Happy path regression test

### High Priority (Should Pass Before Release)
- Most edge cases marked "High"
- Performance tests PF-001 and PF-002
- Accessibility tests AC-001 and AC-002

### Medium Priority (Can Be Fixed Post-Release)
- Edge cases marked "Medium"
- Advanced conversation flow tests
- Performance optimizations

---

## Success Metrics

- **Completion Rate**: 95% of teachers complete full journey
- **Context Accuracy**: 99% of context references are correct
- **Error Recovery**: 100% of sessions recoverable after crashes
- **Response Time**: 90% of AI responses under 3 seconds
- **User Satisfaction**: No critical feedback about lost work or confusion

---

## Notes for Test Implementation

1. **Automated Tests**: Implement for all core functionality and critical edge cases
2. **Manual Tests**: Required for conversation flow and teacher behavior scenarios
3. **Load Tests**: Simulate 100 concurrent teachers during peak usage
4. **Monitoring**: Track actual teacher behavior patterns for continuous improvement
5. **A/B Testing**: Compare AI vs. template responses for quality metrics

This test plan should be reviewed and updated quarterly based on actual usage patterns and teacher feedback.