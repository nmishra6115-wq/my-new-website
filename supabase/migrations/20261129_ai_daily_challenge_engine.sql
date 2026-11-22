-- ============================================================================
-- AMLDecode AI Daily Intelligence Challenge Engine ? Additive Schema (?0 Budget)
-- Migration: 20261129_ai_daily_challenge_engine.sql
-- Preserves 20261121_dkc_phase_c.sql tables without dropping or altering them.
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Extend existing dkc_questions with optional key learning points & guidance fields if missing
ALTER TABLE IF EXISTS public.dkc_questions
  ADD COLUMN IF NOT EXISTS key_learning_points JSONB NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS analyst_takeaway TEXT,
  ADD COLUMN IF NOT EXISTS practical_application TEXT,
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW();

-- 1. User Gamification & Streak Stats (keyed by actor_key: e.g., learner:<email> or anon:<token>)
CREATE TABLE IF NOT EXISTS public.dkc_user_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_key TEXT UNIQUE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  total_xp INTEGER NOT NULL DEFAULT 0 CHECK (total_xp >= 0),
  weekly_xp INTEGER NOT NULL DEFAULT 0 CHECK (weekly_xp >= 0),
  monthly_xp INTEGER NOT NULL DEFAULT 0 CHECK (monthly_xp >= 0),
  current_streak INTEGER NOT NULL DEFAULT 0 CHECK (current_streak >= 0),
  longest_streak INTEGER NOT NULL DEFAULT 0 CHECK (longest_streak >= 0),
  last_completed_date_ist DATE,
  total_completed INTEGER NOT NULL DEFAULT 0 CHECK (total_completed >= 0),
  total_correct INTEGER NOT NULL DEFAULT 0 CHECK (total_correct >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_dkc_user_stats_total_xp ON public.dkc_user_stats(total_xp DESC);
CREATE INDEX IF NOT EXISTS idx_dkc_user_stats_weekly_xp ON public.dkc_user_stats(weekly_xp DESC);
CREATE INDEX IF NOT EXISTS idx_dkc_user_stats_monthly_xp ON public.dkc_user_stats(monthly_xp DESC);

-- 2. Idempotent XP Ledger (prevents duplicate XP awards)
CREATE TABLE IF NOT EXISTS public.dkc_xp_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_key TEXT NOT NULL,
  idempotency_key TEXT UNIQUE NOT NULL,
  reason_code TEXT NOT NULL CHECK (reason_code IN (
    'daily_correct_answer',
    'daily_completion',
    'streak_7_day_milestone',
    'streak_30_day_milestone'
  )),
  xp_delta INTEGER NOT NULL CHECK (xp_delta >= 0 AND xp_delta <= 1000),
  challenge_date_ist DATE NOT NULL,
  question_id TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_dkc_xp_tx_actor_date ON public.dkc_xp_transactions(actor_key, challenge_date_ist DESC);

-- 3. Achievement Definitions
CREATE TABLE IF NOT EXISTS public.dkc_achievements (
  code TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  badge_label TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO public.dkc_achievements (code, title, description, badge_label)
VALUES
  ('first_challenge', 'First Challenge Completed', 'Completed your first Daily Intelligence Challenge.', 'First Step'),
  ('streak_7_days', 'Seven-Day Streak', 'Completed challenges on 7 consecutive IST days.', '7-Day Streak'),
  ('streak_30_days', 'Thirty-Day Streak', 'Completed challenges on 30 consecutive IST days.', '30-Day Streak'),
  ('correct_10', '10 Correct Answers', 'Answered 10 Daily Intelligence Challenges accurately.', '10 Correct'),
  ('correct_50', '50 Correct Answers', 'Answered 50 Daily Intelligence Challenges accurately.', '50 Correct'),
  ('tm_explorer', 'Transaction Monitoring Explorer', 'Answered Transaction Monitoring or Structuring/Mule challenges accurately.', 'TM Explorer'),
  ('sanctions_builder', 'Sanctions Knowledge Builder', 'Answered Sanctions or PEP Screening challenges accurately.', 'Sanctions Builder'),
  ('aml_champion', 'AML Challenge Champion', 'Earned 500+ total XP across Daily Intelligence Challenges.', 'AML Champion')
ON CONFLICT (code) DO NOTHING;

-- 4. Unlocked User Achievements
CREATE TABLE IF NOT EXISTS public.dkc_user_achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_key TEXT NOT NULL,
  achievement_code TEXT NOT NULL REFERENCES public.dkc_achievements(code) ON DELETE CASCADE,
  unlocked_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (actor_key, achievement_code)
);

CREATE INDEX IF NOT EXISTS idx_dkc_user_achievements_actor ON public.dkc_user_achievements(actor_key);

-- 5. Opt-In Public Leaderboard Profiles (No email, phone, or auth identifiers stored here)
CREATE TABLE IF NOT EXISTS public.dkc_public_profiles (
  actor_key TEXT PRIMARY KEY,
  display_name TEXT NOT NULL CHECK (char_length(trim(display_name)) BETWEEN 2 AND 40),
  opted_in BOOLEAN NOT NULL DEFAULT FALSE,
  featured_badge TEXT NOT NULL DEFAULT 'First Step',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_dkc_public_profiles_opted_in ON public.dkc_public_profiles(opted_in);

-- 6. Generation, Scheduler & Admin Audit Logs
CREATE TABLE IF NOT EXISTS public.dkc_generation_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date_ist DATE NOT NULL,
  topic TEXT NOT NULL,
  log_level TEXT NOT NULL DEFAULT 'info' CHECK (log_level IN ('info', 'warn', 'error', 'alert')),
  event_code TEXT NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_dkc_generation_logs_date ON public.dkc_generation_logs(date_ist DESC, created_at DESC);

-- 7. Admin Automation Controls (pause auto-publish, custom rotation, etc.)
CREATE TABLE IF NOT EXISTS public.dkc_admin_controls (
  id INTEGER PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  auto_publish_paused BOOLEAN NOT NULL DEFAULT FALSE,
  custom_rotation_json JSONB,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO public.dkc_admin_controls (id, auto_publish_paused)
VALUES (1, FALSE)
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- Row Level Security (RLS)
-- ============================================================================
ALTER TABLE public.dkc_user_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dkc_xp_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dkc_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dkc_user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dkc_public_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dkc_generation_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dkc_admin_controls ENABLE ROW LEVEL SECURITY;

-- Public read for achievement definitions
DROP POLICY IF EXISTS "Public read dkc_achievements" ON public.dkc_achievements;
CREATE POLICY "Public read dkc_achievements"
  ON public.dkc_achievements FOR SELECT
  USING (TRUE);

-- Opt-in leaderboard read access only when opted_in = true
DROP POLICY IF EXISTS "Public read opted-in leaderboard profiles" ON public.dkc_public_profiles;
CREATE POLICY "Public read opted-in leaderboard profiles"
  ON public.dkc_public_profiles FOR SELECT
  USING (opted_in = TRUE);

DROP POLICY IF EXISTS "Users manage own leaderboard opt-in" ON public.dkc_public_profiles;
CREATE POLICY "Users manage own leaderboard opt-in"
  ON public.dkc_public_profiles FOR ALL
  USING (actor_key = COALESCE(current_setting('request.headers', true)::json->>'x-dkc-actor-key', ''))
  WITH CHECK (actor_key = COALESCE(current_setting('request.headers', true)::json->>'x-dkc-actor-key', ''));

-- User stats & achievements scoped to actor header
DROP POLICY IF EXISTS "Users read own dkc_user_stats" ON public.dkc_user_stats;
CREATE POLICY "Users read own dkc_user_stats"
  ON public.dkc_user_stats FOR SELECT
  USING (actor_key = COALESCE(current_setting('request.headers', true)::json->>'x-dkc-actor-key', ''));

DROP POLICY IF EXISTS "Users read own dkc_user_achievements" ON public.dkc_user_achievements;
CREATE POLICY "Users read own dkc_user_achievements"
  ON public.dkc_user_achievements FOR SELECT
  USING (actor_key = COALESCE(current_setting('request.headers', true)::json->>'x-dkc-actor-key', ''));

-- Restrict XP ledger, generation logs, and admin controls from direct unprivileged client writes
DROP POLICY IF EXISTS "No direct client read on xp transactions" ON public.dkc_xp_transactions;
CREATE POLICY "No direct client read on xp transactions"
  ON public.dkc_xp_transactions FOR SELECT
  USING (FALSE);

DROP POLICY IF EXISTS "No direct client read on generation logs" ON public.dkc_generation_logs;
CREATE POLICY "No direct client read on generation logs"
  ON public.dkc_generation_logs FOR SELECT
  USING (FALSE);

DROP POLICY IF EXISTS "No direct client read on admin controls" ON public.dkc_admin_controls;
CREATE POLICY "No direct client read on admin controls"
  ON public.dkc_admin_controls FOR SELECT
  USING (FALSE);
