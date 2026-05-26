import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import { notesContent } from './content';
import { jobOpenings } from './jobs';
import { kycNews } from './news';

const ActivityFeed = ({ activities }) => (
  <section className="my-16 border border-emerald-500/20 bg-emerald-950/10 p-8 rounded-lg">
    <h2 className="text-emerald-500 font-black tracking-widest mb-6 uppercase">● LIVE NETWORK UPDATES</h2>
    <div className="space-y-4">
      {activities.length === 0 ? <p className="text-slate-500 italic">Monitoring network...</p> : 
      activities.map((act, i) => <div key={i} className="text-sm border-b border-emerald-500/10 pb-2 text-slate-300">{act.description}</div>)}
    </div>
  </section>
);

export default function App() {
  const [activeView, setActiveView] = useState(null);
  const [activities, setActivities] = useState([]);

  useEffect(() => {
    const fetchActivities = async () => {
      const { data } = await supabase.from('activities').select('description');
      if (data) setActivities(data);
    };
    fetchActivities();
  }, []);

  return (
    <div className="text-slate-100 font-mono min-h-screen flex flex-col bg-[#030712]">
      {/* NAVIGATION */}
      <nav className="p-6 border-b border-emerald-500/30 flex items-center justify-between sticky top-0 bg-[#030712]/90 backdrop-blur-lg z-50">
        <h1 className="text-xl font-black tracking-[0.3em] text-emerald-500 cursor-pointer uppercase" onClick={() => setActiveView(null)}>&gt; AML_DECODE</h1>
        <div className="hidden md:flex gap-6">
          {['NOTES', 'JOBS', 'SUBMIT', 'AVAILABLE', 'CONTRIBUTE', 'NETWORK'].map((item) => (
            <button key={item} onClick={() => setActiveView(item.toLowerCase())} className="text-xs font-black text-emerald-400 hover:text-white transition-all uppercase tracking-widest">{item}</button>
          ))}
        </div>
      </nav>

      {/* DYNAMIC CONTENT AREA */}
      <main className="flex-grow w-full">
        {!activeView ? (
          <>
            <section className="w-full relative bg-black">
              <video className="w-full h-[500px] object-cover" autoPlay muted loop playsInline>
                <source src="/intro.mp4" type="video/mp4" />
              </video>
            </section>
            <div className="max-w-7xl mx-auto px-6 py-16">
              <ActivityFeed activities={activities} />
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-24">
                <div onClick={() => setActiveView('network')} className="p-8 border border-purple-500/50 bg-purple-900/10 rounded cursor-pointer hover:bg-purple-900/20 text-center"><div className="text-4xl mb-4">🤝</div><h3 className="font-bold text-purple-400 uppercase tracking-widest">Featured Network</h3></div>
                {[ {id: 'notes', icon: '📖', label: 'Notes'}, {id: 'jobs', icon: '💼', label: 'Jobs'}, {id: 'referralForm', icon: '📤', label: 'Submit Referral'}, {id: 'available', icon: '🔍', label: 'Available Referral'}, {id: 'contribute', icon: '📁', label: 'Contribute'} ].map(card => (
                  <div key={card.id} onClick={() => setActiveView(card.id)} className="p-8 bg-slate-900 border border-emerald-500/20 rounded cursor-pointer hover:bg-slate-800"><div className="text-4xl mb-6">{card.icon}</div><h3 className="font-bold text-emerald-400 uppercase">{card.label}</h3></div>
                ))}
              </div>
              <section className="border-t border-white/5 pt-16"><h2 className="text-xl font-black text-red-500 mb-8 tracking-widest">● LATEST NEWS</h2><div className="grid grid-cols-1 md:grid-cols-3 gap-6">{kycNews.map((n, i) => <a key={i} href={n.link} target="_blank" className="block p-6 bg-[#030712]/80 border border-white/5 rounded hover:border-red-500"><h4 className="text-md font-semibold text-slate-200">{n.headline}</h4></a>)}</div></section>
            </div>
          </>
        ) : (
          <div className="max-w-4xl mx-auto p-12">
            <button onClick={() => setActiveView(null)} className="text-emerald-500 mb-8">&larr; BACK</button>
            <h1 className="text-4xl font-black uppercase text-emerald-500">{activeView} VIEW</h1>
            <p className="mt-4 text-slate-400">Content for {activeView} is loading...</p>
          </div>
        )}
      </main>

      <footer className="py-10 text-center text-slate-500 border-t border-white/5 uppercase text-xs tracking-widest">© 2026 AML_DECODE / Designed by @Nitesh</footer>
    </div>
  );
}