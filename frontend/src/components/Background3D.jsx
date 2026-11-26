import React, { useEffect, useRef } from 'react';

export default function Background3D() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const motionQuery = window.matchMedia?.('(prefers-reduced-motion: reduce)');
    let prefersReducedMotion = Boolean(motionQuery?.matches);
    let animationFrameId = null;
    let dpr = Math.min(window.devicePixelRatio || 1, 2);
    let width = window.innerWidth;
    let height = window.innerHeight;
    let centerX = width / 2;
    let centerY = height / 2;
    let isTabVisible = !document.hidden;

    const sizeCanvas = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = window.innerWidth;
      height = window.innerHeight;
      centerX = width / 2;
      centerY = height / 2;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    sizeCanvas();

    const particleCount = width < 640 ? 28 : width < 1024 ? 44 : 60;
    const particles = [];
    const focalLength = 350;
    const maxLinkDist = 110;
    const maxLinkDistSq = maxLinkDist * maxLinkDist;

    let mouseX = 0;
    let mouseY = 0;
    let targetX = 0;
    let targetY = 0;

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: (Math.random() - 0.5) * 800,
        y: (Math.random() - 0.5) * 800,
        z: Math.random() * 800 - 400,
        speedZ: -0.35 - Math.random() * 0.35
      });
    }

    const handleMouseMove = (e) => {
      if (prefersReducedMotion || e.pointerType === 'touch') return;
      targetX = (e.clientX - centerX) * 0.04;
      targetY = (e.clientY - centerY) * 0.04;
    };

    const rotateX = (x, y, z, angle) => {
      const rad = (angle * Math.PI) / 180;
      const cos = Math.cos(rad);
      const sin = Math.sin(rad);
      return { x, y: y * cos - z * sin, z: y * sin + z * cos };
    };

    const rotateY = (x, y, z, angle) => {
      const rad = (angle * Math.PI) / 180;
      const cos = Math.cos(rad);
      const sin = Math.sin(rad);
      return { x: x * cos + z * sin, y, z: -x * sin + z * cos };
    };

    let rotY = 0;

    const drawFrame = () => {
      ctx.clearRect(0, 0, width, height);

      if (!prefersReducedMotion) {
        mouseX += (targetX - mouseX) * 0.05;
        mouseY += (targetY - mouseY) * 0.05;
        rotY += 0.05;
      }

      const projected = new Array(particleCount);

      for (let i = 0; i < particleCount; i++) {
        const p = particles[i];

        if (!prefersReducedMotion) {
          p.z += p.speedZ;
          if (p.z < -focalLength) {
            p.z = 400;
          }
        }

        const r1 = rotateY(p.x, p.y, p.z, rotY * 0.4 + mouseX * 0.1);
        const r2 = rotateX(r1.x, r1.y, r1.z, mouseY * 0.1);

        const scale = focalLength / (focalLength + r2.z);
        projected[i] = {
          x: r2.x * scale + centerX,
          y: r2.y * scale + centerY,
          scale
        };
      }

      for (let i = 0; i < particleCount; i++) {
        const p1 = projected[i];
        if (p1.x < 0 || p1.x > width || p1.y < 0 || p1.y > height) continue;

        for (let j = i + 1; j < particleCount; j++) {
          const p2 = projected[j];
          const dx = p1.x - p2.x;
          const dy = p1.y - p2.y;
          const distSq = dx * dx + dy * dy;

          if (distSq < maxLinkDistSq) {
            const dist = Math.sqrt(distSq);
            const alpha = (1 - dist / maxLinkDist) * 0.09 * Math.min(p1.scale, p2.scale);
            ctx.beginPath();
            ctx.strokeStyle = `rgba(0, 113, 227, ${alpha})`;
            ctx.lineWidth = 0.5 * Math.min(p1.scale, p2.scale);
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
          }
        }
      }

      for (let i = 0; i < particleCount; i++) {
        const p = projected[i];
        if (p.x < 0 || p.x > width || p.y < 0 || p.y > height) continue;

        const radius = Math.max(0.2, p.scale * 1.4);
        const alpha = Math.min(0.22, p.scale * 0.18);

        ctx.beginPath();
        ctx.fillStyle = i % 3 === 0 ? `rgba(56, 189, 248, ${alpha})` : `rgba(255, 255, 255, ${alpha * 0.85})`;
        ctx.arc(p.x, p.y, radius, 0, Math.PI * 2);
        ctx.fill();
      }

      if (!prefersReducedMotion && isTabVisible) {
        animationFrameId = requestAnimationFrame(drawFrame);
      } else {
        animationFrameId = null;
      }
    };

    const handleVisibility = () => {
      isTabVisible = !document.hidden;
      if (isTabVisible && !prefersReducedMotion && !animationFrameId) {
        animationFrameId = requestAnimationFrame(drawFrame);
      } else if (!isTabVisible && animationFrameId) {
        cancelAnimationFrame(animationFrameId);
        animationFrameId = null;
      }
    };

    const handleMotionChange = (e) => {
      prefersReducedMotion = e.matches;
      if (prefersReducedMotion && animationFrameId) {
        cancelAnimationFrame(animationFrameId);
        animationFrameId = null;
        drawFrame();
      } else if (!prefersReducedMotion && isTabVisible && !animationFrameId) {
        animationFrameId = requestAnimationFrame(drawFrame);
      }
    };

    window.addEventListener('pointermove', handleMouseMove, { passive: true });
    window.addEventListener('resize', sizeCanvas);
    document.addEventListener('visibilitychange', handleVisibility);
    motionQuery?.addEventListener?.('change', handleMotionChange);

    drawFrame();

    return () => {
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
      window.removeEventListener('pointermove', handleMouseMove);
      window.removeEventListener('resize', sizeCanvas);
      document.removeEventListener('visibilitychange', handleVisibility);
      motionQuery?.removeEventListener?.('change', handleMotionChange);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="fixed inset-0 w-full h-full pointer-events-none z-0 bg-transparent"
    />
  );
}
