import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import { notesContent } from './content';
import { jobOpenings } from './jobs';
import { kycNews } from './news';

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

    const channel = supabase.channel('schema-db-changes');
    channel.on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'submissions' }, (payload) => { if (active) setSubmissions((prev) => [...prev, payload.new]); });
    channel.on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'partner_files' }, (payload) => { if (active) setPartnerFiles((prev) => [...prev, payload.new]); });
    channel.subscribe();

    return () => { active = false; supabase.removeChannel(channel); };
  }, []);

  return (
    <div className="text-slate-100 font-mono min-h-screen flex flex-col relative bg-[#030712]">
      {/* NAVBAR */}
      <nav className="p-6 border-b border-emerald-500/30 flex items-center justify-between sticky top-0 bg-[#030712]/90 backdrop-blur-lg z-50 w-full">
        <h1 className="text-xl font-black tracking-[0.3em] text-emerald-500 cursor-pointer uppercase" onClick={() => setActiveView(null)}>&gt; AML_DECODE</h1>
        <button className="md:hidden text-emerald-500 text-2xl" onClick={() => setIsMenuOpen(!isMenuOpen)}>{isMenuOpen ? "✕" : "☰"}</button>
      </nav>

      {/* NEWS SECTION - Only shows when no view is active */}
      {!activeView && (
        <section className="bg-black border-b border-emerald-500/20 p-6">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-emerald-500 font-bold mb-4 uppercase">&gt; Latest KYC News</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {kycNews.slice(0, 3).map((news, i) => (
                <div key={i} className="p-4 bg-slate-900 border border-white/5 rounded">
                  <p className="text-white font-bold">{news.title}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* MAIN CONTENT */}
      {!activeView && (
        <main className="flex-grow">
          <section className="w-full relative bg-black"><video className="w-full h-[500px] object-cover" autoPlay muted={isMuted} loop playsInline><source src="/intro.mp4" type="video/mp4" /></video></section>
          {/* ... Add your grid cards here ... */}
        </main>
      )}

      {/* ACTIVE VIEW MODAL */}
      {activeView && (
        <div className="fixed inset-0 z-[100] bg-black/95 p-12 overflow-y-auto">
           <button onClick={() => setActiveView(null)} className="text-emerald-400 font-bold mb-10">&larr; BACK</button>
           {/* Your existing activeView logic here */}
        </div>
      )}

      {/* FOOTER - Always visible */}
      <footer className="mt-auto border-t border-emerald-500/20 bg-[#030712] p-8">
        <div className="max-w-7xl mx-auto text-center text-slate-500 text-sm">
          <p>© 2026 AML_DECODE. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}