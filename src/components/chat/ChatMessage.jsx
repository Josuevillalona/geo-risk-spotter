import React from 'react';
import ReactMarkdown from 'react-markdown';
import markdownComponents from './MarkdownComponents';

/**
 * ChatMessage: Renders individual chat messages with role-based styling.
 * Supports user, system (including error states), and assistant messages with markdown.
 * 
 * @param {Object} message - Message object with role and content
 * @param {number} index - Message index for React key
 */
const ChatMessage = ({ message, index }) => {
  const baseMessageStyle = {
    marginBottom: '1rem',
    padding: '1rem',
    borderRadius: '0.75rem',
    maxWidth: '85%',
    fontSize: '0.875rem',
    lineHeight: '1.6'
  };
  
  if (message.role === 'user') {
    return (
      <div key={index} style={{
        ...baseMessageStyle,
        backgroundColor: '#eff6ff',
        border: '1px solid #bfdbfe',
        marginLeft: 'auto',
        textAlign: 'left'
      }}>
        <div style={{
          fontWeight: '500',
          color: '#1e40af'
        }}>
          {message.content}
        </div>
      </div>
    );
  }
  
  if (message.role === 'system') {
    const isError = message.content.includes('error') || 
                   message.content.includes('trouble') || 
                   message.content.includes('unable');
    return (
      <div key={index} style={{
        ...baseMessageStyle,
        backgroundColor: isError ? '#fef2f2' : '#f0fdf4',
        border: isError ? '1px solid #fecaca' : '1px solid #bbf7d0',
        color: isError ? '#dc2626' : '#166534',
        marginRight: 'auto',
        textAlign: 'left'
      }}>
        <div style={{
          fontWeight: '500',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
          {isError ? '⚠️' : '💡'} {message.content}
        </div>
      </div>
    );
  }
  
  // Assistant messages with markdown rendering
  return (
    <div key={index} style={{
      ...baseMessageStyle,
      backgroundColor: '#f9fafb',
      border: '1px solid #e5e7eb',
      marginRight: 'auto',
      boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
      textAlign: 'left'
    }}>
      <div style={{ maxWidth: 'none' }}>
        <ReactMarkdown components={markdownComponents}>
          {message.content}
        </ReactMarkdown>
      </div>
    </div>
  );
};

export default ChatMessage;
