/**
 * RevisionHistory.tsx - View and restore blueprint revision history
 */

import React, { useState } from 'react';
import { Revision } from '../core/services/RevisionService';
import { Clock, RotateCcw, ChevronDown, ChevronRight, FileText } from 'lucide-react';

interface RevisionHistoryProps {
  blueprintId: string;
  revisions: Revision[];
  onRestore: (revisionId: string) => void;
  currentRevisionId?: string;
}

export const RevisionHistory: React.FC<RevisionHistoryProps> = ({
  blueprintId,
  revisions,
  onRestore,
  currentRevisionId
}) => {
  const [expandedRevisions, setExpandedRevisions] = useState<Set<string>>(new Set());
  const [confirmRestore, setConfirmRestore] = useState<string | null>(null);

  const toggleRevision = (revisionId: string) => {
    const newExpanded = new Set(expandedRevisions);
    if (newExpanded.has(revisionId)) {
      newExpanded.delete(revisionId);
    } else {
      newExpanded.add(revisionId);
    }
    setExpandedRevisions(newExpanded);
  };

  const handleRestore = (revisionId: string) => {
    if (confirmRestore === revisionId) {
      onRestore(revisionId);
      setConfirmRestore(null);
    } else {
      setConfirmRestore(revisionId);
    }
  };

  const formatTimestamp = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - new Date(date).getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    if (days < 7) return `${days} day${days > 1 ? 's' : ''} ago`;
    
    return new Date(date).toLocaleDateString();
  };

  const getChangeIcon = (action: string) => {
    switch (action) {
      case 'create': return '+';
      case 'update': return '~';
      case 'delete': return '-';
      default: return '?';
    }
  };

  const getChangeColor = (action: string) => {
    switch (action) {
      case 'create': return 'text-green-600 dark:text-green-400';
      case 'update': return 'text-blue-600 dark:text-blue-400';
      case 'delete': return 'text-red-600 dark:text-red-400';
      default: return 'text-gray-600 dark:text-gray-400';
    }
  };

  if (revisions.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500 dark:text-gray-400">
        <Clock className="w-12 h-12 mx-auto mb-2 opacity-50" />
        <p>No revision history yet</p>
        <p className="text-sm mt-1">Changes will appear here as you edit</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
        <Clock className="w-5 h-5" />
        Revision History
      </h3>
      
      {revisions.slice().reverse().map((revision, index) => {
        const isExpanded = expandedRevisions.has(revision.id);
        const isCurrent = revision.id === currentRevisionId;
        
        return (
          <div
            key={revision.id}
            className={`rounded-lg border ${
              isCurrent 
                ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20' 
                : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800'
            }`}
          >
            <button
              onClick={() => toggleRevision(revision.id)}
              className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                {isExpanded ? (
                  <ChevronDown className="w-4 h-4 text-gray-500" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-gray-500" />
                )}
                <div className="text-left">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-gray-900 dark:text-gray-100">
                      {revision.comment || `Revision ${revisions.length - index}`}
                    </span>
                    {isCurrent && (
                      <span className="text-xs bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300 px-2 py-0.5 rounded">
                        Current
                      </span>
                    )}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {formatTimestamp(revision.timestamp)} • {revision.changes.length} change{revision.changes.length !== 1 ? 's' : ''}
                  </div>
                </div>
              </div>
              
              {!isCurrent && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRestore(revision.id);
                  }}
                  className={`px-3 py-1 text-sm rounded-md transition-colors ${
                    confirmRestore === revision.id
                      ? 'bg-red-600 text-white hover:bg-red-700'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  <RotateCcw className="w-4 h-4 inline mr-1" />
                  {confirmRestore === revision.id ? 'Confirm' : 'Restore'}
                </button>
              )}
            </button>
            
            {isExpanded && (
              <div className="px-4 pb-3 border-t border-gray-200 dark:border-gray-700">
                <div className="mt-3 space-y-1">
                  {revision.changes.map((change, idx) => (
                    <div key={idx} className="text-sm flex items-start gap-2">
                      <span className={`font-mono ${getChangeColor(change.action)}`}>
                        {getChangeIcon(change.action)}
                      </span>
                      <div className="flex-1">
                        <span className="text-gray-700 dark:text-gray-300">
                          {change.path.replace(/\./g, ' → ')}
                        </span>
                        {change.action === 'update' && (
                          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            <div className="line-through">{JSON.stringify(change.oldValue)}</div>
                            <div>{JSON.stringify(change.newValue)}</div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};