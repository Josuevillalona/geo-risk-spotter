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
  const { messages, addMessage, clearMessages } = useChatStore();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    // Add user message to chat
    const userMessage = { role: 'user', content: input };
    addMessage(userMessage);
    setInput('');

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },      body: JSON.stringify({
          message: input,
          messages: messages, // Send conversation history for context
          selected_area: selectedArea?.properties, // Include selected area data if available
        }),
      });

      if (!response.ok) throw new Error('Failed to get response');

      const data = await response.json();
      
      // Add AI response to chat
      addMessage({ role: 'assistant', content: data.response });
    } catch (error) {
      console.error('Chat error:', error);
      addMessage({
        role: 'system',
        content: 'Sorry, I had trouble processing your message. Please try again.',
      });
    }
  };
  return (
    <div className="chatbot-container">
      <div className="chat-header">
        <button 
          onClick={clearMessages}
          className="clear-chat-button"
          type="button"
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
      </div>      <div className="chat-controls">
        <div className="quick-actions">
          <button 
            type="button" 
            className="quick-action-button"
            onClick={() => {
              setInput("What are some intervention ideas for this area?");
              handleSubmit({ preventDefault: () => {} });
            }}
          >
            Intervention ideas
          </button>
          <button 
            type="button" 
            className="quick-action-button"
            onClick={() => {
              setInput("What can people do at an individual level to reduce diabetes risk?");
              handleSubmit({ preventDefault: () => {} });
            }}
          >
            Individual actions
          </button>
          <button 
            type="button" 
            className="quick-action-button"
            onClick={() => {
              setInput("What are the main risk factors in this area?");
              handleSubmit({ preventDefault: () => {} });
            }}
          >
            Risk factors
          </button>
        </div>
        <form onSubmit={handleSubmit} className="chat-input-form">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about diabetes risk factors..."
            className="chat-input"
          />
          <button type="submit" className="chat-send-button">
            Send
          </button>
        </form>
      </div>
    </div>
  );
};

export default Chatbot;
