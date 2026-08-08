import React, { useState } from 'react';
import { Copy, Check, ThumbsUp, ThumbsDown, RotateCcw, Share2 } from 'lucide-react';

export default function ChatbotMicroActions({ text, onRegenerate }) {
  const [copied, setCopied] = useState(false);
  const [feedback, setFeedback] = useState(null); // 'up', 'down', null
  const [shared, setShared] = useState(false);

  const handleCopy = async () => {
    try {
      // Strip markdown symbols for clean clipboard text
      const cleanText = text.replace(/[*#_~`[\]()]/g, '');
      await navigator.clipboard.writeText(cleanText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Copy failed:", err);
    }
  };

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: 'SAKRA VISION AI Intelligence',
          text: text.slice(0, 120) + '...',
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
    <div className="flex items-center gap-1 mt-2 pt-2 border-t border-white/5 text-slate-400 opacity-90 group-hover:opacity-100 transition-opacity">
      {/* Copy Button */}
      <button
        onClick={handleCopy}
        className="p-1.5 rounded-lg hover:bg-white/10 hover:text-white transition-colors cursor-pointer min-w-[32px] min-h-[32px] sm:min-w-[44px] sm:min-h-[44px] flex items-center justify-center"
        title="Copy response"
      >
        {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
      </button>

      {/* Helpful / Not Helpful Feedback */}
      <button
        onClick={() => setFeedback(feedback === 'up' ? null : 'up')}
        className={`p-1.5 rounded-lg hover:bg-white/10 transition-colors cursor-pointer min-w-[32px] min-h-[32px] sm:min-w-[44px] sm:min-h-[44px] flex items-center justify-center ${
          feedback === 'up' ? 'text-[#38bdf8] bg-white/5' : 'hover:text-white'
        }`}
        title="Helpful"
      >
        <ThumbsUp className="w-3.5 h-3.5" />
      </button>

      <button
        onClick={() => setFeedback(feedback === 'down' ? null : 'down')}
        className={`p-1.5 rounded-lg hover:bg-white/10 transition-colors cursor-pointer min-w-[32px] min-h-[32px] sm:min-w-[44px] sm:min-h-[44px] flex items-center justify-center ${
          feedback === 'down' ? 'text-rose-400 bg-white/5' : 'hover:text-white'
        }`}
        title="Not helpful"
      >
        <ThumbsDown className="w-3.5 h-3.5" />
      </button>

      {/* Regenerate Option */}
      {onRegenerate && (
        <button
          onClick={onRegenerate}
          className="p-1.5 rounded-lg hover:bg-white/10 hover:text-white transition-colors cursor-pointer min-w-[32px] min-h-[32px] sm:min-w-[44px] sm:min-h-[44px] flex items-center justify-center"
          title="Regenerate response"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>
      )}

      {/* Share Button */}
      <button
        onClick={handleShare}
        className="p-1.5 rounded-lg hover:bg-white/10 hover:text-white transition-colors cursor-pointer min-w-[32px] min-h-[32px] sm:min-w-[44px] sm:min-h-[44px] flex items-center justify-center ml-auto"
        title="Share response"
      >
        {shared ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5" />}
      </button>
    </div>
  );
}
