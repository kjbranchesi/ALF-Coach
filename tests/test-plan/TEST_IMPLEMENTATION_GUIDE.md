# ALF Coach Test Implementation Guide

## Overview

This guide provides instructions for implementing and running the comprehensive test suite for the ALF Coach chat system. The tests are designed to ensure reliability for educators who depend on this critical tool.

## Test Structure

```
tests/
├── test-plan/
│   ├── ALF_COACH_TEST_PLAN.md          # Comprehensive test plan
│   ├── TEST_IMPLEMENTATION_GUIDE.md     # This file
│   └── automated-tests/
│       ├── chat-service-edge-cases.test.ts
│       ├── context-maintenance.test.ts
│       ├── ai-response-validation.test.ts
│       └── e2e-journey-flow.test.ts
├── unit/
│   ├── services/
│   ├── components/
│   └── utils/
├── integration/
│   ├── api/
│   └── state-management/
└── e2e/
    ├── happy-path/
    └── error-scenarios/
```

## Running Tests

### Prerequisites

1. **Environment Setup**
   ```bash
   # Copy test environment file
   cp .env.test.example .env.test
   
   # Add test API key (use a dedicated test key)
   echo "VITE_GEMINI_API_KEY=your-test-api-key" >> .env.test
   echo "VITE_USE_AI_CHAT=true" >> .env.test
   ```

2. **Install Dependencies**
   ```bash
   npm install --save-dev vitest @testing-library/react @testing-library/jest-dom
   npm install --save-dev @testing-library/user-event msw
   ```

### Running Different Test Suites

1. **All Tests**
   ```bash
   npm run test
   ```

2. **Unit Tests Only**
   ```bash
   npm run test:unit
   ```

3. **Edge Cases**
   ```bash
   npm run test tests/test-plan/automated-tests/chat-service-edge-cases.test.ts
   ```

4. **Context Maintenance**
   ```bash
   npm run test tests/test-plan/automated-tests/context-maintenance.test.ts
   ```

5. **Watch Mode (Development)**
   ```bash
   npm run test:watch
   ```

6. **Coverage Report**
   ```bash
   npm run test:coverage
   ```

## Test Categories

### 1. Critical Path Tests (Run First)
These must pass before any deployment:

- **Happy Path Journey**: Complete 9-step journey with typical responses
- **Context Persistence**: Verify step 9 references step 1
- **Error Recovery**: API failures, network issues
- **State Management**: Session recovery after interruption

### 2. Edge Case Tests
Cover unpredictable teacher behaviors:

- **Input Variations**: Long text, short text, off-topic
- **Rapid Actions**: Multiple button clicks, action switching
- **Refinement Loops**: Multiple iterations in single step
- **Context Switching**: Changing mind, contradictions

### 3. Performance Tests
Ensure system remains responsive:

- **Long Sessions**: 50+ messages
- **Concurrent Actions**: Multiple operations
- **Memory Usage**: Context window management
- **Response Time**: AI generation under 3 seconds

### 4. Integration Tests
Test component interactions:

- **AI Integration**: Request/response flow
- **State Persistence**: localStorage operations
- **Event Handling**: Button states, user input
- **Navigation**: Stage progression logic

## Manual Test Scenarios

Some scenarios require manual testing with real user interaction:

### Scenario 1: The Meandering Teacher
1. Start journey
2. Enter stream of consciousness for Big Idea
3. Use Ideas button
4. Select an idea
5. Refine it
6. Use What-If
7. Go back to original idea
8. Complete step

**Expected**: System maintains coherence throughout

### Scenario 2: The Confused Teacher
1. Start journey
2. Ask "What do I do?"
3. Use Help button
4. Enter unrelated content
5. Get redirected
6. Successfully complete step

**Expected**: System provides clear, patient guidance

### Scenario 3: The Speed Runner
1. Attempt to complete journey in < 5 minutes
2. Give minimal responses
3. Skip reading AI responses
4. Try to jump ahead

**Expected**: System ensures minimum quality

## API Mocking for Tests

