import React, { useState, useEffect, useRef } from 'react';
import { supabase } from './supabaseClient';
import { notesContent, privacyPolicy, termsOfService, faqData, contactContent } from './content';
import { jobOpenings } from './jobs';
import { kycNews } from './news';
import CinematicHero from './CinematicHero';

// ==========================================
// 1. EDITORIAL ASSESSMENT QUIZ DETAIL MODULE
// ==========================================
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
    <div className="py-14 border-b border-white/5 space-y-8 max-w-4xl mx-auto">
      <div className="space-y-2">
        <span className="text-[10px] font-bold tracking-[0.35em] text-amber-400 uppercase block">Case Diagnostics</span>
        <h3 className="text-2xl md:text-3xl font-light text-white leading-relaxed tracking-tight max-w-3xl">
          {item.question}
        </h3>
      </div>
      
      <div className="space-y-4 max-w-2xl pt-2">
        {(() => {
          try {
            const options = typeof item.options === 'string' ? JSON.parse(item.options) : item.options;
            return options.map((opt, i) => {
              let selectionStyle = "text-slate-400 hover:text-white pl-4 border-l border-transparent hover:border-amber-400/40";
              
              if (isLocked) {
                if (opt === item.correct_answer) {
                  selectionStyle = "text-amber-400 font-bold border-l-2 border-amber-500 pl-4";
                } else if (selected === opt && !isCorrect) {
                  selectionStyle = "text-red-400 line-through border-l border-red-500 pl-4";
                } else {
                  selectionStyle = "text-slate-600 opacity-20 pl-4";
                }
              }

              return (
                <button
                  key={i}
                  disabled={isLocked}
                  onClick={() => handleSelect(opt)}
                  className={`block w-full text-left py-2.5 text-sm md:text-base font-medium transition-all duration-300 ${selectionStyle}`}
                >
                  {opt}
                </button>
              );
            });
          } catch { return <p className="text-red-500 text-xs tracking-wider">Format Matrix Blocked</p>; }
        })()}
      </div>

      {isLocked && (
        <div className="pt-4 border-t border-white/[0.03] text-sm text-slate-400 leading-relaxed space-y-1 max-w-2xl animate-fade-in">
          <p className="text-[9px] uppercase tracking-[0.2em] text-amber-500 font-bold">Analysis Briefing</p>
          <p className="italic font-light">{item.explanation || "Case verified against active institutional compliance parameters."}</p>
        </div>
      )}
    </div>
  );
}

// ==========================================
// 2. LUXURY ADMISSIONS SYSTEM MODAL
// ==========================================
function SubscribeModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [email, setEmail] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => { setIsOpen(true); }, 4000);
    return () => clearTimeout(timer);
  }, []);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/95 backdrop-blur-xl p-6 animate-fade-in">
      <div className="max-w-md w-full space-y-10 py-6">
        <button onClick={() => setIsOpen(false)} className="text-slate-500 hover:text-white transition-colors block ml-auto text-[10px] tracking-[0.3em] uppercase font-bold">Close ✕</button>
        <div className="space-y-3">
          <h2 className="text-4xl font-light text-white tracking-tight uppercase leading-none">Stay Enrolled</h2>
          <p className="text-slate-400 text-sm leading-relaxed font-medium">
            Lock in daily regulatory placement updates, exclusive brief reviews, and technical criteria adjustments.
          </p>
        </div>
        <form onSubmit={async (e) => {
          e.preventDefault();
          const { error } = await supabase.from('subscribers').insert([{ email }]);
          if (!error) { alert("Registration complete."); setIsOpen(false); }
          else { alert(error.code === '23505' ? "Profile credentials already registered." : "Ecosystem trace link broken."); }
        }} className="space-y-6">
          <input 
            type="email" 
            required 
            placeholder="Institutional Email Address" 
            className="w-full pb-3 bg-transparent border-b border-white/20 text-white outline-none focus:border-amber-400 transition-colors text-lg font-light tracking-wide"
            onChange={(e) => setEmail(e.target.value)}
          />
          <button type="submit" className="w-full py-4 border border-white text-white hover:bg-white hover:text-black text-xs font-bold uppercase tracking-[0.25em] transition-all rounded-sm">
            Authorize Enrollment
          </button>
        </form>
      </div>
    </div>
  );
}

