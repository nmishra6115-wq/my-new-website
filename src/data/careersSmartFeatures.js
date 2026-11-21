import { INDIA_STATES_AND_UTS, normalizeIndiaLocation } from './indiaLocations';
import { ROLE_CATEGORIES } from './careersSeed';

const ALERTS_STORAGE_KEY = 'amldecode_careers_ai_alerts_v1';

export function parseSmartSearchHints(rawQuery = '') {
  const text = String(rawQuery || '').trim();
  if (!text) {
    return { inferredState: null, inferredCity: null, inferredRole: null, isRemoteMentioned: false };
  }

  const lower = text.toLowerCase();
  const isRemoteMentioned = /\bremote\b/i.test(lower);

  let inferredRole = null;
  for (const role of ROLE_CATEGORIES) {
    if (role === 'All Roles') continue;
    const token = role.split('/')[0].trim().toLowerCase();
    if (token && lower.includes(token)) {
      inferredRole = role;
      break;
    }
  }
  if (!inferredRole && lower.includes('fresher')) {
    inferredRole = 'All Roles';
  }

  let inferredState = null;
  let inferredCity = null;

  const loc = normalizeIndiaLocation(text, '');
  if (loc.state && INDIA_STATES_AND_UTS.some((s) => s.name === loc.state)) {
    inferredState = loc.state;
  }
  if (loc.city) {
    inferredCity = loc.city;
  }

  for (const region of INDIA_STATES_AND_UTS) {
    for (const c of region.cities) {
      if (lower.includes(c.toLowerCase())) {
        inferredCity = c;
        inferredState = region.name;
        break;
      }
    }
    if (inferredCity) break;
    if (lower.includes(region.name.toLowerCase())) {
      inferredState = region.name;
    }
  }

  return { inferredState, inferredCity, inferredRole, isRemoteMentioned };
}

export function computeRelevanceScore(job, filters = {}) {
  let score = 0;
  const q = String(filters.query || '').trim().toLowerCase();
  const titleLower = String(job.title || '').toLowerCase();
  const employerLower = String(job.employer || '').toLowerCase();
  const skillsLower = (job.skills || []).join(' ').toLowerCase();

  if (q) {
    if (titleLower.includes(q)) score += 50;
    if (skillsLower.includes(q)) score += 30;
    if (employerLower.includes(q)) score += 20;
    const terms = q.split(/\s+/).filter((t) => t.length > 2);
    for (const term of terms) {
      if (titleLower.includes(term)) score += 12;
      if (skillsLower.includes(term)) score += 8;
      if (String(job.city || '').toLowerCase().includes(term)) score += 10;
      if (String(job.state || '').toLowerCase().includes(term)) score += 8;
    }
  }

  if (filters.role && filters.role !== 'All Roles' && job.roleCategory === filters.role) {
    score += 25;
  }
  if (filters.city && filters.city !== 'All' && job.city === filters.city) {
    score += 20;
  } else if (filters.state && filters.state !== 'All India' && job.state === filters.state) {
    score += 12;
  }

  return score;
}

export function sortCareerJobs(jobs = [], sortBy = 'newest', filters = {}) {
  const list = [...(Array.isArray(jobs) ? jobs : [])];
  if (sortBy === 'relevance') {
    return list.sort((a, b) => {
      const diff = computeRelevanceScore(b, filters) - computeRelevanceScore(a, filters);
      if (diff !== 0) return diff;
      const aDate = Date.parse(a.publishedAt || a.firstSeenAt || 0) || 0;
      const bDate = Date.parse(b.publishedAt || b.firstSeenAt || 0) || 0;
      return bDate - aDate;
    });
  }

  return list.sort((a, b) => {
    const aDate = Date.parse(a.publishedAt || a.firstSeenAt || 0) || 0;
    const bDate = Date.parse(b.publishedAt || b.firstSeenAt || 0) || 0;
    return bDate - aDate;
  });
}

export function rankJobsForCareerMatch(jobs = [], prefs = {}) {
  const targetRole = String(prefs.targetRole || '').trim().toLowerCase();
  const preferredLocation = String(prefs.preferredLocation || '').trim().toLowerCase();
  const workArrangement = String(prefs.workArrangement || 'All');
  const requestedSkills = String(prefs.skills || '')
    .split(',')
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);

  return (Array.isArray(jobs) ? jobs : [])
    .map((job) => {
      let matchPoints = 0;
      const reasons = [];
      const titleLower = String(job.title || '').toLowerCase();
      const catLower = String(job.roleCategory || '').toLowerCase();
      const jobSkillsLower = (job.skills || []).map((s) => s.toLowerCase());

      if (targetRole && (titleLower.includes(targetRole) || catLower.includes(targetRole))) {
        matchPoints += 40;
        reasons.push(`Aligns with target role "${prefs.targetRole}"`);
      }

      if (preferredLocation && preferredLocation !== 'all india') {
        const locStr = `${job.city || ''} ${job.state || ''} ${job.displayLocation || ''}`.toLowerCase();
        if (locStr.includes(preferredLocation)) {
          matchPoints += 30;
          reasons.push(`Matches location preference "${prefs.preferredLocation}"`);
        }
      }

      if (workArrangement !== 'All') {
        if (workArrangement === 'Remote' && job.remoteEligibility === 'remote') {
          matchPoints += 20;
          reasons.push('Matches Remote work arrangement');
        } else if (workArrangement === 'Onsite / Office' && job.remoteEligibility !== 'remote') {
          matchPoints += 10;
          reasons.push('Non-remote / office location listing');
        }
      }

      const matchedSkillList = requestedSkills.filter((reqSkill) =>
        jobSkillsLower.some((js) => js.includes(reqSkill)) || titleLower.includes(reqSkill)
      );
      if (matchedSkillList.length > 0) {
        matchPoints += matchedSkillList.length * 15;
        reasons.push(`Matches skills: ${matchedSkillList.join(', ')}`);
      }

      if (reasons.length === 0) {
        reasons.push('Active financial-crime / compliance vacancy in verified feed');
      }

      return {
        job,
        matchPoints,
        reasons,
      };
    })
    .sort((a, b) => b.matchPoints - a.matchPoints);
}

export function readStoredAlerts() {
  try {
    const raw = window.localStorage.getItem(ALERTS_STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function writeStoredAlerts(alerts) {
  try {
    window.localStorage.setItem(ALERTS_STORAGE_KEY, JSON.stringify(alerts));
  } catch {
    // Ignore storage quota errors
  }
}
