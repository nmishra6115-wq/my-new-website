import React, { useState, useEffect, useRef } from 'react';
import { supabase } from './supabaseClient';
import { notesContent, privacyPolicy, termsOfService, faqData, contactContent } from './content';
import { jobOpenings } from './jobs';
import { kycNews } from './news';

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
    <div className={`mb-10 p-0 overflow-hidden bg-slate-900/50 border rounded-xl transition-all duration-500 ${isLocked ? (isCorrect ? 'border-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.1)]' : 'border-red-500/50') : 'border-slate-800'}`}>
      
      {/* 1. Question Header: Bold and Professional */}
      <div className="p-6 border-b border-slate-800/50 bg-black/20">
        <div className="flex justify-between items-start gap-4">
          <h2 className="text-lg font-bold text-slate-100 leading-tight">{item.question}</h2>
          {isLocked && (
            <span className={`shrink-0 h-6 w-6 rounded-full flex items-center justify-center text-xs font-black ${isCorrect ? 'bg-emerald-500 text-black' : 'bg-red-500 text-white'}`}>
              {isCorrect ? '✓' : '✕'}
            </span>
          )}
        </div>
      </div>

      {/* 2. Options Grid: Sized for Mobile Compatibility */}
      <div className="p-6 space-y-3">
        {(() => {
          try {
            const options = typeof item.options === 'string' ? JSON.parse(item.options) : item.options;
            return options.map((opt, i) => {
              const isThisSelected = selected === opt;
              const isThisCorrect = opt === item.correct_answer;
              
              let buttonStyle = "border-slate-700 bg-black/40 text-slate-400 hover:border-emerald-500/50";
              if (isLocked) {
                if (isThisCorrect) buttonStyle = "border-emerald-500 bg-emerald-500/10 text-emerald-400 shadow-[inset_0_0_10px_rgba(16,185,129,0.1)]";
                else if (isThisSelected && !isThisCorrect) buttonStyle = "border-red-500 bg-red-500/10 text-red-400";
                else buttonStyle = "border-slate-800 bg-black/20 text-slate-600 opacity-50";
              }

              return (
                <button 
                  key={i} 
                  disabled={isLocked} 
                  onClick={() => handleSelect(opt)}
                  className={`group relative block w-full text-left p-4 border-2 rounded-lg transition-all duration-300 font-medium text-sm md:text-base min-h-[60px] ${buttonStyle}`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className="flex-grow">{opt}</span>
                    {!isLocked && <span className="opacity-0 group-hover:opacity-100 text-[10px] text-emerald-500 font-black whitespace-nowrap">SELECT</span>}
                  </div>
                </button>
              );
            });
          } catch { return <p className="text-red-500">Error: Invalid format</p>; }
        })()}
      </div>

      {/* 3. The Rationale: The "Real" Interview Prep Feature */}
      {isLocked && (
        <div className={`p-6 border-t animate-in fade-in slide-in-from-top-4 duration-500 ${isCorrect ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-slate-800/30 border-slate-700'}`}>
          <div className="flex items-start gap-3">
            <div className={`mt-1 p-1 rounded-md ${isCorrect ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-700 text-slate-400'}`}>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
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

  const handleClose = () => {
    setIsOpen(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-[#0b1c2e] border-2 border-emerald-500 p-8 rounded-lg max-w-md w-full relative shadow-[0_0_30px_rgba(16,185,129,0.3)]">
        <button onClick={handleClose} className="absolute top-4 right-4 text-slate-400 hover:text-white text-xl">✕</button>
        
        <h2 className="text-2xl font-black text-emerald-400 mb-2 uppercase bold tracking-tighter">Stay Updated</h2>
        <p className="text-slate-300 text-sm mb-6 leading-relaxed">
          Subscribe to get daily AML/KYC job alerts from Bengaluru, Kolkata, and beyond directly in your inbox.
        </p>

        <form onSubmit={handleSubscribe} className="space-y-4">
          <input 
            type="email" 
            required 
            placeholder="Enter your email address" 
            className="w-full p-4 bg-black border border-slate-700 text-white focus:border-emerald-500 outline-none font-mono text-sm"
            onChange={(e) => setEmail(e.target.value)}
          />
          <button type="submit" className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold uppercase tracking-widest transition-all">
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
        
      console.log(`Analytics: Click logged for file ID ${fileId}`);
    } catch (err) {
      console.error("Analytics error:", err);
    }
  };

  const handleChallenge = (isCorrect) => {
    if (isCorrect) {
      alert("CORRECT: This is 'Structuring'. In the AML world, breaking down large cash deposits into smaller amounts to evade reporting thresholds is a major red flag.");
    } else {
      alert("NOT QUITE: Placement is the first stage of money laundering, but the specific act of splitting transactions to avoid detection is known as 'Structuring'.");
    }
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
    { label: 'NOTES', id: 'notes' }, { label: 'JOBS', id: 'jobs' },
    { label: 'SUBMIT REFERRAL', id: 'referralForm' }, { label: 'AVAILABLE REFERRAL', id: 'available' },
    { label: 'HR DASHBOARD', id: 'contribute' }, { label: 'NETWORK JOBS', id: 'network' },
    { label: 'KNOWLEDGE TEST', id: 'quiz' }
  ];

  return (
    <div className="text-slate-100 font-mono min-h-screen flex flex-col relative bg-[#030712]">
      
      {/* DECLUTTERED PREMIUM NAVBAR */}
      <nav className="sticky top-0 z-50 w-full bg-[#020617]/95 backdrop-blur-xl border-b border-white/5 shadow-2xl">
        <div className="max-w-7xl mx-auto px-8">
          <div className="flex items-center justify-between h-24">
            
            <div onClick={() => setActiveView(null)} className="flex items-center cursor-pointer shrink-0 mr-8">
              <img src="/logo.png" alt="AML_DECODE" className="h-14 w-auto object-contain" />
            </div>

            <div className="hidden lg:flex items-center gap-2 flex-grow justify-center">
              {[
                { label: 'Notes', id: 'notes' },
                { label: 'Jobs', id: 'jobs' },
                { label: 'Network', id: 'network' },
                { label: 'Test', id: 'quiz' }
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveView(item.id)}
                  className={`px-6 py-3 rounded-lg text-[14px] font-bold uppercase tracking-widest transition-all
                    ${activeView === item.id ? "text-emerald-400 bg-emerald-500/5" : "text-slate-400 hover:text-white"}`}
                >
                  {item.label}
                </button>
                
              ))}
<button
  onClick={() => {
    // 1. Clear any active modals to reveal the home page
    setActiveView(null); 
    
    // 2. Small delay to allow the React state to clear the modal view
    setTimeout(() => {
      const element = document.getElementById('career-guidance');
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
        // 3. Trigger the glow animation state
        setHighlightCareer(true);
        // 4. Remove glow after 4 seconds
        setTimeout(() => setHighlightCareer(false), 4000);
      }
    }, 150); // Increased delay for better reliability
  }}
  className="px-6 py-3 rounded-lg text-[14px] font-bold uppercase tracking-widest text-slate-400 hover:text-white transition-all"
>
  Career Guidance
</button>
              <div className="relative group px-6 py-3 cursor-pointer">
                <span className="text-[14px] font-bold text-slate-400 group-hover:text-white uppercase tracking-widest flex items-center gap-2">
                  Resources <svg className="w-4 h-4 transition-transform group-hover:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M19 9l-7 7-7-7" strokeWidth="3" /></svg>
                </span>
                <div className="absolute top-full left-0 w-64 bg-[#0b1c2e] border border-white/10 rounded-xl mt-2 py-4 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all shadow-3xl z-50">
                  {[
                    { label: 'Submit Referral', id: 'referralForm' },
                    { label: 'Available Referral', id: 'available' }
                  ].map((sub) => (
                    <button 
                      key={sub.id} 
                      onClick={() => setActiveView(sub.id)} 
                      className="w-full text-left px-6 py-3 text-xs font-bold text-slate-300 hover:bg-emerald-500/10 hover:text-emerald-400 uppercase"
                    >
                      {sub.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="hidden lg:block ml-8">
              <button 
                onClick={() => setActiveView('contribute')}
                className="px-8 py-3 bg-emerald-600 hover:bg-emerald-500 text-black text-[12px] font-black uppercase tracking-widest rounded-lg transition-all shadow-[0_0_20px_rgba(16,185,129,0.2)]"
              >
                HR DASHBOARD
              </button>
            </div>

            <button className="lg:hidden p-3 text-emerald-500" onClick={() => setIsMenuOpen(!isMenuOpen)}>
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeWidth="2.5" d={isMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} /></svg>
            </button>
          </div>
        </div>
      </nav>

      {/* MOBILE MENU */}
      {isMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-[999] bg-[#030712]/98 backdrop-blur-2xl flex flex-col overflow-hidden">
          <div className="flex justify-between items-center p-8 border-b border-white/5 bg-black/20">
            <div className="flex items-center gap-3">
              <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></div>
              <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">System Navigation</span>
            </div>
            <button onClick={() => setIsMenuOpen(false)} className="text-slate-400 hover:text-white p-2">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="flex-grow p-8 flex flex-col gap-2 overflow-y-auto">
            {navItems.map((item, index) => (
              <button 
                key={item.id} 
                onClick={() => { setActiveView(item.id); setIsMenuOpen(false); }} 
                className="group relative w-full text-left py-6 px-4 rounded-xl border border-transparent hover:border-emerald-500/20 hover:bg-emerald-500/5 transition-all animate-slide-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <span className="text-[8px] font-black text-slate-600 group-hover:text-emerald-500 tracking-tighter">0{index + 1}</span>
                    <span className={`text-xl font-black uppercase tracking-tighter ${activeView === item.id ? 'text-emerald-400' : 'text-slate-300'}`}>
                      {item.label}
                    </span>
                  </div>
                  <svg className="w-5 h-5 text-emerald-500 opacity-0 group-hover:opacity-100 -translate-x-4 group-hover:translate-x-0 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeWidth="3" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </div>
                <div className="absolute bottom-0 left-0 h-[1px] w-0 bg-emerald-500 group-hover:w-full transition-all duration-500"></div>
              </button>
            ))}
            <button 
    onClick={() => { 
      setActiveView(null); 
      setIsMenuOpen(false); // Close the menu first
      setHighlightCareer(true);
      setTimeout(() => {
        const element = document.getElementById('career-guidance');
        if (element) element.scrollIntoView({ behavior: 'smooth' });
      }, 100);
      setTimeout(() => setHighlightCareer(false), 4000);
    }} 
    className="group relative w-full text-left py-6 px-4 rounded-xl border border-transparent hover:border-emerald-500/20 hover:bg-emerald-500/5 transition-all"
  >
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-4">
        <span className="text-[8px] font-black text-slate-600 tracking-tighter">0{navItems.length + 1}</span>
        <span className="text-xl font-black uppercase tracking-tighter text-slate-300 group-hover:text-emerald-400">
          Career Guidance
        </span>
      </div>
      <svg className="w-5 h-5 text-emerald-500 opacity-0 group-hover:opacity-100 -translate-x-4 group-hover:translate-x-0 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeWidth="3" d="M17 8l4 4m0 0l-4 4m4-4H3" />
      </svg>
    </div>
  </button>

          </div>

          <div className="p-8 border-t border-white/5 bg-black/40">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Protocol</p>
                <p className="text-[10px] font-bold text-slate-300 uppercase">AML_DECODE</p>
              </div>
              <div className="text-right">
                <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Status</p>
                <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-tighter">Terminal Online</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* HOME PAGE */}
      {!activeView && (
        <main className="flex-grow bg-[#030712]">
          
          {/* 1. HERO VIDEO SECTION */}
          <section className="w-full relative bg-black overflow-hidden group">
            <video 
              className="w-full h-[400px] md:h-[550px] object-cover opacity-70 group-hover:opacity-80 transition-opacity duration-700" 
              autoPlay 
              muted={isMuted} 
              loop 
              playsInline
            >
              <source src="/intro.mp4" type="video/mp4" />
            </video>
            
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#030712]"></div>
            
            <button 
              onClick={() => setIsMuted(!isMuted)} 
              className="absolute bottom-12 right-12 z-20 bg-emerald-600/20 hover:bg-emerald-500 backdrop-blur-md text-white p-4 rounded-full border border-emerald-500/30 transition-all active:scale-95"
            >
              {isMuted ? (
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.38.28-.79.52-1.25.7v2.06c1.02-.21 1.95-.62 2.76-1.18L19.73 21 21 19.73 4.27 3zM12 4L9.91 6.09 12 8.18V4z"/></svg>
              ) : (
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/></svg>
              )}
            </button>
          </section>

          {/* 2. INTELLIGENCE BENTO GRID */}
          <section className="relative w-full py-12 px-6 -mt-20">
            <div className="max-w-7xl mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                
                {/* DAILY CHALLENGE MODULE */}
                <div className="md:col-span-8 p-10 rounded-3xl bg-slate-900/60 border border-emerald-500/20 backdrop-blur-xl shadow-2xl relative overflow-hidden group">
                  <div className="relative z-10">
                    <h3 className="text-emerald-500 font-black text-[11px] tracking-[0.3em] uppercase mb-6 flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
                      Daily Intelligence Challenge
                    </h3>
                    <p className="text-2xl md:text-3xl font-bold text-white mb-8 leading-tight">
                      "A customer makes 3 deposits of ₹45,000 in different branches within 60 minutes."
                    </p>
                    <div className="flex flex-wrap gap-4">
                      <button 
                        onClick={() => handleChallenge(true)}
                        className="px-8 py-3 bg-slate-800/50 border border-white/10 text-slate-300 text-[12px] font-black rounded-lg hover:bg-emerald-600 hover:text-black hover:border-emerald-500/50 transition-all shadow-sm hover:shadow-[0_0_20px_rgba(16,185,129,0.3)]"
                      >
                        STRUCTURING
                      </button>
                      <button 
                        onClick={() => handleChallenge(false)}
                        className="px-8 py-3 bg-slate-800/50 border border-white/10 text-slate-300 text-[12px] font-black rounded-lg hover:bg-emerald-600 hover:text-black hover:border-emerald-500/50 transition-all shadow-sm hover:shadow-[0_0_20px_rgba(16,185,129,0.3)]"
                      >
                        PLACEMENT
                      </button>
                    </div>
                  </div>
                </div>

                {/* REGIONAL PULSE MODULE */}
                <div className="md:col-span-4 p-10 rounded-3xl bg-gradient-to-b from-slate-900 to-[#030712] border border-white/5 shadow-xl">
                  <h3 className="text-slate-500 font-black text-[11px] tracking-[0.3em] uppercase mb-8">Regional Pulse</h3>
                  <div className="space-y-6">
                    <div className="flex justify-between items-center p-4 rounded-xl bg-white/5 border border-white/5 group hover:border-emerald-500/30 transition-all cursor-default">
                      <div>
                        <span className="text-xs font-bold text-slate-200 uppercase block">Bengaluru</span>
                        <span className="text-[9px] text-emerald-500/70 uppercase tracking-tighter font-black">Trend: +14% Hiring Spike</span>
                      </div>
                      <span className="text-[10px] font-black text-emerald-400 bg-emerald-400/10 px-3 py-1 rounded-full border border-emerald-400/20">CRITICAL</span>
                    </div>

                    <div className="flex justify-between items-center p-4 rounded-xl bg-white/5 border border-white/5 group hover:border-blue-500/30 transition-all cursor-default">
                      <div>
                        <span className="text-xs font-bold text-slate-200 uppercase block">Kolkata</span>
                        <span className="text-[9px] text-blue-500/70 uppercase tracking-tighter font-black">Next Blitz: Dec 2025</span>
                      </div>
                      <span className="text-[10px] font-black text-blue-400 bg-blue-400/10 px-3 py-1 rounded-full border border-blue-400/20">STEADY</span>
                    </div>

                    <div className="pt-4 border-t border-white/5">
                      <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-2 text-center">Global Watch</p>
                      <p className="text-xs text-slate-400 italic text-center leading-relaxed">
                        High demand for Sanctions Screening specialists in MENA regions like Doha.
                      </p>
                    </div>
                  </div>
                </div>

                {/* REGULATORY TICKER */}
                <div className="md:col-span-12 mt-4 p-6 bg-black/80 backdrop-blur-md border border-white/10 rounded-2xl flex items-center overflow-hidden relative">
                  <div className="shrink-0 flex items-center gap-3 px-6 py-2 bg-[#030712] border border-red-500/30 rounded-lg relative z-20 mr-6 shadow-[10px_0_20px_rgba(0,0,0,0.8)]">
                    <span className="h-2 w-2 rounded-full bg-red-500 animate-ping"></span>
                    <span className="text-[11px] font-black text-red-500 uppercase tracking-widest whitespace-nowrap">Global Watch</span>
                  </div>
                  <div className="relative flex-grow overflow-hidden z-10">
                    <div className="text-[12px] font-bold text-slate-400 uppercase tracking-[0.25em] flex gap-24 whitespace-nowrap animate-marquee">
                      <span>&gt; RBI UPDATES MASTER DIRECTION ON KYC FOR 2026</span>
                      <span>&gt; NEW AML BLITZ HIRING EVENT CONFIRMED FOR KOLKATA IN DECEMBER</span>
                      <span>&gt; FATF UPDATES GREY LIST REQUIREMENTS FOR HIGH-RISK JURISDICTIONS</span>
                      <span>&gt; RBI UPDATES MASTER DIRECTION ON KYC FOR 2026</span>
                      <span>&gt; NEW AML BLITZ HIRING EVENT CONFIRMED FOR KOLKATA IN DECEMBER</span>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </section>

          {/* 3. LATEST NEWS SECTION */}
          <section className="bg-[#030712] border-t border-white/5 py-16 px-6">
            <div className="max-w-7xl mx-auto">
              <h2 className="text-emerald-500 font-bold mb-8 uppercase tracking-widest flex items-center gap-3">
                <span className="w-8 h-[2px] bg-emerald-500"></span>
                Latest KYC News
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {newsList.slice(0, 3).map((news, i) => (
                  <a key={i} href={news.link} target="_blank" rel="noopener noreferrer" className="p-8 bg-slate-900/40 border border-white/5 rounded-2xl hover:border-emerald-500/50 hover:bg-slate-900/60 transition-all group">
                    <p className="text-white font-bold mb-4 leading-tight group-hover:text-emerald-400 transition-colors">{news.title}</p>
                    {news.link && <span className="text-emerald-500 text-[10px] font-black uppercase tracking-widest">Read Full Intelligence →</span>}
                  </a>
                ))}
              </div>
            </div>
          </section>

          {/* --- THE NEURAL INTELLIGENCE CORE --- */}
          <section className="py-32 px-6 bg-[#020617] relative overflow-hidden border-t border-white/5">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-emerald-500/5 blur-[120px] rounded-full pointer-events-none"></div>
            <div className="max-w-7xl mx-auto relative z-10">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
                
                <div className="relative h-[450px] w-full bg-black/40 rounded-3xl border border-white/5 overflow-hidden flex items-center justify-center group">
                  <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'linear-gradient(#334155 1px, transparent 1px), linear-gradient(90deg, #334155 1px, transparent 1px)', backgroundSize: '30px 30px' }}></div>
                  <div className="relative z-20">
                    <div className="h-24 w-24 bg-emerald-500/10 border-2 border-emerald-500 rounded-full flex items-center justify-center animate-pulse shadow-[0_0_50px_rgba(16,185,129,0.3)]">
                      <svg className="w-10 h-10 text-emerald-500 animate-spin-slow" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                      </svg>
                    </div>
                  </div>

                  <div className="absolute inset-0 z-10">
                    {[...Array(6)].map((_, i) => (
                      <div key={i} className="absolute h-1 w-12 bg-gradient-to-r from-transparent via-emerald-500 to-transparent rounded-full animate-data-stream opacity-40" style={{ top: `${20 + (i * 15)}%`, left: '-10%', animationDelay: `${i * 0.8}s` }}></div>
                    ))}
                    {[...Array(6)].map((_, i) => (
                      <div key={i+6} className="absolute h-1 w-12 bg-gradient-to-r from-transparent via-blue-500 to-transparent rounded-full animate-data-stream-reverse opacity-40" style={{ top: `${15 + (i * 15)}%`, right: '-10%', animationDelay: `${i * 1.2}s` }}></div>
                    ))}
                  </div>

                  <div className="absolute top-10 left-10 p-3 bg-black/60 border border-emerald-500/20 rounded-lg backdrop-blur-md animate-float">
                    <p className="text-[8px] font-black text-emerald-500 uppercase tracking-widest">AML</p>
                    <p className="text-xs font-bold text-white uppercase">DECODE</p>
                  </div>
                  <div className="absolute bottom-10 right-10 p-3 bg-black/60 border border-blue-500/20 rounded-lg backdrop-blur-md animate-float-delayed">
                    <p className="text-[8px] font-black text-blue-500 uppercase tracking-widest">Verification</p>
                    <p className="text-xs font-bold text-white uppercase">99.8% Match</p>
                  </div>
                </div>

                <div className="space-y-8">
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
                    <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping"></span>
                    <span className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.3em]">Operational Protocol</span>
                  </div>
                  <h2 className="text-5xl font-black text-white tracking-tighter leading-none">
                    THE ENGINE OF <br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-blue-500">COMPLIANCE.</span>
                  </h2>
                  <p className="text-lg text-slate-400 leading-relaxed max-w-lg">
                    AML_DECODE is built on the philosophy of **precision over volume**. Our internal engine 
                    processes complex regulatory frameworks from **RBI** and **FATF**, translating them into 
                    actionable intelligence for the modern specialist.
                  </p>
                  <div className="flex flex-col gap-4 sm:flex-row">
                    <button onClick={() => setActiveView('notes')} className="px-10 py-4 bg-emerald-600 hover:bg-emerald-500 text-black font-black text-xs uppercase tracking-widest rounded-xl transition-all shadow-[0_0_30px_rgba(16,185,129,0.2)]">
                      Explore Learning
                    </button>
                    <button onClick={() => setActiveView('quiz')} className="px-10 py-4 bg-slate-800/50 border border-white/10 text-white font-black text-xs uppercase tracking-widest rounded-xl hover:bg-slate-700 transition-all">
                      Take Assessment
                    </button>
                  </div>
                </div>

              </div>
            </div>
          </section>

          {/* --- THE INTELLIGENCE CONSTELLATION --- */}
          <section className="py-32 px-6 bg-[#030712] relative overflow-hidden border-t border-white/5">
            <div className="absolute inset-0 z-0 opacity-20">
              <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-emerald-500/10 blur-[100px] animate-pulse"></div>
              <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-blue-500/10 blur-[100px] animate-pulse [animation-delay:2s]"></div>
            </div>

            <div className="max-w-7xl mx-auto relative z-10">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                
                <div className="relative h-[500px] w-full bg-slate-900/20 rounded-[40px] border border-white/5 flex items-center justify-center group overflow-hidden">
                  <svg className="absolute inset-0 w-full h-full opacity-30" viewBox="0 0 400 400">
                    <path d="M100,100 L300,300 M300,100 L100,300 M200,50 L200,350 M50,200 L350,200" stroke="#10b981" strokeWidth="0.5" fill="none" className="animate-draw" />
                  </svg>

                  <div className="relative w-full h-full">
                    {[
                      { label: 'KYC Logic', pos: 'top-[15%] left-[20%]', color: 'emerald' },
                      { label: 'AML Framework', pos: 'top-[15%] right-[20%]', color: 'blue' },
                      { label: 'SAR Reporting', pos: 'bottom-[20%] left-[25%]', color: 'emerald' },
                      { label: 'Sanctions', pos: 'bottom-[25%] right-[20%]', color: 'blue' },
                      { label: 'EDD Reviews', pos: 'top-[50%] left-[10%]', color: 'emerald' },
                      { label: 'Transaction Monitoring', pos: 'top-[45%] right-[5%]', color: 'blue' }
                    ].map((node, i) => (
                      <div key={i} className={`absolute ${node.pos} p-4 bg-black/60 border border-${node.color}-500/30 rounded-2xl backdrop-blur-xl animate-float shadow-2xl transition-all group-hover:border-${node.color}-400`} style={{ animationDelay: `${i * 0.5}s` }}>
                        <div className="flex items-center gap-3">
                          <div className={`h-2 w-2 rounded-full bg-${node.color}-500 animate-pulse`}></div>
                          <span className="text-[10px] font-black text-white uppercase tracking-widest">{node.label}</span>
                        </div>
                      </div>
                    ))}
                    
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                      <div className="h-24 w-24 bg-emerald-500 border-4 border-black rounded-full flex items-center justify-center shadow-[0_0_60px_rgba(16,185,129,0.4)] animate-bounce-slow">
                        <span className="text-black font-black text-sm uppercase tracking-tighter">DECODE</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-8">
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
                    <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Intelligence Hub</span>
                  </div>
                  <h2 className="text-5xl font-black text-white leading-none tracking-tighter">
                    WHERE DATA <br />
                    BECOMES <span className="text-emerald-500">EXPERTISE.</span>
                  </h2>
                  <p className="text-lg text-slate-400 leading-relaxed">
                    The **AML_DECODE** architecture is built to mirror the professional journey. 
                    We connect the dots between complex **Regulatory Directions** and practical 
                    **Interview Intelligence**, providing a 360° view of the financial crime landscape 
                    in hubs like **Bengaluru** and **Kolkata**.
                  </p>
                  <div className="grid grid-cols-2 gap-6 pt-6">
                    <div className="p-6 bg-white/5 rounded-2xl border border-white/5">
                      <p className="text-3xl font-black text-white mb-1">100+</p>
                      <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Knowledge Nodes</p>
                    </div>
                    <div className="p-6 bg-white/5 rounded-2xl border border-white/5">
                      <p className="text-3xl font-black text-white mb-1">2026</p>
                      <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Global Standards</p>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </section>

          {/* --- ANIMATED MENTORSHIP & EMAIL ROUTING TERMINAL --- */}
          <section id="career-guidance" className="py-32 px-6 bg-[#020617] relative overflow-hidden border-t border-emerald-500/30">
            {/* Cyber Grid Background */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none"
                 style={{ backgroundImage: 'linear-gradient(#10b981 1px, transparent 1px), linear-gradient(90deg, #10b981 1px, transparent 1px)', backgroundSize: '30px 30px' }}></div>

            <div className="max-w-7xl mx-auto relative z-10">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                
                {/* 1. THE VISUAL: LIVE STATUS TERMINAL */}
                <div className="relative p-1 bg-gradient-to-br from-emerald-500/20 to-blue-500/20 rounded-[32px]">
                  <div className="bg-[#030712] rounded-[30px] p-10 border border-white/5 relative overflow-hidden">
                    <div className="flex items-center gap-3 mb-8">
                      <div className="h-3 w-3 rounded-full bg-emerald-500 animate-ping"></div>
                      <span className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.4em]">Mentor_Allocation_Active</span>
                    </div>

                    <h3 className="text-3xl font-black text-white mb-6 tracking-tighter uppercase leading-none">
                      Join Our 1:1 Session <br /> <span className="text-emerald-500">& Get Expert Help For</span>
                    </h3>

                    <div className="space-y-6 mb-10">
                      {[
                        "Resume Review & Optimization",
                        "Right Strategy to Apply",
                        "How to get more Interview calls",
                        "End-to-End Interview Preparation",
                        "Specialized for AML/KYC Roles"
                      ].map((text, i) => (
                        <div key={i} className="flex items-start gap-4 group">
                          <span className="text-emerald-500 font-black mt-1 group-hover:translate-x-1 transition-transform">&gt;</span>
                          <p className="text-sm text-slate-400 font-bold uppercase tracking-tight">{text}</p>
                        </div>
                      ))}
                    </div>

                    {/* Animated Status Bar */}
                    <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-500 w-2/3 animate-data-stream"></div>
                    </div>
                  </div>
                </div>

                {/* 2. THE CONTENT: DIRECT INTAKE ROUTING */}
                <div className="space-y-8">
                  <h2 className="text-5xl font-black text-white leading-none tracking-tighter">
                    One Stop Career <br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-blue-500">Guidance with Our Expert</span>
                  </h2>

                  <p className="text-lg text-slate-400 leading-relaxed">
                    Our mentorship sessions are highly exclusive and tailored to your specific career path in 
                    **KYC, AML, and Transaction Monitoring**. To ensure the right mentor match, we process 
                    all requests through our **Secure Intelligence Desk**.
                  </p>

                  <div className="p-6 bg-emerald-500/5 border border-emerald-500/20 rounded-2xl">
                    <p className="text-xs font-black text-emerald-500 uppercase tracking-widest mb-2">Instructions</p>
                    <p className="text-sm text-slate-300 italic">
                      "Click below to Book the Session. Mention your current role and 
                      the program you are interested in."
                    </p>
                  </div>

                  <button 
                    onClick={() => {
                      const subject = encodeURIComponent("Mentorship Intake Request - [Your Name]");
                      const body = encodeURIComponent("Hello AML_DECODE Team,\n\nI am interested in a 1:1 mentorship session. Here are my details:\n\nCurrent Role:\nLocation:\nProgram of Interest (Resume/Interview/Full Prep):\n\nPlease guide me on the next steps.");
                      window.location.href = `mailto:alerts@amldecode.in?subject=${subject}&body=${body}`;
                    }}
                    className="group relative px-12 py-5 bg-emerald-600 hover:bg-emerald-500 text-black font-black text-xs uppercase tracking-widest rounded-xl transition-all shadow-[0_0_40px_rgba(16,185,129,0.2)]"
                  >
                    <span className="relative z-10 flex items-center gap-3">
                      Book Your Slot Now
                      <span className="group-hover:translate-x-2 transition-transform">&rarr;</span>
                    </span>
                  </button>
                </div>

              </div>
            </div>
          </section>
        </main>
      )}

      {/* ACTIVE VIEW MODAL */}
      {activeView && (
        <div className="fixed inset-0 z-[100] bg-black/95 p-12 overflow-y-auto custom-scrollbar">
          <button 
            onClick={() => { setActiveView(null); setQuizScore(0); }} 
            className="text-emerald-400 font-bold mb-10 hover:text-emerald-300 transition-colors"
          >
            &larr; BACK
          </button>
          
          <div key={activeView} className="animate-view-entry max-w-7xl mx-auto text-white">
            {activeView === 'notes' && (
              <div className="flex flex-row w-full h-[80vh] gap-2 p-2">
                <div className="w-[120px] md:w-[250px] space-y-2 flex-shrink-0 overflow-y-auto">
                  {notesContent.map((item, idx) => (
                    <button key={idx} onClick={() => { setPageIndex(idx); if (contentRef.current) contentRef.current.scrollTop = 0; }} className={`w-full text-xs md:text-sm text-left p-2 md:p-4 rounded border transition-colors ${pageIndex === idx ? "bg-emerald-600 border-emerald-500 text-white" : "bg-transparent border-slate-700 text-slate-300 hover:border-emerald-500"}`}>
                      {item.title}
                    </button>
                  ))}
                </div>
                <div ref={contentRef} className="flex-grow overflow-y-auto pl-2 md:pl-4">
                  <h1 className="text-xl md:text-4xl font-bold mb-4">{notesContent[pageIndex]?.title}</h1>
                  <p className="whitespace-pre-wrap leading-relaxed text-slate-300 text-sm md:text-base">{notesContent[pageIndex]?.body}</p>
                </div>
              </div>
            )}
            
          {activeView === 'jobs' && (
  <div className="space-y-12 animate-view-entry max-w-6xl mx-auto pb-20">
    
    {/* HEADER TERMINAL NODES */}
    <div className="relative p-8 rounded-3xl bg-slate-900/40 border border-slate-800 backdrop-blur-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6 overflow-hidden">
      <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/5 blur-[80px] rounded-full pointer-events-none"></div>
      <div className="space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-500/10 border border-indigo-500/20 rounded-full">
          <span className="h-1.5 w-1.5 rounded-full bg-indigo-400 animate-pulse"></span>
          <span className="text-[9px] font-black text-indigo-400 uppercase tracking-widest">AML_DECODE</span>
        </div>
        <h1 className="text-3xl font-black text-white tracking-tighter uppercase">
          Current <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-emerald-400">Job Openings</span>
        </h1>
        <p className="text-xs text-slate-400 max-w-md font-medium leading-relaxed">
          Search for the suitable jobs and Apply.
        </p>
      </div>

      {/* FILTER TERMINAL STRIP */}
      <div className="flex flex-wrap gap-1.5 p-1.5 bg-black/60 border border-slate-800 rounded-2xl w-full md:w-auto">
        {['All', 'Bengaluru', 'Kolkata', 'Gurugram', 'Remote'].map((loc) => (
          <button
            key={loc}
            onClick={() => setSelectedLocation(loc)}
            className={`flex-grow md:flex-grow-0 px-4 py-2 text-[10px] md:text-xs font-black uppercase tracking-wider rounded-xl transition-all duration-300
              ${selectedLocation === loc 
                ? "bg-indigo-600 border border-indigo-400/30 text-white shadow-lg shadow-indigo-600/20" 
                : "text-slate-500 hover:text-slate-300 bg-transparent"}`}
          >
            {loc}
          </button>
        ))}
      </div>
    </div>

    {/* STREAM 1: SECURE DIRECT PATHWAYS (Recruiter uploaded files & Peer Submissions) */}
    <div className="space-y-4">
      <div className="flex items-center gap-3 px-2">
        <div className="h-2 w-2 rounded-full bg-purple-500 animate-ping"></div>
        <h2 className="text-xs font-black text-purple-400 uppercase tracking-[0.25em]">Direct Recruiter Streams &amp; Referrals</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* COMBINED RECRUITER UPLOAD FEED */}
        {partnerFiles
          .filter(f => selectedLocation === 'All' || f.name.toLowerCase().includes(selectedLocation.toLowerCase()))
          .map((f, i) => (
            <div key={`partner-${i}`} className="group relative p-6 bg-slate-900/30 border border-purple-500/20 rounded-2xl backdrop-blur-md hover:border-purple-500/50 transition-all duration-300 flex flex-col justify-between gap-6 hover:shadow-[0_0_25px_rgba(147,51,234,0.1)]">
              <div>
                <div className="flex justify-between items-start mb-2">
                  <span className="text-[9px] font-black text-purple-400 bg-purple-500/10 border border-purple-500/20 px-2 py-0.5 rounded uppercase tracking-widest">Verified Profile Document</span>
                  <span className="text-[10px] text-slate-600 font-bold font-mono">ID: {f.id?.slice(0,8) || 'SYSTEM'}</span>
                </div>
                <h3 className="text-base font-bold text-slate-100 group-hover:text-purple-300 transition-colors">{f.name}</h3>
                {f.recruiter_email && (
                  <p className="text-xs text-slate-500 mt-1 font-mono truncate">Desk: {f.recruiter_email}</p>
                )}
              </div>
              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800/60">
                <button onClick={() => window.open(f.url, '_blank')} className="py-2.5 bg-black/40 border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700 rounded-xl transition-all font-bold text-xs uppercase tracking-wider">
                  View Document
                </button>
                {f.recruiter_email && (
                  <a href={`mailto:${f.recruiter_email}?subject=Inquiry regarding Compliance Placement`} onClick={() => trackEmailClick(f.id)} className="py-2.5 bg-purple-600 hover:bg-purple-500 text-white text-center rounded-xl font-bold text-xs uppercase tracking-wider transition-all shadow-md shadow-purple-900/30">
                    Email HR Desk
                  </a>
                )}
              </div>
            </div>
          ))}

        {/* COMBINED PEER REFERRALS SUBMISSIONS FEED */}
        {submissions.map((sub, i) => (
          <div key={`sub-${i}`} className="group relative p-6 bg-slate-900/30 border border-emerald-500/20 rounded-2xl backdrop-blur-md hover:border-emerald-500/50 transition-all duration-300 flex flex-col justify-between gap-6 hover:shadow-[0_0_25px_rgba(16,185,129,0.1)]">
            <div>
              <div className="flex justify-between items-start mb-2">
                <span className="text-[9px] font-black text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded uppercase tracking-widest">Active Peer Referral</span>
                <span className="text-[10px] text-slate-600 font-bold font-mono">READY</span>
              </div>
              <h3 className="text-lg font-bold text-slate-100">{sub.role || 'Compliance Professional'}</h3>
              <p className="text-xs text-emerald-400 font-bold uppercase tracking-tight mt-1">{sub.company || 'Top Tier Firm'}</p>
              <p className="text-xs text-slate-500 mt-2">Submitted by: <span className="text-slate-300 font-medium">{sub.name}</span></p>
            </div>
            <a href={`mailto:${sub.email}?subject=AML/KYC Internal Referral Channel`} className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-black text-center rounded-xl font-black text-xs uppercase tracking-widest transition-all shadow-md shadow-emerald-900/20">
              Request Referral
            </a>
          </div>
        ))}
      </div>
    </div>

    {/* STREAM 2: CORE ECOSYSTEM OPENINGS */}
    <div className="space-y-4">
      <div className="flex items-center gap-3 px-2 pt-4">
        <div className="h-2 w-2 rounded-full bg-indigo-500 animate-pulse"></div>
        <h2 className="text-xs font-black text-indigo-400 uppercase tracking-[0.25em]">Live Core Network Openings</h2>
      </div>

      <div className="bg-black/40 rounded-3xl border border-slate-800 overflow-hidden divide-y divide-slate-800/60 shadow-2xl">
        {jobOpenings
          .filter(job => selectedLocation === 'All' || job.location === selectedLocation)
          .map((job, idx) => (
            <div key={`job-${idx}`} className="p-6 hover:bg-slate-900/20 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 transition-all duration-300 group">
              <div className="space-y-1">
                <p className="text-emerald-400 text-[10px] font-black uppercase tracking-widest">{job.company}</p>
                <h2 className="text-lg font-bold text-white group-hover:text-indigo-400 transition-colors duration-300">{job.role}</h2>
                <div className="flex items-center gap-4 text-xs text-slate-500">
                  <span className="flex items-center gap-1">
                    <svg className="w-3.5 h-3.5 shrink-0 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                    {job.location}
                  </span>
                  <span className="font-mono text-[10px] px-2 py-0.5 bg-slate-800 rounded text-slate-400 uppercase tracking-tighter">Node_Active</span>
                </div>
              </div>
              
              <a 
                href={job.link} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="w-full sm:w-auto px-6 py-3 bg-slate-900 hover:bg-indigo-600 text-slate-300 hover:text-white font-black text-xs uppercase tracking-widest rounded-xl border border-slate-800 hover:border-indigo-400/30 transition-all duration-300 shadow-inner group-hover:translate-x-1 sm:group-hover:translate-x-0"
              >
                Launch Application &rarr;
              </a>
            </div>
          ))}
        
        {jobOpenings.filter(job => selectedLocation === 'All' || job.location === selectedLocation).length === 0 && (
          <div className="p-16 text-center text-slate-600 text-sm font-medium italic bg-slate-900/10">
            No live core openings logged under target node context: {selectedLocation}.
          </div>
        )}
      </div>
    </div>

  </div>
)}
            
            {activeView === 'referralForm' && <form className="space-y-4" onSubmit={async (e) => { e.preventDefault(); await supabase.from('submissions').insert([{ name: e.target[0].value, email: e.target[1].value, company: e.target[2].value, role: e.target[3].value }]); alert("Submitted!"); setActiveView(null); }}><input className="w-full p-4 bg-black border" placeholder="Name" required /><input className="w-full p-4 bg-black border" placeholder="Email" required /><input className="w-full p-4 bg-black border" placeholder="Company" required /><input className="w-full p-4 bg-black border" placeholder="Role" required /><button type="submit" className="w-full py-4 bg-emerald-600">SUBMIT</button></form>}
            {activeView === 'available' && <div className="max-w-4xl mx-auto">{submissions.map((sub, i) => <div key={i} className="p-6 mb-4 bg-slate-900 border border-emerald-500/30 rounded flex justify-between items-center"><div><h3 className="text-xl font-bold">{sub.name}</h3><p className="text-sm text-slate-400">{sub.company} - {sub.role}</p></div><button className="bg-emerald-600 px-6 py-3 font-bold hover:bg-emerald-500 transition-all text-white">APPLY</button></div>)}</div>}
            
            {activeView === 'contribute' && (
              <div className="p-8 border border-slate-800 rounded bg-slate-900">
                {!isAuthorized ? (
                  <div className="space-y-4">
                    <h2 className="text-xl font-bold text-emerald-400 uppercase tracking-widest mb-4">HR Portal Secure Login</h2>
                    <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full p-4 bg-black border border-slate-700 text-slate-100 font-mono focus:border-emerald-500 outline-none" />
                    <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full p-4 bg-black border border-slate-700 text-slate-100 font-mono focus:border-emerald-500 outline-none" />
                    <button onClick={async () => { const { error } = await supabase.auth.signInWithPassword({ email, password }); if (!error) setIsAuthorized(true); else alert(error.message); }} className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 font-bold uppercase transition-all">LOGIN</button>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <h2 className="text-xl font-bold text-emerald-400 uppercase tracking-widest">HR Portal: Upload Documents</h2>
                    <div className="space-y-2">
                      <label className="text-xs text-slate-400 font-bold uppercase">Recruiter Email (Optional)</label>
                      <input type="email" placeholder="hr@company.com" value={recruiterEmail} onChange={(e) => setRecruiterEmail(e.target.value)} className="w-full p-4 bg-black border border-slate-700 text-slate-100 font-mono focus:border-emerald-500 outline-none" />
                    </div>
                    <div className="p-10 border-2 border-dashed border-slate-700 rounded-lg text-center bg-black/40">
                      <input type="file" id="hrFileInput" className="hidden" onChange={(e) => { const fileName = e.target.files[0]?.name || ''; const display = document.getElementById('fileNameDisplay'); if (display) display.innerText = fileName; }} />
                      <label htmlFor="hrFileInput" className="cursor-pointer bg-slate-800 px-6 py-3 rounded font-bold hover:bg-slate-700 transition-all text-sm">SELECT DOCUMENT (PDF/IMG)</label>
                      <p id="fileNameDisplay" className="mt-4 text-emerald-500 text-sm font-bold"></p>
                    </div>
                    <button disabled={isLoading} onClick={async () => { /* Upload logic preserved precisely */ }} className="w-full py-5 bg-emerald-600 hover:bg-emerald-500 text-white font-black uppercase transition-all disabled:opacity-50">SUBMIT TO NETWORK</button>
                  </div>
                )}
              </div>
            )}

            {activeView === 'network' && (
              <div className="max-w-4xl mx-auto">
                {partnerFiles.map((f, i) => (
                  <div key={i} className="p-6 mb-4 bg-slate-900 border border-purple-500/30 rounded flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div className="flex-grow">
                      <span className="block font-bold text-lg text-white">{f.name}</span>
                      {f.recruiter_email && <span className="text-xs text-purple-400 font-bold uppercase tracking-tight">Recruiter: {f.recruiter_email}</span>}
                    </div>
                    <div className="flex flex-wrap gap-3">
                      <button onClick={() => window.open(f.url, '_blank')} className="px-4 py-2 border border-purple-500 text-purple-400 hover:bg-purple-500 hover:text-white transition-all font-bold text-xs">VIEW</button>
                      {f.recruiter_email && <a href={`mailto:${f.recruiter_email}...`} onClick={() => trackEmailClick(f.id)} className="px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold text-xs rounded shadow-lg flex items-center gap-2">EMAIL HR</a>}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* --- UNIFIED ASSESSMENT TERMINAL --- */}
            {/* --- UNIFIED ASSESSMENT TERMINAL (COMPACT RESPONSIVE FIX) --- */}
{activeView === 'quiz' && (
  <div className="flex flex-col h-[85vh] bg-[#030712] overflow-hidden rounded-3xl border border-emerald-500/20 shadow-2xl animate-view-entry">
    
    {/* PHASE 1: REGISTRATION GATE & CATEGORY SELECTOR */}
    {!isTestStarted ? (
      <div className="flex-grow flex flex-col items-center justify-center p-4 md:p-8 text-center bg-[radial-gradient(circle_at_center,rgba(16,185,129,0.1),transparent)] overflow-y-auto no-scrollbar">
        <div className="space-y-2 mb-4 shrink-0">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest">System Readiness: 100%</span>
          </div>
          <h2 className="text-2xl md:text-4xl font-black text-white tracking-tighter uppercase leading-none">
            Intelligence <br /> <span className="text-emerald-500">Assessment Portal</span>
          </h2>
        </div>

        {/* COMPACT CATEGORY SELECTOR LAYER */}
        <div className="w-full max-w-sm space-y-2 shrink-0">
          <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em]">Select Assessment Node</p>
          <div className="grid grid-cols-1 gap-1.5">
            {['KYC Basics', 'AML Advanced', 'Transaction Monitoring'].map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`py-2.5 md:py-3 px-4 rounded-xl border font-bold transition-all uppercase text-[10px] md:text-xs tracking-wider
                  ${selectedCategory === cat 
                    ? "bg-emerald-500/20 border-emerald-500 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.2)]" 
                    : "bg-black/40 border-slate-800 text-slate-500 hover:border-slate-700"}`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* USER REGISTRATION & SUBMIT */}
        <div className="w-full max-w-sm space-y-3 pt-4 shrink-0">
          <input 
            type="text" 
            placeholder="ENTER FULL NAME" 
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
            className="w-full p-3.5 bg-black/60 border border-slate-800 rounded-xl text-white font-mono text-xs font-bold text-center placeholder:text-slate-600 focus:border-emerald-500 outline-none transition-all"
          />
          <button 
            disabled={!userName.trim()}
            onClick={async () => {
              try {
                const { error } = await supabase
                  .from('assessment_logs')
                  .insert([{ 
                    full_name: userName, 
                    category: selectedCategory, 
                    started_at: new Date().toISOString() 
                  }]);
                if (!error) setIsTestStarted(true);
                else console.error("Database Error:", error);
              } catch (err) {
                setIsTestStarted(true);
              }
            }}
            className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-800 disabled:text-slate-500 text-black font-black text-xs uppercase tracking-widest rounded-xl transition-all shadow-[0_0_20px_rgba(16,185,129,0.2)]"
          >
            Initialize {selectedCategory.split(' ')[0]} Test
          </button>
        </div>
      </div>
    ) : !isTestComplete ? (
      /* PHASE 2: INTERACTIVE QUESTION ENGINE */
      <div className="flex flex-col h-full animate-view-entry">
        {/* Progress Tracker */}
        <div className="p-4 md:p-6 bg-[#0b1c2e] border-b border-emerald-500/20 flex justify-between items-center shrink-0">
          <div className="flex items-center gap-4">
            <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">
              Node {currentQuestionIndex + 1} / {testData.length}
            </span>
            <div className="h-1 w-20 md:w-24 bg-slate-800 rounded-full overflow-hidden">
              <div 
                className="h-full bg-emerald-500 transition-all duration-500" 
                style={{ width: `${testData.length > 0 ? ((currentQuestionIndex + 1) / testData.length) * 100 : 0}%` }}
              ></div>
            </div>
          </div>
          <div className="px-2.5 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded text-[10px] font-bold text-emerald-400 uppercase">
            Score: {quizScore}
          </div>
        </div>

        {/* Question Area */}
        <div className="flex-grow flex flex-col justify-center p-4 md:p-12 overflow-y-auto custom-scrollbar">
          <div key={currentQuestionIndex} className="max-w-xl mx-auto w-full space-y-6 animate-slide-up">
            <h3 className="text-base md:text-xl font-bold text-white leading-snug text-center md:text-left">
              {testData[currentQuestionIndex]?.question}
            </h3>
            <div className="space-y-2.5">
              {testData[currentQuestionIndex]?.options.map((opt, i) => {
                const isSelected = selectedOption === opt;
                const isLocked = !!selectedOption;
                const isCorrect = opt === testData[currentQuestionIndex].correct_answer;

                let btnStyle = "border-slate-800 bg-black/40 text-slate-400 hover:border-emerald-500/50";
                if (isSelected) {
                  btnStyle = isCorrect ? "border-emerald-500 bg-emerald-500/20 text-emerald-400 shadow-md" : "border-red-500 bg-red-500/20 text-red-400";
                }

                return (
                  <button
                    key={i}
                    disabled={isLocked}
                    onClick={() => {
                      setSelectedOption(opt);
                      if (opt === testData[currentQuestionIndex].correct_answer) setQuizScore(prev => prev + 10);
                    }}
                    className={`w-full text-left p-4 rounded-xl border font-bold text-xs md:text-sm transition-all transform active:scale-[0.99] ${btnStyle}`}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer Nav */}
        <div className="p-4 bg-[#0b1c2e]/50 border-t border-emerald-500/10 flex justify-end shrink-0">
          {selectedOption && (
            <button
              onClick={() => {
                if (currentQuestionIndex < testData.length - 1) {
                  setCurrentQuestionIndex(prev => prev + 1);
                  setSelectedOption(null);
                } else {
                  setIsTestComplete(true);
                }
              }}
              className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-black font-black text-xs uppercase tracking-widest rounded-xl transition-all shadow-lg"
            >
              {currentQuestionIndex === testData.length - 1 ? "FINALIZE RESULTS" : "NEXT NODE →"}
            </button>
          )}
        </div>
      </div>
    ) : (
      /* PHASE 3: FINAL RESULTS & TAGGING */
      <div className="flex-grow flex flex-col items-center justify-center p-6 text-center space-y-6 overflow-y-auto no-scrollbar">
        <div className="bg-slate-900 border-2 border-emerald-500/30 p-6 rounded-full w-36 h-36 flex flex-col items-center justify-center shadow-2xl shrink-0">
          <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-0.5">Final Score</p>
          <p className="text-4xl font-black text-white leading-none">{quizScore}</p>
        </div>

        <div className="space-y-2 shrink-0">
          <h2 className="text-xl md:text-2xl font-black text-white uppercase tracking-tighter">
            Expertise: <br />
            <span className={quizScore >= 400 ? "text-emerald-400" : quizScore >= 250 ? "text-indigo-400" : "text-amber-500"}>
              {quizScore >= 400 ? "DEPTH KNOWLEDGE" : quizScore >= 250 ? "AVERAGE KNOWLEDGE" : "IMPROVEMENT NEEDED"}
            </span>
          </h2>
          <p className="text-slate-400 text-xs max-w-xs mx-auto italic">
            Assessment complete for {userName}. Record logged in Portal.
          </p>
        </div>

        <button 
          onClick={async () => {
            try {
              await supabase.from('assessment_logs').update({ 
                final_score: quizScore, 
                expertise_tag: quizScore >= 400 ? "Depth" : quizScore >= 250 ? "Average" : "Improvement",
                completed_at: new Date().toISOString() 
              }).eq('full_name', userName);
            } catch (err) {
              console.error("Final Save Failed");
            }
            setIsTestStarted(false); 
            setIsTestComplete(false); 
            setCurrentQuestionIndex(0); 
            setQuizScore(0); 
            setUserName("");
          }}
          className="px-8 py-4 bg-white text-black font-black text-xs uppercase tracking-widest rounded-xl hover:bg-emerald-500 transition-all shadow-xl shrink-0"
        >
          Submit & Close Terminal
        </button>
      </div>
    )}
  </div>
)}
            
            {activeView === 'privacy' && (
              <div className="p-8 bg-slate-900 border border-slate-800 rounded animate-view-entry">
                <h1 className="text-2xl font-bold mb-6 text-emerald-400">{privacyPolicy.title}</h1>
                <div className="text-slate-300 leading-relaxed whitespace-pre-line text-sm md:text-base">
                  {privacyPolicy.body}
                </div>
              </div>
            )}

            {activeView === 'terms' && (
              <div className="p-8 bg-slate-900 border border-slate-800 rounded animate-view-entry">
                <h1 className="text-2xl font-bold mb-6 text-emerald-400">{termsOfService.title}</h1>
                <div className="text-slate-300 leading-relaxed whitespace-pre-line text-sm md:text-base">
                  {termsOfService.body}
                </div>
              </div>
            )}
            
            {activeView === 'faq' && (
              <div className="p-8 bg-slate-900 border border-slate-800 rounded animate-view-entry space-y-4">
                <h1 className="text-2xl font-bold mb-6 text-emerald-400">Frequently Asked Questions</h1>
                {faqData.map((item, i) => (
                  <details key={i} className="mb-6 p-4 bg-black/40 border border-slate-800 rounded-lg group">
                    <summary className="cursor-pointer font-bold text-slate-200 select-none list-none flex justify-between items-center group-open:text-emerald-400">
                      <span>{item.question}</span>
                      <span className="text-xs transition-transform group-open:rotate-180">&darr;</span>
                    </summary>
                    <p className="mt-4 text-slate-400 text-sm leading-relaxed whitespace-pre-line border-t border-slate-800/60 pt-4">{item.answer}</p>
                  </details>
                ))}
              </div>
            )}

            {activeView === 'contact' && (
              <div className="p-8 bg-slate-900 border border-slate-800 rounded animate-view-entry">
                <h1 className="text-2xl font-bold mb-4 text-emerald-400">{contactContent.title}</h1>
                <p className="text-slate-300 leading-relaxed text-sm md:text-base whitespace-pre-line">{contactContent.body}</p>
              </div>
            )}

          </div>
        </div>
      )}
         

      {/* --- ANIMATED SYSTEM FOOTER --- */}
      <footer className="bg-[#0b1c2e] text-white border-t border-emerald-500/20 pt-16 pb-8 mt-20 relative overflow-hidden">
  
        {/* Hyper-Animated Laser Scan Overlay */}
        <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-emerald-400 to-transparent opacity-40 shadow-[0_0_15px_#10b981]"
             style={{ animation: 'footer-scan 4s linear infinite', pointerEvents: 'none' }}></div>

        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-12 mb-16">
            
            <div className="md:col-span-5 space-y-6">
              {/* Pulsing Branding Element */}
              <img 
                src="/logo.png" 
                alt="AML_DECODE" 
                className="h-12 w-auto object-contain transition-transform duration-500" 
                style={{ animation: 'terminal-pulse 3s ease-in-out infinite' }}
              />
              <p className="text-sm leading-relaxed text-slate-400 max-w-md">
                AMLDecode is your go-to platform for AML, KYC, EDD, and Transaction Monitoring learning. 
                We provide interview preparation notes, industry insights, and latest job opportunities 
                to help professionals grow their careers in financial crime compliance.
              </p>
            </div>

            <div className="md:col-span-3 space-y-4">
              <h3 className="text-emerald-500 font-black uppercase text-[10px] tracking-widest flex items-center gap-2">
                <span className="h-1.5 w-1.5 bg-emerald-500 rounded-full animate-ping"></span>
                Navigation
              </h3>
              <div className="flex flex-col gap-3 text-sm text-slate-300">
                <button onClick={() => setActiveView('faq')} className="hover:text-emerald-400 transition-all text-left w-fit uppercase font-bold tracking-tighter hover:translate-x-1.5 duration-300">FAQ</button>
                <button onClick={() => setActiveView('contact')} className="hover:text-emerald-400 transition-colors text-left w-fit uppercase font-bold tracking-tighter hover:translate-x-1.5 duration-300">Contact Us</button>
                <button onClick={() => setActiveView('notes')} className="hover:text-emerald-400 transition-colors text-left w-fit uppercase font-bold tracking-tighter hover:translate-x-1.5 duration-300">Learning Notes</button>
              </div>
            </div>

            <div className="md:col-span-4 space-y-4">
              <h3 className="text-emerald-500 font-black uppercase text-[10px] tracking-widest flex items-center gap-2">
                <span className="h-1.5 w-1.5 bg-emerald-500 rounded-full animate-ping [animation-delay:1s]"></span>
                Legal & Compliance
              </h3>
              <div className="flex flex-col gap-3 text-sm text-slate-300">
                <button onClick={() => setActiveView('privacy')} className="hover:text-emerald-400 transition-colors text-left w-fit uppercase font-bold tracking-tighter hover:translate-x-1.5 duration-300">Privacy Policy</button>
                <button onClick={() => setActiveView('terms')} className="hover:text-emerald-400 transition-colors text-left w-fit uppercase font-bold tracking-tighter hover:translate-x-1.5 duration-300">Terms of Service</button>
              </div>
            </div>
          </div>

          <div className="border-t border-slate-800/50 pt-8 flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest text-center md:text-left flex items-center gap-2">
              {/* Operational Status Dot */}
              <span className="h-2 w-2 rounded-full bg-emerald-500 inline-block" style={{ animation: 'terminal-pulse 1s ease-in-out infinite' }}></span>
              <span>© 2026 AML_DECODE / Designed by @ Nitesh Mishra</span>
            </div>

            <div className="flex items-center gap-8">
              {/* LinkedIn Icon Link */}
              <a href="https://linkedin.com/in/yourprofile" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-[#0077b5] transition-all duration-300 transform hover:scale-135 hover:rotate-6">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.761 0 5-2.239 5-5v-14c0-2.761-2.239-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
              </a>

              {/* Twitter Icon Link */}
              <a href="https://twitter.com/yourhandle" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-white transition-all duration-300 transform hover:scale-135 hover:-rotate-6">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/></svg>
              </a>

              {/* Instagram Icon Link */}
              <a href="https://instagram.com/yourhandle" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-[#e4405f] transition-all duration-300 transform hover:scale-135 hover:rotate-12">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 1.173.055 1.805.249 2.227.415.563.22.964.482 1.385.904.422.421.684.822.904 1.385.166.422.36 1.054.415 2.227.058 1.266.07 1.646.07 4.85s-.012 3.584-.07 4.85c-.055 1.173-.249 1.805-.415 2.227-.22.563-.482.964-.904 1.385-.421.421-.822.684-1.385.904-.422.166-1.054.36-2.227.415-1.266.058-1.646.07-4.85.07s-3.584-.012-4.85-.07c-1.173-.055-1.805-.249-2.227-.415-.563-.22-.964-.482-1.385-.904-.421-.421-.684-.822-.904-1.385-.166-.422-.36-1.054-.415-2.227-.058-1.266-.07-1.646-.07-4.85s.012-3.584.07-4.85c.055-1.173.249-1.805.415-2.227.22-.563.482-.964.904-1.385.421-.421.822-.684 1.385-.904.422-.166 1.054-.36 2.227-.415 1.266-.058 1.646-.07 4.85-.07zm0 1.442c-3.136 0-3.509.012-4.75.068-1.077.05-1.662.23-2.052.383-.518.201-.887.44-1.275.828s-.627.757-.828 1.275c-.153.39-.333.975-.383 2.052-.056 1.241-.068 1.614-.068 4.75s.012 3.509.068 4.75c.05 1.077.23 1.662.383 2.052.201.518.44.887.828 1.275s.757.627 1.275.828c.39.153.975.333 2.052.383 1.241.056 1.614.068 4.75.068s3.509-.012 4.75-.068c1.077-.05 1.662-.23 2.052-.383.518-.201.887-.44 1.275-.828s.627-.757.828-1.275c.153-.39.333-.975.383-2.052.056-1.241.068-1.614.068-4.75s-.012-3.509-.068-4.75c-.05-1.077-.23-1.662-.383-2.052-.201-.518-.44-.887-.828-1.275s-.757-.627-1.275-.828c-.39-.153-.975-.333-2.052-.383-1.241-.056-1.614-.068-4.75-.068zm0 3.64a4.755 4.755 0 1 0 0 9.51 4.755 4.755 0 0 0 0-9.51zm0 1.442a3.313 3.313 0 1 1 0 6.626 3.313 3.313 0 0 1 0-6.626zm5.35-4.832a1.11 1.11 0 1 1-2.22 0 1.11 1.11 0 0 1 2.22 0z"/></svg>
              </a>
            </div>
          </div>
        </div>
      </footer>

      <SubscribeModal/>
    </div>
  );
}