import { useEffect, useState } from 'react';

const DEFAULT_MAILTO = "mailto:alerts@amldecode.in?subject=Supporting%20AMLDecode%20%2F%20Free%20Tools&body=Hi%2C%0A%0AI've%20been%20using%20the%20free%20tools%20and%20study%20resources%20and%20would%20love%20to%20know%20how%20I%20can%20contribute.%0A%0APlease%20share%20the%20details%20when%20convenient.";

export default function SupportDeveloperBanner({
  supportUrl = DEFAULT_MAILTO,
  eyebrow = 'From the Developer',
  title = 'Built to stay free — support if it helps',
  description = "I'm building and maintaining these free practice tools and study resources so learners can prepare without barriers. If this site has helped your workflow or prep and you'd like to contribute, email alerts@amldecode.in and I'll share the details.",
  ctaLabel = 'Buy Me a Coffee',
  variant = 'popup',
}) {
  const [open, setOpen] = useState(true);

  useEffect(() => {
    if (!open || variant !== 'popup') return;

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, variant]);

  if (!open) return null;

  const isMailto = /^mailto:/i.test(supportUrl);
  const isExternal = /^https?:\/\//i.test(supportUrl);

  if (variant === 'banner') {
    return (
      <section
        aria-label="Support the developer"
        className="mx-auto my-6 w-full max-w-6xl px-4 sm:px-6"
      >
        <div className="relative rounded-2xl border border-[#C4A77D]/40 bg-[#081C33] p-4 sm:p-5 text-slate-100 shadow-sm">
          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label="Close support notice"
            className="absolute right-3 top-3 rounded-lg px-2 py-0.5 text-xs text-slate-400 hover:bg-white/10 hover:text-white cursor-pointer"
          >
            ×
          </button>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between pr-6">
            <div className="space-y-1">
              <p className="text-xs font-bold uppercase tracking-wider text-[#C4A77D]">
                {eyebrow}
              </p>
              <h3 className="text-sm sm:text-base font-bold text-white">
                {title}
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 max-w-3xl leading-relaxed">
                {description}
              </p>
            </div>

            <div className="flex shrink-0 items-center gap-2.5">
              <a
                href={supportUrl}
                target={!isMailto && isExternal ? '_blank' : undefined}
                rel={!isMailto && isExternal ? 'noopener noreferrer' : undefined}
                className="inline-flex items-center justify-center rounded-xl bg-[#C4A77D] px-4 py-2 text-xs sm:text-sm font-bold text-[#081C33] hover:bg-[#d4ba8f] transition-colors"
              >
                {ctaLabel}
              </a>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="From the Developer"
      onClick={() => setOpen(false)}
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/65 p-4 backdrop-blur-[2px]"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-md rounded-2xl border border-[#C4A77D]/50 bg-[#081C33] p-6 text-slate-100 shadow-2xl"
      >
        <button
          type="button"
          onClick={() => setOpen(false)}
          aria-label="Close pop-up"
          className="absolute right-3.5 top-3.5 rounded-lg px-2.5 py-1 text-sm font-bold text-slate-300 hover:bg-white/10 hover:text-white cursor-pointer"
        >
          ×
        </button>

        <div className="space-y-2.5 pr-6">
          <p className="text-xs font-bold uppercase tracking-wider text-[#C4A77D]">
            {eyebrow}
          </p>
          <h3 className="text-lg font-bold text-white leading-snug">
            {title}
          </h3>
          <p className="text-sm text-slate-300 leading-relaxed">
            {description}
          </p>
        </div>

        <div className="mt-5 flex flex-wrap items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="inline-flex items-center justify-center rounded-xl border border-slate-600 px-4 py-2 text-xs sm:text-sm font-semibold text-slate-200 hover:bg-white/10 transition-colors cursor-pointer"
          >
            Close
          </button>
          <a
            href={supportUrl}
            target={!isMailto && isExternal ? '_blank' : undefined}
            rel={!isMailto && isExternal ? 'noopener noreferrer' : undefined}
            className="inline-flex items-center justify-center rounded-xl bg-[#C4A77D] px-4 py-2 text-xs sm:text-sm font-bold text-[#081C33] hover:bg-[#d4ba8f] transition-colors"
          >
            {ctaLabel}
          </a>
        </div>
      </div>
    </div>
  );
}
