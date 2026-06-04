import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Register the plugin
gsap.registerPlugin(ScrollTrigger);

const CinematicHero = () => {
  const sectionRef = useRef(null);
  const canvasRef = useRef(null);
  const triggerRef = useRef(null);

  useEffect(() => {
    // 1. PINNING & COMPOUND SCROLL TIMELINE
    const scrollTl = gsap.timeline({
      scrollTrigger: {
        trigger: sectionRef.current,
        start: "top top",
        end: "+=100%", // Scroll distance for the animation to complete
        pin: true,
        pinSpacing: false, // Allows the next section to slide over
        scrub: 1, // Smoothly links animation progress to scroll wheel
      }
    });

    // Animate everything together on scroll
    scrollTl
      // A. Wrap up the text (Scale it down as you scroll)
      .to(".hero-brand-text", {
        scale: 0.3,
        opacity: 0,
        duration: 1,
        ease: "power2.inOut"
      }, 0)
      // B. Reveal the center button smoothly right after the text shrinks
      .fromTo(".hero-popup-btn", 
        { scale: 0.5, opacity: 0 },
        { scale: 1, opacity: 1, duration: 0.5, ease: "back.out(1.7)" },
        0.5
      )
      // C. Shutter the pillars away
      .to(".reveal-pillar", {
        scaleY: 0,
        opacity: 0,
        duration: 1,
        ease: "expo.inOut",
        stagger: { amount: 0.5, from: "center" }
      }, 0);

    // 2. NEURAL CANVAS BACKGROUND
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let nodes = [];
    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
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
        node.x += node.vx;
        node.y += node.vy;

        if (node.x < 0 || node.x > canvas.width) node.vx *= -1;
        if (node.y < 0 || node.y > canvas.height) node.vy *= -1;

        ctx.fillStyle = 'rgba(251, 191, 36, 0.8)'; 
        ctx.beginPath(); 
        ctx.arc(node.x, node.y, 2, 0, Math.PI * 2); 
        ctx.fill();

        for (let j = i + 1; j < nodes.length; j++) {
          const dist = Math.hypot(node.x - nodes[j].x, node.y - nodes[j].y);
          if (dist < 180) {
            ctx.strokeStyle = `rgba(251, 191, 36, ${0.4 * (1 - dist / 180)})`;
            ctx.lineWidth = 1.5; 
            ctx.beginPath(); 
            ctx.moveTo(node.x, node.y); 
            ctx.lineTo(nodes[j].x, nodes[j].y); 
            ctx.stroke();
          }
        }
      });
      requestAnimationFrame(draw);
    };

    window.addEventListener('resize', resize);
    resize(); initNodes(); draw();

    return () => {
      window.removeEventListener('resize', resize);
      ScrollTrigger.getAll().forEach(t => t.kill());
    };
  }, []);

 return (
    <div className="hero-visual-container" ref={sectionRef}>
      
      <div className="hero-background-layer flex flex-col items-center justify-center relative w-full h-full">
        <canvas ref={canvasRef} className="absolute inset-0 opacity-40" />
        
        {/* Animated Wrapper Text */}
        <h1 
          className="hero-brand-text absolute" 
          style={{ 
            color: 'rgba(251, 191, 36, 0.45)', 
            letterSpacing: '0.15em' 
          }}
        >
          DECODE<br/>COMPLIANCE
        </h1>

        {/* NEW: Pinned Popup Button that reveals on scroll */}
        <button 
          onClick={() => {
            const nextSection = document.querySelector('.intelligence-grid-section');
            if (nextSection) nextSection.scrollIntoView({ behavior: 'smooth' });
          }}
          className="hero-popup-btn opacity-0 absolute z-40 px-8 py-4 bg-emerald-600 hover:bg-emerald-500 text-black font-black text-xs uppercase tracking-widest rounded-xl transition-all shadow-[0_0_30px_rgba(16,185,129,0.4)]"
        >
          Explore Learning &rarr;
        </button>
      </div>

      <div className="pillar-wrapper">
        {[...Array(20)].map((_, i) => (
          <div key={i} className="reveal-pillar border-r border-amber-600/20" />
        ))}
      </div>

      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#030712] z-30 pointer-events-none" />
    </div>
  );
};

export default CinematicHero;