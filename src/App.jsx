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
// STABLE SUBSCRIBE COMPONENT: Now opens every time the page loads
function SubscribeModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [email, setEmail] = useState("");

  useEffect(() => {
    // We removed the 'hasClosed' check so it triggers every single time
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
      setIsOpen(false); // Just close the window, don't save a permanent marker
    } else {
      if (error.code === "23505") {
        alert("This email is already subscribed!");
      } else {
        alert("Error: " + error.message);
      }
    }
  };

  const handleClose = () => {
    setIsOpen(false); // Just close the window for this session
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
  const [newsList, setNewsList] = useState([]);
  const [testData, setTestData] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState('All');
  const [recruiterEmail, setRecruiterEmail] = useState("");
  const [selectedQuiz, setSelectedQuiz] = useState(null);
const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
const [quizScore, setQuizScore] = useState(0); // Replacing the old 'score'
const [showResult, setShowResult] = useState(false);
const [selectedCategory, setSelectedCategory] = useState('KYC Basics');
  const contentRef = useRef(null);
const [showSuccess, setShowSuccess] = useState(false);
  // --- REPLACE YOUR OLD useEffect WITH THIS EXACT BLOCK ---
 const trackEmailClick = async (fileId) => {
    try {
      // 1. Fetch current count from Supabase
      const { data: currentData } = await supabase
        .from('partner_files')
        .select('click_count')
        .eq('id', fileId)
        .single();

      // 2. Increment by 1 and save back to the database
      await supabase
        .from('partner_files')
        .update({ click_count: (currentData?.click_count || 0) + 1 })
        .eq('id', fileId);
        
      console.log(`Analytics: Click logged for file ID ${fileId}`);
    } catch (err) {
      console.error("Analytics error:", err);
    }
  };
  // --- UPDATED useEffect THAT FILTERS BY CATEGORY ---
  // --- UPDATED useEffect THAT FILTERS BY CATEGORY AND FETCHES UP TO 100 ---
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      
      // 1. Fetch your other data
      const { data: subs } = await supabase.from('submissions').select('*');
      const { data: files } = await supabase.from('partner_files').select('*');
      const { data: news, error: newsError } = await supabase.from('news').select('*');
      
      // 2. Fetch QUIZ data filtered by category and limited to 100 rows
      const { data: quiz, error: quizError } = await supabase
        .from('quiz_questions')
        .select('*')
        .eq('category', selectedCategory)
        .range(0, 99); // <--- This allows up to 100 questions
      
      if (quizError) console.error("Supabase Quiz Error:", quizError);
      
      // 3. Update your states
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
      {/* NAVBAR */}
     {/* MINIMALIST PROFESSIONAL NAVBAR */}
<nav className="sticky top-0 z-50 w-full bg-[#030712]/90 backdrop-blur-md border-b border-white/5 shadow-xl">
  <div className="max-w-7xl mx-auto px-6">
    <div className="flex items-center justify-between h-20">
      
      {/* Brand Logo */}
      <div 
        onClick={() => setActiveView(null)} 
        className="flex items-center cursor-pointer group shrink-0"
      >
        <img 
          src="/logo.png" 
          alt="AML_DECODE Logo" 
          className="h-12 md:h-14 w-auto object-contain group-hover:brightness-110 transition-all" 
        />
      </div>

      {/* Modern Text-Based Navigation */}
      <div className="hidden lg:flex items-center gap-8">
        {navItems.map((item) => {
          const isActive = activeView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveView(item.id)}
              className={`relative py-2 text-[11px] font-black uppercase tracking-[0.15em] transition-all duration-300
                ${isActive 
                  ? "text-emerald-400" 
                  : "text-slate-400 hover:text-white"}`}
            >
              {item.label}
              {/* Sleek Underline Indicator */}
              {isActive && (
                <span className="absolute bottom-0 left-0 w-full h-[2px] bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)] animate-in fade-in zoom-in duration-300"></span>
              )}
            </button>
          );
        })}
      </div>

      {/* Mobile Toggle Only */}
      <div className="lg:hidden">
        <button 
          className="p-2 text-emerald-500 transition-colors"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          {isMenuOpen ? (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
          ) : (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" /></svg>
          )}
        </button>
      </div>
    </div>
  </div>

  {/* Simplified Mobile Menu */}
  <div className={`lg:hidden overflow-hidden transition-all duration-300 ease-in-out bg-[#030712] ${isMenuOpen ? "max-h-screen border-b border-white/5" : "max-h-0"}`}>
    <div className="p-8 space-y-6">
      {navItems.map((item) => (
        <button
          key={item.id}
          onClick={() => { setActiveView(item.id); setIsMenuOpen(false); }}
          className={`block w-full text-left text-sm font-black uppercase tracking-[0.2em] 
            ${activeView === item.id ? "text-emerald-500" : "text-slate-500 hover:text-white"}`}
        >
          {item.label}
        </button>
      ))}
    </div>
  </div>
