import { normalizeIndiaLocation } from '../../src/data/indiaLocations.js';

const TRACKING_PARAMS = [
  'utm_source',
  'utm_medium',
  'utm_campaign',
  'utm_term',
  'utm_content',
  'gh_src',
  'src',
  'source',
  'ref',
  'fbclid',
  'gclid',
];

export function normalizeCanonicalUrl(rawUrl) {
  if (!rawUrl || typeof rawUrl !== 'string') return '';
  try {
    const parsed = new URL(rawUrl.trim());
    for (const param of TRACKING_PARAMS) {
      parsed.searchParams.delete(param);
    }
    parsed.hash = '';
    const cleanPath = parsed.pathname.replace(/\/+$/, '') || '/';
    return `${parsed.protocol.toLowerCase()}//${parsed.hostname.toLowerCase()}${cleanPath}${parsed.search}`;
  } catch {
    return rawUrl.trim().split('?')[0].toLowerCase();
  }
}

export function normalizeJobRecord(rawJob, nowMs = Date.now()) {
  const verifiedIso = new Date(nowMs).toISOString();
  const title = String(rawJob?.title || '').trim();
  const employer = String(rawJob?.employer || '').trim();
  const applicationUrl = String(rawJob?.applicationUrl || rawJob?.link || '').trim();
  const canonicalUrl = normalizeCanonicalUrl(rawJob?.canonicalUrl || applicationUrl);

  const loc = normalizeIndiaLocation(
    rawJob?.rawLocation || rawJob?.displayLocation || rawJob?.city || rawJob?.location || '',
    rawJob?.state || ''
  );

  const hasPublishedDate =
    typeof rawJob?.publishedAt === 'string' && rawJob.publishedAt.trim().length > 0;
  const firstSeenAt =
    typeof rawJob?.firstSeenAt === 'string' && rawJob.firstSeenAt.trim().length > 0
      ? rawJob.firstSeenAt.trim()
      : verifiedIso;

  return {
    id: rawJob?.id || `job-${Buffer.from(`${employer}|${title}|${canonicalUrl}`).toString('hex').slice(0, 16)}`,
    sourceId: rawJob?.sourceId || 'unspecified-source',
    sourceLabel: rawJob?.sourceLabel || rawJob?.sourceId || 'Verified Feed',
    sourceJobId: rawJob?.sourceJobId ? String(rawJob.sourceJobId).trim() : null,
    employer,
    title,
    description: String(rawJob?.description || '').trim(),
    city: loc.city,
    state: loc.state,
    country: loc.country,
    displayLocation: loc.displayLocation,
    remoteEligibility:
      rawJob?.remoteEligibility && rawJob.remoteEligibility !== 'unspecified'
        ? rawJob.remoteEligibility
        : loc.remoteEligibility,
    experienceLabel: rawJob?.experienceLabel || null,
    skills: Array.isArray(rawJob?.skills) ? rawJob.skills : [],
    salary: rawJob?.salary || null,
    publishedAt: hasPublishedDate ? rawJob.publishedAt.trim() : null,
    dateBasis: hasPublishedDate ? 'published' : 'first_seen',
    firstSeenAt,
    lastVerifiedAt: verifiedIso,
    applicationUrl,
    canonicalUrl,
    status: rawJob?.status || 'active',
    sourceReferences: [rawJob?.sourceId || 'unspecified-source'],
  };
}

function buildDedupKeys(job) {
  const keys = [];
  const employerNorm = String(job.employer || '').trim().toLowerCase();
  const titleNorm = String(job.title || '').trim().toLowerCase();
  const cityNorm = String(job.city || '').trim().toLowerCase();
  const stateNorm = String(job.state || '').trim().toLowerCase();

  if (job.sourceJobId && employerNorm) {
    keys.push(`req:${employerNorm}::${String(job.sourceJobId).trim().toLowerCase()}`);
  }
  if (job.canonicalUrl) {
    keys.push(`url:${job.canonicalUrl}`);
  }
  if (employerNorm && titleNorm) {
    keys.push(`emp_title_loc:${employerNorm}::${titleNorm}::${cityNorm}::${stateNorm}`);
  }
  return keys;
}

export function deduplicateNormalizedJobs(jobs = []) {
  const keyToCanonicalIndex = new Map();
  const mergedJobs = [];

  for (const raw of Array.isArray(jobs) ? jobs : []) {
    const item = normalizeJobRecord(raw);
    const keys = buildDedupKeys(item);
    let matchedIdx = -1;

    for (const key of keys) {
      if (keyToCanonicalIndex.has(key)) {
        matchedIdx = keyToCanonicalIndex.get(key);
        break;
      }
    }

    if (matchedIdx === -1) {
      const nextIdx = mergedJobs.length;
      mergedJobs.push(item);
      for (const key of keys) {
        keyToCanonicalIndex.set(key, nextIdx);
      }
    } else {
      const existing = mergedJobs[matchedIdx];
      const existingPublishedMs = existing.publishedAt ? Date.parse(existing.publishedAt) : NaN;
      const incomingPublishedMs = item.publishedAt ? Date.parse(item.publishedAt) : NaN;

      // Never reset age or overwrite an earlier verified publication date with a newer/crawl date
      let chosenPublishedAt = existing.publishedAt;
      if (!Number.isNaN(incomingPublishedMs)) {
        if (Number.isNaN(existingPublishedMs) || incomingPublishedMs < existingPublishedMs) {
          chosenPublishedAt = item.publishedAt;
        }
      }

      const existingFirstSeenMs = Date.parse(existing.firstSeenAt);
      const incomingFirstSeenMs = Date.parse(item.firstSeenAt);
      const chosenFirstSeenAt =
        !Number.isNaN(existingFirstSeenMs) && !Number.isNaN(incomingFirstSeenMs)
          ? new Date(Math.min(existingFirstSeenMs, incomingFirstSeenMs)).toISOString()
          : existing.firstSeenAt;

      const mergedRefs = Array.from(
        new Set([...(existing.sourceReferences || []), ...(item.sourceReferences || [])])
      );

      mergedJobs[matchedIdx] = {
        ...existing,
        publishedAt: chosenPublishedAt,
        dateBasis: chosenPublishedAt ? 'published' : 'first_seen',
        firstSeenAt: chosenFirstSeenAt,
        salary: existing.salary || item.salary || null,
        experienceLabel: existing.experienceLabel || item.experienceLabel || null,
        skills: Array.from(new Set([...(existing.skills || []), ...(item.skills || [])])),
        sourceReferences: mergedRefs,
      };

      for (const key of keys) {
        keyToCanonicalIndex.set(key, matchedIdx);
      }
    }
  }

  return mergedJobs;
}
