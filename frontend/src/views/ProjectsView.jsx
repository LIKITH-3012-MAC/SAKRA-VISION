import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HelpCircle, Eye, X, ArrowRight, CheckCircle2, Cpu, Terminal, Layers } from 'lucide-react';
import projectsData from '../data/projects';
import ProjectModal from '../components/ProjectModal';
import TiltCard from '../components/TiltCard';

export default function ProjectsView() {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProject, setSelectedProject] = useState(null);

  // Filter projects based on category and search query
  const filteredProjects = projectsData.filter((project) => {
    const matchesCategory = selectedCategory === 'All' || project.tags.includes(selectedCategory);
    const query = searchQuery.toLowerCase().trim();
    
    const matchesSearch = 
      project.title.toLowerCase().includes(query) ||
      project.category.toLowerCase().includes(query) ||
      project.shortDesc.toLowerCase().includes(query) ||
      project.techStack.some(tech => tech.toLowerCase().includes(query));
      
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="w-full relative bg-black pt-28 pb-20">
      <div className="max-w-6xl mx-auto px-6">
        
        {/* Section Header */}
        <div className="text-center mb-16">
          <span className="text-xs font-mono tracking-widest text-[#0071e3] uppercase">
            Product Gallery
          </span>
          <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight mt-2 text-white font-sans">
            Designed for real-world systems.
          </h2>
          <p className="text-[#94a3b8] max-w-2xl mx-auto text-sm md:text-base font-light mt-4 font-sans">
            Explore the intelligent systems, AI products, automation platforms, and full-stack solutions built under SAKRA VISION.
          </p>
        </div>

        {/* Controls: Search and Categories */}
        <div className="flex flex-col lg:flex-row justify-between items-center gap-6 mb-16 max-w-5xl mx-auto z-10 relative">
          
          {/* Category Filter Chips */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 lg:pb-0 w-full lg:w-auto scrollbar-none max-w-full">
            {['All', 'AI Platforms', 'RAG / LLM', 'Automation', 'Full Stack', 'Civic-Tech'].map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold tracking-wide whitespace-nowrap transition-all duration-250 cursor-pointer ${
                  selectedCategory === category 
                    ? 'bg-white text-black border border-white' 
                    : 'bg-white/5 border border-white/5 text-[#94a3b8] hover:text-white hover:bg-white/10'
                }`}
              >
                {category}
              </button>
            ))}
          </div>

          {/* Search Bar */}
          <div className="w-full lg:w-80 relative">
            <input
              type="text"
              placeholder="Search specs, stack, features..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-black/60 border border-white/10 rounded-2xl py-3 px-5 pr-12 text-sm text-[#cbd5e1] placeholder-[#64748b] focus:outline-none focus:border-[#0071e3]/60 focus:ring-1 focus:ring-[#0071e3]/40 transition-all duration-300 font-sans"
            />
            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[#94a3b8]">
              {searchQuery ? (
                <button onClick={() => setSearchQuery('')} className="hover:text-white cursor-pointer">
                  <X className="w-4 h-4" />
                </button>
              ) : (
                <Eye className="w-4 h-4 text-[#0071e3] animate-pulse" />
              )}
            </div>
          </div>

        </div>

        {/* Grid of Projects */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 max-w-5xl mx-auto z-10 relative">
          <AnimatePresence mode="popLayout">
            {filteredProjects.map((project) => (
              <motion.div 
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.4 }}
                key={project.id}
                className="h-full"
              >
                <TiltCard className="apple-glass rounded-[2rem] p-8 border border-white/5 text-left relative overflow-hidden flex flex-col justify-between gap-6 group hover:shadow-[0_20px_50px_rgba(0,113,227,0.12)] hover:border-[#38bdf8]/30 select-none cursor-default h-full min-h-[360px]">
                  {/* Glow backdrop */}
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-b from-[#0071e3]/5 to-transparent rounded-full blur-3xl pointer-events-none group-hover:from-[#0071e3]/10 transition-all duration-300" />
                  
                  <div className="flex flex-col gap-4" style={{ transformStyle: 'preserve-3d' }}>
                    
                    {/* Category & Status */}
                    <div className="flex justify-between items-start">
                      <div>
                        <span 
                          className="text-[10px] font-mono font-bold tracking-widest text-[#38bdf8] uppercase transition-transform duration-300 inline-block"
                          style={{ transform: 'translateZ(20px)' }}
                        >
                          {project.category}
                        </span>
                        <h3 
                          className="text-2xl font-bold tracking-tight text-white group-hover:text-[#38bdf8] transition-colors duration-250 mt-1 font-sans transition-transform duration-300"
                          style={{ transform: 'translateZ(30px)' }}
                        >
                          {project.title}
                        </h3>
                      </div>
                      
                      <span className={`flex items-center gap-1.5 text-[9px] font-mono font-bold px-2 py-0.5 rounded-full bg-white/5 border border-white/10 ${
                        project.status === 'Live' ? 'text-emerald-400 border-emerald-950/20' :
                        project.status === 'In Development' ? 'text-amber-400 border-amber-950/20' :
                        'text-[#38bdf8] border-[#0071e3]/20'
                      }`}>
                        <span className={`w-1 h-1 rounded-full ${
                          project.status === 'Live' ? 'bg-emerald-400 animate-ping' :
                          project.status === 'In Development' ? 'bg-amber-400' :
                          'bg-[#38bdf8]'
                        }`} /> 
                        {project.status}
                      </span>
                    </div>

                    {/* Tagline */}
                    <div 
                      className="text-xs italic text-[#94a3b8] tracking-wide transition-transform duration-300"
                      style={{ transform: 'translateZ(15px)' }}
                    >
                      "{project.tagline}"
                    </div>

                    {/* Short Description */}
                    <p 
                      className="text-[#cbd5e1] text-xs md:text-sm leading-relaxed font-light font-sans transition-transform duration-300"
                      style={{ transform: 'translateZ(10px)' }}
                    >
                      {project.shortDesc}
                    </p>

                    {/* Tech stack chips */}
                    <div 
                      className="flex flex-wrap gap-1.5 mt-2 transition-transform duration-300"
                      style={{ transform: 'translateZ(8px)' }}
                    >
                      {project.techStack.map((tech, i) => (
                        <span key={i} className="text-[9px] font-mono tracking-wider text-[#94a3b8] bg-black/60 border border-white/5 px-2 py-0.5 rounded-md">
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* CTAs */}
                  <div 
                    className="grid grid-cols-2 gap-3 pt-5 border-t border-white/5 mt-auto relative z-20 transition-transform duration-300"
                    style={{ transform: 'translateZ(5px)' }}
                  >
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedProject(project);
                      }}
                      className="apple-dark-button py-2 rounded-xl text-xs font-bold text-center cursor-pointer shadow-sm"
                    >
                      More Info
                    </button>
                    
                    <a 
                      href={project.liveLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => project.liveLink === '#' && e.preventDefault()}
                      className={`apple-button py-2 rounded-xl text-xs font-bold text-center cursor-pointer ${
                        project.liveLink === '#' ? 'opacity-40 pointer-events-none' : ''
                      }`}
                    >
                      View Product
                    </a>
                  </div>
                </TiltCard>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Empty Search State */}
        {filteredProjects.length === 0 && (
          <div className="text-center py-12 max-w-md mx-auto">
            <HelpCircle className="w-10 h-10 text-[#0071e3]/50 mx-auto mb-4 animate-bounce" />
            <h3 className="text-base font-bold text-white font-sans">No Products Match</h3>
            <p className="text-[#94a3b8] text-xs mt-1">
              No SAKRA products found matching your search. Try clearing filters.
            </p>
            <button
              onClick={() => {
                setSelectedCategory('All');
                setSearchQuery('');
              }}
              className="mt-4 apple-dark-button px-5 py-2.5 rounded-xl text-xs font-bold uppercase cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        )}

      </div>

      {/* Project detail modal */}
      <AnimatePresence>
        {selectedProject && (
          <ProjectModal 
            selectedProject={selectedProject} 
            setSelectedProject={setSelectedProject} 
          />
        )}
      </AnimatePresence>
    </div>
  );
}
