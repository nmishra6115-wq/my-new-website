import React, { useState, useEffect } from 'react';
import './design-tokens.css';
import { supabase } from './supabaseClient';
import { notesContent, privacyPolicy, termsOfService, faqData, contactContent } from './content';
import { jobOpenings } from './jobs';
import { kycNews } from './news';
import HomepageHub from './components/HomepageHub';
import SyllabusReader from './components/SyllabusReader';

function QuizItem({ item, index, onCorrect }) {
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
    <div className={`mb-6 overflow-hidden bg-[#0D1E30] border rounded-2xl transition-all duration-300 ${isLocked ? (isCorrect ? 'border-[#21D7C4]' : 'border-red-500/50') : 'border-white/10'}`}>
      <div className="p-6 border-b border-white/10 bg-[#132B3E]/40">
        <div className="flex justify-between items-start gap-4">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#21D7C4] block mb-1">
              Question {index + 1}
            </span>
            <h2 className="text-lg sm:text-xl font-bold text-[#F5F8FC] leading-snug">{item.question}</h2>
          </div>
          {isLocked && (
            <span className={`shrink-0 px-2.5 py-1 rounded-full text-xs font-bold ${isCorrect ? 'bg-[#21D7C4] text-[#081524]' : 'bg-red-500 text-white'}`}>
              {isCorrect ? 'Correct' : 'Review'}
            </span>
          )}
        </div>
      </div>

      <div className="p-6 space-y-3">
        {(() => {
          try {
            const options = typeof item.options === 'string' ? JSON.parse(item.options) : item.options;
            return options.map((opt, i) => {
              const isThisSelected = selected === opt;
              const isThisCorrect = opt === item.correct_answer;

              let buttonStyle = 'border-white/10 bg-[#081524]/70 text-[#B8C7D9] hover:border-[#21D7C4]/50 hover:text-[#F5F8FC]';
              if (isLocked) {
                if (isThisCorrect) buttonStyle = 'border-[#21D7C4] bg-[#21D7C4]/15 text-[#21D7C4]';
                else if (isThisSelected && !isThisCorrect) buttonStyle = 'border-red-500 bg-red-500/15 text-red-300';
                else buttonStyle = 'border-white/5 bg-[#081524]/40 text-slate-500 opacity-60';
              }

              return (
                <button
                  key={i}
                  type="button"
                  disabled={isLocked}
                  onClick={() => handleSelect(opt)}
                  className={`block w-full text-left p-4 border rounded-xl transition-colors font-semibold text-sm ${buttonStyle}`}
                >
                  {opt}
                </button>
              );
            });
          } catch {
            return <p className="text-red-400 text-sm">Unable to parse options for this question.</p>;
          }
        })()}
      </div>

      {isLocked && (
        <div className="p-6 border-t border-white/10 bg-[#081524]/60">
          <p className="text-xs font-bold uppercase tracking-wider text-[#F4B860] mb-1">Case Rationale</p>
          <p className="text-sm text-[#B8C7D9] leading-relaxed">
            {item.explanation || 'Review the compliance framework and risk indicators for this scenario.'}
          </p>
        </div>
      )}
    </div>
  );
}

