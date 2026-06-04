import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';

const CinematicHero = () => {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    // 1. HIGH-DENSITY NEURAL BACKGROUND
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let nodes = [];
    
    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = 600;
    };

    const initNodes = () => {
      nodes = Array.from({ length: 50 }, () => ({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
      }));
    };

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      nodes.forEach((node, i) => {
        node.x += node.vx; node.y += node.vy;
        if (node.x < 0 || node.x > canvas.width) node.vx *= -1;
        if (node.y < 0 || node.y > canvas.height) node.vy *= -1;

        ctx.fillStyle = 'rgba(16, 185, 129, 0.5)';
        ctx.beginPath(); ctx.arc(node.x, node.y, 1.5, 0, Math.PI * 2); ctx.fill();

        for (let j = i + 1; j < nodes.length; j++) {
          const dist = Math.hypot(node.x - nodes[j].x, node.y - nodes[j].y);
          if (dist < 180) {
            ctx.strokeStyle = `rgba(16, 185, 129, ${0.15 * (1 - dist / 180)})`;
            ctx.lineWidth = 0.8;
            ctx.beginPath(); ctx.moveTo(node.x, node.y); ctx.lineTo(nodes[j].x, nodes[j].y); ctx.stroke();
          }
        }
      });
      requestAnimationFrame(draw);
    };

    window.addEventListener('resize', resize);
    resize(); initNodes(); draw();

    // 2. MASTER GSAP REVEAL SEQUENCE (Matching Video)
    const tl = gsap.timeline({
      repeat: -1,
      yoyo: true,
      repeatDelay: 1.5
    });

    // Animate Pillars
    tl.to(".reveal-pillar", {
      scaleY: 0,
      opacity: 0,
      duration: 1.5,
      ease: "expo.inOut",
      stagger: {
        amount: 1,
        from: "center", // Reveal starts from middle like the video
        grid: "auto"
      }
    }, 0);

    // Zoom the background text slightly for that cinematic scale-in
    tl.fromTo(".hero-brand-text", 
      { scale: 0.8, opacity: 0 },
      { scale: 1.1, opacity: 1, duration: 2, ease: "power2.out" },
      0.5
    );

    return () => window.removeEventListener('resize', resize);
  }, []);

  return (
    <div className="hero-visual-container" ref={containerRef}>
      {/* Deep Background Layer */}
      <div className="hero-background-layer">
        <canvas ref={canvasRef} className="absolute inset-0 opacity-30" />
        <h1 className="hero-brand-text">
          AML<br/>DECODE
        </h1>
      </div>

      {/* The 20-Pillar Shutter System */}
      <div className="pillar-wrapper">
        {[...Array(20)].map((_, i) => (
          <div key={i} className="reveal-pillar" />
        ))}
      </div>

      {/* Atmospheric Fog */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#030712] z-30 pointer-events-none" />
    </div>
  );
};

export default CinematicHero;