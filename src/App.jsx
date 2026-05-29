import React, { useState, useEffect, useRef } from 'react';
import { supabase } from './supabaseClient';
import { notesContent, privacyPolicy, termsOfService, faqData, contactContent } from './content';
import { jobOpenings } from './jobs';
import { kycNews } from './news';

// 1. STABLE QUIZ COMPONENT: Keeps state outside the main App loop
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

  useEffect(() => {
    const fetchData = async () => {
      const { data: subs } = await supabase.from('submissions').select('*');
      const { data: files } = await supabase.from('partner_files').select('*');
      const { data: news } = await supabase.from('news').select('*');
      const { data: quiz } = await supabase.from('quiz_questions').select('*');
      if (subs) setSubmissions(subs);
      if (files) setPartnerFiles(files);
      if (news) setNewsList(news);
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
        <div className="hidden md:flex gap-6 items-center">{navItems.map(item => <button key={item.id} onClick={() => setActiveView(item.id)} className="text-xs font-black text-emerald-400 hover:text-white uppercase">{item.label}</button>)}</div>
        <button className="md:hidden text-emerald-500 text-2xl z-[60] p-2" onClick={() => setIsMenuOpen(!isMenuOpen)}>{isMenuOpen ? "✕" : "☰"}</button>
      </nav>

      {/* MOBILE MENU */}
      {isMenuOpen && (
        <div className="md:hidden fixed inset-0 top-[80px] z-[999] bg-[#030712] p-6 flex flex-col gap-6" onClick={() => setIsMenuOpen(false)}>
          {navItems.map(item => <button key={item.id} onClick={() => { setActiveView(item.id); setIsMenuOpen(false); }} className="text-xl font-black text-left text-emerald-400 uppercase border-b border-emerald-500/10 pb-4">{item.label}</button>)}
        </div>
      )}

      {/* HOME PAGE */}
      {!activeView && (
        <main className="flex-grow">
          <section className="w-full relative bg-black">
            <video className="w-full h-[500px] object-cover" autoPlay muted={isMuted} loop playsInline><source src="/intro.mp4" type="video/mp4" /></video>
            <button onClick={() => setIsMuted(!isMuted)} className="absolute bottom-8 right-8 z-20 bg-emerald-600/80 hover:bg-emerald-500 text-white px-6 py-2 rounded-full font-bold backdrop-blur-sm transition-all">{isMuted ? "UNMUTE" : "MUTE"}</button>
          </section>
          <div className="max-w-7xl mx-auto px-6 py-16">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {navItems.map(card => <div key={card.id} onClick={() => setActiveView(card.id)} className="p-8 border border-emerald-500/20 rounded cursor-pointer hover:translate-y-[-5px] transition-all"><h3 className="font-bold text-emerald-400 uppercase">{card.label}</h3></div>)}
            </div>
          </div>
          <section className="bg-black border-t border-emerald-500/20 py-16 px-6">
            <div className="max-w-7xl mx-auto"><h2 className="text-emerald-500 font-bold mb-8 uppercase">&gt; Latest KYC News</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">{kycNews.slice(0, 3).map((n, i) => <a key={i} href={n.link} target="_blank" className="p-6 bg-slate-900 border border-white/5 rounded hover:border-emerald-500/50 block"><p className="text-white font-bold mb-2">{n.title}</p><span className="text-emerald-500 text-xs font-bold">READ MORE →</span></a>)}</div></div>
          </section>
        </main>
      )}

      {/* MODAL VIEW */}
      {activeView && (
        <div className="fixed inset-0 z-[100] bg-black/95 p-12 overflow-y-auto">
          <button onClick={() => { setActiveView(null); setScore(0); }} className="text-emerald-400 font-bold mb-10">&larr; BACK</button>
          <div className="max-w-4xl mx-auto text-white">
            {activeView === 'notes' && <div className="flex flex-row h-[80vh] gap-4"><div className="w-1/4 space-y-2 overflow-y-auto">{notesContent.map((n, i) => <button key={i} onClick={() => setPageIndex(i)} className={`w-full p-2 text-left text-sm border ${pageIndex === i ? "bg-emerald-600" : "border-slate-700"}`}>{n.title}</button>)}</div><div className="flex-grow p-4 bg-slate-900">{notesContent[pageIndex]?.body}</div></div>}
            {activeView === 'jobs' && <div className="space-y-4">{jobOpenings.map((j, i) => <div key={i} className="p-4 border border-slate-800 flex justify-between"><div><p className="text-emerald-400">{j.company}</p><p>{j.role}</p></div><a href={j.link} className="bg-emerald-600 px-4 py-2">APPLY</a></div>)}</div>}
            {activeView === 'referralForm' && <form className="space-y-4" onSubmit={async(e) => { e.preventDefault(); await supabase.from('submissions').insert([{ name: e.target[0].value, email: e.target[1].value, company: e.target[2].value, role: e.target[3].value }]); alert("Submitted!"); setActiveView(null); }}><input className="w-full p-4 bg-black border" placeholder="Name" required/><input className="w-full p-4 bg-black border" placeholder="Email" required/><input className="w-full p-4 bg-black border" placeholder="Company" required/><input className="w-full p-4 bg-black border" placeholder="Role" required/><button className="w-full py-4 bg-emerald-600">SUBMIT</button></form>}
            {activeView === 'available' && <div className="space-y-4">{submissions.map((s, i) => <div key={i} className="p-4 border border-emerald-500/30 flex justify-between"><div><h3 className="font-bold">{s.name}</h3><p>{s.company}</p></div><button className="bg-emerald-600 px-6 py-2">APPLY</button></div>)}</div>}
            {activeView === 'contribute' && <div className="p-16 text-center">{!isAuthorized ? <div className="space-y-4"><input type="email" placeholder="Email" onChange={(e) => setEmail(e.target.value)} className="w-full p-4 bg-black border"/><input type="password" placeholder="Pass" onChange={(e) => setPassword(e.target.value)} className="w-full p-4 bg-black border"/><button onClick={async() => { const { error } = await supabase.auth.signInWithPassword({ email, password }); if (!error) setIsAuthorized(true); }} className="w-full py-4 bg-emerald-600">LOGIN</button></div> : <p>HR Portal Active</p>}</div>}
            {activeView === 'network' && <div className="space-y-4">{partnerFiles.map((f, i) => <div key={i} className="p-4 border border-purple-500/30 flex justify-between"><span>{f.name}</span><button onClick={() => window.open(f.url, '_blank')} className="border border-purple-500 px-4">DOWNLOAD</button></div>)}</div>}
            {activeView === 'quiz' && <div className="space-y-8"><div className="flex justify-between items-center"><h1 className="text-3xl font-bold">Quiz</h1><div className="font-bold">SCORE: {score}</div></div>{isLoading ? <p>Loading...</p> : testData.map((item, index) => <QuizItem key={index} item={item} onCorrect={() => setScore(s => s + 1)} />)}</div>}
            {activeView === 'privacy' && <div className="p-8 bg-slate-900"><h1>{privacyPolicy.title}</h1><p>{privacyPolicy.body}</p></div>}
            {activeView === 'terms' && <div className="p-8 bg-slate-900"><h1>{termsOfService.title}</h1><p>{termsOfService.body}</p></div>}
            {activeView === 'faq' && <div className="p-8 bg-slate-900">{faqData.map((item, i) => <details key={i} className="mb-4"><summary className="font-bold">{item.question}</summary><p>{item.answer}</p></details>)}</div>}
            {activeView === 'contact' && <div className="p-8 bg-slate-900"><h1>{contactContent.title}</h1><p>{contactContent.body}</p></div>}
          </div>
        </div>
      )}

      {/* FOOTER */}
      <footer className="bg-[#0b1c2e] text-white p-12 mt-10">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
          <div className="space-y-6">
            <div className="mb-8">
              <img src="/logo.png" alt="Logo" className="h-10 w-auto mb-4 object-contain" />
              <p className="text-sm leading-relaxed">AML_DECODE is a specialized platform dedicated to the AML and KYC sector.</p>
            </div>
            <div className="flex flex-col gap-2 text-sm text-slate-300">
              <button onClick={() => setActiveView('faq')} className="hover:text-white transition-colors text-left">FAQ</button>
              <button onClick={() => setActiveView('contact')} className="hover:text-white transition-colors text-left">Contact Us</button>
            </div>
          </div>
          <div className="flex flex-col md:items-end gap-6">
            <div className="flex flex-wrap justify-end gap-4 text-xs text-slate-400 mt-4">
              <button onClick={() => setActiveView('privacy')} className="hover:text-white transition-colors">Privacy</button>
              <button onClick={() => setActiveView('terms')} className="hover:text-white transition-colors">Terms of Service</button>
              <span>© 2026 AML_DECODE / Designed by @ Nitesh</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}