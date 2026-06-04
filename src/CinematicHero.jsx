import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Register the plugin
gsap.registerPlugin(ScrollTrigger);

const CinematicHero = () => {
  const sectionRef = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    // 1. PINNING & UNIFIED MOVING TIMELINE
    const scrollTl = gsap.timeline({
      scrollTrigger: {
        trigger: sectionRef.current,
        start: "top top",
        end: "+=100%", 
        pin: true,
        pinSpacing: false, // Next section slides over it
        scrub: 1, // Smoothly tracks your scroll position
      }
    });

    // Slides the ENTIRE core wrapper (text + arrow together) UPWARDS out of view
    scrollTl.to(".hero-core-moving-wrapper", {
      y: -180, 
      opacity: 0,
      duration: 1,
      ease: "power1.inOut"
    }, 0);

    // Slowly fades out the background canvas grid
    scrollTl.to(canvasRef.current, {
      opacity: 0,
      duration: 1
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

    // 3. PILLAR REVEAL
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
      ScrollTrigger.getAll().forEach(t => t.kill()); 
    };
  }, []);

 return (
    <div className="hero-visual-container relative w-full h-[100vh] overflow-hidden bg-[#030712]" ref={sectionRef}>
      
      {/* Background Canvas Layer */}
      <canvas ref={canvasRef} className="absolute inset-0 opacity-40 pointer-events-none z-0" />

      {/* Main Container Layer */}
      <div className="absolute inset-0 flex flex-col items-center justify-center z-10">
        
        {/* UNIFIED CONTAINER: Both elements live inside this box so they move and vanish as one piece */}
        <div className="hero-core-moving-wrapper flex flex-col items-center justify-center text-center relative">
          
          {/* Main Hero Title Text */}
          <h1 
            className="hero-brand-text animate-text-glow select-none" 
            style={{ 
              color: 'rgba(251, 191, 36, 0.45)', 
              letterSpacing: '0.15em' 
            }}
          >
            DECODE<br/>COMPLIANCE
          </h1>

          {/* Connected Bridge Tag: Sits right under the text baseline */}
          <div className="scroll-explore-arrow flex flex-col items-center gap-1.5 mt-8 pointer-events-none">
            <span className="text-[10px] font-black text-amber-500 uppercase tracking-[0.3em] bg-black/80 px-4 py-2 border border-amber-500/20 rounded-full backdrop-blur-md shadow-2xl">
              Explore Learning
            </span>
            <svg className="w-5 h-5 text-amber-500 animate-bounce mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </div>

        </div>

      </div>

      {/* Shutter Pillars */}
      <div className="pillar-wrapper absolute inset-0 z-30 pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <div key={i} className="reveal-pillar border-r border-amber-600/20" />
        ))}
      </div>

      {/* Bottom Vignette Shield */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#030712] z-20 pointer-events-none" />
    </div>
  );
};

export default CinematicHero;