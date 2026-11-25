import crypto from 'crypto';
import { INDIA_STATES_AND_UTS, ALTERNATIVE_CITY_SPELLINGS } from '../../src/data/indiaLocations.js';
import { buildInitialCareersJobs, ROLE_CATEGORIES } from '../../src/data/careersSeed.js';
import { scoreJobAgainstProfile } from '../../server/jobIntelligence/jobMatcher.js';

function normalizeStateAndCity(rawLocation = '', rawState = '', rawCity = '') {
  const combined = `${rawState} ${rawCity} ${rawLocation}`.toLowerCase();

  for (const [alias, mapped] of Object.entries(ALTERNATIVE_CITY_SPELLINGS)) {
    const escaped = alias.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    if (new RegExp(`\\b${escaped}\\b`, 'i').test(combined)) {
      return { state: mapped.state, city: mapped.city };
    }
  }

  for (const region of INDIA_STATES_AND_UTS) {
    for (const city of region.cities) {
      const escapedCity = city.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      if (new RegExp(`\\b${escapedCity}\\b`, 'i').test(combined)) {
        return { state: region.name, city };
      }
    }
    const escapedState = region.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    if (new RegExp(`\\b${escapedState}\\b`, 'i').test(combined)) {
      return { state: region.name, city: region.cities[0] || 'All' };
    }
  }

  return { state: 'All India', city: 'All' };
}

function buildDedupeKey(job) {
  const basis = [
    String(job.title || '').trim().toLowerCase(),
    String(job.employer || '').trim().toLowerCase(),
    String(job.state || '').trim().toLowerCase(),
    String(job.apply_url || '').trim().toLowerCase(),
  ].join('|');
  return crypto.createHash('sha256').update(basis).digest('hex');
}

async function fetchExternalStateJobs(stateName) {
  const feedUrl = process.env.JOB_FEED_API_URL;
  if (!feedUrl) return [];

  const url = new URL(feedUrl);
  url.searchParams.set('state', stateName);
  url.searchParams.set('query', 'AML KYC compliance financial crime transaction monitoring');

  const headers = { Accept: 'application/json' };
  if (process.env.JOB_FEED_API_KEY) {
    headers.Authorization = `Bearer ${process.env.JOB_FEED_API_KEY}`;
  }

  const res = await fetch(url.toString(), { headers });
  if (!res.ok) {
    throw new Error(`Feed fetch failed for ${stateName}: HTTP ${res.status}`);
  }
  const payload = await res.json();
  return Array.isArray(payload?.jobs) ? payload.jobs : Array.isArray(payload) ? payload : [];
}

async function enrichJobWithAi(job) {
  const baseMatch = scoreJobAgainstProfile(job, {
    targetRoleTrack: job.roleCategory,
    skills: job.skills || [],
  });
  const aiScore = Math.min(99, Math.max(45, Number(baseMatch?.score ?? 65)));
  const tags =
    Array.isArray(baseMatch?.matchedSkills) && baseMatch.matchedSkills.length > 0
      ? baseMatch.matchedSkills.slice(0, 4)
      : ['AML / KYC', 'Risk & Controls'];

  let aiSummary = `${job.roleCategory} opportunity at ${job.employer} in ${job.city}, ${job.state}.`;

  if (process.env.OPENAI_API_KEY) {
    try {
      const aiRes = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          temperature: 0.2,
          messages: [
            {
              role: 'system',
              content:
                'Summarize financial crime/AML/KYC job postings in one concise 18-word sentence for compliance analysts.',
            },
            {
              role: 'user',
              content: `Role: ${job.title}\nCompany: ${job.employer}\nLocation: ${job.city}, ${job.state}\nDetails: ${job.summary || ''}`,
            },
          ],
        }),
      });
      if (aiRes.ok) {
        const data = await aiRes.json();
        const text = data?.choices?.[0]?.message?.content?.trim();
        if (text) aiSummary = text;
      }
    } catch {
      // Fallback to deterministic summary if external AI call fails
    }
  }

  return { aiSummary, aiScore, tags };
}

