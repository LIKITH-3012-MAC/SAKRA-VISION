import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import SEO from '../components/SEO';

export default function FaqView({ setActiveView }) {
  const faqs = [
    {
      q: 'What do you build?',
      a: 'We build intelligent automation platforms, event registration systems, AI agents, and custom full-stack web applications.'
    },
    {
      q: 'Do you offer cloud software solutions?',
      a: 'Yes, we architect and deploy robust cloud-based software systems tailored to enterprise and startup needs.'
    },
    {
      q: 'How can I collaborate or start a project?',
      a: 'You can submit your project requirements or collaboration ideas through our secure contact form.'
    }
  ];

  return (
    <div className="w-full relative bg-black pt-28 pb-20 min-h-screen">
      <SEO
        title="Sakra Vision FAQ | AI Automation & Web Development Questions"
        description="Find answers to common questions about Sakra Vision services, AI automation, web development, event systems, and contact process."
      />

      <div className="max-w-4xl mx-auto px-5 sm:px-6 relative z-10 text-left">
        <span className="text-xs font-mono tracking-widest text-[#38bdf8] uppercase font-medium">
          Knowledge Base
        </span>
        <h1 className="text-3xl sm:text-4xl md:text-6xl font-black tracking-tight text-white mt-2 font-sans">
          Frequently Asked Questions
        </h1>

        <p className="text-base text-slate-300 mt-5 max-w-2xl font-light font-sans">
          Read the FAQs below. If your question is not answered, visit the Contact page and send us a message.
        </p>

        <div className="mt-6 mb-10">
          <button
            type="button"
            onClick={() => setActiveView('inquire')}
            className="apple-dark-button text-xs sm:text-sm cursor-pointer inline-flex items-center gap-2 min-h-[44px]"
          >
            <span>Go to Contact Form</span>
            <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
          </button>
        </div>

        <div className="space-y-5 mt-10">
          {faqs.map((faq, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              className="apple-glass p-6 rounded-2xl border border-white/10"
            >
              <h2 className="text-lg font-bold text-white mb-2 font-sans">{faq.q}</h2>
              <p className="text-slate-300 text-sm leading-relaxed font-normal">{faq.a}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
