/**
 * Project Data Context
 * React context for unified project data management
 */

import React, { createContext, useContext, useReducer, useEffect, useCallback, useMemo } from 'react';
import { 
  UnifiedProject, 
  WizardData, 
  ChatData, 
  ProjectStatus,
  extractWizardContext,
  calculateProjectCompleteness,
  getNextRecommendedAction
} from '../types/ProjectDataTypes';
// ProjectDataService not implemented yet - using direct Firebase/localStorage
// import { projectDataService, ProjectDataError } from '../services/ProjectDataService';

interface ProjectDataError {
  message: string;
  code?: string;
  retry?: () => void;
}

// Minimal stub implementation for projectDataService
const projectDataService = {
  getWizardData: () => {
    const stored = localStorage.getItem('wizard_data_temp');
    return stored ? JSON.parse(stored) : null;
  },
  saveWizardData: (data: any) => {
    localStorage.setItem('wizard_data_temp', JSON.stringify(data));
  },
  clearWizardData: () => {
    localStorage.removeItem('wizard_data_temp');
  },
  onConnectionChange: (callback: (status: string) => void) => {
    // Simple online/offline detection
    window.addEventListener('online', () => callback('online'));
    window.addEventListener('offline', () => callback('offline'));
    return () => {
      window.removeEventListener('online', () => callback('online'));
      window.removeEventListener('offline', () => callback('offline'));
    };
  },
  getSyncQueueSize: () => 0,
  createProject: async (projectId: string, wizardData: any, userId: string, title: string) => {
    const project = {
      id: projectId,
      wizardData,
      userId,
      title,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    localStorage.setItem(`project_${projectId}`, JSON.stringify(project));
    return project;
  },
  getProject: async (projectId: string) => {
    const stored = localStorage.getItem(`project_${projectId}`);
    if (stored) {
      return JSON.parse(stored);
    }
    throw new Error(`Project ${projectId} not found`);
  },
  updateProject: async (projectId: string, updates: any) => {
    const stored = localStorage.getItem(`project_${projectId}`);
    if (stored) {
      const project = JSON.parse(stored);
      const updated = { ...project, ...updates, updatedAt: new Date() };
      localStorage.setItem(`project_${projectId}`, JSON.stringify(updated));
      return updated;
    }
    throw new Error(`Project ${projectId} not found`);
  },
  subscribeToProject: (projectId: string, callback: (project: any) => void) => {
    // Simple polling for localStorage changes
    const interval = setInterval(() => {
      const stored = localStorage.getItem(`project_${projectId}`);
      if (stored) {
        callback(JSON.parse(stored));
      }
    }, 1000);
    return () => clearInterval(interval);
  },
  manualSync: async () => {
    // No-op for now
    console.log('Manual sync requested (stub implementation)');
  }
};

// ==================== CONTEXT STATE & ACTIONS ====================

interface ProjectDataState {
  // Current project
  currentProject: UnifiedProject | null;
  currentProjectId: string | null;
  
  // Wizard data (temporary storage during wizard flow)
  wizardData: WizardData | null;
  
  // Connection & sync status
  connectionStatus: 'online' | 'offline' | 'connecting';
  syncQueueSize: number;
  hasPendingChanges: boolean;
  
  // UI state
  isLoading: boolean;
  error: ProjectDataError | null;
  lastSyncTime: Date | null;
}

type ProjectDataAction = 
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: ProjectDataError | null }
  | { type: 'SET_CONNECTION_STATUS'; payload: string }
  | { type: 'SET_SYNC_QUEUE_SIZE'; payload: number }
  | { type: 'SET_WIZARD_DATA'; payload: WizardData | null }
  | { type: 'SET_CURRENT_PROJECT'; payload: { project: UnifiedProject | null; projectId: string | null } }
  | { type: 'UPDATE_PROJECT_DATA'; payload: Partial<UnifiedProject> }
  | { type: 'SET_LAST_SYNC_TIME'; payload: Date }
  | { type: 'CLEAR_ALL_DATA' };

