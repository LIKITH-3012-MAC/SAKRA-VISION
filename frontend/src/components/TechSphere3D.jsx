import React, { useEffect, useRef } from 'react';

export default function TechSphere3D() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = (canvas.width = 500);
    let height = (canvas.height = 500);
    let animationFrameId;

    const tags = [
      'Python', 'TensorFlow', 'PyTorch', 'FastAPI', 'React', 'Vite',
      'MySQL', 'Docker', 'Vercel', 'Render', 'Cloudflare', 'LangChain',
      'FAISS', 'Ollama', 'OpenCV', 'YOLO', 'NumPy', 'Groq API', 'Next.js',
      'AI Agents', 'SQLAlchemy', 'Turnstile', 'REST APIs', 'Spring Boot'
    ];

    const radius = 180;
    const focalLength = 300;
    let particles = [];
    const count = tags.length;

    // Distribute tags uniformly on a Fibonacci sphere
    for (let i = 0; i < count; i++) {
      const phi = Math.acos(-1 + (2 * i) / count);
      const theta = Math.sqrt(count * Math.PI) * phi;

      particles.push({
        text: tags[i],
        x: radius * Math.sin(phi) * Math.cos(theta),
        y: radius * Math.sin(phi) * Math.sin(theta),
        z: radius * Math.cos(phi),
        color: i % 3 === 0 ? '#38bdf8' : i % 3 === 1 ? '#0071e3' : '#ffffff'
      });
    }

    // Mouse tracking for rotation speed
    let mouseX = 0;
    let mouseY = 0;
    let targetX = 0;
    let targetY = 0;

    const handleMouseMove = (e) => {
      const rect = canvas.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      targetX = (e.clientX - centerX) * 0.08;
      targetY = (e.clientY - centerY) * 0.08;
    };

    const handleResize = () => {
      if (!canvas) return;
      const rect = canvas.parentNode.getBoundingClientRect();
      const size = Math.min(rect.width, 500);
      width = canvas.width = size;
      height = canvas.height = size;
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('resize', handleResize);
    handleResize(); // Initial sizing

    // Rotate points in 3D
    const rotateX = (p, angle) => {
      const rad = (angle * Math.PI) / 180;
      const cos = Math.cos(rad);
      const sin = Math.sin(rad);
      const y = p.y * cos - p.z * sin;
      const z = p.y * sin + p.z * cos;
      p.y = y;
      p.z = z;
    };

    const rotateY = (p, angle) => {
      const rad = (angle * Math.PI) / 180;
      const cos = Math.cos(rad);
      const sin = Math.sin(rad);
      const x = p.x * cos + p.z * sin;
      const z = -p.x * sin + p.z * cos;
      p.x = x;
      p.z = z;
    };

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Dampen mouse vector interpolation
      mouseX += (targetX - mouseX) * 0.05;
      mouseY += (targetY - mouseY) * 0.05;

      // Base rotation rate + cursor parallax velocity
      const angleX = -(mouseY * 0.005 + 0.05);
      const angleY = mouseX * 0.005 + 0.05;

      // Rotate all tags
      particles.forEach((p) => {
        rotateX(p, angleX * 0.3);
        rotateY(p, angleY * 0.3);
      });

      // Painter's algorithm: Sort particles by Z depth so frontmost draw last
      const sorted = [...particles].sort((a, b) => b.z - a.z);

      const centerX = width / 2;
      const centerY = height / 2;

      sorted.forEach((p) => {
        // Project to 2D screen coordinates
        const scale = focalLength / (focalLength + p.z);
        const screenX = p.x * scale + centerX;
        const screenY = p.y * scale + centerY;

        // Visual opacity and scale adjustments
        const alpha = Math.min(1, Math.max(0.12, scale - 0.45));
        const fontSize = Math.max(10, Math.round(13 * scale));

        // Draw connections to nearby tags in front for structure/grid matrix look
        if (p.z < 60) {
          ctx.beginPath();
          ctx.arc(screenX, screenY, 2, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(56, 189, 248, ${alpha * 0.25})`;
          ctx.fill();
        }

        ctx.font = `bold ${fontSize}px Inter, -apple-system, BlinkMacSystemFont, sans-serif`;
        ctx.fillStyle = p.color;
        ctx.globalAlpha = alpha;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        // Draw subtle typography glow for closer items
        if (p.z < -40) {
          ctx.shadowBlur = 12;
          ctx.shadowColor = '#38bdf8';
        } else {
          ctx.shadowBlur = 0;
        }

        ctx.fillText(p.text, screenX, screenY);
        ctx.globalAlpha = 1;
        ctx.shadowBlur = 0; // Reset shadow
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <div className="flex items-center justify-center w-full max-w-[500px] aspect-square relative select-none z-10">
      {/* Spotlight glow behind sphere */}
      <div className="absolute inset-0 rounded-full bg-[#0071e3]/5 blur-[75px] pointer-events-none" />
      <canvas
        ref={canvasRef}
        className="w-full h-full cursor-grab active:cursor-grabbing max-w-[500px] max-h-[500px]"
      />
    </div>
  );
}
