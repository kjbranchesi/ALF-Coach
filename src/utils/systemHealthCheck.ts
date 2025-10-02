/**
 * System Health Check - Comprehensive testing of all integrations
 */

import { connectionStatus } from '../services/ConnectionStatusService';
import { memoryManager } from './memoryManager';
import { GeminiService } from '../services/GeminiService';

interface HealthCheckResult {
  component: string;
  status: 'healthy' | 'warning' | 'error';
  message: string;
  details?: any;
  timestamp: Date;
}

interface SystemHealth {
  overall: 'healthy' | 'degraded' | 'critical';
  checks: HealthCheckResult[];
  summary: {
    healthy: number;
    warnings: number;
    errors: number;
  };
  recommendations: string[];
}

export class SystemHealthChecker {
  private geminiService = new GeminiService();

  async runFullHealthCheck(): Promise<SystemHealth> {
    const checks: HealthCheckResult[] = [];
    
    // Check all system components
    checks.push(await this.checkNetworkConnectivity());
    checks.push(await this.checkGeminiAPI());
    checks.push(await this.checkFirebaseConnection());
    checks.push(await this.checkLocalStorage());
    checks.push(await this.checkMemoryUsage());
    checks.push(await this.checkBrowserCompatibility());
    
    // Calculate summary
    const summary = {
      healthy: checks.filter(c => c.status === 'healthy').length,
      warnings: checks.filter(c => c.status === 'warning').length,
      errors: checks.filter(c => c.status === 'error').length
    };
    
    // Determine overall health
    let overall: 'healthy' | 'degraded' | 'critical';
    if (summary.errors > 0) {
      overall = summary.errors > 2 ? 'critical' : 'degraded';
    } else if (summary.warnings > 0) {
      overall = 'degraded';
    } else {
      overall = 'healthy';
    }
    
    // Generate recommendations
    const recommendations = this.generateRecommendations(checks);
    
    return {
      overall,
      checks,
      summary,
      recommendations
    };
  }

  private async checkNetworkConnectivity(): Promise<HealthCheckResult> {
    try {
      const online = navigator.onLine;
      const connectionType = (navigator as any).connection?.effectiveType || 'unknown';
      
      if (!online) {
        return {
          component: 'Network',
          status: 'error',
          message: 'No internet connection detected',
          details: { online, connectionType },
          timestamp: new Date()
        };
      }
      
      // Test actual connectivity with a lightweight request
      const response = await fetch('/favicon.svg', { 
        method: 'HEAD',
        cache: 'no-cache',
        signal: AbortSignal.timeout(5000)
      });
      
      const isConnected = response.ok;
      
      return {
        component: 'Network',
        status: isConnected ? 'healthy' : 'warning',
        message: isConnected ? 'Internet connection active' : 'Limited connectivity detected',
        details: { online, connectionType, responseTime: Date.now() },
        timestamp: new Date()
      };
    } catch (error) {
      return {
        component: 'Network',
        status: 'error',
        message: 'Network connectivity test failed',
        details: { error: (error as Error).message },
        timestamp: new Date()
      };
    }
  }

