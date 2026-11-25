import { useEffect, useMemo, useState } from 'react';
import { AcademyBrandMark, IntelligenceCard, SectionHeader, TopicBadge } from './AcademyPrimitives';
import DailyChallengeCard from './DailyChallengeCard';
import { notesContent, faqData } from '../content';
import { MODULE_BY_INDEX } from '../data/moduleRegistry';
import { jobOpenings } from '../jobs';
import { kycNews } from '../news';
import { Sun, Moon, UserCheck, LogOut, X } from 'lucide-react';
import { signUpWithEmailPassword, requestPasswordResetEmail, completePasswordResetWithCode, signInWithEmailPassword, signOutLearnerAccount } from '../data/supabaseAuthSync';
import { supabase } from '../supabaseClient';
import { useThemeMode } from '../hooks/useThemeMode';
import BannerAd468 from './BannerAd468';
import SupportDeveloperBanner from './SupportDeveloperBanner';

import NativeAdBanner from './NativeAdBanner';
import MidPageScriptAd from './MidPageScriptAd';
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
  learner = null,
  onAuthSuccess = null,
  onSignOut = null,
}) {
  const { isDark, toggleTheme } = useThemeMode();
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileOpen, setMobileOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState('signup');
  const [authName, setAuthName] = useState(learner?.name || '');
  const [authEmail, setAuthEmail] = useState(learner?.email || '');
  const [authPassword, setAuthPassword] = useState('');
  const [authResetCode, setAuthResetCode] = useState('');
  const [authBusy, setAuthBusy] = useState(false);
  const [showResetOption, setShowResetOption] = useState(false);
  const [authError, setAuthError] = useState('');
  const [authNotice, setAuthNotice] = useState('');
  const [accountInfoOpen, setAccountInfoOpen] = useState(false);
  const [pendingAfterAuth, setPendingAfterAuth] = useState(null);

  useEffect(() => {
    if (typeof window === 'undefined') return undefined;

    const inspectReturnUrl = () => {
      const rawHash = window.location.hash || '';
      const rawSearch = window.location.search || '';
      const hashStr = rawHash.startsWith('#') ? rawHash.slice(1) : rawHash;
      const hashParams = new URLSearchParams(hashStr);
      const searchParams = new URLSearchParams(rawSearch);

      const errorDesc = hashParams.get('error_description') || searchParams.get('error_description') || hashParams.get('error') || searchParams.get('error');
      const authType = hashParams.get('type') || searchParams.get('type') || '';
      const hasAccessToken = Boolean(hashParams.get('access_token') || hashParams.get('token_hash') || searchParams.get('code'));
      const hasMessage = Boolean(hashParams.get('message') || searchParams.get('message'));
      const isResetParam = searchParams.get('reset') === '1' || hashParams.get('reset') === '1';
      const isEmailVerifyReturn = authType === 'signup' || authType === 'email' || hasMessage || (hasAccessToken && authType !== 'recovery');

      if (!errorDesc && !isEmailVerifyReturn && !isResetParam) return;

      try {
        const cleanUrl = `${window.location.pathname}${window.location.search}`
          .replace(/([?&])(code|type|token_hash|message|error|error_code|error_description|reset)=[^&]*/g, '$1')
          .replace(/[?&]$/, '')
          .replace(/\?&/, '?');
        window.history.replaceState({}, document.title, cleanUrl || window.location.pathname);
      } catch {
        // Ignore history state restrictions
      }

      setAuthMode(isResetParam && !errorDesc ? 'reset' : 'login');
      setAuthPassword('');
      setAuthModalOpen(true);

      if (errorDesc) {
        setAuthNotice('');
        setShowResetOption(true);
        setAuthError(decodeURIComponent(errorDesc.replace(/\+/g, ' ')));
      } else if (isEmailVerifyReturn) {
        setAuthError('');
      setShowResetOption(false);

      if (authMode === 'reset') {
        setAuthMode('login');
        setAuthResetCode('');
        setAuthPassword('');
        setAuthError('');
        setAuthNotice('Password updated! Log in now with your email and new password.');
        return;
      }
        setAuthNotice('Email verified! Log in now with your email and password.');
      } else if (isResetParam) {
        setAuthError('');
        setShowResetOption(false);
        setAuthResetCode('');
        setAuthNotice('Enter the 6-digit verification code sent to your email and choose a new password.');
      }
    };

    inspectReturnUrl();
    window.addEventListener('hashchange', inspectReturnUrl);

    const subscription = supabase?.auth?.onAuthStateChange?.((event, session) => {
      if ((event === 'SIGNED_IN' || event === 'USER_UPDATED') && !learner?.email) {
        const verifiedEmail = session?.user?.email || '';
        if (verifiedEmail) {
          setAuthEmail((prev) => prev || verifiedEmail);
        }
      }
    })?.data?.subscription;

    return () => {
      window.removeEventListener('hashchange', inspectReturnUrl);
      subscription?.unsubscribe?.();
    };
  }, [learner?.email]);

  async function handleAuthSubmit(e) {
    e.preventDefault();
    setAuthError('');
    setAuthNotice('');
    setAuthBusy(true);
    try {
      const res =
        authMode === 'signup'
          ? await signUpWithEmailPassword({
              fullName: authName,
              email: authEmail,
              password: authPassword,
            })
          : authMode === 'reset'
            ? await completePasswordResetWithCode({
                email: authEmail,
                code: authResetCode,
                newPassword: authPassword,
              })
            : await signInWithEmailPassword({
                fullName: authName,
                email: authEmail,
                password: authPassword,
              });

      if (res.error) {
        setAuthError(res.error);
        return;
      }

      if (res.alreadyRegistered) {
        setAuthMode('login');
        setAuthPassword('');
        setAuthNotice('');
        setShowResetOption(true);
        setAuthError('This email is already registered. Please log in with your password, or reset your password below.');
        return;
      }

      setShowResetOption(false);

      if (authMode === 'signup') {
        setAuthMode('login');
        setAuthPassword('');
        setAuthError('');
        setAuthNotice(
          res.needsEmailConfirmation
            ? 'Account created! Please confirm your email from alerts@amldecode.in first, then enter your email and password below to log in.'
            : 'Account created! Please enter your email and password below to log in.'
        );
        return;
      }

      if (typeof onAuthSuccess === 'function' && res.profile) {
        onAuthSuccess(res.profile);
      }

      setAuthModalOpen(false);
      setAuthPassword('');
      const queued = pendingAfterAuth;
      setPendingAfterAuth(null);
      if (typeof queued === 'function') {
        queued();
      }
    } finally {
      setAuthBusy(false);
    }
  }

  function runWithAccount(action) {
    if (learner?.email) {
      action();
      return;
    }
    setPendingAfterAuth(() => action);
    setAuthMode('signup');
    setAuthError('');
    setAuthNotice('Create an account or log in to view pages, quizzes, jobs, or study modules.');
    setAuthModalOpen(true);
  }

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
    <div className="min-h-screen flex flex-col bg-[#F8F7F4] dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
      {/* Top Editorial Navigation */}
      <header className="sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur border-b border-stone-200 dark:border-slate-800 transition-colors">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="text-left focus:outline-none cursor-pointer"
          >
            <AcademyBrandMark theme={isDark ? 'dark' : 'light'} />
          </button>

          <nav aria-label="Primary Navigation" className="hidden lg:flex items-center gap-3 min-w-0">
            <div className="inline-flex items-center rounded-full bg-stone-100/90 dark:bg-slate-950/90 border border-stone-200 dark:border-slate-800 p-0.5">
              <button
                type="button"
                onClick={() => runWithAccount(() => onOpenView('notes'))}
                className="whitespace-nowrap shrink-0 px-2.5 py-1 rounded-full text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-800 hover:text-slate-950 dark:hover:text-white transition-colors cursor-pointer"
              >
                Notes
              </button>
              <button
                type="button"
                onClick={() => runWithAccount(() => onOpenView('quiz'))}
                className="whitespace-nowrap shrink-0 px-2.5 py-1 rounded-full text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-800 hover:text-slate-950 dark:hover:text-white transition-colors cursor-pointer"
              >
                Tests
              </button>
              <button
                type="button"
                onClick={() => runWithAccount(() => onOpenView('ai-interview'))}
                className="whitespace-nowrap shrink-0 px-2.5 py-1 rounded-full text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-800 hover:text-slate-950 dark:hover:text-white transition-colors cursor-pointer"
              >
                AI Interview
              </button>
              <button
                type="button"
                onClick={() => runWithAccount(() => onOpenView('daily-challenge'))}
                className="whitespace-nowrap shrink-0 px-2.5 py-1 rounded-full text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-800 hover:text-slate-950 dark:hover:text-white transition-colors cursor-pointer"
              >
                Daily Challenge
              </button>
              <button
                type="button"
                onClick={() => runWithAccount(() => onOpenView('skill-passport'))}
                className="whitespace-nowrap shrink-0 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/15 text-amber-800 dark:text-amber-300 hover:bg-amber-500/25 transition-colors cursor-pointer"
              >
                Skill Certificate
              </button>
            </div>
            <a
              href="#pathways"
              className="whitespace-nowrap shrink-0 text-xs font-medium text-slate-700 dark:text-slate-300 hover:text-amber-700 dark:hover:text-amber-400 transition-colors"
            >
              Pathways
            </a>
            <button
              type="button"
              onClick={() => runWithAccount(() => onOpenView('jobs'))}
              className="whitespace-nowrap shrink-0 text-xs font-medium text-slate-700 dark:text-slate-300 hover:text-amber-700 dark:hover:text-amber-400 transition-colors cursor-pointer"
            >
              Jobs
            </button>
            <button
              type="button"
              onClick={onScrollToGuidance}
              className="whitespace-nowrap shrink-0 text-xs font-medium text-slate-700 dark:text-slate-300 hover:text-amber-700 dark:hover:text-amber-400 transition-colors cursor-pointer"
            >
              Guidance
            </button>
          </nav>

          <div className="hidden lg:flex items-center gap-1.5 shrink-0">
            {learner?.email ? (
              <>
                <button
                  type="button"
                  onClick={() => setAccountInfoOpen(true)}
                  className="inline-flex items-center gap-1 shrink-0 whitespace-nowrap px-2.5 py-1.5 rounded-full text-xs font-semibold border border-amber-600/40 bg-amber-500/10 text-amber-800 dark:text-amber-300 hover:bg-amber-500/20 transition-colors cursor-pointer"
                  title="View Account Information"
                >
                  <UserCheck className="w-3.5 h-3.5 shrink-0" />
                  <span className="max-w-[90px] truncate">{learner.name || learner.email}</span>
                </button>
                <button
                  type="button"
                  onClick={async () => {
                    await signOutLearnerAccount();
                    if (typeof onSignOut === 'function') onSignOut();
                  }}
                  className="inline-flex items-center gap-1 shrink-0 whitespace-nowrap px-2 py-1.5 rounded-full text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-stone-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5 shrink-0" />
                  <span>Sign Out</span>
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode('login');
                    setAuthError('');
                    setAuthNotice('');
                    setAuthModalOpen(true);
                  }}
                  className="whitespace-nowrap shrink-0 px-2.5 py-1.5 rounded-full text-xs font-semibold border border-stone-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 hover:border-amber-600 dark:hover:border-amber-500 transition-colors cursor-pointer"
                >
                  Log In
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode('signup');
                    setAuthError('');
                    setAuthNotice('');
                    setAuthModalOpen(true);
                  }}
                  className="whitespace-nowrap shrink-0 px-2.5 py-1.5 rounded-full text-xs font-bold border border-amber-600/60 text-amber-700 dark:text-amber-300 hover:bg-amber-500/10 transition-colors cursor-pointer"
                >
                  Create Account
                </button>
              </>
            )}
            <a
              href="#search-hub"
              className="whitespace-nowrap shrink-0 px-2.5 py-1.5 rounded-full text-xs font-semibold border border-stone-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 hover:border-amber-600 dark:hover:border-amber-500 transition-colors"
            >
              Search
            </a>
            <button
              type="button"
              onClick={toggleTheme}
              aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
              title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
              className="shrink-0 p-1.5 rounded-full border border-stone-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:border-amber-600 dark:hover:border-amber-500 transition-colors cursor-pointer"
            >
              {isDark ? <Sun className="w-3.5 h-3.5 text-amber-400" /> : <Moon className="w-3.5 h-3.5" />}
            </button>
            <button
              type="button"
              onClick={() => runWithAccount(() => onOpenView('contribute'))}
              className="whitespace-nowrap shrink-0 px-3 py-1.5 rounded-full text-xs font-bold bg-amber-600 text-white hover:bg-amber-700 transition-colors cursor-pointer"
            >
              Recruiter Desk
            </button>
          </div>

          <div className="lg:hidden flex items-center gap-1.5">
            {learner?.email ? (
              <button
                type="button"
                onClick={() => setAccountInfoOpen(true)}
                className="px-2.5 py-1.5 rounded-lg text-xs font-bold border border-amber-600/50 bg-amber-500/10 text-amber-800 dark:text-amber-300 max-w-[110px] truncate cursor-pointer"
              >
                {learner.name || learner.email}
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setAuthMode('signup');
                  setAuthError('');
                  setAuthNotice('');
                  setAuthModalOpen(true);
                }}
                className="px-2.5 py-1.5 rounded-lg text-xs font-bold bg-amber-600 text-white cursor-pointer"
              >
                Sign Up / Log In
              </button>
            )}
            <button
              type="button"
              onClick={toggleTheme}
              aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
              title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
              className="p-2 rounded-lg border border-stone-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:border-amber-600 dark:hover:border-amber-500 transition-colors cursor-pointer"
            >
              {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
            </button>
            <button
              type="button"
              aria-label="Toggle Menu"
              aria-expanded={mobileOpen}
              onClick={() => setMobileOpen((prev) => !prev)}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold border border-stone-300 dark:border-slate-700 text-slate-800 dark:text-slate-100 bg-white dark:bg-slate-800 cursor-pointer"
            >
              {mobileOpen ? 'Close' : 'Menu'}
            </button>
          </div>
        </div>

        {mobileOpen && (
          <div className="lg:hidden bg-white dark:bg-slate-900 border-t border-stone-200 dark:border-slate-800 px-4 py-4 space-y-2 text-sm">
            <button type="button" onClick={() => { setMobileOpen(false); runWithAccount(() => onOpenView('notes')); }} className="block w-full text-left py-2 text-slate-800 dark:text-slate-100 hover:text-amber-700 dark:hover:text-amber-400 cursor-pointer">
              Syllabus Notes
            </button>
            <a href="#pathways" onClick={() => setMobileOpen(false)} className="block py-2 text-slate-700 dark:text-slate-200 hover:text-amber-700 dark:hover:text-amber-400">
              Learning Pathways
            </a>
            <button type="button" onClick={() => { setMobileOpen(false); runWithAccount(() => onOpenView('quiz')); }} className="block w-full text-left py-2 text-slate-800 dark:text-slate-100 hover:text-amber-700 dark:hover:text-amber-400 cursor-pointer">
              Knowledge Test
            </button>
            <button type="button" onClick={() => { setMobileOpen(false); runWithAccount(() => onOpenView('ai-interview')); }} className="block w-full text-left py-2 text-slate-800 dark:text-slate-100 hover:text-amber-700 dark:hover:text-amber-400 cursor-pointer">
              AI Interview
            </button>
            <button type="button" onClick={() => { setMobileOpen(false); runWithAccount(() => onOpenView('daily-challenge')); }} className="block w-full text-left py-2 text-slate-800 dark:text-slate-100 hover:text-amber-700 dark:hover:text-amber-400 cursor-pointer">
              Daily Challenge
            </button>
            <button type="button" onClick={() => { setMobileOpen(false); runWithAccount(() => onOpenView('jobs')); }} className="block w-full text-left py-2 text-slate-800 dark:text-slate-100 hover:text-amber-700 dark:hover:text-amber-400 cursor-pointer">
              Jobs
            </button>
            <button type="button" onClick={() => { setMobileOpen(false); runWithAccount(() => onOpenView('skill-passport')); }} className="block w-full text-left py-2 text-slate-800 dark:text-slate-100 hover:text-amber-700 dark:hover:text-amber-400 cursor-pointer">
              Skill Certificate
            </button>
            <button type="button" onClick={() => { setMobileOpen(false); runWithAccount(() => onOpenView('referralForm')); }} className="block w-full text-left py-2 text-slate-700 dark:text-slate-200 hover:text-amber-700 dark:hover:text-amber-400 cursor-pointer">
              Submit Referral
            </button>
            <button type="button" onClick={() => { setMobileOpen(false); runWithAccount(() => onOpenView('contribute')); }} className="block w-full text-left py-2 text-amber-700 dark:text-amber-400 font-semibold cursor-pointer">
              Recruiter Desk
            </button>
          </div>
        )}
      </header>

      <main className="flex-grow">
        <BannerAd468 className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-3" />
{/* Warm Editorial Hero */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-12">
          <div className="rounded-3xl bg-gradient-to-br from-[#13294B] via-[#1B365D] to-[#0F213A] text-white px-6 py-12 sm:px-12 sm:py-16 shadow-sm border border-amber-500/20">
            <div className="max-w-3xl space-y-5">
              <span className="inline-flex items-center px-3.5 py-1 rounded-full text-xs font-semibold tracking-wide bg-amber-400/15 text-amber-300 border border-amber-400/30">
                Financial Crime &amp; Compliance Hub
              </span>
              <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-[1.14]">
                Understand the Risk. Master the Investigation.
              </h1>
              <p className="text-sm sm:text-lg text-slate-200 leading-relaxed max-w-2xl">
                Build practical expertise in AML, KYC, transaction monitoring and financial crime compliance.
              </p>
              <div className="pt-2 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => runWithAccount(() => onOpenView('notes'))}
                  className="px-5 py-3 rounded-xl text-sm font-bold bg-amber-400 text-slate-950 hover:bg-amber-300 transition-colors cursor-pointer"
                >
                  Explore Syllabus Notes
                </button>
                <button
                  type="button"
                  onClick={() => runWithAccount(() => onOpenView('quiz'))}
                  className="px-5 py-3 rounded-xl text-sm font-semibold bg-white/10 text-white border border-white/20 hover:bg-white/15 transition-colors cursor-pointer"
                >
                  Take Knowledge Test
                </button>
                <button
                  type="button"
                  onClick={() => runWithAccount(() => onOpenView('jobs'))}
                  className="px-5 py-3 rounded-xl text-sm font-semibold text-amber-200 border border-amber-300/40 hover:bg-amber-400/10 transition-colors cursor-pointer"
                >
                  Browse Compliance Jobs
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Three Core Pillars */}
        <section aria-label="Core Compliance Pillars" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="rounded-2xl bg-white p-6 border border-stone-200/90 shadow-2xs flex flex-col justify-between gap-4">
              <div className="space-y-2">
                <p className="text-xs font-bold uppercase tracking-wider text-amber-700">Practice &amp; Simulation</p>
                <h2 className="text-lg font-bold text-slate-900">Knowledge Test 2.0</h2>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Build confidence across practice drills, timed exam mode, multi-stage case simulations, and SAR narrative feedback.
                </p>
              </div>
              <button
                type="button"
                onClick={() => runWithAccount(() => onOpenView('quiz'))}
                className="text-sm font-bold text-amber-800 hover:text-amber-950 w-fit cursor-pointer"
              >
                Launch Knowledge Test â†’
              </button>
            </div>

            <div className="rounded-2xl bg-white p-6 border border-stone-200/90 shadow-2xs flex flex-col justify-between gap-4">
              <div className="space-y-2">
                <p className="text-xs font-bold uppercase tracking-wider text-amber-700">Structured Playbooks</p>
                <h2 className="text-lg font-bold text-slate-900">AML &amp; KYC Study Notes</h2>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Review concise reference modules on CDD, EDD, beneficial ownership, screening, and reporting workflows.
                </p>
              </div>
              <button
                type="button"
                onClick={() => runWithAccount(() => onOpenView('notes'))}
                className="text-sm font-bold text-amber-800 hover:text-amber-950 w-fit cursor-pointer"
              >
                Open Syllabus Notes â†’
              </button>
            </div>

            <div className="rounded-2xl bg-white p-6 border border-stone-200/90 shadow-2xs flex flex-col justify-between gap-4">
              <div className="space-y-2">
                <p className="text-xs font-bold uppercase tracking-wider text-amber-700">India-Wide Discovery</p>
                <h2 className="text-lg font-bold text-slate-900">Careers AI</h2>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Discover compliance, AML, KYC, and risk openings across Indian states and union territories.
                </p>
              </div>
              <button
                type="button"
                onClick={() => runWithAccount(() => onOpenView('jobs'))}
                className="text-sm font-bold text-amber-800 hover:text-amber-950 w-fit cursor-pointer"
              >
                Explore Careers AI â†’
              </button>
            </div>
          </div>
        </section>

        {/* Concise AML & Financial Crime Practice Overview */}
        <section id="aml-focus-overview" aria-label="AML Learning & Career Focus Areas" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
          <div className="rounded-2xl bg-white p-6 sm:p-7 border border-stone-200 shadow-2xs space-y-4">
            <div className="space-y-1.5">
              <p className="text-xs font-bold uppercase tracking-wider text-amber-700">Practical Compliance Coverage</p>
              <h2 className="text-xl font-bold text-slate-900">How AMLDecode Supports Analyst &amp; Compliance Readiness</h2>
              <p className="text-sm text-slate-600 leading-relaxed max-w-4xl">
                AMLDecode brings together structured study notes, scenario drills, and role discovery for analysts and compliance learners across India and global financial crime teams.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
              <div className="rounded-xl bg-stone-50 p-4 border border-stone-200/80 space-y-1">
                <h3 className="font-bold text-slate-900">AML/KYC Interview Preparation</h3>
                <p className="text-slate-600 leading-relaxed">Review customer due diligence, enhanced due diligence, beneficial ownership, and red-flag reasoning commonly tested in analyst interviews.</p>
              </div>
              <div className="rounded-xl bg-stone-50 p-4 border border-stone-200/80 space-y-1">
                <h3 className="font-bold text-slate-900">Transaction Monitoring Case Studies</h3>
                <p className="text-slate-600 leading-relaxed">Work through structured alert investigations covering unusual cash activity, rapid layering, and escalation rationales.</p>
              </div>
              <div className="rounded-xl bg-stone-50 p-4 border border-stone-200/80 space-y-1">
                <h3 className="font-bold text-slate-900">SAR Writing Practice</h3>
                <p className="text-slate-600 leading-relaxed">Practice organizing clear, factual suspicious activity narratives that connect customer profiles, observed behavior, and risk indicators.</p>
              </div>
              <div className="rounded-xl bg-stone-50 p-4 border border-stone-200/80 space-y-1">
                <h3 className="font-bold text-slate-900">AML Daily Quizzes</h3>
                <p className="text-slate-600 leading-relaxed">Reinforce core concepts every day with short, targeted questions on sanctions screening, KYC controls, and investigation judgment.</p>
              </div>
              <div className="rounded-xl bg-stone-50 p-4 border border-stone-200/80 space-y-1">
                <h3 className="font-bold text-slate-900">AML/KYC Job Opportunities</h3>
                <p className="text-slate-600 leading-relaxed">Browse compliance, KYC, and transaction monitoring roles alongside career guidance and referral workflows.</p>
              </div>
              <div className="rounded-xl bg-stone-50 p-4 border border-stone-200/80 space-y-1">
                <h3 className="font-bold text-slate-900">AML Skill Assessments</h3>
                <p className="text-slate-600 leading-relaxed">Track strengths and gaps across core compliance domains to focus study time where it matters most.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Clean Repository Search */}
        <section id="search-hub" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12">
          <div className="rounded-2xl bg-white p-6 sm:p-7 border border-stone-200 shadow-2xs">
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
                className="flex-grow px-4 py-3 rounded-xl bg-[#F8F7F4] border border-stone-300 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-amber-600 focus:bg-white"
              />
              {hasSearch && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="px-4 py-3 rounded-xl text-xs font-semibold border border-stone-300 text-slate-700 hover:bg-stone-100 cursor-pointer"
                >
                  Clear
                </button>
              )}
            </div>

            {hasSearch && (
              <div className="mt-6 pt-6 border-t border-stone-200 space-y-6">
                <p className="text-xs text-slate-600">
                  Found <strong className="text-amber-800">{totalMatches}</strong> matching items across existing content.
                </p>

                {searchResults.notes.length > 0 && (
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-amber-800 mb-2">Syllabus Notes</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {searchResults.notes.map((n) => (
                        <button
                          key={n.idx}
                          type="button"
                          onClick={() => {
                            runWithAccount(() => {
                              onSelectNoteIndex(n.idx);
                              onOpenView('notes');
                            });
                          }}
                          className="text-left p-3.5 rounded-xl bg-[#F8F7F4] border border-stone-200 hover:border-amber-600/50 transition-colors cursor-pointer"
                        >
                          <p className="text-sm font-semibold text-slate-900">{n.title}</p>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {searchResults.jobs.length > 0 && (
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-amber-800 mb-2">Job Openings</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {searchResults.jobs.map((job, i) => (
                        <a
                          key={i}
                          href={job.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block p-3.5 rounded-xl bg-[#F8F7F4] border border-stone-200 hover:border-amber-600/50 transition-colors"
                        >
                          <p className="text-sm font-semibold text-slate-900">{job.role}</p>
                          <p className="text-xs text-slate-600 mt-0.5">{job.company} Â· {job.location}</p>
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                {searchResults.news.length > 0 && (
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-amber-800 mb-2">Regulatory Headlines</h3>
                    <div className="space-y-2">
                      {searchResults.news.map((item, i) => (
                        <a
                          key={i}
                          href={item.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block p-3 rounded-xl bg-[#F8F7F4] border border-stone-200 text-sm font-medium text-slate-900 hover:border-amber-600/50"
                        >
                          {item.headline}
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                {searchResults.faqs.length > 0 && (
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">FAQs</h3>
                    <div className="space-y-2">
                      {searchResults.faqs.map((faq, i) => (
                        <div key={i} className="p-3.5 rounded-xl bg-[#F8F7F4] border border-stone-200">
                          <p className="text-sm font-semibold text-slate-900">{faq.question}</p>
                          <p className="text-xs text-slate-600 mt-1">{faq.answer}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </section>

      <NativeAdBanner />
        <MidPageScriptAd />

        {/* Learning Pathways */}
        <section id="pathways" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-14">
          <SectionHeader
            eyebrow="Structured Tracks"
            title="Learning Pathways"
            subtitle="Jump directly into existing compliance study modules organized by core subject area."
            action={
              <a
                href="/notes"
                onClick={(e) => {
                  e.preventDefault();
                  runWithAccount(() => onOpenView('notes'));
                }}
                className="text-xs font-bold text-amber-800 hover:underline cursor-pointer"
              >
                View all {notesContent.length} modules â†’
              </a>
            }
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {pathways.map((p) => {
              const pHref = MODULE_BY_INDEX.get(p.noteIndex)?.routePath || '/notes';
              return (
                <a
                  key={p.label}
                  href={pHref}
                  onClick={(e) => {
                    e.preventDefault();
                    runWithAccount(() => {
                      onSelectNoteIndex(p.noteIndex);
                      onOpenView('notes');
                    });
                  }}
                  className="rounded-2xl bg-white p-5 border border-stone-200 hover:border-amber-600/60 shadow-2xs text-left flex flex-col justify-between gap-3 transition-all cursor-pointer"
                >
                  <div>
                    <TopicBadge tone="teal">{p.label}</TopicBadge>
                    <p className="mt-3 text-sm font-semibold text-slate-900 leading-snug">{p.moduleTitle}</p>
                  </div>
                  <span className="text-xs font-bold text-amber-800">Open module â†’</span>
                </a>
              );
            })}
          </div>
        </section>

        {/* Featured Content & Regulatory Bulletins */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-14">
          <SectionHeader
            eyebrow="Core Study & Updates"
            title="Featured Learning Modules & Headlines"
            subtitle="Direct access to existing syllabus modules and regulatory source links."
          />
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-3 gap-4">
              {featuredNotes.map((mod, idx) => (
                <IntelligenceCard key={mod.title || idx} className="bg-white border border-stone-200 flex flex-col justify-between">
                  <div>
                    <TopicBadge tone="teal">Module {idx + 1}</TopicBadge>
                    <h3 className="mt-3 text-base font-bold text-slate-900">{mod.title}</h3>
                    <p className="mt-2 text-xs text-slate-600 line-clamp-3 leading-relaxed">
                      {typeof mod.content === 'string' ? mod.content : 'Structured compliance study module.'}
                    </p>
                  </div>
                  <a
                    href={MODULE_BY_INDEX.get(idx)?.routePath || '/notes'}
                    onClick={(e) => {
                      e.preventDefault();
                      runWithAccount(() => {
                        onSelectNoteIndex(idx);
                        onOpenView('notes');
                      });
                    }}
                    className="mt-4 text-left text-xs font-bold text-amber-800 hover:underline cursor-pointer"
                  >
                    Read full module â†’
                  </a>
                </IntelligenceCard>
              ))}
            </div>

            <IntelligenceCard className="lg:col-span-4 bg-white border border-stone-200 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-amber-800">Regulatory Headlines</h3>
              </div>
              <ul className="space-y-3">
                {kycNews.map((item, i) => (
                  <li key={i} className="border-b border-stone-100 last:border-b-0 pb-3 last:pb-0">
                    <a
                      href={item.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm font-medium text-slate-800 hover:text-amber-800 transition-colors block"
                    >
                      {item.headline}
                    </a>
                  </li>
                ))}
              </ul>
            </IntelligenceCard>
          </div>
        </section>

        {/* AI Daily Knowledge Challenge */}
        <section id="daily-challenge" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-14">
          <SectionHeader
            eyebrow="Daily Challenge"
            title="AMLDecode AI Daily Knowledge Challenge"
            subtitle="Test your AML, KYC, transaction monitoring, SAR, and sanctions judgment dailyâ€”with instant feedback and source-backed explanations."
            action={
              <button
                type="button"
                onClick={() => runWithAccount(() => onOpenView('quiz'))}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-white border border-stone-300 text-slate-900 hover:border-amber-600 cursor-pointer"
              >
                Open Knowledge Test
              </button>
            }
          />
          <DailyChallengeCard
            compact
            onOpenRelatedNote={(noteIdx) => {
              runWithAccount(() => onSelectNoteIndex(noteIdx))
              onOpenView('notes');
            }}
            onOpenKnowledgeTest={() => runWithAccount(() => onOpenView('quiz'))}
          />
        </section>

        {/* Purpose & Credibility */}
        <section id="career-guidance" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-14 pb-14">
          <div className="rounded-2xl bg-white p-6 sm:p-8 border border-stone-200 shadow-2xs space-y-5">
            <SectionHeader
              eyebrow="Purpose & Scope"
              title="Educational & Networking Focus"
              subtitle="AMLDecode provides structured study material on AML, KYC, transaction monitoring, and compliance concepts along with career and referral resources. It is an independent learning and networking platform rather than a legal, regulatory, or hiring authority."
            />
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => onOpenView('faq')}
                className="px-4 py-2.5 rounded-xl text-xs font-bold border border-stone-300 text-slate-900 hover:bg-stone-50 cursor-pointer"
              >
                Read FAQ
              </button>
              <button
                type="button"
                onClick={() => runWithAccount(() => onOpenView('referralForm'))}
                className="px-4 py-2.5 rounded-xl text-xs font-bold bg-amber-600 text-white hover:bg-amber-700 cursor-pointer"
              >
                Submit Referral
              </button>
              <button
                type="button"
                onClick={() => runWithAccount(() => onOpenView('contribute'))}
                className="px-4 py-2.5 rounded-xl text-xs font-bold border border-amber-500/40 text-amber-800 dark:text-amber-300 hover:bg-amber-50/60 dark:hover:bg-amber-950/30 cursor-pointer"
              >
                Recruiter Desk
              </button>
              <button
                type="button"
                onClick={() => onOpenView('contact')}
                className="px-4 py-2.5 rounded-xl text-xs font-semibold border border-stone-300 text-slate-700 hover:text-slate-900 cursor-pointer"
              >
                Contact Support
              </button>
            </div>
          </div>
        </section>
      </main>

      {/* Calm Multi-Column Footer */}
      <SupportDeveloperBanner />
      <footer className="border-t border-stone-200 bg-white text-slate-700 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-12 gap-8 text-sm">
          <div className="md:col-span-5 space-y-3">
            <AcademyBrandMark theme="light" />
            <p className="text-xs text-slate-500 leading-relaxed max-w-sm">
              Structured learning notes, assessments, compliance job listings, and referral resources for AML and KYC professionals.
            </p>
          </div>
          <div className="md:col-span-3 space-y-2">
            <p className="text-xs font-bold uppercase tracking-wider text-amber-800">Platform</p>
            <nav aria-label="Footer Platform Links" className="flex flex-col gap-1 text-sm text-slate-700">
              <a href="/?view=faq" onClick={(e) => { e.preventDefault(); onOpenView('faq'); }} className="text-left py-1.5 hover:text-slate-950">About &amp; FAQ</a>
              <a href="/?view=contact" onClick={(e) => { e.preventDefault(); onOpenView('contact'); }} className="text-left py-1.5 hover:text-slate-950">Contact Us</a>
              <a href="/notes" onClick={(e) => { e.preventDefault(); runWithAccount(() => onOpenView('notes')); }} className="text-left py-1.5 hover:text-slate-950">Syllabus Notes</a>
              <a href="/?view=quiz" onClick={(e) => { e.preventDefault(); runWithAccount(() => onOpenView('quiz')); }} className="text-left py-1.5 hover:text-slate-950">Knowledge Test</a>
            </nav>
          </div>
          <div className="md:col-span-4 space-y-2">
            <p className="text-xs font-bold uppercase tracking-wider text-amber-800">Legal &amp; Disclaimer</p>
            <nav aria-label="Footer Legal Links" className="flex flex-col gap-1 text-sm text-slate-700">
              <a href="/?view=privacy" onClick={(e) => { e.preventDefault(); onOpenView('privacy'); }} className="text-left py-1.5 hover:text-slate-950">Privacy Policy</a>
              <a href="/?view=terms" onClick={(e) => { e.preventDefault(); onOpenView('terms'); }} className="text-left py-1.5 hover:text-slate-950">Terms of Service &amp; Disclaimer</a>
            </nav>
          </div>
        </div>
      
      <div className="mt-8 border-t pt-4 text-center border-slate-300">
        <p className="font-medium text-black">Developed & Designed By Nitesh Mishra</p>
      </div>
    </footer>
    

      {accountInfoOpen && learner?.email && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Learner Account Information"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4"
        >
          <div className="w-full max-w-md rounded-2xl bg-white dark:bg-slate-900 border border-stone-200 dark:border-slate-800 p-6 shadow-2xl space-y-4">
            <div className="flex items-start justify-between gap-3 border-b border-stone-200 dark:border-slate-800 pb-3">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-widest text-amber-600 dark:text-amber-400">
                  Account Information
                </p>
                <h2 className="text-xl font-extrabold text-slate-900 dark:text-white mt-0.5">
                  {learner.name || 'Learner'}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setAccountInfoOpen(false)}
                aria-label="Close account information"
                className="p-1.5 rounded-lg border border-stone-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-stone-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2.5 text-sm">
              <div className="rounded-xl bg-stone-50 dark:bg-slate-950 border border-stone-200 dark:border-slate-800 px-3.5 py-2.5">
                <span className="block text-[11px] uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Full Name (Certificate)
                </span>
                <span className="font-semibold text-slate-900 dark:text-white">{learner.name || 'Learner'}</span>
              </div>
              <div className="rounded-xl bg-stone-50 dark:bg-slate-950 border border-stone-200 dark:border-slate-800 px-3.5 py-2.5">
                <span className="block text-[11px] uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Email Address
                </span>
                <span className="font-semibold text-slate-900 dark:text-white">{learner.email}</span>
              </div>
              <div className="rounded-xl bg-stone-50 dark:bg-slate-950 border border-stone-200 dark:border-slate-800 px-3.5 py-2.5">
                <span className="block text-[11px] uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Account Status
                </span>
                <span className="font-semibold text-emerald-600 dark:text-emerald-400">Active Signed-In Account</span>
              </div>
            </div>

            <div className="flex items-center justify-between gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => {
                  setAccountInfoOpen(false);
                  onOpenView('skill-passport');
                }}
                className="px-4 py-2 rounded-xl border border-amber-600/60 text-xs font-bold text-amber-700 dark:text-amber-300 hover:bg-amber-500/10 transition cursor-pointer"
              >
                Open Skill Certificate
              </button>
              <button
                type="button"
                onClick={async () => {
                  await signOutLearnerAccount();
                  setAccountInfoOpen(false);
                  if (typeof onSignOut === 'function') onSignOut();
                }}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-xs font-bold text-white transition cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {authModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Learner Account Sign Up or Log In"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4"
        >
          <div className="w-full max-w-md rounded-2xl bg-white dark:bg-slate-900 border border-stone-200 dark:border-slate-800 p-6 shadow-2xl space-y-5">
            <div className="flex items-start justify-between gap-3 border-b border-stone-200 dark:border-slate-800 pb-4">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-widest text-amber-600 dark:text-amber-400">
                  AMLDecode Learner Account
                </p>
                <h2 className="text-xl font-extrabold text-slate-900 dark:text-white mt-1">
                  {authMode === 'signup' ? 'Create Your Account' : authMode === 'reset' ? 'Reset Your Password' : 'Log In to Your Account'}
                </h2>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                  Your name is mapped directly to your Skill Certificate and saved to your learner profile.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setAuthModalOpen(false)}
                aria-label="Close account dialog"
                className="p-1.5 rounded-lg border border-stone-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-stone-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2 rounded-xl bg-stone-100 dark:bg-slate-950 p-1">
              <button
                type="button"
                onClick={() => { setAuthMode('signup'); setAuthError(''); setAuthNotice(''); }}
                className={`rounded-lg py-1.5 text-xs font-bold transition cursor-pointer ${authMode === 'signup' ? 'bg-amber-600 text-white' : 'text-slate-600 dark:text-slate-300'}`}
              >
                Sign Up
              </button>
              <button
                type="button"
                onClick={() => { setAuthMode('login'); setAuthError(''); setAuthNotice(''); }}
                className={`rounded-lg py-1.5 text-xs font-bold transition cursor-pointer ${authMode === 'login' ? 'bg-amber-600 text-white' : 'text-slate-600 dark:text-slate-300'}`}
              >
                Log In
              </button>
            </div>

            <form onSubmit={handleAuthSubmit} className="space-y-3.5">
              {authMode === 'signup' && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Full Name (Shown on Certificate)
                  </label>
                  <input
                    type="text"
                    required
                    value={authName}
                    onChange={(e) => setAuthName(e.target.value)}
                    placeholder="e.g., Shreya Sagar"
                    className="w-full rounded-xl bg-stone-50 dark:bg-slate-950 border border-stone-300 dark:border-slate-700 px-3.5 py-2.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-amber-600"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={authEmail}
                  onChange={(e) => setAuthEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full rounded-xl bg-stone-50 dark:bg-slate-950 border border-stone-300 dark:border-slate-700 px-3.5 py-2.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-amber-600"
                />
              </div>

              {authMode === 'reset' && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    6-Digit Verification Code
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    required
                    maxLength={8}
                    value={authResetCode}
                    onChange={(e) => setAuthResetCode(e.target.value)}
                    placeholder="Enter 6-digit code from email"
                    className="w-full rounded-xl bg-stone-50 dark:bg-slate-950 border border-stone-300 dark:border-slate-700 px-3.5 py-2.5 text-sm tracking-widest font-mono text-slate-900 dark:text-white focus:outline-none focus:border-amber-600"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  {authMode === 'reset' ? 'New Password' : 'Password'}
                </label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={authPassword}
                  onChange={(e) => setAuthPassword(e.target.value)}
                  placeholder={authMode === 'reset' ? 'New password (A-z, 0-9 & symbol)' : 'At least 8 chars (A-z, 0-9 & symbol)'}
                  className="w-full rounded-xl bg-stone-50 dark:bg-slate-950 border border-stone-300 dark:border-slate-700 px-3.5 py-2.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-amber-600"
                />
                <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">Use uppercase, lowercase, a number, and a symbol.</p>
              </div>

              {authError && (
                <p role="alert" className="text-xs font-medium text-rose-500">
                  {authError}
                </p>
              )}
              {authNotice && (
                <p className="text-xs font-medium text-emerald-500">
                  {authNotice}
                </p>
              )}

              <button
                type="submit"
                disabled={authBusy}
                className="w-full rounded-xl bg-amber-600 hover:bg-amber-700 disabled:opacity-60 py-2.5 text-xs font-extrabold uppercase tracking-wider text-white transition cursor-pointer"
              >
                {authBusy ? 'Please wait...' : authMode === 'signup' ? 'Create Account & Continue' : authMode === 'reset' ? 'Verify Code & Update Password' : 'Log In & Continue'}
              </button>

              {(showResetOption || authMode === 'login') && (
                <div className="pt-1 text-center">
                  <button
                    type="button"
                    disabled={authBusy}
                    onClick={async () => {
                      setAuthError('');
                      setAuthNotice('');
                      setAuthBusy(true);
                      try {
                        const resetRes = await requestPasswordResetEmail(authEmail);
                        if (resetRes.error) {
                          setAuthError(resetRes.error);
                        } else {
                          setShowResetOption(false);
                          setAuthMode('reset');
                          setAuthResetCode('');
                          setAuthPassword('');
                          setAuthNotice('6-digit reset code sent from alerts@amldecode.in. Enter the code and your new password below.');
                        }
                      } finally {
                        setAuthBusy(false);
                      }
                    }}
                    className="text-xs font-semibold text-amber-500 hover:text-amber-400 underline underline-offset-2 disabled:opacity-60 cursor-pointer"
                  >
                    Reset Password
                  </button>
                </div>
              )}

              {authMode === 'reset' && (
                <div className="pt-1 flex items-center justify-between text-xs">
                  <button
                    type="button"
                    disabled={authBusy}
                    onClick={async () => {
                      setAuthError('');
                      setAuthNotice('');
                      setAuthBusy(true);
                      try {
                        const resetRes = await requestPasswordResetEmail(authEmail);
                        if (resetRes.error) {
                          setAuthError(resetRes.error);
                        } else {
                          setAuthNotice('New 6-digit code sent from alerts@amldecode.in.');
                        }
                      } finally {
                        setAuthBusy(false);
                      }
                    }}
                    className="font-semibold text-amber-500 hover:text-amber-400 underline underline-offset-2 disabled:opacity-60 cursor-pointer"
                  >
                    Resend Code
                  </button>
                  <button
                    type="button"
                    disabled={authBusy}
                    onClick={() => {
                      setAuthMode('login');
                      setAuthResetCode('');
                      setAuthPassword('');
                      setAuthError('');
                      setAuthNotice('');
                    }}
                    className="font-semibold text-slate-500 hover:text-slate-300 underline underline-offset-2 disabled:opacity-60 cursor-pointer"
                  >
                    Back to Log In
                  </button>
                </div>
              )}
            </form>
          </div>
        </div>
      )}
</div>
  );
}

