import {
  KNOWLEDGE_DOMAINS,
  DIFFICULTY_LEVELS,
} from './knowledgeTestBank';

const AI_CACHE_STORAGE_KEY = 'amldecode_kt2_ai_cache_v1';
const memoryCache = new Map();

const SCENARIO_TEMPLATES = {
  'AML/KYC': [
    {
      subtopic: 'Beneficial Ownership & Nominee Layers',
      jurisdiction: 'General / FATF',
      question:
        'A newly onboarded corporate client lists a nominee director in a low-tax jurisdiction and two holding companies that together hold 60% equity, with ownership disclosures delayed. Which compliance control should be applied before authorizing high-value activity?',
      options: [
        'Trace ownership through the holding chain to identify natural-person UBOs, verify Source of Wealth, and apply EDD controls',
        'Approve the account immediately because corporate registration certificates are present',
        'Waive UBO verification if the client promises to submit documents next quarter',
        'Treat the nominee director as the sole beneficial owner without checking underlying shareholders',
      ],
      correct_answer:
        'Trace ownership through the holding chain to identify natural-person UBOs, verify Source of Wealth, and apply EDD controls',
      explanation:
        'Opaque layered holding structures and nominee arrangements warrant looking through legal entities to natural persons with ownership or effective control, paired with EDD and SoW verification.',
      sourceRef: 'FATF Recommendations 10 & 24 — Beneficial Ownership & EDD',
    },
    {
      subtopic: 'Source of Funds vs. Source of Wealth',
      jurisdiction: 'General / AML Controls',
      question:
        'A customer deposits a large lump sum from a recent property sale while claiming lifetime savings from a modest salaried role. How should an analyst differentiate Source of Funds (SoF) and Source of Wealth (SoW)?',
      options: [
        'SoF covers the specific sale proceeds/settlement trail for this deposit, while SoW evaluates whether overall net worth aligns with career and asset history',
        'SoF and SoW are identical terms and only one document is ever needed',
        'SoW only applies to wire transfers under $1,000',
        'SoF replaces customer identity verification',
      ],
      correct_answer:
        'SoF covers the specific sale proceeds/settlement trail for this deposit, while SoW evaluates whether overall net worth aligns with career and asset history',
      explanation:
        'Distinguishing immediate transaction origin (SoF) from broader accumulated wealth (SoW) helps analysts spot inconsistencies between stated background and observed capital.',
      sourceRef: 'AMLDecode CDD/EDD Reference Standard',
    },
  ],
  'Transaction Monitoring': [
    {
      subtopic: 'Structuring & Rapid Pass-Through',
      jurisdiction: 'General / AML Typologies',
      question:
        'Over five business days, an account receives nine cash deposits just under the local reporting threshold and wires 92% of the total to an offshore trading counterparty with no prior history. What typology and action fit best?',
      options: [
        'Potential structuring and rapid pass-through layering; document the exact chronology and escalate for investigative/SAR review',
        'Routine retail activity; close the alert immediately with no further checks',
        'Confirm customer intent via casual message and suppress future monitoring rules',
        'Reverse the incoming cash deposits without recording an alert disposition',
      ],
      correct_answer:
        'Potential structuring and rapid pass-through layering; document the exact chronology and escalate for investigative/SAR review',
      explanation:
        'Threshold-adjacent deposits paired with rapid near-full outbound pass-through to an unprofiled counterparty are classic red flags requiring structured investigation and escalation.',
      sourceRef: 'Transaction Monitoring Typologies — Structuring & Pass-Through',
    },
    {
      subtopic: 'Alert Triage & False Positive Discipline',
      jurisdiction: 'General / TM Operations',
      question:
        'A payroll-funded account triggers a high-velocity alert on payday because 40 recurring small bill payments and rent execute within 24 hours, matching 12 months of history. How should this be handled?',
      options: [
        'Document the consistent historical baseline, verify no anomalous counterparties or geographic spikes, and disposition as expected behavior / false positive',
        'Escalate every recurring alert automatically without checking account history',
        'Freeze the customer account until annual tax returns are uploaded',
        'Alter alert thresholds manually during the case review',
      ],
      correct_answer:
        'Document the consistent historical baseline, verify no anomalous counterparties or geographic spikes, and disposition as expected behavior / false positive',
      explanation:
        'Comparing current activity against verified historical baselines and checking for new risk indicators allows disciplined dispositioning without unnecessary friction.',
      sourceRef: 'TM Alert Disposition & Baseline Analysis Standard',
    },
  ],
  'SAR Investigations': [
    {
      subtopic: 'Chronology & Fact vs. Hypothesis Separation',
      jurisdiction: 'General / SAR Standards',
      question:
        'When drafting an escalation summary for a suspected mule network, how should you handle an unconfirmed link between two accounts that share a phone number?',
      options: [
        'State the shared phone number as a documented fact and clearly label any inference about coordination as an analytical observation rather than proven fact',
        'Write as proven criminal conspiracy without noting what is unverified',
        'Leave out the shared phone number because it is not a dollar amount',
        'Include speculative motives without dates or amounts',
      ],
      correct_answer:
        'State the shared phone number as a documented fact and clearly label any inference about coordination as an analytical observation rather than proven fact',
      explanation:
        'Separating verified records (dates, amounts, shared attributes) from analytical inferences keeps escalation and SAR narratives objective, accurate, and audit-ready.',
      sourceRef: 'SAR Narrative Quality & Evidentiary Discipline',
    },
    {
      subtopic: 'Missing Information & Anti-Tipping-Off',
      jurisdiction: 'General / SAR Governance',
      question:
        'During a suspicious activity review, requested commercial invoices are still missing after two follow-ups. How should this be reflected in the investigation record?',
      options: [
        'Record the missing documentation and unanswered requests explicitly while maintaining strict confidentiality and avoiding tipping off the customer',
        'Tell the customer an SAR is being considered so they send the invoices faster',
        'Fabricate an expected invoice reference to complete the file',
        'Mark the case closed as unsubstantiated without noting the missing records',
      ],
      correct_answer:
        'Record the missing documentation and unanswered requests explicitly while maintaining strict confidentiality and avoiding tipping off the customer',
      explanation:
        'Documenting evidentiary gaps transparently—while preserving confidentiality and anti-tipping-off safeguards—supports sound escalation decisions.',
      sourceRef: 'SAR Escalation, Gaps & Confidentiality Controls',
    },
  ],
  'Sanctions & Screening': [
    {
      subtopic: 'Name Matching, Aliases & False Positives',
      jurisdiction: 'General / Sanctions Controls',
      question:
        'A payment screening alert triggers on a fuzzy name match for an individual with the same first and last name, but a different birth year, middle name, and country of residence. What is required before clearing?',
      options: [
        'Compare and document the conflicting identifiers (DOB, middle name, residence/nationality) against the sanctions entry before clearing as a false positive',
        'Clear immediately by keyword without checking DOB or middle name',
        'Block all transactions with similar spellings permanently without review',
        'Ask the beneficiary bank to clear the sanctions hit on your behalf',
      ],
      correct_answer:
        'Compare and document the conflicting identifiers (DOB, middle name, residence/nationality) against the list entry before clearing as a false positive',
      explanation:
        'Defensible sanctions alert disposition relies on checking available identifiers and recording why the alert is a true or false match.',
      sourceRef: 'Sanctions Screening Alert Resolution & False Positive Controls',
    },
    {
      subtopic: 'Ownership & Control Screening',
      jurisdiction: 'General / Sanctions Compliance',
      question:
        'Why must sanctions screening look beyond exact name matches on the primary payment parties?',
      options: [
        'Sanctioned parties or owned/controlled entities may appear under spelling variants, aliases, intermediaries, or majority/aggregate ownership structures',
        'Because spelling variations are ignored by payment networks',
        'Only to flag domestic utility payments',
        'Because screening only applies after funds settle',
      ],
      correct_answer:
        'Sanctioned parties or owned/controlled entities may appear under spelling variants, aliases, intermediaries, or majority/aggregate ownership structures',
      explanation:
        'Evasion often involves aliases, transliteration variants, intermediaries, or controlled entities, making structured identifier and ownership checks essential.',
      sourceRef: 'Sanctions Screening & Ownership/Control Principles',
    },
  ],
};

