import { generateValidatedDailyChallengeBatch } from '../../server/dkcGeminiGenerator.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
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

  const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : req.body || {};
  const existingHashes = new Set(Array.isArray(body.existingHashes) ? body.existingHashes : []);

  const result = await generateValidatedDailyChallengeBatch({
    now: new Date(),
    existingHashes,
    geminiApiKey: env.GEMINI_API_KEY,
    model: env.GEMINI_DKC_MODEL || env.GEMINI_INTERVIEW_MODEL,
  });

  res.status(result.ok ? 200 : 502).json(result);
}
