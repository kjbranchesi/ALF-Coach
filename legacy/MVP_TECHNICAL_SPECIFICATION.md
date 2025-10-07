# ALF Coach MVP Technical Specification
**Detailed Implementation Guide for Hero Project Coaching Interface**

---

## Overview

This technical specification provides the detailed implementation roadmap for transforming the broken ChatbotFirstInterfaceFixed.tsx into a working Hero Project coaching interface. The approach prioritizes simplicity, reliability, and rapid deployment over interface complexity.

---

## 1. Architecture Design

### Core Philosophy
- **Single HTML Page**: Avoid React complexity during MVP phase
- **Service Integration**: Leverage existing working components
- **Conversation-First**: UI serves the coaching flow, not vice versa
- **Progressive Enhancement**: Build minimum, enhance based on success metrics

### System Components

```
MVP Hero Coach Interface
├── core/
│   ├── conversation-engine.js     (NEW - orchestrates coaching flow)
│   ├── coaching-prompts.js        (NEW - structured conversation guides)
│   └── analytics-tracker.js       (NEW - success metrics collection)
├── services/ (EXISTING - working components)
│   ├── GeminiService.js          (AI integration)
│   ├── UnifiedStorageManager.ts   (data persistence)
│   └── HeroProjectTransformer.ts  (output generation)
├── interface/
│   └── hero-coach.html           (NEW - single page interface)
└── config/
    └── coaching-config.js        (NEW - conversation parameters)
```

---

## 2. Conversation Engine Specification

### ConversationEngine Class
```javascript
class ConversationEngine {
  constructor(geminiService, storageManager, transformer) {
    this.gemini = geminiService;
    this.storage = storageManager;
    this.transformer = transformer;
    this.state = new ConversationState();
    this.analytics = new AnalyticsTracker();
  }

  async startSession(educatorInfo) {
    // Initialize conversation with educator context
    this.state.initialize(educatorInfo);
    return this.executePhase(1);
  }

  async executePhase(phaseNumber) {
    const phase = COACHING_PHASES[phaseNumber];
    const prompt = this.buildPhasePrompt(phase, this.state.responses);

    try {
      const aiResponse = await this.gemini.generateJsonResponse(
        this.state.history,
        prompt
      );

      this.state.updatePhase(phaseNumber, aiResponse);
      this.analytics.trackPhaseCompletion(phaseNumber);

      return this.formatResponse(aiResponse, phaseNumber);
    } catch (error) {
      return this.handleError(error, phaseNumber);
    }
  }

  async processUserResponse(userInput, currentPhase) {
    // Process user input and determine next action
    this.state.addUserResponse(currentPhase, userInput);

    // Check for completion signals and resistance patterns
    const completion = this.assessPhaseCompletion(currentPhase, userInput);
    const resistance = this.detectResistance(userInput);

    if (resistance) {
      return this.handleResistance(resistance, currentPhase);
    }

    if (completion.isComplete) {
      return this.transitionToNext(currentPhase + 1);
    }

    return this.continuePhase(currentPhase, userInput);
  }

  async generateHeroProject() {
    const projectData = this.state.extractProjectData();
    const context = this.state.getTransformationContext();

    return await this.transformer.transformProject(
      projectData,
      context,
      'standard'
    );
  }
}
```

