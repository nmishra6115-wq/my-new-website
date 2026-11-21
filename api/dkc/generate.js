import { generateValidatedDailyChallengeBatch } from '../../server/dkcGeminiGenerator.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method Not Allowed' });
    return;
  }

  const env = globalThis.process?.env || {};
  const expectedSecret = env.DKC_CRON_SECRET;
  const providedSecret = req.headers['x-dkc-cron-secret'] || req.headers.authorization?.replace(/^Bearer\s+/i, '');
  if (expectedSecret && providedSecret !== expectedSecret) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : req.body || {};
  const existingHashes = new Set(Array.isArray(body.existingHashes) ? body.existingHashes : []);

  const result = await generateValidatedDailyChallengeBatch({
    topic: body.topic || 'AML',
    count: body.count || 5,
    existingHashes,
  });

  if (!result.ok) {
    res.status(502).json({
      ok: false,
      error: result.error,
      acceptedCount: 0,
      rejectedCount: result.rejected.length,
    });
    return;
  }

  res.status(200).json({
    ok: true,
    model: result.model,
    acceptedCount: result.accepted.length,
    rejectedCount: result.rejected.length,
    accepted: result.accepted,
    rejected: result.rejected,
  });
}
