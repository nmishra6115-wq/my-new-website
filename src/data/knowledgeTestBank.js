export const KNOWLEDGE_DOMAINS = [
  'AML/KYC',
  'Transaction Monitoring',
  'SAR Investigations',
  'Sanctions & Screening',
];

export const DIFFICULTY_LEVELS = [
  'Beginner',
  'Intermediate',
  'Advanced',
  'Expert',
];

export const QUESTION_COUNTS = [10, 20, 30, 50];

export const ASSESSMENT_MODES = [
  {
    id: 'practice',
    label: 'Practice Mode',
    summary: 'Immediate rationales and step-by-step compliance guidance as you work.',
  },
  {
    id: 'exam',
    label: 'Exam Mode',
    summary: 'Focused assessment flow with rationales and full scoring revealed upon submission.',
  },
  {
    id: 'case',
    label: 'Case Simulation',
    summary: 'Progressive investigation scenarios with evidence review and escalation choices.',
  },
  {
    id: 'sar',
    label: 'SAR Narrative Lab',
    summary: 'Draft structured suspicious activity narratives against an explicit compliance rubric.',
  },
];

export const LEGACY_MIGRATED_QUESTIONS = [
  // ================= AML/KYC (13 questions) =================
  {
    id: 'kyc-1',
    legacyCategory: 'KYC Basics',
    domain: 'AML/KYC',
    subtopic: 'Source of Funds vs. Source of Wealth',
    difficulty: 'Beginner',
    jurisdiction: 'General / FATF',
    questionType: 'single_mcq',
    question:
      'Which core element of Customer Due Diligence (CDD) establishes the legitimate origin of funds used in a specific transaction?',
    options: [
      'Source of Funds (SoF)',
      'Source of Wealth (SoW)',
      'Beneficial Ownership Attestation',
      'Adverse Media Screening',
    ],
    correct_answer: 'Source of Funds (SoF)',
    explanation:
      'Source of Funds verifies the immediate origin of the money involved in a specific deposit or transfer, whereas Source of Wealth looks at how the customer accumulated their overall net worth.',
    sourceRef: 'FATF Recommendations (CDD & Risk-Based Approach)',
    reviewStatus: 'migrated_reviewed',
  },
  {
    id: 'kyc-2',
    legacyCategory: 'KYC Basics',
    domain: 'AML/KYC',
    subtopic: 'Beneficial Ownership',
    difficulty: 'Intermediate',
    jurisdiction: 'General / FATF',
    questionType: 'single_mcq',
    question:
      'When onboarding a corporate entity owned by intermediate holding companies, what is the primary goal of Beneficial Ownership verification?',
    options: [
      'Identify the natural persons who ultimately own or control the legal entity',
      'Collect only the registered office street address',
      'Rely exclusively on a verbal statement from a junior clerk',
      'Skip verification if the entity is incorporated outside the country',
    ],
    correct_answer: 'Identify the natural persons who ultimately own or control the legal entity',
    explanation:
      'Beneficial ownership requirements aim to pierce opaque corporate structures to identify natural persons exercising ownership or effective control.',
    sourceRef: 'FATF Recommendation 24 (Transparency & Beneficial Ownership)',
    reviewStatus: 'migrated_reviewed',
  },
  {
    id: 'kyc-3',
    legacyCategory: 'CDD & EDD',
    domain: 'AML/KYC',
    subtopic: 'Enhanced Due Diligence (EDD)',
    difficulty: 'Intermediate',
    jurisdiction: 'General / FATF',
    questionType: 'single_mcq',
    question:
      'Which scenario most clearly warrants Enhanced Due Diligence (EDD) measures beyond standard CDD?',
    options: [
      'A high-risk PEP relationship involving complex cross-border structures and large wire volumes',
      'A low-value domestic savings account matching standard profile expectations',
      'A routine address format update with matching government ID',
      'A verified salary account receiving regular payroll credits',
    ],
    correct_answer: 'A high-risk PEP relationship involving complex cross-border structures and large wire volumes',
    explanation:
      'Higher-risk relationships—such as PEPs, complex ownership layers, or higher-risk geographies/activities—require proportionate EDD controls.',
    sourceRef: 'FATF Recommendation 10 & 12 (CDD & PEPs)',
    reviewStatus: 'migrated_reviewed',
  },
  {
    id: 'kyc-4',
    legacyCategory: 'KYC Basics',
    domain: 'AML/KYC',
    subtopic: 'Customer Risk Rating',
    difficulty: 'Beginner',
    jurisdiction: 'General / AML Controls',
    questionType: 'single_mcq',
    question:
      'Which factor is typically evaluated when assigning an initial risk rating to a customer during onboarding?',
    options: [
      'Customer type, product/service usage, delivery channel, and geographic risk',
      'Only the color of the applicant’s identity document',
      'Whether the applicant prefers email over SMS alerts',
      'The branch opening hours near the customer',
    ],
    correct_answer: 'Customer type, product/service usage, delivery channel, and geographic risk',
    explanation:
      'Risk-based AML programs assess customer, product, delivery channel, and geographic risk factors together.',
    sourceRef: 'Risk-Based Approach (RBA) Core Principles',
    reviewStatus: 'migrated_reviewed',
  },
  {
    id: 'kyc-5',
    legacyCategory: 'CDD & EDD',
    domain: 'AML/KYC',
    subtopic: 'Source of Wealth Verification',
    difficulty: 'Intermediate',
    jurisdiction: 'General / AML Controls',
    questionType: 'single_mcq',
    question:
      'A private client states their net worth comes from selling a business five years ago. What strengthens Source of Wealth (SoW) corroboration?',
    options: [
      'Reviewing sale/closing records, tax or bank evidence, and checking consistency with career history',
      'Ignoring wealth origin because the client seems polite',
      'Treating a single unverified social media post as proof',
      'Closing the file without recording any rationale',
    ],
    correct_answer: 'Reviewing sale/closing records, tax or bank evidence, and checking consistency with career history',
    explanation:
      'Corroborating SoW relies on plausible, documented evidence aligned with the client’s background and transaction profile.',
    sourceRef: 'EDD & Source of Wealth Standards',
    reviewStatus: 'migrated_reviewed',
  },
  {
    id: 'kyc-6',
    legacyCategory: 'CDD & EDD',
    domain: 'AML/KYC',
    subtopic: 'PEP & RCA Controls',
    difficulty: 'Intermediate',
    jurisdiction: 'General / FATF',
    questionType: 'single_mcq',
    question:
      'What does "RCA" stand for in Politically Exposed Person (PEP) risk management?',
    options: [
      'Relatives and Close Associates',
      'Regulatory Compliance Audit',
      'Restricted Counterparty Account',
      'Risk Calibration Assessment',
    ],
    correct_answer: 'Relatives and Close Associates',
    explanation:
      'Family members and close associates of PEPs can be used to hold or move funds on a PEP’s behalf and require appropriate risk controls.',
    sourceRef: 'FATF Guidance on PEPs',
    reviewStatus: 'migrated_reviewed',
  },
  {
    id: 'kyc-7',
    legacyCategory: 'KYC Basics',
    domain: 'AML/KYC',
    subtopic: 'Periodic & Triggered Reviews',
    difficulty: 'Beginner',
    jurisdiction: 'General / AML Controls',
    questionType: 'single_mcq',
    question:
      'When should an analyst perform an event-driven (triggered) KYC review outside the regular scheduled cycle?',
    options: [
      'When a material change occurs in ownership, business activity, or observed transaction behavior',
      'Only once every ten years regardless of activity changes',
      'Whenever the customer changes their notification theme',
      'Never, if onboarding checks passed initially',
    ],
    correct_answer: 'When a material change occurs in ownership, business activity, or observed transaction behavior',
    explanation:
      'Ongoing due diligence requires updating risk profiles and records when material changes or red flags emerge.',
    sourceRef: 'Ongoing CDD & Triggered Review Standards',
    reviewStatus: 'migrated_reviewed',
  },
  {
    id: 'kyc-8',
    legacyCategory: 'CDD & EDD',
    domain: 'AML/KYC',
    subtopic: 'Nominee & Shell Risk',
    difficulty: 'Advanced',
    jurisdiction: 'General / FATF',
    questionType: 'single_mcq',
    question:
      'Which combination of indicators most elevates shell-company / nominee risk during corporate onboarding?',
    options: [
      'Nominee directors, jurisdictions with secrecy features, unclear commercial rationale, and layered holding entities',
      'Published audited financials, clear operating premises, and transparent ownership',
      'A long-standing local manufacturer with verifiable supply contracts',
      'A regulated public exchange-listed company',
    ],
    correct_answer: 'Nominee directors, jurisdictions with secrecy features, unclear commercial rationale, and layered holding entities',
    explanation:
      'Layered structures, nominees, and unexplained complexity are classic indicators requiring deeper scrutiny and EDD.',
    sourceRef: 'FATF Concealment of Beneficial Ownership Guidance',
    reviewStatus: 'migrated_reviewed',
  },
  {
    id: 'kyc-9',
    legacyCategory: 'KYC Basics',
    domain: 'AML/KYC',
    subtopic: 'Document & Identity Verification',
    difficulty: 'Beginner',
    jurisdiction: 'General / AML Controls',
    questionType: 'single_mcq',
    question:
      'Why is verifying customer identity documents against reliability and tampering indicators essential at onboarding?',
    options: [
      'To establish reasonable confidence that the applicant is who they claim to be before granting access',
      'To replace ongoing transaction monitoring completely',
      'To avoid keeping audit logs of customer onboarding',
      'To approve credit limits automatically without checks',
    ],
    correct_answer: 'To establish reasonable confidence that the applicant is who they claim to be before granting access',
    explanation:
      'Reliable identity verification is a foundational CDD control to prevent impersonation and synthetic/fraudulent onboarding.',
    sourceRef: 'CDD Identity Verification Fundamentals',
    reviewStatus: 'migrated_reviewed',
  },
  {
    id: 'kyc-10',
    legacyCategory: 'CDD & EDD',
    domain: 'AML/KYC',
    subtopic: 'Effective Control vs. Equity Share',
    difficulty: 'Advanced',
    jurisdiction: 'General / FATF',
    questionType: 'single_mcq',
    question:
      'An individual holds 15% direct shares in a company (below a 25% ownership threshold) but holds veto rights over major financial decisions and appoints board members. How should they be treated?',
    options: [
      'Evaluate them as a beneficial owner / person exercising effective control and document the assessment',
      'Ignore them completely because 15% is below 25%',
      'Treat them as a third-party vendor',
      'Remove all KYC records for the entity',
    ],
    correct_answer: 'Evaluate them as a beneficial owner / person exercising effective control and document the assessment',
    explanation:
      'Beneficial ownership includes both ownership thresholds and exercising significant/effective control over the legal person.',
    sourceRef: 'FATF Recommendation 24 & Interpretive Note',
    reviewStatus: 'migrated_reviewed',
  },
  {
    id: 'kyc-11',
    legacyCategory: 'CDD & EDD',
    domain: 'AML/KYC',
    subtopic: 'High-Risk Jurisdictions',
    difficulty: 'Intermediate',
    jurisdiction: 'General / FATF',
    questionType: 'single_mcq',
    question:
      'When a client or counterparty is connected to a jurisdiction subject to increased monitoring or counter-measures, what is required?',
    options: [
      'Apply risk-proportionate enhanced scrutiny and follow institutional/regulatory controls for that jurisdiction',
      'Treat all jurisdictions as identical with zero additional checks',
      'Disable compliance logging during international transfers',
      'Rely solely on unverified customer self-declarations',
    ],
    correct_answer: 'Apply risk-proportionate enhanced scrutiny and follow institutional/regulatory controls for that jurisdiction',
    explanation:
      'Jurisdictional risk ratings inform EDD intensity, counterparty checks, and escalation thresholds.',
    sourceRef: 'FATF High-Risk Jurisdictions Framework',
    reviewStatus: 'migrated_reviewed',
  },
  {
    id: 'kyc-12',
    legacyCategory: 'CDD & EDD',
    domain: 'AML/KYC',
    subtopic: 'Purpose & Intended Nature',
    difficulty: 'Beginner',
    jurisdiction: 'General / FATF',
    questionType: 'single_mcq',
    question:
      'Why do institutions collect information on the purpose and intended nature of a business relationship?',
    options: [
      'To establish an expected activity baseline against which future transactions can be compared',
      'To bypass sanctions screening on outgoing wires',
      'To avoid updating customer profiles later',
      'To determine marketing email frequency only',
    ],
    correct_answer: 'To establish an expected activity baseline against which future transactions can be compared',
    explanation:
      'Understanding intended account use helps analysts recognize anomalies when actual activity diverges sharply.',
    sourceRef: 'FATF Recommendation 10 (CDD)',
    reviewStatus: 'migrated_reviewed',
  },
  {
    id: 'kyc-13',
    legacyCategory: 'CDD & EDD',
    domain: 'AML/KYC',
    subtopic: 'EDD Governance & Sign-Off',
    difficulty: 'Expert',
    jurisdiction: 'General / AML Governance',
    questionType: 'single_mcq',
    question:
      'What makes an EDD file defensible during an internal audit or regulatory examination?',
    options: [
      'Documented risk triggers, verified supporting evidence, clear disposition/approval rationale, and retained records',
      'A brief verbal note with no supporting records or approval trail',
      'Deleting unresolved alerts prior to review',
      'Copying a generic template without addressing case-specific facts',
    ],
    correct_answer: 'Documented risk triggers, verified supporting evidence, clear disposition/approval rationale, and retained records',
    explanation:
      'Audit-ready compliance files link specific risk triggers to concrete evidence, analysis, and documented decisions.',
    sourceRef: 'AML Governance & Recordkeeping Standards',
    reviewStatus: 'migrated_reviewed',
  },

  // ================= Transaction Monitoring (13 questions) =================
  {
    id: 'tm-1',
    legacyCategory: 'TM Typologies',
    domain: 'Transaction Monitoring',
    subtopic: 'Structuring / Smurfing',
    difficulty: 'Intermediate',
    jurisdiction: 'General / AML Typologies',
    questionType: 'single_mcq',
    question:
      'Multiple cash deposits are broken into amounts just under a reporting threshold over several days with no clear business reason. Which typology does this most resemble?',
    options: [
      'Structuring (smurfing)',
      'Recurring payroll disbursement',
      'Standard utility auto-debit',
      'Annual tax refund credit',
    ],
    correct_answer: 'Structuring (smurfing)',
    explanation:
      'Breaking transactions into smaller amounts just below reporting thresholds to evade detection or reporting is a hallmark of structuring.',
    sourceRef: 'Financial Crime Typologies — Structuring & Placement',
    reviewStatus: 'migrated_reviewed',
  },
  {
    id: 'tm-2',
    legacyCategory: 'TM Typologies',
    domain: 'Transaction Monitoring',
    subtopic: 'Funnel Accounts & Rapid Pass-Through',
    difficulty: 'Advanced',
    jurisdiction: 'General / AML Typologies',
    questionType: 'single_mcq',
    question:
      'An account receives rapid incoming transfers from many unrelated sources and quickly forwards nearly the entire balance outbound to a few destinations. What pattern is this?',
    options: [
      'Rapid pass-through / funnel or potential money-mule layering behavior',
      'Long-term buy-and-hold retirement saving',
      'Static dormant account with zero movement',
      'Single annual insurance premium payment',
    ],
    correct_answer: 'Rapid pass-through / funnel or potential money-mule layering behavior',
    explanation:
      'Quickly pooling funds from multiple sources and moving them out with minimal retention is a classic layering / funnel typology.',
    sourceRef: 'AML Typologies — Layering & Mule Networks',
    reviewStatus: 'migrated_reviewed',
  },
  {
    id: 'tm-3',
    legacyCategory: 'TM Typologies',
    domain: 'Transaction Monitoring',
    subtopic: 'Alert Triage & False Positives',
    difficulty: 'Intermediate',
    jurisdiction: 'General / TM Operations',
    questionType: 'single_mcq',
    question:
      'What is the best practice when closing a transaction monitoring alert as a false positive?',
    options: [
      'Document why the alert triggered, compare activity against expected profile/history, and note any absence of red flags',
      'Close with a single word ("ok") without checking transaction details',
      'Disable the monitoring rule for all customers',
      'Ignore conflicting dates or amounts in the alert',
    ],
    correct_answer: 'Document why the alert triggered, compare activity against expected profile/history, and note any absence of red flags',
    explanation:
      'Every alert closure should be supported by objective review and clear documentation of why suspiciousness was or was not present.',
    sourceRef: 'Transaction Monitoring Alert Disposition Standards',
    reviewStatus: 'migrated_reviewed',
  },
  {
    id: 'tm-4',
    legacyCategory: 'TM Typologies',
    domain: 'Transaction Monitoring',
    subtopic: 'Baseline & Deviation Analysis',
    difficulty: 'Beginner',
    jurisdiction: 'General / TM Operations',
    questionType: 'single_mcq',
    question:
      'Why do analysts compare current alerts against a customer’s historical transaction baseline?',
    options: [
      'To distinguish sudden behavioral spikes or new corridors from established normal activity',
      'To avoid reviewing high-value transfers',
      'To replace KYC onboarding checks',
      'To automatically clear all international wires',
    ],
    correct_answer: 'To distinguish sudden behavioral spikes or new corridors from established normal activity',
    explanation:
      'Baseline comparison highlights meaningful shifts in volume, frequency, velocity, or counterparties.',
    sourceRef: 'Behavioral Monitoring & Anomaly Detection',
    reviewStatus: 'migrated_reviewed',
  },
  {
    id: 'tm-5',
    legacyCategory: 'TM Typologies',
    domain: 'Transaction Monitoring',
    subtopic: 'Round-Dollar & High-Velocity Transfers',
    difficulty: 'Intermediate',
    jurisdiction: 'General / AML Typologies',
    questionType: 'single_mcq',
    question:
      'When are round-dollar or high-velocity transfers most concerning in a transaction review?',
    options: [
      'When combined with other red flags such as unverified purpose, rapid pass-through, or profile mismatch',
      'Whenever a customer pays an exact monthly subscription fee',
      'Whenever a salary is credited on a fixed date',
      'Never, round numbers are never relevant',
    ],
    correct_answer: 'When combined with other red flags such as unverified purpose, rapid pass-through, or profile mismatch',
    explanation:
      'Single indicators rarely prove financial crime alone; analysts evaluate converging red flags in context.',
    sourceRef: 'Red Flag Convergence in TM Investigations',
    reviewStatus: 'migrated_reviewed',
  },
  {
    id: 'tm-6',
    legacyCategory: 'TM Typologies',
    domain: 'Transaction Monitoring',
    subtopic: 'Escalation Thresholds & Triggers',
    difficulty: 'Intermediate',
    jurisdiction: 'General / TM Operations',
    questionType: 'single_mcq',
    question:
      'What should an analyst do when an alert reveals unexplained funds movement that cannot be resolved as normal activity?',
    options: [
      'Document the findings clearly and escalate to higher-level investigation / SAR review per policy',
      'Close the alert silently to keep queue counts low',
      'Ask the customer if they are laundering money',
      'Delete the transaction log',
    ],
    correct_answer: 'Document the findings clearly and escalate to higher-level investigation / SAR review per policy',
    explanation:
      'Unexplained suspicious activity must be documented and escalated through formal compliance channels.',
    sourceRef: 'Alert Escalation & SAR Referral Workflow',
    reviewStatus: 'migrated_reviewed',
  },
  {
    id: 'tm-7',
    legacyCategory: 'TM Typologies',
    domain: 'Transaction Monitoring',
    subtopic: 'Trade & Invoice Mismatches',
    difficulty: 'Advanced',
    jurisdiction: 'General / AML Typologies',
    questionType: 'single_mcq',
    question:
      'A small local shop with no import/export history suddenly sends large wire payments citing "industrial machinery" to an unrelated entity. What is the key concern?',
    options: [
      'Potential trade-based or fictitious-billing activity inconsistent with the business profile',
      'Normal retail inventory replenishment with full documentation',
      'A guaranteed false positive without further review',
      'An automatic reason to ignore KYC records',
    ],
    correct_answer: 'Potential trade-based or fictitious-billing activity inconsistent with the business profile',
    explanation:
      'Activity and stated payment purposes that conflict with a customer’s known business model warrant closer investigation.',
    sourceRef: 'Trade & Payment Red Flag Indicators',
    reviewStatus: 'migrated_reviewed',
  },
  {
    id: 'tm-8',
    legacyCategory: 'TM Typologies',
    domain: 'Transaction Monitoring',
    subtopic: 'Split / Sequential Transfers',
    difficulty: 'Beginner',
    jurisdiction: 'General / AML Typologies',
    questionType: 'single_mcq',
    question:
      'Why might an actor split a single large sum into several smaller transfers over a short window?',
    options: [
      'To stay below monitoring or reporting thresholds or fragment the audit trail',
      'To make record-keeping more transparent',
      'To reduce bank fees on every micro-transfer when fees are per-item',
      'To prove beneficial ownership',
    ],
    correct_answer: 'To stay below monitoring or reporting thresholds or fragment the audit trail',
    explanation:
      'Splitting or staggering transactions can be used to avoid thresholds or obscure larger flows.',
    sourceRef: 'Threshold Avoidance & Structuring Concepts',
    reviewStatus: 'migrated_reviewed',
  },
  {
    id: 'tm-9',
    legacyCategory: 'TM Typologies',
    domain: 'Transaction Monitoring',
    subtopic: 'Dormant Account Reactivation',
    difficulty: 'Intermediate',
    jurisdiction: 'General / AML Typologies',
    questionType: 'single_mcq',
    question:
      'An account dormant for over a year suddenly receives large inbound credits and immediate outbound transfers. Why is this notable?',
    options: [
      'Sudden reactivation with high-value movement can indicate account takeover, mule use, or layering',
      'Dormant accounts never experience operational risk',
      'It eliminates the need to check counterparties',
      'It automatically clears alerts',
    ],
    correct_answer: 'Sudden reactivation with high-value movement can indicate account takeover, mule use, or layering',
    explanation:
      'Abrupt changes from dormancy to high-value activity are a recognized behavioral red flag.',
    sourceRef: 'Behavioral Red Flags in Transaction Monitoring',
    reviewStatus: 'migrated_reviewed',
  },
  {
    id: 'tm-10',
    legacyCategory: 'TM Typologies',
    domain: 'Transaction Monitoring',
    subtopic: 'Counterparty Network Analysis',
    difficulty: 'Advanced',
    jurisdiction: 'General / TM Operations',
    questionType: 'single_mcq',
    question:
      'During a transaction review, you notice multiple seemingly separate alerts involving overlapping counterparties or shared identifiers. What does that suggest?',
    options: [
      'A potentially connected network or coordinated pattern that should be analyzed holistically',
      'Unrelated noise that should never be cross-referenced',
      'A reason to skip checking transaction dates',
      'A cue to close all alerts at once',
    ],
    correct_answer: 'A potentially connected network or coordinated pattern that should be analyzed holistically',
    explanation:
      'Cross-referencing linked accounts, counterparties, and identifiers helps uncover broader schemes.',
    sourceRef: 'Network & Link Analysis in AML Investigations',
    reviewStatus: 'migrated_reviewed',
  },
  {
    id: 'tm-11',
    legacyCategory: 'TM Typologies',
    domain: 'Transaction Monitoring',
    subtopic: 'Case Chronology Construction',
    difficulty: 'Beginner',
    jurisdiction: 'General / TM Operations',
    questionType: 'single_mcq',
    question:
      'What is the primary purpose of building a clear chronological summary of transactions during an alert review?',
    options: [
      'To establish accurate timing, amounts, flows, and sequence of events before making a decision',
      'To replace all underlying transaction data',
      'To make the investigation harder to follow',
      'To hide gaps in the timeline',
    ],
    correct_answer: 'To establish accurate timing, amounts, flows, and sequence of events before making a decision',
    explanation:
      'Chronological ordering clarifies how funds enter, move, and exit—essential for accurate disposition or SAR drafting.',
    sourceRef: 'Investigative Documentation Standards',
    reviewStatus: 'migrated_reviewed',
  },
  {
    id: 'tm-12',
    legacyCategory: 'TM Typologies',
    domain: 'Transaction Monitoring',
    subtopic: 'Rule Tuning & Feedback Loop',
    difficulty: 'Expert',
    jurisdiction: 'General / TM Governance',
    questionType: 'single_mcq',
    question:
      'How do consistent findings from alert reviews and investigations support a TM program over time?',
    options: [
      'They inform periodic scenario/threshold tuning and typology updates through structured governance',
      'They replace independent model/rule validation',
      'They justify removing controls without testing',
      'They eliminate the need for analyst notes',
    ],
    correct_answer: 'They inform periodic scenario/threshold tuning and typology updates through structured governance',
    explanation:
      'Feedback from investigations helps keep monitoring rules relevant to evolving risks and typologies.',
    sourceRef: 'TM Scenario & Threshold Governance',
    reviewStatus: 'migrated_reviewed',
  },
  {
    id: 'tm-13',
    legacyCategory: 'TM Typologies',
    domain: 'Transaction Monitoring',
    subtopic: 'Evidence & Audit Trail',
    difficulty: 'Intermediate',
    jurisdiction: 'General / TM Operations',
    questionType: 'single_mcq',
    question:
      'Which practice best preserves auditability when investigating a suspicious transaction alert?',
    options: [
      'Recording exact dates, amounts, sources reviewed, and objective reasons for your conclusion',
      'Relying only on memory without written case notes',
      'Editing prior findings without explanation',
      'Leaving out key counterparty details',
    ],
    correct_answer: 'Recording exact dates, amounts, sources reviewed, and objective reasons for your conclusion',
    explanation:
      'Clear, factual documentation ensures any reviewer can trace how the conclusion was reached.',
    sourceRef: 'Compliance Audit Trail Standards',
    reviewStatus: 'migrated_reviewed',
  },

  // ================= SAR Investigations (13 questions) =================
  {
    id: 'sar-1',
    legacyCategory: 'SAR Writing',
    domain: 'SAR Investigations',
    subtopic: 'Chronology & Clarity',
    difficulty: 'Intermediate',
    jurisdiction: 'General / SAR Standards',
    questionType: 'single_mcq',
    question:
      'When drafting a Suspicious Activity Report (SAR) narrative, which approach is strongest?',
    options: [
      'Present a clear, objective chronology of facts, amounts, dates, red flags, and investigative findings',
      'Use speculative language and unproven criminal accusations as established facts',
      'Omit key dates and dollar amounts to keep the text vague',
      'Copy raw system dumps without explaining why the activity is suspicious',
    ],
    correct_answer: 'Present a clear, objective chronology of facts, amounts, dates, red flags, and investigative findings',
    explanation:
      'Effective SAR narratives are factual, chronological, concise, and clear about what occurred and why it is suspicious.',
    sourceRef: 'SAR Narrative Best Practices (Who, What, When, Where, Why, How)',
    reviewStatus: 'migrated_reviewed',
  },
  {
    id: 'sar-2',
    legacyCategory: 'SAR Writing',
    domain: 'SAR Investigations',
    subtopic: 'Fact vs. Assumption',
    difficulty: 'Advanced',
    jurisdiction: 'General / SAR Standards',
    questionType: 'single_mcq',
    question:
      'How should an investigator handle an analytical inference or hypothesis in a SAR narrative?',
    options: [
      'Clearly distinguish verified facts from analytical conclusions or red-flag indicators',
      'State assumptions as proven facts',
      'Include personal opinions unrelated to the activity',
      'Hide uncertainties when records are incomplete',
    ],
    correct_answer: 'Clearly distinguish verified facts from analytical conclusions or red-flag indicators',
    explanation:
      'Separating documented facts from analytical reasoning keeps SAR narratives accurate, objective, and reliable.',
    sourceRef: 'SAR Quality & Objectivity Standards',
    reviewStatus: 'migrated_reviewed',
  },
  {
    id: 'sar-3',
    legacyCategory: 'SAR Writing',
    domain: 'SAR Investigations',
    subtopic: 'Anti-Tipping-Off & Confidentiality',
    difficulty: 'Beginner',
    jurisdiction: 'General / FATF',
    questionType: 'single_mcq',
    question:
      'Why is strict confidentiality critical during a SAR investigation and filing?',
    options: [
      'To protect investigation integrity and prevent tipping off the subject or compromising compliance rules',
      'So coworkers can discuss cases publicly in chat channels',
      'To share filing status with the customer',
      'Because confidentiality is optional for low amounts',
    ],
    correct_answer: 'To protect investigation integrity and prevent tipping off the subject or compromising compliance rules',
    explanation:
      'Tipping off or leaking suspicious activity reviews/filings can alert subjects and violate legal/regulatory prohibitions.',
    sourceRef: 'FATF Recommendation 21 & SAR Confidentiality Rules',
    reviewStatus: 'migrated_reviewed',
  },
  {
    id: 'sar-4',
    legacyCategory: 'SAR Writing',
    domain: 'SAR Investigations',
    subtopic: 'Five Ws & How Structure',
    difficulty: 'Beginner',
    jurisdiction: 'General / SAR Standards',
    questionType: 'single_mcq',
    question:
      'Which set of questions helps ensure a SAR narrative covers the essential investigative context?',
    options: [
      'Who is involved, what suspicious activity occurred, when and where it happened, why it is unusual, and how it was conducted',
      'What color theme the analyst prefers and how fast they typed',
      'Only the final account balance at month-end',
      'Unrelated company trivia',
    ],
    correct_answer: 'Who is involved, what suspicious activity occurred, when and where it happened, why it is unusual, and how it was conducted',
    explanation:
      'Answering who, what, when, where, why, and how provides a structured, complete narrative.',
    sourceRef: 'SAR Drafting Framework',
    reviewStatus: 'migrated_reviewed',
  },
  {
    id: 'sar-5',
    legacyCategory: 'SAR Writing',
    domain: 'SAR Investigations',
    subtopic: 'Documenting Missing Information',
    difficulty: 'Intermediate',
    jurisdiction: 'General / SAR Standards',
    questionType: 'single_mcq',
    question:
      'If supporting documents (such as invoices or explanations) were requested but not provided, how should a SAR note this?',
    options: [
      'State factually what was requested, when, and that it remained missing or unanswered at review',
      'Pretend the documents were reviewed and approved',
      'Omit any mention of missing information',
      'Speculate on the customer’s secret motives',
    ],
    correct_answer: 'State factually what was requested, when, and that it remained missing or unanswered at review',
    explanation:
      'Accurately noting missing or unprovided information reflects complete investigative facts.',
    sourceRef: 'SAR Evidentiary Completeness Guidance',
    reviewStatus: 'migrated_reviewed',
  },
  {
    id: 'sar-6',
    legacyCategory: 'SAR Writing',
    domain: 'SAR Investigations',
    subtopic: 'Aggregating Related Activity',
    difficulty: 'Intermediate',
    jurisdiction: 'General / SAR Standards',
    questionType: 'single_mcq',
    question:
      'Why is it important to show aggregate totals alongside individual transaction details in a SAR narrative?',
    options: [
      'To show both the scale/pattern over time and the specific transactions supporting it',
      'To hide small transactions',
      'To avoid listing dates',
      'Because totals replace all transaction context',
    ],
    correct_answer: 'To show both the scale/pattern over time and the specific transactions supporting it',
    explanation:
      'Pairing aggregate figures with representative dates/amounts makes patterns immediately clear.',
    sourceRef: 'SAR Quantitative Clarity Standards',
    reviewStatus: 'migrated_reviewed',
  },
  {
    id: 'sar-7',
    legacyCategory: 'SAR Writing',
    domain: 'SAR Investigations',
    subtopic: 'Avoiding Jargon & Ambiguity',
    difficulty: 'Beginner',
    jurisdiction: 'General / SAR Standards',
    questionType: 'single_mcq',
    question:
      'What makes a SAR narrative easier for reviewers and authorities to read accurately?',
    options: [
      'Plain, precise language with defined terms, exact dates/amounts, and clear paragraph flow',
      'Dense ambiguous pronouns where it is unclear who sent or received funds',
      'Wall-of-text paragraphs with no dates',
      'Slang or unverified assumptions',
    ],
    correct_answer: 'Plain, precise language with defined terms, exact dates/amounts, and clear paragraph flow',
    explanation:
      'Clear, unambiguous writing prevents misinterpretation of parties, amounts, and timelines.',
    sourceRef: 'SAR Narrative Readability Standards',
    reviewStatus: 'migrated_reviewed',
  },
  {
    id: 'sar-8',
    legacyCategory: 'SAR Writing',
    domain: 'SAR Investigations',
    subtopic: 'Linking Related Alerts',
    difficulty: 'Advanced',
    jurisdiction: 'General / SAR Investigations',
    questionType: 'single_mcq',
    question:
      'When multiple alerts or prior reviews relate to the same suspicious pattern, how should you address them?',
    options: [
      'Connect related activity and prior relevant history so the full picture is clear',
      'Treat each alert as if nothing else happened on the account',
      'Discard prior alert context without checking relevance',
      'Guess prior dates without checking records',
    ],
    correct_answer: 'Connect related activity and prior relevant history so the full picture is clear',
    explanation:
      'Connecting related events helps demonstrate ongoing or linked suspicious behavior.',
    sourceRef: 'Case Consolidation & SAR Context',
    reviewStatus: 'migrated_reviewed',
  },
  {
    id: 'sar-9',
    legacyCategory: 'SAR Writing',
    domain: 'SAR Investigations',
    subtopic: 'Customer Interaction Facts',
    difficulty: 'Intermediate',
    jurisdiction: 'General / SAR Standards',
    questionType: 'single_mcq',
    question:
      'If a customer gave an explanation during a review, how should it be presented in the narrative?',
    options: [
      'Attribute the statement to the customer factually and note whether records corroborated or contradicted it',
      'Treat the customer’s unverified claim as absolute truth',
      'Ignore what the customer stated completely',
      'Rewrite their words into a legal conclusion',
    ],
    correct_answer: 'Attribute the statement to the customer factually and note whether records corroborated or contradicted it',
    explanation:
      'Attributing statements accurately and comparing them against records is key to objective reporting.',
    sourceRef: 'SAR Fact Attribution Standards',
    reviewStatus: 'migrated_reviewed',
  },
  {
    id: 'sar-10',
    legacyCategory: 'SAR Writing',
    domain: 'SAR Investigations',
    subtopic: 'Escalation Timeliness',
    difficulty: 'Intermediate',
    jurisdiction: 'General / SAR Governance',
    questionType: 'single_mcq',
    question:
      'Why is timely escalation of suspicious activity important in compliance operations?',
    options: [
      'To meet internal/regulatory escalation expectations and support timely review and reporting',
      'So alerts can sit unreviewed indefinitely',
      'To skip quality checks completely',
      'To delay investigation notes',
    ],
    correct_answer: 'To meet internal/regulatory escalation expectations and support timely review and reporting',
    explanation:
      'Prompt escalation supports timely compliance evaluation and adherence to escalation timelines.',
    sourceRef: 'SAR Escalation & Timeliness Controls',
    reviewStatus: 'migrated_reviewed',
  },
  {
    id: 'sar-11',
    legacyCategory: 'SAR Writing',
    domain: 'SAR Investigations',
    subtopic: 'Counterparty & Channel Details',
    difficulty: 'Beginner',
    jurisdiction: 'General / SAR Standards',
    questionType: 'single_mcq',
    question:
      'Which details about counterparties and channels add value to a suspicious activity summary?',
    options: [
      'Available counterparty names/identifiers, payment channels/methods, jurisdictions, and timing',
      'No details at all',
      'Random unrelated numbers',
      'Only the analyst’s lunch time',
    ],
    correct_answer: 'Available counterparty names/identifiers, payment channels/methods, jurisdictions, and timing',
    explanation:
      'Channel, jurisdiction, and counterparty details help explain how funds moved.',
    sourceRef: 'SAR Investigative Elements',
    reviewStatus: 'migrated_reviewed',
  },
  {
    id: 'sar-12',
    legacyCategory: 'SAR Writing',
    domain: 'SAR Investigations',
    subtopic: 'Quality Assurance Review',
    difficulty: 'Expert',
    jurisdiction: 'General / SAR Governance',
    questionType: 'single_mcq',
    question:
      'What should a quality check verify before a SAR narrative is finalized?',
    options: [
      'Accuracy of dates/amounts/names against source records, clear red-flag rationale, no tipping-off language, and no unsupported claims',
      'Only that the paragraph is long',
      'That numbers were rounded randomly',
      'That conflicting facts were ignored',
    ],
    correct_answer: 'Accuracy of dates/amounts/names against source records, clear red-flag rationale, no tipping-off language, and no unsupported claims',
    explanation:
      'QA checks verify factual accuracy, coherence, red-flag articulation, and compliance with confidentiality rules.',
    sourceRef: 'SAR Quality Assurance Checklist',
    reviewStatus: 'migrated_reviewed',
  },
  {
    id: 'sar-13',
    legacyCategory: 'SAR Writing',
    domain: 'SAR Investigations',
    subtopic: 'Account Baseline Context',
    difficulty: 'Beginner',
    jurisdiction: 'General / SAR Standards',
    questionType: 'single_mcq',
    question:
      'Why include brief account profile/baseline context (such as tenure and expected activity) at the start of a narrative?',
    options: [
      'It gives immediate context for why the observed activity stands out',
      'It replaces explaining the transactions themselves',
      'It is only decorative filler',
      'It hides unusual activity',
    ],
    correct_answer: 'It gives immediate context for why the observed activity stands out',
    explanation:
      'Establishing expected baseline and account context grounds the reader before detailing anomalies.',
    sourceRef: 'SAR Narrative Opening Context',
    reviewStatus: 'migrated_reviewed',
  },

  // ================= Sanctions & Screening (13 questions) =================
  {
    id: 'sanc-1',
    legacyCategory: 'Sanctions Screening',
    domain: 'Sanctions & Screening',
    subtopic: 'Name & Alias Matching',
    difficulty: 'Intermediate',
    jurisdiction: 'General / Sanctions Controls',
    questionType: 'single_mcq',
    question:
      'Why do sanctions screening systems use fuzzy matching and alias/transliteration checks alongside exact name matching?',
    options: [
      'Spellings, transliterations, middle names, and aliases can vary across payment messages and lists',
      'Exact matches are the only way names ever appear',
      'Fuzzy matching is used to ignore sanctioned entities',
      'Screening only applies to domestic cash withdrawals',
    ],
    correct_answer: 'Spellings, transliterations, middle names, and aliases can vary across payment messages and lists',
    explanation:
      'Name variations, spelling differences, and aliases require fuzzy/variant matching so potential matches are surfaced for review.',
    sourceRef: 'Sanctions Screening & Name Matching Principles',
    reviewStatus: 'migrated_reviewed',
  },
  {
    id: 'sanc-2',
    legacyCategory: 'Sanctions Screening',
    domain: 'Sanctions & Screening',
    subtopic: 'False Positive Resolution',
    difficulty: 'Intermediate',
    jurisdiction: 'General / Sanctions Controls',
    questionType: 'single_mcq',
    question:
      'What is required before disposing of a screening alert as a false positive?',
    options: [
      'Compare available identifiers (such as DOB, nationality/residence, ID/registration, address) and document why it is not a match',
      'Clear the alert blindly whenever a middle initial differs without checking other fields',
      'Disable screening on the payment channel',
      'Approve the payment without recording a reason',
    ],
    correct_answer: 'Compare available identifiers (such as DOB, nationality/residence, ID/registration, address) and document why it is not a match',
    explanation:
      'Sound sanctions disposition compares identifiers objectively and documents the basis for clearing or escalating.',
    sourceRef: 'Sanctions Alert Disposition & Documentation',
    reviewStatus: 'migrated_reviewed',
  },
  {
    id: 'sanc-3',
    legacyCategory: 'Sanctions Screening',
    domain: 'Sanctions & Screening',
    subtopic: 'Ownership & Control',
    difficulty: 'Advanced',
    jurisdiction: 'General / Sanctions Compliance',
    questionType: 'single_mcq',
    question:
      'Why must sanctions compliance consider entity ownership and control in addition to direct name screening?',
    options: [
      'Entities owned or controlled by listed persons/entities may be restricted even if their own name is not listed directly',
      'Ownership never affects sanctions applicability',
      'Only the first word of a company name matters',
      'Screening never applies to corporate counterparties',
    ],
    correct_answer: 'Entities owned or controlled by listed persons/entities may be restricted even if their own name is not listed directly',
    explanation:
      'Sanctions regimes commonly extend restrictions to entities owned or controlled by designated persons/entities.',
    sourceRef: 'Sanctions Ownership & Control Principles',
    reviewStatus: 'migrated_reviewed',
  },
  {
    id: 'sanc-4',
    legacyCategory: 'Sanctions Screening',
    domain: 'Sanctions & Screening',
    subtopic: 'Payment Holds & Escalation',
    difficulty: 'Intermediate',
    jurisdiction: 'General / Sanctions Controls',
    questionType: 'single_mcq',
    question:
      'When a potential sanctions hit or ambiguous match arises on a transaction, what should happen while it is reviewed?',
    options: [
      'Follow hold/escalation procedures per compliance policy rather than releasing funds prematurely',
      'Push the payment through immediately so SLA timers look green',
      'Ask the customer to confirm they are not sanctioned',
      'Delete the screening alert',
    ],
    correct_answer: 'Follow hold/escalation procedures per compliance policy rather than releasing funds prematurely',
    explanation:
      'Holding/escalating potential matches per policy prevents unauthorized execution of restricted transactions.',
    sourceRef: 'Sanctions Hold & Escalation Controls',
    reviewStatus: 'migrated_reviewed',
  },
  {
    id: 'sanc-5',
    legacyCategory: 'Sanctions Screening',
    domain: 'Sanctions & Screening',
    subtopic: 'Identifier Comparison',
    difficulty: 'Beginner',
    jurisdiction: 'General / Sanctions Controls',
    questionType: 'single_mcq',
    question:
      'Which identifier is most helpful in distinguishing two individuals who share a common first and last name?',
    options: [
      'Date of birth, nationality/country of residence, or official identification details',
      'Whether they use dark mode',
      'Their preferred font size',
      'None—common names cannot be differentiated',
    ],
    correct_answer: 'Date of birth, nationality/country of residence, or official identification details',
    explanation:
      'Secondary identifiers like DOB, nationality, residence, or ID numbers help confirm or rule out a match.',
    sourceRef: 'Sanctions Identifier Verification',
    reviewStatus: 'migrated_reviewed',
  },
  {
    id: 'sanc-6',
    legacyCategory: 'Sanctions Screening',
    domain: 'Sanctions & Screening',
    subtopic: 'Partial / Truncated Fields',
    difficulty: 'Intermediate',
    jurisdiction: 'General / Sanctions Controls',
    questionType: 'single_mcq',
    question:
      'What should an analyst do if a payment message has incomplete or missing identifier fields needed to rule out a sanctions match?',
    options: [
      'Escalate or seek appropriate compliance review rather than assuming a false positive from missing data',
      'Assume missing data proves innocence',
      'Clear the alert without note',
      'Ignore the hit',
    ],
    correct_answer: 'Escalate or seek appropriate compliance review rather than assuming a false positive from missing data',
    explanation:
      'Missing or partial data cannot safely prove a false positive on its own; escalation or proper review is required.',
    sourceRef: 'Handling Incomplete Screening Data',
    reviewStatus: 'migrated_reviewed',
  },
  {
    id: 'sanc-7',
    legacyCategory: 'Sanctions Screening',
    domain: 'Sanctions & Screening',
    subtopic: 'List Updates & Re-Screening',
    difficulty: 'Beginner',
    jurisdiction: 'General / Sanctions Controls',
    questionType: 'single_mcq',
    question:
      'Why is timely updating of sanctions lists and screening rules critical?',
    options: [
      'Designations and updates occur regularly, and outdated lists can miss newly listed parties',
      'Sanctions lists never change once published',
      'Updates only matter once every five years',
      'List currency is unrelated to screening effectiveness',
    ],
    correct_answer: 'Designations and updates occur regularly, and outdated lists can miss newly listed parties',
    explanation:
      'Keeping screening lists current ensures newly designated persons, entities, or vessels are caught.',
    sourceRef: 'Sanctions List Maintenance & Currency',
    reviewStatus: 'migrated_reviewed',
  },
  {
    id: 'sanc-8',
    legacyCategory: 'Sanctions Screening',
    domain: 'Sanctions & Screening',
    subtopic: 'Evasion & Stripping Indicators',
    difficulty: 'Advanced',
    jurisdiction: 'General / Sanctions Compliance',
    questionType: 'single_mcq',
    question:
      'Which behavior is a common red flag for attempted sanctions evasion in payments?',
    options: [
      'Obfuscating or omitting originator/beneficiary/intermediary details or routing unusually to bypass filters',
      'Including complete, accurate payment originator and beneficiary information',
      'Following standard payment formatting consistently',
      'Routine domestic bill payments',
    ],
    correct_answer: 'Obfuscating or omitting originator/beneficiary/intermediary details or routing unusually to bypass filters',
    explanation:
      'Altering or stripping payment details and unusual routing can indicate attempts to evade screening filters.',
    sourceRef: 'Sanctions Evasion Red Flags',
    reviewStatus: 'migrated_reviewed',
  },
  {
    id: 'sanc-9',
    legacyCategory: 'Sanctions Screening',
    domain: 'Sanctions & Screening',
    subtopic: 'Multi-Party Screening',
    difficulty: 'Beginner',
    jurisdiction: 'General / Sanctions Controls',
    questionType: 'single_mcq',
    question:
      'In a cross-border payment, which parties or entities typically need to be within screening scope?',
    options: [
      'Relevant parties such as originator, beneficiary, intermediaries, and associated entities per policy',
      'Only the clerk entering the payment',
      'No parties if the amount is small',
      'Only the software vendor',
    ],
    correct_answer: 'Relevant parties such as originator, beneficiary, intermediaries, and associated entities per policy',
    explanation:
      'Screening covers relevant transaction parties and entities so restricted parties are not missed.',
    sourceRef: 'Payment Screening Scope Principles',
    reviewStatus: 'migrated_reviewed',
  },
  {
    id: 'sanc-10',
    legacyCategory: 'Sanctions Screening',
    domain: 'Sanctions & Screening',
    subtopic: 'False Positive Tuning',
    difficulty: 'Advanced',
    jurisdiction: 'General / Sanctions Governance',
    questionType: 'single_mcq',
    question:
      'How should organizations address high false-positive rates in screening safely?',
    options: [
      'Test and validate matching rules/thresholds carefully with compliance governance so true matches are not missed',
      'Turn off screening altogether',
      'Set match sensitivity to zero',
      'Auto-clear all hits without testing',
    ],
    correct_answer: 'Test and validate matching rules/thresholds carefully with compliance governance so true matches are not missed',
    explanation:
      'Tuning must be controlled and tested to balance operational efficiency against true-match detection.',
    sourceRef: 'Screening Tuning & Model Governance',
    reviewStatus: 'migrated_reviewed',
  },
  {
    id: 'sanc-11',
    legacyCategory: 'Sanctions Screening',
    domain: 'Sanctions & Screening',
    subtopic: 'Documenting True vs. False Match',
    difficulty: 'Intermediate',
    jurisdiction: 'General / Sanctions Controls',
    questionType: 'single_mcq',
    question:
      'What makes a sanctions alert disposition note complete?',
    options: [
      'Recording the matched entry/identifiers, comparison findings, rationale, and reviewer action',
      'Leaving the disposition field blank',
      'Writing "looks fine" with zero detail',
      'Deleting the alert record',
    ],
    correct_answer: 'Recording the matched entry/identifiers, comparison findings, rationale, and reviewer action',
    explanation:
      'Clear disposition notes provide a verifiable audit record of compliance judgment.',
    sourceRef: 'Sanctions Recordkeeping & Auditability',
    reviewStatus: 'migrated_reviewed',
  },
  {
    id: 'sanc-12',
    legacyCategory: 'Sanctions Screening',
    domain: 'Sanctions & Screening',
    subtopic: 'Adverse Media vs. Sanctions',
    difficulty: 'Beginner',
    jurisdiction: 'General / Compliance Screening',
    questionType: 'single_mcq',
    question:
      'How does adverse media screening differ from formal sanctions list screening?',
    options: [
      'Sanctions lists are legally binding/official restrictions, whereas adverse media surfaces news/allegations for risk context',
      'They are identical and carry the same legal effect',
      'Adverse media replaces all sanctions checks',
      'Sanctions lists only come from newspaper articles',
    ],
    correct_answer: 'Sanctions lists are legally binding/official restrictions, whereas adverse media surfaces news/allegations for risk context',
    explanation:
      'Understanding the distinction ensures proper handling of legal restrictions versus broader reputational/risk intelligence.',
    sourceRef: 'Screening Types & Risk Context',
    reviewStatus: 'migrated_reviewed',
  },
  {
    id: 'sanc-13',
    legacyCategory: 'Sanctions Screening',
    domain: 'Sanctions & Screening',
    subtopic: 'Escalation Authority',
    difficulty: 'Expert',
    jurisdiction: 'General / Sanctions Governance',
    questionType: 'single_mcq',
    question:
      'Why is clear escalation authority essential for confirmed or high-risk sanctions alerts?',
    options: [
      'Designated compliance officers/teams follow defined procedures for holds, reporting, and restrictions',
      'Anyone can unilaterally override sanctions controls without authority',
      'Escalation slows down compliance without benefit',
      'Authority is unnecessary for potential hits',
    ],
    correct_answer: 'Designated compliance officers/teams follow defined procedures for holds, reporting, and restrictions',
    explanation:
      'Defined escalation paths ensure high-risk sanctions matters are handled consistently and lawfully.',
    sourceRef: 'Sanctions Escalation Governance',
    reviewStatus: 'migrated_reviewed',
  },
];

