import React from 'react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const handleScrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="border-t border-white/10 bg-black relative z-10 py-10 px-6">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        
        {/* Branding */}
        <div className="flex flex-col items-center md:items-start text-center md:text-left">
          <div className="flex items-center gap-2">
            <span className="w-4 h-4 bg-gradient-to-tr from-[#0071e3] to-[#38bdf8] rounded-sm"></span>
            <span className="font-sans font-bold tracking-tight text-white text-sm">SAKRA VISION</span>
          </div>
          <p className="text-[10px] text-slate-500 font-mono mt-1">
            From Ideas to Intelligent Systems
          </p>
        </div>

        {/* Story Tagline */}
        <div className="text-center">
          <p className="text-[10px] text-slate-400 font-mono tracking-wider uppercase">
            // Engineering Intelligence Into Reality
          </p>
        </div>

        {/* Navigation & Copyright */}
        <div className="flex flex-col items-center md:items-end text-center md:text-right gap-2.5">
          <p className="text-xs text-slate-500 font-sans">
            &copy; {currentYear} SAKRA VISION. All Rights Reserved.
          </p>
          <button
            onClick={handleScrollToTop}
            className="text-[10px] text-[#0071e3] hover:text-[#0a84ff] font-mono transition-colors duration-200 cursor-pointer bg-white/5 border border-white/5 hover:border-white/10 px-3 py-1.5 rounded-lg"
          >
            Back to Top ↑
          </button>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
