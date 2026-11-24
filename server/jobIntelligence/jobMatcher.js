import {
  extractJobSkills,
  FINCRIME_SKILL_TAXONOMY,
  inferJobSeniority,
  ROLE_TRACKS,
} from './skillTaxonomy.js';

const SENIORITY_RANK_BY_ID = {
  'entry-associate': 1,
  'analyst-specialist': 2,
  'senior-lead': 3,
};

function normalizeTokenList(list) {
  if (!Array.isArray(list)) return [];
  return list
    .map((item) => String(item || '').trim().toLowerCase())
    .filter(Boolean);
}

function scoreSkills(jobSkills, targetSkillIds) {
  const maxPoints = 40;
  const matchedLabels = jobSkills.map((s) => s.label);
  const jobSkillIds = new Set(jobSkills.map((s) => s.id));

  if (!targetSkillIds.length) {
    if (!jobSkills.length) {
      return { points: 16, matchedSkills: [], missingSkills: [], note: 'General role description' };
    }
    const points = Math.min(maxPoints, 16 + jobSkills.length * 6);
    return {
      points,
      matchedSkills: matchedLabels,
      missingSkills: [],
      note: `Covers ${matchedLabels.slice(0, 3).join(', ')}`,
    };
  }

  const matchedTargets = targetSkillIds.filter((id) => jobSkillIds.has(id));
  const missingTargets = targetSkillIds
    .filter((id) => !jobSkillIds.has(id))
    .map((id) => FINCRIME_SKILL_TAXONOMY.find((s) => s.id === id)?.label || id);

  const ratio = matchedTargets.length / targetSkillIds.length;
  const points = Math.round(ratio * maxPoints);

  return {
    points,
    matchedSkills: matchedTargets.map(
      (id) => FINCRIME_SKILL_TAXONOMY.find((s) => s.id === id)?.label || id
    ),
    missingSkills: missingTargets,
    note:
      matchedTargets.length > 0
        ? `Matches ${matchedTargets.length} of ${targetSkillIds.length} selected skills`
        : 'No selected skill tags explicitly listed in posting',
  };
}

function scoreRoleTrack(job, jobSkills, preferredTrackId) {
  const maxPoints = 25;
  if (!preferredTrackId || preferredTrackId === 'any') {
    return { points: 15, aligned: false, note: 'Open to any FinCrime track' };
  }

  const track = ROLE_TRACKS.find((t) => t.id === preferredTrackId);
  const titleAndDesc = `${job?.title || ''} ${job?.description || ''}`.trim();
  const keywordHit = track ? track.keywords.some((rx) => rx.test(titleAndDesc)) : false;
  const skillTrackHit = jobSkills.some((s) => s.trackId === preferredTrackId);

  if (keywordHit || skillTrackHit) {
    return {
      points: maxPoints,
      aligned: true,
      note: `Fits ${track?.label || preferredTrackId}`,
    };
  }

  return {
    points: 6,
    aligned: false,
    note: `Different focus from ${track?.label || preferredTrackId}`,
  };
}

