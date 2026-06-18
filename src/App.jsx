import React, { useState, useEffect, useRef } from 'react';
import { supabase } from './supabaseClient';
import { notesContent, privacyPolicy, termsOfService, faqData, contactContent } from './content';
import { jobOpenings } from './jobs';
import { kycNews } from './news';
import CinematicHero from './CinematicHero';

// ==========================================
// 1. THE EDITORIAL ASSESSMENT SYSTEM COMPONENT
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
    <div className="py-10 space-y-6 border-b border-white/[0.04] animate-slide-up">
      <h3 className="text-2xl font-serif font-light text-white leading-relaxed max-w-2xl">
        {item.question}
      </h3>
      
      <div className="space-y-3 max-w-xl">
        {(() => {
          try {
            const options = typeof item.options === 'string' ? JSON.parse(item.options) : item.options;
            return options.map((opt, i) => {
              let selectionStyle = "text-slate-400 hover:text-white pl-4 border-l border-transparent hover:border-amber-500/40";
              
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
          } catch { return <p className="text-red-500">Format Execution Interrupted</p>; }
        })()}
      </div>

      {isLocked && (
        <div className="pt-2 max-w-xl animate-fade-in space-y-1">
          <p className="text-[9px] uppercase tracking-[0.25em] text-amber-500 font-bold">Case Review Context</p>
          <p className="text-sm text-slate-400 leading-relaxed font-serif italic">
            {item.explanation || "Case verified against current regional institutional compliance benchmarks."}
          </p>
        </div>
      )}
    </div>
  );
}

// ==========================================
// 2. THE PREMIUM ACADEMY SUBSCRIPTION MODAL
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
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-[#020408]/95 backdrop-blur-md p-6 animate-fade-in">
      <div className="max-w-md w-full space-y-8">
        <button onClick={() => setIsOpen(false)} className="text-slate-500 hover:text-white transition-colors block ml-auto text-[10px] tracking-[0.25em] uppercase font-bold">Dismiss ✕</button>
        <div className="space-y-2">
          <h2 className="text-4xl font-serif font-light text-white tracking-tight uppercase">Join the Registry</h2>
          <p className="text-slate-400 text-sm leading-relaxed font-medium">
            Enroll your credentials to unlock daily compliance placement vectors and active system updates.
          </p>
        </div>
        <form onSubmit={async (e) => {
          e.preventDefault();
          const { error } = await supabase.from('subscribers').insert([{ email }]);
          if (!error) { 
            alert("Enrollment finalized."); 
            setIsOpen(false); 
          } else { 
            alert(error.code === '23505' ? "Trace indicators already exist." : "Registry connection failure."); 
          }
        }} className="space-y-6">
          <input 
            type="email" 
            required 
            placeholder="Institutional Email Address" 
            className="w-full pb-2 bg-transparent border-b border-white/20 text-white outline-none focus:border-amber-500 transition-colors text-lg"
            onChange={(e) => setEmail(e.target.value)}
          />
          <button type="submit" className="w-full py-4 border border-white text-white hover:bg-white hover:text-black text-xs font-bold uppercase tracking-[0.25em] transition-all">
            Secure System Enrollment
          </button>
        </form>
      </div>
    </div>
  );
}

