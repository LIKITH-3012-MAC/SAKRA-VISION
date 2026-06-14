import React, { useState } from 'react';
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

function FAQItem({ item, isOpen, onToggle, index }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.4, delay: index * 0.06 }}
      className="border-b border-white/[0.06] last:border-b-0"
    >
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between py-5 px-1 text-left group transition-colors duration-200"
        aria-expanded={isOpen}
      >
        <span className={`text-sm md:text-base font-medium transition-colors duration-200 pr-4 ${isOpen ? 'text-[#38bdf8]' : 'text-white/90 group-hover:text-white'}`}>
          {item.question}
        </span>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.25, ease: 'easeInOut' }}
          className="flex-shrink-0"
        >
          <ChevronDown className={`w-4 h-4 transition-colors duration-200 ${isOpen ? 'text-[#38bdf8]' : 'text-white/40 group-hover:text-white/60'}`} />
        </motion.div>
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden"
          >
            <p className="text-[#94a3b8] text-xs md:text-sm font-light leading-relaxed pb-5 px-1">
              {item.answer}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function FAQSection() {
  const [openIndex, setOpenIndex] = useState(null);

  const handleToggle = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section id="faq" className="w-full relative py-20" aria-label="Frequently Asked Questions">
      <div className="max-w-3xl mx-auto px-6">

        {/* Section Header */}
        <div className="text-center mb-14">
          <span className="text-xs font-mono tracking-widest text-[#0071e3] uppercase">
            FAQ
          </span>
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight mt-2 text-white font-sans">
            Frequently Asked Questions
          </h2>
          <p className="text-[#94a3b8] font-light text-sm md:text-base mt-4 max-w-xl mx-auto">
            Common questions about SAKRA VISION, our mission, and what we build.
          </p>
        </div>

        {/* FAQ Accordion */}
        <div className="apple-glass rounded-2xl border border-white/[0.06] p-6 md:p-8">
          {faqData.map((item, index) => (
            <FAQItem
              key={index}
              item={item}
              index={index}
              isOpen={openIndex === index}
              onToggle={() => handleToggle(index)}
            />
          ))}
        </div>

      </div>
    </section>
  );
}
