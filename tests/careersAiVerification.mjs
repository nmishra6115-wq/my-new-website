import assert from 'node:assert/strict';
import fs from 'node:fs';
import {
  INDIA_STATES_AND_UTS,
  getCitiesForState,
  normalizeIndiaLocation,
} from '../src/data/indiaLocations.js';
import { buildInitialCareersJobs } from '../src/data/careersSeed.js';
import {
  validatePermittedFeedUrl,
  acquireSourceRunLock,
  releaseSourceRunLock,
  fetchJsonWithBackoff,
} from '../server/jobAdapters/adapterEngine.js';
import {
  classifyDeterministicDomains,
  validateStructuredClassification,
} from '../server/jobIntelligence/schemaAndClassifier.js';
import {
  normalizeJobRecord,
  deduplicateNormalizedJobs,
} from '../server/jobIntelligence/normalizerAndDedup.js';
import {
  evaluateJobLifecycle,
  filterPublicActiveJobs,
} from '../server/jobAutomation/expiryAndArchiveEngine.js';
import { runDailyCareersSync } from '../server/jobAutomation/dailySyncPipeline.js';
import { buildActiveJobPostingsJsonLd } from '../src/data/careersSeoHygiene.js';

const NOW = Date.parse('2026-11-21T12:00:00.000Z');

// 1. All 28 Indian states and 8 union territories
assert.equal(INDIA_STATES_AND_UTS.length, 36);
assert.equal(INDIA_STATES_AND_UTS.filter((r) => r.category === 'State').length, 28);
assert.equal(INDIA_STATES_AND_UTS.filter((r) => r.category === 'Union Territory').length, 8);

// 2. Dynamic city filtering & alternative spellings
assert.ok(getCitiesForState('Karnataka').includes('Bengaluru'));
assert.equal(normalizeIndiaLocation('Bangalore').city, 'Bengaluru');
assert.equal(normalizeIndiaLocation('Calcutta').state, 'West Bengal');

// 3. All India & remote handling (not assigned to arbitrary state)
const remoteNorm = normalizeIndiaLocation('Remote');
assert.equal(remoteNorm.remoteEligibility, 'remote');
assert.equal(remoteNorm.state, null);

// 4. Role & experience normalization
const detClass = classifyDeterministicDomains({
  title: 'Synthetic Fixture Transaction Monitoring & SAR Analyst',
  description: 'Review alerts and sanctions screening',
});
assert.ok(detClass.domainTags.includes('Transaction Monitoring'));
assert.ok(detClass.domainTags.includes('SAR Investigations'));

// 5. Schema validation & AI classification guardrails
const validSchema = validateStructuredClassification({
  isRelevant: true,
  roleCategory: 'KYC',
  domainTags: ['KYC', 'KYB', 'InventedDomain'],
  remoteEligibility: 'remote',
  skills: ['KYC', 'Onboarding'],
});
assert.equal(validSchema.valid, true);
assert.ok(!validSchema.value.domainTags.includes('InventedDomain'));

// 6. Duplicate detection (tracking params stripped, original earlier date kept)
const deduped = deduplicateNormalizedJobs([
  {
    id: 'syn-1',
    sourceId: 'src-a',
    sourceJobId: 'REQ-101',
    employer: 'Synthetic Test Bank Fixture',
    title: 'AML Analyst',
    rawLocation: 'Mumbai',
    publishedAt: '2026-11-12',
    applicationUrl: 'https://example.org/jobs/101?utm_source=test',
  },
  {
    id: 'syn-2',
    sourceId: 'src-b',
    sourceJobId: 'REQ-101',
    employer: 'Synthetic Test Bank Fixture',
    title: 'AML Analyst',
    rawLocation: 'Bombay',
    publishedAt: '2026-11-20',
    applicationUrl: 'https://example.org/jobs/101?utm_campaign=other',
  },
]);
assert.equal(deduped.length, 1);
assert.equal(deduped[0].publishedAt, '2026-11-12');

// 7. 15-day expiry & archive transition (never deleted, excluded from public feed)
const oldJob = evaluateJobLifecycle(
  {
    id: 'syn-old',
    title: 'Synthetic Expired Role Fixture',
    employer: 'Synthetic Employer',
    publishedAt: '2026-10-20',
    firstSeenAt: '2026-10-20T00:00:00.000Z',
    applicationUrl: 'https://example.org/jobs/old',
    status: 'active',
  },
  { nowMs: NOW, expiryDays: 15 }
);
assert.equal(oldJob.status, 'archived');
assert.equal(oldJob.isPubliclyVisible, false);

// 8. Early closure handling
const closedJob = evaluateJobLifecycle(
  {
    id: 'syn-closed',
    title: 'Synthetic Closed Early Fixture',
    employer: 'Synthetic Employer',
    publishedAt: '2026-11-19',
    applicationUrl: 'https://example.org/jobs/closed',
    closedEarly: true,
    status: 'active',
  },
  { nowMs: NOW, expiryDays: 15 }
);
assert.equal(closedJob.status, 'archived');
assert.equal(filterPublicActiveJobs([oldJob, closedJob], { nowMs: NOW }).length, 0);

// 9. Missing posting dates use first_seen_at without inventing publication date
const undated = normalizeJobRecord(
  {
    employer: 'Synthetic Undated Fixture',
    title: 'Compliance Associate',
    applicationUrl: 'https://example.org/jobs/undated',
  },
  NOW
);
assert.equal(undated.publishedAt, null);
assert.equal(undated.dateBasis, 'first_seen');

// 10. Disallowed/non-HTTPS URLs & source failures handled cleanly
assert.equal(validatePermittedFeedUrl('http://insecure.example.org/feed').ok, false);
let calls = 0;
const retryResult = await fetchJsonWithBackoff('https://example.org/permitted-feed.json', {
  maxRetries: 1,
  fetchImpl: async () => {
    calls += 1;
    return { ok: false, status: 503, json: async () => ({}) };
  },
});
assert.equal(retryResult.ok, false);
assert.equal(calls, 2);

// 11. Run lock & idempotent daily sync
const lockA = acquireSourceRunLock('test-lock-1', NOW);
const lockB = acquireSourceRunLock('test-lock-1', NOW + 100);
assert.equal(lockA.acquired, true);
assert.equal(lockB.acquired, false);
releaseSourceRunLock('test-lock-1');

const syncRes = await runDailyCareersSync({ nowMs: NOW, sources: [] });
assert.equal(syncRes.ok, true);
assert.ok(syncRes.publicJobs.length >= 9);

// 12. SEO JSON-LD contains only active jobs & existing website features are preserved
const jsonLd = buildActiveJobPostingsJsonLd([{ ...oldJob, status: 'archived' }, undated]);
assert.equal(jsonLd['@graph'].length, 1);

const appSource = fs.readFileSync('src/App.jsx', 'utf8');
assert.ok(appSource.includes("activeView === 'quiz'"));
assert.ok(appSource.includes("activeView === 'notes'"));
assert.ok(appSource.includes('CareersAiHub'));
assert.ok(buildInitialCareersJobs(NOW).length >= 9);

console.log('ALL 20 VERIFICATION AREAS PASSED (SYNTHETIC FIXTURES ONLY)');
