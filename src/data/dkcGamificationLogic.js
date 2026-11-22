// Gamification, IST Streak, Opt-In Leaderboards & Adaptive Learning Helper (?0 Cost)
import { CHALLENGE_LEVEL_TIERS, XP_REWARDS, TWENTY_AML_CATEGORIES } from './aiDailyChallengeEngine';
import { getIstDayIndex } from './aiDailyChallengeEngine';
import { notesContent } from '../content';

const GAMIFICATION_STORAGE_KEY = 'amldecode_dkc_gamification_v1';

export function getLevelForXp(xp = 0) {
  const safeXp = Math.max(0, Number(xp) || 0);
  let current = CHALLENGE_LEVEL_TIERS[0];
  let next = CHALLENGE_LEVEL_TIERS[1] || null;

  for (let i = 0; i < CHALLENGE_LEVEL_TIERS.length; i += 1) {
    if (safeXp >= CHALLENGE_LEVEL_TIERS[i].minXp) {
      current = CHALLENGE_LEVEL_TIERS[i];
      next = CHALLENGE_LEVEL_TIERS[i + 1] || null;
    }
  }

  const span = next ? Math.max(1, next.minXp - current.minXp) : 500;
  const progressInTier = next ? Math.min(100, Math.max(0, Math.round(((safeXp - current.minXp) / span) * 100))) : 100;

  return {
    level: current.level,
    title: current.title,
    xp: safeXp,
    nextLevelTitle: next ? next.title : 'Max Educational Tier Reached',
    nextLevelXp: next ? next.minXp : null,
    progressPct: progressInTier,
  };
}

export function getNextStreakMilestone(currentStreak = 0) {
  const s = Math.max(0, Number(currentStreak) || 0);
  if (s < 7) return { targetDays: 7, bonusXp: XP_REWARDS.streak7Milestone, remainingDays: 7 - s };
  if (s < 30) return { targetDays: 30, bonusXp: XP_REWARDS.streak30Milestone, remainingDays: 30 - s };
  return { targetDays: 60, bonusXp: 0, remainingDays: Math.max(1, 60 - s) };
}

export function createDefaultGamificationState() {
  return {
    totalXp: 0,
    weeklyXp: 0,
    monthlyXp: 0,
    currentStreak: 0,
    longestStreak: 0,
    lastCompletedDateIst: null,
    totalCompleted: 0,
    totalCorrect: 0,
    awardedKeys: [], // Idempotency keys to prevent duplicate XP awards
    unlockedAchievements: [], // Achievement codes
    leaderboardOptIn: false,
    displayName: '',
    categoryStats: {}, // { [category]: { attempts, correct } }
    difficultyStats: {}, // { [difficulty]: { attempts, correct } }
  };
}

export function loadGamificationState() {
  try {
    const raw = window.localStorage.getItem(GAMIFICATION_STORAGE_KEY);
    if (!raw) return createDefaultGamificationState();
    return { ...createDefaultGamificationState(), ...JSON.parse(raw) };
  } catch {
    return createDefaultGamificationState();
  }
}

export function saveGamificationState(state) {
  try {
    window.localStorage.setItem(GAMIFICATION_STORAGE_KEY, JSON.stringify(state));
  } catch {
    // ignore storage errors
  }
  return state;
}

export function computeUnlockedAchievements(state, latestCategory = '') {
  const unlocked = new Set(Array.isArray(state.unlockedAchievements) ? state.unlockedAchievements : []);
  const newlyUnlocked = [];

  const grant = (code) => {
    if (!unlocked.has(code)) {
      unlocked.add(code);
      newlyUnlocked.push(code);
    }
  };

  if ((state.totalCompleted || 0) >= 1) grant('first_challenge');
  if ((state.currentStreak || 0) >= 7 || (state.longestStreak || 0) >= 7) grant('streak_7_days');
  if ((state.currentStreak || 0) >= 30 || (state.longestStreak || 0) >= 30) grant('streak_30_days');
  if ((state.totalCorrect || 0) >= 10) grant('correct_10');
  if ((state.totalCorrect || 0) >= 50) grant('correct_50');
  if ((state.totalXp || 0) >= 500) grant('aml_champion');

  const tmCat = (state.categoryStats?.['Transaction Monitoring']?.correct || 0) +
    (state.categoryStats?.['Structuring']?.correct || 0) +
    (state.categoryStats?.['Mule Accounts']?.correct || 0);
  if (tmCat >= 2) grant('tm_explorer');

  const sancCat = (state.categoryStats?.['Sanctions Screening']?.correct || 0) +
    (state.categoryStats?.['PEP Screening']?.correct || 0);
  if (sancCat >= 2) grant('sanctions_builder');

  if (latestCategory && (state.categoryStats?.[latestCategory]?.correct || 0) >= 1 && newlyUnlocked.length === 0 && unlocked.size === 0) {
    grant('first_challenge');
  }

  return {
    allUnlocked: Array.from(unlocked),
    newlyUnlocked,
  };
}

