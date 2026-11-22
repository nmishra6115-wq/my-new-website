import { useMemo, useState, useEffect, useCallback } from 'react';
import { getIstDateInfo, selectDailyChallengeForDate } from '../data/dailyChallengeBank';
import {
  TWENTY_AML_CATEGORIES,
  TWENTY_DOMAIN_CHALLENGE_BANK,
  getIstDateKey,
  getIstDisplayDate,
  selectDailyChallengeEngine,
} from '../data/aiDailyChallengeEngine';
import {
  getLevelForXp,
  getNextStreakMilestone,
  loadGamificationState,
  saveGamificationState,
  applyDailyChallengeSubmission,
  buildAdaptiveRecommendations,
  getLeaderboardRows,
} from '../data/dkcGamificationLogic';
import {
  loadDailyChallengeWithStore,
  recordDailyChallengeAttempt,
  fetchChallengeHistoryWithFallback,
} from '../data/dailyChallengeStore';
import {
  readLocalChallengeHistory,
  writeLocalChallengeHistory,
  mergeChallengeHistoryEntry,
  computeHonestCompletionStreak,
  getArchiveChallenges,
  getTopicPracticeQuestions,
} from '../data/dkcProgressLogic';


import { loadPassportState, recordActivityEvent } from '../data/amlSkillPassportEngine';
const ANSWER_STORAGE_PREFIX = 'amldecode_dkc_answer_v1_';
const ADMIN_PAUSED_KEY = 'amldecode_dkc_admin_paused_v1';
const ADMIN_PINNED_KEY = 'amldecode_dkc_admin_pinned_v1';

function readStoredChoice(storageKey) {
  if (!storageKey) return null;
  try {
    const saved = window.localStorage.getItem(storageKey);
    if (saved === 'true') return true;
    if (saved === 'false') return false;
    return null;
  } catch {
    return null;
  }
}

function getNextIstMidnightCountdown() {
  const now = new Date();
  const istNowStr = now.toLocaleString('en-US', { timeZone: 'Asia/Kolkata' });
  const istNow = new Date(istNowStr);
  const nextMidnight = new Date(istNow);
  nextMidnight.setHours(24, 0, 0, 0);
  const diffMs = Math.max(0, nextMidnight.getTime() - istNow.getTime());
  const totalMinutes = Math.floor(diffMs / 60000);
  const hrs = Math.floor(totalMinutes / 60);
  const mins = totalMinutes % 60;
  return `${hrs}h ${mins}m until next IST challenge`;
}

function formatChoiceLabel(val) {
  return val ? 'Correct' : 'Incorrect';
}

