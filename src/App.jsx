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

  // Maintenance Toggle
  const isMaintenanceMode = true; 

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  // 1. Maintenance UI
  if (isMaintenanceMode) {
    return (
      <div className="min-h-screen bg-[#030712] flex flex-col items-center justify-center text-emerald-500 font-mono">
        <h1 className="text-5xl font-black mb-4 uppercase tracking-widest">&gt; SYSTEM_UPGRADE</h1>
        <p className="text-slate-400">Our systems are currently undergoing maintenance.</p>
        <div className="mt-8 animate-pulse">● ● ●</div>
      </div>
    );
  }

  // 2. Normal Application UI
  return (
    <div className="text-slate-100 font-mono min-h-screen flex flex-col relative">
      <nav className="p-6 border-b border-emerald-500/30 flex items-center justify-between sticky top-0 bg-[#030712]/90 backdrop-blur-lg z-50 w-full shadow-[0_0_20px_rgba(16,185,129,0.1)]">
        <h1 className="text-xl md:text-2xl font-black tracking-[0.3em] text-emerald-500 cursor-pointer uppercase hover:text-white transition-all" onClick={() => setActiveView(null)}>&gt; AML_DECODE</h1>
        <div className="hidden md:flex gap-8 items-center">
          {['NOTES', 'JOBS', 'SUBMIT', 'AVAILABLE'].map((item) => (
            <button key={item} onClick={() => setActiveView(item === 'SUBMIT' ? 'referralForm' : item.toLowerCase())} className="text-sm font-black text-emerald-400 hover:text-white transition-all uppercase tracking-widest">{item}</button>
          ))}
        </div>
        <button className="md:hidden text-emerald-500 text-2xl" onClick={() => setIsMenuOpen(!isMenuOpen)}>{isMenuOpen ? "✕" : "☰"}</button>
      </nav>

      {/* ... Rest of your original JSX code remains here ... */}
      
      <footer className="py-10 text-center text-slate-500 border-t border-white/5 uppercase text-xs tracking-widest">© 2026 AML_DECODE / Designed by @Nitesh</footer>
    </div>
  );
}