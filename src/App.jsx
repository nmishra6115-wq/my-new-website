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
  const [activeView, setActiveView] = useState(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [submissions, setSubmissions] = useState([]);
  const [partnerFiles, setPartnerFiles] = useState([]);
  const [isAuthorized, setIsAuthorized] = useState(false);

  // Fetch data on mount
  useEffect(() => {
    const fetchData = async () => {
      const { data: subs } = await supabase.from('submissions').select('*');
      const { data: files } = await supabase.from('partner_files').select('*');
      if (subs) setSubmissions(subs);
      if (files) setPartnerFiles(files);
    };
    fetchData();
    const timer = setTimeout(() => setIsLoading(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="text-slate-100 font-mono min-h-screen flex flex-col relative bg-[#030712]">
      
      {/* NAVIGATION */}
      <nav className="p-6 border-b border-emerald-500/30 flex items-center justify-between sticky top-0 bg-[#030712]/90 backdrop-blur-lg z-50 w-full">
        <h1 className="text-xl font-black tracking-[0.3em] text-emerald-500 cursor-pointer uppercase hover:text-white" onClick={() => setActiveView(null)}>&gt; AML_DECODE</h1>
        <button className="md:hidden text-emerald-500 text-2xl" onClick={() => setIsMenuOpen(!isMenuOpen)}>
          {isMenuOpen ? "✕" : "☰"}
        </button>
      </nav>

      {/* MARQUEE */}
      <div className="w-full bg-emerald-950/20 border-b border-emerald-500/20 py-3 overflow-hidden">
        <div className="whitespace-nowrap text-emerald-500 text-sm font-black uppercase">
          ● ANNOUNCEMENTS: New Jobs Added ● KPMG Hiring in Bengaluru ● Wells Fargo Referral Available.
        </div>
      </div>

      <main className="flex-grow">
        {!activeView ? (
          <div className="max-w-7xl mx-auto px-6 py-16">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-24">
               {[ {id: 'referralForm', label: 'Submit Referral'}, {id: 'contribute', label: 'HR Dashboard'}, {id: 'network', label: 'Network'} ].map(card => (
                 <div key={card.id} onClick={() => setActiveView(card.id)} className="p-8 border border-emerald-500/20 rounded cursor-pointer hover:bg-emerald-900/20 transition-all">
                   <h3 className="font-bold text-emerald-400 uppercase">{card.label}</h3>
                 </div>
               ))}
            </div>
            
            <section className="border-t border-white/5 pt-16">
              <h2 className="text-xl font-black text-red-500 mb-8">● LATEST NEWS</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {isLoading ? <><NewsSkeleton /><NewsSkeleton /><NewsSkeleton /></> : kycNews.map((n, i) => (
                  <a key={i} href={n.link} target="_blank" rel="noopener noreferrer" className="block p-6 bg-[#030712]/80 border border-white/5 rounded"><h4 className="text-slate-200">{n.headline}</h4></a>
                ))}
              </div>
            </section>
          </div>
        ) : (
          <div className="p-12">
            <button onClick={() => setActiveView(null)} className="text-emerald-400 mb-10">&larr; BACK</button>
            
            {activeView === 'referralForm' && (
              <form onSubmit={async (e) => { 
                e.preventDefault(); 
                const data = {name: e.target[0].value, email: e.target[1].value, company: e.target[2].value, role: e.target[3].value}; 
                const { error } = await supabase.from('submissions').insert([data]);
                if (!error) { setSubmissions([...submissions, data]); alert("Submitted!"); }
              }}>
                <input className="w-full p-4 bg-black border border-slate-700 rounded mb-4" placeholder="Name" required />
                <input className="w-full p-4 bg-black border border-slate-700 rounded mb-4" placeholder="Email" required />
                <input className="w-full p-4 bg-black border border-slate-700 rounded mb-4" placeholder="Company" required />
                <input className="w-full p-4 bg-black border border-slate-700 rounded mb-4" placeholder="Role" required />
                <button type="submit" className="w-full py-4 bg-emerald-600 font-black">SEND DATA</button>
              </form>
            )}

            {activeView === 'contribute' && (
              <div className="max-w-xl mx-auto p-16 border border-slate-800 text-center">
                {!isAuthorized ? (
                  <input type="password" placeholder="Enter Secure Key" className="w-full p-4 bg-black border border-emerald-500/30 rounded" onKeyDown={(e) => { if (e.key === 'Enter' && e.target.value === 'my-super-secret-123') setIsAuthorized(true); }} />
                ) : (
                  <input type="file" onChange={async (e) => {
                    const file = e.target.files[0];
                    if (!file) return;
                    const { data: uploadData } = await supabase.storage.from('partner-files').upload(`${Date.now()}_${file.name}`, file);
                    const { data: { publicUrl } } = supabase.storage.from('partner-files').getPublicUrl(uploadData.path);
                    await supabase.from('partner_files').insert([{ name: file.name, url: publicUrl }]);
                    setPartnerFiles([...partnerFiles, { name: file.name, url: publicUrl }]);
                    alert("Upload Success!");
                  }} />
                )}
              </div>
            )}
          </div>
        )}
      </main>

      <footer className="py-10 text-center text-slate-500 border-t border-white/5 uppercase text-xs">
        © 2026 AML_DECODE
      </footer>
    </div>
  );
}