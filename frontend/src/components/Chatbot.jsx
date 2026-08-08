import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../utils/api';
import { getLocalChatbotReply } from '../utils/chatbotHelper';
import AiResponseRenderer from './AiResponseRenderer';
import ChatbotMicroActions from './ChatbotMicroActions';
import { Bot, Sparkles, Send, Trash2, X, RefreshCw, AlertTriangle } from 'lucide-react';

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'bot',
      text: "Welcome to SAKRA VISION. I am SAKRA-BOT, your intelligent interface to our AI product studio. How can I assist you today?",
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [thinkingStep, setThinkingStep] = useState(''); // 'thinking', 'generating', ''
  const [errorState, setErrorState] = useState(null);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const suggestionPrompts = [
    { label: "What does SAKRA VISION build?", query: "What does SAKRA VISION build?" },
    { label: "Show me your projects", query: "List all projects by SAKRA VISION" },
    { label: "Who is Likith?", query: "Who is Likith Naidu Anumakonda?" },
    { label: "What technologies do you use?", query: "What technologies and stack do you use?" },
    { label: "Start a project", query: "How can I start a project or schedule a consultation?" }
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading, thinkingStep]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isOpen]);

  const handleSendMessage = async (textToSend) => {
    const query = (textToSend || inputValue).trim();
    if (!query || loading) return;

    const userMessage = {
      id: Date.now(),
      sender: 'user',
      text: query,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setLoading(true);
    setErrorState(null);
    setThinkingStep('thinking');

    // Multi-turn context memory
    const historyPayload = messages.slice(-6).map(m => ({
      sender: m.sender,
      text: m.text
    }));

    // Step-wise generation progression for high quality UX
    const timer1 = setTimeout(() => setThinkingStep('generating'), 600);

    try {
      const response = await api.post('/api/chat', { 
        message: query,
        history: historyPayload
      });

      const replyText = response.data.reply || 'No response received.';
      
      const botMessage = {
        id: Date.now() + 1,
        sender: 'bot',
        text: replyText,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.warn("Backend chat endpoint unavailable, activating SAKRA local intelligence fallback:", error);
      const fallbackText = getLocalChatbotReply(historyPayload, query);
      
      if (fallbackText) {
        const botMessage = {
          id: Date.now() + 1,
          sender: 'bot',
          text: fallbackText,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        setMessages(prev => [...prev, botMessage]);
      } else {
        setErrorState("Something interrupted the response. Please try again.");
      }
    } finally {
      clearTimeout(timer1);
      setLoading(false);
      setThinkingStep('');
    }
  };

  const handleRegenerate = () => {
    const lastUserMessage = [...messages].reverse().find(m => m.sender === 'user');
    if (lastUserMessage) {
      handleSendMessage(lastUserMessage.text);
    }
  };

  const handleClearChat = () => {
    setMessages([
      {
        id: Date.now(),
        sender: 'bot',
        text: 'Session reset. SAKRA-BOT is ready for your next query. How can I assist?',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
    setErrorState(null);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 text-left select-none sm:select-auto">
      
      {/* VisionOS-style Ambient Atmosphere Light behind chatbot */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.5 }}
            className="fixed bottom-12 right-12 w-[380px] h-[520px] bg-[#0071e3]/15 blur-[100px] rounded-full pointer-events-none z-0"
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {/* Floating AI Command Window */}
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 20, filter: 'blur(10px)' }}
            animate={{ opacity: 1, scale: 1, y: 0, filter: 'blur(0px)' }}
            exit={{ opacity: 0, scale: 0.94, y: 20, filter: 'blur(10px)' }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="relative z-10 w-[calc(100vw-2rem)] max-w-[420px] sm:w-[420px] h-[580px] rounded-3xl overflow-hidden shadow-[0_24px_80px_rgba(0,0,0,0.85)] flex flex-col mb-4 border border-white/10"
            style={{
              background: 'linear-gradient(180deg, rgba(8, 12, 23, 0.92) 0%, rgba(2, 6, 23, 0.96) 100%)',
              backdropFilter: 'blur(36px)',
              willChange: 'transform, opacity'
            }}
          >
            {/* Top Subtle Inner Highlight Border */}
            <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#38bdf8]/40 to-transparent z-20 pointer-events-none" />

            {/* Chatbot Header */}
            <div className="p-4 bg-black/50 border-b border-white/5 flex items-center justify-between relative z-10 backdrop-blur-md">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-9 h-9 rounded-2xl bg-black/60 border border-white/10 p-1 flex items-center justify-center shadow-inner">
                    <img 
                      src="/SAKRAVISION.png" 
                      alt="SAKRA VISION Brand Identifier" 
                      className="w-full h-full object-contain" 
                    />
                  </div>
                  <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-400 rounded-full border-2 border-black animate-pulse" />
                </div>

                <div>
                  <div className="flex items-center gap-1.5">
                    <h3 className="font-bold text-xs text-white uppercase tracking-wider font-mono">SAKRA-BOT</h3>
                    <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-[#0071e3]/20 text-[#38bdf8] border border-[#38bdf8]/30">
                      v2.0
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-400 font-sans mt-0.5">AI Product Studio Assistant</p>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={handleClearChat}
                  className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-white/5 transition-colors cursor-pointer min-w-[36px] min-h-[36px] flex items-center justify-center"
                  title="Reset conversation session"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-white/5 transition-colors cursor-pointer min-w-[36px] min-h-[36px] flex items-center justify-center"
                  title="Close assistant window"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Messages Body Scroll Container */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin relative z-10">
              
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 8, scale: 0.985 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                  className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'} group`}
                >
                  <div
                    className={`max-w-[90%] sm:max-w-[85%] p-4 rounded-2xl relative transition-all duration-200 ${
                      msg.sender === 'user'
                        ? 'bg-[#0071e3] text-white rounded-tr-sm shadow-lg border border-blue-400/30'
                        : 'bg-white/[0.035] border border-white/[0.08] text-slate-100 rounded-tl-sm shadow-xl backdrop-blur-xl hover:border-white/15'
                    }`}
                  >
                    {msg.sender === 'user' ? (
                      <div>
                        <p className="text-xs sm:text-sm font-sans leading-relaxed text-left whitespace-pre-wrap">{msg.text}</p>
                        <span className="text-[9px] text-blue-200 block text-right mt-1.5 font-mono">{msg.time}</span>
                      </div>
                    ) : (
                      <div>
                        <AiResponseRenderer text={msg.text} />
                        <div className="flex items-center justify-between mt-2 pt-1 border-t border-white/5">
                          <span className="text-[9px] text-slate-500 font-mono">{msg.time}</span>
                          <ChatbotMicroActions text={msg.text} onRegenerate={handleRegenerate} />
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}

              {/* Progressive Thinking / Generating Indicator */}
              {loading && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex justify-start"
                >
                  <div className="p-4 rounded-2xl rounded-tl-sm bg-white/[0.035] border border-white/[0.08] backdrop-blur-xl flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full border-2 border-[#0071e3] border-t-transparent animate-spin" />
                    <span className="text-xs font-mono text-[#38bdf8] animate-pulse">
                      {thinkingStep === 'thinking' ? 'Thinking through your request...' : 'Generating rich response...'}
                    </span>
                  </div>
                </motion.div>
              )}

              {/* Error Surface */}
              {errorState && (
                <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-sans flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-rose-400 flex-shrink-0" />
                    <span>{errorState}</span>
                  </div>
                  <button
                    onClick={handleRegenerate}
                    className="px-3 py-1 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-200 text-xs font-semibold cursor-pointer flex items-center gap-1 border border-rose-500/40 flex-shrink-0"
                  >
                    <RefreshCw className="w-3 h-3" />
                    <span>Retry</span>
                  </button>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Next-Gen Glass Suggestion Cards for Empty / Welcome State */}
            {messages.length <= 2 && !loading && (
              <div className="px-4 py-3 border-t border-white/5 bg-black/40 relative z-10">
                <div className="text-[9px] font-mono tracking-widest text-slate-400 uppercase mb-2 text-left">
                  ✦ SUGGESTED INTELLIGENCE PROMPTS
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {suggestionPrompts.map((sug, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSendMessage(sug.query)}
                      className="text-[11px] px-3 py-1.5 bg-white/5 hover:bg-[#0071e3]/20 border border-white/10 hover:border-[#38bdf8]/40 rounded-xl text-slate-300 hover:text-white transition-all cursor-pointer font-sans text-left flex items-center gap-1.5 active:scale-[0.98]"
                    >
                      <Sparkles className="w-3 h-3 text-[#38bdf8]" />
                      <span>{sug.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Input Bar Container */}
            <div className="p-3 border-t border-white/5 bg-black/70 backdrop-blur-md flex items-center gap-2 relative z-10">
              <input
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage(inputValue)}
                placeholder="Ask SAKRA-BOT anything..."
                className="flex-1 bg-black/80 border border-white/15 focus:border-[#0071e3] focus:ring-1 focus:ring-[#0071e3] rounded-2xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none transition-colors"
              />
              <button
                onClick={() => handleSendMessage(inputValue)}
                disabled={!inputValue.trim() || loading}
                className="w-9 h-9 rounded-2xl bg-[#0071e3] hover:bg-[#0a84ff] active:scale-[0.95] flex items-center justify-center text-white transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed flex-shrink-0 border border-blue-400/30"
                title="Send query"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>

          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Toggle Bubble Button */}
      <motion.button
        whileHover={{ scale: 1.06 }}
        whileTap={{ scale: 0.94 }}
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 rounded-full bg-black/90 hover:bg-black flex items-center justify-center text-white shadow-2xl cursor-pointer border border-white/20 hover:border-[#38bdf8]/60 transition-all duration-300 relative blue-rim mx-auto"
        aria-label="Toggle SAKRA-BOT AI Assistant"
      >
        {isOpen ? (
          <X className="w-5 h-5 text-white" />
        ) : (
          <div className="relative flex items-center justify-center">
            <Bot className="w-6 h-6 text-[#38bdf8]" />
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#38bdf8] opacity-75" />
              <span className="relative inline-flex rounded-full h-3 w-3 bg-[#0071e3]" />
            </span>
          </div>
        )}
      </motion.button>

    </div>
  );
};

export default Chatbot;
