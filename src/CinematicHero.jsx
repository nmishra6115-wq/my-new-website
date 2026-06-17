import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const CinematicHero = () => {
  const sceneRef = useRef(null);
  const characterRef = useRef(null);
  const wordAmlRef = useRef(null);
  const wordDecodeRef = useRef(null);
  const flashOverlayRef = useRef(null);

  useEffect(() => {
    // ---- HOLLYWOOD CHOREOGRAPHY MASTER TIMELINE ----
    const introTl = gsap.timeline({ delay: 0.5 });

    // Ensure initial structural visibility sets up cleanly before action
    introTl.set([wordAmlRef.current, wordDecodeRef.current], { opacity: 1 });

    introTl
      // PHASE 1: The Character drops dramatically from the top lens boundary
      .fromTo(characterRef.current, 
        { y: -600, scaleY: 1.4, opacity: 0 },
        { y: 0, scaleY: 1, opacity: 1, duration: 1, ease: "bounce.out" }
      )
      // Slight mechanical breathing settle right after landing
      .to(characterRef.current, { scaleX: 1.05, scaleY: 0.95, duration: 0.2, yoyo: true, repeat: 1 })
      
      // PHASE 2: Character sprints left to "collect" the scattered word AML
      .to(characterRef.current, { x: -250, rotation: -10, duration: 0.5, ease: "power2.inOut" }, "+=0.2")
      // Character touches AML and magnets it to his coordinate position
      .to(wordAmlRef.current, { x: -200, y: 50, scale: 0.7, duration: 0.4, ease: "power3.out" }, "-=0.3")
      
      // Character spins back right to "collect" the word DECODE
      .to(characterRef.current, { x: 250, rotation: 15, duration: 0.6, ease: "power2.inOut" })
      // Pulls both words along with his trajectory momentum frame
      .to(wordAmlRef.current, { x: 200, duration: 0.5, ease: "power2.inOut" }, "-=0.6")
      .to(wordDecodeRef.current, { x: 300, y: -20, scale: 0.8, duration: 0.5, ease: "power3.out" }, "-=0.4")

      // PHASE 3: THE HOLLYWOOD THROW (Character winds up and hurls words to the dead center)
      .to(characterRef.current, { x: 0, y: 50, rotation: -30, scaleX: 0.9, duration: 0.4, ease: "back.in(2)" })
      // The violent release action snap
      .to(characterRef.current, { y: -20, rotation: 45, scaleX: 1.1, duration: 0.2, ease: "power4.out" })
      
      // The words are hurled violently into the exact operational target center layout
      .to(wordAmlRef.current, { x: 0, y: 0, scale: 1, rotation: 360, duration: 0.5, ease: "expo.out" }, "-=0.1")
      .to(wordDecodeRef.current, { x: 0, y: 0, scale: 1, rotation: -360, duration: 0.5, ease: "expo.out" }, "-=0.5")
      
      // PHASE 4: IMPACT FLARE (The cinematic blast when the words lock together)
      .fromTo(flashOverlayRef.current, 
        { opacity: 0, scale: 0.3 },
        { opacity: 1, scale: 2, duration: 0.15, ease: "power2.out" }, "-=0.4"
      )
      .to(flashOverlayRef.current, { opacity: 0, scale: 3, duration: 0.6, ease: "power1.inOut" })
      
      // Character returns to a cool standing idle pose looking up at the locked title block
      .to(characterRef.current, { rotation: 0, y: 120, x: 0, scale: 0.85, duration: 0.8, ease: "elastic.out(1, 0.75)" }, "-=0.5");


    // ---- SCROLL TIMELINE LENS TRACK INTEGRATION ----
    const scrollTl = gsap.timeline({
      scrollTrigger: {
        trigger: sceneRef.current,
        start: "top top",
        end: "+=130%",
        pin: true,
        pinSpacing: false,
        scrub: 1,
      }
    });

    // Camera zooms deeply straight through the assembled word space on trackpad scroll
    scrollTl
      .to(".cinematic-text-vault", {
        z: 400,
        scale: 1.6,
        filter: "blur(15px)",
        opacity: 0,
        duration: 1,
        ease: "power2.inOut"
      }, 0)
      .to(characterRef.current, {
        y: 400,
        z: 200,
        scale: 0.5,
        opacity: 0,
        duration: 0.9,
        ease: "power2.in"
      }, 0)
      .to(".cinematic-bg-grid", {
        opacity: 0,
        scale: 0.9,
        duration: 1
      }, 0);

    return () => {
      ScrollTrigger.getAll().forEach(t => t.kill());
    };
  }, []);

  return (
    <div 
      ref={sceneRef} 
      className="relative w-full h-[100vh] bg-[#02050d] overflow-hidden flex flex-col items-center justify-center select-none"
      style={{ perspective: '1200px' }}
    >
      
      {/* CINEMATIC BG GRAPH GRID */}
      <div className="cinematic-bg-grid absolute inset-0 opacity-[0.04] pointer-events-none" 
           style={{ backgroundImage: 'radial-gradient(#fff 1px, transparent 1px)', backgroundSize: '32px 32px' }} />
      
      {/* AMBIENT SCREEN EDGE LENS VIGNETTE */}
      <div className="absolute inset-0 z-20 pointer-events-none bg-[radial-gradient(circle_at_center,transparent_20%,#02050d_90%)]" />
      <div className="absolute inset-0 z-20 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.3)_50%)] bg-[size:100%_4px] opacity-20" />

      {/* HORIZONTAL ANAMORPHIC FLARE STREAM */}
      <div className="absolute top-[50vh] inset-x-0 h-[1.5px] bg-gradient-to-r from-transparent via-amber-500/30 to-transparent blur-[1px] z-10 pointer-events-none transform -rotate-1" />

      {/* CORE INTERACTIVE STAGE */}
      <div className="relative flex flex-col items-center justify-center w-full h-full max-w-7xl" style={{ transformStyle: 'preserve-3d' }}>
        
        {/* THE TITANIC CORE TEXT PACK (Assembled by character) */}
        <div className="cinematic-text-vault flex flex-col items-center justify-center text-center font-black relative z-10" style={{ transformStyle: 'preserve-3d' }}>
          
          {/* WORD 1: AML */}
          <div 
            ref={wordAmlRef}
            className="opacity-0 font-black text-7xl md:text-9xl tracking-[0.12em] leading-none text-transparent bg-clip-text bg-gradient-to-b from-white via-slate-200 to-slate-500 uppercase will-change-transform"
            style={{ filter: 'drop-shadow(0 20px 40px rgba(0,0,0,0.8))' }}
          >
            AML
          </div>

          {/* WORD 2: DECODE */}
          <div 
            ref={wordDecodeRef}
            className="opacity-0 font-extrabold text-5xl md:text-7xl tracking-[0.25em] leading-tight text-transparent bg-clip-text bg-gradient-to-r from-amber-500 via-amber-200 to-amber-600 uppercase pl-[0.25em] mt-2 will-change-transform"
            style={{ filter: 'drop-shadow(0 10px 20px rgba(251,191,36,0.2))' }}
          >
            DECODE
          </div>

          {/* IMPACT FLARE EFFECT ACCENT */}
          <div 
            ref={flashOverlayRef}
            className="absolute top-[40%] left-[45%] w-24 h-24 bg-gradient-to-r from-amber-400 to-yellow-300 rounded-full blur-xl mix-blend-screen opacity-0 pointer-events-none z-30" 
          />

        </div>

        {/* VECTOR ANIMATED COMPLIANCE AGENT CHARACTER (Built with native SVG vectors) */}
        <div 
          ref={characterRef}
          className="absolute bottom-[15%] h-44 w-44 z-20 pointer-events-none opacity-0 will-change-transform flex items-center justify-center"
        >
          <svg className="w-full h-full drop-shadow-[0_15px_30px_rgba(0,0,0,0.7)]" viewBox="0 0 200 200" fill="none">
            {/* Investigator Trench Coat Back Outline */}
            <path d="M40 180 L60 80 L140 80 L160 180 Z" fill="#111827" stroke="#fbbf24" strokeWidth="2.5" />
            {/* Tactical High-collar Shield */}
            <path d="M70 80 L100 45 L130 80 Z" fill="#1f2937" stroke="#fbbf24" strokeWidth="2" />
            {/* Cybernetic Intelligence Glasses Grid */}
            <rect x="75" y="55" width="50" height="12" rx="4" fill="#fbbf24" className="animate-pulse" />
            <line x1="100" y1="55" x2="100" y2="67" stroke="#111827" strokeWidth="2" />
            {/* Left Hand Vector Node */}
            <circle cx="45" cy="110" r="10" fill="#374151" stroke="#fbbf24" strokeWidth="2" />
            {/* Right Hand Vector Node (The Hurl Node) */}
            <circle cx="155" cy="110" r="10" fill="#374151" stroke="#fbbf24" strokeWidth="2" />
            {/* Ambient Shadow Baseline */}
            <ellipse cx="100" cy="185" rx="40" ry="8" fill="rgba(0,0,0,0.5)" />
          </svg>
        </div>

      </div>

      {/* BOTTOM CROP MOVIE FRAME BAR */}
      <div className="absolute bottom-0 inset-x-0 h-14 bg-[#02050d] z-40 border-t border-white/[0.02] flex items-center px-8 justify-between text-[8px] tracking-[0.3em] text-slate-600 font-bold font-mono">
        <span></span>
        <span className="flex items-center gap-1.5 text-amber-500/70">
          <span className="h-1 w-1 rounded-full bg-amber-500 animate-ping" />
          
        </span>
      </div>

    </div>
  );
};

export default CinematicHero;