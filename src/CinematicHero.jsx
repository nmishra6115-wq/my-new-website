import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Register ScrollTrigger lifecycle plugin
gsap.registerPlugin(ScrollTrigger);

const CinematicHero = () => {
  const sectionRef = useRef(null);
  const canvasRef = useRef(null);
  const mouseRef = useRef({ x: 0, y: 0, targetX: 0, targetY: 0 });

  useEffect(() => {
    // 1. LIVE PARALLAX POINTER TRACKING
    const handleMouseMove = (e) => {
      mouseRef.current.targetX = e.clientX;
      mouseRef.current.targetY = e.clientY;
    };
    window.addEventListener('mousemove', handleMouseMove);

    // 2. TIMELINE MASTER CONTROL: EXTENDED 3D DEPTH HAND-OFF
    const scrollTl = gsap.timeline({
      scrollTrigger: {
        trigger: sectionRef.current,
        start: "top top",
        end: "+=120%", 
        pin: true,
        pinSpacing: false, 
        scrub: 1, 
      }
    });

    // Anamorphic focus fade: scales text down, increases track spacing, and blurs outward like a lens defocusing
    scrollTl.to(".hero-core-moving-wrapper", {
      scale: 0.85,
      letterSpacing: "0.3em",
      filter: "blur(8px)",
      y: -140,
      opacity: 0,
      duration: 1,
      ease: "power2.inOut"
    }, 0);

    // Fades ambient flare elements cleanly out of scope
    scrollTl.to(".cinematic-anamorphic-flare", {
      opacity: 0,
      scaleX: 0,
      duration: 0.7,
      ease: "power1.in"
    }, 0);

    // Smooth camera fade out on the background network lines
    scrollTl.to(canvasRef.current, {
      opacity: 0,
      scale: 1.1,
      duration: 1,
      ease: "power1.inOut"
    }, 0);

    // 3. DYNAMIC INTERACTIVE NEURAL ENGINE CANVAS
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let nodes = [];
    
    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight; 
    };

    const initNodes = () => {
      nodes = Array.from({ length: 45 }, () => ({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        baseX: Math.random() * canvas.width,
        baseY: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        size: Math.random() * 1.5 + 1
      }));
    };

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Smooth mouse interpolation logic
      const m = mouseRef.current;
      m.x += (m.targetX - m.x) * 0.08;
      m.y += (m.targetY - m.y) * 0.08;

      nodes.forEach((node, i) => {
        // Continuous linear vector float
        node.x += node.vx;
        node.y += node.vy;

        // Interactive gravity field: nodes drift slightly toward the cursor position
        if (m.x > 0 && m.y > 0) {
          const dx = m.x - node.x;
          const dy = m.y - node.y;
          const distToMouse = Math.hypot(dx, dy);
          if (distToMouse < 250) {
            const force = (250 - distToMouse) / 250;
            node.x += (dx / distToMouse) * force * 0.6;
            node.y += (dy / distToMouse) * force * 0.6;
          }
        }

        // Boundary reflection collision checks
        if (node.x < 0 || node.x > canvas.width) node.vx *= -1;
        if (node.y < 0 || node.y > canvas.height) node.vy *= -1;

        // Draw core node cluster points
        ctx.fillStyle = 'rgba(251, 191, 36, 0.65)'; 
        ctx.beginPath(); 
        ctx.arc(node.x, node.y, node.size, 0, Math.PI * 2); 
        ctx.fill();

        // Connect proximity data vector paths
        for (let j = i + 1; j < nodes.length; j++) {
          const dist = Math.hypot(node.x - nodes[j].x, node.y - nodes[j].y);
          if (dist < 160) {
            ctx.strokeStyle = `rgba(251, 191, 36, ${0.28 * (1 - dist / 160)})`;
            ctx.lineWidth = 0.8; 
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

    // 4. PRE-SET RECURSIVE SHUTTER PILLARS CYCLE
    const tl = gsap.timeline({ repeat: -1, yoyo: true, repeatDelay: 2.0 });
    tl.to(".reveal-pillar", {
      scaleY: 0,
      opacity: 0,
      duration: 1.6,
      ease: "expo.inOut",
      stagger: { amount: 1.2, from: "center" }
    });

    return () => {
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', handleMouseMove);
      ScrollTrigger.getAll().forEach(t => t.kill()); 
    };
  }, []);

  return (
    <div className="hero-visual-container relative w-full h-[100vh] overflow-hidden bg-[#02050d]" ref={sectionRef}>
      
      {/* SCOPE OVERLAY LAYER 1: CRT SCANLINES & INTERFERENCE GLITCH */}
      <div className="absolute inset-0 z-20 pointer-events-none opacity-[0.03] bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[size:100%_4px,6px_100%]" />

      {/* SCOPE OVERLAY LAYER 2: CINEMATIC NOISE GRAIN */}
      <div className="absolute inset-0 z-20 pointer-events-none opacity-[0.015] bg-[radial-gradient(#fff_1px,transparent_1px)] bg-[size:24px_24px] mix-blend-overlay" />

      {/* Background Matrix Canvas */}
      <canvas ref={canvasRef} className="absolute inset-0 opacity-[0.35] pointer-events-none z-0 scale-105" />

      {/* Main Focus Container Field */}
      <div className="absolute inset-0 flex flex-col items-center justify-center z-10">
        
        {/* LIGHT ARTIFACT: Anamorphic Horizontal Flare Element */}
        <div className="cinematic-anamorphic-flare absolute w-[120vw] h-[1px] bg-gradient-to-r from-transparent via-amber-500/40 to-transparent blur-[2px] z-0 pointer-events-none transform -rotate-1 translate-y-[-20px] scale-x-110" />
        <div className="cinematic-anamorphic-flare absolute w-[70vw] h-[4px] bg-gradient-to-r from-transparent via-amber-400/20 to-transparent blur-[6px] z-0 pointer-events-none transform -rotate-1 translate-y-[-20px]" />

        {/* CORE ACTION MODULE OVERLAY BOX */}
        <div className="hero-core-moving-wrapper flex flex-col items-center justify-center text-center relative z-10 select-none px-4">
          
          {/* Main Hero Title Typography: Dual Layer Depth shadows */}
          <h1 
            className="hero-brand-text font-black text-6xl md:text-8xl tracking-[0.18em] leading-[1.1] transition-all duration-300 relative select-none uppercase text-transparent bg-clip-text bg-gradient-to-b from-[#fffbf0] via-[#fbbf24]/70 to-[#92400e]/30"
            style={{ 
              filter: 'drop-shadow(0 0 12px rgba(251, 191, 36, 0.15)) drop-shadow(0 20px 40px rgba(0,0,0,0.7))',
              willChange: 'transform, filter, letter-spacing'
            }}
          >
            DECODE<br/>COMPLIANCE
          </h1>

          {/* Connected Bridge Tag Unit */}
          <div className="scroll-explore-arrow flex flex-col items-center gap-2 mt-12 pointer-events-none">
            <span className="text-[9px] font-black text-amber-400/90 uppercase tracking-[0.35em] bg-[#040a17]/90 px-5 py-2.5 border border-amber-500/20 rounded-full backdrop-blur-xl shadow-[0_20px_40px_rgba(0,0,0,0.6)] relative overflow-hidden group">
              <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full animate-data-stream" style={{ animationDuration: '3s' }} />
              Explore Learning
            </span>
            <div className="flex flex-col items-center opacity-70">
              <svg className="w-4 h-4 text-amber-500 animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
              </svg>
            </div>
          </div>

        </div>

      </div>

      {/* High-Fidelity Mechanical Shutter Pillars */}
      <div className="pillar-wrapper absolute inset-0 z-30 pointer-events-none mix-blend-luminosity">
        {[...Array(24)].map((_, i) => (
          <div 
            key={i} 
            className="reveal-pillar border-r bg-[#02050d] border-amber-500/[0.04]"
            style={{ 
              boxShadow: 'inset -1px 0 0 rgba(0, 0, 0, 0.8), 1px 0 0 rgba(255, 255, 255, 0.01)'
            }} 
          />
        ))}
      </div>

      {/* Atmospheric Perimeter Vignette & Bottom Depth Shield */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_30%,rgba(2,5,13,0.7)_80%),linear-gradient(to_bottom,rgba(2,5,13,0.4)_0%,transparent_30%,transparent_70%,#030712_100%)] z-20 pointer-events-none" />
    </div>
  );
};

export default CinematicHero;