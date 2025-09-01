import React from 'react';
import { ChatbotFirstInterfaceFixed } from '../components/chat/ChatbotFirstInterfaceFixed';

// Minimal, deterministic chat harness to bypass onboarding and start at BIG_IDEA
export default function TestChatSmoke() {
  const projectId = 'test-smoke';
  const projectData = {
    id: projectId,
    wizardData: {
      // Streamlined Wizard v2-compatible minimal shape
      entryPoint: 'learning_goal',
      projectTopic: 'Students investigate local water quality and community impact.',
      learningGoals: 'Develop inquiry skills, analyze data, and communicate findings.',
      materials: 'Lab notebooks, test strips, internet access',
      subjects: ['science'],
      primarySubject: 'science',
      gradeLevel: 'middle',
      duration: 'medium',
      specialRequirements: '',
      specialConsiderations: '',
      pblExperience: 'some',
      metadata: { createdAt: new Date(), lastModified: new Date(), version: '2.0', wizardCompleted: true, skippedFields: [] },
      conversationState: { phase: 'handoff', contextCompleteness: { core: 100, context: 75, progressive: 0 } }
    },
    capturedData: {},
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    userId: 'anonymous',
    chatHistory: []
  };

  return (
    <div className="min-h-screen">
      <ChatbotFirstInterfaceFixed
        projectId={projectId}
        projectData={projectData}
        onStageComplete={() => { /* noop for smoke */ }}
        onNavigate={() => { /* noop */ }}
      />
    </div>
  );
}
