import {
  acquireSourceRunLock,
  releaseSourceRunLock,
  isValidHttpApplicationUrl,
} from '../jobAdapters/adapterEngine.js';
import { runCuratedFeedAdapter } from '../jobAdapters/curatedFeedAdapter.js';
import { runPermittedAtsFeedAdapter } from '../jobAdapters/atsFeedAdapter.js';
import { classifyJobBatchServerSide } from '../jobIntelligence/geminiClassifier.js';
import {
  normalizeJobRecord,
  deduplicateNormalizedJobs,
} from '../jobIntelligence/normalizerAndDedup.js';
import {
  DEFAULT_EXPIRY_DAYS,
  formatIstDateIso,
  sanitizeExpiryDays,
  evaluateJobLifecycle,
  filterPublicActiveJobs,
} from './expiryAndArchiveEngine.js';

export async function runDailyCareersSync(options = {}) {
  const nowMs = typeof options.nowMs === 'number' ? options.nowMs : Date.now();
  const runDateIst = formatIstDateIso(nowMs);
  const expiryDays = sanitizeExpiryDays(options.expiryDays ?? DEFAULT_EXPIRY_DAYS);
  const lockKey = `daily_careers_sync_${runDateIst}`;

  const lock = acquireSourceRunLock(lockKey, nowMs);
  if (!lock.acquired) {
    return {
      ok: false,
      runDateIst,
      skipped: true,
      reason: lock.reason,
      publicJobs: [],
      archivedJobs: [],
      syncLogs: [],
    };
  }

  try {
    const syncLogs = [];
    const collectedRaw = [];

    const curatedResult = runCuratedFeedAdapter({
      nowMs,
      partnerRecords: options.partnerRecords || [],
    });
    collectedRaw.push(...(curatedResult.jobs || []));
    syncLogs.push({
      sourceId: curatedResult.sourceId,
      runDateIst,
      status: curatedResult.status,
      importedCount: (curatedResult.jobs || []).length,
      expiredCount: 0,
      errorCount: curatedResult.error ? 1 : 0,
      error: curatedResult.error || null,
    });

    const configuredSources = Array.isArray(options.sources) ? options.sources : [];
    for (const src of configuredSources) {
      if (!src?.enabled) continue;
      const adapterRes = await runPermittedAtsFeedAdapter(src, {
        fetchImpl: options.fetchImpl,
      });
      if (adapterRes.status === 'success') {
        collectedRaw.push(...(adapterRes.jobs || []));
      }
      syncLogs.push({
        sourceId: src.id,
        runDateIst,
        status: adapterRes.status,
        importedCount: (adapterRes.jobs || []).length,
        expiredCount: 0,
        errorCount: adapterRes.error ? 1 : 0,
        retriesUsed: adapterRes.retriesUsed || 0,
        error: adapterRes.error || null,
      });
    }

    const validRecords = collectedRaw.filter(
      (rec) =>
        rec &&
        String(rec.title || '').trim().length > 0 &&
        String(rec.employer || '').trim().length > 0 &&
        isValidHttpApplicationUrl(rec.applicationUrl || rec.link || '')
    );

    const normalized = validRecords.map((rec) => normalizeJobRecord(rec, nowMs));
    const deduped = deduplicateNormalizedJobs(normalized);
    const classified = await classifyJobBatchServerSide(deduped, {
      apiKey: options.geminiApiKey,
      model: options.geminiModel,
      fetchImpl: options.fetchImpl,
    });

    const existingJobs = Array.isArray(options.existingJobs) ? options.existingJobs : [];
    const combinedPool = [...existingJobs, ...classified];
    const reDeduped = deduplicateNormalizedJobs(combinedPool);

    const lifecycleEvaluated = reDeduped.map((job) =>
      evaluateJobLifecycle(job, { nowMs, expiryDays })
    );
    const publicJobs = filterPublicActiveJobs(lifecycleEvaluated, { nowMs, expiryDays });
    const archivedJobs = lifecycleEvaluated.filter((job) => job.status === 'archived');

    return {
      ok: true,
      runDateIst,
      skipped: false,
      expiryDays,
      publicJobs,
      archivedJobs,
      syncLogs,
    };
  } finally {
    releaseSourceRunLock(lockKey);
  }
}