export default function App() {
  const [activeView, setActiveView] = useState(null);
  const [pageIndex, setPageIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [submissions, setSubmissions] = useState([]);
  const [partnerFiles, setPartnerFiles] = useState([]);
  const [newsList, setNewsList] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState('All');
  const [selectedCategory, setSelectedCategory] = useState('KYC Basics');
  const [faqCategory, setFaqCategory] = useState('All');
  const [quizScore, setQuizScore] = useState(0);
  const [testData, setTestData] = useState([]);

  const [referralName, setReferralName] = useState('');
  const [referralEmail, setReferralEmail] = useState('');
  const [referralRole, setReferralRole] = useState('');
  const [referralNotes, setReferralNotes] = useState('');
  const [referralStatus, setReferralStatus] = useState('');

  const [partnerPassword, setPartnerPassword] = useState('');
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [partnerError, setPartnerError] = useState('');

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
      } catch {
        setNewsList(kycNews);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [selectedCategory]);

  const handleBackHome = () => {
    setActiveView(null);
    setQuizScore(0);
  };

  const handleScrollToGuidance = () => {
    setActiveView(null);
    setTimeout(() => {
      document.getElementById('career-guidance')?.scrollIntoView({ behavior: 'smooth' });
    }, 120);
  };

  const handleReferralSubmit = async (e) => {
    e.preventDefault();
    setReferralStatus('');
    try {
      const { error } = await supabase.from('submissions').insert([
        {
          name: referralName,
          email: referralEmail,
          role: referralRole,
          notes: referralNotes,
        },
      ]);
      if (error) {
        setReferralStatus(error.message || 'Unable to submit referral.');
      } else {
        setReferralStatus('Referral submitted.');
        setReferralName('');
        setReferralEmail('');
        setReferralRole('');
        setReferralNotes('');
      }
    } catch {
      setReferralStatus('Network error while submitting referral.');
    }
  };

  const handleRecruiterAuth = async (e) => {
    e.preventDefault();
    setPartnerError('');
    try {
      const res = await fetch('/api/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: partnerPassword }),
      });
      const data = await res.json();
      if (res.ok && data.authorized) {
        setIsAuthorized(true);
        setPartnerPassword('');
      } else {
        setPartnerError('Authorization failed.');
      }
    } catch {
      setPartnerError('Unable to reach verification endpoint.');
    }
  };

  const locations = ['All', ...Array.from(new Set(jobOpenings.map((j) => (j.location || '').trim()).filter(Boolean)))];
  const filteredJobs =
    selectedLocation === 'All'
      ? jobOpenings
      : jobOpenings.filter((j) => (j.location || '').trim() === selectedLocation);

  const faqCategories = ['All', ...Array.from(new Set(faqData.map((f) => f.category).filter(Boolean)))];
  const filteredFaqs =
    faqCategory === 'All' ? faqData : faqData.filter((f) => f.category === faqCategory);

  if (!activeView) {
    return (
      <HomepageHub
        onOpenView={(view) => {
          setQuizScore(0);
          setActiveView(view);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onSelectNoteIndex={(idx) => setPageIndex(idx)}
        onScrollToGuidance={handleScrollToGuidance}
      />
    );
  }

  if (activeView === 'notes') {
    return (
      <SyllabusReader
        notesContent={notesContent}
        pageIndex={pageIndex}
        onSelectModule={(idx) => setPageIndex(idx)}
        onBackHome={handleBackHome}
      />
    );
  }

  const viewBreadcrumbLabel =
    activeView === 'quiz'
      ? 'Knowledge Test'
      : activeView === 'jobs'
      ? 'Compliance Jobs'
      : activeView === 'network'
      ? 'Network & Briefings'
      : activeView === 'available'
      ? 'Available Referrals'
      : activeView === 'referralForm'
      ? 'Submit Referral'
      : activeView === 'contribute'
      ? 'Recruiter Desk'
      : activeView === 'faq'
      ? 'FAQ'
      : activeView === 'contact'
      ? 'Contact Us'
      : activeView === 'privacy'
      ? 'Privacy Policy'
      : 'Terms of Service';

  return (
    <div className="amld-shell min-h-screen flex flex-col">
      <header className="sticky top-0 z-40 bg-[#081524]/95 backdrop-blur border-b border-[var(--amld-border)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between gap-4">
          <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-[#B8C7D9] truncate">
            <button type="button" onClick={handleBackHome} className="hover:text-[#21D7C4] font-semibold">
              Home
            </button>
            <span className="text-[#7E93AB]">/</span>
            <span className="text-[#F5F8FC] font-semibold truncate">{viewBreadcrumbLabel}</span>
          </nav>

          <button
            type="button"
            onClick={() => setActiveView('notes')}
            className="text-xs font-semibold text-[#21D7C4] hover:underline shrink-0"
          >
            Syllabus Notes →
          </button>
        </div>
      </header>

      <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        {activeView === 'quiz' && (
          <div className="space-y-8 max-w-4xl mx-auto">
            <div className="border-b border-[var(--amld-border)] pb-6 flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-[#21D7C4]">Interactive Assessment</p>
                <h1 className="text-3xl sm:text-4xl font-extrabold text-[#F5F8FC] mt-1">Knowledge Test</h1>
                <p className="text-sm text-[#B8C7D9] mt-2">
                  Select a compliance domain to practice scenario and concept questions.
                </p>
              </div>
              <div className="px-4 py-2 rounded-xl bg-[#0D1E30] border border-[var(--amld-border)] text-sm font-bold text-[#F4B860]">
                Score: {quizScore} / {testData.length || 0}
              </div>
            </div>

            <div className="flex gap-2 overflow-x-auto pb-2">
              {['KYC Basics', 'AML Frameworks', 'Sanctions & PEPs', 'Transaction Monitoring'].map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => {
                    setSelectedCategory(cat);
                    setQuizScore(0);
                  }}
                  className={`px-4 py-2 text-xs font-bold rounded-lg border transition-colors whitespace-nowrap ${
                    selectedCategory === cat
                      ? 'bg-[#21D7C4]/15 border-[#21D7C4] text-[#21D7C4]'
                      : 'bg-[#0D1E30] border-[var(--amld-border)] text-[#B8C7D9] hover:text-[#F5F8FC]'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {isLoading ? (
              <div className="p-10 bg-[#0D1E30] border border-[var(--amld-border)] rounded-2xl text-center text-sm text-[#B8C7D9]">
                Loading questions...
              </div>
            ) : testData.length === 0 ? (
              <div className="p-10 bg-[#0D1E30] border border-[var(--amld-border)] rounded-2xl text-center text-sm text-[#B8C7D9]">
                No questions found under {selectedCategory}.
              </div>
            ) : (
              <div>
                {testData.map((item, idx) => (
                  <QuizItem
                    key={item.id || idx}
                    item={item}
                    index={idx}
                    onCorrect={() => setQuizScore((prev) => prev + 1)}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {(activeView === 'jobs' || activeView === 'network' || activeView === 'available') && (
          <div className="space-y-8">
            <div className="border-b border-[var(--amld-border)] pb-6 flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-[#F4B860]">Career & Intelligence Hub</p>
                <h1 className="text-3xl sm:text-4xl font-extrabold text-[#F5F8FC] mt-1">
                  {activeView === 'network'
                    ? 'Network & Regulatory Briefings'
                    : activeView === 'available'
                    ? 'Available Referrals & Submissions'
                    : 'Compliance Job Openings'}
                </h1>
              </div>

              {activeView === 'jobs' && (
                <div className="flex flex-wrap gap-2">
                  {locations.map((loc) => (
                    <button
                      key={loc}
                      type="button"
                      onClick={() => setSelectedLocation(loc)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold border ${
                        selectedLocation === loc
                          ? 'bg-[#21D7C4]/15 border-[#21D7C4] text-[#21D7C4]'
                          : 'bg-[#0D1E30] border-[var(--amld-border)] text-[#B8C7D9]'
                      }`}
                    >
                      {loc}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {activeView === 'network' ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {newsList.map((item, idx) => (
                  <div key={idx} className="p-6 rounded-2xl bg-[#0D1E30] border border-[var(--amld-border)] flex flex-col justify-between gap-4">
                    <h2 className="text-base font-bold text-[#F5F8FC]">{item.headline}</h2>
                    <a
                      href={item.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-semibold text-[#21D7C4] hover:underline"
                    >
                      Open source →
                    </a>
                  </div>
                ))}
              </div>
            ) : activeView === 'available' ? (
              <div className="p-6 sm:p-8 rounded-2xl bg-[#0D1E30] border border-[var(--amld-border)] space-y-4 max-w-2xl">
                <p className="text-sm text-[#B8C7D9]">
                  Submitted referral records: <strong className="text-[#21D7C4]">{submissions.length}</strong> · Partner files: <strong className="text-[#F4B860]">{partnerFiles.length}</strong>
                </p>
                <div className="flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={() => setActiveView('referralForm')}
                    className="amld-btn-primary px-4 py-2.5 rounded-xl text-xs font-bold"
                  >
                    Submit a Referral
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveView('contribute')}
                    className="px-4 py-2.5 rounded-xl text-xs font-semibold border border-[var(--amld-border)] text-[#F5F8FC]"
                  >
                    Open Recruiter Desk
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredJobs.map((job, idx) => (
                  <div key={idx} className="p-6 rounded-2xl bg-[#0D1E30] border border-[var(--amld-border)] flex flex-col justify-between gap-4">
                    <div>
                      <span className="text-xs font-semibold text-[#F4B860]">{(job.location || '').trim()}</span>
                      <h2 className="text-base font-bold text-[#F5F8FC] mt-1">{job.role}</h2>
                      <p className="text-xs text-[#B8C7D9] mt-1">{(job.company || '').trim()}</p>
                    </div>
                    <a
                      href={job.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-semibold text-[#21D7C4] hover:underline"
                    >
                      View job posting →
                    </a>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeView === 'referralForm' && (
          <div className="max-w-2xl mx-auto space-y-6">
            <div className="border-b border-[var(--amld-border)] pb-5">
              <p className="text-xs font-bold uppercase tracking-wider text-[#F4B860]">Network Intake</p>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-[#F5F8FC] mt-1">Submit Network Referral</h1>
            </div>
            <form onSubmit={handleReferralSubmit} className="p-6 sm:p-8 rounded-2xl bg-[#0D1E30] border border-[var(--amld-border)] space-y-4">
              <input
                type="text"
                required
                value={referralName}
                onChange={(e) => setReferralName(e.target.value)}
                placeholder="Full name"
                className="w-full px-4 py-3 rounded-xl bg-[#081524] border border-[var(--amld-border)] text-sm text-[#F5F8FC]"
              />
              <input
                type="email"
                required
                value={referralEmail}
                onChange={(e) => setReferralEmail(e.target.value)}
                placeholder="Email address"
                className="w-full px-4 py-3 rounded-xl bg-[#081524] border border-[var(--amld-border)] text-sm text-[#F5F8FC]"
              />
              <input
                type="text"
                required
                value={referralRole}
                onChange={(e) => setReferralRole(e.target.value)}
                placeholder="Target role (e.g., AML Analyst, KYC Specialist)"
                className="w-full px-4 py-3 rounded-xl bg-[#081524] border border-[var(--amld-border)] text-sm text-[#F5F8FC]"
              />
              <textarea
                rows={4}
                value={referralNotes}
                onChange={(e) => setReferralNotes(e.target.value)}
                placeholder="Experience or referral notes"
                className="w-full px-4 py-3 rounded-xl bg-[#081524] border border-[var(--amld-border)] text-sm text-[#F5F8FC]"
              />
              <button type="submit" className="amld-btn-primary px-6 py-3 rounded-xl text-xs font-bold uppercase tracking-wider">
                Submit Referral
              </button>
              {referralStatus && <p className="text-sm text-[#21D7C4]">{referralStatus}</p>}
            </form>
          </div>
        )}

        {activeView === 'contribute' && (
          <div className="max-w-xl mx-auto space-y-6">
            <div className="border-b border-[var(--amld-border)] pb-5">
              <p className="text-xs font-bold uppercase tracking-wider text-[#21D7C4]">Partner Portal</p>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-[#F5F8FC] mt-1">Recruiter Desk</h1>
            </div>
            {!isAuthorized ? (
              <form onSubmit={handleRecruiterAuth} className="p-6 sm:p-8 rounded-2xl bg-[#0D1E30] border border-[var(--amld-border)] space-y-4">
                <p className="text-sm text-[#B8C7D9]">Enter partner access credentials to verify access.</p>
                <input
                  type="password"
                  required
                  value={partnerPassword}
                  onChange={(e) => setPartnerPassword(e.target.value)}
                  placeholder="Access password"
                  className="w-full px-4 py-3 rounded-xl bg-[#081524] border border-[var(--amld-border)] text-sm text-[#F5F8FC]"
                />
                <button type="submit" className="amld-btn-amber px-6 py-3 rounded-xl text-xs font-bold uppercase tracking-wider">
                  Verify Access
                </button>
                {partnerError && <p className="text-sm text-red-400">{partnerError}</p>}
              </form>
            ) : (
              <div className="p-6 sm:p-8 rounded-2xl bg-[#0D1E30] border border-[#21D7C4]/40 space-y-3">
                <p className="text-base font-bold text-[#21D7C4]">Partner Access Verified</p>
                <p className="text-sm text-[#B8C7D9]">Submissions count: {submissions.length} · Partner files count: {partnerFiles.length}</p>
              </div>
            )}
          </div>
        )}

        {activeView === 'faq' && (
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="border-b border-[var(--amld-border)] pb-5 flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-[#21D7C4]">Platform Guide</p>
                <h1 className="text-3xl sm:text-4xl font-extrabold text-[#F5F8FC] mt-1">Frequently Asked Questions</h1>
              </div>
              <div className="flex flex-wrap gap-2">
                {faqCategories.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setFaqCategory(cat)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold border ${
                      faqCategory === cat
                        ? 'bg-[#21D7C4]/15 border-[#21D7C4] text-[#21D7C4]'
                        : 'bg-[#0D1E30] border-[var(--amld-border)] text-[#B8C7D9]'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-4">
              {filteredFaqs.map((faq, idx) => (
                <div key={idx} className="p-6 rounded-2xl bg-[#0D1E30] border border-[var(--amld-border)]">
                  <span className="text-xs font-semibold text-[#21D7C4]">{faq.category}</span>
                  <h2 className="text-base font-bold text-[#F5F8FC] mt-1">{faq.question}</h2>
                  <p className="text-sm text-[#B8C7D9] mt-2 leading-relaxed">{faq.answer}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeView === 'contact' && (
          <div className="max-w-3xl mx-auto space-y-6">
            <div className="border-b border-[var(--amld-border)] pb-5">
              <p className="text-xs font-bold uppercase tracking-wider text-[#21D7C4]">Support & Inquiries</p>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-[#F5F8FC] mt-1">{contactContent.title}</h1>
            </div>
            <div className="p-6 sm:p-8 rounded-2xl bg-[#0D1E30] border border-[var(--amld-border)] text-sm sm:text-base text-[#B8C7D9] leading-relaxed whitespace-pre-line">
              {contactContent.body}
            </div>
          </div>
        )}

        {activeView === 'privacy' && (
          <div className="max-w-3xl mx-auto space-y-6">
            <div className="border-b border-[var(--amld-border)] pb-5">
              <p className="text-xs font-bold uppercase tracking-wider text-[#F4B860]">Data Governance</p>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-[#F5F8FC] mt-1">{privacyPolicy.title}</h1>
            </div>
            <div className="p-6 sm:p-8 rounded-2xl bg-[#0D1E30] border border-[var(--amld-border)] text-sm sm:text-base text-[#B8C7D9] leading-relaxed whitespace-pre-line">
              {privacyPolicy.content}
            </div>
          </div>
        )}

        {activeView === 'terms' && (
          <div className="max-w-3xl mx-auto space-y-6">
            <div className="border-b border-[var(--amld-border)] pb-5">
              <p className="text-xs font-bold uppercase tracking-wider text-[#F4B860]">Platform Terms</p>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-[#F5F8FC] mt-1">{termsOfService.title}</h1>
            </div>
            <div className="p-6 sm:p-8 rounded-2xl bg-[#0D1E30] border border-[var(--amld-border)] text-sm sm:text-base text-[#B8C7D9] leading-relaxed whitespace-pre-line">
              {termsOfService.content}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
