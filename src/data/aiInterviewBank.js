// Prevalidated AML/KYC Interview Question Bank & Domain Taxonomies (Layer 1 ? ?0 Baseline)

export const TARGET_COMPANIES = [
  { name: 'JPMorgan Chase', sector: 'Global Investment Bank', focus: 'High-volume wire monitoring, correspondent banking, OFAC sanctions & complex corporate KYC' },
  { name: 'HSBC', sector: 'Global Banking & Markets', focus: 'Cross-border trade finance, correspondent risk, multi-jurisdictional EDD & SAR escalation' },
  { name: 'Deutsche Bank', sector: 'Global Institutional Bank', focus: 'Institutional client onboarding, UBO verification, PEP governance & regulatory remediation' },
  { name: 'Standard Chartered', sector: 'Emerging Markets Bank', focus: 'Cross-border remittances, trade-based money laundering (TBML), sanctions & high-risk jurisdictions' },
  { name: 'Citi', sector: 'Global Financial Services', focus: 'Global AML operations, alert disposition quality, AML typologies & regulatory audit readiness' },
  { name: 'Barclays', sector: 'Global Corporate & Retail Bank', focus: 'Transaction monitoring tuning, customer risk rating (CRR), QA standards & UK/EU/US compliance' },
  { name: 'Wells Fargo', sector: 'Banking & Financial Services', focus: 'Customer due diligence (CDD/EDD), cash structuring detection, alert investigation & SAR narratives' },
  { name: 'American Express', sector: 'Global Payments & Card Network', focus: 'Merchant acquiring risk, payment velocity anomalies, mule activity & fraud-AML convergence' },
  { name: 'Goldman Sachs', sector: 'Investment Banking & Wealth', focus: 'UHNW source of wealth (SoW), private wealth EDD, complex holding structures & PEP risk' },
  { name: 'Morgan Stanley', sector: 'Institutional & Wealth Management', focus: 'Beneficial ownership transparency, institutional onboarding, adverse media & suitability/AML controls' },
  { name: 'EY', sector: 'Big 4 Advisory & Managed Services', focus: 'AML remediation projects, KYC file quality assurance, lookback investigations & regulatory gap testing' },
  { name: 'PwC', sector: 'Big 4 Risk & Regulatory Consulting', focus: 'Financial crime risk assessments, alert backlog remediation, QA calibration & control testing' },
  { name: 'KPMG', sector: 'Big 4 Forensics & Compliance', focus: 'AML/CTF program reviews, EDD case remediation, SAR quality reviews & regulatory compliance' },
  { name: 'Deloitte', sector: 'Big 4 Financial Crime Advisory', focus: 'Transaction monitoring scenario validation, KYC remediation operations & governance frameworks' },
  { name: 'Genpact', sector: 'Financial Crime Operations', focus: 'SLA-driven alert triage, L1/L2 KYC/AML processing, QA accuracy metrics & false-positive reduction' },
  { name: 'Accenture', sector: 'Compliance Operations & Consulting', focus: 'FinCrime managed operations, sanctions alert disposition, workflow standardization & team productivity' },
  { name: 'Revolut', sector: 'Global Digital Fintech', focus: 'Real-time payment screening, crypto/fiat mule networks, rapid onboarding risk & automated TM alerts' },
  { name: 'Other Company', sector: 'Banking / Fintech / Compliance Operations', focus: 'Core AML/KYC risk assessment, alert investigation methodology, regulatory escalation & documentation' },
];

export const AML_ROLES = [
  'AML Analyst',
  'KYC Analyst',
  'Transaction Monitoring Analyst',
  'Sanctions Screening Analyst',
  'Adverse Media Analyst',
  'CDD Analyst',
  'EDD Analyst',
  'KYB Analyst',
  'Financial Crime Analyst',
  'SAR Investigator',
  'Quality Analyst',
  'Team Leader',
  'Assistant Manager',
  'Operations Manager',
  'Compliance Manager',
];

export const EXPERIENCE_LEVELS = [
  { id: 'Fresher', label: 'Fresher', difficulty: 'foundational', summary: 'Definitions, core AML/KYC concepts, and structured foundational examples.' },
  { id: '0-1 Year', label: '0?1 Year', difficulty: 'foundational', summary: 'Entry-level alert handling, basic KYC verification, and escalation rules.' },
  { id: '1-3 Years', label: '1?3 Years', difficulty: 'intermediate', summary: 'Practical alert investigations, red-flag analysis, and disposition rationale.' },
  { id: '3-5 Years', label: '3?5 Years', difficulty: 'advanced', summary: 'Complex EDD/TM cases, judgment calls, SAR drafting, and QA rigor.' },
  { id: '5-8 Years', label: '5?8 Years', difficulty: 'leadership', summary: 'SLA/backlog management, QA calibration, operational controls, and escalations.' },
  { id: '8+ Years', label: '8+ Years', difficulty: 'leadership', summary: 'Governance, regulatory risk appetite, audit readiness, and strategic compliance.' },
];

export const QUESTION_COUNTS = [
  { count: 5, label: 'Quick Practice ? 5 questions', minutes: 10 },
  { count: 10, label: 'Standard Interview ? 10 questions', minutes: 20 },
  { count: 20, label: 'Full Mock Interview ? 20 questions', minutes: 40 },
];

