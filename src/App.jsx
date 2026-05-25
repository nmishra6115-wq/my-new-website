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
    <div className="bg-[#030712] text-slate-100 font-mono min-h-screen flex flex-col">
      
      {/* NAVIGATION - CYBERPUNK STYLE */}
      <nav className="p-6 border-b border-emerald-500/30 flex items-center justify-between sticky top-0 bg-[#030712]/90 backdrop-blur-lg z-50 w-full shadow-[0_0_20px_rgba(16,185,129,0.1)]">
        <h1 className="text-xl md:text-2xl font-black tracking-[0.3em] text-emerald-500 cursor-pointer hover:text-white transition-all uppercase" 
            onClick={() => { setActiveView(null); setIsMenuOpen(false); }}>
          &gt; AML_DECODE
        </h1>

        {/* Desktop Links */}
        <div className="hidden md:flex gap-8 items-center">
          <button onClick={() => setActiveView('notes')} className="text-[10px] tracking-[0.2em] font-bold text-emerald-500/70 hover:text-white hover:shadow-[0_0_8px_#10b981] transition-all uppercase border-b border-transparent hover:border-emerald-500">NOTES</button>
          <button onClick={() => setActiveView('jobs')} className="text-[10px] tracking-[0.2em] font-bold text-indigo-500/70 hover:text-white hover:shadow-[0_0_8px_#6366f1] transition-all uppercase border-b border-transparent hover:border-indigo-500">JOBS</button>
          <button onClick={() => setActiveView('referralForm')} className="text-[10px] tracking-[0.2em] font-bold text-white/70 hover:text-white hover:shadow-[0_0_8px_#ffffff] transition-all uppercase border-b border-transparent hover:border-white">SUBMIT</button>
          <button onClick={() => setActiveView('availability')} className="text-[10px] tracking-[0.2em] font-bold text-emerald-500/70 hover:text-white hover:shadow-[0_0_8px_#10b981] transition-all uppercase border-b border-transparent hover:border-emerald-500">AVAILABLE</button>
        </div>

        {/* Mobile Menu Button */}
        <button className="md:hidden text-emerald-500 text-xl" onClick={() => setIsMenuOpen(!isMenuOpen)}>
          {isMenuOpen ? "✕" : "☰"}
        </button>
      </nav>

      {/* Mobile Menu Dropdown */}
      {isMenuOpen && (
        <div className="md:hidden flex flex-col bg-[#030712] p-6 gap-4 border-b border-emerald-500/30">
          <button onClick={() => { setActiveView('notes'); setIsMenuOpen(false); }} className="text-sm font-bold text-left text-emerald-400">NOTES</button>
          <button onClick={() => { setActiveView('jobs'); setIsMenuOpen(false); }} className="text-sm font-bold text-left text-indigo-400">JOBS</button>
          <button onClick={() => { setActiveView('referralForm'); setIsMenuOpen(false); }} className="text-sm font-bold text-left">SUBMIT</button>
          <button onClick={() => { setActiveView('availability'); setIsMenuOpen(false); }} className="text-sm font-bold text-left text-emerald-400">AVAILABLE</button>
        </div>
      )}

      {/* VIDEO */}
      {!activeView && (
        <section className="w-full relative">
           <video className="w-full h-[500px] object-cover" autoPlay muted={isMuted} loop playsInline>
              <source src="/intro.mp4" type="video/mp4" />
           </video>
           <button onClick={() => setIsMuted(!isMuted)} className="absolute bottom-8 right-8 bg-black/50 text-emerald-500 border border-emerald-500/50 px-4 py-2 rounded-lg backdrop-blur-md">
             {isMuted ? "🔇 Unmute" : "🔊 Mute"}
           </button>
        </section>
      )}

      {/* MAIN CONTENT */}
      {!activeView && (
        <main className="flex-grow max-w-7xl mx-auto px-6 py-16">
          <h2 className="text-4xl font-black text-center mb-16 text-white uppercase tracking-widest">Portal Access</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-24">
              <div onClick={() => setActiveView('notes')} className="p-8 bg-slate-900 border border-emerald-500/20 rounded-lg cursor-pointer hover:bg-slate-800 transition hover:border-emerald-500"><div className="text-4xl mb-6">📖</div><h3 className="font-bold text-emerald-400 mb-2 uppercase">Notes</h3><p className="text-sm text-slate-400">Compliance library.</p></div>
              <div onClick={() => setActiveView('jobs')} className="p-8 bg-slate-900 border border-indigo-500/20 rounded-lg cursor-pointer hover:bg-slate-800 transition hover:border-indigo-500"><div className="text-4xl mb-6">💼</div><h3 className="font-bold text-indigo-400 mb-2 uppercase">Jobs</h3><p className="text-sm text-slate-400">Industry roles.</p></div>
              <div onClick={() => setActiveView('referralForm')} className="p-8 bg-slate-900 border border-white/10 rounded-lg cursor-pointer hover:bg-slate-800 transition hover:border-white"><div className="text-4xl mb-6">📤</div><h3 className="font-bold text-white mb-2 uppercase">Submit</h3><p className="text-sm text-slate-400">Post referrals.</p></div>
              <div onClick={() => setActiveView('availability')} className="p-8 bg-slate-900 border border-emerald-500/20 rounded-lg cursor-pointer hover:bg-slate-800 transition hover:border-emerald-500"><div className="text-4xl mb-6">🔍</div><h3 className="font-bold text-emerald-400 mb-2 uppercase">Availability</h3><p className="text-sm text-slate-400">Check slots.</p></div>
          </div>
        </main>
      )}

      {/* OVERLAYS */}
      {activeView === 'notes' && (
        <div className="fixed inset-0 z-[100] bg-black/95 p-12 overflow-y-auto">
          <button onClick={() => setActiveView(null)} className="text-emerald-400 font-bold mb-10">&larr; BACK_TO_SYSTEM</button>
          <div className="max-w-6xl mx-auto flex gap-12">
            <div className="w-1/4 space-y-2">{notesContent.map((item, idx) => <button key={idx} onClick={() => setPageIndex(idx)} className="w-full text-left p-4 rounded border border-slate-700 hover:border-emerald-500">{item.title}</button>)}</div>
            <div className="w-3/4"><h1 className="text-4xl font-bold mb-6">{notesContent[pageIndex].title}</h1><p className="text-lg text-slate-300 whitespace-pre-line">{notesContent[pageIndex].body}</p></div>
          </div>
        </div>
      )}

      {activeView === 'jobs' && (
        <div className="fixed inset-0 z-[100] bg-[#030712] p-12 overflow-y-auto">
          <button onClick={() => setActiveView(null)} className="text-indigo-400 font-bold mb-8">&larr; BACK_TO_SYSTEM</button>
          <div className="max-w-5xl mx-auto">
            <h1 className="text-4xl font-black mb-8">ACTIVE_OPENINGS</h1>
            <select onChange={(e) => setFilter(e.target.value)} className="bg-slate-900 text-white p-3 rounded mb-8 border border-slate-700 w-full">
              <option value="All">ALL_LOCATIONS</option>
              <option value="Bengaluru">BENGALURU</option>
              <option value="Kolkata">KOLKATA</option>
              <option value="Gurugram">GURUGRAM</option>
            </select>
            <div className="bg-slate-900 rounded border border-slate-800">
              {(filter === "All" ? jobOpenings : jobOpenings.filter(j => j.location === filter)).map((job, idx) => (
                <div key={idx} className="flex items-center justify-between p-6 border-b border-slate-800">
                  <div><p className="text-emerald-400 font-bold text-xs">{job.company}</p><h2 className="text-lg font-semibold">{job.role}</h2></div>
                  <a href={job.link} target="_blank" rel="noopener noreferrer" className="px-6 py-2 bg-indigo-600 rounded text-sm hover:bg-indigo-500">APPLY</a>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeView === 'referralForm' && (
        <div className="fixed inset-0 z-[100] bg-black/95 p-12 overflow-y-auto">
            <button onClick={() => setActiveView(null)} className="text-white font-bold mb-10">&larr; BACK_TO_SYSTEM</button>
            <form onSubmit={handleFormSubmit} className="max-w-2xl mx-auto bg-slate-900 p-8 rounded">
                <input name="name" placeholder="Name" className="w-full p-4 mb-4 bg-black border border-slate-700 rounded" required />
                <input name="email" type="email" placeholder="Email" className="w-full p-4 mb-4 bg-black border border-slate-700 rounded" required />
                <input name="company" placeholder="Company" className="w-full p-4 mb-4 bg-black border border-slate-700 rounded" required />
                <input name="designation" placeholder="Designation" className="w-full p-4 mb-4 bg-black border border-slate-700 rounded" required />
                <textarea name="roleDesc" placeholder="Role Description" className="w-full p-4 mb-4 bg-black border border-slate-700 rounded h-32" required />
                <button type="submit" className="w-full py-4 bg-emerald-600 rounded font-bold uppercase tracking-widest">Submit Data</button>
            </form>
        </div>
      )}

      {activeView === 'availability' && (
        <div className="fixed inset-0 z-[100] bg-black/95 p-12 overflow-y-auto">
            <button onClick={() => setActiveView(null)} className="text-emerald-400 font-bold mb-10">&larr; BACK_TO_SYSTEM</button>
            <div className="max-w-4xl mx-auto grid grid-cols-1 gap-6">
                {activeReferrals.map((ref, i) => (
                    <div key={i} className="p-8 bg-slate-900 border border-emerald-500/30 rounded">
                        <h3 className="text-2xl font-bold text-emerald-400">{ref.name}</h3>
                        <p className="text-indigo-400 mb-2">{ref.designation} @ {ref.company}</p>
                        <a href={`mailto:${ref.email}`} className="px-6 py-2 bg-indigo-600 rounded text-sm">INTEREST</a>
                    </div>
                ))}
            </div>
        </div>
      )}

      <footer className="py-10 text-center text-slate-500 border-t border-white/5 uppercase text-xs tracking-widest">© 2026 AML_DECODE // DESIGNED BY @NITESH</footer>
    </div>
  );
}