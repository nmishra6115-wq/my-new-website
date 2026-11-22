// Server-Side Deterministic Daily Challenge Evaluator & Idempotent Gamification Endpoint
import { TWENTY_DOMAIN_CHALLENGE_BANK } from '../../src/data/aiDailyChallengeEngine.js';
import { applyDailyChallengeSubmission, createDefaultGamificationState } from '../../src/data/dkcGamificationLogic.js';

const submitBuckets = new Map();
const PER_MINUTE_LIMIT = 20;

function checkRateLimit(actorKey) {
  const now = Date.now();
  const windowId = Math.floor(now / 60000);
  const key = `${actorKey}:${windowId}`;
  const count = submitBuckets.get(key) || 0;
  if (count >= PER_MINUTE_LIMIT) return false;
  submitBuckets.set(key, count + 1);
  return true;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ ok: false, error: 'Method Not Allowed' });
    return;
  }

  const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : req.body || {};
  const challengeId = String(body.challengeId || '').trim();
  const challengeDateIst = String(body.challengeDateIst || '').trim();
  const selectedAnswer = body.selectedAnswer;
  const actorKey = String(body.actorKey || req.headers['x-dkc-actor-key'] || '').trim().slice(0, 100);

  if (!actorKey || !challengeId || !/^\d{4}-\d{2}-\d{2}$/.test(challengeDateIst) || typeof selectedAnswer !== 'boolean') {
    res.status(400).json({ ok: false, error: 'Invalid submission payload' });
    return;
  }

  if (!checkRateLimit(actorKey)) {
    res.status(429).json({ ok: false, error: 'Too many requests. Please try again shortly.' });
    return;
  }

  // Authoritative answer lookup from validated challenge bank (never trust client-supplied answer key)
  const bankItem = TWENTY_DOMAIN_CHALLENGE_BANK.find((q) => q.id === challengeId);
  if (!bankItem) {
    res.status(404).json({ ok: false, error: 'Challenge not found' });
    return;
  }

  const prevState = body.currentState && typeof body.currentState === 'object'
    ? body.currentState
    : createDefaultGamificationState();

  const result = applyDailyChallengeSubmission({
    prevState,
    challenge: bankItem,
    selectedAnswer,
    dateIsoIst: challengeDateIst,
  });

  res.status(200).json({
    ok: true,
    evaluationSource: 'deterministic_server',
    challengeId: bankItem.id,
    challengeDateIst,
    isCorrect: result.isCorrect,
    correctAnswer: result.correctAnswer,
    alreadySubmitted: result.alreadySubmitted,
    xpEarned: result.xpEarned,
    awardReasons: result.awardReasons,
    newlyUnlockedAchievements: result.newlyUnlockedAchievements,
    updatedState: result.updatedState,
    explanation: {
      whyAnswer: bankItem.explanation,
      analystTakeaway: bankItem.analystTakeaway,
      practicalApplication: bankItem.practicalApplication,
      keyLearningPoints: bankItem.keyLearningPoints,
      sourceReference: bankItem.sourceReference,
      relatedNoteIndex: bankItem.relatedNoteIndex,
      relatedArticleTitle: bankItem.relatedArticleTitle,
    },
  });
}