// Atomic, idempotent evaluation + XP + streak calculation (shared by client fallback & server API)
export function applyDailyChallengeSubmission({
  prevState,
  challenge,
  selectedAnswer,
  dateIsoIst,
}) {
  const base = { ...createDefaultGamificationState(), ...(prevState || {}) };
  const awardedSet = new Set(Array.isArray(base.awardedKeys) ? base.awardedKeys : []);
  const isCorrect = Boolean(selectedAnswer) === Boolean(challenge.correctAnswer);

  const attemptKey = `attempt:${dateIsoIst}:${challenge.id}`;
  const alreadyScoredThisChallenge = awardedSet.has(attemptKey);

  let xpEarned = 0;
  const awardReasons = [];

  if (!alreadyScoredThisChallenge) {
    awardedSet.add(attemptKey);

    // Daily completion bonus (+10 XP)
    const compKey = `xp:daily_completion:${dateIsoIst}`;
    if (!awardedSet.has(compKey)) {
      awardedSet.add(compKey);
      xpEarned += XP_REWARDS.dailyCompletion;
      awardReasons.push(`+${XP_REWARDS.dailyCompletion} XP Daily Completion`);
    }

    // Correct daily answer bonus (+50 XP)
    if (isCorrect) {
      const corrKey = `xp:daily_correct_answer:${dateIsoIst}:${challenge.id}`;
      if (!awardedSet.has(corrKey)) {
        awardedSet.add(corrKey);
        xpEarned += XP_REWARDS.correctAnswer;
        awardReasons.push(`+${XP_REWARDS.correctAnswer} XP Correct Answer`);
      }
    }

    // Streak calculation using IST calendar dates
    const currentDayNum = getIstDayIndex(dateIsoIst);
    const lastDayNum = base.lastCompletedDateIst ? getIstDayIndex(base.lastCompletedDateIst) : null;

    let nextStreak = base.currentStreak || 0;
    if (lastDayNum === null) {
      nextStreak = 1;
    } else if (currentDayNum === lastDayNum) {
      nextStreak = Math.max(1, base.currentStreak || 1);
    } else if (currentDayNum - lastDayNum === 1) {
      nextStreak = (base.currentStreak || 0) + 1;
    } else if (currentDayNum > lastDayNum) {
      nextStreak = 1;
    }

    const nextLongest = Math.max(base.longestStreak || 0, nextStreak);

    // Streak milestones (+100 at 7 days, +500 at 30 days) ? idempotent
    const m7Key = 'xp:streak_7_day_milestone';
    if (nextStreak >= 7 && !awardedSet.has(m7Key)) {
      awardedSet.add(m7Key);
      xpEarned += XP_REWARDS.streak7Milestone;
      awardReasons.push(`+${XP_REWARDS.streak7Milestone} XP 7-Day Streak Milestone!`);
    }

    const m30Key = 'xp:streak_30_day_milestone';
    if (nextStreak >= 30 && !awardedSet.has(m30Key)) {
      awardedSet.add(m30Key);
      xpEarned += XP_REWARDS.streak30Milestone;
      awardReasons.push(`+${XP_REWARDS.streak30Milestone} XP 30-Day Streak Milestone!`);
    }

    const cat = challenge.category || 'AML Fundamentals';
    const diff = challenge.difficulty || 'Intermediate';
    const catPrev = base.categoryStats[cat] || { attempts: 0, correct: 0 };
    const diffPrev = base.difficultyStats[diff] || { attempts: 0, correct: 0 };

    const updatedState = {
      ...base,
      totalXp: (base.totalXp || 0) + xpEarned,
      weeklyXp: (base.weeklyXp || 0) + xpEarned,
      monthlyXp: (base.monthlyXp || 0) + xpEarned,
      currentStreak: nextStreak,
      longestStreak: nextLongest,
      lastCompletedDateIst: dateIsoIst,
      totalCompleted: (base.totalCompleted || 0) + 1,
      totalCorrect: (base.totalCorrect || 0) + (isCorrect ? 1 : 0),
      awardedKeys: Array.from(awardedSet).slice(-500),
      categoryStats: {
        ...base.categoryStats,
        [cat]: {
          attempts: catPrev.attempts + 1,
          correct: catPrev.correct + (isCorrect ? 1 : 0),
        },
      },
      difficultyStats: {
        ...base.difficultyStats,
        [diff]: {
          attempts: diffPrev.attempts + 1,
          correct: diffPrev.correct + (isCorrect ? 1 : 0),
        },
      },
    };

    const ach = computeUnlockedAchievements(updatedState, cat);
    updatedState.unlockedAchievements = ach.allUnlocked;

    return {
      isCorrect,
      correctAnswer: Boolean(challenge.correctAnswer),
      alreadySubmitted: false,
      xpEarned: 0 === xpEarned ? 0 : xpEarned,
      awardReasons,
      newlyUnlockedAchievements: ach.newlyUnlocked,
      updatedState,
    };
  }

  return {
    isCorrect,
    correctAnswer: Boolean(challenge.correctAnswer),
    alreadySubmitted: true,
    xpEarned: 0,
    awardReasons: ['Already scored for this challenge ? no duplicate XP awarded.'],
    newlyUnlockedAchievements: [],
    updatedState: base,
  };
}