// Each question has weighted concept groups for deterministic rubric evaluation:
// dimensions: technical (30%), practical (25%), risk (20%), clarity (15%), completeness (10%)
export const INTERVIEW_QUESTION_BANK = [
  // --- AML FUNDAMENTALS ---
  {
    code: 'AML-F01',
    category: 'AML Fundamentals',
    difficulty: 'foundational',
    roles: ['AML Analyst', 'KYC Analyst', 'CDD Analyst', 'Financial Crime Analyst', 'Transaction Monitoring Analyst'],
    experienceLevels: ['Fresher', '0-1 Year', '1-3 Years'],
    prompt: 'Walk me through the three stages of money laundering and give one practical banking example for each stage.',
    contextHint: 'Hiring managers look for clear definitions paired with concrete transaction examples.',
    recommendedModuleIndex: 0,
    rubricConcepts: [
      { id: 'placement', label: 'Placement (introducing illicit cash into the financial system)', keywords: ['placement', 'cash deposit', 'structuring', 'smurfing', 'financial system'], dimension: 'technical', weight: 12 },
      { id: 'layering', label: 'Layering (complex transfers/shell entities to obscure audit trail)', keywords: ['layering', 'wire', 'shell', 'obscure', 'audit trail', 'multiple accounts', 'offshore'], dimension: 'technical', weight: 12 },
      { id: 'integration', label: 'Integration (re-entering economy as seemingly legitimate wealth/assets)', keywords: ['integration', 'real estate', 'luxury', 'legitimate', 'business revenue', 'invoice'], dimension: 'technical', weight: 12 },
      { id: 'examples', label: 'Concrete practical examples for each stage', keywords: ['example', 'for instance', 'such as', 'e.g', 'deposit', 'property', 'transfer'], dimension: 'practical', weight: 25 },
      { id: 'risk_controls', label: 'Mention of detection controls or red flags at each stage', keywords: ['red flag', 'threshold', 'ctr', 'monitoring', 'control', 'detect'], dimension: 'risk', weight: 20 },
    ],
    modelAnswer: 'Money laundering occurs in three stages: (1) Placement?introducing illegal proceeds into the financial system, such as breaking large illicit cash sums into smaller deposits below reporting thresholds (structuring). (2) Layering?separating illicit funds from their source through complex movement, such as rapid cross-border wire transfers across shell companies or multiple currencies to obscure the audit trail. (3) Integration?returning laundered funds into the legitimate economy with a plausible origin, such as purchasing commercial real estate or generating inflated business invoices.',
    followUpPrompt: 'At which of those three stages is a retail bank most likely to detect illicit funds, and why?',
  },
  {
    code: 'AML-F02',
    category: 'AML Fundamentals',
    difficulty: 'foundational',
    roles: ['AML Analyst', 'KYC Analyst', 'CDD Analyst', 'EDD Analyst', 'Compliance Manager'],
    experienceLevels: ['Fresher', '0-1 Year', '1-3 Years', '3-5 Years'],
    prompt: 'What is a Risk-Based Approach (RBA) in AML/KYC compliance, and how does it affect customer onboarding and ongoing monitoring?',
    contextHint: 'Connect risk categorization (Low/Medium/High) to control intensity.',
    recommendedModuleIndex: 1,
    rubricConcepts: [
      { id: 'rba_def', label: 'Allocating compliance resources proportionate to identified ML/TF risk', keywords: ['risk-based', 'proportionate', 'allocate', 'resource', 'risk level', 'threat'], dimension: 'technical', weight: 18 },
      { id: 'risk_factors', label: 'Key risk dimensions (Customer, Geography, Product/Channel, Delivery)', keywords: ['geography', 'jurisdiction', 'product', 'customer type', 'delivery channel', 'pep'], dimension: 'risk', weight: 20 },
      { id: 'onboarding_impact', label: 'Impact on CDD vs EDD intensity at onboarding', keywords: ['cdd', 'edd', 'enhanced due diligence', 'simplified', 'onboarding', 'source of wealth'], dimension: 'practical', weight: 15 },
      { id: 'monitoring_impact', label: 'Impact on periodic review cycle & transaction monitoring thresholds', keywords: ['periodic review', 'ongoing monitoring', 'frequency', '1 year', '3 years', '5 years', 'threshold'], dimension: 'practical', weight: 15 },
    ],
    modelAnswer: 'A Risk-Based Approach means institutions identify, assess, and understand their money laundering and terrorist financing risks and apply controls proportionate to those risks rather than treating every customer identically. During onboarding, risk scoring across customer type, geography, products, and delivery channels determines whether Simplified, Standard CDD, or Enhanced Due Diligence (requiring Source of Wealth/Funds and senior approval) applies. Post-onboarding, high-risk customers undergo tighter transaction monitoring thresholds and more frequent periodic reviews (e.g., annually vs. every 3?5 years for low risk).',
    followUpPrompt: 'What happens operationally if an institution applies overly broad high-risk rules without true risk calibration?',
  },
  {
    code: 'AML-I03',
    category: 'AML Fundamentals',
    difficulty: 'intermediate',
    roles: ['AML Analyst', 'Financial Crime Analyst', 'Quality Analyst', 'Compliance Manager'],
    experienceLevels: ['1-3 Years', '3-5 Years', '5-8 Years'],
    prompt: 'Explain the key pillars of an effective AML compliance program and how an analyst contributes to them in daily operations.',
    contextHint: 'Cover governance, internal controls, training, independent testing, and ongoing CDD.',
    recommendedModuleIndex: 2,
    rubricConcepts: [
      { id: 'officer', label: 'Designated AML Compliance Officer / MLRO', keywords: ['compliance officer', 'mlro', 'designated', 'principal officer'], dimension: 'technical', weight: 10 },
      { id: 'controls', label: 'Written internal policies, procedures, and controls', keywords: ['policies', 'procedures', 'internal controls', 'sop'], dimension: 'technical', weight: 10 },
      { id: 'training', label: 'Ongoing employee training programs', keywords: ['training', 'awareness', 'staff'], dimension: 'technical', weight: 8 },
      { id: 'audit', label: 'Independent testing / audit function', keywords: ['independent', 'audit', 'testing', 'qa', 'quality assurance'], dimension: 'technical', weight: 10 },
      { id: 'cdd_pillar', label: 'Ongoing Customer Due Diligence & UBO monitoring', keywords: ['cdd', 'due diligence', 'beneficial owner', 'ongoing'], dimension: 'risk', weight: 15 },
      { id: 'analyst_role', label: 'Practical analyst contribution (alert triage, escalation, feedback loops)', keywords: ['analyst', 'escalat', 'document', 'sar', 'str', 'alert', 'feedback'], dimension: 'practical', weight: 22 },
    ],
    modelAnswer: 'An effective AML program rests on five core pillars: (1) a designated Compliance Officer/MLRO with authority and resources, (2) documented internal policies, procedures, and controls, (3) continuous role-specific employee training, (4) independent audit/testing of program effectiveness, and (5) ongoing Customer Due Diligence including beneficial ownership verification. In daily work, an analyst executes the control pillar by accurately triaging alerts, documenting defensible rationale, escalating suspicious patterns promptly, and flagging emerging typologies or rule gaps to QA and leadership.',
    followUpPrompt: 'Why must the audit/testing pillar remain independent from the team executing daily alert reviews?',
  },

  // --- KYC / CDD / EDD ---
  {
    code: 'KYC-F01',
    category: 'KYC/CDD/EDD',
    difficulty: 'foundational',
    roles: ['KYC Analyst', 'CDD Analyst', 'KYB Analyst', 'AML Analyst'],
    experienceLevels: ['Fresher', '0-1 Year', '1-3 Years'],
    prompt: 'What is the difference between Customer Due Diligence (CDD) and Enhanced Due Diligence (EDD), and what triggers EDD?',
    contextHint: 'Mention specific EDD triggers and the extra documentation collected.',
    recommendedModuleIndex: 3,
    rubricConcepts: [
      { id: 'cdd_def', label: 'CDD baseline: identity verification, nature/purpose of relationship, expected activity', keywords: ['cdd', 'identity', 'verify', 'nature', 'purpose', 'expected activity', 'baseline'], dimension: 'technical', weight: 16 },
      { id: 'edd_def', label: 'EDD: deeper scrutiny, SoW/SoF corroboration, senior management sign-off', keywords: ['edd', 'enhanced', 'source of wealth', 'source of funds', 'senior management', 'approval'], dimension: 'technical', weight: 18 },
      { id: 'triggers', label: 'Specific EDD triggers (PEPs, high-risk jurisdictions, complex structures, cash-intensive)', keywords: ['pep', 'politically exposed', 'high-risk', 'sanction', 'shell', 'complex', 'cash-intensive', 'non-face-to-face'], dimension: 'risk', weight: 22 },
      { id: 'practical_steps', label: 'Practical verification actions (independent registry checks, financial statements)', keywords: ['corroborat', 'registry', 'audited', 'tax', 'bank statement', 'independent'], dimension: 'practical', weight: 18 },
    ],
    modelAnswer: 'CDD is the baseline standard applied to all customers: verifying identity using reliable independent sources, identifying Ultimate Beneficial Owners (UBOs), understanding the nature and intended purpose of the account, and establishing expected activity. EDD is triggered when a customer presents elevated ML/TF risk?such as Politically Exposed Persons (PEPs), customers linked to FATF high-risk jurisdictions, complex multi-layered corporate structures, or high-risk industries. Under EDD, analysts corroborate Source of Wealth and Source of Funds using independent documents, conduct deeper adverse media checks, apply tighter ongoing monitoring, and obtain senior management approval.',
    followUpPrompt: 'How do you distinguish between Source of Wealth (SoW) and Source of Funds (SoF) during an EDD review?',
  },
  {
    code: 'KYC-I02',
    category: 'KYC/CDD/EDD',
    difficulty: 'intermediate',
    roles: ['KYB Analyst', 'CDD Analyst', 'EDD Analyst', 'KYC Analyst', 'Quality Analyst'],
    experienceLevels: ['1-3 Years', '3-5 Years'],
    prompt: 'When onboarding a corporate client with three layers of holding companies, how do you identify and verify the Ultimate Beneficial Owner (UBO)?',
    contextHint: 'Explain ownership threshold calculation, indirect ownership, and control fallback.',
    recommendedModuleIndex: 4,
    rubricConcepts: [
      { id: 'threshold', label: 'Ownership threshold (typically 25% or lower risk-based threshold like 10%)', keywords: ['25%', '10%', 'threshold', 'equity', 'shares', 'voting'], dimension: 'technical', weight: 16 },
      { id: 'indirect_calc', label: 'Tracing through intermediate holding layers and multiplying indirect stakes', keywords: ['layer', 'holding', 'indirect', 'multiply', 'chain', 'corporate structure', 'chart'], dimension: 'practical', weight: 20 },
      { id: 'control_prong', label: 'Effective control / Senior Managing Official fallback if no individual meets equity threshold', keywords: ['control', 'voting', 'senior managing official', 'ceo', 'director', 'no individual'], dimension: 'technical', weight: 16 },
      { id: 'verification', label: 'Independent registry documents, share registers, and KYC on natural persons', keywords: ['registry', 'incorporation', 'share register', 'id', 'passport', 'kyc', 'screen'], dimension: 'risk', weight: 18 },
    ],
    modelAnswer: 'To identify UBOs across a multi-layered corporate structure, I first obtain a certified corporate structure chart, certificates of incorporation, and official share registers for every layer. I trace ownership upward to natural persons, multiplying percentages across holding layers to see who holds an effective interest at or above the applicable threshold (typically 25%, or 10% for high-risk entities). Beyond equity, I check whether any individual exercises effective control through voting rights or board appointment powers. If no natural person meets the ownership or control test, I identify the Senior Managing Official(s), verify all identified individuals with government ID, and screen them for PEPs, sanctions, and adverse media.',
    followUpPrompt: 'What red flags would make you suspect a nominee shareholder arrangement in that holding structure?',
  },
  {
    code: 'KYC-A03',
    category: 'KYC/CDD/EDD',
    difficulty: 'advanced',
    roles: ['EDD Analyst', 'KYC Analyst', 'Quality Analyst', 'Compliance Manager'],
    experienceLevels: ['3-5 Years', '5-8 Years', '8+ Years'],
    prompt: 'A domestic Politically Exposed Person (PEP) wants to open an investment account and submits a self-declaration of wealth. Why is a self-declaration insufficient, and what evidence would you require?',
    contextHint: 'Focus on independent corroboration, corruption/bribery risk, and ongoing governance.',
    recommendedModuleIndex: 4,
    rubricConcepts: [
      { id: 'why_insufficient', label: 'Self-declaration is unverified client assertion and does not mitigate bribery/corruption risk', keywords: ['self-declaration', 'unverified', 'corrupt', 'bribery', 'public office', 'independent'], dimension: 'risk', weight: 22 },
      { id: 'sow_docs', label: 'Corroborating Source of Wealth documents (asset disclosures, tax filings, business sale deeds, audited financials)', keywords: ['tax', 'asset disclosure', 'audited', 'sale agreement', 'inheritance', 'dividend', 'property deed'], dimension: 'practical', weight: 22 },
      { id: 'sof_docs', label: 'Corroborating Source of Funds for the specific deposit (originating bank statement, transfer trail)', keywords: ['source of funds', 'bank statement', 'originating', 'remittance', 'trail'], dimension: 'technical', weight: 16 },
      { id: 'governance', label: 'Senior management sign-off, adverse media check, and enhanced ongoing monitoring', keywords: ['senior management', 'adverse media', 'ongoing monitoring', 'approval', 'rcas', 'close associate'], dimension: 'technical', weight: 14 },
    ],
    modelAnswer: 'A self-declaration merely reflects the client?s uncorroborated statement and cannot mitigate the heightened bribery, corruption, or embezzlement risks associated with PEPs. Under EDD standards, Source of Wealth must be substantiated using reliable, independent documentation?such as official public asset declarations, multi-year tax returns, audited financial statements of family businesses, or notarized property/equity sale agreements. For Source of Funds, I verify the exact originating bank account statement showing the funds? accumulation and transfer. Finally, I complete adverse media screening on the PEP and close associates, document a clear risk rationale, and obtain senior management approval before onboarding.',
    followUpPrompt: 'Once a PEP leaves public office, do you immediately downgrade them to standard risk? Why or why not?',
  },

  // --- TRANSACTION MONITORING ---
  {
    code: 'TM-I01',
    category: 'Transaction Monitoring',
    difficulty: 'intermediate',
    roles: ['Transaction Monitoring Analyst', 'AML Analyst', 'Financial Crime Analyst', 'SAR Investigator'],
    experienceLevels: ['0-1 Year', '1-3 Years', '3-5 Years'],
    prompt: 'What would you do if a customer receives multiple high-value transfers inconsistent with their expected activity?',
    contextHint: 'Walk through your end-to-end alert investigation workflow from profile review to disposition.',
    recommendedModuleIndex: 5,
    rubricConcepts: [
      { id: 'profile_expected', label: 'Review KYC profile, occupation, income, and expected account activity', keywords: ['kyc', 'profile', 'occupation', 'income', 'expected activity', 'business'], dimension: 'technical', weight: 15 },
      { id: 'tx_history', label: 'Analyze historical transaction baseline, frequency, velocity, and subsequent outflows', keywords: ['history', 'baseline', 'velocity', 'outflow', 'rapid', 'pattern', 'lookback'], dimension: 'practical', weight: 16 },
      { id: 'counterparties', label: 'Examine counterparties, jurisdictions, and payment narrations/purposes', keywords: ['counterpart', 'originator', 'sender', 'jurisdiction', 'narration', 'purpose', 'unrelated'], dimension: 'risk', weight: 18 },
      { id: 'rfi_docs', label: 'Request supporting documentation / Source of Funds (invoices, contracts, bank statements) via RFI', keywords: ['source of funds', 'invoice', 'contract', 'documentation', 'rfi', 'request for information', 'supporting'], dimension: 'practical', weight: 16 },
      { id: 'escalation', label: 'Document clear investigation rationale and escalate for SAR/STR if unexplained or suspicious', keywords: ['escalat', 'sar', 'str', 'rationale', 'document', 'suspicious', 'close'], dimension: 'risk', weight: 15 },
    ],
    modelAnswer: 'First, I review the customer?s KYC profile?occupation, declared income/turnover, and expected account activity?to measure the exact deviation. Next, I analyze 3?6 months of transaction history to see whether this is an isolated event or a new pattern, and check whether incoming funds are rapidly wired out or withdrawn (pass-through/mule behavior). Third, I examine the counterparties, originating jurisdictions, and payment narrations for commercial logic or adverse media/sanctions links. If no legitimate rationale is evident on file, I initiate an RFI (unless tipping-off risk applies) requesting supporting invoices, contracts, or Source of Funds documentation. Finally, I document all findings objectively and escalate for SAR/STR filing if the activity remains unsubstantiated or exhibits ML red flags.',
    followUpPrompt: 'When would you avoid contacting the customer for supporting documents and escalate directly instead?',
  },
  {
    code: 'TM-I02',
    category: 'Transaction Monitoring',
    difficulty: 'intermediate',
    roles: ['Transaction Monitoring Analyst', 'AML Analyst', 'SAR Investigator', 'Financial Crime Analyst'],
    experienceLevels: ['1-3 Years', '3-5 Years'],
    prompt: 'How do you differentiate between legitimate small-business cash deposits and intentional cash structuring (smurfing)?',
    contextHint: 'Compare operational business seasonality against threshold avoidance behavior.',
    recommendedModuleIndex: 5,
    rubricConcepts: [
      { id: 'threshold_pattern', label: 'Deposits clustered just below regulatory reporting thresholds (e.g., ?10L / $10k)', keywords: ['below', 'threshold', 'reporting', 'cluster', '9,000', '9.5', 'just under'], dimension: 'risk', weight: 20 },
      { id: 'branch_timing', label: 'Multiple branches/ATMs or coordinated depositors on the same or consecutive days', keywords: ['multiple branch', 'atm', 'same day', 'consecutive', 'multiple depositor', 'smurf', 'split'], dimension: 'risk', weight: 18 },
      { id: 'business_profile', label: 'Comparison against business type, operating hours, location, and POS/supplier flows', keywords: ['business', 'retail', 'restaurant', 'operating', 'supplier', 'inventory', 'season'], dimension: 'practical', weight: 18 },
      { id: 'fund_disposition', label: 'Immediate wire/transfer of pooled cash out to unrelated parties vs paying business expenses', keywords: ['wire', 'transfer', 'unrelated', 'payroll', 'tax', 'utility', 'outflow'], dimension: 'technical', weight: 16 },
    ],
    modelAnswer: 'Legitimate cash-intensive businesses (like grocers or restaurants) deposit irregular, natural amounts aligned with weekend/seasonal footfall, use their local branch, and disburse funds toward identifiable payroll, rent, utilities, and wholesale suppliers. Intentional structuring shows deposits clustered narrowly below the statutory CTR threshold, often split across multiple branches, ATMs, or third-party depositors within a short window, followed by rapid consolidation and outward transfers to unrelated counterparties with minimal normal business overhead.',
    followUpPrompt: 'If a customer asks a teller what exact cash amount triggers a regulatory report, how should that be handled?',
  },
  {
    code: 'TM-A03',
    category: 'Transaction Monitoring',
    difficulty: 'advanced',
    roles: ['Transaction Monitoring Analyst', 'Financial Crime Analyst', 'SAR Investigator', 'Quality Analyst'],
    experienceLevels: ['3-5 Years', '5-8 Years'],
    prompt: 'Describe the behavioral indicators of a money mule network in digital banking and how you investigate a suspected mule account.',
    contextHint: 'Look at onboarding anomalies, device/IP overlap, velocity, and funneling.',
    recommendedModuleIndex: 6,
    rubricConcepts: [
      { id: 'onboarding_flags', label: 'Recent onboarding / dormant reactivation, student/low-income profile mismatch', keywords: ['new account', 'dormant', 'student', 'unemployed', 'profile mismatch', 'recent'], dimension: 'risk', weight: 18 },
      { id: 'velocity_funnel', label: 'Rapid credit-to-debit velocity, zero balance retention, many-to-one or one-to-many funneling', keywords: ['rapid', 'minutes', 'zero balance', 'funnel', 'pass-through', 'velocity', 'many-to-one'], dimension: 'technical', weight: 20 },
      { id: 'digital_telemetry', label: 'Shared device IDs, IPs, beneficiaries, or linked accounts across customers', keywords: ['device', 'ip address', 'shared', 'linked', 'beneficiar', 'network', 'cluster'], dimension: 'practical', weight: 20 },
      { id: 'escalation_action', label: 'Cross-referencing fraud/cyber alerts, account restriction recommendation, and SAR/STR filing', keywords: ['fraud', 'cyber', 'restrict', 'freeze', 'sar', 'str', 'escalat'], dimension: 'practical', weight: 16 },
    ],
    modelAnswer: 'Suspected money mule accounts typically show newly opened or recently reactivated accounts held by individuals with modest declared income (e.g., students or unemployed) suddenly receiving rapid P2P/IMPS/wire credits from multiple unrelated senders, followed within minutes by outbound transfers or ATM withdrawals that leave near-zero balances. In my investigation, I check transaction velocity, map shared beneficiaries, review device/IP telemetry for linked accounts, coordinate with fraud teams to check for victim recall/chargeback claims, and escalate for account restriction and SAR/STR reporting.',
    followUpPrompt: 'How do you avoid tipping off a suspected mule account holder when payment recalls or account blocks occur?',
  },

  // --- SANCTIONS SCREENING ---
  {
    code: 'SAN-F01',
    category: 'Sanctions Screening',
    difficulty: 'foundational',
    roles: ['Sanctions Screening Analyst', 'AML Analyst', 'KYC Analyst', 'EDD Analyst'],
    experienceLevels: ['Fresher', '0-1 Year', '1-3 Years'],
    prompt: 'What is the difference between a True Match and a False Positive in sanctions screening, and what identifiers do you use to discount a hit?',
    contextHint: 'List concrete secondary identifiers required by QA standards.',
    recommendedModuleIndex: 7,
    rubricConcepts: [
      { id: 'definitions', label: 'Clear distinction between True Match (actual sanctioned party) and False Positive (coincidental name similarity)', keywords: ['true match', 'false positive', 'coincidental', 'fuzzy', 'same entity', 'different person'], dimension: 'technical', weight: 18 },
      { id: 'identifiers', label: 'Secondary identifiers: DOB, nationality, passport/national ID, address, gender, entity registration number', keywords: ['date of birth', 'dob', 'nationality', 'passport', 'id number', 'address', 'gender', 'registration'], dimension: 'practical', weight: 24 },
      { id: 'single_id_rule', label: 'Never discounting solely on one weak difference or partial name spelling', keywords: ['multiple', 'corroborat', 'alias', 'aka', 'transliteration', 'never rely on single'], dimension: 'risk', weight: 18 },
      { id: 'escalation', label: 'Escalating potential/true matches immediately and freezing/holding payment where required', keywords: ['escalat', 'hold', 'block', 'freeze', 'l2', 'sanctions officer'], dimension: 'risk', weight: 14 },
    ],
    modelAnswer: 'A False Positive occurs when fuzzy name-matching algorithms trigger an alert due to phonetic or spelling similarity, but secondary identifiers prove the customer or counterparty is a different person/entity. A True Match (or Potential Match requiring L2 escalation) occurs when identifiers align with the sanctioned target. To discount a false positive safely, I compare multiple independent identifiers?Date of Birth, nationality, passport or national ID number, residential/registered address, and known aliases?and document why those attributes conclusively rule out the sanctioned party. If key identifiers are missing or partially align, I hold the transaction and escalate immediately.',
    followUpPrompt: 'What should you do if a wire payment triggers a sanctions name hit, but the payment message contains no Date of Birth or address?',
  },
  {
    code: 'SAN-I02',
    category: 'Sanctions Screening',
    difficulty: 'intermediate',
    roles: ['Sanctions Screening Analyst', 'AML Analyst', 'EDD Analyst', 'Compliance Manager'],
    experienceLevels: ['1-3 Years', '3-5 Years', '5-8 Years'],
    prompt: 'Explain the OFAC 50 Percent Rule and why beneficial ownership data is critical for sanctions compliance.',
    contextHint: 'Explain aggregation of ownership across multiple blocked persons.',
    recommendedModuleIndex: 7,
    rubricConcepts: [
      { id: 'fifty_rule', label: 'Entity owned 50% or more in the aggregate by one or more blocked/SDN persons is itself blocked', keywords: ['50%', '50 percent', 'aggregate', 'blocked', 'sdn', 'automatically'], dimension: 'technical', weight: 24 },
      { id: 'not_on_list', label: 'Applies even if the subsidiary/entity itself is not explicitly named on the SDN list', keywords: ['not listed', 'not on the list', 'subsidiary', 'unlisted', 'implicitly'], dimension: 'risk', weight: 20 },
      { id: 'ubo_importance', label: 'Requires deep UBO/shareholding mapping during KYB/EDD before onboarding or payment', keywords: ['ubo', 'beneficial owner', 'shareholder', 'ownership structure', 'kyb'], dimension: 'practical', weight: 20 },
      { id: 'control_note', label: 'Distinguishing ownership (50% rule) vs control risks (targeted prohibitions)', keywords: ['control', 'ownership', 'eu', 'uk'], dimension: 'technical', weight: 10 },
    ],
    modelAnswer: 'Under the OFAC 50 Percent Rule, any entity owned 50% or more in the aggregate, directly or indirectly, by one or more blocked persons (such as SDN-listed individuals or entities) is automatically considered blocked by operation of law?even if that entity does not appear by name on the SDN list. This makes accurate UBO and corporate ownership mapping essential: screening only the legal entity name will miss sanctioned subsidiaries unless analysts verify and screen all significant shareholders and aggregate their stakes.',
    followUpPrompt: 'How does the EU/UK approach to ownership and control differ slightly from OFAC?s strict 50% ownership threshold?',
  },

  // --- SAR / STR ---
  {
    code: 'SAR-I01',
    category: 'SAR/STR',
    difficulty: 'intermediate',
    roles: ['SAR Investigator', 'AML Analyst', 'Transaction Monitoring Analyst', 'Quality Analyst'],
    experienceLevels: ['1-3 Years', '3-5 Years'],
    prompt: 'What are the essential elements of an effective SAR/STR narrative, and what common drafting mistakes should an investigator avoid?',
    contextHint: 'Cover the Five Ws + How, chronological structure, and objectivity.',
    recommendedModuleIndex: 8,
    rubricConcepts: [
      { id: 'five_ws', label: 'The Five Ws and How (Who, What, When, Where, Why suspicious, How conducted)', keywords: ['who', 'what', 'when', 'where', 'why', 'how', 'five ws'], dimension: 'technical', weight: 20 },
      { id: 'chronology', label: 'Clear chronological summary of alert trigger, customer profile, and suspicious transactions', keywords: ['chronolog', 'timeline', 'summary', 'alert', 'transaction', 'total amount'], dimension: 'practical', weight: 18 },
      { id: 'objectivity', label: 'Separating verified facts from assumptions; no legal conclusions of criminal guilt', keywords: ['fact', 'objective', 'assumption', 'speculat', 'guilt', 'evidence', 'neutral'], dimension: 'risk', weight: 20 },
      { id: 'mistakes', label: 'Avoiding jargon, raw data dumps, missing KYC comparison, or tipping-off mentions', keywords: ['jargon', 'dump', 'concise', 'kyc', 'tipping', 'unexplained'], dimension: 'clarity', weight: 16 },
    ],
    modelAnswer: 'An effective SAR/STR narrative clearly answers Who is involved, What instruments/accounts were used, When the activity occurred, Where funds originated and went, Why the activity deviates from the customer?s KYC profile, and How the transactions were executed. It opens with a concise executive summary stating the suspicion, total dollar/rupee exposure, and date range, followed by a chronological breakdown of key transactions and investigative findings. Investigators must avoid internal system jargon, unformatted transaction dumps, speculative language, or asserting criminal guilt?sticking strictly to verifiable facts and red flags.',
    followUpPrompt: 'What is the key operational difference between filing a SAR in the US (FinCEN) and an STR in India (FIU-IND)?',
  },
  {
    code: 'SAR-A02',
    category: 'SAR/STR',
    difficulty: 'advanced',
    roles: ['SAR Investigator', 'AML Analyst', 'Compliance Manager', 'Quality Analyst'],
    experienceLevels: ['3-5 Years', '5-8 Years', '8+ Years'],
    prompt: 'What is "tipping off" in AML compliance, and give two realistic scenarios where an analyst or relationship manager might accidentally violate it.',
    contextHint: 'Explain statutory confidentiality and safe customer communication.',
    recommendedModuleIndex: 8,
    rubricConcepts: [
      { id: 'definition', label: 'Disclosing to a customer or third party that an STR/SAR or AML investigation is underway', keywords: ['tipping off', 'disclos', 'confidential', 'aware', 'investigation', 'sar', 'str'], dimension: 'technical', weight: 22 },
      { id: 'scenario_1', label: 'Scenario 1: Telling a customer their account/payment is frozen due to FIU/SAR review or AML suspicion', keywords: ['freeze', 'hold', 'tell customer', 'mention sar', 'fiu', 'compliance investigation'], dimension: 'practical', weight: 20 },
      { id: 'scenario_2', label: 'Scenario 2: Sending an aggressive RFI that reveals specific alert thresholds or warning front-office staff improperly', keywords: ['rfi', 'threshold', 'relationship manager', 'front office', 'alert rule', 'warn'], dimension: 'risk', weight: 20 },
      { id: 'safe_handling', label: 'Using standard routine KYC/business-as-usual phrasing for legitimate document requests', keywords: ['routine', 'periodic review', 'standard', 'neutral', 'policy'], dimension: 'clarity', weight: 14 },
    ],
    modelAnswer: 'Tipping off occurs when an institution or employee discloses?directly or indirectly?to a customer or unauthorized third party that a SAR/STR has been filed or that an AML investigation is underway. Two common accidental violations are: (1) an RM or support agent telling an impatient client that a wire is delayed because Compliance is preparing a regulatory report, and (2) phrasing an RFI so specifically ("Explain why you made four cash deposits just under ?10 lakh") that it reveals internal monitoring rules. Analysts prevent this by framing any approved outreach as routine KYC/transaction verification and restricting SAR/STR visibility strictly to authorized compliance staff.',
    followUpPrompt: 'If a customer remains suspicious after an STR is filed, who decides whether to exit the relationship and how is tipping off avoided during offboarding?',
  },

  // --- LEADERSHIP / QA / OPERATIONS ---
  {
    code: 'LDR-L01',
    category: 'Leadership',
    difficulty: 'leadership',
    roles: ['Quality Analyst', 'Team Leader', 'Assistant Manager', 'Operations Manager', 'Compliance Manager'],
    experienceLevels: ['3-5 Years', '5-8 Years', '8+ Years'],
    prompt: 'How do you balance strict SLA turnaround targets with high Quality Assurance (QA) accuracy when your team faces a sudden 40% spike in AML alerts?',
    contextHint: 'Demonstrate risk-based triage, QA sampling, coaching, and stakeholder escalation.',
    recommendedModuleIndex: 2,
    rubricConcepts: [
      { id: 'risk_triage', label: 'Risk-based prioritization (high-risk/sanctions/aging alerts first rather than pure FIFO)', keywords: ['risk-based', 'priorit', 'high-risk', 'sanctions', 'aging', 'triage'], dimension: 'risk', weight: 22 },
      { id: 'qa_guardrails', label: 'Protecting QA standards via targeted sampling on complex/new rules rather than rubber-stamping', keywords: ['qa', 'quality', 'sampling', 'rubber-stamp', 'audit', 'calibration'], dimension: 'technical', weight: 20 },
      { id: 'capacity_plan', label: 'Capacity reallocation, cross-training, false-positive root-cause feedback to tuning teams', keywords: ['capacity', 'cross-train', 'root cause', 'tuning', 'false positive', 'reallocate'], dimension: 'practical', weight: 20 },
      { id: 'stakeholder_comm', label: 'Proactive SLA risk escalation to leadership/governance with transparent data', keywords: ['escalat', 'stakeholder', 'leadership', 'transparent', 'forecast', 'sla'], dimension: 'clarity', weight: 16 },
    ],
    modelAnswer: 'During an alert spike, you never sacrifice QA accuracy just to clear numbers?rubber-stamping creates severe regulatory exposure. First, I re-segment the queue by risk so high-risk alerts, PEP/sanctions hits, and aging escalations are worked immediately. Second, I analyze the root cause of the spike; if a single noisy rule caused a surge of false positives, I document evidence for TM tuning while deploying standardized investigation templates to speed up analyst write-ups without cutting corners. Third, I focus QA sampling on high-risk closures and newer analysts, reallocate cross-trained capacity, and proactively notify compliance leadership with a data-backed recovery timeline if SLA extensions are warranted.',
    followUpPrompt: 'How do you coach a fast analyst who consistently meets productivity targets but fails QA due to thin investigation rationales?',
  },
  {
    code: 'LDR-L02',
    category: 'Leadership',
    difficulty: 'leadership',
    roles: ['Team Leader', 'Assistant Manager', 'Operations Manager', 'Compliance Manager', 'Quality Analyst'],
    experienceLevels: ['5-8 Years', '8+ Years'],
    prompt: 'During an internal audit or regulatory inspection, an auditor challenges a batch of closed alerts as inadequately documented. How do you respond and remediate?',
    contextHint: 'Show ownership, root-cause analysis, lookback scoping, and control enhancement.',
    recommendedModuleIndex: 2,
    rubricConcepts: [
      { id: 'ownership', label: 'Objective validation of the audit finding without defensiveness', keywords: ['acknowledge', 'validate', 'objective', 'ownership', 'review'], dimension: 'clarity', weight: 14 },
      { id: 'root_cause', label: 'Root-cause analysis (SOP ambiguity, training gap, checklist design, QA calibration)', keywords: ['root cause', 'sop', 'training', 'checklist', 'calibration', 'template'], dimension: 'technical', weight: 20 },
      { id: 'lookback', label: 'Scoping a risk-based lookback/remediation sample and re-investigating high-risk closures', keywords: ['lookback', 'remediat', 'sample', 're-investigat', 'scope', 'population'], dimension: 'practical', weight: 24 },
      { id: 'preventive', label: 'Implementing sustainable controls (mandatory rationale fields, updated SOPs, targeted QA)', keywords: ['prevent', 'control', 'mandatory', 'governance', 'track', 'milestone'], dimension: 'risk', weight: 20 },
    ],
    modelAnswer: 'First, I review the cited files objectively with QA to confirm the exact documentation gap and verify whether any underlying suspicious activity was missed. Second, I conduct a root-cause analysis to determine if the issue stemmed from ambiguous SOP guidance, missing disposition checklist prompts, or inconsistent QA calibration. Third, I define a risk-based lookback population covering similar alerts from the same period, prioritize high-risk closures for re-review, and file any warranted SARs/STRs. Finally, I embed preventive controls?updated rationale templates, targeted analyst coaching, and heightened QA sampling?and report milestone completion transparently to audit and senior governance.',
    followUpPrompt: 'What metrics would you track over the next 90 days to prove to auditors that the remediation worked?',
  },
];

