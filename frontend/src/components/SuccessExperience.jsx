import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion';

export default function SuccessExperience({ submitStatus, handleReset, setActiveView }) {
  const prefersReducedMotion =
    typeof window !== 'undefined' &&
    window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

  const [stage, setStage] = useState(prefersReducedMotion ? 'revealed' : 'processing');
  const containerRef = useRef(null);

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const rotateX = useTransform(mouseY, [-0.5, 0.5], [5, -5]);
  const rotateY = useTransform(mouseX, [-0.5, 0.5], [-5, 5]);

  const handleMouseMove = (e) => {
    if (!containerRef.current || window.innerWidth < 1024 || prefersReducedMotion) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    mouseX.set(x / rect.width - 0.5);
    mouseY.set(y / rect.height - 0.5);
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  useEffect(() => {
    if (prefersReducedMotion) {
      setStage('revealed');
      return;
    }
    const timer1 = setTimeout(() => setStage('pipeline'), 600);
    const timer2 = setTimeout(() => setStage('assembly'), 1800);
    const timer3 = setTimeout(() => setStage('revealed'), 2400);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, [prefersReducedMotion]);

  const containerVariants = {
    hidden: {},
    show: {
      transition: {
        staggerChildren: prefersReducedMotion ? 0 : 0.1,
        delayChildren: prefersReducedMotion ? 0 : 0.15
      }
    }
  };

  const itemVariants = {
    hidden: prefersReducedMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 14 },
    show: {
      opacity: 1,
      y: 0,
      transition: { duration: prefersReducedMotion ? 0.01 : 0.45, ease: [0.16, 1, 0.3, 1] }
    }
  };

  const emailSentText =
    submitStatus === 'success_email'
      ? 'A confirmation email has been securely sent to your address.'
      : 'Your request is secured in our system.';

  return (
    <div
      role="status"
      aria-live="polite"
      className="success-experience"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <div className="success-orbit-bg" aria-hidden="true" />
      <div className="success-grid-flow" aria-hidden="true" />
      <div className="success-glow-core" aria-hidden="true" />
      <div
        aria-hidden="true"
        className="absolute opacity-[0.04] w-[400px] h-[400px] pointer-events-none z-0"
        style={{
          backgroundImage: 'url(/SAKRAVISION.png)',
          backgroundSize: 'contain',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}
      />

      <motion.div
        ref={containerRef}
        style={prefersReducedMotion ? undefined : { rotateX, rotateY }}
        className="success-card-3d"
      >
        <div className="success-card-inner">
          <AnimatePresence mode="wait">
            {(stage === 'processing' || stage === 'pipeline') && (
              <motion.div
                key="pipeline"
                initial={{ opacity: 0, scale: 0.94 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.94 }}
                transition={{ duration: 0.35 }}
                className="flex flex-col items-center justify-center w-full min-h-[280px]"
              >
                <div className="w-12 h-12 rounded-full border-t-2 border-[#38bdf8] animate-spin mb-6" />
                <h2 className="text-white text-sm font-mono tracking-widest uppercase mb-8">
                  {stage === 'processing' ? 'Securing Request...' : 'Initializing Secure Pipeline'}
                </h2>

                {stage === 'pipeline' && (
                  <div className="success-pipeline flex flex-col gap-3 items-start w-full max-w-[260px] mx-auto">
                    {[
                      '01 Request Received',
                      '02 Protocol Initiated',
                      '03 Secure Pipeline Complete'
                    ].map((step, i) => (
                      <motion.div
                        key={step}
                        initial={{ opacity: 0, x: -14 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.35, duration: 0.3 }}
                        className="success-pipeline-step w-full"
                      >
                        <div className="w-1.5 h-1.5 rounded-full bg-[#38bdf8] animate-pulse" />
                        <span>{step}</span>
                        <motion.div
                          initial={{ opacity: 0, scale: 0 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: i * 0.35 + 0.2 }}
                          className="ml-auto"
                        >
                          <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        </motion.div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}

            {(stage === 'assembly' || stage === 'revealed') && (
              <motion.div
                key="revealed"
                initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: prefersReducedMotion ? 0.01 : 0.55, ease: [0.16, 1, 0.3, 1] }}
                className="flex flex-col items-center w-full"
              >
                <div className="success-badge-3d">
                  <motion.div
                    initial={prefersReducedMotion ? false : { rotate: -90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    transition={{ duration: prefersReducedMotion ? 0.01 : 0.6, ease: 'easeOut' }}
                    className="success-ring"
                  />
                  <div aria-hidden="true" className="absolute w-full h-full bg-[#0071e3]/15 rounded-full blur-[10px]" />
                  <svg className="w-8 h-8 text-white relative z-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                    <motion.path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M5 13l4 4L19 7"
                      initial={prefersReducedMotion ? { pathLength: 1 } : { pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{ duration: prefersReducedMotion ? 0.01 : 0.45, delay: 0.2, ease: 'easeOut' }}
                    />
                  </svg>
                </div>

                <motion.div
                  variants={containerVariants}
                  initial="hidden"
                  animate="show"
                  className="flex flex-col items-center w-full z-10"
                >
                  <motion.h2 variants={itemVariants} className="text-2xl font-bold text-white font-sans tracking-tight mb-3">
                    Inquiry Submitted Successfully
                  </motion.h2>
                  <motion.p variants={itemVariants} className="text-slate-300 font-normal text-sm leading-relaxed mb-2">
                    Your request has been securely received by SAKRA VISION.
                  </motion.p>
                  <motion.p variants={itemVariants} className="text-slate-300 font-normal text-sm leading-relaxed mb-2">
                    {emailSentText}
                  </motion.p>
                  <motion.p variants={itemVariants} className="text-slate-300 font-normal text-sm leading-relaxed mb-6">
                    Our team will review your inquiry and connect with you soon.
                  </motion.p>

                  <motion.div variants={itemVariants} className="w-full flex flex-col items-center mt-2 mb-6 pt-5 border-t border-white/10 relative">
                    <div aria-hidden="true" className="absolute top-0 w-12 h-px bg-gradient-to-r from-transparent via-[#38bdf8] to-transparent" />
                    <span className="text-sm font-bold tracking-tight text-white font-sans">SAKRA VISION</span>
                    <span className="text-[11px] font-mono tracking-wider text-[#38bdf8] mt-1 uppercase">
                      Engineering Intelligence Into Reality
                    </span>
                  </motion.div>

                  <motion.div variants={itemVariants} className="success-status-strip mb-6">
                    <div className="success-status-pill">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#38bdf8]" aria-hidden="true" /> Delivered
                    </div>
                    <div className="success-status-pill">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#38bdf8]" aria-hidden="true" /> Secure
                    </div>
                  </motion.div>

                  <motion.div variants={itemVariants} className="flex flex-col w-full gap-3 max-w-xs">
                    <button
                      type="button"
                      onClick={handleReset}
                      className="success-action-button success-action-button-primary"
                    >
                      Back to Overview
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        handleReset();
                        setActiveView('projects');
                      }}
                      className="success-action-button success-action-button-glass"
                    >
                      Explore Projects
                    </button>
                  </motion.div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
