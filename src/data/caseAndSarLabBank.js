import { KNOWLEDGE_DOMAINS } from './knowledgeTestBank';

export const CASE_SIMULATIONS_BY_DOMAIN = {
  'AML/KYC': [
    {
      id: 'case-kyc-ubo-1',
      domain: 'AML/KYC',
      difficulty: 'Intermediate',
      title: 'Layered Holding Structure & Unverified Source of Wealth',
      jurisdiction: 'General / FATF',
      dossierSummary:
        'A newly onboarded corporate client ("Northbridge Trade Holdings Ltd.") applies for multi-currency treasury accounts. Two holding entities together own 58% of the shares, a nominee director is listed locally, and stated Source of Wealth relies on an unverified consulting windfall.',
      stages: [
        {
          stageNumber: 1,
          title: 'Onboarding & Beneficial Ownership Trace',
          prompt:
            'Before enabling cross-border settlement, what is your primary due diligence action on the 58% holding structure and nominee director?',
          evidenceNote:
            'Corporate registry shows two intermediate entities; beneficial ownership forms lack natural-person control details.',
          options: [
            {
              id: 'a',
              label:
                'Trace ownership through both holding entities to identify natural-person UBOs (25%+ or effective control) and verify nominee authority.',
              points: 2,
              isOptimal: true,
              rationale:
                'Looking through corporate layers to natural persons and verifying control/nominee arrangements aligns with risk-based CDD/UBO standards.',
            },
            {
              id: 'b',
              label:
                'Approve full settlement limits immediately and collect UBO details during next year’s annual review.',
              points: 0,
              isOptimal: false,
              rationale:
                'Deferring UBO identification on an opaque multi-layered structure leaves material ownership risk unassessed at onboarding.',
            },
            {
              id: 'c',
              label:
                'Record the nominee director as the sole beneficial owner without examining underlying shareholders.',
              points: 0,
              isOptimal: false,
              rationale:
                'A nominee director is not automatically the beneficial owner; underlying ownership and effective control must be evaluated.',
            },
          ],
        },
        {
          stageNumber: 2,
          title: 'Source of Wealth & EDD Calibration',
          prompt:
            'The client submits a brief summary claiming $1.8M in consulting fees from a single unverified offshore client. How do you proceed?',
          evidenceNote:
            'No contracts, invoices, or tax/bank corroboration accompanied the initial consulting claim.',
          options: [
            {
              id: 'a',
              label:
                'Apply Enhanced Due Diligence (EDD): request corroborating SoW/SoF evidence, obtain senior/risk sign-off per policy, and restrict high-risk corridors until verified.',
              points: 2,
              isOptimal: true,
              rationale:
                'Unverified high-value wealth claims combined with complex structure call for EDD verification and risk-commensurate controls.',
            },
            {
              id: 'b',
              label:
                'Accept the verbal/summary claim at face value because the applicant provided a passport copy.',
              points: 0,
              isOptimal: false,
              rationale:
                'Identity verification alone does not corroborate Source of Wealth or resolve unexplained funds claims.',
            },
          ],
        },
      ],
    },
  ],
  'Transaction Monitoring': [
    {
      id: 'case-tm-structuring-1',
      domain: 'Transaction Monitoring',
      difficulty: 'Intermediate',
      title: 'Threshold-Adjacent Cash Deposits & Rapid Outbound Wires',
      jurisdiction: 'General / AML Typologies',
      dossierSummary:
        'Over 6 business days, a small retail account receives 7 cash deposits between $9,100 and $9,700 across different branches, followed within 24 hours of each batch by outgoing wires to an unrelated overseas supplier.',
      stages: [
        {
          stageNumber: 1,
          title: 'Alert Triage & Pattern Assessment',
          prompt:
            'Which investigative assessment best captures the behavior across the 6-day window?',
          evidenceNote:
            'Prior 6-month average monthly cash intake was under $2,500 with minimal wire activity.',
          options: [
            {
              id: 'a',
              label:
                'Flag potential structuring (repeated just-below-threshold cash deposits) paired with rapid pass-through wires deviating sharply from historical baseline.',
              points: 2,
              isOptimal: true,
              rationale:
                'Repeated sub-threshold deposits and immediate outbound pass-through inconsistent with historical behavior are classic structuring and layering indicators.',
            },
            {
              id: 'b',
              label:
                'Close as routine retail activity because each individual deposit was below the reporting threshold.',
              points: 0,
              isOptimal: false,
              rationale:
                'Evaluating single transactions in isolation misses deliberate structuring across multiple deposits.',
            },
          ],
        },
        {
          stageNumber: 2,
          title: 'Investigation & Escalation Action',
          prompt:
            'What is the most appropriate next step in the investigation workflow?',
          evidenceNote:
            'Counterparty wire references list generic "goods" without supporting documentation on file.',
          options: [
            {
              id: 'a',
              label:
                'Compile a complete chronological ledger of deposits and wires, document missing trade/purpose support, and escalate for SAR/investigative review without tipping off the customer.',
              points: 2,
              isOptimal: true,
              rationale:
                'A documented chronology, clear record of missing evidence, and confidential escalation follow sound investigative governance.',
            },
            {
              id: 'b',
              label:
                'Call the customer and warn them that cash deposits near $10,000 trigger suspicious activity reviews.',
              points: 0,
              isOptimal: false,
              rationale:
                'Tipping off a customer about suspicious activity monitoring/escalation risks compromising investigations and breaching compliance rules.',
            },
          ],
        },
      ],
    },
  ],
  'SAR Investigations': [
    {
      id: 'case-sar-escalation-1',
      domain: 'SAR Investigations',
      difficulty: 'Advanced',
      title: 'Unexplained Pass-Through & Conflicting Counterparty Records',
      jurisdiction: 'General / Financial Intelligence',
      dossierSummary:
        'An account opened 45 days ago receives rapid multi-party transfers and sends bulk outbound payments to two entities sharing an address with a dormant profile. Requested explanations remain incomplete.',
      stages: [
        {
          stageNumber: 1,
          title: 'Fact vs. Inference Separation',
          prompt:
            'How should you structure the evidentiary record before drafting the SAR narrative?',
          evidenceNote:
            'Transfer timestamps, amounts, and shared address records are verified; intent/collusion is not yet proven.',
          options: [
            {
              id: 'a',
              label:
                'Separate verified facts (dates, amounts, counterparties, shared address record) from analytical assessment of why the pattern is unusual and what evidence is missing.',
              points: 2,
              isOptimal: true,
              rationale:
                'Clear separation of documented facts, analytical indicators, and evidentiary gaps is a core SAR quality standard.',
            },
            {
              id: 'b',
              label:
                'Assert criminal intent as established fact based on the shared address alone.',
              points: 0,
              isOptimal: false,
              rationale:
                'Speculative conclusions should never be presented as established facts in an investigation or SAR.',
            },
          ],
        },
        {
          stageNumber: 2,
          title: 'Confidential Escalation & Record Integrity',
          prompt:
            'How should the case be routed and preserved?',
          evidenceNote:
            'Two prior low-value alerts on the same account were closed earlier in the month.',
          options: [
            {
              id: 'a',
              label:
                'Preserve full alert/transaction history, document unverified/missing items transparently, and escalate through formal confidential SAR channels.',
              points: 2,
              isOptimal: true,
              rationale:
                'Preserving audit trail completeness and escalating confidentially protects investigative integrity.',
            },
            {
              id: 'b',
              label:
                'Summarize only the final day’s wire and omit prior related activity to keep the escalation brief.',
              points: 0,
              isOptimal: false,
              rationale:
                'Omitting related pattern history can obscure the broader suspicious scheme.',
            },
          ],
        },
      ],
    },
  ],
  'Sanctions & Screening': [
    {
      id: 'case-sanc-screening-1',
      domain: 'Sanctions & Screening',
      difficulty: 'Intermediate',
      title: 'Fuzzy Name Hit & Ownership / Control Verification',
      jurisdiction: 'General / Sanctions Controls',
      dossierSummary:
        'A cross-border payment triggers a screening alert against a listed party with a similar name, while a corporate beneficiary has partial ownership ties that require checking.',
      stages: [
        {
          stageNumber: 1,
          title: 'Identifier & Match Evaluation',
          prompt:
            'What is the proper analytical step when reviewing a screening alert on a payment instruction?',
          evidenceNote:
            'Alert triggered on partial/fuzzy name similarity; identifier fields require side-by-side comparison.',
          options: [
            {
              id: 'a',
              label:
                'Hold/pausing per screening workflow until identifiers (name, DOB/registration, nationality/jurisdiction, aliases) are compared and documented objectively.',
              points: 2,
              isOptimal: true,
              rationale:
                'Structured identifier comparison and documented disposition rationale prevent premature release or unsubstantiated closures.',
            },
            {
              id: 'b',
              label:
                'Release the payment immediately without checking identifiers because the name spelling differs slightly.',
              points: 0,
              isOptimal: false,
              rationale:
                'Minor spelling differences or aliases are common in evasion attempts and require identifier verification.',
            },
          ],
        },
        {
          stageNumber: 2,
          title: 'Escalation & Documentation',
          prompt:
            'If identifiers cannot be ruled out or ownership/control indicators remain unresolved, what should you do?',
          evidenceNote:
            'Supporting entity ownership details are incomplete in the payment message.',
          options: [
            {
              id: 'a',
              label:
                'Escalate to sanctions compliance/escalation queue with full screening details and identifier comparison notes rather than guessing.',
              points: 2,
              isOptimal: true,
              rationale:
                'Escalating unresolved or ambiguous screening alerts with full context maintains compliance controls.',
            },
            {
              id: 'b',
              label:
                'Override the alert manually to meet payment SLA targets without supervisory/compliance review.',
              points: 0,
              isOptimal: false,
              rationale:
                'Bypassing controls for speed creates direct regulatory and sanctions exposure.',
            },
          ],
        },
      ],
    },
  ],
};

