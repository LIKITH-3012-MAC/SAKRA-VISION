import React from 'react';
import { Cpu, Server, Laptop, HardDrive, ShieldCheck } from 'lucide-react';
import TechSphere3D from '../components/TechSphere3D';
import SEO from '../components/SEO';

export default function TechSpecsView() {
  const specGroups = [
    {
      title: 'AI / Core Engine Layer',
      icon: Cpu,
      specs: [
        { name: 'AI Models & LLMs', desc: 'Integration with Groq API, Google Gemini APIs, and local Llama node execution.' },
        { name: 'RAG Pipeline', desc: 'LangChain-based document parsers, metadata chunk indexers, and local FAISS vector search databases.' },
        { name: 'Vision Scanning', desc: 'OpenCV automated contour detection, image boundary checks, and OCR verification modules.' },
        { name: 'Agentic Workflows', desc: 'Autonomous directory scripts, structured tool calling loops, and self-correcting logic tasks.' }
      ]
    },
    {
      title: 'Backend Persistence Layer',
      icon: Server,
      specs: [
        { name: 'Framework & Async API', desc: 'Python FastAPI async routing with pydantic-settings environment validation checks.' },
        { name: 'Database Architecture', desc: 'SQLAlchemy ORM connected to secure Aiven Cloud MySQL databases.' },
        { name: 'Mail Dispatch', desc: 'Resend API asynchronous mail notifications for client invoices and receipt updates.' },
        { name: 'Proxy & Gateway Security', desc: 'CORS protection gates, SlowAPI rate-limit triggers (10/min), Turnstile token filters, and header sanitization.' }
      ]
    },
    {
      title: 'Frontend Interface Layer',
      icon: Laptop,
      specs: [
        { name: 'Core Engine', desc: 'React 18 single-page architecture built with Vite hot-reloading configurations.' },
        { name: 'Visual Stylings', desc: 'Vanilla CSS custom design tokens and Tailwind base configs.' },
        { name: '3D Animations', desc: 'CSS perspective cameras, 3D mouse tracking tilt modules, and Framer Motion spring overlays.' },
        { name: 'Glassmorphism Design', desc: 'Premium Apple-style frosted panels (apple-glass) with high-contrast inner border structures.' }
      ]
    },
    {
      title: 'Deployment & CI/CD Layer',
      icon: HardDrive,
      specs: [
        { name: 'Database Clustering', desc: 'Aiven Cloud MySQL SSL clustering with dynamic certificate generation configurations.' },
        { name: 'Frontend Hosting', desc: 'Vercel CDN global caching distribution with edge analytics active.' },
        { name: 'API Server Hosting', desc: 'Render Web Services running Docker container configurations and uvicorn threads.' },
        { name: 'Security & CDN Gates', desc: 'Cloudflare SSL shields, traffic audits, and custom DNS routing headers.' }
      ]
    }
  ];

  return (
    <div className="w-full relative bg-black pt-28 pb-20 overflow-x-clip">
      <SEO
        title="Technical Specs | Sakra Vision AI Product Studio"
        description="A comprehensive overview of Sakra Vision's standardized AI/LLM stack, FastAPI persistence layer, React frontend architecture, and cloud deployment."
      />
      <div className="max-w-4xl mx-auto px-5 sm:px-6 text-left">
        {/* Header section with 3D Sphere side-by-side */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 md:gap-8 mb-10 sm:mb-14 border-b border-white/10 pb-8 sm:pb-10">
          <div className="flex-1 text-left w-full">
            <span className="text-xs font-mono tracking-widest text-[#38bdf8] uppercase font-semibold">
              Specifications
            </span>
            <h1 className="text-3xl sm:text-4xl md:text-6xl font-extrabold tracking-tight mt-2 text-white font-sans">
              Technical Specs.
            </h1>
            <p className="text-slate-300 leading-relaxed font-light text-sm md:text-base mt-4 font-sans max-w-xl">
              A comprehensive overview of our standardized technical stack, security implementations, database architecture, and deployment procedures.
            </p>
          </div>
          <div className="flex-shrink-0 flex items-center justify-center w-full max-w-[320px] md:w-[340px] lg:w-[390px]">
            <TechSphere3D />
          </div>
        </div>

        {/* Specs Table */}
        <div className="space-y-10 sm:space-y-12">
          {specGroups.map((group, groupIdx) => {
            const Icon = group.icon;
            return (
              <section key={groupIdx} className="border-t border-white/10 pt-8 first:border-t-0 first:pt-0">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-8 h-8 rounded-lg bg-[#0071e3]/15 border border-[#38bdf8]/25 flex items-center justify-center text-[#38bdf8] shrink-0">
                    <Icon className="w-4 h-4" aria-hidden="true" />
                  </div>
                  <h2 className="text-xl font-bold text-white font-sans">{group.title}</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-y-4 md:gap-y-6 border-b border-white/10 pb-8">
                  {group.specs.map((spec, specIdx) => (
                    <React.Fragment key={specIdx}>
                      <div className="md:col-span-4 text-xs font-mono text-slate-300 font-bold uppercase tracking-wider md:pt-1">
                        {spec.name}
                      </div>
                      <div className="md:col-span-8 text-sm text-slate-200 font-normal leading-relaxed font-sans pb-3 border-b border-white/10 md:border-none last:border-none">
                        {spec.desc}
                      </div>
                    </React.Fragment>
                  ))}
                </div>
              </section>
            );
          })}
        </div>

        {/* Security Alert Badge */}
        <div className="mt-14 apple-glass p-6 rounded-3xl border border-[#38bdf8]/25 bg-[#0071e3]/[0.03] flex items-start gap-4">
          <ShieldCheck className="w-6 h-6 text-[#38bdf8] flex-shrink-0 mt-0.5" aria-hidden="true" />
          <div>
            <h3 className="text-sm sm:text-base font-bold text-white font-sans">
              Enterprise-Ready Fallbacks
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-normal mt-1.5 font-sans">
              All SAKRA systems enforce token validations, input size limiters, CORS controls, and rate limits to secure APIs from exploitation. Fallback offline RAG capabilities guarantee uptime even when cloud APIs encounter outages.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
