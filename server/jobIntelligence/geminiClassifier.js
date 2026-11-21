import {
  REQUIRED_FINCRIME_DOMAINS,
  classifyDeterministicDomains,
  validateStructuredClassification,
} from './schemaAndClassifier.js';

const DEFAULT_GEMINI_MODEL = 'gemini-2.5-flash';
const MAX_BATCH_PER_RUN = 15;

export async function classifyJobBatchServerSide(jobs = [], options = {}) {
  const list = Array.isArray(jobs) ? jobs : [];
  const apiKey = options.apiKey || (typeof process !== 'undefined' ? process.env?.GEMINI_API_KEY : '');
  const model = options.model || DEFAULT_GEMINI_MODEL;
  const fetchImpl = options.fetchImpl || globalThis.fetch;

  if (!apiKey || typeof fetchImpl !== 'function') {
    return list.map((job) => {
      const det = classifyDeterministicDomains(job);
      return {
        ...job,
        roleCategory: job.roleCategory || det.roleCategory,
        domainTags: det.domainTags,
        classificationProvider: 'deterministic_rules',
        classificationModel: null,
      };
    });
  }

  const batchToClassify = list.slice(0, MAX_BATCH_PER_RUN);
  const overflowJobs = list.slice(MAX_BATCH_PER_RUN).map((job) => {
    const det = classifyDeterministicDomains(job);
    return {
      ...job,
      roleCategory: job.roleCategory || det.roleCategory,
      domainTags: det.domainTags,
      classificationProvider: 'deterministic_rules',
      classificationModel: null,
    };
  });

  const promptPayload = batchToClassify.map((j, index) => ({
    index,
    title: j.title,
    employer: j.employer,
    location: j.displayLocation || j.rawLocation || '',
    descriptionSnippet: String(j.description || '').slice(0, 600),
  }));

  try {
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(
      model
    )}:generateContent?key=${encodeURIComponent(apiKey)}`;

    const response = await fetchImpl(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [
          {
            role: 'user',
            parts: [
              {
                text: `Classify each financial-crime/compliance job into allowed domains (${REQUIRED_FINCRIME_DOMAINS.join(
                  ', '
                )}). Do not invent salary, dates, experience, or location. Return JSON array of objects with { index, isRelevant, roleCategory, domainTags, remoteEligibility, skills }.\n${JSON.stringify(
                  promptPayload
                )}`,
              },
            ],
          },
        ],
        generationConfig: {
          responseMimeType: 'application/json',
          temperature: 0.1,
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`gemini_http_${response.status}`);
    }

    const data = await response.json();
    const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text || '[]';
    const parsedList = JSON.parse(rawText);
    const byIndex = new Map(
      Array.isArray(parsedList) ? parsedList.map((item) => [item?.index, item]) : []
    );

    const classifiedBatch = batchToClassify.map((job, idx) => {
      const det = classifyDeterministicDomains(job);
      const candidate = byIndex.get(idx);
      const checked = validateStructuredClassification(candidate);

      if (!checked.valid) {
        return {
          ...job,
          roleCategory: job.roleCategory || det.roleCategory,
          domainTags: det.domainTags,
          classificationProvider: 'deterministic_fallback',
          classificationModel: null,
        };
      }

      return {
        ...job,
        roleCategory: checked.value.roleCategory,
        domainTags: checked.value.domainTags,
        remoteEligibility:
          job.remoteEligibility && job.remoteEligibility !== 'unspecified'
            ? job.remoteEligibility
            : checked.value.remoteEligibility,
        skills:
          Array.isArray(job.skills) && job.skills.length > 0 ? job.skills : checked.value.skills,
        classificationProvider: 'gemini',
        classificationModel: model,
      };
    });

    return [...classifiedBatch, ...overflowJobs];
  } catch {
    return list.map((job) => {
      const det = classifyDeterministicDomains(job);
      return {
        ...job,
        roleCategory: job.roleCategory || det.roleCategory,
        domainTags: det.domainTags,
        classificationProvider: 'deterministic_fallback',
        classificationModel: null,
      };
    });
  }
}
