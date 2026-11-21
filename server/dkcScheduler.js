import {
  planDailyPublication,
  RESERVE_POOL_TARGET,
} from '../src/data/dkcSchedulerLogic.js';
import { generateValidatedDailyChallengeBatch } from './dkcGeminiGenerator.js';

export async function runDailyChallengeAutomation({
  now = new Date(),
  verifiedPool = [],
  recentPublishedIds = [],
  existingPublication = null,
  customSchedule = null,
  generateBatchFn = generateValidatedDailyChallengeBatch,
  persistPublicationFn = null,
  persistAuditLogsFn = null,
}) {
  const plan = planDailyPublication({
    now,
    questionPool: verifiedPool,
    recentPublishedIds,
    existingPublication,
    customSchedule,
  });

  const logs = [...plan.auditLogs];
  let generatedPendingCount = 0;

  // Replenish reserve pool in background without publishing unverified items automatically
  if (plan.needsReplenishment && typeof generateBatchFn === 'function') {
    const deficit = Math.min(Math.max(RESERVE_POOL_TARGET - (plan.reserveCount || 0), 3), 10);
    const existingHashes = new Set(
      (Array.isArray(verifiedPool) ? verifiedPool : [])
        .map((q) => q.contentHash || q.content_hash)
        .filter(Boolean)
    );

    const genResult = await generateBatchFn({
      topic: plan.rotationTopic,
      count: deficit,
      existingHashes,
    });

    if (genResult?.ok) {
      generatedPendingCount = Array.isArray(genResult.accepted) ? genResult.accepted.length : 0;
    } else {
      logs.push({
        level: 'error',
        code: 'AI_REPLENISHMENT_FAILED',
        dateIsoIst: plan.dateIsoIst,
        topic: plan.rotationTopic,
        message: genResult?.error || 'Scheduled AI replenishment failed; verified reserve pool remains active.',
        createdAt: new Date().toISOString(),
      });
    }
  }

  const publicationRecord = {
    publication_date_ist: plan.dateIsoIst,
    question_id: plan.question.id,
    rotation_topic: plan.rotationTopic,
    is_fallback: plan.isFallback,
    fallback_reason: plan.fallbackReason,
    published_at: existingPublication?.published_at || new Date().toISOString(),
    publication_status: 'published',
  };

  if (!plan.alreadyPublished && typeof persistPublicationFn === 'function') {
    await persistPublicationFn(publicationRecord);
  }

  if (logs.length > 0 && typeof persistAuditLogsFn === 'function') {
    await persistAuditLogsFn(logs);
  }

  return {
    ok: true,
    dateIsoIst: plan.dateIsoIst,
    weekdayName: plan.weekdayName,
    rotationTopic: plan.rotationTopic,
    question: plan.question,
    publication: publicationRecord,
    isFallback: plan.isFallback,
    fallbackReason: plan.fallbackReason,
    generatedPendingCount,
    auditLogs: logs,
  };
}
