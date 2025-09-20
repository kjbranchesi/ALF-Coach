/**
 * AccessibleChatWrapper.tsx
 *
 * Accessibility-first wrapper for the chat interface
 * Handles keyboard navigation, screen readers, and mobile optimization
 */

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { StreamlinedChatInterface } from './StreamlinedChatInterface';
import { ConversationFlowEngine, ProjectContext } from './ConversationFlowEngine';
import '../../../styles/ChatAccessibility.css';

interface AccessibleChatWrapperProps {
  projectId?: string;
  initialContext?: ProjectContext;
  onStageComplete?: (stage: string, data: any) => void;
  onProjectComplete?: (projectData: any) => void;
}

export const AccessibleChatWrapper: React.FC<AccessibleChatWrapperProps> = (props) => {
  const chatRef = useRef<HTMLDivElement>(null);
  const [announcements, setAnnouncements] = useState<string[]>([]);
  const [keyboardUser, setKeyboardUser] = useState(false);

  // Detect keyboard usage for enhanced focus indicators
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Tab') {
        setKeyboardUser(true);
      }
    };

    const handleMouseDown = () => {
      setKeyboardUser(false);
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handleMouseDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleMouseDown);
    };
  }, []);

  // Announce important state changes to screen readers
  const announce = useCallback((message: string) => {
    setAnnouncements(prev => [...prev, message]);
    // Clear announcement after it's been read
    setTimeout(() => {
      setAnnouncements(prev => prev.slice(1));
    }, 1000);
  }, []);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Skip if user is typing in an input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      switch (e.key) {
        case 'Escape':
          // Clear focus and return to main chat input
          const chatInput = chatRef.current?.querySelector('textarea');
          chatInput?.focus();
          break;

        case '?':
          if (e.shiftKey) {
            // Show keyboard shortcuts help
            e.preventDefault();
            announce('Keyboard shortcuts: Tab to navigate, Escape to return to input, Shift+? for help');
          }
          break;

        case 'h':
          if (e.ctrlKey || e.metaKey) {
            // Toggle help panel
            e.preventDefault();
            const helpButton = chatRef.current?.querySelector('[aria-label="Toggle help"]');
            (helpButton as HTMLButtonElement)?.click();
          }
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [announce]);

  // Enhanced stage completion handler with announcements
  const handleStageComplete = useCallback((stage: string, data: any) => {
    const stageNames: Record<string, string> = {
      'CONTEXT': 'Project Context',
      'BIG_IDEA': 'Big Idea',
      'ESSENTIAL_QUESTION': 'Essential Question',
      'LEARNING_JOURNEY': 'Learning Journey'
    };

    announce(`${stageNames[stage] || stage} completed successfully`);
    props.onStageComplete?.(stage, data);
  }, [announce, props.onStageComplete]);

  // Enhanced project completion handler
  const handleProjectComplete = useCallback((projectData: any) => {
    announce('Project design completed! All sections have been filled out.');
    props.onProjectComplete?.(projectData);
  }, [announce, props.onProjectComplete]);

  return (
    <div
      ref={chatRef}
      className={`chat-interface ${keyboardUser ? 'keyboard-user' : ''}`}
      role="application"
      aria-label="ALF Project Builder Chat Interface"
    >
      {/* Skip Navigation Links */}
      <a href="#chat-input" className="skip-link">
        Skip to chat input
      </a>
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>

      {/* Live Region for Screen Reader Announcements */}
      <div
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
        role="status"
      >
        {announcements.map((announcement, index) => (
          <span key={index}>{announcement}</span>
        ))}
      </div>

      {/* Main Chat Interface */}
      <main id="main-content" className="chat-container">
        <StreamlinedChatInterface
          {...props}
          onStageComplete={handleStageComplete}
          onProjectComplete={handleProjectComplete}
        />
      </main>

      {/* Keyboard Shortcuts Help (Hidden by Default) */}
      <div
        id="keyboard-shortcuts"
        className="sr-only"
        aria-hidden="true"
        tabIndex={-1}
      >
        <h2>Keyboard Shortcuts</h2>
        <ul>
          <li>Tab: Navigate between interactive elements</li>
          <li>Escape: Return focus to chat input</li>
          <li>Enter: Send message or activate button</li>
          <li>Ctrl+H (Cmd+H on Mac): Toggle help panel</li>
          <li>Shift+?: Show this help</li>
        </ul>
      </div>

      {/* Mobile Optimizations */}
      <style jsx>{`
        .chat-interface {
          /* Prevent horizontal scroll on mobile */
          overflow-x: hidden;
          /* Ensure full height on mobile */
          min-height: 100vh;
          min-height: 100dvh;
        }

        /* Enhanced focus indicators for keyboard users */
        .keyboard-user *:focus {
          outline: 3px solid #3b82f6;
          outline-offset: 2px;
        }

        /* Smooth scrolling for keyboard navigation */
        .chat-interface {
          scroll-behavior: smooth;
        }

        @media (prefers-reduced-motion: reduce) {
          .chat-interface {
            scroll-behavior: auto;
          }
        }

        /* Touch-friendly interactive elements */
        @media (hover: none) and (pointer: coarse) {
          button,
          [role="button"] {
            min-height: 44px;
            min-width: 44px;
          }
        }

        /* High contrast mode support */
        @media (prefers-contrast: high) {
          .chat-interface {
            border: 2px solid;
          }
        }

        /* Print optimizations */
        @media print {
          .skip-link,
          #keyboard-shortcuts {
            display: none;
          }
        }
      `}</style>
    </div>
  );
};

/**
 * Hook for managing chat accessibility features
 */
export const useChatAccessibility = () => {
  const [announcements, setAnnouncements] = useState<string[]>([]);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [highContrast, setHighContrast] = useState(false);

  useEffect(() => {
    // Detect user preferences
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const contrastQuery = window.matchMedia('(prefers-contrast: high)');

    setReducedMotion(motionQuery.matches);
    setHighContrast(contrastQuery.matches);

    const handleMotionChange = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    const handleContrastChange = (e: MediaQueryListEvent) => setHighContrast(e.matches);

    motionQuery.addListener(handleMotionChange);
    contrastQuery.addListener(handleContrastChange);

    return () => {
      motionQuery.removeListener(handleMotionChange);
      contrastQuery.removeListener(handleContrastChange);
    };
  }, []);

  const announce = useCallback((message: string, priority: 'polite' | 'assertive' = 'polite') => {
    setAnnouncements(prev => [...prev, message]);
    setTimeout(() => {
      setAnnouncements(prev => prev.slice(1));
    }, priority === 'assertive' ? 3000 : 1000);
  }, []);

  const focus = useCallback((selector: string) => {
    const element = document.querySelector(selector) as HTMLElement;
    if (element) {
      element.focus();
      element.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth', block: 'center' });
    }
  }, [reducedMotion]);

  return {
    announce,
    focus,
    announcements,
    preferences: {
      reducedMotion,
      highContrast
    }
  };
};

export default AccessibleChatWrapper;