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
  
  // State for the new features
  const [submissions, setSubmissions] = useState([]); // Referral data
  const [jobPosts, setJobPosts] = useState([]);      // WhatsApp Channel Jobs

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="text-slate-100 font-mono min-h-screen flex flex-col relative bg-[#030712]">
      {/* NAVIGATION */}
      <nav className="p-6 border-b border-emerald-500/30 flex items-center justify-between sticky top-0 bg-[#030712]/90 backdrop-blur-lg z-50 w-full">
        <h1 className="text-xl md:text-2xl font-black tracking-[0.3em] text-emerald-500 cursor-pointer uppercase hover:text-white transition-all" onClick={() => setActiveView(null)}>&gt; AML_DECODE</h1>
        <div className="hidden md:flex gap-8 items-center">
          {['NOTES', 'JOBS', 'SUBMIT', 'AVAILABLE', 'POST_JOB', 'LIVE_JOBS'].map((item) => (
            <button key={item} onClick={() => setActiveView(item.toLowerCase())} className="text-sm font-black text-emerald-400 hover:text-white transition-all uppercase tracking-widest">{item}</button>
          ))}
        </div>
      </nav>

      {!activeView && (
        <>
          <section className="w-full relative">
            <video className="w-full h-[500px] object-cover" autoPlay muted={isMuted} loop playsInline><source src="/intro.mp4" type="video/mp4" /></video>
          </section>

          <main className="flex-grow max-w-7xl mx-auto px-6 py-16">
            {/* ADVERTISEMENT TAB */}
            <div className="mb-12 p-6 border-2 border-dashed border-emerald-500/50 rounded-lg bg-emerald-950/20 text-center">
                <h2 className="text-emerald-500 font-bold uppercase tracking-widest">📢 Advertisement Slot</h2>
                <p className="text-sm text-slate-400">Promote your compliance services here.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-24">
              {[ {id: 'notes', icon: '📖', label: 'Notes'}, {id: 'jobs', icon: '💼', label: 'Jobs'}, {id: 'referralForm', icon: '📤', label: 'Submit Referral'}, {id: 'post_job', icon: '📝', label: 'Post Job (WhatsApp)'}, {id: 'live_jobs', icon: '📢', label: 'Live Channel Jobs'} ].map(card => (
                <div key={card.id} onClick={() => setActiveView(card.id)} className="p-8 border border-emerald-500/20 rounded cursor-pointer hover:bg-slate-800 transition-all">
                  <div className="text-4xl mb-6">{card.icon}</div>
                  <h3 className="font-bold text-emerald-400 uppercase">{card.label}</h3>
                </div>
              ))}
            </div>
          </main>
        </>
      )}

      {/* VIEW HANDLER */}
      {activeView && (
        <div className="fixed inset-0 z-[100] bg-black/95 p-12 overflow-y-auto">
          <button onClick={() => setActiveView(null)} className="text-emerald-400 font-bold mb-10">&larr; BACK</button>
          
          {/* POST JOB FORM */}
          {activeView === 'post_job' && (
             <div className="max-w-xl mx-auto">
                <h2 className="text-2xl font-bold mb-6">POST WHATSAPP CHANNEL JOB</h2>
                <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); setJobPosts([...jobPosts, e.target[0].value]); alert("Posted!"); setActiveView(null); }}>
                    <textarea className="w-full p-4 bg-slate-900 border border-slate-700 rounded" placeholder="Paste WhatsApp Job Content" required />
                    <button type="submit" className="w-full py-4 bg-emerald-600 font-bold uppercase">Post to Feed</button>
                </form>
             </div>
          )}

          {/* LIVE FEED */}
          {activeView === 'live_jobs' && (
             <div className="max-w-4xl mx-auto">
                <h2 className="text-2xl font-bold mb-6">LIVE CHANNEL JOBS</h2>
                {jobPosts.map((post, i) => <div key={i} className="p-6 bg-slate-900 mb-4 border border-emerald-500/20 rounded">{post}</div>)}
             </div>
          )}
          
          {/* (Rest of your existing view logic for notes, jobs, etc goes here) */}
        </div>
      )}
      <footer className="py-10 text-center text-slate-500 border-t border-white/5 uppercase text-xs tracking-widest">© 2026 AML_DECODE</footer>
    </div>
  );
}