function scoreLocationAndMode(job, profile) {
  const maxPoints = 20;
  const preferredCities = normalizeTokenList(profile?.preferredCities);
  const preferredMode = String(profile?.workMode || 'any').toLowerCase();

  const jobCity = String(job?.city || '').trim().toLowerCase();
  const jobDisplayLoc = String(job?.displayLocation || '').trim().toLowerCase();
  const jobMode = String(job?.remoteEligibility || 'unspecified').trim().toLowerCase();

  if (!preferredCities.length && preferredMode === 'any') {
    return { points: 12, note: job?.displayLocation || 'Location as listed' };
  }

  let cityMatched = false;
  if (preferredCities.length > 0) {
    cityMatched = preferredCities.some(
      (city) =>
        (jobCity && jobCity.includes(city)) ||
        (jobDisplayLoc && jobDisplayLoc.includes(city))
    );
  }

  const isRemoteRole = jobMode === 'remote';
  const modeMatched =
    preferredMode === 'any' ||
    jobMode === preferredMode ||
    (preferredMode === 'hybrid' && isRemoteRole);

  if (preferredCities.length > 0 && preferredMode !== 'any') {
    if (cityMatched && modeMatched) {
      return { points: maxPoints, note: `Matches ${job?.displayLocation || 'city'} and ${jobMode}` };
    }
    if (cityMatched || modeMatched || isRemoteRole) {
      return {
        points: 12,
        note: cityMatched
          ? `Matches city (${job?.displayLocation || 'listed'}); mode is ${jobMode}`
          : `Work mode (${jobMode}) fits preference`,
      };
    }
    return {
      points: 4,
      note: `Listed as ${job?.displayLocation || 'unspecified'} (${jobMode})`,
    };
  }

  if (preferredCities.length > 0) {
    if (cityMatched || isRemoteRole) {
      return {
        points: maxPoints,
        note: isRemoteRole ? 'Remote eligibility matches preference' : `Matches ${job?.displayLocation}`,
      };
    }
    return { points: 5, note: `Listed as ${job?.displayLocation || 'unspecified'}` };
  }

  if (modeMatched) {
    return { points: maxPoints, note: `Work mode (${jobMode}) aligns` };
  }

  return { points: 6, note: `Work mode listed as ${jobMode}` };
}

function scoreSeniority(job, preferredSeniorityId) {
  const maxPoints = 15;
  if (!preferredSeniorityId || preferredSeniorityId === 'any') {
    return { points: 9, note: 'Any experience level' };
  }

  const jobSen = inferJobSeniority(job);
  const prefRank = SENIORITY_RANK_BY_ID[preferredSeniorityId];

  if (!jobSen || !prefRank) {
    return { points: 8, note: 'Seniority not explicitly stated in title' };
  }

  const diff = Math.abs(jobSen.rank - prefRank);
  if (diff === 0) {
    return { points: maxPoints, note: 'Experience level aligns closely' };
  }
  if (diff === 1) {
    return { points: 9, note: 'Adjacent experience level' };
  }
  return { points: 3, note: 'Broader experience gap from target level' };
}

function getMatchTier(score) {
  if (score >= 80) return { id: 'strong', label: 'Strong Match' };
  if (score >= 55) return { id: 'good', label: 'Good Fit' };
  return { id: 'stretch', label: 'Partial / Stretch' };
}

export function scoreJobAgainstProfile(job, profile = {}) {
  const jobSkills = extractJobSkills(job);
  const targetSkillIds = Array.isArray(profile?.skills) ? profile.skills : [];

  const skillRes = scoreSkills(jobSkills, targetSkillIds);
  const trackRes = scoreRoleTrack(job, jobSkills, profile?.roleTrack);
  const locRes = scoreLocationAndMode(job, profile);
  const senRes = scoreSeniority(job, profile?.seniority);

  const totalScore = Math.max(
    0,
    Math.min(100, skillRes.points + trackRes.points + locRes.points + senRes.points)
  );
  const tier = getMatchTier(totalScore);

  const reasons = [
    skillRes.note,
    trackRes.note,
    locRes.note,
    senRes.note,
  ].filter(Boolean);

  return {
    score: totalScore,
    tier: tier.id,
    tierLabel: tier.label,
    breakdown: {
      skills: skillRes.points,
      roleTrack: trackRes.points,
      location: locRes.points,
      seniority: senRes.points,
    },
    matchedSkills: skillRes.matchedSkills,
    missingSkills: skillRes.missingSkills,
    reasons,
  };
}

function getFreshnessTimestamp(job) {
  const raw = job?.lastVerifiedAt || job?.firstSeenAt || job?.publishedAt || '';
  const ts = Date.parse(raw);
  return Number.isFinite(ts) ? ts : 0;
}

export function rankJobsForProfile(jobs, profile = {}) {
  if (!Array.isArray(jobs)) return [];

  return jobs
    .map((job) => ({
      ...job,
      match: scoreJobAgainstProfile(job, profile),
    }))
    .sort((a, b) => {
      if (b.match.score !== a.match.score) {
        return b.match.score - a.match.score;
      }
      return getFreshnessTimestamp(b) - getFreshnessTimestamp(a);
    });
}