export default function DailyChallengeCard({
  challenge: providedChallenge,
  learner = null,
  compact = false,
  onOpenRelatedNote,
  onOpenKnowledgeTest,
}) {
  const istInfo = useMemo(() => getIstDateInfo(new Date()), []);
  const istDateKey = useMemo(() => getIstDateKey(new Date()), []);
  const istDisplayDate = useMemo(() => getIstDisplayDate(new Date()), []);

  const adminPaused = (() => {
    try {
      return window.localStorage.getItem(ADMIN_PAUSED_KEY) === 'true';
    } catch {
      return false;
    }
  })();
  const adminPinnedId = (() => {
    try {
      return window.localStorage.getItem(ADMIN_PINNED_KEY) || '';
    } catch {
      return '';
    }
  })();

  const engineSelection = useMemo(
    () =>
      selectDailyChallengeEngine({
        now: new Date(),
        pool: TWENTY_DOMAIN_CHALLENGE_BANK,
        paused: adminPaused,
        pinnedQuestionId: adminPinnedId || null,
      }),
    [adminPaused, adminPinnedId]
  );

  const fallbackChallenge = useMemo(() => {
    if (engineSelection.challenge) return engineSelection.challenge;
    return selectDailyChallengeForDate(istInfo.dateIsoIst, istInfo.rotationTopic);
  }, [engineSelection.challenge, istInfo.dateIsoIst, istInfo.rotationTopic]);

  const dateTopicKey = `${istInfo.dateIsoIst}_${istInfo.rotationTopic}`;
  const [loadedByDateTopic, setLoadedByDateTopic] = useState({});
  const [storedByKey, setStoredByKey] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [lastAwardSummary, setLastAwardSummary] = useState(null);
  const [shareStatus, setShareStatus] = useState('');

  const [activeTab, setActiveTab] = useState('today');
  const [leaderboardPeriod, setLeaderboardPeriod] = useState('weekly');
  const [practiceTopic, setPracticeTopic] = useState('All');
  const [practiceIndex, setPracticeIndex] = useState(0);
  const [practiceChoice, setPracticeChoice] = useState(null);
  const [selectedArchiveId, setSelectedArchiveId] = useState('');
  const [archiveChoice, setArchiveChoice] = useState(null);
  const [historyEntries, setHistoryEntries] = useState(() => readLocalChallengeHistory());
  const [gamification, setGamification] = useState(() => loadGamificationState());
  
  useEffect(() => {
    if (providedChallenge) return;
    let mounted = true;
    loadDailyChallengeWithStore({
      dateIsoIst: istInfo.dateIsoIst,
      rotationTopic: istInfo.rotationTopic,
    }).then(({ challenge: loaded }) => {
      if (mounted && loaded) {
        setLoadedByDateTopic((prev) => ({ ...prev, [dateTopicKey]: loaded }));
      }
    });
    return () => {
      mounted = false;
    };
  }, [providedChallenge, istInfo.dateIsoIst, istInfo.rotationTopic, dateTopicKey]);

  useEffect(() => {
    if (!learner?.email) return;
    let mounted = true;
    fetchChallengeHistoryWithFallback(learner).then((remoteList) => {
      if (mounted && Array.isArray(remoteList) && remoteList.length > 0) {
        setHistoryEntries(remoteList);
      }
    });
    return () => {
      mounted = false;
    };
  }, [learner]);

  const activeChallenge = providedChallenge || loadedByDateTopic[dateTopicKey] || fallbackChallenge;
  const answerStorageKey = activeChallenge
    ? `${ANSWER_STORAGE_PREFIX}${istDateKey}_${activeChallenge.id}`
    : null;

  const selectedAnswer =
    answerStorageKey && Object.prototype.hasOwnProperty.call(storedByKey, answerStorageKey)
      ? storedByKey[answerStorageKey]
      : readStoredChoice(answerStorageKey);

  const hasAnsweredToday = typeof selectedAnswer === 'boolean';
  const correctAnswerBool = Boolean(activeChallenge?.correctAnswer);

  const levelInfo = useMemo(() => getLevelForXp(gamification.totalXp || 0), [gamification.totalXp]);
  const nextMilestone = useMemo(
    () => getNextStreakMilestone(gamification.currentStreak || 0),
    [gamification.currentStreak]
  );
  const adaptiveRecs = useMemo(() => buildAdaptiveRecommendations(gamification), [gamification]);
  const leaderboardRows = useMemo(
    () => getLeaderboardRows(leaderboardPeriod, gamification),
    [leaderboardPeriod, gamification]
  );
  const countdownText = useMemo(() => getNextIstMidnightCountdown(), []);

  const handleSelectDailyAnswer = useCallback(
    async (choiceBool) => {
      // Strictly lock selection once submitted so users cannot change answers for extra XP
      if (!activeChallenge || hasAnsweredToday || submitting) return;
      setSubmitting(true);

      const actorKey = learner?.email
        ? `learner:${String(learner.email).trim().toLowerCase()}`
        : `anon:${istDateKey}`;

      let evaluatedResult = null;
      try {
        const resp = await fetch('/api/dkc/submit', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-dkc-actor-key': actorKey,
          },
          body: JSON.stringify({
            actorKey,
            challengeId: activeChallenge.id,
            challengeDateIst: istDateKey,
            selectedAnswer: Boolean(choiceBool),
            currentState: gamification,
          }),
        });
        if (resp.ok) {
          const data = await resp.json();
          if (data?.ok && data.updatedState) {
            evaluatedResult = data;
          }
        }
      } catch {
        // Fallback to deterministic local evaluation when API endpoint is offline/static
      }

      if (!evaluatedResult) {
        const localEval = applyDailyChallengeSubmission({
          prevState: gamification,
          challenge: activeChallenge,
          selectedAnswer: Boolean(choiceBool),
          dateIsoIst: istDateKey,
        });
        evaluatedResult = {
          isCorrect: localEval.isCorrect,
          correctAnswer: localEval.correctAnswer,
          alreadySubmitted: localEval.alreadySubmitted,
          xpEarned: localEval.xpEarned,
          awardReasons: localEval.awardReasons,
          newlyUnlockedAchievements: localEval.newlyUnlockedAchievements,
          updatedState: localEval.updatedState,
        };
      }

      if (answerStorageKey) {
        try {
          window.localStorage.setItem(answerStorageKey, String(Boolean(choiceBool)));
        } catch {
          // ignore storage write failure
        }
        setStoredByKey((prev) => ({ ...prev, [answerStorageKey]: Boolean(choiceBool) }));
      }

      const savedGamification = saveGamificationState(evaluatedResult.updatedState);
      setGamification(savedGamification);
      setLastAwardSummary({
        xpEarned: evaluatedResult.xpEarned || 0,
        reasons: evaluatedResult.awardReasons || [],
        badges: evaluatedResult.newlyUnlockedAchievements || [],
      });

      const newHistoryEntry = {
        publication_date_ist: istDateKey,
        question_id: activeChallenge.id,
        topic: activeChallenge.category || activeChallenge.topic || 'AML Fundamentals',
        statement: activeChallenge.statement,
        selected_answer: Boolean(choiceBool),
        is_correct: Boolean(evaluatedResult.isCorrect),
        answered_at: new Date().toISOString(),
      };

      setHistoryEntries((prev) => {
        const merged = mergeChallengeHistoryEntry(prev, newHistoryEntry);
        writeLocalChallengeHistory(merged);
        return merged;
      });

      await recordDailyChallengeAttempt({
        dateIsoIst: istDateKey,
        challenge: activeChallenge,
        selectedAnswer: Boolean(choiceBool),
        learner,
      });

      try {
        const passportState = loadPassportState(learner);
        const isCorrectAnswer = Boolean(evaluatedResult.isCorrect);
        const challengeDomain = activeChallenge.category || activeChallenge.topic || 'Transaction Monitoring';
        const challengeTitle = activeChallenge.title || activeChallenge.statement || `Daily Challenge (${istDateKey})`;
        const passportRes = recordActivityEvent(passportState, {
          sourceFeature: 'daily-challenge',
          externalEventId: `dkc-${activeChallenge.id}-${istDateKey}`,
          domain: challengeDomain,
          title: challengeTitle,
          questionsAnswered: 1,
          correctAnswers: isCorrectAnswer ? 1 : 0,
          scorePercent: isCorrectAnswer ? 100 : 0,
          xpAwarded: Math.max(10, Number(evaluatedResult.xpEarned) || (isCorrectAnswer ? 35 : 10)),
          occurredIstDate: istDateKey,
        });
        if (!passportRes.duplicate && typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('amldecode:passport-updated', { detail: passportRes }));
        }
      } catch {
        // Do not block daily challenge submission if passport storage fails
      }

      setSubmitting(false);
    },
    [activeChallenge, hasAnsweredToday, submitting, learner, istDateKey, gamification, answerStorageKey]
  );

  const handleShareAchievement = async () => {
    const shareText = `I completed today's AMLDecode Daily Intelligence Challenge (${istDateKey}) ? ${levelInfo.title} ? ${gamification.currentStreak || 0}-day IST streak. (amldecode.in)`;
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(shareText);
        setShareStatus('Copied privacy-safe achievement summary.');
      } else {
        setShareStatus(shareText);
      }
    } catch {
      setShareStatus('Share summary ready.');
    }
  };

  const handleUpdateLeaderboardOptIn = (nextOptIn, nextName) => {
    const cleanName = String(nextName ?? gamification.displayName ?? '').trim().slice(0, 30);
    const updated = saveGamificationState({
      ...gamification,
      leaderboardOptIn: Boolean(nextOptIn) && cleanName.length >= 2,
      displayName: cleanName,
    });
    setGamification(updated);
  };

  const streakStats = useMemo(
    () => computeHonestCompletionStreak(historyEntries, istDateKey),
    [historyEntries, istDateKey]
  );

  const combinedPool = useMemo(() => {
    const ids = new Set();
    const list = [];
    for (const q of [...TWENTY_DOMAIN_CHALLENGE_BANK]) {
      if (q && !ids.has(q.id)) {
        ids.add(q.id);
        list.push(q);
      }
    }
    return list;
  }, []);

  const archiveList = useMemo(
    () => getArchiveChallenges(combinedPool, activeChallenge?.id || ''),
    [combinedPool, activeChallenge?.id]
  );

  const activeArchiveChallenge = useMemo(() => {
    if (archiveList.length === 0) return null;
    return archiveList.find((item) => item.id === selectedArchiveId) || archiveList[0];
  }, [archiveList, selectedArchiveId]);

  const practiceList = useMemo(
    () => getTopicPracticeQuestions(combinedPool, practiceTopic),
    [combinedPool, practiceTopic]
  );

  const activePracticeChallenge =
    practiceList.length > 0 ? practiceList[practiceIndex % practiceList.length] : null;

  const renderTwoButtons = (chosenBool, targetBool, isLocked, onPick) => {
    const choices = [
      { value: true, label: 'Correct', symbol: '?' },
      { value: false, label: 'Incorrect', symbol: '?' },
    ];

    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5" role="group" aria-label="Answer choices">
        {choices.map((opt) => {
          const isPicked = chosenBool === opt.value;
          const isRightOption = opt.value === targetBool;

          let btnClass =
            'bg-[#122640] text-[#F8FAFC] border-white/15 hover:border-[#60A5FA] hover:bg-[#173152]';

          if (isLocked) {
            if (isPicked && isRightOption) {
              btnClass = 'bg-[#063B2C] text-[#ECFDF5] border-[#34D399] ring-1 ring-[#34D399]/60';
            } else if (isPicked && !isRightOption) {
              btnClass = 'bg-[#461322] text-[#FFF1F2] border-[#FB7185] ring-1 ring-[#FB7185]/60';
            } else if (isRightOption) {
              btnClass = 'bg-[#063B2C]/70 text-[#A7F3D0] border-[#34D399]/60';
            } else {
              btnClass = 'bg-[#122640]/60 text-[#94A3B8] border-white/10 opacity-75';
            }
          }

          return (
            <button
              key={opt.label}
              type="button"
              disabled={isLocked || submitting}
              aria-pressed={isPicked}
              onClick={() => onPick(opt.value)}
              className={`w-full py-3.5 px-5 rounded-xl border text-left font-bold text-sm transition-colors duration-150 flex items-center justify-between focus:outline-none focus:ring-2 focus:ring-[#60A5FA] ${btnClass} ${isLocked ? 'cursor-default' : 'cursor-pointer'}`}
            >
              <span className="flex items-center gap-2.5">
                <span className="inline-flex items-center justify-center w-6 h-6 rounded-md bg-black/25 text-xs font-extrabold">
                  {opt.symbol}
                </span>
                <span>{opt.label}</span>
              </span>
              {isLocked && isPicked && (
                <span className="text-[11px] uppercase tracking-wider font-extrabold">
                  Selected (Locked)
                </span>
              )}
            </button>
          );
        })}
      </div>
    );
  };

  const renderStructuredExplanation = (item, userChoiceBool, isPractice = false) => {
    if (typeof userChoiceBool !== 'boolean' || !item) return null;
    const rightBool = Boolean(item.correctAnswer);
    const passed = userChoiceBool === rightBool;

    return (
      <div
        className={`mt-5 p-5 rounded-xl border space-y-3 transition-opacity duration-200 ${
          passed
            ? 'bg-[#063B2C]/85 border-[#34D399]/50 text-[#ECFDF5]'
            : 'bg-[#461322]/85 border-[#FB7185]/50 text-[#FFF1F2]'
        }`}
      >
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-sm font-extrabold tracking-wide">
            {passed ? 'Accurate Assessment' : 'Review Required'} ? Official Answer: {formatChoiceLabel(rightBool)}
          </p>
          {!isPractice && lastAwardSummary && (
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-black/25">
              +{lastAwardSummary.xpEarned} XP Earned
            </span>
          )}
        </div>

        <p className="text-sm leading-relaxed opacity-95">{item.explanation}</p>

        {item.analystTakeaway && (
          <p className="text-xs leading-relaxed opacity-90">
            <strong>Analyst Takeaway:</strong> {item.analystTakeaway}
          </p>
        )}

        {item.practicalApplication && (
          <p className="text-xs leading-relaxed opacity-90">
            <strong>Practical AML Application:</strong> {item.practicalApplication}
          </p>
        )}

        {Array.isArray(item.keyLearningPoints) && item.keyLearningPoints.length > 0 && (
          <ul className="list-disc list-inside text-xs space-y-1 opacity-90">
            {item.keyLearningPoints.map((pt, i) => (
              <li key={i}>{pt}</li>
            ))}
          </ul>
        )}

        <p className="text-[11px] opacity-80 pt-1">
          Reference: {item.sourceReference || 'AMLDecode Compliance Reference'} ? Jurisdiction: {item.jurisdiction || 'Global'}
        </p>

        <div className="pt-2 flex flex-wrap items-center gap-3">
          {typeof item.relatedNoteIndex === 'number' && typeof onOpenRelatedNote === 'function' && (
            <button
              type="button"
              onClick={() => onOpenRelatedNote(item.relatedNoteIndex)}
              className="px-3.5 py-2 rounded-lg bg-white/15 hover:bg-white/25 text-xs font-bold transition-colors cursor-pointer"
            >
              Study {item.relatedArticleTitle || 'Related AML Module'} </button>
          )}
          {typeof onOpenKnowledgeTest === 'function' && (
            <button
              type="button"
              onClick={onOpenKnowledgeTest}
              className="px-3.5 py-2 rounded-lg bg-black/25 hover:bg-black/40 text-xs font-bold transition-colors cursor-pointer"
            >
              Open Knowledge Test
            </button>
          )}
          {!isPractice && (
            <button
              type="button"
              onClick={handleShareAchievement}
              className="px-3.5 py-2 rounded-lg bg-black/25 hover:bg-black/40 text-xs font-bold transition-colors cursor-pointer"
            >
              Share Achievement
            </button>
          )}
        </div>

        {shareStatus && (
          <p className="text-xs font-semibold opacity-95 pt-1">{shareStatus}</p>
        )}
      </div>
    );
  };

  return (
    <section
      aria-label="AMLDecode Daily Intelligence Challenge"
      className={`rounded-2xl bg-[#0B1B32] text-[#F8FAFC] border border-white/15 shadow-xl overflow-hidden ${
        compact ? 'my-4' : 'my-6'
      }`}
    >
      {/* Top Header & Gamification Summary */}
      <div className="p-5 sm:p-7 border-b border-white/10 space-y-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#93C5FD]">
              <span>AMLDecode Daily Intelligence Challenge</span>
              <span></span>
              <span>{istDisplayDate} (IST)</span>
            </div>
            <p className="text-sm text-[#CBD5E1]">
              One challenge every day. Sharpen your financial crime investigation skills.
            </p>
          </div>
        </div>

        {/* XP, Level, Streak & Next Milestone Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
          <div className="p-3 rounded-xl bg-[#122640] border border-white/10">
            <p className="text-[#94A3B8] text-[11px]">Level & XP</p>
            <p className="font-extrabold text-[#F8FAFC] mt-0.5">
              Lv.{levelInfo.level} ? {gamification.totalXp || 0} XP
            </p>
            <p className="text-[11px] text-[#93C5FD] mt-0.5">{levelInfo.title}</p>
          </div>
          <div className="p-3 rounded-xl bg-[#122640] border border-white/10">
            <p className="text-[#94A3B8] text-[11px]">IST Streak</p>
            <p className="font-extrabold text-[#F8FAFC] mt-0.5">
              {Math.max(streakStats.currentStreak || 0, gamification.currentStreak || 0)} Days
            </p>
            <p className="text-[11px] text-[#CBD5E1] mt-0.5">
              Best: {Math.max(streakStats.currentStreak || 0, gamification.longestStreak || 0)}d
            </p>
          </div>
          <div className="p-3 rounded-xl bg-[#122640] border border-white/10">
            <p className="text-[#94A3B8] text-[11px]">Next Streak Goal</p>
            <p className="font-extrabold text-[#F8FAFC] mt-0.5">
              {nextMilestone.targetDays}-Day (+{nextMilestone.bonusXp} XP)
            </p>
            <p className="text-[11px] text-[#CBD5E1] mt-0.5">
              {nextMilestone.remainingDays}d remaining
            </p>
          </div>
          <div className="p-3 rounded-xl bg-[#122640] border border-white/10">
            <p className="text-[#94A3B8] text-[11px]">Rotation & Inventory</p>
            <p className="font-extrabold text-[#F8FAFC] mt-0.5">
              {engineSelection.reserveCount} Ready Items
            </p>
            <p className="text-[11px] text-[#CBD5E1] mt-0.5">{countdownText}</p>
          </div>
        </div>

        {/* Mode Tabs */}
        <div className="flex flex-wrap gap-2 pt-1" role="tablist" aria-label="Challenge sections">
          {[
            { id: 'today', label: "Today's Challenge" },
            { id: 'adaptive', label: 'Adaptive Practice' },
            { id: 'leaderboard', label: 'Leaderboards' },
            { id: 'archive', label: 'Archive' },
            { id: 'history', label: `History (${streakStats.totalCompleted})` },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={activeTab === tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                activeTab === tab.id
                  ? 'bg-[#2563EB] text-white'
                  : 'bg-[#122640] text-[#CBD5E1] hover:text-white border border-white/10'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab 1: Today's Challenge */}
      {activeTab === 'today' && activeChallenge && (
        <div className="p-5 sm:p-8 space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-1 rounded-md bg-[#122640] border border-white/15 font-bold text-[#93C5FD]">
                {activeChallenge.category || activeChallenge.topic}
              </span>
              <span className="px-2.5 py-1 rounded-md bg-[#122640] border border-white/15 font-semibold text-[#CBD5E1]">
                {activeChallenge.difficulty || 'Intermediate'}
              </span>
              <span className="px-2.5 py-1 rounded-md bg-[#122640] border border-white/15 font-semibold text-[#A7F3D0]">
                Up to +60 XP Today
              </span>
            </div>          </div>

          <h3 className="text-base sm:text-xl font-bold text-[#F8FAFC] leading-relaxed">{activeChallenge.statement}</h3>

          {renderTwoButtons(selectedAnswer, correctAnswerBool, hasAnsweredToday, handleSelectDailyAnswer)}

          {hasAnsweredToday && (
            <p className="text-xs text-[#94A3B8]">
              Your answer ({formatChoiceLabel(selectedAnswer)}) is locked for today&apos;s challenge so scoring stays fair and deterministic.
            </p>
          )}

          {renderStructuredExplanation(activeChallenge, selectedAnswer, false)}

          {/* Unlocked Achievements Strip */}
          {Array.isArray(gamification.unlockedAchievements) && gamification.unlockedAchievements.length > 0 && (
            <div className="pt-2 flex flex-wrap items-center gap-2 text-xs">
              <span className="text-[#94A3B8] font-semibold">Achievements Unlocked:</span>
              {gamification.unlockedAchievements.map((code) => (
                <span
                  key={code}
                  className="px-2.5 py-1 rounded-full bg-[#122640] border border-[#60A5FA]/40 text-[#93C5FD] font-bold"
                >
                  {code.replace(/_/g, ' ')}
                </span>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Adaptive Weak-Topic Practice (Separate from Daily XP) */}
      {activeTab === 'adaptive' && (
        <div className="p-5 sm:p-8 space-y-5">
          <div className="space-y-2">
            <p className="text-xs font-bold uppercase tracking-wider text-[#93C5FD]">
              Adaptive Practice & Weak-Topic Focus (Practice Mode ? Separate from Official Daily Challenge)
            </p>
            <div className="flex flex-wrap gap-2">
              {adaptiveRecs.map((rec) => (
                <button
                  key={rec.category}
                  type="button"
                  onClick={() => {
                    setPracticeTopic(rec.category);
                    setPracticeIndex(0);
                    setPracticeChoice(null);
                  }}
                  className="px-3 py-1.5 rounded-lg bg-[#122640] hover:bg-[#183254] border border-white/15 text-xs font-semibold text-[#F8FAFC] cursor-pointer"
                >
                  Focus: {rec.category}{' '}
                  {typeof rec.accuracy === 'number' ? `(${rec.accuracy}%)` : '(Recommended)'}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3">
            <select
              aria-label="Filter practice domain"
              value={practiceTopic}
              onChange={(e) => {
                setPracticeTopic(e.target.value);
                setPracticeIndex(0);
                setPracticeChoice(null);
              }}
              className="px-3 py-2 rounded-lg bg-[#122640] border border-white/15 text-xs text-[#F8FAFC]"
            >
              <option value="All">All 20 AML Domains</option>
              {TWENTY_AML_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>

            {practiceList.length > 1 && (
              <button
                type="button"
                onClick={() => {
                  setPracticeIndex((prev) => (prev + 1) % practiceList.length);
                  setPracticeChoice(null);
                }}
                className="px-3.5 py-2 rounded-lg bg-[#122640] hover:bg-[#183254] border border-white/15 text-xs font-bold text-[#F8FAFC] cursor-pointer"
              >
                Next Practice Question ({((practiceIndex % practiceList.length) + 1)}/{practiceList.length}) </button>
            )}
          </div>

          {activePracticeChallenge && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-xs text-[#93C5FD] font-bold">
                <span>{activePracticeChallenge.category || activePracticeChallenge.topic}</span>
                <span></span>
                <span className="text-[#CBD5E1]">{activePracticeChallenge.difficulty}</span>
              </div>
              <h3 className="text-base sm:text-lg font-bold text-[#F8FAFC] leading-relaxed">{activePracticeChallenge.statement}</h3>
              {renderTwoButtons(
                practiceChoice,
                Boolean(activePracticeChallenge.correctAnswer),
                typeof practiceChoice === 'boolean',
                (val) => setPracticeChoice(val)
              )}
              {renderStructuredExplanation(activePracticeChallenge, practiceChoice, true)}
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Opt-In Leaderboards */}
      {activeTab === 'leaderboard' && (
        <div className="p-5 sm:p-8 space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex gap-2">
              {[
                { id: 'weekly', label: 'Weekly' },
                { id: 'monthly', label: 'Monthly' },
                { id: 'all-time', label: 'All-Time' },
              ].map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setLeaderboardPeriod(p.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer ${
                    leaderboardPeriod === p.id
                      ? 'bg-[#2563EB] text-white'
                      : 'bg-[#122640] text-[#CBD5E1] border border-white/10'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
            <span className="text-[11px] text-[#94A3B8]">
              Opt-in display names only ? Emails & phone numbers never shown
            </span>
          </div>

          {/* Opt-in controls */}
          <div className="p-4 rounded-xl bg-[#122640] border border-white/10 flex flex-wrap items-center gap-3 text-xs">
            <label className="flex items-center gap-2 font-semibold text-[#F8FAFC] cursor-pointer">
              <input
                type="checkbox"
                checked={Boolean(gamification.leaderboardOptIn)}
                onChange={(e) => handleUpdateLeaderboardOptIn(e.target.checked, gamification.displayName)}
              />
              <span>Opt in to public leaderboard</span>
            </label>
            <input
              type="text"
              placeholder="Public display name (e.g. RiskAnalyst_01)"
              value={gamification.displayName || ''}
              onChange={(e) => handleUpdateLeaderboardOptIn(gamification.leaderboardOptIn, e.target.value)}
              className="px-3 py-1.5 rounded-lg bg-[#0B1B32] border border-white/15 text-[#F8FAFC] text-xs"
            />
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-white/10 text-[#94A3B8]">
                  <th className="py-2.5 px-3">Rank</th>
                  <th className="py-2.5 px-3">Analyst Handle</th>
                  <th className="py-2.5 px-3">Badge</th>
                  <th className="py-2.5 px-3">Completed</th>
                  <th className="py-2.5 px-3 text-right">XP</th>
                </tr>
              </thead>
              <tbody>
                {leaderboardRows.map((row) => (
                  <tr
                    key={`${row.rank}-${row.displayName}`}
                    className={`border-b border-white/5 ${row.isCurrentUser ? 'bg-[#173152] font-bold' : ''}`}
                  >
                    <td className="py-2.5 px-3">#{row.rank}</td>
                    <td className="py-2.5 px-3 text-[#F8FAFC]">{row.displayName}</td>
                    <td className="py-2.5 px-3 text-[#93C5FD]">{row.badge}</td>
                    <td className="py-2.5 px-3 text-[#CBD5E1]">{row.completed}</td>
                    <td className="py-2.5 px-3 text-right text-[#A7F3D0]">{row.xp} XP</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 4: Archive */}
      {activeTab === 'archive' && (
        <div className="p-5 sm:p-8 space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-xs font-bold uppercase tracking-wider text-[#94A3B8]">
              Previous Verified Challenges Archive
            </p>
            <select
              aria-label="Select archived challenge"
              value={activeArchiveChallenge?.id || ''}
              onChange={(e) => {
                setSelectedArchiveId(e.target.value);
                setArchiveChoice(null);
              }}
              className="px-3 py-2 rounded-lg bg-[#122640] text-[#F8FAFC] border border-white/15 text-xs"
            >
              {archiveList.map((item) => (
                <option key={item.id} value={item.id}>
                  [{item.category || item.topic}] {item.statement.slice(0, 68)}...
                </option>
              ))}
            </select>
          </div>

          {activeArchiveChallenge && (
            <div className="space-y-4">
              <h3 className="text-base sm:text-lg font-bold text-[#F8FAFC] leading-relaxed">{activeArchiveChallenge.statement}</h3>
              {renderTwoButtons(
                archiveChoice,
                Boolean(activeArchiveChallenge.correctAnswer),
                typeof archiveChoice === 'boolean',
                (val) => setArchiveChoice(val)
              )}
              {renderStructuredExplanation(activeArchiveChallenge, archiveChoice, true)}
            </div>
          )}
        </div>
      )}

      {/* Tab 5: Completion History */}
      {activeTab === 'history' && (
        <div className="p-5 sm:p-8 space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <p className="text-xs font-bold uppercase tracking-wider text-[#94A3B8]">
              Completed Challenges ({learner?.email ? learner.email : 'Browser Session'})
            </p>
            <span className="text-xs text-[#CBD5E1]">
              {streakStats.totalCorrect} / {streakStats.totalCompleted} Correct
            </span>
          </div>

          {historyEntries.length === 0 ? (
            <p className="text-sm text-[#94A3B8]">
              No daily challenges completed yet. Select Correct or Incorrect on Today&apos;s Challenge to begin.
            </p>
          ) : (
            <ul className="space-y-2.5">
              {historyEntries.slice(0, 12).map((entry, idx) => (
                <li
                  key={`${entry.publication_date_ist}_${entry.question_id}_${idx}`}
                  className="p-3.5 rounded-xl bg-[#122640] border border-white/10 flex items-center justify-between gap-3 text-xs"
                >
                  <div className="space-y-1">
                    <p className="font-bold text-[#F8FAFC]">
                      {entry.publication_date_ist} ? {entry.topic || 'Challenge'}
                    </p>
                    <p className="text-[#CBD5E1] line-clamp-1">{entry.statement}</p>
                  </div>
                  <span
                    className={`px-2.5 py-1 rounded font-bold shrink-0 ${
                      entry.is_correct
                        ? 'bg-[#063B2C] text-[#A7F3D0] border border-[#34D399]/50'
                        : 'bg-[#461322] text-[#FECDD3] border border-[#FB7185]/50'
                    }`}
                  >
                    {entry.is_correct ? 'Correct' : 'Incorrect'}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </section>
  );
}
