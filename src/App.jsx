import React, { useState, useEffect } from 'react';
import { notesContent } from './content';
import { jobOpenings } from './jobs';
import { kycNews } from './news';

export default function App() {
  const [activeView, setActiveView] = useState(null);
  const [pageIndex, setPageIndex] = useState(0);
  const [isMuted, setIsMuted] = useState(true);
  const [filter, setFilter] = useState("All");

  const [referrals, setReferrals] = useState(() => {
    const saved = localStorage.getItem('kyc_referrals');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('kyc_referrals', JSON.stringify(referrals));
  }, [referrals]);

  const handleFormSubmit = (e) => {
    e.preventDefault();
    const newRef = {
      name: e.target.name.value,
      company: e.target.company.value,
      designation: e.target.designation.value,
      roleDesc: e.target.roleDesc.value,
      email: e.target.email.value,
      createdAt: Date.now()
    };
    setReferrals([...referrals, newRef]);
    e.target.reset();
    setActiveView(null);
  };

  const activeReferrals = referrals.filter(ref => (Date.now() - ref.createdAt) < (15 * 24 * 60 * 60 * 1000));

  return (
    <div className="bg-[#030712] text-slate-100 font-sans min-h-screen flex flex-col">
      
      {/* NAVIGATION */}
      <nav className="p-8 border-b border-white/5 flex items-center justify-between sticky top-0 bg-[#030712]/80 backdrop-blur-md z-50">
        <h1 className="text-2xl font-black tracking-[0.2em] text-emerald-500 cursor-pointer" onClick={() => setActiveView(null)}>
AMLDecode</h1>
        <div className="flex gap-6">
          <button onClick={() => setActiveView('notes')} className="text-sm font-bold hover:text-emerald-400 transition-all">NOTES</button>
          <button onClick={() => setActiveView('jobs')} className="text-sm font-bold hover:text-indigo-400 transition-all">JOBS</button>
          <button onClick={() => setActiveView('referralForm')} className="text-sm font-bold hover:text-white transition-all">SUBMIT</button>
          <button onClick={() => setActiveView('availability')} className="text-sm font-bold hover:text-white transition-all">AVAILABILITY</button>
        </div>
      </nav>

      {/* VIDEO */}
      {!activeView && (
        <section className="w-full relative">
           <video className="w-full h-[500px] object-cover" autoPlay muted={isMuted} loop playsInline>
              <source src="/intro.mp4" type="video/mp4" />
           </video>
           <button onClick={() => setIsMuted(!isMuted)} className="absolute bottom-8 right-8 bg-black/50 text-white px-4 py-2 rounded-lg backdrop-blur-md">
             {isMuted ? "🔇 Unmute" : "🔊 Mute"}
           </button>
        </section>
      )}

      {/* MAIN CONTENT */}
      {!activeView && (
        <main className="flex-grow max-w-7xl mx-auto px-6 py-16">
          <h2 className="text-4xl font-black text-center mb-16 text-white">How to use this Portal</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-24">
              <div className="p-8 bg-slate-900 border border-emerald-500/20 rounded-3xl"><div className="text-4xl mb-6">📖</div><h3 className="font-bold text-emerald-400 mb-2">Notes</h3><p className="text-sm text-slate-400">Review compliance frameworks.</p></div>
              <div className="p-8 bg-slate-900 border border-indigo-500/20 rounded-3xl"><div className="text-4xl mb-6">💼</div><h3 className="font-bold text-indigo-400 mb-2">Job Search</h3><p className="text-sm text-slate-400">Filter and apply to roles.</p></div>
              <div className="p-8 bg-slate-900 border border-white/10 rounded-3xl"><div className="text-4xl mb-6">📤</div><h3 className="font-bold text-white mb-2">Submit</h3><p className="text-sm text-slate-400">Post referral details.</p></div>
              <div className="p-8 bg-slate-900 border border-emerald-500/20 rounded-3xl"><div className="text-4xl mb-6">🔍</div><h3 className="font-bold text-emerald-400 mb-2">Availability</h3><p className="text-sm text-slate-400">Review referral slots.</p></div>
          </div>
          <section className="border-t border-white/5 pt-16">
            <h2 className="text-xl font-bold text-red-500 mb-8 flex items-center gap-2">● LATEST INDUSTRY NEWS</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {kycNews.map((news, idx) => (
                <a key={idx} href={news.link} target="_blank" rel="noopener noreferrer" className="block p-6 bg-slate-900 border border-white/5 rounded-2xl hover:border-red-500 hover:bg-slate-800 transition-all">
                  <h4 className="text-md font-semibold text-slate-200">{news.headline}</h4>
                  <span className="text-red-500 text-xs font-bold mt-4 block">READ MORE →</span>
                </a>
              ))}
            </div>
          </section>
        </main>
      )}

      {/* OVERLAYS */}
      {activeView === 'notes' && (
        <div className="fixed inset-0 z-[100] bg-black/95 p-12 overflow-y-auto">
          <button onClick={() => setActiveView(null)} className="text-emerald-400 font-bold mb-10">← Back</button>
          <div className="max-w-6xl mx-auto flex gap-12">
            <div className="w-1/4 space-y-2">{notesContent.map((item, idx) => <button key={idx} onClick={() => setPageIndex(idx)} className="w-full text-left p-4 rounded bg-slate-800 hover:bg-emerald-900">{item.title}</button>)}</div>
            <div className="w-3/4"><h1 className="text-4xl font-bold mb-6">{notesContent[pageIndex].title}</h1><p className="text-lg text-slate-300 whitespace-pre-line">{notesContent[pageIndex].body}</p></div>
          </div>
        </div>
      )}

      {activeView === 'jobs' && (
        <div className="fixed inset-0 z-[100] bg-[#030712] p-12 overflow-y-auto">
          <button onClick={() => setActiveView(null)} className="text-emerald-400 font-bold mb-8">← Back</button>
          <div className="max-w-5xl mx-auto">
            <h1 className="text-4xl font-black mb-8">Active Openings</h1>
            <select onChange={(e) => setFilter(e.target.value)} className="bg-slate-900 text-white p-3 rounded-lg mb-8 border border-slate-700 w-full">
              <option value="All">All Locations</option>
              <option value="Bengaluru">Bengaluru</option>
              <option value="Kolkata">Kolkata</option>
              <option value="Gurugram">Gurugram</option>
              <option value="Mumbai">Mumbai</option>
            </select>
            <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden">
              {(filter === "All" ? jobOpenings : jobOpenings.filter(j => j.location === filter)).map((job, idx) => (
                <div key={idx} className="flex items-center justify-between p-6 border-b border-slate-800">
                  <div><p className="text-emerald-400 font-bold text-xs">{job.company}</p><h2 className="text-lg font-semibold">{job.role}</h2></div>
                  <a href={job.link} target="_blank" rel="noopener noreferrer" className="px-6 py-2 bg-indigo-600 rounded-lg text-sm hover:bg-indigo-500">Apply</a>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeView === 'referralForm' && (
        <div className="fixed inset-0 z-[100] bg-black/95 p-12 overflow-y-auto">
            <button onClick={() => setActiveView(null)} className="text-emerald-400 font-bold mb-10">← Back</button>
            <form onSubmit={handleFormSubmit} className="max-w-2xl mx-auto bg-slate-900 p-8 rounded-3xl">
                <input name="name" placeholder="Name" className="w-full p-4 mb-4 bg-black rounded" required />
                <input name="email" type="email" placeholder="Email" className="w-full p-4 mb-4 bg-black rounded" required />
                <input name="company" placeholder="Company" className="w-full p-4 mb-4 bg-black rounded" required />
                <input name="designation" placeholder="Designation" className="w-full p-4 mb-4 bg-black rounded" required />
                <textarea name="roleDesc" placeholder="Role Description" className="w-full p-4 mb-4 bg-black rounded h-32" required />
                <button type="submit" className="w-full py-4 bg-emerald-600 rounded-xl font-bold">Submit</button>
            </form>
        </div>
      )}

      {activeView === 'availability' && (
        <div className="fixed inset-0 z-[100] bg-black/95 p-12 overflow-y-auto">
            <button onClick={() => setActiveView(null)} className="text-emerald-400 font-bold mb-10">← Back</button>
            <div className="max-w-4xl mx-auto grid grid-cols-1 gap-6">
                {activeReferrals.map((ref, i) => (
                    <div key={i} className="p-8 bg-slate-900 border border-emerald-500/30 rounded-3xl">
                        <h3 className="text-2xl font-bold text-emerald-400">{ref.name}</h3>
                        <p className="text-indigo-400 mb-2">{ref.designation} @ {ref.company}</p>
                        <a href={`mailto:${ref.email}`} className="px-6 py-2 bg-indigo-600 rounded-lg text-sm">Interest</a>
                    </div>
                ))}
            </div>
        </div>
      )}

      {/* FOOTER */}
      <footer className="py-10 text-center text-slate-500 border-t border-white/5">© 2026 
AML Decode | DESIGNED BY @NITESH</footer>
    </div>
  );
}