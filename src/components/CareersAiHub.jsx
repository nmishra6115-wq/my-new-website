import { useEffect, useMemo, useState } from 'react';
import { INDIA_STATES_AND_UTS, getCitiesForState } from '../data/indiaLocations';
import { buildInitialCareersJobs, ROLE_CATEGORIES } from '../data/careersSeed';
import {
  parseSmartSearchHints,
  rankJobsForCareerMatch,
  sortCareerJobs,
  readStoredAlerts,
  writeStoredAlerts,
} from '../data/careersSmartFeatures';
import { readAdminConfig, writeAdminConfig } from '../data/careersAdminControls';
import JobAlertsModal from './JobAlertsModal';
import { supabase } from '../supabaseClient';
import {
  FINCRIME_SKILL_TAXONOMY,
  ROLE_TRACKS,
} from '../../server/jobIntelligence/skillTaxonomy.js';
import { scoreJobAgainstProfile } from '../../server/jobIntelligence/jobMatcher.js';
import { buildActiveJobPostingsJsonLd } from '../data/careersSeoHygiene';
import {
  DEFAULT_EXPIRY_DAYS,
  sanitizeExpiryDays,
  evaluateJobLifecycle,
  formatIstDateIso,
} from '../../server/jobAutomation/expiryAndArchiveEngine.js';

const SAVED_JOBS_KEY = 'amldecode_careers_saved_jobs_v1';
const TRACKED_APPS_KEY = 'amldecode_careers_applications_v1';
const MATCH_PREFS_KEY = 'amldecode_careers_match_prefs_v1';

const APPLICATION_STATUSES = [
  { value: 'none', label: 'Track Status' },
  { value: 'saved', label: 'Saved' },
  { value: 'applied', label: 'Applied' },
  { value: 'interviewing', label: 'Interviewing' },
  { value: 'offer', label: 'Offer' },
  { value: 'archived', label: 'Archived' },
];

