import { useMemo, useState } from 'react';
import { AcademyBrandMark, IntelligenceCard, SectionHeader, TopicBadge } from './AcademyPrimitives';
import DailyChallengeCard from './DailyChallengeCard';
import { notesContent, faqData } from '../content';
import { jobOpenings } from '../jobs';
import { kycNews } from '../news';
import { Sun, Moon } from 'lucide-react';
import { useThemeMode } from '../hooks/useThemeMode';
import BannerAd468 from './BannerAd468';
import NativeBannerAd from './NativeBannerAd';

const PATHWAY_MATCHERS = [
  { label: 'AML Fundamentals', keywords: ['aml', 'money laundering'] },
  { label: 'KYC', keywords: ['kyc', 'client onboarding', 'lifecycle'] },
  { label: 'Customer Due Diligence', keywords: ['cdd', 'due dilligence', 'ownership', 'ubo', 'entity'] },
  { label: 'Enhanced Due Diligence', keywords: ['edd', 'sof', 'sow', 'risk rating', 'risk factor'] },
  { label: 'Transaction Monitoring', keywords: ['transaction monitoring', 'tools', 'escalation'] },
  { label: 'Sanctions Screening', keywords: ['sanction', 'sdn', 'false hit', 'pep'] },
  { label: 'Adverse Media', keywords: ['adverse media'] },
  { label: 'SAR Writing', keywords: ['sar', 'str', 'ctr'] },
  { label: 'Regulatory Frameworks', keywords: ['regulatory bodies', 'remediation', 'risk assessed'] },
  { label: 'AML Interview Preparation', keywords: ['pillars', 'control vs ownership', 'complex ownership'] },
];