// ==================== REDUCER ====================

function projectDataReducer(state: ProjectDataState, action: ProjectDataAction): ProjectDataState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
      
    case 'SET_ERROR':
      return { ...state, error: action.payload };
      
    case 'SET_CONNECTION_STATUS':
      return { 
        ...state, 
        connectionStatus: action.payload as ProjectDataState['connectionStatus']
      };
      
    case 'SET_SYNC_QUEUE_SIZE':
      return { ...state, syncQueueSize: action.payload };
      
    case 'SET_WIZARD_DATA':
      return { ...state, wizardData: action.payload };
      
    case 'SET_CURRENT_PROJECT':
      return { 
        ...state, 
        currentProject: action.payload.project,
        currentProjectId: action.payload.projectId,
        hasPendingChanges: action.payload.project?.persistence.hasPendingChanges || false
      };
      
    case 'UPDATE_PROJECT_DATA':
      if (!state.currentProject) return state;
      
      return {
        ...state,
        currentProject: {
          ...state.currentProject,
          ...action.payload,
          persistence: {
            ...state.currentProject.persistence,
            hasPendingChanges: true,
            lastModified: new Date()
          }
        },
        hasPendingChanges: true
      };
      
    case 'SET_LAST_SYNC_TIME':
      return { ...state, lastSyncTime: action.payload };
      
    case 'CLEAR_ALL_DATA':
      return {
        ...state,
        currentProject: null,
        currentProjectId: null,
        wizardData: null,
        error: null,
        hasPendingChanges: false
      };
      
    default:
      return state;
  }
}

// ==================== CONTEXT INTERFACE ====================

interface ProjectDataContextValue {
  // State
  state: ProjectDataState;
  
  // Wizard operations
  saveWizardData: (data: WizardData) => void;
  getWizardData: () => WizardData | null;
  clearWizardData: () => void;
  
  // Project operations
  createProject: (wizardData: WizardData, userId: string, title?: string) => Promise<string>;
  loadProject: (projectId: string) => Promise<void>;
  updateProject: (updates: Partial<UnifiedProject>) => Promise<void>;
  subscribeToProject: (projectId: string) => () => void;
  
  // Chat-specific operations
  updateWizardContext: (wizardUpdates: Partial<WizardData>) => Promise<void>;
  updateChatData: (chatUpdates: Partial<ChatData>) => Promise<void>;
  updateProjectStatus: (statusUpdates: Partial<ProjectStatus>) => Promise<void>;
  
  // Data access helpers
  getWizardContext: () => Record<string, any>;
  getProjectCompleteness: () => number;
  getNextAction: () => string;
  
  // Sync operations
  manualSync: () => Promise<void>;
  
  // Utilities
  clearAllData: () => void;
}

// ==================== CONTEXT CREATION ====================

const ProjectDataContext = createContext<ProjectDataContextValue | undefined>(undefined);

// ==================== PROVIDER COMPONENT ====================

interface ProjectDataProviderProps {
  children: React.ReactNode;
}