export const SAR_LAB_BRIEFS_BY_DOMAIN = {
  'SAR Investigations': {
    id: 'sar-lab-1',
    domain: 'SAR Investigations',
    difficulty: 'Intermediate',
    title: 'Rapid Pass-Through Transfers & Unverified Counterparty Purpose',
    caseFacts: [
      'Account opened 38 days ago with expected monthly activity of ~$4,000 in domestic retail sales.',
      'Between Nov 4 and Nov 14, the account received 6 incoming transfers totaling $84,500 from 5 distinct senders.',
      'Within 12–24 hours of each batch, $81,200 was wired outbound to two overseas entities with no prior relationship history.',
      'A request for supporting invoices/contracts sent on Nov 12 remained unanswered at case review.',
    ],
    rubricCriteria: [
      {
        id: 'chronology',
        label: 'Chronology, Dates & Amounts',
        description: 'Includes specific timeframe/dates, dollar figures, and transaction flow.',
        keywords: ['nov', '84,500', '81,200', '38', 'days', 'incoming', 'outbound', 'wire', 'transfer', 'amount'],
      },
      {
        id: 'redFlags',
        label: 'Suspicious Indicators & Profile Deviation',
        description: 'Connects activity to red flags (rapid pass-through, deviation from $4,000 profile).',
        keywords: ['pass-through', 'pass through', 'profile', '4,000', 'unusual', 'red flag', 'anomal', 'rapid', 'inconsistent'],
      },
      {
        id: 'factVsAssumption',
        label: 'Fact vs. Assumption Discipline',
        description: 'States observed facts clearly without inventing unverified criminal intent.',
        keywords: ['document', 'record', 'observed', 'unverified', 'indicat', 'appear', 'suggest', 'fact'],
      },
      {
        id: 'gapsAndEscalation',
        label: 'Missing Information & Confidential Escalation',
        description: 'Notes missing invoice/contract records and confidential escalation/SAR handling.',
        keywords: ['invoice', 'contract', 'missing', 'unanswered', 'escalat', 'sar', 'confidential', 'tipping'],
      },
    ],
    modelOutline:
      'Summarize the 38-day-old account baseline ($4,000 expected activity), detail the Nov 4–14 incoming transfers ($84,500) and rapid outbound wires ($81,200) to two overseas entities, note the unanswered Nov 12 request for invoices/contracts as missing information, and state the rationale for confidential escalation without assuming unproven intent.',
  },
};

