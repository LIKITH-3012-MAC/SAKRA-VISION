import React, { useEffect, useRef } from 'react';

export default function Background3D() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    // Particle pool setup
    const particleCount = 70;
    const particles = [];
    const focalLength = 350;
    let centerX = width / 2;
    let centerY = height / 2;

    // Mouse tracking variables for parallax tilt
    let mouseX = 0;
    let mouseY = 0;
    let targetX = 0;
    let targetY = 0;

    // Initialize 3D particles
    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: (Math.random() - 0.5) * 800,
        y: (Math.random() - 0.5) * 800,
        z: Math.random() * 800 - 400,
        baseX: (Math.random() - 0.5) * 800,
        baseY: (Math.random() - 0.5) * 800,
        speedZ: -0.4 - Math.random() * 0.4
      });
    }

    const handleMouseMove = (e) => {
      targetX = (e.clientX - centerX) * 0.05;
      targetY = (e.clientY - centerY) * 0.05;
    };

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
      centerX = width / 2;
      centerY = height / 2;
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('resize', handleResize);

    // 3D coordinate rotations
    const rotateX = (x, y, z, angle) => {
      const rad = (angle * Math.PI) / 180;
      const cos = Math.cos(rad);
      const sin = Math.sin(rad);
      return {
        x,
        y: y * cos - z * sin,
        z: y * sin + z * cos
      };
    };

    const rotateY = (x, y, z, angle) => {
      const rad = (angle * Math.PI) / 180;
      const cos = Math.cos(rad);
      const sin = Math.sin(rad);
      return {
        x: x * cos + z * sin,
        y,
        z: -x * sin + z * cos
      };
    };

    let rotY = 0;

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Dampened mouse parallax interpolation
      mouseX += (targetX - mouseX) * 0.05;
      mouseY += (targetY - mouseY) * 0.05;

      // Constant natural orbital float
      rotY += 0.06;

      const projected = [];

      for (let i = 0; i < particleCount; i++) {
        const p = particles[i];

        // Move particle forward in Z space
        p.z += p.speedZ;
        if (p.z < -focalLength) {
          p.z = 400; // Reset depth boundary
        }

        // Apply constant slow rotation + mouse tilt parallax
        let r1 = rotateY(p.x, p.y, p.z, rotY * 0.4 + mouseX * 0.1);
        let r2 = rotateX(r1.x, r1.y, r1.z, mouseY * 0.1);

        // Perspective Projection
        const scale = focalLength / (focalLength + r2.z);
        const screenX = r2.x * scale + centerX;
        const screenY = r2.y * scale + centerY;

        projected.push({
          x: screenX,
          y: screenY,
          scale,
          z: r2.z
        });
      }

      // Draw mesh link lines based on distance
      for (let i = 0; i < particleCount; i++) {
        const p1 = projected[i];
        if (p1.x < 0 || p1.x > width || p1.y < 0 || p1.y > height) continue;

        for (let j = i + 1; j < particleCount; j++) {
          const p2 = projected[j];
          
          const dx = p1.x - p2.x;
          const dy = p1.y - p2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          // Render link if close enough in screen space
          if (dist < 110) {
            const alpha = (1 - dist / 110) * 0.09 * Math.min(p1.scale, p2.scale);
            ctx.beginPath();
            ctx.strokeStyle = `rgba(0, 113, 227, ${alpha})`;
            ctx.lineWidth = 0.5 * Math.min(p1.scale, p2.scale);
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
          }
        }
      }

      // Draw nodes
      for (let i = 0; i < particleCount; i++) {
        const p = projected[i];
        if (p.x < 0 || p.x > width || p.y < 0 || p.y > height) continue;

        // Radius and alpha proportional to distance/depth scaling
        const radius = Math.max(0.2, p.scale * 1.4);
        const alpha = Math.min(0.22, p.scale * 0.18);

        ctx.beginPath();
        // Alternating colors between ice blue and soft gray for depth contrast
        ctx.fillStyle = i % 3 === 0 ? `rgba(56, 189, 248, ${alpha})` : `rgba(255, 255, 255, ${alpha * 0.85})`;
        ctx.arc(p.x, p.y, radius, 0, Math.PI * 2);
        ctx.fill();
      }

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
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full pointer-events-none z-0 bg-transparent"
    />
  );
}
