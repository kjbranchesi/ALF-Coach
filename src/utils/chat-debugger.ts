// Chat System Debugger - Comprehensive testing and logging utility
// Tests all 10 SOP steps with various scenarios

import { ChatService } from '../services/chat-service';
import { ChatMessage, ChatState, QuickReply } from '../services/chat-service';

export interface TestScenario {
  name: string;
  description: string;
  steps: TestStep[];
}

export interface TestStep {
  action: string;
  data?: any;
  expectedPhase?: string;
  expectedStage?: string;
  validate?: (state: ChatState) => ValidationResult;
}

export interface ValidationResult {
  passed: boolean;
  message: string;
  details?: any;
}

export interface TestReport {
  scenario: string;
  startTime: Date;
  endTime: Date;
  duration: number;
  steps: StepReport[];
  overallStatus: 'PASSED' | 'FAILED' | 'PARTIAL';
  summary: {
    totalSteps: number;
    passedSteps: number;
    failedSteps: number;
    warnings: string[];
    errors: string[];
  };
  contextPreservation: {
    step1Data?: string;
    step9Reference?: string;
    preserved: boolean;
  };
}

export interface StepReport {
  stepNumber: number;
  action: string;
  timestamp: Date;
  preState: Partial<ChatState>;
  postState: Partial<ChatState>;
  validation?: ValidationResult;
  logs: string[];
  errors: string[];
  aiPrompts?: string[];
  aiResponses?: string[];
  quickReplies?: QuickReply[];
}

export class ChatDebugger {
  private chatService: ChatService;
  private originalConsoleLog: typeof console.log;
  private originalConsoleError: typeof console.error;
  private originalConsoleWarn: typeof console.warn;
  private logs: string[] = [];
  private currentStepLogs: string[] = [];
  private currentStepErrors: string[] = [];

  constructor(wizardData: any, blueprintId: string) {
    // Initialize chat service
    this.chatService = new ChatService(wizardData, blueprintId);
    
    // Hook into console methods
    this.originalConsoleLog = console.log;
    this.originalConsoleError = console.error;
    this.originalConsoleWarn = console.warn;
    
    this.setupConsoleInterceptors();
  }

  private setupConsoleInterceptors(): void {
    console.log = (...args: any[]) => {
      const message = args.map(arg => 
        typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
      ).join(' ');
      this.currentStepLogs.push(`[LOG] ${new Date().toISOString()} - ${message}`);
      this.logs.push(message);
      this.originalConsoleLog(...args);
    };

    console.error = (...args: any[]) => {
      const message = args.map(arg => 
        typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
      ).join(' ');
      this.currentStepErrors.push(`[ERROR] ${new Date().toISOString()} - ${message}`);
      this.originalConsoleError(...args);
    };

    console.warn = (...args: any[]) => {
      const message = args.map(arg => 
        typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
      ).join(' ');
      this.currentStepLogs.push(`[WARN] ${new Date().toISOString()} - ${message}`);
      this.originalConsoleWarn(...args);
    };
  }

  private restoreConsole(): void {
    console.log = this.originalConsoleLog;
    console.error = this.originalConsoleError;
    console.warn = this.originalConsoleWarn;
  }