</nav>

      {/* MOBILE MENU */}
      {isMenuOpen && (
        <div className="md:hidden fixed inset-0 top-[80px] z-[999] bg-[#030712] p-6 flex flex-col gap-6" onClick={() => setIsMenuOpen(false)}>
          {navItems.map((item) => (
            <button key={item.id} onClick={() => { setActiveView(item.id); setIsMenuOpen(false); }} className="text-xl font-black text-left text-emerald-400 uppercase border-b border-emerald-500/10 pb-4">
              {item.label}
            </button>
          ))}
        </div>
      )}

      {/* HOME PAGE */}
      {!activeView && (
        <main className="flex-grow">
          <section className="w-full relative bg-black">
            <video className="w-full h-[500px] object-cover" autoPlay muted={isMuted} loop playsInline>
              <source src="/intro.mp4" type="video/mp4" />
            </video>
            <button onClick={() => setIsMuted(!isMuted)} className="absolute bottom-8 right-8 z-20 bg-emerald-600/80 hover:bg-emerald-500 text-white px-6 py-2 rounded-full font-bold backdrop-blur-sm transition-all">
              {isMuted ? "UNMUTE" : "MUTE"}
            </button>
          </section>
          
          <div className="max-w-7xl mx-auto px-6 py-16">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {navItems.filter(i => i.id !== 'quiz').map(card => (
                <div key={card.id} onClick={() => setActiveView(card.id)} className="p-8 border border-emerald-500/20 rounded cursor-pointer hover:translate-y-[-5px] transition-all">
                  <h3 className="font-bold text-emerald-400 uppercase">{card.label}</h3>
                </div>
              ))}
            </div>
          </div>

          <section className="bg-black border-t border-emerald-500/20 py-16 px-6">
            <div className="max-w-7xl mx-auto">
              <h2 className="text-emerald-500 font-bold mb-8 uppercase">&gt; Latest KYC News</h2>
              {console.log("News Data Array:", newsList)}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              

               {newsList.slice(0, 3).map((news, i) => (
                  <a key={i} href={news.link} target="_blank" rel="noopener noreferrer" className="p-6 bg-slate-900 border border-white/5 rounded hover:border-emerald-500/50 transition-all block">
                    <p className="text-white font-bold mb-2">{news.title}</p>
                    {news.link && <span className="text-emerald-500 text-xs font-bold">READ MORE →</span>}
                  </a>
                ))}
              </div>
            </div>
          </section>
        </main>
      )}

      {/* ACTIVE VIEW MODAL */}
      {activeView && (
        <div className="fixed inset-0 z-[100] bg-black/95 p-12 overflow-y-auto">
          <button onClick={() => { setActiveView(null); setQuizScore(0); }} className="text-emerald-400 font-bold mb-10">&larr; BACK</button>
          <div className="max-w-4xl mx-auto text-white">
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
  <div className="space-y-6">
    {/* LOCATION FILTER BUTTONS */}
    <div className="flex flex-wrap gap-2 mb-6">
      {['All', 'Bengaluru', 'Kolkata', 'Gurugram', 'Remote', 'Pune', 'Mumbai', 'Chennai'].map((loc) => (
        <button
          key={loc}
          onClick={() => setSelectedLocation(loc)}
          className={`px-4 py-2 text-xs font-bold border transition-all ${
            selectedLocation === loc 
            ? "bg-emerald-600 border-emerald-500 text-white" 
            : "bg-slate-900 border-slate-700 text-slate-400 hover:border-emerald-500"
          }`}
        >
          {loc.toUpperCase()}
        </button>
      ))}
    </div>

    {/* FILTERED JOBS LIST */}
    <div className="bg-[#030712]/80 rounded border border-slate-800">
      {jobOpenings
        .filter(job => selectedLocation === 'All' || job.location === selectedLocation)
        .map((job, idx) => (
          <div key={idx} className="p-6 border-b border-slate-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <p className="text-emerald-400 text-xs font-bold uppercase">{job.company}</p>
              <h2 className="text-xl font-bold">{job.role}</h2>
              <p className="text-slate-500 text-xs mt-1">{job.location}</p>
            </div>
            <a 
              href={job.link} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="bg-indigo-600 hover:bg-indigo-500 px-8 py-3 font-bold text-sm transition-all"
            >
              APPLY
            </a>
          </div>
        ))
      }
      
      {/* Empty State */}
      {jobOpenings.filter(job => selectedLocation === 'All' || job.location === selectedLocation).length === 0 && (
        <div className="p-10 text-center text-slate-500 text-sm">
          No job openings found for {selectedLocation}.
        </div>
      )}
    </div>
  </div>
)}            {activeView === 'referralForm' && <form className="space-y-4" onSubmit={async (e) => { e.preventDefault(); await supabase.from('submissions').insert([{ name: e.target[0].value, email: e.target[1].value, company: e.target[2].value, role: e.target[3].value }]); alert("Submitted!"); setActiveView(null); }}><input className="w-full p-4 bg-black border" placeholder="Name" required /><input className="w-full p-4 bg-black border" placeholder="Email" required /><input className="w-full p-4 bg-black border" placeholder="Company" required /><input className="w-full p-4 bg-black border" placeholder="Role" required /><button type="submit" className="w-full py-4 bg-emerald-600">SUBMIT</button></form>}
            {activeView === 'available' && <div className="max-w-4xl mx-auto">{submissions.map((sub, i) => <div key={i} className="p-6 mb-4 bg-slate-900 border border-emerald-500/30 rounded flex justify-between items-center"><div><h3 className="text-xl font-bold">{sub.name}</h3><p className="text-sm text-slate-400">{sub.company} - {sub.role}</p></div><button className="bg-emerald-600 px-6 py-3 font-bold hover:bg-emerald-500 transition-all text-white">APPLY</button></div>)}</div>}
{activeView === 'contribute' && (
  <div className="p-8 border border-slate-800 rounded bg-slate-900">
    {!isAuthorized ? (
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-emerald-400 uppercase tracking-widest mb-4">HR Portal Secure Login</h2>
        <input 
          type="email" 
          placeholder="Email" 
          value={email}
          onChange={(e) => setEmail(e.target.value)} 
          className="w-full p-4 bg-black border border-slate-700 text-slate-100 font-mono focus:border-emerald-500 outline-none" 
        />
        <input 
          type="password" 
          placeholder="Password" 
          value={password}
          onChange={(e) => setPassword(e.target.value)} 
          className="w-full p-4 bg-black border border-slate-700 text-slate-100 font-mono focus:border-emerald-500 outline-none" 
        />
        <button 
          onClick={async () => { 
            const { error } = await supabase.auth.signInWithPassword({ email, password }); 
            if (!error) setIsAuthorized(true); 
            else alert(error.message); 
          }} 
          className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 font-bold uppercase transition-all"
        >
          LOGIN
        </button>
      </div>
    ) : (
      <div className="space-y-6">
        <h2 className="text-xl font-bold text-emerald-400 uppercase tracking-widest">HR Portal: Upload Documents</h2>
        
        {/* Recruiter Email Input - Managed by React State */}
        <div className="space-y-2">
          <label className="text-xs text-slate-400 font-bold uppercase">Recruiter Email (Optional)</label>
          <input 
            type="email" 
            placeholder="hr@company.com" 
            value={recruiterEmail}
            onChange={(e) => setRecruiterEmail(e.target.value)}
            className="w-full p-4 bg-black border border-slate-700 text-slate-100 font-mono focus:border-emerald-500 outline-none" 
          />
        </div>

        <div className="p-10 border-2 border-dashed border-slate-700 rounded-lg text-center bg-black/40">
          <input 
            type="file" 
            id="hrFileInput" 
            className="hidden" 
            onChange={(e) => {
              const fileName = e.target.files[0]?.name || '';
              const display = document.getElementById('fileNameDisplay');
              if (display) display.innerText = fileName;
            }} 
          />
          <label htmlFor="hrFileInput" className="cursor-pointer bg-slate-800 px-6 py-3 rounded font-bold hover:bg-slate-700 transition-all text-sm">
            SELECT DOCUMENT (PDF/IMG)
          </label>
          <p id="fileNameDisplay" className="mt-4 text-emerald-500 text-sm font-bold"></p>
        </div>
        {/* ADVANCED LIVE PREVIEW: Mirrors the actual job card UI */}
{(recruiterEmail || (document.getElementById('hrFileInput') && document.getElementById('hrFileInput').files[0])) && (
  <div className="mt-4 p-6 border border-slate-700 bg-black/40 rounded-lg shadow-inner">
    <p className="text-[10px] text-emerald-500 font-black mb-4 uppercase tracking-[0.2em]">
      &gt; PRE-UPLOAD QUALITY CHECK
    </p>
    <div className="p-6 bg-slate-900 border border-purple-500/40 rounded flex flex-col md:flex-row justify-between items-start md:items-center gap-4 opacity-80">
      <div>
        <span className="block font-bold text-lg text-white">
          {document.getElementById('hrFileInput')?.files[0]?.name || "Document Name.pdf"}
        </span>
        {recruiterEmail && (
          <span className="text-xs text-purple-400 font-bold uppercase tracking-widest">
            RECRUITER: {recruiterEmail}
          </span>
        )}
      </div>
      <div className="flex gap-2">
        <div className="px-4 py-2 border border-purple-500/30 text-purple-500/50 font-bold text-xs rounded">
          VIEW
        </div>
        {recruiterEmail && (
          <div className="px-4 py-2 bg-purple-600/30 text-white/50 font-bold text-xs rounded">
            EMAIL HR
          </div>
        )}
      </div>
    </div>
    <p className="mt-3 text-[9px] text-slate-500 italic">
      * This is a preview of how the referral will appear to subscribers.
    </p>
  </div>
)}
{showSuccess && (
  <div className="p-4 mb-4 bg-emerald-900/30 border border-emerald-500 rounded text-emerald-400 font-bold text-sm text-center animate-pulse">
    ✔ UPLOAD SUCCESSFUL: LIVE ON NETWORK & SCHEDULED FOR EMAIL
  </div>
)}
        <button 
          disabled={isLoading}
          onClick={async () => {
            const fileInput = document.getElementById('hrFileInput');
            const file = fileInput?.files[0];
            
            if (!file) return alert("Please select a file first!");
            setIsLoading(true);

            const fileExt = file.name.split('.').pop();
            const fileName = `${Math.random()}.${fileExt}`;
            
            // 1. Upload to Storage
            const { error: uploadError } = await supabase.storage
              .from('hr-docs') 
              .upload(fileName, file);

            if (uploadError) {
              alert("Storage Error: " + uploadError.message);
              setIsLoading(false);
              return;
            }

            // 2. Get Public URL
            const { data: urlData } = supabase.storage.from('hr-docs').getPublicUrl(fileName);

            // 3. Insert into Database with recruiter_email
          // 3. Insert into Database with advanced structural tracking
const { error: dbError } = await supabase
  .from('partner_files')
  .insert([{ 
    name: file.name, 
    url: urlData.publicUrl,
    recruiter_email: recruiterEmail || null,
    // Advanced Tracking Fields
    metadata: {
      uploaded_at: new Date().toISOString(),
      source_platform: "AML_DECODE_PORTAL_V2",
      status: "ACTIVE"
    }
  }]);

            if (dbError) {
              alert("Database Sync Error: " + dbError.message);
            } else {
              setShowSuccess(true); // Show the success message
  const { data: updatedFiles } = await supabase.from('partner_files').select('*');
  if (updatedFiles) setPartnerFiles(updatedFiles);
  
  // Clear success message after 5 seconds
  setTimeout(() => setShowSuccess(false), 5000);
  
  setRecruiterEmail("");
  if (fileInput) fileInput.value = "";
              const display = document.getElementById('fileNameDisplay');
              if (display) display.innerText = "";
            }
            setIsLoading(false);
          }} 
          className="w-full py-5 bg-emerald-600 hover:bg-emerald-500 text-white font-black uppercase transition-all disabled:opacity-50"
        >
          {isLoading ? "UPLOADING..." : "SUBMIT TO NETWORK"}
        </button>
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
          {f.recruiter_email && (
            <span className="text-xs text-purple-400 font-bold uppercase tracking-tight">
              Recruiter: {f.recruiter_email}
            </span>
          )}
        </div>
        
        {/* ACTION BUTTONS */}
        <div className="flex flex-wrap gap-3">
          <button 
            onClick={() => window.open(f.url, '_blank')} 
            className="px-4 py-2 border border-purple-500 text-purple-400 hover:bg-purple-500 hover:text-white transition-all font-bold text-xs"
          >
            VIEW
          </button>
          
          {/* ADVANCED EMAIL BUTTON */}
          {f.recruiter_email && (
            <a 
              href={`mailto:${f.recruiter_email}?subject=${encodeURIComponent(`Application for ${f.name} - via AML_DECODE`)}&body=${encodeURIComponent(
      `Dear Hiring Team,\n\nI am writing to express my interest in the ${f.name} position I saw on AML_DECODE. I have extensive experience in KYC/AML frameworks and would love to share my profile.\n\nBest regards,\n[Your Name]\n[Your Phone Number]`
    )}`}
    onClick={() => trackEmailClick(f.id)} // <--- PASTE THIS LINE HERE
    className="px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold text-xs hover:from-purple-500 hover:to-indigo-500 transition-all rounded shadow-[0_0_15px_rgba(147,51,234,0.3)] flex items-center gap-2"
    style={{ textDecoration: 'none' }}
  >
    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
    </svg>
    EMAIL HR
            </a>
          )}

          {/* DELETE BUTTON (Internal Maintenance) */}
          {isAuthorized && (
            <button 
              onClick={async () => {
                if(window.confirm("Delete this referral?")) {
                  const { error } = await supabase.from('partner_files').delete().eq('id', f.id);
                  if(!error) {
                    setPartnerFiles(prev => prev.filter(item => item.id !== f.id));
                  }
                }
              }}
              className="px-4 py-2 bg-red-900/20 border border-red-500 text-red-500 hover:bg-red-500 hover:text-white transition-all font-bold text-xs"
            >
              DELETE
            </button>
          )}
        </div>
      </div>
    ))}
  </div>
)}
 {activeView === 'quiz' && (
  <div className="flex flex-col h-[85vh] bg-[#030712] overflow-hidden rounded-lg border border-emerald-500/20">
    
    {/* 1. MOBILE-READY STICKY HUD (Heads-Up Display) */}
    <div className="sticky top-0 z-30 bg-[#0b1c2e] border-b border-emerald-500/30 p-4 shadow-2xl">
      <div className="max-w-4xl mx-auto flex justify-between items-center">
        <div className="flex-grow">
          <h2 className="text-[10px] text-emerald-500 font-black uppercase tracking-widest">Assessment Mode</h2>
          <h1 className="text-lg font-bold text-white truncate max-w-[150px] md:max-w-none">{selectedCategory}</h1>
        </div>
        
        {/* Performance HUD: Vital for that "Real" Interview Feel */}
        <div className="flex gap-4 items-center">
          <div className="text-center">
            <p className="text-[8px] text-slate-500 font-bold uppercase">Score</p>
            <p className="text-xl font-black text-emerald-400 leading-none">{quizScore}</p>
          </div>
          <div className="h-8 w-[1px] bg-slate-700 hidden md:block"></div>
          <div className="text-center hidden md:block">
            <p className="text-[8px] text-slate-500 font-bold uppercase">Accuracy</p>
            <p className="text-xl font-black text-indigo-400 leading-none">
              {testData.length > 0 ? Math.round((quizScore / (testData.length * 10)) * 100) : 0}%
            </p>
          </div>
        </div>
      </div>
      
      {/* Dynamic Progress Bar: Fills as you gain points */}
      <div className="mt-4 h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
        <div 
          className="h-full bg-gradient-to-r from-emerald-500 to-indigo-500 transition-all duration-700 ease-out"
          style={{ width: `${Math.min((quizScore / (testData.length * 10)) * 100 || 0, 100)}%` }}
        ></div>
      </div>
    </div>

    {/* 2. HORIZONTAL CATEGORY SELECTOR: Thumb-friendly on Mobile */}
 <div className="flex-shrink-0 w-full bg-black/40 border-b border-slate-800">
  <div className="flex gap-3 p-4 overflow-x-auto no-scrollbar scroll-smooth">
    {['KYC Basics', 'AML Advanced', 'Transaction Monitoring'].map((qName, i) => (
      <button 
        key={i} 
        onClick={() => { 
          setQuizScore(0); 
          setSelectedCategory(qName); 
        }}
        className={`whitespace-nowrap px-6 py-2.5 rounded-full text-[11px] font-black uppercase tracking-wider border transition-all duration-300 flex-shrink-0
          ${selectedCategory === qName 
            ? "bg-emerald-600 border-emerald-400 text-white shadow-[0_0_20px_rgba(16,185,129,0.4)] translate-y-[-1px]" 
            : "bg-slate-900 border-slate-700 text-slate-400 hover:border-emerald-500 hover:bg-slate-800"}`}
      >
        {qName}
      </button>
      ))}
    </div>
</div>
    {/* 3. SCROLLABLE CONTENT AREA: Single Column focus */}
    <div className="flex-grow overflow-y-auto p-4 pb-24 custom-scrollbar bg-[radial-gradient(circle_at_top,rgba(16,185,129,0.05),transparent)]">
      <div className="max-w-2xl mx-auto space-y-6 mt-2">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="animate-spin h-10 w-10 border-4 border-emerald-500 border-t-transparent rounded-full"></div>
            <p className="text-emerald-500 font-bold text-xs animate-pulse">INITIALIZING TEST DATA...</p>
          </div>
        ) : testData.length > 0 ? (
          testData.map((item, index) => (
            <QuizItem key={index} item={item} onCorrect={() => setQuizScore(s => s + 10)} />
          ))
        ) : (
          <div className="text-center py-20">
            <p className="text-slate-500 text-sm">No assessment data available for this category.</p>
          </div>
        )}
      </div>
    </div>
  </div>
)}

    