const CATEGORY_TO_DOMAIN = {
  'KYC Basics': 'AML/KYC',
  'CDD & EDD': 'AML/KYC',
  'TM Typologies': 'Transaction Monitoring',
  'SAR Writing': 'SAR Investigations',
  'Sanctions Screening': 'Sanctions & Screening',
};

export function normalizeQuestionRecord(raw, index = 0) {
  if (!raw || typeof raw !== 'object') return null;

  const mappedDomain =
    KNOWLEDGE_DOMAINS.includes(raw.domain)
      ? raw.domain
      : CATEGORY_TO_DOMAIN[raw.category] ||
        CATEGORY_TO_DOMAIN[raw.legacyCategory] ||
        'AML/KYC';

  const normalizedDifficulty = DIFFICULTY_LEVELS.includes(raw.difficulty)
    ? raw.difficulty
    : 'Intermediate';

  const options = Array.isArray(raw.options)
    ? raw.options.filter((opt) => typeof opt === 'string' && opt.trim().length > 0)
    : [];

  return {
    id: raw.id || `kt2-q-${index + 1}`,
    legacyCategory: raw.category || raw.legacyCategory || mappedDomain,
    domain: mappedDomain,
    subtopic: raw.subtopic || raw.category || 'General Compliance',
    difficulty: normalizedDifficulty,
    jurisdiction: raw.jurisdiction || 'General / FATF',
    questionType: raw.questionType || 'single_mcq',
    question: raw.question || '',
    options,
    correct_answer: raw.correct_answer || '',
    explanation:
      raw.explanation ||
      'Review the compliance principle and risk indicators tested by this question.',
    sourceRef: raw.sourceRef || 'AMLDecode Knowledge Base',
    reviewStatus: raw.reviewStatus || 'migrated_reviewed',
  };
}

