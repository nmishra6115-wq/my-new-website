import React, { useState, useEffect } from 'react';
import { notesContent } from './content';
import { jobOpenings } from './jobs';
import { kycNews } from './news';

export default function App() {
  const [activeView, setActiveView] = useState(null);
  const [pageIndex, setPageIndex] = useState(0);
  const [submissions, setSubmissions] = useState([]);
  const [jobPosts, setJobPosts] = useState([]);

  return (
    <div className="text-slate-100 font-mono min-h-screen flex flex-col bg-[#030712]">
      {/* NAVIGATION */}
      <nav className="p-6 border-b border-emerald-500/30 flex items-center justify-between sticky top-0 bg-[#030712]/90 backdrop-blur-lg z-50">
        <h1 className="text-xl font-black text-emerald-500 cursor-pointer uppercase" onClick={() => setActiveView(null)}>&gt; AML_DECODE</h1>
        <div className="hidden md:flex gap-6 text-sm font-bold text-emerald-400 uppercase tracking-widest">
          {['NOTES', 'JOBS', 'SUBMIT', 'AVAILABLE', 'POST_JOB', 'LIVE_JOBS'].map((item) => (
            <button key={item} onClick={() => setActiveView(item.toLowerCase())}>{item.replace('_', ' ')}</button>
          ))}
        </div>
      </nav>

      {/* HOME PAGE */}
      {!activeView && (
        <main className="flex-grow max-w-7xl mx-auto px-6 py-16">
          <div className="mb-12 p-6 border-2 border-dashed border-emerald-500/50 rounded-lg bg-emerald-950/20 text-center">
            <h2 className="text-emerald-500 font-bold uppercase tracking-widest">📢 Advertisement Slot</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[ {id: 'notes', label: 'Notes'}, {id: 'jobs', label: 'Jobs'}, {id: 'referralForm', label: 'Submit Referral'}, {id: 'availability', label: 'Available Referral'}, {id: 'post_job', label: 'Post Job'}, {id: 'live_jobs', label: 'Live Jobs'} ].map(card => (
              <div key={card.id} onClick={() => setActiveView(card.id)} className="p-8 border border-emerald-500/20 rounded cursor-pointer hover:bg-slate-800 transition-all text-center">
                <h3 className="font-bold text-emerald-400 uppercase">{card.label}</h3>
              </div>
            ))}
          </div>
        </main>
      )}

      {/* VIEW HANDLER - CONTAINS ALL PAGES */}
      {activeView && (
        <div className="fixed inset-0 z-[100] bg-black/95 p-12 overflow-y-auto">
          <button onClick={() => setActiveView(null)} className="text-emerald-400 font-bold mb-10">&larr; BACK</button>
          
          {/* ORIGINAL PAGES */}
          {activeView === 'notes' && <div className="max-w-6xl mx-auto flex gap-12"><div className="w-1/4 space-y-2">{notesContent.map((item, idx) => <button key={idx} onClick={() => setPageIndex(idx)} className="w-full text-left p-4 border border-slate-700">{item.title}</button>)}</div><div className="w-3/4"><h1 className="text-4xl font-bold mb-6">{notesContent[pageIndex].title}</h1><p className="text-slate-300">{notesContent[pageIndex].body}</p></div></div>}
          {activeView === 'jobs' && <div className="max-w-4xl mx-auto"><h1 className="text-4xl font-black mb-8">ACTIVE_OPENINGS</h1>{jobOpenings.map((job, idx) => <div key={idx} className="p-6 border border-slate-800 mb-4">{job.role}</div>)}</div>}
          {activeView === 'referralform' && <div className="max-w-xl mx-auto"><h1 className="text-3xl font-black mb-8 uppercase text-emerald-500">Submit Referral</h1><form className="space-y-4" onSubmit={(e) => { e.preventDefault(); alert("Submitted!"); setActiveView(null); }}><input type="text" placeholder="Name" className="w-full p-4 bg-slate-900 border" required /><button type="submit" className="w-full py-4 bg-emerald-600 font-bold uppercase">Send</button></form></div>}
          
          {/* NEW FEATURES */}
          {activeView === 'post_job' && <div className="max-w-xl mx-auto"><h2 className="text-2xl font-bold mb-6">POST WHATSAPP JOB</h2><form onSubmit={(e) => { e.preventDefault(); setJobPosts([...jobPosts, e.target[0].value]); setActiveView(null); }}><textarea className="w-full p-4 bg-slate-900 border mb-4" placeholder="Job Content" required /><button className="w-full py-4 bg-emerald-600 font-bold">POST TO FEED</button></form></div>}
          {activeView === 'live_jobs' && <div className="max-w-4xl mx-auto"><h2 className="text-2xl font-bold mb-6">LIVE CHANNEL JOBS</h2>{jobPosts.map((post, i) => <div key={i} className="p-6 bg-slate-900 mb-4 border border-emerald-500/20">{post}</div>)}</div>}
        </div>
      )}
      
      <footer className="py-10 text-center text-slate-500 border-t border-white/5 uppercase text-xs">© 2026 AML_DECODE</footer>
    </div>
  );
}