{activeView === 'privacy' && (
  <div className="p-8 bg-slate-900 border border-slate-800 rounded">
    <h1 className="text-2xl font-bold mb-6">{privacyPolicy.title}</h1>
    
    {/* Use 'whitespace-pre-line' to respect line breaks from your text file */}
    {/* Use 'leading-relaxed' to add space between lines */}
    <div className="text-slate-300 leading-relaxed whitespace-pre-line">
      {privacyPolicy.body}
    </div>
  </div>
)}

{activeView === 'terms' && (
  <div className="p-8 bg-slate-900 border border-slate-800 rounded">
    <h1 className="text-2xl font-bold mb-6">{termsOfService.title}</h1>
    
    <div className="text-slate-300 leading-relaxed whitespace-pre-line">
      {termsOfService.body}
    </div>
  </div>
)}        {activeView === 'faq' && <div className="p-8 bg-slate-900 border border-slate-800 rounded">{faqData.map((item, i) => <details key={i} className="mb-6"><summary className="cursor-pointer font-bold">{item.question}</summary><p>{item.answer}</p></details>)}</div>}
            {activeView === 'contact' && <div className="p-8 bg-slate-900 border border-slate-800 rounded"><h1>{contactContent.title}</h1><p>{contactContent.body}</p></div>}
          </div>
        </div>
      )}

      {/* FOOTER */}
   {/* MODERN & MOBILE-RESPONSIVE FOOTER */}
