export const REQUIRED_FINCRIME_DOMAINS = [
  'AML',
  'KYC',
  'CDD',
  'EDD',
  'Transaction Monitoring',
  'Sanctions Screening',
  'PEP Screening',
  'Adverse Media',
  'SAR Investigations',
  'Financial Crime Compliance',
  'Fraud Investigations',
  'KYB',
  'Quality Assurance',
  'Team Lead / Operations Management',
  'Regulatory Compliance',
];

const DOMAIN_RULES = [
  { domain: 'AML', pattern: /\b(aml|anti[\s-]?money[\s-]?laundering|fincrime|financial crime)\b/i },
  { domain: 'KYC', pattern: /\b(kyc|know your customer|client onboarding|rfi)\b/i },
  { domain: 'CDD', pattern: /\b(cdd|customer due diligence)\b/i },
  { domain: 'EDD', pattern: /\b(edd|enhanced due diligence)\b/i },
  { domain: 'Transaction Monitoring', pattern: /\b(transaction monitoring|alert investigation|tm analyst|alert clearing)\b/i },
  { domain: 'Sanctions Screening', pattern: /\b(sanctions?|ofac|un sanctions?|screening)\b/i },
  { domain: 'PEP Screening', pattern: /\b(pep|politically exposed)\b/i },
  { domain: 'Adverse Media', pattern: /\b(adverse media|negative news)\b/i },
  { domain: 'SAR Investigations', pattern: /\b(sar|str|suspicious activity|suspicious transaction)\b/i },
  { domain: 'Financial Crime Compliance', pattern: /\b(financial crime compliance|fincrime compliance|risk & compliance|compliance associate)\b/i },
  { domain: 'Fraud Investigations', pattern: /\b(fraud|chargeback|scam investigation)\b/i },
  { domain: 'KYB', pattern: /\b(kyb|know your business|corporate onboarding|entity due diligence)\b/i },
  { domain: 'Quality Assurance', pattern: /\b(quality assurance|qa analyst|quality control|qc analyst)\b/i },
  { domain: 'Team Lead / Operations Management', pattern: /\b(team lead|operations manager|manager|supervisor|avp|vp)\b/i },
  { domain: 'Regulatory Compliance', pattern: /\b(regulatory compliance|rbi|fatf|pmla|policy compliance)\b/i },
];

export function classifyDeterministicDomains(job = {}) {
  const combined = `${job.title || ''} ${job.description || ''} ${(job.skills || []).join(' ')}`;
  const matched = DOMAIN_RULES.filter((rule) => rule.pattern.test(combined)).map((rule) => rule.domain);
  const uniqueTags = Array.from(new Set(matched));

  const primaryCategory =
    uniqueTags.includes('Team Lead / Operations Management')
      ? 'Team Lead / Operations Management'
      : uniqueTags[0] || 'Financial Crime Compliance';

  return {
    isRelevant: uniqueTags.length > 0 || /\b(compliance|risk|investigation|due diligence)\b/i.test(combined),
    roleCategory: primaryCategory,
    domainTags: uniqueTags.length > 0 ? uniqueTags : ['Financial Crime Compliance'],
  };
}

export function validateStructuredClassification(payload) {
  if (!payload || typeof payload !== 'object') {
    return { valid: false, error: 'payload_not_object', value: null };
  }

  const allowedSet = new Set(REQUIRED_FINCRIME_DOMAINS);
  const rawTags = Array.isArray(payload.domainTags) ? payload.domainTags : [];
  const validTags = Array.from(new Set(rawTags.filter((t) => allowedSet.has(t))));

  const roleCategory =
    typeof payload.roleCategory === 'string' && allowedSet.has(payload.roleCategory)
      ? payload.roleCategory
      : validTags[0] || 'Financial Crime Compliance';

  const remoteEligibility =
    payload.remoteEligibility === 'remote' ||
    payload.remoteEligibility === 'hybrid' ||
    payload.remoteEligibility === 'onsite'
      ? payload.remoteEligibility
      : 'unspecified';

  const skills = Array.isArray(payload.skills)
    ? Array.from(
        new Set(
          payload.skills
            .filter((s) => typeof s === 'string' && s.trim().length > 0)
            .map((s) => s.trim())
        )
      ).slice(0, 10)
    : [];

  return {
    valid: true,
    error: null,
    value: {
      isRelevant: Boolean(payload.isRelevant),
      roleCategory,
      domainTags: validTags.length > 0 ? validTags : [roleCategory],
      remoteEligibility,
      skills,
    },
  };
}
