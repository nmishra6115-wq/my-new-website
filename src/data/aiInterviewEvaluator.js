// Deterministic Rubric Evaluator + Optional Free-Tier AI Bridge + Dual Session Store
import { supabase } from '../supabaseClient';

const LOCAL_SESSIONS_KEY = 'amldecode_ai_interview_sessions_v1';
const GUEST_TOKEN_KEY = 'amldecode_ai_interview_guest_token';

export function getOrCreateGuestToken() {
  try {
    let token = localStorage.getItem(GUEST_TOKEN_KEY);
    if (!token) {
      token = 'guest_' + (crypto?.randomUUID ? crypto.randomUUID() : Date.now() + '_' + Math.random().toString(36).slice(2, 10));
      localStorage.setItem(GUEST_TOKEN_KEY, token);
    }
    return token;
  } catch {
    return 'guest_ephemeral_' + Date.now();
  }
}

export function evaluateAnswerDeterministically({ question, answerText, skipped = false, role = 'AML Analyst', company = 'Other Company' }) {
  const clean = (answerText || '').trim();
  if (skipped || clean.length === 0) {
    return {
      evaluationSource: 'deterministic_rubric',
      totalScore: 0,
      technicalAccuracy: 0,
      practicalApplication: 0,
      riskIdentification: 0,
      communicationClarity: 0,
      completeness: 0,
      strengths: ['Question skipped ? no penalty to your ability to review the model response below.'],
      missingPoints: (question.rubricConcepts || []).map((c) => c.label),
      improvements: [
        'Structure your response using: (1) core regulatory/AML definition, (2) investigation steps, and (3) risk escalation rationale.',
      ],
      suggestedAnswer: question.modelAnswer,
      followUpQuestion: question.followUpPrompt || null,
    };
  }

  const lower = clean.toLowerCase();
  const words = clean.split(/\s+/).filter(Boolean);
  const wordCount = words.length;
  const sentences = clean.split(/[.!?]+/).filter((s) => s.trim().length > 3);

  const concepts = question.rubricConcepts || [];
  const matched = [];
  const missing = [];

  for (const concept of concepts) {
    const hit = (concept.keywords || []).some((kw) => lower.includes(kw.toLowerCase()));
    if (hit) matched.push(concept);
    else missing.push(concept);
  }

  const coverageRatio = concepts.length > 0 ? matched.length / concepts.length : 0.6;

  // Dimension-specific concept ratio helper
  const dimScore = (dimName, baseFloor) => {
    const dimConcepts = concepts.filter((c) => c.dimension === dimName);
    if (dimConcepts.length === 0) return Math.round(baseFloor + coverageRatio * (95 - baseFloor));
    const dimHits = dimConcepts.filter((c) => matched.some((m) => m.id === c.id)).length;
    const ratio = dimHits / dimConcepts.length;
    return Math.min(100, Math.round(baseFloor + ratio * (100 - baseFloor)));
  };

  // Do not penalize minor grammar; reward clear structure & adequate depth
  const depthFactor = Math.min(1, wordCount / 55);
  const structureBonus = sentences.length >= 2 || /\b(first|second|third|1\.|2\.|3\.|finally|however|therefore)\b/i.test(clean) ? 12 : 4;

  const technicalAccuracy = dimScore('technical', wordCount >= 12 ? 32 : 15);
  const practicalApplication = dimScore('practical', wordCount >= 15 ? 30 : 12);
  const riskIdentification = dimScore('risk', wordCount >= 12 ? 30 : 12);
  const communicationClarity = Math.min(100, Math.round(45 + depthFactor * 38 + structureBonus));
  const completeness = Math.min(100, Math.round(coverageRatio * 75 + depthFactor * 25));

  // Weighted rubric: Technical 30%, Practical 25%, Risk 20%, Clarity 15%, Completeness 10%
  const totalScore = Math.round(
    technicalAccuracy * 0.30 +
    practicalApplication * 0.25 +
    riskIdentification * 0.20 +
    communicationClarity * 0.15 +
    completeness * 0.10
  );

  const strengths = matched.length > 0
    ? matched.map((m) => `Covered: ${m.label}`)
    : ['Provided an initial response attempting to address the compliance scenario.'];

  if (wordCount >= 45 && sentences.length >= 2) {
    strengths.push('Clear, structured explanation that communicates investigative reasoning well.');
  }

  const missingPoints = missing.length > 0
    ? missing.map((m) => m.label)
    : ['All core rubric concepts were addressed?consider adding specific documentation or escalation thresholds for distinction.'];

  const improvements = [];
  if (wordCount < 30) {
    improvements.push(`Expand your answer (currently ${wordCount} words) with concrete verification documents and escalation criteria expected for a ${role}.`);
  }
  if (missing.length > 0) {
    improvements.push(`Explicitly incorporate ${missing[0].label.toLowerCase()} to strengthen defensibility during QA or hiring manager review.`);
  }
  if (!/\b(escalat|sar|str|document|rationale|kyc|edd|threshold)\b/i.test(clean)) {
    improvements.push('Conclude with your concrete action step: what you document, what evidence you request, and when you escalate.');
  }
  if (improvements.length === 0) {
    improvements.push(`Strong response for a ${role} interview context (${company} simulated practice). Keep anchoring decisions to verifiable evidence.`);
  }

  return {
    evaluationSource: 'deterministic_rubric',
    totalScore,
    technicalAccuracy,
    practicalApplication,
    riskIdentification,
    communicationClarity,
    completeness,
    strengths,
    missingPoints,
    improvements,
    suggestedAnswer: question.modelAnswer,
    followUpQuestion: question.followUpPrompt || null,
  };
}

