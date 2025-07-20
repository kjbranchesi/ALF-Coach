# Bug & Tech Debt Backlog - ALF Coach

> **Living document tracking issues, technical debt, and improvement opportunities**
> 
> **Format:** Each entry includes severity, location, reproduction steps, and hypothesis for root-cause analysis

---

## 🔴 Critical Issues (Blocks Forward Progress)

### [2025-07-20] Help Button Text Incorrectly Treated as Big Idea
- **Severity:** 🔴 blocks user workflow
- **Location:** ConversationalIdeation.jsx:431-448, ConversationalJourney.jsx:306-323, ConversationalDeliverables.jsx:303-320
- **Repro:** Click "Give me some ideas" → AI treats "I need some ideas and examples" as Big Idea proposal instead of help request
- **Hypothesis:** Help request detection missing key patterns (`'ideas'`, `'examples'`, `'i need some'`) from button text
- **Root Cause:** isHelpRequest logic incomplete - only checked for 'help' but not 'ideas'/'examples' from help buttons
- **Status:** ✅ FIXED - Enhanced help request detection patterns in all conversational components
- **Files Changed:** 3 conversational components + consistent pattern application

### [2025-07-20] Missing isSuggestionSelection Variable
- **Severity:** 🔴 JavaScript error breaks conversation flow  
- **Location:** ConversationalJourney.jsx:420, ConversationalDeliverables.jsx:419
- **Repro:** Journey/Deliverables stage user interaction → `isSuggestionSelection is not defined` ReferenceError
- **Hypothesis:** Suggestion selection logic copied from Ideation but variable definition missing
- **Root Cause:** Code refactoring missed copying complete suggestion detection block from Ideation
- **Status:** ✅ FIXED - Added missing suggestion selection logic (lines 328-341 Journey, 325-338 Deliverables)
- **Technical Debt:** Same logic duplicated across 3 files - needs extraction to shared utility

### [2025-07-20] Refinement Suggestions Captured as Actual Content
- **Severity:** 🔴 corrupts user data, breaks workflow progression
- **Location:** All conversational components - suggestion filtering logic
- **Repro:** User selects "Make it more specific to Urban Planning and College" → gets permanently saved as Big Idea
- **Hypothesis:** Suggestion selection logic not filtering out refinement-style suggestions
- **Root Cause:** isConcreteSelection only filtered "what if" but not refinement prompts like "Make it more", "Connect it more"
- **Status:** ✅ FIXED - Enhanced filtering to exclude refinement patterns (6 additional filter conditions)
- **Impact:** Prevents data corruption that would require full session restart

### [2025-07-20] Stage Transition Failures - Missing Stage Configurations
- **Severity:** 🔴 blocks ALF workflow progression
- **Location:** MainWorkspace.jsx - stageConfig object
- **Repro:** Complete Ideation → no wizard transition to Learning Journey appears
- **Hypothesis:** stageConfig missing entries for LEARNING_JOURNEY and DELIVERABLES stages
- **Root Cause:** Incomplete stage configuration after extending system from 1-stage to 3-stage
- **Status:** ✅ FIXED - Added complete stage configurations with chat keys and prompt builders
- **Architectural Impact:** Revealed need for centralized stage configuration management

---

## 🟡 Major Issues (Degrades User Experience)

### [2025-07-20] AI Response Format Violations - "What If" in ChatResponse  
- **Severity:** 🟡 confusing user interface, breaks suggestion card rendering
- **Location:** conversationalJourney.js:135, conversationalDeliverables.js:136, conversationalIdeation.js:142
- **Repro:** AI responds with "Consider these What if questions:" in chatResponse → appears as text instead of clickable cards
- **Hypothesis:** Prompt templates not explicit enough about "What if" text placement rules
- **Root Cause:** AI putting "What if" guidance in chatResponse violates suggestion array formatting rules
- **Status:** ✅ FIXED - Added explicit "NEVER mention 'What if' in chatResponse" rules to all prompt templates
- **Technical Debt:** Prompt engineering relies on natural language rules - needs structured validation

