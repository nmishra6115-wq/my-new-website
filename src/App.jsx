import React, { useState, useEffect } from 'react';
import { notesContent } from './content';
import { jobOpenings } from './jobs';
import { kycNews } from './news';

export default function App() {
  const [activeView, setActiveView] = useState(null);
  const [pageIndex, setPageIndex] = useState(0);
  const [isMuted, setIsMuted] = useState(true);
  const [filter, setFilter] = useState("All");
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const [referrals, setReferrals] = useState(() => {
    const saved = localStorage.getItem('kyc_referrals');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('kyc_referrals', JSON.stringify(referrals));
  }, [referrals]);

  const handleFormSubmit = (e) => {
    e.preventDefault();
    const newRef = {
      name: e.target.name.value,
      company: e.target.company.value,
      designation: e.target.designation.value,
      roleDesc: e.target.roleDesc.value,
      email: e.target.email.value,
      createdAt: Date.now()
    };
    setReferrals([...referrals, newRef]);
    e.target.reset();
    setActiveView(null);
  };

  const activeReferrals = referrals.filter(ref => (Date.now() - ref.createdAt) < (15 * 24 * 60 * 60 * 1000));

  return (
    <div className="bg-[#030712] text-slate-100 font-sans min-h-screen flex flex-col">
      
      {/* NAVIGATION */}
      <nav className="p-6 border-b border-white/5 flex items-center justify-between sticky top-0 bg-[#030712]/90 backdrop-blur-md z-50 w-full">
        <h1 className="text-xl md:text-2xl font-black tracking-[0.2em] text-emerald-500 cursor-pointer" 
            onClick={() => { setActiveView(null); setIsMenuOpen(false); }}>
          AMLDecode
        </h1>

        {/* Desktop Links */}
        <div className="hidden md:flex gap-8 items-center">
          <button onClick={() => setActiveView('notes')} className="text-xs font-bold hover:text-emerald-400 transition-all">NOTES</button>
          <button onClick={() => setActiveView('jobs')} className="text-xs font-bold hover:text-indigo-400 transition-all">JOBS</button>
          <button onClick={() => setActiveView('referralForm')} className="text-xs font-bold hover:text-white transition-all">SUBMIT REFERRAL</button>
          <button onClick={() => setActiveView('availability')} className="text-xs font-bold hover:text-white transition-all">AVAILABLE REFERRAL</button>
        </div>

        {/* Mobile Menu Button */}
        <button className="md:hidden text-emerald-500 text-xl" onClick={() => setIsMenuOpen(!isMenuOpen)}>
          {isMenuOpen ? "✕" : "☰"}
        </button>
      </nav>

      {/* Mobile Menu Dropdown */}
      {isMenuOpen && (
        <div className="md:hidden flex flex-col bg-[#030712] p-6 gap-4 border-b border-white/5">
          <button onClick={() => { setActiveView('notes'); setIsMenuOpen(false); }} className="text-sm font-bold text-left">NOTES</button>
          <button onClick={() => { setActiveView('jobs'); setIsMenuOpen(false); }} className="text-sm font-bold text-left">JOBS</button>
          <button onClick={() => { setActiveView('referralForm'); setIsMenuOpen(false); }} className="text-sm font-bold text-left">SUBMIT REFERRAL</button>
          <button onClick={() => { setActiveView('availability'); setIsMenuOpen(false); }} className="text-sm font-bold text-left">AVAILABLE REFERRAL</button>
        </div>
      )}

      {/* VIDEO */}
      {!activeView && (
        <section className="w-full relative">
           <video className="w-full h-[500px] object-cover" autoPlay muted={isMuted} loop playsInline>
              <source src="/intro.mp4" type="video/mp4" />
           </video>
           <button onClick={() => setIsMuted(!isMuted)} className="absolute bottom-8 right-8 bg-black/50 text-white px-4 py-2 rounded-lg backdrop-blur-md">
             {isMuted ? "🔇 Unmute" : "🔊 Mute"}
           </button>
        </section>
      )}

      {/* MAIN CONTENT */}
      {!activeView && (
        <main className="flex-grow max-w-7xl mx-auto px-6 py-16">
          <h2 className="text-4xl font-black text-center mb-16 text-white">How to use this Portal</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-24">
              <div onClick={() => setActiveView('notes')} className="p-8 bg-slate-900 border border-emerald-500/20 rounded-3xl cursor-pointer hover:bg-slate-800 transition"><div className="text-4xl mb-6">📖</div><h3 className="font-bold text-emerald-400 mb-2">Notes</h3><p className="text-sm text-slate-400">Review compliance frameworks.</p></div>
              <div onClick={() => setActiveView('jobs')} className="p-8 bg-slate-900 border border-indigo-500/20 rounded-3xl cursor-pointer hover:bg-slate-800 transition"><div className="text-4xl mb-6">💼</div><h3 className="font-bold text-indigo-400 mb-2">Job Search</h3><p className="text-sm text-slate-400">Filter and apply to roles.</p></div>
              <div onClick={() => setActiveView('referralForm')} className="p-8 bg-slate-900 border border-white/10 rounded-3xl cursor-pointer hover:bg-slate-800 transition"><div className="text-4xl mb-6">📤</div><h3 className="font-bold text-white mb-2">Submit</h3><p className="text-sm text-slate-400">Post referral details.</p></div>
              <div onClick={() => setActiveView('availability')} className="p-8 bg-slate-900 border border-emerald-500/20 rounded-3xl cursor-pointer hover:bg-slate-800 transition"><div className="text-4xl mb-6">🔍</div><h3 className="font-bold text-emerald-400 mb-2">Availability</h3><p className="text-sm text-slate-400">Review referral slots.</p></div>
          </div>
          <section className="border-t border-white/5 pt-16">
            <h2 className="text-xl font-bold text-red-500 mb-8 flex items-center gap-2">● LATEST INDUSTRY NEWS</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {kycNews.map((news, idx) => (
                <a key={idx} href={news.link} target="_blank" rel="noopener noreferrer" className="block p-6 bg-slate-900 border border-white/5 rounded-2xl hover:border-red-500 hover:bg-slate-800 transition-all">
                  <h4 className="text-md font-semibold text-slate-200">{news.headline}</h4>
                  <span className="text-red-500 text-xs font-bold mt-4 block">READ MORE →</span>
                </a>
              ))}
            </div>
          </section>
        </main>
      )}

      {/* OVERLAYS (Keep your existing code for notes, jobs, etc. here) */}
      
      <footer className="py-10 text-center text-slate-500 border-t border-white/5">© 2026 AML Decode | DESIGNED BY @NITESH</footer>
    </div>
  );
}