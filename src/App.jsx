import React, { useState, useEffect, useRef } from 'react';
import { supabase } from './supabaseClient';
import { notesContent, privacyPolicy, termsOfService, faqData, contactContent } from './content';
import { jobOpenings } from './jobs';
import { kycNews } from './news';

// 1. QUIZ COMPONENT - Isolated to prevent state conflicts
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
          } catch { return <p className="text-red-500">Error: Invalid data format</p>; }
        })()}
      </div>
    </div>
  );
}

export default function App() {
  const [activeView, setActiveView] = useState(null);
  const [pageIndex, setPageIndex] = useState(0);
  const [isMuted, setIsMuted] = useState(true);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [testData, setTestData] = useState([]);
  const [score, setScore] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      const { data: quiz } = await supabase.from('quiz_questions').select('*');
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
    <div className="text-slate-100 font-mono min-h-screen flex flex-col bg-[#030712]">
      {/* NAVBAR */}
      <nav className="p-6 border-b border-emerald-500/30 flex items-center justify-between sticky top-0 bg-[#030712]/90 backdrop-blur-lg z-50">
        <div onClick={() => setActiveView(null)} className="cursor-pointer h-16 flex items-center shrink-0">
          <img src="/logo.png" alt="Logo" className="h-full w-auto" />
        </div>
        <div className="hidden md:flex gap-6">{navItems.map(item => <button key={item.id} onClick={() => setActiveView(item.id)} className="text-xs font-black text-emerald-400 uppercase">{item.label}</button>)}</div>
        <button className="md:hidden text-emerald-500 text-2xl" onClick={() => setIsMenuOpen(!isMenuOpen)}>{isMenuOpen ? "✕" : "☰"}</button>
      </nav>

      {/* MOBILE MENU */}
      {isMenuOpen && (
        <div className="md:hidden fixed inset-0 top-[80px] z-[999] bg-[#030712] p-6 flex flex-col gap-6">
          {navItems.map(item => <button key={item.id} onClick={() => { setActiveView(item.id); setIsMenuOpen(false); }} className="text-xl font-black text-emerald-400 uppercase">{item.label}</button>)}
        </div>
      )}

      {/* CONTENT AREA */}
      <main className="flex-grow">
        {!activeView ? (
          <>
            <section className="relative bg-black">
              <video className="w-full h-[500px] object-cover" autoPlay muted={isMuted} loop playsInline><source src="/intro.mp4" type="video/mp4" /></video>
              <button onClick={() => setIsMuted(!isMuted)} className="absolute bottom-8 right-8 bg-emerald-600 px-6 py-2 rounded-full font-bold">{isMuted ? "UNMUTE" : "MUTE"}</button>
            </section>
            <div className="max-w-7xl mx-auto px-6 py-16 grid grid-cols-1 md:grid-cols-3 gap-8">
              {navItems.map(card => <div key={card.id} onClick={() => setActiveView(card.id)} className="p-8 border border-emerald-500/20 rounded cursor-pointer hover:bg-emerald-900/10 font-bold text-emerald-500 uppercase">{card.label}</div>)}
            </div>
          </>
        ) : (
          <div className="p-12 max-w-4xl mx-auto">
            <button onClick={() => { setActiveView(null); setScore(0); }} className="text-emerald-400 font-bold mb-10">&larr; BACK</button>
            {activeView === 'quiz' && (
              <div className="space-y-8">
                <div className="flex justify-between items-center"><h1 className="text-3xl font-bold">Quiz</h1><div className="font-bold">SCORE: {score}</div></div>
                {isLoading ? <p>Loading...</p> : testData.map((item, index) => <QuizItem key={index} item={item} onCorrect={() => setScore(s => s + 1)} />)}
              </div>
            )}
            {/* Add other activeView conditions here as needed */}
          </div>
        )}
      </main>

      {/* FOOTER */}
      <footer className="bg-[#0b1c2e] text-white p-12 mt-10">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
          <div className="space-y-6"><img src="/logo.png" alt="Logo" className="h-10 w-auto"/><p className="text-sm">AML_DECODE platform.</p></div>
          <div className="flex flex-col md:items-end gap-4 text-sm text-slate-300"><button onClick={() => setActiveView('faq')}>FAQ</button><button onClick={() => setActiveView('contact')}>Contact Us</button><p className="text-xs">© 2026 AML_DECODE</p></div>
        </div>
      </footer>
    </div>
  );
}