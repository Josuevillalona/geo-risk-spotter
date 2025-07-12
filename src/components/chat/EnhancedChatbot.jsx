import React, { useState, useCallback, useMemo } from 'react';
import { useAppStore } from '../../store';
import { enhanceQueryWithContext, getApiEndpoint, expandQueryWithContext } from '../../services/chatService';
import ChatMessage from './ChatMessage';
import SmartQuerySuggestions from './SmartQuerySuggestions';
import { MdSend, MdClear, MdAutoAwesome } from 'react-icons/md';

const EnhancedChatbot = ({ selectedArea, messages, onAddMessage, onClearMessages }) => {
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(true);
  
  // Get context from store for borough-aware queries
  const { viewMode, selectedBorough, boroughData } = useAppStore();

  // Create context object for enhanced queries
  const chatContext = useMemo(() => ({
    viewMode,
    selectedBorough,
    selectedArea,
    boroughData
  }), [viewMode, selectedBorough, selectedArea, boroughData]);

  // Enhanced message sending with context awareness
  const sendMessage = useCallback(async (messageText) => {
    if (!messageText.trim()) return;
    
    setIsLoading(true);
    setShowSuggestions(false);
    
    // Add user message
    onAddMessage({ role: 'user', content: messageText });

    try {
      if (!navigator.onLine) {
        throw new Error('offline');
      }

      // Enhance query with context
      const enhancedQuery = enhanceQueryWithContext(messageText, chatContext);
      const apiEndpoint = getApiEndpoint(enhancedQuery);
      const expandedQuery = expandQueryWithContext(messageText, chatContext);

      console.log('Enhanced Query Context:', enhancedQuery);

      const requestBody = {
        message: expandedQuery,
        originalMessage: messageText,
        enhancedContext: enhancedQuery,
        messages: messages,
        selected_area: selectedArea?.properties,
        context: {
          viewMode,
          selectedBorough,
          boroughContext: enhancedQuery.boroughContext
        }
      };

      const response = await fetch(apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      // Add AI response with enhanced formatting
      onAddMessage({ 
        role: 'assistant', 
        content: data.response,
        context: enhancedQuery.context,
        intent: enhancedQuery.intent
      });

    } catch (error) {
      console.error('Enhanced chat error:', error);
      
      let errorMessage = 'Sorry, I had trouble processing your message. ';
      
      if (error.message === 'offline' || !navigator.onLine) {
        errorMessage = 'Unable to connect to the server. Please check your internet connection and try again.';
      } else if (error.message.includes('HTTP error! status: 404')) {
        errorMessage = 'Enhanced chat service is currently unavailable. Falling back to basic chat.';
      } else if (error.message.includes('HTTP error! status: 422')) {
        errorMessage = 'I\'m having trouble understanding your query. Could you try rephrasing it?';
      } else if (error.message.includes('HTTP error')) {
        errorMessage = 'The server encountered an error. Please try again later.';
      }
      
      onAddMessage({
        role: 'system',
        content: errorMessage
      });
    } finally {
      setIsLoading(false);
    }
  }, [messages, onAddMessage, selectedArea, chatContext, viewMode, selectedBorough]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (input.trim()) {
      await sendMessage(input);
      setInput('');
    }
  };

  const handleSuggestionSelect = useCallback(async (suggestion) => {
    if (!isLoading) {
      setInput(suggestion);
      await sendMessage(suggestion);
      setInput('');
    }
  }, [isLoading, sendMessage]);

  const handleClearChat = useCallback(() => {
    onClearMessages();
    setShowSuggestions(true);
    setInput('');
  }, [onClearMessages]);

  // Context-aware placeholder text
  const getPlaceholderText = () => {
    if (viewMode === 'borough' && selectedArea?.properties?.borough) {
      return `Ask about ${selectedArea.properties.borough} borough...`;
    } else if (selectedBorough !== 'All') {
      return `Ask about ${selectedBorough} borough...`;
    } else if (selectedArea?.properties) {
      return 'Ask about this area\'s health data...';
    }
    return 'Ask about NYC health data, compare boroughs, or find insights...';
  };

  return (
    <div className="enhanced-chatbot">
      {/* Enhanced Chat Header */}
      <div className="enhanced-chat-header">
        <div className="chat-title">
          <MdAutoAwesome className="chat-icon" />
          <span>AI Health Assistant</span>
          {chatContext.viewMode === 'borough' && (
            <span className="context-badge">Borough Mode</span>
          )}
        </div>
        <button 
          onClick={handleClearChat}
          className="clear-chat-btn"
          type="button"
          disabled={isLoading}
          title="Clear conversation"
        >
          <MdClear />
          <span>Clear</span>
        </button>
      </div>

      {/* Smart Suggestions (shown when no messages or conversation is short) */}
      {showSuggestions && messages.length <= 2 && (
        <SmartQuerySuggestions 
          onQuerySelect={handleSuggestionSelect}
          isLoading={isLoading}
        />
      )}

      {/* Chat Messages */}
      <div className="enhanced-chat-messages">
        {messages.map((message, index) => (
          <ChatMessage 
            key={index} 
            message={message} 
            index={index}
            enhanced={true}
          />
        ))}
        
        {isLoading && (
          <div className="ai-thinking">
            <div className="thinking-animation">
              <div className="thinking-dots">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
            <span className="thinking-text">
              {chatContext.viewMode === 'borough' 
                ? 'Analyzing borough data...' 
                : 'Processing your query...'}
            </span>
          </div>
        )}
      </div>

      {/* Enhanced Input Form */}
      <form onSubmit={handleSubmit} className="enhanced-chat-form">
        <div className="chat-input-wrapper">
          <input
            type="text"
            className="enhanced-chat-input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={getPlaceholderText()}
            disabled={isLoading}
          />
          <button 
            type="submit" 
            className="enhanced-send-btn" 
            disabled={isLoading || !input.trim()}
            title="Send message"
          >
            <MdSend />
          </button>
        </div>
        
        {/* Show context hint */}
        {chatContext.viewMode === 'borough' || chatContext.selectedBorough !== 'All' ? (
          <div className="context-hint">
            <small>
              💡 I'm aware you're {chatContext.viewMode === 'borough' ? 'viewing' : 'filtering by'} {' '}
              {chatContext.viewMode === 'borough' && selectedArea?.properties?.borough 
                ? selectedArea.properties.borough 
                : chatContext.selectedBorough} - ask me anything about it!
            </small>
          </div>
        ) : null}
      </form>
    </div>
  );
};

export default EnhancedChatbot;
