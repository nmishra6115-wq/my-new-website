import { runDailyChallengeAutomation } from '../../server/dkcScheduler.js';
import { VERIFIED_DAILY_CHALLENGES } from '../../src/data/dailyChallengeBank.js';

export default async function handler(req, res) {
  if (req.method !== 'POST' && req.method !== 'GET') {
    res.status(405).json({ error: 'Method Not Allowed' });
    return;
  }

  const env = globalThis.process?.env || {};
  const expectedSecret = env.DKC_CRON_SECRET;
  const providedSecret =
    req.headers['x-dkc-cron-secret'] ||
    req.headers.authorization?.replace(/^Bearer\s+/i, '') ||
    '';

  if (expectedSecret && providedSecret !== expectedSecret) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  const result = await runDailyChallengeAutomation({
    now: new Date(),
    verifiedPool: VERIFIED_DAILY_CHALLENGES,
  });

  res.status(200).json({
    ok: result.ok,
    dateIsoIst: result.dateIsoIst,
    weekdayName: result.weekdayName,
    rotationTopic: result.rotationTopic,
    questionId: result.question?.id || null,
    isFallback: result.isFallback,
    fallbackReason: result.fallbackReason,
    generatedPendingCount: result.generatedPendingCount,
    auditLogCount: result.auditLogs.length,
  });
}
