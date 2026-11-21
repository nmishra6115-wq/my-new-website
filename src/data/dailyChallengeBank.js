import { notesContent } from '../content';

export const DAILY_TOPIC_ROTATION = {
  Monday: 'AML',
  Tuesday: 'KYC',
  Wednesday: 'Transaction Monitoring',
  Thursday: 'SAR',
  Friday: 'Sanctions & PEP',
  Saturday: 'Advanced Investigation',
  Sunday: 'Mixed Challenge',
};

export function computeContentHash(statement = '', topic = '') {
  const normalized = `${String(statement).trim().toLowerCase().replace(/\s+/g, ' ')}|${String(topic).trim().toLowerCase()}`;
  let h1 = 0x811c9dc5;
  let h2 = 0x01000193;
  for (let i = 0; i < normalized.length; i += 1) {
    const code = normalized.charCodeAt(i);
    h1 ^= code;
    h1 = Math.imul(h1, 0x01000193) >>> 0;
    h2 ^= code + i;
    h2 = Math.imul(h2, 0x85ebca6b) >>> 0;
  }
  return `dkc_${h1.toString(16).padStart(8, '0')}${h2.toString(16).padStart(8, '0')}`;
}

export function resolveRelatedNoteIndex(preferredIndex, topic = '') {
  if (!Array.isArray(notesContent) || notesContent.length === 0) return null;
  if (typeof preferredIndex === 'number' && preferredIndex >= 0 && preferredIndex < notesContent.length) {
    return preferredIndex;
  }
  const t = String(topic).toLowerCase();
  const matchers =
    t.includes('kyc')
      ? ['kyc', 'cdd', 'due diligence', 'ownership']
      : t.includes('monitoring') || t.includes('investigation')
      ? ['transaction monitoring', 'escalation', 'typolog']
      : t.includes('sar')
      ? ['sar', 'str', 'suspicious']
      : t.includes('sanction') || t.includes('pep')
      ? ['sanction', 'pep', 'screening']
      : ['aml', 'money laundering', 'placement'];

  const foundIdx = notesContent.findIndex((mod) => {
    const title = String(mod?.title || '').toLowerCase();
    return matchers.some((kw) => title.includes(kw));
  });
  return foundIdx >= 0 ? foundIdx : 0;
}

