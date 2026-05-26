import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import { notesContent } from './content';
import { jobOpenings } from './jobs';
import { kycNews } from './news';

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

  const renderContent = (data) => (
    <div className="space-y-8">
      {Array.isArray(data) ? data.map((item, i) => (
        <div key={i} className="border-b border-emerald-500/20 pb-6">
          <h2 className="text-2xl font-bold text-emerald-400 mb-2">{item.title}</h2>
          <p className="text-slate-300 whitespace-pre-line leading-relaxed">{item.body}</p>
        </div>
      )) : <p>Loading...</p>}
    </div>
  );

  return (
    <div className="min-h-screen bg-[#030712] text-slate-100 font-mono flex flex-col">
      {/* 1. NAVIGATION */}
      <nav className="fixed top-0 w-full z-50 bg-[#030712]/95 border-b border-emerald-500/30 p-6 flex justify-between items-center">
        <h1 className="text-xl font-black text-emerald-500 cursor-pointer" onClick={() => setActiveView('home')}>&gt; AML_DECODE</h1>
        <div className="hidden md:flex gap-6 text-xs font-bold text-emerald-400">
          {['NOTES', 'JOBS', 'SUBMIT', 'AVAILABLE', 'CONTRIBUTE'].map(item => (
            <button key={item} onClick={() => setActiveView(item.toLowerCase())}>{item}</button>
          ))}
        </div>
      </nav>

      {/* 2. MAIN CONTENT */}
      <main className="flex-grow pt-24 pb-20 w-full max-w-7xl mx-auto px-6">
        {activeView === 'home' ? (
          <>
            <section className="w-full h-[50vh] bg-black mb-16 overflow-hidden">
              <video className="w-full h-full object-cover" autoPlay muted loop playsInline><source src="/intro.mp4" type="video/mp4" /></video>
            </section>
            
            <section className="mb-16 border border-emerald-500/20 bg-emerald-950/10 p-8 rounded">
              <h2 className="text-emerald-500 font-black mb-6 uppercase">● LIVE NETWORK UPDATES</h2>
              {activities.map((act, i) => <p key={i} className="text-sm border-b border-white/5 py-2">{act.description}</p>)}
            </section>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-24">
              {[ {id: 'notes', label: 'NOTES', icon: '📖'}, {id: 'jobs', label: 'JOBS', icon: '💼'}, {id: 'submit', label: 'SUBMIT', icon: '📤'}, {id: 'available', label: 'AVAILABLE', icon: '🔍'}, {id: 'contribute', label: 'CONTRIBUTE', icon: '📁'} ].map(card => (
                <div key={card.id} onClick={() => setActiveView(card.id)} className="p-10 bg-slate-900 border border-emerald-500/20 cursor-pointer hover:bg-emerald-900/10 text-center">
                  <div className="text-4xl mb-6">{card.icon}</div>
                  <h3 className="font-bold text-emerald-400">{card.label}</h3>
                </div>
              ))}
            </div>

            <section className="border-t border-white/5 pt-16">
              <h2 className="text-xl font-black text-red-500 mb-8 uppercase">● LATEST NEWS</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {kycNews.map((n, i) => <a key={i} href={n.link} target="_blank" className="p-6 bg-[#030712] border border-white/5 hover:border-red-500">{n.headline}</a>)}
              </div>
            </section>
          </>
        ) : (
          <div className="bg-slate-900 p-8 border border-emerald-500/20">
            <button onClick={() => setActiveView('home')} className="text-emerald-500 mb-6 underline">← BACK</button>
            <h1 className="text-4xl font-black uppercase text-emerald-500 mb-8">{activeView}</h1>
            {renderContent(activeView === 'notes' ? notesContent : jobOpenings)}
          </div>
        )}
      </main>

      {/* 3. FOOTER */}
      <footer className="py-10 text-center border-t border-white/5 text-xs text-slate-500">© 2026 AML_DECODE</footer>
    </div>
  );
}