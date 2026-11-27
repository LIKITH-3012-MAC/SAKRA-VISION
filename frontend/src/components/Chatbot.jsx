import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../utils/api';
import { getLocalChatbotReplyPayload, resolveSessionLanguage } from '../utils/chatbotHelper';
import AiResponseRenderer from './AiResponseRenderer';
import ChatbotMicroActions from './ChatbotMicroActions';
import { Bot, Sparkles, Send, Trash2, X, RefreshCw, AlertTriangle, Globe } from 'lucide-react';

const makeId = () =>
  typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
    ? crypto.randomUUID()
    : `msg_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

const formatTime = () => new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

const WELCOME_MSG = () => ({
  id: makeId(),
  sender: 'bot',
  text: 'Welcome to SAKRA VISION. I am **SAKRA-BOT V2.1**, your AI product studio assistant. Ask me about our products, verified tech stack, founder details, or starting a project.',
  userQuery: 'Initial Welcome',
  isGreeting: true,
  feedback: null,
  feedbackStatus: null,
  meta: null,
  time: formatTime()
});

const LANGUAGE_MODES = [
  { id: 'auto', label: 'Auto' },
  { id: 'english', label: 'EN' },
  { id: 'telugu', label: 'తెలుగు' },
  { id: 'tanglish', label: 'Tanglish' }
];

const Chatbot = ({ onNavigate }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([WELCOME_MSG()]);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [thinkingStep, setThinkingStep] = useState('');
  const [errorState, setErrorState] = useState(null);
  const [languagePref, setLanguagePref] = useState('auto'); // 'auto' | 'english' | 'telugu' | 'tanglish'
  const [activeDetectedLanguage, setActiveDetectedLanguage] = useState('english');

  const sessionIdRef = useRef(makeId());
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const toggleBtnRef = useRef(null);
  const wasOpenRef = useRef(false);

  const suggestionPrompts = [
    { label: 'What technologies do you use?', query: 'What technologies and stack do you use?' },
    { label: 'Who is Likith Naidu?', query: 'Who is Likith Naidu Anumakonda?' },
    { label: 'Show flagship projects', query: 'List all projects by SAKRA VISION' },
    { label: 'Start a project', query: 'How can I start a project?' }
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

  const handleNavigateFromChat = (viewId, sectionId) => {
    if (onNavigate) {
      onNavigate(viewId, sectionId);
    }
    if (typeof window !== 'undefined' && window.innerWidth < 640) {
      setIsOpen(false);
    }
  };

  const handleUpdateMessageFeedback = (messageId, nextFeedback, nextStatus) => {
    setMessages((prev) =>
      prev.map((m) =>
        m.id === messageId
          ? {
              ...m,
              feedback: nextFeedback,
              feedbackStatus: nextStatus
            }
          : m
      )
    );
  };

  const handleSendMessage = async (textToSend) => {
    const query = (textToSend ?? inputValue).trim();
    if (!query || loading) return;

    const userMessage = {
      id: makeId(),
      sender: 'user',
      text: query,
      time: formatTime()
    };

    // Strip UI system notices & initial welcome greeting before sending context
    const historyPayload = messages
      .filter((m) => m.sender !== 'system' && !m.isGreeting)
      .slice(-8)
      .map((m) => ({
        sender: m.sender,
        text: m.text
      }));

    // Sync explicit language change requests or Tanglish shifts in UI state automatically
    if (/\b(telugu\s*lo|in\s+simple\s+telugu|in\s+telugu|speak\s+telugu)\b|తెలుగులో/i.test(query) || /[\u0C00-\u0C7F]/.test(query)) {
      setLanguagePref('telugu');
    } else if (/\b(tanglish\s*lo|in\s+tanglish|switch\s+to\s+tanglish)\b/i.test(query)) {
      setLanguagePref('tanglish');
    } else if (/\b(in\s+english|english\s*lo|switch\s+to\s+english|speak\s+english|english\s+please)\b/i.test(query)) {
      setLanguagePref('english');
    } else if (/\b(em|enti|evaru|cheppu|gurinchi|nenu|mee|chesthundi|kavali)\b/i.test(query)) {
      setLanguagePref('auto');
    }

    const expectedLanguage = resolveSessionLanguage(query, historyPayload, languagePref);

    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    setLoading(true);
    setErrorState(null);
    setThinkingStep('thinking');

    const timer1 = setTimeout(() => setThinkingStep('generating'), 550);

    try {
      const response = await api.post('/api/chat', {
        message: query,
        history: historyPayload,
        preferred_language: languagePref !== 'auto' ? languagePref : undefined
      });

      const data = response.data || {};
      const replyText = data.reply || 'No response received.';
      if (data.language) setActiveDetectedLanguage(data.language);

      const botMessage = {
        id: makeId(),
        sender: 'bot',
        text: replyText,
        userQuery: query,
        feedback: null,
        feedbackStatus: null,
        meta: {
          source: data.source || 'groq',
          model: data.model || null,
          language: data.language || expectedLanguage
        },
        time: formatTime()
      };
      setMessages((prev) => [...prev, botMessage]);
    } catch {
      const localResult = getLocalChatbotReplyPayload(historyPayload, query, languagePref);
      setActiveDetectedLanguage(localResult.language);

      if (localResult.reply) {
        const botMessage = {
          id: makeId(),
          sender: 'bot',
          text: localResult.reply,
          userQuery: query,
          feedback: null,
          feedbackStatus: null,
          meta: {
            source: 'fallback',
            model: null,
            language: localResult.language
          },
          time: formatTime()
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

  const handleRegenerate = (specificQuery) => {
    const queryToRetry =
      (specificQuery && specificQuery !== 'Initial Welcome' && specificQuery !== 'Reset Session'
        ? specificQuery
        : null) || [...messages].reverse().find((m) => m.sender === 'user')?.text;

    if (queryToRetry) {
      handleSendMessage(queryToRetry);
    }
  };

  const handleClearChat = () => {
    sessionIdRef.current = makeId();
    setLanguagePref('auto');
    setActiveDetectedLanguage('english');
    setMessages([
      {
        id: makeId(),
        sender: 'bot',
        text: 'Session reset. SAKRA-BOT V2.1 is ready for your next question.',
        userQuery: 'Reset Session',
        isGreeting: true,
        feedback: null,
        feedbackStatus: null,
        meta: null,
        time: formatTime()
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
      {/* Mobile opaque backdrop scrim */}
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
            className="relative z-10 w-full h-full sm:w-[430px] md:w-[450px] sm:h-[min(640px,calc(100dvh-6rem))] rounded-2xl sm:rounded-3xl overflow-hidden shadow-[0_24px_80px_rgba(0,0,0,0.92)] flex flex-col sm:mb-3 border border-white/15 bg-[#060a14]"
          >
            <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#38bdf8]/45 to-transparent z-20 pointer-events-none" />

            {/* Pinned Header + Language Switcher */}
            <div className="shrink-0 bg-[#080d1a] border-b border-white/10 relative z-10">
              <div className="p-3.5 sm:px-4 sm:pt-3.5 sm:pb-2.5 flex items-center justify-between">
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
                        V2.1
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

              {/* Compact Language Mode Strip */}
              <div className="px-3.5 sm:px-4 pb-2.5 flex items-center justify-between gap-2 text-[11px] font-mono">
                <div className="flex items-center gap-1.5 text-slate-400">
                  <Globe className="w-3 h-3 text-[#38bdf8]" aria-hidden="true" />
                  <span>
                    {languagePref === 'auto'
                      ? `Lang: ${activeDetectedLanguage}`
                      : `Locked: ${languagePref}`}
                  </span>
                </div>
                <div role="group" aria-label="Chat language preference" className="flex items-center gap-1">
                  {LANGUAGE_MODES.map((mode) => {
                    const isSelected = languagePref === mode.id;
                    return (
                      <button
                        key={mode.id}
                        type="button"
                        aria-pressed={isSelected}
                        onClick={() => setLanguagePref(mode.id)}
                        className={`px-2 py-0.5 rounded-md border transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#38bdf8] ${
                          isSelected
                            ? 'bg-[#0071e3]/25 border-[#38bdf8]/45 text-[#7dd3fc] font-semibold'
                            : 'bg-white/[0.03] border-white/10 text-slate-300 hover:text-white hover:bg-white/10'
                        }`}
                      >
                        {mode.label}
                      </button>
                    );
                  })}
                </div>
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
                  transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
                  className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'} group`}
                >
                  {msg.sender === 'user' ? (
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
                      <AiResponseRenderer
                        text={msg.text}
                        meta={msg.meta}
                        showActions={!msg.isGreeting}
                        onNavigate={handleNavigateFromChat}
                      />
                      <div className="flex items-center justify-between mt-2 pt-1 border-t border-white/5">
                        <span className="text-[11px] text-slate-400 font-mono">{msg.time}</span>
                      </div>
                      <ChatbotMicroActions
                        messageId={msg.id}
                        sessionId={sessionIdRef.current}
                        text={msg.text}
                        userQuery={msg.userQuery}
                        feedback={msg.feedback}
                        feedbackStatus={msg.feedbackStatus}
                        onUpdateFeedback={handleUpdateMessageFeedback}
                        onRegenerate={msg.isGreeting ? null : handleRegenerate}
                      />
                    </div>
                  )}
                </motion.div>
              ))}

              {/* Thinking Indicator */}
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
                        ? 'Analyzing your query...'
                        : 'Synthesizing response...'}
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
                    onClick={() => handleRegenerate()}
                    className="px-3 py-1.5 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-100 text-xs font-semibold cursor-pointer flex items-center gap-1 border border-rose-500/40 flex-shrink-0 min-h-[36px]"
                  >
                    <RefreshCw className="w-3 h-3" aria-hidden="true" />
                    <span>Retry</span>
                  </button>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Suggestion Prompts (Shown before active conversation deepens) */}
            {messages.length <= 2 && !loading && (
              <div className="shrink-0 px-3.5 sm:px-4 py-2.5 border-t border-white/10 bg-[#050811] relative z-10">
                <div className="text-[11px] font-mono tracking-wider text-slate-300 uppercase mb-2 text-left">
                  Suggested Questions
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
                Ask SAKRA-BOT anything in English, Telugu, or Tanglish
              </label>
              <input
                id="sakra-chatbot-input"
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Ask in English, తెలుగు, or Tanglish..."
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

      {/* Floating Toggle Bubble Button */}
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
