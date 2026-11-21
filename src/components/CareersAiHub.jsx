import { useEffect, useMemo, useState } from 'react';
import { INDIA_STATES_AND_UTS, getCitiesForState } from '../data/indiaLocations';
import { buildInitialCareersJobs, ROLE_CATEGORIES } from '../data/careersSeed';

function readInitialFiltersFromUrl() {
  try {
    const params = new URLSearchParams(window.location.search);
    const rawState = params.get('state') || 'All India';
    const validState =
      rawState === 'All India' || INDIA_STATES_AND_UTS.some((s) => s.name === rawState)
        ? rawState
        : 'All India';

    const availableCities = getCitiesForState(validState);
    const rawCity = params.get('city') || 'All';
    const validCity =
      validState !== 'All India' && availableCities.includes(rawCity) ? rawCity : 'All';

    const rawRole = params.get('role') || 'All Roles';
    const validRole = ROLE_CATEGORIES.includes(rawRole) ? rawRole : 'All Roles';

    return {
      query: params.get('q') || '',
      state: validState,
      city: validCity,
      role: validRole,
      experience: params.get('exp') || 'All',
      workMode: params.get('mode') || 'All',
      freshness: params.get('fresh') || 'All',
    };
  } catch {
    return {
      query: '',
      state: 'All India',
      city: 'All',
      role: 'All Roles',
      experience: 'All',
      workMode: 'All',
      freshness: 'All',
    };
  }
}

function writeFiltersToUrl(filters) {
  try {
    const url = new URL(window.location.href);
    const setOrDelete = (key, val, defaultVal) => {
      if (!val || val === defaultVal) {
        url.searchParams.delete(key);
      } else {
        url.searchParams.set(key, val);
      }
    };
    setOrDelete('q', filters.query.trim(), '');
    setOrDelete('state', filters.state, 'All India');
    setOrDelete('city', filters.city, 'All');
    setOrDelete('role', filters.role, 'All Roles');
    setOrDelete('exp', filters.experience, 'All');
    setOrDelete('mode', filters.workMode, 'All');
    setOrDelete('fresh', filters.freshness, 'All');
    window.history.replaceState({}, '', url.toString());
  } catch {
    // Ignore history API restrictions
  }
}

function getAgeInDays(job, nowMs) {
  const dateStr = job.publishedAt || job.firstSeenAt;
  if (!dateStr) return null;
  const parsed = Date.parse(dateStr);
  if (Number.isNaN(parsed)) return null;
  return Math.max(0, Math.floor((nowMs - parsed) / 86400000));
}

