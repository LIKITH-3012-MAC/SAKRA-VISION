import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Globe,
  Linkedin,
  Github,
  FileText,
  Youtube,
  Instagram,
  Share2,
  Code2,
  Music,
  ArrowUpRight
} from 'lucide-react';
import TiltCard from './TiltCard';

const Founder = () => {
  const [isAvatarFlipped, setIsAvatarFlipped] = useState(false);

  const socialLinks = [
    { name: 'Portfolio', url: 'https://likith-portfolio.online/', icon: Globe },
    { name: 'LinkedIn', url: 'https://in.linkedin.com/in/likith-naidu-anumakonda-33a347327', icon: Linkedin },
    { name: 'GitHub', url: 'https://github.com/LIKITH-3012-MAC', icon: Github },
    { name: 'Resume', url: 'https://likith-3012-mac.github.io/RESUME_WEB/', icon: FileText },
    { name: 'YouTube', url: 'https://www.youtube.com/@LIKITH_NAIDU_ANUMAKONDA', icon: Youtube },
    { name: 'Instagram', url: 'https://www.instagram.com/likhithnaidu_anumakonda', icon: Instagram },
    { name: 'X / Twitter', url: 'https://x.com/Likithdob301206?t=4FzQYS1UgCKSQBgc99xspg&s=09', icon: Share2 },
    { name: 'Google Dev', url: 'https://g.dev/likithai', icon: Code2 },
    { name: 'Audio.com', url: 'https://audio.com/likith-naidu-anumakonda', icon: Music }
  ];

  const expertiseTags = [
    'AI / ML Systems',
    'LLMs & RAG',
    'Computer Vision',
    'Agentic Workflows',
    'Full-stack Engineering'
  ];

  return (
    <section id="founder" className="relative py-24 px-5 sm:px-6 max-w-6xl mx-auto overflow-hidden bg-black">
      <div
        aria-hidden="true"
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#0071e3]/5 blur-[120px] rounded-full pointer-events-none"
      />

      {/* Section Header */}
      <div className="text-center mb-14 sm:mb-16">
        <span className="text-xs font-mono tracking-widest text-[#38bdf8] uppercase font-medium">
          Leadership
        </span>
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight mt-2 text-white font-sans">
          Founded by Likith Naidu Anumakonda.
        </h2>
      </div>

      <div className="flex flex-col lg:flex-row items-center justify-center gap-10 sm:gap-12 max-w-5xl mx-auto z-10 relative">
        {/* Interactive 3D Spherical Flip Avatar */}
        <motion.div
          initial={{ opacity: 0, scale: 0.94 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, amount: 'some' }}
          transition={{ duration: 0.5 }}
          className="flex flex-col items-center gap-3 shrink-0"
        >
          <button
            type="button"
            data-flipped={isAvatarFlipped}
            aria-pressed={isAvatarFlipped}
            aria-label={isAvatarFlipped ? 'Show primary founder portrait photo' : 'Flip founder portrait photo'}
            onClick={() => setIsAvatarFlipped((prev) => !prev)}
            className="sphere-avatar-container group rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#38bdf8] focus-visible:ring-offset-4 focus-visible:ring-offset-black"
          >
            <div
              aria-hidden="true"
              className="absolute -inset-1.5 bg-[#0071e3] rounded-full blur opacity-30 group-hover:opacity-75 transition duration-500 pointer-events-none"
            />

            <div className="sphere-avatar-inner">
              <div className="sphere-avatar-front">
                <img
                  src="/founder-front.png"
                  alt="Likith Naidu Anumakonda, Founder and CEO of SAKRA VISION"
                  width="224"
                  height="224"
                  decoding="async"
                />
                <div className="sphere-glass-overlay" />
              </div>

              <div className="sphere-avatar-back">
                <img
                  src="/founder-back.jpg"
                  alt="Likith Naidu Anumakonda portrait alternate view"
                  width="224"
                  height="224"
                  decoding="async"
                  loading="lazy"
                />
                <div className="sphere-glass-overlay" />
              </div>
            </div>
          </button>
          <span className="text-xs font-mono text-slate-300">
            Hover or tap portrait to flip
          </span>
        </motion.div>

        {/* Founder details card */}
        <TiltCard className="flex-1 apple-glass blue-rim p-6 sm:p-8 md:p-10 rounded-[2rem] relative overflow-hidden shadow-2xl text-left">
          <h3 className="text-2xl md:text-3xl font-bold text-white mb-1 font-sans">
            Likith Naidu Anumakonda
          </h3>
          <p className="text-[#38bdf8] font-mono text-xs sm:text-sm mb-5 font-medium">
            Founder &amp; CEO · Lead Architect
          </p>

          <p className="text-slate-200 leading-relaxed font-normal mb-6 text-sm md:text-base font-sans">
            Likith Naidu Anumakonda is the driving force behind SAKRA VISION. As an AI engineer and full-stack creator,
            he specializes in converting theoretical intelligence models into scalable, production-ready systems.
            Through deep expertise in RAG pipelines, autonomous agents, and computer vision architectures, he guides
            the studio&apos;s mission to bridge the gap between complex AI logic and premium user interfaces.
          </p>

          <div className="mb-6">
            <h4 className="text-xs font-mono text-slate-300 uppercase tracking-wider mb-3 font-semibold">
              Core Expertise
            </h4>
            <div className="flex flex-wrap gap-2">
              {expertiseTags.map((tag, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1.5 bg-black/60 border border-white/15 text-xs text-slate-100 rounded-lg font-mono shadow-sm"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 border-t border-white/10 pt-6 mt-6">
            {socialLinks.map((link, idx) => {
              const Icon = link.icon;
              return (
                <a
                  key={idx}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="apple-dark-button py-2 px-3.5 min-h-[42px] rounded-xl text-xs font-semibold cursor-pointer shadow-sm inline-flex items-center gap-2 hover:border-[#38bdf8]/45 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#38bdf8]"
                >
                  <Icon className="w-3.5 h-3.5 text-[#38bdf8] shrink-0" aria-hidden="true" />
                  <span>{link.name}</span>
                  <ArrowUpRight className="w-3 h-3 text-slate-400 shrink-0" aria-hidden="true" />
                </a>
              );
            })}
          </div>
        </TiltCard>
      </div>
    </section>
  );
};

export default Founder;
