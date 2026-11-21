const DEFAULT_TIMEOUT_MS = 8000;
const DEFAULT_MAX_RETRIES = 2;
const BASE_BACKOFF_MS = 400;
const MAX_BACKOFF_MS = 2500;
const LOCK_STALE_MS = 15 * 60 * 1000;

const activeRunLocks = new Map();

export function validatePermittedFeedUrl(rawUrl) {
  if (!rawUrl || typeof rawUrl !== 'string') {
    return { ok: false, reason: 'missing_url' };
  }

  let parsed;
  try {
    parsed = new URL(rawUrl.trim());
  } catch {
    return { ok: false, reason: 'invalid_url' };
  }

  if (parsed.protocol !== 'https:') {
    return { ok: false, reason: 'non_https_protocol' };
  }

  const host = parsed.hostname.toLowerCase();
  if (
    host === 'localhost' ||
    host === '127.0.0.1' ||
    host === '0.0.0.0' ||
    host.endsWith('.local') ||
    host.endsWith('.internal')
  ) {
    return { ok: false, reason: 'disallowed_local_host' };
  }

  return { ok: true, url: parsed.toString(), hostname: host };
}

export function isValidHttpApplicationUrl(rawUrl) {
  if (!rawUrl || typeof rawUrl !== 'string') return false;
  try {
    const parsed = new URL(rawUrl.trim());
    return parsed.protocol === 'https:' || parsed.protocol === 'http:';
  } catch {
    return false;
  }
}

export function acquireSourceRunLock(sourceId, nowMs = Date.now()) {
  const key = String(sourceId || '').trim();
  if (!key) return { acquired: false, reason: 'missing_source_id' };

  const existing = activeRunLocks.get(key);
  if (existing && nowMs - existing.acquiredAtMs < LOCK_STALE_MS) {
    return { acquired: false, reason: 'run_in_progress' };
  }

  activeRunLocks.set(key, { acquiredAtMs: nowMs });
  return { acquired: true, reason: 'acquired' };
}

export function releaseSourceRunLock(sourceId) {
  const key = String(sourceId || '').trim();
  if (key) {
    activeRunLocks.delete(key);
  }
}

function computeBackoffDelayMs(attemptIndex) {
  const exp = BASE_BACKOFF_MS * Math.pow(2, attemptIndex);
  return Math.min(MAX_BACKOFF_MS, exp);
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function fetchJsonWithBackoff(feedUrl, options = {}) {
  const check = validatePermittedFeedUrl(feedUrl);
  if (!check.ok) {
    return {
      ok: false,
      status: 0,
      data: null,
      retriesUsed: 0,
      error: `blocked_feed_url:${check.reason}`,
    };
  }

  const timeoutMs =
    typeof options.timeoutMs === 'number' && options.timeoutMs > 0
      ? options.timeoutMs
      : DEFAULT_TIMEOUT_MS;
  const maxRetries =
    typeof options.maxRetries === 'number' && options.maxRetries >= 0
      ? Math.min(options.maxRetries, 4)
      : DEFAULT_MAX_RETRIES;
  const fetchImpl = options.fetchImpl || globalThis.fetch;

  if (typeof fetchImpl !== 'function') {
    return {
      ok: false,
      status: 0,
      data: null,
      retriesUsed: 0,
      error: 'fetch_unavailable',
    };
  }

  let lastError = 'unknown_error';
  let lastStatus = 0;

  for (let attempt = 0; attempt <= maxRetries; attempt += 1) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await fetchImpl(check.url, {
        method: 'GET',
        headers: {
          Accept: 'application/json',
          'User-Agent': 'AMLDecodeCareersBot/1.0 (+https://www.amldecode.in/)',
        },
        signal: controller.signal,
      });
      clearTimeout(timer);
      lastStatus = response.status;

      if (response.ok) {
        const json = await response.json();
        return {
          ok: true,
          status: response.status,
          data: json,
          retriesUsed: attempt,
          error: null,
        };
      }

      lastError = `http_${response.status}`;
      const retryableStatus = response.status === 429 || response.status >= 500;
      if (!retryableStatus || attempt === maxRetries) {
        break;
      }
    } catch (err) {
      clearTimeout(timer);
      lastError = err?.name === 'AbortError' ? 'request_timeout' : (err?.message || 'network_error');
      if (attempt === maxRetries) {
        break;
      }
    }

    await sleep(computeBackoffDelayMs(attempt));
  }

  return {
    ok: false,
    status: lastStatus,
    data: null,
    retriesUsed: maxRetries,
    error: lastError,
  };
}
