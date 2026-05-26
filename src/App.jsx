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

  // SIMPLE RENDER FUNCTION
  const renderView = () => {
    // 1. HOME VIEW
    if (activeView === 'home') {
      return (
        <div className="max-w-7xl mx-auto px-6 py-24">
          <section className="w-full h-[50vh] bg-black mb-16 overflow-hidden">
            <video className="w-full h-full object-cover" autoPlay muted loop playsInline>
              <source src="/intro.mp4" type="video/mp4" />
            </video>
          </section>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-24">
            {[ {id: 'notes', label: 'NOTES', icon: '📖'}, {id: 'jobs', label: 'JOBS', icon: '💼'}, {id: 'submit', label: 'SUBMIT', icon: '📤'} ].map(card => (
              <div key={card.id} onClick={() => setActiveView(card.id)} className="p-10 bg-slate-900 border border-emerald-500/20 cursor-pointer hover:bg-emerald-900/10 text-center">
                <div className="text-4xl mb-4">{card.icon}</div>
                <h3 className="font-bold text-emerald-400">{card.label}</h3>
              </div>
            ))}
          </div>
        </div>
      );
    }

    // 2. CONTENT VIEWS (NOTES/JOBS)
    if (activeView === 'notes' || activeView === 'jobs') {
      return (
        <div className="max-w-4xl mx-auto py-32 px-6">
          <button onClick={() => setActiveView('home')} className="text-emerald-500 mb-8 underline">← BACK TO HOME</button>
          <h1 className="text-4xl font-black uppercase text-emerald-500 mb-8">{activeView}</h1>
          <pre className="whitespace-pre-wrap text-slate-300 font-sans leading-relaxed">
            {activeView === 'notes' ? notesContent : jobOpenings}
          </pre>
        </div>
      );
    }

    // 3. FALLBACK (If something goes wrong)
    return (
      <div className="p-20 text-center">
        <p className="text-red-500">View not found.</p>
        <button onClick={() => setActiveView('home')} className="text-emerald-500 underline mt-4">Return Home</button>
      </div>
    );
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#030712] text-slate-100 font-mono">
      <nav className="fixed top-0 w-full z-50 p-6 bg-[#030712]/90 border-b border-emerald-500/30 flex justify-between items-center">
        <h1 className="text-xl font-black text-emerald-500 cursor-pointer" onClick={() => setActiveView('home')}>&gt; AML_DECODE</h1>
        <div className="flex gap-6 text-xs font-bold text-emerald-400">
          <button onClick={() => setActiveView('notes')}>NOTES</button>
          <button onClick={() => setActiveView('jobs')}>JOBS</button>
        </div>
      </nav>

      <main className="flex-grow">{renderView()}</main>

      <footer className="py-10 text-center text-slate-500 border-t border-white/5 uppercase text-xs">
        © 2026 AML_DECODE
      </footer>
    </div>
  );
}