import React, { useEffect, useMemo, useRef, useState } from 'react';
import { TopicBadge } from './AcademyPrimitives';

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

  const handleCopyLink = async () => {
    const slug = encodeURIComponent(
      (currentModule.title || `module-${pageIndex + 1}`)
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '')
    );
    const shareUrl = `${window.location.origin}${window.location.pathname}#module=${pageIndex + 1}-${slug}`;
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
            <button type="button" onClick={onBackHome} className="hover:text-[#21D7C4] font-medium shrink-0">
              Home
            </button>
            <span className="text-[#7E93AB]">/</span>
            <span className="text-[#B8C7D9] shrink-0">Syllabus Notes</span>
            <span className="text-[#7E93AB]">/</span>
            <span className="text-[#F5F8FC] font-semibold truncate">{currentModule.title}</span>
          </nav>

          <div className="flex items-center gap-2 shrink-0">
            <span className="hidden sm:inline text-xs text-[#7E93AB]">{readProgress}% read</span>
            <button
              type="button"
              onClick={handleCopyLink}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold border border-[var(--amld-border)] bg-[#0D1E30] text-[#F5F8FC] hover:border-[#21D7C4]/50"
            >
              {copied ? 'Link Copied' : 'Copy Link'}
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12 flex-grow">
        {/* Publication Article Header */}
        <header className="mb-8 pb-6 border-b border-[var(--amld-border)]">
          <div className="flex flex-wrap items-center gap-3 mb-3">
            <TopicBadge tone="teal">
              Module {pageIndex + 1} of {notesContent.length}
            </TopicBadge>
            <TopicBadge tone="amber">Compliance Syllabus</TopicBadge>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[#F5F8FC]">
            {currentModule.title}
          </h1>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Module Index Sidebar */}
          <aside className="lg:col-span-3 space-y-6">
            <div className="bg-[#0D1E30] border border-[var(--amld-border)] rounded-2xl p-4">
              <p className="text-xs font-bold uppercase tracking-wider text-[#21D7C4] mb-3 px-1">
                All Modules ({notesContent.length})
              </p>
              <div
                ref={sidebarRef}
                className="flex lg:flex-col gap-2 overflow-x-auto lg:overflow-y-auto max-h-none lg:max-h-[55vh] pb-2 lg:pb-0 pr-1"
              >
                {notesContent.map((mod, idx) => (
                  <button
                    key={idx}
                    type="button"
                    ref={(el) => (pillRefs.current[idx] = el)}
                    onClick={() => onSelectModule(idx)}
                    className={`shrink-0 lg:shrink min-w-[200px] lg:min-w-0 w-auto lg:w-full text-left px-3.5 py-2.5 rounded-xl border text-xs transition-colors ${
                      idx === pageIndex
                        ? 'bg-[#21D7C4]/15 border-[#21D7C4] text-[#21D7C4] font-bold'
                        : 'bg-[#081524] border-[var(--amld-border)] text-[#B8C7D9] hover:text-[#F5F8FC]'
                    }`}
                  >
                    <span className="block text-[10px] opacity-70">0{idx + 1 > 9 ? '' : ''}{idx + 1}</span>
                    <span className="line-clamp-2 mt-0.5">{mod.title}</span>
                  </button>
                ))}
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

            {/* Module Step Controls */}
            <div className="pt-8 mt-8 border-t border-[var(--amld-border)] flex flex-wrap items-center justify-between gap-4">
              <button
                type="button"
                disabled={pageIndex <= 0}
                onClick={() => onSelectModule(Math.max(0, pageIndex - 1))}
                className="px-4 py-2.5 rounded-xl text-xs font-semibold border border-[var(--amld-border)] bg-[#081524] text-[#F5F8FC] disabled:opacity-40"
              >
                ← Previous Module
              </button>
              <button
                type="button"
                disabled={pageIndex >= notesContent.length - 1}
                onClick={() => onSelectModule(Math.min(notesContent.length - 1, pageIndex + 1))}
                className="amld-btn-primary px-5 py-2.5 rounded-xl text-xs font-bold disabled:opacity-40"
              >
                Next Module →
              </button>
            </div>

            {/* Related Modules */}
            {relatedIndices.length > 0 && (
              <section aria-label="Related Modules" className="pt-8 mt-8 border-t border-[var(--amld-border)]">
                <p className="text-xs font-bold uppercase tracking-wider text-[#21D7C4] mb-4">
                  Related Syllabus Modules
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {relatedIndices.map((relIdx) => (
                    <button
                      key={relIdx}
                      type="button"
                      onClick={() => {
                        onSelectModule(relIdx);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      className="text-left p-4 rounded-xl bg-[#081524] border border-[var(--amld-border)] hover:border-[#21D7C4]/50 transition-colors"
                    >
                      <span className="text-[11px] text-[#F4B860] block mb-1">Module {relIdx + 1}</span>
                      <span className="text-sm font-semibold text-[#F5F8FC] line-clamp-2">
                        {notesContent[relIdx]?.title}
                      </span>
                    </button>
                  ))}
                </div>
              </section>
            )}
          </article>
        </div>
      </div>
    </div>
  );
}
