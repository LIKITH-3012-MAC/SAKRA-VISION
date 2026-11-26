import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2 } from 'lucide-react';

export default function About() {
  return (
    <section id="about" className="py-24 bg-black relative">
      <div className="max-w-6xl mx-auto px-5 sm:px-6">
        {/* Section Header */}
        <div className="text-center md:text-left mb-14 sm:mb-16">
          <div className="inline-flex items-center gap-2 mb-1">
            <img
              src="/SAKRAVISION.png"
              alt="SAKRA VISION Logo"
              width="20"
              height="20"
              className="w-5 h-5 object-contain"
              loading="lazy"
            />
            <span className="text-xs font-mono tracking-widest text-[#38bdf8] uppercase font-medium">
              Product Studio
            </span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight mt-2 text-white font-sans">
            Built for intelligent execution.
          </h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          {/* Left Column Text */}
          <div className="lg:col-span-6 flex flex-col gap-6 text-left">
            <h3 className="text-2xl font-bold text-white font-sans">
              Converting Ideas into Intelligent Realities
            </h3>
            <p className="text-slate-300 leading-relaxed font-normal text-base font-sans">
              SAKRA VISION is an AI product studio established in 2026 by <strong className="font-semibold text-white">Likith Naidu Anumakonda</strong>. We build practical intelligent systems using Artificial Intelligence, Machine Learning, Computer Vision, LLMs, RAG, automation, AI agents, and full-stack web technologies. Our goal is simple: convert powerful ideas into useful, deployable, secure, and scalable real-world products.
            </p>
            <p className="text-slate-300 leading-relaxed font-normal text-base font-sans">
              Our engineering core covers everything from deep computer vision scanning and verification pipelines to custom local LLM implementations. We build complete full-stack experiences utilizing modern API design, secure databases, and reactive user interfaces.
            </p>

            {/* Visual Highlights */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 mt-2">
              {[
                'Fast Execution Cycles',
                'Production Ready Tech',
                'Practical AI Solutions',
                'Engineered from India'
              ].map((highlight, idx) => (
                <div key={idx} className="flex items-center gap-2.5 text-sm text-slate-200 font-sans">
                  <CheckCircle2 className="w-4 h-4 text-[#38bdf8] flex-shrink-0" aria-hidden="true" />
                  <span>{highlight}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column Capability Board */}
          <div className="lg:col-span-6 z-10 perspective-container">
            <AboutCapabilityGrid />
          </div>
        </div>
      </div>
    </section>
  );
}

// Subcomponent: Capability Toggles
function AboutCapabilityGrid() {
  const [activeChip, setActiveChip] = useState('cv');

  const details = {
    ai: {
      title: 'AI Agents & Automation',
      desc: 'We engineer autonomous software agents that can monitor tasks, scan directories, perform web search operations, make decisions, and execute backend scripts. We cut down human operational loops by designing systems that review documents and check transactions in parallel.',
      features: ['Cron-based automation triggers', 'Smart decision workflows', 'System operations checks', 'Third-party webhook integrations']
    },
    cv: {
      title: 'Computer Vision Systems',
      desc: 'Utilizing OpenCV and neural networks, we build image recognition pipelines. We specialize in verification frameworks, automated dashboard screen parsing, face and signature validation matrices, and optical character recognition (OCR) algorithms.',
      features: ['Fast screenshot OCR scanning', 'Payment verification scanners', 'Object boundary detection', 'OpenCV image filter arrays']
    },
    llm: {
      title: 'LLM & RAG Pipelines',
      desc: 'We structure Retrieval-Augmented Generation (RAG) engines to index unstructured enterprise documents, technical notes, or contracts into vector databases. This unlocks natural language query routing, context aggregation, and model synthesis.',
      features: ['Context retrieval scoring', 'Local/Offline LLM orchestration', 'Metadata chunk indexing', 'Minimal prompt leakage designs']
    },
    stack: {
      title: 'Production Full-Stack',
      desc: 'We wrap AI operations inside scalable, standard architectures. We implement robust backend systems using Spring Boot and FastAPI, establish secure token gates, connect relational or document-based DB stores, and deploy responsive web interfaces.',
      features: ['Spring Boot & FastAPI backends', 'Secret token security gates', 'MySQL/MongoDB databases', 'Responsive React frontend wrappers']
    }
  };

  const activeInfo = details[activeChip];

  return (
    <div className="apple-glass rounded-[2rem] p-6 md:p-8 relative flex flex-col gap-6 text-left overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_20px_50px_rgba(0,113,227,0.12)] hover:border-[#38bdf8]/35">
      <div aria-hidden="true" className="absolute bottom-0 right-0 w-32 h-32 bg-[#0071e3]/8 rounded-full blur-2xl pointer-events-none" />

      {/* Toggles */}
      <div role="group" aria-label="Studio core capabilities" className="flex flex-wrap gap-2 relative z-20">
        {[
          { id: 'cv', label: 'Computer Vision' },
          { id: 'llm', label: 'LLMs & RAG' },
          { id: 'ai', label: 'AI Agents' },
          { id: 'stack', label: 'Full Stack' }
        ].map((chip) => (
          <button
            key={chip.id}
            type="button"
            aria-pressed={activeChip === chip.id}
            onClick={() => setActiveChip(chip.id)}
            className={`px-3.5 py-2 min-h-[40px] rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-200 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#38bdf8] ${
              activeChip === chip.id
                ? 'bg-[#0071e3]/20 text-[#38bdf8] border border-[#38bdf8]/45 shadow-md'
                : 'bg-white/[0.06] border border-white/15 text-slate-200 hover:text-white hover:bg-white/10'
            }`}
          >
            {chip.label}
          </button>
        ))}
      </div>

      {/* Screen */}
      <div className="bg-black/70 rounded-2xl border border-white/10 p-6 min-h-[220px] flex flex-col justify-between relative z-20">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeChip}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.22 }}
            className="flex flex-col gap-4"
          >
            <h4 className="text-lg font-bold text-white flex items-center gap-2.5">
              <span aria-hidden="true" className="w-1.5 h-5 bg-[#38bdf8] rounded-full" />
              <span>{activeInfo.title}</span>
            </h4>

            <p className="text-slate-200 text-xs sm:text-sm leading-relaxed font-normal font-sans">
              {activeInfo.desc}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mt-1">
              {activeInfo.features.map((feat, idx) => (
                <div key={idx} className="flex items-center gap-2 text-xs text-slate-200 font-mono">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#38bdf8] shrink-0" aria-hidden="true" />
                  <span>{feat}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
