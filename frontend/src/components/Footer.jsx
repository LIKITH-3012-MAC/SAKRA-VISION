import React from 'react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const handleScrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="border-t border-white/10 bg-black relative z-10 py-10 pb-24 sm:pb-10 px-6">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 md:pr-20">
        {/* Branding */}
        <div className="flex flex-col items-center md:items-start text-center md:text-left">
          <div className="flex items-center gap-2">
            <img
              src="/SAKRAVISION.png"
              alt="SAKRA VISION Logo"
              width="20"
              height="20"
              className="w-5 h-5 object-contain"
              loading="lazy"
            />
            <span className="font-sans font-bold tracking-tight text-white text-sm">SAKRA VISION</span>
          </div>
          <p className="text-xs text-slate-300 font-mono mt-1">
            From Ideas to Intelligent Systems
          </p>
        </div>

        {/* Story Tagline */}
        <div className="text-center">
          <p className="text-xs text-slate-300 font-mono tracking-wider uppercase">
            // Engineering Intelligence Into Reality
          </p>
        </div>

        {/* Navigation & Copyright */}
        <div className="flex flex-col items-center md:items-end text-center md:text-right gap-2.5">
          <p className="text-xs text-slate-300 font-sans">
            &copy; {currentYear} Sakra Vision AI Product Studio by Likith Naidu Anumakonda
          </p>
          <button
            type="button"
            onClick={handleScrollToTop}
            className="text-xs text-[#38bdf8] hover:text-white font-mono transition-colors duration-200 cursor-pointer bg-white/5 border border-white/15 hover:border-[#38bdf8]/45 px-4 py-2 min-h-[44px] rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#38bdf8]"
          >
            Back to Top ↑
          </button>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
