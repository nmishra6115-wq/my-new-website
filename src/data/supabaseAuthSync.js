import { supabase } from '../supabaseClient';
import { loadPassportState, savePassportState } from './amlSkillPassportEngine';
import { upsertKt2Learner } from './kt2SupabaseSync';

const recentAuthLogMap = new Map();

function shouldRecordAuthEvent(email, eventType) {
  const key = `${email}:${eventType}`;
  const nowMs = Date.now();
  const prevMs = recentAuthLogMap.get(key) || 0;
  if (nowMs - prevMs < 4000) {
    return false;
  }
  recentAuthLogMap.set(key, nowMs);
  return true;
}

export function applyLearnerNameToPassport(name, email = '') {
  const cleanName = String(name || '').trim();
  const cleanEmail = String(email || '').trim().toLowerCase();
  if (!cleanName && !cleanEmail) return null;

  try {
    const current = loadPassportState({ name: cleanName, email: cleanEmail });
    const next = {
      ...current,
      profile: {
        ...(current.profile || {}),
        ...(cleanName ? { displayName: cleanName } : {}),
        ...(cleanEmail ? { email: cleanEmail } : {}),
      },
    };
    savePassportState(next);
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('amldecode:passport-updated', { detail: { state: next } }));
    }
    return next;
  } catch {
    return null;
  }
}

export async function recordAccountInSupabase({
  fullName,
  email,
  authUserId = null,
  eventType = 'session',
}) {
  const cleanEmail = String(email || '').trim().toLowerCase();
  const cleanName = String(fullName || '').trim() || cleanEmail.split('@')[0] || 'Learner';
  if (!cleanEmail) return null;

  await upsertKt2Learner({ name: cleanName, email: cleanEmail });

  if (!supabase) return null;
  try {
    const now = new Date().toISOString();
    const { data: existing } = await supabase
      .from('learner_accounts')
      .select('login_count, first_signed_up_at')
      .eq('email', cleanEmail)
      .maybeSingle();

    const shouldCountLogin =
      (eventType === 'signup' || eventType === 'login') &&
      shouldRecordAuthEvent(cleanEmail, eventType);

    const nextLoginCount =
      (Number(existing?.login_count) || 0) + (shouldCountLogin ? 1 : 0);

    const payload = {
      email: cleanEmail,
      full_name: cleanName,
      first_signed_up_at: existing?.first_signed_up_at || now,
      last_signed_in_at: now,
      login_count: nextLoginCount,
      updated_at: now,
      ...(authUserId ? { auth_user_id: authUserId } : {}),
    };

    const { data, error } = await supabase
      .from('learner_accounts')
      .upsert(payload, { onConflict: 'email' })
      .select()
      .maybeSingle();

    if (shouldCountLogin) {
      await supabase.from('auth_activity_logs').insert({
        email: cleanEmail,
        full_name: cleanName,
        auth_user_id: authUserId || null,
        event_type: eventType,
        created_at: now,
      });
    }

    if (error) return null;
    return data;
  } catch {
    return null;
  }
}

export async function signUpWithEmailPassword({ fullName, email, password }) {
  const cleanName = String(fullName || '').trim();
  const cleanEmail = String(email || '').trim().toLowerCase();
  const cleanPassword = String(password || '');

  if (!cleanName) {
    return { error: 'Please enter your full name so it appears on your certificate.' };
  }
  if (!cleanEmail || !cleanEmail.includes('@')) {
    return { error: 'Please enter a valid email address.' };
  }
  if (cleanPassword.length < 6) {
    return { error: 'Password must be at least 6 characters.' };
  }

  const { data, error } = await supabase.auth.signUp({
    email: cleanEmail,
    password: cleanPassword,
    options: {
      data: {
        full_name: cleanName,
        name: cleanName,
      },
    },
  });

  if (error) {
    const msg = String(error.message || '');
    if (/already registered|already exists|user already/i.test(msg)) {
      return { alreadyRegistered: true, email: cleanEmail };
    }
    return { error: msg || 'Unable to create account.' };
  }

  const user = data?.user || null;
  const isExistingUser = Boolean(user && Array.isArray(user.identities) && user.identities.length === 0);
  if (isExistingUser) {
    return { alreadyRegistered: true, email: cleanEmail };
  }

  await recordAccountInSupabase({
    fullName: cleanName,
    email: cleanEmail,
    authUserId: user?.id || null,
    eventType: 'signup',
  });
  applyLearnerNameToPassport(cleanName, cleanEmail);

  return {
    user,
    session: data?.session || null,
    needsEmailConfirmation: Boolean(user && !data?.session),
    profile: {
      id: user?.id || null,
      name: cleanName,
      email: cleanEmail,
      loggedInAt: new Date().toISOString(),
    },
  };
}

export async function requestPasswordResetEmail(email) {
  const cleanEmail = String(email || '').trim().toLowerCase();
  if (!cleanEmail || !cleanEmail.includes('@')) {
    return { error: 'Please enter your email address first so we can send a reset link.' };
  }
  if (!supabase?.auth?.resetPasswordForEmail) {
    return { error: 'Password reset service is unavailable in this environment.' };
  }
  const redirectTo = typeof window !== 'undefined' && window.location?.origin ? window.location.origin : undefined;
  const { error } = await supabase.auth.resetPasswordForEmail(
    cleanEmail,
    redirectTo ? { redirectTo } : undefined
  );
  if (error) {
    return { error: error.message || 'Unable to send password reset email.' };
  }
  return { sent: true };
}

export async function signInWithEmailPassword({ email, password, fullName = '' }) {
  const cleanEmail = String(email || '').trim().toLowerCase();
  const cleanPassword = String(password || '');

  if (!cleanEmail || !cleanEmail.includes('@')) {
    return { error: 'Please enter a valid email address.' };
  }
  if (!cleanPassword) {
    return { error: 'Please enter your password.' };
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email: cleanEmail,
    password: cleanPassword,
  });

  if (error) {
    const msg = String(error.message || '');
    if (/invalid login credentials/i.test(msg)) {
      return {
        error:
          'Invalid email or password. If you just signed up and email confirmation is enabled, confirm your email link first—or if this email already had an account, use its original password.',
      };
    }
    return { error: msg || 'Invalid email or password.' };
  }

  const user = data?.user || null;
  const resolvedName =
    String(fullName || '').trim() ||
    user?.user_metadata?.full_name ||
    user?.user_metadata?.name ||
    cleanEmail.split('@')[0] ||
    'Learner';

  await recordAccountInSupabase({
    fullName: resolvedName,
    email: cleanEmail,
    authUserId: user?.id || null,
    eventType: 'login',
  });
  applyLearnerNameToPassport(resolvedName, cleanEmail);

  return {
    user,
    session: data?.session || null,
    profile: {
      id: user?.id || null,
      name: resolvedName,
      email: cleanEmail,
      loggedInAt: new Date().toISOString(),
    },
  };
}

export async function signOutLearnerAccount() {
  try {
    await supabase.auth.signOut();
  } catch {
    // Ignore sign-out network errors
  }
}
