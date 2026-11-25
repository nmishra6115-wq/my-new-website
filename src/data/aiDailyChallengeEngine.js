// 20-Domain AML/KYC Question Bank & Deterministic IST Rotation Engine (₹0 Cost)
import { notesContent } from '../content';
import { computeContentHash, resolveRelatedNoteIndex } from './dailyChallengeBank';

export const TWENTY_AML_CATEGORIES = [
  'AML Fundamentals',
  'KYC',
  'CDD',
  'EDD',
  'Transaction Monitoring',
  'Sanctions Screening',
  'PEP Screening',
  'Adverse Media',
  'KYB',
  'UBO',
  'SAR and STR',
  'Financial Crime Typologies',
  'Structuring',
  'Mule Accounts',
  'Source of Funds',
  'Source of Wealth',
  'Risk Assessment',
  'Fraud Detection',
  'Regulatory Compliance',
  'Complex Investigation Scenarios',
];

export const FOUR_DIFFICULTY_LEVELS = ['Beginner', 'Intermediate', 'Advanced', 'Expert'];

export const CHALLENGE_LEVEL_TIERS = [
  { level: 1, title: 'AML Explorer', minXp: 0 },
  { level: 2, title: 'KYC Learner', minXp: 150 },
  { level: 3, title: 'Compliance Investigator', minXp: 350 },
  { level: 4, title: 'Financial Crime Analyst', minXp: 650 },
  { level: 5, title: 'AML Specialist', minXp: 1050 },
  { level: 6, title: 'Risk Intelligence Expert', minXp: 1600 },
];

export const XP_REWARDS = {
  correctAnswer: 50,
  incorrectAnswer: 0,
  dailyCompletion: 10,
  streak7Milestone: 100,
  streak30Milestone: 500,
};

function buildQuestion({
  id,
  category,
  difficulty,
  jurisdiction,
  statement,
  correctAnswer,
  explanation,
  analystTakeaway,
  practicalApplication,
  keyLearningPoints,
  sourceReference,
  relatedNoteIndex = null,
  createdAt = '2026-11-01',
  publishedAt = '2026-11-01',
}) {
  const resolvedIdx = resolveRelatedNoteIndex(relatedNoteIndex, category);
  const noteObj = Array.isArray(notesContent) && typeof resolvedIdx === 'number' ? notesContent[resolvedIdx] : null;
  return {
    id,
    category,
    difficulty,
    jurisdiction: jurisdiction || 'Global',
    statement,
    correctAnswer: Boolean(correctAnswer),
    explanation,
    analystTakeaway,
    practicalApplication,
    keyLearningPoints: Array.isArray(keyLearningPoints) ? keyLearningPoints : [],
    sourceReference,
    relatedNoteIndex: resolvedIdx,
    relatedArticleTitle: noteObj?.title || 'AMLDecode Study Notes',
    contentHash: computeContentHash(statement, category),
    validationStatus: 'validated',
    reviewStatus: 'verified',
    publicationStatus: 'published',
    createdAt,
    publishedAt,
  };
}