  private async checkGeminiAPI(): Promise<HealthCheckResult> {
    try {
      const status = connectionStatus.getStatus();
      
      if (status.geminiApi === 'unknown') {
        // Force a check
        connectionStatus.forceCheck();
        // Wait a bit for the check to complete
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
      
      const updatedStatus = connectionStatus.getStatus();
      
      switch (updatedStatus.geminiApi) {
        case 'available':
          return {
            component: 'Gemini API',
            status: 'healthy',
            message: 'AI service is available and responding',
            details: { 
              lastCheck: updatedStatus.lastGeminiCheck,
              errorCount: updatedStatus.errorCounts.gemini 
            },
            timestamp: new Date()
          };
          
        case 'rate-limited':
          return {
            component: 'Gemini API',
            status: 'warning',
            message: 'AI service is rate limited',
            details: { 
              lastCheck: updatedStatus.lastGeminiCheck,
              errorCount: updatedStatus.errorCounts.gemini 
            },
            timestamp: new Date()
          };
          
        case 'unavailable':
          return {
            component: 'Gemini API',
            status: 'error',
            message: 'AI service is currently unavailable',
            details: { 
              lastCheck: updatedStatus.lastGeminiCheck,
              errorCount: updatedStatus.errorCounts.gemini 
            },
            timestamp: new Date()
          };
          
        default:
          return {
            component: 'Gemini API',
            status: 'warning',
            message: 'AI service status unknown',
            details: { 
              lastCheck: updatedStatus.lastGeminiCheck,
              errorCount: updatedStatus.errorCounts.gemini 
            },
            timestamp: new Date()
          };
      }
    } catch (error) {
      return {
        component: 'Gemini API',
        status: 'error',
        message: 'Failed to check AI service status',
        details: { error: (error as Error).message },
        timestamp: new Date()
      };
    }
  }

  private async checkFirebaseConnection(): Promise<HealthCheckResult> {
    try {
      const { db, isOfflineMode } = await import('../firebase/firebase');
      
      if (isOfflineMode || (db as any)?.type === 'offline') {
        return {
          component: 'Firebase',
          status: 'warning',
          message: 'Running in offline mode - using localStorage only',
          details: { mode: 'offline' },
          timestamp: new Date()
        };
      }
      
      const status = connectionStatus.getStatus();
      
      switch (status.firebase) {
        case 'connected':
          return {
            component: 'Firebase',
            status: 'healthy',
            message: 'Cloud sync is working',
            details: { 
              lastCheck: status.lastFirebaseCheck,
              errorCount: status.errorCounts.firebase 
            },
            timestamp: new Date()
          };
          
        case 'permission-denied':
          return {
            component: 'Firebase',
            status: 'warning',
            message: 'Cloud sync access denied - using local storage',
            details: { 
              lastCheck: status.lastFirebaseCheck,
              errorCount: status.errorCounts.firebase 
            },
            timestamp: new Date()
          };
          
        case 'offline':
          return {
            component: 'Firebase',
            status: 'warning',
            message: 'Cloud sync offline - using local storage',
            details: { 
              lastCheck: status.lastFirebaseCheck,
              errorCount: status.errorCounts.firebase 
            },
            timestamp: new Date()
          };
          
        default:
          return {
            component: 'Firebase',
            status: 'warning',
            message: 'Cloud sync status unknown',
            details: { 
              lastCheck: status.lastFirebaseCheck,
              errorCount: status.errorCounts.firebase 
            },
            timestamp: new Date()
          };
      }
    } catch (error) {
      return {
        component: 'Firebase',
        status: 'error',
        message: 'Failed to check cloud sync status',
        details: { error: (error as Error).message },
        timestamp: new Date()
      };
    }
  }

  private async checkLocalStorage(): Promise<HealthCheckResult> {
    try {
      // Test localStorage availability
      const testKey = '__alf_health_check__';
      const testValue = { timestamp: Date.now() };
      
      localStorage.setItem(testKey, JSON.stringify(testValue));
      const retrieved = JSON.parse(localStorage.getItem(testKey) || '{}');
      localStorage.removeItem(testKey);
      
      if (retrieved.timestamp !== testValue.timestamp) {
        throw new Error('localStorage read/write test failed');
      }
      
      // Check available storage space
      let usedSpace = 0;
      for (let key in localStorage) {
        if (localStorage.hasOwnProperty(key)) {
          usedSpace += localStorage[key].length;
        }
      }
      
      // Rough estimate of storage usage (localStorage is typically 5-10MB)
      const estimatedLimit = 5 * 1024 * 1024; // 5MB
      const usagePercentage = (usedSpace / estimatedLimit) * 100;
      
      const status = usagePercentage > 80 ? 'warning' : 'healthy';
      const message = status === 'warning' 
        ? 'Local storage is nearly full' 
        : 'Local storage is working normally';
      
      return {
        component: 'Local Storage',
        status,
        message,
        details: { 
          usedBytes: usedSpace,
          usagePercentage: Math.round(usagePercentage * 100) / 100
        },
        timestamp: new Date()
      };
    } catch (error) {
      return {
        component: 'Local Storage',
        status: 'error',
        message: 'Local storage is not available',
        details: { error: (error as Error).message },
        timestamp: new Date()
      };
    }
  }

  private async checkMemoryUsage(): Promise<HealthCheckResult> {
    try {
      const memInfo = memoryManager.getMemoryInfo();
      const metrics = memoryManager.getMetrics();
      
      if (!memInfo.available) {
        return {
          component: 'Memory',
          status: 'warning',
          message: 'Memory monitoring not available in this browser',
          details: { available: false },
          timestamp: new Date()
        };
      }
      
      const usagePercentage = memInfo.usagePercentage;
      let status: 'healthy' | 'warning' | 'error';
      let message: string;
      
      if (usagePercentage > 90) {
        status = 'error';
        message = 'Memory usage is critically high';
      } else if (usagePercentage > 70) {
        status = 'warning';
        message = 'Memory usage is elevated';
      } else {
        status = 'healthy';
        message = 'Memory usage is normal';
      }
      
      return {
        component: 'Memory',
        status,
        message,
        details: {
          ...memInfo,
          metrics,
          usagePercentage: Math.round(usagePercentage * 100) / 100
        },
        timestamp: new Date()
      };
    } catch (error) {
      return {
        component: 'Memory',
        status: 'warning',
        message: 'Unable to check memory usage',
        details: { error: (error as Error).message },
        timestamp: new Date()
      };
    }
  }

  private async checkBrowserCompatibility(): Promise<HealthCheckResult> {
    try {
      const requiredFeatures = {
        fetch: typeof fetch !== 'undefined',
        localStorage: typeof localStorage !== 'undefined',
        indexedDB: typeof indexedDB !== 'undefined',
        webWorkers: typeof Worker !== 'undefined',
        abortController: typeof AbortController !== 'undefined',
        es6: (() => {
          try {
            eval('const x = () => {}');
            return true;
          } catch {
            return false;
          }
        })()
      };
      
      const missingFeatures = Object.entries(requiredFeatures)
        .filter(([, supported]) => !supported)
        .map(([feature]) => feature);
      
      if (missingFeatures.length > 0) {
        return {
          component: 'Browser Compatibility',
          status: 'error',
          message: `Browser missing required features: ${missingFeatures.join(', ')}`,
          details: { requiredFeatures, missingFeatures },
          timestamp: new Date()
        };
      }
      
      return {
        component: 'Browser Compatibility',
        status: 'healthy',
        message: 'Browser supports all required features',
        details: { requiredFeatures },
        timestamp: new Date()
      };
    } catch (error) {
      return {
        component: 'Browser Compatibility',
        status: 'error',
        message: 'Failed to check browser compatibility',
        details: { error: (error as Error).message },
        timestamp: new Date()
      };
    }
  }

  private generateRecommendations(checks: HealthCheckResult[]): string[] {
    const recommendations: string[] = [];
    
    checks.forEach(check => {
      switch (check.component) {
        case 'Network':
          if (check.status === 'error') {
            recommendations.push('Check your internet connection');
          }
          break;
          
        case 'Gemini API':
          if (check.status === 'error') {
            recommendations.push('AI chat is temporarily unavailable - responses will use fallback mode');
          } else if (check.status === 'warning') {
            recommendations.push('AI responses may be delayed due to rate limiting');
          }
          break;
          
        case 'Firebase':
          if (check.status === 'warning' || check.status === 'error') {
            recommendations.push('Your work is being saved locally and will sync when connection is restored');
          }
          break;
          
        case 'Local Storage':
          if (check.status === 'warning') {
            recommendations.push('Consider clearing old project data to free up storage space');
          } else if (check.status === 'error') {
            recommendations.push('Enable localStorage in your browser settings for data persistence');
          }
          break;
          
        case 'Memory':
          if (check.status === 'error') {
            recommendations.push('Close other browser tabs to free up memory');
          } else if (check.status === 'warning') {
            recommendations.push('Consider refreshing the page if performance seems slow');
          }
          break;
          
        case 'Browser Compatibility':
          if (check.status === 'error') {
            recommendations.push('Update your browser for the best experience');
          }
          break;
      }
    });
    
    return recommendations;
  }
}

// Singleton instance
export const healthChecker = new SystemHealthChecker();
