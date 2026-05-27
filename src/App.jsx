import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import { notesContent } from './content';
import { jobOpenings } from './jobs';
import { kycNews } from './news';

export default function App() {
  const [activeView, setActiveView] = useState(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [submissions, setSubmissions] = useState([]);
  const [partnerFiles, setPartnerFiles] = useState([]);

  useEffect(() => {
    let active = true;

    // Fetch initial data
    const fetchData = async () => {
      const { data: subs } = await supabase.from('submissions').select('*');
      const { data: files } = await supabase.from('partner_files').select('*');
      if (active) {
        if (subs) setSubmissions(subs);
        if (files) setPartnerFiles(files);
      }
    };
    fetchData();

    // Setup Realtime with correct order: Listeners FIRST, Subscribe LAST
    supabase.getChannels().forEach(c => supabase.removeChannel(c));
    const channel = supabase.channel('schema-db-changes');
    
    channel.on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'submissions' }, (payload) => {
      if (active) setSubmissions((prev) => [...prev, payload.new]);
    });
    channel.on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'partner_files' }, (payload) => {
      if (active) setPartnerFiles((prev) => [...prev, payload.new]);
    });

    channel.subscribe();

    return () => { active = false; supabase.removeChannel(channel); };
  }, []);

  return (
    <div className="text-slate-100 font-mono min-h-screen flex flex-col bg-[#030712]">
      {/* NAVBAR */}
      <nav className="p-6 border-b border-emerald-500/30 flex items-center justify-between sticky top-0 bg-[#030712]/90 backdrop-blur-lg z-50">
        <h1 className="text-xl font-black text-emerald-500 cursor-pointer uppercase" onClick={() => setActiveView(null)}>&gt; AML_DECODE</h1>
        <button className="md:hidden text-2xl" onClick={() => setIsMenuOpen(!isMenuOpen)}>{isMenuOpen ? "✕" : "☰"}</button>
        <div className="hidden md:flex gap-6">
          {[{label: 'NOTES', id: 'notes'}, {label: 'JOBS', id: 'jobs'}, {label: 'REFERRAL', id: 'referralForm'}, {label: 'HR', id: 'contribute'}, {label: 'NETWORK', id: 'network'}].map(item => (
            <button key={item.id} onClick={() => setActiveView(item.id)} className="text-xs font-black text-emerald-400 hover:text-white uppercase">{item.label}</button>
          ))}
        </div>
      </nav>

      {/* MOBILE MENU */}
      {isMenuOpen && (
        <div className="md:hidden bg-[#030712] border-b border-emerald-500/30 p-6 flex flex-col gap-4 z-40">
          {[{label: 'NOTES', id: 'notes'}, {label: 'JOBS', id: 'jobs'}, {label: 'REFERRAL', id: 'referralForm'}, {label: 'HR', id: 'contribute'}, {label: 'NETWORK', id: 'network'}].map(item => (
            <button key={item.id} onClick={() => { setActiveView(item.id); setIsMenuOpen(false); }} className="text-lg font-black text-emerald-400 uppercase text-left">{item.label}</button>
          ))}
        </div>
      )}

      {/* MAIN CONTENT AREA */}
      {!activeView ? (
        <main className="flex-grow">
          {/* VIDEO */}
          <section className="w-full bg-black">
            <video className="w-full h-[300px] md:h-[500px] object-cover" autoPlay muted loop playsInline><source src="/intro.mp4" type="video/mp4" /></video>
          </section>
          
          {/* CARDS */}
          <div className="max-w-7xl mx-auto px-6 py-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[ {id: 'network', icon: '🤝', label: 'Network'}, {id: 'notes', icon: '📖', label: 'Notes'}, {id: 'jobs', icon: '💼', label: 'Jobs'}, {id: 'referralForm', icon: '📤', label: 'Referral'}, {id: 'available', icon: '🔍', label: 'Available'}, {id: 'contribute', icon: '📁', label: 'HR Portal'} ].map(card => (
              <div key={card.id} onClick={() => setActiveView(card.id)} className="p-8 border border-emerald-500/20 rounded cursor-pointer hover:bg-emerald-950/20 transition-all">
                <div className="text-4xl mb-4">{card.icon}</div>
                <h3 className="font-bold text-emerald-400 uppercase">{card.label}</h3>
              </div>
            ))}
          </div>

          {/* NEWS SECTION */}
          <section className="bg-black p-16 border-t border-emerald-500/20">
            <div className="max-w-7xl mx-auto">
              <h2 className="text-emerald-500 font-bold mb-8 uppercase">&gt; Latest KYC News</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {kycNews.slice(0, 3).map((news, i) => (
                  <div key={i} className="p-6 bg-slate-900 border border-white/5 rounded">
                    <p className="text-white font-bold mb-2">{news.title}</p>
                    <p className="text-slate-500 text-xs">{news.date}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </main>
      ) : (
        <div className="fixed inset-0 z-[100] bg-black/95 p-12 overflow-y-auto">
           <button onClick={() => setActiveView(null)} className="text-emerald-400 font-bold mb-10">&larr; BACK</button>
           {/* Place your existing activeView logic here */}
        </div>
      )}

      {/* FOOTER */}
      <footer className="mt-auto border-t border-emerald-500/20 bg-[#030712] p-8 text-center text-slate-500 text-xs">
        <p>© 2026 AML_DECODE. All rights reserved.</p>
      </footer>
    </div>
  );
}