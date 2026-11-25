import React, { useState, useEffect, lazy, Suspense } from 'react';
import './design-tokens.css';
import { supabase } from './supabaseClient';
import { fetchKt2Attempts, insertKt2Attempt } from './data/kt2SupabaseSync';
import { applyLearnerNameToPassport, recordAccountInSupabase } from './data/supabaseAuthSync';
const SkillPassportView = lazy(() => import('./components/SkillPassportView'));
import { notesContent, privacyPolicy, termsOfService, faqData, contactContent } from './content';
import { MODULE_BY_SLUG, MODULE_BY_INDEX } from './data/moduleRegistry';
import { kycNews } from './news';
import HomepageHub from './components/HomepageHub';
const SyllabusReader = lazy(() => import('./components/SyllabusReader'));
const KnowledgeTestSetup = lazy(() => import('./components/KnowledgeTestSetup'));
const CareersAiHub = lazy(() => import('./components/CareersAiHub'));
import LearnerLoginModal from './components/LearnerLoginModal';
const AssessmentRunner = lazy(() => import('./components/AssessmentRunner'));
const CaseSimulationRunner = lazy(() => import('./components/CaseSimulationRunner'));
const SarNarrativeLab = lazy(() => import('./components/SarNarrativeLab'));
const AiInterviewHub = lazy(() => import('./components/AiInterviewHub'));
const DailyChallengeCard = lazy(() => import('./components/DailyChallengeCard'));
import {
  buildAssessmentQueue,
  readStoredRecentAttempts,
} from './data/knowledgeTestBank';

class AssessmentErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, errorMessage: '' };
  }

  static getDerivedStateFromError(error) {
    return {
      hasError: true,
      errorMessage: error?.message || 'Unexpected rendering error in assessment view.',
    };
  }

  render() {
  if (this.state.hasError) {
      return (
        <div className="max-w-3xl mx-auto p-6 sm:p-8 rounded-2xl bg-[#0D1E30] border border-red-400/50 space-y-4">
          <p className="text-xs font-bold uppercase tracking-wider text-red-300">
            Assessment View Recovery
          </p>
          <h2 className="text-xl font-bold text-[#F5F8FC]">
            Something interrupted this assessment screen
          </h2>
          <p className="text-xs text-[#B8C7D9]">{this.state.errorMessage}</p>
          <button
            type="button"
            onClick={() => {
              this.setState({ hasError: false, errorMessage: '' });
              if (typeof this.props.onReset === 'function') {
                this.props.onReset();
              }
            }}
            className="px-4 py-2.5 rounded-xl bg-[#C4A77D] text-[#081C33] text-xs font-extrabold cursor-pointer"
          >
            Return to Assessment Setup
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
class SkillPassportErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }
  static getDerivedStateFromError(error) {
    return { error };
  }
  render() {
    if (this.state.error) {
      return (
        <div className="rounded-xl border border-rose-500/40 bg-rose-950/30 p-6 text-rose-100 space-y-3">
          <h2 className="text-base font-semibold">Skill Certificate Render Error</h2>
          <p className="text-xs font-mono break-all">{String(this.state.error?.message || this.state.error)}</p>
          <button type="button" onClick={() => this.setState({ error: null })} className="rounded-lg border border-rose-400/50 px-3 py-1.5 text-xs font-medium">
            Retry Render
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function App() {
  const [notFoundSlug, setNotFoundSlug] = useState(null);
  const [activeView, setActiveView] = useState(() => {
    try {
      const pathname = window.location.pathname || '';
      const searchParams = new URLSearchParams(window.location.search);
      const verifyMatch = pathname.match(/^\/verify\/achievement\/([^/?#]+)/);
      const hasVerifyToken = Boolean(verifyMatch?.[1] || searchParams.get('verify'));
      const notesMatch = pathname.match(/^\/notes(?:\/([^/?#]+))?\/?$/);
      const pathView = notesMatch
        ? 'notes'
        : pathname === '/ai-interview'
        ? 'ai-interview'
        : pathname === '/skill-passport' || hasVerifyToken
        ? 'skill-passport'
        : null;
      const param = searchParams.get('view') || pathView;
      const allowed = ['notes', 'quiz', 'jobs', 'network', 'available', 'referralForm', 'contribute', 'faq', 'contact', 'privacy', 'terms', 'disclaimer', 'about', 'skill-passport'];
      return allowed.includes(param) ? param : null;
    } catch {
      return null;
    }
  });
  const [pageIndex, setPageIndex] = useState(() => {
    try {
      const pathname = window.location.pathname || '';
      const searchParams = new URLSearchParams(window.location.search);
      const notesMatch = pathname.match(/^\/notes\/([^/?#]+)\/?$/);
      if (notesMatch?.[1]) {
        const entry = MODULE_BY_SLUG.get(decodeURIComponent(notesMatch[1]).toLowerCase());
        if (entry) return entry.index;
      }
      const modParam = searchParams.get('module');
      if (modParam !== null) {
        const parsed = Number.parseInt(modParam, 10);
        if (!Number.isNaN(parsed) && parsed >= 1 && parsed <= notesContent.length) {
          return parsed - 1;
        }
      }
      return 0;
    } catch {
      return 0;
    }
  });
  const [isLoading, setIsLoading] = useState(true);
  const [submissions, setSubmissions] = useState([]);
  const [partnerFiles, setPartnerFiles] = useState([]);
  const [newsList, setNewsList] = useState([]);
  const [selectedDomain, setSelectedDomain] = useState('AML/KYC');
  const [selectedDifficulty, setSelectedDifficulty] = useState('Intermediate');
  const [selectedCount, setSelectedCount] = useState(10);
  const [selectedMode, setSelectedMode] = useState('practice');
  const [faqCategory, setFaqCategory] = useState('All');
  const [testData, setTestData] = useState([]);
  const [activeSessionQuestions, setActiveSessionQuestions] = useState(null);
  const [recentAttempts, setRecentAttempts] = useState(() => readStoredRecentAttempts());

  const [referralName, setReferralName] = useState('');
  const [referralEmail, setReferralEmail] = useState('');
  const [referralRole, setReferralRole] = useState('');
  const [referralNotes, setReferralNotes] = useState('');
  const [referralStatus, setReferralStatus] = useState('');

  const [partnerPassword, setPartnerPassword] = useState('');
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [partnerError, setPartnerError] = useState('');
const LEARNER_STORAGE_KEY = 'amldecode_kt2_learner_v1';
    const [learner, setLearner] = useState(() => {
      try {
        const raw = window.localStorage.getItem(LEARNER_STORAGE_KEY);
        return raw ? JSON.parse(raw) : null;
      } catch {
        return null;
      }
    });
    const [pendingStartConfig, setPendingStartConfig] = useState(null);
    const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  
    const launchAssessmentWithConfig = (config) => {
      const queue = buildAssessmentQueue({
        domain: config.domain,
        difficulty: config.difficulty,
        count: config.count,
        supabaseRows: testData,
      });
      setActiveSessionQuestions(queue);
    };
  
    const handleRequestStartAssessment = (config) => {
      if (!learner || !learner.email) {
        setPendingStartConfig(config);
        setIsLoginModalOpen(true);
        return;
      }
      launchAssessmentWithConfig(config);
    };
  
      useEffect(() => {
    if (!supabase) return;
    let active = true;
    supabase.auth.getSession().then(({ data }) => {
      if (!active) return;
      const user = data?.session?.user;
      if (user?.email) {
        const fullName =
          user.user_metadata?.full_name ||
          user.user_metadata?.name ||
          learner?.name ||
          'Learner';
        const profile = {
          id: user.id,
          name: fullName,
          email: user.email.toLowerCase(),
          loggedInAt: new Date().toISOString(),
        };
        setLearner(profile);
        try {
          window.localStorage.setItem(LEARNER_STORAGE_KEY, JSON.stringify(profile));
        } catch {
          // Storage unavailable
        }
        applyLearnerNameToPassport(fullName, profile.email);
        recordAccountInSupabase({ fullName, email: profile.email, authUserId: user.id });
      }
    });

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!active) return;
      const user = session?.user;
      if (user?.email) {
        const fullName =
          user.user_metadata?.full_name ||
          user.user_metadata?.name ||
          learner?.name ||
          'Learner';
        const profile = {
          id: user.id,
          name: fullName,
          email: user.email.toLowerCase(),
          loggedInAt: new Date().toISOString(),
        };
        setLearner(profile);
        try {
          window.localStorage.setItem(LEARNER_STORAGE_KEY, JSON.stringify(profile));
        } catch {
          // Storage unavailable
        }
        applyLearnerNameToPassport(fullName, profile.email);
      }
    });

    return () => {
      active = false;
      authListener?.subscription?.unsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleLoginSuccess = (profile, configToStart) => {
    setLearner(profile);
    try {
      window.localStorage.setItem(LEARNER_STORAGE_KEY, JSON.stringify(profile));
    } catch {
      // Ignore storage quota errors
    }
    applyLearnerNameToPassport(profile.name, profile.email);
    recordAccountInSupabase({ fullName: profile.name, email: profile.email, authUserId: profile.id || null });
    fetchKt2Attempts(profile.email).then((remoteAttempts) => {
      if (Array.isArray(remoteAttempts) && remoteAttempts.length > 0) {
        setRecentAttempts(remoteAttempts);
      }
    });
    setIsLoginModalOpen(false);
    const targetConfig = configToStart || pendingStartConfig;
    setPendingStartConfig(null);
    const targetView = pendingViewAfterLogin;
    setPendingViewAfterLogin(null);
    if (targetConfig) {
      launchAssessmentWithConfig(targetConfig);
    } else if (targetView) {
      setActiveView(targetView);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  useEffect(() => {
    const syncFromLocation = () => {
      try {
        const pathname = window.location.pathname || '';
        const searchParams = new URLSearchParams(window.location.search);
        const notesSlugMatch = pathname.match(/^\/notes\/([^/?#]+)\/?$/);
        const notesIndexMatch = /^\/notes\/?$/.test(pathname);

        if (notesSlugMatch?.[1]) {
          const decodedSlug = decodeURIComponent(notesSlugMatch[1]).toLowerCase();
          const entry = MODULE_BY_SLUG.get(decodedSlug);
          if (entry) {
            setNotFoundSlug(null);
            setPageIndex(entry.index);
            setActiveView('notes');
          } else {
            setNotFoundSlug(decodedSlug);
            setActiveView('notes');
          }
          return;
        }

        if (notesIndexMatch) {
          setNotFoundSlug(null);
          setActiveView('notes');
          return;
        }

        const viewParam = searchParams.get('view');
        const modParam = searchParams.get('module');
        if (viewParam === 'notes' && modParam !== null) {
          const parsed = Number.parseInt(modParam, 10);
          if (!Number.isNaN(parsed) && parsed >= 1 && parsed <= notesContent.length) {
            const targetIdx = parsed - 1;
            const entry = MODULE_BY_INDEX.get(targetIdx);
            setNotFoundSlug(null);
            setPageIndex(targetIdx);
            setActiveView('notes');
            if (entry && window.location.pathname !== entry.routePath) {
              window.history.replaceState({}, '', entry.routePath);
            }
          }
        }
      } catch {
        // Ignore history sync errors
      }
    };

    syncFromLocation();
    window.addEventListener('popstate', syncFromLocation);
    return () => window.removeEventListener('popstate', syncFromLocation);
  }, []);

  useEffect(() => {
    if (!learner?.email) return;
    let active = true;
    fetchKt2Attempts(learner.email).then((remoteAttempts) => {
      if (active && Array.isArray(remoteAttempts) && remoteAttempts.length > 0) {
        setRecentAttempts(remoteAttempts);
      }
    });
    return () => {
      active = false;
    };
  }, [learner?.email]);

  const handleRecordAttemptWithSync = (updatedAttempts) => {
    setRecentAttempts(updatedAttempts);
    if (Array.isArray(updatedAttempts) && updatedAttempts.length > 0 && learner?.email) {
      insertKt2Attempt(learner, updatedAttempts[0]);
    }
  };

  useEffect(() => {
    let mounted = true;
    async function loadPlatformData() {
      setIsLoading(true);
      try {
        const [{ data: subs }, { data: files }, { data: news }, { data: questions }] =
          await Promise.all([
            supabase.from('submissions').select('*').order('created_at', { ascending: false }),
            supabase.from('partner_files').select('*').order('created_at', { ascending: false }),
            supabase.from('kyc_news').select('*').order('created_at', { ascending: false }),
            supabase.from('knowledge_test').select('*'),
          ]);

        if (!mounted) return;
        setSubmissions(Array.isArray(subs) ? subs : []);
        setPartnerFiles(Array.isArray(files) ? files : []);
        setNewsList(Array.isArray(news) && news.length > 0 ? news : kycNews);
        setTestData(Array.isArray(questions) ? questions : []);
      } catch {
        if (mounted) {
          setNewsList(kycNews);
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    }
    loadPlatformData();
    return () => {
      mounted = false;
    };
  }, []);

  const [pendingViewAfterLogin, setPendingViewAfterLogin] = useState(null);

  const requestOpenView = (view) => {
    if (!view) {
      setActiveView(null);
      setPendingViewAfterLogin(null);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    if (!learner?.email) {
      setPendingViewAfterLogin(view);
      setIsLoginModalOpen(true);
      return;
    }
    setActiveView(view);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  useEffect(() => {
    if (!activeView || learner?.email) return;
    const timer = window.setTimeout(() => {
      setPendingViewAfterLogin((prev) => prev || activeView);
      setActiveView(null);
      setIsLoginModalOpen(true);
    }, 0);
    return () => window.clearTimeout(timer);
  }, [activeView, learner]);

  const handleBackHome = () => {
    setActiveView(null);
    setActiveSessionQuestions(null);
  };

  const handleScrollToGuidance = () => {
    setActiveView(null);
    setTimeout(() => {
      document.getElementById('career-guidance')?.scrollIntoView({ behavior: 'smooth' });
    }, 120);
  };

  const handleReferralSubmit = async (e) => {
    e.preventDefault();
    setReferralStatus('');
    try {
      const { error } = await supabase.from('submissions').insert([
        {
          name: referralName,
          email: referralEmail,
          role: referralRole,
          notes: referralNotes,
        },
      ]);
      if (error) {
        setReferralStatus(error.message || 'Unable to submit referral.');
      } else {
        setReferralStatus('Referral submitted.');
        setReferralName('');
        setReferralEmail('');
        setReferralRole('');
        setReferralNotes('');
      }
    } catch {
      setReferralStatus('Network error while submitting referral.');
    }
  };

  const handleRecruiterAuth = async (e) => {
    e.preventDefault();
    setPartnerError('');
    try {
      const res = await fetch('/api/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: partnerPassword }),
      });
      const data = await res.json();
      if (res.ok && data.authorized) {
        setIsAuthorized(true);
        setPartnerPassword('');
      } else {
        setPartnerError('Authorization failed.');
      }
    } catch {
      setPartnerError('Unable to reach verification endpoint.');
    }
  };

  useEffect(() => {
    const activeModuleEntry = MODULE_BY_INDEX.get(pageIndex);
    const notesCanonicalPath = activeModuleEntry ? activeModuleEntry.routePath : '/notes';
    const viewMeta = {
      notes: {
        title: activeModuleEntry ? activeModuleEntry.metaTitle : 'AML & KYC Study Notes — AMLDecode',
        desc: activeModuleEntry
          ? activeModuleEntry.metaDescription
          : 'Structured AML, KYC, CDD, EDD, sanctions screening, transaction monitoring, and SAR compliance notes.',
        path: notesCanonicalPath,
        crumbLabel: activeModuleEntry?.title || 'Syllabus Notes',
        indexable: !notFoundSlug,
      },
      'daily-challenge': {
        title: 'Daily AML Challenge, Transaction Monitoring & SAR Drills - AMLDecode',
        desc: 'Daily AML/KYC practice drills covering transaction monitoring alerts, sanctions red flags, and SAR/STR judgment.',
        path: '/?view=daily-challenge',
        crumbLabel: 'Daily AML Challenge',
        indexable: true,
      },
      quiz: {
        title: 'Smart Knowledge Test & Case Simulations - AMLDecode',
        desc: 'Practice AML/KYC assessments, compliance rationales, fictional case simulations, and SAR narrative drills.',
        path: '/?view=quiz',
        crumbLabel: 'Knowledge Test & Case Lab',
        indexable: true,
      },
      jobs: {
        title: 'AML & KYC Compliance Careers & Guidance - AMLDecode',
        desc: 'Explore AML, KYC, and financial crime compliance roles, interview guidance, and career resources.',
        path: '/?view=jobs',
        crumbLabel: 'AML & KYC Careers',
        indexable: true,
      },
      'skill-passport': {
        title: 'AML Skill Passport & Competency Breakdown - AMLDecode',
        desc: 'Review AML, KYC/CDD/EDD, sanctions screening, transaction monitoring, and SAR competency progress.',
        path: '/?view=skill-passport',
        crumbLabel: 'AML Skill Passport',
        indexable: false,
      },
      faq: {
        title: 'About AMLDecode & Frequently Asked Questions',
        desc: "Learn about AMLDecode's educational mission, compliance coverage, data handling, and career resources.",
        path: '/?view=faq',
        crumbLabel: 'FAQ',
        indexable: true,
      },
      contact: {
        title: 'Contact AMLDecode',
        desc: 'Reach AMLDecode for educational inquiries, profile assistance, or data deletion requests.',
        path: '/?view=contact',
        crumbLabel: 'Contact',
        indexable: true,
      },
      privacy: {
        title: 'Privacy Policy - AMLDecode',
        desc: 'How AMLDecode handles account data, Supabase storage, analytics, cookies, and privacy requests.',
        path: '/?view=privacy',
        crumbLabel: 'Privacy Policy',
        indexable: true,
      },
      terms: {
        title: 'Terms of Service & Educational Disclaimer - AMLDecode',
        desc: 'Terms of use, educational disclaimer for fictional scenarios, and non-guarantee of employment.',
        path: '/?view=terms',
        crumbLabel: 'Terms of Service',
        indexable: true,
      },
    };

    const current = viewMeta[activeView] || {
      title: 'AMLDecode - AML, KYC & Financial Crime Compliance Academy',
      desc: 'Practical AML, KYC, CDD, EDD, sanctions screening, transaction monitoring, and financial crime learning hub.',
      path: '/',
      crumbLabel: null,
      indexable: true,
    };

    const canonicalUrl = `https://amldecode.in${current.path}`;
    document.title = current.title;

    let metaDesc = document.querySelector('meta[name="description"]');
    if (!metaDesc) {
      metaDesc = document.createElement('meta');
      metaDesc.setAttribute('name', 'description');
      document.head.appendChild(metaDesc);
    }
    metaDesc.setAttribute('content', current.desc);

    let metaRobots = document.querySelector('meta[name="robots"]');
    if (!metaRobots) {
      metaRobots = document.createElement('meta');
      metaRobots.setAttribute('name', 'robots');
      document.head.appendChild(metaRobots);
    }
    metaRobots.setAttribute('content', current.indexable === false ? 'noindex, follow' : 'index, follow');

    const ogUpdates = [
      ['og:title', current.title],
      ['og:description', current.desc],
      ['og:url', canonicalUrl],
    ];
    for (const [prop, val] of ogUpdates) {
      let tag = document.querySelector(`meta[property="${prop}"]`);
      if (!tag) {
        tag = document.createElement('meta');
        tag.setAttribute('property', prop);
        document.head.appendChild(tag);
      }
      tag.setAttribute('content', val);
    }

    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      document.head.appendChild(canonical);
    }
    canonical.setAttribute('href', canonicalUrl);

    const breadcrumbId = 'amldecode-breadcrumb-ld';
    let breadcrumbScript = document.getElementById(breadcrumbId);
    if (current.crumbLabel) {
      const breadcrumbLd = {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            name: 'Home',
            item: 'https://amldecode.in/',
          },
          {
            '@type': 'ListItem',
            position: 2,
            name: current.crumbLabel,
            item: canonicalUrl,
          },
        ],
      };
      if (!breadcrumbScript) {
        breadcrumbScript = document.createElement('script');
        breadcrumbScript.id = breadcrumbId;
        breadcrumbScript.type = 'application/ld+json';
        document.head.appendChild(breadcrumbScript);
      }
      breadcrumbScript.textContent = JSON.stringify(breadcrumbLd);
    } else if (breadcrumbScript) {
      breadcrumbScript.remove();
    }
  }, [activeView, pageIndex]);

  const faqCategories = ['All', ...Array.from(new Set(faqData.map((f) => f.category).filter(Boolean)))];
  const filteredFaqs =
    faqCategory === 'All' ? faqData : faqData.filter((f) => f.category === faqCategory);

  if (!activeView) {
    return (
      <HomepageHub
        onOpenView={(view) => requestOpenView(view)}
        onSelectNoteIndex={(idx) => setPageIndex(idx)}
        onScrollToGuidance={handleScrollToGuidance}
        learner={learner}
        onAuthSuccess={(profile) => handleLoginSuccess(profile, null)}
        onSignOut={() => {
          setLearner(null);
          try { window.localStorage.removeItem('amldecode_kt2_learner_v1'); } catch {
          // Storage unavailable
        }
        }}
      />
    );
  }

  if (activeView === 'ai-interview') {
    return (
      <AiInterviewHub
        onBackHome={() => {
          setActiveView(null);
          if (window.location.pathname === '/ai-interview') {
            window.history.replaceState({}, '', '/');
          }
        }}
        onOpenModule={(idx) => {
          setPageIndex(idx);
          setActiveView('notes');
        }}
      />
    );
  }

  if (activeView === 'notes') {
    if (notFoundSlug) {
      return (
        <main className="min-h-screen bg-[#081524] text-[#F5F8FC] flex items-center justify-center px-6 py-16">
          <div className="max-w-xl w-full rounded-2xl border border-white/15 bg-white/5 p-8 space-y-4">
            <p className="text-xs uppercase tracking-wider text-cyan-300">404 — Learning Module Not Found</p>
            <h1 className="text-2xl font-bold">We could not find that AML/KYC module</h1>
            <p className="text-sm text-slate-300">
              The requested learning module URL (<code className="text-cyan-200">/notes/{notFoundSlug}</code>) does not match an active module in AMLDecode.
            </p>
            <div className="flex flex-wrap gap-3 pt-2">
              <a
                href="/notes"
                onClick={(e) => {
                  e.preventDefault();
                  setNotFoundSlug(null);
                  setPageIndex(0);
                  setActiveView('notes');
                  window.history.pushState({}, '', '/notes');
                }}
                className="px-4 py-2 rounded-lg bg-cyan-500 text-slate-950 font-semibold text-sm"
              >
                Browse All 34 Modules
              </a>
              <a
                href="/"
                onClick={(e) => {
                  e.preventDefault();
                  setNotFoundSlug(null);
                  setActiveView(null);
                  window.history.pushState({}, '', '/');
                }}
                className="px-4 py-2 rounded-lg border border-white/20 text-sm font-medium"
              >
                Back to Home
              </a>
            </div>
          </div>
        </main>
      );
    }
    return (
      <SyllabusReader
        notesContent={notesContent}
        pageIndex={pageIndex}
        onSelectModule={(idx) => {
          setNotFoundSlug(null);
          setPageIndex(idx);
          const entry = MODULE_BY_INDEX.get(idx);
          if (entry) {
            window.history.pushState({}, '', entry.routePath);
          }
        }}
        onBackHome={() => {
          setNotFoundSlug(null);
          handleBackHome();
          if (window.location.pathname.startsWith('/notes')) {
            window.history.pushState({}, '', '/');
          }
        }}
      />
    );
  }

  const viewBreadcrumbLabel =
    activeView === 'daily-challenge'
      ? 'Daily Challenge'
      : activeView === 'quiz'
      ? 'Knowledge Test'
      : activeView === 'jobs'
      ? 'Compliance Jobs'
      : activeView === 'network'
      ? 'Network & Briefings'
      : activeView === 'available'
      ? 'Available Referrals'
      : activeView === 'referralForm'
      ? 'Submit Referral'
      : activeView === 'contribute'
      ? 'Recruiter Desk'
      : activeView === 'faq'
      ? 'FAQ'
      : activeView === 'contact'
      ? 'Contact Us'
      : activeView === 'privacy'
      ? 'Privacy Policy'
      : activeView === 'skill-passport'
      ? 'Skill Certificate'
      : 'Terms of Service';
const adminEmailAllowlist = String(import.meta.env.VITE_ADMIN_EMAILS || '')
  .split(',')
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean);
const isCareersAdmin = Boolean(
  learner?.email && adminEmailAllowlist.includes(learner.email.trim().toLowerCase())
);

  return (
    <div className="amld-shell min-h-screen flex flex-col">
      <header className="sticky top-0 z-40 bg-[#081524]/95 backdrop-blur border-b border-[var(--amld-border)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between gap-4">
          <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-[#B8C7D9] truncate">
            <button type="button" onClick={handleBackHome} className="hover:text-[#C4A77D] font-semibold">
              Home
            </button>
            <span className="text-[#7E93AB]">/</span>
            <span className="text-[#F5F8FC] font-semibold truncate">{viewBreadcrumbLabel}</span>
          </nav>

          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <button
              type="button"
              onClick={() => setActiveView('referralForm')}
              className="text-xs font-semibold text-[#F4B860] hover:underline"
            >
              Submit Referral
            </button>
            <button
              type="button"
              onClick={() => setActiveView('contribute')}
              className="text-xs font-semibold text-[#F5F8FC] hover:text-[#C4A77D]"
            >
              Recruiter Desk
            </button>
            <button
              type="button"
              onClick={() => setActiveView('notes')}
              className="text-xs font-semibold text-[#C4A77D] hover:underline"
            >
              Syllabus Notes →
            </button>
          </div>
        </div>
      </header>

      <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        <Suspense fallback={<div className="py-12 text-center text-sm text-[#B8C7D9]">Loading view...</div>}>
        {activeView === 'skill-passport' && (
          <SkillPassportErrorBoundary>
            <SkillPassportView
            currentUser={learner}
            verifyToken={(() => {
              try {
                const m = (window.location.pathname || '').match(/^\/verify\/achievement\/([^/?#]+)/);
                return m?.[1] || new URLSearchParams(window.location.search).get('verify') || null;
              } catch {
                return null;
              }
            })()}
            onNavigateView={(nextView) => {
              if (nextView === 'skill-passport') {
                setActiveView('skill-passport');
              } else if (nextView) {
                setActiveView(nextView);
              } else {
                handleBackHome();
              }
            }}
          />
          </SkillPassportErrorBoundary>
        )}
                {activeView === 'daily-challenge' && (
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <DailyChallengeCard
              onOpenRelatedNote={(noteIdx) => {
                setPageIndex(noteIdx);
                setActiveView('notes');
              }}
              onOpenKnowledgeTest={() => setActiveView('quiz')}
            />
          </div>
        )}

        {activeView === 'quiz' && (
          <div className="space-y-10">
            {Array.isArray(activeSessionQuestions) && activeSessionQuestions.length > 0 ? (
              <AssessmentErrorBoundary onReset={() => setActiveSessionQuestions(null)}>
                {selectedMode === 'case' ? (
                  <CaseSimulationRunner
                    domain={selectedDomain}
                    difficulty={selectedDifficulty}
                    onExitToSetup={() => setActiveSessionQuestions(null)}
                    onAttemptRecorded={handleRecordAttemptWithSync}
                  />
                ) : selectedMode === 'sar' ? (
                  <SarNarrativeLab
                    domain={selectedDomain}
                    difficulty={selectedDifficulty}
                    onExitToSetup={() => setActiveSessionQuestions(null)}
                    onAttemptRecorded={handleRecordAttemptWithSync}
                  />
                ) : (
                  <AssessmentRunner
                    questions={activeSessionQuestions}
                    domain={selectedDomain}
                    difficulty={selectedDifficulty}
                    mode={selectedMode}
                    onExitToSetup={() => setActiveSessionQuestions(null)}
                    onAttemptRecorded={handleRecordAttemptWithSync}
                  />
                )}
              </AssessmentErrorBoundary>
            ) : (
              <>
              <KnowledgeTestSetup
                selectedDomain={selectedDomain}
                onSelectDomain={(domain) => {
                  setSelectedDomain(domain);
                }}
                selectedDifficulty={selectedDifficulty}
                onSelectDifficulty={setSelectedDifficulty}
                selectedCount={selectedCount}
                onSelectCount={setSelectedCount}
                selectedMode={selectedMode}
                onSelectMode={setSelectedMode}
                availableCount={testData.length}
                isLoading={isLoading}
                recentAttempts={recentAttempts}
                onStartAssessment={handleRequestStartAssessment}
              />
            </>
            )}
          </div>
        )}
        {(activeView === 'jobs' || activeView === 'network' || activeView === 'available') && (
          <div className="space-y-8">
            <div className="border-b border-[var(--amld-border)] pb-6 flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-[#F4B860]">Compliance Talent & Insights</p>
                {activeView !== 'jobs' && (
                  <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-[#F5F8FC] mt-1">
                    {activeView === 'network' ? 'Regulatory & Compliance Headlines' : 'Referral & Partner Desk'}
                  </h1>
                )}
              </div>
            </div>

            {activeView === 'network' ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {newsList.map((item, idx) => (
                  <div key={idx} className="p-6 rounded-2xl bg-[#0D1E30] border border-[var(--amld-border)] flex flex-col justify-between gap-4">
                    <h2 className="text-base font-bold text-[#F5F8FC]">{item.headline}</h2>
                    <a
                      href={item.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-semibold text-[#C4A77D] hover:underline"
                    >
                      Open source →
                    </a>
                  </div>
                ))}
              </div>
            ) : activeView === 'available' ? (
              <div className="p-6 sm:p-8 rounded-2xl bg-[#0D1E30] border border-[var(--amld-border)] space-y-4 max-w-2xl">
                <p className="text-sm text-[#B8C7D9]">
                  Submitted referral records: <strong className="text-[#C4A77D]">{submissions.length}</strong> · Partner files: <strong className="text-[#F4B860]">{partnerFiles.length}</strong>
                </p>
                <div className="flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={() => setActiveView('referralForm')}
                    className="amld-btn-primary px-4 py-2.5 rounded-xl text-xs font-bold"
                  >
                    Submit a Referral
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveView('contribute')}
                    className="px-4 py-2.5 rounded-xl text-xs font-semibold border border-[var(--amld-border)] text-[#F5F8FC]"
                  >
                    Open Recruiter Desk
                  </button>
                </div>
              </div>
            ) : (
              <CareersAiHub onOpenView={(v) => setActiveView(v)} isAdmin={isCareersAdmin} />
            )}
          </div>
        )}

        {activeView === 'referralForm' && (
          <div className="max-w-2xl mx-auto space-y-6">
            <div className="border-b border-[var(--amld-border)] pb-5">
              <p className="text-xs font-bold uppercase tracking-wider text-[#F4B860]">Network Intake</p>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-[#F5F8FC] mt-1">Submit Network Referral</h1>
            </div>
            <form onSubmit={handleReferralSubmit} className="p-6 sm:p-8 rounded-2xl bg-[#0D1E30] border border-[var(--amld-border)] space-y-4">
              <input
                type="text"
                required
                value={referralName}
                onChange={(e) => setReferralName(e.target.value)}
                placeholder="Full name"
                className="w-full px-4 py-3 rounded-xl bg-[#081524] border border-[var(--amld-border)] text-sm text-[#F5F8FC]"
              />
              <input
                type="email"
                required
                value={referralEmail}
                onChange={(e) => setReferralEmail(e.target.value)}
                placeholder="Email address"
                className="w-full px-4 py-3 rounded-xl bg-[#081524] border border-[var(--amld-border)] text-sm text-[#F5F8FC]"
              />
              <input
                type="text"
                required
                value={referralRole}
                onChange={(e) => setReferralRole(e.target.value)}
                placeholder="Target role (e.g., AML Analyst, KYC Specialist)"
                className="w-full px-4 py-3 rounded-xl bg-[#081524] border border-[var(--amld-border)] text-sm text-[#F5F8FC]"
              />
              <textarea
                rows={4}
                value={referralNotes}
                onChange={(e) => setReferralNotes(e.target.value)}
                placeholder="Experience or referral notes"
                className="w-full px-4 py-3 rounded-xl bg-[#081524] border border-[var(--amld-border)] text-sm text-[#F5F8FC]"
              />
              <button type="submit" className="amld-btn-primary px-6 py-3 rounded-xl text-xs font-bold uppercase tracking-wider">
                Submit Referral
              </button>
              {referralStatus && <p className="text-sm text-[#C4A77D]">{referralStatus}</p>}
            </form>
          </div>
        )}

        {activeView === 'contribute' && (
          <div className="max-w-xl mx-auto space-y-6">
            <div className="border-b border-[var(--amld-border)] pb-5">
              <p className="text-xs font-bold uppercase tracking-wider text-[#C4A77D]">Partner Portal</p>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-[#F5F8FC] mt-1">Recruiter Desk</h1>
            </div>
            {!isAuthorized ? (
              <form onSubmit={handleRecruiterAuth} className="p-6 sm:p-8 rounded-2xl bg-[#0D1E30] border border-[var(--amld-border)] space-y-4">
                <p className="text-sm text-[#B8C7D9]">Enter partner access credentials to verify access.</p>
                <input
                  type="password"
                  required
                  value={partnerPassword}
                  onChange={(e) => setPartnerPassword(e.target.value)}
                  placeholder="Access password"
                  className="w-full px-4 py-3 rounded-xl bg-[#081524] border border-[var(--amld-border)] text-sm text-[#F5F8FC]"
                />
                <button type="submit" className="amld-btn-amber px-6 py-3 rounded-xl text-xs font-bold uppercase tracking-wider">
                  Verify Access
                </button>
                {partnerError && <p className="text-sm text-red-400">{partnerError}</p>}
              </form>
            ) : (
              <div className="p-6 sm:p-8 rounded-2xl bg-[#0D1E30] border border-[#C4A77D]/40 space-y-3">
                <p className="text-base font-bold text-[#C4A77D]">Partner Access Verified</p>
                <p className="text-sm text-[#B8C7D9]">Submissions count: {submissions.length} · Partner files count: {partnerFiles.length}</p>
              </div>
            )}
          </div>
        )}

        {activeView === 'faq' && (
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="border-b border-[var(--amld-border)] pb-5 flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-[#C4A77D]">Platform Guide</p>
                <h1 className="text-3xl sm:text-4xl font-extrabold text-[#F5F8FC] mt-1">Frequently Asked Questions</h1>
              </div>
              <div className="flex flex-wrap gap-2">
                {faqCategories.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setFaqCategory(cat)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold border ${
                      faqCategory === cat
                        ? 'bg-[#C4A77D]/15 border-[#C4A77D] text-[#C4A77D]'
                        : 'bg-[#0D1E30] border-[var(--amld-border)] text-[#B8C7D9]'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-4">
              {filteredFaqs.map((faq, idx) => (
                <div key={idx} className="p-6 rounded-2xl bg-[#0D1E30] border border-[var(--amld-border)]">
                  <span className="text-xs font-semibold text-[#C4A77D]">{faq.category}</span>
                  <h2 className="text-base font-bold text-[#F5F8FC] mt-1">{faq.question}</h2>
                  <p className="text-sm text-[#B8C7D9] mt-2 leading-relaxed">{faq.answer}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeView === 'contact' && (
          <div className="max-w-3xl mx-auto space-y-6">
            <div className="border-b border-[var(--amld-border)] pb-5">
              <p className="text-xs font-bold uppercase tracking-wider text-[#C4A77D]">Support & Inquiries</p>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-[#F5F8FC] mt-1">{contactContent.title}</h1>
            </div>
            <div className="p-6 sm:p-8 rounded-2xl bg-[#0D1E30] border border-[var(--amld-border)] text-sm sm:text-base text-[#B8C7D9] leading-relaxed whitespace-pre-line">
              {contactContent.body}
            </div>
          </div>
        )}

        {activeView === 'privacy' && (
          <div className="max-w-3xl mx-auto space-y-6">
            <div className="border-b border-[var(--amld-border)] pb-5">
              <p className="text-xs font-bold uppercase tracking-wider text-[#F4B860]">Data Governance</p>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-[#F5F8FC] mt-1">{privacyPolicy.title}</h1>
            </div>
            <div className="p-6 sm:p-8 rounded-2xl bg-[#0D1E30] border border-[var(--amld-border)] text-sm sm:text-base text-[#B8C7D9] leading-relaxed whitespace-pre-line">
              {privacyPolicy.content}
            </div>
          </div>
        )}

        {activeView === 'terms' && (
          <div className="max-w-3xl mx-auto space-y-6">
            <div className="border-b border-[var(--amld-border)] pb-5">
              <p className="text-xs font-bold uppercase tracking-wider text-[#F4B860]">Platform Terms</p>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-[#F5F8FC] mt-1">{termsOfService.title}</h1>
            </div>
            <div className="p-6 sm:p-8 rounded-2xl bg-[#0D1E30] border border-[var(--amld-border)] text-sm sm:text-base text-[#B8C7D9] leading-relaxed whitespace-pre-line">
              {termsOfService.content}
            </div>
          </div>
        )}
            <LearnerLoginModal
        isOpen={isLoginModalOpen}
        pendingConfig={pendingStartConfig}
        pendingView={pendingViewAfterLogin}
        initialLearner={learner}
        onClose={() => {
          setIsLoginModalOpen(false);
          setPendingStartConfig(null);
          setPendingViewAfterLogin(null);
        }}
        onLoginSuccess={handleLoginSuccess}
      />
        </Suspense>
      </main>
    </div>
  );
}