// ==========================================
// 3. MASTER EDITORIAL CONCH APP ENTRY
// ==========================================
export default function App() {
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
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [recruiterEmail, setRecruiterEmail] = useState("");
  const [selectedLocation, setSelectedLocation] = useState('All');
  const [selectedCategory, setSelectedCategory] = useState('KYC Basics');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userName, setUserName] = useState("");
  const [selectedOption, setSelectedOption] = useState(null);
  const [quizScore, setQuizScore] = useState(0);
  const [testData, setTestData] = useState([]);
  const [isTestStarted, setIsTestStarted] = useState(false);
  const [isTestComplete, setIsTestComplete] = useState(false);
  const contentRef = useRef(null);

  const isNewlyAdded = (dateString) => {
    if (!dateString) return false;
    const diffInDays = (new Date().getTime() - new Date(dateString).getTime()) / (1000 * 3600 * 24);
    return diffInDays >= 0 && diffInDays <= 4;
  };

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const { data: subs } = await supabase.from('submissions').select('*');
        const { data: files } = await supabase.from('partner_files').select('*');
        const { data: quiz } = await supabase.from('quiz_questions').select('*').eq('category', selectedCategory);
        if (subs) setSubmissions(subs);
        if (files) setPartnerFiles(files);
        if (quiz) setTestData(quiz);
      } catch (err) {
        console.error("Pipeline trace fault:", err);
      }
      setIsLoading(false);
    };
    fetchData();
  }, [selectedCategory]);

  return (
    <div className="text-slate-300 font-sans min-h-screen bg-[#020408] antialiased flex flex-col relative">
      
      {/* GLOBAL HIGH-END LANDING NAVBAR ROW */}
      <nav className="sticky top-0 left-0 w-full z-50 bg-[#020408]/70 backdrop-blur-xl border-b border-white/[0.02]">
        <div className="max-w-7xl mx-auto px-8 md:px-14 h-24 flex items-center justify-between">
          <img src="/logo.png" alt="DECODE" className="h-5 w-auto cursor-pointer object-contain" onClick={() => setActiveView(null)} />
          
          <div className="hidden lg:flex items-center gap-10 text-[11px] font-bold tracking-[0.3em] uppercase text-slate-400">
            {[{ label: 'Syllabus Notes', id: 'notes' }, { label: 'Active Placements', id: 'jobs' }, { label: 'Reference Pools', id: 'network' }, { label: 'Assessments', id: 'quiz' }].map((nav) => (
              <button key={nav.id} onClick={() => setActiveView(nav.id)} className={`transition-colors ${activeView === nav.id ? 'text-amber-400' : 'hover:text-white'}`}>
                {nav.label}
              </button>
            ))}
            <button onClick={() => { setActiveView(null); setTimeout(() => { document.getElementById('mentorship-canvas')?.scrollIntoView({ behavior: 'smooth' }); }, 100); }} className="hover:text-white transition-colors">Guidance</button>
            
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
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeWidth="1.5" d="M4 8h16M4 16h16" /></svg>
          </button>
        </div>
      </nav>

      {/* MOBILE SHEET LAYER */}
      {isMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-[100] bg-[#020408] flex flex-col p-10 justify-center space-y-6 animate-fade-in">
          <button onClick={() => setIsMenuOpen(false)} className="absolute top-8 right-8 text-white text-2xl p-2">✕</button>
          {[{ label: 'Syllabus Notes', id: 'notes' }, { label: 'Active Placements', id: 'jobs' }, { label: 'Reference Pools', id: 'network' }, { label: 'Assessments', id: 'quiz' }, { label: 'Recruiter Desk', id: 'contribute' }].map((nav) => (
            <button key={nav.id} onClick={() => setActiveView(nav.id) || setIsMenuOpen(false)} className="text-3xl font-serif text-left uppercase text-white hover:text-amber-400 transition-colors">{nav.label}</button>
          ))}
        </div>
      )}

      {/* CORE TOP-DOWN WEBSITE CONTAINER STACK */}
      {!activeView ? (
        <main className="flex-grow w-full">
          <CinematicHero />

          {/* SECTION I: PRIMARY INTEL SHOWCASE STAGE */}
          <section className="max-w-5xl mx-auto px-8 md:px-14 py-36 space-y-16">
            <div className="space-y-3 text-center md:text-left">
              <span className="text-[10px] font-bold tracking-[0.4em] text-amber-500 uppercase block">Active Investigation Core</span>
              <h2 className="text-4xl md:text-5xl font-light text-white tracking-tight leading-tight max-w-2xl">The Regulatory Scrutiny Strategy</h2>
            </div>

            <div className="p-12 md:p-16 border border-white/[0.04] bg-white/[0.01] rounded-3xl space-y-10 relative">
              <p className="text-xl md:text-2xl font-light text-slate-200 leading-relaxed font-serif max-w-4xl">
                "A cross-border corporate payment originating from an offshore tech hub is flagged by your monitoring system. The beneficiary entity is clean on global sanctions watchlists. However, upon deep-dive routing analysis, you discover that the transaction utilizes a nested correspondent banking structure, and one of the listed downstream intermediary transit banks was placed under selective sectorial sanctions exactly 48 hours ago. The asset value sits under standard regulatory reporting thresholds. What is the correct operational protocol?"
              </p>
              
              <div className="space-y-4 max-w-xl pt-2">
                <button disabled={isChallengeLocked} onClick={() => setChallengeSelected('edd') || setIsChallengeLocked(true)} className="w-full text-left py-4 border-b border-white/10 text-xs font-bold uppercase tracking-widest hover:border-amber-400 text-slate-400 hover:text-white transition-all">
                  Freeze Asset Framework & Escalate STR/SAR
                </button>
                <button disabled={isChallengeLocked} onClick={() => setChallengeSelected('dismiss') || setIsChallengeLocked(true)} className="w-full text-left py-4 border-b border-white/10 text-xs font-bold uppercase tracking-widest hover:border-amber-400 text-slate-400 hover:text-white transition-all">
                  Process Payment Ledger & Note Internally
                </button>
              </div>

              {isChallengeLocked && (
                <div className="pt-6 text-sm text-slate-400 font-serif italic space-y-1 animate-fade-in max-w-2xl">
                  <p className="text-[9px] uppercase tracking-widest text-amber-500 font-bold not-italic">Case Resolution</p>
                  <p>{challengeSelected === 'edd' ? "VALIDATED STRATEGY: Sanctions validation processes demand strict liability thresholds regardless of monetary value tracking size. Nested pathways are explicitly deployed to manipulate automated filters." : "REGULATORY BREACH RECORDED: Minimal asset value coordinates deliver zero defensive protection buffers under global screening enforcements."}</p>
                </div>
              )}
            </div>
          </section>

          {/* SECTION II: BROADCAST RUNNING ROW PROMPT */}
          <section className="w-full bg-white/[0.01] border-y border-white/[0.03] py-6 overflow-hidden">
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-[0.35em] flex gap-20 whitespace-nowrap animate-marquee">
              <span>• REVISIONS SYNCHRONIZING REGARDING THE RBI STANDARDS DIRECTIVES</span>
              <span>• TRANSACTION SECURITY CRITERIA AUDITING UNDER ACTIVE REMIT GUIDELINES</span>
              <span>• APAC REGIONAL COMPLIANCE TRACKS REGISTERING HIRING VELOCITY DRIFTS</span>
            </div>
          </section>

          {/* SECTION III: MAGAZINE STYLE VALUE LAYOUT SHEET */}
          <section className="max-w-6xl mx-auto px-8 md:px-14 py-36 grid grid-cols-1 lg:grid-cols-12 gap-16 items-center border-b border-white/[0.02]">
            <div className="lg:col-span-7 space-y-6">
              <span className="text-[10px] font-bold tracking-[0.3em] text-amber-400 uppercase block">The Academy Method</span>
              <h2 className="text-4xl md:text-5xl font-light text-white leading-tight tracking-tight">Technical Depth.<br />Whitespace Driven.</h2>
              <p className="text-slate-400 text-sm md:text-base leading-relaxed font-medium max-w-xl">
                We pull down the typical boxy tables and container clutter, organizing exhaustive regional directives into clean editorial lookbook modules built purely for interface ease, interview defense, and profile validation.
              </p>
              <div className="pt-4 flex gap-8 text-xs font-bold uppercase tracking-widest">
                <button onClick={() => setActiveView('notes')} className="text-white border-b border-white pb-0.5 hover:text-amber-400 hover:border-amber-400 transition-colors">Syllabus Directory &rarr;</button>
                <button onClick={() => setActiveView('quiz')} className="text-slate-500 hover:text-white transition-colors">Start Assessment</button>
              </div>
            </div>
            <div className="lg:col-span-5 h-[340px] border border-white/5 rounded-3xl bg-gradient-to-b from-white/[0.01] to-transparent flex items-center justify-center p-8 text-center">
              <p className="text-xs text-slate-500 font-serif italic max-w-xs">Data streams mapping cleanly inside localized rendering configurations.</p>
            </div>
          </section>

          {/* SECTION IV: PREMIUM ASYMMETRIC MENTORSHIP BLOCK */}
          <section id="mentorship-canvas" className="max-w-6xl mx-auto px-8 md:px-14 py-36 grid grid-cols-1 lg:grid-cols-12 gap-16">
            <div className="lg:col-span-5 space-y-4">
              <span className="text-[10px] font-bold tracking-[0.4em] text-amber-500 uppercase block">Academy Intake Open</span>
              <h2 className="text-4xl md:text-5xl font-light text-white tracking-tight leading-none">1:1 Intake Desk</h2>
              <p className="text-sm text-slate-400 leading-relaxed font-medium max-w-xs">
                Initialize an administrative consult evaluation track to clear portfolio blocks, reconstruct resumes, and align technical parameters.
              </p>
              <button onClick={() => window.location.href = `mailto:alerts@amldecode.in?subject=Intake`} className="pt-2 text-xs font-bold uppercase tracking-widest text-amber-400 border-b border-amber-400 pb-0.5 block w-fit hover:text-white hover:border-white transition-all">Request Entry Evaluation &rarr;</button>
            </div>

            <div className="lg:col-span-7 grid grid-cols-1 md:grid-cols-2 gap-10 text-xs font-bold uppercase tracking-wider text-slate-400 pl-0 lg:pl-16 lg:border-l border-white/5">
              {["Resume Structural Optimization", "Application Pipeline Distribution Strategy", "Mock Interview Case Defense Tactics", "Specialized Framework Review Sync"].map((track, idx) => (
                <div key={idx} className="pb-4 border-b border-white/[0.02] flex items-start gap-4">
                  <span className="text-amber-500 font-serif text-sm font-light">0{idx + 1}</span>
                  <span className="text-white/80 font-sans tracking-wide pt-0.5">{track}</span>
                </div>
              ))}
            </div>
          </section>
        </main>
      ) : (
        
        // RESTRUCTURED FULL-WIDTH ACADEMY CANVAS VIEW SHEETS
        <main className="flex-grow max-w-5xl mx-auto px-8 md:px-14 py-24 w-full animate-fade-in">
          <button onClick={() => setActiveView(null) || setQuizScore(0) || setCurrentQuestionIndex(0) || setIsTestStarted(false) || setIsTestComplete(false) || setUserName("") || setSelectedOption(null)} className="text-[10px] font-bold tracking-[0.3em] text-amber-500 hover:text-white transition-colors uppercase mb-16 block">&larr; Return to Workspace</button>

          {/* VIEW DISPLAY: SYLLABUS DOCUMENTATION VIEWER */}
          {activeView === 'notes' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
              <div className="lg:col-span-4 flex flex-col gap-3 sticky top-28 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
                {notesContent.map((item, idx) => (
                  <button key={idx} onClick={() => setPageIndex(idx)} className={`text-left py-3 border-b uppercase text-xs tracking-wider transition-all ${pageIndex === idx ? 'border-amber-500 text-white font-bold' : 'border-white/[0.03] text-slate-500 hover:text-slate-300'}`}>
                    Module 0{idx + 1}: {item.title}
                  </button>
                ))}
              </div>
              <div className="lg:col-span-8 space-y-6">
                <h1 className="text-3xl font-light text-white uppercase tracking-tight pb-4 border-b border-white/5">{notesContent[pageIndex]?.title}</h1>
                <p className="text-slate-300 font-serif font-light text-base leading-relaxed whitespace-pre-wrap pt-4">
                  {notesContent[pageIndex]?.body}
                </p>
              </div>
            </div>
          )}

          {/* VIEW DISPLAY: OPEN OPPORTUNITIES PIPELINE LIST */}
          {activeView === 'jobs' && (
            <div className="space-y-16">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6 pb-6 border-b border-white/5">
                <h1 className="text-3xl font-light text-white uppercase tracking-tight">Active Placements</h1>
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
                      <p className="text-xs text-slate-500 font-medium">{job.location} // Corporate Desk Vector</p>
                    </div>
                    <a href={job.link} target="_blank" rel="noopener noreferrer" className="text-xs font-bold uppercase tracking-widest text-white border-b border-white pb-0.5 hover:text-amber-400 hover:border-amber-400 transition-colors">Apply Node &rarr;</a>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* VIEW DISPLAY: RECURSIVE TESTING SYSTEMS */}
          {activeView === 'quiz' && (
            <div className="max-w-2xl mx-auto">
              {!isTestStarted ? (
                <div className="space-y-8 p-12 bg-white/[0.01] border border-white/5 rounded-2xl text-center md:text-left">
                  <h2 className="text-3xl font-light text-white uppercase tracking-tight font-serif">Assessment Enrolment Desk</h2>
                  <div className="flex flex-wrap gap-4 text-xs font-bold uppercase tracking-wider border-b border-white/[0.04] pb-2 text-slate-500">
                    {['KYC Basics', 'AML Advanced', 'Transaction Monitoring'].map((cat) => (
                      <button key={cat} onClick={() => setSelectedCategory(cat)} className={`hover:text-white transition-all ${selectedCategory === cat ? 'text-amber-400 font-black border-b border-amber-500 pb-0.5' : ''}`}>{cat}</button>
                    ))}
                  </div>
                  <div className="space-y-5 max-w-sm pt-2">
                    <input type="text" placeholder="CANDIDATE INITIAL INDICATION" value={userName} onChange={(e) => setUserName(e.target.value)} className="w-full pb-2 bg-transparent border-b border-white/20 text-white text-sm outline-none focus:border-amber-500 tracking-widest font-bold uppercase" />
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
                    <button onClick={() => currentQuestionIndex < testData.length - 1 ? setCurrentQuestionIndex(prev => prev + 1) || setSelectedOption(null) : setIsTestComplete(true)} className="px-8 py-3.5 border border-white text-white font-bold text-xs uppercase tracking-widest block ml-auto hover:bg-white hover:text-black transition-colors rounded-xl shadow-md">Advance &rarr;</button>
                  )}
                </div>
              ) : (
                <div className="p-12 border border-white/5 rounded-2xl text-center space-y-6 animate-fade-in">
                  <h2 className="text-3xl font-light text-white uppercase tracking-tight">Metrics Finalized</h2>
                  <p className="text-sm text-slate-400 font-medium">Candidate Reference: <span className="text-white font-bold">{userName}</span> // Score Profile: <span className="text-amber-400 font-bold">{quizScore} Units</span></p>
                  <button onClick={() => setIsTestStarted(false) || setIsTestComplete(false) || setCurrentQuestionIndex(0) || setQuizScore(0) || setUserName("")} className="px-8 py-3.5 border border-white text-white font-bold text-xs uppercase tracking-widest hover:bg-white hover:text-black transition-colors rounded-xl">Dismiss Records</button>
                </div>
              )}
            </div>
          )}

          {/* VIEW DISPLAY: REFERRAL STRAT CAPTURE REGISTRATION */}
          {activeView === 'referralForm' && (
            <div className="max-w-2xl mx-auto">
              <h1 className="text-3xl font-light text-white uppercase tracking-tight pb-4 border-b border-white/[0.04] mb-10">Referral Sync Framework</h1>
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

          {/* VIEW DISPLAY: AVAILABLE NET SUBS POOLS */}
          {activeView === 'available' && (
            <div className="space-y-8 max-w-4xl mx-auto">
              <h1 className="text-4xl font-light text-white uppercase tracking-tight pb-4 border-b border-white/[0.04]">Available Pipelines</h1>
              <div className="space-y-6">
                {submissions.map((sub, i) => (
                  <div key={i} className="pb-6 border-b border-white/[0.02] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold text-amber-500 tracking-widest uppercase block">{sub.company || 'Enterprise Firm'}</span>
                      <h3 className="text-xl font-bold text-white tracking-tight">{sub.role || 'Compliance Analyst'}</h3>
                      <p className="text-xs text-slate-500 font-medium mt-0.5">Sourced indicator reference: {sub.name}</p>
                    </div>
                    <a href={`mailto:${sub.email}?subject=Referral`} className="text-xs font-bold uppercase tracking-widest text-white border-b border-white pb-0.5 hover:text-amber-400 hover:border-amber-400 transition-colors">Contact Loop &rarr;</a>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* VIEW DISPLAY: VERIFIED MANAGER PANEL GATE */}
          {activeView === 'contribute' && (
            <div className="max-w-sm mx-auto">
              {!isAuthorized ? (
                <div className="space-y-6 p-10 border border-white/5 bg-white/[0.01] rounded-2xl text-center md:text-left">
                  <h2 className="text-2xl font-light text-white uppercase tracking-tight">Recruiter Gate Check</h2>
                  <div className="space-y-4">
                    <input type="email" placeholder="Verification Email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full p-4 bg-transparent border-b border-white/20 text-white outline-none text-sm font-medium focus:border-amber-500 transition-colors" />
                    <input type="password" placeholder="Passkey Key" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full p-4 bg-transparent border-b border-white/20 text-white outline-none text-sm font-medium focus:border-amber-500 transition-colors" />
                    <button onClick={async () => { const { error } = await supabase.auth.signInWithPassword({ email, password }); if (!error) setIsAuthorized(true); else alert("Access parameters denied."); }} className="w-full py-4 border border-white text-white font-bold uppercase tracking-widest text-xs hover:bg-white hover:text-black transition-colors rounded-xl">Request Clearance Identity</button>
                  </div>
                </div>
              ) : (
                <div className="space-y-6 p-8 border border-white/5 bg-white/[0.01] rounded-2xl">
                  <h3 className="text-2xl font-light text-white uppercase tracking-tight">Deploy Document Files</h3>
                  <input type="email" placeholder="Recruiter Reference Desk Email" value={recruiterEmail} onChange={(e) => setRecruiterEmail(e.target.value)} className="w-full pb-2 bg-transparent border-b border-white/20 text-white text-sm focus:border-amber-500 transition-colors" />
                  <input type="file" className="block w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:border file:border-white/10 file:bg-transparent file:text-white file:text-[10px] file:font-bold file:uppercase file:tracking-widest hover:file:border-amber-500 file:transition-colors" onChange={(e) => setSelectedFile(e.target.files[0])} />
                  <button disabled={!selectedFile || !recruiterEmail} onClick={async () => { const path = `uploads/${Math.random()}.${selectedFile.name.split('.').pop()}`; await supabase.storage.from('intelligence').upload(path, selectedFile); const { data: { publicUrl } } = supabase.storage.from('intelligence').getPublicUrl(path); await supabase.from('partner_files').insert([{ name: selectedFile.name, url: publicUrl, recruiter_email: recruiterEmail }]); alert("Node registered."); setActiveView('network'); }} className="w-full py-4 bg-white text-black font-black uppercase tracking-widest text-xs hover:bg-amber-500 transition-all rounded-xl shadow-md">Publish to active placement tracks</button>
                </div>
              )}
            </div>
          )}

          {/* VIEW DISPLAY: UPLOADED DATASETS REFUGE */}
          {activeView === 'network' && (
            <div className="space-y-8 max-w-4xl mx-auto">
              <h1 className="text-4xl font-light text-white uppercase tracking-tight pb-4 border-b border-white/[0.04]">Placement Registries</h1>
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

          {/* STATIC STATS PAGES (FAQ, Privacy, Terms) */}
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

      {/* RETAINED EDITORIAL ACADEMY BOTTOM BAR FOOTER MAP */}
      <footer className="bg-transparent border-t border-white/[0.03] pt-24 pb-12 w-full mt-auto">
        <div className="max-w-7xl mx-auto px-8 grid grid-cols-1 md:grid-cols-12 gap-12 mb-16">
          <div className="md:col-span-6 space-y-4">
            <img src="/logo.png" alt="AML_DECODE" className="h-5 w-auto object-contain" />
            <p className="text-xs leading-relaxed text-slate-500 max-w-xs font-medium">
              A premium, editorial financial intelligence academy delivering advanced preparation matrices across transaction metrics, risk oversight structures, and KYC analytics pathways.
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
          <span>© 2026 AML_DECODE</span>
          <span>Design by Nitesh Mishra</span>
        </div>
      </footer>

      <SubscribeModal />
    </div>
  );
}