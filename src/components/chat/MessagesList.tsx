import React from 'react';
import MessageRenderer from './MessageRenderer';

export interface ChatMessageItem {
  id: string | number;
  role: 'user' | 'assistant' | 'system';
  content: string;
  metadata?: { stage?: string };
}

class MessagesErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean }>{
  constructor(props: any) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() { return { hasError: true }; }
  componentDidCatch(error: any) { console.error('[MessagesList] render error', error); }
  render() {
    if (this.state.hasError) {
      return <div className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-md p-2">We had trouble showing some messages. You can continue typing.</div>;
    }
    return this.props.children;
  }
}

interface MessagesListProps {
  messages: ChatMessageItem[];
  onRefine?: (message: ChatMessageItem) => void;
  onPushDeeper?: (message: ChatMessageItem) => void;
  actionsDisabled?: boolean;
  latestAssistantId?: string | null;
}

export const MessagesList: React.FC<MessagesListProps> = ({ messages, onRefine, onPushDeeper, actionsDisabled, latestAssistantId }) => {
  return (
    <div className="w-full space-y-3">
      <MessagesErrorBoundary>
        {messages.map((m) => (
          <div key={m.id} className="space-y-3">
            {m.role === 'assistant' ? (
              <div className="flex items-start gap-4">
                <div className="flex-1 min-w-0">
                  <div className="squircle-card border border-slate-200/50 dark:border-slate-700/50 bg-white/95 dark:bg-gray-800/95 backdrop-blur-lg p-4 shadow-[0_8px_24px_rgba(15,23,42,0.08)] dark:shadow-[0_8px_24px_rgba(0,0,0,0.3)]">
                    <div className="mb-1 h-1.5 w-10 rounded-full bg-primary-100 dark:bg-primary-900/40" aria-hidden />
                    <MessageRenderer content={m.content} role="assistant" />
                  </div>
                  {(onRefine || onPushDeeper) && (!latestAssistantId || String(m.id) === latestAssistantId) && (
                    <div className="mt-1 flex flex-wrap items-center gap-2 text-[11px]">
                      {onRefine && (
                        <button
                          type="button"
                          onClick={() => onRefine(m)}
                          disabled={actionsDisabled}
                          title="Ask Alf Studio to sharpen this reply"
                          className="px-2 py-1 squircle-pure bg-gray-100/80 dark:bg-gray-700/80 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                        >
                          Sharpen reply
                        </button>
                      )}
                      {onPushDeeper && (
                        <button
                          type="button"
                          onClick={() => onPushDeeper(m)}
                          disabled={actionsDisabled}
                          title="Ask Alf Studio to push thinking further"
                          className="px-2 py-1 squircle-pure bg-gray-100/80 dark:bg-gray-700/80 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                        >
                          Push for more
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex justify-end">
                <div className="max-w-[80%] squircle-card border border-primary-200/50 bg-primary-50/90 text-primary-900 dark:border-primary-500/50 dark:bg-primary-900/40 backdrop-blur-lg px-4 py-3 shadow-[0_4px_12px_rgba(59,130,246,0.12)] dark:shadow-[0_4px_12px_rgba(59,130,246,0.2)]">
                  <MessageRenderer content={m.content} role="user" />
                </div>
              </div>
            )}
          </div>
        ))}
      </MessagesErrorBoundary>
    </div>
  );
};

export default MessagesList;
