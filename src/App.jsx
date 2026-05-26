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

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 2000);
    return () => clearTimeout(timer);
  }, []);

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

      {isMenuOpen && (
        <div className="md:hidden flex flex-col bg-[#030712]/95 p-6 gap-4 border-b border-emerald-500/30">
          {['NOTES', 'JOBS', 'SUBMIT', 'AVAILABLE'].map((item) => (
            <button key={item} onClick={() => { setActiveView(item === 'SUBMIT' ? 'referralForm' : item.toLowerCase()); setIsMenuOpen(false); }} className="text-lg font-black text-left">{item}</button>
          ))}
        </div>
      )}

      {!activeView && (
        <>
          <section className="w-full relative">
             <video className="w-full h-[500px] object-cover" autoPlay muted={isMuted} loop playsInline><source src="/intro.mp4" type="video/mp4" /></video>
             <button onClick={() => setIsMuted(!isMuted)} className="absolute bottom-8 right-8 bg-black/50 text-emerald-500 border border-emerald-500/50 px-4 py-2 rounded-lg backdrop-blur-md">
               {isMuted ? "🔇 Unmute" : "🔊 Mute"}
             </button>
          </section>

          <main className="flex-grow max-w-7xl mx-auto px-6 py-16">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-24">
              {[ {id: 'notes', icon: '📖', label: 'Notes', color: 'registry-card'}, {id: 'jobs', icon: '💼', label: 'Jobs', color: 'jobs-card'}, {id: 'referralForm', icon: '📤', label: 'Submit', color: 'submit-card'}, {id: 'availability', icon: '🔍', label: 'Availability', color: 'avail-card'} ].map(card => (
                <div key={card.id} onClick={() => setActiveView(card.id)} className={`${card.color} custom-card p-8 border border-emerald-500/20 rounded cursor-pointer transition-all duration-300 hover:translate-y-[-5px]`}><div className="text-4xl mb-6">{card.icon}</div><h3 className="font-bold text-emerald-400 uppercase">{card.label}</h3></div>
              ))}
            </div>
          </main>
        </>
      )}

      {activeView && (
        <div className="fixed inset-0 z-[100] bg-black/95 p-12 overflow-y-auto animate-in fade-in zoom-in duration-300">
          <button onClick={() => setActiveView(null)} className="text-emerald-400 font-bold mb-10 hover:text-white">&larr; BACK</button>
          <div className="max-w-6xl mx-auto text-white">
            {activeView === 'notes' && <div className="flex gap-12"><div className="w-1/4 space-y-2">{notesContent.map((item, idx) => <button key={idx} onClick={() => setPageIndex(idx)} className="w-full text-left p-4 rounded border border-slate-700 hover:border-emerald-500">{item.title}</button>)}</div><div className="w-3/4"><h1 className="text-4xl font-bold mb-6">{notesContent[pageIndex].title}</h1><p className="text-lg text-slate-300 whitespace-pre-line">{notesContent[pageIndex].body}</p></div></div>}
            {activeView === 'jobs' && <div className="max-w-4xl mx-auto"><h1 className="text-4xl font-black mb-8">ACTIVE_OPENINGS</h1><div className="bg-[#030712]/80 rounded border border-slate-800">{jobOpenings.map((job, idx) => <div key={idx} className="flex items-center justify-between p-6 border-b border-slate-800"><div><p className="text-emerald-400 font-bold text-xs">{job.company}</p><h2 className="text-lg font-semibold">{job.role}</h2></div><a href={job.link} target="_blank" className="px-6 py-2 bg-indigo-600 rounded text-sm hover:bg-indigo-500">APPLY</a></div>)}</div></div>}
            {activeView === 'referralForm' && (
              <div className="max-w-xl mx-auto"><h1 className="text-3xl font-black mb-8 uppercase text-emerald-500">Submit Referral</h1><form className="space-y-4" onSubmit={(e) => { e.preventDefault(); const data = {name: e.target[0].value, email: e.target[1].value, company: e.target[2].value, role: e.target[3].value}; setSubmissions([...submissions, data]); alert("Submitted!"); }}><input type="text" placeholder="Full Name" className="w-full p-4 bg-[#030712] border border-slate-700 rounded" required /><input type="email" placeholder="Email" className="w-full p-4 bg-[#030712] border border-slate-700 rounded" required /><input type="text" placeholder="Company" className="w-full p-4 bg-[#030712] border border-slate-700 rounded" required /><input type="text" placeholder="Role" className="w-full p-4 bg-[#030712] border border-slate-700 rounded" required /><textarea placeholder="Description" className="w-full p-4 bg-[#030712] border border-slate-700 rounded" required></textarea><button type="submit" className="w-full py-4 bg-emerald-600 font-bold uppercase">Send Data</button></form></div>
            )}
            {activeView === 'availability' && (
              <div className="max-w-4xl mx-auto"><h1 className="text-3xl font-black mb-6 uppercase tracking-widest text-emerald-500">Live Availability</h1>{submissions.map((s, i) => <div key={i} className="p-4 mb-4 border border-slate-700 bg-slate-900 rounded"><p className="font-bold">{s.name} - {s.role} at {s.company}</p></div>)}<div className="mt-8 text-center"><a href="mailto:nitesh@example.com?subject=Interested in Referral" className="px-8 py-4 bg-emerald-600 hover:bg-emerald-500 text-black font-black uppercase tracking-widest transition-all">I am interested</a></div></div>
            )}
          </div>
        </div>
      )}
      <footer className="py-10 text-center text-slate-500 border-t border-white/5 uppercase text-xs tracking-widest">© 2026 AML_DECODE / Designed by @Nitesh</footer>
    </div>
  );
}