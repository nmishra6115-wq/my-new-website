import { runDailyCareersSync } from '../../server/jobAutomation/dailySyncPipeline.js';
import { buildInitialCareersJobs } from '../../src/data/careersSeed.js';

export default async function handler(req, res) {
  if (req.method !== 'POST' && req.method !== 'GET') {
    res.status(405).json({ ok: false, error: 'Method Not Allowed' });
    return;
  }

  const env = globalThis.process?.env || {};
  const expectedSecret = env.JOBS_CRON_SECRET || env.CRON_SECRET || '';
  const providedSecret =
    req.headers['x-jobs-cron-secret'] ||
    req.headers.authorization?.replace(/^Bearer\s+/i, '') ||
    '';

  if (expectedSecret && providedSecret !== expectedSecret) {
    res.status(401).json({ ok: false, error: 'Unauthorized' });
    return;
  }

  const body =
    req.method === 'POST'
      ? typeof req.body === 'string'
        ? JSON.parse(req.body || '{}')
        : req.body || {}
      : {};

  const nowMs = Date.now();
  const existingJobs = Array.isArray(body.existingJobs)
    ? body.existingJobs
    : buildInitialCareersJobs(nowMs);

  const result = await runDailyCareersSync({
    nowMs,
    expiryDays: body.expiryDays,
    sources: Array.isArray(body.sources) ? body.sources : [],
    partnerRecords: Array.isArray(body.partnerRecords) ? body.partnerRecords : [],
    existingJobs,
    geminiApiKey: env.GEMINI_API_KEY,
    geminiModel: env.GEMINI_JOB_CLASSIFIER_MODEL || env.GEMINI_INTERVIEW_MODEL,
  });

  res.status(result.ok ? 200 : 409).json({
    ok: result.ok,
    skipped: Boolean(result.skipped),
    reason: result.reason || null,
    runDateIst: result.runDateIst,
    expiryDays: result.expiryDays,
    activeCount: (result.publicJobs || []).length,
    archivedCount: (result.archivedJobs || []).length,
    publicJobs: result.publicJobs || [],
    archivedJobs: result.archivedJobs || [],
    syncLogs: result.syncLogs || [],
  });
}