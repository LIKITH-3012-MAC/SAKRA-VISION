import React from 'react';
import { motion } from 'framer-motion';
import { Target, Eye, Compass, ShieldCheck } from 'lucide-react';

export default function AboutView() {
  const philosophy = [
    {
      title: 'Practical Intelligence',
      desc: 'We focus on building functional, usable AI capabilities rather than theoretical scripts. Everything we make runs in user view.',
      icon: ShieldCheck
    },
    {
      title: 'Accelerated Automation',
      desc: 'Eliminating repetitive human operational loops by designing agentic software that reasons and executes background steps in parallel.',
      icon: Compass
    }
  ];

  return (
    <div className="w-full relative bg-black pt-28 pb-20">
      <div className="max-w-4xl mx-auto px-6 text-left">
        
        {/* Header section */}
        <div className="mb-16">
          <span className="text-xs font-mono tracking-widest text-[#0071e3] uppercase">About SAKRA VISION</span>
          <h2 className="text-4xl md:text-6xl font-extrabold tracking-tight mt-2 text-white font-sans">
            Engineering Intelligence Into Reality.
          </h2>
          <p className="text-lg md:text-xl text-[#94a3b8] font-light leading-relaxed mt-6 font-sans">
            SAKRA VISION is a high-octane AI product studio and innovation laboratory founded by <strong>Likith Naidu Anumakonda</strong>. We bridge the gap between bleeding-edge machine learning and production-ready architectures, writing tools that reduce manual overhead, index intelligence, and automate complex processes.
          </p>
        </div>

        {/* Narrative columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 border-t border-white/10 pt-12">
          <div>
            <h3 className="text-xl font-bold text-white font-sans">Converting Ideas into Intelligent Systems</h3>
            <p className="text-[#94a3b8] leading-relaxed font-light text-sm mt-3 font-sans">
              Our engineering core covers everything from deep computer vision scanning and verification pipelines to custom local LLM implementations. We build complete full-stack experiences utilizing modern API design, secure databases, and reactive user interfaces.
            </p>
          </div>
          <div>
            <h3 className="text-xl font-bold text-white font-sans">Fast Execution Cycles</h3>
            <p className="text-[#94a3b8] leading-relaxed font-light text-sm mt-3 font-sans">
              We operate with velocity. We take concepts from raw prompts and system designs and translate them into deployable Docker structures, robust FastAPI or Spring Boot backends, and responsive React frontend wrappers.
            </p>
          </div>
        </div>

        {/* Mission & Vision Cards (frosted glass) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-16">
          
          {/* Mission */}
          <div className="apple-glass p-8 rounded-3xl border border-white/5 relative overflow-hidden transition-all duration-300 hover:border-[#38bdf8]/20 group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-[#0071e3]/5 rounded-full blur-2xl pointer-events-none" />
            <div className="w-10 h-10 rounded-xl bg-black/60 border border-white/10 flex items-center justify-center mb-6">
              <Target className="w-5 h-5 text-[#38bdf8]" />
            </div>
            <h4 className="text-lg font-bold mb-3 text-white font-sans">Our Mission</h4>
            <p className="text-[#94a3b8] leading-relaxed font-light text-xs md:text-sm font-sans">
              To build intelligent, highly accessible, and impact-driven AI products that empower businesses, researchers, and public communities to solve complex challenges with custom engineering and accelerated automation.
            </p>
          </div>

          {/* Vision */}
          <div className="apple-glass p-8 rounded-3xl border border-white/5 relative overflow-hidden transition-all duration-300 hover:border-[#38bdf8]/20 group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-[#0071e3]/5 rounded-full blur-2xl pointer-events-none" />
            <div className="w-10 h-10 rounded-xl bg-black/60 border border-white/10 flex items-center justify-center mb-6">
              <Eye className="w-5 h-5 text-[#38bdf8]" />
            </div>
            <h4 className="text-lg font-bold mb-3 text-white font-sans">Our Vision</h4>
            <p className="text-[#94a3b8] leading-relaxed font-light text-xs md:text-sm font-sans">
              To become a global AI innovation laboratory and product studio recognized for engineering reliable, secure, and creatively inspired hardware/software products designed in India for the global deep-tech ecosystem.
            </p>
          </div>

        </div>

        {/* Brand Philosophy */}
        <div className="mt-20 border-t border-white/10 pt-12">
          <span className="text-xs font-mono tracking-widest text-[#0071e3] uppercase">Philosophy</span>
          <h3 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight mt-2 mb-8 font-sans">
            How we think.
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {philosophy.map((item, idx) => {
              const Icon = item.icon;
              return (
                <div key={idx} className="flex gap-4">
                  <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center flex-shrink-0 text-[#38bdf8]">
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <h5 className="font-bold text-white text-base font-sans">{item.title}</h5>
                    <p className="text-[#94a3b8] font-light text-xs md:text-sm mt-1.5 leading-relaxed font-sans">
                      {item.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
}
