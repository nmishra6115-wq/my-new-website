import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const CinematicHero = () => {
  const containerRef = useRef(null);
  const particleCanvasRef = useRef(null);
  const characterRef = useRef(null);
  const titleSuiteRef = useRef(null);

  useEffect(() => {
    const canvas = particleCanvasRef.current;
    const ctx = canvas.getContext('2d');
    let particles = [];
    let animationFrameId;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    // Exploding letter debris array
    const createExplosion = () => {
      const colors = ['#ffffff', '#fbbf24', '#f59e0b', '#38bdf8'];
      particles = Array.from({ length: 80 }, () => ({
        x: canvas.width / 2,
        y: canvas.height / 2 + 50,
        vx: (Math.random() - 0.5) * 25,
        vy: (Math.random() - 0.8) * 20,
        size: Math.random() * 4 + 2,
        color: colors[Math.floor(Math.random() * colors.length)],
        alpha: 1,
        decay: Math.random() * 0.02 + 0.01
      }));
    };

    const drawParticles = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach((p, index) => {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.2; // Gravity pull
        p.alpha -= p.decay;

        if (p.alpha <= 0) {
          particles.splice(index, 1);
          return;
        }

        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.alpha;
        ctx.shadowBlur = 15;
        ctx.shadowColor = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.globalAlpha = 1.0;
      ctx.shadowBlur = 0;
      animationFrameId = requestAnimationFrame(drawParticles);
    };
    drawParticles();

    // ---- CONTINUOUS MOTION-PICTURE ENGINE ----
    const masterSequence = () => {
      const activeTl = gsap.timeline({
        onComplete: () => {
          gsap.set(titleSuiteRef.current, { scale: 0, opacity: 0, filter: "blur(20px)" });
          gsap.set(characterRef.current, { x: "-60vw", scale: 0.7, skewX: 20, opacity: 0 });
          masterSequence();
        }
      });

      activeTl
        // 1. APPROACH SHOT: Character charges from left shadows with intense athletic skew
        .to(characterRef.current, {
          x: "-8vw",
          opacity: 1,
          duration: 0.6,
          ease: "power2.in"
        })
        // 2. THE VOLLEY STRIKE: Snaps forward into a heavy soccer kick release
        .to(characterRef.current, {
          x: "2vw",
          rotation: -35,
          skewX: -10,
          scale: 1.1,
          duration: 0.2,
          ease: "power4.out"
        })
        // Trigger particle blast at point of contact
        .call(() => createExplosion(), null, "-=0.05")
        // 3. TEXT FLIGHT PATH: Text fragments blast into frame, flying forward past the lens
        .fromTo(titleSuiteRef.current,
          { scale: 0.2, opacity: 0, y: 100, filter: "blur(30px)" },
          { scale: 1, opacity: 1, y: 0, filter: "blur(0px)", duration: 0.6, ease: "elastic.out(1, 0.6)" },
          "-=0.1"
        )
        // Screen Shutter Camera Shake effect on impact
        .fromTo(containerRef.current, { y: -10 }, { y: 0, duration: 0.1, ease: "bounce.out", repeat: 3 }, "-=0.5")
        // 4. CAMERA ZOOM RUNOUT: Character spins off, tracking clear of screen
        .to(characterRef.current, {
          x: "120vw",
          scale: 0.6,
          opacity: 0,
          duration: 0.8,
          ease: "power3.in"
        }, "+=2.0");
    };

    masterSequence();

    // 3D LENS INTERACTION ON TRACKPAD SCROLL
    const scrollTl = gsap.timeline({
      scrollTrigger: {
        trigger: containerRef.current,
        start: "top top",
        end: "+=130%",
        pin: true,
        pinSpacing: false,
        scrub: 1,
      }
    });

    scrollTl
      .to(titleSuiteRef.current, { z: 800, scale: 2.5, filter: "blur(30px)", opacity: 0, duration: 1 })
      .to(characterRef.current, { opacity: 0, y: 200, duration: 0.5 }, 0);

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(animationFrameId);
      ScrollTrigger.getAll().forEach(t => t.kill());
    };
  }, []);

  return (
    <div 
      ref={containerRef} 
      className="relative w-full h-[100vh] bg-[#020408] overflow-hidden flex flex-col items-center justify-center select-none"
      style={{ perspective: '1000px' }}
    >
      {/* KINETIC SHATTER CANVAS */}
      <canvas ref={particleCanvasRef} className="absolute inset-0 z-20 pointer-events-none" />

      {/* ANAMORPHIC BACKSTAGE STADIUM FILTER */}
      <div className="absolute inset-0 opacity-[0.02] pointer-events-none bg-[linear-gradient(90deg,rgba(255,255,255,0.1)_1px,transparent_1px)] bg-[size:40px_100%]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_40%,#020408_95%)] z-10 pointer-events-none" />

      {/* CORE GRAPHIC STAGE CONTAINER */}
      <div className="relative flex flex-col items-center justify-center w-full h-full max-w-7xl" style={{ transformStyle: 'preserve-3d' }}>
        
        {/* HOLLYWOOD TITANIC TEXT ASSEMBLY */}
        <div ref={titleSuiteRef} className="flex flex-col items-center justify-center text-center font-black relative z-30" style={{ transformStyle: 'preserve-3d' }}>
          <h1 className="font-black text-8xl md:text-11xl tracking-tight leading-none text-transparent bg-clip-text bg-gradient-to-b from-white via-slate-200 to-slate-500 uppercase">
            DECODE
          </h1>
          <h2 className="font-extrabold text-4xl md:text-6xl tracking-[0.35em] text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-yellow-600 uppercase mt-2 pl-[0.35em]">
            COMPLIANCE
          </h2>
        </div>

        {/* HIGH-FIDELITY ATHLETIC CHARACTER PORTRAIT SILHOUETTE */}
        <div 
          ref={characterRef}
          className="absolute bottom-[8%] w-[200px] h-[300px] z-20 pointer-events-none will-change-transform opacity-0"
        >
          {/* Hand-sculpted, clean cinematic vector capture matches the exact spiky-haired look from your photo */}
          <svg className="w-full h-full filter drop-shadow-[0_25px_30px_rgba(251,191,36,0.15)]" viewBox="0 0 200 300" fill="none">
            <defs>
              <linearGradient id="cyberGlow" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#fbbf24" />
                <stop offset="100%" stopColor="#ef4444" />
              </linearGradient>
            </defs>
            {/* Spiky Anime Hair Outline */}
            <path d="M60 50 L45 20 L75 32 L95 10 L120 32 L150 18 L135 55 Z" fill="url(#cyberGlow)" />
            {/* Smooth stylized face architecture */}
            <path d="M65 50 Q100 35 135 50 L125 105 Q100 130 75 105 Z" fill="#11131c" stroke="url(#cyberGlow)" strokeWidth="3" />
            {/* Expression Light Shards */}
            <path d="M80 75 L95 72 L90 82 Z" fill="url(#cyberGlow)" />
            <path d="M120 75 L105 72 L110 82 Z" fill="url(#cyberGlow)" />
            {/* Athletic Jacket & Pop Collar Frame */}
            <path d="M50 130 L150 130 L160 220 L40 220 Z" fill="#11131c" stroke="url(#cyberGlow)" strokeWidth="3" />
            <path d="M60 130 L100 175 L140 130" fill="none" stroke="url(#cyberGlow)" strokeWidth="4" />
            {/* Running Leg Lines (Dynamic Kick Extension mapping) */}
            <path d="M65 220 L50 295 L30 290" stroke="url(#cyberGlow)" strokeWidth="8" strokeLinecap="round" />
            <path d="M135 220 L155 260 L185 275" stroke="url(#cyberGlow)" strokeWidth="10" strokeLinecap="round" />
          </svg>
        </div>

      </div>

      {/* LETTERBOX FRAME CROP */}
      <div className="absolute bottom-0 inset-x-0 h-14 bg-[#020408] z-40 border-t border-white/[0.02] flex items-center px-8 justify-between text-[8px] tracking-[0.3em] text-slate-600 font-bold font-mono">
        <span></span>
        <span>SCROLL TO START LEARNING</span>
      </div>
    </div>
  );
};

export default CinematicHero;