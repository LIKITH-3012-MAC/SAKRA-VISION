import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HelpCircle, Search, X, ExternalLink } from 'lucide-react';
import projectsData from '../data/projects';
import ProjectModal from '../components/ProjectModal';
import TiltCard from '../components/TiltCard';
import SEO from '../components/SEO';

const CATEGORIES = ['All', 'AI Platforms', 'RAG / LLM', 'Automation', 'Full Stack', 'Civic-Tech'];

export default function ProjectsView() {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProject, setSelectedProject] = useState(null);
  const lastTriggerRef = useRef(null);

  const filteredProjects = projectsData.filter((project) => {
    const matchesCategory = selectedCategory === 'All' || project.tags.includes(selectedCategory);
    const query = searchQuery.toLowerCase().trim();

    const matchesSearch =
      !query ||
      project.title.toLowerCase().includes(query) ||
      project.category.toLowerCase().includes(query) ||
      project.shortDesc.toLowerCase().includes(query) ||
      project.techStack.some((tech) => tech.toLowerCase().includes(query));

    return matchesCategory && matchesSearch;
  });

  return (
    <div className="w-full relative bg-black pt-28 pb-20">
      <SEO
        title="Sakra Vision Projects | AI & Full-Stack Products"
        description="Explore the intelligent systems, AI products, automation platforms, and full-stack solutions built under Sakra Vision."
      />
      <div className="max-w-6xl mx-auto px-5 sm:px-6">
        {/* Section Header */}
        <div className="text-center mb-12 sm:mb-16">
          <span className="text-xs font-mono tracking-widest text-[#38bdf8] uppercase font-medium">
            Product Gallery
          </span>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight mt-2 text-white font-sans">
            Designed for real-world systems.
          </h1>
          <p className="text-slate-300 max-w-2xl mx-auto text-sm md:text-base font-light mt-4 font-sans">
            Explore the intelligent systems, AI products, automation platforms, and full-stack solutions built under SAKRA VISION.
          </p>
        </div>

        {/* Controls: Wrapped Category Chips & Search */}
        <div className="flex flex-col lg:flex-row justify-between items-stretch lg:items-center gap-4 sm:gap-6 mb-6 max-w-5xl mx-auto z-10 relative">
          <div
            role="group"
            aria-label="Filter projects by category"
            className="flex flex-wrap items-center justify-center lg:justify-start gap-2 w-full lg:w-auto"
          >
            {CATEGORIES.map((category) => {
              const isSelected = selectedCategory === category;
              return (
                <button
                  key={category}
                  type="button"
                  aria-pressed={isSelected}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-3.5 sm:px-4 py-2 min-h-[42px] rounded-xl text-xs font-semibold tracking-wide whitespace-nowrap transition-all duration-200 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#38bdf8] ${
                    isSelected
                      ? 'bg-white text-black border border-white shadow-sm'
                      : 'bg-white/[0.06] border border-white/15 text-slate-200 hover:text-white hover:bg-white/10'
                  }`}
                >
                  {category}
                </button>
              );
            })}
          </div>

          <div className="w-full lg:w-80 relative">
            <label htmlFor="projects-search-input" className="sr-only">
              Search projects by title, category, description, or tech stack
            </label>
            <input
              id="projects-search-input"
              type="search"
              placeholder="Search specs, stack, features..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-black/70 border border-white/15 rounded-2xl py-3 px-4 pr-11 text-base sm:text-sm text-slate-100 placeholder-slate-400 focus:outline-none focus:border-[#38bdf8] focus:ring-1 focus:ring-[#38bdf8]/50 transition-all duration-200 font-sans min-h-[44px]"
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300">
              {searchQuery ? (
                <button
                  type="button"
                  aria-label="Clear search query"
                  onClick={() => setSearchQuery('')}
                  className="p-2 hover:text-white cursor-pointer rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#38bdf8]"
                >
                  <X className="w-4 h-4" />
                </button>
              ) : (
                <Search aria-hidden="true" className="w-4 h-4 mr-1 text-[#38bdf8]" />
              )}
            </div>
          </div>
        </div>

        {/* Live Result Summary */}
        <div
          aria-live="polite"
          className="max-w-5xl mx-auto mb-8 flex items-center justify-between text-xs font-mono text-slate-400 px-1"
        >
          <span>
            Showing {filteredProjects.length} of {projectsData.length} products
            {selectedCategory !== 'All' ? ` in ${selectedCategory}` : ''}
          </span>
          {(selectedCategory !== 'All' || searchQuery) && (
            <button
              type="button"
              onClick={() => {
                setSelectedCategory('All');
                setSearchQuery('');
              }}
              className="text-[#38bdf8] hover:text-white underline underline-offset-2 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#38bdf8] rounded px-1"
            >
              Reset filters
            </button>
          )}
        </div>

        {/* Grid of Projects */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-10 max-w-5xl mx-auto z-10 relative">
          <AnimatePresence mode="popLayout">
            {filteredProjects.map((project) => {
              const hasLiveLink = Boolean(project.liveLink && project.liveLink !== '#');

              return (
                <motion.div
                  layout
                  initial={{ opacity: 0, scale: 0.97 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.97 }}
                  transition={{ duration: 0.3 }}
                  key={project.id}
                  className="h-full"
                >
                  <TiltCard className="apple-glass rounded-3xl sm:rounded-[2rem] p-6 sm:p-8 border border-white/10 text-left relative overflow-hidden flex flex-col justify-between gap-6 group hover:shadow-[0_20px_50px_rgba(0,113,227,0.12)] hover:border-[#38bdf8]/35 cursor-default h-full min-h-[340px]">
                    {/* Glow backdrop */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-b from-[#0071e3]/8 to-transparent rounded-full blur-3xl pointer-events-none group-hover:from-[#0071e3]/15 transition-all duration-300" />

                    <div className="flex flex-col gap-3.5">
                      {/* Category & Status */}
                      <div className="flex justify-between items-start gap-3">
                        <div className="min-w-0">
                          <span className="text-xs font-mono font-semibold tracking-wider text-[#38bdf8] uppercase inline-block">
                            {project.category}
                          </span>
                          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white group-hover:text-[#38bdf8] transition-colors duration-200 mt-1 font-sans">
                            {project.title}
                          </h2>
                        </div>

                        <span
                          className={`shrink-0 flex items-center gap-1.5 text-xs font-mono font-semibold px-2.5 py-1 rounded-full bg-white/5 border ${
                            project.status === 'Live'
                              ? 'text-emerald-300 border-emerald-500/30'
                              : project.status === 'In Development'
                                ? 'text-amber-300 border-amber-500/30'
                                : 'text-[#38bdf8] border-[#0071e3]/30'
                          }`}
                        >
                          <span
                            aria-hidden="true"
                            className={`w-1.5 h-1.5 rounded-full ${
                              project.status === 'Live'
                                ? 'bg-emerald-400'
                                : project.status === 'In Development'
                                  ? 'bg-amber-400'
                                  : 'bg-[#38bdf8]'
                            }`}
                          />
                          {project.status}
                        </span>
                      </div>

                      {/* Tagline */}
                      <p className="text-xs sm:text-sm italic text-slate-300 tracking-wide">
                        &ldquo;{project.tagline}&rdquo;
                      </p>

                      {/* Short Description */}
                      <p className="text-slate-200 text-sm leading-relaxed font-normal font-sans">
                        {project.shortDesc}
                      </p>

                      {/* Tech stack chips */}
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {project.techStack.map((tech, i) => (
                          <span
                            key={i}
                            className="text-xs font-mono tracking-wide text-slate-200 bg-black/60 border border-white/15 px-2.5 py-1 rounded-md"
                          >
                            {tech}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* CTAs */}
                    <div className="grid grid-cols-2 gap-3 pt-5 border-t border-white/10 mt-auto relative z-20">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          lastTriggerRef.current = e.currentTarget;
                          setSelectedProject(project);
                        }}
                        className="apple-dark-button py-2.5 min-h-[44px] rounded-xl text-xs sm:text-[13px] font-bold text-center cursor-pointer shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#38bdf8]"
                      >
                        More Info
                      </button>

                      {hasLiveLink ? (
                        <a
                          href={project.liveLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="apple-button py-2.5 min-h-[44px] rounded-xl text-xs sm:text-[13px] font-bold text-center cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                        >
                          <span>View Product</span>
                          <ExternalLink className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                        </a>
                      ) : (
                        <button
                          type="button"
                          disabled
                          aria-disabled="true"
                          aria-label={`Live web demo unavailable for ${project.title}`}
                          title="Offline or desktop utility — view details via More Info"
                          className="min-h-[44px] py-2.5 px-3 rounded-xl text-xs sm:text-[13px] font-semibold text-center text-slate-300/80 bg-white/[0.05] border border-white/15 cursor-not-allowed inline-flex items-center justify-center"
                        >
                          Local / Offline
                        </button>
                      )}
                    </div>
                  </TiltCard>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        {/* Empty Search State */}
        {filteredProjects.length === 0 && (
          <div role="status" className="text-center py-12 max-w-md mx-auto">
            <div className="w-12 h-12 rounded-2xl bg-[#0071e3]/10 border border-[#38bdf8]/25 flex items-center justify-center mx-auto mb-4">
              <HelpCircle className="w-6 h-6 text-[#38bdf8]" aria-hidden="true" />
            </div>
            <h2 className="text-base font-bold text-white font-sans">No Products Match</h2>
            <p className="text-slate-300 text-xs sm:text-sm mt-1.5">
              No SAKRA VISION products match your current filter or search query.
            </p>
            <button
              type="button"
              onClick={() => {
                setSelectedCategory('All');
                setSearchQuery('');
              }}
              className="mt-5 apple-dark-button px-5 py-2.5 min-h-[44px] rounded-xl text-xs font-bold uppercase cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        )}
      </div>

      {/* Project detail modal */}
      <ProjectModal
        selectedProject={selectedProject}
        setSelectedProject={setSelectedProject}
        returnFocusRef={lastTriggerRef}
      />
    </div>
  );
}
