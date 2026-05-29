import React, { useState, useEffect, useRef } from 'react';
import { supabase } from './supabaseClient';
import { notesContent, privacyPolicy, termsOfService, faqData, contactContent } from './content';
import { jobOpenings } from './jobs';
import { kycNews } from './news';

export default function App() {
  const [activeView, setActiveView] = useState(null);
  const [pageIndex, setPageIndex] = useState(0);
  const [isMuted, setIsMuted] = useState(true);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const contentRef = useRef(null);

  const navItems = [
    { label: 'NOTES', id: 'notes' },
    { label: 'JOBS', id: 'jobs' },
    { label: 'SUBMIT REFERRAL', id: 'referralForm' },
    { label: 'AVAILABLE REFERRAL', id: 'available' },
    { label: 'HR DASHBOARD', id: 'contribute' },
    { label: 'NETWORK JOBS', id: 'network' },
    { label: 'QUIZ', id: 'quiz' }
  ];

  return (
    <div className="text-slate-100 font-mono min-h-screen flex flex-col relative bg-[#030712]">
      {/* NAVIGATION */}
      <nav className="p-6 border-b border-emerald-500/30 flex items-center justify-between sticky top-0 bg-[#030712]/90 backdrop-blur-lg z-50">
        <div onClick={() => setActiveView(null)} className="cursor-pointer h-16 flex items-center">
          <img src="/logo.png" alt="AML_DECODE Logo" className="h-full w-auto" />
        </div>
        <div className="hidden md:flex gap-6">
          {navItems.map(item => (
            <button key={item.id} onClick={() => setActiveView(item.id)} className="text-xs font-black text-emerald-400 hover:text-white uppercase">{item.label}</button>
          ))}
        </div>
        <button className="md:hidden text-emerald-500 text-2xl" onClick={() => setIsMenuOpen(!isMenuOpen)}>{isMenuOpen ? "✕" : "☰"}</button>
      </nav>

      {/* MAIN CONTENT AREA */}
      <main className="flex-grow">
        {!activeView ? (
          <>
            <section className="relative bg-black">
              <video className="w-full h-[500px] object-cover" autoPlay muted={isMuted} loop playsInline>
                <source src="/intro.mp4" type="video/mp4" />
              </video>
              <button onClick={() => setIsMuted(!isMuted)} className="absolute bottom-8 right-8 bg-emerald-600 px-6 py-2 rounded-full font-bold">{isMuted ? "UNMUTE" : "MUTE"}</button>
            </section>
            
            <div className="max-w-7xl mx-auto px-6 py-16 grid grid-cols-1 md:grid-cols-3 gap-8">
              {navItems.map(item => (
                <div key={item.id} onClick={() => setActiveView(item.id)} className="p-8 border border-emerald-500/20 rounded cursor-pointer hover:bg-emerald-900/10 transition-all font-bold text-emerald-500 uppercase">{item.label}</div>
              ))}
            </div>

            <section className="bg-black border-t border-emerald-500/20 py-16 px-6">
              <div className="max-w-7xl mx-auto">
                <h2 className="text-emerald-500 font-bold mb-8 uppercase">&gt; Latest KYC News</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {kycNews.slice(0, 3).map((news, i) => (
                    <a key={i} href={news.link} target="_blank" rel="noopener noreferrer" className="p-6 bg-slate-900 border border-white/5 rounded hover:border-emerald-500/50 block">
                      <p className="text-white font-bold mb-2">{news.title}</p>
                      <span className="text-emerald-500 text-xs font-bold">READ MORE →</span>
                    </a>
                  ))}
                </div>
              </div>
            </section>
          </>
        ) : (
          <div className="p-12 max-w-4xl mx-auto">
            <button onClick={() => setActiveView(null)} className="text-emerald-400 font-bold mb-10">&larr; BACK</button>
            {/* View content logic would go here */}
            <h1 className="text-3xl text-emerald-500 uppercase">{activeView} Section</h1>
          </div>
        )}
      </main>

      {/* FOOTER */}
      <footer className="bg-[#0b1c2e] text-white p-12 mt-10">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
          <div className="space-y-6">
            <img src="/logo.png" alt="Logo" className="h-10 w-auto" />
            <p className="text-sm">AML_DECODE is a specialized platform dedicated to the AML and KYC sector.</p>
          </div>
          <div className="flex flex-col md:items-end gap-4 text-sm text-slate-300">
            <button onClick={() => setActiveView('faq')}>FAQ</button>
            <button onClick={() => setActiveView('contact')}>Contact Us</button>
            <p className="text-xs">© 2026 AML_DECODE / Designed by @ Nitesh</p>
          </div>
        </div>
      </footer>
    </div>
  );
}