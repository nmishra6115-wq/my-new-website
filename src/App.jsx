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

export default function App() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [activeView, setActiveView] = useState(null);
  const [pageIndex, setPageIndex] = useState(0);
  const [isMuted, setIsMuted] = useState(true);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [submissions, setSubmissions] = useState([]);
  const [partnerFiles, setPartnerFiles] = useState([]);
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    let active = true;

    const fetchData = async () => {
      try {
        const { data: subs } = await supabase.from('submissions').select('*');
        const { data: files } = await supabase.from('partner_files').select('*');
        if (active) {
          if (subs) setSubmissions(subs);
          if (files) setPartnerFiles(files);
        }
      } catch (err) { console.error("Error:", err); }
      finally { if (active) setIsLoading(false); }
    };
    fetchData();

    // Clean up to prevent duplicate subscriptions
    supabase.getChannels().forEach(c => supabase.removeChannel(c));

    const channel = supabase.channel('schema-db-changes');
    channel
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'submissions' }, (payload) => {
        if (active) setSubmissions((prev) => [...prev, payload.new]);
      })
      .subscribe();

    return () => {
      active = false;
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <div className="text-slate-100 font-mono min-h-screen flex flex-col relative bg-[#030712]">
      
      {/* NAVIGATION */}
      <nav className="p-6 border-b border-emerald-500/30 flex items-center justify-between sticky top-0 bg-[#030712]/90 backdrop-blur-lg z-50 w-full shadow-[0_0_20px_rgba(16,185,129,0.1)]">
        <h1 className="text-xl md:text-2xl font-black tracking-[0.3em] text-emerald-500 cursor-pointer uppercase hover:text-white transition-all" onClick={() => setActiveView(null)}>&gt; AML_DECODE</h1>
        <div className="hidden md:flex gap-6 items-center">
          {[ { label: 'NOTES', id: 'notes' }, { label: 'JOBS', id: 'jobs' }, { label: 'SUBMIT REFERRAL', id: 'referralForm' }, { label: 'AVAILABLE REFERRAL', id: 'available' }, { label: 'HR DASHBOARD', id: 'contribute' }, { label: 'NETWORK JOBS', id: 'network' } ].map((item) => (
            <button key={item.id} onClick={() => setActiveView(item.id)} className="text-xs font-black text-emerald-400 hover:text-white transition-all uppercase tracking-widest">{item.label}</button>
          ))}
        </div>
        <button className="md:hidden text-emerald-500 text-2xl z-[60]" onClick={() => setIsMenuOpen(!isMenuOpen)}>{isMenuOpen ? "✕" : "☰"}</button>
      </nav>

      {!activeView && (
        <main className="flex-grow">
          {/* VIDEO SECTION */}
          <section className="w-full relative bg-black">
            <video className="w-full h-[500px] object-cover" autoPlay muted={isMuted} loop playsInline><source src="/intro.mp4" type="video/mp4" /></video>
            <button onClick={() => setIsMuted(!isMuted)} className="absolute bottom-8 right-8 bg-black/50 text-emerald-500 border border-emerald-500/50 px-4 py-2 rounded-lg z-20">
              {isMuted ? "🔇 Unmute" : "🔊 Mute"}
            </button>
          </section>

          {/* DASHBOARD */}
          <div className="max-w-7xl mx-auto px-6 py-16">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-24">
              {[ {id: 'network', icon: '🤝', label: 'Featured Network', color: 'bg-purple-900/10'}, {id: 'notes', icon: '📖', label: 'Notes'}, {id: 'jobs', icon: '💼', label: 'Jobs'}, {id: 'referralForm', icon: '📤', label: 'Submit Referral'}, {id: 'available', icon: '🔍', label: 'Available Referral'}, {id: 'contribute', icon: '📁', label: 'HR Dashboard'} ].map(card => (
                <div key={card.id} onClick={() => setActiveView(card.id)} className={`p-8 border border-emerald-500/20 rounded cursor-pointer transition-all hover:translate-y-[-5px] ${card.color || ''}`}>
                  <div className="text-4xl mb-6">{card.icon}</div>
                  <h3 className="font-bold text-emerald-400 uppercase">{card.label}</h3>
                </div>
              ))}
            </div>
            
            {/* LATEST NEWS */}
            <section className="border-t border-white/5 pt-16">
              <h2 className="text-xl font-black text-red-500 mb-8 tracking-widest">● LATEST NEWS</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {isLoading ? <><NewsSkeleton /><NewsSkeleton /><NewsSkeleton /></> : kycNews.map((n, i) => (
                  <a key={i} href={n.link} target="_blank" rel="noopener noreferrer" className="block p-6 bg-[#030712]/80 border border-white/5 rounded hover:border-red-500 transition-all">
                    <h4 className="text-md font-semibold text-slate-200">{n.headline}</h4>
                  </a>
                ))}
              </div>
            </section>
          </div>
        </main>
      )}

      {/* OVERLAY SECTION (All your views here) */}
      {activeView && (
        <div className="fixed inset-0 z-[100] bg-black/95 p-12 overflow-y-auto">
          <button onClick={() => setActiveView(null)} className="text-emerald-400 font-bold mb-10">&larr; BACK</button>
          {/* ... Add back your specific views here (notes, jobs, forms, etc) ... */}
        </div>
      )}

      <footer className="py-10 text-center text-slate-500 border-t border-white/5 uppercase text-xs tracking-widest">© 2026 AML_DECODE</footer>
    </div>
  );
}