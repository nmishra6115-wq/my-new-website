import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const CinematicHero = () => {
  const containerRef = useRef(null);
  const matrixCanvasRef = useRef(null);
  const perspectiveWrapperRef = useRef(null);

  useEffect(() => {
    // 1. IMMERSIVE PERSPECTIVE TRACKING (Mouse Tilt)
    const handleSpatialTilt = (e) => {
      const { clientX, clientY } = e;
      const moveX = (clientX - window.innerWidth / 2) / (window.innerWidth / 2);
      const moveY = (clientY - window.innerHeight / 2) / (window.innerHeight / 2);

      // Tilts the entire central architecture in 3D space based on mouse physics
      gsap.to(perspectiveWrapperRef.current, {
        rotateY: moveX * 12,
        rotateX: -moveY * 12,
        duration: 0.8,
        ease: "power2.out"
      });

      // Ambient counter-drift for background depth
      gsap.to(matrixCanvasRef.current, {
        x: -moveX * 25,
        y: -moveY * 25,
        duration: 1.2,
        ease: "power1.out"
      });
    };

    window.addEventListener('mousemove', handleSpatialTilt);

    // 2. THE CHRONO-SCROLL HORIZON WARP (Timeline)
    const scrollTl = gsap.timeline({
      scrollTrigger: {
        trigger: containerRef.current,
        start: "top top",
        end: "+=130%",
        pin: true,
        pinSpacing: false,
        scrub: 1.2,
      }
    });

    scrollTl
      // Compress track spacing while pulling elements away in Z-depth
      .to(".cinematic-core-title", {
        transformPerspective: 1200,
        rotateX: 45, // Tilts backward into the screen horizon
        scale: 0.65,
        letterSpacing: "-0.05em",
        filter: "blur(12px)",
        opacity: 0,
        y: -100,
        duration: 1,
        ease: "power2.inOut"
      }, 0)
      // The bridge component stretches down into the grid canvas as it vanishes
      .to(".cinematic-bridge-tag", {
        scaleY: 1.5,
        letterSpacing: "0.5em",
        opacity: 0,
        y: 80,
        duration: 0.8,
        ease: "power1.in"
      }, 0)
      // Background space grid collapses inward toward the center focus point
      .to(matrixCanvasRef.current, {
        opacity: 0,
        scale: 0.8,
        duration: 1,
        ease: "power2.inOut"
      }, 0);

    // 3. FLUID DATA NET BACKGROUND (Canvas Engine)
    const canvas = matrixCanvasRef.current;
    const ctx = canvas.getContext('2d');
    let dynamicStreams = [];

    const adjustCanvasFrames = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    const buildTelemetryClusters = () => {
      dynamicStreams = Array.from({ length: 25 }, () => ({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        length: Math.random() * 120 + 60,
        speed: Math.random() * 1.5 + 0.5,
        opacity: Math.random() * 0.4 + 0.1,
        width: Math.random() * 1.5 + 0.5
      }));
    };

    const drawTelemetryHorizon = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Structural target crosshair background guidelines
      ctx.strokeStyle = 'rgba(251, 191, 36, 0.03)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(canvas.width / 2, 0); ctx.lineTo(canvas.width / 2, canvas.height);
      ctx.moveTo(0, canvas.height / 2); ctx.lineTo(canvas.width, canvas.height / 2);
      ctx.stroke();

      // Rendering structural light vectors flowing vertically downwards
      dynamicStreams.forEach((stream) => {
        stream.y += stream.speed;
        if (stream.y > canvas.height) {
          stream.y = -stream.length;
          stream.x = Math.random() * canvas.width;
        }

        const gradient = ctx.createLinearGradient(stream.x, stream.y, stream.x, stream.y + stream.length);
        gradient.addColorStop(0, 'transparent');
        gradient.addColorStop(0.5, `rgba(251, 191, 36, ${stream.opacity})`);
        gradient.addColorStop(1, 'transparent');

        ctx.strokeStyle = gradient;
        ctx.lineWidth = stream.width;
        ctx.beginPath();
        ctx.moveTo(stream.x, stream.y);
        ctx.lineTo(stream.x, stream.y + stream.length);
        ctx.stroke();
      });

      requestAnimationFrame(drawTelemetryHorizon);
    };

    window.addEventListener('resize', adjustCanvasFrames);
    adjustCanvasFrames(); buildTelemetryClusters(); drawTelemetryHorizon();

    // 4. CHRONO SEQUENTIAL GRID PARTITION TRIGGER
    const revealTl = gsap.timeline({ repeat: -1, yoyo: true, repeatDelay: 2.5 });
    revealTl.to(".cinematic-grid-blade", {
      scaleX: 0,
      opacity: 0,
      duration: 1.4,
      ease: "power4.inOut",
      stagger: { amount: 0.8, from: "start" }
    });

    return () => {
      window.removeEventListener('resize', adjustCanvasFrames);
      window.removeEventListener('mousemove', handleSpatialTilt);
      ScrollTrigger.getAll().forEach(t => t.kill());
    };
  }, []);

  return (
    <div 
      className="hero-visual-container relative w-full h-[100vh] overflow-hidden bg-[#01040a] flex flex-col justify-between" 
      ref={containerRef}
      style={{ perspective: '1000px' }}
    >
      
      {/* BACKGROUND GRAPH VECTORS */}
      <canvas ref={matrixCanvasRef} className="absolute inset-0 z-0 pointer-events-none opacity-50 scale-105" />

      {/* STRATIFIED VIEWPORT INTERFERENCE FRAMES */}
      <div className="absolute inset-x-0 top-0 h-[20vh] bg-gradient-to-b from-[#01040a] to-transparent z-20 pointer-events-none" />
      <div className="absolute inset-x-0 bottom-0 h-[25vh] bg-gradient-to-t from-[#030712] to-transparent z-20 pointer-events-none" />

      {/* THE 3D MOVEMENT CANVAS */}
      <div 
        ref={perspectiveWrapperRef} 
        className="absolute inset-0 flex flex-col items-center justify-center z-10 w-full h-full"
        style={{ transformStyle: 'preserve-3d' }}
      >
        
        <div className="hero-core-moving-wrapper flex flex-col items-center justify-center text-center relative select-none">
          
          {/* COLOSSAL ARCHITECTURAL TYPOGRAPHY */}
          <h1 
            className="cinematic-core-title font-black text-7xl md:text-9xl tracking-[-0.02em] leading-[0.9] text-transparent bg-clip-text bg-gradient-to-b from-white via-slate-200 to-slate-500"
            style={{ 
              filter: 'blur(0.2px) drop-shadow(0 30px 60px rgba(0,0,0,0.9))',
              transformStyle: 'preserve-3d'
            }}
          >
            DECODE<br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-amber-200 to-amber-500 font-extrabold tracking-[0.04em]">
              COMPLIANCE
            </span>
          </h1>

          {/* SUSPENDED INTERACTIVE CONTROLLER REVEALER */}
          <div className="cinematic-bridge-tag flex flex-col items-center gap-3 mt-16 pointer-events-none">
            <div className="text-[10px] font-bold text-amber-500 uppercase tracking-[0.45em] bg-black/40 px-6 py-3 border border-amber-500/10 rounded-xl backdrop-blur-md shadow-2xl relative overflow-hidden">
              Explore Learning
              <div className="absolute bottom-0 left-0 h-[1px] w-full bg-gradient-to-r from-transparent via-amber-400 to-transparent animate-pulse" />
            </div>
            <svg className="w-4 h-4 text-amber-500 opacity-60 animate-bounce mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 13l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </div>

        </div>

      </div>

      {/* HORIZONTAL SYSTEM PARTITIONS SHUTTER BLADES */}
      <div className="absolute inset-0 z-30 pointer-events-none flex flex-col h-full w-full">
        {[...Array(6)].map((_, i) => (
          <div 
            key={i} 
            className="cinematic-grid-blade flex-grow w-full bg-[#01040a] border-b border-white/[0.01] origin-left"
            style={{ 
              boxShadow: '0 4px 30px rgba(0, 0, 0, 0.4)'
            }}
          />
        ))}
      </div>

      {/* AMBIENT SCREEN EDGE TINT */}
      <div className="absolute inset-0 border-[24px] border-[#01040a] z-40 pointer-events-none opacity-40 mix-blend-multiply" />
    </div>
  );
};

export default CinematicHero;