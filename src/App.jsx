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

  return (
    <div className="mb-8 p-6 bg-slate-900 border border-slate-700 rounded">
      <h2 className="text-xl font-bold mb-4">{item.question}</h2>
      <div className="space-y-3">
        {(() => {
          try {
            const options = typeof item.options === 'string' ? JSON.parse(item.options) : item.options;
            return options.map((opt, i) => (
              <button key={i} disabled={isLocked} onClick={() => handleSelect(opt)}
                className={`block w-full text-left p-4 bg-black border rounded transition-all ${selected === opt ? (opt === item.correct_answer ? "border-green-500 bg-green-900/20" : "border-red-500 bg-red-900/20") : "border-slate-600 hover:border-emerald-500"}`}>
                {opt}
              </button>
            ));
          } catch { return <p className="text-red-500">Error: Invalid format</p>; }
        })()}
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
  const [score, setScore] = useState(0);
  const contentRef = useRef(null);

  // --- REPLACE YOUR OLD useEffect WITH THIS EXACT BLOCK ---
  useEffect(() => {
    const fetchData = async () => {
      // Fetching data
      const { data: subs } = await supabase.from('submissions').select('*');
      const { data: files } = await supabase.from('partner_files').select('*');
      const { data: news, error: newsError } = await supabase.from('news').select('*');
      const { data: quiz } = await supabase.from('quiz_questions').select('*');
      
      if (subs) setSubmissions(subs);
      if (files) setPartnerFiles(files);
      
      // LOG ERROR IF SUPABASE FAILS
      if (newsError) console.error("Supabase News Error:", newsError);
      
      // Fallback: If Supabase news is empty/null, use your local kycNews import
      setNewsList(news && news.length > 0 ? news : kycNews);
      
      if (quiz) setTestData(quiz);
      setIsLoading(false);
    };
    fetchData();
  }, []);

  const navItems = [
    { label: 'NOTES', id: 'notes' }, { label: 'JOBS', id: 'jobs' },
    { label: 'SUBMIT REFERRAL', id: 'referralForm' }, { label: 'AVAILABLE REFERRAL', id: 'available' },
    { label: 'HR DASHBOARD', id: 'contribute' }, { label: 'NETWORK JOBS', id: 'network' },
    { label: 'QUIZ', id: 'quiz' }
  ];

  return (
    <div className="text-slate-100 font-mono min-h-screen flex flex-col relative bg-[#030712]">
      {/* NAVBAR */}
      <nav className="p-6 border-b border-emerald-500/30 flex items-center justify-between sticky top-0 bg-[#030712]/90 backdrop-blur-lg z-50 w-full shadow-[0_0_20px_rgba(16,185,129,0.1)]">
        <div onClick={() => setActiveView(null)} className="cursor-pointer h-16 flex items-center shrink-0">
          <img src="/logo.png" alt="AML_DECODE Logo" className="h-full w-auto object-contain" />
        </div>
        <div className="hidden md:flex gap-6 items-center overflow-x-auto">
          {navItems.map((item) => (
            <button key={item.id} onClick={() => setActiveView(item.id)} className="text-xs font-black text-emerald-400 hover:text-white transition-all uppercase whitespace-nowrap">
              {item.label}
            </button>
          ))}
        </div>
        <button className="md:hidden text-emerald-500 text-2xl z-[60] p-2" onClick={() => setIsMenuOpen(!isMenuOpen)}>{isMenuOpen ? "✕" : "☰"}</button>
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
          <button onClick={() => { setActiveView(null); setScore(0); }} className="text-emerald-400 font-bold mb-10">&larr; BACK</button>
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
            {activeView === 'jobs' && <div className="bg-[#030712]/80 rounded border border-slate-800">{jobOpenings.map((job, idx) => <div key={idx} className="p-6 border-b border-slate-800 flex justify-between"><div><p className="text-emerald-400">{job.company}</p><h2>{job.role}</h2></div><a href={job.link} target="_blank" rel="noopener noreferrer" className="bg-indigo-600 px-6 py-2">APPLY</a></div>)}</div>}
            {activeView === 'referralForm' && <form className="space-y-4" onSubmit={async (e) => { e.preventDefault(); await supabase.from('submissions').insert([{ name: e.target[0].value, email: e.target[1].value, company: e.target[2].value, role: e.target[3].value }]); alert("Submitted!"); setActiveView(null); }}><input className="w-full p-4 bg-black border" placeholder="Name" required /><input className="w-full p-4 bg-black border" placeholder="Email" required /><input className="w-full p-4 bg-black border" placeholder="Company" required /><input className="w-full p-4 bg-black border" placeholder="Role" required /><button type="submit" className="w-full py-4 bg-emerald-600">SUBMIT</button></form>}
            {activeView === 'available' && <div className="max-w-4xl mx-auto">{submissions.map((sub, i) => <div key={i} className="p-6 mb-4 bg-slate-900 border border-emerald-500/30 rounded flex justify-between items-center"><div><h3 className="text-xl font-bold">{sub.name}</h3><p className="text-sm text-slate-400">{sub.company} - {sub.role}</p></div><button className="bg-emerald-600 px-6 py-3 font-bold hover:bg-emerald-500 transition-all text-white">APPLY</button></div>)}</div>}
            {activeView === 'contribute' && <div className="p-16 border border-slate-800 text-center">{!isAuthorized ? <div className="space-y-4"><input type="email" placeholder="Email" onChange={(e) => setEmail(e.target.value)} className="w-full p-4 bg-black border" /><input type="password" placeholder="Pass" onChange={(e) => setPassword(e.target.value)} className="w-full p-4 bg-black border" /><button onClick={async () => { const { error } = await supabase.auth.signInWithPassword({ email, password }); if (!error) setIsAuthorized(true); else alert(error.message); }} className="w-full py-4 bg-emerald-600">LOGIN</button></div> : <p>HR Portal Active</p>}</div>}
            {activeView === 'network' && <div className="max-w-4xl mx-auto">{partnerFiles.map((f, i) => <div key={i} className="p-6 mb-4 bg-slate-900 border border-purple-500/30 rounded flex justify-between items-center"><div><span className="block font-bold text-lg text-white">{f.name}</span></div><button onClick={() => window.open(f.url, '_blank')} className="px-4 py-2 border border-purple-500 text-purple-400 hover:bg-purple-500 hover:text-white transition-all font-bold">DOWNLOAD</button></div>)}</div>}
            {activeView === 'quiz' && <div className="max-w-4xl mx-auto p-8"><div className="flex justify-between items-center mb-8"><h1 className="text-3xl font-bold text-emerald-400">AML/KYC Quiz</h1><div className="bg-slate-800 p-4 rounded border border-emerald-500 font-bold">SCORE: {score}</div></div>{isLoading ? <p>Loading...</p> : testData.map((item, index) => <QuizItem key={index} item={item} onCorrect={() => setScore(s => s + 1)} />)}</div>}
            {activeView === 'privacy' && <div className="p-8 bg-slate-900 border border-slate-800 rounded"><h1>{privacyPolicy.title}</h1><p>{privacyPolicy.body}</p></div>}
            {activeView === 'terms' && <div className="p-8 bg-slate-900 border border-slate-800 rounded"><h1>{termsOfService.title}</h1><p>{termsOfService.body}</p></div>}
            {activeView === 'faq' && <div className="p-8 bg-slate-900 border border-slate-800 rounded">{faqData.map((item, i) => <details key={i} className="mb-6"><summary className="cursor-pointer font-bold">{item.question}</summary><p>{item.answer}</p></details>)}</div>}
            {activeView === 'contact' && <div className="p-8 bg-slate-900 border border-slate-800 rounded"><h1>{contactContent.title}</h1><p>{contactContent.body}</p></div>}
          </div>
        </div>
      )}

      {/* FOOTER */}
      <footer className="bg-[#0b1c2e] text-white p-12 mt-10">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
          <div className="space-y-6">
            <div className="mb-8">
              <img src="/logo.png" alt="Logo" className="h-10 w-auto mb-4 object-contain" />
              <p className="text-sm leading-relaxed">AMLDecode is your go-to platform for AML, KYC, EDD, and Transaction Monitoring learning. We provide interview preparation notes, industry insights, and latest job opportunities to help professionals grow their careers in financial crime compliance.</p>
            </div>
            <div className="flex flex-col gap-2 text-sm text-slate-300">
              <button onClick={() => setActiveView('faq')} className="hover:text-white transition-colors text-left">FAQ</button>
              <button onClick={() => setActiveView('contact')} className="hover:text-white transition-colors text-left">Contact Us</button>
              <button onClick={() => setActiveView('privacy')} className="hover:text-white transition-colors">Privacy</button>
              <button onClick={() => setActiveView('terms')} className="hover:text-white transition-colors">Terms of Service</button>
              
            </div>
          </div>
          <div className="flex flex-col md:items-end gap-6">
            <div className="flex flex-wrap justify-end gap-4 text-xs text-slate-400 mt-4">
             <span>© 2026 AML_DECODE / Designed by @ Nitesh</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}