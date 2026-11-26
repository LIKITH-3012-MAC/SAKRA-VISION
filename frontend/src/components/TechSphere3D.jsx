import React, { useEffect, useRef } from 'react';

const TECH_TAGS = [
  'Python', 'TensorFlow', 'PyTorch', 'FastAPI', 'React', 'Vite',
  'MySQL', 'Docker', 'Vercel', 'Render', 'Cloudflare', 'LangChain',
  'FAISS', 'Ollama', 'OpenCV', 'YOLO', 'NumPy', 'Groq API', 'Next.js',
  'AI Agents', 'SQLAlchemy', 'Turnstile', 'REST APIs', 'Spring Boot'
];

export default function TechSphere3D() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const motionQuery = window.matchMedia?.('(prefers-reduced-motion: reduce)');
    let prefersReducedMotion = Boolean(motionQuery?.matches);
    let dpr = Math.min(window.devicePixelRatio || 1, 2);
    let size = 400;
    let animationFrameId = null;
    let isVisible = true;
    let isTabVisible = !document.hidden;

    const particles = [];
    const count = TECH_TAGS.length;

    // Distribute unit vectors uniformly on a Fibonacci sphere
    for (let i = 0; i < count; i++) {
      const phi = Math.acos(-1 + (2 * (i + 0.5)) / count);
      const theta = Math.PI * (1 + Math.sqrt(5)) * i;

      particles.push({
        text: TECH_TAGS[i],
        ux: Math.sin(phi) * Math.cos(theta),
        uy: Math.sin(phi) * Math.sin(theta),
        uz: Math.cos(phi),
        color: i % 3 === 0 ? '#38bdf8' : i % 3 === 1 ? '#60a5fa' : '#f8fafc'
      });
    }

    let mouseX = 0;
    let mouseY = 0;
    let targetX = 0;
    let targetY = 0;
    let isDragging = false;
    let lastPointerX = 0;
    let lastPointerY = 0;

    const handlePointerDown = (e) => {
      isDragging = true;
      lastPointerX = e.clientX;
      lastPointerY = e.clientY;
    };

    const handlePointerUp = () => {
      isDragging = false;
    };

    const handleCanvasPointerMove = (e) => {
      if (isDragging || e.pointerType === 'touch') return;
      const rect = canvas.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      targetX = Math.max(-16, Math.min(16, (e.clientX - centerX) * 0.045));
      targetY = Math.max(-16, Math.min(16, (e.clientY - centerY) * 0.045));
    };

    const handleWindowPointerMove = (e) => {
      if (!isDragging) return;
      const dx = e.clientX - lastPointerX;
      const dy = e.clientY - lastPointerY;
      targetX = dx * 0.65;
      targetY = dy * 0.65;
      lastPointerX = e.clientX;
      lastPointerY = e.clientY;
    };

    const handleResize = () => {
      if (!canvas || !canvas.parentNode) return;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      const rect = canvas.parentNode.getBoundingClientRect();
      size = Math.max(260, Math.min(rect.width || 400, 420));
      canvas.width = Math.floor(size * dpr);
      canvas.height = Math.floor(size * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    handleResize();

    const rotateX = (p, angle) => {
      const rad = (angle * Math.PI) / 180;
      const cos = Math.cos(rad);
      const sin = Math.sin(rad);
      const y = p.uy * cos - p.uz * sin;
      const z = p.uy * sin + p.uz * cos;
      p.uy = y;
      p.uz = z;
    };

    const rotateY = (p, angle) => {
      const rad = (angle * Math.PI) / 180;
      const cos = Math.cos(rad);
      const sin = Math.sin(rad);
      const x = p.ux * cos + p.uz * sin;
      const z = -p.ux * sin + p.uz * cos;
      p.ux = x;
      p.uz = z;
    };

    const drawFrame = () => {
      ctx.clearRect(0, 0, size, size);

      if (!prefersReducedMotion) {
        mouseX += (targetX - mouseX) * 0.06;
        mouseY += (targetY - mouseY) * 0.06;
        if (!isDragging) {
          targetX *= 0.95;
          targetY *= 0.95;
        }
        const angleX = -(mouseY * 0.03 + 0.12);
        const angleY = mouseX * 0.03 + 0.16;

        for (let i = 0; i < count; i++) {
          rotateX(particles[i], angleX * 0.35);
          rotateY(particles[i], angleY * 0.35);
        }
      }

      // Generous sphere radius and focal length prevent tight center clustering
      const radius = size * 0.34;
      const focalLength = size * 1.15;
      const centerX = size / 2;
      const centerY = size / 2;

      const projected = particles.map((p) => {
        const px = p.ux * radius;
        const py = p.uy * radius;
        const pz = p.uz * radius;
        const scale = focalLength / (focalLength + pz);
        return {
          text: p.text,
          color: p.color,
          uz: p.uz,
          pz,
          scale,
          screenX: px * scale + centerX,
          screenY: py * scale + centerY
        };
      });

      // Subtle wireframe connectors to emphasize 3D spherical geometry
      ctx.lineWidth = 0.7;
      for (let i = 0; i < projected.length; i++) {
        const a = projected[i];
        for (let j = i + 1; j < projected.length; j++) {
          const b = projected[j];
          const dx = a.screenX - b.screenX;
          const dy = a.screenY - b.screenY;
          if (dx * dx + dy * dy < (size * 0.24) * (size * 0.24)) {
            ctx.beginPath();
            ctx.strokeStyle = 'rgba(56, 189, 248, 0.07)';
            ctx.moveTo(a.screenX, a.screenY);
            ctx.lineTo(b.screenX, b.screenY);
            ctx.stroke();
          }
        }
      }

      // Back-to-front painter's order
      projected.sort((a, b) => b.uz - a.uz);

      const minFont = size < 320 ? 10.5 : 11;
      for (let i = 0; i < projected.length; i++) {
        projected[i].fontSize = Math.max(minFont, Math.round((size / 400) * 13 * projected[i].scale));
        projected[i].halfW = Math.max(24, projected[i].text.length * projected[i].fontSize * 0.32);
        projected[i].halfH = projected[i].fontSize * 0.72;
      }

      // Lightweight screen-space label repulsion prevents overlapping text at any angle
      const pad = 12;
      for (let pass = 0; pass < 3; pass++) {
        for (let i = 0; i < projected.length; i++) {
          for (let j = i + 1; j < projected.length; j++) {
            const a = projected[i];
            const b = projected[j];
            const dx = b.screenX - a.screenX;
            const dy = b.screenY - a.screenY;
            const reqX = a.halfW + b.halfW + 6;
            const reqY = a.halfH + b.halfH + 4;
            if (Math.abs(dx) < reqX && Math.abs(dy) < reqY) {
              const overlapY = reqY - Math.abs(dy);
              const shiftY = (dy >= 0 ? 1 : -1) * overlapY * 0.5;
              a.screenY = Math.max(pad + a.halfH, Math.min(size - pad - a.halfH, a.screenY - shiftY));
              b.screenY = Math.max(pad + b.halfH, Math.min(size - pad - b.halfH, b.screenY + shiftY));
            }
          }
        }
      }

      for (let i = 0; i < projected.length; i++) {
        const p = projected[i];
        const alpha = Math.min(1, Math.max(0.45, (p.scale - 0.68) * 1.65));
        const fontSize = p.fontSize;

        ctx.font = `600 ${fontSize}px Inter, -apple-system, BlinkMacSystemFont, sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        // Crisp dark halo prevents overlapping front/back labels from clashing
        ctx.globalAlpha = Math.min(0.92, alpha + 0.15);
        ctx.strokeStyle = 'rgba(2, 6, 23, 0.94)';
        ctx.lineWidth = 4;
        ctx.lineJoin = 'round';
        ctx.strokeText(p.text, p.screenX, p.screenY);

        ctx.globalAlpha = alpha;
        ctx.fillStyle = p.color;
        ctx.fillText(p.text, p.screenX, p.screenY);
      }
      ctx.globalAlpha = 1;

      if (!prefersReducedMotion && isVisible && isTabVisible) {
        animationFrameId = requestAnimationFrame(drawFrame);
      } else {
        animationFrameId = null;
      }
    };

    const startLoop = () => {
      if (!animationFrameId && !prefersReducedMotion && isVisible && isTabVisible) {
        animationFrameId = requestAnimationFrame(drawFrame);
      }
    };

    const stopLoop = () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
        animationFrameId = null;
      }
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        isVisible = entry.isIntersecting;
        if (isVisible) startLoop();
        else stopLoop();
      },
      { threshold: 0.05 }
    );
    observer.observe(canvas);

    const handleVisibility = () => {
      isTabVisible = !document.hidden;
      if (isTabVisible) startLoop();
      else stopLoop();
    };

    const handleMotionChange = (e) => {
      prefersReducedMotion = e.matches;
      if (prefersReducedMotion) {
        stopLoop();
        drawFrame();
      } else {
        startLoop();
      }
    };

    canvas.addEventListener('pointerdown', handlePointerDown);
    canvas.addEventListener('pointermove', handleCanvasPointerMove, { passive: true });
    window.addEventListener('pointerup', handlePointerUp);
    window.addEventListener('pointermove', handleWindowPointerMove, { passive: true });
    window.addEventListener('resize', handleResize);
    document.addEventListener('visibilitychange', handleVisibility);
    motionQuery?.addEventListener?.('change', handleMotionChange);

    drawFrame();

    return () => {
      stopLoop();
      observer.disconnect();
      canvas.removeEventListener('pointerdown', handlePointerDown);
      canvas.removeEventListener('pointermove', handleCanvasPointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
      window.removeEventListener('pointermove', handleWindowPointerMove);
      window.removeEventListener('resize', handleResize);
      document.removeEventListener('visibilitychange', handleVisibility);
      motionQuery?.removeEventListener?.('change', handleMotionChange);
    };
  }, []);

  return (
    <div className="flex items-center justify-center w-full max-w-[340px] sm:max-w-[400px] aspect-square relative select-none z-10 mx-auto">
      <div
        aria-hidden="true"
        className="absolute inset-6 rounded-full bg-[#0071e3]/10 blur-[65px] pointer-events-none"
      />
      <canvas
        ref={canvasRef}
        aria-label="Interactive 3D technology cloud showing SAKRA VISION stack"
        role="img"
        className="w-full h-full cursor-grab active:cursor-grabbing touch-none"
      />
      <ul className="sr-only" aria-label="Technologies in 3D cloud">
        {TECH_TAGS.map((tag) => (
          <li key={tag}>{tag}</li>
        ))}
      </ul>
    </div>
  );
}
