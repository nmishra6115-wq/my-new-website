import {
  KNOWLEDGE_DOMAINS,
  DIFFICULTY_LEVELS,
  QUESTION_COUNTS,
  ASSESSMENT_MODES,
} from '../data/knowledgeTestBank';

const DOMAIN_DESCRIPTIONS = {
  'AML/KYC': 'Customer due diligence, beneficial ownership, source of funds/wealth, and PEP controls.',
  'Transaction Monitoring': 'Alert triage, typologies like structuring and pass-throughs, and baseline deviation analysis.',
  'SAR Investigations': 'Factual chronologies, red-flag rationale, anti-tipping-off rules, and narrative quality.',
  'Sanctions & Screening': 'Name/alias matching, identifier verification, ownership/control, and hold/escalation rules.',
};

export default function KnowledgeTestSetup({
  selectedDomain,
  onSelectDomain,
  selectedDifficulty,
  onSelectDifficulty,
  selectedCount,
  onSelectCount,
  selectedMode,
  onSelectMode,
  onStartAssessment,
  availableCount = 0,
  isLoading = false,
  recentAttempts = [],
}) {
  return (
    <section
      aria-labelledby="kt2-main-heading"
      className="space-y-8 max-w-4xl mx-auto transition-opacity duration-300"
    >
      {/* Header Block */}
      <div className="border-b border-slate-200 pb-6">
        <h1
          id="kt2-main-heading"
          className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[#081C33]"
        >
          Test Your Financial Crime Intelligence
        </h1>
        <p className="text-sm sm:text-base text-[#334155] mt-2 max-w-2xl leading-relaxed">
          Practice realistic AML/KYC controls, transaction monitoring typologies, SAR
          investigation judgment, and sanctions screening across structured difficulty levels.
        </p>
      </div>

      {/* 1. Four Domain Selectors */}
      <div className="space-y-3">
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-xs font-bold uppercase tracking-wider text-[#C4A77D]">
            1. Select Compliance Domain
          </h2>
          <span className="text-xs text-[#9BB0C7]">
            {isLoading
              ? 'Syncing question bank...'
              : `${availableCount} active item${availableCount === 1 ? '' : 's'} in ${selectedDomain}`}
          </span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {KNOWLEDGE_DOMAINS.map((domain) => {
            const active = selectedDomain === domain;
            return (
              <button
                key={domain}
                type="button"
                aria-pressed={active}
                onClick={() => onSelectDomain(domain)}
                className={`text-left p-4 rounded-xl border transition-all duration-200 cursor-pointer ${
                  active
                    ? 'bg-[#132B3E] border-[#C4A77D] shadow-[0_0_0_1px_rgba(196,167,125,0.35)]'
                    : 'bg-[#0D1E30] border-[var(--amld-border)] hover:border-[#C4A77D]/50'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span
                    className={`text-sm font-bold ${
                      active ? 'text-[#C4A77D]' : 'text-[#F5F8FC]'
                    }`}
                  >
                    {domain}
                  </span>
                  <span
                    className={`h-2.5 w-2.5 rounded-full transition-colors ${
                      active ? 'bg-[#C4A77D]' : 'bg-white/15'
                    }`}
                  />
                </div>
                <p className="text-xs text-[#B8C7D9] mt-1.5 leading-relaxed">
                  {DOMAIN_DESCRIPTIONS[domain]}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Difficulty & Question Count Selectors */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-[#0D1E30] border border-[var(--amld-border)] rounded-2xl p-5 space-y-3">
          <h2 className="text-xs font-bold uppercase tracking-wider text-[#C4A77D]">
            2. Difficulty Level
          </h2>
          <div className="grid grid-cols-2 gap-2">
            {DIFFICULTY_LEVELS.map((level) => {
              const active = selectedDifficulty === level;
              return (
                <button
                  key={level}
                  type="button"
                  aria-pressed={active}
                  onClick={() => onSelectDifficulty(level)}
                  className={`px-3 py-2.5 rounded-lg text-xs font-bold border transition-all duration-200 cursor-pointer ${
                    active
                      ? 'bg-[#C4A77D]/15 border-[#C4A77D] text-[#C4A77D]'
                      : 'bg-[#081C33]/70 border-[var(--amld-border)] text-[#B8C7D9] hover:text-[#F5F8FC]'
                  }`}
                >
                  {level}
                </button>
              );
            })}
          </div>
        </div>

        <div className="bg-[#0D1E30] border border-[var(--amld-border)] rounded-2xl p-5 space-y-3">
          <h2 className="text-xs font-bold uppercase tracking-wider text-[#C4A77D]">
            3. Question Count
          </h2>
          <div className="grid grid-cols-4 gap-2">
            {QUESTION_COUNTS.map((count) => {
              const active = selectedCount === count;
              return (
                <button
                  key={count}
                  type="button"
                  aria-pressed={active}
                  onClick={() => onSelectCount(count)}
                  className={`py-2.5 rounded-lg text-xs font-bold border transition-all duration-200 cursor-pointer ${
                    active
                      ? 'bg-[#C4A77D]/15 border-[#C4A77D] text-[#C4A77D]'
                      : 'bg-[#081C33]/70 border-[var(--amld-border)] text-[#B8C7D9] hover:text-[#F5F8FC]'
                  }`}
                >
                  {count}
                </button>
              );
            })}
          </div>
          <p className="text-[11px] text-[#9BB0C7]">
            Draws from reviewed compliance items across domains and difficulty levels.
          </p>
        </div>
      </div>

      {/* 4. Assessment Mode Selector */}
      <div className="bg-[#0D1E30] border border-[var(--amld-border)] rounded-2xl p-5 space-y-3">
        <h2 className="text-xs font-bold uppercase tracking-wider text-[#C4A77D]">
          4. Assessment Mode
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {ASSESSMENT_MODES.map((mode) => {
            const active = selectedMode === mode.id;
            return (
              <button
                key={mode.id}
                type="button"
                aria-pressed={active}
                onClick={() => onSelectMode(mode.id)}
                className={`text-left p-3.5 rounded-xl border transition-all duration-200 cursor-pointer ${
                  active
                    ? 'bg-[#132B3E] border-[#C4A77D] text-[#F5F8FC]'
                    : 'bg-[#081C33]/70 border-[var(--amld-border)] text-[#B8C7D9] hover:text-[#F5F8FC]'
                }`}
              >
                <div
                  className={`text-xs font-bold ${
                    active ? 'text-[#C4A77D]' : 'text-[#F5F8FC]'
                  }`}
                >
                  {mode.label}
                </div>
                <p className="text-[11px] text-[#9BB0C7] mt-1 leading-snug">
                  {mode.summary}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Start Assessment Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
        <div className="text-xs text-[#B8C7D9]">
          Selected:{' '}
          <span className="font-semibold text-[#F5F8FC]">{selectedDomain}</span> ·{' '}
          <span className="font-semibold text-[#F5F8FC]">{selectedDifficulty}</span> ·{' '}
          <span className="font-semibold text-[#F5F8FC]">{selectedCount} Qs</span>
        </div>
        <button
          type="button"
          onClick={() =>
            typeof onStartAssessment === 'function' &&
            onStartAssessment({
              domain: selectedDomain,
              difficulty: selectedDifficulty,
              count: selectedCount,
              mode: selectedMode,
            })
          }
          className="px-6 py-3 rounded-xl bg-[#C4A77D] text-[#081C33] font-extrabold text-sm tracking-wide hover:bg-[#d2b891] transition-colors cursor-pointer"
        >
          Start Assessment
        </button>
      </div>

      {/* Recent Performance — Shown Only When Actual Stored Data Exists */}
      {recentAttempts.length > 0 && (
        <div className="bg-[#0D1E30] border border-[var(--amld-border)] rounded-2xl p-5 space-y-3">
          <h2 className="text-xs font-bold uppercase tracking-wider text-[#C4A77D]">
            Recent Performance
          </h2>
          <div className="divide-y divide-white/10">
            {recentAttempts.slice(0, 5).map((attempt, idx) => (
              <div
                key={attempt.id || idx}
                className="py-2.5 flex items-center justify-between gap-4 text-xs"
              >
                <div>
                  <span className="font-bold text-[#F5F8FC]">{attempt.domain}</span>
                  <span className="text-[#9BB0C7] ml-2">
                    ({attempt.difficulty} · {attempt.mode})
                  </span>
                </div>
                <div className="font-bold text-[#C4A77D]">
                  {attempt.score} / {attempt.total}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}