export const VERIFIED_DAILY_CHALLENGES = [
  {
    id: 'dkc-aml-001',
    topic: 'AML',
    difficulty: 'Intermediate',
    jurisdiction: 'Global / FATF',
    statement:
      'Layering is the stage of money laundering designed to obscure the audit trail through complex, repeated, or multi-jurisdictional transactions after initial placement.',
    correctAnswer: true,
    explanation:
      'Placement introduces illicit funds into the financial system, layering separates funds from their illegal source via complex or rapid transfers, and integration reintroduces cleaned funds into legitimate economic activity.',
    sourceReference: 'FATF Guidance — Money Laundering & Terrorist Financing Typologies',
    relatedArticleId: 'aml-fundamentals',
    relatedNoteIndex: 0,
    relatedArticleTitle: 'AML Fundamentals & Money Laundering Stages',
    reviewStatus: 'verified',
    publicationStatus: 'published',
  },
  {
    id: 'dkc-kyc-002',
    topic: 'KYC',
    difficulty: 'Intermediate',
    jurisdiction: 'Global / Risk-Based',
    statement:
      'Beneficial ownership verification for a corporate customer is satisfied solely by recording the name of the local branch manager or nominee director.',
    correctAnswer: false,
    explanation:
      'Institutions must identify and take reasonable measures to verify the natural person(s) who ultimately own or control the customer—not merely a nominee director or nominal signatory.',
    sourceReference: 'FATF Recommendation 10 — Customer Due Diligence',
    relatedArticleId: 'kyc-ubo',
    relatedNoteIndex: 2,
    relatedArticleTitle: 'Customer Due Diligence & Beneficial Ownership (UBO)',
    reviewStatus: 'verified',
    publicationStatus: 'published',
  },
  {
    id: 'dkc-tm-003',
    topic: 'Transaction Monitoring',
    difficulty: 'Intermediate',
    jurisdiction: 'Global',
    statement:
      'Structuring (smurfing) involves breaking a large sum of cash or funds into smaller transactions conducted just below reporting or monitoring thresholds to evade detection.',
    correctAnswer: true,
    explanation:
      'Splitting deposits, withdrawals, or transfers into amounts designed to stay under reporting thresholds—especially across multiple visits, branches, or related accounts—is a classic structuring indicator.',
    sourceReference: 'Wolfsberg Group — Transaction Monitoring & Alert Investigation Principles',
    relatedArticleId: 'transaction-monitoring',
    relatedNoteIndex: 4,
    relatedArticleTitle: 'Transaction Monitoring & Escalation Controls',
    reviewStatus: 'verified',
    publicationStatus: 'published',
  },
  {
    id: 'dkc-sar-004',
    topic: 'SAR',
    difficulty: 'Intermediate',
    jurisdiction: 'Global',
    statement:
      'A Suspicious Activity Report (SAR) narrative should rely on unverified speculation and legal conclusions rather than a clear chronology of facts, parties, and red flags.',
    correctAnswer: false,
    explanation:
      'Effective SAR/STR narratives are objective, chronological, and evidence-backed—clearly presenting who, what, when, where, how, and why the activity is suspicious without guessing legal guilt.',
    sourceReference: 'Egmont Group — Operational Guidance on SAR/STR Reporting',
    relatedArticleId: 'sar-narrative',
    relatedNoteIndex: 7,
    relatedArticleTitle: 'SAR / STR Drafting & Investigation Chronology',
    reviewStatus: 'verified',
    publicationStatus: 'published',
  },
  {
    id: 'dkc-sanc-005',
    topic: 'Sanctions & PEP',
    difficulty: 'Intermediate',
    jurisdiction: 'Global',
    statement:
      'When a payment is routed through an intermediary or correspondent bank subject to sanctions, an institution can safely release it without review as long as the originator and beneficiary are not listed.',
    correctAnswer: false,
    explanation:
      'Sanctions screening applies across the full payment chain—including originators, beneficiaries, intermediaries, and correspondent banks—and holds/escalations must not be bypassed merely because end parties appear clear.',
    sourceReference: 'FATF Recommendation 16 & Sanctions Screening Controls',
    relatedArticleId: 'sanctions-screening',
    relatedNoteIndex: 5,
    relatedArticleTitle: 'Sanctions Screening, Watchlists & PEP Escalation',
    reviewStatus: 'verified',
    publicationStatus: 'published',
  },
  {
    id: 'dkc-inv-006',
    topic: 'Advanced Investigation',
    difficulty: 'Advanced',
    jurisdiction: 'Global',
    statement:
      'In a funnel account investigation, multiple unrelated depositors or locations often send smaller credits into a central account followed by rapid outward consolidation or withdrawal.',
    correctAnswer: true,
    explanation:
      'Funnel accounts typically aggregate funds from dispersed sources or geographies and quickly move balances out via wire, cash withdrawal, or linked accounts, warranting network and source-of-funds review.',
    sourceReference: 'Financial Crime Typologies — Funnel & Mule Account Red Flags',
    relatedArticleId: 'funnel-typology',
    relatedNoteIndex: 4,
    relatedArticleTitle: 'Transaction Monitoring & Investigation Typologies',
    reviewStatus: 'verified',
    publicationStatus: 'published',
  },
].map((item) => ({
  ...item,
  contentHash: computeContentHash(item.statement, item.topic),
}));

export function getIstDateInfo(now = new Date()) {
  const dateIsoIst = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(now);

  const weekdayName = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Kolkata',
    weekday: 'long',
  }).format(now);

  const displayDateIst = new Intl.DateTimeFormat('en-IN', {
    timeZone: 'Asia/Kolkata',
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(now);

  const rotationTopic = DAILY_TOPIC_ROTATION[weekdayName] || 'Mixed Challenge';
  return { dateIsoIst, weekdayName, displayDateIst, rotationTopic };
}

export function selectDailyChallengeForDate(dateIsoIst, rotationTopic, pool = VERIFIED_DAILY_CHALLENGES) {
  const verifiedPool = Array.isArray(pool)
    ? pool.filter(
        (q) =>
          q &&
          typeof q.statement === 'string' &&
          typeof q.correctAnswer === 'boolean' &&
          (q.reviewStatus === 'verified' || q.reviewStatus === 'approved' || !q.reviewStatus)
      )
    : [];
  const sourceList = verifiedPool.length > 0 ? verifiedPool : VERIFIED_DAILY_CHALLENGES;

  const topicMatches = sourceList.filter(
    (q) => String(q.topic || '').toLowerCase() === String(rotationTopic || '').toLowerCase()
  );
  const candidates = topicMatches.length > 0 ? topicMatches : sourceList;

  let hash = 0;
  for (let i = 0; i < dateIsoIst.length; i += 1) {
    hash = (hash * 31 + dateIsoIst.charCodeAt(i)) >>> 0;
  }
  const picked = candidates[hash % candidates.length];
  const resolvedNoteIndex = resolveRelatedNoteIndex(picked.relatedNoteIndex, picked.topic);
  const resolvedTitle =
    picked.relatedArticleTitle ||
    (typeof resolvedNoteIndex === 'number' && notesContent[resolvedNoteIndex]?.title) ||
    'AMLDecode Study Notes';

  return {
    ...picked,
    relatedNoteIndex: resolvedNoteIndex,
    relatedArticleTitle: resolvedTitle,
  };
}
