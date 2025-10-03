/**
 * ConnectionStatusService - Monitors and reports connection status for APIs and Firebase
 */

interface ConnectionStatus {
  online: boolean;
  geminiApi: 'available' | 'unavailable' | 'unknown' | 'rate-limited';
  firebase: 'connected' | 'offline' | 'permission-denied' | 'unknown';
  lastGeminiCheck: Date | null;
  lastFirebaseCheck: Date | null;
  errorCounts: {
    gemini: number;
    firebase: number;
  };
}

type ConnectionListener = (status: ConnectionStatus) => void;

class ConnectionStatusService {
  private status: ConnectionStatus = {
    online: navigator.onLine,
    geminiApi: 'unknown',
    firebase: 'unknown',
    lastGeminiCheck: null,
    lastFirebaseCheck: null,
    errorCounts: {
      gemini: 0,
      firebase: 0
    }
  };

  private listeners: Set<ConnectionListener> = new Set();
  private checkInterval: number | null = null;

  constructor() {
    // Listen to browser online/offline events
    window.addEventListener('online', this.handleOnline.bind(this));
    window.addEventListener('offline', this.handleOffline.bind(this));
    
    // Start periodic checks
    this.startPeriodicChecks();
  }

  private handleOnline() {
    this.status.online = true;
    this.notifyListeners();
    // Immediately check services when coming back online
    this.checkGeminiStatus();
    this.checkFirebaseStatus();
  }

  private handleOffline() {
    this.status.online = false;
    this.status.geminiApi = 'unavailable';
    this.status.firebase = 'offline';
    this.notifyListeners();
  }

  private startPeriodicChecks() {
    // Check every 5 minutes to reduce API usage
    this.checkInterval = window.setInterval(() => {
      if (this.status.online) {
        this.checkGeminiStatus();
        this.checkFirebaseStatus();
      }
    }, 300000);
  }

  private async checkGeminiStatus() {
    if (!this.status.online) {return;}

    // Respect environment: allow disabling health checks when no proxy is configured
    const proxyUrl = (import.meta as any)?.env?.VITE_GEMINI_PROXY_URL || '/.netlify/functions/gemini';
    const geminiEnabled = (import.meta as any)?.env?.VITE_GEMINI_ENABLED === 'true';
    if (!geminiEnabled && !((import.meta as any)?.env?.VITE_GEMINI_PROXY_URL)) {
      // Skip probing when not explicitly enabled; treat as unavailable without network noise
      this.status.geminiApi = 'unavailable';
      this.notifyListeners();
      return;
    }

    try {
      // Simple health check to the Netlify function with minimal payload
      const response = await fetch(proxyUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: 'health check',
          history: []
        }),
        signal: AbortSignal.timeout(10000) // 10 second timeout for slower connections
      });

      if (response.ok) {
        this.status.geminiApi = 'available';
        this.status.errorCounts.gemini = Math.max(0, this.status.errorCounts.gemini - 1);
      } else if (response.status === 429) {
        this.status.geminiApi = 'rate-limited';
        // Clear rate limit status after 30 seconds
        setTimeout(() => {
          if (this.status.geminiApi === 'rate-limited') {
            this.status.geminiApi = 'unknown';
            this.notifyListeners();
          }
        }, 30000);
      } else {
        this.status.geminiApi = 'unavailable';
        this.status.errorCounts.gemini++;
      }
    } catch (error: any) {
      console.debug('Gemini health check failed:', error);
      
      // Check for specific error types
      if (error.name === 'AbortError') {
        this.status.geminiApi = 'unavailable';
      } else if (error.message?.includes('429') || error.message?.includes('rate limit')) {
        this.status.geminiApi = 'rate-limited';
      } else {
        this.status.geminiApi = 'unavailable';
      }
      
      this.status.errorCounts.gemini++;
    }

    this.status.lastGeminiCheck = new Date();
    this.notifyListeners();
  }

  private async checkFirebaseStatus() {
    if (!this.status.online) {return;}

    try {
      // Import Firebase dynamically to avoid initialization issues
      const { db } = await import('../firebase/firebase');
      
      if (!db || (db as any).type === 'offline') {
        this.status.firebase = 'offline';
        return;
      }

      // Try a simple operation to test connectivity
      const { doc, getDoc } = await import('firebase/firestore');
      const testDoc = doc(db, '__test__', 'connectivity');
      
      await getDoc(testDoc);
      this.status.firebase = 'connected';
      this.status.errorCounts.firebase = Math.max(0, this.status.errorCounts.firebase - 1);
    } catch (error: any) {
      console.debug('Firebase health check failed:', error);
      
      if (error.code === 'permission-denied') {
        this.status.firebase = 'permission-denied';
      } else {
        this.status.firebase = 'offline';
        this.status.errorCounts.firebase++;
      }
    }

    this.status.lastFirebaseCheck = new Date();
    this.notifyListeners();
  }

  // Public methods
  public getStatus(): ConnectionStatus {
    return { ...this.status };
  }

  public subscribe(listener: ConnectionListener): () => void {
    this.listeners.add(listener);
    
    // Immediately notify with current status
    listener(this.getStatus());
    
    return () => {
      this.listeners.delete(listener);
    };
  }

  public reportGeminiError(error: Error) {
    this.status.errorCounts.gemini++;
    
    if (error.message.includes('429') || error.message.includes('rate limit')) {
      this.status.geminiApi = 'rate-limited';
    } else {
      this.status.geminiApi = 'unavailable';
    }
    
    this.notifyListeners();
  }

  public reportFirebaseError(error: Error) {
    this.status.errorCounts.firebase++;
    
    if ((error as any).code === 'permission-denied') {
      this.status.firebase = 'permission-denied';
    } else {
      this.status.firebase = 'offline';
    }
    
    this.notifyListeners();
  }

  public reportGeminiSuccess() {
    this.status.geminiApi = 'available';
    this.status.errorCounts.gemini = Math.max(0, this.status.errorCounts.gemini - 1);
    this.notifyListeners();
  }

  public reportFirebaseSuccess() {
    this.status.firebase = 'connected';
    this.status.errorCounts.firebase = Math.max(0, this.status.errorCounts.firebase - 1);
    this.notifyListeners();
  }

  public forceCheck() {
    if (this.status.online) {
      this.checkGeminiStatus();
      this.checkFirebaseStatus();
    }
  }

  private notifyListeners() {
    this.listeners.forEach(listener => {
      try {
        listener(this.getStatus());
      } catch (error) {
        console.error('Connection status listener error:', error);
      }
    });
  }

  public destroy() {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
    }
    window.removeEventListener('online', this.handleOnline.bind(this));
    window.removeEventListener('offline', this.handleOffline.bind(this));
    this.listeners.clear();
  }
}

// Singleton instance
export const connectionStatus = new ConnectionStatusService();
export type { ConnectionStatus, ConnectionListener };
