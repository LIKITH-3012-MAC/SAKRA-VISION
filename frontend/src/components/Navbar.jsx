import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, ArrowUpRight } from 'lucide-react';

const FOCUSABLE_SELECTOR = [
  'a[href]',
  'button:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(', ');

export default function Navbar({ activeView, setActiveView, mobileMenuOpen, setMobileMenuOpen, isScrolled }) {
  const toggleBtnRef = useRef(null);
  const mobileMenuRef = useRef(null);
  const wasMobileOpenRef = useRef(false);

  const links = [
    { id: 'overview', label: 'Overview' },
    { id: 'about', label: 'About' },
    { id: 'capabilities', label: 'Capabilities' },
    { id: 'projects', label: 'Projects' },
    { id: 'techSpecs', label: 'Tech Specs' },
    { id: 'leadership', label: 'Leadership' },
    { id: 'inquire', label: 'Inquire' },
  ];

  // Lock body scroll & manage keyboard focus when mobile menu opens/closes
  useEffect(() => {
    if (mobileMenuOpen) {
      wasMobileOpenRef.current = true;
      const prevOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';

      const raf = requestAnimationFrame(() => {
        const firstBtn = mobileMenuRef.current?.querySelector('button');
        firstBtn?.focus({ preventScroll: true });
      });

      return () => {
        cancelAnimationFrame(raf);
        document.body.style.overflow = prevOverflow;
      };
    }

    if (!mobileMenuOpen && wasMobileOpenRef.current) {
      wasMobileOpenRef.current = false;
      requestAnimationFrame(() => {
        toggleBtnRef.current?.focus({ preventScroll: true });
      });
    }
  }, [mobileMenuOpen]);

  // Close mobile menu on Escape, focus-trap Tab inside drawer, & close on >=1024px resize
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!mobileMenuOpen) return;

      if (e.key === 'Escape') {
        e.preventDefault();
        setMobileMenuOpen(false);
        return;
      }

      if (e.key === 'Tab' && mobileMenuRef.current) {
        const focusables = Array.from(
          mobileMenuRef.current.querySelectorAll(FOCUSABLE_SELECTOR)
        );
        if (focusables.length === 0) return;

        const firstEl = focusables[0];
        const lastEl = focusables[focusables.length - 1];

        if (e.shiftKey && document.activeElement === firstEl) {
          e.preventDefault();
          toggleBtnRef.current?.focus();
        } else if (!e.shiftKey && document.activeElement === lastEl) {
          e.preventDefault();
          toggleBtnRef.current?.focus();
        } else if (!e.shiftKey && document.activeElement === toggleBtnRef.current) {
          e.preventDefault();
          firstEl.focus();
        } else if (e.shiftKey && document.activeElement === toggleBtnRef.current) {
          e.preventDefault();
          lastEl.focus();
        }
      }
    };

    const handleResize = () => {
      if (window.innerWidth >= 1024 && mobileMenuOpen) {
        setMobileMenuOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('resize', handleResize);
    };
  }, [mobileMenuOpen, setMobileMenuOpen]);

  const navBarSurface = mobileMenuOpen
    ? 'py-3.5 bg-[#030712] border-b border-white/15 shadow-[0_12px_40px_rgba(0,0,0,0.9)]'
    : isScrolled
      ? 'py-3.5 bg-[#030712]/95 backdrop-blur-xl border-b border-white/15 shadow-[0_12px_40px_rgba(0,0,0,0.9)]'
      : 'py-4 sm:py-5 bg-[#030712]/85 backdrop-blur-md border-b border-white/10';

  return (
    <header
      className="fixed top-0 left-0 right-0 w-full z-[1000] transition-all duration-300 pointer-events-auto"
      style={{ paddingTop: 'env(safe-area-inset-top)' }}
    >
      <nav aria-label="Main Navigation" className={`w-full transition-all duration-300 relative ${navBarSurface}`}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex justify-between items-center relative gap-3 sm:gap-4">
          {/* Logo Brand Identifier */}
          <button
            type="button"
            onClick={() => {
              setActiveView('overview');
              if (mobileMenuOpen) setMobileMenuOpen(false);
            }}
            className="flex items-center gap-2.5 sm:gap-3 group cursor-pointer text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#38bdf8] rounded-lg p-1 shrink-0"
          >
            <img
              src="/SAKRAVISION.png"
              alt="SAKRA VISION Brand Identifier"
              width="36"
              height="36"
              className="h-8 w-8 md:h-9 md:w-9 object-contain transition-transform duration-300 group-hover:scale-[1.04]"
            />
            <div className="flex flex-col">
              <span className="text-base md:text-lg font-bold tracking-tight text-white font-sans uppercase leading-none">
                SAKRA VISION
              </span>
              <span className="text-[11px] font-mono tracking-wider text-[#38bdf8] uppercase mt-0.5 font-medium">
                AI PRODUCT STUDIO
              </span>
            </div>
          </button>

          {/* Desktop Navigation Links */}
          <div className="hidden lg:flex items-center gap-4 xl:gap-7">
            {links.map((link) => {
              const isActive = activeView === link.id;
              return (
                <button
                  key={link.id}
                  type="button"
                  onClick={() => setActiveView(link.id)}
                  aria-current={isActive ? 'page' : undefined}
                  className={`text-xs xl:text-[13px] font-medium tracking-wide transition-colors duration-200 cursor-pointer relative py-2 px-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#38bdf8] rounded whitespace-nowrap ${
                    isActive ? 'text-white font-semibold' : 'text-slate-300 hover:text-white'
                  }`}
                >
                  {link.label}
                  {isActive && (
                    <motion.div
                      layoutId="activeNavIndicator"
                      className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#38bdf8] rounded-full shadow-[0_0_8px_#38bdf8]"
                      transition={{ type: 'spring', stiffness: 400, damping: 32 }}
                    />
                  )}
                </button>
              );
            })}
          </div>

          {/* Right Action Cluster (keeps Tablet CTA & Hamburger aligned together) */}
          <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
            <button
              type="button"
              onClick={() => {
                setActiveView('inquire');
                if (mobileMenuOpen) setMobileMenuOpen(false);
              }}
              className="hidden md:inline-flex text-xs font-semibold px-5 py-2.5 rounded-full border border-[#38bdf8]/40 bg-[#0071e3] hover:bg-[#0a84ff] text-white transition-all duration-200 cursor-pointer shadow-[0_4px_16px_rgba(0,113,227,0.35)] hover:shadow-[0_6px_22px_rgba(0,113,227,0.5)] active:scale-[0.98] items-center gap-1.5 min-h-[40px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white whitespace-nowrap"
            >
              <span>Start Project</span>
              <ArrowUpRight className="w-3.5 h-3.5" aria-hidden="true" />
            </button>

            <button
              ref={toggleBtnRef}
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-expanded={mobileMenuOpen}
              aria-controls="mobile-navigation"
              aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
              className="lg:hidden text-slate-200 hover:text-white p-2.5 rounded-xl border border-white/15 bg-white/[0.06] hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#38bdf8] cursor-pointer min-w-[44px] min-h-[44px] flex items-center justify-center transition-colors shrink-0"
            >
              {mobileMenuOpen ? <X className="w-5 h-5 text-white" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Floating Glass Overlay Menu + Opaque Viewport Scrim */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <>
              <motion.div
                aria-hidden="true"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.18 }}
                onClick={() => setMobileMenuOpen(false)}
                className="lg:hidden absolute inset-x-0 top-full h-[100dvh] bg-black/85 backdrop-blur-sm z-[1990]"
              />
              <motion.div
                ref={mobileMenuRef}
                id="mobile-navigation"
                role="dialog"
                aria-modal="true"
                aria-label="Mobile Navigation"
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                className="lg:hidden w-full bg-[#050914] border-b border-white/15 absolute top-full left-0 z-[2000] shadow-2xl max-h-[calc(100dvh-5rem)] overflow-y-auto overscroll-contain"
              >
                <div className="max-w-6xl mx-auto px-5 py-5 flex flex-col gap-2 text-left">
                  <span className="text-xs font-mono tracking-widest text-[#38bdf8] uppercase mb-1">
                    Studio Navigation
                  </span>

                  {links.map((link) => {
                    const isActive = activeView === link.id;
                    return (
                      <button
                        key={link.id}
                        type="button"
                        onClick={() => {
                          setActiveView(link.id);
                          setMobileMenuOpen(false);
                        }}
                        aria-current={isActive ? 'page' : undefined}
                        className={`text-left text-sm font-medium tracking-wide py-3 px-4 rounded-xl border transition-colors cursor-pointer min-h-[44px] flex items-center justify-between focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#38bdf8] ${
                          isActive
                            ? 'bg-[#0071e3]/20 border-[#38bdf8]/45 text-white font-semibold'
                            : 'bg-white/[0.03] border-white/10 text-slate-200 hover:text-white hover:bg-white/[0.07]'
                        }`}
                      >
                        <span>{link.label}</span>
                        {isActive && <span className="w-2 h-2 rounded-full bg-[#38bdf8]" aria-hidden="true" />}
                      </button>
                    );
                  })}

                  <button
                    type="button"
                    onClick={() => {
                      setActiveView('inquire');
                      setMobileMenuOpen(false);
                    }}
                    className="w-full text-center py-3.5 bg-[#0071e3] hover:bg-[#0a84ff] text-white font-semibold rounded-xl mt-3 cursor-pointer shadow-lg shadow-[#0071e3]/30 border border-[#38bdf8]/40 min-h-[44px] flex items-center justify-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                  >
                    <span>Start Project</span>
                    <ArrowUpRight className="w-4 h-4" aria-hidden="true" />
                  </button>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </nav>
    </header>
  );
}
