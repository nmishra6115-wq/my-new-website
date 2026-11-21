import { fetchJsonWithBackoff, isValidHttpApplicationUrl } from './adapterEngine.js';

export function normalizeAtsRecord(rawItem, sourceConfig) {
  if (!rawItem || typeof rawItem !== 'object') return null;

  const title = String(rawItem.title || rawItem.text || '').trim();
  const applicationUrl = String(rawItem.absolute_url || rawItem.hostedUrl || rawItem.url || '').trim();
  const employer = String(rawItem.company || sourceConfig?.provider || '').trim();

  if (!title || !employer || !isValidHttpApplicationUrl(applicationUrl)) {
    return null;
  }

  const rawLocation =
    typeof rawItem.location === 'string'
      ? rawItem.location.trim()
      : String(rawItem.location?.name || rawItem.categories?.location || '').trim();

  const publishedAt =
    typeof rawItem.updated_at === 'string' && rawItem.updated_at.trim()
      ? rawItem.updated_at.trim()
      : null;

  return {
    sourceId: sourceConfig.id,
    sourceLabel: sourceConfig.provider,
    sourceJobId: rawItem.id != null ? String(rawItem.id) : null,
    employer,
    title,
    description: String(rawItem.content || rawItem.descriptionPlain || '').trim(),
    rawLocation,
    remoteEligibility: /\bremote\b/i.test(rawLocation) ? 'remote' : 'unspecified',
    experienceLabel: null,
    skills: [],
    salary: null,
    publishedAt,
    applicationUrl,
    canonicalUrl: applicationUrl.split('?')[0],
  };
}

export async function runPermittedAtsFeedAdapter(sourceConfig, options = {}) {
  if (!sourceConfig?.enabled) {
    return {
      sourceId: sourceConfig?.id || 'ats-feed',
      status: 'skipped_disabled',
      jobs: [],
      retriesUsed: 0,
      error: null,
    };
  }

  const result = await fetchJsonWithBackoff(sourceConfig.source_url, options);
  if (!result.ok) {
    return {
      sourceId: sourceConfig.id,
      status: 'error',
      jobs: [],
      retriesUsed: result.retriesUsed,
      error: result.error,
    };
  }

  const rawList = Array.isArray(result.data?.jobs)
    ? result.data.jobs
    : Array.isArray(result.data)
    ? result.data
    : [];

  const normalized = rawList
    .map((item) => normalizeAtsRecord(item, sourceConfig))
    .filter(Boolean);

  return {
    sourceId: sourceConfig.id,
    status: 'success',
    jobs: normalized,
    retriesUsed: result.retriesUsed,
    error: null,
  };
}
