// Migration utility to switch between original and AI-enhanced ChatService
// This allows gradual rollout and A/B testing

export interface MigrationConfig {
  useAIChat: boolean;
  aiRolloutPercentage?: number;
  userIdForTesting?: string;
}

// Check if AI chat should be enabled for this user
export function shouldUseAIChat(config: MigrationConfig, userId?: string): boolean {
  // Force enable/disable
  if (config.useAIChat === false) return false;
  if (config.useAIChat === true && !config.aiRolloutPercentage) return true;
  
  // Specific user testing
  if (config.userIdForTesting && userId === config.userIdForTesting) return true;
  
  // Percentage-based rollout
  if (config.aiRolloutPercentage) {
    const hash = userId ? hashCode(userId) : Math.random() * 100;
    return (hash % 100) < config.aiRolloutPercentage;
  }
  
  return false;
}

// Simple hash function for consistent user assignment
function hashCode(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash);
}

// Export the appropriate ChatService based on configuration
export async function getChatService(wizardData: any, blueprintId: string): Promise<any> {
  const config: MigrationConfig = {
    useAIChat: import.meta.env.VITE_USE_AI_CHAT === 'true',
    aiRolloutPercentage: parseInt(import.meta.env.VITE_AI_ROLLOUT_PERCENTAGE || '100'),
    userIdForTesting: import.meta.env.VITE_AI_TEST_USER_ID
  };
  
  const useAI = shouldUseAIChat(config, blueprintId);
  
  if (useAI) {
    console.log('🤖 Using AI-enhanced ChatService');
    const { createChatService } = await import('./chat-service-ai');
    return createChatService(wizardData, blueprintId);
  } else {
    console.log('📝 Using original template-based ChatService');
    const { createChatService } = await import('./chat-service');
    return createChatService(wizardData, blueprintId);
  }
}