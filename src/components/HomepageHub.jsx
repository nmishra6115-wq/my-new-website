import React, { useMemo, useState } from 'react';
import { AcademyBrandMark, IntelligenceCard, SectionHeader, TopicBadge } from './AcademyPrimitives';
import { notesContent, faqData } from '../content';
import { jobOpenings } from '../jobs';
import { kycNews } from '../news';

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
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileOpen, setMobileOpen] = useState(false);
  const [caseChoice, setCaseChoice] = useState(null);

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
    <div className="amld-shell min-h-screen flex flex-col">
      {/* Section 1: Sticky Navigation Bar */}
      <header className="sticky top-0 z-40 bg-[#081524]/95 backdrop-blur border-b border-[var(--amld-border)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          <button
            type="button"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="text-left focus:outline-none"
          >
            <AcademyBrandMark />
          </button>

          <nav aria-label="Primary Navigation" className="hidden lg:flex items-center gap-6 text-sm font-medium text-[#B8C7D9]">
            <button type="button" onClick={() => onOpenView('notes')} className="hover:text-[#21D7C4] transition-colors">
              Syllabus Notes
            </button>
            <a href="#pathways" className="hover:text-[#21D7C4] transition-colors">
              Pathways
            </a>
            <button type="button" onClick={() => onOpenView('quiz')} className="hover:text-[#21D7C4] transition-colors">
              Knowledge Test
            </button>
            <button type="button" onClick={() => onOpenView('jobs')} className="hover:text-[#21D7C4] transition-colors">
              Jobs
            </button>
            <button type="button" onClick={onScrollToGuidance} className="hover:text-[#21D7C4] transition-colors">
              Guidance
            </button>
          </nav>

          <div className="hidden lg:flex items-center gap-3">
            <a
              href="#search-hub"
              className="px-3.5 py-2 rounded-lg text-xs font-semibold border border-[var(--amld-border)] text-[#F5F8FC] hover:border-[#21D7C4]/50 transition-colors"
            >
              Search
            </a>
            <button
              type="button"
              onClick={() => onOpenView('contribute')}
              className="amld-btn-primary px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider"
            >
              Recruiter Desk
            </button>
          </div>

          <button
            type="button"
            aria-label="Toggle Menu"
            aria-expanded={mobileOpen}
            onClick={() => setMobileOpen((prev) => !prev)}
            className="lg:hidden p-2 rounded-lg border border-[var(--amld-border)] text-[#F5F8FC]"
          >
            {mobileOpen ? 'Close' : 'Menu'}
          </button>
        </div>

        {mobileOpen && (
          <div className="lg:hidden bg-[#132B3E] border-t border-[var(--amld-border)] px-4 py-4 space-y-2 text-sm">
            <button type="button" onClick={() => { setMobileOpen(false); onOpenView('notes'); }} className="block w-full text-left py-2 text-[#F5F8FC]">
              Syllabus Notes
            </button>
            <a href="#pathways" onClick={() => setMobileOpen(false)} className="block py-2 text-[#B8C7D9]">
              Learning Pathways
            </a>
            <button type="button" onClick={() => { setMobileOpen(false); onOpenView('quiz'); }} className="block w-full text-left py-2 text-[#F5F8FC]">
              Knowledge Test
            </button>
            <button type="button" onClick={() => { setMobileOpen(false); onOpenView('jobs'); }} className="block w-full text-left py-2 text-[#F5F8FC]">
              Jobs
            </button>
            <button type="button" onClick={() => { setMobileOpen(false); onOpenView('referralForm'); }} className="block w-full text-left py-2 text-[#B8C7D9]">
              Submit Referral
            </button>
            <button type="button" onClick={() => { setMobileOpen(false); onOpenView('contribute'); }} className="block w-full text-left py-2 text-[#21D7C4] font-semibold">
              Recruiter Desk
            </button>
          </div>
        )}
      </header>

      <main className="flex-grow">
        {/* Section 2: Cinematic Hero */}
        <section className="relative overflow-hidden border-b border-[var(--amld-border)] bg-gradient-to-b from-[#081524] via-[#132B3E]/65 to-[#081524]">
          <svg
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 w-full h-full opacity-20"
            viewBox="0 0 1200 520"
            fill="none"
          >
            <circle cx="940" cy="180" r="140" stroke="#21D7C4" strokeWidth="1" strokeDasharray="4 6" />
            <circle cx="940" cy="180" r="70" stroke="#F4B860" strokeWidth="1" opacity="0.7" />
            <line x1="760" y1="290" x2="940" y2="180" stroke="#21D7C4" strokeWidth="1.2" />
            <line x1="940" y1="180" x2="1110" y2="330" stroke="#21D7C4" strokeWidth="1.2" />
            <circle cx="760" cy="290" r="5" fill="#F4B860" />
            <circle cx="940" cy="180" r="6" fill="#21D7C4" />
            <circle cx="1110" cy="330" r="5" fill="#21D7C4" />
          </svg>

          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28">
            <div className="max-w-3xl space-y-6">
              <TopicBadge tone="teal">Financial Crime Intelligence Academy</TopicBadge>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-[#F5F8FC] leading-[1.1]">
                Understand the Risk. Master the Investigation.
              </h1>
              <p className="text-base sm:text-lg text-[#B8C7D9] leading-relaxed max-w-2xl">
                Build practical expertise in AML, KYC, transaction monitoring and financial crime compliance.
              </p>
              <div className="pt-2 flex flex-wrap gap-4">
                <button
                  type="button"
                  onClick={() => onOpenView('notes')}
                  className="amld-btn-primary px-6 py-3.5 rounded-xl text-sm font-bold"
                >
                  Explore Syllabus Notes
                </button>
                <button
                  type="button"
                  onClick={() => onOpenView('quiz')}
                  className="px-6 py-3.5 rounded-xl text-sm font-semibold border border-[var(--amld-border)] bg-[#132B3E]/70 text-[#F5F8FC] hover:border-[#21D7C4]/50 transition-colors"
                >
                  Take Knowledge Test
                </button>
                <button
                  type="button"
                  onClick={() => onOpenView('jobs')}
                  className="px-6 py-3.5 rounded-xl text-sm font-semibold border border-[#F4B860]/40 text-[#F4B860] hover:bg-[#F4B860]/10 transition-colors"
                >
                  Browse Compliance Jobs
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Section 3: Intelligent Search */}
        <section id="search-hub" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-14">
          <IntelligenceCard>
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
                className="flex-grow px-4 py-3 rounded-xl bg-[#081524] border border-[var(--amld-border)] text-[#F5F8FC] placeholder-[#7E93AB] focus:outline-none focus:border-[#21D7C4]"
              />
              {hasSearch && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="px-4 py-3 rounded-xl text-xs font-semibold border border-[var(--amld-border)] text-[#B8C7D9] hover:text-[#F5F8FC]"
                >
                  Clear
                </button>
              )}
            </div>

            {hasSearch && (
              <div className="mt-6 pt-6 border-t border-[var(--amld-border)] space-y-6">
                <p className="text-xs text-[#B8C7D9]">
                  Found <strong className="text-[#21D7C4]">{totalMatches}</strong> matching items across existing content.
                </p>

                {searchResults.notes.length > 0 && (
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-[#21D7C4] mb-2">Syllabus Notes</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {searchResults.notes.map((n) => (
                        <button
                          key={n.idx}
                          type="button"
                          onClick={() => {
                            onSelectNoteIndex(n.idx);
                            onOpenView('notes');
                          }}
                          className="text-left p-3.5 rounded-xl bg-[#081524] border border-[var(--amld-border)] hover:border-[#21D7C4]/50 transition-colors"
                        >
                          <p className="text-sm font-semibold text-[#F5F8FC]">{n.title}</p>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {searchResults.jobs.length > 0 && (
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-[#F4B860] mb-2">Job Openings</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {searchResults.jobs.map((job, i) => (
                        <a
                          key={i}
                          href={job.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block p-3.5 rounded-xl bg-[#081524] border border-[var(--amld-border)] hover:border-[#F4B860]/50 transition-colors"
                        >
                          <p className="text-sm font-semibold text-[#F5F8FC]">{job.role}</p>
                          <p className="text-xs text-[#B8C7D9] mt-0.5">{job.company} · {job.location}</p>
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                {searchResults.news.length > 0 && (
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-[#21D7C4] mb-2">Regulatory Headlines</h3>
                    <div className="space-y-2">
                      {searchResults.news.map((item, i) => (
                        <a
                          key={i}
                          href={item.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block p-3 rounded-xl bg-[#081524] border border-[var(--amld-border)] text-sm text-[#F5F8FC] hover:border-[#21D7C4]/50"
                        >
                          {item.headline}
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                {searchResults.faqs.length > 0 && (
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-[#B8C7D9] mb-2">FAQs</h3>
                    <div className="space-y-2">
                      {searchResults.faqs.map((faq, i) => (
                        <div key={i} className="p-3.5 rounded-xl bg-[#081524] border border-[var(--amld-border)]">
                          <p className="text-sm font-semibold text-[#F5F8FC]">{faq.question}</p>
                          <p className="text-xs text-[#B8C7D9] mt-1">{faq.answer}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </IntelligenceCard>
        </section>

        {/* Section 4: Learning Pathways */}
        <section id="pathways" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16">
          <SectionHeader
            eyebrow="Structured Tracks"
            title="Learning Pathways"
            subtitle="Jump directly into existing compliance study modules organized by core subject area."
            action={
              <button
                type="button"
                onClick={() => onOpenView('notes')}
                className="text-xs font-semibold text-[#21D7C4] hover:underline"
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
                className="amld-card rounded-2xl p-5 text-left flex flex-col justify-between gap-3"
              >
                <div>
                  <TopicBadge tone="teal">{p.label}</TopicBadge>
                  <p className="mt-3 text-sm font-semibold text-[#F5F8FC]">{p.moduleTitle}</p>
                </div>
                <span className="text-xs font-medium text-[#21D7C4]">Open module →</span>
              </button>
            ))}
          </div>
        </section>

        {/* Section 5: Featured Content & Regulatory Bulletins */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16">
          <SectionHeader
            eyebrow="Core Study & Updates"
            title="Featured Learning Modules & Headlines"
            subtitle="Direct access to existing syllabus modules and regulatory source links."
          />
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-3 gap-4">
              {featuredNotes.map((mod, idx) => (
                <IntelligenceCard key={mod.title || idx} className="flex flex-col justify-between">
                  <div>
                    <TopicBadge tone="teal">Module {idx + 1}</TopicBadge>
                    <h3 className="mt-3 text-base font-bold text-[#F5F8FC]">{mod.title}</h3>
                    <p className="mt-2 text-xs text-[#B8C7D9] line-clamp-3">
                      {typeof mod.content === 'string' ? mod.content : 'Structured compliance study module.'}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      onSelectNoteIndex(idx);
                      onOpenView('notes');
                    }}
                    className="mt-4 text-left text-xs font-semibold text-[#21D7C4] hover:underline"
                  >
                    Read full module →
                  </button>
                </IntelligenceCard>
              ))}
            </div>

            <IntelligenceCard className="lg:col-span-4 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold uppercase tracking-wider text-[#F4B860]">Regulatory Headlines</h3>
              </div>
              <ul className="space-y-3">
                {kycNews.map((item, i) => (
                  <li key={i} className="border-b border-[var(--amld-border)] last:border-b-0 pb-3 last:pb-0">
                    <a
                      href={item.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm font-medium text-[#F5F8FC] hover:text-[#21D7C4] transition-colors block"
                    >
                      {item.headline}
                    </a>
                  </li>
                ))}
              </ul>
            </IntelligenceCard>
          </div>
        </section>

        {/* Section 6: Practical Case Analysis */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16">
          <IntelligenceCard>
            <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
              <TopicBadge tone="amber">Case Analysis Exercise</TopicBadge>
              <button
                type="button"
                onClick={() => onOpenView('quiz')}
                className="text-xs font-semibold text-[#21D7C4] hover:underline"
              >
                Open Knowledge Test →
              </button>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-[#F5F8FC]">
              Nested Correspondent Banking & Sanctions Screening Scenario
            </h2>
            <p className="mt-3 text-sm sm:text-base text-[#B8C7D9] leading-relaxed">
              A cross-border corporate payment originating from an offshore tech hub is flagged by your monitoring system. The beneficiary entity is clean on global sanctions watchlists. However, upon deep-dive routing analysis, you discover that the transaction utilizes a nested correspondent banking structure, and one of the listed downstream intermediary transit banks was placed under selective sectorial sanctions 48 hours ago. The asset value sits under standard regulatory thresholds. What is the appropriate operational step?
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => setCaseChoice('freeze')}
                className="amld-btn-primary px-4 py-2.5 rounded-xl text-xs font-bold"
              >
                Hold / Freeze & Escalate for Sanctions / SAR Review
              </button>
              <button
                type="button"
                onClick={() => setCaseChoice('release')}
                className="px-4 py-2.5 rounded-xl text-xs font-semibold border border-[var(--amld-border)] text-[#B8C7D9] hover:text-[#F5F8FC]"
              >
                Release Automatically Below Threshold
              </button>
            </div>
            {caseChoice && (
              <div className="mt-5 p-4 rounded-xl bg-[#081524] border border-[#21D7C4]/30 text-sm text-[#B8C7D9]">
                {caseChoice === 'freeze'
                  ? 'Sanctions exposure and nested routing require immediate escalation and review regardless of transaction amount—thresholds do not waive sanctions compliance.'
                  : 'Releasing a payment routed through a newly sanctioned intermediary without review creates regulatory and legal risk even when the amount is below standard thresholds.'}
              </div>
            )}
          </IntelligenceCard>
        </section>

        {/* Section 7: Career Hub */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16">
          <SectionHeader
            eyebrow="Opportunities & Guidance"
            title="Compliance Career Hub"
            subtitle="Curated compliance listings from your existing directory alongside interview preparation and intake support."
            action={
              <button
                type="button"
                onClick={() => onOpenView('jobs')}
                className="px-4 py-2 rounded-lg text-xs font-semibold border border-[var(--amld-border)] text-[#F5F8FC] hover:border-[#21D7C4]/50"
              >
                Full Jobs View ({jobOpenings.length})
              </button>
            }
          />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {jobOpenings.slice(0, 6).map((job, idx) => (
              <IntelligenceCard key={idx} className="flex flex-col justify-between gap-4">
                <div>
                  <TopicBadge tone="amber">{(job.location || '').trim()}</TopicBadge>
                  <h3 className="mt-3 text-base font-bold text-[#F5F8FC]">{job.role}</h3>
                  <p className="text-xs text-[#B8C7D9] mt-1">{(job.company || '').trim()}</p>
                </div>
                <a
                  href={job.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-semibold text-[#21D7C4] hover:underline"
                >
                  View posting →
                </a>
              </IntelligenceCard>
            ))}
          </div>
        </section>

        {/* Section 8: Trust and Credibility */}
        <section id="career-guidance" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-16">
          <IntelligenceCard className="bg-[#132B3E]/40">
            <SectionHeader
              eyebrow="Purpose & Scope"
              title="Educational & Networking Focus"
              subtitle="AMLDecode provides structured study material on AML, KYC, transaction monitoring, and compliance concepts along with career and referral resources. It is an independent learning and networking platform rather than a legal, regulatory, or hiring authority."
            />
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => onOpenView('faq')}
                className="px-4 py-2.5 rounded-xl text-xs font-semibold border border-[var(--amld-border)] text-[#F5F8FC] hover:border-[#21D7C4]/50"
              >
                Read FAQ
              </button>
              <button
                type="button"
                onClick={() => onOpenView('referralForm')}
                className="amld-btn-amber px-4 py-2.5 rounded-xl text-xs font-bold"
              >
                Submit Referral
              </button>
              <button
                type="button"
                onClick={() => onOpenView('contact')}
                className="px-4 py-2.5 rounded-xl text-xs font-semibold border border-[var(--amld-border)] text-[#B8C7D9] hover:text-[#F5F8FC]"
              >
                Contact Support
              </button>
            </div>
          </IntelligenceCard>
        </section>
      </main>

      {/* Section 9: Professional Footer */}
      <footer className="border-t border-[var(--amld-border)] bg-[#081524] py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-12 gap-8 text-sm">
          <div className="md:col-span-5 space-y-3">
            <AcademyBrandMark />
            <p className="text-xs text-[#B8C7D9] leading-relaxed max-w-sm">
              Structured learning notes, assessments, compliance job listings, and referral resources for AML and KYC professionals.
            </p>
          </div>
          <div className="md:col-span-3 space-y-2">
            <p className="text-xs font-bold uppercase tracking-wider text-[#21D7C4]">Platform</p>
            <div className="flex flex-col gap-1.5 text-xs text-[#B8C7D9]">
              <button type="button" onClick={() => onOpenView('faq')} className="text-left hover:text-[#F5F8FC]">About & FAQ</button>
              <button type="button" onClick={() => onOpenView('contact')} className="text-left hover:text-[#F5F8FC]">Contact Us</button>
              <button type="button" onClick={() => onOpenView('notes')} className="text-left hover:text-[#F5F8FC]">Syllabus Notes</button>
              <button type="button" onClick={() => onOpenView('quiz')} className="text-left hover:text-[#F5F8FC]">Knowledge Test</button>
            </div>
          </div>
          <div className="md:col-span-4 space-y-2">
            <p className="text-xs font-bold uppercase tracking-wider text-[#F4B860]">Legal & Disclaimer</p>
            <div className="flex flex-col gap-1.5 text-xs text-[#B8C7D9]">
              <button type="button" onClick={() => onOpenView('privacy')} className="text-left hover:text-[#F5F8FC]">Privacy Policy</button>
              <button type="button" onClick={() => onOpenView('terms')} className="text-left hover:text-[#F5F8FC]">Terms of Service & Disclaimer</button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
