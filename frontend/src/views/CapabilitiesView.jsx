import React from 'react';
import { Cpu, Eye, Terminal, Layers, Zap, Globe, Shield, Cloud } from 'lucide-react';
import TiltCard from '../components/TiltCard';

export default function CapabilitiesView() {
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
      <div className="max-w-6xl mx-auto px-6">
        
        {/* Header */}
        <div className="text-center mb-16">
          <span className="text-xs font-mono tracking-widest text-[#0071e3] uppercase">Capabilities</span>
          <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight mt-2 text-white font-sans">
            Tailored AI capabilities.
          </h2>
          <p className="text-[#94a3b8] max-w-xl mx-auto text-sm md:text-base font-light mt-4 font-sans">
            We design, develop, and deploy production-ready intelligent capabilities across computer vision, large language models, automation workflows, and scalable databases.
          </p>
        </div>

        {/* Capabilities Deck Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {capabilities.map((item, idx) => {
            const Icon = item.icon;
            return (
              <TiltCard 
                key={idx}
                className="apple-glass p-8 rounded-3xl text-left border border-white/5 relative overflow-hidden flex flex-col justify-between min-h-[300px] hover:shadow-[0_20px_50px_rgba(0,113,227,0.15)] hover:border-[#38bdf8]/30 group cursor-default select-none"
              >
                <div className="absolute top-0 right-0 w-24 h-24 bg-white/[0.01] rounded-full blur-2xl pointer-events-none group-hover:bg-[#0071e3]/[0.05]" />
                
                <div style={{ transformStyle: 'preserve-3d' }}>
                  {/* Icon */}
                  <div 
                    className="w-12 h-12 rounded-2xl bg-black/60 border border-white/10 flex items-center justify-center mb-6 text-[#38bdf8] transition-transform duration-300"
                    style={{ transform: 'translateZ(35px)' }}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  
                  <h3 
                    className="text-lg font-bold text-white mb-2 font-sans transition-transform duration-300"
                    style={{ transform: 'translateZ(25px)' }}
                  >
                    {item.title}
                  </h3>
                  <p 
                    className="text-[#94a3b8] text-xs leading-relaxed font-light mb-4 font-sans transition-transform duration-300"
                    style={{ transform: 'translateZ(15px)' }}
                  >
                    {item.desc}
                  </p>
                </div>

                <div 
                  className="mt-4 pt-4 border-t border-white/5 space-y-2.5 transition-transform duration-300"
                  style={{ transform: 'translateZ(10px)' }}
                >
                  {/* Tech stack */}
                  <div className="flex flex-wrap gap-1">
                    {item.tech.map((t, i) => (
                      <span key={i} className="text-[9px] font-mono tracking-wider text-[#cbd5e1] bg-white/5 border border-white/10 px-2 py-0.5 rounded">
                        {t}
                      </span>
                    ))}
                  </div>
                  {/* Use Cases */}
                  <div className="text-[10px] font-mono text-slate-500">
                    <span className="text-[#0071e3] font-bold">Use Case:</span> {item.useCase}
                  </div>
                </div>

              </TiltCard>
            );
          })}
        </div>

      </div>
    </div>
  );
}