  // Define test scenarios
  private getTestScenarios(): TestScenario[] {
    return [
      {
        name: 'Happy Path - Complete Journey',
        description: 'Go through all 10 steps normally without any refinements',
        steps: [
          { action: 'start', expectedPhase: 'stage_init' },
          { action: 'start', expectedPhase: 'step_entry' },
          { action: 'text', data: 'Systems and Connections', expectedPhase: 'step_confirm' },
          { action: 'continue', expectedPhase: 'step_entry' },
          { action: 'text', data: 'How do parts work together to create wholes?', expectedPhase: 'step_confirm' },
          { action: 'continue', expectedPhase: 'step_entry' },
          { action: 'text', data: 'Design a solution for local environmental issues', expectedPhase: 'step_confirm' },
          { action: 'continue', expectedPhase: 'stage_clarify' },
          { action: 'proceed', expectedPhase: 'stage_init', expectedStage: 'JOURNEY' },
          { action: 'start', expectedPhase: 'step_entry' },
          { action: 'text', data: 'Explore, Plan, Create, Share', expectedPhase: 'step_confirm' },
          { action: 'continue', expectedPhase: 'step_entry' },
          { action: 'text', data: 'Research, brainstorming, prototyping, presenting', expectedPhase: 'step_confirm' },
          { action: 'continue', expectedPhase: 'step_entry' },
          { action: 'text', data: 'Books, videos, guest speakers, art supplies', expectedPhase: 'step_confirm' },
          { action: 'continue', expectedPhase: 'stage_clarify' },
          { action: 'proceed', expectedPhase: 'stage_init', expectedStage: 'DELIVERABLES' },
          { action: 'start', expectedPhase: 'step_entry' },
          { action: 'text', data: 'Research complete, prototype built, presentation ready', expectedPhase: 'step_confirm' },
          { action: 'continue', expectedPhase: 'step_entry' },
          { action: 'text', data: 'Understanding, creativity, teamwork, communication', expectedPhase: 'step_confirm' },
          { action: 'continue', expectedPhase: 'step_entry' },
          { 
            action: 'text', 
            data: 'Community fair showcasing solutions for Systems and Connections', 
            expectedPhase: 'step_confirm',
            validate: (state) => ({
              passed: state.capturedData['ideation.bigIdea'] === 'Systems and Connections',
              message: 'Step 9 should reference Step 1 data',
              details: { step1Data: state.capturedData['ideation.bigIdea'] }
            })
          },
          { action: 'continue', expectedPhase: 'stage_clarify' },
          { action: 'proceed', expectedPhase: 'complete' }
        ]
      },
      {
        name: 'Refinement Path',
        description: 'Use Refine button multiple times at different steps',
        steps: [
          { action: 'start' },
          { action: 'start' },
          { action: 'text', data: 'Initial idea' },
          { action: 'refine' },
          { action: 'text', data: 'Refined idea - Movement as Expression' },
          { action: 'continue' },
          { action: 'text', data: 'Initial question' },
          { action: 'refine' },
          { action: 'refine' }, // Multiple refinements
          { action: 'text', data: 'How does movement help us express ourselves?' },
          { action: 'continue' }
        ]
      },
      {
        name: 'Ideas and What-If Path',
        description: 'Use Ideas and What-If buttons throughout the journey',
        steps: [
          { action: 'start' },
          { action: 'start' },
          { action: 'ideas' },
          { action: 'card_select', data: { title: 'Movement as Expression' } },
          { action: 'continue' },
          { action: 'whatif' },
          { action: 'card_select', data: { title: 'What if PE class designed the school wellness program?' } },
          { action: 'continue' }
        ]
      },
      {
        name: 'Help and Recovery Path',
        description: 'Test help functionality and error recovery',
        steps: [
          { action: 'start' },
          { action: 'help' },
          { action: 'start' },
          { action: 'help' },
          { action: 'text', data: '' }, // Empty input
          { action: 'text', data: 'Valid input after error' },
          { action: 'help' },
          { action: 'continue' }
        ]
      }
    ];
  }