### ConversationState Management
```javascript
class ConversationState {
  constructor() {
    this.reset();
  }

  initialize(educatorInfo) {
    this.educatorProfile = educatorInfo;
    this.sessionStart = new Date();
    this.currentPhase = 1;
    this.responses = {};
    this.history = [];
    this.criticalElements = {
      bigIdea: null,
      essentialQuestion: null,
      challenge: null,
      communityConnection: null,
      impactPlan: null
    };
  }

  updatePhase(phaseNumber, aiResponse) {
    this.responses[phaseNumber] = aiResponse;
    this.history.push({
      role: 'assistant',
      content: aiResponse.chatResponse,
      phase: phaseNumber,
      timestamp: new Date()
    });
  }

  addUserResponse(phase, userInput) {
    this.history.push({
      role: 'user',
      content: userInput,
      phase: phase,
      timestamp: new Date()
    });

    // Extract critical elements if present
    this.extractCriticalElements(userInput, phase);
  }

  extractCriticalElements(userInput, phase) {
    const extractors = {
      2: () => this.criticalElements.bigIdea = this.extractBigIdea(userInput),
      3: () => this.criticalElements.essentialQuestion = this.extractEQ(userInput),
      4: () => this.criticalElements.challenge = this.extractChallenge(userInput),
      6: () => this.criticalElements.communityConnection = this.extractCommunity(userInput),
      7: () => this.criticalElements.impactPlan = this.extractImpact(userInput)
    };

    if (extractors[phase]) {
      extractors[phase]();
    }
  }

  extractProjectData() {
    return {
      id: `session_${this.sessionStart.getTime()}`,
      title: this.criticalElements.bigIdea || 'Untitled Project',
      userId: this.educatorProfile.id,
      createdAt: this.sessionStart,
      updatedAt: new Date(),
      wizardData: {
        subject: this.educatorProfile.subject,
        ageGroup: this.educatorProfile.gradeLevel,
        motivation: this.criticalElements.bigIdea,
        scope: this.criticalElements.communityConnection
      },
      capturedData: {
        'ideation.bigIdea': this.criticalElements.bigIdea,
        'ideation.essentialQuestion': this.criticalElements.essentialQuestion,
        'ideation.challenge': this.criticalElements.challenge,
        'community.connection': this.criticalElements.communityConnection,
        'impact.plan': this.criticalElements.impactPlan,
        'conversation.history': this.history
      },
      stage: 'completed',
      source: 'mvp-chat'
    };
  }
}
```

---

## 3. Coaching Prompts Structure

