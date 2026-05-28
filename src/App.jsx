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
  // 1. ALL STATE AT THE TOP
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
  const [newsList, setNewsList] = useState([]); // This stores your database news

useEffect(() => {
  let active = true;

 const fetchData = async () => {
  // Correctly destructure BOTH data and error
  const { data: subs, error: subsError } = await supabase.from('submissions').select('*');
  const { data: files, error: filesError } = await supabase.from('partner_files').select('*');
const { data: news, error: newsError } = await supabase
    .from('news')
    .select('*');

  // DEBUGGING: This will tell us if it's a connection issue or a data issue
  console.log("DEBUG: Database request complete.");
  console.log("DEBUG: Data received:", news);
  console.log("DEBUG: Error received:", newsError);
  if (active) {
    if (subs) setSubmissions(subs);
    if (files) setPartnerFiles(files);
    
    // Check if news was fetched successfully
    if (news) {
      setNewsList(news);
    } else if (newsError) {
      console.error("News fetch error:", newsError.message);
    }
    
    setIsLoading(false);
  }
};
  
  fetchData();

  // 1. Clean up existing channels to prevent duplication
  supabase.getChannels().forEach(c => supabase.removeChannel(c));

  // 2. Create the channel
  const channel = supabase.channel('schema-db-changes');
  
  // 3. ADD ALL LISTENERS FIRST
  channel.on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'submissions' }, (payload) => {
    if (active) setSubmissions((prev) => [...prev, payload.new]);
  });

  channel.on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'partner_files' }, (payload) => {
    if (active) setPartnerFiles((prev) => [...prev, payload.new]);
  });
