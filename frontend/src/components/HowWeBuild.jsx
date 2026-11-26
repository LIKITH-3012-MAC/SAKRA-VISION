import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Compass,
  Map,
  PenTool,
  Code2,
  ShieldCheck,
  Rocket,
  CheckCircle2,
  ChevronRight
} from 'lucide-react';

const STAGES = [
  {
    number: '01',
    title: 'Discovery',
    subtitle: 'Problem & Outcome Framing',
    icon: Compass,
    summary:
      'Understand the core problem, user constraints, operational bottlenecks, and expected real-world outcomes before writing code.',
    deliverables: [
      'Problem statement & stakeholder goals',
      'User workflow & constraint analysis',
      'Initial feasibility assessment'
    ],
    focus: 'Clarity before engineering'
  },
  {
    number: '02',
    title: 'Planning',
    subtitle: 'Architecture & Technical Scope',
    icon: Map,
    summary:
      'Define project scope, technical requirements, data models, AI/model strategy, and an incremental implementation plan.',
    deliverables: [
      'System architecture & data-flow plan',
      'API contracts & database schema outline',
      'Technology stack & deployment strategy'
    ],
    focus: 'Structured technical direction'
  },
  {
    number: '03',
    title: 'Design',
    subtitle: 'UI/UX & Structural Craft',
    icon: PenTool,
    summary:
      'Develop the visual interface, responsive interaction patterns, accessibility structure, and component hierarchy.',
    deliverables: [
      'Responsive UI layout & hierarchy',
      'Interactive component state flows',
      'Accessibility & contrast verification'
    ],
    focus: 'Usable, cohesive interfaces'
  },
  {
    number: '04',
    title: 'Development',
    subtitle: 'Full-Stack & AI Implementation',
    icon: Code2,
    summary:
      'Implement the React/Next.js frontend, FastAPI or backend services, database persistence, integrations, and relevant AI/LLM or vision pipelines.',
    deliverables: [
      'Frontend UI & interactive components',
      'Backend API routes & database persistence',
      'AI, RAG, OCR, or automation integrations'
    ],
    focus: 'Clean, modular execution'
  },
  {
    number: '05',
    title: 'Testing',
    subtitle: 'Validation & Quality Assurance',
    icon: ShieldCheck,
    summary:
      'Validate end-to-end functionality, input validation, API reliability, responsive layouts, accessibility, and runtime performance.',
    deliverables: [
      'Functional & edge-case verification',
      'Desktop & mobile viewport checks',
      'Security & error-handling checks'
    ],
    focus: 'Dependable system behavior'
  },
  {
    number: '06',
    title: 'Deployment',
    subtitle: 'Release & Iterative Refinement',
    icon: Rocket,
    summary:
      'Prepare production builds, environment configuration, hosting deployment, monitoring checks, and future iteration pathways.',
    deliverables: [
      'Production bundle & container setup',
      'Cloud deployment & DNS/SSL routing',
      'Post-launch refinements & handoff'
    ],
    focus: 'Production-ready delivery'
  }
];

