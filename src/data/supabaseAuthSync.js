import { supabase } from '../supabaseClient';
import { loadPassportState, savePassportState } from './amlSkillPassportEngine';
import { upsertKt2Learner } from './kt2SupabaseSync';

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

export async function recordAccountInSupabase({ fullName, email, authUserId = null }) {
  const cleanEmail = String(email || '').trim().toLowerCase();
  const cleanName = String(fullName || '').trim() || cleanEmail.split('@')[0] || 'Learner';
  if (!cleanEmail) return null;

  await upsertKt2Learner({ name: cleanName, email: cleanEmail });

  if (!supabase) return null;
  try {
    const now = new Date().toISOString();
    const payload = {
      email: cleanEmail,
      full_name: cleanName,
      last_signed_in_at: now,
      updated_at: now,
      ...(authUserId ? { auth_user_id: authUserId } : {}),
    };
    const { data, error } = await supabase
      .from('learner_accounts')
      .upsert(payload, { onConflict: 'email' })
      .select()
      .maybeSingle();

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
    return { error: error.message || 'Unable to create account.' };
  }

  const user = data?.user || null;
  await recordAccountInSupabase({
    fullName: cleanName,
    email: cleanEmail,
    authUserId: user?.id || null,
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
    return { error: error.message || 'Invalid email or password.' };
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
