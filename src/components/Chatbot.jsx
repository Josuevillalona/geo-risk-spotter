import { useState } from 'react';
import { create } from 'zustand';
import ChatMessage from './chat/ChatMessage';
import EnhancedChatbot from './chat/EnhancedChatbot';
import { useAppStore } from '../store';

// API endpoints
const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://geo-risk-spotter.onrender.com' 
  : 'http://localhost:8000';

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

const Chatbot = ({ selectedArea, enhanced = false }) => {
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { messages, addMessage, clearMessages } = useChatStore();
  
  // Get context for enhanced mode detection
  const { viewMode, selectedBorough } = useAppStore();
  
  // Auto-enable enhanced mode for borough context
  const shouldUseEnhanced = enhanced || viewMode === 'borough' || selectedBorough !== 'All';

  // If enhanced mode, use the new component
  if (shouldUseEnhanced) {
    return (
      <EnhancedChatbot
        selectedArea={selectedArea}
        messages={messages}
        onAddMessage={addMessage}
        onClearMessages={clearMessages}
      />
    );
  }

  // Original chatbot logic for basic mode
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
        {messages.map((message, index) => (
          <ChatMessage key={index} message={message} index={index} />
        ))}
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
            🎯 Recommend Interventions
          </button>
          <button 
            type="button" 
            className="quick-action-button"
            onClick={() => handleQuickAction("What can people do at an individual level to reduce diabetes risk?")}
            disabled={isLoading}
          >
            💪 Personal Prevention
          </button>
          <button 
            type="button" 
            className="quick-action-button"
            onClick={() => handleQuickAction("What are the main health risk factors in this area?")}
            disabled={isLoading}
          >
            📊 Risk Factor Analysis
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
