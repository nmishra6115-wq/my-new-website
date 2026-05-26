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
  const [filter, setFilter] = useState("All");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const [referrals, setReferrals] = useState(() => {
    const saved = localStorage.getItem('kyc_referrals');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('kyc_referrals', JSON.stringify(referrals));
    const timer = setTimeout(() => setIsLoading(false), 2000);
    return () => clearTimeout(timer);
  }, [referrals]);

  const handleFormSubmit = (e) => {
    e.preventDefault();
    const newRef = { name: e.target.name.value, company: e.target.company.value, designation: e.target.designation.value, roleDesc: e.target.roleDesc.value, email: e.target.email.value, createdAt: Date.now() };
    setReferrals([...referrals, newRef]);
    e.target.reset();
    setActiveView(null);
  };

  const overlayStyle = "fixed inset-0 z-[100] bg-black/95 p-12 overflow-y-auto transition-all duration-500 ease-out translate-y-0";

  return (
    <div className="bg-[#030712] text-slate-100 font-mono min-h-screen flex flex-col relative overflow-hidden">
      {/* LIVE ANIMATED BACKGROUND */}
      <div className="fixed inset-0 z-[-1] opacity-20 pointer-events-none animate-scan bg-[linear-gradient(rgba(16,185,129,0.2)_1px,transparent_1px),linear-gradient(90deg,rgba(16,185,129,0.2)_1px,transparent_1px)] bg-[size:50px_50px]"></div>

      {/* NAVIGATION */}
      <nav className="p-6 border-b border-emerald-500/30 flex items-center justify-between sticky top-0 bg-[#030712]/90 backdrop-blur-lg z-50 w-full shadow-[0_0_20px_rgba(16,185,129,0.1)]">
        <h1 className="text-xl md:text-2xl font-black tracking-[0.3em] text-emerald-500 cursor-pointer hover:text-white transition-all uppercase" onClick={() => { setActiveView(null); setIsMenuOpen(false); }}>&gt; AML_DECODE</h1>
        <div className="hidden md:flex gap-8 items-center">
          {['NOTES', 'JOBS', 'SUBMIT', 'AVAILABLE'].map((item) => (
            <button key={item} onClick={() => setActiveView(item.toLowerCase() === 'submit' ? 'referralForm' : item.toLowerCase())} className="text-sm font-black text-emerald-400 hover:text-white transition-all uppercase tracking-widest">{item}</button>
          ))}
        </div>
        <button className="md:hidden text-emerald-500 text-2xl" onClick={() => setIsMenuOpen(!isMenuOpen)}>{isMenuOpen ? "✕" : "☰"}</button>
      </nav>

      {/* MOBILE MENU */}
      {isMenuOpen && (
        <div className="md:hidden flex flex-col bg-[#030712] p-6 gap-4 border-b border-emerald-500/30">
          {['NOTES', 'JOBS', 'SUBMIT', 'AVAILABLE'].map((item) => (
            <button key={item} onClick={() => { setActiveView(item.toLowerCase() === 'submit' ? 'referralForm' : item.toLowerCase()); setIsMenuOpen(false); }} className="text-lg font-black text-left">{item}</button>
          ))}
        </div>
      )}

      {/* VIDEO & MAIN CONTENT */}
      {!activeView && (
        <>
          <section className="w-full relative">
             <video className="w-full h-[500px] object-cover" autoPlay muted={isMuted} loop playsInline><source src="/intro.mp4" type="video/mp4" /></video>
             <button onClick={() => setIsMuted(!isMuted)} className="absolute bottom-8 right-8 bg-black/50 text-emerald-500 border border-emerald-500/50 px-4 py-2 rounded-lg backdrop-blur-md">
               {isMuted ? "🔇 Unmute" : "🔊 Mute"}
             </button>
          </section>

          <main className="flex-grow max-w-7xl mx-auto px-6 py-16">
            <h2 className="text-4xl font-black text-center mb-16 text-white uppercase tracking-widest">Portal Access</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-24">
              {[ {id: 'notes', icon: '📖', label: 'Notes'}, {id: 'jobs', icon: '💼', label: 'Jobs'}, {id: 'referralForm', icon: '📤', label: 'Submit'}, {id: 'availability', icon: '🔍', label: 'Availability'} ].map(card => (
                <div key={card.id} onClick={() => setActiveView(card.id)} className="p-8 bg-slate-900 border border-emerald-500/20 rounded cursor-pointer transition-all duration-300 hover:border-emerald-500 hover:translate-x-1 hover:translate-y-[-4px] hover:shadow-[0_0_15px_rgba(16,185,129,0.3)] relative">
                  {card.id === 'availability' && <span className="absolute top-4 right-4 flex h-3 w-3"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span><span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span></span>}
                  <div className="text-4xl mb-6">{card.icon}</div><h3 className="font-bold text-emerald-400 mb-2 uppercase">{card.label}</h3>
                </div>
              ))}
            </div>
            
            <section className="border-t border-white/5 pt-16">
              <h2 className="text-xl font-black text-red-500 mb-8 tracking-widest">● LATEST INDUSTRY NEWS</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {isLoading ? ( <><NewsSkeleton /><NewsSkeleton /><NewsSkeleton /></> ) : (
                  kycNews.map((news, idx) => (
                    <a key={idx} href={news.link} target="_blank" rel="noopener noreferrer" className="block p-6 bg-slate-900 border border-white/5 rounded hover:border-red-500 transition-all">
                      <h4 className="text-md font-semibold text-slate-200 mb-4">{news.headline}</h4>
                      <span className="text-red-500 text-xs font-bold uppercase tracking-widest">Read More →</span>
                    </a>
                  ))
                )}
              </div>
            </section>
          </main>
        </>
      )}

      {/* OVERLAYS */}
      {activeView && (
        <div className={overlayStyle}>
          <button onClick={() => setActiveView(null)} className="text-emerald-400 font-bold mb-10">&larr; BACK_TO_SYSTEM</button>
          {activeView === 'notes' && <div className="max-w-6xl mx-auto flex gap-12"><div className="w-1/4 space-y-2">{notesContent.map((item, idx) => <button key={idx} onClick={() => setPageIndex(idx)} className="w-full text-left p-4 rounded border border-slate-700 hover:border-emerald-500">{item.title}</button>)}</div><div className="w-3/4"><h1 className="text-4xl font-bold mb-6">{notesContent[pageIndex].title}</h1><p className="text-lg text-slate-300 whitespace-pre-line">{notesContent[pageIndex].body}</p></div></div>}
          {activeView === 'jobs' && <div className="max-w-5xl mx-auto"><h1 className="text-4xl font-black mb-8">ACTIVE_OPENINGS</h1><div className="bg-slate-900 rounded border border-slate-800">{jobOpenings.map((job, idx) => <div key={idx} className="flex items-center justify-between p-6 border-b border-slate-800"><div><p className="text-emerald-400 font-bold text-xs">{job.company}</p><h2 className="text-lg font-semibold">{job.role}</h2></div><a href={job.link} target="_blank" className="px-6 py-2 bg-indigo-600 rounded text-sm hover:bg-indigo-500">APPLY</a></div>)}</div></div>}
          {activeView === 'referralForm' && <form onSubmit={handleFormSubmit} className="max-w-2xl mx-auto bg-slate-900 p-8 rounded"><input name="name" placeholder="Name" className="w-full p-4 mb-4 bg-black border border-slate-700 rounded" required /><input name="email" type="email" placeholder="Email" className="w-full p-4 mb-4 bg-black border border-slate-700 rounded" required /><button type="submit" className="w-full py-4 bg-emerald-600 rounded font-bold uppercase tracking-widest">Submit Data</button></form>}
        </div>
      )}

      <footer className="py-10 text-center text-slate-500 border-t border-white/5 uppercase text-xs tracking-widest">© 2026 AML_DECODE // DESIGNED BY @NITESH</footer>
    </div>
  );
}