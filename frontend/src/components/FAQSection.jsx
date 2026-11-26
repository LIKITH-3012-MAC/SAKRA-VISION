import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

const faqData = [
  {
    question: 'What is SAKRA VISION?',
    answer: 'SAKRA VISION is an AI product studio and AI innovation company established in 2026 by Likith Naidu Anumakonda. It builds real-world intelligent systems using AI/ML, computer vision, LLMs, RAG, AI agents, automation, and full-stack web technologies.'
  },
  {
    question: 'When was SAKRA VISION established?',
    answer: 'SAKRA VISION was established in 2026 by Likith Naidu Anumakonda as an AI product studio focused on building practical intelligent systems.'
  },
  {
    question: 'Why is it called SAKRA VISION?',
    answer: 'The name SAKRA VISION has personal meaning for founder Likith Naidu Anumakonda. "SAKRA" is inspired by the names of his mother and father, representing family, vision, strength, purpose, and the idea of building meaningful intelligent systems.'
  },
  {
    question: 'What does SAKRA VISION build?',
    answer: 'SAKRA VISION builds AI applications, computer vision systems, LLM and RAG tools, AI agents, automation platforms, full-stack web products, civic-tech systems, event automation tools, and cloud-deployed intelligent systems.'
  },
  {
    question: 'What are the major projects of SAKRA VISION?',
    answer: 'Major projects include Resolvit AI, SAKRA VISION Event Hub, Bench AI, Prometheus AI V2.0, AquaSentinel AI, AI Resume Builder, and OpenCV Automation Tools.'
  },
  {
    question: 'How can someone contact SAKRA VISION?',
    answer: 'SAKRA VISION can be contacted through its official website inquiry form or by email at likith.anumakonda@gmail.com.'
  }
];

function FAQItem({ item, isOpen, onToggle, onKeyNav, index, buttonRef }) {
  const buttonId = `faq-trigger-${index}`;
  const panelId = `faq-panel-${index}`;

  return (
    <div className="border-b border-white/10 last:border-b-0">
      <button
        ref={buttonRef}
        id={buttonId}
        type="button"
        onClick={onToggle}
        onKeyDown={(e) => onKeyNav(e, index)}
        aria-expanded={isOpen}
        aria-controls={panelId}
        className="w-full flex items-center justify-between py-4 sm:py-5 px-2 min-h-[52px] text-left group transition-colors duration-200 cursor-pointer rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#38bdf8]"
      >
        <span
          className={`text-sm md:text-base font-medium transition-colors duration-200 pr-4 ${
            isOpen ? 'text-[#38bdf8]' : 'text-white/95 group-hover:text-white'
          }`}
        >
          {item.question}
        </span>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.22, ease: 'easeInOut' }}
          className="flex-shrink-0"
        >
          <ChevronDown
            className={`w-4 h-4 transition-colors duration-200 ${
              isOpen ? 'text-[#38bdf8]' : 'text-slate-300 group-hover:text-white'
            }`}
            aria-hidden="true"
          />
        </motion.div>
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            id={panelId}
            role="region"
            aria-labelledby={buttonId}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden"
          >
            <p className="text-slate-200 text-sm font-normal leading-relaxed pb-5 px-2">
              {item.answer}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function FAQSection({ embedded = false }) {
  const [openIndex, setOpenIndex] = useState(0);
  const triggerRefs = useRef([]);

  const handleToggle = (index) => {
    setOpenIndex((prev) => (prev === index ? null : index));
  };

  // WAI-ARIA Accordion keyboard navigation (ArrowDown / ArrowUp / Home / End)
  const handleKeyNav = (e, index) => {
    const total = faqData.length;
    let nextIndex = null;

    if (e.key === 'ArrowDown') nextIndex = (index + 1) % total;
    else if (e.key === 'ArrowUp') nextIndex = (index - 1 + total) % total;
    else if (e.key === 'Home') nextIndex = 0;
    else if (e.key === 'End') nextIndex = total - 1;

    if (nextIndex !== null) {
      e.preventDefault();
      triggerRefs.current[nextIndex]?.focus();
    }
  };

  return (
    <section
      id="faq"
      className={embedded ? 'w-full relative py-4 scroll-mt-24' : 'w-full relative py-20 scroll-mt-24'}
      aria-label="Frequently Asked Questions"
    >
      <div className={embedded ? 'w-full' : 'max-w-3xl mx-auto px-5 sm:px-6'}>
        {/* Section Header */}
        <div className={embedded ? 'text-left mb-8' : 'text-center mb-12'}>
          <span className="text-xs font-mono tracking-widest text-[#38bdf8] uppercase font-medium">
            FAQ
          </span>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight mt-2 text-white font-sans">
            Frequently Asked Questions
          </h2>
          <p className={`text-slate-300 font-light text-sm md:text-base mt-3 ${embedded ? 'max-w-xl' : 'max-w-xl mx-auto'}`}>
            Common questions about SAKRA VISION, our mission, and what we build.
          </p>
        </div>

        {/* FAQ Accordion */}
        <div className="apple-glass rounded-2xl border border-white/10 p-5 sm:p-6 md:p-8">
          {faqData.map((item, index) => (
            <FAQItem
              key={index}
              item={item}
              index={index}
              isOpen={openIndex === index}
              onToggle={() => handleToggle(index)}
              onKeyNav={handleKeyNav}
              buttonRef={(el) => {
                triggerRefs.current[index] = el;
              }}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
