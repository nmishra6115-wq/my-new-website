// Paste this inside your App function, right before the 'return'
console.log("Current activeView is:", activeView);
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

  return (
    <div className="text-slate-100 font-mono min-h-screen flex flex-col relative bg-[#030712]">
      
      {/* NAVIGATION */}
     {/* NAVIGATION */}
      <nav className="p-6 border-b border-emerald-500/30 flex items-center justify-between sticky top-0 bg-[#030712]/90 backdrop-blur-lg z-50 w-full shadow-[0_0_20px_rgba(16,185,129,0.1)]">
        <h1 className="text-xl md:text-2xl font-black tracking-[0.3em] text-emerald-500 cursor-pointer uppercase hover:text-white transition-all" onClick={() => setActiveView(null)}>&gt; AML_DECODE</h1>
        
        {/* DESKTOP NAV */}
       <div className="hidden md:flex gap-6 items-center">
  {[
    { label: 'NOTES', id: 'notes' },
    { label: 'JOBS', id: 'jobs' },
    { label: 'SUBMIT REFERRAL', id: 'referralForm' },
    { label: 'AVAILABLE REFERRAL', id: 'available' },
    { label: 'HR DASHBOARD', id: 'contribute' },
    { label: 'NETWORK JOBS', id: 'network' }
  ].map((item) => (
    <button 
      key={item.id} 
      onClick={() => setActiveView(item.id)} 
      className="text-xs font-black text-emerald-400 hover:text-white transition-all uppercase tracking-widest"
    >
      {item.label}
    </button>
  ))}
</div>
        
        {/* MOBILE TOGGLE */}
        <button className="md:hidden text-emerald-500 text-2xl z-[60]" onClick={() => setIsMenuOpen(!isMenuOpen)}>
          {isMenuOpen ? "✕" : "☰"}
        </button>
      </nav>

      {/* FIXED MOBILE MENU (This was missing from your code) */}
      {isMenuOpen && (
      <div className="md:hidden absolute top-20 left-0 w-full bg-[#030712]/95 border-b border-emerald-500/30 p-6 flex flex-col gap-4 z-50">
  {[
    { label: 'NOTES', id: 'notes' },
    { label: 'JOBS', id: 'jobs' },
    { label: 'SUBMIT REFERRAL', id: 'referralForm' },
    { label: 'AVAILABLE REFERRAL', id: 'available' },
    { label: 'HR DASHBOARD', id: 'contribute' },
    { label: 'NETWORK JOBS', id: 'network' }
  ].map((item) => (
    <button 
      key={item.id} 
      onClick={() => { 
        setActiveView(item.id); 
        setIsMenuOpen(false); 
      }} 
      className="text-lg font-black text-left text-emerald-400 uppercase"
    >
      {item.label}
    </button>
  ))}
</div>
      )}

      {!activeView && (
        <main className="flex-grow">
          {/* VIDEO SECTION */}
          <section className="w-full relative bg-black">
             <video 
               className="w-full h-[500px] object-cover" 
               autoPlay 
               muted={isMuted} 
               loop 
               playsInline
               key={isMuted ? 'muted' : 'unmuted'}
             >
               <source src="/intro.mp4" type="video/mp4" />
             </video>
             <button onClick={() => setIsMuted(!isMuted)} className="absolute bottom-8 right-8 bg-black/50 text-emerald-500 border border-emerald-500/50 px-4 py-2 rounded-lg backdrop-blur-md z-20">
               {isMuted ? "🔇 Unmute" : "🔊 Mute"}
             </button>
          </section>
          {/* Moving Advertisement Banner */}
<div className="w-full bg-black border-y border-emerald-500/30 overflow-hidden py-3 my-4">
  <div className="animate-marquee text-emerald-500 font-bold uppercase tracking-[0.5em] text-sm">
    📢 ADVERTISEMENT: PROMOTE YOUR COMPLIANCE SERVICES HERE • CONTACT US FOR PLACEMENTS • 📢 ADVERTISEMENT: PROMOTE YOUR COMPLIANCE SERVICES HERE •
  </div>
</div>

          {/* DASHBOARD */}
          <div className="max-w-7xl mx-auto px-6 py-16">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-24">
              <div onClick={() => setActiveView('network')} className="p-8 border border-purple-500/50 bg-purple-900/10 rounded cursor-pointer hover:bg-purple-900/20 transition-all text-center">
                <div className="text-4xl mb-4">🤝</div>
                <h3 className="font-bold text-purple-400 uppercase tracking-widest mb-2">Featured Network</h3>
                <p className="text-sm text-slate-300">Exclusive job openings and media from verified partners.</p>
              </div>
              {[ {id: 'notes', icon: '📖', label: 'Notes', color: 'registry-card'}, {id: 'jobs', icon: '💼', label: 'Jobs', color: 'jobs-card'}, {id: 'referralForm', icon: '📤', label: 'Submit Referral', color: 'submit-card'}, {id: 'available', icon: '🔍', label: 'Available Referral', color: 'avail-card'}, {id: 'contribute', icon: '📁', label: 'HR Dashboard', color: 'upload-card'} ].map(card => (
                <div key={card.id} onClick={() => setActiveView(card.id)} className={`${card.color} custom-card p-8 border border-emerald-500/20 rounded cursor-pointer transition-all duration-300 hover:translate-y-[-5px]`}><div className="text-4xl mb-6">{card.icon}</div><h3 className="font-bold text-emerald-400 uppercase">{card.label}</h3></div>
              ))}
            </div>
            
            {/* LATEST NEWS */}
            <section className="border-t border-white/5 pt-16">
              <h2 className="text-xl font-black text-red-500 mb-8 tracking-widest">● LATEST NEWS</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {isLoading ? <><NewsSkeleton /><NewsSkeleton /><NewsSkeleton /></> : kycNews.map((n, i) => (
                  <a key={i} href={n.link} target="_blank" rel="noopener noreferrer" className="block p-6 bg-[#030712]/80 border border-white/5 rounded hover:border-red-500 transition-all"><h4 className="text-md font-semibold text-slate-200 mb-4">{n.headline}</h4></a>
                ))}
              </div>
            </section>
          </div>
        </main>
      )}

      {/* OVERLAY SECTION */}
   
     
      
      {activeView && (
  <div className="fixed inset-0 z-[100] bg-black/95 p-12 overflow-y-auto">
    <button onClick={() => setActiveView(null)} className="text-emerald-400 mb-10 text-xl font-bold">&larr; BACK</button>
    
    <div className="max-w-4xl mx-auto text-white">
      
      {/* 1. NETWORK FEED (Simplest possible version) */}
      {activeView === 'network' && (
        <div>
          <h1 className="text-3xl font-black mb-8 text-emerald-500">NETWORK FEED</h1>
          {partnerFiles.length === 0 ? <p>No files uploaded.</p> : partnerFiles.map((file, i) => (
            <div key={i} className="p-4 border border-slate-700 flex justify-between">
              <span>{file.name}</span>
              <button onClick={() => window.open(file.url, '_blank')} className="text-blue-400">View</button>
            </div>
          ))}
        </div>
      )}

      {/* 2. CONTRIBUTE (Simplified password & upload) */}
      {activeView === 'contribute' && (
        <div className="p-16 border border-slate-800 text-center">
          {!isAuthorized ? (
            <input 
              type="password" 
              placeholder="Enter Key" 
              className="p-4 bg-black border border-emerald-500 text-white"
              onChange={(e) => {
                if(e.target.value === '123') setIsAuthorized(true);
              }}
            />
          ) : (
            <input 
              type="file" 
              onChange={(e) => {
                if(e.target.files[0]) {
                  const f = e.target.files[0];
                  setPartnerFiles([...partnerFiles, { name: f.name, url: URL.createObjectURL(f) }]);
                }
              }} 
            />
          )}
        </div>
      )}
    </div>
  </div>
)}
)
      <footer className="py-10 text-center text-slate-500 border-t border-white/5 uppercase text-xs tracking-widest">© 2026 AML_DECODE / Designed by @Nitesh</footer>
    </div>
  );
}