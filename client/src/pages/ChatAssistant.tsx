import React, { useState, useRef, useEffect } from 'react';
import { api } from '../services/api.js';
import { useAuth } from '../context/AuthContext.js';
import { 
  Send, 
  Sparkles, 
  MessageSquare, 
  Award, 
  HelpCircle, 
  ShieldAlert,
  ArrowRight,
  TrendingUp,
  MapPin
} from 'lucide-react';

interface ChatMessage {
  sender: 'user' | 'assistant';
  text: string;
  timestamp: Date;
}

export const ChatAssistant: React.FC = () => {
  const { currentUser } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      sender: 'assistant',
      text: `Hello ${currentUser?.name.split(' ')[0] || 'Citizen'}! I am your Community Hero AI Civic Assistant. I am directly synced with the municipal database. How can I help you improve the neighborhood today?`,
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Quick suggestion chips
  const suggestions = [
    "What is my current level and XP?",
    "Show active civic issues in the area",
    "How does the verification system work?",
    "Check if my pothole report is resolved"
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (textToSend: string) => {
    if (!textToSend.trim()) return;

    // Add user message
    const userMessage: ChatMessage = {
      sender: 'user',
      text: textToSend,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setSending(true);

    try {
      // Map message history
      const history = messages.map(m => ({
        role: m.sender === 'user' ? 'user' : 'model',
        parts: [{ text: m.text }]
      }));

      const res = await api.chatWithAi(textToSend, history);
      
      const assistantMessage: ChatMessage = {
        sender: 'assistant',
        text: res.reply,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, assistantMessage]);

    } catch (e) {
      console.error(e);
      setMessages(prev => [...prev, {
        sender: 'assistant',
        text: "I am having difficulty retrieving community records at this moment. Please check your internet connection.",
        timestamp: new Date()
      }]);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-6 py-4 max-w-4xl mx-auto">
      {/* Header section */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight font-sans flex items-center gap-2">
          <Sparkles className="h-7 w-7 text-primary animate-pulse" />
          AI Civic Assistant
        </h1>
        <p className="text-neutral-500 dark:text-neutral-400 mt-1">
          Ask questions about municipal workloads, check your reputation ranks, or retrieve active timelines.
        </p>
      </div>

      <div className="glass-card flex flex-col h-[550px] overflow-hidden">
        {/* Chat area */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4">
          {messages.map((msg, index) => (
            <div 
              key={index}
              className={`flex items-start gap-3 max-w-[80%] ${
                msg.sender === 'user' ? 'ml-auto flex-row-reverse' : 'mr-auto'
              }`}
            >
              {/* Profile letter avatar */}
              <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center font-bold text-xs ${
                msg.sender === 'user' 
                  ? 'bg-gradient-to-tr from-primary to-tertiary text-white' 
                  : 'bg-primary/10 text-primary'
              }`}>
                {msg.sender === 'user' ? currentUser?.name.charAt(0).toUpperCase() : 'AI'}
              </div>

              <div className={`p-4 rounded-2xl text-xs leading-relaxed font-light ${
                msg.sender === 'user' 
                  ? 'bg-primary text-white rounded-tr-none' 
                  : 'bg-neutral-50 dark:bg-neutral-900/50 border border-neutral-100 dark:border-neutral-800 rounded-tl-none text-neutral-800 dark:text-neutral-200'
              }`}>
                {msg.text}
              </div>
            </div>
          ))}

          {sending && (
            <div className="flex items-start gap-3 mr-auto max-w-[80%]">
              <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs animate-pulse">
                AI
              </div>
              <div className="p-4 rounded-2xl rounded-tl-none bg-neutral-50 dark:bg-neutral-900/50 border border-neutral-100 dark:border-neutral-800 flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-neutral-400 dark:bg-neutral-600 rounded-full animate-bounce"></span>
                <span className="w-1.5 h-1.5 bg-neutral-400 dark:bg-neutral-600 rounded-full animate-bounce delay-75"></span>
                <span className="w-1.5 h-1.5 bg-neutral-400 dark:bg-neutral-600 rounded-full animate-bounce delay-150"></span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Suggestion Chips */}
        <div className="p-4 border-t border-neutral-100 dark:border-neutral-800/80 bg-neutral-50/50 dark:bg-neutral-950/20 flex flex-wrap gap-2 items-center">
          {suggestions.map((chip, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(chip)}
              disabled={sending}
              className="px-3 py-1.5 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 hover:border-primary/50 text-[10px] font-semibold text-neutral-700 dark:text-neutral-300 rounded-full hover:scale-102 active:scale-98 transition-all"
            >
              {chip}
            </button>
          ))}
        </div>

        {/* Chat input form */}
        <form 
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage(inputValue);
          }}
          className="p-4 border-t border-neutral-100 dark:border-neutral-800 flex gap-3 items-center"
        >
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Type your question about community reports..."
            className="flex-grow glass-input text-xs py-2.5 focus:ring-1"
            disabled={sending}
          />
          <button
            type="submit"
            disabled={sending || !inputValue.trim()}
            className="p-2.5 bg-primary text-white rounded-xl hover:bg-primary-light disabled:bg-neutral-200 disabled:text-neutral-400 active:scale-95 transition-all"
          >
            <Send className="h-4.5 w-4.5" />
          </button>
        </form>
      </div>
    </div>
  );
};
export default ChatAssistant;
