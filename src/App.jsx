import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient'; // Make sure this file exists in /src
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
  const [pageIndex, setPageIndex] = useState(0);
  const [isMuted, setIsMuted] = useState(true);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [activities, setActivities] = useState([]); // Supabase data state

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 2000);
    
    // Fetch data from Supabase
    const fetchActivities = async () => {
      const { data } = await supabase.from('activities').select('*').order('created_at', { ascending: false });
      if (data) setActivities(data);
    };
    fetchActivities();
    
    return () => clearTimeout(timer);
  }, []);

  const handleSaveActivity = async (type, desc) => {
    await supabase.from('activities').insert([{ activity_type: type, description: desc }]);
    const { data } = await supabase.from('activities').select('*').order('created_at', { ascending: false });
    if (data) setActivities(data);
  };

  return (
    <div className="text-slate-100 font-mono min-h-screen flex flex-col relative bg-[#030712]">
      {/* NAVIGATION */}
      <nav className="p-6 border-b border-emerald-500/30 flex items-center justify-between sticky top-0 bg-[#030712]/90 backdrop-blur-lg z-50 w-full">
        <h1 className="text-xl font-black tracking-[0.3em] text-emerald-500 cursor-pointer uppercase" onClick={() => setActiveView(null)}>&gt; AML_DECODE</h1>
        <button className="md:hidden text-emerald-500" onClick={() => setIsMenuOpen(!isMenuOpen)}>☰</button>
      </nav>

      {!activeView && (
        <main className="flex-grow">
          {/* VIDEO SECTION */}
          <section className="w-full relative bg-black">
             <video className="w-full h-[500px] object-cover" autoPlay muted={isMuted} loop playsInline>
               <source src="/intro.mp4" type="video/mp4" />
             </video>
          </section>

          <div className="max-w-7xl mx-auto px-6 py-16">
            <ActivityFeed activities={activities} /> {/* DB Data Feed */}
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-24">
              {[ {id: 'notes', icon: '📖', label: 'Notes'}, {id: 'jobs', icon: '💼', label: 'Jobs'}, {id: 'referralForm', icon: '📤', label: 'Submit Referral'} ].map(card => (
                <div key={card.id} onClick={() => setActiveView(card.id)} className="p-8 bg-slate-900 border border-emerald-500/20 rounded cursor-pointer">
                  <div className="text-4xl mb-6">{card.icon}</div>
                  <h3 className="font-bold text-emerald-400 uppercase">{card.label}</h3>
                </div>
              ))}
            </div>
          </div>
        </main>
      )}

      {/* OVERLAY SECTION */}
      {activeView && (
        <div className="fixed inset-0 z-[100] bg-black/95 p-12 overflow-y-auto">
          <button onClick={() => setActiveView(null)} className="text-emerald-400 font-bold mb-10">&larr; BACK</button>
          
          {/* REFERRAL FORM */}
          {activeView === 'referralForm' && (
            <div className="max-w-xl mx-auto">
              <form className="space-y-4" onSubmit={(e) => { 
                e.preventDefault(); 
                handleSaveActivity('referral', `Referral: ${e.target[0].value} for ${e.target[3].value}`);
                alert("Submitted to Network!"); 
              }}>
                <input type="text" placeholder="Full Name" className="w-full p-4 bg-black border border-slate-700 rounded" required />
                <input type="text" placeholder="Role" className="w-full p-4 bg-black border border-slate-700 rounded" required />
                <button type="submit" className="w-full py-4 bg-emerald-600 font-bold uppercase">Send Data</button>
              </form>
            </div>
          )}
          
          {/* ... Add other views (notes, jobs, etc) here ... */}
        </div>
      )}
    </div>
  );
}