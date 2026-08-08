import React, { useState } from 'react';
import { Copy, Check, ThumbsUp, ThumbsDown, RotateCcw, Share2, Loader2 } from 'lucide-react';
import api from '../utils/api';

export default function ChatbotMicroActions({ messageId, text, userQuery, onFeedbackSubmit, onRegenerate }) {
  const [copied, setCopied] = useState(false);
  const [feedback, setFeedback] = useState(null); // 'LIKE', 'DISLIKE', null
  const [loadingFeedback, setLoadingFeedback] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const [shared, setShared] = useState(false);

  const handleCopy = async () => {
    try {
      const cleanText = (text || '').replace(/[*#_~`[\]()]/g, '');
      await navigator.clipboard.writeText(cleanText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Copy failed:", err);
    }
  };

  const handleFeedback = async (type) => {
    if (loadingFeedback) return;

    const previousFeedback = feedback;
    const targetFeedback = feedback === type ? null : type;

    // Optimistic UI state update
    setFeedback(targetFeedback);
    setErrorMsg(null);

    if (!targetFeedback) return;

    setLoadingFeedback(true);

    try {
      const resp = await api.post('/api/chat/feedback', {
        message_id: String(messageId || Date.now()),
        feedback: targetFeedback,
        user_query: userQuery || undefined,
        response_snapshot: typeof text === 'string' ? text : JSON.stringify(text)
      });

      if (resp.data && resp.data.success) {
        if (onFeedbackSubmit) {
          onFeedbackSubmit(targetFeedback, messageId);
        }
      }
    } catch (err) {
      console.error("Failed to persist feedback:", err);
      // Rollback optimistic state on error
      setFeedback(previousFeedback);
      setErrorMsg("Couldn't save your feedback. Please try again.");
      setTimeout(() => setErrorMsg(null), 3000);
    } finally {
      setLoadingFeedback(false);
    }
  };

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: 'SAKRA VISION AI Intelligence',
          text: (typeof text === 'string' ? text : '').slice(0, 120) + '...',
          url: window.location.href
        });
      } else {
        await handleCopy();
      }
      setShared(true);
      setTimeout(() => setShared(false), 2000);
    } catch (err) {}
  };

  return (
    <div className="flex flex-col gap-1 w-full text-left">
      <div className="flex items-center gap-1.5 mt-2 pt-2 border-t border-white/5 text-slate-400 opacity-90 group-hover:opacity-100 transition-opacity">
        
        {/* Copy Button */}
        <button
          onClick={handleCopy}
          aria-label="Copy response text"
          className="p-1.5 rounded-lg hover:bg-white/10 hover:text-white transition-all duration-200 cursor-pointer min-w-[32px] min-h-[32px] sm:min-w-[44px] sm:min-h-[44px] flex items-center justify-center active:scale-[0.95]"
          title="Copy response text"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
        </button>

        {/* Like Button */}
        <button
          onClick={() => handleFeedback('LIKE')}
          disabled={loadingFeedback}
          aria-label="Helpful response"
          className={`p-1.5 rounded-lg transition-all duration-200 cursor-pointer min-w-[32px] min-h-[32px] sm:min-w-[44px] sm:min-h-[44px] flex items-center justify-center gap-1 active:scale-[0.93] ${
            feedback === 'LIKE'
              ? 'text-[#38bdf8] bg-[#0071e3]/20 border border-[#38bdf8]/40 shadow-[0_0_12px_rgba(56,189,248,0.25)] font-semibold'
              : 'hover:bg-white/10 hover:text-white border border-transparent'
          }`}
          title="Helpful response"
        >
          {loadingFeedback && feedback === 'LIKE' ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin text-[#38bdf8]" />
          ) : (
            <>
              <ThumbsUp className={`w-3.5 h-3.5 transition-transform ${feedback === 'LIKE' ? 'scale-110' : ''}`} />
              {feedback === 'LIKE' && <span className="text-[10px] font-mono text-[#38bdf8]">✓</span>}
            </>
          )}
        </button>

        {/* Dislike Button */}
        <button
          onClick={() => handleFeedback('DISLIKE')}
          disabled={loadingFeedback}
          aria-label="Not helpful response"
          className={`p-1.5 rounded-lg transition-all duration-200 cursor-pointer min-w-[32px] min-h-[32px] sm:min-w-[44px] sm:min-h-[44px] flex items-center justify-center gap-1 active:scale-[0.93] ${
            feedback === 'DISLIKE'
              ? 'text-rose-400 bg-rose-500/20 border border-rose-500/40 shadow-[0_0_12px_rgba(244,63,94,0.25)] font-semibold'
              : 'hover:bg-white/10 hover:text-white border border-transparent'
          }`}
          title="Not helpful response"
        >
          {loadingFeedback && feedback === 'DISLIKE' ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin text-rose-400" />
          ) : (
            <>
              <ThumbsDown className={`w-3.5 h-3.5 transition-transform ${feedback === 'DISLIKE' ? 'scale-110' : ''}`} />
              {feedback === 'DISLIKE' && <span className="text-[10px] font-mono text-rose-400">✓</span>}
            </>
          )}
        </button>

        {/* Regenerate Option */}
        {onRegenerate && (
          <button
            onClick={onRegenerate}
            aria-label="Regenerate response"
            className="p-1.5 rounded-lg hover:bg-white/10 hover:text-white transition-all duration-200 cursor-pointer min-w-[32px] min-h-[32px] sm:min-w-[44px] sm:min-h-[44px] flex items-center justify-center active:scale-[0.95]"
            title="Regenerate response"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        )}

        {/* Share Button */}
        <button
          onClick={handleShare}
          aria-label="Share response"
          className="p-1.5 rounded-lg hover:bg-white/10 hover:text-white transition-all duration-200 cursor-pointer min-w-[32px] min-h-[32px] sm:min-w-[44px] sm:min-h-[44px] flex items-center justify-center ml-auto active:scale-[0.95]"
          title="Share response"
        >
          {shared ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5" />}
        </button>
      </div>

      {/* Error state alert */}
      {errorMsg && (
        <span className="text-[10px] font-mono text-rose-400 mt-1 block animate-fade-in">
          {errorMsg}
        </span>
      )}
    </div>
  );
}
