import { DEFAULT_EXPIRY_DAYS, sanitizeExpiryDays } from '../../server/jobAutomation/expiryAndArchiveEngine.js';

const ADMIN_CONFIG_KEY = 'amldecode_careers_ai_admin_v1';

export const DEFAULT_SOURCE_CONFIGS = [
  {
    id: 'amldecode-curated-feed',
    provider: 'AMLDecode Curated Feed',
    integrationType: 'preserved_seed',
    enabled: true,
    lastStatus: 'ready',
    lastError: null,
  },
  {
    id: 'permitted-ats-feed',
    provider: 'Permitted ATS Feed (Configured Only)',
    integrationType: 'ats_json_feed',
    enabled: false,
    lastStatus: 'awaiting_source_url',
    lastError: null,
  },
];

export function readAdminConfig() {
  try {
    const raw = window.localStorage.getItem(ADMIN_CONFIG_KEY);
    if (!raw) {
      return {
        expiryDays: DEFAULT_EXPIRY_DAYS,
        sources: DEFAULT_SOURCE_CONFIGS,
        lastManualSyncAt: null,
        auditNotes: [],
      };
    }
    const parsed = JSON.parse(raw);
    return {
      expiryDays: sanitizeExpiryDays(parsed?.expiryDays ?? DEFAULT_EXPIRY_DAYS),
      sources: Array.isArray(parsed?.sources) && parsed.sources.length > 0
        ? parsed.sources
        : DEFAULT_SOURCE_CONFIGS,
      lastManualSyncAt: parsed?.lastManualSyncAt || null,
      auditNotes: Array.isArray(parsed?.auditNotes) ? parsed.auditNotes.slice(0, 10) : [],
    };
  } catch {
    return {
      expiryDays: DEFAULT_EXPIRY_DAYS,
      sources: DEFAULT_SOURCE_CONFIGS,
      lastManualSyncAt: null,
      auditNotes: [],
    };
  }
}

export function writeAdminConfig(config) {
  try {
    window.localStorage.setItem(ADMIN_CONFIG_KEY, JSON.stringify(config));
  } catch {
    // Ignore storage quota errors
  }
}
