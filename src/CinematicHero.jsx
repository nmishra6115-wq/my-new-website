import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const CinematicHero = () => {
  const containerRef = useRef(null);
  const lightRayRef = useRef(null);
  const decodeTextRef = useRef(null);
  const complianceTextRef = useRef(null);

  useEffect(() => {
    const introTl = gsap.timeline();

    // 1. INITIAL ANIMATION: The cinematic lighting reveal
    introTl
      // Start completely dark, then snap a razor-thin golden light beam across the horizon
      .fromTo(lightRayRef.current, 
        { scaleX: 0, opacity: 0 }, 
        { scaleX: 1, opacity: 1, duration: 1.2, ease: "expo.inOut" }
      )
      // The light beam expands vertically, bleeding warm gold onto the massive editorial text
      .to(lightRayRef.current, { scaleY: 4, blur: 20, duration: 0.8, ease: "power2.out" })
      .fromTo([decodeTextRef.current, complianceTextRef.current],
        { opacity: 0, y: (i) => i === 0 ? 40 : -40, filter: "blur(15px)" },
        { opacity: 1, y: 0, filter: "blur(0px)", duration: 1.6, ease: "power4.out" },
        "-=0.6"
      )
      // Elegant fade-in for the sub-text and navigation prompt
      .fromTo(".editorial-subtext", 
        { opacity: 0 }, 
        { opacity: 0.5, duration: 1 }, 
        "-=0.4"
      );

    // 2. SCROLL ANIMATION: The Horizon Split
    const scrollTl = gsap.timeline({
      scrollTrigger: {
        trigger: containerRef.current,
        start: "top top",
        end: "+=100%",
        pin: true,
        pinSpacing: false,
        scrub: 1,
      }
    });

    scrollTl
      // As you scroll, DECODE slides up, COMPLIANCE slides down, pulling the horizon open
      .to(decodeTextRef.current, { y: "-30vh", opacity: 0, scale: 0.95, ease: "power1.inOut" }, 0)
      .to(complianceTextRef.current, { y: "30vh", opacity: 0, scale: 0.95, ease: "power1.inOut" }, 0)
      .to(lightRayRef.current, { scaleY: 0, opacity: 0, ease: "power1.in" }, 0)
      .to(".editorial-subtext", { opacity: 0, y: -50, ease: "power1.in" }, 0);

    return () => {
      ScrollTrigger.getAll().forEach(t => t.kill());
    };
  }, []);

  return (
    <div 
      ref={containerRef} 
      className="relative w-full h-[100vh] bg-[#020408] overflow-hidden flex flex-col items-center justify-center select-none z-10"
    >
      {/* THE MASTER HORIZON LIGHT BEAM */}
      <div 
        ref={lightRayRef}
        className="absolute w-[120%] h-[1.5px] bg-gradient-to-r from-transparent via-amber-500/40 to-transparent blur-[0.5px] z-10 pointer-events-none transform origin-center rotate-[-0.5deg]"
      />
      <div className="absolute w-[80%] h-[100px] bg-gradient-to-r from-transparent via-amber-500/[0.03] to-transparent blur-3xl z-0 pointer-events-none transform top-[45vh]" />

      {/* EDITORIAL TEXT WRAPPER */}
      <div className="flex flex-col items-center justify-center w-full max-w-7xl px-6 relative z-20 text-center font-serif">
        
        {/* UPPER TITLE: DECODE */}
        <h1 
          ref={decodeTextRef}
          className="font-black text-7xl md:text-11xl tracking-[0.2em] leading-[0.75] text-white uppercase font-sans pr-[-0.2em] will-change-transform"
          style={{ textShadow: '0 0 40px rgba(255,255,255,0.05)' }}
        >
          DECODE
        </h1>

        {/* RESTRAINED SUBTEXT PLACEHOLDER */}
        <div className="editorial-subtext my-12 max-w-md mix-blend-difference font-mono text-[10px] tracking-[0.4em] uppercase text-slate-400 transition-opacity duration-300">
          The Premium Financial Intelligence Academy
        </div>

        {/* LOWER TITLE: COMPLIANCE */}
        <h2 
          ref={complianceTextRef}
          className="font-extrabold text-4xl md:text-7xl tracking-[0.4em] text-transparent bg-clip-text bg-gradient-to-b from-amber-400 to-amber-600 uppercase font-sans pl-[0.4em] will-change-transform"
        >
          COMPLIANCE
        </h2>

      </div>

      {/* MINIMALIST CAPTION PROMPT */}
      <div className="editorial-subtext absolute bottom-12 left-12 font-mono text-[9px] tracking-[0.25em] text-slate-500 uppercase">
        [ Scroll to enter masterclass ]
      </div>
    </div>
  );
};

export default CinematicHero;