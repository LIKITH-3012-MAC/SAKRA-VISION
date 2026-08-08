import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, ArrowUpRight } from 'lucide-react';

export default function Navbar({ activeView, setActiveView, mobileMenuOpen, setMobileMenuOpen, isScrolled }) {
  const links = [
    { id: 'overview', label: 'Overview' },
    { id: 'about', label: 'About' },
    { id: 'capabilities', label: 'Capabilities' },
    { id: 'projects', label: 'Projects' },
    { id: 'techSpecs', label: 'Tech Specs' },
    { id: 'leadership', label: 'Leadership' },
    { id: 'inquire', label: 'Inquire' },
  ];

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  // Close mobile menu on Escape key press
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && mobileMenuOpen) {
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [mobileMenuOpen, setMobileMenuOpen]);

  return (
    <header
      className="fixed top-0 left-0 right-0 w-full z-[1000] transition-all duration-300 pointer-events-auto"
      style={{
        willChange: 'transform, opacity',
        paddingTop: 'env(safe-area-inset-top)'
      }}
    >
      <nav
        aria-label="Main Navigation"
        className={`w-full transition-all duration-300 ${
          isScrolled
            ? 'py-3.5 bg-black/85 backdrop-blur-2xl border-b border-white/10 shadow-[0_12px_40px_rgba(0,0,0,0.85)]'
            : 'py-5 bg-black/40 backdrop-blur-md border-b border-white/5'
        }`}
      >
        <div className="max-w-6xl mx-auto px-6 flex justify-between items-center relative">
          
          {/* Logo Brand Identifier */}
          <button 
            onClick={() => {
              setActiveView('overview');
              if (mobileMenuOpen) setMobileMenuOpen(false);
            }} 
            className="flex items-center gap-3 group cursor-pointer text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0071e3] rounded-lg p-1"
          >
            <img
              src="/SAKRAVISION.png"
              alt="SAKRA VISION Brand Identifier"
              className="h-8 w-8 md:h-9 md:w-9 object-contain transition-transform duration-300 group-hover:scale-[1.04]"
            />
            <div className="flex flex-col">
              <span className="text-base md:text-lg font-bold tracking-tight text-white font-sans uppercase leading-none">
                SAKRA VISION
              </span>
              <span className="text-[9px] font-mono tracking-widest text-[#38bdf8] uppercase mt-0.5 font-medium">
                AI PRODUCT STUDIO
              </span>
            </div>
          </button>

          {/* Desktop Navigation Links */}
          <div className="hidden lg:flex items-center gap-6 xl:gap-8">
            {links.map((link) => {
              const isActive = activeView === link.id;
              return (
                <button
                  key={link.id}
                  onClick={() => setActiveView(link.id)}
                  className={`text-xs font-medium tracking-wide transition-all duration-200 cursor-pointer relative py-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0071e3] rounded ${
                    isActive ? 'text-white font-semibold' : 'text-[#94a3b8] hover:text-white'
                  }`}
                >
                  {link.label}
                  {isActive && (
                    <motion.div 
                      layoutId="activeNavIndicator" 
                      className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#0071e3] rounded-full shadow-[0_0_8px_#0071e3]" 
                      transition={{ type: "spring", stiffness: 400, damping: 32 }}
                    />
                  )}
                </button>
              );
            })}
          </div>

          {/* Primary CTA Button (Desktop & Tablet) */}
          <div className="hidden md:flex items-center gap-3">
            <button 
              onClick={() => setActiveView('inquire')} 
              className="text-xs font-semibold px-5 py-2.5 rounded-full border border-[#38bdf8]/40 bg-[#0071e3] hover:bg-[#0a84ff] text-white transition-all duration-200 cursor-pointer shadow-[0_4px_16px_rgba(0,113,227,0.35)] hover:shadow-[0_6px_22px_rgba(0,113,227,0.5)] active:scale-[0.98] inline-flex items-center gap-1.5 min-h-[40px]"
            >
              <span>Start Project</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Hamburger Mobile Menu Toggle Button */}
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)} 
            aria-expanded={mobileMenuOpen}
            aria-controls="mobile-navigation"
            aria-label="Toggle navigation menu"
            className="lg:hidden text-[#94a3b8] hover:text-white p-2.5 rounded-xl border border-white/10 bg-white/5 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0071e3] cursor-pointer min-w-[44px] min-h-[44px] flex items-center justify-center transition-colors"
          >
            {mobileMenuOpen ? <X className="w-5 h-5 text-white" /> : <Menu className="w-5 h-5" />}
          </button>

        </div>

        {/* Mobile Floating Glass Overlay Menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div 
              id="mobile-navigation"
              initial={{ opacity: 0, y: -15, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -15, scale: 0.98 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              className="lg:hidden w-full bg-black/95 backdrop-blur-3xl border-b border-white/10 absolute top-full left-0 z-[2000] shadow-2xl overflow-hidden"
            >
              <div className="max-w-6xl mx-auto px-6 py-6 flex flex-col gap-2 text-left">
                <span className="text-[10px] font-mono tracking-widest text-[#38bdf8] uppercase mb-2">
                  ✦ STUDIO NAVIGATION
                </span>
                
                {links.map((link) => {
                  const isActive = activeView === link.id;
                  return (
                    <button
                      key={link.id}
                      onClick={() => {
                        setActiveView(link.id);
                        setMobileMenuOpen(false);
                      }}
                      className={`text-left text-sm font-medium tracking-wide py-3 px-4 rounded-xl border transition-all cursor-pointer min-h-[44px] flex items-center justify-between ${
                        isActive
                          ? 'bg-[#0071e3]/20 border-[#38bdf8]/40 text-white font-semibold shadow-inner'
                          : 'bg-white/[0.02] border-white/5 text-[#94a3b8] hover:text-white hover:bg-white/5'
                      }`}
                    >
                      <span>{link.label}</span>
                      {isActive && <span className="w-2 h-2 rounded-full bg-[#38bdf8]" />}
                    </button>
                  );
                })}

                <button 
                  onClick={() => {
                    setActiveView('inquire');
                    setMobileMenuOpen(false);
                  }}
                  className="w-full text-center py-3.5 bg-[#0071e3] hover:bg-[#0a84ff] text-white font-semibold rounded-xl mt-4 cursor-pointer shadow-lg shadow-[#0071e3]/30 border border-[#38bdf8]/40 min-h-[44px] flex items-center justify-center gap-2"
                >
                  <span>Start Project</span>
                  <ArrowUpRight className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </nav>
    </header>
  );
}
