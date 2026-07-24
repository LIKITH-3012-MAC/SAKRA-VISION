import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../utils/api';
import { sakraKnowledge } from '../data/knowledge';
import { getLocalChatbotReply } from '../utils/chatbotHelper';

const formatMessageText = (text) => {
  if (!text) return null;
  const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
  const parts = [];
  let lastIndex = 0;
  let match;

  while ((match = linkRegex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.substring(lastIndex, match.index));
    }
    parts.push(
      <a
        key={match.index}
        href={match[2]}
        target="_blank"
        rel="noopener noreferrer"
        className="text-[#38bdf8] underline hover:text-white font-medium"
      >
        {match[1]}
      </a>
    );
    lastIndex = linkRegex.lastIndex;
  }
  if (lastIndex < text.length) {
    parts.push(text.substring(lastIndex));
  }

  return parts;
};

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'bot',
      text: 'Welcome to SAKRA VISION. I am SAKRA-BOT, your intelligent assistant. How can I help you explore our product studio today?',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const suggestions = sakraKnowledge.quickQuestions.map(q => ({
    label: q,
    query: q
  })).slice(0, 5);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSendMessage = async (textToSend) => {
    if (!textToSend.trim() || loading) return;

    const userMessage = {
      id: Date.now(),
      sender: 'user',
      text: textToSend,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setLoading(true);

    // Construct recent history context for multi-turn memory
    const historyPayload = messages.slice(-6).map(m => ({
      sender: m.sender,
      text: m.text
    }));

    try {
      const response = await api.post('/api/chat', { 
        message: textToSend,
        history: historyPayload
      });
      const botMessage = {
        id: Date.now() + 1,
        sender: 'bot',
        text: response.data.reply || 'No response received.',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.warn("Backend chat unavailable, using local intelligent chatbot fallback:", error);
      const fallbackText = getLocalChatbotReply(historyPayload, textToSend);
      const botMessage = {
        id: Date.now() + 1,
        sender: 'bot',
        text: fallbackText,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, botMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleClearChat = () => {
    setMessages([
      {
        id: Date.now(),
        sender: 'bot',
        text: 'History cleared. SAKRA-BOT is ready for a new session. Ask me anything!',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
  };

  return (
    <div className="fixed bottom-8 right-8 z-50 text-left">
      <AnimatePresence>
        {/* Chat Window (Apple Glass visual) */}
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, rotateX: -10, y: 30 }}
            animate={{ opacity: 1, scale: 1, rotateX: 0, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, rotateX: -10, y: 30 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="apple-glass border border-[#0071e3]/20 blue-rim w-[340px] sm:w-[380px] h-[520px] rounded-3xl overflow-hidden shadow-2xl flex flex-col mb-4"
          >
            {/* Chat Header */}
            <div className="p-4 bg-black/60 border-b border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-8 h-8 rounded-full overflow-hidden bg-black/40 border border-white/10 flex items-center justify-center">
                    <img 
                      src="/SAKRAVISION.png" 
                      alt="SAKRA VISION Logo" 
                      className="w-full h-full object-contain" 
                    />
                  </div>
                  <span className="absolute bottom-0 right-0 w-2 h-2 bg-emerald-500 rounded-full border border-black"></span>
                </div>
                <div className="text-left">
                  <h3 className="font-semibold text-xs text-white uppercase tracking-wider font-mono">SAKRA-BOT</h3>
                  <p className="text-[9px] text-[#38bdf8] font-mono">AI ASSISTANT v1.0</p>
                </div>
              </div>
              
              <button
                onClick={handleClearChat}
                className="text-[10px] text-slate-500 hover:text-white font-mono px-2 py-1 rounded cursor-pointer transition-colors"
                title="Clear Chat Logs"
              >
                Clear
              </button>
            </div>

            {/* Messages Body */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-none">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[82%] p-3 rounded-2xl text-xs leading-relaxed ${
                      msg.sender === 'user'
                        ? 'bg-[#0071e3] text-white rounded-tr-none'
                        : 'bg-white/5 border border-white/5 text-slate-200 rounded-tl-none'
                    }`}
                  >
                    <p className="whitespace-pre-wrap text-left">{formatMessageText(msg.text)}</p>
                    <span className="text-[8px] text-slate-500 block text-right mt-1 font-mono">{msg.time}</span>
                  </div>
                </div>
              ))}

              {/* Typing indicator */}
              {loading && (
                <div className="flex justify-start">
                  <div className="bg-white/5 border border-white/5 p-3 rounded-2xl rounded-tl-none flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 bg-[#38bdf8] rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                    <span className="w-1.5 h-1.5 bg-[#38bdf8] rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                    <span className="w-1.5 h-1.5 bg-[#38bdf8] rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Suggestions chips */}
            {messages.length === 1 && (
              <div className="px-4 py-2 border-t border-white/5 bg-black/40">
                <div className="flex flex-wrap gap-1.5">
                  {suggestions.map((sug, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSendMessage(sug.query)}
                      className="text-[10px] px-2.5 py-1.5 bg-white/5 hover:bg-white/10 border border-white/5 rounded-lg text-slate-300 hover:text-white transition-all cursor-pointer font-sans text-left"
                    >
                      {sug.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Input area */}
            <div className="p-3 border-t border-white/5 bg-black/60 flex items-center gap-2">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage(inputValue)}
                placeholder="Ask SAKRA Assistant..."
                className="flex-1 bg-black border border-white/10 focus:border-[#0071e3]/60 focus:ring-1 focus:ring-[#0071e3]/40 rounded-xl px-4 py-2 text-xs text-white focus:outline-none transition-colors"
              />
              <button
                onClick={() => handleSendMessage(inputValue)}
                disabled={!inputValue.trim() || loading}
                className="w-8 h-8 rounded-xl bg-[#0071e3] hover:bg-[#0a84ff] flex items-center justify-center text-white transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
              >
                ➔
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Toggle Bubble Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="w-12 h-12 rounded-full bg-black/80 hover:bg-black flex items-center justify-center text-white text-xl shadow-xl cursor-pointer border border-white/15 hover:border-[#0071e3]/50 transition-all duration-300 relative blue-rim mx-auto"
      >
        {isOpen ? (
          <span className="text-sm font-mono font-light">✕</span>
        ) : (
          <svg className="w-5 h-5 text-[#38bdf8]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        )}
        {!isOpen && (
          <span className="absolute -top-0.5 -right-0.5 flex h-3.5 w-3.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#38bdf8] opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-[#0071e3] border border-black"></span>
          </span>
        )}
      </motion.button>
    </div>
  );

};

export default Chatbot;
