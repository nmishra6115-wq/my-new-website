// AMLDecode Skill Certificate Core Engine (Zero-cost, deterministic, educational indicator)

export const PASSPORT_STORAGE_KEY = 'amldecode_skill_passport_v1';

export const SKILL_CATEGORIES = [
  { key: 'aml_fundamentals', label: 'AML Fundamentals', shortLabel: 'AML Basics', routeView: 'notes', moduleHint: 'AML & Financial Crime Foundations' },
  { key: 'kyc_cdd_edd', label: 'KYC/CDD/EDD', shortLabel: 'KYC/CDD/EDD', routeView: 'quiz', domainHint: 'KYC/CDD' },
  { key: 'transaction_monitoring', label: 'Transaction Monitoring', shortLabel: 'Tx Monitoring', routeView: 'daily-challenge', domainHint: 'Transaction Monitoring' },
  { key: 'sanctions_screening', label: 'Sanctions Screening', shortLabel: 'Sanctions', routeView: 'quiz', domainHint: 'Sanctions' },
  { key: 'sar_str', label: 'SAR/STR', shortLabel: 'SAR/STR', routeView: 'quiz', domainHint: 'SAR/STR' },
  { key: 'kyb_ubo', label: 'KYB/UBO', shortLabel: 'KYB/UBO', routeView: 'quiz', domainHint: 'KYB/UBO' },
  { key: 'financial_crime_investigation', label: 'Financial Crime Investigation', shortLabel: 'Investigation', routeView: 'daily-challenge', domainHint: 'Investigation' },
  { key: 'risk_assessment', label: 'Risk Assessment', shortLabel: 'Risk Assessment', routeView: 'quiz', domainHint: 'Risk Assessment' },
];

