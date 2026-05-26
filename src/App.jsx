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
  
  // New features state
  const [password, setPassword] = useState('');
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [jobPosts, setJobPosts] = useState([]); 

  const isMaintenanceMode = true; // Set to false when live

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  if (isMaintenanceMode) {
    return (
      <div className="min-h-screen bg-[#030712] flex flex-col items-center justify-center text-emerald-500 font-mono">
        <h1 className="text-5xl font-black mb-4 uppercase tracking-widest">&gt; SYSTEM_UPGRADE</h1>
      </div>
    );
  }

  return (
    <div className="text-slate-100 font-mono min-h-screen flex flex-col bg-[#030712]">
      {/* NAVIGATION */}
      <nav className="p-6 border-b border-emerald-500/30 flex items-center justify-between sticky top-0 bg-[#030712]/90 backdrop-blur-lg z-50">
        <h1 className="text-xl font-black text-emerald-500 cursor-pointer uppercase" onClick={() => setActiveView('home')}>&gt; AML_DECODE</h1>
        <div className="hidden md:flex gap-6 text-xs font-bold text-emerald-400 uppercase tracking-widest">
          {['NOTES', 'JOBS', 'POST_JOB', 'LIVE_FEED'].map((item) => (
            <button key={item} onClick={() => setActiveView(item.toLowerCase())}>{item.replace('_', ' ')}</button>
          ))}
        </div>
      </nav>

      <main className="flex-grow">
        {activeView === 'home' ? (
          <>
            <section className="w-full relative"><video className="w-full h-[500px] object-cover" autoPlay muted loop playsInline><source src="/intro.mp4" type="video/mp4" /></video></section>
            
            <div className="max-w-7xl mx-auto px-6 py-16">
              <div className="mb-12 p-6 border-2 border-dashed border-emerald-500/50 rounded-lg text-center text-emerald-500">📢 ADVERTISEMENT SLOT</div>
              
              <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                {[ {id: 'notes', label: 'Notes'}, {id: 'jobs', label: 'Jobs'}, {id: 'post_job', label: 'Post Job'}, {id: 'live_feed', label: 'Live Feed'} ].map(card => (
                  <div key={card.id} onClick={() => setActiveView(card.id)} className="p-8 border border-emerald-500/20 rounded cursor-pointer hover:bg-slate-800 text-center uppercase font-bold">{card.label}</div>
                ))}
              </div>
            </div>
          </>
        ) : (
          <div className="max-w-4xl mx-auto p-12">
            <button onClick={() => setActiveView('home')} className="text-emerald-400 mb-8">&larr; BACK</button>
            
            {activeView === 'notes' && <div className="space-y-6">{notesContent.map((n, i) => <div key={i} className="p-4 border">{n.title}</div>)}</div>}
            {activeView === 'jobs' && <div className="space-y-6">{jobOpenings.map((j, i) => <div key={i} className="p-4 border">{j.role}</div>)}</div>}
            
            {activeView === 'post_job' && !isAuthorized && (
              <form onSubmit={(e) => { e.preventDefault(); if(password === 'my-super-secret-123') setIsAuthorized(true); else alert('Wrong!'); }}>
                <input type="password" placeholder="Enter Password" onChange={(e) => setPassword(e.target.value)} className="w-full p-4 bg-slate-900 border mb-4" />
                <button className="w-full bg-emerald-600 p-4">UNLOCK</button>
              </form>
            )}

            {activeView === 'post_job' && isAuthorized && (
              <form onSubmit={(e) => { e.preventDefault(); setJobPosts([...jobPosts, e.target[0].value]); setActiveView('home'); }}>
                <textarea className="w-full p-4 bg-slate-900 border mb-4" placeholder="Description" required />
                <button className="w-full bg-emerald-600 p-4">POST TO FEED</button>
              </form>
            )}

            {activeView === 'live_feed' && (
              <div className="space-y-4">{jobPosts.map((p, i) => <div key={i} className="p-6 border">{p}</div>)}</div>
            )}
          </div>
        )}
      </main>

      <footer className="py-10 text-center text-slate-500 border-t border-white/5 uppercase text-xs">© 2026 AML_DECODE</footer>
    </div>
  );
}