import React from 'react';
import { Cpu } from 'lucide-react';

export default function TechStack() {
  const techGroups = [
    {
      label: 'AI & Intelligence',
      dotColor: 'bg-[#38bdf8]',
      items: ['Artificial Intelligence', 'Machine Learning', 'LLMs', 'RAG', 'OpenCV', 'AI Agents', 'Prompt Engineering']
    },
    {
      label: 'Languages & Frameworks',
      dotColor: 'bg-white',
      items: ['Python', 'Java', 'React', 'FastAPI', 'Spring Boot', 'REST APIs', 'JWT Security']
    },
    {
      label: 'Data, Cloud & Tooling',
      dotColor: 'bg-[#60a5fa]',
      items: ['MySQL', 'MongoDB', 'Vector Databases', 'Docker', 'Linux', 'GitHub', 'Render', 'Vercel', 'Cloud Deployment']
    }
  ];

  const tickerItems = [
    'Inference & Agentic Loops',
    'Vector Embeddings & RAG',
    'FastAPI + MySQL Persistence',
    'OpenCV Verification Pipelines',
    'Aiven Cloud SSL Infrastructure'
  ];

  return (
    <section id="tech-stack" className="py-24 bg-black relative">
      <div className="max-w-6xl mx-auto px-5 sm:px-6 text-center">
        {/* Section Header */}
        <span className="text-xs font-mono tracking-widest text-[#38bdf8] uppercase font-medium">
          Tech Specs
        </span>
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight mt-2 mb-12 text-white font-sans">
          Powered by AI, automation, and full-stack engineering.
        </h2>

        {/* Grouped Tech Capsules */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto z-10 relative text-left">
          {techGroups.map((group) => (
            <div
              key={group.label}
              className="apple-glass p-6 rounded-3xl border border-white/10 flex flex-col gap-4"
            >
              <div className="flex items-center gap-2 border-b border-white/10 pb-3">
                <span className={`w-2 h-2 rounded-full shrink-0 ${group.dotColor}`} aria-hidden="true" />
                <h3 className="text-xs font-mono uppercase tracking-wider text-slate-200 font-semibold">
                  {group.label}
                </h3>
              </div>

              <div className="flex flex-wrap gap-2">
                {group.items.map((tech) => (
                  <span
                    key={tech}
                    className="px-3.5 py-2 bg-white/[0.04] border border-white/15 hover:border-[#38bdf8]/45 rounded-xl flex items-center gap-2 cursor-default transition-colors duration-200 font-sans text-xs font-medium text-white"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Subtle Architectural Ticker (wraps cleanly under prefers-reduced-motion) */}
        <div className="relative w-full overflow-hidden mt-16 py-4 border-y border-white/10 bg-black max-w-5xl mx-auto">
          <div aria-hidden="true" className="hidden motion-safe:block absolute inset-y-0 left-0 w-20 bg-gradient-to-r from-black to-transparent z-10 pointer-events-none" />
          <div aria-hidden="true" className="hidden motion-safe:block absolute inset-y-0 right-0 w-20 bg-gradient-to-l from-black to-transparent z-10 pointer-events-none" />

          <div className="flex gap-10 whitespace-nowrap animate-marquee items-center">
            {tickerItems.map((item) => (
              <span key={item} className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-slate-300">
                <Cpu className="w-3.5 h-3.5 text-[#38bdf8] shrink-0" aria-hidden="true" />
                <span>{item}</span>
              </span>
            ))}
            {tickerItems.map((item) => (
              <span
                key={`dup-${item}`}
                aria-hidden="true"
                className="inline-flex motion-reduce:hidden items-center gap-2 text-xs font-mono uppercase tracking-wider text-slate-300"
              >
                <Cpu className="w-3.5 h-3.5 text-[#38bdf8] shrink-0" />
                <span>{item}</span>
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
