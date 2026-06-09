import React, { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const CinematicHero = () => {
  const cameraRigRef = useRef(null);
  const atmosphereRef = useRef(null);
  const portalCanvasRef = useRef(null);
  const [telemetry, setTelemetry] = useState({ camIndex: 'CHRONO_TRACKER_V.2026', nodesIndex: 0 });

  useEffect(() => {
    // 1. THE RECURSIVE DIRECTORS TIMELINE: A Continuous Hollywood macro-lens camera push
    const cinematicTl = gsap.timeline({
      scrollTrigger: {
        trigger: cameraRigRef.current,
        start: "top top",
        end: "+=160%", // Extended chronological depth
        pin: true,
        pinSpacing: false, // Cuts hard to the next section Hand-off
        scrub: 1.2, // The camera tracks precisely with your scroll speed
      }
    });

    cinematicTl
      // Frame 1: Focus Pull. Primary colossal letters float forward, expanding outward
      .to(".colossal-macro-text", {
        z: 350,
        scale: 1.5,
        letterSpacing: "0.5em",
        filter: "blur(12px)",
        opacity: 0,
        duration: 1,
        ease: "power2.inOut"
      }, 0)
      // Frame 2: Horizon Warps. Secondary anchor compresses inward under camera acceleration
      .to(".colossal-secondary-text", {
        z: 180,
        scale: 1.15,
        letterSpacing: "-0.01em",
        filter: "blur(7px)",
        opacity: 0,
        duration: 0.8,
        ease: "power2.in"
      }, 0.1)
      // Frame 3: Interface Breach. Tracking reticles are pulled straight apart by the camera force
      .to(".cinematic-shutter-reticle-left", { x: "-55vw", opacity: 0, duration: 1, ease: "expo.in" }, 0.1)
      .to(".cinematic-shutter-reticle-right", { x: "55vw", opacity: 0, duration: 1, ease: "expo.in" }, 0.1)
      // Frame 4: Data Dissolve. Volumetric noise and glowing streaks fade out as the scene resolves
      .to(".atmosphere-data-streaks", { opacity: 0, scaleY: 0, duration: 0.6, ease: "power1.in" }, 0.4)
      .to(atmosphereRef.current, {
        opacity: 0,
        scale: 1.2,
        duration: 1,
        ease: "power1.inOut"
      }, 0);

    // 2. ATMOSPHERIC DRIFT (Parallax sway on mouse movement)
    const runCameraSway = (e) => {
      const scaleX = (e.clientX - window.innerWidth / 2) / (window.innerWidth / 2);
      const scaleY = (e.clientY - window.innerHeight / 2) / (window.innerHeight / 2);

      gsap.to(".cinematic-camera-lens-assembly", {
        x: scaleX * 45,
        y: scaleY * 45,
        rotateY: scaleX * 9,
        rotateX: -scaleY * 9,
        duration: 1.6,
        ease: "power1.out"
      });
    };
    window.addEventListener('mousemove', runCameraSway);

    // 3. FLUID DIGITAL DATA FIELD (Canvas Logic for real-time streaks)
    const canvas = portalCanvasRef.current;
    const ctx = canvas.getContext('2d');
    let matrixNodes = [];
    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    const buildNodes = () => {
      matrixNodes = Array.from({ length: 30 }, () => ({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        length: Math.random() * 150 + 50,
        velocity: Math.random() * 1.5 + 0.5,
        opacity: Math.random() * 0.4 + 0.05
      }));
    };

    const drawAtmosphericHorizon = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      // Continuous vertically flowing light strings
      matrixNodes.forEach((node) => {
        node.y += node.velocity;
        if (node.y > canvas.height) {
          node.y = -node.length;
          node.x = Math.random() * canvas.width;
        }

        const gradient = ctx.createLinearGradient(node.x, node.y, node.x, node.y + node.length);
        gradient.addColorStop(0, 'transparent');
        gradient.addColorStop(0.5, `rgba(251, 191, 36, ${node.opacity})`);
        gradient.addColorStop(1, 'transparent');

        ctx.strokeStyle = gradient;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(node.x, node.y);
        ctx.lineTo(node.x, node.y + node.length);
        ctx.stroke();
      });
      requestAnimationFrame(drawAtmosphericHorizon);
    };

    window.addEventListener('resize', resize);
    resize(); buildNodes(); drawAtmosphericHorizon();

    // 4. CHRONO INTERFACE GRID Reveal trigger cycle
    const tl = gsap.timeline({ repeat: -1, yoyo: true, repeatDelay: 2.5 });
    tl.to(".shutter-blade-grid-panel", {
      scaleY: 0,
      opacity: 0,
      duration: 1.6,
      ease: "power4.inOut",
      stagger: { amount: 1.2, from: "start" }
    });

    return () => {
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', runCameraSway);
      ScrollTrigger.getAll().forEach(t => t.kill());
    };
  }, []);

  return (
    <div 
      ref={cameraRigRef} 
      className="relative w-full h-[100vh] bg-[#02040a] overflow-hidden flex flex-col justify-between"
      style={{ perspective: '1500px' }}
    >
      
      {/* ATMOSPHERIC LENS FIELD (Canvas Data Streaks + Vignette) */}
      <canvas ref={portalCanvasRef} className="atmosphere-data-streaks absolute inset-0 z-0 pointer-events-none opacity-60 scale-105" />
      
      {/* SCOPE LENS OVERLAYS (Anamorphic artifacts + Noise Shield) */}
      <div ref={atmosphereRef} className="absolute inset-0 z-20 pointer-events-none bg-[radial-gradient(circle_at_center,transparent_30%,rgba(2,4,10,0.85)_85%)] mix-blend-screen" />
      <div className="absolute inset-0 z-20 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.4)_50%)] bg-[size:100%_4px] opacity-[0.2]" />
      <div className="absolute top-[48vh] inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-amber-500/25 to-transparent blur-[1.5px] z-10 pointer-events-none transform -rotate-1 scale-x-110" />

      {/* MATRIX FRAME BOUNDARY BARS (Movie Crop Lines) */}
      <div className="absolute top-0 inset-x-0 h-14 bg-[#02040a] z-40 border-b border-white/[0.02] flex items-center px-8 justify-between text-[8px] tracking-[0.3em] text-slate-600 font-bold font-mono">
        <span></span>
        <span className="text-amber-500/70 font-black animate-pulse">MATRIX_TELEMETRY // LIVE</span>
      </div>
      <div className="absolute bottom-0 inset-x-0 h-14 bg-[#02040a] z-40 border-t border-white/[0.02] flex items-center px-8 justify-between text-[8px] tracking-[0.3em] text-slate-600 font-bold font-mono">
        <span>{telemetry.camIndex}</span>
        <span></span>
      </div>

      {/* THE HOLLYWOOD SPATIAL LENS ASSEMBLY */}
      <div 
        className="cinematic-camera-lens-assembly absolute inset-0 flex flex-col items-center justify-center w-full h-full z-10"
        style={{ transformStyle: 'preserve-3d' }}
      >
        
        {/* STRUCTURAL SCOPE TRACKING RETICLES */}
        <div className="absolute w-[500px] h-[500px] border border-amber-500/[0.025] rounded-full z-0 pointer-events-none animate-spin-slow" />
        <div className="absolute w-[700px] h-[700px] border border-dashed border-amber-500/[0.015] rounded-full z-0 pointer-events-none animate-spin-reverse" />

        <div className="flex flex-col items-center justify-center text-center relative select-none px-4" style={{ transformStyle: 'preserve-3d' }}>
          
          {/* PRIMARY COLOSSAL ARCHITECTURAL TYPOGRAPHY */}
          <h1 
            className="colossal-macro-text font-black text-7xl md:text-9xl tracking-[0.16em] leading-none text-transparent bg-clip-text bg-gradient-to-b from-white via-slate-200 to-slate-600 mb-2 uppercase"
            style={{ 
              filter: 'drop-shadow(0 0 16px rgba(251, 191, 36, 0.15)) drop-shadow(0 30px 60px rgba(0,0,0,0.95))',
              transformStyle: 'preserve-3d',
              willChange: 'transform, filter, letter-spacing'
            }}
          >
            DECODE
          </h1>

          {/* SECONDARY HORIZON ANCHOR TAG */}
          <h2 
            className="colossal-secondary-text font-extrabold text-3xl md:text-5xl tracking-[0.45em] leading-tight text-transparent bg-clip-text bg-gradient-to-r from-amber-500 via-amber-200 to-amber-600 uppercase pl-[0.45em]"
            style={{ 
              filter: 'drop-shadow(0 10px 20px rgba(251,191,36,0.15))',
              transformStyle: 'preserve-3d',
              willChange: 'transform, filter, letter-spacing'
            }}
          >
            COMPLIANCE
          </h2>

          {/* SUSPENDED INTERFACE BRIDGE علامت */}
          <div className="scroll-explore-arrow flex flex-col items-center gap-2.5 mt-20 opacity-40">
            <span className="text-[9px] font-black text-amber-400 uppercase tracking-[0.4em] bg-black/50 px-6 py-3 border border-white/5 rounded-full backdrop-blur-md relative overflow-hidden">
              Start Learning
              <div className="absolute bottom-0 left-0 h-[1px] w-full bg-gradient-to-r from-transparent via-amber-400 to-transparent" />
            </div>
            <svg className="w-4 h-4 text-amber-500 animate-bounce mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 13l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </div>

        </div>

      </div>

      {/* MECHANICAL HUD Vector Shutters (Cuts scene to hand-off next section) */}
      <div className="cinematic-shutter-reticle-left absolute inset-y-0 left-0 w-[50vw] bg-gradient-to-r from-[#02040a] via-[#02040a]/95 to-transparent z-30 pointer-events-none border-r border-amber-500/[0.02]" />
      <div className="cinematic-shutter-reticle-right absolute inset-y-0 right-0 w-[50vw] bg-gradient-to-l from-[#02040a] via-[#02040a]/95 to-transparent z-30 pointer-events-none border-l border-amber-500/[0.02]" />

    </div>
  );
};

export default CinematicHero;