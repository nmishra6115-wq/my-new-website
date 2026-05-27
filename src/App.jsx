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
      const { data: subs } = await supabase.from('submissions').select('*');
      const { data: files } = await supabase.from('partner_files').select('*');
      if (active) {
        if (subs) setSubmissions(subs);
        if (files) setPartnerFiles(files);
        setIsLoading(false);
      }
    };
    fetchData();

    // FIXED: Realtime listener setup for BOTH tables
    supabase.getChannels().forEach(c => supabase.removeChannel(c));
    const channel = supabase.channel('schema-db-changes');
    
    // Listener for Submissions
    channel.on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'submissions' }, (payload) => {
      if (active) setSubmissions((prev) => [...prev, payload.new]);
    });

    // Listener for Partner Files
    channel.on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'partner_files' }, (payload) => {
      if (active) setPartnerFiles((prev) => [...prev, payload.new]);
    });

    channel.subscribe();

    return () => { active = false; supabase.removeChannel(channel); };
  }, []);

  return (
    <div className="text-slate-100 font-mono min-h-screen flex flex-col relative bg-[#030712]">
      {/* NAVIGATION */}
      <nav className="p-6 border-b border-emerald-500/30 flex items-center justify-between sticky top-0 bg-[#030712]/90 backdrop-blur-lg z-50 w-full shadow-[0_0_20px_rgba(16,185,129,0.1)]">
        <h1 className="text-xl md:text-2xl font-black tracking-[0.3em] text-emerald-500 cursor-pointer uppercase" onClick={() => setActiveView(null)}>&gt; AML_DECODE</h1>
        <div className="hidden md:flex gap-6 items-center">
          {[ { label: 'NOTES', id: 'notes' }, { label: 'JOBS', id: 'jobs' }, { label: 'SUBMIT REFERRAL', id: 'referralForm' }, { label: 'AVAILABLE REFERRAL', id: 'available' }, { label: 'HR DASHBOARD', id: 'contribute' }, { label: 'NETWORK JOBS', id: 'network' } ].map((item) => (
            <button key={item.id} onClick={() => setActiveView(item.id)} className="text-xs font-black text-emerald-400 hover:text-white transition-all uppercase">{item.label}</button>
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

      {/* MAIN VIEW */}
      {!activeView && (
        <main className="flex-grow">
          <section className="w-full relative bg-black">
             <video className="w-full h-[500px] object-cover" autoPlay muted={isMuted} loop playsInline><source src="/intro.mp4" type="video/mp4" /></video>
          </section>
          <div className="max-w-7xl mx-auto px-6 py-16">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-24">
              {[ {id: 'network', icon: '🤝', label: 'Featured Network'}, {id: 'notes', icon: '📖', label: 'Notes'}, {id: 'jobs', icon: '💼', label: 'Jobs'}, {id: 'referralForm', icon: '📤', label: 'Submit Referral'}, {id: 'available', icon: '🔍', label: 'Available Referral'}, {id: 'contribute', icon: '📁', label: 'HR Dashboard'} ].map(card => (
                <div key={card.id} onClick={() => setActiveView(card.id)} className="p-8 border border-emerald-500/20 rounded cursor-pointer hover:translate-y-[-5px] transition-all">
                  <div className="text-4xl mb-6">{card.icon}</div>
                  <h3 className="font-bold text-emerald-400 uppercase">{card.label}</h3>
                </div>
              ))}
            </div>
          </div>
        </main>
      )}

      {/* OVERLAY VIEWS */}
      {activeView && (
        <div className="fixed inset-0 z-[100] bg-black/95 p-12 overflow-y-auto">
          <button onClick={() => setActiveView(null)} className="text-emerald-400 font-bold mb-10">&larr; BACK</button>
          <div className="max-w-4xl mx-auto text-white">
            {activeView === 'notes' && <div className="flex gap-12"><div className="w-1/4 space-y-2">{notesContent.map((item, idx) => <button key={idx} onClick={() => setPageIndex(idx)} className="w-full text-left p-4 rounded border border-slate-700">{item.title}</button>)}</div><div className="w-3/4"><h1 className="text-4xl font-bold">{notesContent[pageIndex]?.title}</h1><p>{notesContent[pageIndex]?.body}</p></div></div>}
            {activeView === 'jobs' && <div className="bg-[#030712]/80 rounded border border-slate-800">{jobOpenings.map((job, idx) => <div key={idx} className="p-6 border-b border-slate-800 flex justify-between"><div><p className="text-emerald-400">{job.company}</p><h2>{job.role}</h2></div><a href={job.link} target="_blank" className="bg-indigo-600 px-6 py-2">APPLY</a></div>)}</div>}
            {activeView === 'referralForm' && (
              <form className="space-y-4" onSubmit={async (e) => { e.preventDefault(); const { error } = await supabase.from('submissions').insert([{ name: e.target[0].value, email: e.target[1].value, company: e.target[2].value, role: e.target[3].value }]); if (!error) { alert("Submitted!"); setActiveView(null); }}}>
                <input className="w-full p-4 bg-black border" placeholder="Name" required /><input className="w-full p-4 bg-black border" placeholder="Email" required /><input className="w-full p-4 bg-black border" placeholder="Company" required /><input className="w-full p-4 bg-black border" placeholder="Role" required />
                <button type="submit" className="w-full py-4 bg-emerald-600">SUBMIT</button>
              </form>
            )}
         {activeView === 'contribute' && (
  <div className="p-16 border border-slate-800 text-center">
    {!isAuthorized ? (
      <div className="space-y-4">
        <input type="email" placeholder="Email" onChange={(e) => setEmail(e.target.value)} className="w-full p-4 bg-black border" />
        <input type="password" placeholder="Pass" onChange={(e) => setPassword(e.target.value)} className="w-full p-4 bg-black border" />
        <button onClick={async () => { const { error } = await supabase.auth.signInWithPassword({ email, password }); if (!error) setIsAuthorized(true); else alert(error.message); }} className="w-full py-4 bg-emerald-600">LOGIN</button>
      </div>
    ) : (
      <div className="space-y-6">
        <h2 className="text-xl font-bold">HR UPLOAD PORTAL</h2>
        <input type="file" id="fileUpload" className="hidden" onChange={async (e) => {
          const file = e.target.files[0];
          if(!file) return;
          setIsLoading(true); // Show a loading state
          
          // 1. Upload to Storage
          const { data, error } = await supabase.storage.from('partner-files').upload(`${Date.now()}_${file.name}`, file);
          if (error) { alert("Storage Error: " + error.message); setIsLoading(false); return; }
          
          // 2. Get Public URL
          const { data: u } = supabase.storage.from('partner-files').getPublicUrl(data.path);
          
          // 3. Insert into Database
          const { error: dbError } = await supabase.from('partner_files').insert([{ name: file.name, url: u.publicUrl }]);
          if (dbError) { alert("Database Error: " + dbError.message); } 
          else { alert("Uploaded Successfully!"); }
          
          setIsLoading(false);
        }} />
        <label htmlFor="fileUpload" className="cursor-pointer bg-emerald-600 px-8 py-4 font-bold text-white hover:bg-emerald-500">
          SELECT & UPLOAD FILE
        </label>
      </div>
    )}
  </div>
)}
            {activeView === 'network' && (
              <div className="max-w-4xl mx-auto">
                <h1 className="text-3xl font-black mb-8 uppercase text-emerald-500">Network Feed</h1>
                {partnerFiles.length === 0 ? <p className="text-slate-500">No partner uploads yet.</p> : partnerFiles.map((f, i) => (
                  <div key={i} className="p-6 mb-4 bg-slate-900 border border-purple-500/30 rounded flex justify-between items-center hover:border-purple-500 transition-all">
                    <div>
                      <span className="block font-bold text-lg text-white">{f.name}</span>
                      <span className="text-xs text-purple-400 uppercase tracking-widest">Added to network</span>
                    </div>
                    <button onClick={() => window.open(f.url, '_blank')} className="px-4 py-2 border border-purple-500 text-purple-400 hover:bg-purple-500 hover:text-white transition-all font-bold">DOWNLOAD</button>
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