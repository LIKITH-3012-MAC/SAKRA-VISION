import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ExternalLink,
  Github,
  Info,
  CheckCircle2,
  AlertCircle,
  Layers,
  Monitor,
  ShieldCheck,
  ArrowRight
} from 'lucide-react';
import projectsData from '../data/projects';

const SHOWCASE_IDS = [
  { id: 'prometheus-ai', displayName: 'Prometheus AI V2.0', shortLabel: 'Prometheus AI V2.0' },
  { id: 'resolvit-ai', displayName: 'RESOLVIT AI', shortLabel: 'Resolvit AI' },
  { id: 'bench-ai', displayName: 'BenchAI', shortLabel: 'BenchAI' },
  { id: 'event-hub', displayName: 'SAKRA VISION Event Hub', shortLabel: 'Event Hub' },
  { id: 'aquasentinel-ai', displayName: 'AquaSentinel AI', shortLabel: 'AquaSentinel AI' }
];

const showcaseProducts = SHOWCASE_IDS.map((item) => {
  const base = projectsData.find((p) => p.id === item.id);
  return base ? { ...base, displayName: item.displayName, shortLabel: item.shortLabel } : null;
}).filter(Boolean);

export default function ProductShowcase({ onOpenDetails, onExploreArchitecture }) {
  const [selectedId, setSelectedId] = useState(showcaseProducts[0]?.id || 'prometheus-ai');
  const [imageErrorMap, setImageErrorMap] = useState({});
  const tabRefs = useRef([]);

  const activeProduct =
    showcaseProducts.find((p) => p.id === selectedId) || showcaseProducts[0];

  if (!activeProduct) return null;

  const hasLiveLink = Boolean(activeProduct.liveLink && activeProduct.liveLink !== '#');
  const hasGitLink = Boolean(activeProduct.gitLink && activeProduct.gitLink !== '#');
  const hasImageFailed = Boolean(imageErrorMap[activeProduct.id]);
  const supportsArchitecture = ['prometheus-ai', 'resolvit-ai', 'bench-ai'].includes(activeProduct.id);

  const handleTabKeyDown = (e, index) => {
    const total = showcaseProducts.length;
    let nextIdx = null;
    if (e.key === 'ArrowRight') nextIdx = (index + 1) % total;
    else if (e.key === 'ArrowLeft') nextIdx = (index - 1 + total) % total;
    else if (e.key === 'Home') nextIdx = 0;
    else if (e.key === 'End') nextIdx = total - 1;

    if (nextIdx !== null) {
      e.preventDefault();
      const target = showcaseProducts[nextIdx];
      setSelectedId(target.id);
      tabRefs.current[nextIdx]?.focus();
    }
  };

  return (
    <section
      id="product-showcase"
      aria-labelledby="showcase-heading"
      className="mb-20 sm:mb-24 scroll-mt-24"
    >
      {/* Header */}
      <div className="text-center mb-10 sm:mb-12">
        <span className="text-xs font-mono tracking-widest text-[#38bdf8] uppercase font-medium">
          Featured Product Showcase
        </span>
        <h2
          id="showcase-heading"
          className="text-3xl sm:text-4xl font-extrabold tracking-tight mt-2 text-white font-sans"
        >
          Flagship Intelligent Products.
        </h2>
        <p className="text-slate-300 max-w-2xl mx-auto text-sm sm:text-base font-light mt-3 font-sans">
          Inspect problem statements, core capabilities, technology stacks, and live deployments across SAKRA VISION&apos;s flagship systems.
        </p>
      </div>

      {/* Product Selector Tabs */}
      <div
        role="tablist"
        aria-label="Select flagship product to inspect"
        className="flex flex-wrap justify-center gap-2 sm:gap-2.5 mb-8 max-w-5xl mx-auto"
      >
        {showcaseProducts.map((product, index) => {
          const isSelected = product.id === activeProduct.id;
          return (
            <button
              key={product.id}
              ref={(el) => {
                tabRefs.current[index] = el;
              }}
              role="tab"
              type="button"
              id={`showcase-tab-${product.id}`}
              aria-selected={isSelected}
              aria-controls={`showcase-panel-${product.id}`}
              tabIndex={isSelected ? 0 : -1}
              onClick={() => setSelectedId(product.id)}
              onKeyDown={(e) => handleTabKeyDown(e, index)}
              className={`px-4 py-2.5 min-h-[44px] rounded-xl text-xs sm:text-[13px] font-semibold transition-all duration-200 cursor-pointer flex items-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#38bdf8] ${
                isSelected
                  ? 'bg-[#0071e3] text-white border border-[#38bdf8]/50 shadow-[0_8px_24px_rgba(0,113,227,0.35)]'
                  : 'bg-white/[0.05] text-slate-200 border border-white/15 hover:bg-white/10 hover:text-white'
              }`}
            >
              <span>{product.shortLabel}</span>
              <span
                className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                  product.status === 'Live' ? 'bg-emerald-400' : 'bg-amber-400'
                }`}
                aria-hidden="true"
              />
            </button>
          );
        })}
      </div>

      {/* Showcase Stage */}
      <div className="max-w-5xl mx-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeProduct.id}
            role="tabpanel"
            id={`showcase-panel-${activeProduct.id}`}
            aria-labelledby={`showcase-tab-${activeProduct.id}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
            className="apple-glass rounded-3xl border border-white/15 overflow-hidden shadow-2xl"
          >
            <div className="grid grid-cols-1 lg:grid-cols-12">
              {/* Left: Visual / Deployment Information Panel */}
              <div className="lg:col-span-5 bg-[#050914] border-b lg:border-b-0 lg:border-r border-white/10 p-6 sm:p-8 flex flex-col justify-between gap-6 text-left">
                <div>
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
                    <span className="text-xs font-mono text-[#38bdf8] uppercase tracking-wider font-semibold">
                      {activeProduct.category}
                    </span>
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono font-medium border ${
                        activeProduct.status === 'Live'
                          ? 'text-emerald-300 bg-emerald-500/10 border-emerald-500/30'
                          : 'text-amber-300 bg-amber-500/10 border-amber-500/30'
                      }`}
                    >
                      <span
                        aria-hidden="true"
                        className={`w-1.5 h-1.5 rounded-full ${
                          activeProduct.status === 'Live' ? 'bg-emerald-400' : 'bg-amber-400'
                        }`}
                      />
                      {activeProduct.status}
                    </span>
                  </div>

                  {/* Screenshot if available, otherwise clean factual information panel */}
                  <div className="rounded-2xl border border-white/15 bg-black/70 overflow-hidden">
                    {activeProduct.image && !hasImageFailed ? (
                      <div className="relative aspect-[16/10] bg-black flex items-center justify-center">
                        <img
                          src={activeProduct.image}
                          alt={`${activeProduct.displayName} product visual`}
                          loading="lazy"
                          onError={() =>
                            setImageErrorMap((prev) => ({ ...prev, [activeProduct.id]: true }))
                          }
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="p-5 sm:p-6 space-y-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-[#0071e3]/15 border border-[#38bdf8]/35 flex items-center justify-center text-[#38bdf8] shrink-0">
                            <Monitor className="w-5 h-5" aria-hidden="true" />
                          </div>
                          <div>
                            <div className="text-xs font-mono text-[#38bdf8] uppercase tracking-wider">
                              Product Specification Panel
                            </div>
                            <div className="text-sm font-bold text-white">
                              {activeProduct.displayName}
                            </div>
                          </div>
                        </div>

                        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-normal">
                          {hasLiveLink
                            ? 'Live hosted deployment available. Launch the production environment or inspect the technical breakdown.'
                            : 'Offline / local-first execution architecture. Interactive web preview is intentionally unavailable because processing runs locally on-device.'}
                        </p>

                        <div className="pt-3 border-t border-white/10 flex items-center justify-between text-xs font-mono text-slate-300">
                          <span className="flex items-center gap-1.5">
                            <ShieldCheck className="w-3.5 h-3.5 text-[#38bdf8]" aria-hidden="true" />
                            <span>Deployment Status</span>
                          </span>
                          <span className="text-white font-semibold">
                            {hasLiveLink ? 'Hosted Online' : 'Local / Offline'}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Problem Statement Summary */}
                <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10">
                  <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-slate-200 font-semibold mb-2">
                    <AlertCircle className="w-3.5 h-3.5 text-[#38bdf8] shrink-0" aria-hidden="true" />
                    <span>Problem Addressed</span>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-normal">
                    {activeProduct.problemSolved}
                  </p>
                </div>
              </div>

              {/* Right: Detailed Product Overview, Functionality, Stack & Actions */}
              <div className="lg:col-span-7 p-6 sm:p-8 flex flex-col justify-between gap-6 text-left">
                <div className="space-y-5">
                  <div>
                    <h3 className="text-2xl sm:text-3xl font-bold text-white tracking-tight font-sans">
                      {activeProduct.displayName}
                    </h3>
                    <p className="text-sm text-[#38bdf8] italic mt-1 font-sans">
                      &ldquo;{activeProduct.tagline}&rdquo;
                    </p>
                    <p className="text-sm sm:text-[15px] text-slate-200 leading-relaxed font-normal mt-4 font-sans">
                      {activeProduct.fullDesc}
                    </p>
                  </div>

                  {/* Main Functionality */}
                  <div className="pt-4 border-t border-white/10">
                    <h4 className="text-xs font-mono uppercase tracking-wider text-slate-300 font-semibold mb-3">
                      Main Functionality
                    </h4>
                    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-5 gap-y-2">
                      {activeProduct.keyFeatures.slice(0, 6).map((feat, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-xs sm:text-sm text-slate-200 leading-snug">
                          <CheckCircle2 className="w-4 h-4 text-[#38bdf8] shrink-0 mt-0.5" aria-hidden="true" />
                          <span>{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Technology Stack */}
                  <div className="pt-4 border-t border-white/10">
                    <h4 className="text-xs font-mono uppercase tracking-wider text-slate-300 font-semibold mb-2.5 flex items-center gap-2">
                      <Layers className="w-3.5 h-3.5 text-[#38bdf8]" aria-hidden="true" />
                      <span>Technology Stack</span>
                    </h4>
                    <div className="flex flex-wrap gap-1.5">
                      {activeProduct.techStack.map((tech, idx) => (
                        <span
                          key={idx}
                          className="text-xs font-mono text-slate-200 bg-black/60 border border-white/15 px-2.5 py-1 rounded-lg"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="pt-5 border-t border-white/10 flex flex-wrap items-center gap-3">
                  {hasLiveLink ? (
                    <a
                      href={activeProduct.liveLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="apple-button py-2.5 px-5 min-h-[44px] text-xs sm:text-sm"
                    >
                      <span>Open Live App</span>
                      <ExternalLink className="w-4 h-4 shrink-0" aria-hidden="true" />
                    </a>
                  ) : (
                    <span className="inline-flex items-center px-4 py-2.5 min-h-[44px] rounded-full bg-white/[0.05] border border-white/15 text-xs font-mono text-slate-300">
                      Offline / Local Execution
                    </span>
                  )}

                  {hasGitLink && (
                    <a
                      href={activeProduct.gitLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="apple-dark-button py-2.5 px-4 min-h-[44px] text-xs sm:text-sm"
                    >
                      <Github className="w-4 h-4 shrink-0" aria-hidden="true" />
                      <span>Source Code</span>
                    </a>
                  )}

                  <button
                    type="button"
                    onClick={(e) => onOpenDetails?.(activeProduct, e.currentTarget)}
                    className="apple-dark-button py-2.5 px-4 min-h-[44px] text-xs sm:text-sm cursor-pointer"
                  >
                    <Info className="w-4 h-4 text-[#38bdf8] shrink-0" aria-hidden="true" />
                    <span>Project Details</span>
                  </button>

                  {supportsArchitecture && onExploreArchitecture && (
                    <button
                      type="button"
                      onClick={() => onExploreArchitecture(activeProduct.id)}
                      className="text-xs font-mono text-[#38bdf8] hover:text-white inline-flex items-center gap-1.5 ml-auto py-2 px-2 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#38bdf8] rounded-lg"
                    >
                      <span>Inspect Architecture</span>
                      <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}
