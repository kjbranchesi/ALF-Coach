/**
 * ConnectionIndicator - UI component showing connection status
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wifi, WifiOff, Cloud, CloudOff, AlertTriangle, Clock } from 'lucide-react';
import { connectionStatus, type ConnectionStatus } from '../../services/ConnectionStatusService';

interface ConnectionIndicatorProps {
  className?: string;
  detailed?: boolean;
}

export const ConnectionIndicator: React.FC<ConnectionIndicatorProps> = ({ 
  className = '', 
  detailed = false 
}) => {
  const [status, setStatus] = useState<ConnectionStatus | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    const unsubscribe = connectionStatus.subscribe(setStatus);
    return unsubscribe;
  }, []);

  if (!status) return null;

  const getOverallStatus = () => {
    if (!status.online) return 'offline';
    if (status.geminiApi === 'rate-limited') return 'rate-limited';
    if (status.geminiApi === 'unavailable' && status.firebase === 'offline') return 'degraded';
    if (status.geminiApi === 'available' && status.firebase === 'connected') return 'online';
    return 'partial';
  };

  const overallStatus = getOverallStatus();

  const getStatusIcon = () => {
    switch (overallStatus) {
      case 'offline':
        return <WifiOff className="w-4 h-4" />;
      case 'rate-limited':
        return <Clock className="w-4 h-4" />;
      case 'degraded':
        return <AlertTriangle className="w-4 h-4" />;
      case 'partial':
        return <Cloud className="w-4 h-4" />;
      case 'online':
      default:
        return <Wifi className="w-4 h-4" />;
    }
  };

  const getStatusColor = () => {
    switch (overallStatus) {
      case 'offline':
      case 'degraded':
        return 'text-red-500 border-red-200 bg-red-50';
      case 'rate-limited':
        return 'text-yellow-500 border-yellow-200 bg-yellow-50';
      case 'partial':
        return 'text-orange-500 border-orange-200 bg-orange-50';
      case 'online':
      default:
        return 'text-green-500 border-green-200 bg-green-50';
    }
  };

  const getStatusMessage = () => {
    switch (overallStatus) {
      case 'offline':
        return 'Offline - Using local storage only';
      case 'rate-limited':
        return 'AI rate limited - Please wait';
      case 'degraded':
        return 'Limited connectivity - Some features unavailable';
      case 'partial':
        return 'Partial connectivity - Some services available';
      case 'online':
      default:
        return 'All services available';
    }
  };

  if (!detailed) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <div className={`p-2 rounded-lg border ${getStatusColor()}`}>
          {getStatusIcon()}
        </div>
      </div>
    );
  }

  return (
    <div className={`${className}`}>
      <motion.div
        className={`flex items-center gap-2 p-2 rounded-lg border cursor-pointer ${getStatusColor()}`}
        onClick={() => setIsExpanded(!isExpanded)}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        {getStatusIcon()}
        <span className="text-sm font-medium">{getStatusMessage()}</span>
        <motion.div
          animate={{ rotate: isExpanded ? 180 : 0 }}
          className="ml-auto"
        >
          ▼
        </motion.div>
      </motion.div>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-2 p-3 bg-white border border-gray-200 rounded-lg shadow-sm"
          >
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Internet</span>
                <div className="flex items-center gap-1">
                  {status.online ? (
                    <Wifi className="w-3 h-3 text-green-500" />
                  ) : (
                    <WifiOff className="w-3 h-3 text-red-500" />
                  )}
                  <span className={status.online ? 'text-green-600' : 'text-red-600'}>
                    {status.online ? 'Connected' : 'Offline'}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-gray-600">AI Chat</span>
                <div className="flex items-center gap-1">
                  {status.geminiApi === 'available' && (
                    <>
                      <Cloud className="w-3 h-3 text-green-500" />
                      <span className="text-green-600">Available</span>
                    </>
                  )}
                  {status.geminiApi === 'rate-limited' && (
                    <>
                      <Clock className="w-3 h-3 text-yellow-500" />
                      <span className="text-yellow-600">Rate Limited</span>
                    </>
                  )}
                  {status.geminiApi === 'unavailable' && (
                    <>
                      <CloudOff className="w-3 h-3 text-red-500" />
                      <span className="text-red-600">Unavailable</span>
                    </>
                  )}
                  {status.geminiApi === 'unknown' && (
                    <>
                      <AlertTriangle className="w-3 h-3 text-gray-500" />
                      <span className="text-gray-600">Unknown</span>
                    </>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-gray-600">Cloud Sync</span>
                <div className="flex items-center gap-1">
                  {status.firebase === 'connected' && (
                    <>
                      <Cloud className="w-3 h-3 text-green-500" />
                      <span className="text-green-600">Connected</span>
                    </>
                  )}
                  {status.firebase === 'offline' && (
                    <>
                      <CloudOff className="w-3 h-3 text-orange-500" />
                      <span className="text-orange-600">Offline</span>
                    </>
                  )}
                  {status.firebase === 'permission-denied' && (
                    <>
                      <AlertTriangle className="w-3 h-3 text-red-500" />
                      <span className="text-red-600">Access Denied</span>
                    </>
                  )}
                  {status.firebase === 'unknown' && (
                    <>
                      <AlertTriangle className="w-3 h-3 text-gray-500" />
                      <span className="text-gray-600">Unknown</span>
                    </>
                  )}
                </div>
              </div>

              {(status.errorCounts.gemini > 0 || status.errorCounts.firebase > 0) && (
                <div className="pt-2 border-t border-gray-200">
                  <div className="text-xs text-gray-500">
                    Recent errors: AI ({status.errorCounts.gemini}), Sync ({status.errorCounts.firebase})
                  </div>
                </div>
              )}

              <div className="pt-2 flex gap-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    connectionStatus.forceCheck();
                  }}
                  className="text-xs px-2 py-1 bg-primary-100 text-primary-700 rounded hover:bg-primary-200 transition-colors"
                >
                  Refresh
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};