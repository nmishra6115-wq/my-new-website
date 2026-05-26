import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import { notesContent } from './content';
import { jobOpenings } from './jobs';
import { kycNews } from './news';

const NewsSkeleton = () => (
  <div className="block p-6 bg-slate-900 border border-white/5 rounded animate-pulse">
    <div className="h-4 bg-slate-800 rounded w-full mb-4"></div>
    <div className="h-4 bg-slate-800 rounded w-2/3"></div>
  </div>
);

const ActivityFeed = ({ activities }) => (
  <section className="my-16 border border-emerald-500/20 bg-emerald-950/10 p-8 rounded-lg">
    <h2 className="text-emerald-500 font-black tracking-widest mb-6 uppercase">● LIVE NETWORK UPDATES</h2>
    <div className="space-y-4">
      {activities.length === 0 ? (
        <p className="text-slate-500 italic">Monitoring network for new activity...</p>
      ) : (
        activities.map((act, i) => (
          <div key={i} className="text-sm border-b border-emerald-500/10 pb-2 text-slate-300">
            {act.description}
          </div>
        ))
      )}
    </div>
  </section>
);

export default function App() {
  const [activeView, setActiveView] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activities, setActivities] = useState([]);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 2000);
    const fetchActivities = async () => {
      const { data } = await supabase.from('activities').select('description');
      if (data) setActivities(data);
    };
    fetchActivities();
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="text-slate-100 font-mono min-h-screen flex flex-col bg-[#030712]">
      {/* NAVIGATION BAR */}
      <nav className="p-6 border-b border-emerald-500/30 flex items-center justify-between sticky top-0 bg-[#030712]/90 backdrop-blur-lg z-50">
        <h1 className="text-xl font-black tracking-[0.3em] text-emerald-500 cursor-pointer uppercase" onClick={() => setActiveView(null)}>&gt; AML_DECODE</h1>
      </nav>

      {!activeView && (
        <main className="flex-grow w-full">
          {/* VIDEO */}
          <section className="w-full relative bg-black">
            <video className="w-full h-[500px] object-cover" autoPlay muted loop playsInline>
              <source src="/intro.mp4" type="video/mp4" />
            </video>
          </section>

          {/* DASHBOARD */}
          <div className="max-w-7xl mx-auto px-6 py-16">
            <ActivityFeed activities={activities} />
            
            {/* CARDS */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-24">
              {[ {id: 'notes', icon: '📖', label: 'Notes'}, {id: 'jobs', icon: '💼', label: 'Jobs'}, {id: 'referralForm', icon: '📤', label: 'Submit Referral'} ].map(card => (
                <div key={card.id} onClick={() => setActiveView(card.id)} className="p-8 bg-slate-900 border border-emerald-500/20 rounded cursor-pointer hover:bg-slate-800 transition-all">
                  <div className="text-4xl mb-6">{card.icon}</div>
                  <h3 className="font-bold text-emerald-400 uppercase">{card.label}</h3>
                </div>
              ))}
            </div>

            {/* NEWS */}
            <section className="border-t border-white/5 pt-16">
              <h2 className="text-xl font-black text-red-500 mb-8 tracking-widest">● LATEST NEWS</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {isLoading ? <><NewsSkeleton /><NewsSkeleton /><NewsSkeleton /></> : kycNews.map((n, i) => (
                  <a key={i} href={n.link} target="_blank" rel="noopener noreferrer" className="block p-6 bg-[#030712]/80 border border-white/5 rounded hover:border-red-500 transition-all"><h4 className="text-md font-semibold text-slate-200 mb-4">{n.headline}</h4></a>
                ))}
              </div>
            </section>
          </div>
        </main>
      )}

      {/* FOOTER */}
      <footer className="py-10 text-center text-slate-500 border-t border-white/5 uppercase text-xs tracking-widest">
        © 2026 AML_DECODE / Designed by @Nitesh
      </footer>
    </div>
  );
}