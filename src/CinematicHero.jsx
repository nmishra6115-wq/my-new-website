import React, { useEffect, useRef } from 'react';
import { Player } from '@lottiefiles/react-lottie-player';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const CinematicHero = () => {
  const sceneRef = useRef(null);
  const characterContainerRef = useRef(null);
  const lottiePlayerRef = useRef(null);
  const wordAmlRef = useRef(null);
  const wordDecodeRef = useRef(null);
  const flashOverlayRef = useRef(null);

  useEffect(() => {
    // Master timeline function to handle continuous looping
    const playChoreographyLoop = () => {
      const loopTl = gsap.timeline({
        onComplete: () => {
          // Reset states cleanly and trigger the loop again seamlessly
          gsap.set([wordAmlRef.current, wordDecodeRef.current], { x: 0, y: 0, scale: 0, opacity: 0, rotation: 0 });
          gsap.set(characterContainerRef.current, { x: 0, y: 0, rotation: 0, opacity: 1 });
          playChoreographyLoop();
        }
      });

      loopTl
        // PHASE 1: Character arrives running into center frame from off-screen
        .fromTo(characterContainerRef.current, 
          { x: '-100vw', y: 50, opacity: 0 },
          { x: '-20vw', y: 50, opacity: 1, duration: 1.2, ease: "power2.out" }
        )
        
        // PHASE 2: "Gathering" the scattered text fragments
        // Word 1 (AML) drops down into his hands
        .to(wordAmlRef.current, { opacity: 1, scale: 0.8, x: '-20vw', y: -20, duration: 0.4, ease: "back.out(1.7)" })
        // Character sprints over to the right side to intercept DECODE
        .to(characterContainerRef.current, { x: '20vw', duration: 0.8, ease: "power1.inOut" }, "+=0.1")
        .to(wordAmlRef.current, { x: '20vw', duration: 0.8, ease: "power1.inOut" }, "-=0.8")
        // Word 2 (DECODE) gets collected
        .to(wordDecodeRef.current, { opacity: 1, scale: 0.8, x: '20vw', y: 20, duration: 0.4, ease: "back.out(1.7)" })

        // PHASE 3: THE HOLLYWOOD WIND-UP & THROW
        // Character pulls back to throw
        .to(characterContainerRef.current, { x: '5vw', y: 80, rotation: -15, duration: 0.5, ease: "power2.out" })
        .to([wordAmlRef.current, wordDecodeRef.current], { x: '5vw', duration: 0.5, ease: "power2.out" }, "-=0.5")
        
        // The release: Character launches them to the dead center!
        .to(characterContainerRef.current, { x: '25vw', y: 20, rotation: 25, duration: 0.2, ease: "power3.out" })
        .to(wordAmlRef.current, { x: 0, y: -40, scale: 1.3, rotation: 360, duration: 0.6, ease: "expo.out" }, "-=0.2")
        .to(wordDecodeRef.current, { x: 0, y: 40, scale: 1.1, rotation: -360, duration: 0.6, ease: "expo.out" }, "-=0.6")

        // PHASE 4: IMPACT IMPACT FLARE
        .fromTo(flashOverlayRef.current, 
          { opacity: 0, scale: 0.2 },
          { opacity: 1, scale: 2.5, duration: 0.15, ease: "power2.out" }, "-=0.4"
        )
        .to(flashOverlayRef.current, { opacity: 0, scale: 4, duration: 0.8, ease: "power2.out" })
        
        // Character walks back off-screen into the shadow lines to reset scene sequence
        .to(characterContainerRef.current, { x: '110vw', opacity: 0, duration: 1.2, ease: "power2.in" }, "+=1.5");
    };

    // Initialize the continuous loop sequence
    playChoreographyLoop();

    // ---- EXTENDED ZOOM OUT ON SCROLL PATH ----
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
      .to(".cinematic-text-vault", { z: 500, scale: 2, filter: "blur(20px)", opacity: 0, duration: 1 })
      .to(characterContainerRef.current, { opacity: 0, scale: 0.3, duration: 0.5 }, 0);

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
      
      {/* GRAPH LINES BACKGROUND */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none" 
           style={{ backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', backgroundSize: '60px 60px' }} />
      
      <div className="absolute inset-0 z-20 pointer-events-none bg-[radial-gradient(circle_at_center,transparent_30%,#02050d_95%)]" />

      {/* CORE HORIZON INTERACTIVE ASSEMBLY */}
      <div className="relative flex flex-col items-center justify-center w-full h-full max-w-7xl" style={{ transformStyle: 'preserve-3d' }}>
        
        {/* TEXT OBJECT VAULT */}
        <div className="cinematic-text-vault flex flex-col items-center justify-center text-center font-black relative z-10" style={{ transformStyle: 'preserve-3d' }}>
          <div 
            ref={wordAmlRef}
            className="opacity-0 font-black text-7xl md:text-9xl tracking-[0.15em] leading-none text-transparent bg-clip-text bg-gradient-to-b from-white to-slate-400 uppercase will-change-transform"
          >
            DECODE
          </div>

          <div 
            ref={wordDecodeRef}
            className="opacity-0 font-extrabold text-5xl md:text-7xl tracking-[0.2em] leading-tight text-transparent bg-clip-text bg-gradient-to-r from-amber-500 to-yellow-500 uppercase mt-4 will-change-transform"
          >
            COMPLIANCE
          </div>

          {/* RADIANT BLAST FLARE */}
          <div 
            ref={flashOverlayRef}
            className="absolute top-[35%] left-[40%] w-32 h-32 bg-amber-400 rounded-full blur-2xl mix-blend-screen opacity-0 pointer-events-none z-30" 
          />
        </div>

        {/* HIGH FIDELITY HUMAN CHARACTER PLAYER CONTAINER */}
        <div 
          ref={characterContainerRef}
          className="absolute bottom-[10%] w-[180px] h-[180px] md:w-[240px] md:h-[240px] z-20 pointer-events-none will-change-transform flex items-center justify-center"
        >
          <Player
            ref={lottiePlayerRef}
            autoplay
            loop
            // Premium hand-drawn styled human character action cycle
            src="https://assets5.lottiefiles.com/packages/lf20_0g76vsc8.json"
            className="w-full h-full object-contain"
            style={{ width: '100%', height: '100%' }}
          />
        </div>

      </div>

      {/* SUB-BAR PANEL HEADER */}
      <div className="absolute bottom-0 inset-x-0 h-14 bg-[#02050d] z-40 border-t border-white/[0.02] flex items-center px-8 justify-between text-[8px] tracking-[0.3em] text-slate-600 font-bold font-mono">
        <span></span>
        <span></span>
      </div>

    </div>
  );
};

export default CinematicHero;