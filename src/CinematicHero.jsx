import React, { useEffect, useRef } from 'react';
import { Player } from '@lottiefiles/react-lottie-player';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const CinematicHero = () => {
  const heroRef = useRef(null);

  useEffect(() => {
    // GSAP Cinematic Scroll Timeline
    const cinematicTl = gsap.timeline({
      scrollTrigger: {
        trigger: heroRef.current,
        start: "top top",
        end: "+=120%",
        pin: true,
        pinSpacing: false,
        scrub: 1,
      }
    });

    // Elegant scroll transition: Elements slide out like an opening animated transition
    cinematicTl
      .to(".cartoon-character-stage", {
        scale: 0.8,
        y: -100,
        opacity: 0,
        duration: 1,
        ease: "power2.inOut"
      }, 0)
      .to(".cartoon-title-block", {
        y: -150,
        scale: 0.9,
        opacity: 0,
        duration: 1,
        ease: "power2.inOut"
      }, 0);

    return () => {
      ScrollTrigger.getAll().forEach(t => t.kill());
    };
  }, []);

  return (
    <div 
      ref={heroRef} 
      className="relative w-full h-[100vh] bg-[#060c21] overflow-hidden flex items-center justify-center px-6"
    >
      
      {/* VIBRANT ATMOSPHERIC BACKGROUND BLURS */}
      <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-emerald-500/10 rounded-full filter blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] bg-amber-500/10 rounded-full filter blur-[120px] pointer-events-none" />

      {/* BACKGROUND GRAPH GRID */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none" 
           style={{ backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', backgroundSize: '50px 50px' }} />

      {/* UNIFIED HERO GRID SYSTEM */}
      <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-12 gap-12 items-center z-10 relative">
        
        {/* LEFT COLUMN: BOLD CARTOON DISPLAY TEXT */}
        <div className="cartoon-title-block lg:col-span-7 space-y-6 text-center lg:text-left order-2 lg:order-1">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500/10 border-2 border-emerald-500/30 rounded-full">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[11px] font-black tracking-widest text-emerald-400 uppercase"></span>
          </div>

          <h1 className="text-5xl md:text-7xl font-black tracking-tight leading-none text-white uppercase select-none">
            DECODE <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-500 drop-shadow-[0_4px_12px_rgba(251,191,36,0.2)]">
              COMPLIANCE
            </span>
          </h1>

          <p className="text-slate-400 text-sm md:text-base font-medium max-w-xl font-mono leading-relaxed">
            Step straight into a live, interactive learning environment. Track financial crime trails, master standard regulatory frameworks, and secure direct tier-1 job networks.
          </p>

          {/* PULSING ACTION BUTTON */}
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
            <span className="text-[10px] font-black text-amber-400 uppercase tracking-[0.3em] bg-black/40 px-6 py-3 border-2 border-amber-500/20 rounded-xl backdrop-blur-md shadow-2xl">
               &darr;
            </span>
          </div>
        </div>

        {/* RIGHT COLUMN: THE CARTOON CHARACTER ANIMATION STAGE */}
    {/* RIGHT COLUMN: THE CARTOON CHARACTER ANIMATION STAGE */}
<div className="cartoon-character-stage lg:col-span-5 flex justify-center order-1 lg:order-2 relative group min-h-[350px] min-w-[300px]">
  
  {/* Decorative Glowing Backdrop Frame */}
  <div className="absolute inset-0 bg-gradient-to-tr from-emerald-500/10 to-amber-500/10 rounded-full filter blur-2xl scale-95 opacity-60 group-hover:opacity-80 transition-opacity duration-500" />
  
  {/* THE CARTOON CHARACTER PLAYER FRAME - Hardcoded sizing to prevent rendering collapse */}
  <div className="w-[320px] h-[320px] md:w-[420px] md:h-[420px] relative z-10 flex items-center justify-center transition-transform duration-500 group-hover:scale-105">
    <Player
      autoplay
      loop
      src="https://lottie.host/1715456b-fbd5-42a1-bdc2-f1d2df0f6580/QY6M8v12uA.json"
      className="w-full h-full object-contain"
      style={{ width: '100%', height: '100%' }}
    />
  </div>

</div>

      </div>

      {/* LOWER GRADIENT SHIELD */}
      <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-[#030712] to-transparent z-20 pointer-events-none" />
    </div>
  );
};

export default CinematicHero;