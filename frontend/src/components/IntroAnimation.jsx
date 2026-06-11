import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

export default function IntroAnimation() {
  const canvasRef = useRef(null);

  // Background slow floating particles
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);
    let animationFrameId;

    const particleCount = 24;
    const particles = [];

    // Initialize particles with 3D depth variables
    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        z: Math.random() * 400 + 100, // Z depth
        speedX: (Math.random() - 0.5) * 0.25,
        speedY: -0.15 - Math.random() * 0.2, // Drifting upwards
        radius: Math.random() * 1.5 + 0.5,
        alpha: Math.random() * 0.3 + 0.1
      });
    }

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      particles.forEach((p) => {
        // Update position
        p.y += p.speedY;
        p.x += p.speedX;

        // Wrap around boundaries
        if (p.y < 0) {
          p.y = height;
          p.x = Math.random() * width;
        }
        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;

        // Render with depth scaling (Z determines opacity and radius)
        const scale = 250 / p.z;
        const radius = p.radius * scale;
        const opacity = p.alpha * scale;

        ctx.beginPath();
        ctx.fillStyle = `rgba(56, 189, 248, ${opacity})`;
        ctx.arc(p.x, p.y, radius, 0, Math.PI * 2);
        ctx.fill();
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <motion.div
      className="intro-overlay flex items-center justify-center"
      initial={{ opacity: 1 }}
      exit={{ 
        opacity: 0, 
        scale: 1.05, 
        filter: "blur(15px)",
        transition: { duration: 0.75, ease: "easeInOut" }
      }}
    >
      {/* Grid overlay */}
      <div className="intro-grid" />

      {/* Floating dot particles canvas */}
      <canvas 
        ref={canvasRef} 
        className="absolute inset-0 w-full h-full pointer-events-none z-0" 
      />

      {/* 3D watermarked background logo */}
      <motion.div
        className="intro-watermark"
        initial={{ opacity: 0, scale: 0.88, rotateX: 20 }}
        animate={{ opacity: 0.07, scale: 1, rotateX: 0 }}
        transition={{ duration: 1.35, ease: "easeOut" }}
      />

      <motion.div
        className="relative z-10 flex flex-col items-center gap-6"
        initial={{ opacity: 0, y: 30, scale: 0.93, filter: "blur(18px)" }}
        animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
        transition={{ delay: 0.65, duration: 0.95, ease: "easeOut" }}
      >
        {/* Title message */}
        <h1 className="intro-title intro-shine">
          Welcome to <span>SAKRA VISION</span>
        </h1>
      </motion.div>
    </motion.div>
  );
}
