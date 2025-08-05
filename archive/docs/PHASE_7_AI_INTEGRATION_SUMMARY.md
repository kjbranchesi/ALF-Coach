# Phase 7: AI Integration for Dynamic Suggestion Cards

## Problem Addressed
The ALF Coach suggestion cards were showing generic, hardcoded suggestions that didn't adapt to:
- Subject matter (e.g., Physical Education vs Technology)
- Current stage (Big Idea vs Essential Question vs Challenge)
- Age group (8-10 years in the test case)
- Previous selections made by the user

## Solution Implemented

### 1. **Integrated Gemini AI into ChatService**
- Added Google Generative AI import and initialization in the ChatService constructor
- Created AI model instance with appropriate configuration for educational content generation

### 2. **Replaced Hardcoded Methods with AI-Powered Versions**

#### `generateIdeas()` Method:
- Now generates context-specific suggestions based on:
  - Subject area
  - Age group
  - Location
  - Current step in the journey
  - Previous user selections
- Includes comprehensive fallback suggestions for each subject/stage combination
- Properly formats ideas with title and description

#### `generateWhatIfs()` Method:
- Creates transformative "What If" scenarios tailored to context
- Pushes boundaries while remaining age-appropriate
- Connects to real-world applications
- Includes subject-specific fallbacks

### 3. **Enhanced Prompting System**

Created specialized prompt builders:
- `buildIdeaPrompt()`: Generates prompts for contextual ideas
- `buildWhatIfPrompt()`: Generates prompts for transformative scenarios

Each prompt includes:
- Context about the educator's goals
- Specific requirements for the current stage
- Age-appropriate considerations
- Format specifications for consistent parsing

### 4. **Robust Error Handling**
- Graceful fallbacks when AI is unavailable
- Loading states while generating suggestions
- Context-aware fallback content for each subject and stage
- Error messages that maintain the conversational flow

### 5. **Age-Appropriate Content for All Stages**

Updated content generation for Journey and Deliverables stages:
- **Journey Phases**: Scaffolded progression with celebrations
- **Journey Activities**: Hands-on, movement-based suggestions
- **Journey Resources**: Multimodal, visually engaging materials
- **Deliverables Milestones**: Frequent, visible checkpoints
- **Deliverables Rubric**: Student-friendly language with growth focus
- **Deliverables Impact**: Authentic audiences and celebrations

### 6. **Enhanced Help Content**
Expanded help messages for all steps to include:
- Research-based principles
- Age-specific considerations
- Local context integration
- Practical examples

## Technical Implementation Details

### AI Model Configuration:
```typescript
model: 'gemini-2.5-flash',
generationConfig: {
  temperature: 0.8,  // Balanced creativity
  topK: 40,
  topP: 0.95,
  maxOutputTokens: 1024,
}
```

### Parsing Strategy:
- Primary: Structured format parsing (Title/Description)
- Secondary: Block-based parsing
- Fallback: Context-aware hardcoded suggestions

### Example Context-Aware Suggestions:

**Physical Education - Big Ideas:**
- "Movement as Expression" - How our bodies communicate and create
- "Teamwork and Leadership" - Building community through collaborative play
- "Healthy Habits for Life" - Connecting physical activity to wellbeing
- "Games Across Cultures" - Exploring movement traditions worldwide

**Physical Education - Essential Questions:**
- "How does movement help us express ourselves?"
- "What makes a great team player?"
- "Why do different cultures play different games?"
- "How can we design games that everyone can play?"

## Configuration Required

To enable AI suggestions, add to your `.env` file:
```
VITE_GEMINI_API_KEY=your_gemini_api_key_here
```

Get your API key from: https://makersuite.google.com/app/apikey

## Testing

The AI integration can be tested by:
1. Starting a new project with Physical Education as the subject
2. Clicking "Ideas" or "What-If" buttons at any stage
3. Observing context-specific suggestions that relate to PE
4. Progressing through stages and seeing suggestions build on previous selections

## Benefits

1. **Contextual Relevance**: Suggestions now match the subject, age, and location
2. **Progressive Building**: Each stage's suggestions build on previous selections
3. **Age Appropriateness**: Content is tailored to developmental stages
4. **Subject Expertise**: Domain-specific suggestions that reflect best practices
5. **Fallback Reliability**: System works even without AI availability