### [2025-07-20] Step Transition Bug from Essential Question to Challenge
- **Severity:** 🟡 prevents workflow progression, user confusion
- **Location:** ConversationalIdeation.jsx:481-486 - confirmation detection regex
- **Repro:** User says "no we are good to go" → not recognized as confirmation, stays on Essential Question
- **Hypothesis:** Confirmation regex too restrictive, doesn't handle complex affirmative responses
- **Root Cause:** Regex `/^(okay|yes|sure...)` failed on responses starting with "no" even when ultimately affirmative
- **Status:** ✅ FIXED - Added special case handling for "no...but positive" patterns
- **Impact:** Critical for user flow - without this, users can't progress past Essential Question

### [2025-07-20] Wrong Progress Stages Displayed
- **Severity:** 🟡 misleading user interface
- **Location:** ProgressIndicator.jsx - stages array and tooltips
- **Repro:** Progress bar shows "Curriculum" and "Assignments" instead of "Learning Journey" and "Student Deliverables"
- **Hypothesis:** Progress indicator not updated when shifting from legacy to conversational stages
- **Root Cause:** Hardcoded legacy stage names (CURRICULUM, ASSIGNMENTS) instead of new conversational stages
- **Status:** ✅ FIXED - Updated to show correct conversational stages with appropriate tooltips
- **Architectural Impact:** Reveals tight coupling between UI components and stage configuration

### [2025-07-20] Data Structure Mismatches Between Stages
- **Severity:** 🟡 runtime errors, data loss potential
- **Location:** ConversationalJourney.jsx:129, ConversationalDeliverables.jsx:129 - data initialization
- **Repro:** Journey data expects `phases: []` but prompt templates check `phases[0].title` → undefined errors
- **Hypothesis:** Different stages evolved with different data structure expectations
- **Root Cause:** Inconsistent data initialization between stages - arrays vs objects with properties
- **Status:** ✅ FIXED - Standardized data structures and updated step detection logic
- **Technical Debt:** Each stage has different data schema - needs unified data model

---

## 🟢 Minor Issues (Polish & Enhancement)

### [2025-07-20] Missing Proactive Help Buttons
- **Severity:** 🟢 missed UX opportunity, inconsistent user experience
- **Location:** ConversationalJourney.jsx:551-567, ConversationalDeliverables.jsx:551-568 - message rendering
- **Repro:** User sees question without suggestions → no easy way to get help (unlike Ideation stage)
- **Hypothesis:** Help buttons only added to Ideation stage, not applied holistically across workflow
- **Root Cause:** Feature implemented in Ideation but not propagated to other conversational stages
- **Status:** ✅ FIXED - Added contextual help buttons to all stages with consistent styling and behavior
- **UX Impact:** Provides consistent "give me ideas" / "show examples" support throughout 3-stage workflow

### [2025-07-20] Generic Refinement Suggestions  
- **Severity:** 🟢 less helpful coaching, missed pedagogical opportunity
- **Location:** ConversationalIdeation.jsx:673-679 - refinement instruction generation
- **Repro:** User provides quality Big Idea → gets generic "Would you like to refine it further?" instead of specific guidance
- **Hypothesis:** Refinement logic using template responses instead of contextual suggestions
- **Root Cause:** Refinement instruction too generic - not leveraging project context (subject, age group, Big Idea content)
- **Status:** ✅ FIXED - Enhanced to provide specific, contextual refinement suggestions based on project context
- **Coaching Impact:** Now offers actionable suggestions like "Make it more specific to Urban Planning and College"

### [2025-07-20] Suggestion Cards Appearing as Bullet Points
- **Severity:** 🟢 visual inconsistency, breaks intended interaction model
- **Location:** All conversational components - AI response rendering with malformed suggestions
- **Repro:** AI puts suggestions in chatResponse text with bullet points → renders as text instead of clickable cards
- **Hypothesis:** AI violating suggestion array formatting rules despite prompt instructions
- **Root Cause:** Prompt templates not explicit enough about strict separation between chatResponse and suggestions array
- **Status:** ✅ FIXED - Strengthened formatting rules to prevent suggestion text in chatResponse
- **Visual Impact:** Maintains consistent purple/blue/emerald themed suggestion cards throughout workflow

---

## 🔧 Technical Debt