export function validateQuestionSchema(candidate) {
  if (!candidate || typeof candidate !== 'object') {
    return { valid: false, reason: 'Candidate is not an object.' };
  }
  if (!KNOWLEDGE_DOMAINS.includes(candidate.domain)) {
    return { valid: false, reason: 'Invalid or missing compliance domain.' };
  }
  if (!DIFFICULTY_LEVELS.includes(candidate.difficulty)) {
    return { valid: false, reason: 'Invalid or missing difficulty level.' };
  }
  if (typeof candidate.question !== 'string' || candidate.question.trim().length < 15) {
    return { valid: false, reason: 'Question prompt is missing or too short.' };
  }
  if (!Array.isArray(candidate.options) || candidate.options.length < 2) {
    return { valid: false, reason: 'At least two answer options are required.' };
  }
  const uniqueOptions = new Set(candidate.options.map((opt) => String(opt).trim()));
  if (uniqueOptions.size !== candidate.options.length) {
    return { valid: false, reason: 'Answer options must be distinct.' };
  }
  if (
    typeof candidate.correct_answer !== 'string' ||
    !candidate.options.includes(candidate.correct_answer)
  ) {
    return { valid: false, reason: 'correct_answer must match one of the options.' };
  }
  if (typeof candidate.explanation !== 'string' || candidate.explanation.trim().length < 15) {
    return { valid: false, reason: 'Compliance explanation is required.' };
  }
  if (
    candidate.reviewStatus !== 'reviewed' &&
    candidate.reviewStatus !== 'migrated_reviewed' &&
    candidate.reviewStatus !== 'ai_generated_unreviewed'
  ) {
    return { valid: false, reason: 'Explicit reviewStatus is required.' };
  }
  return { valid: true, reason: 'OK' };
}

