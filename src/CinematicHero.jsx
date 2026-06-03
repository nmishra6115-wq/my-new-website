import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';

const CinematicHero = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let nodes = [];
    
    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = 600;
    };

    const initNodes = () => {
      nodes = Array.from({ length: 45 }, () => ({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        radius: Math.random() * 1.5 + 0.5
      }));
    };

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      nodes.forEach((node, i) => {
        node.x += node.vx;
        node.y += node.vy;

        // Boundary bounce logic
        if (node.x < 0 || node.x > canvas.width) node.vx *= -1;
        if (node.y < 0 || node.y > canvas.height) node.vy *= -1;

        // Render individual technical data point
        ctx.fillStyle = 'rgba(16, 185, 129, 0.8)';
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
        ctx.fill();

        // Map live connecting networks
        for (let j = i + 1; j < nodes.length; j++) {
          const target = nodes[j];
          const dist = Math.hypot(node.x - target.x, node.y - target.y);
          if (dist < 180) {
            ctx.strokeStyle = `rgba(16, 185, 129, ${0.12 * (1 - dist / 180)})`;
            ctx.lineWidth = 0.6;
            ctx.beginPath();
            ctx.moveTo(node.x, node.y);
            ctx.lineTo(target.x, target.y);
            ctx.stroke();
          }
        }
      });
      requestAnimationFrame(draw);
    };

    window.addEventListener('resize', resize);
    resize();
    initNodes();
    draw();

    // GSAP high-frequency perimeter scan tracking
    gsap.to(".scanner-beam", {
      top: "100%",
      duration: 7,
      ease: "none",
      repeat: -1
    });

    return () => window.removeEventListener('resize', resize);
  }, []);

  return (
    <div className="hero-visual-container">
      <canvas ref={canvasRef} id="neuralCanvas" />
      <div className="scanner-beam" />
      <div className="hero-vignette" />
      
      {/* Structural Corner Alignment Brackets */}
      <div className="absolute top-10 left-10 w-8 h-8 border-t-2 border-l-2 border-emerald-500/30"></div>
      <div className="absolute top-10 right-10 w-8 h-8 border-t-2 border-r-2 border-emerald-500/30"></div>
      <div className="absolute bottom-10 left-10 w-8 h-8 border-b-2 border-l-2 border-emerald-500/30"></div>
      <div className="absolute bottom-10 right-10 w-8 h-8 border-b-2 border-r-2 border-emerald-500/30"></div>
    </div>
  );
};

export default CinematicHero;