<footer className="bg-[#0b1c2e] text-white border-t border-emerald-500/20 pt-16 pb-8 mt-20">
  <div className="max-w-7xl mx-auto px-6">
    <div className="grid grid-cols-1 md:grid-cols-12 gap-12 mb-16">
      
      {/* Brand & Mission Column */}
      <div className="md:col-span-5 space-y-6">
        <img src="/logo.png" alt="AML_DECODE" className="h-12 w-auto object-contain" />
        <p className="text-sm leading-relaxed text-slate-400 max-w-md">
          AMLDecode is your go-to platform for AML, KYC, EDD, and Transaction Monitoring learning. 
          We provide interview preparation notes, industry insights, and latest job opportunities 
          to help professionals grow their careers in financial crime compliance.
        </p>
      </div>

      {/* Quick Links Column */}
      <div className="md:col-span-3 space-y-4">
        <h3 className="text-emerald-500 font-black uppercase text-[10px] tracking-widest">Navigation</h3>
        <div className="flex flex-col gap-3 text-sm text-slate-300">
          <button onClick={() => setActiveView('faq')} className="hover:text-emerald-400 transition-colors text-left w-fit uppercase font-bold tracking-tighter">FAQ</button>
          <button onClick={() => setActiveView('contact')} className="hover:text-emerald-400 transition-colors text-left w-fit uppercase font-bold tracking-tighter">Contact Us</button>
          <button onClick={() => setActiveView('notes')} className="hover:text-emerald-400 transition-colors text-left w-fit uppercase font-bold tracking-tighter">Learning Notes</button>
        </div>
      </div>

      {/* Legal Column */}
      <div className="md:col-span-4 space-y-4">
        <h3 className="text-emerald-500 font-black uppercase text-[10px] tracking-widest">Legal & Compliance</h3>
        <div className="flex flex-col gap-3 text-sm text-slate-300">
          <button onClick={() => setActiveView('privacy')} className="hover:text-emerald-400 transition-colors text-left w-fit uppercase font-bold tracking-tighter">Privacy Policy</button>
          <button onClick={() => setActiveView('terms')} className="hover:text-emerald-400 transition-colors text-left w-fit uppercase font-bold tracking-tighter">Terms of Service</button>
        </div>
      </div>
    </div>

    {/* Bottom Bar: Copyright & Socials */}
    <div className="border-t border-slate-800/50 pt-8 flex flex-col md:flex-row justify-between items-center gap-6">
      <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest text-center md:text-left">
        © 2026 AML_DECODE / Designed by @ Nitesh Mishra
      </div>

      <div className="flex items-center gap-8">
        {/* LinkedIn */}
        <a href="https://linkedin.com/in/yourprofile" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-[#0077b5] transition-all hover:scale-110">
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.761 0 5-2.239 5-5v-14c0-2.761-2.239-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
        </a>
        {/* Twitter */}
        <a href="https://twitter.com/yourhandle" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-white transition-all hover:scale-110">
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/></svg>
        </a>
        {/* Instagram */}
        <a href="https://instagram.com/yourhandle" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-[#e4405f] transition-all hover:scale-110">
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 1.173.055 1.805.249 2.227.415.563.22.964.482 1.385.904.422.421.684.822.904 1.385.166.422.36 1.054.415 2.227.058 1.266.07 1.646.07 4.85s-.012 3.584-.07 4.85c-.055 1.173-.249 1.805-.415 2.227-.22.563-.482.964-.904 1.385-.421.421-.822.684-1.385.904-.422.166-1.054.36-2.227.415-1.266.058-1.646.07-4.85.07s-3.584-.012-4.85-.07c-1.173-.055-1.805-.249-2.227-.415-.563-.22-.964-.482-1.385-.904-.421-.421-.684-.822-.904-1.385-.166-.422-.36-1.054-.415-2.227-.058-1.266-.07-1.646-.07-4.85s.012-3.584.07-4.85c.055-1.173.249-1.805.415-2.227.22-.563.482-.964.904-1.385.421-.421.822-.684 1.385-.904.422-.166 1.054-.36 2.227-.415 1.266-.058 1.646-.07 4.85-.07zm0 1.442c-3.136 0-3.509.012-4.75.068-1.077.05-1.662.23-2.052.383-.518.201-.887.44-1.275.828s-.627.757-.828 1.275c-.153.39-.333.975-.383 2.052-.056 1.241-.068 1.614-.068 4.75s.012 3.509.068 4.75c.05 1.077.23 1.662.383 2.052.201.518.44.887.828 1.275s.757.627 1.275.828c.39.153.975.333 2.052.383 1.241.056 1.614.068 4.75.068s3.509-.012 4.75-.068c1.077-.05 1.662-.23 2.052-.383.518-.201.887-.44 1.275-.828s.627-.757.828-1.275c.153-.39.333-.975.383-2.052.056-1.241.068-1.614.068-4.75s-.012-3.509-.068-4.75c-.05-1.077-.23-1.662-.383-2.052-.201-.518-.44-.887-.828-1.275s-.757-.627-1.275-.828c-.39-.153-.975-.333-2.052-.383-1.241-.056-1.614-.068-4.75-.068zM12 7.245a4.755 4.755 0 1 1 0 9.51 4.755 4.755 0 0 1 0-9.51zm0 1.442a3.313 3.313 0 1 0 0 6.626 3.313 3.313 0 0 0 0-6.626zm5.35-4.832a1.11 1.11 0 1 1 0 2.22 1.11 1.11 0 0 1 0-2.22z"/></svg>
        </a>
      </div>
    </div>
  </div>
</footer>
<SubscribeModal />
    </div>
  );
}