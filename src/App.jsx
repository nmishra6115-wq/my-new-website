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

    // 1. Fetch initial data
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

    // 2. Safely initialize Realtime listener
    const channel = supabase.channel('schema-db-changes');
    
    channel
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'submissions' },
        (payload) => {
          if (active) setSubmissions((prev) => [...prev, payload.new]);
        }
      )
      .subscribe();

    // 3. Cleanup to prevent duplicate subscriptions
    return () => {
      active = false;
      supabase.removeChannel(channel);
    };
  }, []); // Empty array ensures this runs exactly once on mount

  return (
    <div className="text-slate-100 font-mono min-h-screen flex flex-col relative bg-[#030712]">
      
      {/* NAVIGATION */}
      <nav className="p-6 border-b border-emerald-500/30 flex items-center justify-between sticky top-0 bg-[#030712]/90 backdrop-blur-lg z-50 w-full shadow-[0_0_20px_rgba(16,185,129,0.1)]">
        <h1 className="text-xl md:text-2xl font-black tracking-[0.3em] text-emerald-500 cursor-pointer uppercase hover:text-white transition-all" onClick={() => setActiveView(null)}>&gt; AML_DECODE</h1>
        <button className="md:hidden text-emerald-500 text-2xl z-[60]" onClick={() => setIsMenuOpen(!isMenuOpen)}>{isMenuOpen ? "✕" : "☰"}</button>
      </nav>

      {/* DASHBOARD CONTENT */}
      {!activeView && (
        <main className="flex-grow">
          <div className="max-w-7xl mx-auto px-6 py-16">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-24">
              <div onClick={() => setActiveView('network')} className="p-8 border border-purple-500/50 bg-purple-900/10 rounded cursor-pointer hover:bg-purple-900/20 transition-all text-center">
                <h3 className="font-bold text-purple-400 uppercase tracking-widest mb-2">Featured Network</h3>
              </div>
              {[ {id: 'referralForm', label: 'Submit Referral'}, {id: 'available', label: 'Available Referral'}, {id: 'contribute', label: 'HR Dashboard'}, {id: 'network', label: 'Network Jobs'} ].map(card => (
                <div key={card.id} onClick={() => setActiveView(card.id)} className="p-8 border border-emerald-500/20 rounded cursor-pointer transition-all hover:translate-y-[-5px]">
                  <h3 className="font-bold text-emerald-400 uppercase">{card.label}</h3>
                </div>
              ))}
            </div>
          </div>
        </main>
      )}
      
      {/* OVERLAYS */}
      {activeView && (
        <div className="fixed inset-0 z-[100] bg-black/95 p-12 overflow-y-auto">
          <button onClick={() => setActiveView(null)} className="text-emerald-400 font-bold mb-10 hover:text-white">&larr; BACK</button>
          
          <div className="max-w-4xl mx-auto text-white">
            {activeView === 'referralForm' && (
              <form className="max-w-xl mx-auto space-y-4" onSubmit={async (e) => { 
                e.preventDefault(); 
                const newEntry = { name: e.target[0].value, email: e.target[1].value, company: e.target[2].value, role: e.target[3].value };
                const { error } = await supabase.from('submissions').insert([newEntry]);
                if (error) alert("Error: " + error.message); else { alert("Submitted!"); setActiveView(null); } 
              }}>
                <input type="text" placeholder="Full Name" className="w-full p-4 bg-[#030712] border border-slate-700 rounded" required />
                <input type="email" placeholder="Email" className="w-full p-4 bg-[#030712] border border-slate-700 rounded" required />
                <input type="text" placeholder="Company" className="w-full p-4 bg-[#030712] border border-slate-700 rounded" required />
                <input type="text" placeholder="Role" className="w-full p-4 bg-[#030712] border border-slate-700 rounded" required />
                <button type="submit" className="w-full py-4 bg-emerald-600 font-bold uppercase">Send Data</button>
              </form>
            )}

            {activeView === 'contribute' && (
              <div className="max-w-xl mx-auto border border-slate-800 p-16 text-center bg-[#030712]/50 rounded">
                {!isAuthorized ? (
                  <div className="space-y-4">
                    <input type="email" placeholder="Admin Email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full p-4 bg-black border border-emerald-500/30 rounded" />
                    <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full p-4 bg-black border border-emerald-500/30 rounded" />
                    <button onClick={async () => {
                      const { error } = await supabase.auth.signInWithPassword({ email, password });
                      if (error) alert(error.message); else setIsAuthorized(true);
                    }} className="w-full py-4 bg-emerald-600 font-bold uppercase">Login</button>
                  </div>
                ) : (
                  <input type="file" onChange={async (e) => {
                    const file = e.target.files[0];
                    if(!file) return;
                    const { data, error } = await supabase.storage.from('partner-files').upload(`${Date.now()}_${file.name}`, file);
                    if (error) alert(error.message);
                    else {
                      const { data: urlData } = supabase.storage.from('partner-files').getPublicUrl(data.path);
                      await supabase.from('partner_files').insert([{ name: file.name, url: urlData.publicUrl }]);
                      alert("Uploaded!");
                    }
                  }} />
                )}
              </div>
            )}
            
            {activeView === 'network' && (
              <div className="max-w-4xl mx-auto">
                {partnerFiles.map((f, i) => (
                  <div key={i} className="p-6 mb-4 bg-slate-900 border border-purple-500/30 rounded flex justify-between items-center">
                    <span>{f.name}</span>
                    <button onClick={() => window.open(f.url, '_blank')} className="text-purple-400">View</button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}