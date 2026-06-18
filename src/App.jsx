import React, { useState, useEffect, useRef } from 'react';
import { supabase } from './supabaseClient';
import { notesContent, privacyPolicy, termsOfService, faqData, contactContent } from './content';
import { jobOpenings } from './jobs';
import { kycNews } from './news';
import CinematicHero from './CinematicHero';

// STABLE QUIZ COMPONENT: Isolated to keep your app stable
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
    <div className={`mb-12 p-8 bg-white/[0.01] border rounded-2xl transition-all duration-500 ${isLocked ? (isCorrect ? 'border-amber-500 shadow-[0_0_30px_rgba(251,191,36,0.1)]' : 'border-red-500/30') : 'border-white/5'}`}>
      
      {/* 1. Question Header: Bold and Professional */}
      <div className="pb-6 border-b border-white/[0.04]">
        <div className="flex justify-between items-start gap-4">
          <h2 className="text-xl font-bold text-white leading-snug">{item.question}</h2>
          {isLocked && (
            <span className={`shrink-0 h-6 w-6 rounded-full flex items-center justify-center text-xs font-black ${isCorrect ? 'bg-amber-500 text-black' : 'bg-red-500 text-white'}`}>
              {isCorrect ? '✓' : '✕'}
            </span>
          )}
        </div>
      </div>

      {/* 2. Options Grid: Sized for Mobile Compatibility */}
      <div className="pt-6 space-y-3">
        {(() => {
          try {
            const options = typeof item.options === 'string' ? JSON.parse(item.options) : item.options;
            return options.map((opt, i) => {
              const isThisSelected = selected === opt;
              const isThisCorrect = opt === item.correct_answer;
              
              let buttonStyle = "border-white/10 bg-white/[0.01] text-slate-300 hover:border-amber-500/40 hover:bg-white/[0.02]";
              if (isLocked) {
                if (isThisCorrect) buttonStyle = "border-amber-500 bg-amber-500/10 text-amber-400";
                else if (isThisSelected && !isThisCorrect) buttonStyle = "border-red-500 bg-red-500/10 text-red-400";
                else buttonStyle = "border-white/[0.02] text-slate-600 opacity-40";
              }

              return (
                <button 
                  key={i} 
                  disabled={isLocked} 
                  onClick={() => handleSelect(opt)}
                  className={`group relative block w-full text-left p-5 border rounded-xl transition-all duration-300 font-medium text-sm md:text-base min-h-[60px] ${buttonStyle}`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className="flex-grow">{opt}</span>
                    {!isLocked && <span className="opacity-0 group-hover:opacity-100 text-[10px] text-amber-400 font-bold whitespace-nowrap tracking-widest">SELECT →</span>}
                  </div>
                </button>
              );
            });
          } catch { return <p className="text-red-500 text-xs">Error: Invalid format</p>; }
        })()}
      </div>

      {/* 3. The Rationale: The "Real" Interview Prep Feature */}
      {isLocked && (
        <div className={`mt-6 p-6 border-t animate-in fade-in slide-in-from-top-4 duration-500 ${isCorrect ? 'bg-amber-500/[0.02] border-amber-500/10' : 'bg-slate-900/10 border-white/5'}`}>
          <div className="flex items-start gap-3">
            <div className={`mt-1 p-1 rounded-md ${isCorrect ? 'text-amber-400' : 'text-slate-500'}`}>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest mb-1 text-slate-400">Interview Insight / Rationale</p>
              <p className="text-sm text-slate-300 leading-relaxed italic">
                {item.explanation || "This answer is based on standard KYC/AML regulatory frameworks applied in major financial hubs like Bengaluru and Kolkata."}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// STABLE SUBSCRIBE COMPONENT: Isolated to keep your app stable
function SubscribeModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [email, setEmail] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsOpen(true);
    }, 3000); // Pops up after 3 seconds
    
    return () => clearTimeout(timer);
  }, []);

  const handleSubscribe = async (e) => {
    e.preventDefault();
    const { error } = await supabase.from('subscribers').insert([{ email }]);
    if (!error) {
      alert("Subscribed! You'll receive daily job updates.");
      setIsOpen(false);
    } else {
      if (error.code === "23505") {
        alert("This email is already subscribed!");
      } else {
        alert("Error: " + error.message);
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/90 backdrop-blur-xl p-4">
      <div className="bg-gradient-to-b from-[#0e131f] to-[#040712] border border-white/10 p-10 rounded-2xl max-w-md w-full relative shadow-[0_25px_50px_rgba(0,0,0,0.8)]">
        <button onClick={() => setIsOpen(false)} className="absolute top-5 right-5 text-slate-500 hover:text-white transition-colors">✕</button>
        
        <h2 className="text-3xl font-light text-white mb-2 uppercase tracking-tight font-serif">Stay Updated</h2>
        <p className="text-slate-400 text-sm mb-6 leading-relaxed font-medium">
          Subscribe to get daily AML/KYC job alerts from Bengaluru, Kolkata, and beyond directly in your inbox.
        </p>

        <form onSubmit={handleSubscribe} className="space-y-4">
          <input 
            type="email" 
            required 
            placeholder="Enter your email address" 
            className="w-full p-4 bg-black/40 border border-white/10 rounded-xl text-white focus:border-amber-500 outline-none text-sm font-medium"
            onChange={(e) => setEmail(e.target.value)}
          />
          <button type="submit" className="w-full py-4 bg-gradient-to-b from-amber-400 to-amber-600 text-black font-black uppercase tracking-widest text-xs rounded-xl transition-all shadow-md">
            SUBSCRIBE
          </button>
        </form>
      </div>
    </div>
  );
}

export default function App() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [activeView, setActiveView] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [challengeSelected, setChallengeSelected] = useState(null);
  const [isChallengeLocked, setIsChallengeLocked] = useState(false);
  const [pageIndex, setPageIndex] = useState(0);
  const [isMuted, setIsMuted] = useState(true);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [submissions, setSubmissions] = useState([]);
  const [partnerFiles, setPartnerFiles] = useState([]);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [highlightCareer, setHighlightCareer] = useState(false);
  const [newsList, setNewsList] = useState([
    { 
      title: "RBI Master Direction Update: New Digital Onboarding Norms for 2026", 
      link: "https://rbi.org.in", 
      tag: "REGULATORY" 
    },
    { 
      title: "Bengaluru FinTech Hub: Surge in AML Specialist Roles in Marathahalli", 
      link: "#", 
      tag: "MARKET" 
    },
    { 
      title: "FATF 2026 Guidelines: Impact on Cross-Border Transaction Monitoring", 
      link: "#", 
      tag: "COMPLIANCE" 
    }
  ]);
  
  const isNewlyAdded = (dateString) => {
    if (!dateString) return false;
    const itemDate = new Date(dateString);
    const currentDate = new Date();
    const diffInTime = currentDate.getTime() - itemDate.getTime();
    const diffInDays = diffInTime / (1000 * 3600 * 24);
    return diffInDays >= 0 && diffInDays <= 4;
  };
  
  const [isTestStarted, setIsTestStarted] = useState(false);
  const [isTestComplete, setIsTestComplete] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userName, setUserName] = useState("");
  const [selectedOption, setSelectedOption] = useState(null);
  const [quizScore, setQuizScore] = useState(0);
  const [testData, setTestData] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState('All');
  const [recruiterEmail, setRecruiterEmail] = useState("");
  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('KYC Basics');
  const contentRef = useRef(null);
  const [showSuccess, setShowSuccess] = useState(false);

  const trackEmailClick = async (fileId) => {
    try {
      const { data: currentData } = await supabase
        .from('partner_files')
        .select('click_count')
        .eq('id', fileId)
        .single();

      await supabase
        .from('partner_files')
        .update({ click_count: (currentData?.click_count || 0) + 1 })
        .eq('id', fileId);
    } catch (err) {
      console.error("Analytics error:", err);
    }
  };

  const handleChallenge = (option) => {
    if (isChallengeLocked) return;
    setChallengeSelected(option);
    setIsChallengeLocked(true);
  };

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      const { data: subs } = await supabase.from('submissions').select('*');
      const { data: files } = await supabase.from('partner_files').select('*');
      const { data: news } = await supabase.from('news').select('*');
      const { data: quiz } = await supabase.from('quiz_questions').select('*').eq('category', selectedCategory).range(0, 99); 
      
      if (subs) setSubmissions(subs);
      if (files) setPartnerFiles(files);
      setNewsList(news && news.length > 0 ? news : kycNews);
      if (quiz) setTestData(quiz);
      setIsLoading(false);
    };
    fetchData();
  }, [selectedCategory]);

  const navItems = [
    { label: 'Notes', id: 'notes' }, { label: 'Jobs', id: 'jobs' },
    { label: 'Submit Referral', id: 'referralForm' }, { label: 'Available Referral', id: 'available' },
    { label: 'HR Dashboard', id: 'contribute' }, { label: 'Network Jobs', id: 'network' },
    { label: 'Knowledge Test', id: 'quiz' }
  ];

  return (
    <div className="text-slate-200 font-sans min-h-screen flex flex-col relative bg-[#040712] antialiased">
      
      {/* STANDARD WEBSITE PLATFORM GLOBAL TOP NAVIGATION BAR */}
      <nav className="sticky top-0 z-50 w-full bg-[#040712]/80 backdrop-blur-xl border-b border-white/[0.02]">
        <div className="max-w-7xl mx-auto px-8 md:px-12 h-24 flex items-center justify-between">
          <div onClick={() => setActiveView(null)} className="flex items-center cursor-pointer">
            <img src="/logo.png" alt="AML_DECODE Logo" className="h-6 w-auto object-contain" />
          </div>

          <div className="hidden lg:flex items-center gap-8 text-[11px] font-bold tracking-[0.25em] uppercase text-slate-400">
            {navItems.slice(0, 2).map((item) => (
              <button key={item.id} onClick={() => setActiveView(item.id)} className={`transition-colors ${activeView === item.id ? "text-amber-400" : "hover:text-white"}`}>{item.label}</button>
            ))}
            {navItems.slice(5, 7).map((item) => (
              <button key={item.id} onClick={() => setActiveView(item.id)} className={`transition-colors ${activeView === item.id ? "text-amber-400" : "hover:text-white"}`}>{item.label}</button>
            ))}
            <button onClick={() => { setActiveView(null); setTimeout(() => { document.getElementById('career-guidance')?.scrollIntoView({ behavior: 'smooth' }); }, 100); }} className="hover:text-white transition-colors">Career Guidance</button>
            <div className="relative group cursor-pointer">
              <span className="hover:text-white flex items-center gap-1.5 transition-colors">Pipelines &darr;</span>
              <div className="absolute top-full right-0 w-56 bg-slate-950 border border-white/5 rounded-xl py-2 mt-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all shadow-2xl">
                <button onClick={() => setActiveView('referralForm')} className="w-full text-left px-5 py-2.5 text-[10px] tracking-widest text-slate-400 hover:text-amber-400 uppercase font-bold">Submit Referral</button>
                <button onClick={() => setActiveView('available')} className="w-full text-left px-5 py-2.5 text-[10px] tracking-widest text-slate-400 hover:text-amber-400 uppercase font-bold">Available Referrals</button>
              </div>
            </div>
            <button onClick={() => setActiveView('contribute')} className="text-white border-b border-white pb-0.5 hover:text-amber-400 hover:border-amber-400 transition-colors tracking-widest">HR Gate &rarr;</button>
          </div>

          <button className="lg:hidden text-white p-2" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeWidth="2" d={isMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} /></svg>
          </button>
        </div>
      </nav>

      {/* MOBILE SHEET REBUILD CONTAINER */}
      {isMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-[999] bg-[#040712] flex flex-col p-10 justify-center space-y-6 animate-fade-in">
          <button onClick={() => setIsMenuOpen(false)} className="absolute top-8 right-8 text-white text-2xl p-2">✕</button>
          {navItems.map((item) => (
            <button key={item.id} onClick={() => setActiveView(item.id) || setIsMenuOpen(false)} className="text-3xl font-serif text-left uppercase text-white hover:text-amber-400 transition-colors">{item.label}</button>
          ))}
        </div>
      )}

      {/* CORE TOP-DOWN HOMEPAGE FLOW SCROLL MATRIX */}
      {!activeView && (
        <main className="flex-grow w-full">
          <CinematicHero />

          <section className="max-w-5xl mx-auto px-8 md:px-12 py-32 space-y-28 bg-[#040712]">
            
            {/* DUAL COLUMN SYSTEM PANEL DISPLAY BLOCKS */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-stretch">
              
              {/* PRIMARY ESSAY DISPLAY GRID COMPONENT */}
              <div className={`lg:col-span-8 p-12 rounded-3xl bg-white/[0.01] border transition-all duration-500 ${isChallengeLocked ? (challengeSelected === 'edd' ? 'border-amber-500/40 shadow-[0_0_40px_rgba(251,191,36,0.08)]' : 'border-red-500/20') : 'border-white/[0.03]'}`}>
                <span className="text-[10px] font-bold tracking-[0.35em] text-amber-400 uppercase block mb-6">Daily Strategic Briefing Case</span>
                <p className="text-xl md:text-2xl font-light text-slate-200 leading-relaxed font-serif mb-8">
                  "A cross-border corporate payment originating from an offshore tech hub is flagged by your monitoring system. The beneficiary entity is perfectly clean on all global sanctions watchlists. However, upon deep-dive routing analysis, you discover that the transaction utilizes a nested correspondent banking structure, and one of the downstream, non-account-holding intermediary transit banks listed in the SWIFT MT103 tracking strings is a financial institution that was placed under selective sectorial sanctions exactly 48 hours ago. The transaction value is under the standard regulatory reporting threshold. What is the correct protocol?"
                </p>
                <div className="space-y-4 max-w-xl">
                  <button disabled={isChallengeLocked} onClick={() => handleChallenge('edd')} className="w-full text-left py-4 border-b border-white/10 text-xs font-bold uppercase tracking-widest text-slate-400 hover:text-white transition-colors">Freeze Asset Framework and File STR/SAR Protocol</button>
                  <button disabled={isChallengeLocked} onClick={() => handleChallenge('dismiss')} className="w-full text-left py-4 border-b border-white/10 text-xs font-bold uppercase tracking-widest text-slate-400 hover:text-white transition-colors">Complete Ledger Run & File System Parameters Internally</button>
                </div>
                {isChallengeLocked && (
                  <div className="pt-6 mt-6 border-t border-white/[0.04] text-sm text-slate-400 font-serif italic space-y-1 animate-fade-in">
                    <p className="text-[9px] uppercase tracking-widest text-amber-500 font-bold not-italic">Mitigation Intelligence</p>
                    <p>{challengeSelected === 'edd' ? "CORRECT: In sanctions compliance, there is no monetary threshold; processing even a minor amount through a sanctioned intermediary bank is a strict liability violation. Illicit networks routinely utilize nested correspondent banking structures to exploit filtering blind spots. Immediate asset restraint and regulatory escalation (SAR/STR) are mandatory to mitigate systemic exposure." : "INCORRECT: Clearing a transaction that contains a sanctioned entity anywhere in its processing path—regardless of asset size or clean ordering/beneficiary profiles—constitutes a severe compliance breach. Sanctions regulations carry strict liability, meaning lack of intent or low transaction value offers no legal safe harbor."}</p>
                  </div>
                )}
              </div>

              {/* PULSE DATA REPORT BOARD PANEL */}
              <div className="lg:col-span-4 p-12 bg-white/[0.01] border border-white/[0.03] rounded-3xl flex flex-col justify-between">
                <div>
                  <span className="text-[10px] font-bold tracking-[0.3em] text-slate-500 block mb-6">Regional Placement Metrics</span>
                  <div className="space-y-4">
                    {[{ name: 'Bengaluru Sector', metric: '+14% Strategic Shift' }, { name: 'Kolkata Sector', metric: 'Executive Allocation Aligned' }].map((pulse, i) => (
                      <div key={i} className="p-4 border border-white/[0.03] rounded-xl">
                        <p className="text-sm font-bold text-white uppercase tracking-wider">{pulse.name}</p>
                        <p className="text-xs text-slate-400 pt-0.5 font-medium">{pulse.metric}</p>
                      </div>
                    ))}
                  </div>
                </div>
                <p className="text-xs text-slate-500 italic font-serif leading-relaxed pt-6 border-t border-white/[0.02] mt-6 text-center">Heightened international market demands tracked for active system verification operations.</p>
              </div>

            </div>

            {/* INFINITE NEWS TICKER ACCENT SCROLL BAND */}
            <div className="p-5 bg-white/[0.01] border border-white/[0.03] rounded-2xl flex items-center overflow-hidden">
              <span className="text-[10px] font-bold text-amber-500 uppercase tracking-widest pr-6 mr-6 border-r border-white/10 shrink-0">Bulletins</span>
              <div className="text-[11px] font-bold text-slate-500 uppercase tracking-[0.35em] flex gap-16 whitespace-nowrap animate-marquee">
                <span>• RBI UPDATES MASTER SECURITY CONFIGURATION PARAMETERS ON INTERNAL TRANSFERS</span>
                <span>• TRANSACTION COMPLIANCE OVERSIGHT ACCELERATING UNDER REVISED FATF CRITERIA MATRICES</span>
                <span>• APAC STRATEGIC OVERSEE DESKS RECORD EXTRA PLACEMENT PIPELINES TRACKS</span>
              </div>
            </div>

            {/* NEW LOOK SECTION LAYOUTS: CORE ACADEMY ESSAY MODULE */}
            <div className="py-16 border-t border-white/[0.02] grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
              <div className="lg:col-span-7 space-y-6">
                <span className="text-[10px] font-bold tracking-[0.3em] text-amber-400 uppercase block">The Operational Standard</span>
                <h2 className="text-4xl md:text-5xl font-serif font-light text-white leading-tight tracking-tight">Structured Knowledge Base.</h2>
                <p className="text-slate-400 text-sm md:text-base leading-relaxed font-medium">
                  We strip down template boxes and dashboard interfaces, re-organizing heavy regulatory directives and regional compliance benchmarks into clean, readable textbook segments optimized for interview validation and placement tracks.
                </p>
                <div className="pt-2 flex gap-8 text-xs font-bold uppercase tracking-widest">
                  <button onClick={() => setActiveView('notes')} className="text-white border-b border-white pb-0.5 hover:text-amber-400 hover:border-amber-400 transition-colors">Explore Syllabus &rarr;</button>
                  <button onClick={() => setActiveView('quiz')} className="text-slate-500 hover:text-white transition-colors">Start Assessment</button>
                </div>
              </div>
              <div className="lg:col-span-5 h-[320px] rounded-3xl border border-white/5 bg-gradient-to-b from-white/[0.01] to-transparent flex items-center justify-center p-8 text-center">
                <p className="text-xs text-slate-500 font-serif italic max-w-xs">Data streams mapping cleanly inside localized web rendering configurations.</p>
              </div>
            </div>

            {/* NEW LOOK SECTION LAYOUTS: CONSULTATION MANAGEMENT DECK */}
            <div id="career-guidance" className="py-16 border-t border-white/[0.02] grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
              <div className="lg:col-span-5 space-y-4">
                <span className="text-[10px] font-bold tracking-[0.4em] text-amber-500 uppercase block">Consultation Intake Streams</span>
                <h2 className="text-4xl md:text-5xl font-serif font-light text-white tracking-tight leading-none">1:1 Mentorship Desk</h2>
                <p className="text-sm text-slate-400 leading-relaxed font-medium max-w-xs">
                  Request an evaluation mapping dossier profile to resolve technical boundaries, restructure resume fields, and secure technical alignment.
                </p>
                <button onClick={() => window.location.href = `mailto:alerts@amldecode.in?subject=Intake`} className="pt-2 text-xs font-bold uppercase tracking-widest text-amber-400 border-b border-amber-400 pb-0.5 block w-fit hover:text-white hover:border-white transition-all">Request Entry Processing &rarr;</button>
              </div>

              <div className="lg:col-span-7 grid grid-cols-1 md:grid-cols-2 gap-8 text-xs font-bold uppercase tracking-wider text-slate-400 pl-0 lg:pl-16 lg:border-l border-white/5">
                {["Resume Mapping and Restructuring", "Application Pipeline Velocity Allocation", "Mock Interview Case Analysis Isolation", "Specialized Directive Matrix Review"].map((text, idx) => (
                  <div key={idx} className="pb-4 border-b border-white/[0.02] flex items-start gap-4">
                    <span className="text-amber-500 font-serif text-sm font-light">0{idx + 1}</span>
                    <span className="text-white/80 font-sans tracking-wide pt-0.5">{text}</span>
                  </div>
                ))}
              </div>
            </div>

          </section>
        </main>
      )}

      {/* FULL WIDTH DYNAMIC ABSTRACT SUB-VIEW FRAMES */}
      {activeView && (
        <main className="flex-grow max-w-5xl mx-auto px-8 md:px-12 py-24 w-full animate-fade-in">
          <button onClick={() => setActiveView(null) || setQuizScore(0) || setCurrentQuestionIndex(0) || setIsTestStarted(false) || setIsTestComplete(false) || setUserName("") || setSelectedOption(null)} className="text-[10px] font-bold tracking-[0.3em] text-amber-500 hover:text-white transition-colors uppercase mb-16 block">&larr; Return to Overview</button>

          {/* INNER VIEW MODULE FRAME: EXCLUSIVE NOTES DIRECTORY */}
          {activeView === 'notes' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
              <div className="lg:col-span-4 flex flex-col gap-3 sticky top-28 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
                {notesContent.map((item, idx) => (
                  <button key={idx} onClick={() => setPageIndex(idx)} className={`text-left py-3 border-b uppercase text-xs tracking-wider transition-all ${pageIndex === idx ? 'border-amber-500 text-white font-bold' : 'border-white/[0.03] text-slate-500 hover:text-slate-300'}`}>
                    Module 0{idx + 1}: {item.title}
                  </button>
                ))}
              </div>
              <div className="lg:col-span-8 space-y-6">
                <h1 className="text-3xl font-serif font-light text-white uppercase tracking-tight pb-4 border-b border-white/5">{notesContent[pageIndex]?.title}</h1>
                <p className="text-slate-300 font-serif font-light text-base leading-relaxed whitespace-pre-wrap pt-4">
                  {notesContent[pageIndex]?.body}
                </p>
              </div>
            </div>
          )}

          {/* INNER VIEW MODULE FRAME: COMPACT CORPORATE JOBS ROSTER */}
          {activeView === 'jobs' && (
            <div className="space-y-16">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6 pb-6 border-b border-white/5">
                <h1 className="text-3xl font-serif font-light text-white uppercase tracking-tight">Active Placements</h1>
                <div className="flex gap-4 text-xs font-bold uppercase tracking-widest text-slate-500">
                  {['All', 'Bengaluru', 'Kolkata', 'Gurugram', 'Remote'].map((loc) => (
                    <button key={loc} onClick={() => setSelectedLocation(loc)} className={`hover:text-white transition-colors ${selectedLocation === loc ? 'text-amber-400 font-black' : ''}`}>{loc}</button>
                  ))}
                </div>
              </div>
              <div className="space-y-10">
                {jobOpenings.filter(j => selectedLocation === 'All' || j.location === selectedLocation).map((job, idx) => (
                  <div key={idx} className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b border-white/[0.02]">
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold text-amber-500 tracking-widest uppercase">{job.company}</span>
                      <h3 className="text-xl font-bold text-white tracking-tight">{job.role}</h3>
                      <p className="text-xs text-slate-500 font-medium">{job.location} // Corporate Desk Placement Track</p>
                    </div>
                    <a href={job.link} target="_blank" rel="noopener noreferrer" className="text-xs font-bold uppercase tracking-widest text-white border-b border-white pb-0.5 hover:text-amber-400 hover:border-amber-400 transition-colors">Apply Track &rarr;</a>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* INNER VIEW MODULE FRAME: SYSTEM ASSESSMENT SHEETS */}
          {activeView === 'quiz' && (
            <div className="max-w-2xl mx-auto">
              {!isTestStarted ? (
                <div className="space-y-8 p-12 bg-white/[0.01] border border-white/5 rounded-2xl text-center md:text-left">
                  <h2 className="text-3xl font-serif font-light text-white uppercase tracking-tight">Ecosystem Assessments</h2>
                  <div className="flex flex-wrap gap-4 text-xs font-bold uppercase tracking-wider border-b border-white/[0.04] pb-2 text-slate-500">
                    {['KYC Basics', 'AML Advanced', 'Transaction Monitoring'].map((cat) => (
                      <button key={cat} onClick={() => setSelectedCategory(cat)} className={`hover:text-white transition-all ${selectedCategory === cat ? 'text-amber-400 font-black border-b border-amber-500 pb-0.5' : ''}`}>{cat}</button>
                    ))}
                  </div>
                  <div className="space-y-5 max-w-sm pt-2">
                    <input type="text" placeholder="REGISTER CANDIDATE PROFILE IDENTIFIER" value={userName} onChange={(e) => setUserName(e.target.value)} className="w-full pb-2 bg-transparent border-b border-white/20 text-white text-sm outline-none focus:border-amber-500 tracking-widest font-bold uppercase" />
                    <button disabled={!userName.trim()} onClick={() => setIsTestStarted(true)} className="w-full py-4 border border-white text-white font-bold text-xs uppercase tracking-widest hover:bg-white hover:text-black transition-colors rounded-xl shadow-md">Initialize Track</button>
                  </div>
                </div>
              ) : !isTestComplete ? (
                <div className="space-y-6">
                  <div className="text-xs font-bold text-slate-500 uppercase tracking-widest flex gap-8 pb-4 border-b border-white/[0.04]">
                    <span>Module Node: {currentQuestionIndex + 1} / {testData.length}</span>
                    <span className="text-amber-400">Accrued Score: {quizScore}</span>
                  </div>
                  {testData.length > 0 ? (
                    <QuizItem item={testData[currentQuestionIndex]} onCorrect={() => setQuizScore(prev => prev + 10)} />
                  ) : (
                    <p className="text-sm italic text-slate-500">No question logs synchronized under this specific category selector mapping block.</p>
                  )}
                  {selectedOption && (
                    <button onClick={() => currentQuestionIndex < testData.length - 1 ? setCurrentQuestionIndex(prev => prev + 1) || setSelectedOption(null) : setIsTestComplete(true)} className="px-8 py-3.5 border border-white text-white font-bold text-xs uppercase tracking-widest block ml-auto hover:bg-white hover:text-black transition-colors rounded-xl shadow-md">Advance Node &rarr;</button>
                  )}
                </div>
              ) : (
                <div className="p-12 border border-white/5 rounded-2xl text-center space-y-6 animate-fade-in">
                  <h2 className="text-3xl font-serif font-light text-white uppercase tracking-tight">Metrics Finalized</h2>
                  <p className="text-sm text-slate-400 font-medium">Candidate Reference: <span className="text-white font-bold">{userName}</span> // Score Profile: <span className="text-amber-400 font-bold">{quizScore} Units</span></p>
                  <button onClick={() => setIsTestStarted(false) || setIsTestComplete(false) || setCurrentQuestionIndex(0) || setQuizScore(0) || setUserName("")} className="px-8 py-3.5 border border-white text-white font-bold text-xs uppercase tracking-widest hover:bg-white hover:text-black transition-colors rounded-xl">Dismiss Records</button>
                </div>
              )}
            </div>
          )}

          {/* INNER VIEW MODULE FRAME: REFERRAL CAPTURE PROCESSING */}
          {activeView === 'referralForm' && (
            <div className="max-w-2xl mx-auto">
              <h1 className="text-3xl font-serif font-light text-white uppercase tracking-tight pb-4 border-b border-white/[0.04] mb-10">Referral Insertion Form</h1>
              <form className="space-y-8 text-xs font-bold uppercase tracking-widest text-slate-500" onSubmit={async (e) => { e.preventDefault(); await supabase.from('submissions').insert([{ name: e.target[0].value, email: e.target[1].value, company: e.target[2].value, role: e.target[3].value }]); alert("Parameters cataloged into peer stream."); setActiveView('jobs'); }}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  {["Candidate Profile Naming", "Direct Routing Email Address", "Target Enterprise Desk", "Target Placement Role"].map((ph, i) => (
                    <div key={i} className="space-y-2 border-b border-white/10 pb-2 focus-within:border-amber-500 transition-colors">
                      <label className="tracking-widest block font-bold">{ph}</label>
                      <input required className="w-full bg-transparent text-white pt-2 font-medium normal-case outline-none text-sm tracking-normal" placeholder="Input parameters string text" />
                    </div>
                  ))}
                </div>
                <button type="submit" className="px-8 py-4 border border-white text-white font-bold uppercase tracking-widest text-xs hover:bg-white hover:text-black transition-colors rounded-xl shadow-md">Deploy Referral Vector</button>
              </form>
            </div>
          )}

          {/* INNER VIEW MODULE FRAME: AVAILABLE NET REFERRAL ASSETS FEED */}
          {activeView === 'available' && (
            <div className="space-y-8 max-w-4xl mx-auto">
              <h1 className="text-4xl font-serif font-light text-white uppercase tracking-tight pb-4 border-b border-white/[0.04]">Available Pipelines</h1>
              <div className="space-y-6">
                {submissions.map((sub, i) => (
                  <div key={i} className="pb-6 border-b border-white/[0.02] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold text-amber-500 tracking-widest uppercase block">{sub.company || 'Enterprise Firm'}</span>
                      <h3 className="text-xl font-bold text-white tracking-tight">{sub.role || 'Compliance Analyst'}</h3>
                      <p className="text-xs text-slate-500 font-medium pt-0.5">Sourced tracking indicator reference: {sub.name}</p>
                    </div>
                    <a href={`mailto:${sub.email}?subject=Referral`} className="text-xs font-bold uppercase tracking-widest text-white border-b border-white pb-0.5 hover:text-amber-400 hover:border-amber-400 transition-colors shrink-0">Contact Pipeline &rarr;</a>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* INNER VIEW MODULE FRAME: RECRUITER REGISTRATION PORTAL ENTRY */}
          {activeView === 'contribute' && (
            <div className="max-w-sm mx-auto">
              {!isAuthorized ? (
                <div className="space-y-6 p-10 border border-white/5 bg-white/[0.01] rounded-2xl text-center md:text-left">
                  <h2 className="text-2xl font-serif font-light text-white uppercase tracking-tight">Recruiter Gate Check</h2>
                  <div className="space-y-4">
                    <input type="email" placeholder="Verification Email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full p-4 bg-transparent border-b border-white/20 text-white outline-none text-sm font-medium focus:border-amber-500 transition-colors" />
                    <input type="password" placeholder="Passkey Key" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full p-4 bg-transparent border-b border-white/20 text-white outline-none text-sm font-medium focus:border-amber-500 transition-colors" />
                    <button onClick={async () => { const { error } = await supabase.auth.signInWithPassword({ email, password }); if (!error) setIsAuthorized(true); else alert("Access parameters denied."); }} className="w-full py-4 border border-white text-white font-bold uppercase tracking-widest text-xs hover:bg-white hover:text-black transition-colors rounded-xl shadow-md">Request Identity Clearance</button>
                  </div>
                </div>
              ) : (
                <div className="space-y-6 p-8 border border-white/5 bg-white/[0.01] rounded-2xl">
                  <h3 className="text-2xl font-serif font-light text-white uppercase tracking-tight">Deploy Document Files</h3>
                  <input type="email" placeholder="Recruiter Reference Desk Email" value={recruiterEmail} onChange={(e) => setRecruiterEmail(e.target.value)} className="w-full pb-2 bg-transparent border-b border-white/20 text-white text-sm focus:border-amber-500 transition-colors" />
                  <input type="file" className="block w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:border file:border-white/10 file:bg-transparent file:text-white file:text-[10px] file:font-bold file:uppercase file:tracking-widest hover:file:border-amber-500 file:transition-colors" onChange={(e) => setSelectedFile(e.target.files[0])} />
                  <button disabled={!selectedFile || !recruiterEmail} onClick={async () => { const path = `uploads/${Math.random()}.${selectedFile.name.split('.').pop()}`; await supabase.storage.from('intelligence').upload(path, selectedFile); const { data: { publicUrl } } = supabase.storage.from('intelligence').getPublicUrl(path); await supabase.from('partner_files').insert([{ name: selectedFile.name, url: publicUrl, recruiter_email: recruiterEmail }]); alert("Node registered."); setActiveView('network'); }} className="w-full py-4 bg-white text-black font-black uppercase tracking-widest text-xs hover:bg-amber-500 transition-all rounded-xl shadow-md">Publish Node</button>
                </div>
              )}
            </div>
          )}

          {/* INNER VIEW MODULE FRAME: RECRUITER UPLOAD REFUGE DOCUMENTS POOL */}
          {activeView === 'network' && (
            <div className="space-y-8 max-w-4xl mx-auto">
              <h1 className="text-4xl font-serif font-light text-white uppercase tracking-tight pb-4 border-b border-white/[0.04]">Placement Registries</h1>
              <div className="space-y-6">
                {partnerFiles.map((f, i) => (
                  <div key={i} className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-white/5">
                    <div>
                      <span className="text-[8px] text-slate-500 font-bold block mb-1">REFERENCE_DATA_NODE_0{i+1}</span>
                      <h3 className="text-xl font-bold text-white tracking-tight">{f.name}</h3>
                      <p className="text-xs text-amber-500 font-serif italic mt-1">Desk Coordinator Reference: {f.recruiter_email}</p>
                    </div>
                    <button onClick={() => window.open(f.url, '_blank')} className="text-xs font-bold uppercase tracking-widest text-white border-b border-white pb-0.5 hover:text-amber-400 hover:border-amber-400 transition-colors shrink-0">Download Document Intel &rarr;</button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* INTERNAL TERMS UTILITIES PROMPT (FAQ, Privacy, Terms) */}
          {['privacy', 'terms', 'faq', 'contact'].includes(activeView) && (
            <div className="max-w-3xl mx-auto leading-relaxed text-slate-400 font-serif font-light text-base whitespace-pre-wrap space-y-6">
              {activeView === 'privacy' && privacyPolicy.body}
              {activeView === 'terms' && termsOfService.body}
              {activeView === 'contact' && contactContent.body}
              {activeView === 'faq' && faqData.map((item, i) => (
                <div key={i} className="pb-6 border-b border-white/[0.03]">
                  <h4 className="font-sans font-medium text-white mb-2 uppercase tracking-wider text-sm">{item.question}</h4>
                  <p className="text-slate-400 italic pt-1 font-serif font-light">{item.answer}</p>
                </div>
              ))}
            </div>
          )}
        </main>
      )}

      {/* RETAINED HIGH-END WEB BASE BAR PLATFORM FOOTER */}
      <footer className="bg-transparent border-t border-white/[0.03] pt-24 pb-12 w-full mt-auto">
        <div className="max-w-7xl mx-auto px-8 grid grid-cols-1 md:grid-cols-12 gap-12 mb-12">
          <div className="md:col-span-6 space-y-4">
            <img src="/logo.png" alt="AML_DECODE" className="h-5 w-auto object-contain" />
            <p className="text-xs leading-relaxed text-slate-500 max-w-xs font-medium">
              A premium, editorial financial intelligence academy delivering advanced preparation matrices across transaction monitoring, screening tracks, and KYC analytics pathways.
            </p>
          </div>
          <div className="md:col-span-3 space-y-3 text-[10px] font-bold uppercase tracking-[0.25em]">
            <p className="text-amber-500">Directory Mapping</p>
            <button onClick={() => setActiveView('faq')} className="block text-slate-400 hover:text-white transition-colors">FAQ Index</button>
            <button onClick={() => setActiveView('contact')} className="block text-slate-400 hover:text-white transition-colors">Contact Desk</button>
            <button onClick={() => setActiveView('notes')} className="block text-slate-400 hover:text-white transition-colors">Notes Directory</button>
          </div>
          <div className="md:col-span-3 space-y-3 text-[10px] font-bold uppercase tracking-[0.25em]">
            <p className="text-amber-500">Legal Protection</p>
            <button onClick={() => setActiveView('privacy')} className="block text-slate-400 hover:text-white transition-colors">Privacy Policy</button>
            <button onClick={() => setActiveView('terms')} className="block text-slate-400 hover:text-white transition-colors">Terms of Service</button>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-8 pt-8 border-t border-white/[0.01] flex flex-col sm:flex-row justify-between items-center gap-4 text-[9px] font-bold text-slate-600 uppercase tracking-[0.3em]">
          <span>© 2026 AML_DECODE // WEB MASTERCLASS SYSTEM</span>
          <span>PLATFORM STABILITY ONLINE</span>
        </div>
      </footer>

      <SubscribeModal />
    </div>
  );
}