export function selectQuestionsForSession({ role, experienceLevel, questionCount }) {
  const expMeta = EXPERIENCE_LEVELS.find((e) => e.id === experienceLevel) || EXPERIENCE_LEVELS[0];
  const targetDiff = expMeta.difficulty;

  const scored = INTERVIEW_QUESTION_BANK.map((q) => {
    let relevance = 0;
    if (q.roles.includes(role)) relevance += 50;
    if (q.experienceLevels.includes(experienceLevel)) relevance += 30;
    if (q.difficulty === targetDiff) relevance += 20;
    return { q, relevance };
  });

  scored.sort((a, b) => b.relevance - a.relevance);

  // Pick top unique questions up to questionCount (cycle with slight variation only if bank < requested)
  const selected = [];
  const seen = new Set();
  for (const item of scored) {
    if (selected.length >= questionCount) break;
    if (!seen.has(item.q.code)) {
      seen.add(item.q.code);
      selected.push(item.q);
    }
  }

  // If user requested 20 questions and bank has fewer unique items, include remaining bank items cleanly
  let cycleIdx = 0;
  while (selected.length < questionCount && INTERVIEW_QUESTION_BANK.length > 0) {
    const fallbackQ = INTERVIEW_QUESTION_BANK[cycleIdx % INTERVIEW_QUESTION_BANK.length];
    selected.push({
      ...fallbackQ,
      code: `${fallbackQ.code}-R${Math.floor(cycleIdx / INTERVIEW_QUESTION_BANK.length) + 1}`,
      prompt: `[Follow-Up Scenario] ${fallbackQ.followUpPrompt || fallbackQ.prompt}`,
    });
    cycleIdx += 1;
  }

  return selected;
}