function readPersistentAiCache() {
  try {
    const raw = window.localStorage.getItem(AI_CACHE_STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

function writePersistentAiCache(cacheObj) {
  try {
    window.localStorage.setItem(AI_CACHE_STORAGE_KEY, JSON.stringify(cacheObj));
  } catch {
    // Ignore storage quota errors
  }
}

export function getCachedAiQuestions({ domain, difficulty, mode = 'practice', count = 10 }) {
  const cacheKey = `${domain}::${difficulty}::${mode}::${count}`;
  if (memoryCache.has(cacheKey)) {
    return { items: memoryCache.get(cacheKey), fromCache: true };
  }
  const persistent = readPersistentAiCache();
  if (Array.isArray(persistent[cacheKey]) && persistent[cacheKey].length > 0) {
    const validated = persistent[cacheKey].filter((q) => validateQuestionSchema(q).valid);
    memoryCache.set(cacheKey, validated);
    return { items: validated, fromCache: true };
  }
  return { items: [], fromCache: false };
}

export function generateControlledAiQuestions({
  domain,
  difficulty = 'Intermediate',
  mode = 'practice',
  count = 10,
  forceRefresh = false,
}) {
  const safeDomain = KNOWLEDGE_DOMAINS.includes(domain) ? domain : 'AML/KYC';
  const safeDifficulty = DIFFICULTY_LEVELS.includes(difficulty) ? difficulty : 'Intermediate';
  const cacheKey = `${safeDomain}::${safeDifficulty}::${mode}::${count}`;

  if (!forceRefresh) {
    const existing = getCachedAiQuestions({
      domain: safeDomain,
      difficulty: safeDifficulty,
      mode,
      count,
    });
    if (existing.items.length > 0) {
      return {
        items: existing.items,
        fromCache: true,
        rejectedCount: 0,
        reviewStatus: 'ai_generated_unreviewed',
      };
    }
  }

  const templates = SCENARIO_TEMPLATES[safeDomain] || SCENARIO_TEMPLATES['AML/KYC'];
  const targetBatchSize = Math.min(Math.max(2, Number(count) || 4), 4);
  const generated = [];
  let rejectedCount = 0;

  for (let i = 0; i < targetBatchSize; i += 1) {
    const base = templates[i % templates.length];
    const candidate = {
      id: `ai-${safeDomain.toLowerCase().replace(/[^a-z0-9]/g, '')}-${safeDifficulty.toLowerCase()}-${i + 1}`,
      domain: safeDomain,
      legacyCategory: safeDomain,
      subtopic: base.subtopic,
      difficulty: safeDifficulty,
      jurisdiction: base.jurisdiction,
      questionType: 'single_mcq',
      question: `[${safeDifficulty} Scenario · ${mode.toUpperCase()}] ${base.question}`,
      options: base.options,
      correct_answer: base.correct_answer,
      explanation: base.explanation,
      sourceRef: `${base.sourceRef} (Controlled AI Scenario Draft)`,
      reviewStatus: 'ai_generated_unreviewed',
      isAiGenerated: true,
    };

    const check = validateQuestionSchema(candidate);
    if (check.valid) {
      generated.push(candidate);
    } else {
      rejectedCount += 1;
    }
  }

  memoryCache.set(cacheKey, generated);
  const persistent = readPersistentAiCache();
  persistent[cacheKey] = generated;
  writePersistentAiCache(persistent);

  return {
    items: generated,
    fromCache: false,
    rejectedCount,
    reviewStatus: 'ai_generated_unreviewed',
  };
}
