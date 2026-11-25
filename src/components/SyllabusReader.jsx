import { useEffect, useMemo, useRef, useState } from 'react';
import { TopicBadge } from './AcademyPrimitives';
import { MODULE_BY_INDEX } from '../data/moduleRegistry';

function extractTocItems(rawContent) {
  if (typeof rawContent !== 'string') return [];
  const lines = rawContent.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  const headings = [];

  lines.forEach((line, idx) => {
    const isMarkdownHeading = /^#{1,4}\s+/.test(line);
    const isShortLabel =
      line.length >= 4 &&
      line.length <= 85 &&
      !line.endsWith('.') &&
      !line.endsWith(',') &&
      (/^[A-Z0-9].*:?$/.test(line) || isMarkdownHeading);

    if (isMarkdownHeading || (isShortLabel && headings.length < 10)) {
      const cleanLabel = line.replace(/^#{1,4}\s+/, '').replace(/:$/, '');
      headings.push({
        id: `section-${idx}`,
        label: cleanLabel,
      });
    }
  });

  return headings.slice(0, 8);
}

export default function SyllabusReader({
  notesContent,
  pageIndex,
  onSelectModule,
  onBackHome,
}) {
  const [readProgress, setReadProgress] = useState(0);
  const [copied, setCopied] = useState(false);
  const articleRef = useRef(null);
  const pillRefs = useRef([]);
  const sidebarRef = useRef(null);

  const currentModule = notesContent[pageIndex] || notesContent[0] || { title: 'Syllabus Notes', content: '' };
  const rawText = typeof currentModule.content === 'string' ? currentModule.content : '';

  const tocItems = useMemo(() => extractTocItems(rawText), [rawText]);

  const relatedIndices = useMemo(() => {
    if (!Array.isArray(notesContent) || notesContent.length <= 1) return [];
    const total = notesContent.length;
    const candidates = [
      (pageIndex + 1) % total,
      (pageIndex + 2) % total,
      (pageIndex - 1 + total) % total,
    ];
    return Array.from(new Set(candidates)).filter((i) => i !== pageIndex).slice(0, 3);
  }, [notesContent, pageIndex]);

  useEffect(() => {
    const el = pillRefs.current[pageIndex];
    if (el && sidebarRef.current) {
      el.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }
  }, [pageIndex]);

  useEffect(() => {
    const handleScroll = () => {
      const docEl = document.documentElement;
      const scrollTop = window.scrollY || docEl.scrollTop || 0;
      const scrollHeight = docEl.scrollHeight - docEl.clientHeight;
      if (scrollHeight <= 0) {
        setReadProgress(100);
        return;
      }
      const pct = Math.min(100, Math.max(0, Math.round((scrollTop / scrollHeight) * 100)));
      setReadProgress(pct);
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [pageIndex]);

  const activeEntry = MODULE_BY_INDEX.get(pageIndex);
  const handleCopyLink = async () => {
    const sharePath = activeEntry ? activeEntry.routePath : '/notes';
    const shareUrl = `${window.location.origin}${sharePath}`;
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  const scrollToHeading = (indexHint) => {
    if (!articleRef.current) return;
    const paragraphs = articleRef.current.querySelectorAll('[data-line-idx]');
    const target = Array.from(paragraphs).find(
      (node) => Number(node.getAttribute('data-line-idx')) === indexHint
    );
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  const contentLines = rawText.split(/\r?\n/);

  return (
    <div className="amld-shell min-h-screen flex flex-col">
      {/* Reading Progress Bar */}
      <div className="sticky top-0 z-40 w-full bg-[#081524]/95 backdrop-blur border-b border-[var(--amld-border)]">
        <div className="h-1 bg-[#132B3E] w-full">
          <div
            className="h-1 bg-[#21D7C4] transition-all duration-150"
            style={{ width: `${readProgress}%` }}
          />
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between gap-4">
          <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-[#B8C7D9] truncate">
            <a
              href="/"
              onClick={(e) => {
                e.preventDefault();
                onBackHome();
              }}
              className="hover:text-[#21D7C4] font-medium shrink-0"
            >
              Home
            </a>
            <span className="text-[#7E93AB]">/</span>
            <a
              href="/notes"
              onClick={(e) => {
                e.preventDefault();
                onSelectModule(0);
              }}
              className="text-[#B8C7D9] hover:text-[#21D7C4] shrink-0"
            >
              Syllabus Notes
            </a>
            <span className="text-[#7E93AB]">/</span>
            <span className="text-[#F5F8FC] font-semibold truncate">{currentModule.title}</span>
          </nav>

          <div className="flex items-center gap-2 shrink-0">
          </div>
        </div>
      </div>

      <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12 flex-grow">
        {/* Publication Article Header */}
        <header className="mb-8 pb-6 border-b border-[var(--amld-border)]">
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[#081C33]">
            {currentModule.title}
          </h1>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Module Index Sidebar */}
          <aside className="lg:col-span-3 space-y-6">
            <div className="bg-[#0D1E30] border border-[var(--amld-border)] rounded-2xl p-4">
              <p className="text-xs font-bold uppercase tracking-wider text-[#C4A77D] mb-3 px-1">
                All Modules ({notesContent.length})
              </p>
              <div
                ref={sidebarRef}
                className="flex lg:flex-col gap-2 overflow-x-auto lg:overflow-y-auto max-h-none lg:max-h-[55vh] pb-2 lg:pb-0 pr-1"
              >
                {notesContent.map((mod, idx) => {
                  const modEntry = MODULE_BY_INDEX.get(idx);
                  const modHref = modEntry ? modEntry.routePath : '/notes';
                  return (
                    <a
                      key={idx}
                      href={modHref}
                      ref={(el) => (pillRefs.current[idx] = el)}
                      onClick={(e) => {
                        e.preventDefault();
                        onSelectModule(idx);
                      }}
                      aria-current={idx === pageIndex ? 'page' : undefined}
                      className={`block shrink-0 lg:shrink min-w-[200px] lg:min-w-0 w-auto lg:w-full text-left px-3.5 py-2.5 rounded-xl border text-xs transition-colors ${
                        idx === pageIndex
                          ? 'bg-[#21D7C4]/15 border-[#21D7C4] text-[#21D7C4] font-bold'
                          : 'bg-[#081524] border-[var(--amld-border)] text-[#B8C7D9] hover:text-[#F5F8FC]'
                      }`}
                    >
                      <span className="block text-[10px] opacity-70">{idx + 1 < 10 ? `0${idx + 1}` : idx + 1}</span>
                      <span className="line-clamp-2 mt-0.5">{mod.title}</span>
                    </a>
                  );
                })}
              </div>
            </div>

            {tocItems.length > 0 && (
              <div className="hidden lg:block bg-[#0D1E30] border border-[var(--amld-border)] rounded-2xl p-4">
                <p className="text-xs font-bold uppercase tracking-wider text-[#F4B860] mb-3">
                  On This Module
                </p>
                <ul className="space-y-2 text-xs text-[#B8C7D9]">
                  {tocItems.map((item, i) => (
                    <li key={i}>
                      <button
                        type="button"
                        onClick={() => {
                          const matchIdx = contentLines.findIndex(
                            (l) => l.trim().replace(/^#{1,4}\s+/, '').replace(/:$/, '') === item.label
                          );
                          if (matchIdx >= 0) scrollToHeading(matchIdx);
                        }}
                        className="text-left hover:text-[#21D7C4] transition-colors line-clamp-2"
                      >
                        {item.label}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </aside>

          {/* Primary Editorial Content Body (Preserving 100% of Original Text) */}
          <article
            ref={articleRef}
            className="lg:col-span-9 bg-[#0D1E30] border border-[var(--amld-border)] rounded-2xl p-6 sm:p-10 space-y-6"
          >
            {typeof currentModule.content === 'string' ? (
              <div className="space-y-3 text-sm sm:text-base text-[#F5F8FC]/90 leading-relaxed max-w-none">
                {contentLines.map((line, lineIdx) => {
                  if (!line.trim()) {
                    return <div key={lineIdx} className="h-2" data-line-idx={lineIdx} />;
                  }
                  return (
                    <p key={lineIdx} data-line-idx={lineIdx} className="whitespace-pre-wrap break-words">
                      {line}
                    </p>
                  );
                })}
              </div>
            ) : (
              <div className="text-sm sm:text-base text-[#F5F8FC]/90 leading-relaxed">
                {currentModule.content}
              </div>
            )}

            {/* Editorial Learning & Compliance Companion (Phase 2) */}
            <section
              aria-label="Module Learning Objectives and Regulatory Context"
              className="pt-8 mt-8 border-t border-[var(--amld-border)] space-y-5 text-xs sm:text-sm text-[#B8C7D9]"
            >
              <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] uppercase tracking-wider text-[#C4A77D] font-bold">
                <span>Editorial Review &amp; Compliance Companion</span>
                <span className="text-[#9BB0C7]">
                  {currentModule.reviewedDate ? `Reviewed: ${currentModule.reviewedDate}` : 'Editorial Standard: Reviewed Educational Note'}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-[#081524]/80 border border-white/10 space-y-1.5">
                  <h2 className="text-xs font-bold uppercase tracking-wider text-[#21D7C4]">
                    Learning Objectives &amp; Red Flags
                  </h2>
                  <p className="leading-relaxed">
                    {currentModule.learningObjectives ||
                      `Identify core compliance obligations, risk indicators, and investigative escalation steps for ${currentModule.title}. Cross-check customer profile baseline, source of funds/wealth documentation, and transaction anomalies before drawing conclusions.`}
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-[#081524]/80 border border-white/10 space-y-1.5">
                  <h2 className="text-xs font-bold uppercase tracking-wider text-[#F4B860]">
                    Authoritative Regulatory References
                  </h2>
                  <p className="leading-relaxed">
                    {currentModule.regulatoryRefs ||
                      'FATF International Standards on Combating Money Laundering and the Financing of Terrorism & Proliferation (Recommendations 1, 10, 12, 15, 20), applicable national AML/CFT statutes, and FIU reporting guidance.'}
                  </p>
                </div>
              </div>

              {Array.isArray(relatedIndices) && relatedIndices.length > 0 && typeof onSelectModule === 'function' && (
                <div className="pt-2 flex flex-wrap items-center gap-2">
                  <span className="text-xs font-semibold text-[#9BB0C7] mr-1">Related Modules:</span>
                  {relatedIndices.map((relIdx) => {
                    const relEntry = MODULE_BY_INDEX.get(relIdx);
                    const relHref = relEntry ? relEntry.routePath : '/notes';
                    return (
                      <a
                        key={relIdx}
                        href={relHref}
                        onClick={(e) => {
                          e.preventDefault();
                          onSelectModule(relIdx);
                        }}
                        className="px-3 py-1.5 rounded-lg bg-[#081524] border border-[var(--amld-border)] text-xs font-semibold text-[#C4A77D] hover:border-[#21D7C4]/60 cursor-pointer"
                      >
                        {notesContent[relIdx]?.title || `Module ${relIdx + 1}`}
                      </a>
                    );
                  })}
                </div>
              )}
            </section>

            {/* Editorial Review & Compliance Companion (Phase 2) */}
            <section
              aria-label="Module Learning Objectives and Regulatory Context"
              className="pt-8 mt-8 border-t border-[var(--amld-border)] space-y-5 text-xs sm:text-sm text-[#B8C7D9]"
            >
              <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] uppercase tracking-wider text-[#C4A77D] font-bold">
                <span>Editorial Review &amp; Compliance Companion</span>
                <span className="text-[#9BB0C7]">
                  {currentModule.reviewedDate ? `Reviewed: ${currentModule.reviewedDate}` : 'Editorial Standard: Reviewed Educational Note'}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-[#081524]/80 border border-white/10 space-y-1.5">
                  <h2 className="text-xs font-bold uppercase tracking-wider text-[#21D7C4]">
                    Learning Objectives &amp; Red Flags
                  </h2>
                  <p className="leading-relaxed">
                    {currentModule.learningObjectives ||
                      `Identify core compliance obligations, risk indicators, and investigative escalation steps for ${currentModule.title}. Cross-check customer profile baseline, source of funds/wealth documentation, and transaction anomalies before drawing conclusions.`}
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-[#081524]/80 border border-white/10 space-y-1.5">
                  <h2 className="text-xs font-bold uppercase tracking-wider text-[#F4B860]">
                    Authoritative Regulatory References
                  </h2>
                  <p className="leading-relaxed">
                    {currentModule.regulatoryRefs ||
                      'FATF International Standards on Combating Money Laundering and the Financing of Terrorism & Proliferation (Recommendations 1, 10, 12, 15, 20), applicable national AML/CFT statutes, and FIU reporting guidance.'}
                  </p>
                </div>
              </div>

              {Array.isArray(relatedIndices) && relatedIndices.length > 0 && typeof onSelectModule === 'function' && (
                <div className="pt-2 flex flex-wrap items-center gap-2">
                  <span className="text-xs font-semibold text-[#9BB0C7] mr-1">Related Modules:</span>
                  {relatedIndices.map((relIdx) => {
                    const relEntry = MODULE_BY_INDEX.get(relIdx);
                    const relHref = relEntry ? relEntry.routePath : '/notes';
                    return (
                      <a
                        key={relIdx}
                        href={relHref}
                        onClick={(e) => {
                          e.preventDefault();
                          onSelectModule(relIdx);
                        }}
                        className="px-3 py-1.5 rounded-lg bg-[#081524] border border-[var(--amld-border)] text-xs font-semibold text-[#C4A77D] hover:border-[#21D7C4]/60 cursor-pointer"
                      >
                        {notesContent[relIdx]?.title || `Module ${relIdx + 1}`}
                      </a>
                    );
                  })}
                </div>
              )}
            </section>

            {/* Module Step Controls */}
            <div className="pt-8 mt-8 border-t border-[var(--amld-border)] flex flex-wrap items-center justify-between gap-4">
              {pageIndex > 0 ? (
                <a
                  href={MODULE_BY_INDEX.get(pageIndex - 1)?.routePath || '/notes'}
                  onClick={(e) => {
                    e.preventDefault();
                    onSelectModule(Math.max(0, pageIndex - 1));
                  }}
                  className="px-4 py-2.5 rounded-xl text-xs font-semibold border border-[var(--amld-border)] bg-[#081524] text-[#F5F8FC]"
                >
                  ← Previous Module
                </a>
              ) : (
                <span className="px-4 py-2.5 rounded-xl text-xs font-semibold border border-[var(--amld-border)] bg-[#081524] text-[#F5F8FC] opacity-40">
                  ← Previous Module
                </span>
              )}
              {pageIndex < notesContent.length - 1 ? (
                <a
                  href={MODULE_BY_INDEX.get(pageIndex + 1)?.routePath || '/notes'}
                  onClick={(e) => {
                    e.preventDefault();
                    onSelectModule(Math.min(notesContent.length - 1, pageIndex + 1));
                  }}
                  className="amld-btn-primary px-5 py-2.5 rounded-xl text-xs font-bold"
                >
                  Next Module →
                </a>
              ) : (
                <span className="amld-btn-primary px-5 py-2.5 rounded-xl text-xs font-bold opacity-40">
                  Next Module →
                </span>
              )}
            </div>

            {/* Related Modules */}
            {relatedIndices.length > 0 && (
              <section aria-label="Related Modules" className="pt-8 mt-8 border-t border-[var(--amld-border)]">
                <p className="text-xs font-bold uppercase tracking-wider text-[#21D7C4] mb-4">
                  Related Syllabus Modules
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {relatedIndices.map((relIdx) => {
                    const relEntry = MODULE_BY_INDEX.get(relIdx);
                    const relHref = relEntry ? relEntry.routePath : '/notes';
                    return (
                      <a
                        key={relIdx}
                        href={relHref}
                        onClick={(e) => {
                          e.preventDefault();
                          onSelectModule(relIdx);
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                        }}
                        className="block text-left p-4 rounded-xl bg-[#081524] border border-[var(--amld-border)] hover:border-[#21D7C4]/50 transition-colors"
                      >
                        <span className="text-[11px] text-[#F4B860] block mb-1">Module {relIdx + 1}</span>
                        <span className="text-sm font-semibold text-[#F5F8FC] line-clamp-2">
                          {notesContent[relIdx]?.title}
                        </span>
                      </a>
                    );
                  })}
                </div>
              </section>
            )}
          </article>
        </div>
      </div>
    </div>
  );
}
