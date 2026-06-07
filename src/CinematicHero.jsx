import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const CinematicHero = () => {
  const containerRef = useRef(null);
  const viewportRef = useRef(null);

  useEffect(() => {
    // 1. THE RECURSIVE DIRECTORS TIMELINE
    const directorTl = gsap.timeline({
      scrollTrigger: {
        trigger: containerRef.current,
        start: "top top",
        end: "+=150%", // Long tracking shot depth
        pin: true,
        pinSpacing: false, // Smooth transition handover
        scrub: 1, // Locks camera velocity directly to trackpad fingers
      }
    });

    directorTl
      // Frame 1: Focus pull. The text drifts forward, spreading its characters outward
      .to(".camera-text-primary", {
        z: 300,
        scale: 1.4,
        letterSpacing: "0.4em",
        filter: "blur(10px)",
        opacity: 0,
        duration: 1,
        ease: "power2.in"
      }, 0)
      // Frame 2: The anchor line is crushed under the acceleration of the camera tracking past it
      .to(".camera-text-secondary", {
        z: 150,
        scale: 1.1,
        letterSpacing: "0.25em",
        filter: "blur(6px)",
        opacity: 0,
        duration: 0.8,
        ease: "power2.in"
      }, 0.1)
      // Frame 3: The interface gate flares open as the camera slices through the tracking marker lines
      .to(".hud-vector-blade-left", { x: "-60vw", opacity: 0, duration: 0.9, ease: "expo.inOut" }, 0)
      .to(".hud-vector-blade-right", { x: "60vw", opacity: 0, duration: 0.9, ease: "expo.inOut" }, 0)
      // Frame 4: Ambient volumetric smoke and noise variables dissolve
      .to(".cinematic-atmosphere-layer", {
        opacity: 0,
        background: "rgba(3, 7, 18, 1)", // Dims into clean background space
        duration: 1
      }, 0);

    // 2. PARALLAX DRIFT (Subtle structural inertia mimicking a camera crane movement)
    const runCameraSway = (e) => {
      const scaleX = (e.clientX - window.innerWidth / 2) / window.innerWidth;
      const scaleY = (e.clientY - window.innerHeight / 2) / window.innerHeight;

      gsap.to(".cinematic-camera-lens-rig", {
        x: scaleX * 45,
        y: scaleY * 45,
        rotationY: scaleX * 8,
        rotationX: -scaleY * 8,
        duration: 1.5,
        ease: "power1.out"
      });
    };

    window.addEventListener('mousemove', runCameraSway);
    return () => {
      window.removeEventListener('mousemove', runCameraSway);
      ScrollTrigger.getAll().forEach(t => t.kill());
    };
  }, []);

  return (
    <div 
      ref={containerRef} 
      className="relative w-full h-[100vh] bg-[#02040a] overflow-hidden flex items-center justify-center select-none"
      style={{ perspective: '1200px' }}
    >
      
      {/* ATMOSPHERIC LAYER 1: ANAMORPHIC FLARES AND VOLUMETRIC GRAIN */}
      <div className="cinematic-atmosphere-layer absolute inset-0 z-10 pointer-events-none transition-all duration-300 bg-[radial-gradient(circle_at_center,rgba(251,191,36,0.06)_0%,transparent_70%)] mix-blend-screen" />
      <div className="absolute inset-0 z-20 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.4)_50%)] bg-[size:100%_4px] opacity-20" />

      {/* HORIZONTAL ANAMORPHIC STREAK ARTIFACT */}
      <div className="absolute top-[48vh] inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-amber-500/30 to-transparent blur-[1px] z-10 pointer-events-none transform -rotate-1" />

      {/* DYNAMIC CAM RIG ENGINE CONTAINER */}
      <div 
        ref={viewportRef}
        className="cinematic-camera-lens-rig absolute inset-0 flex flex-col items-center justify-center w-full h-full z-10"
        style={{ transformStyle: 'preserve-3d' }}
      >
        
        {/* STRUCTURAL CORE GRAPH TRACKING LINES */}
        <div className="absolute w-[450px] h-[450px] border border-amber-500/[0.03] rounded-full z-0 pointer-events-none animate-spin-slow" />
        <div className="absolute w-[650px] h-[650px] border border-dashed border-amber-500/[0.015] rounded-full z-0 pointer-events-none animate-spin-reverse" />

        <div className="hero-core-moving-wrapper flex flex-col items-center justify-center text-center relative" style={{ transformStyle: 'preserve-3d' }}>
          
          {/* CAMERA TEXT ELEMENT 1: PRIMARY MATRIX STRING */}
          <h1 
            className="camera-text-primary font-black text-7xl md:text-9xl tracking-[0.15em] leading-none text-transparent bg-clip-text bg-gradient-to-b from-white via-slate-300 to-slate-600 mb-2 uppercase"
            style={{ 
              filter: 'drop-shadow(0 20px 50px rgba(0,0,0,0.9))',
              willChange: 'transform, filter, opacity, letter-spacing'
            }}
          >
            DECODE
          </h1>

          {/* CAMERA TEXT ELEMENT 2: SECONDARY FOCUS ANCHOR */}
          <h2 
            className="camera-text-secondary font-extrabold text-3xl md:text-5xl tracking-[0.4em] text-transparent bg-clip-text bg-gradient-to-r from-amber-500 via-amber-200 to-amber-600 uppercase pl-[0.4em]"
            style={{ 
              filter: 'drop-shadow(0 10px 20px rgba(251,191,36,0.15))',
              willChange: 'transform, filter, opacity, letter-spacing'
            }}
          >
            COMPLIANCE
          </h2>

          {/* BRIDGE UNIT SIGNIFIER */}
          <div className="scroll-explore-arrow flex flex-col items-center gap-2 mt-16 opacity-40">
            <span className="text-[9px] font-black text-amber-400 uppercase tracking-[0.4em] bg-black/60 px-5 py-2.5 border border-white/5 rounded-full backdrop-blur-md">
              Start Learning
            </span>
            <svg className="w-4 h-4 text-amber-500 animate-bounce mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 13l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </div>

        </div>

      </div>

      {/* HISTORIC HUD MECHANICAL GATE BLADES */}
      <div className="absolute inset-y-0 left-0 w-[50vw] bg-gradient-to-r from-[#02040a] via-[#02040a]/95 to-transparent z-30 hud-vector-blade-left pointer-events-none border-r border-amber-500/[0.02]" />
      <div className="absolute inset-y-0 right-0 w-[50vw] bg-gradient-to-l from-[#02040a] via-[#02040a]/95 to-transparent z-30 hud-vector-blade-right pointer-events-none border-l border-amber-500/[0.02]" />

      {/* MATRIX FRAME BOUNDARY BARS */}
      <div className="absolute top-0 inset-x-0 h-12 bg-[#02040a] z-40 border-b border-white/[0.02] flex items-center px-8 justify-between text-[8px] tracking-[0.25em] text-slate-600 font-bold font-mono">
        <span></span>
        <span></span>
      </div>
      <div className="absolute bottom-0 inset-x-0 h-12 bg-[#02040a] z-40 border-t border-white/[0.02] flex items-center px-8 justify-between text-[8px] tracking-[0.25em] text-slate-600 font-bold font-mono">
        <span></span>
        <span></span>
      </div>

    </div>
  );
};

export default CinematicHero;