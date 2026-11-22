-- AMLDecode Skill Passport Migration (Add-Only, Idempotent)
-- Target: Supabase PostgreSQL within ?0/month free tier.

create extension if not exists pgcrypto;

-- 1. Core Skill Passport Profile (Private by default)
create table if not exists public.skill_passport_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid unique,
  learner_email text unique,
  display_name text not null default 'AMLDecode Learner',
  avatar_url text,
  bio text not null default '',
  is_public boolean not null default false,
  total_xp integer not null default 0 check (total_xp >= 0),
  current_level integer not null default 1 check (current_level between 1 and 10),
  level_title text not null default 'AML Foundation Explorer',
  assessments_completed integer not null default 0 check (assessments_completed >= 0),
  total_scored_questions integer not null default 0 check (total_scored_questions >= 0),
  total_correct_answers integer not null default 0 check (total_correct_answers >= 0),
  current_streak_days integer not null default 0 check (current_streak_days >= 0),
  longest_streak_days integer not null default 0 check (longest_streak_days >= 0),
  last_active_ist_date date,
  member_since timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 2. Idempotent Activity Events (Cross-feature completion log)
create table if not exists public.skill_passport_activity_events (
  id uuid primary key default gen_random_uuid(),
  passport_id uuid not null references public.skill_passport_profiles(id) on delete cascade,
  source_feature text not null check (
    source_feature in (
      'daily_challenge',
      'knowledge_test',
      'ai_interview',
      'transaction_investigation',
      'sar_practice',
      'learning_modules',
      'smart_flashcards'
    )
  ),
  external_event_id text not null,
  category_key text not null check (
    category_key in (
      'aml_fundamentals',
      'kyc_cdd_edd',
      'transaction_monitoring',
      'sanctions_screening',
      'sar_str',
      'kyb_ubo',
      'financial_crime_investigation',
      'risk_assessment'
    )
  ),
  questions_answered integer not null default 0 check (questions_answered >= 0),
  correct_answers integer not null default 0 check (correct_answers >= 0),
  score_percent numeric(5,2) not null default 0 check (score_percent between 0 and 100),
  xp_awarded integer not null default 0 check (xp_awarded >= 0),
  occurred_ist_date date not null default ((now() at time zone 'Asia/Kolkata')::date),
  evidence_ref text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  constraint uq_passport_event unique (passport_id, source_feature, external_event_id)
);

-- 3. Category Skill Intelligence Scores (0 - 100 educational indicator)
create table if not exists public.skill_passport_category_scores (
  id uuid primary key default gen_random_uuid(),
  passport_id uuid not null references public.skill_passport_profiles(id) on delete cascade,
  category_key text not null check (
    category_key in (
      'aml_fundamentals',
      'kyc_cdd_edd',
      'transaction_monitoring',
      'sanctions_screening',
      'sar_str',
      'kyb_ubo',
      'financial_crime_investigation',
      'risk_assessment'
    )
  ),
  category_label text not null,
  skill_score numeric(5,2) not null default 0 check (skill_score between 0 and 100),
  activities_count integer not null default 0 check (activities_count >= 0),
  questions_count integer not null default 0 check (questions_count >= 0),
  correct_count integer not null default 0 check (correct_count >= 0),
  updated_at timestamptz not null default now(),
  constraint uq_passport_category unique (passport_id, category_key)
);

