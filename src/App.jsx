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
    <div className={`mb-12 p-8 bg-white/[0.01] border transition-all duration-500 rounded-xl ${isLocked ? (isCorrect ? 'border-amber-500 shadow-[0_0_30px_rgba(251,191,36,0.1)]' : 'border-red-500/30') : 'border-white/5'}`}>
      
      {/* 1. Question Header: Bold and Professional */}
      <div className="pb-6 border-b border-white/[0.05]">
        <div className="flex justify-between items-start gap-4">
          <h2 className="text-xl font-bold text-white leading-tight">{item.question}</h2>
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
              
              let buttonStyle = "border-white/10 bg-transparent text-slate-300 hover:border-amber-400/40";
              if (isLocked) {
                if (isCorrect && isThisCorrect) buttonStyle = "border-amber-500 bg-amber-500/10 text-amber-400";
                else if (isThisSelected && !isThisCorrect) buttonStyle = "border-red-500/40 bg-red-500/5 text-red-400";
                else buttonStyle = "border-white/5 bg-transparent text-slate-600 opacity-40";
              }

              return (
                <button 
                  key={i} 
                  disabled={isLocked} 
                  onClick={() => handleSelect(opt)}
                  className={`group relative block w-full text-left p-4 border rounded-lg transition-all duration-300 font-medium text-sm md:text-base min-h-[60px] ${buttonStyle}`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className="flex-grow">{opt}</span>
                    {!isLocked && <span className="opacity-0 group-hover:opacity-100 text-[10px] text-amber-400 font-black whitespace-nowrap tracking-widest">SELECT &rarr;</span>}
                  </div>
                </button>
              );
            });
          } catch { return <p className="text-red-500">Error: Invalid format</p>; }
        })()}
      </div>

      {/* 3. The Rationale: The "Real" Interview Prep Feature */}
      {isLocked && (
        <div className="mt-6 pt-6 border-t border-white/[0.05] animate-in fade-in duration-500">
          <div className="flex items-start gap-3">
            <div className={`mt-1 p-1 rounded-md ${isCorrect ? 'text-amber-400' : 'text-slate-500'}`}>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest mb-1 text-slate-400">Interview Insight / Rationale</p>
              <p className="text-sm text-slate-300 leading-relaxed italic font-serif">
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

  const handleClose = () => {
    setIsOpen(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-fade-in">
      <div className="bg-[#040712] border border-white/10 p-10 rounded-xl max-w-md w-full relative shadow-2xl space-y-6">
        <button onClick={handleClose} className="absolute top-4 right-4 text-slate-500 hover:text-white transition-colors p-1">✕</button>
        
        <div className="space-y-2">
          <h2 className="text-2xl font-light text-white tracking-tight uppercase font-serif">Stay Updated</h2>
          <p className="text-slate-400 text-sm leading-relaxed font-medium">
            Subscribe to get daily AML/KYC job alerts from Bengaluru, Kolkata, and beyond directly in your inbox.
          </p>
        </div>

        <form onSubmit={handleSubscribe} className="space-y-4">
          <input 
            type="email" 
            required 
            placeholder="Enter your email address" 
            className="w-full p-4 bg-white/[0.02] border border-white/10 text-white focus:border-amber-400 outline-none text-sm font-medium transition-colors"
            onChange={(e) => setEmail(e.target.value)}
          />
          <button type="submit" className="w-full py-4 bg-gradient-to-b from-amber-400 to-amber-600 text-black font-bold uppercase tracking-widest text-xs transition-all hover:brightness-110 rounded-sm">
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
  
  // Helper function to check if a node item is under 4 days old (96 hours)
  const isNewlyAdded = (dateString) => {
    if (!dateString) return false;
    const itemDate = new Date(dateString);
    const currentDate = new Date();
    
    // Total milliseconds separation divided by hours/days factor
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
      const { data: news, error: newsError } = await supabase.from('news').select('*');
      
      const { data: quiz, error: quizError } = await supabase
        .from('quiz_questions')
        .select('*')
        .eq('category', selectedCategory)
        .range(0, 99); 
      
      if (quizError) console.error("Supabase Quiz Error:", quizError);
      
      if (subs) setSubmissions(subs);
      if (files) setPartnerFiles(files);
      if (newsError) console.error("Supabase News Error:", newsError);
      setNewsList(news && news.length > 0 ? news : kycNews);
      
      if (quiz) setTestData(quiz);
      setIsLoading(false);
    };
    
    fetchData();
  }, [selectedCategory]);

  const navItems = [
    { label: 'Syllabus Notes', id: 'notes' }, { label: 'Active Placements', id: 'jobs' },
    { label: 'Submit Referral', id: 'referralForm' }, { label: 'Available Referrals', id: 'available' },
    { label: 'Recruiter Desk', id: 'contribute' }, { label: 'Network Listings', id: 'network' },
    { label: 'Knowledge Test', id: 'quiz' }
  ];

  return (
    <div className="text-slate-200 font-sans min-h-screen flex flex-col relative bg-[#040712] antialiased">
      
      {/* HIGH-END MINIMAL TOP NAVBAR */}
      <nav className="sticky top-0 left-0 w-full z-50 bg-[#040712]/70 backdrop-blur-xl border-b border-white/[0.01]">
        <div className="max-w-7xl mx-auto px-8 md:px-16 h-24 flex items-center justify-between">
          <div onClick={() => setActiveView(null)} className="cursor-pointer">
            <img src="/logo.png" alt="AML_DECODE Logo" className="h-5 w-auto object-contain" />
          </div>

          <div className="hidden lg:flex items-center gap-10 font-bold text-[11px] tracking-[0.3em] uppercase text-slate-400">
            {navItems.slice(0, 2).map((item) => (
              <button key={item.id} onClick={() => setActiveView(item.id)} className={`transition-colors ${activeView === item.id ? "text-amber-400" : "hover:text-white"}`}>{item.label}</button>
            ))}
            {navItems.slice(5, 7).map((item) => (
              <button key={item.id} onClick={() => setActiveView(item.id)} className={`transition-colors ${activeView === item.id ? "text-amber-400" : "hover:text-white"}`}>{item.label}</button>
            ))}
            <button onClick={() => { setActiveView(null); setTimeout(() => { document.getElementById('career-guidance')?.scrollIntoView({ behavior: 'smooth' }); }, 100); }} className="hover:text-white transition-colors">Career Guidance</button>
            <div className="relative group cursor-pointer">
              <span className="hover:text-white flex items-center gap-1.5 transition-colors">Pipelines</span>
              <div className="absolute top-full right-0 w-56 bg-slate-950 border border-white/5 rounded-xl py-2 mt-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all shadow-3xl">
                <button onClick={() => setActiveView('referralForm')} className="w-full text-left px-5 py-2.5 text-[10px] tracking-widest text-slate-400 hover:text-amber-400 uppercase font-bold">Submit Referral</button>
                <button onClick={() => setActiveView('available')} className="w-full text-left px-5 py-2.5 text-[10px] tracking-widest text-slate-400 hover:text-amber-400 uppercase font-bold">Available Pools</button>
              </div>
            </div>
            <button onClick={() => setActiveView('contribute')} className="text-white border-b border-white pb-0.5 hover:text-amber-400 hover:border-amber-400 transition-colors tracking-widest">Recruiter Desk &rarr;</button>
          </div>

          <button className="lg:hidden text-white p-2" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeWidth="1.5" d={isMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} /></svg>
          </button>
        </div>
      </nav>

      {/* MOBILE MENU SHEET */}
      {isMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-[100] bg-[#040712] flex flex-col p-10 justify-center space-y-6 animate-fade-in">
          <button onClick={() => setIsMenuOpen(false)} className="absolute top-8 right-8 text-white text-2xl p-2">✕</button>
          {navItems.map((item) => (
            <button key={item.id} onClick={() => setActiveView(item.id) || setIsMenuOpen(false)} className="text-3xl font-serif text-left uppercase text-white hover:text-amber-400 transition-colors">{item.label}</button>
          ))}
        </div>
      )}

      {/* TOP-DOWN LAYOUT FLOW VIEWPORT */}
      {!activeView && (
        <main className="flex-grow w-full">
          <CinematicHero />

          <section className="max-w-7xl mx-auto px-8 md:px-16 py-36 space-y-36 bg-[#040712]">
            
            {/* NOBL HOVER STRUCTURE: ASYMMETRIC CONTENT BLOCK */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
              <div className="lg:col-span-4 sticky top-40 space-y-4">
                <span className="text-[10px] font-bold tracking-[0.4em] text-amber-500 uppercase block">Capabilities // Case Study</span>
                <h2 className="text-4xl md:text-5xl font-serif font-light text-white tracking-tight leading-tight">The Strategy Execution</h2>
                <p className="text-sm text-slate-500 max-w-xs leading-relaxed font-medium">
                  Operational parameters reviewed natively against global compliance trends.
                </p>
              </div>

              <div className="lg:col-span-8 space-y-12">
                <p className="text-xl md:text-2xl font-serif font-light text-slate-200 leading-relaxed max-w-3xl">
                  "A cross-border corporate payment originating from an offshore tech hub is flagged by your monitoring system. The beneficiary entity is perfectly clean on all global sanctions watchlists. However, upon deep-dive routing analysis, you discover that the transaction utilizes a nested correspondent banking structure, and one of the downstream, non-account-holding intermediary transit banks listed in the SWIFT MT103 tracking strings is a financial institution that was placed under selective sectorial sanctions exactly 48 hours ago. The transaction value is under the standard regulatory reporting threshold. What is the correct protocol?"
                </p>
                
                <div className="space-y-4 max-w-xl pt-2">
                  <button disabled={isChallengeLocked} onClick={() => handleChallenge('edd')} className="w-full text-left py-4 border-b border-white/10 text-xs font-semibold uppercase tracking-widest text-slate-400 hover:text-white transition-colors">
                    Freeze Asset Framework & Escalate Regulatory STR/SAR
                  </button>
                  <button disabled={isChallengeLocked} onClick={() => handleChallenge('dismiss')} className="w-full text-left py-4 border-b border-white/10 text-xs font-semibold uppercase tracking-widest text-slate-400 hover:text-white transition-colors">
                    Log Parameters Internally & Approve System Processing
                  </button>
                </div>

                {isChallengeLocked && (
                  <div className="pt-6 text-sm text-slate-400 font-serif italic space-y-1 animate-fade-in max-w-2xl">
                    <p className="text-[9px] uppercase tracking-widest text-amber-500 font-bold not-italic">Oversight Briefing</p>
                    <p>{challengeSelected === 'edd' ? "CORRECT: In sanctions compliance, there is no monetary threshold; processing even a minor amount through a sanctioned intermediary bank is a strict liability violation. Illicit networks routinely utilize nested correspondent banking structures to exploit filtering blind spots. Immediate asset restraint and regulatory escalation (SAR/STR) are mandatory to mitigate systemic exposure." : "INCORRECT: Clearing a transaction that contains a sanctioned entity anywhere in its processing path—regardless of asset size or clean ordering/beneficiary profiles—constitutes a severe compliance breach. Sanctions regulations carry strict liability, meaning lack of intent or low transaction value offers no legal safe harbor."}</p>
                  </div>
                )}

                {/* STAT VECTORS */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 pt-12 border-t border-white/[0.04]">
                  {[{ area: 'Bengaluru Vector Desk', status: '+14% Core Placement Drift' }, { area: 'Kolkata Vector Desk', status: 'Executive Sourcing Alignment Active' }].map((pulse, i) => (
                    <div key={i} className="space-y-1">
                      <span className="text-[9px] uppercase font-bold tracking-widest text-slate-500">{pulse.area}</span>
                      <h4 className="text-xl font-serif font-light text-white">{pulse.status}</h4>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* HORIZONTAL CONTINUOUS MARQUEE BAND */}
            <div className="w-full bg-white/[0.01] border-y border-white/[0.02] py-8 overflow-hidden">
              <div className="text-[11px] font-medium text-slate-500 uppercase tracking-[0.4em] flex gap-20 whitespace-nowrap animate-marquee">
                <span>• METHODOLOGY ADJUST CHANNELS ALIGNING IN REGARD TO RBI MANDATE SHIFTS</span>
                <span>• SYSTEM TRANSACTION RISK MANAGEMENT PARAMETERS INTEGRATING LIVE UNDER 2026 AUDITS</span>
                <span>• COMPLIANCE PLACEMENT PLOTS REGISTER ACCELERATING DEMAND MATRICES</span>
              </div>
            </div>

            {/* HIGH-END MINIMALIST SYLLABUS DISCOVERY HIGHLIGHT */}
            <div className="py-16 border-t border-white/[0.02] grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
              <div className="lg:col-span-7 space-y-6">
                <span className="text-[10px] font-bold tracking-[0.4em] text-amber-500 uppercase block">Methodology Focus</span>
                <h2 className="text-4xl md:text-6xl font-serif font-light text-white leading-tight tracking-tight">Tackle Real Barriers.<br />Whitespace Driven.</h2>
                <p className="text-slate-400 text-sm md:text-base leading-relaxed font-medium max-w-2xl">
                  Most platforms deliver generic data piles, not real capability progress. We re-structure intensive institutional directives into clear lookbook profiles, optimized with straightforward checks built for profile verification and exam blocks.
                </p>
                <div className="pt-4 flex gap-8 text-xs font-bold uppercase tracking-widest">
                  <button onClick={() => setActiveView('notes')} className="text-white border-b border-white pb-1 hover:text-amber-400 hover:border-amber-400 transition-colors">Syllabus Index Tracks &rarr;</button>
                  <button onClick={() => setActiveView('quiz')} className="text-slate-500 hover:text-white transition-colors">Start System Exam</button>
                </div>
              </div>
              <div className="lg:col-span-5 h-[340px] border border-white/5 rounded-2xl bg-gradient-to-b from-white/[0.01] to-transparent flex items-center justify-center p-8 text-center">
                <p className="text-xs text-slate-500 font-serif italic max-w-xs">Ecosystem core loops rendering fluidly across active document matrix frameworks.</p>
              </div>
            </div>

            {/* CAREER GUIDANCE COMPOSITION TRACK */}
            <div id="career-guidance" className={`py-16 border-t border-white/[0.02] grid grid-cols-1 lg:grid-cols-12 gap-16 transition-all duration-500 ${highlightCareer ? 'bg-white/[0.02] rounded-2xl p-6' : ''}`}>
              <div className="lg:col-span-4 space-y-4">
                <span className="text-[10px] font-bold tracking-[0.4em] text-amber-500 uppercase block">Consultation Registry Open</span>
                <h2 className="text-4xl md:text-5xl font-serif font-light text-white tracking-tight leading-none">1:1 Mentorship Desk</h2>
                <p className="text-sm text-slate-400 leading-relaxed font-medium">
                  Request a dedicated evaluation mapping sequence dossier to structure technical portfolios, clear resume roadblocks, and match screening metrics.
                </p>
                <button 
                  onClick={() => {
                    const subject = encodeURIComponent("Mentorship Intake Request - [Your Name]");
                    const body = encodeURIComponent("Hello AML_DECODE Team,\n\nI am interested in a 1:1 mentorship session. Here are my details:\n\nCurrent Role:\nLocation:\nProgram of Interest (Resume/Interview/Full Prep):\n\nPlease guide me on the next steps.");
                    window.location.href = `mailto:alerts@amldecode.in?subject=${subject}&body=${body}`;
                  }} 
                  className="pt-4 text-xs font-bold uppercase tracking-widest text-white border-b border-white pb-0.5 hover:text-amber-400 hover:border-amber-400 transition-all block w-fit"
                >
                  Request Profile Processing &rarr;
                </button>
              </div>

              <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-10 text-xs font-bold uppercase tracking-wider text-slate-400 pl-0 lg:pl-16 lg:border-l border-white/5">
                {["Resume Mapping and Restructuring", "Application Pipeline Velocity Allocation", "Mock Interview Case Analysis Isolation", "Specialized Risk Framework Verification Sync"].map((module, idx) => (
                  <div key={idx} className="pb-4 border-b border-white/[0.02] flex items-start gap-4">
                    <span className="text-amber-500 font-serif text-sm font-light">0{idx + 1}</span>
                    <span className="text-white/80 tracking-wide pt-0.5">{module}</span>
                  </div>
                ))}
              </div>
            </div>

          </section>
        </main>
      )}

      {/* FULL WIDTH DYNAMIC ABSTRACT SUB-VIEW SHEETS */}
      {activeView && (
        <main className="flex-grow pt-44 max-w-7xl mx-auto px-10 w-full pb-32 animate-fade-in">
          <button onClick={() => setActiveView(null) || setQuizScore(0) || setCurrentQuestionIndex(0) || setIsTestStarted(false) || setIsTestComplete(false) || setUserName("") || setSelectedOption(null)} className="text-xs font-medium tracking-[0.3em] text-amber-500 hover:text-white transition-colors uppercase mb-16 block">
            &larr; Return to Workspace Overview
          </button>

          {/* INNER LAYER TRACK SHEET: SYLLABUS DIRECTORY NOTES */}
          {activeView === 'notes' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
              <div className="lg:col-span-4 flex flex-col gap-4 sticky top-44 max-h-[65vh] overflow-y-auto pr-2 custom-scrollbar">
                {notesContent.map((item, idx) => (
                  <button key={idx} onClick={() => setPageIndex(idx)} className={`text-left py-3 border-b uppercase tracking-wide text-xs ${pageIndex === idx ? 'border-amber-500 text-white font-bold' : 'border-white/5 text-slate-500 hover:text-slate-300'}`}>
                    <span className="text-[8px] text-slate-600 block mb-0.5">Track_0{idx + 1}</span>
                    {item.title}
                  </button>
                ))}
              </div>
              <div className="lg:col-span-8 space-y-6">
                <h1 className="text-4xl font-serif font-light text-white leading-tight uppercase tracking-tight pb-6 border-b border-white/[0.04]">{notesContent[pageIndex]?.title}</h1>
                <p className="text-slate-300 font-serif font-light text-base leading-relaxed whitespace-pre-wrap pt-4">
                  {notesContent[pageIndex]?.body}
                </p>
              </div>
            </div>
          )}

          {/* INNER LAYER TRACK SHEET: PLACEMENTS FEED LIST */}
          {activeView === 'jobs' && (
            <div className="space-y-16 max-w-4xl">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 pb-6 border-b border-white/[0.04]">
                <div>
                  <h1 className="text-4xl font-serif font-light text-white uppercase tracking-tight">Active Opportunities</h1>
                  <p className="text-xs text-slate-500 font-medium mt-1">Filter track coordinates to narrow profiling parameters.</p>
                </div>
                <div className="flex flex-wrap gap-4 text-xs font-bold uppercase tracking-widest text-slate-500">
                  {['All', 'Bengaluru', 'Kolkata', 'Gurugram', 'Remote'].map((loc) => (
                    <button key={loc} onClick={() => setSelectedLocation(loc)} className={`hover:text-white transition-colors ${selectedLocation === loc ? 'text-amber-400 font-black' : ''}`}>{loc}</button>
                  ))}
                </div>
              </div>
              <div className="space-y-12">
                {jobOpenings
                  .filter(j => selectedLocation === 'All' || j.location === selectedLocation)
                  .map((job, idx) => (
                    <div key={idx} className="group flex flex-col md:flex-row justify-between items-start md:items-center gap-6 pb-8 border-b border-white/[0.02]">
                      <div className="space-y-1">
                        <span className="text-[10px] font-bold tracking-widest uppercase text-amber-500">{job.company}</span>
                        <h2 className="text-xl font-bold text-white group-hover:text-amber-400 transition-colors duration-300">{job.role}</h2>
                        <p className="text-xs text-slate-500 font-medium">{job.location} // Corporate Desk Connection Node</p>
                      </div>
                      <a href={job.link} target="_blank" rel="noopener noreferrer" className="text-xs font-bold uppercase tracking-widest text-white border-b border-white pb-0.5 hover:text-amber-400 hover:border-amber-400 transition-colors shrink-0">Apply Track &rarr;</a>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* INNER LAYER TRACK SHEET: SYSTEM ASSESSMENT LOOP DESK */}
          {activeView === 'quiz' && (
            <div className="max-w-3xl">
              {!isTestStarted ? (
                <div className="space-y-10">
                  <div className="space-y-3">
                    <h2 className="text-4xl font-serif font-light text-white uppercase tracking-tight">Verification Systems</h2>
                    <p className="text-slate-400 text-sm leading-relaxed max-w-sm font-medium">Select an active tracking matrix loop and input evaluation metrics to initialize verification.</p>
                  </div>
                  <div className="flex flex-wrap gap-4 text-xs font-bold uppercase tracking-widest text-slate-500">
                    {['KYC Basics', 'AML Advanced', 'Transaction Monitoring'].map((cat) => (
                      <button key={cat} onClick={() => setSelectedCategory(cat)} className={`hover:text-white transition-all ${selectedCategory === cat ? 'text-amber-400 font-black border-b border-amber-500 pb-1' : ''}`}>{cat}</button>
                    ))}
                  </div>
                  <div className="space-y-4 max-w-sm pt-4">
                    <input type="text" placeholder="Candidate Profile Name" value={userName} onChange={(e) => setUserName(e.target.value)} className="w-full pb-2 bg-transparent border-b border-white/20 text-white text-sm outline-none focus:border-amber-500 tracking-widest font-bold uppercase" />
                    <button disabled={!userName.trim()} onClick={() => setIsTestStarted(true)} className="w-full py-4 border border-white text-white font-bold text-xs uppercase tracking-widest hover:bg-white hover:text-black transition-colors">Initialize Examination</button>
                  </div>
                </div>
              ) : !isTestComplete ? (
                <div className="space-y-8 animate-slide-up">
                  <div className="text-xs font-bold text-slate-500 uppercase tracking-widest flex gap-8 pb-4 border-b border-white/[0.04]">
                    <span>Matrix Step: {currentQuestionIndex + 1} / {testData.length}</span>
                    <span className="text-amber-400">Accrued Assessment Score: {quizScore}</span>
                  </div>
                  {testData.length > 0 ? (
                    <QuizItem item={testData[currentQuestionIndex]} onCorrect={() => setQuizScore(prev => prev + 10)} />
                  ) : (
                    <p className="text-sm italic text-slate-500">No question modules synchronized for this target sector context block.</p>
                  )}
                  {selectedOption && (
                    <button onClick={() => currentQuestionIndex < testData.length - 1 ? setCurrentQuestionIndex(prev => prev + 1) || setSelectedOption(null) : setIsTestComplete(true)} className="px-8 py-3 border border-white text-white font-bold text-xs uppercase tracking-widest block ml-auto hover:bg-white hover:text-black transition-colors">Advance Module Node →</button>
                  )}
                </div>
              ) : (
                <div className="space-y-6 animate-fade-in text-center md:text-left">
                  <h2 className="text-4xl font-serif font-light text-white uppercase tracking-tight">Verification Logs Saved</h2>
                  <p className="text-sm text-slate-400 font-medium">Candidate Reference Track: <span className="text-white font-bold">{userName}</span> // Score Profile Metrics: <span className="text-amber-400 font-bold">{quizScore} Units</span></p>
                  <button onClick={() => setIsTestStarted(false) || setIsTestComplete(false) || setCurrentQuestionIndex(0) || setQuizScore(0) || setUserName("")} className="px-8 py-3 border border-white text-white font-bold text-xs uppercase tracking-widest hover:bg-white hover:text-black transition-colors">Dismiss Active Record</button>
                </div>
              )}
            </div>
          )}

          {/* INNER LAYER TRACK SHEET: SYNC REFERRAL FORM REGISTRY */}
          {activeView === 'referralForm' && (
            <div className="max-w-2xl">
              <h1 className="text-3xl font-serif font-light text-white uppercase tracking-tight pb-6 border-b border-white/[0.04] mb-10">Referral Insertion Form</h1>
              <form className="space-y-8 text-xs font-bold uppercase tracking-widest text-slate-500" onSubmit={async (e) => { e.preventDefault(); const formData = { name: e.target[0].value, email: e.target[1].value, company: e.target[2].value, role: e.target[3].value }; const { error } = await supabase.from('submissions').insert([formData]); if(!error) { alert("TRANSMISSION SUCCESSFUL: Referral Node Logged."); setActiveView('jobs'); } else { alert("CRITICAL ERROR: Connection Terminated."); } }}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  {["Candidate Profile Naming", "Direct Routing Email Address", "Target Enterprise Desk", "Target Placement Role"].map((ph, i) => (
                    <div key={i} className="space-y-2 border-b border-white/10 pb-2 focus-within:border-amber-500 transition-colors">
                      <label className="tracking-widest block font-bold">{ph}</label>
                      <input required className="w-full bg-transparent text-white pt-2 font-medium normal-case outline-none text-sm tracking-normal" placeholder="Input parameters string text" />
                    </div>
                  ))}
                </div>
                <button type="submit" className="px-8 py-4 border border-white text-white font-bold uppercase tracking-widest text-xs hover:bg-white hover:text-black transition-colors">Execute Insertion Sequence</button>
              </form>
            </div>
          )}

          {/* INNER LAYER TRACK SHEET: REFERRAL POOLS FEED */}
          {activeView === 'available' && (
            <div className="space-y-12 max-w-4xl">
              <h1 className="text-4xl font-serif font-light text-white uppercase tracking-tight pb-6 border-b border-white/[0.04]">Available Pipelines</h1>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                {submissions.length > 0 ? (
                  submissions
                    .sort((a, b) => {
                      const aNew = isNewlyAdded(a.created_at) ? 1 : 0;
                      const bNew = isNewlyAdded(b.created_at) ? 1 : 0;
                      return bNew - aNew;
                    })
                    .map((sub, i) => {
                      const isNew = isNewlyAdded(sub.created_at);
                      return (
                        <div key={i} className={`space-y-4 pb-6 border-b border-white/[0.02] relative ${isNew ? 'border-amber-500/30' : ''}`}>
                          <div>
                            <span className="text-[10px] font-bold tracking-widest text-amber-500 uppercase block mb-1">
                              {sub.company || 'Enterprise Desk'} {isNew && <span className="text-[8px] bg-amber-500 text-black px-1.5 ml-2 rounded tracking-widest animate-pulse font-sans">NEW</span>}
                            </span>
                            <h3 className="text-xl font-bold text-white tracking-tight">{sub.role || 'Compliance Specialist'}</h3>
                            <p className="text-xs text-slate-500 font-medium pt-1">Sourced via reference: {sub.name}</p>
                          </div>
                          <a href={`mailto:${sub.email}?subject=Referral Inquiry: ${sub.role} at ${sub.company}`} className="text-xs font-bold uppercase tracking-widest text-white border-b border-white pb-0.5 hover:text-amber-400 hover:border-amber-400 transition-all inline-block">Request Connection Loop &rarr;</a>
                        </div>
                      );
                    })
                ) : (
                  <div className="col-span-full py-20 text-center border border-dashed border-white/10 rounded-xl">
                    <p className="text-slate-500 text-sm uppercase tracking-widest">No Peer Referral Nodes Detected</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* INNER LAYER TRACK SHEET: RECRUITER CLEARANCE PASS DOOR */}
          {activeView === 'contribute' && (
            <div className="max-w-md">
              {!isAuthorized ? (
                <div className="space-y-6">
                  <h2 className="text-3xl font-serif font-light text-white uppercase tracking-tight">Identity Access Desk</h2>
                  <div className="space-y-4">
                    <input type="email" placeholder="Verification Email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full pb-2 bg-transparent border-b border-white/20 text-white outline-none text-sm font-medium focus:border-amber-500 transition-colors" />
                    <input type="password" placeholder="Passkey Key" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full pb-2 bg-transparent border-b border-white/20 text-white outline-none text-sm font-medium focus:border-amber-500 transition-colors" />
                    <button onClick={async () => { const { error } = await supabase.auth.signInWithPassword({ email, password }); if (!error) setIsAuthorized(true); else alert("Identity credentials failure."); }} className="w-full py-4 border border-white text-white font-bold uppercase tracking-widest text-xs hover:bg-white hover:text-black transition-colors">Request Identity Clearance</button>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  <h3 className="text-3xl font-serif font-light text-white uppercase tracking-tight">Deploy Document Nodes</h3>
                  <input type="email" placeholder="Deployment Recruiter Email Desk" value={recruiterEmail} onChange={(e) => setRecruiterEmail(e.target.value)} className="w-full pb-2 bg-transparent border-b border-white/20 text-white text-sm focus:border-amber-500 transition-colors" />
                  <input type="file" className="block w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:border file:border-white/10 file:bg-transparent file:text-white file:text-[10px] file:font-bold file:uppercase file:tracking-widest hover:file:border-amber-500 file:transition-colors" onChange={(e) => setSelectedFile(e.target.files[0])} />
                  <button disabled={!selectedFile || !recruiterEmail} onClick={async () => { const path = `uploads/${Math.random()}.${selectedFile.name.split('.').pop()}`; await supabase.storage.from('intelligence').upload(path, selectedFile); const { data: { publicUrl } } = supabase.storage.from('intelligence').getPublicUrl(path); await supabase.from('partner_files').insert([{ name: selectedFile.name, url: publicUrl, recruiter_email: recruiterEmail }]); alert("Node registered."); setActiveView('network'); }} className="w-full py-4 border border-white text-white font-bold uppercase tracking-widest text-xs hover:bg-white hover:text-black transition-all">Publish Reference Node</button>
                </div>
              )}
            </div>
          )}

          {/* INNER LAYER TRACK SHEET: PARTNER DOCUMENT NET LISTINGS */}
          {activeView === 'network' && (
            <div className="space-y-12 max-w-4xl">
              <h1 className="text-4xl font-serif font-light text-white uppercase tracking-tight pb-6 border-b border-white/[0.04]">Placement Registries</h1>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                {partnerFiles.length > 0 ? (
                  partnerFiles
                    .sort((a, b) => {
                      const aNew = isNewlyAdded(a.created_at) ? 1 : 0;
                      const bNew = isNewlyAdded(b.created_at) ? 1 : 0;
                      return bNew - aNew;
                    })
                    .map((f, i) => {
                      const isNew = isNewlyAdded(f.created_at);
                      return (
                        <div key={i} className="space-y-4 pb-6 border-b border-white/[0.02]">
                          <div>
                            <span className="text-[9px] text-slate-500 block font-bold tracking-widest uppercase mb-1">Index_Reference_Node_0{i+1} {isNew && <span className="text-amber-400 font-sans pl-2">NEW</span>}</span>
                            <h3 className="text-xl font-bold text-white tracking-tight">{f.name}</h3>
                            {f.recruiter_email && <p className="text-xs text-amber-500 font-serif italic mt-1">Desk Auth Reference: {f.recruiter_email}</p>}
                          </div>
                          <div className="flex gap-4">
                            <button onClick={() => window.open(f.url, '_blank')} className="text-xs font-bold uppercase tracking-widest text-white border-b border-white pb-0.5 hover:text-amber-400 hover:border-amber-400 transition-all">Download Document Intel &rarr;</button>
                            {f.recruiter_email && <a href={`mailto:${f.recruiter_email}?subject=Inquiry: ${f.name} (via AML_DECODE)`} onClick={() => trackEmailClick(f.id)} className="text-xs font-bold uppercase tracking-widest text-slate-500 hover:text-white transition-colors">Email HR</a>}
                          </div>
                        </div>
                      );
                    })
                ) : (
                  <div className="col-span-full py-20 text-center border border-dashed border-white/10 rounded-xl">
                    <p className="text-slate-500 text-sm uppercase tracking-widest">No Intelligence Documents Found</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* CORE SYSTEM GENERAL STATIC UTILITIES HANDLING */}
          {['privacy', 'terms', 'faq', 'contact'].includes(activeView) && (
            <div className="max-w-2xl leading-relaxed text-slate-400 font-serif font-light text-base whitespace-pre-wrap space-y-8 animate-fade-in">
              {activeView === 'privacy' && privacyPolicy.body}
              {activeView === 'terms' && termsOfService.body}
              {activeView === 'contact' && contactContent.body}
              {activeView === 'faq' && faqData.map((item, i) => (
                <div key={i} className="pb-6 border-b border-white/[0.02]">
                  <h4 className="font-sans font-medium text-white mb-2 uppercase tracking-wider text-sm">{item.question}</h4>
                  <p className="text-slate-400 italic pt-1">{item.answer}</p>
                </div>
              ))}
            </div>
          )}
        </main>
      )}

      {/* CORE SYSTEM LANDING WEB INTERFACE BASE FOOTER */}
      <footer className="bg-transparent border-t border-white/[0.02] pt-24 pb-12 w-full mt-auto">
        <div className="max-w-7xl mx-auto px-10 grid grid-cols-1 md:grid-cols-12 gap-16 mb-16">
          <div className="md:col-span-6 space-y-4">
            <img src="/logo.png" alt="AML_DECODE" className="h-5 w-auto object-contain mix-blend-difference" />
            <p className="text-xs leading-relaxed text-slate-500 max-w-xs font-medium">
              An adaptive financial masterclass platform structuring comprehensive transformations across cross-border risk screening, frameworks metrics, and advanced oversight compliance pipelines.
            </p>
          </div>
          <div className="md:col-span-3 space-y-3 text-[10px] font-bold uppercase tracking-[0.25em]">
            <p className="text-amber-500">Platform Blueprint</p>
            <button onClick={() => setActiveView('faq')} className="block text-slate-400 hover:text-white transition-colors">FAQ Index</button>
            <button onClick={() => setActiveView('contact')} className="block text-slate-400 hover:text-white transition-colors">Contact Desk</button>
            <button onClick={() => setActiveView('notes')} className="block text-slate-400 hover:text-white transition-colors">Notes Directory</button>
          </div>
          <div className="md:col-span-3 space-y-3 text-[10px] font-bold uppercase tracking-[0.25em]">
            <p className="text-amber-500">Legal Protection</p>
            <button onClick={() => setActiveView('privacy')} className="block text-slate-400 hover:text-white transition-colors">Privacy Matrix</button>
            <button onClick={() => setActiveView('terms')} className="block text-slate-400 hover:text-white transition-colors">Terms of Service</button>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-10 pt-8 border-t border-white/[0.01] flex justify-between items-center text-[9px] font-bold text-slate-600 uppercase tracking-[0.3em]">
          <span>© 2026 AML_DECODE</span>
          <span>ECOSYSTEM ALLOCATION ACTIVE</span>
        </div>
      </footer>

      <SubscribeModal />
    </div>
  );
}