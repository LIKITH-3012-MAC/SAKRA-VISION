import React from 'react';
import { motion } from 'framer-motion';

const MEETING_URL = "https://meet.google.com/grg-hytm-ahw";
const CONSULTATION_HOURS = "Every day · 6:00 PM – 9:00 PM IST";

export default function ConsultationModule({ onStartProject }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="w-full apple-glass p-8 rounded-3xl border border-white/10 relative overflow-hidden shadow-2xl flex flex-col justify-between"
      style={{
        willChange: 'transform, opacity',
        background: 'linear-gradient(180deg, rgba(8, 12, 23, 0.85) 0%, rgba(2, 6, 23, 0.95) 100%)'
      }}
    >
      {/* Soft atmospheric lighting and subtle glow */}
      <div className="absolute -top-24 -right-24 w-64 h-64 bg-[#0071e3]/15 blur-[80px] rounded-full pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-[#38bdf8]/10 blur-[80px] rounded-full pointer-events-none" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-[1px] bg-gradient-to-r from-transparent via-[#38bdf8]/40 to-transparent" />

      <div className="relative z-10 text-left">
        {/* Header Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#0071e3]/10 border border-[#38bdf8]/30 mb-6">
          <span className="w-2 h-2 rounded-full bg-[#38bdf8] animate-pulse" />
          <span className="text-[10px] font-mono tracking-widest text-[#38bdf8] uppercase font-semibold">
            Direct Consultation
          </span>
        </div>

        {/* Title */}
        <h3 className="text-xl md:text-2xl font-bold tracking-tight text-white font-sans leading-tight">
          LET'S BUILD SOMETHING INTELLIGENT TOGETHER
        </h3>
        
        <p className="text-xs md:text-sm text-[#94a3b8] font-light leading-relaxed mt-3 font-sans">
          Prefer a direct conversation? Connect with SAKRA VISION through Google Meet.
        </p>

        {/* Consultation Hours Block */}
        <div className="my-6 p-4 rounded-2xl bg-black/50 border border-white/10 flex flex-col gap-1.5 backdrop-blur-md">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono tracking-widest text-slate-400 uppercase font-medium">
              Consultation Hours
            </span>
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-400" title="Window Available Daily" />
          </div>
          <span className="text-sm font-semibold text-white font-mono">
            {CONSULTATION_HOURS}
          </span>
        </div>

        {/* Commercial Positioning Note */}
        <p className="text-[11px] text-slate-400 italic font-sans mb-6">
          Project scope and commercial terms are discussed individually.
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row gap-3 w-full">
          <button
            onClick={() => {
              if (onStartProject) {
                onStartProject('book');
              } else {
                window.location.hash = '#book';
              }
            }}
            className="group relative inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full text-xs font-semibold text-white bg-[#0071e3] hover:bg-[#0a84ff] active:scale-[0.98] transition-all duration-200 shadow-[0_8px_20px_rgba(0,113,227,0.3)] hover:shadow-[0_12px_28px_rgba(0,113,227,0.45)] min-h-[44px] cursor-pointer overflow-hidden border border-[#38bdf8]/40"
          >
            {/* Light sweep animation on hover */}
            <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-in-out" />
            <span>Book a Meeting</span>
            <svg className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </button>

          {onStartProject && (
            <button
              onClick={() => onStartProject('inquire')}
              className="inline-flex items-center justify-center px-6 py-3.5 rounded-full text-xs font-semibold text-[#cbd5e1] hover:text-white bg-white/5 hover:bg-white/10 active:scale-[0.98] transition-all duration-200 border border-white/10 hover:border-white/20 min-h-[44px] cursor-pointer"
            >
              Start a Project
            </button>
          )}
        </div>
      </div>

      {/* Footer Label */}
      <div className="mt-8 pt-4 border-t border-white/5 flex items-center justify-between text-[10px] font-mono text-slate-500">
        <span>Official SAKRA VISION Room</span>
        <span className="text-[#38bdf8] flex items-center gap-1">
          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14.5v-9l6 4.5-6 4.5z"/>
          </svg>
          Google Meet
        </span>
      </div>
    </motion.div>
  );
}
