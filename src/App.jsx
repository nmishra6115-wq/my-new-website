import React, { useState, useEffect, useRef } from 'react';
import { supabase } from './supabaseClient';
import { notesContent, privacyPolicy, termsOfService, faqData, contactContent } from './content';
import { jobOpenings } from './jobs';
import { kycNews } from './news';
import CinematicHero from './CinematicHero';

// --- YOUR ORIGINAL COMPONENTS ---
function QuizItem({ item, onCorrect }) {
  const [selected, setSelected] = useState(null);
  const [isLocked, setIsLocked] = useState(false);
  const handleSelect = (option) => { if (isLocked) return; setSelected(option); setIsLocked(true); if (option === item.correct_answer) onCorrect(); };
  const isCorrect = selected === item.correct_answer;
  return (
    <div className={`mb-10 p-0 overflow-hidden bg-slate-900/40 backdrop-blur-xl border rounded-2xl transition-all duration-500 ${isLocked ? (isCorrect ? 'border-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.1)]' : 'border-red-500/50') : 'border-white/5'}`}>
      <div className="p-6 border-b border-white/[0.04] bg-white/[0.01]">
        <div className="flex justify-between items-start gap-4">
          <h2 className="text-xl font-bold text-white leading-snug">{item.question}</h2>
          {isLocked && <span className={`shrink-0 h-6 w-6 rounded-full flex items-center justify-center text-xs font-black ${isCorrect ? 'bg-emerald-500 text-black' : 'bg-red-500 text-white'}`}>{isCorrect ? '✓' : '✕'}</span>}
        </div>
      </div>
      <div className="p-6 space-y-3">
        {(() => {
          try {
            const options = typeof item.options === 'string' ? JSON.parse(item.options) : item.options;
            return options.map((opt, i) => {
              const isThisSelected = selected === opt;
              const isThisCorrect = opt === item.correct_answer;
              let buttonStyle = "border-white/5 bg-white/[0.02] text-slate-300 hover:border-emerald-500/50";
              if (isLocked) {
                if (isThisCorrect) buttonStyle = "border-emerald-500 bg-emerald-500/10 text-emerald-400";
                else if (isThisSelected && !isThisCorrect) buttonStyle = "border-red-500 bg-red-500/10 text-red-400";
                else buttonStyle = "border-white/[0.02] bg-white/[0.01] text-slate-500 opacity-40";
              }
              return (
                <button key={i} disabled={isLocked} onClick={() => handleSelect(opt)} className={`group relative block w-full text-left p-5 border rounded-xl transition-all duration-300 font-bold text-sm md:text-base min-h-[60px] ${buttonStyle}`}>
                  <div className="flex items-center justify-between gap-3"><span className="flex-grow">{opt}</span>{!isLocked && <span className="opacity-0 group-hover:opacity-100 text-[10px] text-emerald-500 font-black tracking-widest">CHOOSE →</span>}</div>
                </button>
              );
            });
          } catch { return <p className="text-red-500">Error: Invalid format</p>; }
        })()}
      </div>
    </div>
  );
}

function SubscribeModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [email, setEmail] = useState("");
  useEffect(() => { const timer = setTimeout(() => setIsOpen(true), 3000); return () => clearTimeout(timer); }, []);
  const handleSubscribe = async (e) => { e.preventDefault(); const { error } = await supabase.from('subscribers').insert([{ email }]); if (!error) { alert("Subscribed!"); setIsOpen(false); } };
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/85 backdrop-blur-md p-4">
      <div className="bg-slate-900 border border-white/10 p-10 rounded-2xl max-w-md w-full relative shadow-2xl">
        <button onClick={() => setIsOpen(false)} className="absolute top-5 right-5 text-slate-500 hover:text-white text-md">✕</button>
        <h2 className="text-3xl font-black text-white mb-2 uppercase">Stay Enrolled</h2>
        <form onSubmit={handleSubscribe} className="space-y-4"><input type="email" required placeholder="Email address" className="w-full p-4 bg-black/40 border border-white/5 rounded-xl text-white" onChange={(e) => setEmail(e.target.value)} /><button type="submit" className="w-full py-4 bg-emerald-600 text-white font-black uppercase tracking-widest text-xs rounded-xl">SUBSCRIBE</button></form>
      </div>
    </div>
  );
}

