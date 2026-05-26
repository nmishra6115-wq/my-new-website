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

  return (
    <div className="min-h-screen w-full bg-[#030712] text-slate-100 font-mono">
      {/* NAVIGATION */}
      <nav className="fixed top-0 left-0 w-full p-6 bg-[#030712]/90 border-b border-emerald-500/30 backdrop-blur z-50 flex justify-between items-center">
        <h1 className="text-xl font-black text-emerald-500 cursor-pointer" onClick={() => setActiveView('home')}>&gt; AML_DECODE</h1>
        <div className="flex gap-6 text-xs font-bold text-emerald-400">
          {['NOTES', 'JOBS', 'SUBMIT', 'AVAILABLE', 'CONTRIBUTE'].map(item => (
            <button key={item} onClick={() => setActiveView(item.toLowerCase())} className="hover:text-white">{item}</button>
          ))}
        </div>
      </nav>

      {/* DYNAMIC CONTENT */}
      <div className="pt-24 w-full">
        {activeView === 'home' ? (
          <div className="w-full">
            {/* FULL SCREEN VIDEO */}
            <section className="w-full h-[60vh] overflow-hidden bg-black mb-16">
              <video className="w-full h-full object-cover" autoPlay muted loop playsInline>
                <source src="/intro.mp4" type="video/mp4" />
              </video>
            </section>

            <div className="max-w-7xl mx-auto px-6 pb-24">
              <section className="mb-16 border border-emerald-500/20 bg-emerald-950/10 p-8 rounded-lg">
                <h2 className="text-emerald-500 font-black tracking-widest mb-6">● LIVE NETWORK UPDATES</h2>
                {activities.map((act, i) => <p key={i} className="text-sm border-b border-emerald-500/10 py-2">{act.description}</p>)}
              </section>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {[ {id: 'notes', label: 'NOTES', icon: '📖'}, {id: 'jobs', label: 'JOBS', icon: '💼'}, {id: 'submit', label: 'SUBMIT', icon: '📤'}, {id: 'available', label: 'AVAILABLE', icon: '🔍'}, {id: 'contribute', label: 'CONTRIBUTE', icon: '📁'} ].map(card => (
                  <div key={card.id} onClick={() => setActiveView(card.id)} className="p-10 bg-slate-900 border border-emerald-500/20 cursor-pointer hover:bg-emerald-900/10 text-center">
                    <div className="text-4xl mb-4">{card.icon}</div>
                    <h3 className="font-bold text-emerald-400">{card.label}</h3>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="max-w-4xl mx-auto p-12 text-slate-300">
            <button onClick={() => setActiveView('home')} className="text-emerald-500 mb-8 underline">← BACK TO HOME</button>
            <h1 className="text-4xl font-black uppercase text-emerald-500 mb-8">{activeView}</h1>
            <pre className="whitespace-pre-wrap">{activeView === 'notes' ? notesContent : activeView === 'jobs' ? jobOpenings : 'Content loading...'}</pre>
          </div>
        )}
      </div>
    </div>
  );
}