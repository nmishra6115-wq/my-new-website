import { computeContentHash, resolveRelatedNoteIndex } from './dailyChallengeBank';

export const ALLOWED_TOPICS = [
  'AML',
  'KYC',
  'Transaction Monitoring',
  'SAR',
  'Sanctions & PEP',
  'Advanced Investigation',
  'Mixed Challenge',
];

export const ALLOWED_DIFFICULTIES = ['Foundational', 'Intermediate', 'Advanced'];

const AMBIGUITY_PATTERNS = [
  /\b(always|never|guaranteed|100%|without exception)\b(?![^.]*\b(generally|typically|unless|risk-based|subject to)\b)/i,
  /\b(probably|maybe|might be true|unclear whether|debatable|arguably)\b/i,
  /\b(what do you think|which of the following|is it true or false)\b/i,
];

const UNSUPPORTED_LEGAL_CLAIM_PATTERNS = [
  /\b(guaranteed immunity|免除责任|legal loophole|exempt from all laws|automatic criminal conviction)\b/i,
  /\b(rbi circular \d{4}\/\d+|fincen fin-\d{4}-[a-z0-9]+|fatf recommendation 99)\b/i,
];

const TRUSTED_SOURCE_KEYWORDS = [
  'fatf',
  'wolfsberg',
  'egmont',
  'basel',
  'fiu',
  'rbi',
  'fincen',
  'aml',
  'kyc',
  'sanction',
  'compliance',
];

export function validateCandidateQuestion(rawCandidate, existingHashes = new Set()) {
  const errors = [];

  if (!rawCandidate || typeof rawCandidate !== 'object' || Array.isArray(rawCandidate)) {
    return { valid: false, errors: ['Candidate must be a non-null object.'], question: null };
  }

  const statement = typeof rawCandidate.statement === 'string' ? rawCandidate.statement.trim() : '';
  const topic = typeof rawCandidate.topic === 'string' ? rawCandidate.topic.trim() : '';
  const difficulty =
    typeof rawCandidate.difficulty === 'string' && ALLOWED_DIFFICULTIES.includes(rawCandidate.difficulty.trim())
      ? rawCandidate.difficulty.trim()
      : 'Intermediate';
  const jurisdiction =
    typeof rawCandidate.jurisdiction === 'string' && rawCandidate.jurisdiction.trim().length > 0
      ? rawCandidate.jurisdiction.trim()
      : 'Global';

  if (statement.length < 35 || statement.length > 340) {
    errors.push('Statement must be between 35 and 340 characters.');
  }
  if (/\?/.test(statement)) {
    errors.push('Statement must be a declarative true/false statement, not a question.');
  }
  if (!ALLOWED_TOPICS.includes(topic)) {
    errors.push(`Unsupported topic "${topic}".`);
  }
  if (typeof rawCandidate.correct_answer !== 'boolean' && typeof rawCandidate.correctAnswer !== 'boolean') {
    errors.push('correct_answer must be an explicit boolean (true or false).');
  }

  const correctAnswer =
    typeof rawCandidate.correct_answer === 'boolean'
      ? rawCandidate.correct_answer
      : Boolean(rawCandidate.correctAnswer);

  const explanation =
    typeof rawCandidate.explanation === 'string' ? rawCandidate.explanation.trim() : '';
  if (explanation.length < 40) {
    errors.push('Explanation must provide substantive compliance reasoning (at least 40 characters).');
  }

  const sourceReferences =
    typeof rawCandidate.source_references === 'string'
      ? rawCandidate.source_references.trim()
      : typeof rawCandidate.sourceReference === 'string'
      ? rawCandidate.sourceReference.trim()
      : '';

  const lowerSource = sourceReferences.toLowerCase();
  const hasTrustedSource =
    sourceReferences.length >= 8 &&
    TRUSTED_SOURCE_KEYWORDS.some((kw) => lowerSource.includes(kw));
  if (!hasTrustedSource) {
    errors.push('Missing or unverified regulatory/compliance source reference.');
  }

  for (const pat of AMBIGUITY_PATTERNS) {
    if (pat.test(statement)) {
      errors.push(`Statement flagged for ambiguity (${pat.source}).`);
      break;
    }
  }

  const combinedText = `${statement} ${explanation} ${sourceReferences}`;
  for (const pat of UNSUPPORTED_LEGAL_CLAIM_PATTERNS) {
    if (pat.test(combinedText)) {
      errors.push(`Rejected potential unsupported legal/citation claim (${pat.source}).`);
      break;
    }
  }

  const contentHash = computeContentHash(statement, topic);
  if (existingHashes.has(contentHash)) {
    errors.push(`Duplicate content hash detected (${contentHash}).`);
  }

  if (errors.length > 0) {
    return { valid: false, errors, question: null };
  }

  const relatedNoteIndex = resolveRelatedNoteIndex(
    typeof rawCandidate.related_note_index === 'number'
      ? rawCandidate.related_note_index
      : rawCandidate.relatedNoteIndex,
    topic
  );

  const question = {
    id:
      typeof rawCandidate.id === 'string' && rawCandidate.id.trim().length > 0
        ? rawCandidate.id.trim()
        : `dkc-ai-${contentHash.slice(4, 14)}`,
    statement,
    topic,
    difficulty,
    jurisdiction,
    correct_answer: correctAnswer,
    explanation,
    source_references: sourceReferences,
    related_article_id:
      typeof rawCandidate.related_article_id === 'string' ? rawCandidate.related_article_id : null,
    related_note_index: relatedNoteIndex,
    related_article_title:
      typeof rawCandidate.related_article_title === 'string' && rawCandidate.related_article_title.trim()
        ? rawCandidate.related_article_title.trim()
        : 'AMLDecode Study Notes',
    content_hash: contentHash,
    // AI-generated questions start as pending_review until verified by a reviewer or automated check
    review_status: 'pending_review',
    publication_status: 'draft',
    created_at: new Date().toISOString(),
  };

  return { valid: true, errors: [], question };
}

export function validateBatchCandidates(candidates, existingHashes = new Set()) {
  const hashSet = new Set(existingHashes);
  const accepted = [];
  const rejected = [];

  const list = Array.isArray(candidates) ? candidates : [];
  for (const item of list) {
    const result = validateCandidateQuestion(item, hashSet);
    if (result.valid && result.question) {
      hashSet.add(result.question.content_hash);
      accepted.push(result.question);
    } else {
      rejected.push({
        candidate: item,
        reasons: result.errors,
      });
    }
  }

  return { accepted, rejected };
}
