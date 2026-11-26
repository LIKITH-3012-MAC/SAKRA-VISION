import React, { useRef, useEffect } from 'react';
import { ArrowRight } from 'lucide-react';
import SEO from '../components/SEO';

export default function OverviewView({ setActiveView }) {
  const containerRef = useRef(null);
  const rafRef = useRef(null);

  useEffect(() => {
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  const handleMouseMove = (e) => {
    if (!containerRef.current || window.innerWidth < 1024) return;
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return;
    const clientX = e.clientX;
    const clientY = e.clientY;
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(() => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const mouseX = clientX - rect.left - rect.width / 2;
      const mouseY = clientY - rect.top - rect.height / 2;
      const rotateX = -(mouseY / rect.height) * 8;
      const rotateY = (mouseX / rect.width) * 8;
      containerRef.current.style.transition = 'box-shadow 0.3s ease, border-color 0.3s ease';
      containerRef.current.style.transform = `perspective(1000px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg)`;
    });
  };

  const handleMouseLeave = () => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    if (containerRef.current) {
      containerRef.current.style.transition = 'transform 0.35s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.3s ease, border-color 0.3s ease';
      containerRef.current.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg)';
    }
  };

  const stats = [
    { value: '5+ AI', label: 'DEPLOYED PRODUCTS' },
    { value: 'RAG', label: 'OFFLINE / ON-PREM CORE' },
    { value: 'STUDIO', label: 'AI / ML INNOVATION LAB' },
  ];

  return (
    <div className="w-full relative bg-black pt-28 pb-16 overflow-hidden">
      <SEO
        title="Sakra Vision AI Product Studio | AI Automation & Web Apps"
        description="Sakra Vision is an AI product studio founded by Likith Naidu Anumakonda, building AI automation tools, event registration systems, web applications, and cloud software solutions."
      />
      {/* Background brand logo watermark */}
      <div
        aria-hidden="true"
        className="sakra-watermark absolute top-12 md:top-20 right-[-15%] md:right-[-10%] opacity-[0.02] md:opacity-[0.04] pointer-events-none"
      />

      <div className="max-w-6xl mx-auto px-5 sm:px-6 relative z-10">
        {/* Centered blue glow */}
        <div
          aria-hidden="true"
          className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-[#0071e3]/10 blur-[160px] rounded-full pointer-events-none z-0"
        />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center w-full relative z-10">
          {/* Left Hero Content */}
          <div className="lg:col-span-7 flex flex-col gap-6 text-left justify-center">
            <div className="inline-flex self-start items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/[0.05] border border-white/15">
              <span className="text-xs font-mono tracking-wider text-slate-300 uppercase font-medium">
                AI Product Studio
              </span>
            </div>

            <div className="relative">
              <div
                aria-hidden="true"
                className="absolute -inset-1 bg-gradient-to-r from-[#0071e3] to-[#38bdf8] rounded-lg blur-2xl opacity-15 pointer-events-none"
              />
              <h1 className="text-4xl sm:text-5xl md:text-7xl font-black tracking-tight leading-[1.04] text-white font-sans relative">
                Sakra Vision
                <br />
                <span className="text-3xl sm:text-4xl md:text-5xl bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
                  AI Product Studio
                </span>
              </h1>
              <p className="text-xl md:text-3xl font-semibold tracking-tight text-slate-100 mt-4 font-sans">
                From Ideas to Intelligent Systems
              </p>
            </div>

            <p className="text-base md:text-lg text-slate-300 max-w-xl leading-relaxed font-light font-sans">
              Sakra Vision is an AI product studio founded by Likith Naidu Anumakonda. We build AI automation tools, event registration platforms, web applications, cloud software, and intelligent digital systems for real-world businesses and creators.
            </p>

            <p className="text-sm text-[#38bdf8] font-medium font-sans">
              Explore our services, view our AI products, or contact us through the contact form.
            </p>

            <div className="flex flex-wrap gap-3.5 sm:gap-4 mt-2">
              <button
                type="button"
                onClick={() => setActiveView('capabilities')}
                className="apple-button cursor-pointer min-h-[46px]"
              >
                <span>Explore Sakra Vision Services</span>
                <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </button>

              <button
                type="button"
                onClick={() => setActiveView('inquire')}
                className="apple-dark-button cursor-pointer min-h-[46px]"
              >
                Visit Contact Form
              </button>
            </div>

            <div className="grid grid-cols-3 gap-4 sm:gap-6 mt-8 pt-8 border-t border-white/10 max-w-md">
              {stats.map((stat, i) => (
                <div key={i} className="flex flex-col text-left">
                  <span className="text-lg sm:text-xl font-bold tracking-tight text-white font-sans">
                    {stat.value}
                  </span>
                  <span className="text-[11px] font-mono tracking-wider text-slate-300 uppercase mt-1">
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
              className="apple-glass blue-rim w-full max-w-sm rounded-[2rem] p-7 sm:p-8 relative flex flex-col gap-6 select-none cursor-default hover:border-[#38bdf8]/40"
            >
              <div className="flex justify-between items-center border-b border-white/10 pb-4">
                <span className="text-[11px] font-mono tracking-wider text-slate-300 uppercase">
                  ENGINE STATE // ACTIVE
                </span>
                <div className="flex gap-1.5" aria-hidden="true">
                  <div className="w-2.5 h-2.5 rounded-full bg-slate-700" />
                  <div className="w-2.5 h-2.5 rounded-full bg-slate-700" />
                  <div className="w-2.5 h-2.5 rounded-full bg-[#38bdf8] animate-pulse" />
                </div>
              </div>

              <div className="h-60 bg-black rounded-2xl border border-white/10 relative flex items-center justify-center overflow-hidden group/brand">
                <div
                  aria-hidden="true"
                  className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(0,113,227,0.2),transparent_72%)] pointer-events-none"
                />
                <div
                  aria-hidden="true"
                  className="absolute w-28 h-28 bg-[#0071e3]/20 rounded-full filter blur-[28px] opacity-50 animate-pulse pointer-events-none"
                  style={{ animationDuration: '4s' }}
                />

                <img
                  src="/SAKRAVISION.png"
                  alt="SAKRA VISION Brand Asset"
                  width="320"
                  height="213"
                  className="w-full h-full object-contain p-6 relative z-10 mix-blend-lighten transition-transform duration-500 ease-out group-hover/brand:scale-[1.03]"
                />

                <div className="absolute top-3.5 left-3.5 px-2.5 py-0.5 bg-black/85 border border-white/15 rounded-md text-[11px] font-mono text-white tracking-wider shadow-md z-20">
                  AI
                </div>
                <div className="absolute top-5 right-3.5 px-2.5 py-0.5 bg-black/85 border border-[#38bdf8]/40 rounded-md text-[11px] font-mono text-[#38bdf8] tracking-wider shadow-md z-20">
                  RAG
                </div>
                <div className="absolute bottom-7 left-5 px-2.5 py-0.5 bg-black/85 border border-white/15 rounded-md text-[11px] font-mono text-slate-200 tracking-wider shadow-md z-20">
                  CV
                </div>
                <div className="absolute bottom-3.5 right-5 px-2.5 py-0.5 bg-black/85 border border-white/15 rounded-md text-[11px] font-mono text-white tracking-wider shadow-md z-20">
                  LLM
                </div>
              </div>

              <div className="flex justify-between items-center text-[11px] font-mono text-slate-300 px-1">
                <span className="flex items-center gap-1.5">
                  <span aria-hidden="true" className="w-1.5 h-1.5 rounded-full bg-[#38bdf8] animate-ping" />
                  SYSTEM RUNNING
                </span>
                <span>100% SECURE</span>
              </div>
            </div>
          </div>
        </div>

        {/* Company Statement & Featured Project Block */}
        <div className="mt-24 sm:mt-32 border-t border-white/10 pt-14 sm:pt-16 flex flex-col md:flex-row gap-10 lg:gap-12 justify-between items-start text-left">
          <div className="md:w-1/2">
            <span className="text-xs font-mono tracking-widest text-[#38bdf8] uppercase font-medium">
              Brand Statement
            </span>
            <p className="text-xl md:text-2xl font-semibold tracking-tight text-white mt-3 font-sans leading-snug">
              &ldquo;We operate at the interface of theoretical AI and practical product engineering, converting raw algorithms into responsive, highly interactive systems.&rdquo;
            </p>
          </div>

          <div className="md:w-5/12 w-full bg-white/[0.025] border border-white/10 rounded-3xl p-6 relative overflow-hidden flex flex-col justify-between min-h-[200px]">
            <div aria-hidden="true" className="absolute bottom-0 right-0 w-24 h-24 bg-[#0071e3]/10 rounded-full blur-2xl pointer-events-none" />
            <div>
              <span className="text-xs font-mono tracking-wider text-[#38bdf8] uppercase">
                Featured Product Preview
              </span>
              <h2 className="text-lg font-bold text-white mt-1.5">Resolvit AI</h2>
              <p className="text-slate-300 text-xs sm:text-sm font-normal mt-2 leading-relaxed">
                An AI-powered civic issue resolution platform connecting citizens, municipal authorities, and NGOs via priority scoring.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setActiveView('projects')}
              className="text-xs sm:text-sm text-[#38bdf8] hover:text-white font-semibold flex items-center gap-1.5 self-start mt-6 py-1 group transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#38bdf8] rounded"
            >
              <span>Learn More</span>
              <ArrowRight className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-1" aria-hidden="true" />
            </button>
          </div>
        </div>

        {/* SEO Context Section */}
        <div className="mt-20 sm:mt-24 border-t border-white/10 pt-14 pb-8 grid grid-cols-1 md:grid-cols-3 gap-10 lg:gap-12 text-left">
          <div>
            <h2 className="text-sm font-bold text-white mb-4 tracking-wide uppercase font-mono">
              About SAKRA VISION
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-sans font-light">
              SAKRA VISION is an AI product studio established in 2026 by Likith Naidu Anumakonda. We build real-world intelligent systems using Artificial Intelligence, Machine Learning, computer vision, LLMs, RAG, AI agents, automation, and full-stack web technologies. Our mission is to engineer intelligence into reality.
            </p>
          </div>

          <div>
            <h2 className="text-sm font-bold text-white mb-4 tracking-wide uppercase font-mono">
              Our Services
            </h2>
            <ul className="text-xs sm:text-sm text-slate-300 leading-relaxed font-sans font-light space-y-2">
              <li className="flex gap-2"><span className="text-[#38bdf8]" aria-hidden="true">▪</span> AI Application Development</li>
              <li className="flex gap-2"><span className="text-[#38bdf8]" aria-hidden="true">▪</span> Computer Vision Systems (OpenCV)</li>
              <li className="flex gap-2"><span className="text-[#38bdf8]" aria-hidden="true">▪</span> LLM &amp; RAG Tools</li>
              <li className="flex gap-2"><span className="text-[#38bdf8]" aria-hidden="true">▪</span> AI Agents &amp; Automation</li>
              <li className="flex gap-2"><span className="text-[#38bdf8]" aria-hidden="true">▪</span> Full-Stack AI Products</li>
            </ul>
          </div>

          <div>
            <h2 className="text-sm font-bold text-white mb-4 tracking-wide uppercase font-mono">
              Contact
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-sans font-light mb-4">
              Ready to build intelligent systems? Get in touch with our AI product studio.
            </p>
            <button
              type="button"
              onClick={() => setActiveView('inquire')}
              className="text-xs sm:text-sm text-[#38bdf8] hover:text-white font-semibold flex items-center gap-2 transition-colors cursor-pointer py-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#38bdf8] rounded"
            >
              <span>Start a Conversation</span>
              <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
            </button>
            <p className="text-xs sm:text-sm text-slate-300 font-mono mt-4 break-all">
              <a href="mailto:likith.anumakonda@gmail.com" className="hover:text-[#38bdf8] transition-colors">
                likith.anumakonda@gmail.com
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