export const BADGE_CATALOG = [
  { badgeCode: 'aml_foundation_explorer', name: 'AML Foundation Explorer', description: 'Completed 10 AML fundamentals questions with at least 80% accuracy on AMLDecode.', icon: 'ShieldCheck', category: 'knowledge', criteriaSummary: '10+ AML fundamentals questions with >= 80% accuracy', xpBonus: 50, rule: { type: 'category_accuracy', categoryKey: 'aml_fundamentals', minQuestions: 10, minAccuracy: 80 } },
  { badgeCode: 'kyc_knowledge_builder', name: 'KYC Knowledge Builder', description: 'Completed 15 KYC/CDD questions with at least 80% accuracy on AMLDecode.', icon: 'UserCheck', category: 'knowledge', criteriaSummary: '15+ KYC/CDD/EDD questions with >= 80% accuracy', xpBonus: 75, rule: { type: 'category_accuracy', categoryKey: 'kyc_cdd_edd', minQuestions: 15, minAccuracy: 80 } },
  { badgeCode: 'sanctions_screening_explorer', name: 'Sanctions Screening Explorer', description: 'Completed 15 sanctions screening questions with at least 80% accuracy on AMLDecode.', icon: 'GlobeLock', category: 'knowledge', criteriaSummary: '15+ sanctions screening questions with >= 80% accuracy', xpBonus: 75, rule: { type: 'category_accuracy', categoryKey: 'sanctions_screening', minQuestions: 15, minAccuracy: 80 } },
  { badgeCode: 'tm_practitioner', name: 'Transaction Monitoring Practitioner', description: 'Completed 5 simulated investigation cases with an average score of at least 80%.', icon: 'Activity', category: 'investigation', criteriaSummary: '5+ investigation cases with >= 80% average score', xpBonus: 100, rule: { type: 'feature_avg', sourceFeature: 'transaction_investigation', minCount: 5, minAvgScore: 80 } },
  { badgeCode: 'sar_narrative_practitioner', name: 'SAR Narrative Practitioner', description: 'Completed 3 SAR practice assessments with an average score of at least 80%.', icon: 'FileText', category: 'investigation', criteriaSummary: '3+ SAR practice assessments with >= 80% average score', xpBonus: 100, rule: { type: 'feature_avg', sourceFeature: 'sar_practice', minCount: 3, minAvgScore: 80 } },
  { badgeCode: 'streak_7_day', name: '7-Day Learning Streak', description: 'Completed an eligible AMLDecode learning activity on 7 consecutive IST calendar days.', icon: 'Flame', category: 'consistency', criteriaSummary: '7 consecutive IST calendar days of activity', xpBonus: 100, rule: { type: 'streak_days', days: 7 } },
  { badgeCode: 'streak_30_day', name: '30-Day Learning Streak', description: 'Completed an eligible AMLDecode learning activity on 30 consecutive IST calendar days.', icon: 'Trophy', category: 'consistency', criteriaSummary: '30 consecutive IST calendar days of activity', xpBonus: 250, rule: { type: 'streak_days', days: 30 } },
  { badgeCode: 'interview_prep_explorer', name: 'Interview Preparation Explorer', description: 'Completed 5 mock interviews on AMLDecode.', icon: 'MessageSquareCheck', category: 'interview', criteriaSummary: '5+ completed mock interviews', xpBonus: 75, rule: { type: 'feature_count', sourceFeature: 'ai_interview', minCount: 5 } },
  { badgeCode: 'interview_practice_achiever', name: 'Interview Practice Achiever', description: 'Completed 10 mock interviews with an average score of at least 80%.', icon: 'Award', category: 'interview', criteriaSummary: '10+ mock interviews with >= 80% average score', xpBonus: 150, rule: { type: 'feature_avg', sourceFeature: 'ai_interview', minCount: 10, minAvgScore: 80 } },
  { badgeCode: 'amldecode_knowledge_champion', name: 'AMLDecode Knowledge Champion', description: 'Completed 100 scored questions with at least 85% overall accuracy on AMLDecode.', icon: 'Crown', category: 'advanced', criteriaSummary: '100+ scored questions with >= 85% overall accuracy', xpBonus: 200, rule: { type: 'overall_questions', minQuestions: 100, minAccuracy: 85 } },
  { badgeCode: 'financial_crime_practice_expert', name: 'Financial Crime Practice Expert', description: 'Demonstrated advanced multi-module AML investigation and assessment milestones on AMLDecode.', icon: 'Sparkles', category: 'advanced', criteriaSummary: '80+ overall intelligence score and 25+ completed activities', xpBonus: 250, rule: { type: 'passport_score', minScore: 80, minActivities: 25 } },
];

export function getIstDateString(date = new Date()) {
  try {
    return new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Kolkata', year: 'numeric', month: '2-digit', day: '2-digit' }).format(date);
  } catch {
    return date.toISOString().slice(0, 10);
  }
}

export function getLevelMeta(totalXp = 0) {
  const xp = Math.max(0, Number(totalXp) || 0);
  if (xp >= 2500) return { level: 6, title: 'AML Principal Fellow', nextXp: null };
  if (xp >= 1500) return { level: 5, title: 'Financial Crime Specialist', nextXp: 2500 };
  if (xp >= 900) return { level: 4, title: 'Investigation Analyst', nextXp: 1500 };
  if (xp >= 450) return { level: 3, title: 'Compliance Practitioner', nextXp: 900 };
  if (xp >= 150) return { level: 2, title: 'KYC & Risk Associate', nextXp: 450 };
  return { level: 1, title: 'AML Foundation Explorer', nextXp: 150 };
}

export function generateVerificationToken() {
  if (typeof crypto !== 'undefined' && typeof crypto.getRandomValues === 'function') {
    const bytes = new Uint8Array(24);
    crypto.getRandomValues(bytes);
    return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
  }
  return Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 18);
}

