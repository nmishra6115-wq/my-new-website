import React, { useState, useEffect } from 'react';
import { notesContent } from './content';
import { jobOpenings } from './jobs';
import { kycNews } from './news';

export default function App() {
  const [activeView, setActiveView] = useState('home');
  const [submissions, setSubmissions] = useState([]);
  const [jobPosts, setJobPosts] = useState([]);

  // This ensures the video and home layout are always rendered correctly when activeView is 'home'
  const renderHome = () => (
    <>
      <section className="w-full relative">
        <video className="w-full h-[500px] object-cover" autoPlay muted loop playsInline>
          <source src="/intro.mp4" type="video/mp4" />
        </video>
      </section>

      <main className="max-w-7xl mx-auto px-6 py-16">
        <div className="mb-12 p-6 border-2 border-dashed border-emerald-500/50 rounded-lg bg-emerald-950/20 text-center">
            <h2 className="text-emerald-500 font-bold uppercase tracking-widest">📢 Advertisement Slot</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-24">
          {[ 
            {id: 'notes', label: 'NOTES'}, {id: 'jobs', label: 'JOBS'}, 
            {id: 'referralForm', label: 'SUBMIT REFERRAL'}, {id: 'post_job', label: 'POST JOB'}, 
            {id: 'live_jobs', label: 'LIVE JOBS'} 
          ].map(card => (
            <div key={card.id} onClick={() => setActiveView(card.id)} className="p-8 border border-emerald-500/20 rounded cursor-pointer hover:bg-slate-800 transition-all text-center">
              <h3 className="font-bold text-emerald-400 uppercase">{card.label}</h3>
            </div>
          ))}
        </div>
      </main>
    </>
  );

  return (
    <div className="min-h-screen flex flex-col bg-[#030712] text-slate-100 font-mono">
      {/* PERSISTENT NAVIGATION */}
      <nav className="p-6 border-b border-emerald-500/30 flex items-center justify-between sticky top-0 bg-[#030712]/90 backdrop-blur-lg z-50 w-full">
        <h1 className="text-xl md:text-2xl font-black tracking-[0.3em] text-emerald-500 cursor-pointer uppercase" onClick={() => setActiveView('home')}>&gt; AML_DECODE</h1>
        <div className="flex gap-6 text-xs font-bold text-emerald-400 uppercase tracking-widest">
          {['NOTES', 'JOBS', 'POST_JOB', 'LIVE_JOBS'].map((item) => (
            <button key={item} onClick={() => setActiveView(item.toLowerCase())}>{item.replace('_', ' ')}</button>
          ))}
        </div>
      </nav>

      {/* DYNAMIC CONTENT AREA */}
      <div className="flex-grow">
        {activeView === 'home' ? renderHome() : (
          <div className="max-w-4xl mx-auto p-12">
            <button onClick={() => setActiveView('home')} className="text-emerald-400 font-bold mb-10">&larr; BACK</button>
            
            {/* View Logic */}
            {activeView === 'notes' && <div className="text-slate-300">{notesContent.map((n, i) => <div key={i} className="mb-6">{n.title}</div>)}</div>}
            {activeView === 'jobs' && <div className="text-slate-300">{jobOpenings.map((j, i) => <div key={i} className="mb-6">{j.role}</div>)}</div>}
            {activeView === 'post_job' && <form onSubmit={(e) => { e.preventDefault(); setJobPosts([...jobPosts, e.target[0].value]); setActiveView('home'); }}><textarea className="w-full p-4 bg-slate-900 border" required /><button className="w-full py-4 bg-emerald-600">POST</button></form>}
            {activeView === 'live_jobs' && <div>{jobPosts.map((p, i) => <div key={i} className="p-4 border">{p}</div>)}</div>}
          </div>
        )}
      </div>

      {/* PERSISTENT FOOTER */}
      <footer className="py-10 text-center text-slate-500 border-t border-white/5 uppercase text-xs tracking-widest">
        © 2026 AML_DECODE
      </footer>
    </div>
  );
}