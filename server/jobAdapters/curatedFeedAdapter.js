import { buildInitialCareersJobs } from '../../src/data/careersSeed.js';
import { isValidHttpApplicationUrl } from './adapterEngine.js';

export function runCuratedFeedAdapter(options = {}) {
  const nowMs = typeof options.nowMs === 'number' ? options.nowMs : Date.now();
  const extraRecords = Array.isArray(options.partnerRecords) ? options.partnerRecords : [];

  const baseJobs = buildInitialCareersJobs(nowMs).filter((job) =>
    isValidHttpApplicationUrl(job.applicationUrl)
  );

  const mappedPartners = extraRecords
    .map((rec, idx) => {
      const title = String(rec?.role || rec?.title || '').trim();
      const employer = String(rec?.company || rec?.employer || '').trim();
      const applicationUrl = String(rec?.link || rec?.application_url || '').trim();
      if (!title || !employer || !isValidHttpApplicationUrl(applicationUrl)) {
        return null;
      }
      return {
        id: `partner-job-${idx + 1}`,
        sourceId: 'amldecode-partner-desk',
        sourceLabel: 'AMLDecode Partner Desk',
        sourceUrl: applicationUrl,
        employer,
        title,
        city: null,
        state: null,
        country: 'India',
        displayLocation: String(rec?.location || 'India').trim() || 'India',
        remoteEligibility: /\bremote\b/i.test(String(rec?.location || '')) ? 'remote' : 'unspecified',
        experienceLabel: null,
        skills: ['AML / KYC Compliance'],
        salary: null,
        publishedAt: null,
        dateBasis: 'first_seen',
        firstSeenAt: new Date(nowMs).toISOString(),
        lastVerifiedAt: new Date(nowMs).toISOString(),
        applicationUrl,
        canonicalUrl: applicationUrl.split('?')[0],
        status: 'active',
      };
    })
    .filter(Boolean);

  return {
    sourceId: 'amldecode-curated-feed',
    status: 'success',
    jobs: [...baseJobs, ...mappedPartners],
    retriesUsed: 0,
    error: null,
  };
}
