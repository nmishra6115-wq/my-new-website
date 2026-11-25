import { supabase } from '../supabaseClient';

export async function upsertKt2Learner(profile) {
  if (!supabase || !profile?.email) return null;
  try {
    const now = new Date().toISOString();
    const { data, error } = await supabase.rpc('upsert_kt2_learner', {
      p_email: profile.email.trim().toLowerCase(),
      p_name: (profile.name || '').trim(),
      p_last_login_at: now,
      p_updated_at: now,
    });

    if (error) return null;
    if (Array.isArray(data)) return data[0] ?? null;
    return data ?? null;
  } catch {
    return null;
  }
}

export async function fetchKt2Attempts(learnerEmail, limit = 15) {
  if (!supabase || !learnerEmail) return null;
  try {
    const { data, error } = await supabase
      .from('kt2_attempts')
      .select('id, domain, difficulty, mode, score, total, created_at')
      .eq('learner_email', learnerEmail.trim().toLowerCase())
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error || !Array.isArray(data)) return null;
    return data.map((row) => ({
      id: row.id,
      domain: row.domain,
      difficulty: row.difficulty,
      mode: row.mode,
      score: row.score,
      total: row.total,
      completedAt: row.created_at,
    }));
  } catch {
    return null;
  }
}

export async function insertKt2Attempt(learner, attempt) {
  if (!supabase || !learner?.email || !attempt) return null;
  try {
    const { data, error } = await supabase
      .from('kt2_attempts')
      .insert({
        learner_email: learner.email.trim().toLowerCase(),
        learner_name: learner.name || 'Learner',
        domain: attempt.domain || 'AML/KYC',
        difficulty: attempt.difficulty || 'Intermediate',
        mode: attempt.mode || 'practice',
        score: Number(attempt.score ?? 0),
        total: Number(attempt.total ?? 0),
      })
      .select()
      .maybeSingle();

    if (error) return null;
    return data;
  } catch {
    return null;
  }
}