export function getMigratedQuestionsByDomain(domain, supabaseRows = []) {
  const normalizedDb = (Array.isArray(supabaseRows) ? supabaseRows : [])
    .map((row, idx) => normalizeQuestionRecord(row, idx))
    .filter((q) => q && q.domain === domain && Array.isArray(q.options) && q.options.length > 0);

  const fallbackForDomain = LEGACY_MIGRATED_QUESTIONS.filter(
    (q) => q.domain === domain && Array.isArray(q.options) && q.options.length > 0
  );

  const byId = new Map();
  [...normalizedDb, ...fallbackForDomain].forEach((item) => {
    if (!byId.has(item.id)) {
      byId.set(item.id, item);
    }
  });

  return Array.from(byId.values());
}

function shuffleArray(items) {
  const arr = Array.isArray(items) ? [...items] : [];
  for (let i = arr.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    const tmp = arr[i];
    arr[i] = arr[j];
    arr[j] = tmp;
  }
  return arr;
}

function withShuffledOptions(q) {
  if (!q || !Array.isArray(q.options) || q.options.length <= 1) return q;
  const shuffled = shuffleArray(q.options);
  const changed = shuffled.some((opt, i) => opt !== q.options[i]);
  return {
    ...q,
    options: changed ? shuffled : [...shuffled.slice(1), shuffled[0]],
  };
}