export default function HomepageHub({
  onOpenView,
  onSelectNoteIndex,
  onScrollToGuidance,
}) {
  const { isDark, toggleTheme } = useThemeMode();
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileOpen, setMobileOpen] = useState(false);

  const pathways = useMemo(() => {
    return PATHWAY_MATCHERS.map((p) => {
      const idx = notesContent.findIndex((mod) => {
        const title = (mod.title || '').toLowerCase();
        return p.keywords.some((kw) => title.includes(kw));
      });
      return idx >= 0
        ? { ...p, noteIndex: idx, moduleTitle: notesContent[idx].title }
        : null;
    }).filter(Boolean);
  }, []);

  const searchResults = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return { notes: [], faqs: [], jobs: [], news: [] };

    const notes = notesContent
      .map((mod, idx) => ({ ...mod, idx }))
      .filter((mod) => {
        const text = typeof mod.content === 'string' ? mod.content : '';
        return (mod.title || '').toLowerCase().includes(q) || text.toLowerCase().includes(q);
      })
      .slice(0, 6);

    const faqs = faqData
      .filter(
        (item) =>
          (item.question || '').toLowerCase().includes(q) ||
          (item.answer || '').toLowerCase().includes(q) ||
          (item.category || '').toLowerCase().includes(q)
      )
      .slice(0, 4);

    const jobs = jobOpenings
      .filter(
        (job) =>
          (job.company || '').toLowerCase().includes(q) ||
          (job.role || '').toLowerCase().includes(q) ||
          (job.location || '').toLowerCase().includes(q)
      )
      .slice(0, 4);

    const news = kycNews
      .filter((item) => (item.headline || '').toLowerCase().includes(q))
      .slice(0, 4);

    return { notes, faqs, jobs, news };
  }, [searchQuery]);

  const hasSearch = searchQuery.trim().length > 0;
  const totalMatches =
    searchResults.notes.length +
    searchResults.faqs.length +
    searchResults.jobs.length +
    searchResults.news.length;

  const featuredNotes = useMemo(() => notesContent.slice(0, 3), []);

  return (
    <div className="min-h-screen flex flex-col bg-[#F8F7F4] dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
      {/* Top Editorial Navigation */}
      <header className="sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur border-b border-stone-200 dark:border-slate-800 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          <button
            type="button"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="text-left focus:outline-none cursor-pointer"
          >
            <AcademyBrandMark theme={isDark ? 'dark' : 'light'} />
          </button>

          <nav aria-label="Primary Navigation" className="hidden lg:flex items-center gap-7 text-sm font-medium text-slate-700 dark:text-slate-300">
            <button type="button" onClick={() => onOpenView('notes')} className="hover:text-amber-700 transition-colors cursor-pointer">
              Syllabus Notes
            </button>
            <a href="#pathways" className="hover:text-amber-700 transition-colors">
              Pathways
            </a>
            <button type="button" onClick={() => onOpenView('quiz')} className="hover:text-amber-700 transition-colors cursor-pointer">
              Knowledge Test
            </button>
            <button type="button" onClick={() => onOpenView('jobs')} className="hover:text-amber-700 transition-colors cursor-pointer">
              Jobs
            </button>
            <button type="button" onClick={onScrollToGuidance} className="hover:text-amber-700 transition-colors cursor-pointer">
              Guidance
            </button>
          </nav>

          <div className="hidden lg:flex items-center gap-3">
            <a
              href="#search-hub"
              className="px-4 py-2 rounded-full text-xs font-semibold border border-stone-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 hover:border-amber-600 dark:hover:border-amber-500 transition-colors"
            >
              Search
            </a>
            <button
              type="button"
              onClick={toggleTheme}
              aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
              title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
              className="p-2 rounded-full border border-stone-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:border-amber-600 dark:hover:border-amber-500 transition-colors cursor-pointer"
            >
              {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
            </button>
            <button
              type="button"
              onClick={() => onOpenView('contribute')}
              className="px-4 py-2 rounded-full text-xs font-bold bg-amber-600 text-white hover:bg-amber-700 transition-colors cursor-pointer"
            >
              Recruiter Desk
            </button>
          </div>

          <div className="lg:hidden flex items-center gap-2">
            <button
              type="button"
              onClick={toggleTheme}
              aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
              title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
              className="p-2 rounded-lg border border-stone-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:border-amber-600 dark:hover:border-amber-500 transition-colors cursor-pointer"
            >
              {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
            </button>
            <button
              type="button"
              aria-label="Toggle Menu"
              aria-expanded={mobileOpen}
              onClick={() => setMobileOpen((prev) => !prev)}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold border border-stone-300 dark:border-slate-700 text-slate-800 dark:text-slate-100 bg-white dark:bg-slate-800 cursor-pointer"
            >
              {mobileOpen ? 'Close' : 'Menu'}
            </button>
          </div>
        </div>

        {mobileOpen && (
          <div className="lg:hidden bg-white dark:bg-slate-900 border-t border-stone-200 dark:border-slate-800 px-4 py-4 space-y-2 text-sm">
            <button type="button" onClick={() => { setMobileOpen(false); onOpenView('notes'); }} className="block w-full text-left py-2 text-slate-800 dark:text-slate-100 hover:text-amber-700 dark:hover:text-amber-400 cursor-pointer">
              Syllabus Notes
            </button>
            <a href="#pathways" onClick={() => setMobileOpen(false)} className="block py-2 text-slate-700 dark:text-slate-200 hover:text-amber-700 dark:hover:text-amber-400">
              Learning Pathways
            </a>
            <button type="button" onClick={() => { setMobileOpen(false); onOpenView('quiz'); }} className="block w-full text-left py-2 text-slate-800 dark:text-slate-100 hover:text-amber-700 dark:hover:text-amber-400 cursor-pointer">
              Knowledge Test
            </button>
            <button type="button" onClick={() => { setMobileOpen(false); onOpenView('jobs'); }} className="block w-full text-left py-2 text-slate-800 dark:text-slate-100 hover:text-amber-700 dark:hover:text-amber-400 cursor-pointer">
              Jobs
            </button>
            <button type="button" onClick={() => { setMobileOpen(false); onOpenView('referralForm'); }} className="block w-full text-left py-2 text-slate-700 dark:text-slate-200 hover:text-amber-700 dark:hover:text-amber-400 cursor-pointer">
              Submit Referral
            </button>
            <button type="button" onClick={() => { setMobileOpen(false); onOpenView('contribute'); }} className="block w-full text-left py-2 text-amber-700 dark:text-amber-400 font-semibold cursor-pointer">
              Recruiter Desk
            </button>
          </div>
        )}
      </header>

      <main className="flex-grow">
        <BannerAd468 className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-3" />
{/* Warm Editorial Hero */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-12">
          <div className="rounded-3xl bg-gradient-to-br from-[#13294B] via-[#1B365D] to-[#0F213A] text-white px-6 py-12 sm:px-12 sm:py-16 shadow-sm border border-amber-500/20">
            <div className="max-w-3xl space-y-5">
              <span className="inline-flex items-center px-3.5 py-1 rounded-full text-xs font-semibold tracking-wide bg-amber-400/15 text-amber-300 border border-amber-400/30">
                Financial Crime &amp; Compliance Hub
              </span>
              <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-[1.14]">
                Understand the Risk. Master the Investigation.
              </h1>
              <p className="text-sm sm:text-lg text-slate-200 leading-relaxed max-w-2xl">
                Build practical expertise in AML, KYC, transaction monitoring and financial crime compliance.
              </p>
              <div className="pt-2 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => onOpenView('notes')}
                  className="px-5 py-3 rounded-xl text-sm font-bold bg-amber-400 text-slate-950 hover:bg-amber-300 transition-colors cursor-pointer"
                >
                  Explore Syllabus Notes
                </button>
                <button
                  type="button"
                  onClick={() => onOpenView('quiz')}
                  className="px-5 py-3 rounded-xl text-sm font-semibold bg-white/10 text-white border border-white/20 hover:bg-white/15 transition-colors cursor-pointer"
                >
                  Take Knowledge Test
                </button>
                <button
                  type="button"
                  onClick={() => onOpenView('jobs')}
                  className="px-5 py-3 rounded-xl text-sm font-semibold text-amber-200 border border-amber-300/40 hover:bg-amber-400/10 transition-colors cursor-pointer"
                >
                  Browse Compliance Jobs
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Three Core Pillars */}
        <section aria-label="Core Compliance Pillars" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="rounded-2xl bg-white p-6 border border-stone-200/90 shadow-2xs flex flex-col justify-between gap-4">
              <div className="space-y-2">
                <p className="text-xs font-bold uppercase tracking-wider text-amber-700">Practice &amp; Simulation</p>
                <h2 className="text-lg font-bold text-slate-900">Knowledge Test 2.0</h2>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Build confidence across practice drills, timed exam mode, multi-stage case simulations, and SAR narrative feedback.
                </p>
              </div>
              <button
                type="button"
                onClick={() => onOpenView('quiz')}
                className="text-sm font-bold text-amber-800 hover:text-amber-950 w-fit cursor-pointer"
              >
                Launch Knowledge Test →
              </button>
            </div>

            <div className="rounded-2xl bg-white p-6 border border-stone-200/90 shadow-2xs flex flex-col justify-between gap-4">
              <div className="space-y-2">
                <p className="text-xs font-bold uppercase tracking-wider text-amber-700">Structured Playbooks</p>
                <h2 className="text-lg font-bold text-slate-900">AML &amp; KYC Study Notes</h2>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Review concise reference modules on CDD, EDD, beneficial ownership, screening, and reporting workflows.
                </p>
              </div>
              <button
                type="button"
                onClick={() => onOpenView('notes')}
                className="text-sm font-bold text-amber-800 hover:text-amber-950 w-fit cursor-pointer"
              >
                Open Syllabus Notes →
              </button>
            </div>

            <div className="rounded-2xl bg-white p-6 border border-stone-200/90 shadow-2xs flex flex-col justify-between gap-4">
              <div className="space-y-2">
                <p className="text-xs font-bold uppercase tracking-wider text-amber-700">India-Wide Discovery</p>
                <h2 className="text-lg font-bold text-slate-900">Careers AI</h2>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Discover compliance, AML, KYC, and risk openings across Indian states and union territories.
                </p>
              </div>
              <button
                type="button"
                onClick={() => onOpenView('jobs')}
                className="text-sm font-bold text-amber-800 hover:text-amber-950 w-fit cursor-pointer"
              >
                Explore Careers AI →
              </button>
            </div>
          </div>
        </section>

        {/* Clean Repository Search */}
        <section id="search-hub" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12">
          <div className="rounded-2xl bg-white p-6 sm:p-7 border border-stone-200 shadow-2xs">
            <SectionHeader
              eyebrow="Search Repository"
              title="Search Existing Modules, FAQs, Jobs & Briefings"
              subtitle="Filter directly across your existing syllabus notes, FAQs, job openings, and regulatory headlines."
            />
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search e.g. KYC, EDD, UBO, SAR, Bengaluru, FATF..."
                aria-label="Search existing AMLDecode content"
                className="flex-grow px-4 py-3 rounded-xl bg-[#F8F7F4] border border-stone-300 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-amber-600 focus:bg-white"
              />
              {hasSearch && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="px-4 py-3 rounded-xl text-xs font-semibold border border-stone-300 text-slate-700 hover:bg-stone-100 cursor-pointer"
                >
                  Clear
                </button>
              )}
            </div>

            {hasSearch && (
              <div className="mt-6 pt-6 border-t border-stone-200 space-y-6">
                <p className="text-xs text-slate-600">
                  Found <strong className="text-amber-800">{totalMatches}</strong> matching items across existing content.
                </p>

                {searchResults.notes.length > 0 && (
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-amber-800 mb-2">Syllabus Notes</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {searchResults.notes.map((n) => (
                        <button
                          key={n.idx}
                          type="button"
                          onClick={() => {
                            onSelectNoteIndex(n.idx);
                            onOpenView('notes');
                          }}
                          className="text-left p-3.5 rounded-xl bg-[#F8F7F4] border border-stone-200 hover:border-amber-600/50 transition-colors cursor-pointer"
                        >
                          <p className="text-sm font-semibold text-slate-900">{n.title}</p>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {searchResults.jobs.length > 0 && (
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-amber-800 mb-2">Job Openings</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {searchResults.jobs.map((job, i) => (
                        <a
                          key={i}
                          href={job.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block p-3.5 rounded-xl bg-[#F8F7F4] border border-stone-200 hover:border-amber-600/50 transition-colors"
                        >
                          <p className="text-sm font-semibold text-slate-900">{job.role}</p>
                          <p className="text-xs text-slate-600 mt-0.5">{job.company} · {job.location}</p>
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                {searchResults.news.length > 0 && (
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-amber-800 mb-2">Regulatory Headlines</h3>
                    <div className="space-y-2">
                      {searchResults.news.map((item, i) => (
                        <a
                          key={i}
                          href={item.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block p-3 rounded-xl bg-[#F8F7F4] border border-stone-200 text-sm font-medium text-slate-900 hover:border-amber-600/50"
                        >
                          {item.headline}
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                {searchResults.faqs.length > 0 && (
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">FAQs</h3>
                    <div className="space-y-2">
                      {searchResults.faqs.map((faq, i) => (
                        <div key={i} className="p-3.5 rounded-xl bg-[#F8F7F4] border border-stone-200">
                          <p className="text-sm font-semibold text-slate-900">{faq.question}</p>
                          <p className="text-xs text-slate-600 mt-1">{faq.answer}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </section>

        {/* Learning Pathways */}
        <section id="pathways" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-14">
          <SectionHeader
            eyebrow="Structured Tracks"
            title="Learning Pathways"
            subtitle="Jump directly into existing compliance study modules organized by core subject area."
            action={
              <button
                type="button"
                onClick={() => onOpenView('notes')}
                className="text-xs font-bold text-amber-800 hover:underline cursor-pointer"
              >
                View all {notesContent.length} modules →
              </button>
            }
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {pathways.map((p) => (
              <button
                key={p.label}
                type="button"
                onClick={() => {
                  onSelectNoteIndex(p.noteIndex);
                  onOpenView('notes');
                }}
                className="rounded-2xl bg-white p-5 border border-stone-200 hover:border-amber-600/60 shadow-2xs text-left flex flex-col justify-between gap-3 transition-all cursor-pointer"
              >
                <div>
                  <TopicBadge tone="teal">{p.label}</TopicBadge>
                  <p className="mt-3 text-sm font-semibold text-slate-900 leading-snug">{p.moduleTitle}</p>
                </div>
                <span className="text-xs font-bold text-amber-800">Open module →</span>
              </button>
            ))}
          </div>
        </section>

        {/* Featured Content & Regulatory Bulletins */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-14">
          <SectionHeader
            eyebrow="Core Study & Updates"
            title="Featured Learning Modules & Headlines"
            subtitle="Direct access to existing syllabus modules and regulatory source links."
          />
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-3 gap-4">
              {featuredNotes.map((mod, idx) => (
                <IntelligenceCard key={mod.title || idx} className="bg-white border border-stone-200 flex flex-col justify-between">
                  <div>
                    <TopicBadge tone="teal">Module {idx + 1}</TopicBadge>
                    <h3 className="mt-3 text-base font-bold text-slate-900">{mod.title}</h3>
                    <p className="mt-2 text-xs text-slate-600 line-clamp-3 leading-relaxed">
                      {typeof mod.content === 'string' ? mod.content : 'Structured compliance study module.'}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      onSelectNoteIndex(idx);
                      onOpenView('notes');
                    }}
                    className="mt-4 text-left text-xs font-bold text-amber-800 hover:underline cursor-pointer"
                  >
                    Read full module →
                  </button>
                </IntelligenceCard>
              ))}
            </div>

            <IntelligenceCard className="lg:col-span-4 bg-white border border-stone-200 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-amber-800">Regulatory Headlines</h3>
              </div>
              <ul className="space-y-3">
                {kycNews.map((item, i) => (
                  <li key={i} className="border-b border-stone-100 last:border-b-0 pb-3 last:pb-0">
                    <a
                      href={item.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm font-medium text-slate-800 hover:text-amber-800 transition-colors block"
                    >
                      {item.headline}
                    </a>
                  </li>
                ))}
              </ul>
            </IntelligenceCard>
          </div>
        </section>

        {/* AI Daily Knowledge Challenge */}
        <section id="daily-challenge" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-14">
          <SectionHeader
            eyebrow="Daily Challenge"
            title="AMLDecode AI Daily Knowledge Challenge"
            subtitle="Test your AML, KYC, transaction monitoring, SAR, and sanctions judgment daily—with instant feedback and source-backed explanations."
            action={
              <button
                type="button"
                onClick={() => onOpenView('quiz')}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-white border border-stone-300 text-slate-900 hover:border-amber-600 cursor-pointer"
              >
                Open Knowledge Test
              </button>
            }
          />
          <DailyChallengeCard
            compact
            onOpenRelatedNote={(noteIdx) => {
              onSelectNoteIndex(noteIdx);
              onOpenView('notes');
            }}
            onOpenKnowledgeTest={() => onOpenView('quiz')}
          />
        </section>

        {/* Purpose & Credibility */}
        <section id="career-guidance" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-14 pb-14">
          <div className="rounded-2xl bg-white p-6 sm:p-8 border border-stone-200 shadow-2xs space-y-5">
            <SectionHeader
              eyebrow="Purpose & Scope"
              title="Educational & Networking Focus"
              subtitle="AMLDecode provides structured study material on AML, KYC, transaction monitoring, and compliance concepts along with career and referral resources. It is an independent learning and networking platform rather than a legal, regulatory, or hiring authority."
            />
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => onOpenView('faq')}
                className="px-4 py-2.5 rounded-xl text-xs font-bold border border-stone-300 text-slate-900 hover:bg-stone-50 cursor-pointer"
              >
                Read FAQ
              </button>
              <button
                type="button"
                onClick={() => onOpenView('referralForm')}
                className="px-4 py-2.5 rounded-xl text-xs font-bold bg-amber-600 text-white hover:bg-amber-700 cursor-pointer"
              >
                Submit Referral
              </button>
              <button
                type="button"
                onClick={() => onOpenView('contact')}
                className="px-4 py-2.5 rounded-xl text-xs font-semibold border border-stone-300 text-slate-700 hover:text-slate-900 cursor-pointer"
              >
                Contact Support
              </button>
            </div>
          </div>
        </section>
        <BannerAd468 className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4" />
      </main>

      {/* Calm Multi-Column Footer */}
      <footer className="border-t border-stone-200 bg-white text-slate-700 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-12 gap-8 text-sm">
          <div className="md:col-span-5 space-y-3">
            <AcademyBrandMark theme="light" />
            <p className="text-xs text-slate-500 leading-relaxed max-w-sm">
              Structured learning notes, assessments, compliance job listings, and referral resources for AML and KYC professionals.
            </p>
          </div>
          <div className="md:col-span-3 space-y-2">
            <p className="text-xs font-bold uppercase tracking-wider text-amber-800">Platform</p>
            <nav aria-label="Footer Platform Links" className="flex flex-col gap-1 text-sm text-slate-700">
              <a href="/?view=faq" onClick={(e) => { e.preventDefault(); onOpenView('faq'); }} className="text-left py-1.5 hover:text-slate-950">About &amp; FAQ</a>
              <a href="/?view=contact" onClick={(e) => { e.preventDefault(); onOpenView('contact'); }} className="text-left py-1.5 hover:text-slate-950">Contact Us</a>
              <a href="/?view=notes" onClick={(e) => { e.preventDefault(); onOpenView('notes'); }} className="text-left py-1.5 hover:text-slate-950">Syllabus Notes</a>
              <a href="/?view=quiz" onClick={(e) => { e.preventDefault(); onOpenView('quiz'); }} className="text-left py-1.5 hover:text-slate-950">Knowledge Test</a>
            </nav>
          </div>
          <div className="md:col-span-4 space-y-2">
            <p className="text-xs font-bold uppercase tracking-wider text-amber-800">Legal &amp; Disclaimer</p>
            <nav aria-label="Footer Legal Links" className="flex flex-col gap-1 text-sm text-slate-700">
              <a href="/?view=privacy" onClick={(e) => { e.preventDefault(); onOpenView('privacy'); }} className="text-left py-1.5 hover:text-slate-950">Privacy Policy</a>
              <a href="/?view=terms" onClick={(e) => { e.preventDefault(); onOpenView('terms'); }} className="text-left py-1.5 hover:text-slate-950">Terms of Service &amp; Disclaimer</a>
            </nav>
          </div>
        </div>
      </footer>
    </div>
  );
}