export function mapDomainToCategoryKey(domainOrCategory = '') {
  const s = String(domainOrCategory || '').toLowerCase();
  if (s.includes('sanction') || s.includes('ofac') || s.includes('watch')) return 'sanctions_screening';
  if (s.includes('kyc') || s.includes('cdd') || s.includes('edd') || s.includes('customer due')) return 'kyc_cdd_edd';
  if (s.includes('kyb') || s.includes('ubo') || s.includes('beneficial') || s.includes('corporate')) return 'kyb_ubo';
  if (s.includes('sar') || s.includes('str') || s.includes('suspicious')) return 'sar_str';
  if (s.includes('monitor') || s.includes('alert') || s.includes('tm')) return 'transaction_monitoring';
  if (s.includes('investigat') || s.includes('typolog') || s.includes('case')) return 'financial_crime_investigation';
  if (s.includes('risk') || s.includes('cra') || s.includes('nra')) return 'risk_assessment';
  return 'aml_fundamentals';
}

export function computeOverallSkillScore(categories = {}) {
  const values = SKILL_CATEGORIES.map((c) => Number(categories[c.key]?.score || 0));
  if (!values.length) return 0;
  const avg = values.reduce((sum, n) => sum + n, 0) / values.length;
  return Math.round(Math.min(100, Math.max(0, avg)));
}

export function buildRecommendations(categories = {}, events = []) {
  const sorted = SKILL_CATEGORIES
    .map((c) => ({ ...c, score: Number(categories[c.key]?.score || 0), activitiesCount: Number(categories[c.key]?.activitiesCount || 0) }))
    .sort((a, b) => a.score - b.score || a.activitiesCount - b.activitiesCount);
  const weakest = sorted[0] || SKILL_CATEGORIES[0];
  const recentLowScoreEvent = events.find((ev) => Number(ev.scorePercent) < 75);
  return [
    {
      id: 'rec-focus-category',
      title: 'Strengthen ' + weakest.label,
      reason: weakest.activitiesCount === 0
        ? 'No completed activities recorded yet in ' + weakest.label + '.'
        : 'Current learning indicator is ' + Math.round(weakest.score) + '/100; practice targeted scenarios to improve.',
      targetView: weakest.routeView,
      ctaLabel: weakest.routeView === 'notes' ? 'Open Syllabus Notes' : 'Start Practice',
    },
    {
      id: 'rec-daily-ist',
      title: 'Complete Today\'s IST Daily Challenge',
      reason: 'Supports consecutive IST learning streaks and practical alert triage.',
      targetView: 'daily-challenge',
      ctaLabel: 'Go to Daily Challenge',
    },
    {
      id: 'rec-review-or-interview',
      title: recentLowScoreEvent ? 'Review ' + (recentLowScoreEvent.categoryLabel || 'Recent Topic') : 'Practice Structured AML Interview Scenarios',
      reason: recentLowScoreEvent ? 'Recent score (' + Math.round(recentLowScoreEvent.scorePercent) + '%) suggests reviewing core concepts.' : 'Apply KYC, sanctions, and investigation reasoning in a guided simulation.',
      targetView: recentLowScoreEvent ? 'notes' : 'ai-interview',
      ctaLabel: recentLowScoreEvent ? 'Review Notes' : 'Open AI Interview',
    },
  ];
}

export function createEmptyPassportState(seedUser = null) {
  const initialCategories = {};
  for (const cat of SKILL_CATEGORIES) {
    initialCategories[cat.key] = {
      categoryKey: cat.key,
      label: cat.label,
      shortLabel: cat.shortLabel,
      score: 0,
      activitiesCount: 0,
      questionsCount: 0,
      correctCount: 0,
    };
  }
  return {
    profile: {
      displayName: seedUser?.name ? String(seedUser.name).trim() : 'AMLDecode Learner',
      avatarUrl: '',
      bio: '',
      isPublic: false,
      memberSince: getIstDateString(),
    },
    stats: {
      totalXp: 0,
      assessmentsCompleted: 0,
      totalScoredQuestions: 0,
      totalCorrectAnswers: 0,
      currentStreakDays: 0,
      longestStreakDays: 0,
      lastActiveIstDate: null,
    },
    categories: initialCategories,
    events: [],
    earnedBadges: [],
    publicShares: {},
    recommendationsCache: {
      generatedAt: null,
      weakestCategory: 'aml_fundamentals',
      items: buildRecommendations(initialCategories, []),
    },
  };
}

