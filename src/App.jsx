import React, { useState, useEffect } from 'react';
import { notesContent } from './content';
import { jobOpenings } from './jobs';
import { kycNews } from './news';

export default function App() {
  const [activeView, setActiveView] = useState(null);
  const [pageIndex, setPageIndex] = useState(0);

  return (
    <div className="min-h-screen bg-[#0A0C10] text-slate-300 font-sans selection:bg-emerald-500/30">
      
      {/* PROFESSIONAL NAV */}
      <nav className="sticky top-0 z-50 border-b border-white/5 bg-[#0A0C10]/80 backdrop-blur-xl px-8 py-4 flex items-center justify-between">
        <h1 className="text-sm font-bold tracking-[0.2em] text-white cursor-pointer" onClick={() => setActiveView(null)}>
          INSTITUTIONAL_TERMINAL <span className="text-emerald-500">v2.0</span>
        </h1>
        <div className="flex gap-6 text-[10px] font-bold tracking-widest uppercase">
          {['NOTES', 'JOBS', 'SUBMIT', 'AVAILABLE'].map(item => (
            <button key={item} onClick={() => setActiveView(item === 'SUBMIT' ? 'referralForm' : item.toLowerCase())} className="hover:text-emerald-400 transition-colors">
              {item}
            </button>
          ))}
        </div>
      </nav>

      <main className="max-w-6xl mx-auto p-8">
        {!activeView ? (
          <>
            {/* LIVE FEED VIDEO */}
            <section className="mb-12 border border-white/5 overflow-hidden">
              <video className="w-full h-[400px] object-cover opacity-80 hover:opacity-100 transition-opacity" autoPlay muted loop playsInline>
                <source src="/intro.mp4" type="video/mp4" />
              </video>
            </section>

            {/* HERO */}
            <header className="py-10">
              <h2 className="text-4xl font-extrabold text-white mb-2">Compliance Operations</h2>
              <p className="text-slate-500 max-w-lg">Advanced monitoring, document verification, and global regulatory framework management.</p>
            </header>

            {/* DASHBOARD GRID */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {[ 
                {title: 'Registry', desc: 'System Notes', id: 'notes'}, 
                {title: 'Employment', desc: 'Market Openings', id: 'jobs'}, 
                {title: 'Submission', desc: 'Secure Upload', id: 'referralForm'},
                {title: 'Status', desc: 'Live Availability', id: 'availability'}
              ].map(card => (
                <div key={card.id} onClick={() => setActiveView(card.id)} className="group p-8 border border-white/5 bg-white/[0.02] hover:bg-white/[0.04] transition-all cursor-pointer">
                  <h3 className="text-lg font-bold text-white mb-1 group-hover:text-emerald-400">{card.title}</h3>
                  <p className="text-xs text-slate-500">{card.desc}</p>
                </div>
              ))}
            </div>
          </>
        ) : (
          /* OVERLAY CONTENT AREA */
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <button onClick={() => setActiveView(null)} className="text-[10px] uppercase tracking-widest text-emerald-500 mb-8 hover:underline">← Return to Dashboard</button>
            
            <div className="bg-[#11141A] p-12 border border-white/5 rounded-sm">
              {activeView === 'notes' && (
                <div className="flex gap-12">
                  <div className="w-1/4 space-y-2">
                    {notesContent.map((item, idx) => (
                      <button key={idx} onClick={() => setPageIndex(idx)} className="block w-full text-left p-3 text-sm border-b border-white/5 hover:text-emerald-400">{item.title}</button>
                    ))}
                  </div>
                  <div className="w-3/4">
                    <h1 className="text-2xl font-bold text-white mb-4">{notesContent[pageIndex].title}</h1>
                    <p className="text-slate-400 leading-relaxed">{notesContent[pageIndex].body}</p>
                  </div>
                </div>
              )}

              {activeView === 'jobs' && (
                <div>
                  <h1 className="text-3xl font-bold text-white mb-8">Active Openings</h1>
                  <div className="space-y-4">
                    {jobOpenings.map((job, idx) => (
                      <div key={idx} className="flex justify-between items-center p-6 bg-white/[0.02] border border-white/5">
                        <div><p className="text-emerald-500 text-[10px] font-bold uppercase">{job.company}</p><h2 className="text-white font-bold">{job.role}</h2></div>
                        <a href={job.link} target="_blank" rel="noopener noreferrer" className="px-4 py-2 border border-emerald-500/20 text-[10px] hover:bg-emerald-500 hover:text-black transition-all">APPLY</a>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
      
      <footer className="w-full p-8 text-[9px] text-slate-600 tracking-[0.2em] border-t border-white/5 mt-20">
        © 2026 AML_Decode / Designed by NITESH
      </footer>
    </div>
  );
}