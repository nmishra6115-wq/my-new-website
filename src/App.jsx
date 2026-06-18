import React, { useState, useEffect, useRef } from 'react';
import { supabase } from './supabaseClient';
import { notesContent, privacyPolicy, termsOfService, faqData, contactContent } from './content';
import { jobOpenings } from './jobs';
import { kycNews } from './news';
import CinematicHero from './CinematicHero';

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
    <div className="mb-16 border-l-2 border-white/10 pl-6 md:pl-10 space-y-6">
      <h2 className="text-2xl font-serif font-light text-white leading-snug max-w-3xl">{item.question}</h2>
      
      <div className="space-y-4 max-w-2xl">
        {(() => {
          try {
            const options = typeof item.options === 'string' ? JSON.parse(item.options) : item.options;
            return options.map((opt, i) => {
              const isThisSelected = selected === opt;
              const isThisCorrect = opt === item.correct_answer;
              
              let buttonStyle = "text-slate-400 hover:text-white pl-4 border-l border-transparent hover:border-amber-500/50";
              if (isLocked) {
                if (isThisCorrect) buttonStyle = "text-amber-400 font-bold border-l-2 border-amber-500 pl-4";
                else if (isThisSelected && !isThisCorrect) buttonStyle = "text-red-400 line-through border-l border-red-500 pl-4";
                else buttonStyle = "text-slate-600 opacity-30 pl-4";
              }

              return (
                <button 
                  key={i} 
                  disabled={isLocked} 
                  onClick={() => handleSelect(opt)}
                  className={`block w-full text-left py-3 text-sm md:text-base font-medium transition-all duration-300 ${buttonStyle}`}
                >
                  {opt}
                </button>
              );
            });
          } catch { return <p className="text-red-500">Format Execution Blocked</p>; }
        })()}
      </div>

      {isLocked && (
        <div className="pt-4 max-w-2xl animate-fade-in">
          <p className="text-[9px] uppercase tracking-[0.3em] text-amber-500 mb-2 font-semibold">Editorial Review Context</p>
          <p className="text-sm text-slate-400 leading-relaxed font-serif italic">
            {item.explanation || "Case standard mapped from current institutional compliance practices."}
          </p>
        </div>
      )}
    </div>
  );
}

function SubscribeModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [email, setEmail] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => { setIsOpen(true); }, 4000);
    return () => clearTimeout(timer);
  }, []);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-[#020408]/95 backdrop-blur-md p-6">
      <div className="max-w-md w-full space-y-8 text-center md:text-left">
        <button onClick={() => setIsOpen(false)} className="text-slate-500 hover:text-white transition-colors block ml-auto text-sm tracking-widest">WIPE_VIEW ✕</button>
        <div className="space-y-3">
          <h2 className="text-4xl font-serif font-light text-white tracking-tight uppercase">Join the Registry</h2>
          <p className="text-slate-400 text-sm leading-relaxed font-medium">
            Get premium intelligence updates, exclusive case documentation, and direct regulatory placement briefs.
          </p>
        </div>
        <form onSubmit={async (e) => {
          e.preventDefault();
          const { error } = await supabase.from('subscribers').insert([{ email }]);
          if (!error) { alert("Registration finalized."); setIsOpen(false); }
          else { alert("Registry trace failed."); }
        }} className="space-y-4">
          <input 
            type="email" 
            required 
            placeholder="Institutional Email" 
            className="w-full pb-3 bg-transparent border-b border-white/20 text-white outline-none focus:border-amber-500 transition-colors text-lg"
            onChange={(e) => setEmail(e.target.value)}
          />
          <button type="submit" className="w-full py-4 border border-white text-white hover:bg-white hover:text-black font-medium uppercase tracking-[0.2em] text-xs transition-all">
            Secure Enrollment
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
    <div className="text-slate-300 font-sans min-h-screen flex flex-col relative bg-[#020408] antialiased">
      
      {/* ASYMMETRIC MINIMAL NAVIGATION */}
      <nav className="fixed top-0 left-0 w-full z-50 bg-[#020408]/60 backdrop-blur-lg border-b border-white/[0.01]">
        <div className="max-w-7xl mx-auto px-10 h-28 flex items-center justify-between">
          <img src="/logo.png" alt="DECODE" className="h-6 w-auto mix-blend-difference cursor-pointer" onClick={() => setActiveView(null)} />
          
          <div className="hidden lg:flex items-center gap-10 font-medium text-[11px] tracking-[0.3em] uppercase">
            {['notes', 'jobs', 'network', 'quiz'].map((view) => (
              <button key={view} onClick={() => setActiveView(view)} className={`hover:text-amber-400 transition-colors ${activeView === view ? 'text-amber-500' : 'text-slate-400'}`}>
                {view}
              </button>
            ))}
            <button onClick={() => setActiveView('contribute')} className="text-slate-400 hover:text-white border-l border-white/10 pl-10">
              Recruiter Desk
            </button>
          </div>

          <button className="lg:hidden text-white" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeWidth="1.5" d="M4 8h16M4 16h16" /></svg>
          </button>
        </div>
      </nav>

      {/* MOBILE NAV LAYER */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-[999] bg-[#020408] flex flex-col p-12 justify-center space-y-8 animate-fade-in">
          <button onClick={() => setIsMenuOpen(false)} className="absolute top-10 right-10 text-white text-xl">✕</button>
          {['notes', 'jobs', 'network', 'quiz'].map((view) => (
            <button key={view} onClick={() => setActiveView(view) || setIsMenuOpen(false)} className="text-4xl font-serif text-left uppercase text-white hover:text-amber-400 transition-colors">
              {view}
            </button>
          ))}
        </div>
      )}

      {/* ASYMMETRIC PORTAL EDITORIAL SHEETS */}
      {!activeView && (
        <main className="flex-grow pt-28">
          <CinematicHero />

          {/* CHAPTER 1: INTEL ESSAY SECTION */}
          <section className="max-w-7xl mx-auto px-10 py-32 grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
            <div className="lg:col-span-4 sticky top-40 space-y-4">
              <span className="text-[10px] font-bold tracking-[0.4em] text-amber-500 uppercase block">Chapter 01</span>
              <h2 className="text-5xl font-serif font-light text-white leading-tight tracking-tight">The Strategy <br />Horizon</h2>
              <p className="text-sm text-slate-500 max-w-xs leading-relaxed font-medium">
                Real-time operational queries evaluated directly through current cross-border tracking frameworks.
              </p>
            </div>

            <div className="lg:col-span-8 space-y-16">
              <div className={`pb-12 border-b border-white/[0.04] transition-all duration-700 ${isChallengeLocked ? 'opacity-90' : ''}`}>
                <p className="text-lg md:text-xl text-slate-300 font-serif leading-relaxed font-light mb-8">
                  "A cross-border corporate payment originating from an offshore tech hub is flagged by your monitoring system. The beneficiary entity is clean on global sanctions watchlists. However, upon deep-dive routing analysis, you discover that the transaction utilizes a nested correspondent banking structure, and one of the listed downstream intermediary transit banks was placed under selective sectorial sanctions exactly 48 hours ago. The asset value sits under standard regulatory thresholds. What is the correct operational protocol?"
                </p>

                <div className="space-y-4 max-w-xl">
                  <button disabled={isChallengeLocked} onClick={() => setChallengeSelected('edd') || setIsChallengeLocked(true)} className="w-full text-left py-4 px-6 border border-white/10 text-xs font-semibold uppercase tracking-widest hover:border-amber-500 text-slate-300 hover:text-white transition-all rounded-lg">
                    [A] Freeze Asset & Escalate Regulatory SAR/STR
                  </button>
                  <button disabled={isChallengeLocked} onClick={() => setChallengeSelected('dismiss') || setIsChallengeLocked(true)} className="w-full text-left py-4 px-6 border border-white/10 text-xs font-semibold uppercase tracking-widest hover:border-amber-500 text-slate-300 hover:text-white transition-all rounded-lg">
                    [B] Process Transaction & Log Parameters Internally
                  </button>
                </div>

                {isChallengeLocked && (
                  <div className="mt-8 pt-8 border-t border-white/[0.03] text-sm text-slate-400 font-serif space-y-2 max-w-2xl">
                    <p className="text-[9px] uppercase tracking-[0.25em] text-amber-500 font-bold">Analysis Briefing</p>
                    <p className="italic leading-relaxed">
                      {challengeSelected === 'edd' 
                        ? "Verified Action: Sanctions validation demands zero threshold limits. Nested routes are heavily utilized to trick automated filters. Immediate containment is legal necessity."
                        : "Systemic Failure: Lack of intent or low asset footprint handles zero insulation criteria under strict liability enforcement guidelines."}
                    </p>
                  </div>
                )}
              </div>

              {/* PULSE SEGMENT MAP */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12 pt-4">
                {[{ city: 'Bengaluru Sector', rate: '+14% Core Placement Acceleration' }, { city: 'Kolkata Sector', rate: 'Executive Demand Alignment' }].map((pulse, i) => (
                  <div key={i} className="space-y-1">
                    <span className="text-[10px] uppercase font-bold tracking-widest text-slate-500 block">Regional Vector</span>
                    <h4 className="text-lg font-serif font-light text-white">{pulse.city}</h4>
                    <p className="text-xs text-slate-400 pt-1">{pulse.rate}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* CHAPTER 2: VOLUMETRIC BROADCAST STRIP */}
          <section className="w-full bg-white/[0.01] border-y border-white/[0.02] py-8 overflow-hidden">
            <div className="text-[11px] font-medium text-slate-500 uppercase tracking-[0.4em] flex gap-20 whitespace-nowrap animate-marquee">
              <span>• REVISIONS INDEXED REGARDING THE RBI MASTER STANDARDS DIRECTIONS</span>
              <span>• CROSS-BORDER RISK MATRICES ADAPTING UNDER 2026 AUDIT CHANNELS</span>
              <span>• SANCTIONS DEPLOYMENT TRACKS SCALE RAPIDLY ACROSS APAC REGIONS</span>
            </div>
          </section>

          {/* CHAPTER 3: INTERACTIVE PLATFORM FOCUS */}
          <section className="max-w-7xl mx-auto px-10 py-32 grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
            <div className="lg:col-span-5 space-y-6">
              <span className="text-[10px] font-bold tracking-[0.4em] text-amber-500 uppercase block">Chapter 02</span>
              <h2 className="text-5xl font-serif font-light text-white leading-tight tracking-tight">The Core <br />Mechanism</h2>
              <p className="text-slate-400 text-sm leading-relaxed font-medium">
                AML_DECODE strips away generic template blocks, translating complex institutional law into minimalist, high-yield learning frameworks engineered directly for global screening desks.
              </p>
              <div className="pt-4 flex gap-6 text-[11px] uppercase tracking-[0.25em]">
                <button onClick={() => setActiveView('notes')} className="text-amber-400 font-bold border-b border-amber-500 pb-1 hover:text-white hover:border-white transition-colors">Syllabus Index →</button>
                <button onClick={() => setActiveView('quiz')} className="text-slate-400 hover:text-white border-b border-transparent pb-1 hover:border-white transition-colors">Start Assessment</button>
              </div>
            </div>

            <div className="lg:col-span-7 flex justify-end">
              <div className="w-full max-w-md h-[400px] border border-white/5 rounded-2xl flex flex-col justify-center items-center bg-gradient-to-b from-white/[0.01] to-transparent relative p-8">
                <div className="h-16 w-16 border border-white/20 rounded-full flex items-center justify-center mb-4 text-slate-400">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" /></svg>
                </div>
                <span className="text-[9px] uppercase tracking-widest text-slate-600 font-semibold mb-1">Ecosystem Asset Sync</span>
                <p className="text-xs text-slate-400 text-center font-serif italic">Operational matrices rendering flawlessly inside canvas layout metrics.</p>
              </div>
            </div>
          </section>

          {/* CHAPTER 4: ASYMMETRIC CAREER INTAKE */}
          <section id="career-guidance" className="max-w-7xl mx-auto px-10 py-32 border-t border-white/[0.02] grid grid-cols-1 lg:grid-cols-12 gap-16">
            <div className="lg:col-span-4 space-y-4">
              <span className="text-[10px] font-bold tracking-[0.4em] text-amber-500 uppercase block">Chapter 03</span>
              <h2 className="text-5xl font-serif font-light text-white leading-tight tracking-tight">Personalized <br />Guidance</h2>
              <p className="text-sm text-slate-500 leading-relaxed font-medium">
                Strategic 1:1 intake tracks mapped individually to structure analyst profiles and lock in placements.
              </p>
              <button onClick={() => window.location.href = `mailto:alerts@amldecode.in?subject=Intake`} className="pt-4 text-xs font-bold uppercase tracking-widest text-white hover:text-amber-400 transition-colors block">
                Request Profile Opening &rarr;
              </button>
            </div>

            <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-8 font-serif text-slate-300 font-light text-base pl-0 md:pl-12">
              {["Resume Structural Rewrites", "Application Architecture Flow", "Interview Defense Engineering", "Specialized Risk Framework Verification"].map((module, idx) => (
                <div key={idx} className="pb-6 border-b border-white/[0.02] flex items-start gap-4">
                  <span className="text-amber-500 text-xs font-mono pt-1">0{idx + 1}</span>
                  <span className="tracking-tight text-white/90 font-sans font-medium text-sm uppercase tracking-wider">{module}</span>
                </div>
              ))}
            </div>
          </section>
        </main>
      )}

      {/* DETACHED DYNAMIC ABSTRACT CONTENT VIEWPORTS */}
      {activeView && (
        <main className="flex-grow pt-44 max-w-7xl mx-auto px-10 w-full pb-32 animate-fade-in">
          <button onClick={() => setActiveView(null) || setQuizScore(0)} className="text-xs font-medium tracking-[0.3em] text-amber-500 hover:text-white transition-colors uppercase mb-16 block">
            ← Escape Section
          </button>

          {/* VIEW: NOTES LIST */}
          {activeView === 'notes' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
              <div className="lg:col-span-4 flex flex-col gap-4 sticky top-44 max-h-[65vh] overflow-y-auto pr-4 custom-scrollbar">
                {notesContent.map((item, idx) => (
                  <button key={idx} onClick={() => setPageIndex(idx)} className={`text-left py-4 border-b transition-all uppercase tracking-wide text-xs ${pageIndex === idx ? 'border-amber-500 text-white font-bold' : 'border-white/5 text-slate-500 hover:text-slate-300'}`}>
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

          {/* VIEW: CORPORATE JOBS */}
          {activeView === 'jobs' && (
            <div className="space-y-16 max-w-4xl">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 pb-8 border-b border-white/[0.04]">
                <div>
                  <h1 className="text-4xl font-serif font-light text-white uppercase tracking-tight">Active Opportunities</h1>
                  <p className="text-xs text-slate-500 font-medium mt-1">Filter track coordinates to narrow search thresholds.</p>
                </div>
                <div className="flex flex-wrap gap-4 text-xs font-bold uppercase tracking-widest text-slate-500">
                  {['All', 'Bengaluru', 'Kolkata', 'Gurugram', 'Remote'].map((loc) => (
                    <button key={loc} onClick={() => setSelectedLocation(loc)} className={`hover:text-white transition-colors ${selectedLocation === loc ? 'text-amber-500 font-black' : ''}`}>
                      {loc}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-12">
                {jobOpenings
                  .filter(job => selectedLocation === 'All' || job.location === selectedLocation)
                  .map((job, idx) => (
                    <div key={idx} className="group flex flex-col md:flex-row justify-between items-start md:items-center gap-6 pb-8 border-b border-white/[0.02]">
                      <div className="space-y-1">
                        <span className="text-[10px] font-bold tracking-widest uppercase text-amber-500">{job.company}</span>
                        <h2 className="text-xl font-bold text-white group-hover:text-amber-400 transition-colors duration-300">{job.role}</h2>
                        <p className="text-xs text-slate-500 font-medium">{job.location} / Employment Node</p>
                      </div>
                      <a href={job.link} target="_blank" rel="noopener noreferrer" className="text-xs font-bold uppercase tracking-widest text-white border-b border-white pb-1 hover:text-amber-400 hover:border-amber-400 transition-all">
                        Apply Track &rarr;
                      </a>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* VIEW: EXAMS ASSESSMENTS */}
          {activeView === 'quiz' && (
            <div className="max-w-3xl">
              {!isTestStarted ? (
                <div className="space-y-10">
                  <div className="space-y-3">
                    <h2 className="text-4xl font-serif font-light text-white uppercase tracking-tight">Verification Systems</h2>
                    <p className="text-slate-400 text-sm leading-relaxed max-w-md font-medium">Select a technical matrix layer and register profile indicators to initialize verification testing loops.</p>
                  </div>
                  <div className="flex flex-wrap gap-4 text-xs font-bold uppercase tracking-widest text-slate-500">
                    {['KYC Basics', 'AML Advanced', 'Transaction Monitoring'].map((cat) => (
                      <button key={cat} onClick={() => setSelectedCategory(cat)} className={`hover:text-white transition-all ${selectedCategory === cat ? 'text-amber-400 font-black border-b border-amber-500 pb-1' : ''}`}>
                        {cat}
                      </button>
                    ))}
                  </div>
                  <div className="space-y-4 max-w-sm pt-4">
                    <input type="text" placeholder="Candidate Identifier" value={userName} onChange={(e) => setUserName(e.target.value)} className="w-full pb-2 bg-transparent border-b border-white/20 text-white font-medium outline-none focus:border-amber-500 uppercase tracking-widest text-sm" />
                    <button disabled={!userName.trim()} onClick={() => setIsTestStarted(true)} className="w-full py-4 bg-white text-black font-black text-xs uppercase tracking-widest hover:bg-amber-500 transition-colors">
                      Initialize Matrix Examination
                    </button>
                  </div>
                </div>
              ) : !isTestComplete ? (
                <div className="space-y-8 animate-slide-up">
                  <div className="text-xs font-bold text-slate-500 uppercase tracking-widest flex gap-8 pb-4 border-b border-white/[0.04]">
                    <span>Node Matrix: {currentQuestionIndex + 1} / {testData.length}</span>
                    <span className="text-amber-400">Score Tracker: {quizScore}</span>
                  </div>
                  
                  <div className="space-y-8">
                    <h3 className="text-2xl font-serif font-light text-white leading-snug">{testData[currentQuestionIndex]?.question}</h3>
                    <div className="space-y-4 max-w-xl">
                      {testData[currentQuestionIndex]?.options.map((opt, i) => (
                        <button key={i} disabled={!!selectedOption} onClick={() => setSelectedOption(opt) || (opt === testData[currentQuestionIndex].correct_answer && setQuizScore(prev => prev + 10))} className={`w-full text-left py-3 pl-4 border-l transition-all text-sm font-medium ${selectedOption === opt ? (opt === testData[currentQuestionIndex].correct_answer ? "border-amber-500 text-amber-400 font-bold" : "border-red-500 text-red-400") : "border-white/10 text-slate-400 hover:text-white hover:border-amber-500/50"}`}>
                          {opt}
                        </button>
                      ))}
                    </div>
                  </div>

                  {selectedOption && (
                    <button onClick={() => currentQuestionIndex < testData.length - 1 ? setCurrentQuestionIndex(prev => prev + 1) || setSelectedOption(null) : setIsTestComplete(true)} className="px-8 py-3.5 border border-white text-white font-bold text-xs uppercase tracking-widest hover:bg-white hover:text-black transition-all block ml-auto">
                      {currentQuestionIndex === testData.length - 1 ? "Complete Verification" : "Next Document Node →"}
                    </button>
                  )}
                </div>
              ) : (
                <div className="space-y-6 animate-fade-in text-center md:text-left">
                  <h2 className="text-4xl font-serif font-light text-white uppercase tracking-tight">Verification Logged</h2>
                  <p className="text-slate-400 text-sm font-medium">Candidate: <span className="text-white font-bold">{userName}</span> // Metrics Profile Score: <span className="text-amber-400 font-bold">{quizScore}</span></p>
                  <button onClick={() => setIsTestStarted(false) || setIsTestComplete(false) || setCurrentQuestionIndex(0) || setQuizScore(0) || setUserName("")} className="px-8 py-3.5 border border-white text-white font-bold text-xs uppercase tracking-widest hover:bg-white hover:text-black transition-all">
                    Reset Verification Desktop
                  </button>
                </div>
              )}
            </div>
          )}

          {/* VIEW: REFERRAL FORMS */}
          {activeView === 'referralForm' && (
            <div className="max-w-2xl">
              <h1 className="text-3xl font-serif font-light text-white uppercase tracking-tight pb-6 border-b border-white/[0.04] mb-10">Referral Network Insertion</h1>
              <form className="space-y-8 text-xs font-bold uppercase tracking-widest text-slate-500" onSubmit={async (e) => { e.preventDefault(); await supabase.from('submissions').insert([{ name: e.target[0].value, email: e.target[1].value, company: e.target[2].value, role: e.target[3].value }]); alert("Parameters inserted."); setActiveView('jobs'); }}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  {["Candidate Profile Name", "Routing Access Email", "Target Corporate Entity", "Designated Role Placement"].map((ph, i) => (
                    <div key={i} className="space-y-2 border-b border-white/10 pb-2 focus-within:border-amber-500 transition-colors">
                      <label className="tracking-widest block">{ph}</label>
                      <input required className="w-full bg-transparent text-white pt-2 font-medium normal-case outline-none text-sm tracking-normal" placeholder="Input string parameter" />
                    </div>
                  ))}
                </div>
                <button type="submit" className="px-10 py-4 bg-white text-black font-black uppercase tracking-widest text-xs hover:bg-amber-500 transition-colors">Execute Insertion Sequence</button>
              </form>
            </div>
          )}

          {activeView === 'available' && (
            <div className="space-y-12 max-w-4xl">
              <h1 className="text-4xl font-serif font-light text-white uppercase tracking-tight pb-6 border-b border-white/[0.04]">Available Pipelines</h1>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                {submissions.map((sub, i) => (
                  <div key={i} className="space-y-4 pb-6 border-b border-white/[0.02]">
                    <div>
                      <span className="text-[10px] font-bold tracking-widest text-amber-500 uppercase block mb-1">{sub.company || 'Corporate Desk'}</span>
                      <h3 className="text-xl font-bold text-white tracking-tight">{sub.role || 'Compliance Analyst'}</h3>
                      <p className="text-xs text-slate-500 font-medium pt-1">Sourced via: {sub.name}</p>
                    </div>
                    <a href={`mailto:${sub.email}?subject=Referral`} className="inline-block text-xs font-bold uppercase tracking-widest text-white border-b border-white pb-0.5 hover:text-amber-400 hover:border-amber-400 transition-all">
                      Initiate Direct Contact Loop &rarr;
                    </a>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeView === 'contribute' && (
            <div className="max-w-md">
              {!isAuthorized ? (
                <div className="space-y-6">
                  <h2 className="text-3xl font-serif font-light text-white uppercase tracking-tight">Access Log Verification</h2>
                  <div className="space-y-4">
                    <input type="email" placeholder="Verification Email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full pb-2 bg-transparent border-b border-white/20 text-white outline-none text-sm font-medium focus:border-amber-500 transition-colors" />
                    <input type="password" placeholder="Verification Passkey" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full pb-2 bg-transparent border-b border-white/20 text-white outline-none text-sm font-medium focus:border-amber-500 transition-colors" />
                    <button onClick={async () => { const { error } = await supabase.auth.signInWithPassword({ email, password }); if (!error) setIsAuthorized(true); else alert("Identity failure."); }} className="w-full py-4 bg-white text-black font-black uppercase tracking-widest text-xs hover:bg-amber-500 transition-colors">Request Clearing Identity</button>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  <h3 className="text-3xl font-serif font-light text-white uppercase tracking-tight">Deploy Document Nodes</h3>
                  <input type="email" placeholder="Deployment Desk Tracker" value={recruiterEmail} onChange={(e) => setRecruiterEmail(e.target.value)} className="w-full pb-2 bg-transparent border-b border-white/20 text-white outline-none text-sm focus:border-amber-500 transition-colors" />
                  <input type="file" className="block w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:border file:border-white/10 file:bg-transparent file:text-white file:text-[10px] file:font-bold file:uppercase file:tracking-widest hover:file:border-amber-500 file:transition-colors" onChange={(e) => setSelectedFile(e.target.files[0])} />
                  <button disabled={!selectedFile || !recruiterEmail} onClick={async () => { const path = `uploads/${Math.random()}.${selectedFile.name.split('.').pop()}`; await supabase.storage.from('intelligence').upload(path, selectedFile); const { data: { publicUrl } } = supabase.storage.from('intelligence').getPublicUrl(path); await supabase.from('partner_files').insert([{ name: selectedFile.name, url: publicUrl, recruiter_email: recruiterEmail }]); alert("Node finalized."); setActiveView('network'); }} className="w-full py-4 bg-white text-black font-black uppercase tracking-widest text-xs hover:bg-amber-500 transition-all">Publish Stream Document</button>
                </div>
              )}
            </div>
          )}

          {activeView === 'network' && (
            <div className="space-y-12 max-w-4xl">
              <h1 className="text-4xl font-serif font-light text-white uppercase tracking-tight pb-6 border-b border-white/[0.04]">Partner Placement Registries</h1>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                {partnerFiles.map((f, i) => (
                  <div key={i} className="space-y-4 pb-6 border-b border-white/[0.02]">
                    <div>
                      <span className="text-[9px] text-slate-500 block font-bold tracking-widest uppercase mb-1">Index_Reference_Node_0{i+1}</span>
                      <h3 className="text-xl font-bold text-white tracking-tight">{f.name}</h3>
                      <p className="text-xs text-amber-500 font-medium font-serif italic mt-1">Desk Auth: {f.recruiter_email}</p>
                    </div>
                    <button onClick={() => window.open(f.url, '_blank')} className="text-xs font-bold uppercase tracking-widest text-white border-b border-white pb-0.5 hover:text-amber-400 hover:border-amber-400 transition-all">Download Reference File &rarr;</button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* STATIC FOOTER SUBPAGES EXECUTIONS */}
          {['privacy', 'terms', 'faq', 'contact'].includes(activeView) && (
            <div className="max-w-2xl leading-relaxed text-slate-400 font-serif font-light text-base whitespace-pre-wrap space-y-8 animate-fade-in">
              {activeView === 'privacy' && privacyPolicy.body}
              {activeView === 'terms' && termsOfService.body}
              {activeView === 'contact' && contactContent.body}
              {activeView === 'faq' && faqData.map((item, i) => (
                <div key={i} className="pb-8 border-b border-white/[0.02]">
                  <h4 className="font-sans font-medium text-white mb-2 uppercase tracking-wider text-sm">{item.question}</h4>
                  <p className="text-slate-400 italic pt-1">{item.answer}</p>
                </div>
              ))}
            </div>
          )}
        </main>
      )}

      {/* RESTRAINED EDITORIAL DESIGN ACADEMY FOOTER MAP */}
      <footer className="bg-transparent border-t border-white/[0.02] pt-24 pb-12 mt-auto">
        <div className="max-w-7xl mx-auto px-10 grid grid-cols-1 md:grid-cols-12 gap-16 mb-16">
          <div className="md:col-span-6 space-y-4">
            <img src="/logo.png" alt="AML_DECODE" className="h-5 w-auto mix-blend-difference" />
            <p className="text-xs leading-relaxed text-slate-500 max-w-xs font-medium">
              An avant-garde platform stripping away generic UI frameworks to map out advanced systemic compliance tracks and case insights.
            </p>
          </div>
          <div className="md:col-span-3 space-y-3 text-[10px] font-bold uppercase tracking-[0.25em]">
            <p className="text-amber-500">Directory Mapping</p>
            <button onClick={() => setActiveView('faq')} className="block text-slate-400 hover:text-white transition-colors">FAQ</button>
            <button onClick={() => setActiveView('contact')} className="block text-slate-400 hover:text-white transition-colors">Contact</button>
            <button onClick={() => setActiveView('notes')} className="block text-slate-400 hover:text-white transition-colors">Notes Index</button>
          </div>
          <div className="md:col-span-3 space-y-3 text-[10px] font-bold uppercase tracking-[0.25em]">
            <p className="text-amber-500">Legal Protection</p>
            <button onClick={() => setActiveView('privacy')} className="block text-slate-400 hover:text-white transition-colors">Privacy Policy</button>
            <button onClick={() => setActiveView('terms')} className="block text-slate-400 hover:text-white transition-colors">Terms of Service</button>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-10 pt-8 border-t border-white/[0.01] flex justify-between items-center text-[9px] font-bold text-slate-600 uppercase tracking-[0.3em]">
          <span>© 2026 AML_DECODE</span>
          <span>Design by Nitesh</span>
        </div>
      </footer>

      <SubscribeModal />
    </div>
  );
}