// ==========================================
// 3. MAIN PORTAL ARCHITECTURE CONTAINER
// ==========================================
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
  const [isTestStarted, setIsTestStarted] = useState(false);
  const [isTestComplete, setIsTestComplete] = useState(false);
  const contentRef = useRef(null);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const { data: subs } = await supabase.from('submissions').select('*');
        const { data: files } = await supabase.from('partner_files').select('*');
        const { data: news } = await supabase.from('news').select('*');
        const { data: quiz } = await supabase.from('quiz_questions').select('*').eq('category', selectedCategory);
        
        if (subs) setSubmissions(subs);
        if (files) setPartnerFiles(files);
        setNewsList(news && news.length > 0 ? news : kycNews);
        if (quiz) setTestData(quiz);
      } catch (err) {
        console.error("Data pipeline link broken:", err);
      }
      setIsLoading(false);
    };
    fetchData();
  }, [selectedCategory]);

  return (
    <div className="text-slate-300 font-sans min-h-screen bg-[#020408] antialiased select-none">
      
      {/* TWO-COLUMN CINEMATIC CANVAS LAYOUT */}
      <div className="grid grid-cols-1 lg:grid-cols-12 min-h-screen w-full items-stretch">
        
        {/* ================== LEFT SCREEN: ANCHORED STAGE INTERFACE ================== */}
        <div className="lg:col-span-5 bg-gradient-to-b from-[#03050c] to-[#020408] p-12 lg:p-20 flex flex-col justify-between sticky top-0 h-auto lg:h-screen z-40 border-b lg:border-b-0 lg:border-r border-white/[0.02]">
          
          {/* Logo & Category Headers */}
          <div className="space-y-1">
            <img 
              src="/logo.png" 
              alt="DECODE" 
              className="h-5 w-auto cursor-pointer object-contain filter brightness-105" 
              onClick={() => setActiveView(null)} 
            />
            <p className="text-[9px] uppercase tracking-[0.35em] text-slate-500 font-semibold pt-2">Financial Crime Academy</p>
          </div>

          {/* Minimal Navigation System Menu Links */}
          <div className="py-14 lg:py-0 space-y-5 text-left">
            {[
              { label: 'Syllabus Intelligence', id: 'notes' },
              { label: 'Active Opportunities', id: 'jobs' },
              { label: 'Executive Pipelines', id: 'network' },
              { label: 'System Assessments', id: 'quiz' }
            ].map((nav) => (
              <button 
                key={nav.id} 
                onClick={() => setActiveView(nav.id)}
                className={`block text-2xl font-serif tracking-tight uppercase transition-all duration-300 ${activeView === nav.id ? 'text-amber-500 pl-4 border-l border-amber-500 font-medium' : 'text-slate-400 hover:text-white'}`}
              >
                {nav.label}
              </button>
            ))}
            
            <div className="pt-8 border-t border-white/[0.04] flex flex-wrap gap-6 text-[10px] tracking-widest text-slate-500 uppercase font-semibold">
              <button onClick={() => setActiveView('referralForm')} className="hover:text-white transition-colors">Submit Referral</button>
              <button onClick={() => setActiveView('available')} className="hover:text-white transition-colors">Available Referrals</button>
              <button onClick={() => setActiveView('contribute')} className="hover:text-amber-400 transition-colors border-l border-white/10 pl-6">Recruiter Desk</button>
            </div>
          </div>

          {/* Operational Metrics Sub-Bar */}
          <div className="space-y-4">
            <div className="flex gap-12 text-[10px] uppercase tracking-[0.25em] text-slate-600 font-bold">
              <div>
                <span className="block font-serif text-xl font-light mb-0.5 text-white">{submissions.length}</span>
                Peer Matrix Links
              </div>
              <div>
                <span className="block font-serif text-xl font-light mb-0.5 text-white">{partnerFiles.length}</span>
                Active Files
              </div>
            </div>
            <p className="text-[9px] tracking-[0.3em] text-slate-600 uppercase border-t border-white/[0.04] pt-4">AML_DECODE_THEATER // SYSTEM_v.2026</p>
          </div>

        </div>

        {/* ================== RIGHT SCREEN: INDEPENDENT CONTENT STREAM ================== */}
        <div className="lg:col-span-7 bg-[#020408] min-h-screen relative flex flex-col">
          
          {/* DEFAULT SUBSECTION CARDS FILM STRIP PANEL */}
          {!activeView ? (
            <div className="flex-grow p-12 lg:p-24 space-y-40">
              
              <CinematicHero />

              {/* STREAM LAYOUT ITEM 1: INTEL ESSAY SECTION */}
              <div className="space-y-8 animate-slide-up">
                <span className="text-[10px] font-bold tracking-[0.4em] text-amber-500 uppercase block">Stream Case 01 // Strategy Profile</span>
                <p className="text-xl md:text-2xl font-serif font-light leading-relaxed text-white max-w-2xl">
                  "A cross-border corporate payment originating from an offshore tech hub is flagged by your monitoring system. The beneficiary entity is clean on global sanctions watchlists. However, upon deep-dive routing analysis, you discover that the transaction utilizes a nested correspondent banking structure, and one of the listed downstream intermediary transit banks was placed under selective sectorial sanctions exactly 48 hours ago. The asset value sits under standard regulatory reporting thresholds. What is the correct protocol?"
                </p>

                <div className="space-y-3 max-w-xl">
                  <button disabled={isChallengeLocked} onClick={() => setChallengeSelected('edd') || setIsChallengeLocked(true)} className="w-full text-left py-4 px-6 border border-white/10 text-xs font-semibold uppercase tracking-widest hover:border-amber-500 transition-all rounded-lg text-slate-300 hover:text-white">
                    [A] Freeze Asset & Escalate Regulatory SAR/STR
                  </button>
                  <button disabled={isChallengeLocked} onClick={() => setChallengeSelected('dismiss') || setIsChallengeLocked(true)} className="w-full text-left py-4 px-6 border border-white/10 text-xs font-semibold uppercase tracking-widest hover:border-amber-500 transition-all rounded-lg text-slate-300 hover:text-white">
                    [B] Process Transaction & Log Parameters Internally
                  </button>
                </div>

                {isChallengeLocked && (
                  <div className="pt-6 border-t border-white/[0.04] max-w-xl animate-fade-in text-sm font-serif italic text-slate-400 space-y-1">
                    <p className="text-[9px] uppercase tracking-[0.2em] text-amber-500 font-bold">Operational Briefing</p>
                    <p>
                      {challengeSelected === 'edd' 
                        ? "CORRECT STRATEGY: In sanctions compliance, asset sizes carry zero reporting insulation parameters. Nested banking path routing channels are heavily optimized to trick automated filtering systems."
                        : "COMPLIANCE BREACH: Lack of programmatic intent or minimal transaction footprints carry zero protective legal safe-harbors under strict liability enforcement."}
                    </p>
                  </div>
                )}
              </div>

              {/* STREAM LAYOUT ITEM 2: HIGHLIGHT ACADEMY CONTEXT */}
              <div className="space-y-6 max-w-xl pt-16 border-t border-white/[0.04] animate-slide-up">
                <span className="text-[10px] font-bold tracking-[0.4em] text-slate-500 uppercase block">Stream Case 02 // Methodology</span>
                <h2 className="text-4xl font-serif font-light text-white uppercase tracking-tight">The Core System</h2>
                <p className="text-slate-400 text-sm leading-relaxed font-medium">
                  We filter out template documentation clutter, restructuring intensive regulatory directives and regional mandates into structured asymmetric lookbooks for corporate compliance placement tracks.
                </p>
                <div className="pt-2 flex gap-6 text-[11px] font-bold uppercase tracking-widest">
                  <button onClick={() => setActiveView('notes')} className="text-amber-400 border-b border-amber-500 pb-0.5">Explore Knowledge Base &rarr;</button>
                  <button onClick={() => setActiveView('quiz')} className="text-slate-500 hover:text-white transition-colors">Launch Exam Desk</button>
                </div>
              </div>

              {/* STREAM LAYOUT ITEM 3: ANCHOR MARKET VECTORS */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12 pt-16 border-t border-white/[0.04] animate-slide-up">
                {[{ area: 'Bengaluru Sector', status: '+14% Core Placement Drift' }, { area: 'Kolkata Sector', status: 'Executive Sourcing Alignment' }].map((pulse, i) => (
                  <div key={i} className="space-y-1">
                    <span className="text-[9px] uppercase font-bold tracking-widest text-slate-500">{pulse.area}</span>
                    <h4 className="text-lg font-serif font-light text-white">{pulse.status}</h4>
                  </div>
                ))}
              </div>

            </div>
          ) : (
            
            // ACTIVE INDEPENDENT SCREEN INTERFACES FOR INNER MODULE VIEWS
            <div className="flex-grow p-12 lg:p-24 w-full animate-fade-in">
              <button 
                onClick={() => setActiveView(null) || setQuizScore(0) || setCurrentQuestionIndex(0) || setIsTestStarted(false) || setIsTestComplete(false) || setUserName("") || setSelectedOption(null)} 
                className="text-[10px] font-bold tracking-[0.3em] text-amber-500 hover:text-white transition-colors uppercase mb-16 block"
              >
                ✕ Close Stream Frame
              </button>

              {/* INTERFACE ACTION: NOTES SYLLABUS DIRECTORY */}
              {activeView === 'notes' && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
                  <div className="lg:col-span-4 flex flex-col gap-4 sticky top-12 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
                    {notesContent.map((item, idx) => (
                      <button key={idx} onClick={() => setPageIndex(idx)} className={`text-left py-3.5 border-b uppercase text-xs tracking-wider transition-colors ${pageIndex === idx ? 'border-amber-500 text-white font-bold' : 'border-white/[0.04] text-slate-500 hover:text-slate-300'}`}>
                        {item.title}
                      </button>
                    ))}
                  </div>
                  <div className="lg:col-span-8 space-y-6">
                    <h1 className="text-3xl font-serif font-light text-white uppercase tracking-tight pb-4 border-b border-white/[0.04] font-medium">{notesContent[pageIndex]?.title}</h1>
                    <p className="text-slate-300 font-serif font-light text-base leading-relaxed whitespace-pre-wrap pt-4">
                      {notesContent[pageIndex]?.body}
                    </p>
                  </div>
                </div>
              )}

              {/* INTERFACE ACTION: CORPORATE PLACEMENTS DIRECTORY */}
              {activeView === 'jobs' && (
                <div className="space-y-16 max-w-2xl">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6 pb-6 border-b border-white/[0.04]">
                    <h1 className="text-3xl font-serif font-light text-white uppercase tracking-tight">Placement Feeds</h1>
                    <div className="flex gap-4 text-[11px] font-bold uppercase tracking-widest text-slate-500">
                      {['All', 'Bengaluru', 'Kolkata', 'Gurugram', 'Remote'].map((loc) => (
                        <button key={loc} onClick={() => setSelectedLocation(loc)} className={`hover:text-white transition-colors ${selectedLocation === loc ? 'text-amber-500 font-black' : ''}`}>{loc}</button>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-12">
                    {jobOpenings.filter(j => selectedLocation === 'All' || j.location === selectedLocation).map((job, idx) => (
                      <div key={idx} className="group flex justify-between items-start sm:items-center gap-6 pb-6 border-b border-white/[0.02]">
                        <div className="space-y-1">
                          <span className="text-[9px] font-bold text-amber-500 tracking-widest uppercase">{job.company}</span>
                          <h3 className="text-xl font-bold text-white group-hover:text-amber-400 transition-colors duration-300">{job.role}</h3>
                          <p className="text-xs text-slate-500 font-medium">{job.location} // Open Profile</p>
                        </div>
                        <a href={job.link} target="_blank" rel="noopener noreferrer" className="text-xs font-bold uppercase tracking-widest text-white border-b border-white pb-0.5 hover:text-amber-400 hover:border-amber-400 transition-colors shrink-0">Apply &rarr;</a>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* INTERFACE ACTION: GENERAL EXAMINATION SYSTEMS */}
              {activeView === 'quiz' && (
                <div className="max-w-xl space-y-10">
                  {!isTestStarted ? (
                    <div className="space-y-8">
                      <div className="space-y-2">
                        <h2 className="text-3xl font-serif font-light text-white uppercase tracking-tight">Assessment Logs</h2>
                        <p className="text-slate-400 text-sm leading-relaxed max-w-sm font-medium">Select a primary assessment sector and register target naming parameters to trigger questions.</p>
                      </div>
                      <div className="flex flex-wrap gap-5 text-xs font-bold uppercase text-slate-500 tracking-wider border-b border-white/[0.04] pb-2">
                        {['KYC Basics', 'AML Advanced', 'Transaction Monitoring'].map((cat) => (
                          <button key={cat} onClick={() => setSelectedCategory(cat)} className={`hover:text-white transition-all ${selectedCategory === cat ? 'text-amber-400 font-black border-b border-amber-500 pb-1' : ''}`}>{cat}</button>
                        ))}
                      </div>
                      <div className="space-y-5 max-w-sm pt-2">
                        <input type="text" placeholder="ENTER ASSESSMENT IDENTIFIER" value={userName} onChange={(e) => setUserName(e.target.value)} className="w-full pb-2 bg-transparent border-b border-white/20 text-white text-sm outline-none focus:border-amber-500 tracking-widest font-bold uppercase" />
                        <button disabled={!userName.trim()} onClick={() => setIsTestStarted(true)} className="w-full py-4 border border-white text-white font-bold text-xs uppercase tracking-widest hover:bg-white hover:text-black transition-all">Launch System Examination</button>
                      </div>
                    </div>
                  ) : !isTestComplete ? (
                    <div className="space-y-8 animate-slide-up">
                      <div className="text-xs font-bold text-slate-500 uppercase tracking-widest flex gap-8 pb-4 border-b border-white/[0.04]">
                        <span>Node Index: {currentQuestionIndex + 1} / {testData.length}</span>
                        <span className="text-amber-400">Accrued Score: {quizScore}</span>
                      </div>
                      
                      {testData.length > 0 ? (
                        <QuizItem item={testData[currentQuestionIndex]} onCorrect={() => setQuizScore(prev => prev + 10)} />
                      ) : (
                        <p className="text-sm italic text-slate-500">No question modules synchronized for this target sector context block.</p>
                      )}

                      {currentQuestionIndex < testData.length && (
                        <button 
                          onClick={() => {
                            if (currentQuestionIndex < testData.length - 1) {
                              setCurrentQuestionIndex(prev => prev + 1);
                            } else {
                              setIsTestComplete(true);
                            }
                          }} 
                          className="px-8 py-3.5 border border-white text-white font-bold text-xs uppercase tracking-widest block ml-auto hover:bg-white hover:text-black transition-colors"
                        >
                          {currentQuestionIndex === testData.length - 1 ? "Complete Verification" : "Advance Document Node →"}
                        </button>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-6 animate-fade-in">
                      <h2 className="text-3xl font-serif font-light text-white uppercase tracking-tight">Verification Profile Finalized</h2>
                      <p className="text-sm text-slate-400 font-medium">Candidate Track: <span className="text-white font-bold">{userName}</span> // Score Profile: <span className="text-amber-400 font-bold">{quizScore} Units</span></p>
                      <button onClick={() => setIsTestStarted(false) || setIsTestComplete(false) || setCurrentQuestionIndex(0) || setQuizScore(0) || setUserName("")} className="px-7 py-3 border border-white text-white font-bold text-xs uppercase tracking-widest hover:bg-white hover:text-black transition-colors">Reset Verification Desktop</button>
                    </div>
                  )}
                </div>
              )}

              {/* INTERFACE ACTION: REFERRAL DATA CAPTURE REGISTRY */}
              {activeView === 'referralForm' && (
                <div className="max-w-xl animate-slide-up">
                  <h1 className="text-3xl font-serif font-light text-white uppercase tracking-tight pb-4 border-b border-white/5 mb-8">Referral Stream Insertion</h1>
                  <form className="space-y-8 text-xs font-bold uppercase tracking-widest text-slate-500" onSubmit={async (e) => { e.preventDefault(); await supabase.from('submissions').insert([{ name: e.target[0].value, email: e.target[1].value, company: e.target[2].value, role: e.target[3].value }]); alert("Parameters cataloged into peer stream."); setActiveView('jobs'); }}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                      {["Candidate Profile Name", "Routing Contact Email", "Target Corporate Entity", "Designated Operational Role"].map((ph, i) => (
                        <div key={i} className="space-y-2 border-b border-white/10 pb-2 focus-within:border-amber-500 transition-colors">
                          <label className="tracking-widest block font-bold">{ph}</label>
                          <input required className="w-full bg-transparent text-white pt-2 font-medium normal-case outline-none text-sm tracking-normal" placeholder="Input string parameters" />
                        </div>
                      ))}
                    </div>
                    <button type="submit" className="px-8 py-4 border border-white text-white font-bold text-xs uppercase tracking-widest hover:bg-white hover:text-black transition-colors">Execute Insertion Sequence</button>
                  </form>
                </div>
              )}

              {/* INTERFACE ACTION: AVAILABLE PEER COMMUNICATOR PIPELINES */}
              {activeView === 'available' && (
                <div className="space-y-8 max-w-2xl">
                  <h1 className="text-3xl font-serif font-light text-white uppercase tracking-tight pb-4 border-b border-white/5">Available Pipelines</h1>
                  <div className="space-y-6">
                    {submissions.map((sub, i) => (
                      <div key={i} className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b border-white/[0.04]">
                        <div>
                          <span className="text-[10px] font-bold text-amber-500 tracking-widest uppercase block mb-0.5">{sub.company || 'Corporate Desk'}</span>
                          <h3 className="text-lg font-bold text-white tracking-tight">{sub.role || 'Compliance Specialist'}</h3>
                          <p className="text-xs text-slate-500 font-medium">Shared profile reference by: {sub.name}</p>
                        </div>
                        <a href={`mailto:${sub.email}?subject=Referral%20Intake`} className="text-xs font-bold uppercase tracking-widest text-white border-b border-white pb-0.5 hover:text-amber-400 hover:border-amber-400 transition-all shrink-0">Contact Pipeline &rarr;</a>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* INTERFACE ACTION: RECRUITER CLEARANCE ENTRY PANEL */}
              {activeView === 'contribute' && (
                <div className="max-w-sm">
                  {!isAuthorized ? (
                    <div className="space-y-6">
                      <h2 className="text-2xl font-serif font-light text-white uppercase tracking-tight">Desk Authentication</h2>
                      <div className="space-y-5">
                        <input type="email" placeholder="Verification Email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full pb-2 bg-transparent border-b border-white/20 text-white outline-none text-sm font-medium focus:border-amber-500 transition-colors" />
                        <input type="password" placeholder="Verification Passkey" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full pb-2 bg-transparent border-b border-white/20 text-white outline-none text-sm font-medium focus:border-amber-500 transition-colors" />
                        <button onClick={async () => { const { error } = await supabase.auth.signInWithPassword({ email, password }); if (!error) setIsAuthorized(true); else alert("Identity verification denied."); }} className="w-full py-4 bg-white text-black font-black uppercase tracking-widest text-xs hover:bg-amber-500 transition-colors">Verify Gate Identity</button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      <h3 className="text-2xl font-serif font-light text-white uppercase tracking-tight">Deploy Document Nodes</h3>
                      <input type="email" placeholder="Deployment Recruiter Email" value={recruiterEmail} onChange={(e) => setRecruiterEmail(e.target.value)} className="w-full pb-2 bg-transparent border-b border-white/20 text-white outline-none text-sm focus:border-amber-500 transition-colors" />
                      <input type="file" className="block w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:border file:border-white/10 file:bg-transparent file:text-white file:text-[10px] file:font-bold file:uppercase file:tracking-widest hover:file:border-amber-500 file:transition-colors" onChange={(e) => setSelectedFile(e.target.files[0])} />
                      <button disabled={!selectedFile || !recruiterEmail} onClick={async () => { const path = `uploads/${Math.random()}.${selectedFile.name.split('.').pop()}`; await supabase.storage.from('intelligence').upload(path, selectedFile); const { data: { publicUrl } } = supabase.storage.from('intelligence').getPublicUrl(path); await supabase.from('partner_files').insert([{ name: selectedFile.name, url: publicUrl, recruiter_email: recruiterEmail }]); alert("Reference file synchronised."); setActiveView('network'); }} className="w-full py-4 bg-white text-black font-black uppercase tracking-widest text-xs hover:bg-amber-500 transition-all">Publish Reference Node</button>
                    </div>
                  )}
                </div>
              )}

              {/* INTERFACE ACTION: RECRUITER UPLOADS LIST VIEW */}
              {activeView === 'network' && (
                <div className="space-y-8 max-w-2xl">
                  <h1 className="text-4xl font-serif font-light text-white uppercase tracking-tight pb-4 border-b border-white/5">Placement Registries</h1>
                  <div className="space-y-6">
                    {partnerFiles.map((f, i) => (
                      <div key={i} className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-white/5">
                        <div>
                          <span className="text-[8px] text-slate-500 font-bold block mb-0.5">REFERENCE_ID_0{i+1}</span>
                          <h3 className="text-xl font-bold text-white tracking-tight">{f.name}</h3>
                          <p className="text-xs text-amber-500 font-serif italic mt-0.5">Desk Coordinator: {f.recruiter_email}</p>
                        </div>
                        <button onClick={() => window.open(f.url, '_blank')} className="text-xs font-bold uppercase tracking-widest text-white border-b border-white pb-0.5 hover:text-amber-400 hover:border-amber-400 transition-colors shrink-0">Download Document Intel &rarr;</button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* SYSTEM TERMINAL INTERNAL STATICS PACK (Privacy, Terms, FAQ) */}
              {['privacy', 'terms', 'faq', 'contact'].includes(activeView) && (
                <div className="max-w-xl leading-relaxed text-slate-400 font-serif font-light text-base whitespace-pre-wrap space-y-6">
                  {activeView === 'privacy' && privacyPolicy.body}
                  {activeView === 'terms' && termsOfService.body}
                  {activeView === 'contact' && contactContent.body}
                  {activeView === 'faq' && faqData.map((item, i) => (
                    <div key={i} className="pb-6 border-b border-white/5">
                      <h4 className="font-sans font-medium text-white mb-1 uppercase tracking-wider text-sm">{item.question}</h4>
                      <p className="text-slate-400 italic pt-1 font-serif">{item.answer}</p>
                    </div>
                  ))}
                </div>
              )}

            </div>
          )}

          {/* INDEPENDENT FOOTER ACTION OVERLAYS */}
          <footer className="mt-auto p-12 lg:p-24 border-t border-white/[0.03] flex flex-wrap justify-between items-center gap-6 text-[10px] uppercase tracking-widest text-slate-600 font-bold">
            <div className="flex gap-6">
              <button onClick={() => setActiveView('faq')} className="hover:text-white transition-colors">FAQ</button>
              <button onClick={() => setActiveView('privacy')} className="hover:text-white transition-colors">Privacy</button>
              <button onClick={() => setActiveView('terms')} className="hover:text-white transition-colors">Terms</button>
              <button onClick={() => setActiveView('contact')} className="hover:text-white transition-colors">Contact</button>
            </div>
            <span>© 2026 AML_DECODE // Nitesh Mishra</span>
          </footer>

        </div>

      </div>
      <SubscribeModal />
    </div>
  );
}