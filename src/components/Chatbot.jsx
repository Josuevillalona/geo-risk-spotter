import { useState } from 'react';
import { create } from 'zustand';
import ReactMarkdown from 'react-markdown';

// API endpoints
const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://geo-risk-spotter.onrender.com' 
  : 'http://localhost:8000';

// Custom markdown components for better styling
const markdownComponents = {
  h1: ({ children }) => (
    <h1 style={{
      fontSize: '1.25rem',
      fontWeight: '700',
      color: '#1f2937',
      marginTop: '1rem',
      marginBottom: '0.75rem'
    }}>
      {children}
    </h1>
  ),
  h2: ({ children }) => (
    <h2 style={{
      fontSize: '1.125rem',
      fontWeight: '600',
      color: '#1f2937',
      marginTop: '1rem',
      marginBottom: '0.5rem'
    }}>
      {children}
    </h2>
  ),
  h3: ({ children }) => (
    <h3 style={{
      fontSize: '1.125rem',
      fontWeight: '600',
      color: '#1f2937',
      marginTop: '1rem',
      marginBottom: '0.5rem'
    }}>
      {children}
    </h3>
  ),
  h4: ({ children }) => (
    <h4 style={{
      fontSize: '1rem',
      fontWeight: '600',
      color: '#1f2937',
      marginTop: '0.75rem',
      marginBottom: '0.5rem'
    }}>
      {children}
    </h4>
  ),
  h5: ({ children }) => (
    <h5 style={{
      fontSize: '0.875rem',
      fontWeight: '600',
      color: '#1f2937',
      marginTop: '0.5rem',
      marginBottom: '0.25rem'
    }}>
      {children}
    </h5>
  ),
  h6: ({ children }) => (
    <h6 style={{
      fontSize: '0.875rem',
      fontWeight: '500',
      color: '#374151',
      marginTop: '0.5rem',
      marginBottom: '0.25rem'
    }}>
      {children}
    </h6>
  ),
  p: ({ children }) => (
    <p style={{
      marginBottom: '0.75rem',
      color: '#374151',
      lineHeight: '1.6'
    }}>
      {children}
    </p>
  ),
  ul: ({ children }) => (
    <ul style={{
      marginBottom: '0.75rem',
      paddingLeft: '1rem'
    }}>
      {children}
    </ul>
  ),
  ol: ({ children }) => (
    <ol style={{
      marginBottom: '0.75rem',
      paddingLeft: '1rem',
      listStyleType: 'decimal'
    }}>
      {children}
    </ol>
  ),
  li: ({ children }) => (
    <li style={{
      color: '#374151',
      lineHeight: '1.6',
      display: 'flex',
      alignItems: 'flex-start',
      marginBottom: '0.5rem',
      listStyle: 'none'
    }}>
      <span style={{
        display: 'inline-block',
        width: '6px',
        height: '6px',
        backgroundColor: '#2E8B57',
        borderRadius: '50%',
        marginRight: '0.75rem',
        marginTop: '0.6rem',
        flexShrink: 0
      }}></span>
      <span style={{ flex: 1 }}>{children}</span>
    </li>
  ),
  strong: ({ children }) => (
    <strong style={{
      fontWeight: '600',
      color: '#111827'
    }}>
      {children}
    </strong>
  ),
  em: ({ children }) => (
    <em style={{
      fontStyle: 'italic',
      color: '#374151'
    }}>
      {children}
    </em>
  ),
  blockquote: ({ children }) => (
    <blockquote style={{
      borderLeft: '4px solid #d1fae5',
      paddingLeft: '1rem',
      paddingTop: '0.5rem',
      paddingBottom: '0.5rem',
      margin: '0.75rem 0',
      backgroundColor: '#f0fdf4',
      borderRadius: '0 0.5rem 0.5rem 0'
    }}>
      {children}
    </blockquote>
  ),
  code: ({ children, inline }) => {
    if (inline) {
      return (
        <code style={{
          backgroundColor: '#f3f4f6',
          color: '#374151',
          padding: '0.125rem 0.25rem',
          borderRadius: '0.25rem',
          fontSize: '0.875rem',
          fontFamily: 'monospace'
        }}>
          {children}
        </code>
      );
    }
    return (
      <pre style={{
        backgroundColor: '#f3f4f6',
        padding: '0.75rem',
        borderRadius: '0.5rem',
        margin: '0.75rem 0',
        overflowX: 'auto'
      }}>
        <code style={{
          fontSize: '0.875rem',
          fontFamily: 'monospace',
          color: '#374151'
        }}>
          {children}
        </code>
      </pre>
    );
  }
};

// Zustand store for chat state
const useChatStore = create((set) => ({
  messages: [
    {
      role: 'system',
      content: 'Ask me anything about this area\'s health data!'
    }
  ],
  addMessage: (message) => set((state) => ({
    messages: [...state.messages, message]
  })),
  clearMessages: () => set({ 
    messages: [
      {
        role: 'system',
        content: 'Let\'s explore this area\'s health data!'
      }
    ] 
  }),
}));

