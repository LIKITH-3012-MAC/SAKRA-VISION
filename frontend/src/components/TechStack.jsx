import React from 'react';

export default function TechStack() {
  const techs = [
    { name: 'Artificial Intelligence', category: 'Core' },
    { name: 'Machine Learning', category: 'Core' },
    { name: 'Python', category: 'Language' },
    { name: 'Java', category: 'Language' },
    { name: 'Spring Boot', category: 'Backend' },
    { name: 'React', category: 'Frontend' },
    { name: 'FastAPI', category: 'Backend' },
    { name: 'MySQL', category: 'Database' },
    { name: 'MongoDB', category: 'Database' },
    { name: 'OpenCV', category: 'Vision' },
    { name: 'LLMs', category: 'Core' },
    { name: 'RAG', category: 'Core' },
    { name: 'GitHub', category: 'Tools' },
    { name: 'Render', category: 'Cloud' },
    { name: 'Vercel', category: 'Cloud' },
    { name: 'Docker', category: 'Tools' },
    { name: 'Linux', category: 'Tools' },
    { name: 'REST APIs', category: 'Core' },
    { name: 'JWT Security', category: 'Core' },
    { name: 'Cloud Deployment', category: 'Cloud' },
    { name: 'AI Agents', category: 'Core' },
    { name: 'Prompt Engineering', category: 'Core' },
    { name: 'Vector Databases', category: 'Database' }
  ];

  return (
    <section id="tech-stack" className="py-24 bg-black relative">
      <div className="max-w-6xl mx-auto px-6 text-center">
        
        {/* Section Header */}
        <span className="text-xs font-mono tracking-widest text-[#0071e3] uppercase">
          Tech Specs
        </span>
        <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight mt-2 mb-12 text-white font-sans">
          Powered by AI, automation, and full-stack engineering.
        </h2>

        {/* Tech Capsules Grid (Blue/White Minimal Style) */}
        <div className="flex flex-wrap justify-center gap-3 max-w-5xl mx-auto z-10 relative">
          {techs.map((tech, index) => (
            <div 
              key={index} 
              className="px-4.5 py-2.5 bg-white/[0.02] border border-white/10 hover:border-[#0071e3]/40 hover:shadow-[0_0_15px_rgba(0,113,227,0.1)] rounded-full flex items-center gap-2 cursor-default transition-all duration-300 font-sans shadow-sm"
            >
              <div className={`w-1.5 h-1.5 rounded-full ${
                tech.category === 'Core' ? 'bg-[#38bdf8]' :
                tech.category === 'Language' ? 'bg-white' :
                tech.category === 'Backend' ? 'bg-[#0071e3]' :
                tech.category === 'Database' ? 'bg-[#38bdf8]' :
                'bg-slate-500'
              }`} />
              <span className="text-xs font-semibold tracking-wide text-white">{tech.name}</span>
            </div>
          ))}
        </div>

        {/* Infinite Scrolling Ticker (Apple Minimal Ticker) */}
        <div className="relative w-full overflow-hidden mt-20 py-4 border-y border-white/10 bg-black max-w-5xl mx-auto">
          <div className="absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-black to-transparent z-10 pointer-events-none" />
          <div className="absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-black to-transparent z-10 pointer-events-none" />
          
          <div className="flex gap-12 whitespace-nowrap animate-marquee">
            <span className="text-[10px] font-mono uppercase tracking-widest text-[#94a3b8]">⚙️ COMPILING INFERENCE PARALLEL LOOPS</span>
            <span className="text-[10px] font-mono uppercase tracking-widest text-[#94a3b8]">⚙️ RETRIEVING EMBEDDINGS VECTOR RETRIEVER</span>
            <span className="text-[10px] font-mono uppercase tracking-widest text-[#94a3b8]">⚙️ FASTAPI MYSQL PERSISTENCE MODULE ACTIVE</span>
            <span className="text-[10px] font-mono uppercase tracking-widest text-[#94a3b8]">⚙️ OPENCV VERIFICATION MATRIX SCAN COMPLETED</span>
            <span className="text-[10px] font-mono uppercase tracking-widest text-[#94a3b8]">⚙️ AIVEN CLOUD ENGINE CONNECTION READY</span>
            {/* Duplicated for seamless loop */}
            <span className="text-[10px] font-mono uppercase tracking-widest text-[#94a3b8]">⚙️ COMPILING INFERENCE PARALLEL LOOPS</span>
            <span className="text-[10px] font-mono uppercase tracking-widest text-[#94a3b8]">⚙️ RETRIEVING EMBEDDINGS VECTOR RETRIEVER</span>
            <span className="text-[10px] font-mono uppercase tracking-widest text-[#94a3b8]">⚙️ FASTAPI MYSQL PERSISTENCE MODULE ACTIVE</span>
            <span className="text-[10px] font-mono uppercase tracking-widest text-[#94a3b8]">⚙️ OPENCV VERIFICATION MATRIX SCAN COMPLETED</span>
            <span className="text-[10px] font-mono uppercase tracking-widest text-[#94a3b8]">⚙️ AIVEN CLOUD ENGINE CONNECTION READY</span>
          </div>
        </div>

      </div>
    </section>
  );
}