-- 4. Badge Definitions (Database-driven rules & thresholds)
create table if not exists public.skill_passport_badge_definitions (
  badge_code text primary key,
  name text not null,
  description text not null,
  icon text not null default 'Award',
  category text not null check (
    category in ('knowledge', 'investigation', 'consistency', 'interview', 'advanced')
  ),
  criteria_summary text not null,
  rule_config jsonb not null default '{}'::jsonb,
  xp_bonus integer not null default 0 check (xp_bonus >= 0),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 5. Earned User Badges
create table if not exists public.skill_passport_user_badges (
  id uuid primary key default gen_random_uuid(),
  passport_id uuid not null references public.skill_passport_profiles(id) on delete cascade,
  badge_code text not null references public.skill_passport_badge_definitions(badge_code) on delete restrict,
  verification_status text not null default 'verified_platform_achievement',
  evidence_refs jsonb not null default '[]'::jsonb,
  awarded_at timestamptz not null default now(),
  revoked_at timestamptz,
  revoked_reason text,
  constraint uq_passport_badge unique (passport_id, badge_code)
);

-- 6. XP Ledger (Append-only / auditable XP movements)
create table if not exists public.skill_passport_xp_ledger (
  id uuid primary key default gen_random_uuid(),
  passport_id uuid not null references public.skill_passport_profiles(id) on delete cascade,
  event_id uuid references public.skill_passport_activity_events(id) on delete set null,
  badge_code text references public.skill_passport_badge_definitions(badge_code) on delete set null,
  xp_delta integer not null,
  reason text not null,
  created_at timestamptz not null default now()
);

-- 7. Public Verification Shares (Opt-in, unpredictable token, revocable)
create table if not exists public.skill_passport_public_shares (
  id uuid primary key default gen_random_uuid(),
  passport_id uuid not null references public.skill_passport_profiles(id) on delete cascade,
  user_badge_id uuid references public.skill_passport_user_badges(id) on delete cascade,
  public_token text not null unique default encode(gen_random_bytes(24), 'hex'),
  public_display_name text not null,
  is_public boolean not null default true,
  revoked_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint uq_share_per_badge unique (passport_id, user_badge_id)
);

-- 8. Cached Recommendations
create table if not exists public.skill_passport_recommendations (
  id uuid primary key default gen_random_uuid(),
  passport_id uuid not null unique references public.skill_passport_profiles(id) on delete cascade,
  weakest_category text,
  recommended_items jsonb not null default '[]'::jsonb,
  generated_at timestamptz not null default now(),
  expires_at timestamptz not null default (now() + interval '24 hours')
);

-- 9. Audit Logs (Admin & security/error observability)
create table if not exists public.skill_passport_audit_logs (
  id uuid primary key default gen_random_uuid(),
  passport_id uuid references public.skill_passport_profiles(id) on delete set null,
  actor_type text not null default 'system',
  actor_ref text,
  action text not null,
  status text not null default 'ok',
  details jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

-- Indexes for fast lookups
create index if not exists idx_sp_events_passport_date on public.skill_passport_activity_events (passport_id, occurred_ist_date desc);
create index if not exists idx_sp_events_category on public.skill_passport_activity_events (passport_id, category_key);
create index if not exists idx_sp_scores_passport on public.skill_passport_category_scores (passport_id);
create index if not exists idx_sp_badges_passport on public.skill_passport_user_badges (passport_id);
create index if not exists idx_sp_shares_token on public.skill_passport_public_shares (public_token) where is_public = true and revoked_at is null;
create index if not exists idx_sp_audit_created on public.skill_passport_audit_logs (created_at desc);

-- Seed Default Achievement Badge Definitions (Idempotent)
insert into public.skill_passport_badge_definitions
  (badge_code, name, description, icon, category, criteria_summary, rule_config, xp_bonus, is_active)
values
  ('aml_foundation_explorer', 'AML Foundation Explorer', 'Completed 10 AML fundamentals questions with at least 80% accuracy on AMLDecode.', 'ShieldCheck', 'knowledge', '10+ AML fundamentals questions with >= 80% accuracy', '{"type":"category_accuracy","category":"aml_fundamentals","minQuestions":10,"minAccuracy":80}'::jsonb, 50, true),
  ('kyc_knowledge_builder', 'KYC Knowledge Builder', 'Completed 15 KYC/CDD questions with at least 80% accuracy on AMLDecode.', 'UserCheck', 'knowledge', '15+ KYC/CDD/EDD questions with >= 80% accuracy', '{"type":"category_accuracy","category":"kyc_cdd_edd","minQuestions":15,"minAccuracy":80}'::jsonb, 75, true),
  ('sanctions_screening_explorer', 'Sanctions Screening Explorer', 'Completed 15 sanctions screening questions with at least 80% accuracy on AMLDecode.', 'GlobeLock', 'knowledge', '15+ sanctions screening questions with >= 80% accuracy', '{"type":"category_accuracy","category":"sanctions_screening","minQuestions":15,"minAccuracy":80}'::jsonb, 75, true),
  ('tm_practitioner', 'Transaction Monitoring Practitioner', 'Completed 5 simulated investigation cases with an average score of at least 80%.', 'Activity', 'investigation', '5+ investigation cases with >= 80% average score', '{"type":"feature_avg","source":"transaction_investigation","minCount":5,"minAvgScore":80}'::jsonb, 100, true),
  ('sar_narrative_practitioner', 'SAR Narrative Practitioner', 'Completed 3 SAR practice assessments with an average score of at least 80%.', 'FileText', 'investigation', '3+ SAR practice assessments with >= 80% average score', '{"type":"feature_avg","source":"sar_practice","minCount":3,"minAvgScore":80}'::jsonb, 100, true),
  ('streak_7_day', '7-Day Learning Streak', 'Completed an eligible AMLDecode learning activity on 7 consecutive IST calendar days.', 'Flame', 'consistency', '7 consecutive IST calendar days of activity', '{"type":"streak_days","days":7}'::jsonb, 100, true),
  ('streak_30_day', '30-Day Learning Streak', 'Completed an eligible AMLDecode learning activity on 30 consecutive IST calendar days.', 'Trophy', 'consistency', '30 consecutive IST calendar days of activity', '{"type":"streak_days","days":30}'::jsonb, 250, true),
  ('interview_prep_explorer', 'Interview Preparation Explorer', 'Completed 5 mock interviews on AMLDecode.', 'MessageSquareCheck', 'interview', '5+ completed mock interviews', '{"type":"feature_count","source":"ai_interview","minCount":5}'::jsonb, 75, true),
  ('interview_practice_achiever', 'Interview Practice Achiever', 'Completed 10 mock interviews with an average score of at least 80%.', 'Award', 'interview', '10+ mock interviews with >= 80% average score', '{"type":"feature_avg","source":"ai_interview","minCount":10,"minAvgScore":80}'::jsonb, 150, true),
  ('amldecode_knowledge_champion', 'AMLDecode Knowledge Champion', 'Completed 100 scored questions with at least 85% overall accuracy on AMLDecode.', 'Crown', 'advanced', '100+ scored questions with >= 85% overall accuracy', '{"type":"overall_questions","minQuestions":100,"minAccuracy":85}'::jsonb, 200, true),
  ('financial_crime_practice_expert', 'Financial Crime Practice Expert', 'Demonstrated advanced multi-module AML investigation and assessment milestones on AMLDecode.', 'Sparkles', 'advanced', '80+ overall passport score and 25+ completed activities', '{"type":"passport_score","minScore":80,"minActivities":25}'::jsonb, 250, true)
on conflict (badge_code) do nothing;

-- Enable Row Level Security on all Skill Passport tables
alter table public.skill_passport_profiles enable row level security;
alter table public.skill_passport_activity_events enable row level security;
alter table public.skill_passport_category_scores enable row level security;
alter table public.skill_passport_badge_definitions enable row level security;
alter table public.skill_passport_user_badges enable row level security;
alter table public.skill_passport_xp_ledger enable row level security;
alter table public.skill_passport_public_shares enable row level security;
alter table public.skill_passport_recommendations enable row level security;
alter table public.skill_passport_audit_logs enable row level security;

-- Badge definitions are readable by anyone; mutations happen via server/service role
drop policy if exists "Anyone can read active badge definitions" on public.skill_passport_badge_definitions;
create policy "Anyone can read active badge definitions"
  on public.skill_passport_badge_definitions
  for select
  using (true);

-- Public verification shares can be read when public and non-revoked
drop policy if exists "Publicly shared badges are readable by token" on public.skill_passport_public_shares;
create policy "Publicly shared badges are readable by token"
  on public.skill_passport_public_shares
  for select
  using (is_public = true and revoked_at is null);

-- Authenticated users can read their own profile (matched by auth.uid())
drop policy if exists "Users can read own passport profile" on public.skill_passport_profiles;
create policy "Users can read own passport profile"
  on public.skill_passport_profiles
  for select
  using (auth.uid() = user_id);
