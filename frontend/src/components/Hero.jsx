import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Code2, Bot, Layers, Sparkles } from 'lucide-react';

export default function Hero({ scrollTo }) {
  const containerRef = useRef(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  // Calculate mouse tilt coordinates relative to the panel center
  const handleMouseMove = (e) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    
    const mouseX = e.clientX - rect.left - width / 2;
    const mouseY = e.clientY - rect.top - height / 2;
    
    // Rotate max 12 degrees
    const rotateX = -(mouseY / height) * 15;
    const rotateY = (mouseX / width) * 15;
    
    setTilt({ x: rotateX, y: rotateY });
  };

  const handleMouseLeave = () => {
    setTilt({ x: 0, y: 0 });
  };

  return (
    <section id="home" className="min-h-screen flex items-center justify-center pt-28 pb-16 px-6 relative overflow-hidden bg-black">
      {/* Centered subtle blue backdrop glow behind content */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-[#0071e3]/10 blur-[160px] rounded-full pointer-events-none z-0" />

      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-16 items-center w-full relative z-10">
        
        {/* Left: Apple Keynote style typography */}
        <div className="lg:col-span-7 flex flex-col gap-6 text-left justify-center">
          
          {/* Tagline Badge */}
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex self-start items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10"
          >
            <span className="text-[10px] font-mono tracking-widest text-[#94a3b8] uppercase font-medium">
              AI Product Studio
            </span>
          </motion.div>

          {/* Huge clean title */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="relative"
          >
            {/* Subtle blue text glow */}
            <div className="absolute -inset-1 bg-gradient-to-r from-[#0071e3] to-[#38bdf8] rounded-lg blur-2xl opacity-15" />
            <h1 className="text-6xl md:text-8xl font-black tracking-tight leading-none text-white font-sans relative">
              SAKRA<br/>
              <span className="bg-gradient-to-r from-white via-white to-[#94a3b8] bg-clip-text text-transparent">
                VISION
              </span>
            </h1>
            <h2 className="text-xl md:text-3xl font-semibold tracking-tight text-white mt-4">
              From Ideas to Intelligent Systems
            </h2>
          </motion.div>

          {/* Minimal description */}
          <motion.p 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="text-base md:text-lg text-[#94a3b8] max-w-lg leading-relaxed font-light font-sans"
          >
            We build intelligent AI products, automation systems, LLM/RAG tools, and full-stack platforms with clarity, speed, and real-world impact.
          </motion.p>

          {/* Apple-style CTAs */}
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="flex flex-wrap gap-4 mt-4"
          >
            <button 
              onClick={() => scrollTo('projects')}
              className="apple-button cursor-pointer"
            >
              Our Projects
              <ArrowRight className="w-4 h-4" />
            </button>
            
            <button 
              onClick={() => scrollTo('contact')}
              className="apple-dark-button cursor-pointer"
            >
              Start a Project
            </button>
          </motion.div>

          {/* Apple Keynote minimal stats bar */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.9, delay: 0.5 }}
            className="grid grid-cols-3 gap-6 mt-10 pt-8 border-t border-white/10 max-w-md"
          >
            {[
              { value: '5+ AI', label: 'DEPLOYED' },
              { value: 'RAG', label: 'OFFLINE/ON-PREM' },
              { value: 'STUDIO', label: 'AI/ML LAB' },
            ].map((stat, i) => (
              <div key={i} className="flex flex-col text-left">
                <span className="text-xl font-bold tracking-tight text-white font-sans">
                  {stat.value}
                </span>
                <span className="text-[9px] font-mono tracking-widest text-[#94a3b8] uppercase mt-1">
                  {stat.label}
                </span>
              </div>
            ))}
          </motion.div>

        </div>

        {/* Right: 3D Mouse tilt AI Engine Visual */}
        <div className="lg:col-span-5 relative flex justify-center items-center z-10 perspective-container">
          <motion.div
            ref={containerRef}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            style={{
              transform: `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
              transition: 'transform 0.15s ease-out'
            }}
            className="apple-glass w-full max-w-sm rounded-[2rem] p-8 relative flex flex-col gap-6 select-none cursor-default card-3d"
          >
            {/* Gloss Header */}
            <div className="flex justify-between items-center border-b border-white/5 pb-4">
              <span className="text-[10px] font-mono tracking-widest text-[#94a3b8] uppercase">
                ENGINE STATE // ACTIVE
              </span>
              <div className="flex gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-slate-800" />
                <div className="w-2.5 h-2.5 rounded-full bg-slate-800" />
                <div className="w-2.5 h-2.5 rounded-full bg-[#0071e3] animate-pulse" />
              </div>
            </div>

            {/* Central glowing core container with SAKRA VISION Brand Image */}
            <div className="h-60 bg-black/60 rounded-2xl border border-white/5 relative flex items-center justify-center overflow-hidden group/brand">
              {/* Subtle backlighting glow */}
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(0,113,227,0.15),transparent_70%)] pointer-events-none" />
              
              {/* Pulsing glow under logo */}
              <div className="absolute w-28 h-28 bg-[#0071e3]/15 rounded-full filter blur-[25px] opacity-40 animate-pulse pointer-events-none" style={{ animationDuration: '4s' }} />

              {/* Crisp brand logo image */}
              <img 
                src="/SAKRAVISION.png" 
                alt="SAKRA VISION Brand Asset" 
                className="w-full h-full object-contain p-6 relative z-10 transition-transform duration-500 ease-out group-hover/brand:scale-[1.03] select-none pointer-events-none"
              />

              {/* Monospace float tag capsules */}
              <div className="absolute top-4 left-4 px-2 py-0.5 bg-black/80 border border-white/10 rounded-md text-[9px] font-mono text-white tracking-widest shadow-md z-20">
                AI
              </div>
              <div className="absolute top-6 right-4 px-2 py-0.5 bg-black/80 border border-[#0071e3]/30 rounded-md text-[9px] font-mono text-[#38bdf8] tracking-widest shadow-md z-20">
                RAG
              </div>
              <div className="absolute bottom-8 left-6 px-2 py-0.5 bg-black/80 border border-white/10 rounded-md text-[9px] font-mono text-[#94a3b8] tracking-widest shadow-md z-20">
                CV
              </div>
              <div className="absolute bottom-4 right-6 px-2 py-0.5 bg-black/80 border border-white/10 rounded-md text-[9px] font-mono text-white tracking-widest shadow-md z-20">
                LLM
              </div>
            </div>

            {/* Visualizer Status */}
            <div className="flex justify-between items-center text-[10px] font-mono text-[#94a3b8] px-1">
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#38bdf8] animate-ping" />
                SYSTEM RUNNING
              </span>
              <span>100% SECURE</span>
            </div>
          </motion.div>
        </div>

      </div>
    </section>
  );
}