// --- MAIN APP WITH RESTORED LOGIC ---
export default function App() {
  const [activeView, setActiveView] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [partnerFiles, setPartnerFiles] = useState([]);
  const [newsList, setNewsList] = useState([]);
  const [testData, setTestData] = useState([]);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isTestStarted, setIsTestStarted] = useState(false);
  const [isTestComplete, setIsTestComplete] = useState(false);
  const [quizScore, setQuizScore] = useState(0);
  const [userName, setUserName] = useState("");
  const [selectedCategory, setSelectedCategory] = useState('KYC Basics');

  useEffect(() => {
    const fetchData = async () => {
      const { data: subs } = await supabase.from('submissions').select('*');
      const { data: files } = await supabase.from('partner_files').select('*');
      const { data: news } = await supabase.from('news').select('*');
      const { data: quiz } = await supabase.from('quiz_questions').select('*').eq('category', selectedCategory);
      if (subs) setSubmissions(subs);
      if (files) setPartnerFiles(files);
      if (news) setNewsList(news);
      if (quiz) setTestData(quiz);
    };
    fetchData();
  }, [selectedCategory]);

  const navItems = [{ label: 'NOTES', id: 'notes' }, { label: 'JOBS', id: 'jobs' }, { label: 'REFERRAL', id: 'referralForm' }, { label: 'KNOWLEDGE TEST', id: 'quiz' }];

  return (
    <div className="min-h-screen bg-[#020408] text-slate-200">
      {/* CAPSULE HEADER */}
      <div className="w-full flex justify-center py-6 px-4 sticky top-0 z-50">
        <nav className="w-full max-w-7xl h-20 bg-[#fbfbf8] rounded-full shadow-[0_15px_40px_rgba(0,0,0,0.15)] border border-black/[0.03] px-6 flex items-center justify-between">
          <div onClick={() => setActiveView(null)} className="flex items-center gap-3 cursor-pointer shrink-0">
             <svg className="h-6 w-6 text-[#111111]" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 12 10 10-4.48 10-12S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/></svg>
             <span className="text-lg font-bold tracking-tight text-[#111111] font-sans">AML_DECODE</span>
          </div>
          <div className="hidden lg:flex items-center gap-8 font-bold text-[11px] tracking-[0.25em] uppercase text-slate-800">
            {navItems.map(item => <button key={item.id} onClick={() => setActiveView(item.id)}>{item.label}</button>)}
          </div>
        </nav>
      </div>

      {/* RENDER CONTENT */}
      {!activeView ? (
        <main className="max-w-7xl mx-auto px-10 py-20">
          <CinematicHero />
          {/* YOUR ORIGINAL BODY CONTENT HERE */}
        </main>
      ) : (
        <main className="max-w-5xl mx-auto px-10 py-20">
          <button onClick={() => setActiveView(null)} className="text-emerald-500 text-xs font-black uppercase mb-10">&larr; Return</button>
          {activeView === 'notes' && <div className="space-y-6">{notesContent.map((n, i) => <div key={i} className="p-6 border border-white/5">{n.title}</div>)}</div>}
          {activeView === 'jobs' && <div className="space-y-6">{jobOpenings.map((j, i) => <div key={i} className="p-6 border border-white/5">{j.role}</div>)}</div>}
          {activeView === 'quiz' && (
             <div className="max-w-2xl mx-auto">
               {!isTestStarted ? (
                 <div className="p-12 bg-white/[0.01] border border-white/5 rounded-2xl">
                    <input className="w-full p-4 bg-black/40 rounded-xl" placeholder="Name" onChange={e => setUserName(e.target.value)} />
                    <button onClick={() => setIsTestStarted(true)} className="w-full py-4 bg-amber-500 mt-4 rounded-xl">Start</button>
                 </div>
               ) : (
                 testData.length > 0 && <QuizItem item={testData[currentQuestionIndex]} onCorrect={() => setQuizScore(prev => prev + 10)} />
               )}
             </div>
          )}
        </main>
      )}

      <footer className="w-full bg-[#fbfbf8] border-t border-black/[0.03] pt-24 pb-12 mt-auto">
  <div className="max-w-7xl mx-auto px-8 md:px-14 grid grid-cols-1 md:grid-cols-12 gap-12 mb-16">
    
    {/* Brand Descriptor Block */}
    <div className="md:col-span-6 space-y-4">
      {/* Footer logo updated to match header SVG style */}
      <div className="flex items-center gap-3">
        <svg className="h-6 w-6 text-[#111111]" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 12 10 10-4.48 10-12S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
        </svg>
        <span className="text-lg font-bold tracking-tight text-[#111111] font-sans">AML_DECODE</span>
      </div>
      <p className="text-sm leading-relaxed text-slate-500 max-w-sm font-medium">
        AMLDecode is a premium, story-driven financial intelligence academy offering advanced training matrices across transaction verification, monitoring frameworks, and KYC analytics paths.
      </p>
    </div>

    {/* Navigation Links Column */}
    <div className="md:col-span-3 space-y-4 text-xs font-bold uppercase tracking-widest text-slate-800">
      <p className="text-amber-600 font-black text-[10px] tracking-[0.2em]">Directory</p>
      <div className="flex flex-col gap-3">
        <button onClick={() => setActiveView('faq')} className="block text-slate-600 hover:text-black text-left font-semibold transition-colors">FAQ</button>
        <button onClick={() => setActiveView('contact')} className="block text-slate-600 hover:text-black text-left font-semibold transition-colors">Contact</button>
        <button onClick={() => setActiveView('notes')} className="block text-slate-600 hover:text-black text-left font-semibold transition-colors">Notes Hub</button>
      </div>
    </div>

    {/* Legal & Compliance Column */}
    <div className="md:col-span-3 space-y-4 text-xs font-bold uppercase tracking-widest text-slate-800">
      <p className="text-amber-600 font-black text-[10px] tracking-[0.2em]">Legal & Compliance</p>
      <div className="flex flex-col gap-3">
        <button onClick={() => setActiveView('privacy')} className="block text-slate-600 hover:text-black text-left font-semibold transition-colors">Privacy Policy</button>
        <button onClick={() => setActiveView('terms')} className="block text-slate-600 hover:text-black text-left font-semibold transition-colors">Terms of Service</button>
      </div>
    </div>

  </div>

  {/* Base Attribution Row */}
  <div className="max-w-7xl mx-auto px-8 md:px-14 border-t border-black/[0.04] pt-8 flex flex-col sm:flex-row justify-between items-center gap-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest">
    <div className="flex items-center gap-2">
      <span className="h-1.5 w-1.5 rounded-full bg-slate-300 inline-block" />
      <span>© 2026 AML_DECODE</span>
    </div>
    <span className="text-slate-500 font-medium">Design by Nitesh Mishra</span>
  </div>
</footer>

      <SubscribeModal />
    </div>
  );
}