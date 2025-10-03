import React from 'react';
import { Menu, Transition } from '@headlessui/react';
import { CheckCircle, AlertCircle, XCircle, Sparkles, Database } from 'lucide-react';

export interface SystemStatus {
  ai: 'online' | 'offline' | 'error';
  firebase: 'online' | 'offline' | 'error';
  model?: string;
}

interface StatusIndicatorProps {
  status: SystemStatus;
}

/**
 * StatusIndicator - Consolidated system status
 * Shows as single dot on mobile/desktop, expands to dropdown on click
 */
export function StatusIndicator({ status }: StatusIndicatorProps) {
  // Determine overall status (worst of all systems)
  const overallStatus = React.useMemo(() => {
    if (status.ai === 'error' || status.firebase === 'error') {
      return 'error';
    }
    if (status.ai === 'offline' || status.firebase === 'offline') {
      return 'offline';
    }
    return 'online';
  }, [status]);

  const statusConfig = {
    online: {
      color: 'bg-emerald-500',
      label: 'All systems online',
      ringColor: 'ring-emerald-500/30',
    },
    offline: {
      color: 'bg-amber-500',
      label: 'Some systems offline',
      ringColor: 'ring-amber-500/30',
    },
    error: {
      color: 'bg-red-500',
      label: 'System error',
      ringColor: 'ring-red-500/30',
    },
  };

  const config = statusConfig[overallStatus];

  return (
    <Menu as="div" className="relative">
      {/* Status dot button */}
      <Menu.Button
        className="
          relative flex items-center justify-center
          w-10 h-10 rounded-lg
          hover:bg-gray-100 dark:hover:bg-slate-800
          transition-colors
        "
        aria-label="System status"
      >
        <span className="relative flex h-3 w-3">
          <span
            className={`
              absolute inline-flex h-full w-full rounded-full
              ${config.color} opacity-75
              ${overallStatus === 'online' ? 'animate-ping' : ''}
            `}
          />
          <span
            className={`
              relative inline-flex rounded-full h-3 w-3
              ${config.color}
            `}
          />
        </span>
      </Menu.Button>

      {/* Dropdown menu */}
      <Transition
        as={React.Fragment}
        enter="transition ease-out duration-100"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <Menu.Items
          className="
            absolute right-0 mt-2 w-64 origin-top-right
            bg-white dark:bg-slate-800
            rounded-lg shadow-lg ring-1 ring-black ring-opacity-5
            divide-y divide-gray-100 dark:divide-slate-700
            focus:outline-none
            z-50
          "
        >
          {/* Header */}
          <div className="px-4 py-3">
            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
              System Status
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {config.label}
            </p>
          </div>

          {/* AI Status */}
          <div className="px-4 py-3">
            <div className="flex items-center gap-3">
              {status.ai === 'online' ? (
                <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0" />
              ) : status.ai === 'offline' ? (
                <AlertCircle className="w-4 h-4 text-amber-500 flex-shrink-0" />
              ) : (
                <XCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  AI Assistant
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                  {status.ai === 'online' ? 'Ready' : status.ai === 'offline' ? 'Unavailable' : 'Error'}
                </p>
              </div>
            </div>

            {/* Model info (if available and online) */}
            {status.ai === 'online' && status.model && (
              <div className="mt-2 flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                <Sparkles className="w-3 h-3" />
                <span>Model: {status.model}</span>
              </div>
            )}
          </div>

          {/* Firebase Status */}
          <div className="px-4 py-3">
            <div className="flex items-center gap-3">
              {status.firebase === 'online' ? (
                <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0" />
              ) : status.firebase === 'offline' ? (
                <AlertCircle className="w-4 h-4 text-amber-500 flex-shrink-0" />
              ) : (
                <XCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  Database
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {status.firebase === 'online' ? 'Connected' : status.firebase === 'offline' ? 'Disconnected' : 'Error'}
                </p>
              </div>
            </div>
          </div>
        </Menu.Items>
      </Transition>
    </Menu>
  );
}