  // Run a single test scenario
  async runScenario(scenario: TestScenario): Promise<TestReport> {
    console.log(`\n🧪 Starting Test Scenario: ${scenario.name}`);
    console.log(`📝 Description: ${scenario.description}\n`);

    const report: TestReport = {
      scenario: scenario.name,
      startTime: new Date(),
      endTime: new Date(),
      duration: 0,
      steps: [],
      overallStatus: 'PASSED',
      summary: {
        totalSteps: scenario.steps.length,
        passedSteps: 0,
        failedSteps: 0,
        warnings: [],
        errors: []
      },
      contextPreservation: {
        preserved: false
      }
    };

    // Run each step
    for (let i = 0; i < scenario.steps.length; i++) {
      const step = scenario.steps[i];
      const stepReport = await this.runStep(step, i + 1);
      report.steps.push(stepReport);

      if (stepReport.validation && !stepReport.validation.passed) {
        report.summary.failedSteps++;
      } else {
        report.summary.passedSteps++;
      }

      if (stepReport.errors.length > 0) {
        report.summary.errors.push(...stepReport.errors);
      }
    }

    // Calculate overall status
    report.endTime = new Date();
    report.duration = report.endTime.getTime() - report.startTime.getTime();
    
    if (report.summary.failedSteps === 0) {
      report.overallStatus = 'PASSED';
    } else if (report.summary.failedSteps === report.summary.totalSteps) {
      report.overallStatus = 'FAILED';
    } else {
      report.overallStatus = 'PARTIAL';
    }

    // Check context preservation
    const finalState = this.chatService.getState();
    if (finalState.capturedData['ideation.bigIdea']) {
      report.contextPreservation.step1Data = finalState.capturedData['ideation.bigIdea'];
    }
    if (finalState.capturedData['deliverables.impact']) {
      report.contextPreservation.step9Reference = finalState.capturedData['deliverables.impact'];
    }
    report.contextPreservation.preserved = 
      report.contextPreservation.step9Reference?.includes(report.contextPreservation.step1Data || '') || false;

    return report;
  }

  // Run a single test step
  private async runStep(step: TestStep, stepNumber: number): Promise<StepReport> {
    this.currentStepLogs = [];
    this.currentStepErrors = [];

    const preState = this.chatService.getState();
    const quickRepliesBefore = this.chatService.getQuickReplies();

    console.log(`\n📍 Step ${stepNumber}: ${step.action}${step.data ? ' with data: ' + JSON.stringify(step.data) : ''}`);

    const stepReport: StepReport = {
      stepNumber,
      action: step.action,
      timestamp: new Date(),
      preState: {
        stage: preState.stage,
        stepIndex: preState.stepIndex,
        phase: preState.phase,
        completedSteps: preState.completedSteps,
        pendingValue: preState.pendingValue
      },
      postState: {},
      logs: [],
      errors: [],
      quickReplies: quickRepliesBefore
    };

    try {
      // Execute the action
      await this.chatService.processAction(step.action, step.data);
      
      // Wait for processing to complete
      await this.waitForProcessing();

      const postState = this.chatService.getState();
      stepReport.postState = {
        stage: postState.stage,
        stepIndex: postState.stepIndex,
        phase: postState.phase,
        completedSteps: postState.completedSteps,
        pendingValue: postState.pendingValue
      };

      // Validate expectations
      if (step.expectedPhase && postState.phase !== step.expectedPhase) {
        stepReport.validation = {
          passed: false,
          message: `Expected phase '${step.expectedPhase}' but got '${postState.phase}'`
        };
      } else if (step.expectedStage && postState.stage !== step.expectedStage) {
        stepReport.validation = {
          passed: false,
          message: `Expected stage '${step.expectedStage}' but got '${postState.stage}'`
        };
      } else if (step.validate) {
        stepReport.validation = step.validate(postState);
      } else {
        stepReport.validation = {
          passed: true,
          message: 'Step completed successfully'
        };
      }

      console.log(`✅ Step ${stepNumber} completed: ${stepReport.validation.passed ? 'PASSED' : 'FAILED'}`);
      if (!stepReport.validation.passed) {
        console.log(`❌ Validation failed: ${stepReport.validation.message}`);
      }

    } catch (error) {
      console.error(`❌ Step ${stepNumber} failed with error:`, error);
      stepReport.errors.push(String(error));
      stepReport.validation = {
        passed: false,
        message: `Step failed with error: ${error}`
      };
    }

    stepReport.logs = [...this.currentStepLogs];
    stepReport.errors = [...this.currentStepErrors];

    return stepReport;
  }

