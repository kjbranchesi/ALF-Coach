/**
 * MessageRenderer.security.test.tsx
 * 
 * Comprehensive security and functionality tests for MessageRenderer
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MessageRenderer } from '../MessageRenderer';

describe('MessageRenderer Security Tests', () => {
  
  describe('XSS Prevention', () => {
    it('should sanitize script tags', () => {
      const maliciousContent = 'Hello <script>alert("XSS")</script> world';
      render(<MessageRenderer content={maliciousContent} role="assistant" />);
      
      // Script should be removed or neutralized
      expect(screen.queryByText(/alert/)).not.toBeInTheDocument();
    });
    
    it('should sanitize event handlers', () => {
      const maliciousContent = '<img src="x" onerror="alert(\'XSS\')" alt="test" />';
      render(<MessageRenderer content={maliciousContent} role="assistant" />);
      
      // Event handler should be removed
      const img = screen.queryByAltText('test');
      expect(img).not.toHaveAttribute('onerror');
    });
    
    it('should sanitize javascript: URLs', () => {
      const maliciousContent = '[Click me](javascript:alert("XSS"))';
      render(<MessageRenderer content={maliciousContent} role="assistant" />);
      
      // Link should be neutralized
      expect(screen.queryByText('Click me')).toBeInTheDocument();
      const link = screen.queryByRole('link');
      expect(link).not.toHaveAttribute('href', expect.stringContaining('javascript:'));
    });
    
    it('should handle iframe injection attempts', () => {
      const maliciousContent = '<iframe src="javascript:alert(\'XSS\')"></iframe>';
      render(<MessageRenderer content={maliciousContent} role="assistant" />);
      
      // Iframe should be removed
      expect(screen.queryByRole('application')).not.toBeInTheDocument();
    });
  });
  
  describe('Content Length Limits', () => {
    it('should truncate extremely long content', () => {
      const longContent = 'A'.repeat(60000); // Exceeds MAX_CONTENT_LENGTH
      render(<MessageRenderer content={longContent} role="assistant" />);
      
      // Should show truncation message
      expect(screen.getByText(/Content truncated for length/)).toBeInTheDocument();
    });
    
    it('should truncate long code blocks', () => {
      const longCode = '```javascript\n' + 'console.log("test");\n'.repeat(1000) + '```';
      render(<MessageRenderer content={longCode} role="assistant" />);
      
      // Should show truncation message in code
      expect(screen.getByText(/Code truncated for length/)).toBeInTheDocument();
    });
  });
  
  describe('URL Validation', () => {
    it('should allow safe HTTPS URLs', () => {
      const safeContent = '[Safe Link](https://example.com)';
      render(<MessageRenderer content={safeContent} role="assistant" />);
      
      const link = screen.getByRole('link');
      expect(link).toHaveAttribute('href', 'https://example.com');
    });
    
    it('should block file: URLs', () => {
      const unsafeContent = '[File Link](file:///etc/passwd)';
      render(<MessageRenderer content={unsafeContent} role="assistant" />);
      
      // Should show invalid link placeholder
      expect(screen.getByText('[Invalid link]')).toBeInTheDocument();
    });
    
    it('should block data: URLs (except images)', () => {
      const unsafeContent = '[Data Link](data:text/html,<script>alert(1)</script>)';
      render(<MessageRenderer content={unsafeContent} role="assistant" />);
      
      // Should show invalid link placeholder
      expect(screen.getByText('[Invalid link]')).toBeInTheDocument();
    });
  });
  
  describe('Link Security Attributes', () => {
    it('should add proper security attributes to external links', () => {
      const content = '[External Link](https://example.com)';
      render(<MessageRenderer content={content} role="assistant" />);
      
      const link = screen.getByRole('link');
      expect(link).toHaveAttribute('target', '_blank');
      expect(link).toHaveAttribute('rel', 'noopener noreferrer nofollow');
    });
  });
  
  describe('Performance and Accessibility', () => {
    it('should handle empty content gracefully', () => {
      render(<MessageRenderer content="" role="assistant" />);
      expect(screen.getByText('No content')).toBeInTheDocument();
    });
    
    it('should add proper ARIA attributes', () => {
      const content = 'Test message';
      render(<MessageRenderer content={content} role="assistant" />);
      
      const messageContainer = screen.getByRole('region');
      expect(messageContainer).toHaveAttribute('aria-label', 'assistant message');
    });
    
    it('should handle user messages without markdown processing', () => {
      const userContent = '**This should not be bold**';
      render(<MessageRenderer content={userContent} role="user" />);
      
      // User content should be plain text
      expect(screen.getByText('**This should not be bold**')).toBeInTheDocument();
    });
  });
  
  describe('Markdown Features', () => {
    it('should render headers correctly', () => {
      const content = '# Heading 1\n## Heading 2';
      render(<MessageRenderer content={content} role="assistant" />);
      
      expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Heading 1');
      expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('Heading 2');
    });
    
    it('should render code blocks with syntax highlighting', () => {
      const content = '```javascript\nconst x = 1;\n```';
      render(<MessageRenderer content={content} role="assistant" />);
      
      // Should find code element with JavaScript content
      expect(screen.getByText('const x = 1;')).toBeInTheDocument();
    });
    
    it('should render lists correctly', () => {
      const content = '- Item 1\n- Item 2\n- Item 3';
      render(<MessageRenderer content={content} role="assistant" />);
      
      const list = screen.getByRole('list');
      expect(list).toBeInTheDocument();
      expect(screen.getAllByRole('listitem')).toHaveLength(3);
    });
    
    it('should render tables correctly', () => {
      const content = '| Col 1 | Col 2 |\n|-------|-------|\n| Val 1 | Val 2 |';
      render(<MessageRenderer content={content} role="assistant" />);
      
      const table = screen.getByRole('table');
      expect(table).toBeInTheDocument();
    });
    
    it('should render blockquotes correctly', () => {
      const content = '> This is a blockquote';
      render(<MessageRenderer content={content} role="assistant" />);
      
      expect(screen.getByText('This is a blockquote')).toBeInTheDocument();
    });
  });
  
  describe('Error Handling', () => {
    it('should handle null content', () => {
      render(<MessageRenderer content={null as any} role="assistant" />);
      expect(screen.getByText('No content')).toBeInTheDocument();
    });
    
    it('should handle undefined content', () => {
      render(<MessageRenderer content={undefined as any} role="assistant" />);
      expect(screen.getByText('No content')).toBeInTheDocument();
    });
    
    it('should handle malformed markdown gracefully', () => {
      const malformedContent = '**unclosed bold\n# incomplete header\n```\nunclosed code block';
      render(<MessageRenderer content={malformedContent} role="assistant" />);
      
      // Should render something, even if not perfectly formatted
      expect(screen.getByRole('region')).toBeInTheDocument();
    });
  });
});

describe('MessageRenderer Integration Tests', () => {
  it('should handle typical AI response content', () => {
    const aiResponse = `# Project Planning Guide

Here's a comprehensive approach:

## Key Steps
1. **Define objectives** - What do you want to achieve?
2. **Identify resources** - What tools and materials do you need?
3. **Create timeline** - When will each phase be completed?

### Code Example
\`\`\`javascript
const project = {
  name: "Learning Management System",
  duration: "12 weeks",
  team: ["developer", "designer", "educator"]
};
\`\`\`

For more information, visit [our documentation](https://example.com/docs).

> Remember: Good planning prevents poor performance!`;

    render(<MessageRenderer content={aiResponse} role="assistant" />);
    
    // Verify various elements are rendered
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Project Planning Guide');
    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('Key Steps');
    expect(screen.getByRole('list')).toBeInTheDocument();
    expect(screen.getByText('const project = {')).toBeInTheDocument();
    expect(screen.getByRole('link')).toHaveAttribute('href', 'https://example.com/docs');
    expect(screen.getByText(/Good planning prevents poor performance/)).toBeInTheDocument();
  });
};