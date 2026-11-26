import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../utils/api';
import { getLocalChatbotReply } from '../utils/chatbotHelper';
import AiResponseRenderer from './AiResponseRenderer';
import ChatbotMicroActions from './ChatbotMicroActions';
import { Bot, Sparkles, Send, Trash2, X, RefreshCw, AlertTriangle } from 'lucide-react';

const WELCOME_MSG = () => ({
  id: Date.now(),
  sender: 'bot',
  text: 'Welcome to SAKRA VISION. I am SAKRA-BOT, your intelligent interface to our AI product studio. How can I assist you today?',
  userQuery: 'Initial Welcome',
  time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
});

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([WELCOME_MSG()]);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [thinkingStep, setThinkingStep] = useState('');
  const [errorState, setErrorState] = useState(null);

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const toggleBtnRef = useRef(null);
  const wasOpenRef = useRef(false);

  const suggestionPrompts = [
    { label: 'What does SAKRA VISION build?', query: 'What does SAKRA VISION build?' },
    { label: 'Show me your projects', query: 'List all projects by SAKRA VISION' },
    { label: 'Who is Likith?', query: 'Who is Likith Naidu Anumakonda?' },
    { label: 'What technologies do you use?', query: 'What technologies and stack do you use?' },
    { label: 'Start a project', query: 'How can I start a project or schedule a consultation?' }
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, loading, thinkingStep, isOpen]);

  // Focus input on open & restore focus to toggle button on close
  useEffect(() => {
    if (isOpen) {
      wasOpenRef.current = true;
      const timer = setTimeout(() => inputRef.current?.focus({ preventScroll: true }), 140);
      return () => clearTimeout(timer);
    }
    if (!isOpen && wasOpenRef.current) {
      wasOpenRef.current = false;
      requestAnimationFrame(() => toggleBtnRef.current?.focus({ preventScroll: true }));
    }
  }, [isOpen]);

  // Escape key closes open chatbot window
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        e.stopPropagation();
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  const handleSendMessage = async (textToSend) => {
    const query = (textToSend || inputValue).trim();
    if (!query || loading) return;

    const userMsgId = Date.now();
    const userMessage = {
      id: userMsgId,
      sender: 'user',
      text: query,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    setLoading(true);
    setErrorState(null);
    setThinkingStep('thinking');

    const historyPayload = messages.slice(-6).map((m) => ({
      sender: m.sender,
      text: m.text
    }));

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
        userQuery: query,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      console.warn('Backend chat endpoint unavailable, activating SAKRA local intelligence fallback:', error);
      const fallbackText = getLocalChatbotReply(historyPayload, query);

      if (fallbackText) {
        const botMessage = {
          id: Date.now() + 1,
          sender: 'bot',
          text: fallbackText,
          userQuery: query,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        setMessages((prev) => [...prev, botMessage]);
      } else {
        setErrorState('Something interrupted the response. Please try again.');
      }
    } finally {
      clearTimeout(timer1);
      setLoading(false);
      setThinkingStep('');
    }
  };

  const handleFeedbackSubmit = (type) => {
    const ackText =
      type === 'LIKE'
        ? "Thanks for the feedback! I'm glad this response was helpful."
        : "Sorry this response wasn't helpful. We'll use your feedback to improve.";

    const ackMessage = {
      id: Date.now(),
      sender: 'system',
      text: ackText,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, ackMessage]);
  };

  const handleRegenerate = () => {
    const lastUserMessage = [...messages].reverse().find((m) => m.sender === 'user');
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
        userQuery: 'Reset Session',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
    setErrorState(null);
    requestAnimationFrame(() => inputRef.current?.focus({ preventScroll: true }));
  };

  return (
    <div
      className={`fixed z-[1200] flex flex-col items-end text-left select-none sm:select-auto ${
        isOpen
          ? 'inset-2 sm:inset-auto sm:bottom-6 sm:right-6'
          : 'bottom-4 right-4 sm:bottom-6 sm:right-6'
      }`}
    >
      {/* Mobile opaque backdrop scrim when open so underlying page never peeks behind */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            aria-hidden="true"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => setIsOpen(false)}
            className="sm:hidden fixed inset-0 bg-black/85 backdrop-blur-sm z-0"
          />
        )}
      </AnimatePresence>

      {/* Desktop Ambient Glow */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            aria-hidden="true"
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.85 }}
            transition={{ duration: 0.35 }}
            className="hidden sm:block fixed bottom-12 right-8 w-[360px] h-[460px] bg-[#0071e3]/15 blur-[90px] rounded-full pointer-events-none z-0"
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            id="sakra-chatbot-window"
            role="dialog"
            aria-modal="false"
            aria-labelledby="sakra-bot-title"
            initial={{ opacity: 0, scale: 0.96, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 12 }}
            transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
            className="relative z-10 w-full h-full sm:w-[420px] md:w-[440px] sm:h-[min(620px,calc(100dvh-6.25rem))] rounded-2xl sm:rounded-3xl overflow-hidden shadow-[0_24px_80px_rgba(0,0,0,0.92)] flex flex-col sm:mb-3 border border-white/15 bg-[#060a14]"
          >
            {/* Top Highlight Border */}
            <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#38bdf8]/45 to-transparent z-20 pointer-events-none" />

            {/* Pinned Header */}
            <div className="shrink-0 p-3.5 sm:p-4 bg-[#080d1a] border-b border-white/10 flex items-center justify-between relative z-10">
              <div className="flex items-center gap-3 min-w-0">
                <div className="relative shrink-0">
                  <div className="w-9 h-9 rounded-2xl bg-black border border-white/15 p-1 flex items-center justify-center shadow-inner">
                    <img
                      src="/SAKRAVISION.png"
                      alt="SAKRA VISION Brand Identifier"
                      width="28"
                      height="28"
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <span
                    aria-hidden="true"
                    className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-400 rounded-full border-2 border-[#080d1a]"
                  />
                </div>

                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <h2
                      id="sakra-bot-title"
                      className="font-bold text-xs text-white uppercase tracking-wider font-mono"
                    >
                      SAKRA-BOT
                    </h2>
                    <span className="text-[11px] font-mono px-1.5 py-0.5 rounded bg-[#0071e3]/25 text-[#38bdf8] border border-[#38bdf8]/30 leading-none">
                      v2.0
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 font-sans mt-0.5 truncate">
                    AI Product Studio Assistant
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1 shrink-0">
                <button
                  type="button"
                  onClick={handleClearChat}
                  aria-label="Reset conversation session"
                  title="Reset conversation session"
                  className="p-2 text-slate-300 hover:text-white rounded-xl hover:bg-white/10 transition-colors cursor-pointer min-w-[44px] min-h-[44px] flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#38bdf8]"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  aria-label="Close assistant window"
                  title="Close assistant window (Esc)"
                  className="p-2 text-slate-300 hover:text-white rounded-xl hover:bg-white/10 transition-colors cursor-pointer min-w-[44px] min-h-[44px] flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#38bdf8]"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Scrollable Messages Body */}
            <div
              role="log"
              aria-live="polite"
              aria-label="Conversation history"
              className="project-modal-scroll flex-1 min-h-0 overflow-y-auto overscroll-contain p-3.5 sm:p-4 space-y-4 relative z-10"
            >
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
                  className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'} group`}
                >
                  {msg.sender === 'system' ? (
                    <div className="w-full my-1 flex justify-start">
                      <div className="max-w-[94%] p-3.5 rounded-2xl bg-white/[0.04] border border-[#38bdf8]/30 text-xs text-slate-200 font-sans leading-relaxed text-left flex items-start gap-2.5 shadow-lg relative overflow-hidden">
                        <div className="absolute top-0 left-0 bottom-0 w-1 bg-[#38bdf8]" />
                        <Sparkles className="w-4 h-4 text-[#38bdf8] flex-shrink-0 mt-0.5" aria-hidden="true" />
                        <div className="min-w-0 flex-1">
                          <div className="text-[11px] font-mono tracking-wider text-[#38bdf8] uppercase font-bold mb-0.5">
                            ✦ SAKRA-BOT
                          </div>
                          <p className="text-xs text-slate-200 font-medium">{msg.text}</p>
                          <span className="text-[11px] text-slate-400 font-mono block text-right mt-1">
                            {msg.time}
                          </span>
                        </div>
                      </div>
                    </div>
                  ) : msg.sender === 'user' ? (
                    <div className="max-w-[88%] sm:max-w-[84%] p-3.5 rounded-2xl relative transition-all duration-200 bg-[#0071e3] text-white rounded-tr-sm shadow-lg border border-blue-400/30">
                      <p className="text-sm font-sans leading-relaxed text-left whitespace-pre-wrap break-words">
                        {msg.text}
                      </p>
                      <span className="text-[11px] text-blue-100/90 block text-right mt-1.5 font-mono">
                        {msg.time}
                      </span>
                    </div>
                  ) : (
                    <div className="w-full max-w-[98%] sm:max-w-[95%] p-3.5 sm:p-4 rounded-2xl relative transition-all duration-200 bg-white/[0.04] border border-white/10 text-slate-100 rounded-tl-sm shadow-xl hover:border-white/20">
                      <AiResponseRenderer text={msg.text} />
                      <div className="flex items-center justify-between mt-2 pt-1 border-t border-white/5">
                        <span className="text-[11px] text-slate-400 font-mono">{msg.time}</span>
                      </div>
                      <ChatbotMicroActions
                        messageId={msg.id}
                        text={msg.text}
                        userQuery={msg.userQuery}
                        onFeedbackSubmit={handleFeedbackSubmit}
                        onRegenerate={handleRegenerate}
                      />
                    </div>
                  )}
                </motion.div>
              ))}

              {/* Thinking / Generating Indicator */}
              {loading && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex justify-start"
                  role="status"
                >
                  <div className="p-3.5 rounded-2xl rounded-tl-sm bg-white/[0.04] border border-white/10 flex items-center gap-3">
                    <div className="w-4 h-4 rounded-full border-2 border-[#0071e3] border-t-transparent animate-spin" />
                    <span className="text-xs font-mono text-[#38bdf8]">
                      {thinkingStep === 'thinking'
                        ? 'Thinking through your request...'
                        : 'Generating response...'}
                    </span>
                  </div>
                </motion.div>
              )}

              {/* Error Surface */}
              {errorState && (
                <div
                  role="alert"
                  className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-200 text-xs font-sans flex items-start justify-between gap-3"
                >
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-rose-400 flex-shrink-0" aria-hidden="true" />
                    <span>{errorState}</span>
                  </div>
                  <button
                    type="button"
                    onClick={handleRegenerate}
                    className="px-3 py-1.5 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-100 text-xs font-semibold cursor-pointer flex items-center gap-1 border border-rose-500/40 flex-shrink-0 min-h-[36px]"
                  >
                    <RefreshCw className="w-3 h-3" aria-hidden="true" />
                    <span>Retry</span>
                  </button>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Suggestion Prompts */}
            {messages.length <= 2 && !loading && (
              <div className="shrink-0 px-3.5 sm:px-4 py-2.5 border-t border-white/10 bg-[#050811] relative z-10">
                <div className="text-[11px] font-mono tracking-wider text-slate-300 uppercase mb-2 text-left">
                  ✦ Suggested Prompts
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {suggestionPrompts.map((sug, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleSendMessage(sug.query)}
                      className="text-xs px-3 py-1.5 min-h-[34px] bg-white/[0.06] hover:bg-[#0071e3]/25 border border-white/15 hover:border-[#38bdf8]/45 rounded-xl text-slate-100 hover:text-white transition-colors cursor-pointer font-sans text-left inline-flex items-center gap-1.5 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#38bdf8]"
                    >
                      <Sparkles className="w-3 h-3 text-[#38bdf8] shrink-0" aria-hidden="true" />
                      <span>{sug.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Pinned Input Bar Form */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage(inputValue);
              }}
              className="shrink-0 p-3 border-t border-white/10 bg-[#080d1a] flex items-center gap-2 relative z-10"
            >
              <label htmlFor="sakra-chatbot-input" className="sr-only">
                Ask SAKRA-BOT anything
              </label>
              <input
                id="sakra-chatbot-input"
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Ask SAKRA-BOT anything..."
                className="flex-1 min-w-0 bg-black/80 border border-white/15 focus:border-[#38bdf8] focus:ring-1 focus:ring-[#38bdf8] rounded-2xl px-4 py-2.5 text-base sm:text-sm text-white placeholder-slate-400 focus:outline-none transition-colors min-h-[44px]"
              />
              <button
                type="submit"
                disabled={!inputValue.trim() || loading}
                aria-label="Send message"
                className="w-11 h-11 rounded-2xl bg-[#0071e3] hover:bg-[#0a84ff] active:scale-[0.95] flex items-center justify-center text-white transition-all cursor-pointer disabled:opacity-45 disabled:cursor-not-allowed flex-shrink-0 border border-blue-400/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                title="Send query"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Toggle Bubble Button (hidden on small mobile while open to avoid double close buttons) */}
      <motion.button
        ref={toggleBtnRef}
        type="button"
        whileHover={{ scale: 1.06 }}
        whileTap={{ scale: 0.94 }}
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-controls="sakra-chatbot-window"
        aria-label={isOpen ? 'Close SAKRA-BOT AI Assistant' : 'Open SAKRA-BOT AI Assistant'}
        className={`w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-black/95 hover:bg-black items-center justify-center text-white shadow-2xl cursor-pointer border border-white/20 hover:border-[#38bdf8]/60 transition-all duration-300 relative blue-rim focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#38bdf8] ${
          isOpen ? 'hidden sm:flex' : 'flex'
        }`}
      >
        {isOpen ? (
          <X className="w-5 h-5 text-white" />
        ) : (
          <div className="relative flex items-center justify-center">
            <Bot className="w-5 h-5 sm:w-6 sm:h-6 text-[#38bdf8]" />
            <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5 sm:h-3 sm:w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#38bdf8] opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 sm:h-3 sm:w-3 bg-[#0071e3]" />
            </span>
          </div>
        )}
      </motion.button>
    </div>
  );
};

export default Chatbot;
