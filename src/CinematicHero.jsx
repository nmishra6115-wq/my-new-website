import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';

const CinematicHero = () => {
  const pillarWrapperRef = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    // 1. Neural Background Logic (Canvas)
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let nodes = [];
    
    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = 600;
    };

    const initNodes = () => {
      nodes = Array.from({ length: 30 }, () => ({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
      }));
    };

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      nodes.forEach((node, i) => {
        node.x += node.vx; node.y += node.vy;
        if (node.x < 0 || node.x > canvas.width) node.vx *= -1;
        if (node.y < 0 || node.y > canvas.height) node.vy *= -1;

        ctx.fillStyle = 'rgba(16, 185, 129, 0.4)';
        ctx.beginPath();
        ctx.arc(node.x, node.y, 1, 0, Math.PI * 2);
        ctx.fill();

        for (let j = i + 1; j < nodes.length; j++) {
          const dist = Math.hypot(node.x - nodes[j].x, node.y - nodes[j].y);
          if (dist < 150) {
            ctx.strokeStyle = `rgba(16, 185, 129, ${0.1 * (1 - dist / 150)})`;
            ctx.lineWidth = 0.5;
            ctx.beginPath(); ctx.moveTo(node.x, node.y); ctx.lineTo(nodes[j].x, nodes[j].y); ctx.stroke();
          }
        }
      });
      requestAnimationFrame(draw);
    };

    window.addEventListener('resize', resize);
    resize(); initNodes(); draw();

    // 2. GSAP PILLAR REVEAL ANIMATION
    const timeline = gsap.timeline({ repeat: -1, yoyo: true, repeatDelay: 2 });
    
    timeline.to(".reveal-pillar", {
      height: "0%",
      duration: 1.2,
      ease: "power4.inOut",
      stagger: {
        amount: 0.8,
        from: "center"
      }
    });

    return () => window.removeEventListener('resize', resize);
  }, []);

  return (
    <div className="hero-visual-container">
      {/* Background Layer */}
      <canvas ref={canvasRef} id="neuralCanvas" className="absolute inset-0 opacity-40" />
      
      {/* Centered Brand Text */}
      <div className="hero-content-back">
        <h1 className="text-7xl md:text-9xl font-black text-white/10 tracking-tighter uppercase select-none">
          AML_DECODE
        </h1>
      </div>

      {/* Shutter Pillar Layer */}
      <div className="pillar-wrapper" ref={pillarWrapperRef}>
        {[...Array(12)].map((_, i) => (
          <div key={i} className="reveal-pillar" />
        ))}
      </div>

      <div className="hero-vignette" />
    </div>
  );
};

export default CinematicHero;