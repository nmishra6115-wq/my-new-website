import { runDailyChallengeAutomation } from '../../server/dkcScheduler.js';
import { VERIFIED_DAILY_CHALLENGES } from '../../src/data/dailyChallengeBank.js';

export default async function handler(req, res) {
  if (req.method !== 'POST' && req.method !== 'GET') {
    res.status(405).json({ ok: false, error: 'Method Not Allowed' });
    return;
  }

  const env = globalThis.process?.env || {};
  const expectedSecret = String(env.DKC_CRON_SECRET || '').trim();
  const providedSecret = String(
    req.headers['x-dkc-cron-secret'] ||
    req.headers.authorization?.replace(/^Bearer\s+/i, '') ||
    ''
  ).trim();

  if (!expectedSecret || providedSecret !== expectedSecret) {
    res.status(401).json({ ok: false, error: 'Unauthorized' });
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
    published: result.published || null,
    error: result.error || null,
  });
}
