// ChatWrapper.tsx - Feature flag controlled chat component selector
import React, { useEffect, useState } from 'react';
import ChatModule from './ChatModule';
import ChatV6 from './ChatV6';
import { shouldUseChatV6, featureFlags } from '../utils/featureFlags';
import { logger } from '../utils/logger';
import { isDevelopment } from '../utils/environment';

interface ChatWrapperProps {
  // Props from MainWorkspace
  messages: any[];
  onSendMessage: (message: string) => void;
  onAdvanceStage: () => void;
  isAiLoading: boolean;
  currentStageConfig: any;
  projectInfo: {
    subject: string;
    ageGroup: string;
  };
  
  // Additional props for ChatV6
  projectId?: string;
  projectData?: {
    subject: string;
    ageGroup: string;
    stage: 'ideation' | 'journey' | 'deliverables';
    capturedData: Record<string, any>;
  };
  onStageComplete?: (nextStage: string) => void;
  onDataCapture?: (field: string, value: any) => void;
}

export default function ChatWrapper(props: ChatWrapperProps) {
  const [useChatV6, setUseChatV6] = useState(shouldUseChatV6());
  const [showDebugBanner, setShowDebugBanner] = useState(isDevelopment());

  useEffect(() => {
    // Log which version is being used
    logger.log(`ChatWrapper: Using ${useChatV6 ? 'ChatV6' : 'ChatModule'}`);
    logger.log('Feature flags state:', featureFlags.getState());
  }, [useChatV6]);

  // Props adapter for ChatV6
  const chatV6Props = {
    projectId: props.projectId || 'default',
    projectData: props.projectData || {
      subject: props.projectInfo.subject,
      ageGroup: props.projectInfo.ageGroup,
      stage: 'ideation' as const,
      capturedData: {}
    },
    onStageComplete: props.onStageComplete || (() => {}),
    onDataCapture: props.onDataCapture || (() => {})
  };

  // Debug banner for development
  const DebugBanner = () => {
    if (!showDebugBanner) return null;
    
    return (
      <div className="bg-yellow-100 border-b border-yellow-300 px-4 py-2 text-sm">
        <div className="flex items-center justify-between">
          <span className="text-yellow-800">
            🧪 Chat Version: <strong>{useChatV6 ? 'V6 (New)' : 'V5 (Legacy)'}</strong>
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => {
                featureFlags.setOverride('useChatV6', !useChatV6);
                setUseChatV6(!useChatV6);
              }}
              className="px-3 py-1 bg-yellow-200 hover:bg-yellow-300 rounded text-xs font-medium"
            >
              Switch to {useChatV6 ? 'V5' : 'V6'}
            </button>
            <button
              onClick={() => setShowDebugBanner(false)}
              className="text-yellow-600 hover:text-yellow-800"
            >
              ✕
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="h-full flex flex-col">
      <DebugBanner />
      <div className="flex-1 overflow-hidden">
        {useChatV6 ? (
          <ChatV6 {...chatV6Props} />
        ) : (
          <ChatModule {...props} />
        )}
      </div>
    </div>
  );
}

// Re-export for backwards compatibility
export type { ChatWrapperProps };