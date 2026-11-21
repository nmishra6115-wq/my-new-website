import {
  DAILY_TOPIC_ROTATION,
  VERIFIED_DAILY_CHALLENGES,
  getIstDateInfo,
  resolveRelatedNoteIndex,
} from './dailyChallengeBank';

export const RESERVE_POOL_TARGET = 30;
export const REPLENISHMENT_THRESHOLD = 10;

export function normalizeRotationSchedule(customSchedule = null) {
  if (!customSchedule || typeof customSchedule !== 'object') {
    return { ...DAILY_TOPIC_ROTATION };
  }
  const merged = { ...DAILY_TOPIC_ROTATION };
  for (const day of Object.keys(DAILY_TOPIC_ROTATION)) {
    const val = customSchedule[day];
    if (typeof val === 'string' && val.trim().length > 0) {
      merged[day] = val.trim();
    }
  }
  return merged;
}

export function isVerifiedPublishable(question) {
  if (!question || typeof question !== 'object') return false;
  const hasStatement = typeof question.statement === 'string' && question.statement.trim().length >= 20;
  const hasAnswer = typeof question.correctAnswer === 'boolean' || typeof question.correct_answer === 'boolean';
  const hasExplanation = typeof question.explanation === 'string' && question.explanation.trim().length >= 20;
  const status = String(question.reviewStatus || question.review_status || '').toLowerCase();
  const isApproved = status === 'verified' || status === 'approved';
  return hasStatement && hasAnswer && hasExplanation && isApproved;
}

function stableDateSeed(dateIsoIst) {
  let hash = 2166136261;
  for (let i = 0; i < dateIsoIst.length; i += 1) {
    hash ^= dateIsoIst.charCodeAt(i);
    hash = Math.imul(hash, 16777619) >>> 0;
  }
  return hash;
}

export function planDailyPublication({
  now = new Date(),
  questionPool = VERIFIED_DAILY_CHALLENGES,
  recentPublishedIds = [],
  existingPublication = null,
  customSchedule = null,
}) {
  const istInfo = getIstDateInfo(now);
  const schedule = normalizeRotationSchedule(customSchedule);
  const targetTopic = schedule[istInfo.weekdayName] || 'Mixed Challenge';

  // Idempotency & immutability: keep already-published question for this IST date
  if (
    existingPublication &&
    existingPublication.publication_date_ist === istInfo.dateIsoIst &&
    existingPublication.question
  ) {
    return {
      dateIsoIst: istInfo.dateIsoIst,
      weekdayName: istInfo.weekdayName,
      displayDateIst: istInfo.displayDateIst,
      rotationTopic: existingPublication.rotation_topic || targetTopic,
      question: existingPublication.question,
      isFallback: Boolean(existingPublication.is_fallback),
      fallbackReason: existingPublication.fallback_reason || null,
      alreadyPublished: true,
      auditLogs: [],
    };
  }

  const verifiedPool = Array.isArray(questionPool) ? questionPool.filter(isVerifiedPublishable) : [];
  const auditLogs = [];

  if (verifiedPool.length === 0) {
    const emergencyVerified = VERIFIED_DAILY_CHALLENGES.filter(isVerifiedPublishable);
    const seed = stableDateSeed(istInfo.dateIsoIst);
    const fallbackQuestion = emergencyVerified[seed % emergencyVerified.length];
    const reason = `No verified questions in primary pool for IST date ${istInfo.dateIsoIst} (${targetTopic}); used emergency verified bank.`;
    auditLogs.push({
      level: 'alert',
      code: 'POOL_EXHAUSTED_FALLBACK',
      dateIsoIst: istInfo.dateIsoIst,
      topic: targetTopic,
      message: reason,
      createdAt: new Date().toISOString(),
    });

    return {
      dateIsoIst: istInfo.dateIsoIst,
      weekdayName: istInfo.weekdayName,
      displayDateIst: istInfo.displayDateIst,
      rotationTopic: targetTopic,
      question: {
        ...fallbackQuestion,
        relatedNoteIndex: resolveRelatedNoteIndex(fallbackQuestion.relatedNoteIndex, fallbackQuestion.topic),
      },
      isFallback: true,
      fallbackReason: reason,
      alreadyPublished: false,
      auditLogs,
    };
  }

  const isMixed = targetTopic.toLowerCase() === 'mixed challenge';
  const topicPool = isMixed
    ? verifiedPool
    : verifiedPool.filter((q) => String(q.topic || '').toLowerCase() === targetTopic.toLowerCase());

  let candidates = topicPool;
  let isFallback = false;
  let fallbackReason = null;

  if (topicPool.length === 0) {
    isFallback = true;
    candidates = verifiedPool;
    fallbackReason = `Topic "${targetTopic}" had 0 verified questions on ${istInfo.dateIsoIst}; substituted from verified reserve pool.`;
    auditLogs.push({
      level: 'warn',
      code: 'TOPIC_FALLBACK_SUBSTITUTION',
      dateIsoIst: istInfo.dateIsoIst,
      topic: targetTopic,
      message: fallbackReason,
      createdAt: new Date().toISOString(),
    });
  }

  const recentSet = new Set(Array.isArray(recentPublishedIds) ? recentPublishedIds : []);
  const nonRepeating = candidates.filter((q) => !recentSet.has(q.id));
  const selectionSet = nonRepeating.length > 0 ? nonRepeating : candidates;

  const seed = stableDateSeed(`${istInfo.dateIsoIst}:${targetTopic}`);
  const picked = selectionSet[seed % selectionSet.length];
  const resolvedNoteIndex = resolveRelatedNoteIndex(
    picked.relatedNoteIndex ?? picked.related_note_index,
    picked.topic
  );

  const normalizedQuestion = {
    ...picked,
    correctAnswer:
      typeof picked.correctAnswer === 'boolean' ? picked.correctAnswer : Boolean(picked.correct_answer),
    sourceReference: picked.sourceReference || picked.source_references,
    relatedNoteIndex: resolvedNoteIndex,
    relatedArticleTitle:
      picked.relatedArticleTitle || picked.related_article_title || 'AMLDecode Study Notes',
  };

  const reserveCount = verifiedPool.length;
  if (reserveCount < REPLENISHMENT_THRESHOLD) {
    auditLogs.push({
      level: 'warn',
      code: 'RESERVE_POOL_LOW',
      dateIsoIst: istInfo.dateIsoIst,
      topic: targetTopic,
      message: `Verified reserve pool has ${reserveCount} questions (target ${RESERVE_POOL_TARGET}, threshold ${REPLENISHMENT_THRESHOLD}). Replenishment required.`,
      createdAt: new Date().toISOString(),
    });
  }

  return {
    dateIsoIst: istInfo.dateIsoIst,
    weekdayName: istInfo.weekdayName,
    displayDateIst: istInfo.displayDateIst,
    rotationTopic: targetTopic,
    question: normalizedQuestion,
    isFallback,
    fallbackReason,
    alreadyPublished: false,
    reserveCount,
    needsReplenishment: reserveCount < RESERVE_POOL_TARGET,
    auditLogs,
  };
}
