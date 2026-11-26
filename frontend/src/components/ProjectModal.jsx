import React, { useEffect, useId, useRef, useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  AlertCircle,
  Cpu,
  CheckCircle2,
  ExternalLink,
  Github,
  Layers,
  Sparkles,
} from 'lucide-react';

const FOCUSABLE_SELECTOR = [
  'a[href]',
  'button:not([disabled])',
  'textarea:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(', ');

function parseArchitectureSteps(howItWorks = '') {
  if (!howItWorks || typeof howItWorks !== 'string') return [];
  if (!howItWorks.includes('->')) return [];
  return howItWorks
    .split(/\s*->\s*/)
    .map((step) => step.trim())
    .filter(Boolean);
}

export default function ProjectModal({
  selectedProject,
  setSelectedProject,
  returnFocusRef,
}) {
  const titleId = useId();
  const descId = useId();
  const modalRef = useRef(null);
  const closeButtonRef = useRef(null);
  const scrollBodyRef = useRef(null);
  const lastFocusedElementRef = useRef(null);
  const wasOpenRef = useRef(false);
  const [isBodyScrollable, setIsBodyScrollable] = useState(false);

  const isOpen = Boolean(selectedProject);

  const handleClose = useCallback(() => {
    setSelectedProject(null);
  }, [setSelectedProject]);

  // Reset scroll & detect whether internal body actually overflows
  useEffect(() => {
    const el = scrollBodyRef.current;
    if (!selectedProject || !el) {
      setIsBodyScrollable(false);
      return;
    }

    el.scrollTop = 0;

    const updateScrollable = () => {
      if (scrollBodyRef.current) {
        setIsBodyScrollable(
          scrollBodyRef.current.scrollHeight > scrollBodyRef.current.clientHeight + 2
        );
      }
    };

    const raf = requestAnimationFrame(updateScrollable);
    window.addEventListener('resize', updateScrollable);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', updateScrollable);
    };
  }, [selectedProject]);

  // Body scroll lock, initial focus placement, and focus restoration
  useEffect(() => {
    if (isOpen && !wasOpenRef.current) {
      wasOpenRef.current = true;

      const activeEl = document.activeElement;
      if (
        activeEl instanceof HTMLElement &&
        (!modalRef.current || !modalRef.current.contains(activeEl))
      ) {
        lastFocusedElementRef.current = activeEl;
      }

      const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
      const prevBodyOverflow = document.body.style.overflow;
      const prevHtmlOverflow = document.documentElement.style.overflow;
      const prevBodyPaddingRight = document.body.style.paddingRight;

      document.documentElement.style.overflow = 'hidden';
      document.body.style.overflow = 'hidden';
      if (scrollbarWidth > 0) {
        document.body.style.paddingRight = `${scrollbarWidth}px`;
      }

      const focusTimer = requestAnimationFrame(() => {
        if (closeButtonRef.current) {
          closeButtonRef.current.focus({ preventScroll: true });
        } else if (modalRef.current) {
          modalRef.current.focus({ preventScroll: true });
        }
      });

      return () => {
        cancelAnimationFrame(focusTimer);
        document.documentElement.style.overflow = prevHtmlOverflow;
        document.body.style.overflow = prevBodyOverflow;
        document.body.style.paddingRight = prevBodyPaddingRight;
      };
    }

    if (!isOpen && wasOpenRef.current) {
      wasOpenRef.current = false;
      const target =
        returnFocusRef?.current instanceof HTMLElement
          ? returnFocusRef.current
          : lastFocusedElementRef.current;

      if (target && document.contains(target)) {
        requestAnimationFrame(() => {
          target.focus({ preventScroll: true });
        });
      }
      lastFocusedElementRef.current = null;
    }
  }, [isOpen, returnFocusRef]);

  // Keyboard navigation: Escape to close & strict Tab/Shift+Tab focus trap
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        e.stopPropagation();
        handleClose();
        return;
      }

      if (e.key === 'Tab' && modalRef.current) {
        const focusableElements = Array.from(
          modalRef.current.querySelectorAll(FOCUSABLE_SELECTOR)
        ).filter((el) => {
          if (el === scrollBodyRef.current) {
            return el.scrollHeight > el.clientHeight + 2;
          }
          return el.offsetParent !== null || el === document.activeElement;
        });

        if (focusableElements.length === 0) {
          e.preventDefault();
          modalRef.current.focus();
          return;
        }

        const firstEl = focusableElements[0];
        const lastEl = focusableElements[focusableElements.length - 1];

        if (!modalRef.current.contains(document.activeElement)) {
          e.preventDefault();
          firstEl.focus();
          return;
        }

        if (e.shiftKey) {
          if (document.activeElement === firstEl || document.activeElement === modalRef.current) {
            e.preventDefault();
            lastEl.focus();
          }
        } else if (document.activeElement === lastEl) {
          e.preventDefault();
          firstEl.focus();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown, true);
    return () => window.removeEventListener('keydown', handleKeyDown, true);
  }, [isOpen, handleClose]);

  if (typeof document === 'undefined') return null;

  const hasLiveLink = Boolean(
    selectedProject?.liveLink && selectedProject.liveLink !== '#'
  );
  const hasGitLink = Boolean(
    selectedProject?.gitLink && selectedProject.gitLink !== '#'
  );
  const architectureSteps = selectedProject
    ? parseArchitectureSteps(selectedProject.howItWorks)
    : [];

  return createPortal(
    <AnimatePresence>
      {selectedProject && (
        <motion.div
          key="project-modal-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          onClick={handleClose}
          className="fixed inset-0 z-[3000] bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 md:p-6 overflow-hidden"
        >
          <motion.div
            key={selectedProject.id}
            ref={modalRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            aria-describedby={descId}
            tabIndex={-1}
            initial={{ opacity: 0, scale: 0.97, y: 14 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: 10 }}
            transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-[920px] max-h-[calc(100dvh-1.5rem)] sm:max-h-[min(88dvh,820px)] flex flex-col rounded-2xl sm:rounded-3xl bg-[#070b14] border border-white/15 shadow-[0_32px_90px_rgba(0,0,0,0.9),0_0_0_1px_rgba(56,189,248,0.12)] overflow-hidden focus:outline-none"
          >
            {/* Subtle top atmospheric hairline */}
            <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#38bdf8]/45 to-transparent pointer-events-none" />

            {/* 1. Pinned Header: Identity & Category */}
            <header className="shrink-0 px-5 pt-4 pb-3.5 sm:px-8 sm:pt-5 sm:pb-4 border-b border-white/10 bg-white/[0.02] flex items-start justify-between gap-4">
              <div className="min-w-0 text-left">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-mono font-semibold tracking-wider text-[#38bdf8] uppercase bg-[#0071e3]/15 border border-[#38bdf8]/30">
                    {selectedProject.category}
                  </span>

                  {selectedProject.status && (
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono font-medium border ${
                        selectedProject.status === 'Live'
                          ? 'text-emerald-300 bg-emerald-500/10 border-emerald-500/30'
                          : selectedProject.status === 'In Development'
                            ? 'text-amber-300 bg-amber-500/10 border-amber-500/30'
                            : 'text-sky-300 bg-sky-500/10 border-sky-500/30'
                      }`}
                    >
                      <span
                        aria-hidden="true"
                        className={`w-1.5 h-1.5 rounded-full ${
                          selectedProject.status === 'Live'
                            ? 'bg-emerald-400'
                            : selectedProject.status === 'In Development'
                              ? 'bg-amber-400'
                              : 'bg-[#38bdf8]'
                        }`}
                      />
                      {selectedProject.status}
                    </span>
                  )}
                </div>

                <h2
                  id={titleId}
                  className="text-xl sm:text-2xl md:text-[1.75rem] font-bold text-white tracking-tight leading-tight mt-2.5 font-sans"
                >
                  {selectedProject.title}
                </h2>

                {selectedProject.tagline && (
                  <p className="text-sm sm:text-[15px] text-slate-300 font-normal leading-snug mt-1 font-sans">
                    {selectedProject.tagline}
                  </p>
                )}
              </div>

              <button
                ref={closeButtonRef}
                type="button"
                onClick={handleClose}
                aria-label={`Close ${selectedProject.title} details`}
                title="Close dialog (Esc)"
                className="shrink-0 w-11 h-11 rounded-xl bg-white/[0.06] border border-white/15 hover:bg-white/[0.12] hover:border-white/30 text-slate-200 hover:text-white flex items-center justify-center transition-colors duration-200 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#38bdf8]"
              >
                <X className="w-5 h-5" />
              </button>
            </header>

            {/* Scrollable Body */}
            <div
              ref={scrollBodyRef}
              tabIndex={isBodyScrollable ? 0 : undefined}
              aria-label={`${selectedProject.title} technical details`}
              className="project-modal-scroll flex-1 min-h-0 overflow-y-auto overscroll-contain px-5 py-5 sm:px-8 sm:py-5 space-y-5 sm:space-y-6 text-left focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-inset focus-visible:ring-[#38bdf8]/40"
            >
              {/* 2. Project Overview */}
              <section aria-labelledby={`${titleId}-overview`}>
                <h3
                  id={`${titleId}-overview`}
                  className="text-xs font-mono font-semibold text-slate-300 uppercase tracking-[0.1em] mb-2"
                >
                  Project Overview
                </h3>
                <p
                  id={descId}
                  className="text-sm sm:text-[15px] text-slate-200 leading-relaxed font-normal font-sans max-w-3xl"
                >
                  {selectedProject.fullDesc}
                </p>
              </section>

              {/* 3 & 4. Problem Addressed + How the Solution Works */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4 sm:gap-5 items-start">
                {/* 3. Problem Addressed */}
                <section
                  aria-labelledby={`${titleId}-problem`}
                  className="md:col-span-5 p-4 sm:p-5 rounded-2xl bg-white/[0.03] border border-white/10"
                >
                  <h3
                    id={`${titleId}-problem`}
                    className="text-xs font-mono font-semibold text-slate-200 uppercase tracking-[0.08em] mb-2.5 flex items-center gap-2"
                  >
                    <AlertCircle className="w-4 h-4 text-[#38bdf8] shrink-0" aria-hidden="true" />
                    <span>Problem Addressed</span>
                  </h3>
                  <p className="text-[13px] sm:text-sm text-slate-200 leading-relaxed font-normal font-sans">
                    {selectedProject.problemSolved}
                  </p>
                </section>

                {/* 4. How the Solution Works */}
                <section
                  aria-labelledby={`${titleId}-architecture`}
                  className="md:col-span-7 p-4 sm:p-5 rounded-2xl bg-[#0071e3]/[0.06] border border-[#38bdf8]/25 flex flex-col"
                >
                  <h3
                    id={`${titleId}-architecture`}
                    className="text-xs font-mono font-semibold text-[#38bdf8] uppercase tracking-[0.08em] mb-2.5 flex items-center gap-2"
                  >
                    <Cpu className="w-4 h-4 shrink-0" aria-hidden="true" />
                    <span>How the Solution Works</span>
                  </h3>

                  {architectureSteps.length > 1 ? (
                    <ol className="space-y-2">
                      {architectureSteps.map((step, index) => (
                        <li
                          key={index}
                          className="flex items-start gap-3 text-[13px] sm:text-sm text-slate-200 leading-snug font-sans"
                        >
                          <span className="mt-0.5 shrink-0 w-5 h-5 rounded-md bg-[#0071e3]/25 border border-[#38bdf8]/35 text-[#38bdf8] text-xs font-mono font-semibold flex items-center justify-center">
                            {index + 1}
                          </span>
                          <span>{step}</span>
                        </li>
                      ))}
                    </ol>
                  ) : (
                    <p className="text-[13px] sm:text-sm text-slate-200 leading-relaxed font-normal font-sans">
                      {selectedProject.howItWorks}
                    </p>
                  )}
                </section>
              </div>

              {/* 5. Key Features */}
              {Array.isArray(selectedProject.keyFeatures) &&
                selectedProject.keyFeatures.length > 0 && (
                  <section
                    aria-labelledby={`${titleId}-features`}
                    className="pt-5 border-t border-white/10"
                  >
                    <div className="flex items-center justify-between gap-2 mb-3.5">
                      <h3
                        id={`${titleId}-features`}
                        className="text-xs font-mono font-semibold text-slate-300 uppercase tracking-[0.1em] flex items-center gap-2"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-[#38bdf8]" aria-hidden="true" />
                        <span>Key Features</span>
                      </h3>
                      <span className="text-xs font-mono text-slate-300">
                        {selectedProject.keyFeatures.length} capabilities
                      </span>
                    </div>

                    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2.5">
                      {selectedProject.keyFeatures.map((feat, idx) => (
                        <li
                          key={idx}
                          className="flex items-start gap-2.5 text-[13px] sm:text-sm text-slate-200 leading-snug font-sans"
                        >
                          <CheckCircle2 className="w-4 h-4 text-[#38bdf8] shrink-0 mt-0.5" aria-hidden="true" />
                          <span>{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </section>
                )}

              {/* 6. Technology Stack */}
              {Array.isArray(selectedProject.techStack) &&
                selectedProject.techStack.length > 0 && (
                  <section
                    aria-labelledby={`${titleId}-stack`}
                    className="pt-5 border-t border-white/10"
                  >
                    <h3
                      id={`${titleId}-stack`}
                      className="text-xs font-mono font-semibold text-slate-300 uppercase tracking-[0.1em] mb-3 flex items-center gap-2"
                    >
                      <Layers className="w-3.5 h-3.5 text-[#38bdf8]" aria-hidden="true" />
                      <span>Technology Stack</span>
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedProject.techStack.map((tech, idx) => (
                        <span
                          key={idx}
                          className="text-xs font-mono text-slate-200 bg-white/[0.05] border border-white/15 px-3 py-1.5 rounded-lg"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  </section>
                )}
            </div>

            {/* 7. Pinned Footer: External Project Actions */}
            <footer className="shrink-0 px-5 py-3.5 sm:px-8 sm:py-4 border-t border-white/10 bg-[#050811]">
              <div className="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-between gap-2.5 sm:gap-3">
                <button
                  type="button"
                  onClick={handleClose}
                  className="w-full sm:w-auto sm:min-w-[116px] h-[44px] px-5 rounded-full bg-white/[0.06] border border-white/15 hover:bg-white/[0.12] hover:border-white/30 text-[13px] sm:text-sm font-semibold text-slate-100 hover:text-white inline-flex items-center justify-center transition-colors duration-200 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#38bdf8]"
                >
                  Close
                </button>

                <div className="grid grid-cols-2 sm:flex sm:items-center gap-2.5 sm:gap-3 w-full sm:w-auto">
                  {hasGitLink ? (
                    <a
                      href={selectedProject.gitLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full sm:w-auto sm:min-w-[148px] h-[44px] px-4 sm:px-5 rounded-full bg-white/[0.07] border border-white/20 hover:bg-white/[0.12] hover:border-[#38bdf8]/50 text-[13px] sm:text-sm font-semibold text-white inline-flex items-center justify-center gap-2 whitespace-nowrap transition-all duration-200 hover:-translate-y-0.5 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#38bdf8]"
                    >
                      <Github className="w-4 h-4 shrink-0" aria-hidden="true" />
                      <span>Source Code</span>
                    </a>
                  ) : (
                    <button
                      type="button"
                      disabled
                      aria-disabled="true"
                      title="Source code link is not available"
                      className="w-full sm:w-auto sm:min-w-[148px] h-[44px] px-4 sm:px-5 rounded-full bg-white/[0.04] border border-white/15 text-[13px] sm:text-sm font-semibold text-slate-300/75 inline-flex items-center justify-center gap-2 whitespace-nowrap cursor-not-allowed"
                    >
                      <Github className="w-4 h-4 shrink-0" aria-hidden="true" />
                      <span>Source Code</span>
                    </button>
                  )}

                  {hasLiveLink ? (
                    <a
                      href={selectedProject.liveLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full sm:w-auto sm:min-w-[148px] h-[44px] px-4 sm:px-5 rounded-full bg-[#0071e3] hover:bg-[#0a84ff] border border-[#38bdf8]/35 shadow-[0_8px_24px_rgba(0,113,227,0.35)] hover:shadow-[0_12px_30px_rgba(10,132,255,0.45)] text-[13px] sm:text-sm font-semibold text-white inline-flex items-center justify-center gap-2 whitespace-nowrap transition-all duration-200 hover:-translate-y-0.5 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                    >
                      <span>Live Demo</span>
                      <ExternalLink className="w-4 h-4 shrink-0" aria-hidden="true" />
                    </a>
                  ) : (
                    <button
                      type="button"
                      disabled
                      aria-disabled="true"
                      aria-label="Live Demo currently unavailable (offline or local build)"
                      title="No hosted web demo — runs offline or locally"
                      className="w-full sm:w-auto sm:min-w-[156px] h-[44px] px-4 sm:px-5 rounded-full bg-white/[0.05] border border-white/15 text-[13px] sm:text-sm font-semibold text-slate-300/80 inline-flex items-center justify-center gap-2 whitespace-nowrap cursor-not-allowed"
                    >
                      <span>Live Demo (N/A)</span>
                    </button>
                  )}
                </div>
              </div>
            </footer>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}
