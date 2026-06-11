import React from 'react';
import { motion } from 'framer-motion';

const Founder = () => {
  const socialLinks = [
    { name: 'Portfolio', url: 'https://likith-portfolio.online/', icon: '🌐' },
    { name: 'LinkedIn', url: 'https://in.linkedin.com/in/likith-naidu-anumakonda-33a347327', icon: '🔗' },
    { name: 'GitHub', url: 'https://github.com/LIKITH-3012-MAC', icon: '💻' },
    { name: 'Resume', url: 'https://likith-3012-mac.github.io/RESUME_WEB/', icon: '📄' },
    { name: 'YouTube', url: 'https://www.youtube.com/@LIKITH_NAIDU_ANUMAKONDA', icon: '📺' },
    { name: 'Instagram', url: 'https://www.instagram.com/likhith_anumakonda?igsh=MTgxZ3hrc3BtcHAzdg==', icon: '📸' },
    { name: 'X / Twitter', url: 'https://x.com/Likithdob301206?t=4FzQYS1UgCKSQBgc99xspg&s=09', icon: '🐦' },
    { name: 'Google Dev', url: 'https://g.dev/likithai', icon: '🤖' },
    { name: 'Audio.com', url: 'https://audio.com/likith-naidu-anumakonda', icon: '🎵' }
  ];

  const expertiseTags = [
    'AI / ML Systems', 'LLMs & RAG', 'Computer Vision', 'Agentic Workflows', 'Full-stack Engineering'
  ];

  return (
    <section id="founder" className="relative py-24 px-6 max-w-6xl mx-auto overflow-hidden bg-black">
      {/* Background radial glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#0071e3]/5 blur-[120px] rounded-full pointer-events-none" />

      {/* Section Header */}
      <div className="text-center mb-16">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <span className="text-xs font-mono tracking-widest text-[#0071e3] uppercase">Leadership</span>
          <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight mt-2 text-white font-sans">
            Founded by Likith Naidu Anumakonda.
          </h2>
        </motion.div>
      </div>

      <div className="flex flex-col lg:flex-row items-center justify-center gap-12 max-w-5xl mx-auto perspective-container z-10 relative">
        
        {/* Glowing Initials Avatar */}
        <motion.div
          initial={{ opacity: 0, scale: 0.85 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="relative group flex-shrink-0"
        >
          {/* Subtle blue rim glow */}
          <div className="absolute -inset-0.5 bg-[#0071e3] rounded-full blur opacity-40 group-hover:opacity-75 transition duration-500"></div>
          <div className="relative w-48 h-48 md:w-56 md:h-56 bg-black rounded-full flex items-center justify-center border border-white/10">
            <span className="text-6xl md:text-7xl font-bold bg-gradient-to-tr from-white to-[#cbd5e1] bg-clip-text text-transparent font-sans tracking-tight">
              LN
            </span>
          </div>
        </motion.div>

        {/* Founder details card (3D Apple profile card) */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="flex-1 apple-glass blue-rim p-8 md:p-10 rounded-[2.5rem] relative overflow-hidden shadow-2xl card-3d"
        >
          <h3 className="text-2xl md:text-3xl font-bold text-white mb-1 font-sans">Likith Naidu Anumakonda</h3>
          <p className="text-[#0071e3] font-mono text-xs mb-5">Founder & Lead Architect</p>
          
          <p className="text-[#94a3b8] leading-relaxed font-light mb-6 text-sm md:text-base font-sans">
            Likith Naidu Anumakonda is the driving force behind SAKRA VISION. As an AI engineer and full-stack creator, 
            he specializes in converting theoretical intelligence models into scalable, production-ready systems. 
            Through deep expertise in RAG pipelines, autonomous agents, and computer vision architectures, he guides 
            the studio's mission to bridge the gap between complex AI logic and premium user interfaces.
          </p>

          <div className="mb-6">
            <h4 className="text-[10px] font-mono text-slate-500 uppercase tracking-widest mb-3">Core Expertise</h4>
            <div className="flex flex-wrap gap-2">
              {expertiseTags.map((tag, idx) => (
                <span 
                  key={idx} 
                  className="px-3 py-1 bg-black/60 border border-white/10 text-[10px] text-slate-300 rounded-lg font-mono shadow-sm"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 border-t border-white/5 pt-6 mt-6">
            {socialLinks.map((link, idx) => (
              <a
                key={idx}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="apple-dark-button py-2 px-3 rounded-xl text-xs font-semibold cursor-pointer shadow-sm flex items-center gap-1.5 hover:border-[#38bdf8]/30 transition-all duration-200"
              >
                <span>{link.icon}</span>
                <span>{link.name}</span>
              </a>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Founder;