export async function evaluateInterviewAnswer({ question, answerText, skipped, role, experienceLevel, company }) {
  // Always compute deterministic baseline first (guaranteed ?0 and instant fallback)
  const baseline = evaluateAnswerDeterministically({ question, answerText, skipped, role, company });
  if (skipped || !answerText || answerText.trim().length < 15) {
    return baseline;
  }

  // Layer 3: Optional free-tier server evaluation with strict 6s timeout and safe fallback
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 6000);
    const res = await fetch('/api/interview/evaluate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-interview-session-token': getOrCreateGuestToken(),
      },
      body: JSON.stringify({
        questionCode: question.code,
        category: question.category,
        questionPrompt: question.prompt,
        modelAnswer: question.modelAnswer,
        answerText: answerText.slice(0, 2500),
        role,
        experienceLevel,
        company,
        baselineScores: {
          technicalAccuracy: baseline.technicalAccuracy,
          practicalApplication: baseline.practicalApplication,
          riskIdentification: baseline.riskIdentification,
          communicationClarity: baseline.communicationClarity,
          completeness: baseline.completeness,
        },
      }),
      signal: controller.signal,
    });
    clearTimeout(timer);

    if (!res.ok) return baseline;
    const data = await res.json();
    if (data && data.ok && data.evaluation) {
      return {
        ...baseline,
        ...data.evaluation,
        evaluationSource: data.evaluation.evaluationSource || 'free_tier_ai',
        suggestedAnswer: data.evaluation.suggestedAnswer || question.modelAnswer,
      };
    }
  } catch {
    // Seamless fallback to deterministic rubric
  }

  return baseline;
}

// --- Dual Session Persistence (LocalStorage + Optional Supabase Sync) ---
export function loadLocalSessions() {
  try {
    const raw = localStorage.getItem(LOCAL_SESSIONS_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveLocalSession(session) {
  try {
    const all = loadLocalSessions();
    const idx = all.findIndex((s) => s.id === session.id);
    const next = { ...session, updatedAt: new Date().toISOString() };
    if (idx >= 0) all[idx] = next;
    else all.unshift(next);
    // Minimal retention: keep latest 25 sessions in browser storage
    localStorage.setItem(LOCAL_SESSIONS_KEY, JSON.stringify(all.slice(0, 25)));
    return next;
  } catch {
    return session;
  }
}

export function deleteLocalSession(sessionId) {
  try {
    const all = loadLocalSessions().filter((s) => s.id !== sessionId);
    localStorage.setItem(LOCAL_SESSIONS_KEY, JSON.stringify(all));
  } catch {
    // ignore
  }
}

export async function syncSessionToSupabase(session) {
  try {
    if (!supabase) return;
    const guestToken = getOrCreateGuestToken();
    const { data: authData } = await supabase.auth.getUser();
    const userId = authData?.user?.id || null;

    await supabase.from('ai_interview_sessions').upsert(
      {
        id: session.id,
        user_id: userId,
        guest_session_token: userId ? null : guestToken,
        target_company: session.company,
        target_role: session.role,
        experience_level: session.experienceLevel,
        question_count: session.questionCount,
        status: session.status,
        current_question_index: session.currentIndex,
        elapsed_seconds: session.elapsedSeconds || 0,
        overall_score: session.overallScore ?? null,
        dimension_scores: session.dimensionScores || {},
        question_plan: (session.questions || []).map((q) => ({ code: q.code, category: q.category })),
        completed_at: session.completedAt || null,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'id' }
    );
  } catch {
    // Non-blocking: local session storage remains authoritative if table isn't migrated yet
  }
}
