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

  // Updated rendering for Array-based content
  const renderContent = (data) => {
    if (Array.isArray(data)) {
      return (
        <div className="space-y-8">
          {data.map((item, index) => (
            <div key={index} className="border-b border-emerald-500/20 pb-6">
              <h2 className="text-2xl font-bold text-emerald-400 mb-2">{item.title}</h2>
              <p className="text-slate-300 whitespace-pre-line leading-relaxed">{item.body}</p>
            </div>
          ))}
        </div>
      );
    }
    return <p className="text-slate-400">Content loading...</p>;
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#030712] text-slate-100 font-mono">
      {/* NAVIGATION */}
      <nav className="fixed top-0 w-full z-50 bg-[#030712]/95 border-b border-emerald-500/30 p-6 flex justify-between items-center">
        <h1 className="text-xl font-black text-emerald-500 cursor-pointer" onClick={() => setActiveView('home')}>&gt; AML_DECODE</h1>
        <div className="flex gap-6 text-xs font-bold text-emerald-400">
          <button onClick={() => setActiveView('notes')}>NOTES</button>
          <button onClick={() => setActiveView('jobs')}>JOBS</button>
        </div>
      </nav>

      {/* CONTENT AREA */}
      <main className="flex-grow pt-24 pb-10 w-full max-w-5xl mx-auto px-6">
        {activeView === 'home' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div onClick={() => setActiveView('notes')} className="p-10 bg-slate-900 border border-emerald-500/20 cursor-pointer hover:bg-emerald-900/10 text-center">NOTES</div>
            <div onClick={() => setActiveView('jobs')} className="p-10 bg-slate-900 border border-emerald-500/20 cursor-pointer hover:bg-emerald-900/10 text-center">JOBS</div>
          </div>
        ) : (
          <div className="bg-slate-900 p-8 border border-emerald-500/20">
            <button onClick={() => setActiveView('home')} className="text-emerald-500 mb-6 underline">← BACK</button>
            {renderContent(activeView === 'notes' ? notesContent : jobOpenings)}
          </div>
        )}
      </main>

      <footer className="py-6 text-center border-t border-white/5 text-xs text-slate-500">© 2026 AML_DECODE</footer>
    </div>
  );
}