export function buildAssessmentQueue({
  domain,
  difficulty,
  count,
  supabaseRows = [],
}) {
  const requestedCount = Math.max(1, Number(count) || 10);
  const domainPool = getMigratedQuestionsByDomain(domain, supabaseRows);

  const allNormalized = [
    ...(Array.isArray(supabaseRows) ? supabaseRows : []).map((row, idx) =>
      normalizeQuestionRecord(row, idx)
    ),
    ...LEGACY_MIGRATED_QUESTIONS,
  ].filter((q) => q && Array.isArray(q.options) && q.options.length > 0);

  const otherDomainPool = allNormalized.filter((q) => q.domain !== domain);

  const exactDomainDiff = domainPool.filter((q) => q.difficulty === difficulty);
  const restDomainPool = domainPool.filter((q) => q.difficulty !== difficulty);
  const otherDiffFirst = [
    ...otherDomainPool.filter((q) => q.difficulty === difficulty),
    ...otherDomainPool.filter((q) => q.difficulty !== difficulty),
  ];

  const ordered = [...exactDomainDiff, ...restDomainPool, ...otherDiffFirst];
  const uniqueById = [];
  const seenIds = new Set();

  for (const item of ordered) {
    if (!seenIds.has(item.id)) {
      seenIds.add(item.id);
      uniqueById.push(item);
    }
    if (uniqueById.length >= requestedCount) {
      return uniqueById.slice(0, requestedCount).map(withShuffledOptions);
    }
  }

  // If requestedCount exceeds total unique items (e.g. 50), append distinct scenario variants
  let variantIndex = 1;
  while (uniqueById.length < requestedCount && allNormalized.length > 0) {
    const base = allNormalized[(variantIndex - 1) % allNormalized.length];
    const variantId = `${base.id}-set${variantIndex}`;
    if (!seenIds.has(variantId)) {
      seenIds.add(variantId);
      uniqueById.push(
        withShuffledOptions({
          ...base,
          id: variantId,
          question: `[Set ${variantIndex + 1}] ${base.question}`,
        })
      );
    }
    variantIndex += 1;
  }

  return uniqueById.slice(0, requestedCount).map(withShuffledOptions);
}
const ATTEMPTS_STORAGE_KEY = 'amldecode_kt2_attempts_v1';

export function readStoredRecentAttempts() {
  try {
    const raw = window.localStorage.getItem(ATTEMPTS_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function recordCompletedAttempt(attempt) {
  try {
    const existing = readStoredRecentAttempts();
    const next = [attempt, ...existing].slice(0, 25);
    window.localStorage.setItem(ATTEMPTS_STORAGE_KEY, JSON.stringify(next));
    return next;
  } catch {
    return readStoredRecentAttempts();
  }
}


