import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, ExternalLink, Video } from 'lucide-react';

const MEETING_URL = 'https://meet.google.com/grg-hytm-ahw';
const CONSULTATION_HOURS = 'Every day · 6:00 PM – 9:00 PM IST';

export default function ConsultationModule({ onStartProject, onBookMeeting }) {
  const isInternalNavigation = Boolean(onBookMeeting);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 'some' }}
      transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
      className="w-full apple-glass p-6 sm:p-8 rounded-3xl border border-white/15 relative overflow-hidden shadow-2xl flex flex-col justify-between"
      style={{
        background: 'linear-gradient(180deg, rgba(8, 12, 23, 0.88) 0%, rgba(2, 6, 23, 0.96) 100%)'
      }}
    >
      {/* Soft atmospheric lighting */}
      <div aria-hidden="true" className="absolute -top-24 -right-24 w-64 h-64 bg-[#0071e3]/15 blur-[80px] rounded-full pointer-events-none" />
      <div aria-hidden="true" className="absolute -bottom-24 -left-24 w-64 h-64 bg-[#38bdf8]/10 blur-[80px] rounded-full pointer-events-none" />
      <div aria-hidden="true" className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-[1px] bg-gradient-to-r from-transparent via-[#38bdf8]/40 to-transparent" />

      <div className="relative z-10 text-left">
        {/* Header Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#0071e3]/15 border border-[#38bdf8]/35 mb-5">
          <span aria-hidden="true" className="w-2 h-2 rounded-full bg-[#38bdf8] animate-pulse" />
          <span className="text-xs font-mono tracking-wider text-[#38bdf8] uppercase font-semibold">
            Direct Consultation
          </span>
        </div>

        {/* Title */}
        <h2 className="text-xl md:text-2xl font-bold tracking-tight text-white font-sans leading-tight">
          Let&apos;s Build Something Intelligent Together
        </h2>

        <p className="text-xs sm:text-sm text-slate-300 font-normal leading-relaxed mt-3 font-sans">
          Prefer a direct conversation? Connect with SAKRA VISION through Google Meet.
        </p>

        {/* Consultation Hours Block */}
        <div className="my-5 p-4 rounded-2xl bg-black/55 border border-white/15 flex flex-col gap-1.5 backdrop-blur-md">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-mono tracking-wider text-slate-300 uppercase font-medium">
              Consultation Hours
            </span>
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-400" title="Window Available Daily" />
          </div>
          <span className="text-sm font-semibold text-white font-mono">
            {CONSULTATION_HOURS}
          </span>
        </div>

        {/* Commercial Positioning Note */}
        <p className="text-xs text-slate-300 italic font-sans mb-6">
          Project scope and commercial terms are discussed individually.
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row gap-3 w-full">
          <button
            type="button"
            onClick={() => {
              if (onBookMeeting) {
                onBookMeeting();
              } else {
                window.open(MEETING_URL, '_blank', 'noopener,noreferrer');
              }
            }}
            className="group relative inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full text-xs sm:text-sm font-semibold text-white bg-[#0071e3] hover:bg-[#0a84ff] active:scale-[0.98] transition-all duration-200 shadow-[0_8px_20px_rgba(0,113,227,0.3)] hover:shadow-[0_12px_28px_rgba(0,113,227,0.45)] min-h-[44px] cursor-pointer overflow-hidden border border-[#38bdf8]/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
          >
            <span className="relative z-10">Book a Meeting</span>
            {isInternalNavigation ? (
              <ArrowRight className="w-4 h-4 relative z-10 transition-transform duration-200 group-hover:translate-x-0.5" aria-hidden="true" />
            ) : (
              <ExternalLink className="w-3.5 h-3.5 relative z-10" aria-hidden="true" />
            )}
          </button>

          {onStartProject && (
            <button
              type="button"
              onClick={() => onStartProject('inquire')}
              className="inline-flex items-center justify-center px-6 py-3.5 rounded-full text-xs sm:text-sm font-semibold text-slate-100 hover:text-white bg-white/[0.06] hover:bg-white/15 active:scale-[0.98] transition-all duration-200 border border-white/15 hover:border-[#38bdf8]/45 min-h-[44px] cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#38bdf8]"
            >
              Start a Project
            </button>
          )}
        </div>
      </div>

      {/* Footer Label */}
      <div className="mt-7 pt-4 border-t border-white/10 flex items-center justify-between gap-2 text-xs font-mono text-slate-300">
        <span>Official SAKRA VISION Room</span>
        <span className="text-[#38bdf8] flex items-center gap-1.5">
          <Video className="w-3.5 h-3.5" aria-hidden="true" />
          <span>Google Meet</span>
        </span>
      </div>
    </motion.div>
  );
}
