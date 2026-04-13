import React, { useState } from 'react';
import { Send, User, Bot, Loader } from 'lucide-react';

const ChatMode = () => {
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Hello! I\'m your AI assistant. How can I help you today?' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedModel, setSelectedModel] = useState('llama2');

  const models = ['llama2', 'mistral', 'codellama', 'phi', 'gemma'];

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // Add placeholder for assistant response
      setMessages(prev => [...prev, { role: 'assistant', content: '', streaming: true }]);

      if (window.electronAPI) {
        // Use Electron API
        const allMessages = [...messages, userMessage];
        await window.electronAPI.send('chat-message', {
          model: selectedModel,
          messages: allMessages
        });
      } else {
        // Mock response for development
        await new Promise(resolve => setTimeout(resolve, 1000));
        const mockResponse = `This is a mock response to: "${input}". In the full application, this would stream from ${selectedModel}.`;
        
        setMessages(prev => {
          const updated = [...prev];
          const lastMsg = updated[updated.length - 1];
          if (lastMsg.streaming) {
            lastMsg.content = mockResponse;
            lastMsg.streaming = false;
          }
          return updated;
        });
      }
    } catch (error) {
      console.error('Chat error:', error);
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: 'Error: Failed to get response. Please try again.',
        error: true
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="h-full flex flex-col bg-slate-900">
      {/* Header */}
      <div className="h-14 border-b border-slate-700 flex items-center justify-between px-6">
        <h2 className="text-lg font-semibold text-white">Chat Mode</h2>
        <select
          value={selectedModel}
          onChange={(e) => setSelectedModel(e.target.value)}
          className="bg-slate-800 border border-slate-600 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:border-blue-500"
        >
          {models.map(model => (
            <option key={model} value={model}>{model}</option>
          ))}
        </select>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
          >
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
              msg.role === 'user' 
                ? 'bg-blue-600' 
                : msg.error 
                  ? 'bg-red-600' 
                  : 'bg-purple-600'
            }`}>
              {msg.role === 'user' ? (
                <User size={16} />
              ) : (
                <Bot size={16} />
              )}
            </div>
            
            <div className={`max-w-[80%] rounded-2xl px-4 py-3 ${
              msg.role === 'user'
                ? 'bg-blue-600 text-white'
                : msg.error
                  ? 'bg-red-900/50 text-red-200 border border-red-700'
                  : 'bg-slate-800 text-slate-100'
            }`}>
              <p className="whitespace-pre-wrap text-sm leading-relaxed">
                {msg.content || (msg.streaming && <span className="animate-pulse">▊</span>)}
              </p>
            </div>
          </div>
        ))}
        
        {isLoading && messages[messages.length - 1]?.streaming !== true && (
          <div className="flex gap-4">
            <div className="w-8 h-8 rounded-lg bg-purple-600 flex items-center justify-center">
              <Bot size={16} />
            </div>
            <div className="bg-slate-800 rounded-2xl px-4 py-3">
              <Loader className="animate-spin" size={16} />
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="p-6 border-t border-slate-700">
        <div className="flex gap-4 max-w-4xl mx-auto">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your message..."
            rows={1}
            className="flex-1 bg-slate-800 border border-slate-600 rounded-xl px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 resize-none"
            style={{ minHeight: '48px', maxHeight: '200px' }}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="px-6 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-700 disabled:text-slate-500 text-white rounded-xl transition-colors flex items-center gap-2"
          >
            <Send size={18} />
            Send
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatMode;
