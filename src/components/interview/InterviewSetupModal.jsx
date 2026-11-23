import { useMemo, useState } from 'react';
import { X, Search, Sparkles, ShieldAlert } from 'lucide-react';
import { TARGET_COMPANIES, AML_ROLES, EXPERIENCE_LEVELS, QUESTION_COUNTS } from '../../data/aiInterviewBank';

export default function InterviewSetupModal({
  isOpen,
  initialConfig,
  onClose,
  onStartSession,
}) {
  const [companyQuery, setCompanyQuery] = useState(initialConfig?.company || 'JPMorgan Chase');
  const [selectedCompany, setSelectedCompany] = useState(initialConfig?.company || 'JPMorgan Chase');
  const [customCompany, setCustomCompany] = useState('');
  const [role, setRole] = useState(initialConfig?.role || 'AML Analyst');
  const [experienceLevel, setExperienceLevel] = useState(initialConfig?.experienceLevel || '1-3 Years');
  const [questionCount, setQuestionCount] = useState(initialConfig?.questionCount || 5);
  const [interviewMode, setInterviewMode] = useState('video');
  const [error, setError] = useState('');

  const filteredCompanies = useMemo(() => {
    const q = companyQuery.trim().toLowerCase();
    if (!q) return TARGET_COMPANIES;
    const matches = TARGET_COMPANIES.filter(
      (c) => c.name.toLowerCase().includes(q) || c.sector.toLowerCase().includes(q)
    );
    return matches.length > 0 ? matches : TARGET_COMPANIES.filter((c) => c.name === 'Other Company');
  }, [companyQuery]);

  if (!isOpen) return null;

  const effectiveCompany =
    selectedCompany === 'Other Company'
      ? (customCompany.trim() || 'Other Company')
      : (companyQuery.trim() || selectedCompany);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!effectiveCompany) {
      setError('Please select or type a target company.');
      return;
    }
    if (!role) {
      setError('Please select an AML role.');
      return;
    }
    if (!experienceLevel) {
      setError('Please select your experience level.');
      return;
    }
    setError('');
    onStartSession({
      company: effectiveCompany,
      role,
      experienceLevel,
      questionCount,
      interviewMode,
    });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/65 backdrop-blur-xs p-4 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="interview-setup-title"
    >
      <div className="w-full max-w-2xl rounded-2xl bg-white dark:bg-slate-900 border border-stone-200 dark:border-slate-800 shadow-2xl overflow-hidden my-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-200 dark:border-slate-800 bg-[#081C33] text-white">
          <div className="flex items-center gap-2.5">
            <Sparkles className="w-5 h-5 text-[#C4A77D]" />
            <div>
              <h2 id="interview-setup-title" className="text-lg font-bold">
                Configure Practice Interview
              </h2>
              <p className="text-xs text-slate-300">
                Three quick selections to tailor your simulated AML/KYC hiring session
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close setup modal"
            className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[82vh] overflow-y-auto">
          <div className="rounded-xl bg-amber-50/80 dark:bg-amber-950/30 border border-amber-300/70 dark:border-amber-700/50 px-4 py-3 text-xs text-amber-950 dark:text-amber-200 flex items-start gap-2.5">
            <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5 text-amber-700 dark:text-amber-400" />
            <span>
              <strong>Simulated Practice Notice:</strong> Company-based sessions tailor role context and typical work scenarios for practice only?they do not use confidential employer questions or official company assessments.
            </span>
          </div>

          {/* 1. Target Company */}
          <div className="space-y-2">
            <label htmlFor="company-search" className="block text-sm font-bold text-[#081C33] dark:text-slate-100">
              1. Select Target Company
            </label>
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                id="company-search"
                type="text"
                value={companyQuery}
                onChange={(e) => {
                  const val = e.target.value;
                  setCompanyQuery(val);
                  const exact = TARGET_COMPANIES.find((c) => c.name.toLowerCase() === val.trim().toLowerCase());
                  if (exact) setSelectedCompany(exact.name);
                  else setSelectedCompany('Other Company');
                }}
                placeholder="Search or type a company name (e.g., HSBC, Revolut, Genpact)..."
                className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-stone-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#1E3A5F]"
              />
            </div>

            <div className="flex flex-wrap gap-1.5 pt-1">
              {filteredCompanies.slice(0, 10).map((c) => {
                const active = selectedCompany === c.name && companyQuery.toLowerCase() === c.name.toLowerCase();
                return (
                  <button
                    key={c.name}
                    type="button"
                    onClick={() => {
                      setSelectedCompany(c.name);
                      setCompanyQuery(c.name);
                    }}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors cursor-pointer ${
                      active
                        ? 'bg-[#081C33] text-white border-[#081C33]'
                        : 'bg-stone-50 dark:bg-slate-800/70 text-slate-700 dark:text-slate-300 border-stone-200 dark:border-slate-700 hover:border-[#C4A77D]'
                    }`}
                  >
                    {c.name}
                  </button>
                );
              })}
            </div>

            {selectedCompany === 'Other Company' && (
              <input
                type="text"
                value={customCompany}
                onChange={(e) => setCustomCompany(e.target.value)}
                placeholder="Enter custom company name (optional)"
                className="mt-2 w-full px-3 py-2 rounded-xl border border-stone-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-slate-100"
              />
            )}
          </div>

          {/* 2. Select AML Role */}
          <div className="space-y-2">
            <label htmlFor="aml-role-select" className="block text-sm font-bold text-[#081C33] dark:text-slate-100">
              2. Select AML Role
            </label>
            <select
              id="aml-role-select"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#1E3A5F]"
            >
              {AML_ROLES.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>

          {/* 3. Select Experience Level */}
          <div className="space-y-2">
            <span className="block text-sm font-bold text-[#081C33] dark:text-slate-100">
              3. Select Experience Level
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {EXPERIENCE_LEVELS.map((lvl) => {
                const selected = experienceLevel === lvl.id;
                return (
                  <button
                    key={lvl.id}
                    type="button"
                    onClick={() => setExperienceLevel(lvl.id)}
                    className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                      selected
                        ? 'border-[#081C33] dark:border-[#C4A77D] bg-[#081C33]/5 dark:bg-slate-800 ring-1 ring-[#081C33] dark:ring-[#C4A77D]'
                        : 'border-stone-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:border-stone-400'
                    }`}
                  >
                    <div className="text-xs font-bold text-[#081C33] dark:text-slate-100">{lvl.label}</div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 mt-0.5">
                      {lvl.summary}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Optional Question Count (Default 5) */}
          <div className="space-y-2 pt-1 border-t border-stone-200 dark:border-slate-800">
            <span className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
              Interview Length (Default: 5 Questions)
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {QUESTION_COUNTS.map((opt) => {
                const active = questionCount === opt.count;
                return (
                  <button
                    key={opt.count}
                    type="button"
                    onClick={() => setQuestionCount(opt.count)}
                    className={`px-3 py-2 rounded-xl border text-xs font-semibold transition-colors cursor-pointer ${
                      active
                        ? 'bg-[#1E3A5F] text-white border-[#1E3A5F]'
                        : 'bg-stone-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-stone-200 dark:border-slate-700 hover:border-[#1E3A5F]'
                    }`}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </div>

          {error && (
            <p className="text-xs font-semibold text-red-600 dark:text-red-400" role="alert">
              {error}
            </p>
          )}

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-stone-100 dark:hover:bg-slate-800 cursor-pointer"
            >
              Cancel
            </button>
            <div className="grid grid-cols-2 gap-2.5 mb-4">
              <button
                type="button"
                onClick={() => setInterviewMode('video')}
                className={`p-3 rounded-xl border text-left transition cursor-pointer ${
                  interviewMode === 'video'
                    ? 'border-[#C4A77D] bg-[#081C33] text-white'
                    : 'border-stone-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                }`}
              >
                <div className="text-xs font-bold">Live AI Interview</div>
                <div className="text-[11px] opacity-80">Video room + camera &amp; controls</div>
              </button>
              <button
                type="button"
                onClick={() => setInterviewMode('text')}
                className={`p-3 rounded-xl border text-left transition cursor-pointer ${
                  interviewMode === 'text'
                    ? 'border-[#C4A77D] bg-[#081C33] text-white'
                    : 'border-stone-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                }`}
              >
                <div className="text-xs font-bold">Text Interview</div>
                <div className="text-[11px] opacity-80">Classic text &amp; typed practice</div>
              </button>
            </div>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl text-sm font-bold bg-[#081C33] hover:bg-[#1E3A5F] text-white shadow-sm transition-colors cursor-pointer"
            >
              Begin Simulated Interview
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
