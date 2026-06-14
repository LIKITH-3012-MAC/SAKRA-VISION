import React from 'react';
import { motion } from 'framer-motion';
import TiltCard from '../components/TiltCard';

export default function LeadershipView() {
  const socialLinks = [
    { name: 'Portfolio', url: 'https://likith-portfolio.online/', icon: '🌐' },
    { name: 'LinkedIn', url: 'https://in.linkedin.com/in/likith-naidu-anumakonda-33a347327', icon: '🔗' },
    { name: 'GitHub', url: 'https://github.com/LIKITH-3012-MAC', icon: '💻' },
    { name: 'Resume', url: 'https://likith-3012-mac.github.io/RESUME_WEB/', icon: '📄' },
    { name: 'YouTube', url: 'https://www.youtube.com/@LIKITH_NAIDU_ANUMAKONDA', icon: '📺' },
    { name: 'Instagram', url: 'https://www.instagram.com/likhithnaidu_anumakonda', icon: '📸' },
    { name: 'X / Twitter', url: 'https://x.com/Likithdob301206?t=4FzQYS1UgCKSQBgc99xspg&s=09', icon: '🐦' },
    { name: 'Google Dev', url: 'https://g.dev/likithai', icon: '🤖' },
    { name: 'Audio.com', url: 'https://audio.com/likith-naidu-anumakonda', icon: '🎵' }
  ];

  const expertiseTags = [
    'AI / ML Systems', 'LLMs & RAG', 'Computer Vision', 'Agentic Workflows', 'Full-stack Engineering', 'IIT Patna Certified', 'Pianist', 'Author'
  ];

  return (
    <div className="w-full relative bg-black pt-28 pb-20">
      <div className="max-w-6xl mx-auto px-6">
        
        {/* Header */}
        <div className="text-center mb-16">
          <span className="text-xs font-mono tracking-widest text-[#0071e3] uppercase font-medium">Leadership</span>
          <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight mt-2 text-white font-sans">
            Founded by Likith Naidu Anumakonda.
          </h2>
        </div>

        <div className="flex flex-col lg:flex-row items-center justify-center gap-12 max-w-5xl mx-auto z-10 relative">
          
          {/* 3D Spherical Flip Avatar */}
          <motion.div
            initial={{ opacity: 0, scale: 0.85 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="sphere-avatar-container group"
          >
            {/* Subtle blue rim glow */}
            <div className="absolute -inset-1.5 bg-[#0071e3] rounded-full blur opacity-30 group-hover:opacity-75 transition duration-500 pointer-events-none"></div>
            
            <div className="sphere-avatar-inner">
              {/* Front Side */}
              <div className="sphere-avatar-front">
                <img src="/founder-front.png" alt="Likith Naidu Anumakonda Front" />
                <div className="sphere-glass-overlay"></div>
              </div>

              {/* Back Side */}
              <div className="sphere-avatar-back">
                <img src="/founder-back.jpg" alt="Likith Naidu Anumakonda Back" />
                <div className="sphere-glass-overlay"></div>
              </div>
            </div>
          </motion.div>

          {/* Profile Card */}
          {/* Profile Card */}
          <TiltCard className="flex-1 apple-glass blue-rim p-8 md:p-10 rounded-[2.5rem] relative overflow-hidden shadow-2xl text-left hover:shadow-[0_20px_50px_rgba(0,113,227,0.12)] hover:border-[#38bdf8]/20">
            <div style={{ transformStyle: 'preserve-3d' }}>
              <h3 
                className="text-2xl md:text-3xl font-bold text-white mb-1 font-sans transition-transform duration-300"
                style={{ transform: 'translateZ(30px)' }}
              >
                Likith Naidu Anumakonda
              </h3>
              <p 
                className="text-[#0071e3] font-mono text-xs mb-5 transition-transform duration-300"
                style={{ transform: 'translateZ(20px)' }}
              >
                Founder & Lead Architect
              </p>
            </div>
            
            <p 
              className="text-[#94a3b8] leading-relaxed font-light mb-6 text-sm md:text-base font-sans transition-transform duration-300"
              style={{ transform: 'translateZ(15px)' }}
            >
              Likith Naidu Anumakonda is the driving force behind SAKRA VISION. As an AI engineer and full-stack creator, 
              he specializes in converting theoretical intelligence models into scalable, production-ready systems. 
              Through deep expertise in RAG pipelines, autonomous agents, and computer vision architectures, he guides 
              the studio's mission to bridge the gap between complex AI logic and premium user interfaces.
            </p>
 
            <div 
              className="mb-6 transition-transform duration-300"
              style={{ transform: 'translateZ(10px)' }}
            >
              <h4 className="text-[10px] font-mono text-slate-500 uppercase tracking-widest mb-3">Core Expertise & Credentials</h4>
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
 
            <div 
              className="flex flex-wrap items-center gap-2.5 border-t border-white/5 pt-6 mt-6 transition-transform duration-300 relative z-20"
              style={{ transform: 'translateZ(5px)' }}
            >
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
          </TiltCard>

        </div>

      </div>
    </div>
  );
}
