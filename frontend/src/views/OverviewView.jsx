import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Cpu, Bot, Layers, Sparkles, CheckCircle2 } from 'lucide-react';

export default function OverviewView({ setActiveView }) {
  const containerRef = useRef(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    
    const mouseX = e.clientX - rect.left - width / 2;
    const mouseY = e.clientY - rect.top - height / 2;
    
    const rotateX = -(mouseY / height) * 15;
    const rotateY = (mouseX / width) * 15;
    
    setTilt({ x: rotateX, y: rotateY });
  };

  const handleMouseLeave = () => {
    setTilt({ x: 0, y: 0 });
  };

  const stats = [
    { value: '5+ AI', label: 'DEPLOYED PRODUCTS' },
    { value: 'RAG', label: 'OFFLINE/ON-PREM CORE' },
    { value: 'STUDIO', label: 'AI/ML INNOVATION LAB' },
  ];

  return (
    <div className="w-full relative bg-black pt-28 pb-16 overflow-hidden">
      {/* Background brand logo watermark */}
      <div className="sakra-watermark absolute top-12 md:top-20 right-[-15%] md:right-[-10%] opacity-[0.02] md:opacity-[0.04] pointer-events-none" />

      <div className="max-w-6xl mx-auto px-6 relative z-10">
        
        {/* Centered blue glow */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-[#0071e3]/10 blur-[160px] rounded-full pointer-events-none z-0" />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center w-full relative z-10">
          
          {/* Left Hero Content */}
          <div className="lg:col-span-7 flex flex-col gap-6 text-left justify-center">
            
            <div className="inline-flex self-start items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10">
              <span className="text-[10px] font-mono tracking-widest text-[#94a3b8] uppercase font-medium">
                AI Product Studio
              </span>
            </div>

            <div className="relative">
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
            </div>

            <p className="text-base md:text-lg text-[#94a3b8] max-w-lg leading-relaxed font-light font-sans">
              We build intelligent AI products, automation systems, LLM/RAG tools, and full-stack platforms with clarity, speed, and real-world impact.
            </p>

            <div className="flex flex-wrap gap-4 mt-4">
              <button 
                onClick={() => setActiveView('projects')}
                className="apple-button cursor-pointer flex items-center gap-2"
              >
                Explore Projects
                <ArrowRight className="w-4 h-4" />
              </button>
              
              <button 
                onClick={() => setActiveView('inquire')}
                className="apple-dark-button cursor-pointer"
              >
                Start a Project
              </button>
            </div>

            <div className="grid grid-cols-3 gap-6 mt-10 pt-8 border-t border-white/10 max-w-md">
              {stats.map((stat, i) => (
                <div key={i} className="flex flex-col text-left">
                  <span className="text-xl font-bold tracking-tight text-white font-sans">
                    {stat.value}
                  </span>
                  <span className="text-[9px] font-mono tracking-widest text-[#94a3b8] uppercase mt-1">
                    {stat.label}
                  </span>
                </div>
              ))}
            </div>

          </div>

          {/* Right 3D Visual Panel */}
          <div className="lg:col-span-5 relative flex justify-center items-center z-10 perspective-container">
            <div
              ref={containerRef}
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
              style={{
                transform: `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
                transition: 'transform 0.15s ease-out'
              }}
              className="apple-glass blue-rim w-full max-w-sm rounded-[2rem] p-8 relative flex flex-col gap-6 select-none cursor-default card-3d"
            >
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

              <div className="h-60 bg-black/60 rounded-2xl border border-white/5 relative flex items-center justify-center overflow-hidden group/brand">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(0,113,227,0.15),transparent_70%)] pointer-events-none" />
                <div className="absolute w-28 h-28 bg-[#0071e3]/15 rounded-full filter blur-[25px] opacity-40 animate-pulse pointer-events-none" style={{ animationDuration: '4s' }} />

                <img 
                  src="/SAKRAVISION.png" 
                  alt="SAKRA VISION Brand Asset" 
                  className="w-full h-full object-contain p-6 relative z-10 transition-transform duration-500 ease-out group-hover/brand:scale-[1.03]"
                />

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

              <div className="flex justify-between items-center text-[10px] font-mono text-[#94a3b8] px-1">
                <span className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#38bdf8] animate-ping" />
                  SYSTEM RUNNING
                </span>
                <span>100% SECURE</span>
              </div>
            </div>
          </div>

        </div>

        {/* Company Statement & Featured Project Block */}
        <div className="mt-32 border-t border-white/10 pt-16 flex flex-col md:flex-row gap-12 justify-between items-start text-left">
          <div className="md:w-1/2">
            <h3 className="text-xs font-mono tracking-widest text-[#0071e3] uppercase">Brand Statement</h3>
            <p className="text-xl md:text-2xl font-semibold tracking-tight text-white mt-3 font-sans leading-snug">
              "We operate at the interface of theoretical AI and practical product engineering, converting raw algorithms into responsive, highly interactive systems."
            </p>
          </div>
          <div className="md:w-5/12 bg-white/[0.01] border border-white/5 rounded-3xl p-6 relative overflow-hidden flex flex-col justify-between min-h-[200px]">
            <div className="absolute bottom-0 right-0 w-24 h-24 bg-[#0071e3]/5 rounded-full blur-2xl pointer-events-none" />
            <div>
              <span className="text-[9px] font-mono tracking-widest text-[#38bdf8] uppercase">Featured Product Preview</span>
              <h4 className="text-lg font-bold text-white mt-1.5">Resolvit AI</h4>
              <p className="text-[#94a3b8] text-xs font-sans mt-2">
                An AI-powered civic issue resolution platform connecting citizens, municipal authorities, and NGOs via priority scoring.
              </p>
            </div>
            <button 
              onClick={() => setActiveView('projects')}
              className="text-xs text-[#0071e3] hover:text-[#0a84ff] font-bold flex items-center gap-1.5 self-start mt-6 group transition-all"
            >
              Learn More 
              <ArrowRight className="w-3.5 h-3.5 transition-transform duration-250 group-hover:translate-x-1" />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
