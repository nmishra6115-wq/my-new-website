import React, { useState, useEffect } from 'react';
import { notesContent } from './content';
import { jobOpenings } from './jobs';
import { kycNews } from './news';

const NewsSkeleton = () => (
  <div className="block p-6 bg-slate-900 border border-white/5 rounded animate-pulse">
    <div className="h-4 bg-slate-800 rounded w-full mb-4"></div>
    <div className="h-4 bg-slate-800 rounded w-2/3"></div>
  </div>
);

export default function App() {
  const [activeView, setActiveView] = useState(null);
  const [pageIndex, setPageIndex] = useState(0);
  const [isMuted, setIsMuted] = useState(true);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [submissions, setSubmissions] = useState([]);
  const [partnerFiles, setPartnerFiles] = useState([]);
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  // List of all navigation items
  const navItems = ['NOTES', 'JOBS', 'SUBMIT REFERRAL', 'AVAILABLE REFERRAL', 'RECRUITER DASHBOARD', 'DIRECT RECRUITER JOBS'];

  return (
    <div className="text-slate-100 font-mono min-h-screen flex flex-col relative bg-[#030712]">
      
      {/* NAVIGATION */}
      <nav className="p-6 border-b border-emerald-500/30 flex items-center justify-between sticky top-0 bg-[#030712]/90 backdrop-blur-lg z-50 w-full shadow-[0_0_20px_rgba(16,185,129,0.1)]">
        <h1 className="text-xl md:text-2xl font-black tracking-[0.3em] text-emerald-500 cursor-pointer uppercase hover:text-white transition-all" onClick={() => setActiveView(null)}>&gt; AML_DECODE</h1>
        
        {/* DESKTOP NAV */}
        <div className="hidden md:flex gap-4 items-center">
          {navItems.map((item) => (
            <button key={item} onClick={() => setActiveView(item.toLowerCase().replace(/ /g, '_'))} className="text-[10px] font-black text-emerald-400 hover:text-white transition-all uppercase tracking-widest">{item}</button>
          ))}
        </div>

        {/* MOBILE TOGGLE */}
        <button className="md:hidden text-emerald-500 text-2xl z-[60]" onClick={() => setIsMenuOpen(!isMenuOpen)}>
          {isMenuOpen ? "✕" : "☰"}
        </button>
      </nav>

      {/* MOBILE MENU - THIS WAS MISSING! */}
      {isMenuOpen && (
        <div className="md:hidden absolute top-20 left-0 w-full bg-[#030712]/95 border-b border-emerald-500/30 p-6 flex flex-col gap-4 z-50">
          {navItems.map((item) => (
            <button key={item} onClick={() => { setActiveView(item.toLowerCase().replace(/ /g, '_')); setIsMenuOpen(false); }} className="text-lg font-black text-left text-emerald-400 hover:text-white uppercase">
              {item}
            </button>
          ))}
        </div>
      )}

      {!activeView && (
        <main className="flex-grow">
          {/* VIDEO SECTION */}
          <section className="w-full relative bg-black">
             <video className="w-full h-[500px] object-cover" autoPlay muted={isMuted} loop playsInline>
               <source src="/intro.mp4" type="video/mp4" />
             </video>
             <button onClick={() => setIsMuted(!isMuted)} className="absolute bottom-8 right-8 bg-black/50 text-emerald-500 border border-emerald-500/50 px-4 py-2 rounded-lg backdrop-blur-md z-20">
               {isMuted ? "🔇 Unmute" : "🔊 Mute"}
             </button>
          </section>

          <div className="max-w-7xl mx-auto px-6 py-16">
            {/* Grid includes all cards now */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {navItems.map(item => (
                <div key={item} onClick={() => setActiveView(item.toLowerCase().replace(/ /g, '_'))} className="p-8 border border-emerald-500/20 rounded cursor-pointer hover:bg-emerald-900/10 transition-all text-center">
                  <h3 className="font-bold text-emerald-400 uppercase">{item}</h3>
                </div>
              ))}
            </div>
          </div>
        </main>
      )}

      {/* ... KEEP YOUR EXISTING {activeView && (...)} OVERLAY BLOCK BELOW ... */}
      
      <footer className="py-10 text-center text-slate-500 border-t border-white/5 uppercase text-xs tracking-widest">© 2026 AML_DECODE / Designed by @Nitesh</footer>
    </div>
  );
}