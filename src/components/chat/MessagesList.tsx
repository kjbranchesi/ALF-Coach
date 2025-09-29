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
}

export const MessagesList: React.FC<MessagesListProps> = ({ messages }) => {
  return (
    <div className="w-full space-y-3">
      <MessagesErrorBoundary>
        {messages.map((m) => (
          <div key={m.id} className="space-y-3">
            {m.role === 'assistant' ? (
              <div className="flex items-start gap-4">
                <div className="flex-1 min-w-0">
                  <div className="rounded-xl border border-gray-200/60 dark:border-gray-700/60 bg-white/90 dark:bg-gray-800/90 backdrop-blur-md p-3">
                    <MessageRenderer content={m.content} role="assistant" />
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex justify-end">
                <div className="max-w-[85%] rounded-xl border border-gray-200/60 dark:border-gray-700/60 bg-white/80 dark:bg-gray-800/80 backdrop-blur-md p-3">
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