Use MSW (Mock Service Worker) for consistent API responses:

```typescript
// tests/mocks/handlers.ts
import { rest } from 'msw';

export const handlers = [
  rest.post('*/generativelanguage/v1beta/models/*/generateContent', (req, res, ctx) => {
    // Return contextual mock response based on request
    return res(
      ctx.json({
        candidates: [{
          content: {
            parts: [{
              text: 'Mocked AI response for testing'
            }]
          }
        }]
      })
    );
  })
];
```

## Test Data Management

### Creating Test Fixtures

```typescript
// tests/fixtures/teacher-profiles.ts
export const teacherProfiles = {
  elementary: {
    subject: 'Mathematics',
    ageGroup: 'Ages 8-10',
    location: 'Chicago, IL'
  },
  highSchool: {
    subject: 'Biology',
    ageGroup: 'Ages 14-17',
    location: 'Austin, TX'
  }
};

// tests/fixtures/journey-data.ts
export const completeJourneyData = {
  ideation: {
    bigIdea: 'Understanding ecosystems',
    essentialQuestion: 'How do living things depend on each other?',
    challenge: 'Create a school garden ecosystem'
  },
  journey: {
    phases: 'Research, Design, Build, Observe',
    activities: 'Species research, Garden planning, Planting, Data collection',
    resources: 'Seeds, Tools, Observation journals, Expert guidance'
  },
  deliverables: {
    milestones: 'Research complete, Design approved, Garden planted, First harvest',
    rubric: 'Research quality, Design thinking, Collaboration, Presentation',
    impact: 'Share produce with school cafeteria and teach younger students'
  }
};
```

## Continuous Integration

### GitHub Actions Configuration

```yaml
# .github/workflows/test.yml
name: Test Suite

on:
  pull_request:
    branches: [ main ]
  push:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        
    - name: Install dependencies
      run: npm ci
      
    - name: Run critical tests
      run: npm run test:critical
      env:
        VITE_USE_AI_CHAT: true
        VITE_GEMINI_API_KEY: ${{ secrets.TEST_GEMINI_API_KEY }}
        
    - name: Run full test suite
      run: npm run test:ci
      
    - name: Upload coverage
      uses: codecov/codecov-action@v3
```

## Monitoring Test Results

### Key Metrics to Track

1. **Test Pass Rate**: Should be 100% for critical tests
2. **Coverage**: Aim for >80% for services, >70% overall
3. **Performance**: Track test execution time
4. **Flakiness**: Monitor intermittent failures

### Test Report Dashboard

Consider using tools like:
- Jest HTML Reporter for local viewing
- Allure for comprehensive reporting
- DataDog or similar for production monitoring

## Debugging Failed Tests

### Common Issues and Solutions

1. **Context Loss in Tests**
   - Ensure proper mock setup
   - Check async operation handling
   - Verify state management

2. **Timing Issues**
   - Use `waitFor` for async operations
   - Avoid fixed timeouts
   - Mock timers when needed

3. **AI Response Variations**
   - Use consistent mock responses
   - Test response validation logic
   - Handle edge cases in mocks

### Debug Commands

```bash
# Run single test with debugging
npm run test -- --inspect-brk chat-service-edge-cases.test.ts

# Verbose output
npm run test -- --reporter=verbose

# Run with specific environment
VITE_USE_AI_CHAT=false npm run test
```

## Best Practices

1. **Test Independence**: Each test should run in isolation
2. **Clear Names**: Use descriptive test names that explain the scenario
3. **Arrange-Act-Assert**: Follow AAA pattern
4. **Mock External Dependencies**: Don't make real API calls in tests
5. **Test Behavior, Not Implementation**: Focus on outcomes
6. **Regular Maintenance**: Update tests as features evolve

## Next Steps

1. Implement remaining test files from the test plan
2. Set up continuous monitoring for production
3. Create performance benchmarks
4. Establish test review process
5. Document known issues and workarounds

Remember: These tests protect the educators who rely on ALF Coach. Thoroughness here ensures their success in the classroom.