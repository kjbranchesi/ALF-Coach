import React from 'react';
import { Disclosure, Transition } from '@headlessui/react';
import { ChevronDown } from 'lucide-react';
import { motion } from 'framer-motion';

interface ProjectContext {
  subjects?: string[];
  primarySubject?: string;
  ageGroup?: string;
  duration?: string;
  projectName?: string;
  [key: string]: any;
}

interface CollapsibleProjectBriefProps {
  context: ProjectContext;
  defaultOpen?: boolean;
}

/**
 * CollapsibleProjectBrief - Progressive disclosure for project context
 * Shows summary by default, expands to full details on click
 */
export function CollapsibleProjectBrief({
  context,
  defaultOpen = false,
}: CollapsibleProjectBriefProps) {
  // Generate summary text
  const summary = React.useMemo(() => {
    const parts: string[] = [];

    if (context.ageGroup) {
      parts.push(context.ageGroup);
    }
    if (context.duration) {
      parts.push(context.duration);
    }
    if (context.primarySubject) {
      parts.push(context.primarySubject);
    } else if (context.subjects && context.subjects.length > 0) {
      parts.push(context.subjects[0]);
    }

    const topicCount = context.subjects?.length || 0;
    if (topicCount > 1) {
      parts.push(`${topicCount} topics`);
    }

    return parts.join(' · ') || 'Project context';
  }, [context]);

  return (
    <Disclosure defaultOpen={defaultOpen}>
      {({ open }) => (
        <div className="border border-gray-200 dark:border-slate-700 rounded-lg overflow-hidden bg-white dark:bg-slate-800">
          <Disclosure.Button
            className="
              w-full px-4 py-3 flex items-center justify-between
              text-left hover:bg-gray-50 dark:hover:bg-slate-700/50
              transition-colors
            "
          >
            <div className="flex-1 min-w-0">
              <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                {summary}
              </span>
            </div>
            <motion.div
              animate={{ rotate: open ? 180 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <ChevronDown className="w-5 h-5 text-gray-500 dark:text-gray-400" />
            </motion.div>
          </Disclosure.Button>

          <Transition
            show={open}
            enter="transition duration-200 ease-out"
            enterFrom="transform scale-95 opacity-0"
            enterTo="transform scale-100 opacity-100"
            leave="transition duration-150 ease-out"
            leaveFrom="transform scale-100 opacity-100"
            leaveTo="transform scale-95 opacity-0"
          >
            <Disclosure.Panel static className="px-4 pb-4 pt-2 border-t border-gray-200 dark:border-slate-700">
              <div className="space-y-3">
                {/* Project Name */}
                {context.projectName && (
                  <div>
                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">
                      Project
                    </p>
                    <p className="text-sm text-gray-900 dark:text-gray-100">
                      {context.projectName}
                    </p>
                  </div>
                )}

                {/* Age Group */}
                {context.ageGroup && (
                  <div>
                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">
                      Age Group
                    </p>
                    <p className="text-sm text-gray-900 dark:text-gray-100">
                      {context.ageGroup}
                    </p>
                  </div>
                )}

                {/* Duration */}
                {context.duration && (
                  <div>
                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">
                      Duration
                    </p>
                    <p className="text-sm text-gray-900 dark:text-gray-100">
                      {context.duration}
                    </p>
                  </div>
                )}

                {/* Subjects */}
                {context.subjects && context.subjects.length > 0 && (
                  <div>
                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">
                      Subjects
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {context.subjects.map((subject, index) => (
                        <span
                          key={index}
                          className="
                            inline-flex items-center px-2.5 py-0.5
                            rounded-md text-xs font-medium
                            bg-primary-50 text-primary-700
                            dark:bg-primary-900/30 dark:text-primary-300
                          "
                        >
                          {subject}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </Disclosure.Panel>
          </Transition>
        </div>
      )}
    </Disclosure>
  );
}
