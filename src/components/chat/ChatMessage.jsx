import React from 'react';
import ReactMarkdown from 'react-markdown';
import markdownComponents from './MarkdownComponents';

/**
 * ChatMessage: Renders individual chat messages with role-based styling.
 * Supports user, system (including error states), and assistant messages with markdown.
 * Enhanced mode adds context awareness and intent indicators.
 * 
 * @param {Object} message - Message object with role and content
 * @param {number} index - Message index for React key
 * @param {boolean} enhanced - Whether to use enhanced styling and features
 */
const ChatMessage = ({ message, index, enhanced = false }) => {
  const baseMessageStyle = {
    marginBottom: '1rem',
    padding: enhanced ? '1.25rem' : '1rem',
    borderRadius: enhanced ? '12px' : '0.75rem',
    maxWidth: enhanced ? '90%' : '85%',
    fontSize: '0.875rem',
    lineHeight: '1.6'
  };
  
  if (message.role === 'user') {
    return (
      <div key={index} style={{
        ...baseMessageStyle,
        backgroundColor: enhanced ? '#f0f9ff' : '#eff6ff',
        border: enhanced ? '1px solid #93c5fd' : '1px solid #bfdbfe',
        marginLeft: 'auto',
        textAlign: 'left',
        boxShadow: enhanced ? '0 1px 3px rgba(0, 0, 0, 0.1)' : 'none'
      }}>
        {enhanced && message.context && (
          <div style={{
            fontSize: '0.75rem',
            color: '#6b7280',
            marginBottom: '0.5rem',
            fontWeight: '500'
          }}>
            {message.context.viewMode === 'borough' ? '🏢 Borough Query' : '📍 Area Query'}
          </div>
        )}
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
