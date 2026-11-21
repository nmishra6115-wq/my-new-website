import { KNOWLEDGE_DOMAINS } from './knowledgeTestBank';

const DOMAIN_STUDY_GUIDES = {
  'AML/KYC': {
    focusAreas: [
      'Customer Due Diligence (CDD) vs. Enhanced Due Diligence (EDD) triggers',
      'Ultimate Beneficial Ownership (UBO) thresholds, layered trusts, and effective control',
      'Source of Funds (SoF) for specific transactions vs. Source of Wealth (SoW) overall profile',
      'PEP and RCA (Relatives and Close Associates) risk controls and periodic/event-driven reviews',
    ],
    checkQuestion:
      'What specific risk factor elevates this customer or structure above baseline CDD, and what corroborating evidence resolves that uncertainty?',
  },
  'Transaction Monitoring': {
    focusAreas: [
      'Structuring / threshold-adjacent deposits and rapid pass-through / mule typologies',
      'Comparing current transaction velocity and counterparties against historical account baseline',
      'Objective alert dispositioning vs. escalation without relying solely on static KYC ID checks',
      'Documenting clear chronologies and rationale before closing or escalating alerts',
    ],
    checkQuestion:
      'How does this activity compare against the customer’s established baseline, and what concrete red flags or anomalies stand out?',
  },
  'SAR Investigations': {
    focusAreas: [
      'Separating verifiable facts (dates, amounts, counterparties, records) from analytical inferences',
      'Identifying suspicious indicators and explicitly recording missing or unrequested evidence',
      'Maintaining strict confidentiality and avoiding tipping off subjects or unauthorized parties',
      'Structuring clear, objective chronologies that support supervisory and investigative review',
    ],
    checkQuestion:
      'Which details are verified facts on record, which points are analytical inferences, and what information is still missing?',
  },
  'Sanctions & Screening': {
    focusAreas: [
      'Comparing multiple identifiers (name variants/aliases, DOB, nationality/jurisdiction, ownership/control)',
      'Avoiding unverified false-positive closures or premature payment releases on fuzzy matches',
      'Applying ownership and control scrutiny (including aggregate/majority ownership rules where applicable)',
      'Escalating ambiguous or unresolved screening hits through formal compliance controls',
    ],
    checkQuestion:
      'Which matching or conflicting identifiers exist across name, DOB, jurisdiction, or ownership, and is the match resolved or requiring escalation?',
  },
};

export function getDomainStudyGuide(domain) {
  const safeDomain = KNOWLEDGE_DOMAINS.includes(domain) ? domain : 'AML/KYC';
  return DOMAIN_STUDY_GUIDES[safeDomain] || DOMAIN_STUDY_GUIDES['AML/KYC'];
}

export function buildQuestionHint(question, hasAnswered = false) {
  if (!question) {
    return 'Focus on the core compliance control, risk indicators, and regulatory objective tested by the scenario.';
  }
  const subtopic = question.subtopic || 'Core Compliance';
  const domain = question.domain || 'AML/KYC';
  const guide = getDomainStudyGuide(domain);

  if (!hasAnswered) {
    return `Subtopic Focus — ${subtopic}: ${guide.checkQuestion} Eliminate choices that skip due diligence, ignore pattern context, or rely on assumptions.`;
  }

  return `Post-Response Check (${subtopic}): ${question.explanation}`;
}

export function buildStudyRecommendations({
  domain,
  difficulty,
  recentAttempts = [],
  subtopicBreakdown = [],
}) {
  const guide = getDomainStudyGuide(domain);
  const weakSubtopics = (Array.isArray(subtopicBreakdown) ? subtopicBreakdown : [])
    .filter((item) => item.total > 0 && item.correct / item.total < 0.7)
    .map((item) => item.subtopic);

  const domainAttempts = (Array.isArray(recentAttempts) ? recentAttempts : []).filter(
    (att) => att.domain === domain
  );
  const avgAccuracy =
    domainAttempts.length > 0
      ? Math.round(
          domainAttempts.reduce((sum, att) => sum + (Number(att.accuracyPercent) || 0), 0) /
            domainAttempts.length
        )
      : null;

  let paceRecommendation = `Start with ${difficulty} practice sets in ${domain} to build strong control intuition before switching to Exam mode.`;
  if (avgAccuracy !== null) {
    if (avgAccuracy >= 80) {
      paceRecommendation = `Your ${domain} average across ${domainAttempts.length} recorded attempt(s) is ${avgAccuracy}%. Try Case Simulation or SAR Narrative Lab to apply judgment end-to-end.`;
    } else if (avgAccuracy >= 55) {
      paceRecommendation = `Your ${domain} average across ${domainAttempts.length} recorded attempt(s) is ${avgAccuracy}%. Review missed rationales in Practice mode and target subtopics below 70%.`;
    } else {
      paceRecommendation = `Your ${domain} average across ${domainAttempts.length} recorded attempt(s) is ${avgAccuracy}%. Slow down in Practice mode, verify core definitions/controls on each item, and revisit fundamentals.`;
    }
  }

  return {
    domain,
    paceRecommendation,
    weakSubtopics,
    focusAreas: guide.focusAreas,
  };
}