export function getCaseSimulationForDomain(domain) {
  const safeDomain = KNOWLEDGE_DOMAINS.includes(domain) ? domain : 'AML/KYC';
  return CASE_SIMULATIONS_BY_DOMAIN[safeDomain] || CASE_SIMULATIONS_BY_DOMAIN['AML/KYC'];
}

export function getSarLabBriefForDomain(domain) {
  const safeDomain = KNOWLEDGE_DOMAINS.includes(domain) ? domain : 'SAR Investigations';
  return SAR_LAB_BRIEFS_BY_DOMAIN[safeDomain] || SAR_LAB_BRIEFS_BY_DOMAIN['SAR Investigations'];
}

export function evaluateSarNarrative(narrativeText, brief) {
  const cleanText = String(narrativeText || '').trim();
  const lower = cleanText.toLowerCase();
  const criteria = (brief && brief.rubricCriteria) || [];

  const breakdown = criteria.map((criterion) => {
    const matchedKeywords = (criterion.keywords || []).filter((kw) => lower.includes(kw));
    const hasSubstance = cleanText.length >= 80 && matchedKeywords.length >= 1;
    const score = hasSubstance ? (matchedKeywords.length >= 2 ? 25 : 18) : cleanText.length >= 30 ? 8 : 0;
    return {
      id: criterion.id,
      label: criterion.label,
      description: criterion.description,
      score,
      maxScore: 25,
      passed: score >= 18,
      feedback:
        score >= 18
          ? `Addresses ${criterion.label.toLowerCase()} clearly with supporting details.`
          : `Strengthen ${criterion.label.toLowerCase()}: ${criterion.description}`,
    };
  });

  const totalScore = breakdown.reduce((acc, item) => acc + item.score, 0);
  const maxTotal = breakdown.length * 25 || 100;
  const percentage = Math.min(100, Math.round((totalScore / maxTotal) * 100));

  return {
    totalScore,
    maxTotal,
    percentage,
    breakdown,
  };
}
