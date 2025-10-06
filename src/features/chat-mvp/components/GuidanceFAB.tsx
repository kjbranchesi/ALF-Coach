import React, { useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { HelpCircle, X, Lightbulb } from 'lucide-react';
import { motion } from 'framer-motion';
import { useResponsiveLayout } from '../hooks';

interface GuidanceContent {
  what?: string;
  why?: string;
  tip?: string;
}

interface GuidanceFABProps {
  guidance: GuidanceContent;
  stageName?: string;
}

/**
 * GuidanceFAB - Floating Action Button for contextual guidance
 * Mobile: FAB in bottom-right that opens full-screen modal
 * Desktop: Info icon button that opens popover
 */
export function GuidanceFAB({ guidance, stageName }: GuidanceFABProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { isMobile } = useResponsiveLayout();

  // Don't show if no guidance content
  if (!guidance.what && !guidance.why && !guidance.tip) {
    return null;
  }

  return (
    <>
      {/* FAB Button - Subtle, minimal presence */}
      <motion.button
        onClick={() => setIsOpen(true)}
        className={`
          ${isMobile ? 'fixed bottom-24 right-4 z-40' : 'fixed bottom-20 right-6 z-40'}
          w-10 h-10 rounded-full
          bg-gray-100 dark:bg-slate-800
          text-gray-600 dark:text-gray-300
          shadow-sm hover:shadow-md
          hover:bg-gray-200 dark:hover:bg-slate-700
          transition-all duration-200
          flex items-center justify-center
          border border-gray-200/50 dark:border-slate-600/50
        `}
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 0.8 }}
        transition={{ delay: 1, duration: 0.3 }}
        whileHover={{ opacity: 1, scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        aria-label="Show guidance"
        title="Need guidance?"
      >
        <HelpCircle className="w-4 h-4" />
      </motion.button>

      {/* Modal */}
      <Transition show={isOpen} as={React.Fragment}>
        <Dialog onClose={() => setIsOpen(false)} className="relative z-50">
          {/* Backdrop */}
          <Transition.Child
            as={React.Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm" />
          </Transition.Child>

          {/* Modal panel */}
          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4">
              <Transition.Child
                as={React.Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel
                  className="
                    w-full max-w-lg transform overflow-hidden
                    rounded-2xl bg-white dark:bg-slate-800
                    p-6 text-left align-middle shadow-xl
                    transition-all
                  "
                >
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <Dialog.Title className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                        {stageName ? `${stageName} Guidance` : 'Guidance'}
                      </Dialog.Title>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        Tips to help you craft this stage
                      </p>
                    </div>
                    <button
                      onClick={() => setIsOpen(false)}
                      className="
                        rounded-md p-2 text-gray-400
                        hover:text-gray-500 hover:bg-gray-100
                        dark:hover:bg-slate-700
                        transition-colors
                      "
                      aria-label="Close"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Content */}
                  <div className="space-y-4">
                    {/* WHAT */}
                    {guidance.what && (
                      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                        <h3 className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-2 uppercase tracking-wide">
                          What
                        </h3>
                        <p className="text-sm text-blue-800 dark:text-blue-200">
                          {guidance.what}
                        </p>
                      </div>
                    )}

                    {/* WHY */}
                    {guidance.why && (
                      <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4">
                        <h3 className="text-sm font-semibold text-purple-900 dark:text-purple-100 mb-2 uppercase tracking-wide">
                          Why
                        </h3>
                        <p className="text-sm text-purple-800 dark:text-purple-200">
                          {guidance.why}
                        </p>
                      </div>
                    )}

                    {/* TIP */}
                    {guidance.tip && (
                      <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-lg p-4">
                        <h3 className="text-sm font-semibold text-emerald-900 dark:text-emerald-100 mb-2 uppercase tracking-wide">
                          Tip
                        </h3>
                        <p className="text-sm text-emerald-800 dark:text-emerald-200">
                          {guidance.tip}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Footer */}
                  <div className="mt-6 flex justify-end">
                    <button
                      onClick={() => setIsOpen(false)}
                      className="
                        px-4 py-2 rounded-lg
                        bg-primary-600 text-white
                        hover:bg-primary-700
                        transition-colors
                      "
                    >
                      Got it
                    </button>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </>
  );
}