export default function HowWeBuild() {
  const [activeStageIndex, setActiveStageIndex] = useState(0);
  const [userLocked, setUserLocked] = useState(false);
  const sectionRef = useRef(null);

  // Animate active stage progress gently on scroll until user manually selects a stage
  useEffect(() => {
    if (userLocked) return;
    if (typeof window === 'undefined') return;
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return;

    const handleScroll = () => {
      const el = sectionRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const vh = window.innerHeight || 800;

      // Map section visibility across viewport into 0..1 progress
      const start = vh * 0.65;
      const end = -rect.height * 0.25;
      if (rect.top > start || rect.bottom < 0) return;

      const ratio = Math.max(0, Math.min(1, (start - rect.top) / (start - end)));
      const nextIdx = Math.min(STAGES.length - 1, Math.floor(ratio * STAGES.length));
      setActiveStageIndex(nextIdx);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [userLocked]);

  const handleSelectStage = (idx) => {
    setUserLocked(true);
    setActiveStageIndex(idx);
  };

  const activeStage = STAGES[activeStageIndex] || STAGES[0];
  const ActiveIcon = activeStage.icon;
  const progressPercent = ((activeStageIndex + 1) / STAGES.length) * 100;

  return (
    <section
      ref={sectionRef}
      id="how-we-build"
      aria-labelledby="how-we-build-heading"
      className="mt-20 sm:mt-24 pt-16 border-t border-white/10 scroll-mt-24"
    >
      {/* Header */}
      <div className="text-center mb-12">
        <span className="text-xs font-mono tracking-widest text-[#38bdf8] uppercase font-medium">
          How We Build
        </span>
        <h2
          id="how-we-build-heading"
          className="text-3xl sm:text-4xl font-extrabold tracking-tight mt-2 text-white font-sans"
        >
          From problem framing to production release.
        </h2>
        <p className="text-slate-300 max-w-2xl mx-auto text-sm sm:text-base font-light mt-3 font-sans">
          SAKRA VISION&apos;s general product development approach — structured across six iterative stages while adapting to each project&apos;s scope and technical constraints.
        </p>
      </div>

      {/* Desktop Horizontal Timeline (lg+) */}
      <div className="hidden lg:block max-w-6xl mx-auto mb-8">
        <div className="relative pt-2 pb-4">
          {/* Track & Progress Fill */}
          <div className="absolute top-[29px] left-8 right-8 h-[2px] bg-white/10 rounded-full" aria-hidden="true">
            <div
              className="h-full bg-gradient-to-r from-[#0071e3] to-[#38bdf8] rounded-full transition-all duration-300"
              style={{ width: `${(activeStageIndex / (STAGES.length - 1)) * 100}%` }}
            />
          </div>

          <div className="grid grid-cols-6 gap-3 relative z-10" role="tablist" aria-label="Development stages">
            {STAGES.map((stage, idx) => {
              const Icon = stage.icon;
              const isActive = idx === activeStageIndex;
              const isCompleted = idx < activeStageIndex;

              return (
                <button
                  key={stage.number}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  onClick={() => handleSelectStage(idx)}
                  className="flex flex-col items-center text-center group cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#38bdf8] rounded-2xl p-2"
                >
                  <div
                    className={`w-11 h-11 rounded-2xl flex items-center justify-center border transition-all duration-200 ${
                      isActive
                        ? 'bg-[#0071e3] border-[#38bdf8] text-white shadow-[0_0_24px_rgba(0,113,227,0.5)] scale-105'
                        : isCompleted
                          ? 'bg-[#0071e3]/20 border-[#38bdf8]/45 text-[#38bdf8]'
                          : 'bg-[#070b14] border-white/15 text-slate-300 group-hover:border-white/30 group-hover:text-white'
                    }`}
                  >
                    <Icon className="w-4 h-4" aria-hidden="true" />
                  </div>

                  <span
                    className={`text-[11px] font-mono mt-3 uppercase tracking-wider font-semibold ${
                      isActive ? 'text-[#38bdf8]' : 'text-slate-400'
                    }`}
                  >
                    Stage {stage.number}
                  </span>
                  <span
                    className={`text-sm font-bold mt-0.5 font-sans ${
                      isActive ? 'text-white' : 'text-slate-300 group-hover:text-white'
                    }`}
                  >
                    {stage.title}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Mobile & Tablet Vertical Timeline (< lg) */}
      <div className="lg:hidden space-y-3 mb-8 text-left">
        {STAGES.map((stage, idx) => {
          const Icon = stage.icon;
          const isActive = idx === activeStageIndex;

          return (
            <div
              key={stage.number}
              className={`rounded-2xl border transition-colors ${
                isActive
                  ? 'bg-[#070b14] border-[#38bdf8]/50'
                  : 'bg-white/[0.03] border-white/15'
              }`}
            >
              <button
                type="button"
                aria-expanded={isActive}
                onClick={() => handleSelectStage(idx)}
                className="w-full p-4 flex items-center justify-between gap-3 text-left cursor-pointer min-h-[56px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#38bdf8] rounded-2xl"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center border shrink-0 ${
                      isActive
                        ? 'bg-[#0071e3] border-[#38bdf8] text-white'
                        : 'bg-black/70 border-white/15 text-[#38bdf8]'
                    }`}
                  >
                    <Icon className="w-4 h-4" aria-hidden="true" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-[11px] font-mono text-[#38bdf8] uppercase tracking-wider block">
                      Stage {stage.number} · {stage.subtitle}
                    </span>
                    <span className="text-base font-bold text-white font-sans">
                      {stage.title}
                    </span>
                  </div>
                </div>
                <ChevronRight
                  className={`w-4 h-4 text-slate-300 shrink-0 transition-transform duration-200 ${
                    isActive ? 'rotate-90 text-[#38bdf8]' : ''
                  }`}
                  aria-hidden="true"
                />
              </button>

              {isActive && (
                <div className="px-4 pb-4 pt-1 border-t border-white/10 space-y-3">
                  <p className="text-sm text-slate-200 leading-relaxed font-normal">
                    {stage.summary}
                  </p>
                  <ul className="space-y-1.5">
                    {stage.deliverables.map((item) => (
                      <li key={item} className="flex items-start gap-2 text-xs text-slate-200">
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#38bdf8] shrink-0 mt-0.5" aria-hidden="true" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Desktop Active Stage Detail Card */}
      <div className="hidden lg:block max-w-5xl mx-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeStage.number}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="apple-glass rounded-3xl border border-white/15 p-7 sm:p-8 text-left shadow-xl"
          >
            <div className="grid grid-cols-12 gap-8 items-start">
              <div className="col-span-7 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#0071e3]/20 border border-[#38bdf8]/40 flex items-center justify-center text-[#38bdf8]">
                    <ActiveIcon className="w-5 h-5" aria-hidden="true" />
                  </div>
                  <div>
                    <span className="text-xs font-mono text-[#38bdf8] uppercase tracking-wider font-semibold">
                      Stage {activeStage.number} — {activeStage.subtitle}
                    </span>
                    <h3 className="text-2xl font-bold text-white font-sans">
                      {activeStage.title}
                    </h3>
                  </div>
                </div>

                <p className="text-sm sm:text-[15px] text-slate-200 leading-relaxed font-normal pt-1">
                  {activeStage.summary}
                </p>

                <div className="pt-2 flex items-center gap-3">
                  <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#38bdf8] rounded-full transition-all duration-300"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                  <span className="text-xs font-mono text-slate-300 whitespace-nowrap">
                    {activeStageIndex + 1} / {STAGES.length} Stages
                  </span>
                </div>
              </div>

              <div className="col-span-5 p-5 rounded-2xl bg-black/60 border border-white/15 space-y-3">
                <div className="text-xs font-mono uppercase tracking-wider text-slate-300 font-semibold">
                  Typical Stage Deliverables
                </div>
                <ul className="space-y-2.5">
                  {activeStage.deliverables.map((del) => (
                    <li key={del} className="flex items-start gap-2.5 text-sm text-slate-200 leading-snug">
                      <CheckCircle2 className="w-4 h-4 text-[#38bdf8] shrink-0 mt-0.5" aria-hidden="true" />
                      <span>{del}</span>
                    </li>
                  ))}
                </ul>
                <div className="pt-3 border-t border-white/10 flex items-center justify-between text-xs font-mono">
                  <span className="text-slate-400">Primary Focus</span>
                  <span className="text-[#38bdf8] font-semibold">{activeStage.focus}</span>
                </div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Honest Scope Disclaimer */}
      <p className="text-xs text-slate-400 font-mono text-center mt-6 max-w-2xl mx-auto">
        Note: This illustrates SAKRA VISION&apos;s general engineering workflow. Individual project timelines and stages adapt to specific technical requirements.
      </p>
    </section>
  );
}