### Phase-Specific Prompts
```javascript
const COACHING_PHASES = {
  1: {
    name: 'Warm Welcome',
    duration: 5,
    objective: 'Establish rapport and capture basic context',
    prompt: `You are an expert education coach welcoming an educator to design their Hero Project.

    Your role is to:
    - Create a warm, encouraging atmosphere
    - Gather basic information: subject, grade level, initial project idea
    - Express genuine excitement about their vision
    - Set expectations for the 60-90 minute conversation ahead

    Respond with enthusiasm and ask for their subject area and grade level first.`,

    completionCriteria: ['subject_identified', 'grade_level_captured', 'initial_idea_shared'],
    resistancePatterns: ['rushed_responses', 'vague_answers', 'overwhelming_details']
  },

  2: {
    name: 'Vision Capture',
    duration: 10,
    objective: 'Extract and clarify the educator\'s core project vision',
    prompt: `You are guiding an educator to articulate their project vision clearly.

    Based on their subject ({subject}) and grade level ({gradeLevel}), help them:
    - Describe what they want students to learn and experience
    - Identify what makes this project meaningful to them personally
    - Connect to their teaching philosophy and student needs

    Use open-ended questions and reflect back what you hear to ensure clarity.

    Key techniques:
    - "Tell me more about..."
    - "What excites you most about..."
    - "How do you envision students..."`,

    completionCriteria: ['vision_articulated', 'personal_meaning_identified', 'student_impact_described'],
    resistancePatterns: ['surface_level_responses', 'curriculum_pressure_focus', 'time_constraint_worries']
  },

  3: {
    name: 'Big Idea Refinement',
    duration: 15,
    objective: 'Develop a compelling, coherent central concept',
    prompt: `You are helping refine their vision into a powerful Big Idea that will drive the entire project.

    A strong Big Idea is:
    - Broad enough to explore from multiple angles
    - Specific enough to provide focus and direction
    - Relevant to students' lives and interests
    - Connected to real-world issues and applications

    Guide them to refine: "{currentVision}"

    Use these coaching techniques:
    - Challenge assumptions gently
    - Ask "What if..." questions
    - Help them see connections they might miss
    - Encourage bold thinking while maintaining feasibility`,

    completionCriteria: ['big_idea_articulated', 'relevance_established', 'scope_appropriate'],
    resistancePatterns: ['narrow_thinking', 'standards_paralysis', 'perfectionist_editing']
  },

  4: {
    name: 'Essential Question Crafting',
    duration: 10,
    objective: 'Create a driving inquiry that sustains engagement',
    prompt: `You are helping craft an Essential Question that will drive inquiry throughout the project.

    Based on their Big Idea: "{bigIdea}"

    An effective Essential Question:
    - Is open-ended with no simple answer
    - Provokes deep thinking and lively discussion
    - Connects to the Big Idea naturally
    - Matters to students personally
    - Can be explored through multiple disciplines

    Guide them to develop a question that will genuinely engage their {gradeLevel} {subject} students.`,

    completionCriteria: ['question_formulated', 'engagement_potential_confirmed', 'inquiry_depth_achieved'],
    resistancePatterns: ['yes_no_questions', 'factual_recall_focus', 'overly_complex_wording']
  },

  5: {
    name: 'Challenge Definition',
    duration: 15,
    objective: 'Identify an authentic problem for students to solve',
    prompt: `You are helping define a concrete Challenge that students will tackle.

    Big Idea: "{bigIdea}"
    Essential Question: "{essentialQuestion}"

    The Challenge should be:
    - A real problem that needs solving
    - Achievable within their timeframe and resources
    - Meaningful to students and community
    - Connected to the Big Idea and Essential Question
    - Requiring students to apply learning authentically

    Help them identify what students will actually create, solve, or investigate.`,

    completionCriteria: ['problem_identified', 'student_role_defined', 'deliverable_envisioned'],
    resistancePatterns: ['artificial_problems', 'teacher_directed_tasks', 'assessment_driven_thinking']
  },

  6: {
    name: 'Community Connection',
    duration: 15,
    objective: 'Establish authentic real-world partnerships and audience',
    prompt: `You are facilitating connections between the project and the real world.

    Challenge: "{challenge}"

    Authentic community connections include:
    - Local organizations facing similar challenges
    - Professionals working in related fields
    - Community members who could benefit from solutions
    - Experts who could provide guidance and feedback
    - Venues for sharing student work with real audiences

    Guide them to identify specific people, organizations, or venues where this project could have genuine impact.`,

    completionCriteria: ['partners_identified', 'authentic_audience_confirmed', 'real_impact_potential'],
    resistancePatterns: ['classroom_only_thinking', 'logistical_overwhelm', 'permission_paralysis']
  },

  7: {
    name: 'Impact Planning',
    duration: 10,
    objective: 'Define measurable outcomes and success indicators',
    prompt: `You are helping plan how to measure and document the project's impact.

    Community Connection: "{communityConnection}"

    Consider multiple types of impact:
    - Student learning and skill development
    - Community benefit and partnership value
    - Long-term project sustainability
    - Authentic assessment opportunities

    Help them identify specific ways to document and measure success that go beyond traditional grading.`,

    completionCriteria: ['success_metrics_defined', 'documentation_plan_created', 'sustainability_considered'],
    resistancePatterns: ['grade_focused_thinking', 'overwhelming_measurement', 'unclear_outcomes']
  },

  8: {
    name: 'Hero Transformation',
    duration: 10,
    objective: 'Generate publication-ready Hero Project format',
    prompt: `You are concluding the conversation and preparing to transform their work into a Hero Project.

    Summarize what you've captured:
    - Big Idea: "{bigIdea}"
    - Essential Question: "{essentialQuestion}"
    - Challenge: "{challenge}"
    - Community Connection: "{communityConnection}"
    - Impact Plan: "{impactPlan}"

    Celebrate their accomplishment and prepare them for the Hero Project transformation.
    Explain that they'll receive a comprehensive, publication-ready project design they can implement immediately.`,

    completionCriteria: ['summary_confirmed', 'excitement_generated', 'transformation_ready'],
    resistancePatterns: ['incomplete_elements', 'confidence_issues', 'implementation_anxiety']
  }
};
```

---

## 4. Interface Implementation

### Single Page HTML Structure
```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>ALF Coach - Hero Project Design</title>
    <style>
        /* Minimal, focused styling for conversation interface */
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
            line-height: 1.6;
            background: #f8fafc;
        }

        .conversation-container {
            background: white;
            border-radius: 12px;
            padding: 30px;
            box-shadow: 0 4px 20px rgba(0,0,0,0.1);
            min-height: 400px;
        }

        .message {
            margin: 20px 0;
            padding: 15px;
            border-radius: 8px;
        }

        .message.ai {
            background: #e3f2fd;
            border-left: 4px solid #2196f3;
        }

        .message.user {
            background: #f1f8e9;
            border-left: 4px solid #4caf50;
            margin-left: 40px;
        }

        .input-area {
            margin-top: 30px;
            display: flex;
            gap: 10px;
        }

        #userInput {
            flex: 1;
            padding: 12px;
            border: 2px solid #e0e0e0;
            border-radius: 8px;
            font-size: 16px;
        }

        #sendButton {
            padding: 12px 24px;
            background: #2196f3;
            color: white;
            border: none;
            border-radius: 8px;
            cursor: pointer;
            font-weight: 600;
        }

        #sendButton:hover {
            background: #1976d2;
        }

        #sendButton:disabled {
            background: #ccc;
            cursor: not-allowed;
        }

        .progress-indicator {
            margin-bottom: 20px;
            text-align: center;
        }

        .phase-dots {
            display: inline-flex;
            gap: 8px;
        }

        .dot {
            width: 12px;
            height: 12px;
            border-radius: 50%;
            background: #e0e0e0;
        }

        .dot.active {
            background: #2196f3;
        }

        .dot.completed {
            background: #4caf50;
        }

        .analytics-display {
            position: fixed;
            top: 20px;
            right: 20px;
            background: rgba(0,0,0,0.8);
            color: white;
            padding: 10px;
            border-radius: 8px;
            font-size: 12px;
            display: none;
        }

        .typing-indicator {
            display: none;
            align-items: center;
            gap: 5px;
            color: #666;
            font-style: italic;
        }

        .typing-dots {
            display: inline-flex;
            gap: 2px;
        }

        .typing-dot {
            width: 4px;
            height: 4px;
            border-radius: 50%;
            background: #666;
            animation: typing 1.4s infinite;
        }

        .typing-dot:nth-child(2) { animation-delay: 0.2s; }
        .typing-dot:nth-child(3) { animation-delay: 0.4s; }

        @keyframes typing {
            0%, 60%, 100% { opacity: 0.3; }
            30% { opacity: 1; }
        }
    </style>
