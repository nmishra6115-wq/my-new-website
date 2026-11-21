import { useMemo, useState, useEffect } from 'react';
import { getIstDateInfo, selectDailyChallengeForDate } from '../data/dailyChallengeBank';
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

const ANSWER_STORAGE_PREFIX = 'amldecode_dkc_answer_v1_';
const STREAK_OPT_IN_KEY = 'amldecode_dkc_show_streak_v1';

const PRACTICE_TOPICS = [
  'All',
  'AML',
  'KYC',
  'Transaction Monitoring',
  'SAR',
  'Sanctions & PEP',
  'Advanced Investigation',
];

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

function readStreakOptIn() {
  try {
    return window.localStorage.getItem(STREAK_OPT_IN_KEY) === 'true';
  } catch {
    return false;
  }
}

function formatBooleanChoice(val) {
  return val ? 'CORRECT' : 'INCORRECT';
}

export default function DailyChallengeCard({
  challenge: providedChallenge,
  learner = null,
  compact = false,
  onOpenRelatedNote,
  onOpenKnowledgeTest,
}) {
  const istInfo = useMemo(() => getIstDateInfo(new Date()), []);
  const fallbackChallenge = useMemo(
    () => selectDailyChallengeForDate(istInfo.dateIsoIst, istInfo.rotationTopic),
    [istInfo.dateIsoIst, istInfo.rotationTopic]
  );

  const dateTopicKey = `${istInfo.dateIsoIst}_${istInfo.rotationTopic}`;
  const [loadedByDateTopic, setLoadedByDateTopic] = useState({});
  const [storedByKey, setStoredByKey] = useState({});
  const [activeTab, setActiveTab] = useState('today');
  const [practiceTopic, setPracticeTopic] = useState('All');
  const [practiceIndex, setPracticeIndex] = useState(0);
  const [practiceChoice, setPracticeChoice] = useState(null);
  const [selectedArchiveId, setSelectedArchiveId] = useState('');
  const [archiveChoice, setArchiveChoice] = useState(null);
  const [historyEntries, setHistoryEntries] = useState(() => readLocalChallengeHistory());
  const [showStreak, setShowStreak] = useState(() => readStreakOptIn());

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
  }, [providedChallenge, dateTopicKey, istInfo.dateIsoIst, istInfo.rotationTopic]);

  useEffect(() => {
    let mounted = true;
    fetchChallengeHistoryWithFallback(learner).then((entries) => {
      if (mounted && Array.isArray(entries) && entries.length > 0) {
        setHistoryEntries(entries);
      }
    });
    return () => {
      mounted = false;
    };
  }, [learner]);

  const challenge =
    providedChallenge ||
    (Object.prototype.hasOwnProperty.call(loadedByDateTopic, dateTopicKey)
      ? loadedByDateTopic[dateTopicKey]
      : fallbackChallenge);

  const storageKey = challenge ? `${ANSWER_STORAGE_PREFIX}${istInfo.dateIsoIst}_${challenge.id}` : '';
  const archiveList = useMemo(
    () => getArchiveChallenges(undefined, challenge?.id || ''),
    [challenge?.id]
  );
  const activeArchiveChallenge = useMemo(
    () => archiveList.find((q) => q.id === selectedArchiveId) || archiveList[0] || null,
    [archiveList, selectedArchiveId]
  );

  const practicePool = useMemo(
    () => getTopicPracticeQuestions(undefined, practiceTopic),
    [practiceTopic]
  );
  const safePracticeIndex = practicePool.length > 0 ? practiceIndex % practicePool.length : 0;
  const currentPracticeQ = practicePool[safePracticeIndex] || null;

  const streakStats = useMemo(
    () => computeHonestCompletionStreak(historyEntries, istInfo.dateIsoIst),
    [historyEntries, istInfo.dateIsoIst]
  );

  if (!challenge) return null;

  const selectedChoice =
    Object.prototype.hasOwnProperty.call(storedByKey, storageKey)
      ? storedByKey[storageKey]
      : readStoredChoice(storageKey);

  const isLocked = selectedChoice === true || selectedChoice === false;
  const verifiedAnswer = Boolean(challenge.correctAnswer);
  const isCorrect = isLocked && selectedChoice === verifiedAnswer;

  const handleToggleStreak = () => {
    setShowStreak((prev) => {
      const next = !prev;
      try {
        window.localStorage.setItem(STREAK_OPT_IN_KEY, String(next));
      } catch {
        // Ignore storage quota errors
      }
      return next;
    });
  };

  const handleSelect = (choiceBool) => {
    if (isLocked || !storageKey) return;
    setStoredByKey((prev) => ({ ...prev, [storageKey]: choiceBool }));
    try {
      window.localStorage.setItem(storageKey, String(choiceBool));
    } catch {
      // Ignore storage quota errors
    }

    const attemptOutcome = choiceBool === verifiedAnswer;
    const newHistoryRow = {
      publication_date_ist: istInfo.dateIsoIst,
      question_id: challenge.id,
      topic: challenge.topic,
      statement: challenge.statement,
      selected_answer: choiceBool,
      is_correct: attemptOutcome,
      answered_at: new Date().toISOString(),
    };

    setHistoryEntries((prev) => {
      const updated = mergeChallengeHistoryEntry(prev, newHistoryRow);
      writeLocalChallengeHistory(updated);
      return updated;
    });

    recordDailyChallengeAttempt({
      dateIsoIst: istInfo.dateIsoIst,
      challenge,
      selectedAnswer: choiceBool,
      learner,
    });
  };

  const getOptionButtonStyle = (optionBool, currentChoice, itemVerified, lockedMode) => {
    const isPicked = currentChoice === optionBool;
    const isRightOption = lockedMode && itemVerified === optionBool;

    if (!lockedMode) {
      return 'bg-[#122640] border-white/15 text-[#F8FAFC] hover:border-[#E5B869]/75 hover:bg-[#172F4F] cursor-pointer';
    }

    if (isPicked) {
      const pickedIsRight = optionBool === itemVerified;
      return pickedIsRight
        ? 'bg-[#063B2C] border-[#34D399] text-[#ECFDF5] ring-2 ring-[#34D399]/40'
        : 'bg-[#461322] border-[#FB7185] text-[#FFF1F2] ring-2 ring-[#FB7185]/40';
    }

    if (isRightOption) {
      return 'bg-[#063B2C]/70 border-[#34D399]/65 text-[#D1FAE5]';
    }

    return 'bg-[#0E1D31] border-white/10 text-[#7C8FA6] cursor-not-allowed';
  };

  const renderChoicePair = (currentChoice, itemVerified, lockedMode, onPick) => (
    <div
      className="grid grid-cols-1 sm:grid-cols-2 gap-3.5"
      role="group"
      aria-label="Choose whether statement is Correct or Incorrect"
    >
      {[
        { value: true, text: '[✓ CORRECT]', icon: 'check' },
        { value: false, text: '[✕ INCORRECT]', icon: 'cross' },
      ].map((opt) => {
        const isPicked = currentChoice === opt.value;
        const pickedIsRight = isPicked && opt.value === itemVerified;
        const pickedIsWrong = isPicked && opt.value !== itemVerified;
        const showsActualBadge = lockedMode && !isPicked && itemVerified === opt.value;

        return (
          <button
            key={String(opt.value)}
            type="button"
            disabled={lockedMode}
            onClick={() => onPick(opt.value)}
            aria-pressed={isPicked}
            className={`dkc-choice-btn min-h-[54px] px-5 py-3.5 rounded-xl border text-left flex items-center justify-between gap-3 font-bold text-sm sm:text-base ${getOptionButtonStyle(
              opt.value,
              currentChoice,
              itemVerified,
              lockedMode
            )}`}
          >
            <span className="inline-flex items-center gap-2.5">
              {opt.icon === 'check' ? (
                <svg
                  className="w-5 h-5 shrink-0 text-[#34D399]"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.3"
                  aria-hidden="true"
                >
                  <circle cx="12" cy="12" r="9" />
                  <path d="M8.5 12.5l2.3 2.3 4.7-5.3" />
                </svg>
              ) : (
                <svg
                  className="w-5 h-5 shrink-0 text-[#FB7185]"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.3"
                  aria-hidden="true"
                >
                  <circle cx="12" cy="12" r="9" />
                  <path d="M15 9l-6 6M9 9l6 6" />
                </svg>
              )}
              <span>{opt.text}</span>
            </span>

            {pickedIsRight && (
              <span className="text-[11px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-md bg-[#10B981]/25 text-[#A7F3D0] border border-[#34D399]/50">
                Your Pick · Right
              </span>
            )}
            {pickedIsWrong && (
              <span className="text-[11px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-md bg-[#F43F5E]/25 text-[#FECDD3] border border-[#FB7185]/50">
                Your Pick · Not Right
              </span>
            )}
            {showsActualBadge && (
              <span className="text-[11px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-md bg-[#10B981]/20 text-[#A7F3D0] border border-[#34D399]/40">
                Correct Answer
              </span>
            )}
          </button>
        );
      })}
    </div>
  );

  const renderFeedbackBox = (item, userChoice, lockedLabel = '') => {
    if (userChoice !== true && userChoice !== false) return null;
    const itemVerified = Boolean(item.correctAnswer);
    const itemCorrect = userChoice === itemVerified;

    return (
      <div
        role="status"
        aria-live="polite"
        className={`dkc-feedback-pop rounded-xl p-4 sm:p-5 border space-y-3 ${
          itemCorrect
            ? 'bg-[#072F24] border-[#34D399]/50'
            : 'bg-[#361220] border-[#FB7185]/50'
        }`}
      >
        <div className="flex items-start justify-between gap-2.5 flex-wrap">
          <div className="space-y-0.5">
            <p className="text-sm sm:text-base font-extrabold text-[#F8FAFC]">
              {itemCorrect
                ? `Your Selection (${formatBooleanChoice(userChoice)}) is Correct`
                : `Your Selection (${formatBooleanChoice(userChoice)}) is Not Correct`}
              {lockedLabel ? ` · ${lockedLabel}` : ''}
            </p>
            <p className="text-xs text-[#CBD5E1]">
              You selected: <strong>{formatBooleanChoice(userChoice)}</strong> · Verified Answer:{' '}
              <strong>{formatBooleanChoice(itemVerified)}</strong>
            </p>
          </div>
          <span
            className={`text-xs font-extrabold px-3 py-1 rounded-md border ${
              itemCorrect
                ? 'bg-[#10B981]/20 text-[#A7F3D0] border-[#34D399]/50'
                : 'bg-[#FB7185]/20 text-[#FFE4E6] border-[#FB7185]/50'
            }`}
          >
            {itemCorrect ? '✓ CORRECT' : '✕ NOT CORRECT'}
          </span>
        </div>

        <p className="text-sm text-[#F1F5F9] leading-relaxed">{item.explanation}</p>

        {item.sourceReference && (
          <p className="text-xs text-[#CBD5E1]">
            <strong className="text-[#E5B869]">Source Reference:</strong> {item.sourceReference}
          </p>
        )}

        {typeof item.relatedNoteIndex === 'number' && typeof onOpenRelatedNote === 'function' && (
          <div className="pt-2 border-t border-white/15">
            <button
              type="button"
              onClick={() => onOpenRelatedNote(item.relatedNoteIndex)}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[#E5B869] hover:underline cursor-pointer"
            >
              <span>Study: {item.relatedArticleTitle || 'Related AMLDecode Module'} →</span>
            </button>
          </div>
        )}
      </div>
    );
  };

  return (
    <article
      aria-label="AMLDecode AI Daily Knowledge Challenge"
      className={`dkc-card-enter rounded-2xl bg-[#0B192C] border border-white/15 shadow-md overflow-hidden ${
        compact ? 'max-w-5xl mx-auto' : ''
      }`}
    >
      {/* Top Bar */}
      <div className="px-5 sm:px-7 py-4 bg-[#081322] border-b border-white/10 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center justify-center w-9 h-9 rounded-xl bg-[#E5B869]/12 border border-[#E5B869]/35 text-[#E5B869]">
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.1" aria-hidden="true">
              <path d="M12 3l1.9 4.6L18.5 9.5l-4.6 1.9L12 16l-1.9-4.6L5.5 9.5l4.6-1.9L12 3z" />
              <path d="M19 15l.9 2.1L22 18l-2.1.9L19 21l-.9-2.1L16 18l2.1-.9L19 15z" />
            </svg>
          </span>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#E5B869]">
                AMLDecode AI
              </span>
              <span className="text-[#64748B]" aria-hidden="true">•</span>
              <span className="text-xs sm:text-sm font-bold text-[#F8FAFC]">
                Daily Knowledge Challenge
              </span>
            </div>
            <p className="text-xs text-[#94A3B8] mt-0.5">
              IST Date: <strong className="text-[#E2E8F0]">{istInfo.displayDateIst}</strong>
              {challenge.jurisdiction ? ` · ${challenge.jurisdiction}` : ''}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-[#132742] text-[#F8FAFC] border border-[#E5B869]/30">
            {challenge.topic}
          </span>
          <span
            className={`px-3 py-1 rounded-full text-xs font-semibold border ${
              isLocked
                ? isCorrect
                  ? 'bg-[#063B2C] text-[#A7F3D0] border-[#34D399]/45'
                  : 'bg-[#461322] text-[#FECDD3] border-[#FB7185]/45'
                : 'bg-[#11223A] text-[#CBD5E1] border-white/10'
            }`}
          >
            {isLocked ? (isCorrect ? 'Completed · Correct (1/1)' : 'Completed · Not Right (1/1)') : 'Unanswered (0/1)'}
          </span>
          <button
            type="button"
            onClick={handleToggleStreak}
            className="px-2.5 py-1 rounded-full text-xs font-medium bg-[#11223A] text-[#E2E8F0] border border-white/10 hover:border-[#E5B869]/45 cursor-pointer"
          >
            {showStreak
              ? `Recorded Streak: ${streakStats.currentStreak}d`
              : 'Show Streak'}
          </button>
        </div>
      </div>

      {/* Mode Switcher Bar */}
      <div className="px-5 sm:px-7 py-2.5 bg-[#091628] border-b border-white/10 flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="flex flex-wrap items-center gap-1.5" role="tablist" aria-label="Daily Knowledge Challenge sections">
          {[
            { id: 'today', label: "Today's Challenge" },
            { id: 'practice', label: 'Topic Practice' },
            { id: 'archive', label: 'Previous Archive' },
            { id: 'history', label: `History (${streakStats.totalCompleted})` },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={activeTab === tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-colors cursor-pointer ${
                activeTab === tab.id
                  ? 'bg-[#E5B869] text-[#071222]'
                  : 'text-[#CBD5E1] hover:bg-[#122640]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
        {showStreak && (
          <span className="text-xs text-[#CBD5E1]">
            Recorded Completions: <strong>{streakStats.totalCompleted}</strong> · Correct:{' '}
            <strong>{streakStats.totalCorrect}</strong>
          </span>
        )}
      </div>

      {/* Progress Indicator Bar */}
      <div className="w-full h-1 bg-[#11223A]" aria-hidden="true">
        <div
          className={`h-full transition-all duration-300 ${
            isLocked ? (isCorrect ? 'w-full bg-[#34D399]' : 'w-full bg-[#FB7185]') : 'w-1/3 bg-[#E5B869]'
          }`}
        />
      </div>

      {/* Tab 1: Today's Challenge */}
      {activeTab === 'today' && (
        <div className="p-6 sm:p-8 space-y-6">
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wider text-[#94A3B8]">
              Evaluate Statement · {challenge.difficulty}
            </p>
            <h3 className="text-lg sm:text-2xl font-bold text-[#F8FAFC] leading-relaxed">
              “{challenge.statement}”
            </h3>
          </div>

          {renderChoicePair(selectedChoice, verifiedAnswer, isLocked, handleSelect)}

          {isLocked && (
            <div className="space-y-3">
              {renderFeedbackBox(challenge, selectedChoice, 'Answer Locked')}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-1 text-xs text-[#94A3B8]">
                <span>Answer is locked for today&apos;s IST challenge.</span>
                {compact && typeof onOpenKnowledgeTest === 'function' && (
                  <button
                    type="button"
                    onClick={onOpenKnowledgeTest}
                    className="font-semibold text-[#E5B869] hover:underline cursor-pointer"
                  >
                    Open Full Knowledge Test &amp; Modes →
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Topic-Based Practice Mode */}
      {activeTab === 'practice' && currentPracticeQ && (
        <div className="p-6 sm:p-8 space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap gap-1.5">
              {PRACTICE_TOPICS.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => {
                    setPracticeTopic(t);
                    setPracticeIndex(0);
                    setPracticeChoice(null);
                  }}
                  className={`px-2.5 py-1 rounded-md text-xs font-semibold cursor-pointer ${
                    practiceTopic === t
                      ? 'bg-[#162D4C] text-[#E5B869] border border-[#E5B869]/50'
                      : 'bg-[#122640] text-[#CBD5E1] border border-white/10'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
            <span className="text-xs text-[#94A3B8]">
              Item {safePracticeIndex + 1} of {practicePool.length}
            </span>
          </div>

          <h3 className="text-lg sm:text-xl font-bold text-[#F8FAFC] leading-relaxed">
            “{currentPracticeQ.statement}”
          </h3>

          {renderChoicePair(
            practiceChoice,
            Boolean(currentPracticeQ.correctAnswer),
            false,
            (val) => setPracticeChoice(val)
          )}

          {renderFeedbackBox(currentPracticeQ, practiceChoice)}

          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => {
                setPracticeIndex((idx) => (idx + 1) % practicePool.length);
                setPracticeChoice(null);
              }}
              className="px-4 py-2 rounded-lg text-xs font-bold bg-[#162D4C] text-[#F8FAFC] border border-white/15 hover:border-[#E5B869] cursor-pointer"
            >
              Next Practice Statement →
            </button>
          </div>
        </div>
      )}

      {/* Tab 3: Previous Question Archive */}
      {activeTab === 'archive' && (
        <div className="p-6 sm:p-8 space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-xs font-semibold uppercase tracking-wider text-[#94A3B8]">
              Previous Verified Statements Archive
            </p>
            <select
              aria-label="Select archived challenge statement"
              value={activeArchiveChallenge?.id || ''}
              onChange={(e) => {
                setSelectedArchiveId(e.target.value);
                setArchiveChoice(null);
              }}
              className="px-3 py-2 rounded-lg bg-[#122640] text-[#F8FAFC] border border-white/15 text-xs"
            >
              {archiveList.map((item) => (
                <option key={item.id} value={item.id}>
                  [{item.topic}] {item.statement.slice(0, 68)}...
                </option>
              ))}
            </select>
          </div>

          {activeArchiveChallenge && (
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-[#F8FAFC] leading-relaxed">
                “{activeArchiveChallenge.statement}”
              </h3>
              {renderChoicePair(
                archiveChoice,
                Boolean(activeArchiveChallenge.correctAnswer),
                false,
                (val) => setArchiveChoice(val)
              )}
              {renderFeedbackBox(activeArchiveChallenge, archiveChoice)}
            </div>
          )}
        </div>
      )}

      {/* Tab 4: Genuine Completion History */}
      {activeTab === 'history' && (
        <div className="p-6 sm:p-8 space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <p className="text-xs font-semibold uppercase tracking-wider text-[#94A3B8]">
              Your Recorded Challenge History ({learner?.email ? learner.email : 'Local Browser Session'})
            </p>
            <span className="text-xs text-[#CBD5E1]">
              {streakStats.totalCorrect} / {streakStats.totalCompleted} Correct
            </span>
          </div>

          {historyEntries.length === 0 ? (
            <p className="text-sm text-[#94A3B8]">
              No daily challenges completed yet. Select [✓ CORRECT] or [✕ INCORRECT] on Today&apos;s Challenge to record your first attempt.
            </p>
          ) : (
            <ul className="space-y-2.5">
              {historyEntries.slice(0, 10).map((entry, idx) => (
                <li
                  key={`${entry.publication_date_ist}_${entry.question_id}_${idx}`}
                  className="p-3.5 rounded-xl bg-[#122640] border border-white/10 flex items-center justify-between gap-3 text-xs"
                >
                  <div className="space-y-1">
                    <p className="font-bold text-[#F8FAFC]">
                      {entry.publication_date_ist} · {entry.topic || 'Challenge'}
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
                    {entry.is_correct ? 'Correct' : 'Not Correct'}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </article>
  );
}