channel.on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'news' }, (payload) => {
  setNewsList((prev) => [payload.new, ...prev]);
});
  // 4. SUBSCRIBE LAST
  channel.subscribe();

  return () => { 
    active = false; 
    supabase.removeChannel(channel); 
  };
}, []);
  
   
  return (
    <div className="text-slate-100 font-mono min-h-screen flex flex-col relative bg-[#030712]">
      <nav className="p-6 border-b border-emerald-500/30 flex items-center justify-between sticky top-0 bg-[#030712]/90 backdrop-blur-lg z-50 w-full shadow-[0_0_20px_rgba(16,185,129,0.1)]">
        <h1 className="text-xl md:text-2xl font-black tracking-[0.3em] text-emerald-500 cursor-pointer uppercase" onClick={() => setActiveView(null)}>&gt; AML_DECODE</h1>
        <div className="hidden md:flex gap-6 items-center">
          {[ { label: 'NOTES', id: 'notes' }, { label: 'JOBS', id: 'jobs' }, { label: 'SUBMIT REFERRAL', id: 'referralForm' }, { label: 'AVAILABLE REFERRAL', id: 'available' }, { label: 'HR DASHBOARD', id: 'contribute' }, { label: 'NETWORK JOBS', id: 'network' } ].map((item) => (
            <button key={item.id} onClick={() => setActiveView(item.id)} className="text-xs font-black text-emerald-400 hover:text-white transition-all uppercase">{item.label}</button>
          ))}
        </div>
        <button className="md:hidden text-emerald-500 text-2xl z-[60]" onClick={() => setIsMenuOpen(!isMenuOpen)}>{isMenuOpen ? "✕" : "☰"}</button>
      </nav>

      {isMenuOpen && (
        <div className="md:hidden absolute top-20 left-0 w-full bg-[#030712]/95 border-b border-emerald-500/30 p-6 flex flex-col gap-4 z-50">
          {[ { label: 'NOTES', id: 'notes' }, { label: 'JOBS', id: 'jobs' }, { label: 'SUBMIT REFERRAL', id: 'referralForm' }, { label: 'AVAILABLE REFERRAL', id: 'available' }, { label: 'HR DASHBOARD', id: 'contribute' }, { label: 'NETWORK JOBS', id: 'network' } ].map((item) => (
            <button key={item.id} onClick={() => { setActiveView(item.id); setIsMenuOpen(false); }} className="text-lg font-black text-left text-emerald-400 uppercase">{item.label}</button>
          ))}
        </div>
      )}
    {/* ADVERTISEMENT / NEWS SECTION */}
{!activeView && (
  <section className="bg-emerald-950/10 border-b border-emerald-500/20 py-3 px-6 overflow-hidden relative">
    <div className="flex animate-marquee whitespace-nowrap">
      <span className="text-emerald-500 font-bold text-sm uppercase mr-8">. KPMG HIRING FOR BENGALURU LOCATION, APPLY THROUGH NETWORK JOBS. NEW REFERRAL AVAILABLE.</span>
      {kycNews.slice(0, 3).map((news, i) => (
        <span key={i} className="text-sm text-white font-medium mr-16">
          {news.title}
        </span>
      ))}
    </div>
  </section>
)}

      {!activeView && (
        <main className="flex-grow">
         <section className="w-full relative bg-black">
      <video 
        className="w-full h-[500px] object-cover" 
        autoPlay 
        muted={isMuted} 
        loop 
        playsInline
      >
        <source src="/intro.mp4" type="video/mp4" />
      </video>
      <button 
        onClick={() => setIsMuted(!isMuted)}
        className="absolute bottom-8 right-8 z-20 bg-emerald-600/80 hover:bg-emerald-500 text-white px-6 py-2 rounded-full font-bold backdrop-blur-sm transition-all"
      >
        {isMuted ? "UNMUTE" : "MUTE"}
      </button>
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

      {activeView && (
        <div className="fixed inset-0 z-[100] bg-black/95 p-12 overflow-y-auto">
          <button onClick={() => setActiveView(null)} className="text-emerald-400 font-bold mb-10">&larr; BACK</button>
          <div className="max-w-4xl mx-auto text-white">
            {activeView === 'notes' && (
  <div className="flex flex-row gap-4 p-2">
    {/* Reduced width for buttons so text gets more space */}
    <div className="w-1/3 md:w-1/4 space-y-2 shrink-0">
      {notesContent.map((item, idx) => (
        <button 
          key={idx} 
          onClick={() => setPageIndex(idx)} 
          className="w-full text-[10px] md:text-sm text-left p-2 md:p-4 rounded border border-slate-700 hover:border-emerald-500 transition-colors truncate"
        >
          {item.title}
        </button>
      ))}
    </div>
    
    {/* Content Area */}
    <div className="w-2/3 md:w-3/4 pl-2">
      <h1 className="text-xl md:text-4xl font-bold mb-4">{notesContent[pageIndex]?.title}</h1>
      <p className="whitespace-pre-wrap leading-relaxed text-slate-300 text-sm md:text-base">
        {notesContent[pageIndex]?.body}
      </p>
    </div>
  </div>
)}
            {activeView === 'jobs' && <div className="bg-[#030712]/80 rounded border border-slate-800">{jobOpenings.map((job, idx) => <div key={idx} className="p-6 border-b border-slate-800 flex justify-between"><div><p className="text-emerald-400">{job.company}</p><h2>{job.role}</h2></div><a href={job.link} target="_blank" className="bg-indigo-600 px-6 py-2">APPLY</a></div>)}</div>}
            {activeView === 'referralForm' && (
              <form className="space-y-4" onSubmit={async (e) => { e.preventDefault(); const { error } = await supabase.from('submissions').insert([{ name: e.target[0].value, email: e.target[1].value, company: e.target[2].value, role: e.target[3].value }]); if (!error) { alert("Submitted!"); setActiveView(null); }}}>
                <input className="w-full p-4 bg-black border" placeholder="Name" required /><input className="w-full p-4 bg-black border" placeholder="Email" required /><input className="w-full p-4 bg-black border" placeholder="Company" required /><input className="w-full p-4 bg-black border" placeholder="Role" required />
                <button type="submit" className="w-full py-4 bg-emerald-600">SUBMIT</button>
              </form>
            )}
            {activeView === 'available' && (
  <div className="max-w-4xl mx-auto">
    <h1 className="text-3xl font-black mb-8 uppercase text-emerald-500">Available Referrals</h1>
    {submissions.map((sub, i) => (
      <div key={i} className="p-6 mb-4 bg-slate-900 border border-emerald-500/30 rounded flex justify-between items-center">
        <div>
          <h3 className="text-xl font-bold">{sub.name}</h3>
          <p className="text-sm text-slate-400">{sub.company} - {sub.role}</p>
        </div>

        {/* This is the new, clear upload area */}
        <label className="cursor-pointer bg-emerald-600 px-6 py-3 font-bold hover:bg-emerald-500 transition-all text-white">
          <span>APPLY WITH RESUME</span>
          <input 
            type="file" 
            className="hidden" 
            accept=".pdf,.docx"
            onChange={async (e) => {
              const file = e.target.files[0];
              if (!file) return;

              const userEmail = prompt("Enter your email so they can contact you:");
              if (!userEmail) return;

              alert("Uploading " + file.name + "...");
              const { data, error } = await supabase.storage.from('resumes').upload(`${Date.now()}_${file.name}`, file);
              
              if (error) { alert("Upload error: " + error.message); return; }

              const { data: urlData } = supabase.storage.from('resumes').getPublicUrl(data.path);
              
              await supabase.from('interests').insert([{ 
                submission_id: sub.id, 
                sender_email: userEmail, 
                resume_url: urlData.publicUrl 
              }]);
              alert("Application sent successfully!");
            }} 
          />
        </label>
      </div>
    ))}
  </div>
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
                      setIsLoading(true);
                      const { data, error } = await supabase.storage.from('partner-files').upload(`${Date.now()}_${file.name}`, file);
                      if (error) { alert("Storage Error: " + error.message); setIsLoading(false); return; }
                      const { data: u } = supabase.storage.from('partner-files').getPublicUrl(data.path);
                      const { error: dbError } = await supabase.from('partner_files').insert([{ name: file.name, url: u.publicUrl }]);
                      if (dbError) { alert("Database Error: " + dbError.message); } 
                      else { alert("Uploaded Successfully!"); }
                      setIsLoading(false);
                    }} />
                    <label htmlFor="fileUpload" className="cursor-pointer bg-emerald-600 px-8 py-4 font-bold text-white hover:bg-emerald-500">SELECT & UPLOAD FILE</label>
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
  {/* NEWS SECTION (Below Cards) */}
      <section className="bg-black border-t border-emerald-500/20 py-16 px-6">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-emerald-500 font-bold mb-8 uppercase">&gt; Latest KYC News</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {newsList.slice(0, 3).map((news, i) => (
             <a 
      key={i} 
      href={news.link} 
      target="_blank" 
      rel="noopener noreferrer" 
      className="p-6 bg-slate-900 border border-white/5 rounded hover:border-emerald-500/50 transition-all block"
    >
      <p className="text-white font-bold mb-2">{news.title}</p>
      {news.link && <span className="text-emerald-500 text-xs font-bold">READ MORE →</span>}
    </a>
  ))}
</div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-emerald-500/20 bg-[#030712] p-8 text-center text-slate-500 text-xs">
        <p>© 2026 AML_DECODE. All rights reserved / Designed by @Nitesh</p>
      </footer>
    </div>
  );
}



      