export default function CareersAiHub({ onOpenView }) {
  const [nowMs] = useState(() => Date.now());
  const [isLoadingInitial, setIsLoadingInitial] = useState(true);
  const [filters, setFilters] = useState(() => readInitialFiltersFromUrl());

  useEffect(() => {
    const timer = setTimeout(() => setIsLoadingInitial(false), 120);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    writeFiltersToUrl(filters);
  }, [filters]);

  const allJobs = useMemo(() => buildInitialCareersJobs(nowMs), [nowMs]);
  const cityOptions = useMemo(() => getCitiesForState(filters.state), [filters.state]);

  const filteredJobs = useMemo(() => {
    const q = filters.query.trim().toLowerCase();

    return allJobs.filter((job) => {
      if (job.status !== 'active') return false;

      if (filters.state !== 'All India') {
        if (job.remoteEligibility === 'remote') return false;
        if (job.state !== filters.state) return false;
        if (filters.city !== 'All' && job.city !== filters.city) return false;
      }

      if (filters.role !== 'All Roles' && job.roleCategory !== filters.role) {
        return false;
      }

      if (filters.workMode !== 'All') {
        if (filters.workMode === 'Remote' && job.remoteEligibility !== 'remote') return false;
        if (filters.workMode === 'Onsite' && job.remoteEligibility === 'remote') return false;
        if (filters.workMode === 'Hybrid' && job.remoteEligibility !== 'hybrid') return false;
      }

      if (filters.experience !== 'All' && !job.experienceLabel) {
        return false;
      }

      if (filters.freshness !== 'All') {
        const ageDays = getAgeInDays(job, nowMs);
        if (ageDays === null) return false;
        if (filters.freshness === '3d' && ageDays > 3) return false;
        if (filters.freshness === '7d' && ageDays > 7) return false;
        if (filters.freshness === '15d' && ageDays > 15) return false;
      }

      if (q) {
        const haystack = [
          job.title,
          job.employer,
          job.city || '',
          job.state || '',
          job.roleCategory,
          ...(job.skills || []),
        ]
          .join(' ')
          .toLowerCase();
        if (!haystack.includes(q)) return false;
      }

      return true;
    });
  }, [allJobs, filters, nowMs]);

  const handleStateChange = (nextState) => {
    setFilters((prev) => ({
      ...prev,
      state: nextState,
      city: 'All',
    }));
  };

  const handleResetFilters = () => {
    setFilters({
      query: '',
      state: 'All India',
      city: 'All',
      role: 'All Roles',
      experience: 'All',
      workMode: 'All',
      freshness: 'All',
    });
  };

  const verifiedDateDisplay = new Date(nowMs).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  return (
    <section aria-label="AMLDecode Careers AI" className="space-y-7 text-slate-900">
      {/* Editorial Hero Header */}
      <div className="rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white p-6 sm:p-8 border border-amber-500/25 shadow-sm">
        <div className="flex flex-wrap items-end justify-between gap-5">
          <div className="space-y-2 max-w-2xl">
            <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-amber-400">
              AMLDecode Careers AI · India Compliance Role Board
            </p>
            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white">
              Financial Crime &amp; Compliance Roles Across India
            </h1>
            <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
              Curated AML, KYC, KYB, transaction monitoring, sanctions, and risk openings across 28 States and 8 Union Territories.
            </p>
          </div>

          {typeof onOpenView === 'function' && (
            <div className="flex flex-wrap items-center gap-2.5">
              <button
                type="button"
                onClick={() => onOpenView('referralForm')}
                className="px-4 py-2.5 rounded-xl text-xs font-bold bg-amber-500 text-slate-950 hover:bg-amber-400 transition-colors cursor-pointer"
              >
                Submit Referral
              </button>
              <button
                type="button"
                onClick={() => onOpenView('contribute')}
                className="px-4 py-2.5 rounded-xl text-xs font-bold bg-white/10 text-white border border-white/20 hover:bg-white/15 transition-colors cursor-pointer"
              >
                Recruiter Desk
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Filter Console */}
      <div className="rounded-2xl bg-white p-5 sm:p-6 border border-slate-200 shadow-xs space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
          <div className="md:col-span-5">
            <label htmlFor="careers-search-input" className="block text-xs font-bold uppercase tracking-wide text-slate-700 mb-1.5">
              Search Role, Skill, or Institution
            </label>
            <input
              id="careers-search-input"
              type="search"
              value={filters.query}
              onChange={(e) => setFilters((prev) => ({ ...prev, query: e.target.value }))}
              placeholder="AML analyst, KYC, TM, RFI, Bengaluru..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 text-sm text-slate-900 placeholder:text-slate-400 border border-slate-300 focus:outline-none focus:border-amber-600 focus:bg-white"
            />
          </div>

          <div className="md:col-span-4">
            <label htmlFor="careers-state-select" className="block text-xs font-bold uppercase tracking-wide text-slate-700 mb-1.5">
              State / Union Territory (28 · 8)
            </label>
            <select
              id="careers-state-select"
              value={filters.state}
              onChange={(e) => handleStateChange(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 text-sm font-medium text-slate-900 border border-slate-300 focus:outline-none focus:border-amber-600 focus:bg-white"
            >
              <option value="All India">All India</option>
              <optgroup label="States (28)">
                {INDIA_STATES_AND_UTS.filter((r) => r.category === 'State').map((st) => (
                  <option key={st.code} value={st.name}>
                    {st.name}
                  </option>
                ))}
              </optgroup>
              <optgroup label="Union Territories (8)">
                {INDIA_STATES_AND_UTS.filter((r) => r.category === 'Union Territory').map((ut) => (
                  <option key={ut.code} value={ut.name}>
                    {ut.name}
                  </option>
                ))}
              </optgroup>
            </select>
          </div>

          <div className="md:col-span-3">
            <label htmlFor="careers-city-select" className="block text-xs font-bold uppercase tracking-wide text-slate-700 mb-1.5">
              City ({filters.state === 'All India' ? 'All India' : cityOptions.length})
            </label>
            <select
              id="careers-city-select"
              disabled={filters.state === 'All India' || cityOptions.length === 0}
              value={filters.city}
              onChange={(e) => setFilters((prev) => ({ ...prev, city: e.target.value }))}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 text-sm font-medium text-slate-900 border border-slate-300 disabled:opacity-50 focus:outline-none focus:border-amber-600 focus:bg-white"
            >
              <option value="All">
                {filters.state === 'All India' ? 'All Cities (All India)' : `All Cities in ${filters.state}`}
              </option>
              {cityOptions.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 pt-2 border-t border-slate-100">
          <div>
            <label htmlFor="careers-role-select" className="block text-[11px] font-bold uppercase tracking-wide text-slate-600 mb-1">
              Discipline
            </label>
            <select
              id="careers-role-select"
              value={filters.role}
              onChange={(e) => setFilters((prev) => ({ ...prev, role: e.target.value }))}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 text-xs font-medium text-slate-900 border border-slate-300 focus:outline-none focus:border-amber-600"
            >
              {ROLE_CATEGORIES.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="careers-exp-select" className="block text-[11px] font-bold uppercase tracking-wide text-slate-600 mb-1">
              Experience Tier
            </label>
            <select
              id="careers-exp-select"
              value={filters.experience}
              onChange={(e) => setFilters((prev) => ({ ...prev, experience: e.target.value }))}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 text-xs font-medium text-slate-900 border border-slate-300 focus:outline-none focus:border-amber-600"
            >
              <option value="All">Any Verified Tier</option>
              <option value="Entry">Entry / Fresher (Published Only)</option>
              <option value="Mid">Mid / Senior (Published Only)</option>
            </select>
          </div>

          <div>
            <label htmlFor="careers-mode-select" className="block text-[11px] font-bold uppercase tracking-wide text-slate-600 mb-1">
              Work Mode
            </label>
            <select
              id="careers-mode-select"
              value={filters.workMode}
              onChange={(e) => setFilters((prev) => ({ ...prev, workMode: e.target.value }))}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 text-xs font-medium text-slate-900 border border-slate-300 focus:outline-none focus:border-amber-600"
            >
              <option value="All">All Modes</option>
              <option value="Remote">Remote</option>
              <option value="Hybrid">Hybrid</option>
              <option value="Onsite">On-site / Office</option>
            </select>
          </div>

          <div>
            <label htmlFor="careers-fresh-select" className="block text-[11px] font-bold uppercase tracking-wide text-slate-600 mb-1">
              Recency Window
            </label>
            <select
              id="careers-fresh-select"
              value={filters.freshness}
              onChange={(e) => setFilters((prev) => ({ ...prev, freshness: e.target.value }))}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 text-xs font-medium text-slate-900 border border-slate-300 focus:outline-none focus:border-amber-600"
            >
              <option value="All">All Active Roles</option>
              <option value="3d">Last 3 Days</option>
              <option value="7d">Last 7 Days</option>
              <option value="15d">Within 15 Days</option>
            </select>
          </div>

          <div className="flex items-end">
            <button
              type="button"
              onClick={handleResetFilters}
              className="w-full px-4 py-2 rounded-xl text-xs font-bold bg-slate-100 text-slate-800 border border-slate-300 hover:bg-slate-200 transition-colors cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        </div>
      </div>

      {/* Results Summary Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-600 px-1">
        <p>
          Showing <strong className="text-slate-900 font-bold">{filteredJobs.length}</strong> active openings in{' '}
          <strong className="text-amber-800 font-bold">
            {filters.state === 'All India'
              ? 'All India'
              : filters.city !== 'All'
              ? `${filters.city}, ${filters.state}`
              : filters.state}
          </strong>
        </p>
        <p className="text-slate-500">
          Only verified listing fields are shown; unstated pay or dates are never estimated.
        </p>
      </div>

      {/* Listing Grid */}
      {isLoadingInitial ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5" aria-busy="true" aria-label="Loading openings">
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className="h-52 rounded-2xl bg-slate-100 border border-slate-200 animate-pulse" />
          ))}
        </div>
      ) : filteredJobs.length === 0 ? (
        <div className="rounded-2xl bg-white p-8 border border-slate-200 text-center space-y-3">
          <h2 className="text-lg font-bold text-slate-900">
            No matching verified openings for this selection
          </h2>
          <p className="text-sm text-slate-600 max-w-lg mx-auto">
            Try clearing a city, role, or recency filter to view all active compliance listings.
          </p>
          <button
            type="button"
            onClick={handleResetFilters}
            className="px-5 py-2.5 rounded-xl text-xs font-bold bg-slate-900 text-white hover:bg-slate-800 cursor-pointer"
          >
            Show All Active Openings
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredJobs.map((job) => (
            <article
              key={job.id}
              className="rounded-2xl bg-white p-6 border border-slate-200 hover:border-amber-600/50 transition-colors shadow-2xs flex flex-col justify-between gap-5"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <span className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-amber-50 text-amber-900 border border-amber-200">
                    {job.roleCategory}
                  </span>
                  <span className="text-xs font-medium text-slate-500">
                    {job.remoteEligibility === 'remote'
                      ? 'Remote'
                      : [job.city, job.state].filter(Boolean).join(', ') || 'India'}
                  </span>
                </div>

                <div>
                  <h2 className="text-lg font-extrabold text-slate-900 leading-snug">{job.title}</h2>
                  <p className="text-sm font-semibold text-amber-800 mt-0.5">{job.employer}</p>
                </div>

                <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1.5 text-xs text-slate-700 pt-1">
                  <div>
                    <dt className="text-slate-500 inline">Location: </dt>
                    <dd className="inline font-semibold text-slate-900">{job.displayLocation}</dd>
                  </div>
                  <div>
                    <dt className="text-slate-500 inline">State / UT: </dt>
                    <dd className="inline font-semibold text-slate-900">{job.state || 'Not pinned'}</dd>
                  </div>
                  <div>
                    <dt className="text-slate-500 inline">Experience: </dt>
                    <dd className="inline font-semibold text-slate-900">
                      {job.experienceLabel || 'Per job posting'}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-slate-500 inline">
                      {job.publishedAt ? 'Posted: ' : 'First Seen: '}
                    </dt>
                    <dd className="inline font-semibold text-slate-900">
                      {job.publishedAt || verifiedDateDisplay}
                    </dd>
                  </div>
                </dl>

                <div className="flex flex-wrap gap-1.5 pt-1">
                  {(job.skills || []).map((skill) => (
                    <span
                      key={skill}
                      className="px-2.5 py-0.5 rounded-md bg-slate-100 text-[11px] font-medium text-slate-700 border border-slate-200"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-3 flex-wrap">
                <span className="text-[11px] text-slate-500">
                  {job.sourceLabel} · Checked {verifiedDateDisplay}
                </span>
                <a
                  href={job.applicationUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-900 text-white hover:bg-amber-600 hover:text-slate-950 transition-colors inline-flex items-center gap-1"
                >
                  <span>Apply Official ↗</span>
                </a>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
