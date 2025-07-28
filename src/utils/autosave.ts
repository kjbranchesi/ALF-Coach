// Autosave utility for preventing data loss
import { type ChatMessage, type ChatState } from '../services/chat-service';

interface AutosaveData {
  state: Partial<ChatState>;
  messages: ChatMessage[];
  timestamp: number;
  version: string;
}

export class AutosaveManager {
  private readonly storageKey: string;
  private readonly saveInterval: number;
  private saveTimer: NodeJS.Timeout | null = null;
  private lastSaveTime: number = 0;
  private isDirty: boolean = false;
  private readonly version = '1.0';
  
  constructor(blueprintId: string, saveInterval: number = 30000) {
    this.storageKey = `autosave-${blueprintId}`;
    this.saveInterval = saveInterval;
    this.startAutosave();
  }
  
  // Mark data as changed
  markDirty(): void {
    this.isDirty = true;
  }
  
  // Save data immediately
  async save(state: Partial<ChatState>, messages: ChatMessage[]): Promise<void> {
    try {
      const data: AutosaveData = {
        state,
        messages: this.compressMessages(messages),
        timestamp: Date.now(),
        version: this.version
      };
      
      // Save to localStorage
      localStorage.setItem(this.storageKey, JSON.stringify(data));
      
      // Also save to IndexedDB for larger storage
      await this.saveToIndexedDB(data);
      
      this.lastSaveTime = Date.now();
      this.isDirty = false;
      
      console.log('Autosaved chat data');
    } catch (error) {
      console.error('Autosave failed:', error);
      
      // Try to save critical data at least
      this.saveCriticalData(state);
    }
  }
  
  // Load saved data
  async load(): Promise<AutosaveData | null> {
    try {
      // Try IndexedDB first (more reliable for large data)
      const indexedData = await this.loadFromIndexedDB();
      if (indexedData && this.isValidSaveData(indexedData)) {
        return indexedData;
      }
      
      // Fallback to localStorage
      const localData = localStorage.getItem(this.storageKey);
      if (localData) {
        const parsed = JSON.parse(localData);
        if (this.isValidSaveData(parsed)) {
          return parsed;
        }
      }
      
      return null;
    } catch (error) {
      console.error('Failed to load autosave:', error);
      return null;
    }
  }
  
  // Check if there's recoverable data
  async hasRecoverableData(): Promise<boolean> {
    const data = await this.load();
    if (!data) {return false;}
    
    // Check if data is recent (within last hour)
    const oneHour = 60 * 60 * 1000;
    return Date.now() - data.timestamp < oneHour;
  }
  
  // Clear saved data
  async clear(): Promise<void> {
    try {
      localStorage.removeItem(this.storageKey);
      await this.clearIndexedDB();
    } catch (error) {
      console.error('Failed to clear autosave:', error);
    }
  }
  
  // Start automatic saving
  private startAutosave(): void {
    if (this.saveTimer) {
      clearInterval(this.saveTimer);
    }
    
    this.saveTimer = setInterval(() => {
      if (this.isDirty && Date.now() - this.lastSaveTime > 5000) {
        // Will be called by the service when data changes
        console.log('Autosave check - data is dirty');
      }
    }, this.saveInterval);
  }
  
  // Stop autosaving
  stop(): void {
    if (this.saveTimer) {
      clearInterval(this.saveTimer);
      this.saveTimer = null;
    }
  }
  
  // Compress messages to save space
  private compressMessages(messages: ChatMessage[]): ChatMessage[] {
    // Keep only essential data for older messages
    return messages.map((msg, index) => {
      if (index < messages.length - 10) {
        // Compress older messages
        return {
          ...msg,
          content: msg.content.length > 200 
            ? `${msg.content.substring(0, 200)  }...` 
            : msg.content
        };
      }
      return msg;
    });
  }
  
  // Save critical data when main save fails
  private saveCriticalData(state: Partial<ChatState>): void {
    try {
      const critical = {
        capturedData: state.capturedData,
        stage: state.stage,
        stepIndex: state.stepIndex,
        timestamp: Date.now()
      };
      
      sessionStorage.setItem(`${this.storageKey}-critical`, JSON.stringify(critical));
    } catch (error) {
      console.error('Failed to save critical data:', error);
    }
  }
  
  // Validate saved data
  private isValidSaveData(data: any): boolean {
    return data 
      && data.version === this.version
      && data.state 
      && Array.isArray(data.messages)
      && typeof data.timestamp === 'number';
  }
  
  // IndexedDB operations
  private async saveToIndexedDB(data: AutosaveData): Promise<void> {
    const db = await this.openDB();
    const tx = db.transaction(['autosaves'], 'readwrite');
    await tx.objectStore('autosaves').put(data, this.storageKey);
    await tx.complete;
  }
  
  private async loadFromIndexedDB(): Promise<AutosaveData | null> {
    try {
      const db = await this.openDB();
      const tx = db.transaction(['autosaves'], 'readonly');
      const data = await tx.objectStore('autosaves').get(this.storageKey);
      return data || null;
    } catch (error) {
      console.error('IndexedDB load failed:', error);
      return null;
    }
  }
  
  private async clearIndexedDB(): Promise<void> {
    const db = await this.openDB();
    const tx = db.transaction(['autosaves'], 'readwrite');
    await tx.objectStore('autosaves').delete(this.storageKey);
    await tx.complete;
  }
  
  private async openDB(): Promise<any> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('ALFCoachDB', 1);
      
      request.onerror = () => { reject(request.error); };
      request.onsuccess = () => { resolve(request.result); };
      
      request.onupgradeneeded = (event) => {
        const db = (event.target as any).result;
        if (!db.objectStoreNames.contains('autosaves')) {
          db.createObjectStore('autosaves');
        }
      };
    });
  }
}

// Recovery dialog component
export interface RecoveryOptions {
  onRecover: () => void;
  onDiscard: () => void;
  lastSaveTime: number;
  itemsCount: number;
}

export function createRecoveryDialog(options: RecoveryOptions): HTMLElement {
  const dialog = document.createElement('div');
  dialog.className = 'fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50';
  
  const timeSince = Date.now() - options.lastSaveTime;
  const minutes = Math.floor(timeSince / 60000);
  
  dialog.innerHTML = `
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 max-w-md mx-4">
      <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">
        Recover Previous Session?
      </h3>
      <p class="text-gray-600 dark:text-gray-300 mb-4">
        We found an unsaved session from ${minutes} minutes ago with ${options.itemsCount} completed items.
        Would you like to continue where you left off?
      </p>
      <div class="flex gap-3">
        <button onclick="window.alfRecovery.recover()" class="flex-1 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
          Recover Session
        </button>
        <button onclick="window.alfRecovery.discard()" class="flex-1 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-300">
          Start Fresh
        </button>
      </div>
    </div>
  `;
  
  // Set up global handlers
  (window as any).alfRecovery = {
    recover: () => {
      options.onRecover();
      dialog.remove();
    },
    discard: () => {
      options.onDiscard();
      dialog.remove();
    }
  };
  
  return dialog;
}