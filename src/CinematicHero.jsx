import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const CinematicHero = () => {
  const containerRef = useRef(null);
  const characterRef = useRef(null);
  const textSuiteRef = useRef(null);
  const flashOverlayRef = useRef(null);

  useEffect(() => {
    // ---- THE HOLLYWOOD FOOTBALL RUN & KICK RECURSIVE ENGINE ----
    const triggerFootballSequence = () => {
      const fieldTl = gsap.timeline({
        onComplete: () => {
          // Reset all spatial positions cleanly behind the scenes and restart the loop
          gsap.set(textSuiteRef.current, { scale: 0.1, y: 250, opacity: 0, rotation: 0, filter: "blur(20px)" });
          gsap.set(characterRef.current, { x: "-60vw", y: 120, rotation: 0, scale: 1, opacity: 1 });
          triggerFootballSequence();
        }
      });

      fieldTl
        // 1. APPROACH STATE: Character sprints from the left field wing into kicking range
        .to(characterRef.current, {
          x: "-12vw",
          y: 100,
          duration: 0.7,
          ease: "power2.in",
          opacity: 1
        })
        
        // 2. THE VOLLEY STRIKE: Character plants his foot, tilts back dynamically, and swings hard
        .to(characterRef.current, {
          x: "3vw",
          y: 140,
          rotation: -40,
          scale: 1.15,
          duration: 0.18,
          ease: "power4.out"
        })

        // 3. BALLISTIC FLIGHT PATH: The exact millisecond the boot collides with the text matrix
        .to(textSuiteRef.current, {
          scale: 1,
          y: 0,
          rotation: 360,
          filter: "blur(0px)",
          opacity: 1,
          duration: 0.5,
          ease: "expo.out"
        }, "-=0.04")

        // 4. ARENA SHOCKWAVE: Explicit structural shake applied to the entire viewport on impact
        .fromTo(containerRef.current, 
          { y: -12 }, 
          { y: 0, duration: 0.08, ease: "bounce.out", repeat: 4 }, 
          "-=0.45"
        )

        // 5. BLINDING LENS FLARE: Explosion overlay bursts open over the lock-in zone
        .fromTo(flashOverlayRef.current, 
          { opacity: 0, scale: 0.1 },
          { opacity: 1, scale: 3.5, duration: 0.12, ease: "power3.out" }, "-=0.45"
        )
        .to(flashOverlayRef.current, { opacity: 0, scale: 5, duration: 0.6, ease: "power2.inOut" })

        // 6. FOLLOW-THROUGH RUNOUT: Character recovers his balance and dashes off-screen right
        .to(characterRef.current, { rotation: 0, y: 120, duration: 0.25, ease: "back.out(1.5)" })
        .to(characterRef.current, {
          x: "115vw",
          scale: 0.8,
          opacity: 0,
          duration: 0.85,
          ease: "power3.in"
        }, "+=2.2");
    };

    // Fire up the interactive loop engine
    triggerFootballSequence();

    // DYNAMIC ZOOM INTENSITY HANDLED BY THE TRACKPAD SCROLL TIMELINE
    const scrollTl = gsap.timeline({
      scrollTrigger: {
        trigger: containerRef.current,
        start: "top top",
        end: "+=140%",
        pin: true,
        pinSpacing: false,
        scrub: 1,
      }
    });

    scrollTl
      .to(textSuiteRef.current, { z: 700, scale: 2.2, filter: "blur(25px)", opacity: 0, duration: 1 })
      .to(characterRef.current, { opacity: 0, y: 350, duration: 0.5 }, 0);

    return () => {
      ScrollTrigger.getAll().forEach(t => t.kill());
    };
  }, []);

  return (
    <div 
      ref={containerRef} 
      className="relative w-full h-[100vh] bg-[#020409] overflow-hidden flex flex-col items-center justify-center select-none"
      style={{ perspective: '1100px' }}
    >
      
      {/* GLOWING SHATTER IMPACT CANVAS GRID */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[radial-gradient(#fff_1px,transparent_1px)] bg-[size:40px_40px]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_30%,#020409_95%)] z-10 pointer-events-none" />

      {/* STADIUM LIGHT STREAKS ACCENT */}
      <div className="absolute top-[52vh] inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-amber-500/20 to-transparent blur-[1.5px] z-10 pointer-events-none transform -rotate-1" />

      {/* MASTER GRAPHIC PERFORMANCE FIELD */}
      <div className="relative flex flex-col items-center justify-center w-full h-full max-w-7xl" style={{ transformStyle: 'preserve-3d' }}>
        
        {/* THE TARGET TEXT BLOCKS (Launched violently by the volley kick) */}
        <div ref={textSuiteRef} className="flex flex-col items-center justify-center text-center font-black relative z-30" style={{ transformStyle: 'preserve-3d' }}>
          <h1 className="font-black text-8xl md:text-11xl tracking-tight leading-none text-transparent bg-clip-text bg-gradient-to-b from-white via-slate-200 to-slate-500 uppercase">
            DECODE
          </h1>
          <h2 className="font-extrabold text-4xl md:text-6xl tracking-[0.38em] text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-600 uppercase mt-2 pl-[0.38em]">
            COMPLIANCE
          </h2>

          {/* MASSIVE VOLLEY IMPACT BURST OVERLAY */}
          <div 
            ref={flashOverlayRef}
            className="absolute top-[30%] left-[40%] w-40 h-40 bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 rounded-full blur-3xl mix-blend-screen opacity-0 pointer-events-none z-30" 
          />
        </div>

        {/* CONTRAST SILHOUETTE CHARACTER INTERACTION LAYER */}
        <div 
          ref={characterRef}
          className="absolute bottom-[6%] w-[190px] h-[285px] md:w-[210px] md:h-[315px] z-20 pointer-events-none will-change-transform opacity-0"
        >
          {/* Detailed athletic geometry layout precisely matching the visual posture parameters of your sketch profile */}
          <svg className="w-full h-full filter drop-shadow-[0_20px_35px_rgba(251,191,36,0.15)]" viewBox="0 0 200 300" fill="none">
            <defs>
              <linearGradient id="stadiumGlow" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#fbbf24" />
                <stop offset="70%" stopColor="#f59e0b" />
                <stop offset="100%" stopColor="#e11d48" />
              </linearGradient>
            </defs>
            {/* Crown Spiky Anime Hair Geometry */}
            <path d="M55 52 L42 22 L72 34 L92 12 L118 34 L146 20 L132 58 Z" fill="url(#stadiumGlow)" />
            {/* Oval Face Contour and Ear Maps */}
            <path d="M62 52 Q100 36 132 52 L122 108 Q100 134 72 108 Z" fill="#0b0d14" stroke="url(#stadiumGlow)" strokeWidth="3" />
            {/* Expressive Eye Focal Slots */}
            <path d="M78 76 L94 73 L88 84 Z" fill="url(#stadiumGlow)" />
            <path d="M118 76 L102 73 L108 84 Z" fill="url(#stadiumGlow)" />
            {/* High Pop-Collar Bomber Jacket Base */}
            <path d="M48 134 L152 134 L162 224 L38 224 Z" fill="#0b0d14" stroke="url(#stadiumGlow)" strokeWidth="3" />
            <path d="M58 134 L100 180 L142 134" fill="none" stroke="url(#stadiumGlow)" strokeWidth="4" />
            {/* Dynamic Footbal Volley Strut Lines */}
            <path d="M62 224 L48 298 L28 292" stroke="url(#stadiumGlow)" strokeWidth="8" strokeLinecap="round" />
            <path d="M132 224 L152 264 L188 280" stroke="url(#stadiumGlow)" strokeWidth="11" strokeLinecap="round" /> {/* Kicking Foot */}
          </svg>
        </div>

      </div>

      {/* LOWER STADIUM EDGE BARS */}
      <div className="absolute bottom-0 inset-x-0 h-14 bg-[#020409] z-40 border-t border-white/[0.02] flex items-center px-8 justify-between text-[8px] tracking-[0.3em] text-slate-600 font-bold font-mono">
        <span>STADIUM_CHOREOGRAPHY_STREAM_V4 // LIVE</span>
        <span>SCROLL TO ADVANCE ENGINE CONTROLS</span>
      </div>

    </div>
  );
};

export default CinematicHero;