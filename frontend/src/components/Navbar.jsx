import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Cpu, Menu, X } from 'lucide-react';

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

  return (
    <nav className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${
      isScrolled 
        ? 'py-3 bg-black/70 backdrop-blur-md border-b border-white/10 shadow-lg' 
        : 'py-5 bg-transparent'
    }`}>
      <div className="max-w-6xl mx-auto px-6 flex justify-between items-center">
        
        <button onClick={() => setActiveView('overview')} className="flex items-center gap-3 group cursor-pointer">
          <img
            src="/SAKRAVISION.png"
            alt="SAKRA VISION Logo"
            className="h-8 w-8 md:h-10 md:w-10 object-contain transition-transform duration-350 group-hover:scale-[1.03]"
          />
          <span className="text-base md:text-lg font-bold tracking-tight text-white font-sans uppercase">
            SAKRA VISION
          </span>
        </button>

        {/* Desktop Links (Apple Nav Style) */}
        <div className="hidden md:flex items-center gap-7">
          {links.map((link) => (
            <button
              key={link.id}
              onClick={() => setActiveView(link.id)}
              className={`text-xs font-normal tracking-wide transition-colors duration-250 cursor-pointer relative py-1 ${
                activeView === link.id ? 'text-white' : 'text-[#94a3b8] hover:text-white'
              }`}
            >
              {link.label}
              {activeView === link.id && (
                <motion.div 
                  layoutId="activeBar" 
                  className="absolute bottom-0 left-0 w-full h-[1.5px] bg-[#0071e3]" 
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                />
              )}
            </button>
          ))}
        </div>

        {/* Apple CTA Button */}
        <div className="hidden md:block">
          <button 
            onClick={() => setActiveView('inquire')} 
            className="text-xs font-semibold px-4.5 py-2 rounded-full border border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20 text-white transition-all duration-200 cursor-pointer"
          >
            Start Project
          </button>
        </div>

        {/* Hamburger Mobile Button */}
        <button 
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)} 
          className="md:hidden text-[#94a3b8] hover:text-white p-1.5 focus:outline-none cursor-pointer"
        >
          {mobileMenuOpen ? <X className="w-5.5 h-5.5" /> : <Menu className="w-5.5 h-5.5" />}
        </button>
      </div>

      {/* Mobile Menu Panel */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.25 }}
            className="md:hidden w-full bg-black/95 backdrop-blur-2xl border-b border-white/10 absolute top-full left-0 z-40"
          >
            <div className="px-6 py-6 flex flex-col gap-4">
              {links.map((link) => (
                <button
                  key={link.id}
                  onClick={() => {
                    setActiveView(link.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`text-left text-sm font-light tracking-wide py-2 border-b border-white/5 cursor-pointer ${
                    activeView === link.id ? 'text-white font-medium' : 'text-[#94a3b8]'
                  }`}
                >
                  {link.label}
                </button>
              ))}
              <button 
                onClick={() => {
                  setActiveView('inquire');
                  setMobileMenuOpen(false);
                }}
                className="w-full text-center py-3.5 bg-[#0071e3] text-white font-semibold rounded-xl mt-2 cursor-pointer shadow-md shadow-[#0071e3]/20"
              >
                Start Project
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
