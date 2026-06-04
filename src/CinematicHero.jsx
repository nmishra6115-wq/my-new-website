import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Register the plugin
gsap.registerPlugin(ScrollTrigger);

const CinematicHero = () => {
  const sectionRef = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    // 1. PINNING LOGIC (The "Scrolling Above" Effect)
    ScrollTrigger.create({
      trigger: sectionRef.current,
      start: "top top",
      pin: true,
      pinSpacing: false, // Allows the next section to overlap
    });

    // 2. NEURAL CANVAS BACKGROUND
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let nodes = [];
    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight; // Full screen height
    };
    const initNodes = () => {
      nodes = Array.from({ length: 40 }, () => ({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
      }));
    };
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      nodes.forEach((node, i) => {
        node.x += node.vx; node.y += node.vy;
        if (node.x < 0 || node.x > canvas.width) node.vx *= -1;
        if (node.y < 0 || node.y > canvas.height) node.vy *= -1;
ctx.fillStyle = 'rgba(251, 191, 36, 0.6)'; // Brighter Gold/Amber       ctx.beginPath(); ctx.arc(node.x, node.y, 1.2, 0, Math.PI * 2); ctx.fill();
        for (let j = i + 1; j < nodes.length; j++) {
          const dist = Math.hypot(node.x - nodes[j].x, node.y - nodes[j].y);
          if (dist < 150) {
            ctx.strokeStyle = `rgba(180, 83, 9, ${0.2 * (1 - dist / 150)})`; // Copper connecting lines
            ctx.lineWidth = 0.5;
            ctx.beginPath(); ctx.moveTo(node.x, node.y); ctx.lineTo(nodes[j].x, nodes[j].y); ctx.stroke();
          }
        }
      });
      requestAnimationFrame(draw);
    };

    window.addEventListener('resize', resize);
    resize(); initNodes(); draw();

    // 3. PILLAR REVEAL (Matching the Video)
    const tl = gsap.timeline({ repeat: -1, yoyo: true, repeatDelay: 1.5 });
    tl.to(".reveal-pillar", {
      scaleY: 0,
      opacity: 0,
      duration: 1.5,
      ease: "expo.inOut",
      stagger: { amount: 1, from: "center" }
    });

    return () => {
      window.removeEventListener('resize', resize);
      ScrollTrigger.getAll().forEach(t => t.kill()); // Cleanup
    };
  }, []);

 return (
    <div className="hero-visual-container" ref={sectionRef}>
      
      <div className="hero-background-layer">
        <canvas ref={canvasRef} className="absolute inset-0 opacity-40" />
        <h1 className="hero-brand-text" style={{ color: 'rgba(251, 191, 36, 0.08)' }}>
          DECODE<br/>COMPLIANCE
        </h1>
      </div>

      <div className="pillar-wrapper">
        {[...Array(20)].map((_, i) => (
          <div key={i} className="reveal-pillar border-r border-amber-600/20" />
        ))}
      </div>

      {/* Brighter Vignette */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#030712] z-30 pointer-events-none" />
    </div>
  );
};

export default CinematicHero;