export function ProjectDataProvider({ children }: ProjectDataProviderProps) {
  // Initialize state
  const [state, dispatch] = useReducer(projectDataReducer, {
    currentProject: null,
    currentProjectId: null,
    wizardData: null,
    connectionStatus: 'online',
    syncQueueSize: 0,
    hasPendingChanges: false,
    isLoading: false,
    error: null,
    lastSyncTime: null
  });

  // ==================== INITIALIZATION ====================

  useEffect(() => {
    // Load wizard data on mount
    const existingWizardData = projectDataService.getWizardData();
    if (existingWizardData) {
      dispatch({ type: 'SET_WIZARD_DATA', payload: existingWizardData });
    }

    // Set up connection status monitoring
    const unsubscribeConnection = projectDataService.onConnectionChange((status) => {
      dispatch({ type: 'SET_CONNECTION_STATUS', payload: status });
      dispatch({ type: 'SET_SYNC_QUEUE_SIZE', payload: projectDataService.getSyncQueueSize() });
    });

    return () => {
      unsubscribeConnection();
    };
  }, []);

  // ==================== WIZARD OPERATIONS ====================

  const saveWizardData = useCallback((data: WizardData) => {
    try {
      projectDataService.saveWizardData(data);
      dispatch({ type: 'SET_WIZARD_DATA', payload: data });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error as ProjectDataError });
    }
  }, []);

  const getWizardData = useCallback(() => {
    return projectDataService.getWizardData();
  }, []);

  const clearWizardData = useCallback(() => {
    projectDataService.clearWizardData();
    dispatch({ type: 'SET_WIZARD_DATA', payload: null });
  }, []);

  // ==================== PROJECT OPERATIONS ====================

  const createProject = useCallback(async (wizardData: WizardData, userId: string, title?: string): Promise<string> => {
    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'SET_ERROR', payload: null });

    try {
      const projectId = `project_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const project = await projectDataService.createProject(projectId, wizardData, userId, title);
      
      dispatch({ type: 'SET_CURRENT_PROJECT', payload: { project, projectId } });
      dispatch({ type: 'SET_WIZARD_DATA', payload: null }); // Clear wizard data after creation
      dispatch({ type: 'SET_LAST_SYNC_TIME', payload: new Date() });
      
      return projectId;
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error as ProjectDataError });
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, []);

  const loadProject = useCallback(async (projectId: string) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'SET_ERROR', payload: null });

    try {
      const project = await projectDataService.getProject(projectId);
      dispatch({ type: 'SET_CURRENT_PROJECT', payload: { project, projectId } });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error as ProjectDataError });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, []);

  const updateProject = useCallback(async (updates: Partial<UnifiedProject>) => {
    if (!state.currentProjectId) {
      throw new ProjectDataError('No current project to update', 'STORAGE_ERROR');
    }

    try {
      // Optimistic update
      dispatch({ type: 'UPDATE_PROJECT_DATA', payload: updates });
      
      // Persist changes
      await projectDataService.updateProject(state.currentProjectId, updates);
      
      dispatch({ type: 'SET_LAST_SYNC_TIME', payload: new Date() });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error as ProjectDataError });
      throw error;
    }
  }, [state.currentProjectId]);

  const subscribeToProject = useCallback((projectId: string) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    
    const unsubscribe = projectDataService.subscribeToProject(
      projectId,
      (project) => {
        dispatch({ type: 'SET_CURRENT_PROJECT', payload: { project, projectId } });
        dispatch({ type: 'SET_LOADING', payload: false });
        if (project) {
          dispatch({ type: 'SET_LAST_SYNC_TIME', payload: new Date() });
        }
      },
      (error) => {
        dispatch({ type: 'SET_ERROR', payload: error });
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    );

    return unsubscribe;
  }, []);

  // ==================== SPECIFIC UPDATE OPERATIONS ====================

  const updateWizardContext = useCallback(async (wizardUpdates: Partial<WizardData>) => {
    if (!state.currentProject) return;

    const updates: Partial<UnifiedProject> = {
      wizard: {
        ...state.currentProject.wizard,
        ...wizardUpdates,
        metadata: {
          ...state.currentProject.wizard.metadata,
          lastModified: new Date()
        }
      }
    };

    await updateProject(updates);
  }, [state.currentProject, updateProject]);

  const updateChatData = useCallback(async (chatUpdates: Partial<ChatData>) => {
    if (!state.currentProject) return;

    const updates: Partial<UnifiedProject> = {
      chat: {
        ...state.currentProject.chat,
        ...chatUpdates
      }
    };

    await updateProject(updates);
  }, [state.currentProject, updateProject]);

  const updateProjectStatus = useCallback(async (statusUpdates: Partial<ProjectStatus>) => {
    if (!state.currentProject) return;

    const updates: Partial<UnifiedProject> = {
      status: {
        ...state.currentProject.status,
        ...statusUpdates,
        lastActivity: new Date()
      }
    };

    await updateProject(updates);
  }, [state.currentProject, updateProject]);

  // ==================== DATA ACCESS HELPERS ====================

  const getWizardContext = useCallback(() => {
    if (!state.currentProject) return {};
    return extractWizardContext(state.currentProject);
  }, [state.currentProject]);

  const getProjectCompleteness = useCallback(() => {
    if (!state.currentProject) return 0;
    return calculateProjectCompleteness(state.currentProject);
  }, [state.currentProject]);

  const getNextAction = useCallback(() => {
    if (!state.currentProject) return 'Create a new project';
    return getNextRecommendedAction(state.currentProject);
  }, [state.currentProject]);

  // ==================== SYNC OPERATIONS ====================

  const manualSync = useCallback(async () => {
    try {
      await projectDataService.manualSync();
      dispatch({ type: 'SET_SYNC_QUEUE_SIZE', payload: projectDataService.getSyncQueueSize() });
      dispatch({ type: 'SET_LAST_SYNC_TIME', payload: new Date() });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error as ProjectDataError });
      throw error;
    }
  }, []);

  // ==================== UTILITIES ====================

  const clearAllData = useCallback(() => {
    projectDataService.clearWizardData();
    dispatch({ type: 'CLEAR_ALL_DATA' });
  }, []);

  // ==================== CONTEXT VALUE ====================

  const contextValue = useMemo<ProjectDataContextValue>(() => ({
    state,
    
    // Wizard operations
    saveWizardData,
    getWizardData,
    clearWizardData,
    
    // Project operations
    createProject,
    loadProject,
    updateProject,
    subscribeToProject,
    
    // Specific updates
    updateWizardContext,
    updateChatData,
    updateProjectStatus,
    
    // Data access
    getWizardContext,
    getProjectCompleteness,
    getNextAction,
    
    // Sync operations
    manualSync,
    
    // Utilities
    clearAllData
  }), [
    state,
    saveWizardData,
    getWizardData,
    clearWizardData,
    createProject,
    loadProject,
    updateProject,
    subscribeToProject,
    updateWizardContext,
    updateChatData,
    updateProjectStatus,
    getWizardContext,
    getProjectCompleteness,
    getNextAction,
    manualSync,
    clearAllData
  ]);

  return (
    <ProjectDataContext.Provider value={contextValue}>
      {children}
    </ProjectDataContext.Provider>
  );
}

// ==================== HOOK ====================

export function useProjectData(): ProjectDataContextValue {
  const context = useContext(ProjectDataContext);
  if (context === undefined) {
    throw new Error('useProjectData must be used within a ProjectDataProvider');
  }
  return context;
}

// ==================== HOOK VARIANTS ====================

/**
 * Hook specifically for wizard components
 */
export function useWizardData() {
  const { state, saveWizardData, getWizardData, clearWizardData, createProject } = useProjectData();
  
  return {
    wizardData: state.wizardData,
    isLoading: state.isLoading,
    error: state.error,
    connectionStatus: state.connectionStatus,
    saveWizardData,
    getWizardData,
    clearWizardData,
    createProject
  };
}

/**
 * Hook specifically for chat components
 */
export function useChatData() {
  const { 
    state, 
    updateChatData, 
    updateProjectStatus, 
    getWizardContext,
    getProjectCompleteness,
    getNextAction 
  } = useProjectData();
  
  return {
    currentProject: state.currentProject,
    chatData: state.currentProject?.chat,
    wizardContext: getWizardContext(),
    projectCompleteness: getProjectCompleteness(),
    nextAction: getNextAction(),
    isLoading: state.isLoading,
    error: state.error,
    hasPendingChanges: state.hasPendingChanges,
    updateChatData,
    updateProjectStatus
  };
}

/**
 * Hook for connection and sync status
 */
export function useConnectionStatus() {
  const { state, manualSync } = useProjectData();
  
  return {
    connectionStatus: state.connectionStatus,
    syncQueueSize: state.syncQueueSize,
    hasPendingChanges: state.hasPendingChanges,
    lastSyncTime: state.lastSyncTime,
    manualSync
  };
}