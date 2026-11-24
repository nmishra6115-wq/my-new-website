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

  function getBadgePracticeTarget(badge) {
    const rule = badge?.rule;
    if (!rule) return { targetView: 'quiz', label: 'Practice Quiz' };

    if (rule.type === 'category_accuracy') {
      const catMeta = SKILL_CATEGORIES.find((c) => c.key === rule.categoryKey);
      const view = catMeta?.routeView || 'quiz';
      return {
        targetView: view,
        label: view === 'notes' ? 'Open Notes' : view === 'daily-challenge' ? 'Daily Challenge' : 'Practice Quiz',
      };
    }

    if (rule.type === 'feature_count' || rule.type === 'feature_avg') {
      if (rule.sourceFeature === 'ai_interview') {
        return { targetView: 'ai-interview', label: 'Start AI Interview' };
      }
      if (rule.sourceFeature === 'transaction_investigation' || rule.sourceFeature === 'sar_practice') {
        return { targetView: 'daily-challenge', label: 'Open Case Practice' };
      }
      return { targetView: 'quiz', label: 'Practice Now' };
    }

    if (rule.type === 'streak_days') {
      return { targetView: 'daily-challenge', label: 'Daily Challenge' };
    }

    if (rule.type === 'overall_questions') {
      return { targetView: 'quiz', label: 'Practice Questions' };
    }

    if (rule.type === 'passport_score') {
      return { targetView: 'daily-challenge', label: 'Boost Skill Score' };
    }

    return { targetView: 'quiz', label: 'Practice Now' };
  }

  const activeBadgeObj = useMemo(() => {
    const earned = (passport.earnedBadges || []).find((b) => b.badgeCode === selectedBadgeCode);
    if (earned) return { ...earned, isEarned: true };
    const catalogItem = BADGE_CATALOG.find((b) => b.badgeCode === selectedBadgeCode) || BADGE_CATALOG[0];
    return { ...catalogItem, isEarned: false, awardedDate: null, revoked: false };
  }, [passport.earnedBadges, selectedBadgeCode]);

  function getBadgeProgress(badge) {
    const rule = badge?.rule;
    if (!rule) return { current: 0, target: 1, percent: 0, label: '0% complete' };

    if (rule.type === 'category_accuracy') {
      const cat = passport.categories?.[rule.categoryKey] || {};
      const qCount = Number(cat.questionsCount || 0);
      const cCount = Number(cat.correctCount || 0);
      const target = Math.max(1, Number(rule.minQuestions || 1));
      const minAcc = Number(rule.minAccuracy || 80);
      const acc = qCount > 0 ? Math.round((cCount / qCount) * 100) : 0;
      const countRatio = Math.min(1, qCount / target);
      const accRatio = qCount > 0 ? Math.min(1, acc / Math.max(1, minAcc)) : 0;
      const meetsBoth = qCount >= target && acc >= minAcc;
      const pct = meetsBoth ? 100 : Math.min(99, Math.round(((countRatio * 0.7) + (accRatio * 0.3)) * 100));
      return {
        current: Math.min(qCount, target),
        target,
        percent: pct,
        label: `${Math.min(qCount, target)}/${target} questions (${acc}% acc · need ${minAcc}%)`,
      };
    }

    if (rule.type === 'feature_count') {
      const count = (passport.events || []).filter((ev) => ev.sourceFeature === rule.sourceFeature).length;
      const target = Math.max(1, Number(rule.minCount || 1));
      const pct = Math.min(100, Math.round((count / target) * 100));
      return {
        current: Math.min(count, target),
        target,
        percent: pct,
        label: `${Math.min(count, target)}/${target} completed`,
      };
    }

    if (rule.type === 'feature_avg') {
      const matching = (passport.events || []).filter((ev) => ev.sourceFeature === rule.sourceFeature);
      const count = matching.length;
      const target = Math.max(1, Number(rule.minCount || 1));
      const avg = count > 0
        ? Math.round(matching.reduce((sum, ev) => sum + Number(ev.scorePercent || 0), 0) / count)
        : 0;
      const pct = Math.min(100, Math.round((count / target) * 100));
      return {
        current: Math.min(count, target),
        target,
        percent: pct,
        label: `${Math.min(count, target)}/${target} runs (${avg}% avg · need ${rule.minAvgScore || 80}%)`,
      };
    }

    if (rule.type === 'streak_days') {
      const streak = Number(passport.stats?.currentStreakDays || 0);
      const target = Math.max(1, Number(rule.days || 1));
      const pct = Math.min(100, Math.round((streak / target) * 100));
      return {
        current: Math.min(streak, target),
        target,
        percent: pct,
        label: `${Math.min(streak, target)}/${target} IST days`,
      };
    }

    if (rule.type === 'overall_questions') {
      const qCount = Number(passport.stats?.totalScoredQuestions || 0);
      const cCount = Number(passport.stats?.totalCorrectAnswers || 0);
      const target = Math.max(1, Number(rule.minQuestions || 1));
      const acc = qCount > 0 ? Math.round((cCount / qCount) * 100) : 0;
      const pct = Math.min(100, Math.round((qCount / target) * 100));
      return {
        current: Math.min(qCount, target),
        target,
        percent: pct,
        label: `${Math.min(qCount, target)}/${target} questions (${acc}% acc · need ${rule.minAccuracy || 85}%)`,
      };
    }

    if (rule.type === 'passport_score') {
      const targetAct = Math.max(1, Number(rule.minActivities || 1));
      const actCount = Number(passport.stats?.assessmentsCompleted || 0);
      const scorePct = Math.min(100, Math.round((overallScore / Math.max(1, Number(rule.minScore || 80))) * 100));
      const actPct = Math.min(100, Math.round((actCount / targetAct) * 100));
      const pct = Math.min(scorePct, actPct);
      return {
        current: Math.min(actCount, targetAct),
        target: targetAct,
        percent: pct,
        label: `Score ${overallScore}/${rule.minScore || 80} · ${Math.min(actCount, targetAct)}/${targetAct} activities`,
      };
    }

    return { current: 0, target: 1, percent: 0, label: '0% complete' };
  }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const activeBadgeProgress = useMemo(() => getBadgeProgress(activeBadgeObj), [activeBadgeObj, passport, overallScore]);


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

  function drawWrappedCanvasText(ctx, text, x, y, maxWidth, lineHeight, maxLines = 3) {
    const words = String(text || '').split(/s+/).filter(Boolean);
    if (!words.length) return y;
    const lines = [];
    let current = words[0];

    for (let i = 1; i < words.length; i += 1) {
      const test = current + ' ' + words[i];
      if (ctx.measureText(test).width <= maxWidth) {
        current = test;
      } else {
        lines.push(current);
        current = words[i];
        if (lines.length === maxLines) break;
      }
    }
    if (lines.length < maxLines && current) {
      lines.push(current);
    }

    lines.forEach((line, idx) => {
      let out = line;
      if (idx === maxLines - 1 && words.length > 0 && ctx.measureText(out).width > maxWidth) {
        while (out.length > 3 && ctx.measureText(out + '...').width > maxWidth) {
          out = out.slice(0, -1);
        }
        out += '...';
      }
      ctx.fillText(out, x, y + idx * lineHeight);
    });

    return y + lines.length * lineHeight;
  }

  function handleDownloadPngCard() {
    if (!activeBadgeObj.isEarned) {
      notify('Complete this milestone first to unlock achievement card download, sharing, and verification.');
      return;
    }
    const canvas = canvasRef.current || (typeof document !== 'undefined' ? document.createElement('canvas') : null);
    if (!canvas) {
      notify('Unable to initialize certificate canvas in this browser.');
      return;
    }
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      notify('Unable to create 2D drawing context for PNG export.');
      return;
    }

    const w = 1200;
    const h = 675;
    canvas.width = w;
    canvas.height = h;

    // Deep midnight navy & slate background gradient
    const bgGrad = ctx.createLinearGradient(0, 0, w, h);
    bgGrad.addColorStop(0, '#070e1c');
    bgGrad.addColorStop(0.55, '#0c182e');
    bgGrad.addColorStop(1, '#081122');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, w, h);

    // Subtle radial spotlight behind certificate center
    const glow = ctx.createRadialGradient(w * 0.42, h * 0.45, 30, w * 0.42, h * 0.45, 520);
    glow.addColorStop(0, 'rgba(196, 167, 125, 0.11)');
    glow.addColorStop(0.6, 'rgba(37, 99, 235, 0.06)');
    glow.addColorStop(1, 'rgba(7, 14, 28, 0)');
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, w, h);

    // Subtle decorative corner grid lines
    ctx.strokeStyle = 'rgba(148, 163, 184, 0.06)';
    ctx.lineWidth = 1;
    for (let gx = 64; gx < w - 64; gx += 48) {
      ctx.beginPath();
      ctx.moveTo(gx, 36);
      ctx.lineTo(gx, h - 36);
      ctx.stroke();
    }
    for (let gy = 64; gy < h - 64; gy += 48) {
      ctx.beginPath();
      ctx.moveTo(36, gy);
      ctx.lineTo(w - 36, gy);
      ctx.stroke();
    }

    // Outer gold border & inner hairline frame
    ctx.strokeStyle = '#c4a77d';
    ctx.lineWidth = 3;
    ctx.strokeRect(28, 28, w - 56, h - 56);

    ctx.strokeStyle = 'rgba(196, 167, 125, 0.35)';
    ctx.lineWidth = 1.25;
    ctx.strokeRect(42, 42, w - 84, h - 84);

    // Corner L-brackets in warm gold
    const bracketLen = 28;
    ctx.strokeStyle = '#e2c799';
    ctx.lineWidth = 4;
    const corners = [
      [42, 42, 1, 1],
      [w - 42, 42, -1, 1],
      [42, h - 42, 1, -1],
      [w - 42, h - 42, -1, -1],
    ];
    for (const [cx, cy, dx, dy] of corners) {
      ctx.beginPath();
      ctx.moveTo(cx + dx * bracketLen, cy);
      ctx.lineTo(cx, cy);
      ctx.lineTo(cx, cy + dy * bracketLen);
      ctx.stroke();
    }

    // Top-left header & category badge
    ctx.fillStyle = '#e2c799';
    ctx.font = 'bold 17px sans-serif';
    ctx.fillText('AMLDECODE  ·  SKILL CERTIFICATE', 78, 92);

    const catTag = String(activeBadgeObj.category || 'ACHIEVEMENT').toUpperCase();
    ctx.fillStyle = 'rgba(196, 167, 125, 0.16)';
    ctx.fillRect(78, 110, Math.max(130, ctx.measureText(catTag).width + 32), 28);
    ctx.strokeStyle = 'rgba(196, 167, 125, 0.45)';
    ctx.lineWidth = 1;
    ctx.strokeRect(78, 110, Math.max(130, ctx.measureText(catTag).width + 32), 28);
    ctx.fillStyle = '#f3dfc1';
    ctx.font = 'bold 12px sans-serif';
    ctx.fillText(catTag, 94, 128);

    // Gold horizontal rule
    const ruleGrad = ctx.createLinearGradient(78, 158, 760, 158);
    ruleGrad.addColorStop(0, 'rgba(196, 167, 125, 0.85)');
    ruleGrad.addColorStop(1, 'rgba(196, 167, 125, 0.08)');
    ctx.strokeStyle = ruleGrad;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(78, 158);
    ctx.lineTo(760, 158);
    ctx.stroke();

    // Certificate recipient & title
    ctx.fillStyle = '#94a3b8';
    ctx.font = 'bold 13px sans-serif';
    ctx.fillText('THIS CERTIFICATE IS AWARDED TO', 78, 200);

    const learner = ((passport.profile?.displayName && passport.profile.displayName !== 'AMLDecode Learner' ? passport.profile.displayName : (currentUser?.name ? String(currentUser.name).trim() : 'AMLDecode Learner'))).trim();
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 42px Georgia, serif';
    ctx.fillText(learner, 78, 248);

    ctx.fillStyle = '#cbd5e1';
    ctx.font = '18px sans-serif';
    ctx.fillText('for completing the verified learning milestone', 78, 286);

    ctx.fillStyle = '#60a5fa';
    ctx.font = 'bold 34px Georgia, serif';
    const badgeNameY = drawWrappedCanvasText(
      ctx,
      String(activeBadgeObj.name || 'AMLDecode Achievement'),
      78,
      334,
      680,
      42,
      2
    );

    // Criteria & earned date metadata block
    const dateLabel = activeBadgeObj.awardedDate
      ? 'Awarded: ' + activeBadgeObj.awardedDate + ' (IST)'
      : 'Status: Verified Milestone';
    ctx.fillStyle = '#86efac';
    ctx.font = 'bold 16px sans-serif';
    ctx.fillText(dateLabel, 78, badgeNameY + 18);

    ctx.fillStyle = '#cbd5e1';
    ctx.font = '16px sans-serif';
    const criteriaText = 'Milestone Criteria: ' + String(activeBadgeObj.criteriaSummary || activeBadgeObj.description || '');
    const afterCriteriaY = drawWrappedCanvasText(ctx, criteriaText, 78, badgeNameY + 48, 680, 24, 2);

    if (activeVerifyUrl) {
      ctx.fillStyle = '#7dd3fc';
      ctx.font = '14px sans-serif';
      drawWrappedCanvasText(ctx, 'Verification: ' + activeVerifyUrl, 78, afterCriteriaY + 12, 760, 20, 1);
    }

    // Right-side ornamental seal / emblem panel
    const sealX = 965;
    const sealY = 325;
    const sealR = 112;

    ctx.save();
    ctx.beginPath();
    ctx.arc(sealX, sealY, sealR + 12, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(196, 167, 125, 0.28)';
    ctx.lineWidth = 2;
    ctx.setLineDash([7, 6]);
    ctx.stroke();
    ctx.setLineDash([]);

    const sealGrad = ctx.createLinearGradient(sealX - sealR, sealY - sealR, sealX + sealR, sealY + sealR);
    sealGrad.addColorStop(0, '#172846');
    sealGrad.addColorStop(1, '#0d172a');
    ctx.fillStyle = sealGrad;
    ctx.beginPath();
    ctx.arc(sealX, sealY, sealR, 0, Math.PI * 2);
    ctx.fill();
    ctx.lineWidth = 3;
    ctx.strokeStyle = '#c4a77d';
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(sealX, sealY, sealR - 12, 0, Math.PI * 2);
    ctx.lineWidth = 1;
    ctx.strokeStyle = 'rgba(226, 199, 153, 0.45)';
    ctx.stroke();

    ctx.fillStyle = '#e2c799';
    ctx.font = 'bold 13px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('AMLDECODE', sealX, sealY - 26);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 20px Georgia, serif';
    ctx.fillText('VERIFIED', sealX, sealY + 4);

    ctx.fillStyle = '#93c5fd';
    ctx.font = 'bold 12px sans-serif';
    ctx.fillText('LEARNING', sealX, sealY + 28);
    ctx.fillText('MILESTONE', sealX, sealY + 45);
    ctx.restore();

    // Footer bar
    ctx.strokeStyle = 'rgba(148, 163, 184, 0.2)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(78, h - 82);
    ctx.lineTo(w - 78, h - 82);
    ctx.stroke();

    ctx.fillStyle = '#94a3b8';
    ctx.font = '13px sans-serif';
    ctx.fillText('Educational learning indicator · Not a professional license, accredited certification, or hiring predictor.', 78, h - 52);

    ctx.fillStyle = '#e2c799';
    ctx.font = 'bold 14px sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText('amldecode.in', w - 78, h - 52);
    ctx.textAlign = 'left';

    try {
      const fileName = 'amldecode-' + (activeBadgeObj.badgeCode || 'achievement') + '-certificate.png';
      const triggerDownload = (href, revokeAfter = false) => {
        const link = document.createElement('a');
        link.download = fileName;
        link.href = href;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        if (revokeAfter) {
          setTimeout(() => URL.revokeObjectURL(href), 1500);
        }
        notify('Downloaded stylish PNG certificate card.');
      };

      if (typeof canvas.toBlob === 'function') {
        canvas.toBlob((blob) => {
          if (blob) {
            const objectUrl = URL.createObjectURL(blob);
            triggerDownload(objectUrl, true);
            return;
          }
          const dataUrl = canvas.toDataURL('image/png');
          if (dataUrl && dataUrl.startsWith('data:image/png')) {
            triggerDownload(dataUrl, false);
          } else {
            notify('Unable to export PNG card in this browser context.');
          }
        }, 'image/png');
        return;
      }

      const dataUrl = canvas.toDataURL('image/png');
      if (dataUrl && dataUrl.startsWith('data:image/png')) {
        triggerDownload(dataUrl, false);
      } else {
        notify('Unable to export PNG card in this browser context.');
      }
    } catch {
      notify('Unable to export PNG card in this browser context.');
    }
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
    <section aria-label="AMLDecode Skill Certificate" className="max-w-6xl mx-auto px-3 sm:px-4 py-5 sm:py-8 overflow-x-hidden text-slate-100 space-y-4 sm:space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white">AMLDecode Skill Certificate</h1>
          <p className="text-xs sm:text-base text-slate-300 mt-1">
            Track your AML knowledge, build practical skills and showcase your learning achievements.
          </p>
          <p className="text-[11px] sm:text-xs text-slate-400 mt-1.5">
            Educational learning indicator based on completed AMLDecode activities. Not a professional license, accredited certification, or hiring predictor.
          </p>
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
                  {(() => {
                    const prog = getBadgeProgress(badge);
                    const barPct = isEarned ? 100 : prog.percent;
                    return (
                      <div className="mt-2.5">
                        <div className="flex items-center justify-between gap-2 text-[11px] text-slate-300">
                          <span>{isEarned ? 'Milestone achieved' : prog.label}</span>
                          <span className="font-semibold text-blue-300">{barPct}%</span>
                        </div>
                        <div className="mt-1 h-1.5 w-full rounded-full bg-slate-800 overflow-hidden">
                          <div
                            className={
                              'h-full rounded-full transition-all duration-300 ' +
                              (isEarned ? 'bg-emerald-400' : 'bg-blue-500')
                            }
                            style={{ width: barPct + '%' }}
                          />
                        </div>
                      </div>
                    );
                  })()}
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
                : 'Milestone not yet unlocked · Progress: ' + activeBadgeProgress.label + ' (' + activeBadgeProgress.percent + '%)'}
            </p>
          </div>

          {(() => {
            const previewLearner = ((passport.profile?.displayName && passport.profile.displayName !== 'AMLDecode Learner' ? passport.profile.displayName : (currentUser?.name ? String(currentUser.name).trim() : 'AMLDecode Learner'))).trim();
            const previewCategory = String(activeBadgeObj.category || 'ACHIEVEMENT').toUpperCase();
            return (
              <div
                aria-label="Live Certificate Preview"
                className="relative overflow-hidden rounded-xl border border-[#c4a77d]/60 bg-gradient-to-br from-[#070e1c] via-[#0c182e] to-[#081122] p-4 shadow-inner"
              >
                <div className="pointer-events-none absolute inset-1.5 rounded-lg border border-[#c4a77d]/25" />
                <div className="relative flex items-start justify-between gap-3">
                  <div className="min-w-0 space-y-1.5">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="text-[10px] font-bold tracking-wider uppercase text-[#e2c799]">
                        AMLDecode · Skill Certificate
                      </span>
                      <span className="rounded border border-[#c4a77d]/40 bg-[#c4a77d]/15 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-[#f3dfc1]">
                        {previewCategory}
                      </span>
                    </div>
                    <div className="text-[10px] uppercase tracking-wider text-slate-400">
                      Awarded To
                    </div>
                    <div className="truncate font-serif text-base font-bold text-white">
                      {previewLearner}
                    </div>
                    <div className="font-serif text-sm font-bold text-blue-400 leading-snug">
                      {activeBadgeObj.name}
                    </div>
                    <p className="text-[11px] text-slate-300 line-clamp-2">
                      {activeBadgeObj.criteriaSummary || activeBadgeObj.description}
                    </p>
                  </div>

                  <div className="shrink-0 flex h-16 w-16 flex-col items-center justify-center rounded-full border-2 border-[#c4a77d] bg-gradient-to-b from-[#172846] to-[#0d172a] text-center shadow">
                    <span className="text-[8px] font-bold uppercase tracking-wider text-[#e2c799]">
                      {activeBadgeObj.isEarned ? 'Verified' : 'Target'}
                    </span>
                    <span className="font-serif text-[10px] font-bold text-white leading-tight mt-0.5">
                      AML
                    </span>
                    <span className="text-[8px] font-semibold uppercase text-blue-300 leading-tight">
                      {activeBadgeObj.isEarned ? 'Badge' : activeBadgeProgress.percent + '%'}
                    </span>
                  </div>
                </div>

                <div className="relative mt-3 flex items-center justify-between border-t border-slate-700/60 pt-2 text-[10px]">
                  <span className={activeBadgeObj.isEarned ? 'font-medium text-emerald-300' : 'text-amber-300'}>
                    {activeBadgeObj.isEarned
                      ? 'Earned ' + (activeBadgeObj.awardedDate || 'IST')
                      : 'Locked · ' + activeBadgeProgress.percent + '% complete'}
                  </span>
                  <span className="font-semibold text-[#e2c799]">amldecode.in</span>
                </div>
              </div>
            );
          })()}

          <div className="flex flex-col gap-2">
            {!activeBadgeObj.isEarned && (
              <div className="rounded-lg border border-amber-500/30 bg-amber-950/25 px-3 py-2.5 space-y-2">
                <p className="text-[11px] text-amber-200">
                  Locked badge: complete the milestone criteria to download the PNG card, share on LinkedIn, or generate a verification link.
                </p>
                {onNavigateView && (() => {
                  const practice = getBadgePracticeTarget(activeBadgeObj);
                  return (
                    <button
                      type="button"
                      onClick={() => onNavigateView(practice.targetView)}
                      className="w-full rounded-lg border border-blue-500/50 bg-blue-950/50 px-3 py-1.5 text-xs font-semibold text-blue-200 hover:bg-blue-900/60 transition"
                    >
                      {practice.label} →
                    </button>
                  );
                })()}
              </div>
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
