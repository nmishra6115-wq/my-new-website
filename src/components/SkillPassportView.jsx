import { useEffect, useMemo, useRef, useState } from 'react';
import {
  SKILL_CATEGORIES,
  BADGE_CATALOG,
  computeOverallSkillScore,
  getLevelMeta,
  loadPassportState,
  savePassportState,
  buildRecommendations,
  buildLinkedInShareText,
  generateVerificationToken,
  createEmptyPassportState,
} from '../data/amlSkillPassportEngine';

export default function SkillPassportView({
  currentUser = null,
  onNavigateView = null,
  verifyToken = null,
}) {
  const [passport, setPassport] = useState(() => loadPassportState(currentUser));
  const [selectedBadgeCode, setSelectedBadgeCode] = useState(() => {
    const loaded = loadPassportState(currentUser);
    return loaded.earnedBadges?.[0]?.badgeCode || BADGE_CATALOG[0].badgeCode;
  });
  const [statusNotice, setStatusNotice] = useState('');
  const canvasRef = useRef(null);
  const [referenceNowMs] = useState(() => Date.now());

  useEffect(() => {
    const syncPassportFromStorage = () => {
      const fresh = loadPassportState(currentUser);
      setPassport(fresh);
      setSelectedBadgeCode((prev) => {
        if (prev && (BADGE_CATALOG.some((b) => b.badgeCode === prev) || (fresh.earnedBadges || []).some((b) => b.badgeCode === prev))) {
          return prev;
        }
        return fresh.earnedBadges?.[0]?.badgeCode || BADGE_CATALOG[0].badgeCode;
      });
    };

    const handlePassportUpdated = (event) => {
      const nextState = event?.detail?.state || loadPassportState(currentUser);
      setPassport(nextState);
      const unlockedCode = event?.detail?.newBadges?.[0]?.badgeCode;
      if (unlockedCode) {
        setSelectedBadgeCode(unlockedCode);
      }
      if (event?.detail?.newBadges?.length) {
        notify(`Unlocked new badge: ${event.detail.newBadges[0].name || unlockedCode}`);
      }
    };

    syncPassportFromStorage();

    if (typeof window !== 'undefined') {
      window.addEventListener('amldecode:passport-updated', handlePassportUpdated);
      window.addEventListener('storage', syncPassportFromStorage);
    }

    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('amldecode:passport-updated', handlePassportUpdated);
        window.removeEventListener('storage', syncPassportFromStorage);
      }
    };
  }, [currentUser]);



  const overallScore = useMemo(() => computeOverallSkillScore(passport.categories), [passport.categories]);
  const levelMeta = useMemo(() => getLevelMeta(passport.stats?.totalXp || 0), [passport.stats?.totalXp]);
  const recommendations = useMemo(() => {
    if (passport.recommendationsCache?.items?.length) return passport.recommendationsCache.items;
    return buildRecommendations(passport.categories, passport.events || []);
  }, [passport.recommendationsCache, passport.categories, passport.events]);

  const accuracyPercent = useMemo(() => {
    const q = Number(passport.stats?.totalScoredQuestions || 0);
    const c = Number(passport.stats?.totalCorrectAnswers || 0);
    if (!q) return 0;
    return Math.round((c / q) * 1000) / 10;
  }, [passport.stats]);

  const activitySummary = useMemo(() => {
    const events = passport.events || [];
    const nowMs = referenceNowMs;
    const sevenDaysMs = 7 * 86400000;
    const thirtyDaysMs = 30 * 86400000;
    let weeklyCount = 0;
    let monthlyCount = 0;
    for (const ev of events) {
      const t = Date.parse(ev.createdAt || '') || Date.parse((ev.occurredIstDate || '') + 'T00:00:00Z') || 0;
      if (t > 0 && nowMs - t <= sevenDaysMs) weeklyCount += 1;
      if (t > 0 && nowMs - t <= thirtyDaysMs) monthlyCount += 1;
    }
    return { weeklyCount, monthlyCount, totalEvents: events.length };
  }, [passport.events, referenceNowMs]);

  const activeBadgeObj = useMemo(() => {
    const earned = (passport.earnedBadges || []).find((b) => b.badgeCode === selectedBadgeCode);
    if (earned) return { ...earned, isEarned: true };
    const catalogItem = BADGE_CATALOG.find((b) => b.badgeCode === selectedBadgeCode) || BADGE_CATALOG[0];
    return { ...catalogItem, isEarned: false, awardedDate: null, revoked: false };
  }, [passport.earnedBadges, selectedBadgeCode]);

  const activeShareRecord = useMemo(() => {
    return passport.publicShares?.[activeBadgeObj.badgeCode] || null;
  }, [passport.publicShares, activeBadgeObj.badgeCode]);

  const activeVerifyUrl = useMemo(() => {
    if (!activeShareRecord || !activeShareRecord.isPublic || activeShareRecord.revokedAt) return '';
    const origin = typeof window !== 'undefined' && window.location?.origin ? window.location.origin : 'https://amldecode.in';
    return origin + '/verify/achievement/' + activeShareRecord.publicToken;
  }, [activeShareRecord]);

  function notify(msg) {
    setStatusNotice(msg);
  }

  function handleProfileUpdate(patch) {
    setPassport((prev) => {
      const next = {
        ...prev,
        profile: { ...prev.profile, ...patch },
      };
      savePassportState(next);
      return next;
    });
    notify('Skill Certificate profile preferences saved.');
  }

  function handleEnablePublicShare(badgeCode) {
    if (!activeBadgeObj.isEarned) {
      notify('Complete this milestone first to unlock achievement card download, sharing, and verification.');
      return;
    }
    const displayName = ((passport.profile?.displayName && passport.profile.displayName !== 'AMLDecode Learner' ? passport.profile.displayName : (currentUser?.name ? String(currentUser.name).trim() : 'AMLDecode Learner'))).trim() || 'AMLDecode Learner';
    setPassport((prev) => {
      const existing = prev.publicShares?.[badgeCode];
      const token = existing?.publicToken || generateVerificationToken();
      const next = {
        ...prev,
        publicShares: {
          ...(prev.publicShares || {}),
          [badgeCode]: {
            badgeCode,
            publicToken: token,
            publicDisplayName: displayName,
            isPublic: true,
            revokedAt: null,
            updatedAt: new Date().toISOString(),
          },
        },
      };
      savePassportState(next);
      return next;
    });
    notify('Public verification link enabled for this achievement.');
  }

  function handleRevokePublicShare(badgeCode) {
    setPassport((prev) => {
      const existing = prev.publicShares?.[badgeCode];
      if (!existing) return prev;
      const next = {
        ...prev,
        publicShares: {
          ...(prev.publicShares || {}),
          [badgeCode]: {
            ...existing,
            isPublic: false,
            revokedAt: new Date().toISOString(),
          },
        },
      };
      savePassportState(next);
      return next;
    });
    notify('Public verification link revoked; achievement details are private again.');
  }

  async function handleCopyLinkedInText() {
    if (!activeBadgeObj.isEarned) {
      notify('Complete this milestone first to unlock achievement card download, sharing, and verification.');
      return;
    }
    const text = buildLinkedInShareText(activeBadgeObj, passport.profile?.displayName, activeVerifyUrl);
    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
        notify('LinkedIn post text copied to clipboard.');
        return;
      }
    } catch {
      // Fallback below
    }
    notify('Ready to copy: ' + text.slice(0, 90) + '...');
  }

  async function handleCopyVerifyLink() {
    if (!activeVerifyUrl) {
      notify('Enable public verification for this achievement first to generate a shareable link.');
      return;
    }
    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(activeVerifyUrl);
        notify('Public verification link copied to clipboard.');
        return;
      }
    } catch {
      // Fallback
    }
    notify('Verification URL: ' + activeVerifyUrl);
  }

  function handleOpenLinkedIn() {
    if (!activeBadgeObj.isEarned) {
      notify('Complete this milestone first to unlock achievement card download, sharing, and verification.');
      return;
    }
    const targetUrl = activeVerifyUrl || 'https://amldecode.in/skill-passport';
    const shareUrl = 'https://www.linkedin.com/sharing/share-offsite/?url=' + encodeURIComponent(targetUrl);
    if (typeof window !== 'undefined') {
      window.open(shareUrl, '_blank', 'noopener,noreferrer');
    }
    notify('Opened LinkedIn sharing dialog. Paste your copied post text if desired.');
  }

  function handleDownloadPngCard() {
    if (!activeBadgeObj.isEarned) {
      notify('Complete this milestone first to unlock achievement card download, sharing, and verification.');
      return;
    }
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = 960;
    const h = 500;
    canvas.width = w;
    canvas.height = h;

    ctx.fillStyle = '#0b1220';
    ctx.fillRect(0, 0, w, h);

    ctx.strokeStyle = '#2563eb';
    ctx.lineWidth = 3;
    ctx.strokeRect(20, 20, w - 40, h - 40);

    ctx.fillStyle = '#60a5fa';
    ctx.font = 'bold 20px sans-serif';
    ctx.fillText('AMLDECODE SKILL CERTIFICATE', 56, 72);

    ctx.fillStyle = '#94a3b8';
    ctx.font = '15px sans-serif';
    ctx.fillText('Educational Platform Achievement (Not a Professional License or Accreditation)', 56, 100);

    ctx.fillStyle = '#f8fafc';
    ctx.font = 'bold 34px sans-serif';
    ctx.fillText(String(activeBadgeObj.name || 'AMLDecode Achievement'), 56, 185);

    ctx.fillStyle = '#cbd5e1';
    ctx.font = '20px sans-serif';
    const learner = ((passport.profile?.displayName && passport.profile.displayName !== 'AMLDecode Learner' ? passport.profile.displayName : (currentUser?.name ? String(currentUser.name).trim() : 'AMLDecode Learner'))).trim();
    ctx.fillText('Learner: ' + learner, 56, 240);

    const dateLabel = activeBadgeObj.awardedDate ? 'Earned: ' + activeBadgeObj.awardedDate + ' (IST)' : 'Status: In Progress / Milestone Target';
    ctx.fillStyle = '#93c5fd';
    ctx.font = '18px sans-serif';
    ctx.fillText(dateLabel, 56, 280);

    ctx.fillStyle = '#e2e8f0';
    ctx.font = '17px sans-serif';
    const criteriaText = 'Criteria: ' + String(activeBadgeObj.criteriaSummary || activeBadgeObj.description || '');
    ctx.fillText(criteriaText.slice(0, 92), 56, 330);
    if (criteriaText.length > 92) {
      ctx.fillText(criteriaText.slice(92, 184), 56, 356);
    }

    if (activeVerifyUrl) {
      ctx.fillStyle = '#38bdf8';
      ctx.font = '15px sans-serif';
      ctx.fillText('Verify: ' + activeVerifyUrl.slice(0, 95), 56, 412);
    }

    ctx.fillStyle = '#64748b';
    ctx.font = '14px sans-serif';
    ctx.fillText('amldecode.in', 56, 448);

    try {
      const dataUrl = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = 'amldecode-' + (activeBadgeObj.badgeCode || 'achievement') + '.png';
      link.href = dataUrl;
      link.click();
      notify('Downloaded PNG achievement card.');
    } catch {
      notify('Unable to export PNG card in this browser context.');
    }
  }

  function handleExportJson() {
    try {
      const payload = JSON.stringify({ exportedAt: new Date().toISOString(), passport }, null, 2);
      const blob = new Blob([payload], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'amldecode-skill-passport.json';
      a.click();
      URL.revokeObjectURL(url);
      notify('Exported your Skill Certificate data as JSON.');
    } catch {
      notify('Could not export passport JSON.');
    }
  }

  function handleResetLocalPassport() {
    const fresh = createEmptyPassportState(currentUser);
    savePassportState(fresh);
    setPassport(fresh);
    notify('Cleared local Skill Certificate records.');
  }

  if (verifyToken) {
    const matchedShare = Object.values(passport.publicShares || {}).find((s) => s.publicToken === verifyToken);
    const isActivePublic = Boolean(matchedShare && matchedShare.isPublic && !matchedShare.revokedAt);
    const badgeMeta = matchedShare
      ? (passport.earnedBadges || []).find((b) => b.badgeCode === matchedShare.badgeCode) || BADGE_CATALOG.find((c) => c.badgeCode === matchedShare.badgeCode)
      : null;

    return (
      <section className="max-w-3xl mx-auto px-4 py-8 text-slate-100">
        <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-6 shadow-lg">
          <p className="text-xs uppercase tracking-wider text-blue-400 font-semibold">AMLDecode Achievement Verification</p>
          <h1 className="text-2xl font-bold mt-1 text-white">
            {isActivePublic && badgeMeta ? badgeMeta.name : 'Verification Link Unavailable or Revoked'}
          </h1>
          {isActivePublic && badgeMeta ? (
            <div className="mt-4 space-y-2 text-sm text-slate-300">
              <p><strong className="text-white">Issuer:</strong> AMLDecode (Educational Platform Achievement)</p>
              <p><strong className="text-white">Learner Display Name:</strong> {matchedShare.publicDisplayName}</p>
              <p><strong className="text-white">Criteria Met:</strong> {badgeMeta.criteriaSummary || badgeMeta.description}</p>
              <p><strong className="text-white">Status:</strong> Verified AMLDecode Learning Milestone</p>
              <p className="text-xs text-slate-400 pt-2">
                Educational platform milestone only; not a professional license, regulatory certification, or employment guarantee.
              </p>
            </div>
          ) : (
            <p className="mt-3 text-sm text-slate-400">
              This verification token is not active, has been revoked by the owner, or is private.
            </p>
          )}
          {onNavigateView && (
            <button
              type="button"
              onClick={() => onNavigateView('skill-passport')}
              className="mt-6 inline-flex items-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-500"
            >
              Open Skill Certificate
            </button>
          )}
        </div>
      </section>
    );
  }

  const earnedSet = new Set((passport.earnedBadges || []).map((b) => b.badgeCode));

  return (
    <section aria-label="AMLDecode Skill Certificate" className="max-w-6xl mx-auto px-4 py-8 text-slate-900 dark:text-slate-100 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white" style={{ color: "#0f172a" }}>AMLDecode Skill Certificate</h1>
          <p className="text-sm sm:text-base text-slate-700 dark:text-slate-300 mt-1" style={{ color: "#334155" }}>
            Track your AML knowledge, build practical skills and showcase your learning achievements.
          </p>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1.5" style={{ color: "#475569" }}>
            Educational learning indicator based on completed AMLDecode activities. Not a professional license, accredited certification, or hiring predictor.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleExportJson}
            className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-xs font-medium text-slate-200 hover:bg-slate-800"
          >
            Export JSON
          </button>
          <button
            type="button"
            onClick={handleResetLocalPassport}
            className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-xs font-medium text-slate-300 hover:bg-slate-800"
          >
            Reset Local Data
          </button>
        </div>
      </div>

      {statusNotice && (
        <div role="status" className="rounded-xl border border-blue-500/40 bg-blue-950/40 px-4 py-2.5 text-xs sm:text-sm text-blue-200">
          {statusNotice}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 rounded-2xl border border-slate-800 bg-slate-900/80 p-5 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <span className="text-xs uppercase tracking-wider text-blue-400 font-semibold">
                Level {levelMeta.level} · {levelMeta.title}
              </span>
              <h2 className="text-xl font-bold text-white mt-0.5">
                {(passport.profile?.displayName && passport.profile.displayName !== 'AMLDecode Learner' ? passport.profile.displayName : (currentUser?.name ? String(currentUser.name).trim() : 'AMLDecode Learner'))}
              </h2>
              <p className="text-xs text-slate-400">
                Member since {passport.profile?.memberSince || 'IST'} · Privacy: {passport.profile?.isPublic ? 'Opt-in Public Sharing Active' : 'Private by Default'}
              </p>
            </div>
            <div className="text-right">
              <div className="text-xs text-slate-400">AML Skill Intelligence Score</div>
              <div className="text-3xl font-bold text-blue-400">{overallScore}<span className="text-base text-slate-400">/100</span></div>
              <div className="text-[11px] text-slate-400">Educational indicator</div>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
            <div className="rounded-xl bg-slate-950/70 border border-slate-800 p-3">
              <div className="text-xs text-slate-400">Total XP</div>
              <div className="text-lg font-bold text-white mt-0.5">{Number(passport.stats?.totalXp || 0)}</div>
            </div>
            <div className="rounded-xl bg-slate-950/70 border border-slate-800 p-3">
              <div className="text-xs text-slate-400">Completed</div>
              <div className="text-lg font-bold text-white mt-0.5">{Number(passport.stats?.assessmentsCompleted || 0)}</div>
            </div>
            <div className="rounded-xl bg-slate-950/70 border border-slate-800 p-3">
              <div className="text-xs text-slate-400">Accuracy</div>
              <div className="text-lg font-bold text-white mt-0.5">{accuracyPercent}%</div>
            </div>
            <div className="rounded-xl bg-slate-950/70 border border-slate-800 p-3">
              <div className="text-xs text-slate-400">IST Streak</div>
              <div className="text-lg font-bold text-white mt-0.5">{Number(passport.stats?.currentStreakDays || 0)}d</div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-800/80">
            <label className="block text-xs text-slate-300">
              Public Display Name
              <input
                type="text"
                maxLength={40}
                value={(passport.profile?.displayName && passport.profile.displayName !== 'AMLDecode Learner' ? passport.profile.displayName : (currentUser?.name ? String(currentUser.name).trim() : 'AMLDecode Learner'))}
                onChange={(e) => handleProfileUpdate({ displayName: e.target.value })}
                className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white"
              />
            </label>
            <div className="flex flex-col justify-end">
              <label className="inline-flex items-center gap-2 text-xs text-slate-300 cursor-pointer select-none py-2">
                <input
                  type="checkbox"
                  checked={Boolean(passport.profile?.isPublic)}
                  onChange={(e) => handleProfileUpdate({ isPublic: e.target.checked })}
                  className="rounded border-slate-600"
                />
                Allow public achievement share links (private by default)
              </label>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 flex flex-col justify-between space-y-4">
          <div>
            <h2 className="text-base font-bold text-white">Recommended Next Steps</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              7d activities: {activitySummary.weeklyCount} · 30d activities: {activitySummary.monthlyCount} · Badges earned: {(passport.earnedBadges || []).length}/{BADGE_CATALOG.length}
            </p>
            <div className="mt-3 space-y-2.5">
              {recommendations.map((rec) => (
                <div key={rec.id} className="rounded-xl border border-slate-800 bg-slate-950/70 p-3">
                  <div className="text-xs font-semibold text-white">{rec.title}</div>
                  <div className="text-[11px] text-slate-400 mt-0.5">{rec.reason}</div>
                  {onNavigateView && (
                    <button
                      type="button"
                      onClick={() => onNavigateView(rec.targetView)}
                      className="mt-2 text-xs font-medium text-blue-400 hover:text-blue-300"
                    >
                      {rec.ctaLabel} →
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
          <div>
            <h2 className="text-lg font-bold text-white">8-Category Skill Breakdown</h2>
            <p className="text-xs text-slate-400">
              Scores reflect verified completed activities (0–100 educational learning indicator).
            </p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {SKILL_CATEGORIES.map((cat) => {
            const item = passport.categories?.[cat.key] || { score: 0, activitiesCount: 0, questionsCount: 0, correctCount: 0 };
            const pct = Math.min(100, Math.max(0, Math.round(Number(item.score || 0))));
            return (
              <div key={cat.key} className="rounded-xl border border-slate-800 bg-slate-950/60 p-3.5">
                <div className="flex items-center justify-between text-xs font-medium">
                  <span className="text-white font-semibold">{cat.label}</span>
                  <span className="text-blue-300">{pct}/100 ({item.activitiesCount} runs)</span>
                </div>
                <div className="mt-2 h-2 w-full rounded-full bg-slate-800 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-blue-500 transition-all duration-300"
                    style={{ width: pct + '%' }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 rounded-2xl border border-slate-800 bg-slate-900/80 p-5">
          <h2 className="text-lg font-bold text-white">Achievement Badges</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Earned automatically from verified learning milestones. Select a badge to preview sharing or verification options.
          </p>
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
            {BADGE_CATALOG.map((badge) => {
              const isEarned = earnedSet.has(badge.badgeCode);
              const isSelected = activeBadgeObj.badgeCode === badge.badgeCode;
              return (
                <button
                  key={badge.badgeCode}
                  type="button"
                  onClick={() => setSelectedBadgeCode(badge.badgeCode)}
                  className={
                    'text-left rounded-xl border p-3.5 transition ' +
                    (isSelected
                      ? 'border-blue-500 bg-blue-950/30'
                      : 'border-slate-800 bg-slate-950/60 hover:border-slate-700')
                  }
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-semibold text-white">{badge.name}</span>
                    <span className={
                      'text-[11px] px-2 py-0.5 rounded-full font-medium ' +
                      (isEarned ? 'bg-emerald-500/20 text-emerald-300' : 'bg-slate-800 text-slate-400')
                    }>
                      {isEarned ? 'Earned' : 'Locked'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">{badge.criteriaSummary}</p>
                </button>
              );
            })}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 space-y-3">
          <h2 className="text-base font-bold text-white">LinkedIn & Verification Sharing</h2>
          <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-3.5 space-y-1.5">
            <div className="text-xs uppercase tracking-wider text-blue-400 font-semibold">Selected Achievement</div>
            <div className="text-sm font-bold text-white">{activeBadgeObj.name}</div>
            <p className="text-xs text-slate-400">{activeBadgeObj.description}</p>
            <p className="text-[11px] text-slate-500">
              {activeBadgeObj.isEarned
                ? 'Earned on ' + (activeBadgeObj.awardedDate || 'IST') + ' · AMLDecode Educational Achievement'
                : 'Milestone not yet unlocked on your passport'}
            </p>
          </div>

          <div className="flex flex-col gap-2">
            {!activeBadgeObj.isEarned && (
              <p className="rounded-lg border border-amber-500/30 bg-amber-950/25 px-3 py-2 text-[11px] text-amber-200">
                Locked badge: complete the milestone criteria to download the PNG card, share on LinkedIn, or generate a verification link.
              </p>
            )}
            <button
              type="button"
              disabled={!activeBadgeObj.isEarned}
              onClick={handleDownloadPngCard}
              className="w-full rounded-lg bg-blue-600 px-3.5 py-2 text-xs font-semibold text-white hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-blue-600"
            >
              Download Achievement Card (PNG)
            </button>
            <button
              type="button"
              disabled={!activeBadgeObj.isEarned}
              onClick={handleCopyLinkedInText}
              className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3.5 py-2 text-xs font-medium text-slate-100 hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-slate-950"
            >
              Copy LinkedIn Post Text
            </button>
            <button
              type="button"
              disabled={!activeBadgeObj.isEarned}
              onClick={handleOpenLinkedIn}
              className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3.5 py-2 text-xs font-medium text-slate-100 hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-slate-950"
            >
              Open LinkedIn Share Dialog
            </button>
            {!activeVerifyUrl ? (
              <button
                type="button"
                disabled={!activeBadgeObj.isEarned}
                onClick={() => handleEnablePublicShare(activeBadgeObj.badgeCode)}
                className="w-full rounded-lg border border-blue-500/50 bg-blue-950/30 px-3.5 py-2 text-xs font-medium text-blue-200 hover:bg-blue-950/50 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-blue-950/30"
              >
                Generate Public Verification Link
              </button>
            ) : (
              <div className="space-y-2 pt-1">
                <button
                  type="button"
                  onClick={handleCopyVerifyLink}
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3.5 py-2 text-xs font-medium text-slate-200 hover:bg-slate-800"
                >
                  Copy Public Verification Link
                </button>
                <button
                  type="button"
                  onClick={() => handleRevokePublicShare(activeBadgeObj.badgeCode)}
                  className="w-full rounded-lg border border-rose-500/40 bg-rose-950/30 px-3.5 py-2 text-xs font-medium text-rose-200 hover:bg-rose-950/50"
                >
                  Revoke Public Link
                </button>
              </div>
            )}
          </div>

          <canvas ref={canvasRef} className="hidden" aria-hidden="true" />
        </div>
      </div>
    </section>
  );
}
