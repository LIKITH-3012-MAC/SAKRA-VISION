import React, { useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

export default function Hero({ scrollTo }) {
  const containerRef = useRef(null);
  const rafRef = useRef(null);

  useEffect(() => {
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  const handleMouseMove = (e) => {
    if (!containerRef.current || window.innerWidth < 1024) return;
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return;
    const clientX = e.clientX;
    const clientY = e.clientY;
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(() => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const mouseX = clientX - rect.left - rect.width / 2;
      const mouseY = clientY - rect.top - rect.height / 2;
      const rotateX = -(mouseY / rect.height) * 8;
      const rotateY = (mouseX / rect.width) * 8;
      containerRef.current.style.transition = 'box-shadow 0.3s ease, border-color 0.3s ease';
      containerRef.current.style.transform = `perspective(1000px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg)`;
    });
  };

  const handleMouseLeave = () => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    if (containerRef.current) {
      containerRef.current.style.transition = 'transform 0.35s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.3s ease, border-color 0.3s ease';
      containerRef.current.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg)';
    }
  };

  return (
    <section id="home" className="min-h-screen flex items-center justify-center pt-28 pb-16 px-5 sm:px-6 relative overflow-hidden bg-black">
      {/* Centered subtle blue backdrop glow behind content */}
      <div
        aria-hidden="true"
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-[#0071e3]/10 blur-[160px] rounded-full pointer-events-none z-0"
      />

      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center w-full relative z-10">
        {/* Left: Apple Keynote style typography */}
        <div className="lg:col-span-7 flex flex-col gap-6 text-left justify-center">
          {/* Tagline Badge */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex self-start items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/[0.05] border border-white/15"
          >
            <span className="text-xs font-mono tracking-wider text-slate-300 uppercase font-medium">
              AI Product Studio
            </span>
          </motion.div>

          {/* Clean title */}
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.08 }}
            className="relative"
          >
            <div aria-hidden="true" className="absolute -inset-1 bg-gradient-to-r from-[#0071e3] to-[#38bdf8] rounded-lg blur-2xl opacity-15 pointer-events-none" />
            <h1 className="text-5xl sm:text-6xl md:text-8xl font-black tracking-tight leading-none text-white font-sans relative">
              SAKRA<br />
              <span className="bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
                VISION
              </span>
            </h1>
            <p className="text-xl md:text-3xl font-semibold tracking-tight text-slate-100 mt-4">
              From Ideas to Intelligent Systems
            </p>
          </motion.div>

          {/* Minimal description */}
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.16 }}
            className="text-base md:text-lg text-slate-300 max-w-lg leading-relaxed font-light font-sans"
          >
            We build intelligent AI products, automation systems, LLM/RAG tools, and full-stack platforms with clarity, speed, and real-world impact.
          </motion.p>

          {/* Apple-style CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.24 }}
            className="flex flex-wrap gap-4 mt-2"
          >
            <button
              type="button"
              onClick={() => scrollTo?.('projects')}
              className="apple-button cursor-pointer min-h-[46px]"
            >
              <span>Our Projects</span>
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </button>

            <button
              type="button"
              onClick={() => scrollTo?.('contact')}
              className="apple-dark-button cursor-pointer min-h-[46px]"
            >
              Start a Project
            </button>
          </motion.div>

          {/* Stats bar */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.7, delay: 0.35 }}
            className="grid grid-cols-3 gap-4 sm:gap-6 mt-8 pt-8 border-t border-white/10 max-w-md"
          >
            {[
              { value: '5+ AI', label: 'DEPLOYED' },
              { value: 'RAG', label: 'OFFLINE / ON-PREM' },
              { value: 'STUDIO', label: 'AI / ML LAB' },
            ].map((stat, i) => (
              <div key={i} className="flex flex-col text-left">
                <span className="text-lg sm:text-xl font-bold tracking-tight text-white font-sans">
                  {stat.value}
                </span>
                <span className="text-[11px] font-mono tracking-wider text-slate-300 uppercase mt-1">
                  {stat.label}
                </span>
              </div>
            ))}
          </motion.div>
        </div>

        {/* Right: 3D Mouse tilt AI Engine Visual */}
        <div className="lg:col-span-5 relative flex justify-center items-center z-10 perspective-container">
          <div
            ref={containerRef}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            className="apple-glass blue-rim w-full max-w-sm rounded-[2rem] p-7 sm:p-8 relative flex flex-col gap-6 select-none cursor-default hover:border-[#38bdf8]/40"
          >
            {/* Gloss Header */}
            <div className="flex justify-between items-center border-b border-white/10 pb-4">
              <span className="text-[11px] font-mono tracking-wider text-slate-300 uppercase">
                ENGINE STATE // ACTIVE
              </span>
              <div className="flex gap-1.5" aria-hidden="true">
                <div className="w-2.5 h-2.5 rounded-full bg-slate-700" />
                <div className="w-2.5 h-2.5 rounded-full bg-slate-700" />
                <div className="w-2.5 h-2.5 rounded-full bg-[#38bdf8] animate-pulse" />
              </div>
            </div>

            {/* Central glowing core container */}
            <div className="h-60 bg-black rounded-2xl border border-white/10 relative flex items-center justify-center overflow-hidden group/brand">
              <div aria-hidden="true" className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(0,113,227,0.2),transparent_72%)] pointer-events-none" />
              <div aria-hidden="true" className="absolute w-28 h-28 bg-[#0071e3]/20 rounded-full filter blur-[28px] opacity-50 animate-pulse pointer-events-none" style={{ animationDuration: '4s' }} />

              <img
                src="/SAKRAVISION.png"
                alt="SAKRA VISION Brand Asset"
                width="320"
                height="213"
                className="w-full h-full object-contain p-6 relative z-10 mix-blend-lighten transition-transform duration-500 ease-out group-hover/brand:scale-[1.03] select-none pointer-events-none"
              />

              <div className="absolute top-3.5 left-3.5 px-2.5 py-0.5 bg-black/85 border border-white/15 rounded-md text-[11px] font-mono text-white tracking-wider shadow-md z-20">
                AI
              </div>
              <div className="absolute top-5 right-3.5 px-2.5 py-0.5 bg-black/85 border border-[#38bdf8]/40 rounded-md text-[11px] font-mono text-[#38bdf8] tracking-wider shadow-md z-20">
                RAG
              </div>
              <div className="absolute bottom-7 left-5 px-2.5 py-0.5 bg-black/85 border border-white/15 rounded-md text-[11px] font-mono text-slate-200 tracking-wider shadow-md z-20">
                CV
              </div>
              <div className="absolute bottom-3.5 right-5 px-2.5 py-0.5 bg-black/85 border border-white/15 rounded-md text-[11px] font-mono text-white tracking-wider shadow-md z-20">
                LLM
              </div>
            </div>

            {/* Visualizer Status */}
            <div className="flex justify-between items-center text-[11px] font-mono text-slate-300 px-1">
              <span className="flex items-center gap-1.5">
                <span aria-hidden="true" className="w-1.5 h-1.5 rounded-full bg-[#38bdf8] animate-ping" />
                SYSTEM RUNNING
              </span>
              <span>100% SECURE</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
