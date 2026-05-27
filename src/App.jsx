import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import { notesContent } from './content';
import { jobOpenings } from './jobs';
import { kycNews } from './news';

// Initialize the channel globally
const channel = supabase.channel('schema-db-changes');

const NewsSkeleton = () => (
  <div className="block p-6 bg-slate-900 border border-white/5 rounded animate-pulse">
    <div className="h-4 bg-slate-800 rounded w-full mb-4"></div>
    <div className="h-4 bg-slate-800 rounded w-2/3"></div>
  </div>
);

// Module-level variable to lock the subscription
let isSubscribed = false;

export default function App() {
  const [activeView, setActiveView] = useState(null);
  const [pageIndex, setPageIndex] = useState(0);
  const [isMuted, setIsMuted] = useState(true);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [submissions, setSubmissions] = useState([]);
  const [partnerFiles, setPartnerFiles] = useState([]);
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: subs } = await supabase.from('submissions').select('*');
        const { data: files } = await supabase.from('partner_files').select('*');
        if (subs) setSubmissions(subs);
        if (files) setPartnerFiles(files);
      } catch (err) {
        console.error("Error:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();

    // The lock prevents .on() from being called a second time
    if (!isSubscribed) {
      isSubscribed = true;
      channel
        .on(
          'postgres_changes',
          { event: 'INSERT', schema: 'public', table: 'submissions' },
          (payload) => {
            setSubmissions((prev) => [...prev, payload.new]);
          }
        )
        .subscribe();
    }
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
            ● ANNOUNCEMENTS: I am still upgrading the website to few things work, it will be fully functionl by 05/28/2026.
          </span>
        </div>
      </div>
      
      {!activeView && (
        <main className="flex-grow">
          {/* VIDEO SECTION */}
          <section className="w-full relative bg-black">
             <video className="w-full h-[500px] object-cover" autoPlay muted={isMuted} loop playsInline key={isMuted ? 'muted' : 'unmuted'}>
               <source src="/intro.mp4" type="video/mp4" />
             </video>
             <button onClick={() => setIsMuted(!isMuted)} className="absolute bottom-8 right-8 bg-black/50 text-emerald-500 border border-emerald-500/50 px-4 py-2 rounded-lg backdrop-blur-md z-20">
               {isMuted ? "🔇 Unmute" : "🔊 Mute"}
             </button>
          </section>

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
            
            {/* LATEST NEWS */}
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
      
      {/* OVERLAY SECTION */}
      {activeView && (
        <div className="fixed inset-0 z-[100] bg-black/95 p-12 overflow-y-auto">
          <button onClick={() => setActiveView(null)} className="text-emerald-400 font-bold mb-10 hover:text-white">&larr; BACK</button>
          <div className="max-w-4xl mx-auto text-white">
            {activeView === 'notes' && <div className="flex gap-12"><div className="w-1/4 space-y-2">{notesContent.map((item, idx) => <button key={idx} onClick={() => setPageIndex(idx)} className="w-full text-left p-4 rounded border border-slate-700 hover:border-emerald-500">{item.title}</button>)}</div><div className="w-3/4"><h1 className="text-4xl font-bold mb-6">{notesContent[pageIndex]?.title}</h1><p className="text-lg text-slate-300 whitespace-pre-line">{notesContent[pageIndex]?.body}</p></div></div>}
            {activeView === 'jobs' && <div className="max-w-4xl mx-auto"><h1 className="text-4xl font-black mb-8">ACTIVE_OPENINGS</h1><div className="bg-[#030712]/80 rounded border border-slate-800">{jobOpenings.map((job, idx) => <div key={idx} className="flex items-center justify-between p-6 border-b border-slate-800"><div><p className="text-emerald-400 font-bold text-xs">{job.company}</p><h2 className="text-lg font-semibold">{job.role}</h2></div><a href={job.link} target="_blank" className="px-6 py-2 bg-indigo-600 rounded text-sm hover:bg-indigo-500">APPLY</a></div>)}</div></div>}
            
            {activeView === 'referralForm' && (
              <form 
                className="max-w-xl mx-auto space-y-4" 
                onSubmit={async (e) => { 
                  e.preventDefault(); 
                  const newEntry = {
                    name: e.target[0].value, 
                    email: e.target[1].value, 
                    company: e.target[2].value, 
                    role: e.target[3].value
                  };
                  const { error } = await supabase.from('submissions').insert([newEntry]);
                  if (error) { alert("Error: " + error.message); } 
                  else { 
                    alert("Submitted!"); 
                    setSubmissions((prev) => [...prev, newEntry]); 
                    e.target.reset(); 
                    setActiveView(null); 
                  } 
                }}
              >
                <input type="text" placeholder="Full Name" className="w-full p-4 bg-[#030712] border border-slate-700 rounded" required />
                <input type="email" placeholder="Email" className="w-full p-4 bg-[#030712] border border-slate-700 rounded" required />
                <input type="text" placeholder="Company" className="w-full p-4 bg-[#030712] border border-slate-700 rounded" required />
                <input type="text" placeholder="Role" className="w-full p-4 bg-[#030712] border border-slate-700 rounded" required />
                <button type="submit" className="w-full py-4 bg-emerald-600 font-bold uppercase">Send Data</button>
              </form>
            )}

{activeView === 'available' && (
  <div className="max-w-4xl mx-auto">
    <h1 className="text-3xl font-black mb-6 uppercase tracking-widest text-emerald-500">Live Availability</h1>
    {submissions.map((s, i) => (
      <div key={i} className="p-6 mb-4 border border-slate-700 bg-slate-900 rounded flex items-center justify-between">
        <div>
          <p className="font-bold text-lg">{s.name}</p>
          <p className="text-emerald-400">{s.role} at {s.company}</p>
        </div>
        <a 
          // We use s.email here so it targets the person who submitted the data
          href={`mailto:${s.email}?subject=Interested in Referral: ${s.role} at ${s.company}&body=Hi ${s.name}, I am interested in the ${s.role} role at ${s.company} you posted about. Please let me know the next steps.`}
          className="px-6 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded transition-all"
        >
          I AM INTERESTED
        </a>
      </div>
    ))}
  </div>
)}            {activeView === 'contribute' && <div className="max-w-xl mx-auto border border-slate-800 p-16 text-center bg-[#030712]/50 rounded">{!isAuthorized ? <input type="password" placeholder="Enter Secure Key" className="w-full p-4 bg-black border border-emerald-500/30 rounded text-center" onKeyDown={(e) => { if (e.key === 'Enter' && e.target.value === 'my-super-secret-123') setIsAuthorized(true); }} /> : <input type="file" onChange={async (e) => { const file = e.target.files[0]; if(!file) return; const { data: uploadData } = await supabase.storage.from('partner-files').upload(`${Date.now()}_${file.name}`, file); const { data: { publicUrl } } = supabase.storage.from('partner-files').getPublicUrl(uploadData.path); await supabase.from('partner_files').insert([{ name: file.name, url: publicUrl }]); alert("Upload Success!"); }} className="text-white" />}</div>}
            {activeView === 'network' && <div className="max-w-4xl mx-auto"><h1 className="text-3xl font-black mb-8 uppercase text-emerald-500">Network Feed</h1>{partnerFiles.length === 0 ? <p className="text-slate-500">No partner uploads yet.</p> : partnerFiles.map((file, i) => (<div key={i} className="p-6 mb-4 bg-slate-900 border border-purple-500/30 rounded flex justify-between items-center"><span className="font-bold">{file.name}</span><button onClick={() => window.open(file.url, '_blank')} className="text-purple-400 font-bold hover:text-white">View</button></div>))}</div>}
          </div>
        </div>
      )}
      
      <footer className="py-10 text-center text-slate-500 border-t border-white/5 uppercase text-xs tracking-widest">© 2026 AML_DECODE / Designed by @Nitesh</footer>
    </div>
  );
}