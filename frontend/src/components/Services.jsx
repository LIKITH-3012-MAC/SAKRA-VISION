import React from 'react';
import { motion } from 'framer-motion';
import { Cpu, Eye, Terminal, Layers, Zap, Globe } from 'lucide-react';

export default function Services() {
  const services = [
    {
      title: 'AI Applications',
      desc: 'Cognitive user applications powered by machine learning algorithms, trained models, and dynamic server-side computation targeting real-world operations.',
      icon: Cpu
    },
    {
      title: 'Computer Vision Systems',
      desc: 'High-precision detection models, image recognition utilities, automated face/screenshot scanning, and custom OpenCV processing operations.',
      icon: Eye
    },
    {
      title: 'LLM & RAG Tools',
      desc: 'Intelligent vector database retrieval, context-aware query systems, automated document indexers, and local LLM execution systems.',
      icon: Terminal
    },
    {
      title: 'Full-Stack Products',
      desc: 'Production-ready web layers, JWT authentication systems, RESTful API design, dashboard systems, and cloud databases (MySQL, MongoDB).',
      icon: Layers
    },
    {
      title: 'Automation Systems',
      desc: 'Scripting infrastructure, chron-based database validators, verification webhooks, and complex third-party API workflow automations.',
      icon: Zap
    },
    {
      title: 'Civic-Tech & Social AI',
      desc: 'Meaningful community platforms, educational AI tools, secure registration systems, and supportive solutions addressing public concerns.',
      icon: Globe
    }
  ];

  return (
    <section id="services" className="py-24 bg-black relative">
      <div className="max-w-6xl mx-auto px-6">
        
        {/* Section Header */}
        <div className="text-center mb-20">
          <span className="text-xs font-mono tracking-widest text-[#0071e3] uppercase">
            Capabilities
          </span>
          <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight mt-2 text-white font-sans">
            Built for intelligent execution.
          </h2>
          <p className="text-[#94a3b8] max-w-xl mx-auto text-sm md:text-base font-light mt-4 font-sans">
            We design and engineer tailored AI capabilities across computer vision scanning, large language models, automation workflows, and high-performance full-stack web products.
          </p>
        </div>

        {/* 3D Floating Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 perspective-container z-10 relative">
          {services.map((service, index) => {
            const IconComp = service.icon;
            
            return (
              <motion.div 
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="apple-glass p-8 rounded-3xl text-left relative overflow-hidden select-none cursor-default card-3d border border-white/5"
              >
                {/* Visual Glow */}
                <div className="absolute top-0 right-0 w-24 h-24 bg-white/[0.01] rounded-full blur-2xl group-hover:bg-[#0071e3]/[0.05] transition-all duration-350 pointer-events-none" />
                
                {/* Minimalist Icon Container */}
                <div className="w-12 h-12 rounded-2xl bg-black/60 flex items-center justify-center border border-white/10 mb-6">
                  <IconComp className="w-5 h-5 text-[#38bdf8]" />
                </div>

                <h3 className="text-lg font-bold mb-3 tracking-wide text-white font-sans">
                  {service.title}
                </h3>
                
                <p className="text-[#94a3b8] text-xs md:text-sm leading-relaxed font-light font-sans">
                  {service.desc}
                </p>
              </motion.div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
