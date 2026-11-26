import React, { useState, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FlaskConical,
  Search,
  X,
  ArrowLeft,
  ArrowRight,
  Layers,
  Compass,
  CheckCircle2,
  HelpCircle,
  ExternalLink
} from 'lucide-react';
import SEO from '../components/SEO';
import projectsData from '../data/projects';
import researchData, {
  RESEARCH_CATEGORIES,
  RESEARCH_STATUS_STYLES
} from '../data/researchData';

export default function ResearchLabView({ setActiveView, navigateToSection }) {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedId, setSelectedId] = useState(null);
  const topRef = useRef(null);

  const filteredItems = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();
    return researchData.filter((item) => {
      const matchesCategory =
        selectedCategory === 'All' || item.categories.includes(selectedCategory);
      const matchesSearch =
        !query ||
        item.title.toLowerCase().includes(query) ||
        item.primaryCategory.toLowerCase().includes(query) ||
        item.groundedIn.toLowerCase().includes(query) ||
        item.summary.toLowerCase().includes(query) ||
        item.technologies.some((tech) => tech.toLowerCase().includes(query));

      return matchesCategory && matchesSearch;
    });
  }, [selectedCategory, searchQuery]);

  const activeItem = useMemo(
    () => researchData.find((item) => item.id === selectedId) || null,
    [selectedId]
  );

  const relatedProject = useMemo(() => {
    if (!activeItem?.relatedProjectId) return null;
    return projectsData.find((p) => p.id === activeItem.relatedProjectId) || null;
  }, [activeItem]);

  const scrollToLabTop = () => {
    const prefersReduced =
      typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    window.scrollTo({
      top: 0,
      behavior: prefersReduced ? 'instant' : 'smooth'
    });
  };

  const handleOpenDetail = (id) => {
    setSelectedId(id);
    scrollToLabTop();
  };

  const handleCloseDetail = () => {
    setSelectedId(null);
    scrollToLabTop();
  };

  const handleResetFilters = () => {
    setSelectedCategory('All');
    setSearchQuery('');
  };

  const handleGoToSection = (view, sectionId) => {
    if (navigateToSection) {
      navigateToSection(view, sectionId);
    } else if (setActiveView) {
      setActiveView(view);
    }
  };

  return (
    <div ref={topRef} className="w-full relative bg-black pt-28 pb-20">
      <SEO
        title="SAKRA Research Lab | AI Explorations & Applied Prototypes"
        description="Explore active technical explorations, offline RAG pipelines, edge MLX inference studies, OpenCV OCR verification, and constrained agent architectures at SAKRA VISION."
      />
      <div className="max-w-6xl mx-auto px-5 sm:px-6">
        {/* Header */}
        <div className="text-center mb-10 sm:mb-12">
          <span className="inline-flex items-center gap-2 text-xs font-mono tracking-widest text-[#38bdf8] uppercase font-medium">
            <FlaskConical className="w-3.5 h-3.5" aria-hidden="true" />
            <span>SAKRA Research Lab</span>
          </span>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight mt-2 text-white font-sans">
            Applied AI explorations &amp; prototypes.
          </h1>
          <p className="text-slate-300 mt-4 max-w-2xl mx-auto text-sm sm:text-base font-light font-sans">
            Focused technical investigations across local-first RAG, edge inference, computer vision preprocessing, and constrained AI agents—grounded in real studio engineering work.
          </p>
        </div>

        {/* Status Legend */}
        <div
          aria-label="Research maturity stages"
          className="flex flex-wrap justify-center gap-2 mb-10 max-w-4xl mx-auto"
        >
          {Object.entries(RESEARCH_STATUS_STYLES).map(([label, style]) => (
            <span
              key={label}
              title={style.desc}
              className={`px-3 py-1 rounded-full text-xs font-mono border ${style.badge}`}
            >
              {label}
            </span>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {activeItem ? (
            /* Research Detail View */
            <motion.article
              key={`detail-${activeItem.id}`}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="space-y-6 text-left"
              aria-labelledby="research-detail-title"
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={handleCloseDetail}
                  className="inline-flex items-center gap-2 px-4 py-2.5 min-h-[44px] rounded-xl bg-white/[0.06] hover:bg-white/10 border border-white/15 text-xs sm:text-sm font-medium text-slate-200 hover:text-white transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#38bdf8]"
                >
                  <ArrowLeft className="w-4 h-4" aria-hidden="true" />
                  <span>Return to Research Overview</span>
                </button>

                <span className="text-xs font-mono text-slate-300">
                  Grounded in:{' '}
                  <strong className="text-white font-semibold">{activeItem.groundedIn}</strong>
                </span>
              </div>

              <div className="apple-glass rounded-3xl border border-white/15 p-6 sm:p-10 shadow-2xl space-y-8">
                {/* Title + Badges */}
                <div className="border-b border-white/10 pb-6 space-y-4">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-mono border font-medium ${
                        RESEARCH_STATUS_STYLES[activeItem.status]?.badge ||
                        'bg-white/10 text-white border-white/20'
                      }`}
                    >
                      {activeItem.status}
                    </span>
                    {activeItem.categories.map((cat) => (
                      <span
                        key={cat}
                        className="px-2.5 py-1 rounded-md text-xs font-mono bg-white/[0.05] border border-white/10 text-slate-300"
                      >
                        {cat}
                      </span>
                    ))}
                  </div>

                  <h2
                    id="research-detail-title"
                    className="text-2xl sm:text-3xl md:text-4xl font-bold text-white tracking-tight font-sans"
                  >
                    {activeItem.title}
                  </h2>

                  <p className="text-sm sm:text-base text-slate-200 leading-relaxed font-light max-w-3xl">
                    {activeItem.summary}
                  </p>
                </div>

                {/* Motivation & Approach */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="p-5 sm:p-6 rounded-2xl bg-white/[0.03] border border-white/10 space-y-2.5">
                    <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-[#38bdf8]">
                      <HelpCircle className="w-4 h-4" aria-hidden="true" />
                      <span>Problem &amp; Motivation</span>
                    </div>
                    <p className="text-sm text-slate-200 leading-relaxed font-light">
                      {activeItem.motivation}
                    </p>
                  </div>

                  <div className="p-5 sm:p-6 rounded-2xl bg-[#0071e3]/10 border border-[#38bdf8]/25 space-y-2.5">
                    <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-[#38bdf8]">
                      <Layers className="w-4 h-4" aria-hidden="true" />
                      <span>Engineering Approach</span>
                    </div>
                    <p className="text-sm text-slate-100 leading-relaxed font-light">
                      {activeItem.approach}
                    </p>
                  </div>
                </div>

                {/* Open Questions + Technologies */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  <div className="lg:col-span-7 p-5 sm:p-6 rounded-2xl bg-white/[0.025] border border-white/10 space-y-3">
                    <h3 className="text-xs font-mono uppercase tracking-wider text-[#38bdf8]">
                      Open Engineering Questions
                    </h3>
                    <ul className="space-y-2.5">
                      {activeItem.openQuestions.map((question, idx) => (
                        <li
                          key={idx}
                          className="flex items-start gap-2.5 text-sm text-slate-200 leading-relaxed"
                        >
                          <CheckCircle2
                            className="w-4 h-4 text-[#38bdf8] shrink-0 mt-0.5"
                            aria-hidden="true"
                          />
                          <span>{question}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="lg:col-span-5 p-5 sm:p-6 rounded-2xl bg-white/[0.025] border border-white/10 flex flex-col justify-between gap-4">
                    <div>
                      <h3 className="text-xs font-mono uppercase tracking-wider text-[#38bdf8] mb-3">
                        Technologies Explored
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {activeItem.technologies.map((tech) => (
                          <span
                            key={tech}
                            className="px-3 py-1.5 rounded-lg text-xs font-mono bg-white/[0.06] border border-white/15 text-slate-100"
                          >
                            {tech}
                          </span>
                        ))}
                      </div>
                    </div>

                    <p className="text-xs text-slate-400 font-mono border-t border-white/10 pt-3">
                      Status reflects active internal R&amp;D scope—metrics are published only after repeatable testing.
                    </p>
                  </div>
                </div>

                {/* Navigation Links to Related Experiences */}
                <div className="pt-4 border-t border-white/10 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex flex-wrap items-center gap-3">
                    {relatedProject && (
                      <button
                        type="button"
                        onClick={() => handleGoToSection('projects', 'product-showcase')}
                        className="apple-button cursor-pointer min-h-[44px] text-xs"
                      >
                        <span>View {relatedProject.title} in Showcase</span>
                        <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => handleGoToSection('capabilities', 'solution-explorer')}
                      className="apple-dark-button cursor-pointer min-h-[44px] text-xs inline-flex items-center gap-2"
                    >
                      <Compass className="w-3.5 h-3.5 text-[#38bdf8]" aria-hidden="true" />
                      <span>Explore in Solution Explorer</span>
                    </button>

                    {relatedProject?.gitLink && relatedProject.gitLink !== '#' && (
                      <a
                        href={relatedProject.gitLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-4 py-2.5 min-h-[44px] rounded-full border border-white/15 bg-white/[0.04] hover:bg-white/10 text-xs font-medium text-slate-200 hover:text-white inline-flex items-center gap-1.5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#38bdf8]"
                      >
                        <span>Source Repo</span>
                        <ExternalLink className="w-3.5 h-3.5" aria-hidden="true" />
                      </a>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => setActiveView?.('inquire')}
                    className="text-xs font-mono text-[#38bdf8] hover:text-white py-2 px-3 min-h-[44px] inline-flex items-center gap-1.5 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#38bdf8] rounded-lg"
                  >
                    <span>Discuss Applied R&amp;D</span>
                    <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
                  </button>
                </div>
              </div>
            </motion.article>
          ) : (
            /* Research Overview Grid Mode */
            <motion.div
              key="research-grid"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="space-y-8"
            >
              {/* Controls: Search + Category Filter */}
              <div className="flex flex-col gap-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="relative flex-1 max-w-md">
                    <label htmlFor="research-search-input" className="sr-only">
                      Search research explorations by title, technology, or product
                    </label>
                    <Search
                      className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
                      aria-hidden="true"
                    />
                    <input
                      id="research-search-input"
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Filter by topic, tech stack, or product..."
                      className="w-full pl-10 pr-10 py-2.5 min-h-[44px] rounded-xl bg-white/[0.04] border border-white/15 focus:border-[#38bdf8] text-sm text-white placeholder:text-slate-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#38bdf8]"
                    />
                    {searchQuery && (
                      <button
                        type="button"
                        onClick={() => setSearchQuery('')}
                        aria-label="Clear research search"
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1.5 text-slate-300 hover:text-white cursor-pointer rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#38bdf8]"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  <p className="text-xs font-mono text-slate-300 text-left sm:text-right">
                    Showing <strong className="text-white">{filteredItems.length}</strong> of{' '}
                    {researchData.length} explorations
                  </p>
                </div>

                {/* Category Filter Pills */}
                <div
                  role="group"
                  aria-label="Filter research topics by discipline"
                  className="flex items-center gap-2 overflow-x-auto pb-2 sm:flex-wrap sm:overflow-visible sm:pb-0 no-scrollbar"
                >
                  {RESEARCH_CATEGORIES.map((category) => {
                    const isSelected = selectedCategory === category;
                    return (
                      <button
                        key={category}
                        type="button"
                        aria-pressed={isSelected}
                        onClick={() => setSelectedCategory(category)}
                        className={`px-3.5 py-2 min-h-[40px] rounded-xl text-xs font-medium whitespace-nowrap shrink-0 border transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#38bdf8] ${
                          isSelected
                            ? 'bg-white text-black border-white font-semibold shadow-sm'
                            : 'bg-white/[0.04] border-white/15 text-slate-200 hover:bg-white/10 hover:text-white'
                        }`}
                      >
                        {category}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Research Grid or Empty State */}
              {filteredItems.length === 0 ? (
                <div
                  role="status"
                  className="apple-glass rounded-3xl border border-white/15 p-8 sm:p-12 text-center max-w-2xl mx-auto space-y-4"
                >
                  <p className="text-base sm:text-lg font-semibold text-white">
                    No published notes match &ldquo;{selectedCategory}&rdquo;
                    {searchQuery ? ` with "${searchQuery.trim()}"` : ''}.
                  </p>
                  <p className="text-sm text-slate-300 font-light leading-relaxed">
                    SAKRA Research Lab only publishes explorations actively connected to studio engineering work. Reset filters to inspect all current notes.
                  </p>
                  <button
                    type="button"
                    onClick={handleResetFilters}
                    className="apple-button cursor-pointer min-h-[44px] mx-auto text-xs"
                  >
                    <span>Reset Research Filters</span>
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
                  {filteredItems.map((item) => (
                    <div
                      key={item.id}
                      className="flex flex-col justify-between h-full p-6 rounded-3xl bg-white/[0.03] border border-white/10 hover:border-[#38bdf8]/40 transition-colors text-left gap-5"
                    >
                      <div className="space-y-3.5">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <span
                            className={`px-2.5 py-1 rounded-full text-[11px] font-mono border ${
                              RESEARCH_STATUS_STYLES[item.status]?.badge ||
                              'bg-white/10 text-white border-white/20'
                            }`}
                          >
                            {item.status}
                          </span>
                          <span className="text-[11px] font-mono text-slate-400">
                            {item.primaryCategory}
                          </span>
                        </div>

                        <h2 className="text-lg font-bold text-white leading-snug font-sans">
                          {item.title}
                        </h2>

                        <p className="text-xs font-mono text-[#38bdf8]">
                          Grounded in: {item.groundedIn}
                        </p>

                        <p className="text-sm text-slate-300 font-light leading-relaxed">
                          {item.summary}
                        </p>
                      </div>

                      <div className="space-y-4 pt-3 border-t border-white/10">
                        <div className="flex flex-wrap gap-1.5">
                          {item.technologies.slice(0, 4).map((tech) => (
                            <span
                              key={tech}
                              className="px-2.5 py-0.5 rounded-md text-xs font-mono bg-white/[0.05] border border-white/10 text-slate-200"
                            >
                              {tech}
                            </span>
                          ))}
                        </div>

                        <button
                          type="button"
                          onClick={() => handleOpenDetail(item.id)}
                          className="w-full py-2.5 px-4 min-h-[44px] rounded-xl bg-white/[0.06] hover:bg-[#0071e3] border border-white/15 hover:border-[#38bdf8]/50 text-xs font-semibold text-white inline-flex items-center justify-between transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#38bdf8]"
                        >
                          <span>Inspect Exploration</span>
                          <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Bottom Studio R&D Banner */}
        <div className="mt-16 sm:mt-20 p-6 sm:p-8 rounded-3xl bg-[#050914] border border-white/15 flex flex-col md:flex-row md:items-center justify-between gap-6 text-left">
          <div className="space-y-1.5 max-w-2xl">
            <span className="text-xs font-mono uppercase tracking-wider text-[#38bdf8]">
              Explore Applied Engineering
            </span>
            <h2 className="text-lg sm:text-xl font-bold text-white font-sans">
              Want to apply local RAG, computer vision, or workflow automation to a real problem?
            </h2>
            <p className="text-sm text-slate-300 font-light">
              Test architectural directions inside AI Solution Explorer or outline your requirements directly through our Smart Project Brief.
            </p>
          </div>
          <div className="flex flex-wrap gap-3 shrink-0">
            <button
              type="button"
              onClick={() => handleGoToSection('capabilities', 'solution-explorer')}
              className="apple-dark-button cursor-pointer min-h-[44px] text-xs"
            >
              AI Solution Explorer
            </button>
            <button
              type="button"
              onClick={() => setActiveView?.('inquire')}
              className="apple-button cursor-pointer min-h-[44px] text-xs"
            >
              <span>Start Project Brief</span>
              <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
