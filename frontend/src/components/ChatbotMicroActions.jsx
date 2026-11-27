import React, { useState } from 'react';
import { Copy, Check, ThumbsUp, ThumbsDown, RotateCcw, Share2, Loader2 } from 'lucide-react';
import api from '../utils/api';

export default function ChatbotMicroActions({
  messageId,
  sessionId,
  text,
  userQuery,
  feedback = null, // 'LIKE' | 'DISLIKE' | null
  feedbackStatus = null, // { type: 'saved' | 'cleared' | 'error', text: string } | null
  onUpdateFeedback,
  onRegenerate
}) {
  const [copied, setCopied] = useState(false);
  const [loadingFeedback, setLoadingFeedback] = useState(false);
  const [shared, setShared] = useState(false);

  const handleCopy = async () => {
    try {
      const cleanText = (text || '').replace(/[*#_~`]/g, '');
      await navigator.clipboard.writeText(cleanText);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {}
  };

  const handleFeedback = async (type) => {
    if (loadingFeedback || !onUpdateFeedback) return;

    const previousFeedback = feedback;
    const previousStatus = feedbackStatus;
    const targetFeedback = feedback === type ? null : type;
    const apiAction = targetFeedback || 'CLEAR';

    setLoadingFeedback(true);
    // Clear prior confirmation temporarily while syncing with backend
    onUpdateFeedback(messageId, targetFeedback, null);

    try {
      const resp = await api.post('/api/chat/feedback', {
        message_id: String(messageId),
        session_id: String(sessionId || 'web_session'),
        feedback: apiAction,
        user_query: userQuery || undefined,
        response_snapshot: typeof text === 'string' ? text.slice(0, 4000) : JSON.stringify(text)
      });

      if (resp.data && resp.data.success) {
        if (!targetFeedback) {
          onUpdateFeedback(messageId, null, {
            type: 'cleared',
            text: 'Feedback selection cleared.'
          });
        } else {
          const label =
            targetFeedback === 'LIKE'
              ? previousFeedback === 'DISLIKE'
                ? 'Feedback updated: Marked helpful · Saved'
                : 'Thanks! Marked helpful · Saved'
              : previousFeedback === 'LIKE'
                ? 'Feedback updated: Marked not helpful · Saved'
                : 'Feedback recorded: Not helpful · Saved';

          onUpdateFeedback(messageId, targetFeedback, {
            type: 'saved',
            text: label
          });
        }
      } else {
        onUpdateFeedback(messageId, previousFeedback, {
          type: 'error',
          text: "Couldn't save your feedback right now."
        });
      }
    } catch {
      // Revert strictly to previous state when persistence fails — never claim saved
      onUpdateFeedback(messageId, previousFeedback, {
        type: 'error',
        text: 'Feedback not saved — backend unavailable.'
      });
      // Preserve previous saved badge later only if there wasn't an error intention
      if (previousStatus?.type === 'saved') {
        setTimeout(() => {
          onUpdateFeedback(messageId, previousFeedback, previousStatus);
        }, 3500);
      }
    } finally {
      setLoadingFeedback(false);
    }
  };

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: 'SAKRA VISION AI Intelligence',
          text: (typeof text === 'string' ? text : '').slice(0, 140),
          url: window.location.href
        });
      } else {
        await handleCopy();
      }
      setShared(true);
      setTimeout(() => setShared(false), 1800);
    } catch {}
  };

  return (
    <div className="flex flex-col gap-1.5 w-full text-left">
      <div className="flex items-center gap-1.5 mt-2 pt-2 border-t border-white/10 text-slate-300 opacity-95 group-hover:opacity-100 transition-opacity">
        <button
          type="button"
          onClick={handleCopy}
          aria-label="Copy response text"
          className="p-2 rounded-lg hover:bg-white/10 hover:text-white transition-all duration-200 cursor-pointer min-w-[40px] min-h-[40px] flex items-center justify-center active:scale-[0.95] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#38bdf8]"
          title="Copy response text"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
        </button>

        <button
          type="button"
          onClick={() => handleFeedback('LIKE')}
          disabled={loadingFeedback}
          aria-pressed={feedback === 'LIKE'}
          aria-label="Mark helpful response"
          className={`p-2 rounded-lg transition-all duration-200 cursor-pointer min-w-[40px] min-h-[40px] flex items-center justify-center gap-1 active:scale-[0.93] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#38bdf8] ${
            feedback === 'LIKE'
              ? 'text-[#38bdf8] bg-[#0071e3]/20 border border-[#38bdf8]/40 font-semibold'
              : 'hover:bg-white/10 hover:text-white border border-transparent'
          }`}
          title="Helpful response"
        >
          {loadingFeedback && feedback === 'LIKE' ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin text-[#38bdf8]" />
          ) : (
            <ThumbsUp className="w-3.5 h-3.5" />
          )}
        </button>

        <button
          type="button"
          onClick={() => handleFeedback('DISLIKE')}
          disabled={loadingFeedback}
          aria-pressed={feedback === 'DISLIKE'}
          aria-label="Mark not helpful response"
          className={`p-2 rounded-lg transition-all duration-200 cursor-pointer min-w-[40px] min-h-[40px] flex items-center justify-center gap-1 active:scale-[0.93] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#38bdf8] ${
            feedback === 'DISLIKE'
              ? 'text-rose-400 bg-rose-500/20 border border-rose-500/40 font-semibold'
              : 'hover:bg-white/10 hover:text-white border border-transparent'
          }`}
          title="Not helpful response"
        >
          {loadingFeedback && feedback === 'DISLIKE' ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin text-rose-400" />
          ) : (
            <ThumbsDown className="w-3.5 h-3.5" />
          )}
        </button>

        {onRegenerate && (
          <button
            type="button"
            onClick={() => onRegenerate(userQuery)}
            aria-label="Regenerate response"
            className="p-2 rounded-lg hover:bg-white/10 hover:text-white transition-all duration-200 cursor-pointer min-w-[40px] min-h-[40px] flex items-center justify-center active:scale-[0.95] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#38bdf8]"
            title="Regenerate response"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        )}

        <button
          type="button"
          onClick={handleShare}
          aria-label="Share response"
          className="p-2 rounded-lg hover:bg-white/10 hover:text-white transition-all duration-200 cursor-pointer min-w-[40px] min-h-[40px] flex items-center justify-center ml-auto active:scale-[0.95] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#38bdf8]"
          title="Share response"
        >
          {shared ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5" />}
        </button>
      </div>

      {/* Single Per-Message Confirmation / Error Strip */}
      {feedbackStatus && (
        <div
          role={feedbackStatus.type === 'error' ? 'alert' : 'status'}
          className={`text-[11px] font-mono px-2.5 py-1.5 rounded-lg border ${
            feedbackStatus.type === 'error'
              ? 'text-rose-300 bg-rose-500/10 border-rose-500/30'
              : feedbackStatus.type === 'cleared'
                ? 'text-slate-300 bg-white/[0.04] border-white/10'
                : feedback === 'DISLIKE'
                  ? 'text-rose-200 bg-rose-500/10 border-rose-500/30'
                  : 'text-[#7dd3fc] bg-[#0071e3]/15 border-[#38bdf8]/30'
          }`}
        >
          {feedbackStatus.text}
        </div>
      )}
    </div>
  );
}