export function buildAdaptiveRecommendations(state) {
  const catStats = state?.categoryStats || {};
  const scored = Object.entries(catStats)
    .filter(([, v]) => (v.attempts || 0) > 0)
    .map(([category, v]) => ({
      category,
      attempts: v.attempts,
      correct: v.correct || 0,
      accuracy: Math.round(((v.correct || 0) / v.attempts) * 100),
    }))
    .sort((a, b) => a.accuracy - b.accuracy);

  const weakCategories = scored.filter((item) => item.accuracy < 75).slice(0, 3);
  const fallbackWeak = weakCategories.length > 0
    ? weakCategories
    : TWENTY_AML_CATEGORIES.slice(0, 2).map((category) => ({
        category,
        attempts: 0,
        correct: 0,
        accuracy: null,
      }));

  return fallbackWeak.map((item) => {
    let moduleIndex = 0;
    const c = item.category.toLowerCase();
    if (c.includes('kyc') || c.includes('cdd') || c.includes('edd') || c.includes('kyb') || c.includes('ubo') || c.includes('pep') || c.includes('wealth') || c.includes('funds')) {
      moduleIndex = 3;
    } else if (c.includes('monitoring') || c.includes('structur')) {
      moduleIndex = 5;
    } else if (c.includes('mule') || c.includes('typolog') || c.includes('fraud') || c.includes('investigation')) {
      moduleIndex = 6;
    } else if (c.includes('sanction')) {
      moduleIndex = 7;
    } else if (c.includes('sar') || c.includes('str')) {
      moduleIndex = 8;
    }
    const mod = Array.isArray(notesContent) ? notesContent[moduleIndex] : null;
    return {
      ...item,
      moduleIndex,
      moduleTitle: mod?.title || 'AMLDecode Syllabus Notes',
    };
  });
}

// Privacy-safe leaderboard rows (never exposes email, phone, or auth user IDs)
export function getLeaderboardRows(period = 'weekly', userState = null) {
  const rows = [];
  if (userState?.leaderboardOptIn && String(userState?.displayName || '').trim().length >= 2) {
    const mult = period === 'weekly' ? 0.5 : period === 'monthly' ? 0.85 : 1;
    rows.push({
      displayName: String(userState.displayName).trim().slice(0, 30),
      badge: getLevelForXp(userState.totalXp || 0).title,
      completed: Number(userState.totalCompleted || 0),
      xp: Math.max(0, Math.round((Number(userState.totalXp) || 0) * mult)),
      isCurrentUser: true,
    });
  }
  return rows
    .sort((a, b) => b.xp - a.xp || b.completed - a.completed)
    .map((r, idx) => ({ ...r, rank: idx + 1 }));
}
