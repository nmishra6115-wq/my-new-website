import { validateBatchCandidates, ALLOWED_TOPICS } from '../src/data/dkcValidator.js';

const getServerEnv = () => globalThis.process?.env || {};

const RESPONSE_SCHEMA = {
  type: 'ARRAY',
  items: {
    type: 'OBJECT',
    properties: {
      statement: { type: 'STRING' },
      topic: { type: 'STRING' },
      difficulty: { type: 'STRING' },
      jurisdiction: { type: 'STRING' },
      correct_answer: { type: 'BOOLEAN' },
      explanation: { type: 'STRING' },
      source_references: { type: 'STRING' },
      related_article_title: { type: 'STRING' },
    },
    required: [
      'statement',
      'topic',
      'difficulty',
      'jurisdiction',
      'correct_answer',
      'explanation',
      'source_references',
    ],
  },
};

export async function generateValidatedDailyChallengeBatch({
  topic = 'AML',
  count = 5,
  existingHashes = new Set(),
  apiKey = getServerEnv().GEMINI_API_KEY,
  fetchImpl = globalThis.fetch,
}) {
  if (!apiKey || typeof apiKey !== 'string' || apiKey.trim().length === 0) {
    return {
      ok: false,
      error: 'Server GEMINI_API_KEY is not configured.',
      accepted: [],
      rejected: [],
    };
  }

  const env = getServerEnv();
  const modelName = env.GEMINI_DKC_MODEL || 'gemini-2.5-flash';
  const safeTopic = ALLOWED_TOPICS.includes(topic) ? topic : 'AML';
  const safeCount = Math.min(Math.max(Number(count) || 5, 1), 15);

  const prompt = [
    `Generate ${safeCount} unambiguous True/False compliance challenge statements on topic "${safeTopic}".`,
    'Cover AML, KYC/CDD/EDD/UBO/PEP, Transaction Monitoring (structuring, funnel/mule accounts, alert triage), SAR/STR narratives, or Sanctions/PEP screening.',
    'Rules:',
    '- Each statement must be a clear, single declarative statement (no question marks, no vague words like "probably" or "maybe").',
    '- Base reasoning and source_references on established compliance frameworks (FATF Recommendations/Typologies, Wolfsberg Group, Egmont Group, Basel Committee).',
    '- Do NOT invent obscure circular numbers or unverified legal claims.',
    '- Return strictly valid JSON matching the schema.',
  ].join('\n');

  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(
    modelName
  )}:generateContent?key=${encodeURIComponent(apiKey.trim())}`;

  try {
    const response = await fetchImpl(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.4,
          responseMimeType: 'application/json',
          responseSchema: RESPONSE_SCHEMA,
        },
      }),
    });

    if (!response.ok) {
      return {
        ok: false,
        error: `Gemini API responded with status ${response.status}.`,
        accepted: [],
        rejected: [],
      };
    }

    const payload = await response.json();
    const rawText =
      payload?.candidates?.[0]?.content?.parts?.[0]?.text || '';

    let parsedCandidates;
    try {
      parsedCandidates = JSON.parse(rawText);
    } catch {
      return {
        ok: false,
        error: 'Gemini response was not valid JSON.',
        accepted: [],
        rejected: [],
      };
    }

    const { accepted, rejected } = validateBatchCandidates(parsedCandidates, existingHashes);
    return {
      ok: true,
      model: modelName,
      accepted,
      rejected,
    };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : 'Unexpected error calling Gemini API.',
      accepted: [],
      rejected: [],
    };
  }
}
