import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion';

export default function SuccessExperience({ submitStatus, handleReset, setActiveView }) {
  const [stage, setStage] = useState('processing'); // processing, pipeline, assembly, revealed
  const containerRef = useRef(null);

  // 3D Tilt Logic
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const rotateX = useTransform(mouseY, [-0.5, 0.5], [5, -5]);
  const rotateY = useTransform(mouseX, [-0.5, 0.5], [-5, 5]);

  const handleMouseMove = (e) => {
    if (!containerRef.current || window.innerWidth < 1024) return;
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
    // Stage Orchestration
    const timer1 = setTimeout(() => setStage('pipeline'), 800);
    const timer2 = setTimeout(() => setStage('assembly'), 2400);
    const timer3 = setTimeout(() => setStage('revealed'), 3200);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, []);

  const containerVariants = {
    hidden: {},
    show: {
      transition: {
        staggerChildren: 0.12,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 18, filter: "blur(8px)" },
    show: { 
      opacity: 1, 
      y: 0, 
      filter: "blur(0px)",
      transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] }
    }
  };

  const emailSentText = submitStatus === 'success_email' 
    ? "A confirmation email has been securely sent to your address."
    : "Your request is secured in our system.";

  return (
    <div className="success-experience" onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave}>
      
      {/* Cinematic Backgrounds */}
      <div className="success-orbit-bg" />
      <div className="success-grid-flow" />
      <div className="success-glow-core" />
      <div className="absolute opacity-[0.04] w-[400px] h-[400px] pointer-events-none z-0" style={{ backgroundImage: 'url(/SAKRAVISION.png)', backgroundSize: 'contain', backgroundPosition: 'center', backgroundRepeat: 'no-repeat' }} />

      <motion.div
        ref={containerRef}
        style={{ rotateX, rotateY }}
        className="success-card-3d"
      >
        <div className="success-card-inner">
          
          <AnimatePresence mode="wait">
            
            {/* Stage 1: Pipeline Animation */}
            {(stage === 'processing' || stage === 'pipeline') && (
              <motion.div
                key="pipeline"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9, filter: "blur(10px)" }}
                transition={{ duration: 0.5 }}
                className="flex flex-col items-center justify-center w-full min-h-[300px]"
              >
                <div className="w-12 h-12 rounded-full border-t-2 border-[#0071e3] animate-spin mb-6" />
                <h3 className="text-white text-sm font-mono tracking-widest uppercase mb-8">
                  {stage === 'processing' ? 'Securing Request...' : 'Initializing Secure Pipeline'}
                </h3>

                {stage === 'pipeline' && (
                  <div className="success-pipeline flex flex-col gap-3 items-start w-full max-w-[250px] mx-auto">
                    {[
                      "01 Request Received",
                      "02 Protocol Initiated",
                      "03 Secure Pipeline Complete"
                    ].map((step, i) => (
                      <motion.div
                        key={step}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.5, duration: 0.4 }}
                        className="success-pipeline-step w-full"
                      >
                        <div className="w-1.5 h-1.5 rounded-full bg-[#38bdf8] animate-pulse" />
                        {step}
                        <motion.div
                          initial={{ opacity: 0, scale: 0 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: i * 0.5 + 0.3 }}
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

            {/* Stage 2: Final Success State */}
            {(stage === 'assembly' || stage === 'revealed') && (
              <motion.div
                key="revealed"
                initial={{ opacity: 0, scale: 0.92, y: 60, rotateX: 12, filter: "blur(18px)" }}
                animate={{ opacity: 1, scale: 1, y: 0, rotateX: 0, filter: "blur(0px)" }}
                transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
                className="flex flex-col items-center w-full"
              >
                {/* 3D Assembly Badge */}
                <div className="success-badge-3d">
                  <motion.div
                    initial={{ rotate: -90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="success-ring"
                  />
                  <div className="absolute w-full h-full bg-[#0071e3]/10 rounded-full blur-[10px]" />
                  <motion.svg 
                    className="w-8 h-8 text-white relative z-10" 
                    fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"
                  >
                    <motion.path 
                      strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{ duration: 0.6, delay: 0.4, ease: "easeOut" }}
                    />
                  </motion.svg>
                  <motion.div 
                    initial={{ left: "-100%" }}
                    animate={{ left: "200%" }}
                    transition={{ duration: 1.5, delay: 0.8 }}
                    className="success-light-sweep"
                  />
                </div>

                {/* Staggered Text Reveal */}
                <motion.div 
                  variants={containerVariants}
                  initial="hidden"
                  animate="show"
                  className="flex flex-col items-center w-full z-10 transform translate-z-[30px]"
                >
                  <motion.h2 variants={itemVariants} className="text-2xl font-bold text-white font-sans tracking-tight mb-3">
                    Inquiry Submitted Successfully
                  </motion.h2>
                  <motion.p variants={itemVariants} className="text-[#94a3b8] font-light text-sm leading-relaxed mb-2">
                    Your request has been securely received by SAKRA VISION.
                  </motion.p>
                  <motion.p variants={itemVariants} className="text-[#94a3b8] font-light text-sm leading-relaxed mb-2">
                    {emailSentText}
                  </motion.p>
                  <motion.p variants={itemVariants} className="text-[#94a3b8] font-light text-sm leading-relaxed mb-6">
                    Our team will review your inquiry and connect with you soon.
                  </motion.p>

                  {/* Brand Signature */}
                  <motion.div variants={itemVariants} className="w-full flex flex-col items-center mt-4 mb-8 pt-6 border-t border-white/5 relative">
                    <div className="absolute top-0 w-12 h-px bg-gradient-to-r from-transparent via-[#0071e3] to-transparent" />
                    <span className="text-sm font-bold tracking-tight text-white font-sans">SAKRA VISION</span>
                    <span className="text-[9px] font-mono tracking-widest text-[#0071e3] mt-1 uppercase">Engineering Intelligence Into Reality</span>
                  </motion.div>

                  {/* Status Strip */}
                  <motion.div variants={itemVariants} className="success-status-strip mb-8">
                    <div className="success-status-pill">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#38bdf8] animate-pulse" /> Delivered
                    </div>
                    <div className="success-status-pill">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#38bdf8] animate-pulse" /> Secure
                    </div>
                  </motion.div>

                  {/* CTA Buttons */}
                  <motion.div variants={itemVariants} className="flex flex-col w-full gap-3 max-w-xs">
                    <button onClick={handleReset} className="success-action-button success-action-button-primary">
                      Back to Overview
                    </button>
                    <button onClick={() => { handleReset(); setActiveView('projects'); }} className="success-action-button success-action-button-glass">
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
