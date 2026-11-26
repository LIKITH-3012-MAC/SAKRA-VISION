import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

export default function IntroAnimation({ onSkip }) {
  const canvasRef = useRef(null);
  const skipBtnRef = useRef(null);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' || e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        onSkip?.();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onSkip]);

  // Background slow floating particles (desktop only for mobile first-load performance)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    if (window.innerWidth < 768) return;
    const prefersReducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let dpr = Math.min(window.devicePixelRatio || 1, 2);
    let width = window.innerWidth;
    let height = window.innerHeight;
    let animationFrameId = null;

    const sizeCanvas = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    sizeCanvas();

    const particleCount = 20;
    const particles = [];

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        z: Math.random() * 400 + 100,
        speedX: (Math.random() - 0.5) * 0.25,
        speedY: -0.15 - Math.random() * 0.2,
        radius: Math.random() * 1.5 + 0.5,
        alpha: Math.random() * 0.3 + 0.1
      });
    }

    window.addEventListener('resize', sizeCanvas);

    const drawFrame = () => {
      ctx.clearRect(0, 0, width, height);

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.y += p.speedY;
        p.x += p.speedX;
        if (p.y < 0) {
          p.y = height;
          p.x = Math.random() * width;
        }
        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;

        const scale = 250 / p.z;
        const radius = p.radius * scale;
        const opacity = p.alpha * scale;

        ctx.beginPath();
        ctx.fillStyle = `rgba(56, 189, 248, ${opacity})`;
        ctx.arc(p.x, p.y, radius, 0, Math.PI * 2);
        ctx.fill();
      }

      animationFrameId = requestAnimationFrame(drawFrame);
    };

    animationFrameId = requestAnimationFrame(drawFrame);

    return () => {
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', sizeCanvas);
    };
  }, []);

  return (
    <motion.div
      role="dialog"
      aria-modal="true"
      aria-label="SAKRA VISION intro animation"
      className="intro-overlay flex items-center justify-center px-6"
      initial={{ opacity: 1 }}
      exit={{
        opacity: 0,
        scale: 1.02,
        transition: { duration: 0.35, ease: 'easeInOut' }
      }}
    >
      {/* Grid overlay */}
      <div className="intro-grid" aria-hidden="true" />

      {/* Floating dot particles canvas (desktop) */}
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        className="hidden md:block absolute inset-0 w-full h-full pointer-events-none z-0"
      />

      {/* Watermarked background logo */}
      <motion.div
        aria-hidden="true"
        className="intro-watermark"
        initial={{ opacity: 0, scale: 0.92 }}
        animate={{ opacity: 0.07, scale: 1 }}
        transition={{ duration: 0.65, ease: 'easeOut' }}
      />

      <motion.div
        className="relative z-10 flex flex-col items-center gap-4"
        initial={{ opacity: 0, y: 14, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ delay: 0.1, duration: 0.5, ease: 'easeOut' }}
      >
        <p className="intro-title">
          Welcome to <span className="intro-title-accent">SAKRA VISION</span>
        </p>
        <motion.div
          aria-hidden="true"
          className="intro-beam"
          initial={{ scaleX: 0, opacity: 0 }}
          animate={{ scaleX: 1, opacity: 1 }}
          transition={{ delay: 0.25, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        />
      </motion.div>

      {onSkip && (
        <button
          ref={skipBtnRef}
          type="button"
          onClick={onSkip}
          className="absolute bottom-8 right-6 sm:right-8 z-20 px-5 py-2.5 min-h-[44px] rounded-full bg-white/10 hover:bg-white/20 border border-white/20 text-xs font-mono text-white tracking-wider uppercase transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#38bdf8]"
        >
          Skip Intro →
        </button>
      )}
    </motion.div>
  );
}
