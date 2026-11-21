import { VERIFIED_DAILY_CHALLENGES, resolveRelatedNoteIndex } from './dailyChallengeBank';

const HISTORY_STORAGE_KEY = 'amldecode_dkc_history_v1';

export function readLocalChallengeHistory() {
  try {
    const raw = window.localStorage.getItem(HISTORY_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function writeLocalChallengeHistory(entries) {
  try {
    window.localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(entries.slice(0, 100)));
  } catch {
    // Ignore storage quota errors
  }
}

export function mergeChallengeHistoryEntry(existingList, newEntry) {
  const list = Array.isArray(existingList) ? existingList : [];
  const filtered = list.filter(
    (item) =>
      !(
        item.publication_date_ist === newEntry.publication_date_ist &&
        item.question_id === newEntry.question_id
      )
  );
  return [newEntry, ...filtered].sort((a, b) =>
    String(b.publication_date_ist || '').localeCompare(String(a.publication_date_ist || ''))
  );
}

function parseIsoDateToUtcDay(dateIso) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(dateIso || '').trim());
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]) - 1;
  const day = Number(match[3]);
  return Math.floor(Date.UTC(year, month, day) / 86400000);
}

/**
 * Computes consecutive daily completion streak strictly from the user's own
 * recorded completion dates (in IST ISO YYYY-MM-DD format). Never fabricates streaks.
 */
export function computeHonestCompletionStreak(historyEntries = [], referenceDateIsoIst = '') {
  const dayNumbers = Array.from(
    new Set(
      (Array.isArray(historyEntries) ? historyEntries : [])
        .map((entry) => parseIsoDateToUtcDay(entry.publication_date_ist))
        .filter((n) => typeof n === 'number')
    )
  ).sort((a, b) => b - a);

  if (dayNumbers.length === 0) {
    return { currentStreak: 0, totalCompleted: 0, totalCorrect: 0 };
  }

  const totalCompleted = Array.isArray(historyEntries) ? historyEntries.length : 0;
  const totalCorrect = Array.isArray(historyEntries)
    ? historyEntries.filter((e) => Boolean(e.is_correct)).length
    : 0;

  const refDay = parseIsoDateToUtcDay(referenceDateIsoIst);
  const latestDay = dayNumbers[0];

  // If user has not completed today or yesterday relative to IST date, active streak is 0
  if (typeof refDay === 'number' && refDay - latestDay > 1) {
    return { currentStreak: 0, totalCompleted, totalCorrect };
  }

  let streak = 1;
  for (let i = 1; i < dayNumbers.length; i += 1) {
    if (dayNumbers[i - 1] - dayNumbers[i] === 1) {
      streak += 1;
    } else {
      break;
    }
  }

  return { currentStreak: streak, totalCompleted, totalCorrect };
}

export function getArchiveChallenges(pool = VERIFIED_DAILY_CHALLENGES, currentQuestionId = '') {
  const list = Array.isArray(pool) && pool.length > 0 ? pool : VERIFIED_DAILY_CHALLENGES;
  return list
    .filter((q) => q.id !== currentQuestionId)
    .map((q) => ({
      ...q,
      relatedNoteIndex: resolveRelatedNoteIndex(q.relatedNoteIndex ?? q.related_note_index, q.topic),
    }));
}

export function getTopicPracticeQuestions(pool = VERIFIED_DAILY_CHALLENGES, topic = 'All') {
  const list = Array.isArray(pool) && pool.length > 0 ? pool : VERIFIED_DAILY_CHALLENGES;
  const normalized = list.map((q) => ({
    ...q,
    correctAnswer:
      typeof q.correctAnswer === 'boolean' ? q.correctAnswer : Boolean(q.correct_answer),
    sourceReference: q.sourceReference || q.source_references,
    relatedNoteIndex: resolveRelatedNoteIndex(q.relatedNoteIndex ?? q.related_note_index, q.topic),
  }));

  if (!topic || topic === 'All') return normalized;
  return normalized.filter((q) => String(q.topic || '').toLowerCase() === topic.toLowerCase());
}
