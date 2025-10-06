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
      return <div className="text-[13px] text-amber-700 bg-amber-50 border border-amber-200 rounded-md p-2">We had trouble showing some messages. You can continue typing.</div>;
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
    <div className="w-full space-y-2.5">
      <MessagesErrorBoundary>
        {messages.map((m) => (
          <div key={m.id} className="space-y-2.5">
            {m.role === 'assistant' ? (
              <div className="flex items-start gap-3">
                <div className="flex-1 min-w-0">
                  <div className="squircle-card border border-slate-200/50 dark:border-slate-700/60 bg-white/95 dark:bg-slate-900/92 backdrop-blur-lg p-3 shadow-[0_4px_16px_rgba(15,23,42,0.06)] dark:shadow-[0_8px_20px_rgba(0,0,0,0.3)]">
                    <div className="mb-1 h-1 w-8 rounded-full bg-primary-100 dark:bg-primary-900/40" aria-hidden />
                    <MessageRenderer content={m.content} role="assistant" />
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex justify-end">
                <div className="max-w-[80%] squircle-card border border-primary-200/50 bg-primary-50/90 text-primary-900 dark:border-primary-400/50 dark:bg-primary-600/90 dark:text-primary-50 backdrop-blur-lg px-3 py-2 shadow-[0_2px_8px_rgba(59,130,246,0.1)] dark:shadow-[0_2px_8px_rgba(59,130,246,0.25)]">
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
