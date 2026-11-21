export const DEFAULT_EXPIRY_DAYS = 15;
const MS_PER_DAY = 86400000;

export function formatIstDateIso(dateOrMs = Date.now()) {
  const dateObj = typeof dateOrMs === 'number' ? new Date(dateOrMs) : new Date(dateOrMs);
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(dateObj);

  const year = parts.find((p) => p.type === 'year')?.value || '1970';
  const month = parts.find((p) => p.type === 'month')?.value || '01';
  const day = parts.find((p) => p.type === 'day')?.value || '01';
  return `${year}-${month}-${day}`;
}

export function sanitizeExpiryDays(rawDays) {
  const parsed = Number(rawDays);
  if (!Number.isFinite(parsed)) return DEFAULT_EXPIRY_DAYS;
  const rounded = Math.floor(parsed);
  if (rounded < 1 || rounded > 365) return DEFAULT_EXPIRY_DAYS;
  return rounded;
}

export function getEffectiveAgeReferenceDate(job) {
  // Never use a refreshed crawl timestamp as a publication date
  const candidate = job?.publishedAt || job?.firstSeenAt || null;
  if (!candidate) return null;
  const ms = Date.parse(candidate);
  return Number.isNaN(ms) ? null : ms;
}

export function computeExpiryTimestampIso(job, expiryDays = DEFAULT_EXPIRY_DAYS) {
  const safeDays = sanitizeExpiryDays(expiryDays);
  const refMs = getEffectiveAgeReferenceDate(job);
  if (refMs === null) return null;
  return new Date(refMs + safeDays * MS_PER_DAY).toISOString();
}

export function evaluateJobLifecycle(job, options = {}) {
  const nowMs = typeof options.nowMs === 'number' ? options.nowMs : Date.now();
  const expiryDays = sanitizeExpiryDays(options.expiryDays ?? DEFAULT_EXPIRY_DAYS);
  const archivedIso = new Date(nowMs).toISOString();

  if (job?.closedEarly === true || job?.status === 'closed_early') {
    return {
      ...job,
      status: 'archived',
      closedEarly: true,
      closedReason: job?.closedReason || 'confirmed_early_closure',
      archivedAt: job?.archivedAt || archivedIso,
      isPubliclyVisible: false,
    };
  }

  const refMs = getEffectiveAgeReferenceDate(job);
  const expiresAtIso = refMs !== null ? new Date(refMs + expiryDays * MS_PER_DAY).toISOString() : null;
  const ageDays = refMs !== null ? Math.max(0, Math.floor((nowMs - refMs) / MS_PER_DAY)) : null;

  const isExpiredByAge = ageDays !== null && ageDays > expiryDays;

  if (isExpiredByAge || job?.status === 'archived' || job?.status === 'expired') {
    return {
      ...job,
      status: 'archived',
      closedEarly: false,
      expiresAt: expiresAtIso,
      archivedAt: job?.archivedAt || archivedIso,
      isPubliclyVisible: false,
    };
  }

  return {
    ...job,
    status: 'active',
    closedEarly: false,
    expiresAt: expiresAtIso,
    archivedAt: null,
    isPubliclyVisible: true,
  };
}

export function filterPublicActiveJobs(jobs = [], options = {}) {
  const nowMs = typeof options.nowMs === 'number' ? options.nowMs : Date.now();
  const expiryDays = sanitizeExpiryDays(options.expiryDays ?? DEFAULT_EXPIRY_DAYS);

  return (Array.isArray(jobs) ? jobs : [])
    .map((job) => evaluateJobLifecycle(job, { nowMs, expiryDays }))
    .filter((job) => job.isPubliclyVisible && job.status === 'active');
}