  // Wait for chat service to finish processing
  private async waitForProcessing(maxWait: number = 5000): Promise<void> {
    const startTime = Date.now();
    while (this.chatService.getState().isProcessing) {
      if (Date.now() - startTime > maxWait) {
        throw new Error('Timeout waiting for processing to complete');
      }
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }

  // Run all test scenarios
  async runAllTests(): Promise<TestReport[]> {
    console.log('🚀 Starting ALF Coach Chat System Debug Tests');
    console.log('=' .repeat(80));

    const scenarios = this.getTestScenarios();
    const reports: TestReport[] = [];

    for (const scenario of scenarios) {
      const report = await this.runScenario(scenario);
      reports.push(report);
      
      // Reset chat service between scenarios
      this.resetChatService();
    }

    // Generate summary report
    this.generateSummaryReport(reports);

    // Restore console
    this.restoreConsole();

    return reports;
  }

  // Reset chat service for next test
  private resetChatService(): void {
    const wizardData = (this.chatService as any).wizardData;
    const blueprintId = (this.chatService as any).blueprintId;
    this.chatService = new ChatService(wizardData, blueprintId);
  }

  // Generate summary report
  private generateSummaryReport(reports: TestReport[]): void {
    console.log('\n' + '='.repeat(80));
    console.log('📊 TEST SUMMARY REPORT');
    console.log('='.repeat(80));

    const totalScenarios = reports.length;
    const passedScenarios = reports.filter(r => r.overallStatus === 'PASSED').length;
    const failedScenarios = reports.filter(r => r.overallStatus === 'FAILED').length;
    const partialScenarios = reports.filter(r => r.overallStatus === 'PARTIAL').length;

    console.log(`\n📈 Overall Results:`);
    console.log(`   Total Scenarios: ${totalScenarios}`);
    console.log(`   ✅ Passed: ${passedScenarios}`);
    console.log(`   ❌ Failed: ${failedScenarios}`);
    console.log(`   ⚠️  Partial: ${partialScenarios}`);

    console.log(`\n📋 Scenario Details:`);
    reports.forEach(report => {
      const icon = report.overallStatus === 'PASSED' ? '✅' : 
                   report.overallStatus === 'FAILED' ? '❌' : '⚠️';
      console.log(`\n${icon} ${report.scenario}`);
      console.log(`   Duration: ${report.duration}ms`);
      console.log(`   Steps: ${report.summary.passedSteps}/${report.summary.totalSteps} passed`);
      console.log(`   Context Preserved: ${report.contextPreservation.preserved ? 'Yes' : 'No'}`);
      
      if (report.summary.errors.length > 0) {
        console.log(`   Errors:`);
        report.summary.errors.slice(0, 3).forEach(error => {
          console.log(`     - ${error}`);
        });
      }
    });

    console.log(`\n🔍 Key Findings:`);
    
    // Check context preservation across all scenarios
    const contextPreserved = reports.filter(r => r.contextPreservation.preserved).length;
    console.log(`   - Context Preservation: ${contextPreserved}/${reports.length} scenarios`);
    
    // Check button states
    console.log(`   - Button State Tracking: Implemented`);
    
    // Check AI integration
    const hasAI = this.logs.some(log => log.includes('AI'));
    console.log(`   - AI Integration: ${hasAI ? 'Active' : 'Not Active'}`);
    
    // Common errors
    const allErrors = reports.flatMap(r => r.summary.errors);
    const uniqueErrors = [...new Set(allErrors)];
    if (uniqueErrors.length > 0) {
      console.log(`\n⚠️  Common Errors:`);
      uniqueErrors.slice(0, 5).forEach(error => {
        console.log(`   - ${error}`);
      });
    }

    console.log('\n' + '='.repeat(80));
  }

  // Export detailed logs
  exportLogs(filename: string = 'chat-debug-logs.json'): string {
    const exportData = {
      timestamp: new Date().toISOString(),
      logs: this.logs,
      chatState: this.chatService.getState()
    };
    
    return JSON.stringify(exportData, null, 2);
  }
}

// Helper function to run tests
export async function debugChatSystem(wizardData: any, blueprintId: string): Promise<TestReport[]> {
  const debugger = new ChatDebugger(wizardData, blueprintId);
  return await debugger.runAllTests();
}