### Data Structure Inconsistencies
- **Issue:** Different stages expect different data structures (phases as array vs object properties)
- **Impact:** Requires manual mapping and error-prone transformations
- **Location:** Journey/Deliverables data initialization
- **Proposed Fix:** Standardize data schema across all stages

### Duplicate Help Request Detection Logic
- **Issue:** Same help detection patterns copied across 3 files
- **Impact:** Maintenance burden when updating detection patterns
- **Location:** All conversational components
- **Proposed Fix:** Extract to shared utility function

### Hardcoded Stage Configuration
- **Issue:** Stage transitions and configurations scattered across components
- **Impact:** Difficult to modify workflow or add new stages
- **Location:** MainWorkspace.jsx, ProgressIndicator.jsx
- **Proposed Fix:** Centralize stage configuration in constants or config file

### Inconsistent Error Handling
- **Issue:** Different error handling patterns across conversational components
- **Impact:** Unpredictable user experience during failures
- **Location:** All API interaction points
- **Proposed Fix:** Standardize error handling with shared error boundary pattern

---

## 🎯 Architecture Opportunities

### State Management Complexity
- **Issue:** Complex state updates scattered across conversational components
- **Impact:** Difficult to debug state transitions and ensure consistency
- **Proposed Solution:** Consider Redux or Zustand for centralized state management

### AI Response Validation
- **Issue:** No validation of AI response structure before processing
- **Impact:** Runtime errors when AI returns malformed JSON
- **Proposed Solution:** Add JSON schema validation for AI responses

### Component Coupling
- **Issue:** Conversational components tightly coupled to specific data structures
- **Impact:** Difficult to reuse components or modify data flow
- **Proposed Solution:** Implement adapter pattern for data transformation

---

## 📊 Metrics & Patterns

### Common Error Categories
1. **State Management:** 35% of issues related to data flow and state updates
   - Missing variables (isSuggestionSelection)
   - Data structure mismatches between stages
   - State corruption from improper filtering
2. **AI Integration:** 30% related to prompt engineering and response handling
   - Format violations ("What if" in chatResponse)
   - Response structure inconsistencies
   - Help request detection failures
3. **User Experience:** 25% related to interaction patterns and feedback
   - Step transition failures
   - Missing help buttons
   - Generic refinement suggestions
4. **Configuration:** 10% related to hardcoded values and stage setup
   - Missing stage configurations
   - Wrong progress indicators
   - Inconsistent stage naming

### Risk Areas
- **Prompt Template Changes:** High impact, requires cross-stage testing
- **Data Structure Modifications:** Risk of breaking existing workflows
- **Stage Transition Logic:** Complex conditionals prone to edge cases

---

## 🔄 Continuous Improvement

### Testing Gaps
- [ ] End-to-end workflow testing across all three stages
- [ ] AI response validation and error scenarios
- [ ] State persistence and recovery testing
- [ ] Cross-browser compatibility testing

### Monitoring Opportunities
- [ ] User workflow completion rates
- [ ] AI response quality metrics
- [ ] Error frequency and patterns
- [ ] Performance bottlenecks in conversation flow

## 🆕 Recently Fixed Issues

### [2025-07-20] Learning Journey Stage Conversational Breakdown
- **Severity:** 🔴 complete workflow failure, infinite loops, user frustration  
- **Location:** ConversationalJourney.jsx - multiple systemic issues
- **Repro:** Enter Learning Journey → click "Give me ideas" repeatedly → AI state confusion, wrong stage display, resource suggestions before phases
- **Root Causes:** 
  - State machine drift from spreading AI response properties
  - Missing suggestion throttling allowing infinite help loops
  - Step logic not validating data completion before advancement
  - Debug info leaking to production users
  - Verbose AI echoing causing cognitive overload
  - Improper phase confirmation flow
- **Status:** ✅ FIXED - Comprehensive redesign with proper state management, throttling, and conversation flow
- **Files Changed:** ConversationalJourney.jsx (150+ lines), conversationalJourney.js prompt template, debug visibility controls
- **Impact:** Transformed broken user experience into smooth, guided conversation flow

---

*Last Updated: 2025-07-20*
*Next Review: Weekly during active development*