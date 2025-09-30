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
                  <div className="rounded-2xl border border-gray-200/60 dark:border-gray-700/60 bg-white dark:bg-gray-800/95 backdrop-blur-md p-4 shadow-sm">
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
                          className="px-2 py-1 rounded-md bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
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
                          className="px-2 py-1 rounded-md bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
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
                <div className="max-w-[80%] rounded-2xl border border-primary-100 bg-primary-50/80 text-primary-900 dark:border-primary-500/40 dark:bg-primary-900/30 backdrop-blur-md px-4 py-3">
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