async function supabaseRest(path, { method = 'GET', body } = {}) {
  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceKey) {
    throw new Error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  }

  const res = await fetch(`${supabaseUrl}/rest/v1/${path}`, {
    method,
    headers: {
      apikey: serviceKey,
      Authorization: `Bearer ${serviceKey}`,
      'Content-Type': 'application/json',
      Prefer:
        method === 'POST'
          ? 'resolution=merge-duplicates,return=representation'
          : 'return=representation',
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Supabase REST error (${res.status}): ${errText}`);
  }
  return res.json();
}

async function triggerExistingAlertFunction(payload) {
  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceKey) return { triggered: false };

  const fnUrl = `${supabaseUrl}/functions/v1/daily-job-alerts`;
  const res = await fetch(fnUrl, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${serviceKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`daily-job-alerts function error (${res.status}): ${errText}`);
  }

  return res.json().catch(() => ({ triggered: true }));
}

export default async function handler(req, res) {
  const authHeader = req.headers.authorization || '';
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret && authHeader !== `Bearer ${cronSecret}` && req.query?.secret !== cronSecret) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const todayIso = new Date().toISOString().slice(0, 10);
    const seedJobs = buildInitialCareersJobs();
    const stateCounts = {};
    const normalizedRows = [];

    for (const region of INDIA_STATES_AND_UTS) {
      const externalJobs = await fetchExternalStateJobs(region.name);
      const matchingSeed = seedJobs.filter((j) => {
        const loc = normalizeStateAndCity(j.location || '', j.state || '', j.city || '');
        return loc.state === region.name;
      });

      const combined = [...externalJobs, ...matchingSeed];
      let countForState = 0;

      for (const rawJob of combined) {
        const loc = normalizeStateAndCity(
          rawJob.location || '',
          rawJob.state || region.name,
          rawJob.city || ''
        );
        const stateName = loc.state === 'All India' ? region.name : loc.state;
        const cityName = loc.city === 'All' ? (region.cities[0] || 'All') : loc.city;
        const roleCategory = ROLE_CATEGORIES.includes(rawJob.roleCategory)
          ? rawJob.roleCategory
          : 'AML / Transaction Monitoring';

        const enriched = await enrichJobWithAi({
          ...rawJob,
          state: stateName,
          city: cityName,
          roleCategory,
        });

        const row = {
          dedupe_key: buildDedupeKey({
            title: rawJob.title,
            employer: rawJob.employer || rawJob.company || 'Financial Institution',
            state: stateName,
            apply_url: rawJob.apply_url || rawJob.url || 'https://amldecode.in/?view=jobs',
          }),
          title: String(rawJob.title || 'Compliance Analyst').trim(),
          employer: String(rawJob.employer || rawJob.company || 'Financial Institution').trim(),
          state: stateName,
          city: cityName,
          location_raw: rawJob.location || `${cityName}, ${stateName}`,
          role_category: roleCategory,
          role_track: rawJob.roleTrack || roleCategory,
          experience_band: rawJob.experience || '1-3 Years',
          work_mode: rawJob.workMode || 'Hybrid',
          salary_label: rawJob.salary || null,
          source_name:
            rawJob.source || (externalJobs.includes(rawJob) ? 'External Feed' : 'AMLDecode Seed'),
          apply_url: rawJob.apply_url || rawJob.url || 'https://amldecode.in/?view=jobs',
          summary: rawJob.summary || rawJob.description || '',
          ai_summary: enriched.aiSummary,
          ai_match_tags: enriched.tags,
          ai_relevance_score: enriched.aiScore,
          skills: Array.isArray(rawJob.skills) ? rawJob.skills : enriched.tags,
          fetched_date: todayIso,
          is_active: true,
        };

        normalizedRows.push(row);
        countForState += 1;
      }

      stateCounts[region.name] = countForState;
    }

    const upsertedJobs =
      normalizedRows.length > 0
        ? await supabaseRest('compliance_jobs?on_conflict=dedupe_key', {
            method: 'POST',
            body: normalizedRows,
          })
        : [];

    const alertResult = await triggerExistingAlertFunction({
      source: 'daily-state-jobs',
      date: todayIso,
      jobsCount: upsertedJobs.length,
    });

    return res.status(200).json({
      ok: true,
      date: todayIso,
      statesProcessed: INDIA_STATES_AND_UTS.length,
      jobsUpserted: upsertedJobs.length,
      alertResult,
      stateCounts,
    });
  } catch (err) {
    return res.status(500).json({
      ok: false,
      error: err instanceof Error ? err.message : 'Daily state jobs ingestion error',
    });
  }
}