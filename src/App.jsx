import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import { kycNews } from './news';

// 1. SMALL, SAFE COMPONENTS
const ActivityFeed = ({ activities }) => (
  <section className="my-8 border border-emerald-500/20 bg-emerald-950/10 p-6 rounded">
    <h2 className="text-emerald-500 mb-4 font-black uppercase tracking-widest">● LIVE UPDATES</h2>
    {activities.map((act, i) => (
      <p key={i} className="text-sm border-b border-white/5 py-2">{act.description}</p>
    ))}
  </section>
);

// 2. MAIN APP
export default function App() {
  const [activeView, setActiveView] = useState('home');
  const [activities, setActivities] = useState([]);

  useEffect(() => {
    const fetchActivities = async () => {
      // Safely fetching only the description column
      const { data } = await supabase.from('activities').select('description');
      if (data) setActivities(data);
    };
    fetchActivities();
  }, []);

  // 3. RENDER CONTENT BASED ON VIEW
  const renderContent = () => {
    if (activeView === 'home') {
      return (
        <div className="max-w-5xl mx-auto p-6">
          <ActivityFeed activities={activities} />
          <div className="grid grid-cols-2 gap-4">
            <div onClick={() => setActiveView('notes')} className="p-10 bg-slate-900 border border-emerald-500/20 cursor-pointer hover:bg-emerald-900/10">NOTES</div>
            <div onClick={() => setActiveView('jobs')} className="p-10 bg-slate-900 border border-emerald-500/20 cursor-pointer hover:bg-emerald-900/10">JOBS</div>
          </div>
        </div>
      );
    }
    return (
      <div className="max-w-5xl mx-auto p-10">
        <button onClick={() => setActiveView('home')} className="text-emerald-500 mb-6">← BACK</button>
        <h1 className="text-3xl uppercase font-bold text-emerald-400">{activeView}</h1>
        <p className="mt-4 text-slate-300">Content for {activeView} is loading...</p>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#030712] text-slate-100 font-mono">
      <nav className="p-6 border-b border-emerald-500/30 flex justify-between items-center sticky top-0 bg-[#030712]/90 z-50">
        <h1 className="text-xl font-black text-emerald-500 cursor-pointer" onClick={() => setActiveView('home')}>&gt; AML_DECODE</h1>
        <div className="flex gap-4 text-xs font-bold text-emerald-400">
          <button onClick={() => setActiveView('notes')}>NOTES</button>
          <button onClick={() => setActiveView('jobs')}>JOBS</button>
        </div>
      </nav>
      {renderContent()}
    </div>
  );
}