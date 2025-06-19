import { useState } from 'react';
import { create } from 'zustand';

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
        content: 'Ask me anything about this area\'s health data!'
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
      const response = await fetch('https://geo-risk-spotter.vercel.app/api/chat', {
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
      
      if (!navigator.onLine || error.message.includes('Failed to fetch')) {
        errorMessage = 'Unable to connect to the server. Please check your internet connection and try again.';
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
        {messages.map((msg, idx) => (
          <div key={idx} className={`message ${msg.role}`}>
            {msg.content}
          </div>
        ))}
        {isLoading && (
          <div className="message system loading">
            Thinking...
          </div>
        )}
      </div>
      <div className="chat-controls">
        <div className="quick-actions">
          <button 
            type="button" 
            className="quick-action-button"
            onClick={() => handleQuickAction("What are some intervention ideas for this area?")}
            disabled={isLoading}
          >
            Intervention ideas
          </button>
          <button 
            type="button" 
            className="quick-action-button"
            onClick={() => handleQuickAction("What can people do at an individual level to reduce diabetes risk?")}
            disabled={isLoading}
          >
            Diabetes prevention
          </button>
        </div>
        <form onSubmit={handleSubmit} className="chat-input-form">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your question..."
            disabled={isLoading}
          />
          <button type="submit" disabled={isLoading || !input.trim()}>
            Send
          </button>
        </form>
      </div>
    </div>
  );
};

export default Chatbot;
