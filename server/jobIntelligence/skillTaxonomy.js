export const FINCRIME_SKILL_TAXONOMY = [
  {
    id: 'kyc-cdd',
    label: 'KYC & CDD',
    trackId: 'kyc-onboarding',
    patterns: [
      /\bkyc\b/i,
      /\bknow your customer\b/i,
      /\bcdd\b/i,
      /\bcustomer due diligence\b/i,
      /\bcustomer onboarding\b/i,
      /\bidentity verification\b/i,
    ],
  },
  {
    id: 'edd-kyb',
    label: 'EDD & KYB',
    trackId: 'kyc-onboarding',
    patterns: [
      /\bedd\b/i,
      /\benhanced due diligence\b/i,
      /\bkyb\b/i,
      /\bknow your business\b/i,
      /\bbeneficial ownership\b/i,
      /\bubo\b/i,
      /\bcorporate due diligence\b/i,
    ],
  },
  {
    id: 'transaction-monitoring',
    label: 'Transaction Monitoring',
    trackId: 'aml-tm-investigations',
    patterns: [
      /\btransaction monitoring\b/i,
      /\balert investigation\b/i,
      /\balert triage\b/i,
      /\bname screening\b/i,
      /\btypologies?\b/i,
      /\bstructuring\b/i,
      /\bsmurfing\b/i,
      /\baml\b/i,
      /\banti[-\s]?money laundering\b/i,
    ],
  },
  {
    id: 'sar-str-reporting',
    label: 'SAR / STR & RFI',
    trackId: 'aml-tm-investigations',
    patterns: [
      /\bsar\b/i,
      /\bsuspicious activity report\b/i,
      /\bstr\b/i,
      /\bsuspicious transaction report\b/i,
      /\brfi\b/i,
      /\brequest for information\b/i,
      /\bfiu\b/i,
    ],
  },
  {
    id: 'sanctions-pep',
    label: 'Sanctions & PEP',
    trackId: 'sanctions-screening',
    patterns: [
      /\bsanctions?\b/i,
      /\bofac\b/i,
      /\bpep\b/i,
      /\bpolitically exposed\b/i,
      /\bscreening\b/i,
      /\bwatchlists?\b/i,
    ],
  },
  {
    id: 'financial-crime-fraud',
    label: 'Fraud & FinCrime Risk',
    trackId: 'fincrime-compliance',
    patterns: [
      /\bfincrime\b/i,
      /\bfinancial crime\b/i,
      /\bafp\b/i,
      /\bfraud\b/i,
      /\bchargebacks?\b/i,
      /\baccount takeover\b/i,
      /\bato\b/i,
      /\brisk assessment\b/i,
      /\bcompliance\b/i,
    ],
  },
];

export const ROLE_TRACKS = [
  {
    id: 'aml-tm-investigations',
    label: 'AML & Transaction Monitoring Investigations',
    keywords: [
      /\baml\b/i,
      /\btransaction monitoring\b/i,
      /\binvestigator\b/i,
      /\binvestigations?\b/i,
      /\bsar\b/i,
      /\bstr\b/i,
      /\balert\b/i,
    ],
  },
  {
    id: 'kyc-onboarding',
    label: 'KYC, KYB & Due Diligence',
    keywords: [
      /\bkyc\b/i,
      /\bkyb\b/i,
      /\bcdd\b/i,
      /\bedd\b/i,
      /\bonboarding\b/i,
      /\bdue diligence\b/i,
    ],
  },
  {
    id: 'sanctions-screening',
    label: 'Sanctions & PEP Screening',
    keywords: [
      /\bsanctions?\b/i,
      /\bpep\b/i,
      /\bscreening\b/i,
      /\bofac\b/i,
      /\bwatchlist\b/i,
    ],
  },
  {
    id: 'fincrime-compliance',
    label: 'Financial Crime & Fraud Compliance',
    keywords: [
      /\bfincrime\b/i,
      /\bfinancial crime\b/i,
      /\bfraud\b/i,
      /\bcompliance\b/i,
      /\brisk\b/i,
    ],
  },
];

const SENIORITY_TIERS = [
  {
    id: 'entry-associate',
    rank: 1,
    patterns: [/\bintern\b/i, /\btrainee\b/i, /\bjunior\b/i, /\bassociate\b/i, /\bentry\b/i],
  },
  {
    id: 'analyst-specialist',
    rank: 2,
    patterns: [/\banalyst\b/i, /\bspecialist\b/i, /\bofficer\b/i, /\breviewer\b/i],
  },
  {
    id: 'senior-lead',
    rank: 3,
    patterns: [/\bsenior\b/i, /\bsr\.?\b/i, /\blead\b/i, /\bmanager\b/i, /\bsupervisor\b/i],
  },
];

export function extractJobSkills(job) {
  const haystack = `${job?.title || ''} ${job?.description || ''}`.trim();
  if (!haystack) return [];

  return FINCRIME_SKILL_TAXONOMY.filter((skill) =>
    skill.patterns.some((pattern) => pattern.test(haystack))
  ).map((skill) => ({
    id: skill.id,
    label: skill.label,
    trackId: skill.trackId,
  }));
}

export function inferJobSeniority(job) {
  const titleText = String(job?.title || '').trim();
  for (const tier of SENIORITY_TIERS) {
    if (tier.patterns.some((pattern) => pattern.test(titleText))) {
      return { id: tier.id, rank: tier.rank };
    }
  }
  return null;
}