export function evaluateEligibleBadges(state) {
  const newlyAwarded = [];
  const existingCodes = new Set((state.earnedBadges || []).map((b) => b.badgeCode));
  const totalQuestions = Number(state.stats?.totalScoredQuestions || 0);
  const totalCorrect = Number(state.stats?.totalCorrectAnswers || 0);
  const overallAccuracy = totalQuestions > 0 ? (totalCorrect / totalQuestions) * 100 : 0;
  const streakDays = Number(state.stats?.currentStreakDays || 0);
  const passportScore = computeOverallSkillScore(state.categories);
  const totalActivities = Number(state.stats?.assessmentsCompleted || 0);
  const events = state.events || [];

  for (const badge of BADGE_CATALOG) {
    if (existingCodes.has(badge.badgeCode)) continue;
    const rule = badge.rule || {};
    let met = false;
    if (rule.type === 'category_accuracy') {
      const cat = state.categories?.[rule.categoryKey];
      const qCount = Number(cat?.questionsCount || 0);
      const cCount = Number(cat?.correctCount || 0);
      const acc = qCount > 0 ? (cCount / qCount) * 100 : 0;
      met = qCount >= rule.minQuestions && acc >= rule.minAccuracy;
    } else if (rule.type === 'feature_count') {
      met = events.filter((e) => e.sourceFeature === rule.sourceFeature).length >= rule.minCount;
    } else if (rule.type === 'feature_avg') {
      const matched = events.filter((e) => e.sourceFeature === rule.sourceFeature);
      if (matched.length >= rule.minCount) {
        const avg = matched.reduce((s, e) => s + Number(e.scorePercent || 0), 0) / matched.length;
        met = avg >= rule.minAvgScore;
      }
    } else if (rule.type === 'streak_days') {
      met = streakDays >= rule.days;
    } else if (rule.type === 'overall_questions') {
      met = totalQuestions >= rule.minQuestions && overallAccuracy >= rule.minAccuracy;
    } else if (rule.type === 'passport_score') {
      met = passportScore >= rule.minScore && totalActivities >= rule.minActivities;
    }
    if (met) {
      newlyAwarded.push({
        badgeCode: badge.badgeCode,
        name: badge.name,
        description: badge.description,
        icon: badge.icon,
        category: badge.category,
        criteriaSummary: badge.criteriaSummary,
        verificationStatus: 'verified_platform_achievement',
        awardedDate: getIstDateString(),
        revoked: false,
      });
    }
  }
  return newlyAwarded;
}

export function loadPassportState(seedUser = null) {
  try {
    if (typeof window === 'undefined' || !window.localStorage) return createEmptyPassportState(seedUser);
    const raw = window.localStorage.getItem(PASSPORT_STORAGE_KEY);
    if (!raw) return createEmptyPassportState(seedUser);
    const parsed = JSON.parse(raw);
    const base = createEmptyPassportState(seedUser);
    return {
      ...base,
      ...parsed,
      profile: { ...base.profile, ...(parsed.profile || {}) },
      stats: { ...base.stats, ...(parsed.stats || {}) },
      categories: Object.fromEntries(
        Object.keys(base.categories).map((k) => {
          const bCat = base.categories[k] || {};
          const pCat = (parsed.categories && parsed.categories[k]) || {};
          return [
            k,
            {
              ...bCat,
              ...pCat,
              score: Number(pCat.score ?? bCat.score ?? 0) || 0,
              activitiesCount: Number(pCat.activitiesCount ?? bCat.activitiesCount ?? 0) || 0,
              questionsCount: Number(pCat.questionsCount ?? bCat.questionsCount ?? 0) || 0,
              correctCount: Number(pCat.correctCount ?? bCat.correctCount ?? 0) || 0,
            },
          ];
        })
      ),
      events: Array.isArray(parsed.events) ? parsed.events : [],
      earnedBadges: Array.isArray(parsed.earnedBadges) ? parsed.earnedBadges : [],
      publicShares: parsed.publicShares && typeof parsed.publicShares === 'object' ? parsed.publicShares : {},
      recommendationsCache: parsed.recommendationsCache || base.recommendationsCache,
    };
  } catch {
    return createEmptyPassportState(seedUser);
  }
}

