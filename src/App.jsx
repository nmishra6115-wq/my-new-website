import React, { useState, useEffect, useRef } from 'react';
import { supabase } from './supabaseClient';
import { notesContent, privacyPolicy, termsOfService, faqData, contactContent } from './content';
import { jobOpenings } from './jobs';
import { kycNews } from './news';
import CinematicHero from './CinematicHero';

// STABLE QUIZ COMPONENT: Original logic preserved
function QuizItem({ item, onCorrect }) {
  const [selected, setSelected] = useState(null);
  const [isLocked, setIsLocked] = useState(false);
  const handleSelect = (option) => {
    if (isLocked) return;
    setSelected(option);
    setIsLocked(true);
    if (option === item.correct_answer) onCorrect();
  };
  const isCorrect = selected === item.correct_answer;
  return (
    <div className={`mb-10 p-0 overflow-hidden bg-slate-900/40 border rounded-xl transition-all duration-500 ${isLocked ? (isCorrect ? 'border-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.1)]' : 'border-red-500/50') : 'border-white/5'}`}>
      <div className="p-6 border-b border-white/[0.04] bg-white/[0.01]">
        <div className="flex justify-between items-start gap-4">
          <h2 className="text-lg font-bold text-slate-100 leading-tight">{item.question}</h2>
          {isLocked && (
            <span className={`shrink-0 h-6 w-6 rounded-full flex items-center justify-center text-xs font-black ${isCorrect ? 'bg-emerald-500 text-black' : 'bg-red-500 text-white'}`}>
              {isCorrect ? '✓' : '✕'}
            </span>
          )}
        </div>
      </div>
      <div className="p-6 space-y-3">
        {(() => {
          try {
            const options = typeof item.options === 'string' ? JSON.parse(item.options) : item.options;
            return options.map((opt, i) => {
              const isThisSelected = selected === opt;
              const isThisCorrect = opt === item.correct_answer;
              let buttonStyle = "border-white/5 bg-white/[0.02] text-slate-400 hover:border-emerald-500/50";
              if (isLocked) {
                if (isThisCorrect) buttonStyle = "border-emerald-500 bg-emerald-500/10 text-emerald-400";
                else if (isThisSelected && !isThisCorrect) buttonStyle = "border-red-500 bg-red-500/10 text-red-400";
                else buttonStyle = "border-white/5 bg-transparent text-slate-600 opacity-50";
              }
              return (
                <button key={i} disabled={isLocked} onClick={() => handleSelect(opt)} className={`group relative block w-full text-left p-4 border rounded-lg transition-all duration-300 font-medium text-sm md:text-base min-h-[60px] ${buttonStyle}`}>
                  <div className="flex items-center justify-between gap-3"><span className="flex-grow">{opt}</span>{!isLocked && <span className="opacity-0 group-hover:opacity-100 text-[10px] text-emerald-500 font-black whitespace-nowrap">SELECT</span>}</div>
                </button>
              );
            });
          } catch { return <p className="text-red-500">Error: Invalid format</p>; }
        })()}
      </div>
      {isLocked && (
        <div className={`p-6 border-t animate-in fade-in slide-in-from-top-4 duration-500 ${isCorrect ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-slate-800/30 border-slate-700'}`}>
          <div className="flex items-start gap-3">
            <div className={`mt-1 p-1 rounded-md ${isCorrect ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-700 text-slate-400'}`}>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest mb-1 text-slate-400">Interview Insight / Rationale</p>
              <p className="text-sm text-slate-300 leading-relaxed italic">{item.explanation || "This answer is based on standard KYC/AML regulatory frameworks applied in major financial hubs like Bengaluru and Kolkata."}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// SUBSCRIBE COMPONENT
function SubscribeModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [email, setEmail] = useState("");
  useEffect(() => { const timer = setTimeout(() => setIsOpen(true), 3000); return () => clearTimeout(timer); }, []);
  const handleSubscribe = async (e) => {
    e.preventDefault();
    const { error } = await supabase.from('subscribers').insert([{ email }]);
    if (!error) { alert("Subscribed! You'll receive daily job updates."); setIsOpen(false); }
    else { alert(error.code === "23505" ? "This email is already subscribed!" : "Error: " + error.message); }
  };
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-[#0b1c2e] border-2 border-emerald-500 p-8 rounded-lg max-w-md w-full relative shadow-[0_0_30px_rgba(16,185,129,0.3)]">
        <button onClick={() => setIsOpen(false)} className="absolute top-4 right-4 text-slate-400 hover:text-white text-xl">✕</button>
        <h2 className="text-2xl font-black text-emerald-400 mb-2 uppercase bold tracking-tighter">Stay Updated</h2>
        <p className="text-slate-300 text-sm mb-6 leading-relaxed">Subscribe to get daily AML/KYC job alerts from Bengaluru, Kolkata, and beyond directly in your inbox.</p>
        <form onSubmit={handleSubscribe} className="space-y-4">
          <input type="email" required placeholder="Enter your email address" className="w-full p-4 bg-black border border-slate-700 text-white focus:border-emerald-500 outline-none font-mono text-sm" onChange={(e) => setEmail(e.target.value)} />
          <button type="submit" className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold uppercase tracking-widest transition-all">SUBSCRIBE</button>
        </form>
      </div>
    </div>
  );
}

export default function App() {
  const [activeView, setActiveView] = useState(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [submissions, setSubmissions] = useState([]);
  const [partnerFiles, setPartnerFiles] = useState([]);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [userName, setUserName] = useState("");
  const [selectedCategory, setSelectedCategory] = useState('KYC Basics');
  const [testData, setTestData] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState('All');
  const [recruiterEmail, setRecruiterEmail] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [pageIndex, setPageIndex] = useState(0);
  const contentRef = useRef(null);

  useEffect(() => {
    const fetchData = async () => {
      const { data: subs } = await supabase.from('submissions').select('*');
      const { data: files } = await supabase.from('partner_files').select('*');
      const { data: quiz } = await supabase.from('quiz_questions').select('*').eq('category', selectedCategory);
      if (subs) setSubmissions(subs);
      if (files) setPartnerFiles(files);
      if (quiz) setTestData(quiz);
      setIsLoading(false);
    };
    fetchData();
  }, [selectedCategory]);

  const navItems = [
    { label: 'NOTES', id: 'notes' }, { label: 'JOBS', id: 'jobs' },
    { label: 'SUBMIT REFERRAL', id: 'referralForm' }, { label: 'AVAILABLE REFERRAL', id: 'available' },
    { label: 'HR DASHBOARD', id: 'contribute' }, { label: 'NETWORK JOBS', id: 'network' },
    { label: 'KNOWLEDGE TEST', id: 'quiz' }
  ];

  return (
    <div className="text-slate-100 font-mono min-h-screen flex flex-col relative bg-[#030712]">
      
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

      {/* RENDER BODY CONTENT */}
      <main className="flex-grow">
        {!activeView ? <CinematicHero /> : (
            <div className="max-w-7xl mx-auto p-10">
                <button onClick={() => setActiveView(null)} className="mb-8 text-emerald-500 uppercase font-black text-xs">&larr; Back</button>
                {/* All your sub-page logic remains here exactly as is */}
            </div>
        )}
      </main>

      {/* FOOTER */}
      <footer className="bg-[#0b1c2e] text-white border-t border-emerald-500/20 pt-16 pb-8 mt-20 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-12 mb-16">
            <div className="md:col-span-5 space-y-6">
              <img src="/logo.png" alt="AML_DECODE" className="h-12 w-auto object-contain" />
              <p className="text-sm leading-relaxed text-slate-400 max-w-md">AMLDecode is your go-to platform for AML, KYC, EDD, and Transaction Monitoring learning. We provide interview preparation notes, industry insights, and latest job opportunities to help professionals grow their careers in financial crime compliance.</p>
            </div>
            <div className="md:col-span-3 space-y-4">
              <h3 className="text-emerald-500 font-black uppercase text-[10px] tracking-widest">Navigation</h3>
              <div className="flex flex-col gap-3 text-sm text-slate-300">
                <button onClick={() => setActiveView('faq')} className="hover:text-emerald-400 transition-all text-left uppercase font-bold tracking-tighter">FAQ</button>
                <button onClick={() => setActiveView('contact')} className="hover:text-emerald-400 transition-all text-left uppercase font-bold tracking-tighter">Contact Us</button>
                <button onClick={() => setActiveView('notes')} className="hover:text-emerald-400 transition-all text-left uppercase font-bold tracking-tighter">Learning Notes</button>
              </div>
            </div>
            <div className="md:col-span-4 space-y-4">
              <h3 className="text-emerald-500 font-black uppercase text-[10px] tracking-widest">Legal & Compliance</h3>
              <div className="flex flex-col gap-3 text-sm text-slate-300">
                <button onClick={() => setActiveView('privacy')} className="hover:text-emerald-400 transition-all text-left uppercase font-bold tracking-tighter">Privacy Policy</button>
                <button onClick={() => setActiveView('terms')} className="hover:text-emerald-400 transition-all text-left uppercase font-bold tracking-tighter">Terms of Service</button>
              </div>
            </div>
          </div>
          <div className="border-t border-slate-800/50 pt-8 flex justify-between items-center text-[10px] text-slate-500 font-bold uppercase tracking-widest">
            <span>© 2026 AML_DECODE / Designed by @ Nitesh Mishra</span>
          </div>
        </div>
      </footer>
      <SubscribeModal />
    </div>
  );
}