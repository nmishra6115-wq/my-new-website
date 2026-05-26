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
  const [activeView, setActiveView] = useState('home');
  const [activities, setActivities] = useState([]);

  useEffect(() => {
    const fetchActivities = async () => {
      const { data } = await supabase.from('activities').select('description');
      if (data) setActivities(data);
    };
    fetchActivities();
  }, []);

  // Main UI Structure
  return (
    <div className="min-h-screen bg-[#030712] text-slate-100 font-mono flex flex-col">
      {/* 1. NAVIGATION BAR */}
      <nav className="p-6 border-b border-emerald-500/30 flex justify-between items-center sticky top-0 bg-[#030712]/90 backdrop-blur-lg z-50">
        <h1 className="text-xl font-black text-emerald-500 cursor-pointer" onClick={() => setActiveView('home')}>&gt; AML_DECODE</h1>
        <div className="hidden md:flex gap-6 text-xs font-bold text-emerald-400">
          {['NOTES', 'JOBS', 'SUBMIT', 'AVAILABLE', 'CONTRIBUTE'].map(item => (
            <button key={item} onClick={() => setActiveView(item.toLowerCase())}>{item}</button>
          ))}
        </div>
      </nav>

      {/* 2. DYNAMIC CONTENT AREA */}
      <main className="flex-grow">
        {activeView === 'home' ? (
          <div className="max-w-7xl mx-auto px-6 py-16">
            <section className="w-full relative bg-black mb-16"><video className="w-full h-[500px] object-cover" autoPlay muted loop playsInline><source src="/intro.mp4" type="video/mp4" /></video></section>
            <ActivityFeed activities={activities} />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-24">
              <div onClick={() => setActiveView('network')} className="p-10 bg-slate-900 border border-emerald-500/20 cursor-pointer hover:bg-emerald-900/10 text-center"><div className="text-4xl mb-4">🤝</div><h3 className="font-bold text-emerald-400">FEATURED</h3></div>
              {[ {id: 'notes', label: 'NOTES', icon: '📖'}, {id: 'jobs', label: 'JOBS', icon: '💼'}, {id: 'submit', label: 'SUBMIT', icon: '📤'}, {id: 'available', label: 'AVAILABLE', icon: '🔍'}, {id: 'contribute', label: 'CONTRIBUTE', icon: '📁'} ].map(card => (
                <div key={card.id} onClick={() => setActiveView(card.id)} className="p-10 bg-slate-900 border border-emerald-500/20 cursor-pointer hover:bg-emerald-900/10 text-center"><div className="text-4xl mb-6">{card.icon}</div><h3 className="font-bold text-emerald-400">{card.label}</h3></div>
              ))}
            </div>
            <section className="border-t border-white/5 pt-16"><h2 className="text-xl font-black text-red-500 mb-8 uppercase">● LATEST NEWS</h2><div className="grid grid-cols-1 md:grid-cols-3 gap-6">{kycNews.map((n, i) => <a key={i} href={n.link} target="_blank" className="p-6 bg-[#030712] border border-white/5 hover:border-red-500">{n.headline}</a>)}</div></section>
          </div>
        ) : (
          <div className="max-w-4xl mx-auto p-12">
            <button onClick={() => setActiveView('home')} className="text-emerald-500 mb-8">← BACK</button>
            <h1 className="text-4xl font-black uppercase text-emerald-500 mb-8">{activeView}</h1>
            <div className="text-slate-300">
               {activeView === 'notes' && <pre className="whitespace-pre-wrap">{notesContent}</pre>}
               {activeView === 'jobs' && <pre className="whitespace-pre-wrap">{jobOpenings}</pre>}
               {activeView !== 'notes' && activeView !== 'jobs' && <p>Content for {activeView} is loading...</p>}
            </div>
          </div>
        )}
      </main>

      <footer className="py-10 text-center text-slate-500 border-t border-white/5 uppercase text-xs">© 2026 AML_DECODE</footer>
    </div>
  );
}