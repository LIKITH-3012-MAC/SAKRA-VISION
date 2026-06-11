import React from 'react';
import { motion } from 'framer-motion';
import { X, Zap, Cpu, CheckCircle2, ExternalLink, Github } from 'lucide-react';

export default function ProjectModal({ selectedProject, setSelectedProject }) {
  if (!selectedProject) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={() => setSelectedProject(null)}
      className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9, rotateX: -10, y: 30 }}
        animate={{ opacity: 1, scale: 1, rotateX: 0, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, rotateX: -10, y: 30 }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        onClick={(e) => e.stopPropagation()}
        className="apple-glass w-full max-w-2xl rounded-[2.5rem] border border-white/10 p-6 md:p-8 relative overflow-hidden flex flex-col gap-6 max-h-[85vh] overflow-y-auto shadow-2xl"
      >
        {/* Glow Effects */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-[#0071e3]/[0.05] rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-[#38bdf8]/[0.05] rounded-full blur-3xl pointer-events-none" />

        {/* Modal Header */}
        <div className="flex justify-between items-start border-b border-white/5 pb-4">
          <div className="text-left">
            <span className="text-[10px] font-mono font-bold tracking-widest text-[#38bdf8] uppercase bg-white/5 border border-white/10 px-3 py-1 rounded-full">
              {selectedProject.category}
            </span>
            <h3 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight mt-3">
              {selectedProject.title}
            </h3>
            <p className="text-xs font-semibold text-[#94a3b8] italic mt-1.5">
              "{selectedProject.tagline}"
            </p>
          </div>
          
          {/* Close Button */}
          <button 
            onClick={() => setSelectedProject(null)}
            className="p-2 rounded-xl bg-white/5 border border-white/5 hover:border-white/20 text-slate-400 hover:text-white transition-all duration-200 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="flex flex-col gap-5 text-left text-sm md:text-base">
          
          {/* Description */}
          <div>
            <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5 font-mono">Overview Description</h4>
            <p className="text-[#cbd5e1] leading-relaxed font-light text-xs md:text-sm font-sans">
              {selectedProject.fullDesc}
            </p>
          </div>

          {/* Problem & How It Works (Split Columns) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="p-4.5 rounded-2xl bg-white/[0.02] border border-white/5">
              <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 flex items-center gap-1.5 font-mono">
                <Zap className="w-3.5 h-3.5 text-[#0071e3]" /> Target Obstacle
              </h4>
              <p className="text-[#94a3b8] text-xs leading-relaxed font-light font-sans">
                {selectedProject.problemSolved}
              </p>
            </div>

            <div className="p-4.5 rounded-2xl bg-[#0071e3]/[0.02] border border-[#0071e3]/10">
              <h4 className="text-[10px] font-bold text-[#38bdf8] uppercase tracking-widest mb-1.5 flex items-center gap-1.5 font-mono">
                <Cpu className="w-3.5 h-3.5" /> Inner Logic
              </h4>
              <p className="text-[#cbd5e1] text-xs leading-relaxed font-light font-sans">
                {selectedProject.howItWorks}
              </p>
            </div>
          </div>

          {/* Key Features */}
          <div>
            <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2.5 font-mono">Key Features</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {selectedProject.keyFeatures.map((feat, i) => (
                <div key={i} className="flex items-center gap-2 text-xs text-[#cbd5e1] font-sans">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#38bdf8] flex-shrink-0" />
                  <span>{feat}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Tech Stack */}
          <div>
            <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 font-mono">Tech Stack</h4>
            <div className="flex flex-wrap gap-1.5">
              {selectedProject.techStack.map((tech, idx) => (
                <span key={idx} className="text-[9px] font-mono tracking-wider text-white bg-white/5 border border-white/5 px-2.5 py-1 rounded-md">
                  {tech}
                </span>
              ))}
            </div>
          </div>

        </div>

        {/* Footer Buttons */}
        <div className="grid grid-cols-3 gap-3 pt-6 border-t border-white/5 mt-2 z-10 relative">
          <a 
            href={selectedProject.liveLink}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => selectedProject.liveLink === '#' && e.preventDefault()}
            className={`apple-button py-2.5 rounded-xl text-xs font-bold text-center cursor-pointer ${
              selectedProject.liveLink === '#' ? 'opacity-40 pointer-events-none' : ''
            }`}
          >
            Live Link
          </a>

          <a 
            href={selectedProject.gitLink}
            target="_blank"
            rel="noopener noreferrer"
            className="apple-dark-button py-2.5 rounded-xl text-xs font-bold text-center cursor-pointer"
          >
            GitHub Code
          </a>

          <button 
            onClick={() => setSelectedProject(null)}
            className="bg-white/5 border border-white/10 hover:bg-white/10 py-2.5 rounded-xl text-xs font-bold text-[#cbd5e1] text-center cursor-pointer transition-all duration-200"
          >
            Close
          </button>
        </div>

      </motion.div>
    </motion.div>
  );
}
