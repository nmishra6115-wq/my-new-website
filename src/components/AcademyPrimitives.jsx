
export function AcademyBrandMark({ className = 'h-7 w-7', theme = 'dark' }) {
  const isLight = theme === 'light';
  return (
    <span className="inline-flex items-center gap-3 select-none">
      <img
        src="/logo.png"
        alt="AMLDecode logo"
        className={`${className} rounded-lg object-contain bg-[#1E3A5F] p-1 border border-[#C4A77D]/40`}
      />
      <span
        className={`text-base sm:text-lg font-bold tracking-tight ${
          isLight ? 'text-slate-900' : 'text-white'
        }`}
      >
        AML<span className={isLight ? 'text-amber-700' : 'text-[#C4A77D]'}>Decode</span>
      </span>
    </span>
  );
}

export function SectionHeader({ eyebrow, title, subtitle, action }) {
  return (
    <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
      <div>
        {eyebrow && (
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#C4A77D] mb-2">
            {eyebrow}
          </p>
        )}
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#081C33]">
          {title}
        </h2>
        {subtitle && (
          <p className="mt-2 text-sm sm:text-base text-[#556B8B] max-w-2xl">
            {subtitle}
          </p>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}

export function IntelligenceCard({ children, className = '' }) {
  return (
    <div className={`amld-card rounded-2xl p-6 ${className}`}>
      {children}
    </div>
  );
}

export function TopicBadge({ children, tone = 'teal' }) {
  const styles =
    tone === 'amber'
      ? 'bg-[#C4A77D]/20 text-[#7A5C2E] border-[#C4A77D]/50'
      : 'bg-[#1E3A5F]/10 text-[#1E3A5F] border-[#1E3A5F]/30';
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${styles}`}>
      {children}
    </span>
  );
}

