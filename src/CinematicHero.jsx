import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const CinematicHero = () => {
  const containerRef = useRef(null);
  const textSuiteRef = useRef(null);

  useEffect(() => {
    // 1. INTRO TRANSITION: Smooth cinematic fade-in on page load
    gsap.fromTo(textSuiteRef.current,
      { scale: 0.8, opacity: 0, filter: "blur(20px)" },
      { scale: 1, opacity: 1, filter: "blur(0px)", duration: 1.4, ease: "power3.out" }
    );

    // 2. SCROLL TIMELINE: Deep macro camera push through the typography
    const scrollTl = gsap.timeline({
      scrollTrigger: {
        trigger: containerRef.current,
        start: "top top",
        end: "+=120%",
        pin: true,
        pinSpacing: false,
        scrub: 1,
      }
    });

    scrollTl.to(textSuiteRef.current, { 
      z: 800, 
      scale: 2.5, 
      filter: "blur(30px)", 
      opacity: 0, 
      duration: 1,
      ease: "power2.inOut"
    });

    return () => {
      ScrollTrigger.getAll().forEach(t => t.kill());
    };
  }, []);

  return (
    <div 
      ref={containerRef} 
      className="relative w-full h-[100vh] bg-[#020408] overflow-hidden flex flex-col items-center justify-center select-none"
      style={{ perspective: '1000px' }}
    >
      {/* BACKGROUND MATRIX GRID */}
      <div className="absolute inset-0 opacity-[0.02] pointer-events-none bg-[linear-gradient(90deg,rgba(255,255,255,0.1)_1px,transparent_1px)] bg-[size:40px_100%]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_40%,#020408_95%)] z-10 pointer-events-none" />

      {/* CORE TYPOGRAPHY CONTAINER */}
      <div ref={textSuiteRef} className="flex flex-col items-center justify-center text-center font-black relative z-30" style={{ transformStyle: 'preserve-3d' }}>
        <h1 className="font-black text-8xl md:text-11xl tracking-tight leading-none text-transparent bg-clip-text bg-gradient-to-b from-white via-slate-200 to-slate-500 uppercase">
          DECODE
        </h1>
        <h2 className="font-extrabold text-4xl md:text-6xl tracking-[0.35em] text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-yellow-600 uppercase mt-2 pl-[0.35em]">
          COMPLIANCE
        </h2>
      </div>

      {/* FIXED CINEMATIC FOOTER PANEL */}
      <div className="absolute bottom-0 inset-x-0 h-14 bg-[#020408] z-40 border-t border-white/[0.02] flex items-center px-8 justify-between text-[8px] tracking-[0.3em] text-slate-600 font-bold font-mono">
        <span></span>
        <span></span>
      </div>
    </div>
  );
};

export default CinematicHero;