// 32 validated questions across all 20 domains & 4 difficulty tiers (exceeds 30-question reserve target)
export const TWENTY_DOMAIN_CHALLENGE_BANK = [
  buildQuestion({
    id: 'DKC-20-01',
    category: 'AML Fundamentals',
    difficulty: 'Beginner',
    jurisdiction: 'Global',
    statement: 'Money laundering is commonly described in three conceptual stages - placement, layering, and integration - and an account can exhibit suspicious activity before any criminal conviction occurs.',
    correctAnswer: true,
    explanation: 'Suspicious activity monitoring identifies anomalies and potential money laundering risk indicators; a suspicious transaction or STR/SAR filing is a risk-based compliance indicator rather than proof of criminal guilt.',
    analystTakeaway: 'Never equate a red flag or STR filing with a adjudicated criminal finding.',
    practicalApplication: 'Document objective behavioral deviations and factual transaction patterns when escalating alerts.',
    keyLearningPoints: ['Placement, layering, and integration are analytical stages', 'Red flags indicate risk to investigate, not proven guilt'],
    sourceReference: 'FATF International Standards on Combating Money Laundering and the Financing of Terrorism & Proliferation',
    relatedNoteIndex: 0,
  }),
  buildQuestion({
    id: 'DKC-20-02',
    category: 'KYC',
    difficulty: 'Beginner',
    jurisdiction: 'Global',
    statement: 'Customer Due Diligence (CDD) relies exclusively on information provided directly by the customer during onboarding without independent verification.',
    correctAnswer: false,
    explanation: 'CDD requires verifying customer identity using reliable, independent source documents, data, or information, alongside understanding the purpose and intended nature of the business relationship.',
    analystTakeaway: 'Unverified self-reported details alone do not satisfy CDD verification standards.',
    practicalApplication: 'Cross-check customer identity and address attributes against reliable official or independent records.',
    keyLearningPoints: ['Independent verification is core to CDD', 'Understand purpose and intended activity at onboarding'],
    sourceReference: 'FATF Recommendation 10 (Customer Due Diligence)',
    relatedNoteIndex: 3,
  }),
  buildQuestion({
    id: 'DKC-20-03',
    category: 'CDD',
    difficulty: 'Beginner',
    jurisdiction: 'Global',
    statement: 'Standard CDD includes identifying the customer, verifying identity using reliable independent sources, and establishing the expected nature and purpose of the relationship.',
    correctAnswer: true,
    explanation: 'Baseline CDD establishes who the client is and what normal account behavior should look like so future transactions can be benchmarked against expected activity.',
    analystTakeaway: 'A clear baseline profile makes subsequent transaction monitoring far more accurate.',
    practicalApplication: 'Record occupation, expected monthly volume, and key counterparties during onboarding.',
    keyLearningPoints: ['Baseline expected activity anchors ongoing monitoring', 'Independent corroboration is mandatory'],
    sourceReference: 'FATF Recommendation 10 & Wolfsberg Group CDD Guidance',
    relatedNoteIndex: 3,
  }),
  buildQuestion({
    id: 'DKC-20-04',
    category: 'EDD',
    difficulty: 'Intermediate',
    jurisdiction: 'Global',
    statement: 'Enhanced Due Diligence (EDD) is required when a customer or relationship presents higher money laundering or terrorist financing risk, such as high-risk jurisdictions or complex structures.',
    correctAnswer: true,
    explanation: 'A risk-based approach requires heightened scrutiny, such as deeper source-of-wealth/funds verification and senior management approval, when risk factors are elevated.',
    analystTakeaway: 'Match due diligence depth to the specific risk profile rather than applying one static checklist.',
    practicalApplication: 'Collect corroborating documentation and document senior sign-off for high-risk profiles.',
    keyLearningPoints: ['EDD scales controls to elevated risk', 'Senior approval and deeper corroboration often apply'],
    sourceReference: 'FATF Recommendation 10 & FATF Risk-Based Approach Guidance',
    relatedNoteIndex: 4,
  }),
  buildQuestion({
    id: 'DKC-20-05',
    category: 'Transaction Monitoring',
    difficulty: 'Intermediate',
    jurisdiction: 'Global',
    statement: 'An analyst should close a high-value transfer alert as a false positive solely because the customer has been banked with the institution for three years.',
    correctAnswer: false,
    explanation: 'Long tenure does not eliminate money laundering or account-takeover risk; analysts must evaluate whether the specific transaction aligns with the customer profile, commercial rationale, and historical patterns.',
    analystTakeaway: 'Tenure is context, never automatic clearance for anomalous activity.',
    practicalApplication: 'Review recent activity, counterparty logic, and supporting records before closing high-value alerts.',
    keyLearningPoints: ['Evaluate transactions against profile and context', 'Avoid tenure bias during alert disposition'],
    sourceReference: 'Wolfsberg Group Guidance on Transaction Monitoring',
    relatedNoteIndex: 5,
  }),
  buildQuestion({
    id: 'DKC-20-06',
    category: 'Sanctions Screening',
    difficulty: 'Intermediate',
    jurisdiction: 'Global',
    statement: 'In sanctions screening, discounting a name alert as a false positive requires comparing secondary identifiers\'such as date of birth, nationality, address, or identification numbers\'rather than relying on a casual glance.',
    correctAnswer: true,
    explanation: 'Fuzzy name matching frequently surfaces coincidental matches; analysts must verify distinguishing attributes and document why the party is not a sanctioned match, escalating uncertain hits.',
    analystTakeaway: 'Insufficient or ambiguous identifier data warrants escalation rather than premature closure.',
    practicalApplication: 'Document specific identifier comparisons (DOB, ID, address, aliases) in every alert disposition.',
    keyLearningPoints: ['Secondary identifiers distinguish true matches from false positives', 'Escalate ambiguous or incomplete matches'],
    sourceReference: 'FATF Recommendation 6 & Sanctions Compliance Best Practices',
    relatedNoteIndex: 7,
  }),
  buildQuestion({
    id: 'DKC-20-07',
    category: 'PEP Screening',
    difficulty: 'Intermediate',
    jurisdiction: 'Global',
    statement: 'Once a Politically Exposed Person (PEP) leaves public office, the institution must immediately treat them as a standard low-risk customer with zero ongoing scrutiny.',
    correctAnswer: false,
    explanation: 'Under risk-based standards, former PEPs may still pose lingering influence or corruption risk; institutions assess ongoing risk factors, tenure in office, and time elapsed before adjusting risk ratings.',
    analystTakeaway: 'Departure from office does not automatically erase PEP risk.',
    practicalApplication: 'Apply risk-based review criteria and senior governance when evaluating former PEPs.',
    keyLearningPoints: ['Former PEPs require risk-based assessment', 'Consider ongoing influence and exposure'],
    sourceReference: 'FATF Guidance on Politically Exposed Persons (Recommendations 12 & 22)',
    relatedNoteIndex: 4,
  }),
  buildQuestion({
    id: 'DKC-20-08',
    category: 'Adverse Media',
    difficulty: 'Intermediate',
    jurisdiction: 'Global',
    statement: 'Every negative news article mentioning a person with a similar name automatically proves financial crime involvement and requires immediate account termination.',
    correctAnswer: false,
    explanation: 'Adverse media requires entity resolution (confirming it is the actual customer), credibility assessment of the source, and relevance to financial crime or reputational risk.',
    analystTakeaway: 'Confirm identity match, source reliability, and relevance before acting on adverse media.',
    practicalApplication: 'Distinguish verified financial crime allegations from unverified rumors or namesake hits.',
    keyLearningPoints: ['Entity resolution is essential in adverse media', 'Assess credibility and financial crime relevance'],
    sourceReference: 'FATF Risk-Based Approach Guidance & Compliance QA Standards',
    relatedNoteIndex: 4,
  }),
  buildQuestion({
    id: 'DKC-20-09',
    category: 'KYB',
    difficulty: 'Intermediate',
    jurisdiction: 'Global',
    statement: 'Know Your Business (KYB) onboarding for a corporate client focuses on verifying legal existence, ownership and control structure, authorized signatories, and actual business operations.',
    correctAnswer: true,
    explanation: 'Corporate due diligence looks beyond a registration certificate to understand how the legal entity operates, who controls it, and whether its stated business matches expected activity.',
    analystTakeaway: 'Verify both legal formation and real-world operational substance.',
    practicalApplication: 'Review registry records, constitutional/ownership documents, and business activity descriptions.',
    keyLearningPoints: ['KYB examines legal status, control, and business purpose', 'Operational alignment prevents shell-entity blind spots'],
    sourceReference: 'FATF Recommendations 10 & 24 (Transparency and Beneficial Ownership of Legal Persons)',
    relatedNoteIndex: 4,
  }),
  buildQuestion({
    id: 'DKC-20-10',
    category: 'UBO',
    difficulty: 'Advanced',
    jurisdiction: 'Global',
    statement: 'Identifying Ultimate Beneficial Owners (UBOs) stops at the first corporate shareholder in a multi-layered holding chain, even when that shareholder is another company.',
    correctAnswer: false,
    explanation: 'A UBO is the natural person(s) who ultimately own or control a customer or on whose behalf a transaction is conducted; analysts trace through corporate layers to natural persons and evaluate control.',
    analystTakeaway: 'Corporate entities are legal layers\'trace through them to natural persons and effective control.',
    practicalApplication: 'Map multi-tier ownership charts and assess both equity thresholds and control mechanisms.',
    keyLearningPoints: ['UBOs are natural persons, not holding companies', 'Trace layers and check effective control'],
    sourceReference: 'FATF Recommendation 24 & 25',
    relatedNoteIndex: 4,
  }),
  buildQuestion({
    id: 'DKC-20-11',
    category: 'SAR and STR',
    difficulty: 'Intermediate',
    jurisdiction: 'US & India',
    statement: 'In the United States, suspicious activity is generally reported via a Suspicious Activity Report (SAR) to FinCEN, whereas in India, Suspicious Transaction Reports (STRs) are filed with FIU-IND under the PMLA framework.',
    correctAnswer: true,
    explanation: 'Reporting terminology, statutory frameworks, and financial intelligence units vary by jurisdiction\'such as FinCEN SARs in the US and FIU-IND STRs under India\'s Prevention of Money Laundering Act (PMLA).',
    analystTakeaway: 'Always align reporting workflows and terminology with the governing jurisdiction\'s legal framework.',
    practicalApplication: 'State the applicable jurisdiction clearly and avoid assuming one country\'s reporting rules apply globally.',
    keyLearningPoints: ['US SARs go to FinCEN; Indian STRs fall under PMLA / FIU-IND', 'Jurisdictional rules are not identical worldwide'],
    sourceReference: 'FinCEN BSA Reporting Framework & India PMLA / FIU-IND STR Framework',
    relatedNoteIndex: 8,
  }),
  buildQuestion({
    id: 'DKC-20-12',
    category: 'SAR and STR',
    difficulty: 'Advanced',
    jurisdiction: 'Global',
    statement: 'Disclosing to a customer that a Suspicious Transaction Report or Suspicious Activity Report has been filed against them is standard customer service transparency.',
    correctAnswer: false,
    explanation: 'Revealing the existence or filing of a SAR/STR\'or tipping off a subject about a confidential suspicious-activity investigation\'can compromise investigations and violate statutory confidentiality rules.',
    analystTakeaway: 'Strict confidentiality surrounds STR/SAR filings and active suspicious-activity escalations.',
    practicalApplication: 'Follow approved non-tipping-off procedures when communicating with customers or relationship managers.',
    keyLearningPoints: ['Protect STR/SAR confidentiality', 'Prevent tipping off during investigations and outreach'],
    sourceReference: 'FATF Recommendation 20 & Statutory STR/SAR Confidentiality Principles',
    relatedNoteIndex: 8,
  }),
  buildQuestion({
    id: 'DKC-20-13',
    category: 'Financial Crime Typologies',
    difficulty: 'Intermediate',
    jurisdiction: 'Global',
    statement: 'Money laundering typologies evolve over time as criminals adapt payment rails, digital channels, and corporate vehicles to disguise illicit origins.',
    correctAnswer: true,
    explanation: 'Financial crime schemes adapt across cash, wire transfers, trade, cards, and digital payments, requiring analysts to spot underlying behavior rather than relying solely on outdated patterns.',
    analystTakeaway: 'Focus on economic rationale and flow patterns, not just rigid checklist assumptions.',
    practicalApplication: 'Compare observed fund movement against stated commercial or personal purpose.',
    keyLearningPoints: ['Typologies adapt across channels and instruments', 'Behavioral anomalies matter across evolving schemes'],
    sourceReference: 'FATF Typologies & Red Flag Indicators Reports',
    relatedNoteIndex: 6,
  }),
  buildQuestion({
    id: 'DKC-20-14',
    category: 'Structuring',
    difficulty: 'Intermediate',
    jurisdiction: 'Global',
    statement: 'Structuring involves breaking transactions into smaller amounts or conducting multiple transactions in a way designed to evade reporting or recordkeeping thresholds.',
    correctAnswer: true,
    explanation: 'Splitting deposits or transfers into smaller tranches to avoid triggering reporting thresholds is a classic red flag that warrants investigation and escalation when unexplained.',
    analystTakeaway: 'Look at cumulative patterns across dates, branches, or accounts rather than single transactions in isolation.',
    practicalApplication: 'Aggregate related cash or transfer activity over a lookback window and evaluate business rationale.',
    keyLearningPoints: ['Threshold avoidance across split transactions is a key red flag', 'Analyze cumulative patterns over time'],
    sourceReference: 'FATF Red Flag Indicators & Transaction Monitoring Standards',
    relatedNoteIndex: 5,
  }),
  buildQuestion({
    id: 'DKC-20-15',
    category: 'Mule Accounts',
    difficulty: 'Intermediate',
    jurisdiction: 'Global',
    statement: 'A money mule account typically shows rapid pass-through movement\'such as receiving funds from unfamiliar sources and quickly transferring or withdrawing them\'often inconsistent with the account holder\'s profile.',
    correctAnswer: true,
    explanation: 'Mule accounts are commonly used to move or obscure illicit or fraudulent proceeds quickly across accounts or payment channels.',
    analystTakeaway: 'Rapid inflow-to-outflow velocity with little economic explanation is a core mule indicator.',
    practicalApplication: 'Examine funding sources, payout speed, linked counterparties, and profile consistency.',
    keyLearningPoints: ['Rapid pass-through velocity is typical of mule activity', 'Compare activity against customer profile'],
    sourceReference: 'Financial Crime & Payment Fraud Typology Guidance',
    relatedNoteIndex: 6,
  }),
  buildQuestion({
    id: 'DKC-20-16',
    category: 'Source of Funds',
    difficulty: 'Beginner',
    jurisdiction: 'Global',
    statement: 'Source of Funds (SoF) refers to the origin of the specific funds used in a particular transaction or account funding event, whereas Source of Wealth (SoW) describes how the customer accumulated their overall net worth.',
    correctAnswer: true,
    explanation: 'SoF focuses on the immediate funding source for a specific transaction or deposit, while SoW addresses the broader origin of a customer\'s total wealth over time.',
    analystTakeaway: 'Keep Source of Funds (specific transaction/deposit) distinct from Source of Wealth (overall wealth origin).',
    practicalApplication: 'Request transaction-specific proof for SoF and broader historical/financial context for SoW.',
    keyLearningPoints: ['SoF = origin of specific funds/transaction', 'SoW = origin of overall accumulated wealth'],
    sourceReference: 'Wolfsberg Group & Private Banking / EDD Due Diligence Guidance',
    relatedNoteIndex: 4,
  }),
  buildQuestion({
    id: 'DKC-20-17',
    category: 'Source of Wealth',
    difficulty: 'Advanced',
    jurisdiction: 'Global',
    statement: 'Evaluating Source of Wealth (SoW) for a high-risk client means assessing the plausibility and consistency of how their overall wealth was generated relative to their career, business, or stated history.',
    correctAnswer: true,
    explanation: 'An effective SoW review checks whether stated wealth accumulation makes commercial and chronological sense and flags unexplained disparities.',
    analystTakeaway: 'Look for coherence between a client\'s stated background, timeline, and declared wealth.',
    practicalApplication: 'Document corroborating details and flag material inconsistencies for EDD escalation.',
    keyLearningPoints: ['SoW assesses plausibility of overall wealth accumulation', 'Inconsistencies warrant deeper EDD scrutiny'],
    sourceReference: 'FATF Risk-Based Approach Guidance & EDD Standards',
    relatedNoteIndex: 4,
  }),
  buildQuestion({
    id: 'DKC-20-18',
    category: 'Risk Assessment',
    difficulty: 'Intermediate',
    jurisdiction: 'Global',
    statement: 'An enterprise or customer money laundering risk assessment should consider factors such as customer profile, products/services, delivery channels, and geographic exposure.',
    correctAnswer: true,
    explanation: 'Comprehensive risk assessments evaluate inherent threats and vulnerabilities across customers, products, channels, and geographies alongside control effectiveness.',
    analystTakeaway: 'Effective risk scoring combines multiple risk dimensions rather than a single attribute.',
    practicalApplication: 'Verify that customer risk ratings reflect actual product, channel, and geographic exposure.',
    keyLearningPoints: ['Customer, product, channel, and geography shape risk', 'Risk ratings guide control intensity'],
    sourceReference: 'FATF Recommendation 1 (Assessing Risks and Applying a Risk-Based Approach)',
    relatedNoteIndex: 1,
  }),
  buildQuestion({
    id: 'DKC-20-19',
    category: 'Fraud Detection',
    difficulty: 'Intermediate',
    jurisdiction: 'Global',
    statement: 'Fraud detection and AML monitoring operate in complete isolation and never share insights such as account takeover, social engineering, or mule payout patterns.',
    correctAnswer: false,
    explanation: 'Fraud and AML frequently overlap\'for example, fraud proceeds moving through mule accounts or compromised credentials enabling illicit transfers\'making coordination valuable.',
    analystTakeaway: 'Connect fraud signals and AML flow patterns when investigating anomalous transfers.',
    practicalApplication: 'Check for linked fraud indicators, rapid reversals, or mule routing during investigations.',
    keyLearningPoints: ['Fraud and AML typologies often intersect', 'Cross-checking signals improves investigation quality'],
    sourceReference: 'Financial Crime Convergence & Typology Guidance',
    relatedNoteIndex: 6,
  }),
  buildQuestion({
    id: 'DKC-20-20',
    category: 'Regulatory Compliance',
    difficulty: 'Beginner',
    jurisdiction: 'Global',
    statement: 'Accurate, contemporaneous documentation of investigation steps, facts reviewed, and disposition rationale is essential for auditability and regulatory accountability.',
    correctAnswer: true,
    explanation: 'Compliance decisions must be auditable and defensible; clear notes show what was checked, why a conclusion was reached, and whether escalation occurred.',
    analystTakeaway: 'Write every alert or KYC note as if a regulator or quality reviewer will read it later.',
    practicalApplication: 'Record concrete facts, rationale, and escalation actions\'never vague one-word closures.',
    keyLearningPoints: ['Auditability requires clear, factual documentation', 'Rationale must support the disposition'],
    sourceReference: 'AML Program Governance & Quality Assurance Standards',
    relatedNoteIndex: 2,
  }),
  buildQuestion({
    id: 'DKC-20-21',
    category: 'Complex Investigation Scenarios',
    difficulty: 'Expert',
    jurisdiction: 'Global',
    statement: 'When an account receives multiple incoming transfers from unrelated senders followed quickly by outbound transfers and shows inconsistent KYC profile details, investigating the full flow\'not just one alert\'helps uncover network activity.',
    correctAnswer: true,
    explanation: 'Complex financial crime schemes often span multiple transactions, counterparties, or linked accounts; holistic flow analysis reveals patterns missed by single-item review.',
    analystTakeaway: 'Zoom out to full fund flows and counterparty relationships on multi-signal alerts.',
    practicalApplication: 'Trace inflows, outflows, profile mismatches, and linked activity before deciding disposition.',
    keyLearningPoints: ['Holistic flow review uncovers broader schemes', 'Connect profile mismatches with transaction behavior'],
    sourceReference: 'FATF Operational & Investigative Best Practices',
    relatedNoteIndex: 6,
  }),
  // Additional 11 questions across 20 domains & 4 difficulty tiers to ensure >= 30 reserve items
  buildQuestion({
    id: 'DKC-20-22',
    category: 'AML Fundamentals',
    difficulty: 'Expert',
    jurisdiction: 'Global',
    statement: 'Inherent risk is the level of money laundering or terrorist financing risk before applying risk controls, whereas residual risk is the risk remaining after controls are applied.',
    correctAnswer: true,
    explanation: 'Distinguishing inherent risk from residual risk clarifies whether controls are effectively mitigating exposure or leaving unaddressed gaps.',
    analystTakeaway: 'Weak or poorly executed controls leave high residual risk even when policies look good on paper.',
    practicalApplication: 'Assess both inherent exposure and real-world control execution when evaluating risk.',
    keyLearningPoints: ['Inherent risk precedes controls; residual risk follows controls', 'Control effectiveness governs residual exposure'],
    sourceReference: 'FATF Recommendation 1 & Risk Governance Framework',
    relatedNoteIndex: 1,
  }),
  buildQuestion({
    id: 'DKC-20-23',
    category: 'KYC',
    difficulty: 'Advanced',
    jurisdiction: 'Global',
    statement: 'Ongoing customer due diligence is a one-time onboarding task and never requires updating when customer behavior or risk profile changes.',
    correctAnswer: false,
    explanation: 'Ongoing due diligence requires keeping customer information relevant and up to date on a risk-sensitive basis, including when triggers or profile changes occur.',
    analystTakeaway: 'KYC is a lifecycle discipline, not a single onboarding form.',
    practicalApplication: 'Re-evaluate customer information and risk assumptions when material changes appear.',
    keyLearningPoints: ['Ongoing CDD maintains current risk understanding', 'Material changes warrant review'],
    sourceReference: 'FATF Recommendation 10',
    relatedNoteIndex: 3,
  }),
  buildQuestion({
    id: 'DKC-20-24',
    category: 'CDD',
    difficulty: 'Advanced',
    jurisdiction: 'Global',
    statement: 'Simplified due diligence may only be applied where lower risk has been adequately identified and analyzed consistent with a risk-based approach and applicable rules.',
    correctAnswer: true,
    explanation: 'Reduced measures are permitted only when risk is demonstrably lower under an assessed risk-based framework and remain subject to monitoring for unusual activity.',
    analystTakeaway: 'Lower risk justifies streamlined steps only when supported by risk assessment and subject to oversight.',
    practicalApplication: 'Confirm lower-risk eligibility rules and watch for anomalies that invalidate simplified treatment.',
    keyLearningPoints: ['Simplified measures depend on assessed lower risk', 'Ongoing vigilance still applies'],
    sourceReference: 'FATF Recommendation 10 & Interpretive Note',
    relatedNoteIndex: 3,
  }),
  buildQuestion({
    id: 'DKC-20-25',
    category: 'EDD',
    difficulty: 'Expert',
    jurisdiction: 'Global',
    statement: 'When a high-risk customer\'s activity diverges sharply from expected profile and lacks credible explanation, escalating for further review or suspicious-activity reporting is appropriate.',
    correctAnswer: true,
    explanation: 'Unexplained deviations in high-risk relationships elevate ML/TF concern and require escalation according to internal escalation and reporting procedures.',
    analystTakeaway: 'Do not rationalize unexplained high-risk anomalies away without proper escalation.',
    practicalApplication: 'Document discrepancies clearly and escalate promptly through compliance channels.',
    keyLearningPoints: ['Unexplained deviations require escalation', 'Follow internal escalation and reporting thresholds'],
    sourceReference: 'FATF Recommendations 10 & 20',
    relatedNoteIndex: 4,
  }),
  buildQuestion({
    id: 'DKC-20-26',
    category: 'Transaction Monitoring',
    difficulty: 'Expert',
    jurisdiction: 'Global',
    statement: 'Transaction monitoring rules and thresholds should be periodically reviewed against evolving typologies, customer profiles, and alert effectiveness rather than left untouched indefinitely.',
    correctAnswer: true,
    explanation: 'Static rules can miss emerging behaviors or generate excessive noise; periodic review and validation keep monitoring aligned with actual risk.',
    analystTakeaway: 'Monitoring effectiveness depends on periodic review and feedback from investigations.',
    practicalApplication: 'Share recurring typology observations with compliance/monitoring stakeholders.',
    keyLearningPoints: ['Periodic review keeps monitoring relevant', 'Investigation insights inform rule tuning'],
    sourceReference: 'Wolfsberg Group & AML Program Governance Standards',
    relatedNoteIndex: 5,
  }),
  buildQuestion({
    id: 'DKC-20-27',
    category: 'Sanctions Screening',
    difficulty: 'Expert',
    jurisdiction: 'Global',
    statement: 'Sanctions obligations apply strictly to direct customers and never affect counterparties, intermediaries, or payment routing details.',
    correctAnswer: false,
    explanation: 'Sanctions compliance covers customers as well as relevant counterparties, beneficial owners, and payment/transaction parties depending on applicable sanctions regimes.',
    analystTakeaway: 'Screen relevant parties across transactions and relationships, not just the primary account holder.',
    practicalApplication: 'Check counterparty and payment details carefully for sanctions exposure.',
    keyLearningPoints: ['Sanctions screening extends beyond primary customers', 'Check relevant parties and jurisdictions'],
    sourceReference: 'FATF Recommendation 6 & Sanctions Compliance Standards',
    relatedNoteIndex: 7,
  }),
  buildQuestion({
    id: 'DKC-20-28',
    category: 'PEP Screening',
    difficulty: 'Expert',
    jurisdiction: 'Global',
    statement: 'Family members and close associates of a PEP can present heightened compliance risk because funds or benefits may be routed through connected individuals.',
    correctAnswer: true,
    explanation: 'Associates and family members may be used to hold assets or conduct transactions linked to a PEP, warranting risk-aware due diligence.',
    analystTakeaway: 'Consider connected family members and close associates when assessing PEP exposure.',
    practicalApplication: 'Verify relationships and screen connected parties where required by policy and risk.',
    keyLearningPoints: ['Family members and close associates can carry connected risk', 'Assess linked relationships carefully'],
    sourceReference: 'FATF Recommendations 12 & 22',
    relatedNoteIndex: 4,
  }),
  buildQuestion({
    id: 'DKC-20-29',
    category: 'KYB',
    difficulty: 'Expert',
    jurisdiction: 'Global',
    statement: 'A newly registered entity with no operating history that immediately requests large cross-border transfers inconsistent with its stated line of business warrants heightened scrutiny.',
    correctAnswer: true,
    explanation: 'Sudden high-value or cross-border activity in a newly formed or dormant-looking entity inconsistent with stated operations is a classic risk indicator.',
    analystTakeaway: 'Test stated business rationale against actual transaction scale and timing.',
    practicalApplication: 'Review corporate profile, activity justification, and counterparty logic before clearing.',
    keyLearningPoints: ['New/low-history entities with high-value activity merit scrutiny', 'Check alignment with stated business'],
    sourceReference: 'FATF Typologies on Misuse of Legal Persons',
    relatedNoteIndex: 4,
  }),
  buildQuestion({
    id: 'DKC-20-30',
    category: 'UBO',
    difficulty: 'Beginner',
    jurisdiction: 'Global',
    statement: 'Beneficial ownership transparency helps financial institutions and authorities understand which real individuals own or control an entity behind complex legal structures.',
    correctAnswer: true,
    explanation: 'Identifying natural persons who own or control legal entities reduces anonymity and supports accurate risk assessment and sanctions/AML compliance.',
    analystTakeaway: 'Beneficial ownership clarity is foundational to corporate financial crime prevention.',
    practicalApplication: 'Document ownership and control findings clearly in KYB/EDD files.',
    keyLearningPoints: ['BO transparency reveals real individuals behind entities', 'Supports risk rating and compliance checks'],
    sourceReference: 'FATF Recommendation 24',
    relatedNoteIndex: 4,
  }),
  buildQuestion({
    id: 'DKC-20-31',
    category: 'Structuring',
    difficulty: 'Expert',
    jurisdiction: 'Global',
    statement: 'If multiple deposits occur just under a reporting threshold across different days or locations without clear commercial justification, looking only at each single deposit in isolation can mask the structuring pattern.',
    correctAnswer: true,
    explanation: 'Structuring is often designed so each individual transaction looks small or routine; pattern analysis across time and channels reveals the broader behavior.',
    analystTakeaway: 'Aggregate activity across time windows to spot split or structured behavior.',
    practicalApplication: 'Review cumulative patterns and surrounding activity rather than isolated single items.',
    keyLearningPoints: ['Single-item review can miss split transactions', 'Time-window aggregation exposes patterns'],
    sourceReference: 'AML Transaction Monitoring & Typology Guidance',
    relatedNoteIndex: 5,
  }),
  buildQuestion({
    id: 'DKC-20-32',
    category: 'Regulatory Compliance',
    difficulty: 'Expert',
    jurisdiction: 'Global',
    statement: 'Independent audit or quality assurance testing helps verify that AML policies and controls work effectively in practice and identifies areas for remediation.',
    correctAnswer: true,
    explanation: 'Independent testing and QA evaluate whether controls operate as intended and highlight process or documentation gaps for timely remediation.',
    analystTakeaway: 'Independent review strengthens trust and catches control drift early.',
    practicalApplication: 'Address QA and audit observations thoroughly and verify corrective steps.',
    keyLearningPoints: ['Independent testing validates control effectiveness', 'Findings drive structured remediation'],
    sourceReference: 'FATF Recommendation 15 & AML Governance Standards',
    relatedNoteIndex: 2,
  }),
];