export function savePassportState(state, detail = {}) {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem(PASSPORT_STORAGE_KEY, JSON.stringify(state));
      window.dispatchEvent(
        new CustomEvent('amldecode:passport-updated', {
          detail: { state, ...detail },
        })
      );
    }
  } catch {
    // Ignore storage errors
  }
}

export function recordActivityEvent(currentState, inputEvent) {
  const rawFeature = String(inputEvent?.sourceFeature || '').trim();
  const sourceFeature = rawFeature === 'ai-interview' ? 'ai_interview' : rawFeature;
  const externalEventId = String(inputEvent?.externalEventId || '').trim();
  if (!sourceFeature || !externalEventId) return { state: currentState, duplicate: false, newBadges: [] };

  const existingEvents = currentState.events || [];
  if (existingEvents.some((ev) => ev.sourceFeature === sourceFeature && ev.externalEventId === externalEventId)) {
    return { state: currentState, duplicate: true, newBadges: [] };
  }

  const categoryKey = mapDomainToCategoryKey(inputEvent.categoryKey || inputEvent.domain || '');
  const catMeta = SKILL_CATEGORIES.find((c) => c.key === categoryKey) || SKILL_CATEGORIES[0];
  const questionsAnswered = Math.max(0, Number(inputEvent.questionsAnswered ?? 0));
  const correctAnswers = Math.min(questionsAnswered > 0 ? questionsAnswered : Number(inputEvent.correctAnswers ?? 0), Math.max(0, Number(inputEvent.correctAnswers ?? 0)));
  const rawScore = inputEvent.scorePercent !== undefined && inputEvent.scorePercent !== null
    ? Number(inputEvent.scorePercent)
    : questionsAnswered > 0 ? (correctAnswers / questionsAnswered) * 100 : 0;
  const scorePercent = Math.min(100, Math.max(0, Number.isFinite(rawScore) ? rawScore : 0));
  const xpAwarded = Math.max(0, Number(inputEvent.xpAwarded ?? 0));
  const occurredIstDate = inputEvent.occurredIstDate || getIstDateString();

  const newEvent = {
    id: 'ev-' + Date.now() + '-' + Math.random().toString(36).slice(2, 7),
    sourceFeature,
    externalEventId,
    categoryKey,
    categoryLabel: catMeta.label,
    title: String(inputEvent.title || catMeta.label),
    questionsAnswered,
    correctAnswers,
    scorePercent: Math.round(scorePercent * 100) / 100,
    xpAwarded,
    occurredIstDate,
    createdAt: new Date().toISOString(),
  };

  const prevCat = currentState.categories?.[categoryKey] || { categoryKey, label: catMeta.label, shortLabel: catMeta.shortLabel, score: 0, activitiesCount: 0, questionsCount: 0, correctCount: 0 };
  const nextCatActivities = prevCat.activitiesCount + 1;
  const nextCatScore = Math.min(100, Math.round(((prevCat.score * prevCat.activitiesCount + scorePercent) / nextCatActivities) * 100) / 100);
  const nextCategories = {
    ...currentState.categories,
    [categoryKey]: {
      ...prevCat,
      score: nextCatScore,
      activitiesCount: nextCatActivities,
      questionsCount: prevCat.questionsCount + questionsAnswered,
      correctCount: prevCat.correctCount + correctAnswers,
    },
  };

  const prevStats = currentState.stats || {};
  let nextStreak = Number(prevStats.currentStreakDays || 0);
  const lastDate = prevStats.lastActiveIstDate;
  if (!lastDate) {
    nextStreak = 1;
  } else if (lastDate === occurredIstDate) {
    nextStreak = Math.max(1, nextStreak);
  } else {
    const diffDays = Math.round((Date.parse(occurredIstDate + 'T00:00:00Z') - Date.parse(lastDate + 'T00:00:00Z')) / 86400000);
    nextStreak = diffDays === 1 ? nextStreak + 1 : 1;
  }

  const nextStats = {
    totalXp: Number(prevStats.totalXp || 0) + xpAwarded,
    assessmentsCompleted: Number(prevStats.assessmentsCompleted || 0) + 1,
    totalScoredQuestions: Number(prevStats.totalScoredQuestions || 0) + questionsAnswered,
    totalCorrectAnswers: Number(prevStats.totalCorrectAnswers || 0) + correctAnswers,
    currentStreakDays: nextStreak,
    longestStreakDays: Math.max(Number(prevStats.longestStreakDays || 0), nextStreak),
    lastActiveIstDate: occurredIstDate,
  };

  const nextEvents = [newEvent, ...existingEvents].slice(0, 200);
  const interimState = { ...currentState, categories: nextCategories, stats: nextStats, events: nextEvents };
  const newBadges = evaluateEligibleBadges(interimState);
  const badgeBonusXp = newBadges.reduce((sum, b) => {
    const def = BADGE_CATALOG.find((item) => item.badgeCode === b.badgeCode);
    return sum + Number(def?.xpBonus || 0);
  }, 0);

  const finalState = {
    ...interimState,
    stats: { ...nextStats, totalXp: nextStats.totalXp + badgeBonusXp },
    earnedBadges: [...newBadges, ...(currentState.earnedBadges || [])],
    recommendationsCache: {
      generatedAt: new Date().toISOString(),
      weakestCategory: categoryKey,
      items: buildRecommendations(nextCategories, nextEvents),
    },
  };

  savePassportState(finalState);
  return { state: finalState, duplicate: false, newBadges };
}

