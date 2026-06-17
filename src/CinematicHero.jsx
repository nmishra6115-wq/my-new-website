import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const CinematicHero = () => {
  const sceneRef = useRef(null);
  const characterRef = useRef(null);
  const wordDecodeRef = useRef(null);
  const wordComplianceRef = useRef(null);
  const flashOverlayRef = useRef(null);

  useEffect(() => {
    // ---- INFINITE FOOTBALL KICK CHOREOGRAPHY ENGINE ----
    const playFootballLoop = () => {
      const footballTl = gsap.timeline({
        onComplete: () => {
          // Reset elements instantly and restart the animation loop automatically
          gsap.set([wordDecodeRef.current, wordComplianceRef.current], { x: 0, y: 300, scale: 0, opacity: 0, rotation: 0 });
          gsap.set(characterRef.current, { x: '-60vw', y: 0, rotation: 0, scale: 1, opacity: 1 });
          playFootballLoop();
        }
      });

      footballTl
        // 1. Initial State: Text modules are resting loose on the ground line like footballs
        .set([wordDecodeRef.current, wordComplianceRef.current], { y: 150, opacity: 0.3, scale: 0.6 })
        
        // 2. RUN UP: Character from image_5464e1.png sprints onto the field from the left side
        .to(characterRef.current, {
          x: '-15vw',
          duration: 0.8,
          ease: "power2.in",
          opacity: 1
        })
        
        // 3. THE KICK SLIDE: Character slides down slightly and leans back to strike the target hard
        .to(characterRef.current, {
          x: '-2vw',
          y: 40,
          rotation: -25,
          duration: 0.25,
          ease: "power3.out"
        })

        // 4. THE IMPACT IMPACT FLIGHT: The exact moment his boot strikes the words!
        // "DECODE" gets launched spinning into the center sky layer
        .to(wordDecodeRef.current, {
          x: 0,
          y: -40,
          scale: 1.4,
          rotation: 360,
          opacity: 1,
          duration: 0.45,
          ease: "expo.out"
        }, "-=0.05")
        // "COMPLIANCE" gets volleyed directly underneath it right after
        .to(wordComplianceRef.current, {
          x: 0,
          y: 40,
          scale: 1.1,
          rotation: -360,
          opacity: 1,
          duration: 0.5,
          ease: "expo.out"
        }, "-=0.35")

        // 5. FLASH EFFECT: Flash overlay lights up upon impact lock-in
        .fromTo(flashOverlayRef.current, 
          { opacity: 0, scale: 0.2 },
          { opacity: 1, scale: 3, duration: 0.1, ease: "power2.out" }, "-=0.4"
        )
        .to(flashOverlayRef.current, { opacity: 0, scale: 4, duration: 0.5, ease: "power1.inOut" })

        // 6. CELEBRATION & RESET: Character stands up, celebrates, and runs off-screen right
        .to(characterRef.current, { rotation: 0, y: 0, duration: 0.3, ease: "back.out(2)" })
        .to(characterRef.current, { x: '110vw', duration: 0.9, ease: "power2.in" }, "+=1.8");
    };

    // Initialize the loop engine sequence
    playFootballLoop();

    // SCROLL TIMELINE ZOOMS STRAIGHT THROUGH THE COMPOSITIONS ON SCROLL DOWN
    const scrollTl = gsap.timeline({
      scrollTrigger: {
        trigger: sceneRef.current,
        start: "top top",
        end: "+=120%",
        pin: true,
        pinSpacing: false,
        scrub: 1,
      }
    });

    scrollTl
      .to(".cinematic-stadium-vault", { z: 600, scale: 2.2, filter: "blur(20px)", opacity: 0, duration: 1 })
      .to(characterRef.current, { opacity: 0, scale: 0.2, y: 300, duration: 0.6 }, 0);

    return () => {
      ScrollTrigger.getAll().forEach(t => t.kill());
    };
  }, []);

  return (
    <div 
      ref={sceneRef} 
      className="relative w-full h-[100vh] bg-[#030611] overflow-hidden flex flex-col items-center justify-center select-none"
      style={{ perspective: '1200px' }}
    >
      
      {/* MATRIX FIELDS & STADIUM GRIDS */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none" 
           style={{ backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', backgroundSize: '70px 70px' }} />
      <div className="absolute inset-0 z-20 pointer-events-none bg-[radial-gradient(circle_at_center,transparent_20%,#030611_95%)]" />

      {/* CORE GRAPHIC FOOTBALL FIELD ARENA */}
      <div className="relative flex flex-col items-center justify-center w-full h-full max-w-7xl" style={{ transformStyle: 'preserve-3d' }}>
        
        {/* THE TARGET TEXT VAULT (Launched by the kick) */}
        <div className="cinematic-stadium-vault flex flex-col items-center justify-center text-center font-black relative z-10" style={{ transformStyle: 'preserve-3d' }}>
          
          <div 
            ref={wordDecodeRef}
            className="font-black text-7xl md:text-9xl tracking-[0.14em] leading-none text-transparent bg-clip-text bg-gradient-to-b from-white to-slate-400 uppercase will-change-transform"
            style={{ filter: 'drop-shadow(0 20px 40px rgba(0,0,0,0.9))' }}
          >
            DECODE
          </div>

          <div 
            ref={wordComplianceRef}
            className="font-extrabold text-5xl md:text-7xl tracking-[0.2em] leading-tight text-transparent bg-clip-text bg-gradient-to-r from-amber-500 to-yellow-500 uppercase mt-4 pl-[0.2em] will-change-transform"
            style={{ filter: 'drop-shadow(0 15px 30px rgba(251,191,36,0.3))' }}
          >
            COMPLIANCE
          </div>

          {/* BRIGHT RADIAL IMPACT OVERLAY */}
          <div 
            ref={flashOverlayRef}
            className="absolute top-[35%] left-[42%] w-36 h-36 bg-gradient-to-r from-amber-400 to-yellow-300 rounded-full blur-3xl mix-blend-screen opacity-0 pointer-events-none z-30" 
          />
        </div>

        {/* REPLICATED CHARACTER VECTOR ASSEMBLY FROM image_5464e1.png */}
        <div 
          ref={characterRef}
          className="absolute bottom-[12%] w-[160px] h-[240px] md:w-[180px] md:h-[270px] z-20 pointer-events-none will-change-transform flex items-center justify-center"
        >
          {/* High-fidelity procedural SVG map precisely recreating the visual parameters from image_5464e1.png */}
          <svg className="w-full h-full drop-shadow-[0_20px_35px_rgba(0,0,0,0.8)]" viewBox="0 0 200 300" fill="none">
            {/* Dark Spiky Hair Block */}
            <path d="M70 45 L60 20 L85 28 L100 12 L120 28 L140 22 L130 50 Z" fill="#4a2e2b" stroke="#311d1c" strokeWidth="1.5" />
            
            {/* Big Friendly Stylized Head & Ears */}
            <circle cx="65" cy="75" r="14" fill="#ffd1b3" /> {/* Left Ear */}
            <circle cx="135" cy="75" r="14" fill="#ffd1b3" /> {/* Right Ear */}
            <rect x="68" y="42" width="64" height="64" rx="28" fill="#ffe0cc" /> {/* Face Base */}
            
            {/* Giant Comic Expressive Cartoon Eyes */}
            <circle cx="82" cy="72" r="13" fill="#fff" />
            <circle cx="84" cy="72" r="6" fill="#5c3a21" /> {/* Pupil Left */}
            <circle cx="118" cy="72" r="13" fill="#fff" />
            <circle cx="116" cy="72" r="6" fill="#5c3a21" /> {/* Pupil Right */}
            
            {/* Expressive Thick Brows + Friendly Nose + Smile */}
            <path d="M70 54 Q82 48 92 55" stroke="#4a2e2b" strokeWidth="3" strokeLinecap="round" />
            <path d="M108 55 Q118 48 130 54" stroke="#4a2e2b" strokeWidth="3" strokeLinecap="round" />
            <path d="M96 72 L104 72 L98 84 Z" fill="#fcc4a1" /> {/* Angular Nose */}
            <path d="M90 92 Q100 98 110 92" stroke="#4a2e2b" strokeWidth="2.5" strokeLinecap="round" fill="none" /> {/* Smile */}
            
            {/* Slender Character Neck Line */}
            <rect x="96" y="104" width="8" height="18" fill="#ffe0cc" />
            
            {/* Bright Orange/Peach Open Hoodie Jacket */}
            <path d="M65 122 L135 122 L140 200 L60 200 Z" fill="#e07a5f" rx="8" /> {/* Jacket Body */}
            <path d="M74 122 L100 160 L126 122" fill="none" stroke="#f4a261" strokeWidth="4" /> {/* Collar Fold */}
            
            {/* Inner Yellow Core Shirt */}
            <path d="M82 122 L118 122 L114 195 L86 195 Z" fill="#f4a261" />
            
            {/* Fitted Dark Charcoal Slim Pants */}
            <rect x="76" y="200" width="22" height="90" rx="4" fill="#3d3a45" /> {/* Left Leg */}
            <rect x="102" y="200" width="22" height="90" rx="4" fill="#3d3a45" /> {/* Right Leg (The Kick Leg) */}
            
            {/* Contrast Waist Belt Strip */}
            <rect x="74" y="196" width="52" height="7" fill="#222" />
            <rect x="94" y="195" width="12" height="9" fill="#fff" stroke="#222" /> {/* Silver Buckle */}
          </svg>
        </div>

      </div>

      {/* FOOTER CROP */}
      <div className="absolute bottom-0 inset-x-0 h-14 bg-[#030611] z-40 border-t border-white/[0.02] flex items-center px-8 justify-between text-[8px] tracking-[0.3em] text-slate-600 font-bold font-mono">
        <span></span>
        <span>SCROLL FOR LEARNING</span>
      </div>

    </div>
  );
};

export default CinematicHero;