function readJsonStorage(key, fallback) {
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function writeJsonStorage(key, value) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Ignore storage quota errors
  }
}

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
      salary: params.get('sal') || 'All',
      freshness: params.get('fresh') || 'All',
      sortBy: params.get('sort') || 'newest',
    };
  } catch {
    return {
      query: '',
      state: 'All India',
      city: 'All',
      role: 'All Roles',
      experience: 'All',
      workMode: 'All',
      salary: 'All',
      freshness: 'All',
      sortBy: 'newest',
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
    setOrDelete('sal', filters.salary, 'All');
    setOrDelete('fresh', filters.freshness, 'All');
    setOrDelete('sort', filters.sortBy, 'newest');
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

const SKILL_TOKEN_TO_ID = new Map(
  FINCRIME_SKILL_TAXONOMY.flatMap((skill) => [
    [skill.id.toLowerCase(), skill.id],
    [skill.label.toLowerCase(), skill.id],
    ...skill.label
      .toLowerCase()
      .split(/[^a-z0-9]+/)
      .filter((tok) => tok.length >= 3)
      .map((tok) => [tok, skill.id]),
  ])
);

export default function CareersAiHub({ onOpenView, isAdmin = false }) {
  const [nowMs] = useState(() => Date.now());
  const [isLoadingInitial, setIsLoadingInitial] = useState(true);
  const [expandedCardIds, setExpandedCardIds] = useState(() => new Set());
  const [filters, setFilters] = useState(() => readInitialFiltersFromUrl());
  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'recommended' | 'saved' | 'tracking'
  const [showMatchStudio, setShowMatchStudio] = useState(false);
  const [showAlertsPanel, setShowAlertsPanel] = useState(false);
  const [isAlertsModalOpen, setIsAlertsModalOpen] = useState(false);
  const [showFeedDiagnostics, setShowFeedDiagnostics] = useState(false);
  const canShowFeedDiagnostics = Boolean(isAdmin && showFeedDiagnostics);
  const [isSyncingNow, setIsSyncingNow] = useState(false);
  const [adminConfig, setAdminConfig] = useState(() => readAdminConfig());
  const [remoteJobs, setRemoteJobs] = useState([]);
  const [remoteJobsSyncedAt, setRemoteJobsSyncedAt] = useState(null);

  const [alerts, setAlerts] = useState(() => readStoredAlerts());
  const [alertEmail, setAlertEmail] = useState('');
  const [alertFrequency, setAlertFrequency] = useState('daily');
  const [alertConsent, setAlertConsent] = useState(false);
  const [alertFeedback, setAlertFeedback] = useState('');

  const [savedIds, setSavedIds] = useState(() => {
    const stored = readJsonStorage(SAVED_JOBS_KEY, []);
    return Array.isArray(stored) ? stored : [];
  });

  const [applications, setApplications] = useState(() => {
    const stored = readJsonStorage(TRACKED_APPS_KEY, {});
    return stored && typeof stored === 'object' && !Array.isArray(stored) ? stored : {};
  });

  const [matchPrefs, setMatchPrefs] = useState(() =>
    readJsonStorage(MATCH_PREFS_KEY, {
      targetRole: 'AML',
      preferredLocation: 'Bengaluru',
      workArrangement: 'All',
      skills: 'AML, KYC, KYB, Financial Crime',
    })
  );

  useEffect(() => {
    const timer = setTimeout(() => setIsLoadingInitial(false), 120);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    writeFiltersToUrl(filters);
  }, [filters]);

  useEffect(() => {
    try {
      const dismissedKey = 'amldecode_job_update_popup_dismissed_v1';
      if (window.sessionStorage.getItem(dismissedKey) !== '1') {
        setIsAlertsModalOpen(true);
      }
    } catch {
      setIsAlertsModalOpen(true);
    }
  }, []);

  useEffect(() => {
    writeJsonStorage(SAVED_JOBS_KEY, savedIds);
  }, [savedIds]);

  useEffect(() => {
    writeJsonStorage(TRACKED_APPS_KEY, applications);
  }, [applications]);

  useEffect(() => {
    writeJsonStorage(MATCH_PREFS_KEY, matchPrefs);
  }, [matchPrefs]);

  useEffect(() => {
    writeAdminConfig(adminConfig);
  }, [adminConfig]);

  useEffect(() => {
    writeStoredAlerts(alerts);
  }, [alerts]);

  useEffect(() => {
    const supabaseUrl = import.meta.env?.VITE_SUPABASE_URL;
    const supabaseAnonKey = import.meta.env?.VITE_SUPABASE_ANON_KEY;
    if (!supabaseUrl || !supabaseAnonKey) return;

    let cancelled = false;
    const endpoint = `${supabaseUrl.replace(/\/+$/, '')}/rest/v1/compliance_jobs?is_active=eq.true&order=published_at.desc&limit=300`;

    fetch(endpoint, {
      headers: {
        apikey: supabaseAnonKey,
        Authorization: `Bearer ${supabaseAnonKey}`,
      },
    })
      .then((res) => (res.ok ? res.json() : []))
      .then((rows) => {
        if (cancelled || !Array.isArray(rows)) return;
        const mapped = rows.map((row, idx) => ({
          id: row.dedupe_key || row.id || `supa-job-${idx}`,
          title: row.title || 'Compliance Analyst',
          employer: row.employer || 'Financial Institution',
          state: row.state || 'All India',
          city: row.city || 'All',
          location: row.location_raw || [row.city, row.state].filter(Boolean).join(', ') || 'India',
          roleCategory: row.role_category || 'AML / Transaction Monitoring',
          experience: row.experience_band || '1-3 Years',
          workMode: row.work_mode || 'Hybrid',
          salary: row.salary_label || '',
          applyUrl: row.apply_url || 'https://amldecode.in/?view=jobs',
          summary: row.ai_summary || row.summary || '',
          aiSummary: row.ai_summary || '',
          skills: Array.isArray(row.skills) && row.skills.length > 0
            ? row.skills
            : Array.isArray(row.ai_match_tags)
              ? row.ai_match_tags
              : [],
          publishedAt: row.published_at || row.fetched_date || new Date().toISOString(),
          firstSeenAt: row.created_at || row.fetched_date || new Date().toISOString(),
          source: row.source_name || 'Supabase Daily Sync',
        }));
        setRemoteJobs(mapped);
        setRemoteJobsSyncedAt(new Date().toISOString());
      })
      .catch(() => {
        // Keep seeded jobs on network/config fallback
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const expiryDays = sanitizeExpiryDays(adminConfig?.expiryDays ?? DEFAULT_EXPIRY_DAYS);

  const lifecycleJobs = useMemo(() => {
    const seeded = buildInitialCareersJobs(nowMs);
    const seenKeys = new Set();
    const combined = [];

    for (const job of [...remoteJobs, ...seeded]) {
      const key = String(
        job.id ||
          `${(job.title || '').toLowerCase()}_${(job.employer || '').toLowerCase()}_${(job.state || '').toLowerCase()}`
      );
      if (seenKeys.has(key)) continue;
      seenKeys.add(key);
      combined.push(job);
    }

    return combined.map((job) => evaluateJobLifecycle(job, { nowMs, expiryDays }));
  }, [nowMs, expiryDays, remoteJobs]);

  const allJobs = useMemo(
    () => lifecycleJobs.filter((job) => job.status === 'active'),
    [lifecycleJobs]
  );

  const expiredCount = useMemo(
    () => lifecycleJobs.filter((job) => job.status !== 'active').length,
    [lifecycleJobs]
  );

  // SEO Hygiene: Inject JobPosting structured data strictly for active, non-expired openings
  useEffect(() => {
    const scriptId = 'amldecode-active-jobpostings-jsonld';
    let scriptEl = document.getElementById(scriptId);
    if (!scriptEl) {
      scriptEl = document.createElement('script');
      scriptEl.id = scriptId;
      scriptEl.type = 'application/ld+json';
      document.head.appendChild(scriptEl);
    }
    const pageUrl =
      typeof window !== 'undefined' ? window.location.href.split('#')[0] : 'https://www.amldecode.in/';
    scriptEl.textContent = JSON.stringify(buildActiveJobPostingsJsonLd(allJobs, pageUrl));

    return () => {
      const existing = document.getElementById(scriptId);
      if (existing) existing.remove();
    };
  }, [allJobs]);

  const cityOptions = useMemo(() => getCitiesForState(filters.state), [filters.state]);
  const smartHints = useMemo(() => parseSmartSearchHints(filters.query), [filters.query]);

  const rankedByMatch = useMemo(
    () => rankJobsForCareerMatch(allJobs, matchPrefs),
    [allJobs, matchPrefs]
  );



  const matcherProfile = useMemo(() => {
    const rawSkillTokens = Array.isArray(matchPrefs?.skills)
      ? matchPrefs.skills
      : String(matchPrefs?.skills || '')
          .split(/[,;|]+/)
          .map((s) => s.trim().toLowerCase())
          .filter(Boolean);

    const skillIds = Array.from(
      new Set(
        rawSkillTokens
          .map((token) => SKILL_TOKEN_TO_ID.get(token) || null)
          .filter(Boolean)
      )
    );

    const rawArrangement = String(matchPrefs?.workArrangement || 'All').toLowerCase();
    const workMode =
      rawArrangement === 'remote'
        ? 'remote'
        : rawArrangement.includes('office') || rawArrangement.includes('hybrid')
          ? 'hybrid'
          : 'any';

    const preferredCities = String(matchPrefs?.preferredLocation || '')
      .split(/[,;/]+/)
      .map((c) => c.trim())
      .filter((c) => c && c.toLowerCase() !== 'all india');

    const roleText = String(matchPrefs?.targetRole || '').toLowerCase();
    const roleTrack =
      ROLE_TRACKS.find((t) => roleText && t.keywords.some((rx) => rx.test(roleText)))?.id || 'any';

    return {
      skills: skillIds,
      roleTrack,
      preferredCities,
      workMode,
      seniority: 'any',
    };
  }, [matchPrefs]);

  const matchLookup = useMemo(() => {
    const map = new Map();
    for (const item of rankedByMatch) {
      const taxonomyMatch = scoreJobAgainstProfile(item.job, matcherProfile);
      const mergedReasons = Array.from(
        new Set([...(item.reasons || []), ...(taxonomyMatch.reasons || [])])
      );
      map.set(item.job.id, {
        ...item,
        reasons: mergedReasons,
        taxonomyMatch,
      });
    }
    return map;
  }, [rankedByMatch, matcherProfile]);

  const savedSet = useMemo(() => new Set(savedIds), [savedIds]);

  const trackedCount = useMemo(
    () => Object.values(applications).filter((entry) => entry && entry.status && entry.status !== 'none').length,
    [applications]
  );

  const filteredJobs = useMemo(() => {
    const q = filters.query.trim().toLowerCase();

    const matching = allJobs.filter((job) => {
      if (job.status !== 'active') return false;

      if (activeTab === 'saved' && !savedSet.has(job.id)) return false;
      if (activeTab === 'tracking') {
        const st = applications[job.id]?.status;
        if (!st || st === 'none') return false;
      }

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

      if (filters.experience !== 'All') {
        if (!job.experienceLabel) return false;
        const expNums = String(job.experienceLabel).match(/\d+/g)?.map(Number) || [];
        const minExp = expNums.length > 0 ? Math.min(...expNums) : null;
        if (minExp !== null) {
          if (filters.experience === '0-1' && minExp > 1) return false;
          if (filters.experience === '1-3' && (minExp < 1 || minExp > 3)) return false;
          if (filters.experience === '3-5' && (minExp < 3 || minExp > 5)) return false;
          if (filters.experience === '5+' && minExp < 5) return false;
        }
      }

      if (filters.salary === 'Disclosed' && !job.salary) {
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
          job.displayLocation || '',
          job.roleCategory,
          job.experienceLabel || '',
          job.remoteEligibility || '',
          ...(job.domainTags || []),
          ...(job.skills || []),
        ]
          .join(' ')
          .toLowerCase();
        const nlStopWords = new Set([
          'in', 'for', 'with', 'and', 'or', 'at', 'the', 'a', 'an', 'to', 'from',
          'remote', 'hybrid', 'onsite', 'on-site', 'work', 'role', 'roles', 'job', 'jobs',
          'yrs', 'yr', 'years', 'year', 'exp', 'experience',
        ]);
        const tokens = q
          .split(/[^a-z0-9+#.-]+/i)
          .map((t) => t.trim())
          .filter((t) => t.length > 0 && !nlStopWords.has(t));
        if (!tokens.every((tok) => haystack.includes(tok))) return false;
      }

      return true;
    });

    if (activeTab === 'recommended' || filters.sortBy === 'recommended') {
      return [...matching].sort(
        (a, b) => (matchLookup.get(b.id)?.matchPoints || 0) - (matchLookup.get(a.id)?.matchPoints || 0)
      );
    }

    if (filters.sortBy === 'verified') {
      return [...matching].sort(
        (a, b) => (Date.parse(b.lastVerifiedAt || 0) || 0) - (Date.parse(a.lastVerifiedAt || 0) || 0)
      );
    }

    return sortCareerJobs(matching, filters.sortBy === 'relevance' ? 'relevance' : 'newest', filters);
  }, [allJobs, activeTab, savedSet, applications, filters, nowMs, matchLookup]);

  const handleStateChange = (nextState) => {
    setFilters((prev) => ({
      ...prev,
      state: nextState,
      city: 'All',
    }));
  };

  const handleApplySmartHints = () => {
    const lowerQ = String(filters.query || '').toLowerCase();
    const inferredWorkMode = smartHints.isRemoteMentioned
      ? 'Remote'
      : /\bhybrid\b/.test(lowerQ)
      ? 'Hybrid'
      : /\b(onsite|on-site|in-office|office)\b/.test(lowerQ)
      ? 'Onsite'
      : null;

    setFilters((prev) => ({
      ...prev,
      state: smartHints.inferredState || prev.state,
      city: smartHints.inferredCity || (smartHints.inferredState ? 'All' : prev.city),
      role: smartHints.inferredRole && smartHints.inferredRole !== 'All Roles' ? smartHints.inferredRole : prev.role,
      workMode: inferredWorkMode || prev.workMode,
    }));
  };

  const toggleCardExpanded = (jobId) => {
    setExpandedCardIds((prev) => {
      const next = new Set(prev);
      if (next.has(jobId)) {
        next.delete(jobId);
      } else {
        next.add(jobId);
      }
      return next;
    });
  };

  const handleResetFilters = () => {
    setFilters({
      query: '',
      state: 'All India',
      city: 'All',
      role: 'All Roles',
      experience: 'All',
      workMode: 'All',
      salary: 'All',
      freshness: 'All',
      sortBy: 'newest',
    });
    setActiveTab('all');
  };

  const toggleSaveJob = (jobId) => {
    setSavedIds((prev) =>
      prev.includes(jobId) ? prev.filter((id) => id !== jobId) : [...prev, jobId]
    );
  };

  const updateApplicationStatus = (jobId, status) => {
    setApplications((prev) => {
      const next = { ...prev };
      if (!status || status === 'none') {
        delete next[jobId];
      } else {
        next[jobId] = {
          status,
          updatedAt: new Date().toISOString(),
        };
      }
      return next;
    });
  };

  const handleToggleSource = (sourceId) => {
    const runDateIst = formatIstDateIso(nowMs);
    setAdminConfig((prev) => {
      const nextSources = (prev.sources || []).map((src) => {
        if (src.id !== sourceId) return src;
        const nextEnabled = !src.enabled;
        return {
          ...src,
          enabled: nextEnabled,
          lastStatus: nextEnabled
            ? src.integrationType === 'ats_json_feed'
              ? 'awaiting_source_url'
              : 'ready'
            : 'disabled',
        };
      });
      const note = `${runDateIst} IST: Updated source "${sourceId}" configuration.`;
      return {
        ...prev,
        sources: nextSources,
        auditNotes: [note, ...(prev.auditNotes || [])].slice(0, 8),
      };
    });
  };

  const handleExpiryWindowChange = (nextDays) => {
    const safeDays = sanitizeExpiryDays(nextDays);
    const runDateIst = formatIstDateIso(nowMs);
    setAdminConfig((prev) => ({
      ...prev,
      expiryDays: safeDays,
      auditNotes: [
        `${runDateIst} IST: Updated expiry window to ${safeDays} days.`,
        ...(prev.auditNotes || []),
      ].slice(0, 8),
    }));
  };

  const handleManualSyncNow = async () => {
    if (isSyncingNow) return;
    setIsSyncingNow(true);
    const runDateIst = formatIstDateIso(nowMs);
    try {
      const sessionResult = supabase?.auth?.getSession ? await supabase.auth.getSession() : null;
      const accessToken = sessionResult?.data?.session?.access_token || '';
      const headers = { 'Content-Type': 'application/json' };
      if (accessToken) {
        headers.Authorization = `Bearer ${accessToken}`;
      }
      const response = await fetch('/api/jobs/sync', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          expiryDays,
          sources: adminConfig.sources || [],
        }),
      });
      const data = await response.json().catch(() => ({}));
      const note = response.ok
        ? `${runDateIst} IST: Sync completed (${data.activeCount ?? allJobs.length} active, ${data.archivedCount ?? expiredCount} archived).`
        : `${runDateIst} IST: Sync check returned HTTP ${response.status}; local verified feed active.`;
      setAdminConfig((prev) => ({
        ...prev,
        lastManualSyncAt: new Date().toISOString(),
        auditNotes: [note, ...(prev.auditNotes || [])].slice(0, 8),
      }));
    } catch {
      setAdminConfig((prev) => ({
        ...prev,
        lastManualSyncAt: new Date().toISOString(),
        auditNotes: [
          `${runDateIst} IST: Evaluated lifecycle locally (${allJobs.length} active, ${expiredCount} archived).`,
          ...(prev.auditNotes || []),
        ].slice(0, 8),
      }));
    } finally {
      setIsSyncingNow(false);
    }
  };

  const handleCreateJobAlert = (e) => {
    e.preventDefault();
    const emailTrimmed = alertEmail.trim().toLowerCase();
    if (!emailTrimmed || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailTrimmed)) {
      setAlertFeedback('Please enter a valid email address.');
      return;
    }
    if (!alertConsent) {
      setAlertFeedback('Please confirm opt-in consent before activating alerts.');
      return;
    }

    const newAlert = {
      id: `alert-${Date.now()}`,
      email: emailTrimmed,
      state: filters.state,
      city: filters.city,
      roleCategory: filters.role,
      workMode: filters.workMode,
      frequency: alertFrequency,
      consentGiven: true,
      createdAt: new Date().toISOString(),
    };

    setAlerts((prev) => [
      newAlert,
      ...prev.filter(
        (a) =>
          !(
            a.email === newAlert.email &&
            a.state === newAlert.state &&
            a.city === newAlert.city &&
            a.roleCategory === newAlert.roleCategory
          )
      ),
    ]);
    setAlertEmail('');
    setAlertConsent(false);
    setAlertFeedback(
      `Alert saved for ${newAlert.roleCategory} in ${
        newAlert.state === 'All India'
          ? 'All India'
          : newAlert.city !== 'All'
          ? `${newAlert.city}, ${newAlert.state}`
          : newAlert.state
      } (${newAlert.frequency}).`
    );
  };

  const handleRemoveAlert = (alertId) => {
    setAlerts((prev) => prev.filter((a) => a.id !== alertId));
    setAlertFeedback('Job alert unsubscribed and removed.');
  };

  const verifiedDateDisplay = new Date(nowMs).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  const hasSmartSuggestion = Boolean(
    (smartHints.inferredState && smartHints.inferredState !== filters.state) ||
      (smartHints.inferredCity && smartHints.inferredCity !== filters.city) ||
      (smartHints.inferredRole &&
        smartHints.inferredRole !== 'All Roles' &&
        smartHints.inferredRole !== filters.role) ||
      (smartHints.isRemoteMentioned && filters.workMode !== 'Remote')
  );

  return (
    <section aria-label="AMLDecode Careers AI" className="space-y-6 text-slate-900 overflow-x-hidden">
      {/* Editorial Hero Header */}
      <div className="rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white p-5 sm:p-8 border border-amber-500/25 shadow-sm">
        <div className="flex flex-wrap items-end justify-between gap-5">
          <div className="space-y-2 max-w-2xl">
            <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-amber-400">
              AMLDecode Careers AI &middot; India Career Intelligence
            </p>
            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white">
              AML &amp; KYC Career Intelligence Platform
            </h1>
            <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
              Verified AML, KYC, KYB, transaction monitoring, sanctions, and risk openings across 28 States and 8 Union Territories.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={() => setShowMatchStudio((prev) => !prev)}
              aria-expanded={showMatchStudio}
              className="px-4 py-2.5 rounded-xl text-xs font-bold bg-amber-500 text-slate-950 hover:bg-amber-400 transition-colors cursor-pointer"
            >
              {showMatchStudio ? 'Hide Match Preferences' : 'Personalize Recommendations'}
            </button>
            <button
              type="button"
              onClick={() => setShowAlertsPanel((prev) => !prev)}
              aria-expanded={showAlertsPanel}
              className="px-3.5 py-2.5 rounded-xl text-xs font-bold bg-white/10 text-emerald-200 border border-emerald-400/30 hover:bg-white/15 transition-colors cursor-pointer"
            >
              {showAlertsPanel ? 'Hide Job Alerts' : `Job Alerts (${alerts.length})`}
            </button>
            <button type="button" onClick={() => setIsAlertsModalOpen(true)} className="px-3.5 py-2.5 rounded-xl text-xs font-bold bg-emerald-500 text-slate-950 hover:bg-emerald-400 transition-colors cursor-pointer">Subscribe for job update</button>
            {isAdmin && (
              <button
                type="button"
                onClick={() => setShowFeedDiagnostics((prev) => !prev)}
                aria-expanded={canShowFeedDiagnostics}
                className="px-3.5 py-2.5 rounded-xl text-xs font-bold bg-white/10 text-amber-200 border border-amber-400/30 hover:bg-white/15 transition-colors cursor-pointer"
              >
                {canShowFeedDiagnostics ? 'Hide Feed Health' : `Feed & Expiry (${expiryDays}d)`}
              </button>
            )}
            {typeof onOpenView === 'function' && (
              <>
                <button
                  type="button"
                  onClick={() => onOpenView('referralForm')}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold bg-white/10 text-white border border-white/20 hover:bg-white/15 transition-colors cursor-pointer"
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
              </>
            )}
          </div>
        </div>

        {/* Progressive Disclosure: Career Match Preferences */}
        {showMatchStudio && (
          <div className="mt-6 pt-5 border-t border-white/15 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div>
              <label htmlFor="match-target-role" className="block text-[11px] font-bold uppercase tracking-wide text-amber-300 mb-1">
                Target Role / Track
              </label>
              <input
                id="match-target-role"
                type="text"
                value={matchPrefs.targetRole}
                onChange={(e) => setMatchPrefs((p) => ({ ...p, targetRole: e.target.value }))}
                placeholder="e.g., AML, KYC, FinCrime"
                className="w-full px-3 py-2 rounded-xl bg-slate-950/80 text-xs text-white border border-white/20 focus:outline-none focus:border-amber-400"
              />
            </div>
            <div>
              <label htmlFor="match-location" className="block text-[11px] font-bold uppercase tracking-wide text-amber-300 mb-1">
                Preferred City / State
              </label>
              <input
                id="match-location"
                type="text"
                value={matchPrefs.preferredLocation}
                onChange={(e) => setMatchPrefs((p) => ({ ...p, preferredLocation: e.target.value }))}
                placeholder="e.g., Bengaluru, Mumbai, All India"
                className="w-full px-3 py-2 rounded-xl bg-slate-950/80 text-xs text-white border border-white/20 focus:outline-none focus:border-amber-400"
              />
            </div>
            <div>
              <label htmlFor="match-work-mode" className="block text-[11px] font-bold uppercase tracking-wide text-amber-300 mb-1">
                Work Preference
              </label>
              <select
                id="match-work-mode"
                value={matchPrefs.workArrangement}
                onChange={(e) => setMatchPrefs((p) => ({ ...p, workArrangement: e.target.value }))}
                className="w-full px-3 py-2 rounded-xl bg-slate-950/80 text-xs text-white border border-white/20 focus:outline-none focus:border-amber-400"
              >
                <option value="All">Any Arrangement</option>
                <option value="Remote">Remote Only</option>
                <option value="Onsite / Office">Office / Hybrid</option>
              </select>
            </div>
            <div>
              <label htmlFor="match-skills" className="block text-[11px] font-bold uppercase tracking-wide text-amber-300 mb-1">
                Core Compliance Skills
              </label>
              <input
                id="match-skills"
                type="text"
                value={matchPrefs.skills}
                onChange={(e) => setMatchPrefs((p) => ({ ...p, skills: e.target.value }))}
                placeholder="AML, KYC, KYB, Sanctions, SAR"
                className="w-full px-3 py-2 rounded-xl bg-slate-950/80 text-xs text-white border border-white/20 focus:outline-none focus:border-amber-400"
              />
            </div>
          </div>
        )}

        <JobAlertsModal
          isOpen={isAlertsModalOpen}
          onClose={() => {
            try {
              window.sessionStorage.setItem('amldecode_job_update_popup_dismissed_v1', '1');
            } catch {
              // Ignore storage restrictions
            }
            setIsAlertsModalOpen(false);
          }}
          defaultState={filters.state && filters.state !== 'All India' ? filters.state : ''}
        />

        {/* Phase 4 Job Alerts & Consent Drawer */}
        {showAlertsPanel && (
          <div className="mt-6 pt-5 border-t border-white/15 space-y-4 text-xs">
            <form onSubmit={handleCreateJobAlert} className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
              <div className="md:col-span-5">
                <label htmlFor="job-alert-email" className="block text-[11px] font-bold uppercase tracking-wide text-emerald-300 mb-1">
                  Email for Active Filter Alerts ({filters.role} &middot; {filters.state})
                </label>
                <input
                  id="job-alert-email"
                  type="email"
                  value={alertEmail}
                  onChange={(e) => setAlertEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full px-3 py-2 rounded-xl bg-slate-950/80 text-xs text-white border border-white/20 focus:outline-none focus:border-emerald-400"
                />
              </div>
              <div className="md:col-span-3">
                <label htmlFor="job-alert-frequency" className="block text-[11px] font-bold uppercase tracking-wide text-emerald-300 mb-1">
                  Cadence
                </label>
                <select
                  id="job-alert-frequency"
                  value={alertFrequency}
                  onChange={(e) => setAlertFrequency(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950/80 text-xs text-white border border-white/20 focus:outline-none focus:border-emerald-400"
                >
                  <option value="daily">Daily Digest</option>
                  <option value="weekly">Weekly Summary</option>
                </select>
              </div>
              <div className="md:col-span-4">
                <button
                  type="submit"
                  className="w-full px-4 py-2 rounded-xl text-xs font-bold bg-emerald-500 text-slate-950 hover:bg-emerald-400 transition-colors cursor-pointer"
                >
                  Subscribe to Matching Openings
                </button>
              </div>
              <div className="md:col-span-12 flex items-center gap-2 text-[11px] text-slate-300">
                <input
                  id="job-alert-consent"
                  type="checkbox"
                  checked={alertConsent}
                  onChange={(e) => setAlertConsent(e.target.checked)}
                  className="rounded border-white/30"
                />
                <label htmlFor="job-alert-consent">
                  I consent to receive verified AML/KYC job alerts matching my selected filters and can unsubscribe anytime in one click.
                </label>
              </div>
            </form>

            {alertFeedback && (
              <p className="text-[11px] text-emerald-200 bg-emerald-950/70 border border-emerald-400/30 rounded-lg px-3 py-2">
                {alertFeedback}
              </p>
            )}

            {alerts.length > 0 && (
              <div className="space-y-2">
                <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400">
                  Active Alert Subscriptions
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                  {alerts.map((al) => (
                    <div
                      key={al.id}
                      className="rounded-xl bg-slate-950/75 border border-white/15 p-3 flex items-center justify-between gap-3"
                    >
                      <div className="min-w-0">
                        <p className="font-bold text-white truncate">{al.email}</p>
                        <p className="text-[11px] text-slate-400">
                          {al.roleCategory} &middot; {al.state === 'All India' ? 'All India' : al.city !== 'All' ? `${al.city}, ${al.state}` : al.state} &middot; {al.frequency}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveAlert(al.id)}
                        className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-rose-500/20 text-rose-200 border border-rose-400/40 hover:bg-rose-500/30 cursor-pointer shrink-0"
                      >
                        Unsubscribe
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Phase 2 & 4 Feed Health, Expiry & Admin Sync Controls Drawer */}
        {canShowFeedDiagnostics && (
          <div className="mt-6 pt-5 border-t border-white/15 space-y-4 text-xs">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2.5">
                <span className="px-2.5 py-1 rounded-lg bg-white/10 text-emerald-300 font-semibold">
                  Active: {allJobs.length}
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-white/10 text-slate-300 font-semibold">
                  Expired / Archived: {expiredCount}
                </span>
                <label htmlFor="admin-expiry-days" className="text-[11px] text-amber-300 font-bold">
                  Auto-Expiry:
                </label>
                <select
                  id="admin-expiry-days"
                  value={expiryDays}
                  onChange={(e) => handleExpiryWindowChange(e.target.value)}
                  className="px-2.5 py-1 rounded-lg bg-slate-950/80 text-xs text-white border border-white/20 focus:outline-none focus:border-amber-400"
                >
                  <option value={7}>7 days</option>
                  <option value={15}>15 days (Default)</option>
                  <option value={30}>30 days</option>
                </select>
              </div>

              <div className="flex items-center gap-2.5">
                <span className="text-[11px] text-slate-400">
                  IST {formatIstDateIso(nowMs)}
                </span>
                <button
                  type="button"
                  onClick={handleManualSyncNow}
                  disabled={isSyncingNow}
                  className="px-3 py-1.5 rounded-lg text-[11px] font-bold bg-amber-500 text-slate-950 hover:bg-amber-400 disabled:opacity-60 cursor-pointer"
                >
                  {isSyncingNow ? 'Syncing...' : 'Run Sync & Expiry Check'}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {(adminConfig.sources || []).map((src) => (
                <div
                  key={src.id}
                  className="rounded-xl bg-slate-950/75 border border-white/15 p-3 flex items-center justify-between gap-3"
                >
                  <div className="space-y-0.5 min-w-0">
                    <p className="font-bold text-white truncate">{src.provider}</p>
                    <p className="text-[11px] text-slate-400">
                      Type: {src.integrationType} &middot; Status: {src.lastStatus}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleToggleSource(src.id)}
                    className={
                      'px-3 py-1.5 rounded-lg text-[11px] font-bold border cursor-pointer shrink-0 ' +
                      (src.enabled
                        ? 'bg-emerald-500/20 text-emerald-200 border-emerald-400/40'
                        : 'bg-slate-800 text-slate-300 border-slate-600')
                    }
                  >
                    {src.enabled ? 'Enabled' : 'Disabled'}
                  </button>
                </div>
              ))}
            </div>

            {(adminConfig.auditNotes || []).length > 0 && (
              <div className="rounded-xl bg-slate-950/60 border border-white/10 p-3 space-y-1">
                <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400">
                  Recent Source &amp; Sync Audit Notes
                </p>
                {adminConfig.auditNotes.map((note, idx) => (
                  <p key={idx} className="text-[11px] text-slate-300">
                    {note}
                  </p>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* View Switcher Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div role="tablist" aria-label="Job Views" className="flex flex-wrap items-center gap-2">
          {[
            { id: 'all', label: `All Openings (${allJobs.length})` },
            { id: 'recommended', label: 'Recommended For You' },
            { id: 'saved', label: `Saved Jobs (${savedIds.length})` },
            { id: 'tracking', label: `Applications (${trackedCount})` },
          ].map((tab) => {
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                role="tab"
                type="button"
                aria-selected={active}
                onClick={() => setActiveTab(tab.id)}
                className={
                  'px-3.5 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer border ' +
                  (active
                    ? 'bg-slate-900 text-white border-slate-900'
                    : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300')
                }
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-2">
          <label htmlFor="careers-sort-select" className="text-xs font-semibold text-slate-600">
            Sort:
          </label>
          <select
            id="careers-sort-select"
            value={filters.sortBy}
            onChange={(e) => setFilters((prev) => ({ ...prev, sortBy: e.target.value }))}
            className="px-3 py-1.5 rounded-xl bg-white text-xs font-semibold text-slate-900 border border-slate-300 focus:outline-none focus:border-amber-600"
          >
            <option value="newest">Newest First</option>
            <option value="verified">Recently Verified</option>
            <option value="recommended">Recommended Match</option>
            <option value="relevance">Search Relevance</option>
          </select>
        </div>
      </div>

      {/* Filter Console */}
      <div className="rounded-2xl bg-white p-4 sm:p-6 border border-slate-200 shadow-xs space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
          <div className="md:col-span-5">
            <label htmlFor="careers-search-input" className="block text-xs font-bold uppercase tracking-wide text-slate-700 mb-1.5">
              Natural-Language Job Search
            </label>
            <input
              id="careers-search-input"
              type="search"
              value={filters.query}
              onChange={(e) => setFilters((prev) => ({ ...prev, query: e.target.value }))}
              placeholder="Try: remote KYC analyst, Bengaluru FinCrime, JPMorgan..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 text-sm text-slate-900 placeholder:text-slate-400 border border-slate-300 focus:outline-none focus:border-amber-600 focus:bg-white"
            />
            {hasSmartSuggestion && (
              <div className="mt-2 flex flex-wrap items-center gap-2 text-[11px] text-amber-900 bg-amber-50 border border-amber-200 rounded-lg px-2.5 py-1.5">
                <span>
                  Smart intent detected:{' '}
                  <strong>
                    {[
                      smartHints.inferredRole && smartHints.inferredRole !== 'All Roles'
                        ? smartHints.inferredRole
                        : null,
                      smartHints.inferredCity || smartHints.inferredState,
                      smartHints.isRemoteMentioned ? 'Remote' : null,
                    ]
                      .filter(Boolean)
                      .join(' · ')}
                  </strong>
                </span>
                <button
                  type="button"
                  onClick={handleApplySmartHints}
                  className="font-bold underline hover:text-amber-700 cursor-pointer"
                >
                  Apply filters
                </button>
              </div>
            )}
          </div>

          <div className="md:col-span-4">
            <label htmlFor="careers-state-select" className="block text-xs font-bold uppercase tracking-wide text-slate-700 mb-1.5">
              State / Union Territory (28 &middot; 8)
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

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3 pt-2 border-t border-slate-100">
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
              Experience
            </label>
            <select
              id="careers-exp-select"
              value={filters.experience}
              onChange={(e) => setFilters((prev) => ({ ...prev, experience: e.target.value }))}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 text-xs font-medium text-slate-900 border border-slate-300 focus:outline-none focus:border-amber-600"
            >
              <option value="All">Any Tier</option>
              <option value="Entry">Entry / Fresher (Published)</option>
              <option value="Mid">Mid / Senior (Published)</option>
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
            <label htmlFor="careers-salary-select" className="block text-[11px] font-bold uppercase tracking-wide text-slate-600 mb-1">
              Compensation
            </label>
            <select
              id="careers-salary-select"
              value={filters.salary}
              onChange={(e) => setFilters((prev) => ({ ...prev, salary: e.target.value }))}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 text-xs font-medium text-slate-900 border border-slate-300 focus:outline-none focus:border-amber-600"
            >
              <option value="All">All (Disclosed &amp; Unstated)</option>
              <option value="Disclosed">Disclosed Salary Only</option>
            </select>
          </div>

          <div>
            <label htmlFor="careers-fresh-select" className="block text-[11px] font-bold uppercase tracking-wide text-slate-600 mb-1">
              Recency
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
              Reset All
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
          Verified feed only; unstated compensation or dates are never fabricated.
        </p>
      </div>

      {/* Listing Grid */}
      {isLoadingInitial ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5" aria-busy="true" aria-label="Loading openings">
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className="h-56 rounded-2xl bg-slate-100 border border-slate-200 animate-pulse" />
          ))}
        </div>
      ) : filteredJobs.length === 0 ? (
        <div className="rounded-2xl bg-white p-8 border border-slate-200 text-center space-y-3">
          <h2 className="text-lg font-bold text-slate-900">
            {activeTab === 'saved'
              ? 'No saved jobs match your current filters'
              : activeTab === 'tracking'
              ? 'No tracked applications match your current filters'
              : 'No matching verified openings for this selection'}
          </h2>
          <p className="text-sm text-slate-600 max-w-lg mx-auto">
            {activeTab === 'saved'
              ? 'Bookmark any role with the Save button to build your shortlist.'
              : activeTab === 'tracking'
              ? 'Use the status selector on any job card to track Applied, Interviewing, or Offer stages.'
              : 'Try clearing a city, role, salary, or recency filter to view all active compliance listings.'}
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
          {filteredJobs.map((job) => {
            const isSaved = savedSet.has(job.id);
            const appStatus = applications[job.id]?.status || 'none';
            const matchInfo = matchLookup.get(job.id);

            return (
              <article
                key={job.id}
                className="rounded-2xl bg-white p-5 sm:p-6 border border-slate-200 hover:border-amber-600/50 transition-all shadow-2xs flex flex-col justify-between gap-4"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-amber-50 text-amber-900 border border-amber-200">
                        {job.roleCategory}
                      </span>
                      {matchInfo && (matchInfo.matchPoints > 0 || matchInfo.taxonomyMatch) && (
                        <span
                          title={matchInfo.reasons.join(' | ')}
                          className="px-2 py-1 rounded-lg text-[11px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200"
                        >
                          {matchInfo.taxonomyMatch
                            ? `${matchInfo.taxonomyMatch.score}% ${matchInfo.taxonomyMatch.tierLabel}`
                            : `Match +${matchInfo.matchPoints}`}
                        </span>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => toggleSaveJob(job.id)}
                      aria-pressed={isSaved}
                      className={
                        'px-2.5 py-1 rounded-lg text-[11px] font-bold border transition-colors cursor-pointer ' +
                        (isSaved
                          ? 'bg-amber-500/15 text-amber-900 border-amber-400'
                          : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100')
                      }
                    >
                      {isSaved ? 'Saved' : 'Save'}
                    </button>
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
                      <dt className="text-slate-500 inline">Compensation: </dt>
                      <dd className="inline font-semibold text-slate-900">
                        {job.salary || 'Not disclosed'}
                      </dd>
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

                  {matchInfo?.taxonomyMatch?.missingSkills?.length > 0 && (
                    <p className="text-[11px] text-slate-600">
                      <span className="font-semibold text-slate-700">Skill focus gap: </span>
                      {matchInfo.taxonomyMatch.missingSkills.join(', ')}
                    </p>
                  )}

                  {Array.isArray(job.domainTags) && job.domainTags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {job.domainTags.map((tag) => (
                        <span
                          key={tag}
                          className="px-2 py-0.5 rounded-md bg-amber-50/80 text-[10px] font-bold text-amber-900 border border-amber-200/80"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}

                  {matchInfo && matchInfo.matchPoints > 0 && matchInfo.reasons.length > 0 && (
                    <p className="text-[11px] text-emerald-900 bg-emerald-50/80 border border-emerald-200/80 rounded-lg px-2.5 py-1.5">
                      Why matched: {matchInfo.reasons.slice(0, 2).join(' · ')}
                    </p>
                  )}

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

                <div className="pt-3.5 border-t border-slate-100 flex items-center justify-between gap-2.5 flex-wrap">
                  <div className="flex items-center gap-2">
                    <label htmlFor={`status-${job.id}`} className="sr-only">
                      Application status for {job.title}
                    </label>
                    <select
                      id={`status-${job.id}`}
                      value={appStatus}
                      onChange={(e) => updateApplicationStatus(job.id, e.target.value)}
                      className={
                        'px-2.5 py-1.5 rounded-lg text-[11px] font-bold border focus:outline-none cursor-pointer ' +
                        (appStatus !== 'none'
                          ? 'bg-blue-50 text-blue-900 border-blue-200'
                          : 'bg-slate-50 text-slate-700 border-slate-200')
                      }
                    >
                      {APPLICATION_STATUSES.map((st) => (
                        <option key={st.value} value={st.value}>
                          {st.label}
                        </option>
                      ))}
                    </select>
                    <span className="text-[11px] text-slate-500 hidden sm:inline">
                      Verified {verifiedDateDisplay}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => toggleCardExpanded(job.id)}
                      aria-expanded={expandedCardIds.has(job.id)}
                      className="px-3 py-2 rounded-xl text-xs font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors cursor-pointer"
                    >
                      {expandedCardIds.has(job.id) ? 'Less details' : 'More details'}
                    </button>
                    <a
                      href={job.applicationUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-900 text-white hover:bg-amber-600 hover:text-slate-950 transition-colors inline-flex items-center gap-1"
                    >
                      <span>Apply Official &#8599;</span>
                    </a>
                  </div>
                </div>

                {expandedCardIds.has(job.id) && (
                  <div className="pt-3 border-t border-slate-100 text-xs text-slate-600 space-y-1.5">
                    <p>
                      <span className="font-semibold text-slate-800">Source:</span>{' '}
                      {job.sourceLabel || 'Verified Feed'} ·{' '}
                      <span className="font-semibold text-slate-800">Date basis:</span>{' '}
                      {job.dateBasis === 'published' ? 'Published date' : 'First seen timestamp'}
                    </p>
                    {job.description && (
                      <p className="leading-relaxed text-slate-700">{job.description}</p>
                    )}
                  </div>
                )}
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}