const Chatbot = ({ selectedArea }) => {
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { messages, addMessage, clearMessages } = useChatStore();

  const sendMessage = async (messageText) => {
    if (!messageText.trim()) return;
    
    setIsLoading(true);
    addMessage({ role: 'user', content: messageText });

    try {
      if (!navigator.onLine) {
        throw new Error('offline');
      }

      const response = await fetch(`${API_BASE_URL}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: messageText,
          messages: messages,
          selected_area: selectedArea?.properties,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      addMessage({ role: 'assistant', content: data.response });
    } catch (error) {
      console.error('Chat error:', error);
      let errorMessage = 'Sorry, I had trouble processing your message. ';
      
      if (error.message === 'offline' || !navigator.onLine) {
        errorMessage = 'Unable to connect to the server. Please check your internet connection and try again.';
      } else if (error.message.includes('HTTP error! status: 404')) {
        errorMessage = 'Chat service is currently unavailable. Please try again later.';
      } else if (error.message.includes('HTTP error')) {
        errorMessage = 'The server encountered an error. Please try again later.';
      }
      
      addMessage({
        role: 'system',
        content: errorMessage
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (input.trim()) {
      await sendMessage(input);
      setInput('');
    }
  };

  const handleQuickAction = async (question) => {
    if (!isLoading) {
      setInput(question);
      await sendMessage(question);
    }
  };

  const renderMessage = (msg, idx) => {
    const baseMessageStyle = {
      marginBottom: '1rem',
      padding: '1rem',
      borderRadius: '0.75rem',
      maxWidth: '85%',
      fontSize: '0.875rem',
      lineHeight: '1.6'
    };
    
    if (msg.role === 'user') {
      return (
        <div key={idx} style={{
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
            {msg.content}
          </div>
        </div>
      );
    }
    
    if (msg.role === 'system') {
      const isError = msg.content.includes('error') || msg.content.includes('trouble') || msg.content.includes('unable');
      return (
        <div key={idx} style={{
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
            {isError ? '⚠️' : '💡'} {msg.content}
          </div>
        </div>
      );
    }
    
    // Assistant messages with markdown rendering
    return (
      <div key={idx} style={{
        ...baseMessageStyle,
        backgroundColor: '#f9fafb',
        border: '1px solid #e5e7eb',
        marginRight: 'auto',
        boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
        textAlign: 'left'
      }}>
        <div style={{ maxWidth: 'none' }}>
          <ReactMarkdown components={markdownComponents}>
            {msg.content}
          </ReactMarkdown>
        </div>
      </div>
    );
  };

  return (
    <div className="chatbot-container">
      <div className="chat-header">
        <button 
          onClick={clearMessages}
          className="clear-chat-button"
          type="button"
          disabled={isLoading}
        >
          Clear Chat
        </button>
      </div>
      <div className="chat-messages">
        {messages.map(renderMessage)}
        {isLoading && (
          <div style={{
            marginBottom: '1rem',
            padding: '1rem',
            borderRadius: '0.75rem',
            maxWidth: '85%',
            backgroundColor: '#eff6ff',
            border: '1px solid #bfdbfe',
            marginRight: 'auto'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              color: '#1d4ed8'
            }}>
              <div style={{
                width: '1rem',
                height: '1rem',
                border: '2px solid #bfdbfe',
                borderTopColor: '#2563eb',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite'
              }}></div>
              <span style={{ fontWeight: '500' }}>Analyzing...</span>
            </div>
          </div>
        )}
      </div>
      <div className="chat-controls">
        <div className="quick-actions">
          <button 
            type="button" 
            className="quick-action-button"
            onClick={() => handleQuickAction("What intervention programs would work best for this area based on the health risks?")}
            disabled={isLoading}
          >
            🎯 Get Interventions
          </button>
          <button 
            type="button" 
            className="quick-action-button"
            onClick={() => handleQuickAction("What can people do at an individual level to reduce diabetes risk?")}
            disabled={isLoading}
          >
            💪 Diabetes Prevention
          </button>
          <button 
            type="button" 
            className="quick-action-button"
            onClick={() => handleQuickAction("What are the main health risk factors in this area?")}
            disabled={isLoading}
          >
            📊 Risk Analysis
          </button>
        </div>        <form onSubmit={handleSubmit} className="chat-input-form">
          <input
            type="text"
            className="chat-input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about health data, interventions, or prevention strategies..."
            disabled={isLoading}
          />
          <button 
            type="submit" 
            className="chat-send-button" 
            disabled={isLoading || !input.trim()}
          >
            {isLoading ? 'Sending...' : 'Send'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Chatbot;