export function getIstDateKey(now = new Date()) {
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
  return formatter.format(now); // YYYY-MM-DD in Asia/Kolkata
}

export function getIstDisplayDate(now = new Date()) {
  return new Intl.DateTimeFormat('en-IN', {
    timeZone: 'Asia/Kolkata',
    weekday: 'long',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(now);
}

export function getIstDayIndex(dateIsoIst) {
  const match = /^(d{4})-(d{2})-(d{2})$/.exec(String(dateIsoIst || '').trim());
  if (!match) return 0;
  return Math.floor(Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3])) / 86400000);
}

// Deterministic daily question rotation in Asia/Kolkata that works even if a cron job runs late
export function selectDailyChallengeEngine({
  now = new Date(),
  pool = TWENTY_DOMAIN_CHALLENGE_BANK,
  recentQuestionIds = [],
  paused = false,
  pinnedQuestionId = null,
}) {
  const istDate = getIstDateKey(now);
  const displayDate = getIstDisplayDate(now);
  const dayIndex = getIstDayIndex(istDate);

  const validPool = (Array.isArray(pool) && pool.length > 0 ? pool : TWENTY_DOMAIN_CHALLENGE_BANK).filter(
    (q) => q && typeof q.statement === 'string' && typeof q.correctAnswer === 'boolean'
  );

  if (validPool.length === 0) {
    return {
      dateIsoIst: istDate,
      displayDateIst: displayDate,
      challenge: null,
      unavailableReason: 'Daily Challenge inventory is temporarily unavailable. Please check back shortly or use topic practice.',
      reserveCount: 0,
      needsReplenishment: true,
    };
  }

  if (pinnedQuestionId) {
    const pinned = validPool.find((q) => q.id === pinnedQuestionId);
    if (pinned) {
      return {
        dateIsoIst: istDate,
        displayDateIst: displayDate,
        challenge: pinned,
        paused,
        reserveCount: validPool.length,
        needsReplenishment: validPool.length < 30,
      };
    }
  }

  // Balance categories across the 20 domains & avoid repeating recent questions or consecutive identical difficulty
  const targetCategory = TWENTY_AML_CATEGORIES[Math.abs(dayIndex) % TWENTY_AML_CATEGORIES.length];
  const categoryMatches = validPool.filter((q) => q.category === targetCategory);
  const candidates = categoryMatches.length > 0 ? categoryMatches : validPool;

  const recentSet = new Set(Array.isArray(recentQuestionIds) ? recentQuestionIds.slice(0, 14) : []);
  const freshCandidates = candidates.filter((q) => !recentSet.has(q.id));
  const selectionPool = freshCandidates.length > 0 ? freshCandidates : candidates;

  const picked = selectionPool[Math.abs(dayIndex) % selectionPool.length];

  return {
    dateIsoIst: istDate,
    displayDateIst: displayDate,
    challenge: picked,
    paused,
    reserveCount: validPool.length,
    needsReplenishment: validPool.length < 30,
  };
}
