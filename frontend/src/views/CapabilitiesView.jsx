import React from 'react';
import { Cpu, Eye, Terminal, Layers, Zap, Globe, Shield, Cloud, ArrowRight } from 'lucide-react';
import SEO from '../components/SEO';
import TiltCard from '../components/TiltCard';
import HowWeBuild from '../components/HowWeBuild';
import SolutionExplorer from '../components/SolutionExplorer';

export default function CapabilitiesView({ setActiveView, onDiscussProject }) {
  const capabilities = [
    {
      title: 'AI Applications',
      desc: 'Cognitive user applications powered by machine learning algorithms, trained models, and dynamic server-side computation targeting real-world operations.',
      icon: Cpu,
      tech: ['Python', 'TensorFlow', 'PyTorch', 'REST APIs'],
      useCase: 'Cognitive data analysis, visual profiling, decision engines.'
    },
    {
      title: 'Computer Vision Systems',
      desc: 'High-precision detection models, image recognition utilities, automated face/screenshot scanning, and custom OpenCV processing operations.',
      icon: Eye,
      tech: ['OpenCV', 'YOLO', 'NumPy', 'Image Processing'],
      useCase: 'OCR receipt scanners, shape detection, visual audits.'
    },
    {
      title: 'LLM & RAG Tools',
      desc: 'Intelligent vector database retrieval, context-aware query systems, automated document indexers, and local LLM execution systems.',
      icon: Terminal,
      tech: ['LangChain', 'FAISS', 'Ollama', 'Llama / Whisper'],
      useCase: 'Offline learning assistants, semantic search tools.'
    },
    {
      title: 'Full-Stack Products',
      desc: 'Production-ready web layers, JWT authentication systems, RESTful API design, dashboard systems, and cloud databases (MySQL, MongoDB).',
      icon: Layers,
      tech: ['React', 'Vite', 'FastAPI', 'Spring Boot', 'MySQL'],
      useCase: 'Enterprise command dashboards, custom checkout setups.'
    },
    {
      id: 'automation',
      title: 'Automation Systems',
      desc: 'Scripting infrastructure, cron-based database validators, verification webhooks, and complex third-party API workflow automations.',
      icon: Zap,
      tech: ['Python Scripts', 'Cron', 'SlowAPI', 'Webhooks'],
      useCase: 'Payment confirmation webhooks, automated directory sorting.'
    },
    {
      title: 'Civic-Tech & Social AI',
      desc: 'Meaningful community platforms, educational AI tools, secure registration systems, and supportive solutions addressing public concerns.',
      icon: Globe,
      tech: ['Next.js', 'PostgreSQL', 'Google Maps API'],
      useCase: 'Civic issue reporting dashboards, public coordination portals.'
    },
    {
      title: 'AI Agents',
      desc: 'Autonomous agentic models capable of multi-step reasoning, automated web search routing, and local OS scripting loops.',
      icon: Shield,
      tech: ['LangChain Agents', 'Tool Calling', 'Groq API'],
      useCase: 'Autonomous directory audits, auto-response mail agents.'
    },
    {
      title: 'Cloud Deployment',
      desc: 'Secure deployment pipelines utilizing containerized frameworks, CORS configurations, rate-limit gates, and Cloudflare layers.',
      icon: Cloud,
      tech: ['Docker', 'Vercel / Render', 'Aiven Cloud', 'Cloudflare'],
      useCase: 'High-availability server deploys, secure database clustering.'
    }
  ];

  return (
    <div className="w-full relative bg-black pt-28 pb-20">
      <SEO
        title="Sakra Vision Services | AI Automation, Web Development & Event Tech"
        description="Explore Sakra Vision services including AI automation, web development, event registration platforms, cloud applications, and digital product development."
      />
      <div className="max-w-7xl mx-auto px-5 sm:px-6">
        {/* Header */}
        <div className="text-center mb-14 sm:mb-16">
          <span className="text-xs font-mono tracking-widest text-[#38bdf8] uppercase font-medium">
            Capabilities
          </span>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight mt-2 text-white font-sans">
            Tailored AI capabilities.
          </h1>
          <p className="text-slate-300 mt-4 sm:mt-6 max-w-xl mx-auto text-sm sm:text-base font-light font-sans">
            Choose a service category to learn how Sakra Vision can help you build or automate your project.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3 sm:gap-4">
            <button
              type="button"
              onClick={() => setActiveView('inquire')}
              className="px-6 py-2.5 min-h-[44px] bg-white text-black text-xs font-semibold rounded-full cursor-pointer inline-flex items-center gap-2 hover:bg-slate-200 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#38bdf8]"
            >
              <span>Contact Sakra Vision</span>
              <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={() => {
                const autoElement = document.getElementById('automation');
                if (autoElement) autoElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
              }}
              className="px-6 py-2.5 min-h-[44px] bg-white/[0.06] border border-white/15 text-white text-xs font-semibold rounded-full cursor-pointer hover:bg-white/10 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#38bdf8]"
            >
              View AI Automation Solutions
            </button>
          </div>
        </div>

        {/* Balanced 1/2/4-Column Grid (zero orphan cards across 8 items) */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 lg:gap-7">
          {capabilities.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div key={idx} id={item.id || undefined} className="scroll-mt-24 h-full">
                <TiltCard className="h-full apple-glass p-6 sm:p-7 rounded-3xl text-left border border-white/10 relative overflow-hidden flex flex-col hover:shadow-[0_20px_50px_rgba(0,113,227,0.14)] hover:border-[#38bdf8]/35 group cursor-default select-none">
                  <div
                    aria-hidden="true"
                    className="absolute top-0 right-0 w-24 h-24 bg-white/[0.01] rounded-full blur-2xl pointer-events-none group-hover:bg-[#0071e3]/[0.06]"
                  />

                  <div className="flex-1 flex flex-col">
                    <div className="w-11 h-11 rounded-2xl bg-black/70 border border-white/15 flex items-center justify-center mb-5 text-[#38bdf8]">
                      <Icon className="w-5 h-5" aria-hidden="true" />
                    </div>

                    <h2 className="text-lg font-bold text-white mb-2 font-sans">
                      {item.title}
                    </h2>
                    <p className="text-slate-300 text-xs sm:text-sm leading-relaxed font-normal font-sans">
                      {item.desc}
                    </p>
                  </div>

                  <div className="mt-5 pt-4 border-t border-white/10 space-y-3">
                    <div className="flex flex-wrap gap-1.5">
                      {item.tech.map((t, i) => (
                        <span
                          key={i}
                          className="text-xs font-mono tracking-wide text-slate-200 bg-white/[0.06] border border-white/15 px-2.5 py-0.5 rounded-md"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                    <div className="text-xs font-mono text-slate-300 leading-relaxed">
                      <span className="text-[#38bdf8] font-semibold">Use Case:</span> {item.useCase}
                    </div>
                  </div>
                </TiltCard>
              </div>
            );
          })}
        </div>

        {/* Feature 4: How We Build — Interactive Development Process */}
        <HowWeBuild />

        {/* Feature 5: AI Solution Explorer */}
        <SolutionExplorer
          onDiscussProject={(briefPrefill) => {
            if (onDiscussProject) {
              onDiscussProject(briefPrefill);
            } else {
              setActiveView('inquire');
            }
          }}
        />
      </div>
    </div>
  );
}
