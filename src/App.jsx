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
  const [activeView, setActiveView] = useState('home');
  const [isLoading, setIsLoading] = useState(true);
  const [jobPosts, setJobPosts] = useState([]);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="text-slate-100 font-mono min-h-screen flex flex-col bg-[#030712]">
      {/* NAVIGATION */}
      <nav className="p-6 border-b border-emerald-500/30 flex items-center justify-between sticky top-0 bg-[#030712]/90 backdrop-blur-lg z-50 w-full shadow-[0_0_20px_rgba(16,185,129,0.1)]">
        <h1 className="text-xl md:text-2xl font-black tracking-[0.3em] text-emerald-500 cursor-pointer uppercase hover:text-white transition-all" onClick={() => setActiveView('home')}>&gt; AML_DECODE</h1>
        <div className="hidden md:flex gap-8 items-center text-xs font-black text-emerald-400 uppercase tracking-widest">
          {['NOTES', 'JOBS', 'POST_JOB', 'LIVE_JOBS'].map((item) => (
            <button key={item} onClick={() => setActiveView(item.toLowerCase())}>{item.replace('_', ' ')}</button>
          ))}
        </div>
      </nav>

      {/* DYNAMIC CONTENT AREA */}
      <main className="flex-grow">
        {activeView === 'home' ? (
          <>
            <section className="w-full relative">
              <video className="w-full h-[500px] object-cover" autoPlay muted loop playsInline>
                <source src="/intro.mp4" type="video/mp4" />
              </video>
            </section>

            <div className="max-w-7xl mx-auto px-6 py-16">
              {/* ADVERTISEMENT TAB */}
              <div className="mb-12 p-6 border-2 border-dashed border-emerald-500/50 rounded-lg bg-emerald-950/20 text-center">
                <h2 className="text-emerald-500 font-bold uppercase tracking-widest">📢 Advertisement Slot</h2>
              </div>

              {/* GRID CARDS */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-24">
                {[ 
                  {id: 'notes', label: 'Notes', icon: '📖'}, 
                  {id: 'jobs', label: 'Jobs', icon: '💼'}, 
                  {id: 'post_job', label: 'Post Job', icon: '📝'}, 
                  {id: 'live_jobs', label: 'Live Jobs', icon: '📢'} 
                ].map(card => (
                  <div key={card.id} onClick={() => setActiveView(card.id)} className="p-8 border border-emerald-500/20 rounded cursor-pointer hover:bg-slate-800 transition-all text-center">
                    <div className="text-4xl mb-6">{card.icon}</div>
                    <h3 className="font-bold text-emerald-400 uppercase">{card.label}</h3>
                  </div>
                ))}
              </div>

              {/* NEWS SECTION */}
              <section className="border-t border-white/5 pt-16">
                <h2 className="text-xl font-black text-red-500 mb-8 tracking-widest uppercase">● Latest News</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {isLoading ? <><NewsSkeleton /><NewsSkeleton /><NewsSkeleton /></> : kycNews.map((n, i) => (
                    <a key={i} href={n.link} target="_blank" rel="noopener noreferrer" className="block p-6 bg-[#030712]/80 border border-white/5 rounded hover:border-red-500 transition-all">
                      <h4 className="text-md font-semibold text-slate-200">{n.headline}</h4>
                    </a>
                  ))}
                </div>
              </section>
            </div>
          </>
        ) : (
          <div className="max-w-4xl mx-auto p-12">
            <button onClick={() => setActiveView('home')} className="text-emerald-400 font-bold mb-10 hover:text-white">&larr; BACK</button>
            
            {/* DYNAMIC VIEWS */}
            {activeView === 'notes' && <div className="space-y-6 text-slate-300">{notesContent.map((n, i) => <div key={i}><h2 className="text-2xl font-bold text-white">{n.title}</h2><p>{n.body}</p></div>)}</div>}
            {activeView === 'jobs' && <div className="space-y-6">{jobOpenings.map((j, i) => <div key={i} className="p-6 border border-slate-800">{j.role}</div>)}</div>}
            {activeView === 'post_job' && (
              <form onSubmit={(e) => { e.preventDefault(); setJobPosts([...jobPosts, e.target[0].value]); setActiveView('home'); }}>
                <textarea className="w-full p-4 bg-slate-900 border mb-4" placeholder="Job Content" required />
                <button className="w-full py-4 bg-emerald-600 font-bold">POST TO FEED</button>
              </form>
            )}
            {activeView === 'live_jobs' && <div className="space-y-4">{jobPosts.map((p, i) => <div key={i} className="p-6 bg-slate-900 border border-emerald-500/20">{p}</div>)}</div>}
          </div>
        )}
      </main>

      {/* FOOTER */}
      <footer className="py-10 text-center text-slate-500 border-t border-white/5 uppercase text-xs tracking-widest">
        © 2026 AML_DECODE
      </footer>
    </div>
  );
}