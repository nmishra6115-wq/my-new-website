import React, { useState } from 'react';
import { notesContent } from './content';
import { jobOpenings } from './jobs';

export default function App() {
  const [activeView, setActiveView] = useState('home');
  const [jobPosts, setJobPosts] = useState([]);

  return (
    <div className="min-h-screen bg-[#030712] text-slate-100 font-mono flex flex-col">
      
      {/* NAVIGATION - Always visible */}
      <nav className="p-6 border-b border-emerald-500/30 flex justify-between items-center sticky top-0 bg-[#030712]/90 z-50">
        <h1 className="text-xl font-black text-emerald-500 cursor-pointer" onClick={() => setActiveView('home')}>&gt; AML_DECODE</h1>
        <div className="flex gap-6 text-xs font-bold text-emerald-400 uppercase">
          <button onClick={() => setActiveView('notes')}>NOTES</button>
          <button onClick={() => setActiveView('jobs')}>JOBS</button>
          <button onClick={() => setActiveView('post_job')}>POST JOB</button>
          <button onClick={() => setActiveView('live_jobs')}>LIVE JOBS</button>
        </div>
      </nav>

      {/* CONTENT AREA - Swaps based on state */}
      <main className="flex-grow">
        
        {activeView === 'home' && (
          <div className="max-w-7xl mx-auto px-6 py-16">
            <video className="w-full h-[500px] object-cover mb-16" autoPlay muted loop playsInline>
              <source src="/intro.mp4" type="video/mp4" />
            </video>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div onClick={() => setActiveView('notes')} className="p-10 border border-emerald-500/20 cursor-pointer hover:bg-slate-800 text-center">NOTES</div>
              <div onClick={() => setActiveView('jobs')} className="p-10 border border-emerald-500/20 cursor-pointer hover:bg-slate-800 text-center">JOBS</div>
              <div onClick={() => setActiveView('post_job')} className="p-10 border border-emerald-500/20 cursor-pointer hover:bg-slate-800 text-center">POST JOB</div>
            </div>
          </div>
        )}

        {activeView === 'notes' && (
          <div className="p-12"><button onClick={() => setActiveView('home')} className="mb-4">← BACK</button>
          {notesContent.map((n, i) => <div key={i} className="mb-6">{n.title}</div>)}</div>
        )}

        {activeView === 'jobs' && (
          <div className="p-12"><button onClick={() => setActiveView('home')} className="mb-4">← BACK</button>
          {jobOpenings.map((j, i) => <div key={i} className="mb-6">{j.role}</div>)}</div>
        )}

        {activeView === 'post_job' && (
          <div className="p-12"><button onClick={() => setActiveView('home')} className="mb-4">← BACK</button>
          <form onSubmit={(e) => { e.preventDefault(); setJobPosts([...jobPosts, e.target[0].value]); setActiveView('home'); }}>
            <textarea className="w-full p-4 bg-slate-900 border mb-4" placeholder="Job Content" required />
            <button className="w-full py-4 bg-emerald-600">POST</button>
          </form></div>
        )}

      </main>

      {/* FOOTER - Always visible */}
      <footer className="py-10 text-center text-slate-500 border-t border-white/5 uppercase text-xs">
        © 2026 AML_DECODE
      </footer>
    </div>
  );
}