import React from 'react';
import { motion } from 'framer-motion';
import { Zap, Globe } from 'lucide-react';

export default function MissionVision() {
  return (
    <section className="py-12 bg-black relative z-10">
      <div className="max-w-6xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Mission Card */}
          <motion.div 
            whileHover={{ y: -5, borderColor: 'rgba(56, 189, 248, 0.35)' }}
            className="apple-glass p-8 rounded-3xl text-left border border-white/5 relative overflow-hidden transition-all duration-300 group shadow-lg"
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-[#0071e3]/5 rounded-full blur-2xl group-hover:bg-[#0071e3]/10 transition-all duration-300 pointer-events-none" />
            <div className="w-12 h-12 rounded-2xl bg-black/60 border border-white/10 flex items-center justify-center mb-6">
              <Zap className="w-5 h-5 text-[#38bdf8]" />
            </div>
            <h3 className="text-xl font-bold mb-3 text-white font-sans">Our Mission</h3>
            <p className="text-[#94a3b8] leading-relaxed font-light text-sm font-sans">
              To build intelligent, highly accessible, and impact-driven AI products that empower businesses, researchers, and public communities to solve complex challenges with custom engineering and accelerated automation.
            </p>
          </motion.div>

          {/* Vision Card */}
          <motion.div 
            whileHover={{ y: -5, borderColor: 'rgba(56, 189, 248, 0.35)' }}
            className="apple-glass p-8 rounded-3xl text-left border border-white/5 relative overflow-hidden transition-all duration-300 group shadow-lg"
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-[#0071e3]/5 rounded-full blur-2xl group-hover:bg-[#0071e3]/10 transition-all duration-300 pointer-events-none" />
            <div className="w-12 h-12 rounded-2xl bg-black/60 border border-white/10 flex items-center justify-center mb-6">
              <Globe className="w-5 h-5 text-[#38bdf8]" />
            </div>
            <h3 className="text-xl font-bold mb-3 text-white font-sans">Our Vision</h3>
            <p className="text-[#94a3b8] leading-relaxed font-light text-sm font-sans">
              To become a global AI innovation laboratory and product studio recognized for engineering reliable, secure, and creatively inspired hardware/software products designed in India for the global deep-tech ecosystem.
            </p>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