</head>
<body>
    <div class="conversation-container">
        <div class="progress-indicator">
            <div class="phase-dots" id="progressDots">
                <!-- Dynamically generated phase indicators -->
            </div>
            <div id="phaseLabel">Welcome</div>
        </div>

        <div id="conversationHistory">
            <!-- Messages appear here -->
        </div>

        <div class="typing-indicator" id="typingIndicator">
            ALF Coach is thinking
            <div class="typing-dots">
                <div class="typing-dot"></div>
                <div class="typing-dot"></div>
                <div class="typing-dot"></div>
            </div>
        </div>

        <div class="input-area">
            <input type="text" id="userInput" placeholder="Type your response..." />
            <button id="sendButton">Send</button>
        </div>
    </div>

    <div class="analytics-display" id="analyticsDisplay">
        <!-- Real-time analytics for development -->
    </div>

    <!-- Core JavaScript Implementation -->
    <script type="module">
        import { ConversationEngine } from './core/conversation-engine.js';
        import { GeminiService } from './services/GeminiService.js';
        import { UnifiedStorageManager } from './services/UnifiedStorageManager.js';
        import { HeroProjectTransformer } from './services/HeroProjectTransformer.js';

        // Initialize core services
        const geminiService = new GeminiService();
        const storageManager = new UnifiedStorageManager();
        const transformer = new HeroProjectTransformer();

        // Initialize conversation engine
        const conversationEngine = new ConversationEngine(
            geminiService,
            storageManager,
            transformer
        );

        // Initialize interface
        document.addEventListener('DOMContentLoaded', async () => {
            await initializeInterface();
            await startCoachingSession();
        });

        async function initializeInterface() {
            // Setup progress indicators
            const progressContainer = document.getElementById('progressDots');
            for (let i = 1; i <= 8; i++) {
                const dot = document.createElement('div');
                dot.className = 'dot';
                dot.id = `phase-${i}`;
                progressContainer.appendChild(dot);
            }

            // Setup event listeners
            document.getElementById('sendButton').addEventListener('click', handleUserInput);
            document.getElementById('userInput').addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    handleUserInput();
                }
            });
        }

        async function startCoachingSession() {
            // Get basic educator info
            const educatorInfo = {
                id: `educator_${Date.now()}`,
                subject: 'General', // Will be captured in conversation
                gradeLevel: 'Mixed' // Will be captured in conversation
            };

            try {
                const welcomeResponse = await conversationEngine.startSession(educatorInfo);
                displayMessage(welcomeResponse.message, 'ai');
                updateProgress(1);
            } catch (error) {
                console.error('Failed to start session:', error);
                displayMessage('Welcome! I\'m having some technical difficulties, but I\'m still here to help you design an amazing project. Let\'s start with what subject you teach?', 'ai');
            }
        }

        async function handleUserInput() {
            const input = document.getElementById('userInput');
            const userText = input.value.trim();

            if (!userText) return;

            // Display user message
            displayMessage(userText, 'user');
            input.value = '';

            // Disable input during processing
            setInputEnabled(false);
            showTypingIndicator(true);

            try {
                const currentPhase = conversationEngine.state.currentPhase;
                const response = await conversationEngine.processUserResponse(userText, currentPhase);

                displayMessage(response.message, 'ai');

                if (response.phaseComplete) {
                    updateProgress(response.nextPhase);

                    if (response.nextPhase > 8) {
                        await generateHeroProject();
                    }
                }

            } catch (error) {
                console.error('Error processing response:', error);
                displayMessage('I apologize for the technical hiccup. Could you please repeat that?', 'ai');
            } finally {
                showTypingIndicator(false);
                setInputEnabled(true);
                document.getElementById('userInput').focus();
            }
        }

        function displayMessage(text, sender) {
            const history = document.getElementById('conversationHistory');
            const messageDiv = document.createElement('div');
            messageDiv.className = `message ${sender}`;
            messageDiv.textContent = text;
            history.appendChild(messageDiv);

            // Scroll to bottom
            messageDiv.scrollIntoView({ behavior: 'smooth' });
        }

        function updateProgress(currentPhase) {
            // Update phase dots
            for (let i = 1; i <= 8; i++) {
                const dot = document.getElementById(`phase-${i}`);
                if (i < currentPhase) {
                    dot.className = 'dot completed';
                } else if (i === currentPhase) {
                    dot.className = 'dot active';
                } else {
                    dot.className = 'dot';
                }
            }

            // Update phase label
            const phaseNames = [
                'Welcome', 'Vision', 'Big Idea', 'Essential Question',
                'Challenge', 'Community', 'Impact', 'Transform'
            ];
            document.getElementById('phaseLabel').textContent =
                phaseNames[currentPhase - 1] || 'Complete';
        }

        function setInputEnabled(enabled) {
            document.getElementById('userInput').disabled = !enabled;
            document.getElementById('sendButton').disabled = !enabled;
        }

        function showTypingIndicator(show) {
            document.getElementById('typingIndicator').style.display =
                show ? 'flex' : 'none';
        }

        async function generateHeroProject() {
            displayMessage('🎉 Congratulations! You\'ve completed the Hero Project design process. Let me transform your work into a publication-ready format...', 'ai');

            try {
                const heroProject = await conversationEngine.generateHeroProject();

                // Display success and offer download
                displayMessage(`✅ Your Hero Project "${heroProject.title}" is ready! This comprehensive design includes your Big Idea, Essential Question, Challenge, Community Connections, and Impact Plan. You can now implement this project with confidence knowing it meets publication standards.`, 'ai');

                // Trigger download or display
                downloadHeroProject(heroProject);

                // Track completion
                conversationEngine.analytics.trackCompletion();

            } catch (error) {
                console.error('Error generating Hero Project:', error);
                displayMessage('I\'ve captured all your brilliant ideas! There was a technical issue generating the final format, but your project design is saved and you can access it through your dashboard.', 'ai');
            }
        }

        function downloadHeroProject(heroProject) {
            const projectJson = JSON.stringify(heroProject, null, 2);
            const blob = new Blob([projectJson], { type: 'application/json' });
            const url = URL.createObjectURL(blob);

            const a = document.createElement('a');
            a.href = url;
            a.download = `${heroProject.title.replace(/\s+/g, '_')}_Hero_Project.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }

        // Analytics for development
        function enableAnalytics() {
            document.getElementById('analyticsDisplay').style.display = 'block';
            setInterval(updateAnalyticsDisplay, 1000);
        }

        function updateAnalyticsDisplay() {
            const analytics = conversationEngine.analytics.getStats();
            document.getElementById('analyticsDisplay').innerHTML = `
                Phase: ${conversationEngine.state.currentPhase}/8<br>
                Duration: ${Math.floor((Date.now() - conversationEngine.state.sessionStart) / 60000)}min<br>
                Messages: ${conversationEngine.state.history.length}<br>
                Quality: ${analytics.qualityScore || 'N/A'}%
            `;
        }

        // Enable analytics in development
        if (window.location.hostname === 'localhost') {
            enableAnalytics();
        }
    </script>
</body>
</html>
```

---

## 5. Service Integration Details

### GeminiService Integration
```javascript
// Enhanced coaching-specific prompts for GeminiService
const buildCoachingPrompt = (phase, context, userInput) => {
  const basePrompt = COACHING_PHASES[phase].prompt;
  const contextualPrompt = basePrompt
    .replace('{subject}', context.subject || 'your subject')
    .replace('{gradeLevel}', context.gradeLevel || 'your students')
    .replace('{bigIdea}', context.bigIdea || 'your project vision')
    .replace('{essentialQuestion}', context.essentialQuestion || 'your driving question')
    .replace('{challenge}', context.challenge || 'your project challenge')
    .replace('{communityConnection}', context.communityConnection || 'your community partners');

  return `${contextualPrompt}

User's previous response: "${userInput}"

Respond as a warm, encouraging education coach. Keep responses conversational and focused on moving forward. Ask follow-up questions that deepen thinking without overwhelming.

Response format:
{
  "message": "Your coaching response here",
  "followUpQuestions": ["Optional clarifying questions"],
  "phaseComplete": false,
  "qualityScore": 85
}`;
};
```

### UnifiedStorageManager Integration
```javascript
// Enhanced storage for coaching sessions
const storeCoachingSession = async (sessionData) => {
  const projectData = {
    id: sessionData.sessionId,
    title: sessionData.criticalElements.bigIdea || 'Untitled Project',
    userId: sessionData.educatorId,
    createdAt: sessionData.startTime,
    updatedAt: new Date(),

    // Preserve existing schema while adding coaching data
    wizardData: {
      subject: sessionData.subject,
      ageGroup: sessionData.gradeLevel,
      motivation: sessionData.criticalElements.bigIdea,
      scope: sessionData.criticalElements.communityConnection
    },

    // Store full coaching conversation
    capturedData: {
      'coaching.phases': sessionData.phaseResponses,
      'coaching.criticalElements': sessionData.criticalElements,
      'coaching.analytics': sessionData.analytics,
      'coaching.conversationHistory': sessionData.history
    },

    stage: sessionData.currentPhase >= 8 ? 'completed' : 'in_progress',
    source: 'mvp-coaching'
  };

  return await storageManager.saveProject(projectData);
};
```

### HeroProjectTransformer Integration
```javascript
// Enhanced transformation context for coached projects
const buildTransformationContext = (coachingSession) => {
  return {
    educatorPreferences: {
      teachingStyle: inferTeachingStyle(coachingSession.responses),
      assessmentPreferences: extractAssessmentPrefs(coachingSession.responses),
      technologyComfort: 'medium', // Default for MVP
      timeConstraints: estimateTimeConstraints(coachingSession.responses)
    },

    schoolContext: {
      type: 'public', // Default for MVP
      resources: inferResourceLevel(coachingSession.responses),
      communityType: inferCommunityType(coachingSession.criticalElements.communityConnection)
    },

    standardsAlignment: {
      primary: 'common-core', // Default for MVP
      customStandards: []
    },

    enhancementGoals: {
      priorityAreas: ['community-connection', 'real-world-application'],
      emphasisLevel: 'standard'
    }
  };
};
```

---

## 6. Analytics and Success Tracking

### AnalyticsTracker Implementation
```javascript
class AnalyticsTracker {
  constructor() {
    this.metrics = {
      sessionStart: null,
      phaseTimings: {},
      qualityScores: {},
      completionEvents: [],
      resistanceDetections: [],
      communityConnections: []
    };
  }

  trackPhaseCompletion(phase, duration, qualityScore) {
    this.metrics.phaseTimings[phase] = duration;
    this.metrics.qualityScores[phase] = qualityScore;
    this.metrics.completionEvents.push({
      phase,
      timestamp: new Date(),
      duration,
      quality: qualityScore
    });
  }

  trackCommunityConnection(connectionType, details) {
    this.metrics.communityConnections.push({
      type: connectionType,
      details: details,
      timestamp: new Date()
    });
  }

  trackResistance(pattern, phase, intervention) {
    this.metrics.resistanceDetections.push({
      pattern,
      phase,
      intervention,
      timestamp: new Date()
    });
  }

  trackCompletion() {
    const totalDuration = Date.now() - this.metrics.sessionStart;
    const avgQuality = this.calculateAverageQuality();
    const communityConnectionRate = this.metrics.communityConnections.length > 0 ? 100 : 0;

    // Send to analytics service
    this.sendAnalytics({
      completionRate: 100,
      communityConnectionRate,
      qualityScore: avgQuality,
      duration: totalDuration,
      phases: Object.keys(this.metrics.phaseTimings).length
    });
  }

  calculateAverageQuality() {
    const scores = Object.values(this.metrics.qualityScores);
    return scores.length > 0 ? scores.reduce((a, b) => a + b) / scores.length : 0;
  }

  getStats() {
    return {
      duration: this.metrics.sessionStart ? Date.now() - this.metrics.sessionStart : 0,
      phasesCompleted: Object.keys(this.metrics.phaseTimings).length,
      qualityScore: this.calculateAverageQuality(),
      communityConnections: this.metrics.communityConnections.length,
      resistanceEvents: this.metrics.resistanceDetections.length
    };
  }
}
```

---

## 7. Error Handling and Fallbacks

### Robust Error Recovery
```javascript
class ErrorHandler {
  static handleGeminiError(error, phase, fallbackMessage) {
    console.error(`Gemini error in phase ${phase}:`, error);

    // Log for debugging
    this.logError(error, phase, 'gemini');

    // Return structured fallback
    return {
      message: fallbackMessage || this.getPhraseFallback(phase),
      followUpQuestions: [],
      phaseComplete: false,
      qualityScore: 50,
      isErrorResponse: true
    };
  }

  static handleStorageError(error, data) {
    console.error('Storage error:', error);

    // Try localStorage as backup
    try {
      localStorage.setItem(`coaching_backup_${Date.now()}`, JSON.stringify(data));
      return { success: true, backup: true };
    } catch (backupError) {
      console.error('Backup storage failed:', backupError);
      return { success: false, error: backupError };
    }
  }

  static getPhraseFallback(phase) {
    const fallbacks = {
      1: "Welcome! I'm excited to help you design an amazing project. Let's start with what subject you teach and what grade level?",
      2: "Tell me about the project idea you have in mind. What do you want your students to learn and experience?",
      3: "Let's refine your project concept. What's the big idea that will drive everything your students do?",
      4: "What question could drive your students' inquiry throughout this project?",
      5: "What specific challenge or problem will your students work to solve?",
      6: "How could this project connect to your local community? Who might benefit from your students' work?",
      7: "How will you know if this project is successful? What impact are you hoping to see?",
      8: "Let's wrap up and create your Hero Project design. You've done excellent work!"
    };

    return fallbacks[phase] || "Let's continue with your project design. What would you like to focus on next?";
  }

  static logError(error, context, type) {
    // In production, send to error tracking service
    const errorLog = {
      timestamp: new Date(),
      type: type,
      context: context,
      message: error.message,
      stack: error.stack
    };

    console.log('Error logged:', errorLog);
  }
}
```

---

## 8. Deployment Strategy

### Build and Deploy Process
```bash
# MVP deployment script
#!/bin/bash

# 1. Copy working services
cp src/services/GeminiService.js mvp/services/
cp src/services/UnifiedStorageManager.ts mvp/services/
cp src/services/HeroProjectTransformer.ts mvp/services/

# 2. Build conversation engine
npm run build:conversation-engine

# 3. Bundle for single HTML deployment
npm run bundle:mvp

# 4. Deploy to staging
npm run deploy:mvp-staging

# 5. Run smoke tests
npm run test:mvp-smoke

# 6. Deploy to production if tests pass
if [ $? -eq 0 ]; then
  npm run deploy:mvp-production
else
  echo "Deployment failed - tests did not pass"
  exit 1
fi
```

### Environment Configuration
```javascript
const MVP_CONFIG = {
  development: {
    apiUrl: 'http://localhost:8888/.netlify/functions',
    analytics: true,
    debugging: true,
    errorReporting: false
  },

  staging: {
    apiUrl: 'https://alf-coach-staging.netlify.app/.netlify/functions',
    analytics: true,
    debugging: false,
    errorReporting: true
  },

  production: {
    apiUrl: 'https://alf-coach.netlify.app/.netlify/functions',
    analytics: true,
    debugging: false,
    errorReporting: true
  }
};
```

---

## 9. Testing Strategy

### MVP Test Suite
```javascript
// Critical path testing for MVP
describe('MVP Hero Coach Interface', () => {
  test('completes full conversation flow', async () => {
    const mockEducator = {
      subject: 'Science',
      gradeLevel: 'High School',
      responses: mockConversationResponses
    };

    const session = new ConversationEngine(mockServices);
    await session.startSession(mockEducator);

    for (let phase = 1; phase <= 8; phase++) {
      const response = await session.processUserResponse(
        mockEducator.responses[phase],
        phase
      );
      expect(response.message).toBeDefined();
    }

    const heroProject = await session.generateHeroProject();
    expect(heroProject.title).toBeDefined();
    expect(heroProject.hero.description).toBeDefined();
  });

  test('handles AI service failures gracefully', async () => {
    const failingGemini = new MockGeminiService({ shouldFail: true });
    const session = new ConversationEngine({
      ...mockServices,
      gemini: failingGemini
    });

    const response = await session.executePhase(1);
    expect(response.isErrorResponse).toBe(true);
    expect(response.message).toContain('Welcome');
  });

  test('tracks success metrics accurately', async () => {
    const session = new ConversationEngine(mockServices);
    await session.startSession(mockEducator);

    // Simulate community connection
    await session.processUserResponse('We could partner with the local environmental group', 6);

    const analytics = session.analytics.getStats();
    expect(analytics.communityConnections).toBe(1);
  });
});
```

---

## 10. Success Metrics Implementation

### Real-time Success Tracking
```javascript
class SuccessMetricsTracker {
  constructor() {
    this.targets = {
      communityConnectionRate: 80,
      completionRate: 70,
      qualityThreshold: 60,
      timeTarget: 90 * 60 * 1000 // 90 minutes in ms
    };
  }

  async trackSession(sessionData) {
    const metrics = {
      hasCommunityConnection: this.detectCommunityConnection(sessionData),
      isCompleted: sessionData.currentPhase >= 8,
      qualityScore: this.calculateQualityScore(sessionData),
      duration: sessionData.duration,
      timestamp: new Date()
    };

    await this.recordMetrics(metrics);
    return this.evaluateSuccess(metrics);
  }

  detectCommunityConnection(sessionData) {
    const communityKeywords = [
      'partner', 'organization', 'community', 'local', 'business',
      'nonprofit', 'government', 'expert', 'professional', 'mentor'
    ];

    const connectionText = sessionData.criticalElements.communityConnection || '';
    return communityKeywords.some(keyword =>
      connectionText.toLowerCase().includes(keyword)
    );
  }

  calculateQualityScore(sessionData) {
    let score = 0;
    const elements = sessionData.criticalElements;

    // Big Idea quality (25 points)
    if (elements.bigIdea) {
      score += elements.bigIdea.length > 20 ? 25 : 15;
    }

    // Essential Question quality (25 points)
    if (elements.essentialQuestion) {
      const isOpenEnded = elements.essentialQuestion.includes('?') &&
                         !elements.essentialQuestion.toLowerCase().startsWith('is');
      score += isOpenEnded ? 25 : 15;
    }

    // Challenge definition (25 points)
    if (elements.challenge) {
      score += elements.challenge.length > 30 ? 25 : 15;
    }

    // Community connection (25 points)
    score += this.detectCommunityConnection(sessionData) ? 25 : 0;

    return Math.min(score, 100);
  }

  evaluateSuccess(metrics) {
    return {
      meetsTargets: {
        communityConnection: metrics.hasCommunityConnection,
        completion: metrics.isCompleted,
        quality: metrics.qualityScore >= this.targets.qualityThreshold,
        time: metrics.duration <= this.targets.timeTarget
      },
      overallSuccess: this.calculateOverallSuccess(metrics)
    };
  }

  async getDashboardMetrics() {
    const recentSessions = await this.getRecentSessions();

    return {
      communityConnectionRate: this.calculateRate(recentSessions, 'hasCommunityConnection'),
      completionRate: this.calculateRate(recentSessions, 'isCompleted'),
      averageQuality: this.calculateAverage(recentSessions, 'qualityScore'),
      averageDuration: this.calculateAverage(recentSessions, 'duration') / 60000 // in minutes
    };
  }
}
```

This technical specification provides the detailed implementation roadmap for transforming the broken interface into a working MVP within the one-week timeline. The focus on simplicity, service integration, and conversation flow over interface complexity ensures rapid deployment while maintaining the core coaching methodology.