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
    <div className="py-8 space-y-4 border-b border-white/5">
      <h3 className="text-xl font-serif font-light text-white leading-relaxed">{item.question}</h3>
      <div className="space-y-2 max-w-xl">
        {(() => {
          try {
            const options = typeof item.options === 'string' ? JSON.parse(item.options) : item.options;
            return options.map((opt, i) => {
              let btnStyle = "text-slate-400 hover:text-white";
              if (isLocked) {
                if (opt === item.correct_answer) btnStyle = "text-amber-400 font-bold";
                else if (selected === opt && !isCorrect) btnStyle = "text-red-400 line-through";
                else btnStyle = "text-slate-600 opacity-20";
              }
              return (
                <button
                  key={i}
                  disabled={isLocked}
                  onClick={() => handleSelect(opt)}
                  className={`block w-full text-left py-2 text-sm transition-colors ${btnStyle}`}
                >
                  {opt}
                </button>
              );
            });
          } catch { return <p className="text-red-500">Format Execution Aborted</p>; }
        })()}
      </div>
      {isLocked && (
        <p className="text-xs text-slate-500 italic max-w-xl font-serif pt-2 animate-fade-in">
          {item.explanation || "Case standard verified against international financial crime criteria."}
        </p>
      )}
    </div>
  );
}

