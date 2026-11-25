import { jobOpenings } from '../jobs.js';
import { normalizeIndiaLocation } from './indiaLocations.js';

export const ROLE_CATEGORIES = [
  'All Roles',
  'AML',
  'KYC',
  'CDD / EDD / KYB',
  'Transaction Monitoring',
  'Sanctions & PEP',
  'SAR Investigations',
  'Financial Crime Compliance',
  'Fraud Investigations',
  'Quality Assurance',
  'Team Lead / Operations',
  'Regulatory Compliance',
];

function inferRoleCategory(title = '') {
  const t = String(title).toLowerCase();
  if (t.includes('kyb')) return 'CDD / EDD / KYB';
  if (t.includes('kyc')) return 'KYC';
  if (t.includes('sanction') || t.includes('pep')) return 'Sanctions & PEP';
  if (t.includes('sar')) return 'SAR Investigations';
  if (t.includes('transaction monitoring')) return 'Transaction Monitoring';
  if (t.includes('fraud')) return 'Fraud Investigations';
  if (t.includes('lead') || t.includes('manager')) return 'Team Lead / Operations';
  if (t.includes('aml') || t.includes('fincrime') || t.includes('financial crime')) return 'AML';
  if (t.includes('risk') || t.includes('compliance')) return 'Financial Crime Compliance';
  return 'Regulatory Compliance';
}

function inferSkillsFromTitle(title = '') {
  const t = String(title).toLowerCase();
  const skills = [];
  if (t.includes('aml')) skills.push('AML');
  if (t.includes('kyc')) skills.push('KYC');
  if (t.includes('kyb')) skills.push('KYB');
  if (t.includes('fincrime') || t.includes('financial crime')) skills.push('Financial Crime');
  if (t.includes('rfi')) skills.push('RFI Investigation');
  if (t.includes('risk')) skills.push('Risk & Compliance');
  return skills.length > 0 ? skills : ['AML / KYC Compliance'];
}

export function buildInitialCareersJobs(nowMs = Date.now()) {
  const verifiedIso = new Date(nowMs).toISOString();
  const list = Array.isArray(jobOpenings) ? jobOpenings : [];

  return list.map((item, idx) => {
    const cleanTitle = String(item.role || '').trim();
    const cleanEmployer = String(item.company || '').trim();
    const cleanUrl = String(item.link || '').trim();
    const loc = normalizeIndiaLocation(item.location || '', '');
    const hasPublishedDate = typeof item.createdAt === 'string' && item.createdAt.trim().length > 0;

    return {
      id: 'legacy-job-' + (idx + 1),
      sourceId: 'amldecode-curated-feed',
      sourceLabel: 'AMLDecode Curated Feed',
      sourceUrl: cleanUrl,
      employer: cleanEmployer,
      title: cleanTitle,
      roleCategory: inferRoleCategory(cleanTitle),
      city: loc.city,
      state: loc.state,
      country: loc.country,
      displayLocation: loc.displayLocation,
      remoteEligibility: loc.remoteEligibility,
      experienceLabel: null,
      skills: inferSkillsFromTitle(cleanTitle),
      salary: null,
      publishedAt: hasPublishedDate ? item.createdAt.trim() : null,
      dateBasis: hasPublishedDate ? 'published' : 'first_seen',
      firstSeenAt: hasPublishedDate ? item.createdAt.trim() + 'T00:00:00.000Z' : verifiedIso,
      lastVerifiedAt: verifiedIso,
      applicationUrl: cleanUrl,
      canonicalUrl: cleanUrl,
      status: 'active',
    };
  });
}
