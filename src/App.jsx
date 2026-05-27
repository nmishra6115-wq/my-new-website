import React, { useState, useEffect, useMemo } from 'react';
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

  const channel = useMemo(() => supabase.channel('schema-db-changes'), []);

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
      } catch (err) {
        console.error("Error:", err);
      } finally {
        if (active) setIsLoading(false);
      }
    };

    fetchData();

    // Listener configured before subscribing
    channel
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'submissions' },
        (payload) => {
          setSubmissions((prev) => [...prev, payload.new]);
        }
      )
      .subscribe();

    return () => {
      active = false;
      supabase.removeChannel(channel);
    };
  }, [channel]);

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

      {/* MOBILE MENU */}
      {isMenuOpen && (
        <div className="md:hidden absolute top-20 left-0 w-full bg-[#030712]/95 border-b border-emerald-500/30 p-6 flex flex-col gap-4 z-50">
          {[ { label: 'NOTES', id: 'notes' }, { label: 'JOBS', id: 'jobs' }, { label: 'SUBMIT REFERRAL', id: 'referralForm' }, { label: 'AVAILABLE REFERRAL', id: 'available' }, { label: 'HR DASHBOARD', id: 'contribute' }, { label: 'NETWORK JOBS', id: 'network' } ].map((item) => (
            <button key={item.id} onClick={() => { setActiveView(item.id); setIsMenuOpen(false); }} className="text-lg font-black text-left text-emerald-400 uppercase">{item.label}</button>
          ))}
        </div>
      )}
      
      {/* ADVERTISEMENT MARQUEE */}
      <div className="w-full bg-emerald-950/20 border-y border-emerald-500/20 py-3 overflow-hidden">
        <div className="animate-slow-scroll whitespace-nowrap">
          <span className="text-emerald-500 font-black tracking-[0.2em] uppercase text-sm">
            ● ANNOUNCEMENTS: Upgrades in progress, fully functional by 05/28/2026.
          </span>
        </div>
      </div>
      
      {!activeView && (
        <main className="flex-grow">
          {/* DASHBOARD */}
          <div className="max-w-7xl mx-auto px-6 py-16">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-24">
              <div onClick={() => setActiveView('network')} className="p-8 border border-purple-500/50 bg-purple-900/10 rounded cursor-pointer hover:bg-purple-900/20 transition-all text-center">
                <div className="text-4xl mb-4">🤝</div>
                <h3 className="font-bold text-purple-400 uppercase tracking-widest mb-2">Featured Network</h3>
              </div>
              {[ {id: 'notes', icon: '📖', label: 'Notes', color: 'registry-card'}, {id: 'jobs', icon: '💼', label: 'Jobs', color: 'jobs-card'}, {id: 'referralForm', icon: '📤', label: 'Submit Referral', color: 'submit-card'}, {id: 'available', icon: '🔍', label: 'Available Referral', color: 'avail-card'}, {id: 'contribute', icon: '📁', label: 'HR Dashboard', color: 'upload-card'} ].map(card => (
                <div key={card.id} onClick={() => setActiveView(card.id)} className={`${card.color} p-8 border border-emerald-500/20 rounded cursor-pointer transition-all hover:translate-y-[-5px]`}><div className="text-4xl mb-6">{card.icon}</div><h3 className="font-bold text-emerald-400 uppercase">{card.label}</h3></div>
              ))}
            </div>
          </div>
        </main>
      )}
      
      {/* OVERLAY SECTION */}
      {activeView && (
        <div className="fixed inset-0 z-[100] bg-black/95 p-12 overflow-y-auto">
          <button onClick={() => setActiveView(null)} className="text-emerald-400 font-bold mb-10 hover:text-white">&larr; BACK</button>
          
          <div className="max-w-4xl mx-auto text-white">
            {/* REFERRAL FORM */}
            {activeView === 'referralForm' && (
              <form className="max-w-xl mx-auto space-y-4" onSubmit={async (e) => { 
                e.preventDefault(); 
                const newEntry = { name: e.target[0].value, email: e.target[1].value, company: e.target[2].value, role: e.target[3].value };
                const { error } = await supabase.from('submissions').insert([newEntry]);
                if (error) alert("Error: " + error.message);
                else { alert("Submitted!"); setSubmissions((prev) => [...prev, newEntry]); e.target.reset(); setActiveView(null); } 
              }}>
                <input type="text" placeholder="Full Name" className="w-full p-4 bg-[#030712] border border-slate-700 rounded" required />
                <input type="email" placeholder="Email" className="w-full p-4 bg-[#030712] border border-slate-700 rounded" required />
                <input type="text" placeholder="Company" className="w-full p-4 bg-[#030712] border border-slate-700 rounded" required />
                <input type="text" placeholder="Role" className="w-full p-4 bg-[#030712] border border-slate-700 rounded" required />
                <button type="submit" className="w-full py-4 bg-emerald-600 font-bold uppercase">Send Data</button>
              </form>
            )}

            {/* HR DASHBOARD */}
            {activeView === 'contribute' && (
              <div className="max-w-xl mx-auto border border-slate-800 p-16 text-center bg-[#030712]/50 rounded">
                {!isAuthorized ? (
                  <div className="space-y-4">
                    <input type="email" placeholder="Admin Email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full p-4 bg-black border border-emerald-500/30 rounded text-center" />
                    <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full p-4 bg-black border border-emerald-500/30 rounded text-center" />
                    <button onClick={async () => {
                      const { error } = await supabase.auth.signInWithPassword({ email, password });
                      if (error) alert(error.message); else setIsAuthorized(true);
                    }} className="w-full py-4 bg-emerald-600 font-bold uppercase hover:bg-emerald-500">Login to Upload</button>
                  </div>
                ) : (
                  <input type="file" onChange={async (e) => {
                    const file = e.target.files[0];
                    if(!file) return;
                    const { data, error } = await supabase.storage.from('partner-files').upload(`${Date.now()}_${file.name}`, file);
                    if (error) alert(error.message);
                    else {
                      const { data: publicUrlData } = supabase.storage.from('partner-files').getPublicUrl(data.path);
                      await supabase.from('partner_files').insert([{ name: file.name, url: publicUrlData.publicUrl }]);
                      alert("Uploaded!");
                    }
                  }} />
                )}
              </div>
            )} 
          </div>
        </div>
      )}
    </div>
  );
}