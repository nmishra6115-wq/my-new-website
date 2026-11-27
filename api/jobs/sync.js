import { createClient } from '@supabase/supabase-js';
import { runDailyCareersSync } from '../../server/jobAutomation/dailySyncPipeline.js';
import { buildInitialCareersJobs } from '../../src/data/careersSeed.js';

function getAdminAllowlist(env) {
  return String(env.ADMIN_EMAILS || env.VITE_ADMIN_EMAILS || '')
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

async function isAuthorizedSyncRequest(req, env) {
  const expectedSecret = String(env.JOBS_CRON_SECRET || env.CRON_SECRET || '').trim();
  const bearerOrHeaderSecret = String(
    req.headers['x-jobs-cron-secret'] ||
    req.headers.authorization?.replace(/^Bearer\s+/i, '') ||
    ''
  ).trim();

  if (expectedSecret && bearerOrHeaderSecret && bearerOrHeaderSecret === expectedSecret) {
    return true;
  }

  const supabaseUrl = String(env.SUPABASE_URL || env.VITE_SUPABASE_URL || '').trim();
  const supabaseAnonKey = String(
    env.SUPABASE_ANON_KEY || env.VITE_SUPABASE_ANON_KEY || ''
  ).trim();
  const adminEmails = getAdminAllowlist(env);

  if (!bearerOrHeaderSecret || !supabaseUrl || !supabaseAnonKey || adminEmails.length === 0) {
    return false;
  }

  const supabaseAuthClient = createClient(supabaseUrl, supabaseAnonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { data, error } = await supabaseAuthClient.auth.getUser(bearerOrHeaderSecret);
  if (error || !data?.user?.email) {
    return false;
  }

  return adminEmails.includes(data.user.email.trim().toLowerCase());
}

export default async function handler(req, res) {
  if (req.method !== 'POST' && req.method !== 'GET') {
    res.status(405).json({ ok: false, error: 'Method Not Allowed' });
    return;
  }

  const env = globalThis.process?.env || {};
  const authorized = await isAuthorizedSyncRequest(req, env);
  if (!authorized) {
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