export function buildLinkedInShareText(badge, displayName = 'AMLDecode Learner', verifyUrl = '') {
  const name = badge?.name || 'AMLDecode Achievement';
  const learner = displayName || 'an AMLDecode learner';
  const parts = [
    "I've earned the " + name + ' achievement on AMLDecode as ' + learner + ', recording completed AML/KYC learning progress on the platform.',
    'Continuing to build structured AML, KYC/CDD, sanctions, and financial crime investigation study habits.',
    verifyUrl ? 'Verify achievement: ' + verifyUrl : '',
    '#AML #KYC #FinancialCrime #ComplianceLearning',
  ].filter(Boolean);
  return parts.join('\n\n');
}

export function completeLearnerTask(inputEvent = {}, seedUser = null) {
  const current = loadPassportState(seedUser);
  const rawFeat = String(inputEvent?.sourceFeature || 'learning_task').trim();
  const normFeat = rawFeat === 'ai-interview' ? 'ai_interview' : rawFeat;
  const baseXp = Math.max(30, Number(inputEvent?.xpAwarded ?? 35) || 35);
  const res = recordActivityEvent(current, {
    ...inputEvent,
    sourceFeature: normFeat,
    externalEventId:
      String(inputEvent?.externalEventId || '').trim() ||
      'task-' + Date.now() + '-' + Math.random().toString(36).slice(2, 8),
    xpAwarded: baseXp,
  });
  savePassportState(res.state, res);
  return res;
}

