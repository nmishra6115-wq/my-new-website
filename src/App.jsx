import React, { useState, useEffect, useRef } from 'react';
import { supabase } from './supabaseClient';
import { notesContent, privacyPolicy, termsOfService, faqData, contactContent } from './content';
import { jobOpenings } from './jobs';
import { kycNews } from './news';
import CinematicHero from './CinematicHero';

// PREMIUM ACADEMY QUIZ COMPONENT
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
    <div className={`mb-10 p-0 overflow-hidden bg-slate-900/40 backdrop-blur-xl border rounded-2xl transition-all duration-500 ${isLocked ? (isCorrect ? 'border-amber-500 shadow-[0_0_30px_rgba(251,191,36,0.15)]' : 'border-red-500/50') : 'border-white/5'}`}>
      
      {/* Question Header */}
      <div className="p-6 border-b border-white/[0.04] bg-white/[0.01]">
        <div className="flex justify-between items-start gap-4">
          <h2 className="text-xl font-bold text-white leading-snug">{item.question}</h2>
          {isLocked && (
            <span className={`shrink-0 h-6 w-6 rounded-full flex items-center justify-center text-xs font-black ${isCorrect ? 'bg-amber-500 text-black' : 'bg-red-500 text-white'}`}>
              {isCorrect ? '✓' : '✕'}
            </span>
          )}
        </div>
      </div>

      {/* Options Grid */}
      <div className="p-6 space-y-3">
        {(() => {
          try {
            const options = typeof item.options === 'string' ? JSON.parse(item.options) : item.options;
            return options.map((opt, i) => {
              const isThisSelected = selected === opt;
              const isThisCorrect = opt === item.correct_answer;
              
              let buttonStyle = "border-white/5 bg-white/[0.02] text-slate-300 hover:border-amber-500/50";
              if (isLocked) {
                if (isThisCorrect) buttonStyle = "border-amber-500 bg-amber-500/10 text-amber-400";
                else if (isThisSelected && !isThisCorrect) buttonStyle = "border-red-500 bg-red-500/10 text-red-400";
                else buttonStyle = "border-white/[0.02] bg-white/[0.01] text-slate-500 opacity-40";
              }

              return (
                <button 
                  key={i} 
                  disabled={isLocked} 
                  onClick={() => handleSelect(opt)}
                  className={`group relative block w-full text-left p-5 border rounded-xl transition-all duration-300 font-bold text-sm md:text-base min-h-[60px] ${buttonStyle}`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className="flex-grow">{opt}</span>
                    {!isLocked && <span className="opacity-0 group-hover:opacity-100 text-[10px] text-amber-400 font-black tracking-widest">CHOOSE →</span>}
                  </div>
                </button>
              );
            });
          } catch { return <p className="text-red-500">Error: Invalid format</p>; }
        })()}
      </div>

      {/* Rationale Insight Section */}
      {isLocked && (
        <div className={`p-6 border-t transition-opacity duration-500 ${isCorrect ? 'bg-amber-500/[0.02] border-amber-500/10' : 'bg-slate-900/20 border-white/5'}`}>
          <div className="flex items-start gap-3">
            <div className={`mt-1 p-1 rounded-md ${isCorrect ? 'text-amber-400' : 'text-slate-500'}`}>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest mb-1 text-slate-400">Academy Analysis & Core Case Rationale</p>
              <p className="text-sm text-slate-300 leading-relaxed italic">
                {item.explanation || "This answer maps straight to corporate compliance criteria executed inside financial centers like Bengaluru and Kolkata."}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// PREMIUM ACADEMY SUBSCRIBE MODAL
function SubscribeModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [email, setEmail] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => { setIsOpen(true); }, 3000);
    return () => clearTimeout(timer);
  }, []);

  const handleSubscribe = async (e) => {
    e.preventDefault();
    const { error } = await supabase.from('subscribers').insert([{ email }]);
    if (!error) {
      alert("Registration Saved. Your daily career intelligence reports are active.");
      setIsOpen(false);
    } else {
      alert(error.code === "23505" ? "This account profile is already active!" : "Error: " + error.message);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-fade-in">
      <div className="bg-slate-900 border border-white/10 p-10 rounded-2xl max-w-md w-full relative shadow-[0_40px_80px_rgba(0,0,0,0.8)]">
        <button onClick={() => setIsOpen(false)} className="absolute top-5 right-5 text-slate-500 hover:text-white text-md transition-colors">✕</button>
        
        <h2 className="text-3xl font-black text-white mb-2 uppercase tracking-tight">Stay Enrolled</h2>
        <p className="text-slate-400 text-sm mb-6 leading-relaxed font-medium">
          Receive daily compliance job briefings and executive network updates straight to your mailbox.
        </p>

        <form onSubmit={handleSubscribe} className="space-y-4">
          <input 
            type="email" 
            required 
            placeholder="Enter your email address" 
            className="w-full p-4 bg-black/40 border border-white/5 rounded-xl text-white outline-none focus:border-amber-500 transition-colors text-sm font-medium"
            onChange={(e) => setEmail(e.target.value)}
          />
          <button type="submit" className="w-full py-4 bg-gradient-to-b from-amber-400 to-amber-600 hover:from-amber-300 hover:to-amber-500 text-black font-black uppercase tracking-widest text-xs rounded-xl transition-all shadow-lg">
            
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
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [submissions, setSubmissions] = useState([]);
  const [partnerFiles, setPartnerFiles] = useState([]);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [newsList, setNewsList] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState('All');
  const [recruiterEmail, setRecruiterEmail] = useState("");
  const [selectedCategory, setSelectedCategory] = useState('KYC Basics');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userName, setUserName] = useState("");
  const [selectedOption, setSelectedOption] = useState(null);
  const [quizScore, setQuizScore] = useState(0);
  const [testData, setTestData] = useState([]);
  const contentRef = useRef(null);

  const isNewlyAdded = (dateString) => {
    if (!dateString) return false;
    const diffInDays = (new Date().getTime() - new Date(dateString).getTime()) / (1000 * 3600 * 24);
    return diffInDays >= 0 && diffInDays <= 4;
  };

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      const { data: subs } = await supabase.from('submissions').select('*');
      const { data: files } = await supabase.from('partner_files').select('*');
      const { data: news } = await supabase.from('news').select('*');
      const { data: quiz } = await supabase.from('quiz_questions').select('*').eq('category', selectedCategory);
      
      if (subs) setSubmissions(subs);
      if (files) setPartnerFiles(files);
      setNewsList(news && news.length > 0 ? news : kycNews);
      if (quiz) setTestData(quiz);
      setIsLoading(false);
    };
    fetchData();
  }, [selectedCategory]);

  return (
    <div className="text-slate-200 font-sans min-h-screen flex flex-col relative bg-[#020408] antialiased">
      
    
               {/* FLOATING CAPSULE NAVIGATION HEADER */}
<div className="w-full flex justify-center py-6 px-4 bg-[#040712] sticky top-0 z-50">
  <nav className="w-full max-w-7xl h-20 bg-[#fbfbf8] rounded-full shadow-[0_15px_40px_rgba(0,0,0,0.15)] border border-black/[0.03] px-3 flex items-center justify-between">
    
    {/* LEFT SIDE: Brand Logo Asset */}
 {/* LEFT SIDE: Crisp Vector Logo Icon & Branding */}
<div 
  onClick={() => setActiveView(null)} 
  className="flex items-center gap-3 pl-6 cursor-pointer shrink-0"
>
  {/* Geometric Editorial Logo Icon */}
  <svg 
    className="h-6 w-6 text-[#111111]" 
    fill="currentColor" 
    viewBox="0 0 24 24"
  >
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 12 10 10-4.48 10-12S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
  </svg>
  
  {/* Text Branding */}
  <span className="text-lg font-bold tracking-tight text-[#111111] font-sans">
    AML_DECODE
  </span>
</div>

    {/* CENTER SIDE: Minimalist Text Connections Link Arrays */}
    <div className="hidden lg:flex items-center gap-8 text-[12px] font-bold tracking-[0.18em] text-[#111111] uppercase">
      {[
        { label: 'Notes', id: 'notes' },
        { label: 'Jobs', id: 'jobs' },
        { label: 'Network Jobs', id: 'network' },
        { label: 'Knowledge Test', id: 'quiz' }
      ].map((item) => (
        <button
          key={item.id}
          onClick={() => setActiveView(item.id)}
          className={`transition-colors flex items-center gap-1 py-2 ${
            activeView === item.id 
              ? "text-amber-600 font-extrabold" 
              : "text-slate-700 hover:text-black font-semibold"
          }`}
        >
          <span>{item.label}</span>
          <span className="text-[9px] opacity-40 font-sans tracking-normal">&#x25BC;</span>
        </button>
      ))}

      <button
        onClick={() => {
          setActiveView(null);
          setTimeout(() => {
            document.getElementById('career-guidance')?.scrollIntoView({ behavior: 'smooth' });
          }, 150);
        }}
        className="text-slate-700 hover:text-black font-semibold transition-colors"
      >
        Career Guidance
      </button>

      {/* Dropdown resources array wrapper links */}
      <div className="relative group py-2 cursor-pointer">
        <span className="text-slate-700 group-hover:text-black font-semibold flex items-center gap-1 transition-colors">
          Resources <span className="text-[9px] opacity-40 font-sans tracking-normal">&#x25BC;</span>
        </span>
        <div className="absolute top-full left-1/2 -translate-x-1/2 w-60 bg-white border border-slate-100 rounded-2xl mt-2 py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all shadow-[0_20px_40px_rgba(0,0,0,0.12)] z-50">
          {[
            { label: 'Submit Network Referral', id: 'referralForm' }, 
            { label: 'Available Referrals Pool', id: 'available' }
          ].map((sub) => (
            <button 
              key={sub.id} 
              onClick={() => setActiveView(sub.id)} 
              className="w-full text-left px-5 py-3 text-[11px] font-bold text-slate-600 hover:bg-slate-50 hover:text-black uppercase tracking-wider"
            >
              {sub.label}
            </button>
          ))}
        </div>
      </div>
    </div>

    {/* RIGHT SIDE: Heavy High-Contrast Action Element */}
    <div className="hidden lg:block shrink-0">
      <button 
        onClick={() => setActiveView('contribute')} 
        className="h-14 px-8 bg-[#111111] hover:bg-black text-white text-[11px] font-bold uppercase tracking-[0.25em] rounded-full transition-all flex items-center justify-center shadow-inner"
      >
        RECRUITER DESK
      </button>
    </div>

    {/* MOBILE RESPONSIVE HAMBURGER ACTION ANCHOR */}
    <button 
      className="lg:hidden text-black pr-6 p-2 transition-transform active:scale-95 shrink-0" 
      onClick={() => setIsMenuOpen(!isMenuOpen)}
    >
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeWidth="2.5" d={isMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
      </svg>
    </button>

  </nav>
</div>
               

      {/* MOBILE FULL NAVIGATION OVERLAY */}
      {isMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-[999] bg-[#020408] flex flex-col p-8 justify-between animate-fade-in">
          <div className="flex justify-between items-center pb-6 border-b border-white/[0.04]">
            <span className="text-[10px] font-bold tracking-[0.25em] text-slate-500 uppercase">Academy Navigation Menu</span>
            <button onClick={() => setIsMenuOpen(false)} className="text-slate-400 p-2 text-2xl">✕</button>
          </div>
          <div className="flex flex-col gap-2 font-serif my-auto">
            {[{ label: 'Notes', id: 'notes' }, { label: 'Jobs', id: 'jobs' }, { label: 'Referral Jobs', id: 'available' }, { label: 'Knowledge Test', id: 'quiz' }].map((item, i) => (
              <button key={item.id} onClick={() => { setActiveView(item.id); setIsMenuOpen(false); }} className="text-3xl font-bold text-left py-4 text-white hover:text-amber-400 transition-colors uppercase tracking-tight">
                {item.label}
              </button>
            ))}
          </div>
          <div className="text-center text-[9px] font-bold tracking-widest text-slate-600 uppercase border-t border-white/[0.04] pt-6">
            AML DECODE INTEL SUITE // © 2026
          </div>
        </div>
      )}

      {/* EDITORIAL LANDING HUB CONTENT */}
      {!activeView && (
        <main className="flex-grow bg-[#020408]">
          <CinematicHero />

          <section className="relative z-10 py-24 px-8 bg-[#020408] max-w-7xl mx-auto space-y-24">
            
            {/* DUAL DISPLAY CONTENT COMPOSITION PANEL */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
              
              {/* COMPOSITION LEFT: FEATURED STRATEGY ASSIEGMENT CARD */}
              <div className={`lg:col-span-8 p-12 rounded-3xl bg-slate-900/30 backdrop-blur-xl shadow-2xl relative overflow-hidden transition-all duration-500 border ${isChallengeLocked ? (challengeSelected === 'edd' ? 'border-amber-500/40 shadow-[0_0_40px_rgba(251,191,36,0.1)]' : 'border-red-500/30') : 'border-white/[0.03]'}`}>
                <div className="flex justify-between items-center mb-6">
                  <span className="text-[10px] font-black tracking-[0.3em] uppercase text-amber-400">Featured Academy Case Analysis</span>
                  {isChallengeLocked && <span className={`h-6 w-6 rounded-full flex items-center justify-center text-xs font-black ${challengeSelected === 'edd' ? 'bg-amber-500 text-black' : 'bg-red-500 text-white'}`}>{challengeSelected === 'edd' ? '✓' : '✕'}</span>}
                </div>

                <p className="text-xl md:text-2xl font-bold text-white mb-8 leading-snug tracking-tight font-serif">
                  "A cross-border corporate payment originating from an offshore tech hub is flagged by your monitoring system. The beneficiary entity is clean on global sanctions watchlists. However, upon deep-dive routing analysis, you discover that the transaction utilizes a nested correspondent banking structure, and one of the listed downstream intermediary transit banks was placed under selective sectorial sanctions exactly 48 hours ago. The asset value sits under standard regulatory thresholds. What is the correct operational protocol?"
                </p>

                <div className="flex flex-wrap gap-4 mb-8">
                  <button disabled={isChallengeLocked} onClick={() => setChallengeSelected('edd') || setIsChallengeLocked(true)} className="px-8 py-3.5 text-xs font-black rounded-xl bg-white/5 border border-white/10 text-white hover:bg-amber-500 hover:text-black transition-colors uppercase tracking-widest">
                    Freeze Asset & File SAR/STR
                  </button>
                  <button disabled={isChallengeLocked} onClick={() => setChallengeSelected('dismiss') || setIsChallengeLocked(true)} className="px-8 py-3.5 text-xs font-black rounded-xl bg-white/5 border border-white/10 text-white hover:bg-amber-500 hover:text-black transition-colors uppercase tracking-widest">
                    Process Transaction & Log Internally
                  </button>
                </div>

                {isChallengeLocked && (
                  <div className="p-6 bg-white/[0.01] border-l-2 border-amber-500/50 rounded-r-xl space-y-2">
                    <p className="text-[9px] font-black uppercase tracking-widest text-slate-500">Executive Briefing & Resolution Matrix</p>
                    <p className="text-sm text-slate-300 leading-relaxed font-medium">
                      {challengeSelected === 'edd' 
                        ? "CORRECT STRATEGY: In sanctions screening, asset thresholds do not apply. Processing funds through a sanctioned entity creates strict legal liability. Nested banking paths are intentionally designed to obscure transaction routing. Immediate restriction and regulatory escalation are required."
                        : "COMPLIANCE FAILURE: Low asset values provide zero legal safe-harbor under global financial regulations. Allowing tracking streams to touch a designated blacklisted intermediary constitutes a direct compliance breach with severe systemic exposure."}
                    </p>
                  </div>
                )}
              </div>

              {/* COMPOSITION RIGHT: RESTRAINT PLACEMENT INSIGHTS CARD */}
              <div className="lg:col-span-4 p-12 rounded-3xl bg-slate-900/20 border border-white/[0.03] shadow-xl flex flex-col justify-between">
                <div>
                  <span className="text-[10px] font-black tracking-[0.3em] uppercase text-slate-500 block mb-8">Regional Employment Pulse</span>
                  <div className="space-y-4">
                    {[{ city: 'Bengaluru Core', metric: '+14% Hiring Blitz', tag: 'CRITICAL' }, { city: 'Kolkata Sector', metric: 'Steady Executive Growth', tag: 'STEADY' }].map((pulse, i) => (
                      <div key={i} className="p-4 bg-white/[0.02] border border-white/[0.02] rounded-xl flex justify-between items-center hover:border-white/10 transition-colors">
                        <div>
                          <p className="text-sm font-bold text-white uppercase tracking-tight">{pulse.city}</p>
                          <p className="text-[10px] text-slate-400 font-medium pt-0.5">{pulse.metric}</p>
                        </div>
                        <span className="text-[9px] font-black text-amber-400 bg-amber-400/5 px-2.5 py-1 rounded-md border border-amber-400/20">{pulse.tag}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <p className="text-xs text-slate-500 italic pt-6 leading-relaxed border-t border-white/[0.02] mt-6 text-center">
                  Heightened international market demands recorded for specialized transactional verification structures.
                </p>
              </div>
            </div>

            {/* RESTRAINED RUNNING BROADCAST STRIP */}
            <div className="p-5 bg-slate-900/50 backdrop-blur-md border border-white/[0.03] rounded-2xl flex items-center overflow-hidden">
              <span className="text-[10px] font-black text-amber-500 uppercase tracking-widest border-r border-white/10 pr-6 mr-6 shrink-0">Live Bulletins</span>
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.2em] flex gap-16 whitespace-nowrap animate-marquee">
                <span>• RBI updates master compliance framework criteria for financial institutions</span>
                <span>• Cross-border transaction security requirements updated under 2026 guidelines</span>
                <span>• Global watchlists register adjustments for high-risk offshore operations</span>
              </div>
            </div>

            {/* SECTION: ACADEMY DISCOVERY HIGHLIGHT CONTENT */}
            <div className="py-16 border-t border-white/[0.02] grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <div className="p-1.5 bg-gradient-to-tr from-white/5 to-transparent rounded-[32px]">
                <div className="bg-[#020408] rounded-[30px] p-12 text-center h-[350px] flex flex-col items-center justify-center relative overflow-hidden group border border-white/5">
                  <div className="absolute inset-0 bg-amber-500/[0.02] opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                  <div className="h-20 w-24 border-2 border-amber-500 rounded-full flex items-center justify-center mb-6 shadow-2xl group-hover:scale-105 transition-transform">
                    <svg className="w-8 h-8 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" /></svg>
                  </div>
                  <p className="text-[9px] font-black text-amber-400 uppercase tracking-widest mb-1">Architecture Frame</p>
                  <p className="text-xl font-bold text-white uppercase tracking-tight">Active Analytics Sync Ready</p>
                </div>
              </div>

              <div className="space-y-6">
                <span className="text-[10px] font-black tracking-[0.3em] uppercase text-amber-400 bg-white/[0.03] px-3 py-1.5 rounded-md border border-white/5">Educational Standard</span>
                <h2 className="text-5xl font-black text-white tracking-tight font-serif leading-none">The Engine of Expertise.</h2>
                <p className="text-slate-400 text-base leading-relaxed font-medium">
                  AML_DECODE removes the technical clutter, translating heavy, exhaustive financial legislation records into structured, high-conversion learning modules built directly for elite corporate compliance placement thresholds.
                </p>
                <div className="pt-4 flex gap-4">
                  <button onClick={() => setActiveView('notes')} className="px-8 py-3.5 bg-gradient-to-b from-amber-400 to-amber-600 font-black text-xs text-black uppercase tracking-widest rounded-xl shadow-md">
                    Explore Syllabus
                  </button>
                  <button onClick={() => setActiveView('quiz')} className="px-8 py-3.5 bg-white/5 border border-white/10 text-white font-black text-xs uppercase tracking-widest rounded-xl hover:bg-white/10 transition-colors">
                    Take Assessment
                  </button>
                </div>
              </div>
            </div>

            {/* SECTION: ACADEMY MENTORSHIP SIGNUP */}
            <div id="career-guidance" className="py-16 border-t border-white/[0.02] grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <div className="space-y-6 order-2 lg:order-1">
                <h2 className="text-5xl font-black text-white tracking-tight font-serif leading-none">Executive Mentorship.</h2>
                <p className="text-slate-400 text-base leading-relaxed font-medium">
                  Gain access to specialized 1:1 consultation streams built exclusively to organize resume profiles, clear interview blockades, and solidify advanced technical expertise parameters across international regulatory sectors.
                </p>
                <div className="p-6 bg-white/[0.01] border border-white/5 rounded-2xl">
                  <p className="text-xs font-black text-amber-400 uppercase tracking-wider mb-2">Registration Pathway</p>
                  <p className="text-sm text-slate-400 italic leading-relaxed">
                    "Initialize an intake file outlining your current employment criteria and placement goals to trigger active routing assignment."
                  </p>
                </div>
                <button onClick={() => window.location.href = `mailto:alerts@amldecode.in?subject=Intake`} className="px-8 py-4 bg-gradient-to-b from-amber-400 to-amber-600 text-black font-black text-xs uppercase tracking-widest rounded-xl shadow-md flex items-center gap-2">
                  Request Intake Slot &rarr;
                </button>
              </div>

              <div className="p-12 bg-slate-900/20 border border-white/[0.03] rounded-3xl space-y-6 order-1 lg:order-2">
                <span className="text-[9px] font-black tracking-[0.25em] text-amber-400 uppercase block">Secure Session Modules</span>
                <div className="space-y-4 font-sans font-bold text-sm text-slate-300">
                  {["Resume Mapping & Optimization", "Application Flow Strategy", "Interview Target Engineering", "Specialized Framework Reviews"].map((label, index) => (
                    <div key={index} className="flex items-center gap-3 py-2 border-b border-white/[0.02]">
                      <span className="text-amber-500 font-light text-base">&#8212;</span>
                      <span className="uppercase tracking-wide">{label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

          </section>
        </main>
      )}

      {/* DETACHED DYNAMIC CORE VIEWS TERMINAL */}
      {activeView && (
        <div className="fixed inset-0 z-[100] bg-[#020408] p-12 overflow-y-auto custom-scrollbar">
          <button onClick={() => setActiveView(null) || setQuizScore(0)} className="text-amber-400 font-bold tracking-widest text-xs mb-10 block hover:text-white transition-colors">&larr; DISMISS VIEW</button>
          
          <div key={activeView} className="max-w-7xl mx-auto text-white animate-fade-in">
            
            {/* VIEW MODULE: CORE NOTES DISPLAY */}
            {activeView === 'notes' && (
              <div className="space-y-8 max-w-7xl mx-auto pb-20">
                <div className="border-b border-white/[0.04] pb-6">
                  <span className="text-[10px] font-black tracking-widest text-amber-500 uppercase">Academy Knowledge Core</span>
                  <h1 className="text-4xl font-black text-white uppercase tracking-tight font-serif mt-1">Syllabus Framework Notes</h1>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                  {/* Topic navigation menu */}
                  <div className="lg:col-span-4 flex flex-col gap-2 overflow-y-auto max-h-[65vh] pr-2 custom-scrollbar">
                    {notesContent.map((item, idx) => (
                      <button key={idx} onClick={() => setPageIndex(idx)} className={`w-full text-left p-5 border rounded-xl transition-all duration-300 relative uppercase ${pageIndex === idx ? "bg-white/[0.03] border-amber-500 text-white shadow-md" : "bg-white/[0.01] border-white/5 text-slate-400 hover:text-white"}`}>
                        <span className="text-[8px] font-black text-slate-500 block mb-1">MODULE_0{idx + 1}</span>
                        <span className="text-xs font-bold tracking-wider">{item.title}</span>
                      </button>
                    ))}
                  </div>

                  {/* Document Reader Frame */}
                  <div className="lg:col-span-8 bg-slate-900/20 border border-white/5 rounded-2xl flex flex-col overflow-hidden h-[65vh]">
                    <div className="px-6 py-4 bg-white/[0.01] border-b border-white/[0.04] text-[10px] font-bold tracking-widest text-slate-400 uppercase">
                      Document Stream: {notesContent[pageIndex]?.title}
                    </div>
                    <div ref={contentRef} className="flex-grow overflow-y-auto p-8 space-y-4 custom-scrollbar">
                      <h2 className="text-2xl font-black text-white font-serif uppercase tracking-tight">{notesContent[pageIndex]?.title}</h2>
                      <p className="text-slate-300 text-base font-medium leading-relaxed whitespace-pre-wrap pt-4 border-t border-white/[0.02]">
                        {notesContent[pageIndex]?.body}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* VIEW MODULE: PLACEMENT LIST DIRECTORY */}
            {activeView === 'jobs' && (
              <div className="space-y-12 max-w-5xl mx-auto pb-20">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-white/[0.04] pb-8">
                  <div>
                    <span className="text-[10px] font-black tracking-widest text-amber-500 uppercase">Employment Stream</span>
                    <h1 className="text-4xl font-black text-white font-serif uppercase tracking-tight mt-1">Corporate Openings</h1>
                  </div>
                  <div className="flex flex-wrap gap-1.5 p-1 bg-white/[0.02] border border-white/5 rounded-xl">
                    {['All', 'Bengaluru', 'Kolkata', 'Gurugram', 'Remote'].map((loc) => (
                      <button key={loc} onClick={() => setSelectedLocation(loc)} className={`px-4 py-2 text-xs font-bold uppercase rounded-lg transition-all ${selectedLocation === loc ? "bg-amber-500 text-black shadow-md" : "text-slate-400 hover:text-white"}`}>
                        {loc}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="bg-slate-900/20 border border-white/5 rounded-2xl divide-y divide-white/[0.03] overflow-hidden shadow-2xl">
                  {jobOpenings
                    .filter(job => selectedLocation === 'All' || job.location === selectedLocation)
                    .map((job, idx) => (
                      <div key={idx} className="p-6 hover:bg-white/[0.01] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 transition-colors">
                        <div className="space-y-1">
                          <p className="text-amber-500 text-[10px] font-black tracking-widest uppercase">{job.company}</p>
                          <h2 className="text-xl font-bold text-white tracking-tight">{job.role}</h2>
                          <p className="text-xs text-slate-500 font-medium">{job.location} // Open Profile</p>
                        </div>
                        <a href={job.link} target="_blank" rel="noopener noreferrer" className="px-5 py-3 bg-white/5 border border-white/10 text-xs font-black uppercase tracking-widest rounded-xl hover:bg-amber-500 hover:text-black transition-all">
                          Launch Application &rarr;
                        </a>
                      </div>
                    ))}
                </div>
              </div>
            )}

            {/* VIEW MODULE: GENERAL ASSESSMENT TERMINAL */}
            {activeView === 'quiz' && (
              <div className="max-w-3xl mx-auto pb-20">
                {!isTestStarted ? (
                  <div className="p-12 rounded-3xl bg-slate-900/20 border border-white/5 text-center space-y-8">
                    <h2 className="text-3xl font-black text-white uppercase tracking-tight font-serif">Assessment Enrolment Desk</h2>
                    <div className="flex justify-center gap-3">
                      {['KYC Basics', 'AML Advanced', 'Transaction Monitoring'].map((cat) => (
                        <button key={cat} onClick={() => setSelectedCategory(cat)} className={`py-3 px-5 border text-xs font-bold rounded-xl transition-all uppercase tracking-wider ${selectedCategory === cat ? "border-amber-500 bg-amber-500/10 text-amber-400" : "border-white/5 bg-transparent text-slate-400 hover:border-white/10"}`}>
                          {cat}
                        </button>
                      ))}
                    </div>
                    <input type="text" placeholder="ENTER INITIAL CANDIDATE NAME" value={userName} onChange={(e) => setUserName(e.target.value)} className="w-full max-w-sm p-4 bg-black/40 border border-white/5 rounded-xl text-center font-bold text-sm text-white outline-none focus:border-amber-500 uppercase tracking-widest" />
                    <button disabled={!userName.trim()} onClick={() => setIsTestStarted(true)} className="block mx-auto px-10 py-4 bg-gradient-to-b from-amber-400 to-amber-600 text-black text-xs font-black uppercase tracking-widest rounded-xl shadow-md disabled:opacity-40">
                      Initialize Active Exam
                    </button>
                  </div>
                ) : !isTestComplete ? (
                  <div className="space-y-6">
                    <div className="p-4 bg-slate-900/40 rounded-xl border border-white/5 flex justify-between items-center text-xs font-bold text-slate-400 uppercase tracking-widest">
                      <span>Question Context Node: {currentQuestionIndex + 1} / {testData.length}</span>
                      <span className="text-amber-400">Score Tracker: {quizScore}</span>
                    </div>
                    <div className="bg-slate-900/20 border border-white/5 p-8 rounded-2xl space-y-6">
                      <h3 className="text-lg font-bold text-white font-serif">{testData[currentQuestionIndex]?.question}</h3>
                      <div className="space-y-3">
                        {testData[currentQuestionIndex]?.options.map((opt, i) => (
                          <button key={i} disabled={!!selectedOption} onClick={() => setSelectedOption(opt) || (opt === testData[currentQuestionIndex].correct_answer && setQuizScore(prev => prev + 10))} className={`w-full text-left p-4 border rounded-xl font-bold text-sm uppercase transition-all ${selectedOption === opt ? (opt === testData[currentQuestionIndex].correct_answer ? "border-amber-500 bg-amber-500/10 text-amber-400" : "border-red-500 bg-red-500/10 text-red-400") : "border-white/5 bg-white/[0.01] text-slate-400 hover:border-white/10"}`}>
                            {opt}
                          </button>
                        ))}
                      </div>
                    </div>
                    {selectedOption && (
                      <button onClick={() => currentQuestionIndex < testData.length - 1 ? setCurrentQuestionIndex(prev => prev + 1) || setSelectedOption(null) : setIsTestComplete(true)} className="px-8 py-3.5 bg-white text-black font-black text-xs uppercase tracking-widest rounded-xl ml-auto block">
                        {currentQuestionIndex === testData.length - 1 ? "Complete Exam" : "Advance Node &rarr;"}
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="p-12 rounded-3xl bg-slate-900/20 border border-white/5 text-center space-y-6">
                    <div className="w-24 h-24 rounded-full bg-amber-500/10 border-2 border-amber-500 flex flex-col items-center justify-center mx-auto shadow-2xl">
                      <p className="text-2xl font-black text-white">{quizScore}</p>
                    </div>
                    <h2 className="text-2xl font-black font-serif uppercase text-white">Assessment Complete</h2>
                    <button onClick={() => setIsTestStarted(false) || setIsTestComplete(false) || setCurrentQuestionIndex(0) || setQuizScore(0) || setUserName("")} className="px-8 py-4 bg-white text-black text-xs font-black uppercase tracking-widest rounded-xl shadow-md">
                      Dismiss Portal Record
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* INTEGRATED STANDALONE FORM LAYOUT VIEWS */}
            {activeView === 'referralForm' && (
              <div className="max-w-2xl mx-auto pb-20">
                <div className="mb-8 border-b border-white/[0.04] pb-4">
                  <h1 className="text-3xl font-black text-white font-serif uppercase tracking-tight">Referral Sync Form</h1>
                </div>
                <form className="space-y-6 bg-slate-900/20 border border-white/5 p-8 rounded-2xl font-bold text-xs uppercase tracking-wider" onSubmit={async (e) => { e.preventDefault(); await supabase.from('submissions').insert([{ name: e.target[0].value, email: e.target[1].value, company: e.target[2].value, role: e.target[3].value }]); alert("Referral Sync Logged."); setActiveView('jobs'); }}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {["Full Candidate Name", "Intake Contact Email", "Target Corporate Firm", "Designated Employment Role"].map((ph, i) => (
                      <div key={i} className="space-y-2">
                        <label className="text-slate-500 block tracking-widest">{ph}</label>
                        <input required className="w-full p-4 bg-black/40 border border-white/5 rounded-xl text-white outline-none focus:border-amber-500 font-medium normal-case tracking-normal" placeholder="Enter target parameters" />
                      </div>
                    ))}
                  </div>
                  <button type="submit" className="w-full py-4 bg-gradient-to-b from-amber-400 to-amber-600 text-black font-black uppercase tracking-widest text-xs rounded-xl shadow-md">Submit Referral Registry</button>
                </form>
              </div>
            )}

            {activeView === 'available' && (
              <div className="space-y-6 max-w-4xl mx-auto pb-20">
                <div className="border-b border-white/[0.04] pb-6 flex justify-between items-end">
                  <div>
                    <span className="text-[10px] font-black tracking-widest text-amber-500 uppercase">Network Pipeline</span>
                    <h1 className="text-4xl font-black text-white font-serif uppercase tracking-tight mt-1">Available Referrals</h1>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {submissions.map((sub, i) => (
                    <div key={i} className="p-6 bg-slate-900/20 border border-white/5 rounded-2xl flex flex-col justify-between gap-6 hover:border-amber-500/40 transition-colors">
                      <div>
                        <span className="text-[9px] font-black text-amber-500 tracking-widest uppercase block mb-1">{sub.company || 'Corporate Network Partner'}</span>
                        <h3 className="text-lg font-bold text-white tracking-tight">{sub.role || 'Compliance Associate'}</h3>
                        <p className="text-xs text-slate-500 font-medium mt-1">Shared by: {sub.name}</p>
                      </div>
                      <a href={`mailto:${sub.email}?subject=Referral`} className="w-full py-3 bg-white/5 border border-white/10 text-center text-white text-xs font-black uppercase tracking-widest rounded-xl hover:bg-amber-500 hover:text-black transition-all">
                        Request Communication Node
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeView === 'contribute' && (
              <div className="max-w-2xl mx-auto pb-20">
                {!isAuthorized ? (
                  <div className="bg-slate-900/20 border border-white/5 p-8 rounded-2xl max-w-sm mx-auto space-y-4 text-center">
                    <h2 className="text-lg font-bold text-white font-serif uppercase tracking-wider">Recruiter Verification</h2>
                    <input type="email" placeholder="Credential Email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full p-4 bg-black/40 border border-white/5 rounded-xl text-white outline-none text-sm font-medium" />
                    <input type="password" placeholder="Passkey" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full p-4 bg-black/40 border border-white/5 rounded-xl text-white outline-none text-sm font-medium" />
                    <button onClick={async () => { const { error } = await supabase.auth.signInWithPassword({ email, password }); if (!error) setIsAuthorized(true); else alert("Access Denied."); }} className="w-full py-3.5 bg-gradient-to-b from-amber-400 to-amber-600 text-black font-black uppercase tracking-widest text-xs rounded-xl shadow-md">Verify Registry Identity</button>
                  </div>
                ) : (
                  <div className="bg-slate-900/20 border border-white/5 p-8 rounded-2xl space-y-6">
                    <h3 className="text-lg font-bold text-white font-serif uppercase tracking-wider">Deploy Portal File</h3>
                    <input type="email" placeholder="Recruiter Contact Desk" value={recruiterEmail} onChange={(e) => setRecruiterEmail(e.target.value)} className="w-full p-4 bg-black/40 border border-white/5 rounded-xl text-white outline-none text-sm" />
                    <input type="file" onChange={(e) => setSelectedFile(e.target.files[0])} className="block w-full text-sm text-slate-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-black file:bg-white/5 file:text-white hover:file:bg-white/10" />
                    <button disabled={!selectedFile || !recruiterEmail} onClick={async () => { const path = `uploads/${Math.random()}.${selectedFile.name.split('.').pop()}`; await supabase.storage.from('intelligence').upload(path, selectedFile); const { data: { publicUrl } } = supabase.storage.from('intelligence').getPublicUrl(path); await supabase.from('partner_files').insert([{ name: selectedFile.name, url: publicUrl, recruiter_email: recruiterEmail }]); alert("Node Deployed."); setActiveView('network'); }} className="w-full py-4 bg-gradient-to-b from-amber-400 to-amber-600 text-black font-black uppercase tracking-widest text-xs rounded-xl shadow-md">Publish to Active Network Stream</button>
                  </div>
                )}
              </div>
            )}

            {activeView === 'network' && (
              <div className="space-y-8 max-w-5xl mx-auto pb-20">
                <div className="border-b border-white/[0.04] pb-6">
                  <span className="text-[10px] font-black tracking-widest text-amber-500 uppercase">Partner Data Streams</span>
                  <h1 className="text-4xl font-black text-white font-serif uppercase tracking-tight mt-1">Active Network Placements</h1>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {partnerFiles.map((f, i) => (
                    <div key={i} className="p-6 bg-slate-900/20 border border-white/5 rounded-2xl flex flex-col justify-between gap-6 hover:border-amber-500/40 transition-colors">
                      <div>
                        <span className="text-[9px] font-black text-slate-500 tracking-widest block uppercase mb-1">DATA_FILE_NODE_0{i+1}</span>
                        <h3 className="text-lg font-bold text-white tracking-tight">{f.name}</h3>
                        <p className="text-[11px] text-amber-400 font-bold uppercase tracking-tight mt-1">Desk: {f.recruiter_email}</p>
                      </div>
                      <button onClick={() => window.open(f.url, '_blank')} className="w-full py-3 bg-white/5 border border-white/10 font-black text-xs text-slate-300 uppercase tracking-widest rounded-xl hover:bg-white/10 transition-colors">Download Document Intel</button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TRADITIONAL STATIC ARTICLES MODAL HANDLERS */}
            {['privacy', 'terms', 'faq', 'contact'].includes(activeView) && (
              <div className="p-10 bg-slate-900/20 border border-white/5 rounded-2xl max-w-3xl mx-auto leading-relaxed text-slate-300 font-medium text-sm md:text-base whitespace-pre-wrap">
                {activeView === 'privacy' && privacyPolicy.body}
                {activeView === 'terms' && termsOfService.body}
                {activeView === 'contact' && contactContent.body}
                {activeView === 'faq' && faqData.map((item, i) => (
                  <div key={i} className="mb-6 pb-6 border-b border-white/[0.02]">
                    <h4 className="font-bold text-white mb-2 uppercase tracking-wide text-base">{item.question}</h4>
                    <p className="text-slate-400 italic font-sans">{item.answer}</p>
                  </div>
                ))}
              </div>
            )}

          </div>
        </div>
      )}

      {/* RESTRAINED EDITORIAL DESIGN ACADEMY FOOTER MAP */}
     {/* HIGH-END MINIMALIST FOOTER SECTION */}
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