export default function App() {
  const [activeView, setActiveView] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [challengeSelected, setChallengeSelected] = useState(null);
  const [isChallengeLocked, setIsChallengeLocked] = useState(false);
  const [pageIndex, setPageIndex] = useState(0);
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

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
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

  return (
    <div className="text-slate-300 font-sans min-h-screen bg-[#020408] antialiased select-none">
      
      {/* GLOBAL CINEMATIC SPLIT RIG */}
      <div className="grid grid-cols-1 lg:grid-cols-12 min-h-screen w-full items-stretch">
        
        {/* ================== LEFT STAGE: STATIC ANCHOR SCREEN ================== */}
        <div className="lg:col-span-5 bg-gradient-to-b from-[#040712] to-[#020408] p-12 lg:p-20 flex flex-col justify-between sticky top-0 h-auto lg:h-screen z-40 border-b lg:border-b-0 lg:border-r border-white/[0.02]">
          
          {/* Header & Logo */}
          <div className="space-y-1">
            <img 
              src="/logo.png" 
              alt="DECODE" 
              className="h-5 w-auto cursor-pointer object-contain" 
              onClick={() => setActiveView(null)} 
            />
            <p className="text-[9px] uppercase tracking-[0.4em] text-slate-500 pt-2">Financial Crime Academy</p>
          </div>

          {/* Core Menu List */}
          <div className="py-12 lg:py-0 space-y-4 text-left">
            {[
              { label: 'Syllabus Intelligence', id: 'notes' },
              { label: 'Active Opportunities', id: 'jobs' },
              { label: 'Executive Pipelines', id: 'network' },
              { label: 'System Assessment', id: 'quiz' }
            ].map((nav) => (
              <button 
                key={nav.id} 
                onClick={() => setActiveView(nav.id)}
                className={`block text-2xl font-serif tracking-tight uppercase transition-all duration-300 ${activeView === nav.id ? 'text-amber-500 pl-4 border-l border-amber-500' : 'text-slate-400 hover:text-white'}`}
              >
                {nav.label}
              </button>
            ))}
            
            <div className="pt-8 border-t border-white/5 flex gap-6 text-[10px] tracking-widest text-slate-500 uppercase">
              <button onClick={() => setActiveView('referralForm')} className="hover:text-white transition-colors">Submit Referral</button>
              <button onClick={() => setActiveView('available')} className="hover:text-white transition-colors">Available Referrals</button>
              <button onClick={() => setActiveView('contribute')} className="hover:text-amber-400 transition-colors border-l border-white/10 pl-6">Recruiter Gate</button>
            </div>
          </div>

          {/* Fixed Metrics Footer Block */}
          <div className="space-y-4">
            <div className="flex gap-12 text-[10px] uppercase tracking-[0.25em] text-slate-600 font-medium">
              <div>
                <span className="block text-slate-400 font-serif text-lg font-light mb-0.5 text-white">{submissions.length}</span>
                Pipelines
              </div>
              <div>
                <span className="block text-slate-400 font-serif text-lg font-light mb-0.5 text-white">{partnerFiles.length}</span>
                Documents
              </div>
            </div>
            <p className="text-[9px] tracking-[0.3em] text-slate-600 uppercase border-t border-white/5 pt-4">AML_DECODE_RIG // CORE_v.2026</p>
          </div>

        </div>

        {/* ================== RIGHT STAGE: INDEPENDENT THEATER STREAM ================== */}
        <div className="lg:col-span-7 bg-[#020408] min-h-screen relative flex flex-col">
          
          {/* DEFAULT SUB-SECTION SCROLL CHANNELS */}
          {!activeView ? (
            <div className="flex-grow p-12 lg:p-24 space-y-36">
              
              <CinematicHero />

              {/* FILM STRIP ITEM 1: THE INTELLIGENCE CHALLENGE */}
              <div className="space-y-8 animate-slide-up">
                <span className="text-[10px] font-bold tracking-[0.4em] text-amber-500 uppercase block">Stream Node 01 // Daily Case</span>
                <p className="text-xl md:text-2xl font-serif font-light leading-relaxed text-white max-w-2xl">
                  "A cross-border payment from an offshore tech hub is flagged. The beneficiary entity is clean on global sanctions watchlists, but tracking data shows the transaction processes through a nested correspondent bank placed under selective sectorial restrictions 48 hours ago. The asset volume sits under standard regulatory reporting thresholds. Select your mitigation strategy:"
                </p>

                <div className="space-y-3 max-w-xl">
                  <button disabled={isChallengeLocked} onClick={() => setChallengeSelected('edd') || setIsChallengeLocked(true)} className="w-full text-left py-4 px-6 border border-white/10 text-xs font-semibold uppercase tracking-widest hover:border-amber-500 transition-all rounded-lg text-slate-300">
                    Freeze Asset & Escalate SAR/STR
                  </button>
                  <button disabled={isChallengeLocked} onClick={() => setChallengeSelected('dismiss') || setIsChallengeLocked(true)} className="w-full text-left py-4 px-6 border border-white/10 text-xs font-semibold uppercase tracking-widest hover:border-amber-500 transition-all rounded-lg text-slate-300">
                    Process Transaction & Log Parameters Internally
                  </button>
                </div>

                {isChallengeLocked && (
                  <div className="pt-6 border-t border-white/5 max-w-xl animate-fade-in text-sm font-serif italic text-slate-400">
                    {challengeSelected === 'edd' 
                      ? "VALIDATED: Sanctions verification guidelines demand absolute compliance limits regardless of monetary asset value footprint. Nested routes are structurally designed to bypass filter screens."
                      : "BREACH REPORTED: Low value footprint handles zero protective insulation boundaries under strict liability regulations."}
                  </div>
                )}
              </div>

              {/* FILM STRIP ITEM 2: SYLLABUS MECHANICS PROMPT */}
              <div className="space-y-6 max-w-xl pt-12 border-t border-white/5 animate-slide-up">
                <span className="text-[10px] font-bold tracking-[0.4em] text-slate-500 uppercase block">Stream Node 02 // Methodology</span>
                <h2 className="text-4xl font-serif font-light text-white uppercase tracking-tight">The Core Framework</h2>
                <p className="text-slate-400 text-sm leading-relaxed font-medium">
                  We bypass standard regulatory text blocks, restructuring intensive FATF and regional directives into asymmetric lookbooks for corporate compliance screening thresholds.
                </p>
                <div className="pt-4 flex gap-6 text-[11px] font-bold uppercase tracking-widest">
                  <button onClick={() => setActiveView('notes')} className="text-amber-400 border-b border-amber-500 pb-0.5">Enter Knowledge Base &rarr;</button>
                  <button onClick={() => setActiveView('quiz')} className="text-slate-500 hover:text-white transition-colors">Launch Exam Portal</button>
                </div>
              </div>

              {/* FILM STRIP ITEM 3: REGIONAL INDEX MARKET MARKERS */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12 pt-12 border-t border-white/5 animate-slide-up">
                {[{ location: 'Bengaluru Core', status: '+14% Core Placement Drift' }, { location: 'Kolkata Desk', status: 'Executive Sourcing Alignment' }].map((pulse, i) => (
                  <div key={i} className="space-y-1">
                    <span className="text-[9px] uppercase font-bold tracking-widest text-slate-500">{pulse.location}</span>
                    <h4 className="text-lg font-serif font-light text-white">{pulse.status}</h4>
                  </div>
                ))}
              </div>

            </div>
          ) : (
            
            // INDEPENDENT SCREEN INTERFACES FOR ACTIVE ACTIVE VIEWS
            <div className="flex-grow p-12 lg:p-24 w-full animate-fade-in">
              <button 
                onClick={() => setActiveView(null) || setQuizScore(0)} 
                className="text-[10px] font-bold tracking-[0.3em] text-amber-500 hover:text-white transition-colors uppercase mb-12 block"
              >
                ✕ Close Stream Frame
              </button>

              {/* THEATER STREAM MODULE: SYLLABUS INTELLIGENCE DATA */}
              {activeView === 'notes' && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
                  <div className="lg:col-span-4 flex flex-col gap-4 sticky top-12 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
                    {notesContent.map((item, idx) => (
                      <button key={idx} onClick={() => setPageIndex(idx)} className={`text-left py-3 border-b uppercase text-xs tracking-wider transition-colors ${pageIndex === idx ? 'border-amber-500 text-white font-bold' : 'border-white/5 text-slate-500 hover:text-slate-300'}`}>
                        {item.title}
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

              {/* THEATER STREAM MODULE: ACTIVE CORPORATE OPPORTUNITIES */}
              {activeView === 'jobs' && (
                <div className="space-y-12 max-w-2xl">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 pb-6 border-b border-white/5">
                    <h1 className="text-3xl font-serif font-light text-white uppercase tracking-tight">Openings Stream</h1>
                    <div className="flex gap-4 text-[11px] font-bold uppercase tracking-widest text-slate-500">
                      {['All', 'Bengaluru', 'Kolkata', 'Gurugram', 'Remote'].map((loc) => (
                        <button key={loc} onClick={() => setSelectedLocation(loc)} className={`hover:text-white transition-colors ${selectedLocation === loc ? 'text-amber-500 font-black' : ''}`}>{loc}</button>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-8">
                    {jobOpenings.filter(j => selectedLocation === 'All' || j.location === selectedLocation).map((job, idx) => (
                      <div key={idx} className="group flex justify-between items-center pb-6 border-b border-white/5">
                        <div className="space-y-1">
                          <span className="text-[9px] font-bold text-amber-500 tracking-widest uppercase">{job.company}</span>
                          <h3 className="text-lg font-bold text-white group-hover:text-amber-400 transition-colors">{job.role}</h3>
                          <p className="text-xs text-slate-500 font-medium">{job.location} // Placement Node</p>
                        </div>
                        <a href={job.link} target="_blank" rel="noopener noreferrer" className="text-xs font-bold uppercase tracking-widest text-white border-b border-white pb-0.5 hover:text-amber-400 hover:border-amber-400 transition-colors">Apply &rarr;</a>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* THEATER STREAM MODULE: KNOWLEDGE TESTING INTERFACES */}
              {activeView === 'quiz' && (
                <div className="max-w-xl space-y-8">
                  {!isTestStarted ? (
                    <div className="space-y-8">
                      <h2 className="text-3xl font-serif font-light text-white uppercase tracking-tight">Assessment Logs</h2>
                      <div className="flex gap-4 text-xs font-bold uppercase text-slate-500 tracking-wider">
                        {['KYC Basics', 'AML Advanced', 'Transaction Monitoring'].map((cat) => (
                          <button key={cat} onClick={() => setSelectedCategory(cat)} className={`hover:text-white transition-all ${selectedCategory === cat ? 'text-amber-400 border-b border-amber-500 pb-0.5' : ''}`}>{cat}</button>
                        ))}
                      </div>
                      <div className="space-y-4 pt-4">
                        <input type="text" placeholder="CANDIDATE INITIAL" value={userName} onChange={(e) => setUserName(e.target.value)} className="w-full pb-2 bg-transparent border-b border-white/20 text-white text-sm outline-none focus:border-amber-500 tracking-widest font-medium uppercase" />
                        <button disabled={!userName.trim()} onClick={() => setIsTestStarted(true)} className="w-full py-4 border border-white text-white font-bold text-xs uppercase tracking-widest hover:bg-white hover:text-black transition-colors">Initialize Verification Track</button>
                      </div>
                    </div>
                  ) : !isTestComplete ? (
                    <div className="space-y-8 animate-slide-up">
                      <div className="text-xs font-bold text-slate-500 uppercase tracking-widest flex gap-8 pb-4 border-b border-white/5">
                        <span>Node Index: {currentQuestionIndex + 1} / {testData.length}</span>
                        <span className="text-amber-400">Score: {quizScore}</span>
                      </div>
                      <QuizItem item={testData[currentQuestionIndex]} onCorrect={() => setQuizScore(prev => prev + 10)} />
                      {selectedOption && (
                        <button onClick={() => currentQuestionIndex < testData.length - 1 ? setCurrentQuestionIndex(prev => prev + 1) || setSelectedOption(null) : setIsTestComplete(true)} className="px-6 py-3 border border-white text-white font-bold text-xs uppercase tracking-widest block ml-auto hover:bg-white hover:text-black transition-colors">Next</button>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-6 text-center md:text-left">
                      <h2 className="text-3xl font-serif font-light text-white uppercase tracking-tight">Ecosystem Scoring Finalized</h2>
                      <p className="text-sm text-slate-400">Candidate Profiling Verified for: <span className="text-white font-bold">{userName}</span> // Score: <span className="text-amber-400 font-bold">{quizScore}</span></p>
                      <button onClick={() => setIsTestStarted(false) || setIsTestComplete(false) || setCurrentQuestionIndex(0) || setQuizScore(0) || setUserName("")} className="px-6 py-3 border border-white text-white font-bold text-xs uppercase tracking-widest hover:bg-white hover:text-black transition-colors">Clear Interface Record</button>
                    </div>
                  )}
                </div>
              )}

              {/* INTEGRATED FUNCTIONAL SUBSYSTEM ENTRY PANELS */}
              {activeView === 'referralForm' && (
                <div className="max-w-xl">
                  <h1 className="text-3xl font-serif font-light text-white uppercase tracking-tight pb-4 border-b border-white/5 mb-8">Referral Routing Insertion</h1>
                  <form className="space-y-6 text-xs font-bold uppercase tracking-widest text-slate-500" onSubmit={async (e) => { e.preventDefault(); await supabase.from('submissions').insert([{ name: e.target[0].value, email: e.target[1].value, company: e.target[2].value, role: e.target[3].value }]); alert("Parameters inserted."); setActiveView('jobs'); }}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      {["Candidate Designation", "Access Matrix Email", "Target Enterprise Desk", "Target Placement Role"].map((ph, i) => (
                        <div key={i} className="space-y-2 border-b border-white/10 pb-2 focus-within:border-amber-500 transition-colors">
                          <label className="tracking-widest block">{ph}</label>
                          <input required className="w-full bg-transparent text-white pt-2 font-medium normal-case outline-none text-sm" placeholder="Insert string parameter" />
                        </div>
                      ))}
                    </div>
                    <button type="submit" className="px-8 py-3.5 border border-white text-white font-bold text-xs uppercase tracking-widest hover:bg-white hover:text-black transition-colors">Execute Insertion Sequence</button>
                  </form>
                </div>
              )}

              {activeView === 'available' && (
                <div className="space-y-8 max-w-2xl">
                  <h1 className="text-3xl font-serif font-light text-white uppercase tracking-tight pb-4 border-b border-white/5">Available Pipelines</h1>
                  <div className="space-y-6">
                    {submissions.map((sub, i) => (
                      <div key={i} className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-white/5">
                        <div>
                          <span className="text-[10px] font-bold text-amber-500 tracking-widest uppercase block mb-0.5">{sub.company || 'Corporate Desk'}</span>
                          <h3 className="text-lg font-bold text-white tracking-tight">{sub.role || 'Compliance Analyst'}</h3>
                          <p className="text-xs text-slate-500 font-medium">Shared reference by: {sub.name}</p>
                        </div>
                        <a href={`mailto:${sub.email}?subject=Referral`} className="text-xs font-bold uppercase tracking-widest text-white border-b border-white pb-0.5 hover:text-amber-400 hover:border-amber-400 transition-colors">Contact Loop &rarr;</a>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeView === 'contribute' && (
                <div className="max-w-sm">
                  {!isAuthorized ? (
                    <div className="space-y-6">
                      <h2 className="text-2xl font-serif font-light text-white uppercase tracking-tight">Recruiter Desk Gate</h2>
                      <div className="space-y-4">
                        <input type="email" placeholder="Credential Email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full pb-2 bg-transparent border-b border-white/20 text-white outline-none text-sm font-medium focus:border-amber-500 transition-colors" />
                        <input type="password" placeholder="Passkey" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full pb-2 bg-transparent border-b border-white/20 text-white outline-none text-sm font-medium focus:border-amber-500 transition-colors" />
                        <button onClick={async () => { const { error } = await supabase.auth.signInWithPassword({ email, password }); if (!error) setIsAuthorized(true); else alert("Identity failure."); }} className="w-full py-4 bg-white text-black font-black uppercase tracking-widest text-xs hover:bg-amber-500 transition-colors">Verify Desk Identity</button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      <h3 className="text-2xl font-serif font-light text-white uppercase tracking-tight">Deploy Registry Nodes</h3>
                      <input type="email" placeholder="Deployment Recruiter Email" value={recruiterEmail} onChange={(e) => setRecruiterEmail(e.target.value)} className="w-full pb-2 bg-transparent border-b border-white/20 text-white outline-none text-sm focus:border-amber-500 transition-colors" />
                      <input type="file" className="block w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:border file:border-white/10 file:bg-transparent file:text-white file:text-[10px] file:font-bold file:uppercase file:tracking-widest hover:file:border-amber-500 file:transition-colors" onChange={(e) => setSelectedFile(e.target.files[0])} />
                      <button disabled={!selectedFile || !recruiterEmail} onClick={async () => { const path = `uploads/${Math.random()}.${selectedFile.name.split('.').pop()}`; await supabase.storage.from('intelligence').upload(path, selectedFile); const { data: { publicUrl } } = supabase.storage.from('intelligence').getPublicUrl(path); await supabase.from('partner_files').insert([{ name: selectedFile.name, url: publicUrl, recruiter_email: recruiterEmail }]); alert("Node deployed."); setActiveView('network'); }} className="w-full py-4 bg-white text-black font-black uppercase tracking-widest text-xs hover:bg-amber-500 transition-all">Publish Reference Node</button>
                    </div>
                  )}
                </div>
              )}

              {activeView === 'network' && (
                <div className="space-y-8 max-w-2xl">
                  <h1 className="text-4xl font-serif font-light text-white uppercase tracking-tight pb-4 border-b border-white/5">Executive Placement Registries</h1>
                  <div className="space-y-6">
                    {partnerFiles.map((f, i) => (
                      <div key={i} className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-white/5">
                        <div>
                          <span className="text-[8px] text-slate-500 font-bold block mb-0.5">REFERENCE_ID_0{i+1}</span>
                          <h3 className="text-xl font-bold text-white tracking-tight">{f.name}</h3>
                          <p className="text-xs text-amber-500 font-serif italic mt-0.5">Desk Coordinator: {f.recruiter_email}</p>
                        </div>
                        <button onClick={() => window.open(f.url, '_blank')} className="text-xs font-bold uppercase tracking-widest text-white border-b border-white pb-0.5 hover:text-amber-400 hover:border-amber-400 transition-colors">Download Document Intel &rarr;</button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* STATIC UTILITY SYSTEM VIEW HANDLERS */}
              {['privacy', 'terms', 'faq', 'contact'].includes(activeView) && (
                <div className="max-w-xl leading-relaxed text-slate-400 font-serif font-light text-base whitespace-pre-wrap space-y-6">
                  {activeView === 'privacy' && privacyPolicy.body}
                  {activeView === 'terms' && termsOfService.body}
                  {activeView === 'contact' && contactContent.body}
                  {activeView === 'faq' && faqData.map((item, i) => (
                    <div key={i} className="pb-6 border-b border-white/5">
                      <h4 className="font-sans font-medium text-white mb-2 uppercase tracking-wider text-sm">{item.question}</h4>
                      <p className="text-slate-400 italic pt-1">{item.answer}</p>
                    </div>
                  ))}
                </div>
              )}

            </div>
          )}

          {/* FIXED MINIMAL DIRECTORY FOOTER */}
          <footer className="mt-auto p-12 lg:p-24 border-t border-white/[0.02] flex flex-wrap justify-between items-center gap-6 text-[10px] uppercase tracking-widest text-slate-600 font-medium">
            <div className="flex gap-6">
              <button onClick={() => setActiveView('faq')} className="hover:text-white transition-colors">FAQ</button>
              <button onClick={() => setActiveView('privacy')} className="hover:text-white transition-colors">Privacy</button>
              <button onClick={() => setActiveView('terms')} className="hover:text-white transition-colors">Terms</button>
              <button onClick={() => setActiveView('contact')} className="hover:text-white transition-colors">Contact</button>
            </div>
            <span>© 2026 AML_DECODE_ Design by Nitesh</span>
          </footer>

        </div>

      </div>
    </div>
  );
}