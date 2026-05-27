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
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [submissions, setSubmissions] = useState([]);
  const [partnerFiles, setPartnerFiles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let active = true;

    const fetchData = async () => {
      const { data: subs } = await supabase.from('submissions').select('*');
      const { data: files } = await supabase.from('partner_files').select('*');
      if (active) {
        if (subs) setSubmissions(subs);
        if (files) setPartnerFiles(files);
        setIsLoading(false);
      }
    };
    fetchData();

    supabase.getChannels().forEach(c => supabase.removeChannel(c));
    const channel = supabase.channel('schema-db-changes');
    channel.on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'submissions' }, (payload) => {
      if (active) setSubmissions((prev) => [...prev, payload.new]);
    }).subscribe();

    return () => { active = false; supabase.removeChannel(channel); };
  }, []);

  return (
    <div className="text-slate-100 font-mono min-h-screen bg-[#030712] relative">
      {/* NAVIGATION */}
      <nav className="p-6 border-b border-emerald-500/30 flex items-center justify-between sticky top-0 bg-[#030712]/90 backdrop-blur-md z-50">
        <h1 className="text-xl font-black text-emerald-500 cursor-pointer" onClick={() => setActiveView(null)}>&gt; AML_DECODE</h1>
        <div className="hidden md:flex gap-6">
          {[ {label: 'NOTES', id: 'notes'}, {label: 'JOBS', id: 'jobs'}, {label: 'REFERRAL', id: 'referralForm'}, {label: 'HR', id: 'contribute'}, {label: 'NETWORK', id: 'network'} ].map(item => (
            <button key={item.id} onClick={() => setActiveView(item.id)} className="text-xs font-black text-emerald-400 uppercase">{item.label}</button>
          ))}
        </div>
        <button className="md:hidden text-2xl" onClick={() => setIsMenuOpen(!isMenuOpen)}>☰</button>
      </nav>

      {/* MOBILE MENU */}
      {isMenuOpen && (
        <div className="md:hidden p-6 flex flex-col gap-4 border-b border-emerald-500/30">
          {[ {label: 'NOTES', id: 'notes'}, {label: 'JOBS', id: 'jobs'}, {label: 'REFERRAL', id: 'referralForm'}, {label: 'HR', id: 'contribute'}, {label: 'NETWORK', id: 'network'} ].map(item => (
            <button key={item.id} onClick={() => { setActiveView(item.id); setIsMenuOpen(false); }} className="text-lg font-black text-left text-emerald-400 uppercase">{item.label}</button>
          ))}
        </div>
      )}

      {/* MAIN CONTENT AREA */}
      {!activeView && (
        <main className="p-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div onClick={() => setActiveView('network')} className="p-8 border border-purple-500/50 bg-purple-900/10 rounded cursor-pointer hover:bg-purple-900/20">
              <h3 className="font-bold text-purple-400 uppercase">Featured Network</h3>
            </div>
            {[ {id: 'notes', label: 'Notes'}, {id: 'jobs', label: 'Jobs'}, {id: 'referralForm', label: 'Submit Referral'} ].map(c => (
              <div key={c.id} onClick={() => setActiveView(c.id)} className="p-8 border border-emerald-500/20 rounded cursor-pointer hover:border-emerald-500">
                <h3 className="font-bold text-emerald-400 uppercase">{c.label}</h3>
              </div>
            ))}
          </div>
        </main>
      )}

      {/* OVERLAY SECTION */}
      {activeView && (
        <div className="fixed inset-0 z-[100] bg-black/95 p-12 overflow-y-auto">
          <button onClick={() => setActiveView(null)} className="text-emerald-400 mb-10">&larr; BACK</button>
          <div className="max-w-4xl mx-auto">
            {activeView === 'referralForm' && (
              <form className="space-y-4" onSubmit={async (e) => { 
                e.preventDefault(); 
                const { error } = await supabase.from('submissions').insert([{ name: e.target[0].value, email: e.target[1].value, company: e.target[2].value, role: e.target[3].value }]);
                if (!error) { alert("Submitted!"); setActiveView(null); }
              }}>
                <input className="w-full p-4 bg-[#030712] border border-slate-700" placeholder="Full Name" required />
                <input className="w-full p-4 bg-[#030712] border border-slate-700" placeholder="Email" required />
                <input className="w-full p-4 bg-[#030712] border border-slate-700" placeholder="Company" required />
                <input className="w-full p-4 bg-[#030712] border border-slate-700" placeholder="Role" required />
                <button type="submit" className="w-full py-4 bg-emerald-600 font-bold">SEND</button>
              </form>
            )}
            {activeView === 'contribute' && (
              <div className="p-16 border border-slate-800 text-center">
                {!isAuthorized ? (
                  <div className="space-y-4">
                    <input type="email" placeholder="Email" onChange={(e) => setEmail(e.target.value)} className="w-full p-4 bg-black border border-slate-700" />
                    <input type="password" placeholder="Password" onChange={(e) => setPassword(e.target.value)} className="w-full p-4 bg-black border border-slate-700" />
                    <button onClick={async () => {
                      const { error } = await supabase.auth.signInWithPassword({ email, password });
                      if (!error) setIsAuthorized(true); else alert(error.message);
                    }} className="w-full py-4 bg-emerald-600">LOGIN</button>
                  </div>
                ) : (
                  <input type="file" onChange={async (e) => {
                    const file = e.target.files[0];
                    if(!file) return;
                    const { data } = await supabase.storage.from('partner-files').upload(`${Date.now()}_${file.name}`, file);
                    const { data: u } = supabase.storage.from('partner-files').getPublicUrl(data.path);
                    await supabase.from('partner_files').insert([{ name: file.name, url: u.publicUrl }]);
                    alert("Uploaded!");
                  }} />
                )}
              </div>
            )}
            {activeView === 'network' && (
              partnerFiles.map((f, i) => (
                <div key={i} className="p-6 mb-4 bg-slate-900 border border-purple-500/30 flex justify-between">
                  <span>{f.name}</span>
                  <button onClick={() => window.open(f.url, '_blank')} className="text-purple-400">View</button>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}