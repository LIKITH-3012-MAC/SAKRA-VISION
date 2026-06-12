import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import SEO from '../components/SEO';

export default function FaqView({ setActiveView }) {
  const faqs = [
    {
      q: "Who founded SAKRA VISION?",
      a: "Likith Naidu Anumakonda founded the AI product studio in 2026."
    },
    {
      q: "What do you build?",
      a: "We build intelligent automation platforms, event registration systems, AI agents, and custom full-stack web applications."
    },
    {
      q: "Do you offer cloud software solutions?",
      a: "Yes, we architect and deploy robust cloud-based software systems tailored to enterprise and startup needs."
    },
    {
      q: "How can I collaborate or start a project?",
      a: "You can submit your project requirements or collaboration ideas through our secure contact form."
    }
  ];

  return (
    <div className="w-full relative bg-black pt-28 pb-20 min-h-screen">
      <SEO 
        title="Sakra Vision FAQ | AI Automation & Web Development Questions"
        description="Find answers to common questions about Sakra Vision services, AI automation, web development, event systems, and contact process."
      />
      
      <div className="max-w-4xl mx-auto px-6 relative z-10 text-left">
        <span className="text-[10px] font-mono tracking-widest text-[#0071e3] uppercase">Knowledge Base</span>
        <h1 className="text-4xl md:text-6xl font-black tracking-tight text-white mt-2 font-sans">
          Frequently Asked Questions
        </h1>
        
        <p className="text-base text-[#94a3b8] mt-6 max-w-2xl font-light font-sans">
          Read the FAQs below. If your question is not answered, visit the Contact page and send us a message.
        </p>
        
        <div className="mt-6 mb-12">
          <button 
            onClick={() => setActiveView('inquire')}
            className="apple-dark-button text-xs cursor-pointer flex items-center gap-2"
          >
            Go to Contact Form <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        <div className="space-y-6 mt-12">
          {faqs.map((faq, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="apple-glass p-6 rounded-2xl"
            >
              <h3 className="text-lg font-bold text-white mb-2">{faq.q}</h3>
              <p className="text-[#94a3b8] text-sm leading-relaxed">{faq.a}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
