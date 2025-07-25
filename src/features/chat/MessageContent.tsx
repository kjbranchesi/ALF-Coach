import React from 'react';

interface MessageContentProps {
  content: string;
  className?: string;
}

export const MessageContent: React.FC<MessageContentProps> = ({ content, className = '' }) => {
  // Function to parse and render formatted content
  const renderFormattedContent = (text: string) => {
    // Split content by newlines to handle paragraphs
    const lines = text.split('\n');
    
    return lines.map((line, lineIndex) => {
      if (!line.trim()) {
        return <div key={lineIndex} className="h-4" />; // Empty line spacing
      }
      
      // Check for headers
      if (line.startsWith('### ')) {
        return (
          <h3 key={lineIndex} className="text-lg font-bold text-gray-900 dark:text-gray-100 mt-4 mb-2">
            {line.substring(4)}
          </h3>
        );
      }
      if (line.startsWith('## ')) {
        return (
          <h2 key={lineIndex} className="text-xl font-bold text-gray-900 dark:text-gray-100 mt-4 mb-3">
            {line.substring(3)}
          </h2>
        );
      }
      if (line.startsWith('# ')) {
        return (
          <h1 key={lineIndex} className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-4 mb-3">
            {line.substring(2)}
          </h1>
        );
      }
      
      // Check for bullet points
      if (line.trim().startsWith('• ') || line.trim().startsWith('- ') || line.trim().startsWith('* ')) {
        return (
          <div key={lineIndex} className="flex gap-2 ml-4 mb-1">
            <span className="text-purple-600 dark:text-purple-400 font-bold">•</span>
            <span>{formatInlineElements(line.substring(line.indexOf(' ') + 1))}</span>
          </div>
        );
      }
      
      // Regular paragraph
      return (
        <p key={lineIndex} className="mb-2 leading-relaxed">
          {formatInlineElements(line)}
        </p>
      );
    });
  };
  
  // Function to handle inline formatting (bold, italic, etc.)
  const formatInlineElements = (text: string) => {
    const elements: React.ReactNode[] = [];
    let currentIndex = 0;
    
    // Pattern to match **bold**, *italic*, and `code`
    const pattern = /(\*\*[^*]+\*\*)|(\*[^*]+\*)|(`[^`]+`)/g;
    let match;
    
    while ((match = pattern.exec(text)) !== null) {
      // Add text before the match
      if (match.index > currentIndex) {
        elements.push(text.substring(currentIndex, match.index));
      }
      
      const matchedText = match[0];
      
      // Handle bold
      if (matchedText.startsWith('**') && matchedText.endsWith('**')) {
        elements.push(
          <strong key={match.index} className="font-bold">
            {matchedText.slice(2, -2)}
          </strong>
        );
      }
      // Handle italic
      else if (matchedText.startsWith('*') && matchedText.endsWith('*')) {
        elements.push(
          <em key={match.index} className="italic">
            {matchedText.slice(1, -1)}
          </em>
        );
      }
      // Handle code
      else if (matchedText.startsWith('`') && matchedText.endsWith('`')) {
        elements.push(
          <code key={match.index} className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-800 text-purple-700 dark:text-purple-400 rounded text-sm font-mono">
            {matchedText.slice(1, -1)}
          </code>
        );
      }
      
      currentIndex = match.index + matchedText.length;
    }
    
    // Add remaining text
    if (currentIndex < text.length) {
      elements.push(text.substring(currentIndex));
    }
    
    return elements.length > 0 ? elements : text;
  };
  
  return (
    <div className={`prose-container ${className}`}>
      {renderFormattedContent(content)}
    </div>
  );
};