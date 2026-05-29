import React, { useState, useEffect, useRef } from 'react';
import { supabase } from './supabaseClient';
import { notesContent, privacyPolicy, termsOfService, faqData, contactContent } from './content';
import { jobOpenings } from './jobs';
import { kycNews } from './news';

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
  const [testData, setTestData] = useState(null);
  const contentRef = useRef(null);
  const [score, setScore] = React.useState(0);
const [answeredCount, setAnsweredCount] = React.useState(0);

  useEffect(() => {
    let active = true;
    const fetchData = async () => {
      const { data: subs } = await supabase.from('submissions').select('*');
      const { data: files } = await supabase.from('partner_files').select('*');
      const { data: news } = await supabase.from('news').select('*');
      if (active) {
        if (subs) setSubmissions(subs);
        if (files) setPartnerFiles(files);
        if (news) setNewsList(news);
        setIsLoading(false);
      }
    };
    fetchData();

async function testConnection() {
  console.log("1. Starting fetch...");
  
  // We are adding the .schema('public') call to be explicit
  const { data, error } = await supabase
    .schema('public')
    .from('quiz_questions')
    .select('*');
  
  if (error) {
    console.error("2. ERROR FOUND:", error);
  } else {
    console.log("2. SUCCESS. Data received:", data);
    console.log("3. Array length:", data.length);
    setTestData(data); 
  }
}
    testConnection();
  }, []);

  return (
    <div className="text-slate-100 font-mono min-h-screen flex flex-col relative bg-[#030712]">
      <nav className="p-6 border-b border-emerald-500/30 flex items-center justify-between sticky top-0 bg-[#030712]/90 backdrop-blur-lg z-50 w-full shadow-[0_0_20px_rgba(16,185,129,0.1)]">
        <div onClick={() => setActiveView(null)} className="cursor-pointer h-16 flex items-center shrink-0">
          <img src="/logo.png" alt="AML_DECODE Logo" className="h-full w-auto object-contain" />
        </div>
        <div className="hidden md:flex gap-6 items-center overflow-x-auto">
          {[ 
            { label: 'NOTES', id: 'notes' }, 
            { label: 'JOBS', id: 'jobs' }, 
            { label: 'SUBMIT REFERRAL', id: 'referralForm' }, 
            { label: 'AVAILABLE REFERRAL', id: 'available' }, 
            { label: 'HR DASHBOARD', id: 'contribute' }, 
            { label: 'NETWORK JOBS', id: 'network' }, 
            { label: 'QUIZ', id: 'quiz' }
          ].map((item) => (
            <button key={item.id} onClick={() => setActiveView(item.id)} className="text-xs font-black text-emerald-400 hover:text-white transition-all uppercase whitespace-nowrap">
              {item.label}
            </button>
          ))}
        </div>
        <button className="md:hidden text-emerald-500 text-2xl z-[60] p-2" onClick={() => setIsMenuOpen(!isMenuOpen)}>{isMenuOpen ? "✕" : "☰"}</button>
      </nav>

      {isMenuOpen && (
        <div className="md:hidden fixed inset-0 top-[80px] z-[999] bg-[#030712] p-6 flex flex-col gap-6" onClick={() => setIsMenuOpen(false)}>
          {[{label: 'NOTES', id: 'notes'}, {label: 'JOBS', id: 'jobs'}, {label: 'SUBMIT REFERRAL', id: 'referralForm'}, {label: 'AVAILABLE REFERRAL', id: 'available'}, {label: 'HR DASHBOARD', id: 'contribute'}, {label: 'NETWORK JOBS', id: 'network'}].map((item) => (
            <button key={item.id} onClick={() => { setActiveView(item.id); setIsMenuOpen(false); }} className="text-xl font-black text-left text-emerald-400 uppercase border-b border-emerald-500/10 pb-4">
              {item.label}
            </button>
          ))}
        </div>
      )}

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
              {[ {id: 'network', icon: '🤝', label: 'Featured Network'}, {id: 'notes', icon: '📖', label: 'Notes'}, {id: 'jobs', icon: '💼', label: 'Jobs'}, {id: 'referralForm', icon: '📤', label: 'Submit Referral'}, {id: 'available', icon: '🔍', label: 'Available Referral'}, {id: 'contribute', icon: '📁', label: 'HR Dashboard'} ].map(card => (
                <div key={card.id} onClick={() => setActiveView(card.id)} className="p-8 border border-emerald-500/20 rounded cursor-pointer hover:translate-y-[-5px] transition-all">
                  <div className="text-4xl mb-6">{card.icon}</div>
                  <h3 className="font-bold text-emerald-400 uppercase">{card.label}</h3>
                </div>
              ))}
            </div>
          </div>
        </main>
      )}

      {activeView && (
        <div className="fixed inset-0 z-[100] bg-black/95 p-12 overflow-y-auto">
          <button onClick={() => setActiveView(null)} className="text-emerald-400 font-bold mb-10">&larr; BACK</button>
          <div className="max-w-4xl mx-auto text-white">
            {activeView === 'notes' && (
              <div className="flex flex-row w-full h-[80vh] gap-2 p-2">
                <div className="w-[120px] md:w-[250px] space-y-2 flex-shrink-0 overflow-y-auto">
                  {notesContent.map((item, idx) => (
                    <button key={idx} onClick={() => { setPageIndex(idx); if (contentRef.current) contentRef.current.scrollTop = 0; }} className={`w-full text-xs md:text-sm text-left p-2 md:p-4 rounded border transition-colors truncate ${pageIndex === idx ? "bg-emerald-600 border-emerald-500 text-white" : "bg-transparent border-slate-700 text-slate-300 hover:border-emerald-500"}`}>
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
            {activeView === 'jobs' && <div className="bg-[#030712]/80 rounded border border-slate-800">{jobOpenings.map((job, idx) => <div key={idx} className="p-6 border-b border-slate-800 flex justify-between"><div><p className="text-emerald-400">{job.company}</p><h2>{job.role}</h2></div><a href={job.link} target="_blank" className="bg-indigo-600 px-6 py-2">APPLY</a></div>)}</div>}
            {activeView === 'referralForm' && (
              <form className="space-y-4" onSubmit={async (e) => { e.preventDefault(); const { error } = await supabase.from('submissions').insert([{ name: e.target[0].value, email: e.target[1].value, company: e.target[2].value, role: e.target[3].value }]); if (!error) { alert("Submitted!"); setActiveView(null); }}}>
                <input className="w-full p-4 bg-black border" placeholder="Name" required /><input className="w-full p-4 bg-black border" placeholder="Email" required /><input className="w-full p-4 bg-black border" placeholder="Company" required /><input className="w-full p-4 bg-black border" placeholder="Role" required />
                <button type="submit" className="w-full py-4 bg-emerald-600">SUBMIT</button>
              </form>
            )}
            {activeView === 'available' && (
              <div className="max-w-4xl mx-auto">
                <h1 className="text-3xl font-black mb-8 uppercase text-emerald-500">Available Referrals</h1>
                {submissions.map((sub, i) => (
                  <div key={i} className="p-6 mb-4 bg-slate-900 border border-emerald-500/30 rounded flex justify-between items-center">
                    <div><h3 className="text-xl font-bold">{sub.name}</h3><p className="text-sm text-slate-400">{sub.company} - {sub.role}</p></div>
                    <label className="cursor-pointer bg-emerald-600 px-6 py-3 font-bold hover:bg-emerald-500 transition-all text-white">
                      <span>APPLY WITH RESUME</span>
                      <input type="file" className="hidden" accept=".pdf,.docx" onChange={async (e) => {
                        const file = e.target.files[0]; if (!file) return;
                        const userEmail = prompt("Enter your email:"); if (!userEmail) return;
                        const { data, error } = await supabase.storage.from('resumes').upload(`${Date.now()}_${file.name}`, file);
                        if (error) { alert("Upload error: " + error.message); return; }
                        const { data: urlData } = supabase.storage.from('resumes').getPublicUrl(data.path);
                        await supabase.from('interests').insert([{ submission_id: sub.id, sender_email: userEmail, resume_url: urlData.publicUrl }]);
                        alert("Application sent successfully!");
                      }} />
                    </label>
                  </div>
                ))}
              </div>
            )}
            {activeView === 'contribute' && (
              <div className="p-16 border border-slate-800 text-center">
                {!isAuthorized ? (
                  <div className="space-y-4">
                    <input type="email" placeholder="Email" onChange={(e) => setEmail(e.target.value)} className="w-full p-4 bg-black border" />
                    <input type="password" placeholder="Pass" onChange={(e) => setPassword(e.target.value)} className="w-full p-4 bg-black border" />
                    <button onClick={async () => { const { error } = await supabase.auth.signInWithPassword({ email, password }); if (!error) setIsAuthorized(true); else alert(error.message); }} className="w-full py-4 bg-emerald-600">LOGIN</button>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <h2 className="text-xl font-bold">HR UPLOAD PORTAL</h2>
                    <input type="file" id="fileUpload" className="hidden" onChange={async (e) => {
                      const file = e.target.files[0]; if(!file) return;
                      setIsLoading(true);
                      const { data, error } = await supabase.storage.from('partner-files').upload(`${Date.now()}_${file.name}`, file);
                      if (error) { alert("Storage Error: " + error.message); setIsLoading(false); return; }
                      const { data: u } = supabase.storage.from('partner-files').getPublicUrl(data.path);
                      const { error: dbError } = await supabase.from('partner_files').insert([{ name: file.name, url: u.publicUrl }]);
                      if (dbError) alert("Database Error: " + dbError.message); else alert("Uploaded Successfully!");
                      setIsLoading(false);
                    }} />
                    <label htmlFor="fileUpload" className="cursor-pointer bg-emerald-600 px-8 py-4 font-bold text-white hover:bg-emerald-500">SELECT & UPLOAD FILE</label>
                  </div>
                )}
              </div>
            )}
            {activeView === 'network' && (
              <div className="max-w-4xl mx-auto">
                <h1 className="text-3xl font-black mb-8 uppercase text-emerald-500">Network Feed</h1>
                {partnerFiles.length === 0 ? <p className="text-slate-500">No partner uploads yet.</p> : partnerFiles.map((f, i) => (
                  <div key={i} className="p-6 mb-4 bg-slate-900 border border-purple-500/30 rounded flex justify-between items-center">
                    <div><span className="block font-bold text-lg text-white">{f.name}</span></div>
                    <button onClick={() => window.open(f.url, '_blank')} className="px-4 py-2 border border-purple-500 text-purple-400 hover:bg-purple-500 hover:text-white transition-all font-bold">DOWNLOAD</button>
                  </div>
                ))}
              </div>
            )}
            {/* ADD THIS NEW QUIZ SECTION HERE */}
   {activeView === 'quiz' && (
  <div className="max-w-4xl mx-auto p-8 text-white">
    <div className="flex justify-between items-center mb-8">
      <h1 className="text-3xl font-bold text-emerald-400">AML/KYC Quiz</h1>
      <div className="bg-slate-800 p-4 rounded border border-emerald-500">
        <span className="text-emerald-400 font-bold">SCORE: {score} / {testData.length}</span>
      </div>
    </div>
    
    {testData.map((item, index) => {
      const [selected, setSelected] = React.useState(null);
      const [isLocked, setIsLocked] = React.useState(false);

      const handleAnswer = (option) => {
        if (isLocked) return; // Prevent changing answer
        
        setSelected(option);
        setIsLocked(true);
        setAnsweredCount(prev => prev + 1);
        
        if (option === item.correct_answer) {
          setScore(prev => prev + 1);
        }
      };

      return (
        <div key={index} className="mb-8 p-6 bg-slate-900 border border-slate-700 rounded">
          <h2 className="text-xl font-bold mb-4">{item.question}</h2>
          <div className="space-y-3">
            {(() => {
              try {
                const optionsArray = typeof item.options === 'string' ? JSON.parse(item.options) : item.options;
                return optionsArray.map((option, i) => (
                  <button 
                    key={i} 
                    disabled={isLocked}
                    className={`block w-full text-left p-4 bg-black border rounded transition-all ${
                      selected === option 
                        ? (option === item.correct_answer ? "border-green-500 bg-green-900/20" : "border-red-500 bg-red-900/20") 
                        : "border-slate-600 hover:border-emerald-500"
                    }`}
                    onClick={() => handleAnswer(option)}
                  >
                    {option}
                  </button>
                ));
              } catch (e) { return <p className="text-red-500">Error: Format issue.</p>; }
            })()}
          </div>
        </div>
      );
    })}
  </div>
)}
            {activeView === 'privacy' && <div className="max-w-3xl mx-auto p-8 bg-slate-900 border border-slate-800 rounded"><h1 className="text-2xl font-bold mb-6 text-emerald-400">{privacyPolicy.title}</h1><p className="whitespace-pre-wrap text-slate-300 leading-relaxed">{privacyPolicy.body}</p></div>}
            {activeView === 'terms' && <div className="max-w-3xl mx-auto p-8 bg-slate-900 border border-slate-800 rounded"><h1 className="text-2xl font-bold mb-6 text-emerald-400">{termsOfService.title}</h1><p className="whitespace-pre-wrap text-slate-300 leading-relaxed">{termsOfService.body}</p></div>}
            {activeView === 'faq' && <div className="max-w-3xl mx-auto p-8 bg-slate-900 border border-slate-800 rounded"><h1 className="text-2xl font-bold mb-8 text-emerald-400">Frequently Asked Questions</h1>{faqData.map((item, index) => <details key={index} className="mb-6 border-b border-slate-700 pb-4"><summary className="font-semibold text-white cursor-pointer hover:text-emerald-400 list-none">{item.question}</summary><p className="mt-3 text-slate-300 leading-relaxed text-sm">{item.answer}</p></details>)}</div>}
            {activeView === 'contact' && <div className="max-w-3xl mx-auto p-8 bg-slate-900 border border-slate-800 rounded"><h1 className="text-2xl font-bold mb-6 text-emerald-400">{contactContent.title}</h1><p className="whitespace-pre-wrap text-slate-300 leading-relaxed">{contactContent.body}</p></div>}
          </div>
        </div>
      )}

      <section className="bg-black border-t border-emerald-500/20 py-16 px-6">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-emerald-500 font-bold mb-8 uppercase">&gt; Latest KYC News</h2>
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

      <footer className="bg-[#0b1c2e] text-white p-12 mt-10">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
          <div className="space-y-6">
            <div className="mb-8">
              <img src="/logo.png" alt="AML_DECODE Logo" className="h-10 w-auto mb-4 object-contain" />
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