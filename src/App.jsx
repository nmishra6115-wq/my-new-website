import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient'; // Ensure this path is correct
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
  const [pageIndex, setPageIndex] = useState(0);
  const [isMuted, setIsMuted] = useState(true);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [submissions, setSubmissions] = useState([]);
  const [partnerFiles, setPartnerFiles] = useState([]);
  const [isAuthorized, setIsAuthorized] = useState(false);

  // Initial Data Fetch from Supabase
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
      <nav className="p-6 border-b border-emerald-500/30 flex items-center justify-between sticky top-0 bg-[#030712]/90 backdrop-blur-lg z-50 w-full shadow-[0_0_20px_rgba(16,185,129,0.1)]">
        <h1 className="text-xl md:text-2xl font-black tracking-[0.3em] text-emerald-500 cursor-pointer uppercase hover:text-white transition-all" onClick={() => setActiveView(null)}>&gt; AML_DECODE</h1>
        <button className="md:hidden text-emerald-500 text-2xl z-[60]" onClick={() => setIsMenuOpen(!isMenuOpen)}>
          {isMenuOpen ? "✕" : "☰"}
        </button>
      </nav>

      {/* MOBILE MENU */}
      {isMenuOpen && (
        <div className="md:hidden absolute top-20 left-0 w-full bg-[#030712]/95 border-b border-emerald-500/30 p-6 flex flex-col gap-4 z-50">
          {[ {label: 'NOTES', id: 'notes'}, {label: 'JOBS', id: 'jobs'}, {label: 'SUBMIT REFERRAL', id: 'referralForm'}, {label: 'AVAILABLE REFERRAL', id: 'available'}, {label: 'HR DASHBOARD', id: 'contribute'}, {label: 'NETWORK JOBS', id: 'network'} ].map((item) => (
            <button key={item.id} onClick={() => { setActiveView(item.id); setIsMenuOpen(false); }} className="text-lg font-black text-left text-emerald-400 uppercase">{item.label}</button>
          ))}
        </div>
      )}

      {!activeView && (
        <main className="flex-grow">
          {/* VIDEO SECTION */}
          <section className="w-full relative bg-black">
             <video className="w-full h-[500px] object-cover" autoPlay muted={isMuted} loop playsInline>
               <source src="/intro.mp4" type="video/mp4" />
             </video>
             <button onClick={() => setIsMuted(!isMuted)} className="absolute bottom-8 right-8 bg-black/50 text-emerald-500 border border-emerald-500/50 px-4 py-2 rounded-lg z-20">
               {isMuted ? "🔇 Unmute" : "🔊 Mute"}
             </button>
          </section>

          {/* DASHBOARD */}
          <div className="max-w-7xl mx-auto px-6 py-16">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[ {id: 'notes', icon: '📖', label: 'Notes'}, {id: 'jobs', icon: '💼', label: 'Jobs'}, {id: 'referralForm', icon: '📤', label: 'Submit Referral'}, {id: 'available', icon: '🔍', label: 'Available Referral'}, {id: 'contribute', icon: '📁', label: 'HR Dashboard'}, {id: 'network', icon: '🤝', label: 'Network'} ].map(card => (
                <div key={card.id} onClick={() => setActiveView(card.id)} className="p-8 border border-emerald-500/20 rounded cursor-pointer transition-all hover:translate-y-[-5px]">
                  <div className="text-4xl mb-6">{card.icon}</div>
                  <h3 className="font-bold text-emerald-400 uppercase">{card.label}</h3>
                </div>
              ))}
            </div>
          </div>
        </main>
      )}

      {/* OVERLAY SECTIONS */}
      {activeView && (
        <div className="fixed inset-0 z-[100] bg-black/95 p-12 overflow-y-auto">
          <button onClick={() => setActiveView(null)} className="text-emerald-400 font-bold mb-10 hover:text-white">&larr; BACK</button>
          
          {activeView === 'referralForm' && (
            <div className="max-w-xl mx-auto">
              <form onSubmit={async (e) => { 
                e.preventDefault(); 
                const data = {name: e.target[0].value, email: e.target[1].value, company: e.target[2].value, role: e.target[3].value}; 
                const { error } = await supabase.from('submissions').insert([data]);
                if (!error) { setSubmissions([...submissions, data]); alert("Submitted!"); }
              }}>
                <input type="text" placeholder="Full Name" className="w-full p-4 bg-[#030712] border border-slate-700 rounded mb-4" required />
                <input type="email" placeholder="Email" className="w-full p-4 bg-[#030712] border border-slate-700 rounded mb-4" required />
                <input type="text" placeholder="Company" className="w-full p-4 bg-[#030712] border border-slate-700 rounded mb-4" required />
                <input type="text" placeholder="Role" className="w-full p-4 bg-[#030712] border border-slate-700 rounded mb-4" required />
                <button type="submit" className="w-full py-4 bg-emerald-600 font-bold uppercase">Send Data</button>
              </form>
            </div>
          )}

          {activeView === 'contribute' && (
            <div className="max-w-xl mx-auto border border-slate-800 p-16 text-center bg-[#030712]/50 rounded">
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

          {activeView === 'network' && (
            <div className="max-w-4xl mx-auto">
              {partnerFiles.map((f, i) => (
                <div key={i} className="p-6 mb-4 bg-slate-900 border border-purple-500/30 rounded flex justify-between">
                  {f.name} <button onClick={() => window.open(f.url, '_blank')} className="text-purple-400 font-bold">View</button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}