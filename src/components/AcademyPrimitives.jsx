import React from 'react';

export function AcademyBrandMark({ className = 'h-7 w-7' }) {
  return (
    <span className="inline-flex items-center gap-3 select-none">
      <img
        src="/logo.png"
        alt="AMLDecode logo"
        className={`${className} rounded-lg object-contain bg-[#132B3E] p-1 border border-[#21D7C4]/30`}
      />
      <span className="text-base sm:text-lg font-bold tracking-tight text-[#F5F8FC]">
        AML<span className="text-[#21D7C4]">Decode</span>
      </span>
    </span>
  );
}

export function SectionHeader({ eyebrow, title, subtitle, action }) {
  return (
    <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
      <div>
        {eyebrow && (
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#21D7C4] mb-2">
            {eyebrow}
          </p>
        )}
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#F5F8FC]">
          {title}
        </h2>
        {subtitle && (
          <p className="mt-2 text-sm sm:text-base text-[#B8C7D9] max-w-2xl">
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
      ? 'bg-[#F4B860]/15 text-[#F4B860] border-[#F4B860]/30'
      : 'bg-[#21D7C4]/10 text-[#21D7C4] border-[#21D7C4]/30';
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${styles}`}>
      {children}
    </span>
  );
}
