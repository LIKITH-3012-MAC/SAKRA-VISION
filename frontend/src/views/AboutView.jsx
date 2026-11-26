import React from 'react';
import { Target, Eye, Compass, ShieldCheck, ArrowRight } from 'lucide-react';
import FAQSection from '../components/FAQSection';
import SEO from '../components/SEO';

export default function AboutView({ setActiveView }) {
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
      <SEO title="About Sakra Vision | AI Product Studio by Likith Naidu" />
      <div className="max-w-4xl mx-auto px-5 sm:px-6 text-left">
        {/* Header section */}
        <div className="mb-14">
          <span className="text-xs font-mono tracking-widest text-[#38bdf8] uppercase font-medium">
            About SAKRA VISION
          </span>
          <h1 className="text-3xl sm:text-4xl md:text-6xl font-extrabold tracking-tight mt-2 text-white font-sans">
            Engineering Intelligence Into Reality.
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-slate-200 font-light leading-relaxed mt-6 font-sans">
            SAKRA VISION is an AI product studio established in 2026 by <strong className="font-semibold text-white">Likith Naidu Anumakonda</strong>. We build practical intelligent systems using Artificial Intelligence, Machine Learning, Computer Vision, LLMs, RAG, automation, AI agents, and full-stack web technologies. Our goal is simple: convert powerful ideas into useful, deployable, secure, and scalable real-world products.
          </p>
        </div>

        {/* Narrative columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 sm:gap-10 border-t border-white/10 pt-12">
          <div>
            <h2 className="text-xl font-bold text-white font-sans">
              Converting Ideas into Intelligent Systems
            </h2>
            <p className="text-slate-300 leading-relaxed font-normal text-sm mt-3 font-sans">
              Our engineering core covers everything from deep computer vision scanning and verification pipelines to custom local LLM implementations. We build complete full-stack experiences utilizing modern API design, secure databases, and reactive user interfaces.
            </p>
          </div>
          <div>
            <h2 className="text-xl font-bold text-white font-sans">
              Fast Execution Cycles
            </h2>
            <p className="text-slate-300 leading-relaxed font-normal text-sm mt-3 font-sans">
              We operate with velocity. We take concepts from raw prompts and system designs and translate them into deployable Docker structures, robust FastAPI or Spring Boot backends, and responsive React frontend wrappers.
            </p>
          </div>
        </div>

        {/* Mission & Vision Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 mt-14">
          <div className="apple-glass p-7 sm:p-8 rounded-3xl border border-white/10 relative overflow-hidden transition-colors duration-300 hover:border-[#38bdf8]/30 group">
            <div aria-hidden="true" className="absolute top-0 right-0 w-24 h-24 bg-[#0071e3]/8 rounded-full blur-2xl pointer-events-none" />
            <div className="w-10 h-10 rounded-xl bg-black/70 border border-white/15 flex items-center justify-center mb-5">
              <Target className="w-5 h-5 text-[#38bdf8]" aria-hidden="true" />
            </div>
            <h2 className="text-lg font-bold mb-3 text-white font-sans">Our Mission</h2>
            <p className="text-slate-300 leading-relaxed font-normal text-sm font-sans">
              To build intelligent, highly accessible, and impact-driven AI products that empower businesses, researchers, and public communities to solve complex challenges with custom engineering and accelerated automation.
            </p>
          </div>

          <div className="apple-glass p-7 sm:p-8 rounded-3xl border border-white/10 relative overflow-hidden transition-colors duration-300 hover:border-[#38bdf8]/30 group">
            <div aria-hidden="true" className="absolute top-0 right-0 w-24 h-24 bg-[#0071e3]/8 rounded-full blur-2xl pointer-events-none" />
            <div className="w-10 h-10 rounded-xl bg-black/70 border border-white/15 flex items-center justify-center mb-5">
              <Eye className="w-5 h-5 text-[#38bdf8]" aria-hidden="true" />
            </div>
            <h2 className="text-lg font-bold mb-3 text-white font-sans">Our Vision</h2>
            <p className="text-slate-300 leading-relaxed font-normal text-sm font-sans">
              To become a global AI innovation laboratory and product studio recognized for engineering reliable, secure, and creatively inspired hardware/software products designed in India for the global deep-tech ecosystem.
            </p>
          </div>
        </div>

        {/* Brand Philosophy */}
        <div className="mt-16 border-t border-white/10 pt-12">
          <span className="text-xs font-mono tracking-widest text-[#38bdf8] uppercase font-medium">
            Philosophy
          </span>
          <h2 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight mt-2 mb-8 font-sans">
            How we think.
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {philosophy.map((item, idx) => {
              const Icon = item.icon;
              return (
                <div key={idx} className="flex gap-4">
                  <div className="w-9 h-9 rounded-lg bg-white/[0.06] border border-white/15 flex items-center justify-center flex-shrink-0 text-[#38bdf8]">
                    <Icon className="w-4 h-4" aria-hidden="true" />
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-base font-sans">{item.title}</h3>
                    <p className="text-slate-300 font-normal text-sm mt-1.5 leading-relaxed font-sans">
                      {item.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="mt-12">
          <button
            type="button"
            onClick={() => setActiveView('inquire')}
            className="apple-dark-button text-xs sm:text-sm cursor-pointer inline-flex items-center gap-2 min-h-[44px]"
          >
            <span>Contact Sakra Vision</span>
            <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
          </button>
        </div>

        {/* Embedded FAQ Section (compact container padding so it aligns with AboutView width) */}
        <div className="mt-16 border-t border-white/10 pt-12">
          <FAQSection embedded />
        </div>
      </div>
    </div>
  );
}
