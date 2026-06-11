import React from 'react';
import { CheckCircle2 } from 'lucide-react';

export default function WhyUs() {
  const points = [
    { title: 'Practical AI', desc: 'Focusing on building functional, usable AI capabilities rather than theoretical scripts. Everything we make runs in user view.' },
    { title: 'Clean Engineering', desc: 'Organized structures, solid database schemas, robust APIs, and fully modular code components meant to scale.' },
    { title: 'Fast Execution', desc: 'Agile development cycles allowing us to transition quickly from proof-of-concept models to production.' },
    { title: 'Real-World Focus', desc: 'Every project addresses actual bottlenecks, customer queries, payment validations, or educational gaps.' },
    { title: 'Creative Product Thinking', desc: 'Blending clean developer principles with UI elegance, ensuring products look stunning and operate naturally.' },
    { title: 'Scalable Systems', desc: 'Deploying servers and databases that support high availability, data consistency, and secure access.' }
  ];

  return (
    <section className="py-24 bg-[#020617]/40 relative border-t border-white/5">
      <div className="max-w-6xl mx-auto px-6">
        
        {/* Section Header */}
        <div className="text-center mb-16">
          <span className="text-xs font-mono tracking-widest text-[#0071e3] uppercase">
            Value Proposition
          </span>
          <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight mt-2 text-white font-sans">
            Why SAKRA VISION?
          </h2>
          <p className="text-[#94a3b8] max-w-xl mx-auto text-sm font-light mt-4 font-sans">
            We do not just build isolated code scripts. We engineer complete end-to-end ecosystems that can be deployed, tested, and utilized in real environments.
          </p>
        </div>

        {/* Highlight Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 relative z-10">
          {points.map((item, i) => (
            <div key={i} className="apple-glass p-8 rounded-3xl border border-white/5 text-left transition-all duration-300 hover:translate-y-[-5px] hover:border-[#0071e3]/40 group select-none cursor-default shadow-md">
              <div className="w-10 h-10 rounded-xl bg-black flex items-center justify-center mb-6 border border-white/10">
                <CheckCircle2 className="w-5 h-5 text-[#38bdf8]" />
              </div>
              <h3 className="text-base font-bold mb-2 text-white tracking-wide font-sans">{item.title}</h3>
              <p className="text-[#94a3b8] text-xs md:text-sm leading-relaxed font-light font-sans">{item.desc}</p>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
