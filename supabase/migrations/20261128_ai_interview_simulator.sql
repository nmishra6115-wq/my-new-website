-- ============================================================================
-- AMLDecode AI Compliance Interview Simulator ? Isolated Schema (ADD-ONLY)
-- Migration: 20261128_ai_interview_simulator.sql
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. Prevalidated Question Bank (Layer 1 ? ?0 baseline)
CREATE TABLE IF NOT EXISTS public.ai_interview_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question_code TEXT UNIQUE NOT NULL,
  category TEXT NOT NULL CHECK (category IN (
    'AML Fundamentals',
    'KYC/CDD/EDD',
    'Transaction Monitoring',
    'Sanctions Screening',
    'SAR/STR',
    'Leadership'
  )),
  target_roles TEXT[] NOT NULL DEFAULT '{}',
  experience_levels TEXT[] NOT NULL DEFAULT '{}',
  difficulty TEXT NOT NULL CHECK (difficulty IN ('foundational', 'intermediate', 'advanced', 'leadership')),
  prompt TEXT NOT NULL,
  context_hint TEXT,
  rubric_concepts JSONB NOT NULL DEFAULT '[]'::jsonb,
  model_answer TEXT NOT NULL,
  follow_up_prompt TEXT,
  recommended_module_index INTEGER,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ai_interview_questions_category ON public.ai_interview_questions(category);
CREATE INDEX IF NOT EXISTS idx_ai_interview_questions_active ON public.ai_interview_questions(is_active);

-- 2. Interview Sessions (supports both authenticated Supabase users and anonymous browser session_token)
CREATE TABLE IF NOT EXISTS public.ai_interview_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  guest_session_token TEXT,
  learner_email TEXT,
  target_company TEXT NOT NULL,
  target_role TEXT NOT NULL,
  experience_level TEXT NOT NULL,
  question_count INTEGER NOT NULL DEFAULT 5 CHECK (question_count IN (5, 10, 20)),
  status TEXT NOT NULL DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'completed', 'abandoned')),
  current_question_index INTEGER NOT NULL DEFAULT 0,
  elapsed_seconds INTEGER NOT NULL DEFAULT 0,
  overall_score NUMERIC(5,2),
  dimension_scores JSONB NOT NULL DEFAULT '{}'::jsonb,
  question_plan JSONB NOT NULL DEFAULT '[]'::jsonb,
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT chk_session_owner CHECK (user_id IS NOT NULL OR guest_session_token IS NOT NULL)
);

CREATE INDEX IF NOT EXISTS idx_ai_interview_sessions_user ON public.ai_interview_sessions(user_id, updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_ai_interview_sessions_guest ON public.ai_interview_sessions(guest_session_token, updated_at DESC);

-- 3. Submitted Answers
CREATE TABLE IF NOT EXISTS public.ai_interview_answers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES public.ai_interview_sessions(id) ON DELETE CASCADE,
  question_index INTEGER NOT NULL,
  question_code TEXT NOT NULL,
  question_text TEXT NOT NULL,
  answer_text TEXT NOT NULL DEFAULT '',
  input_mode TEXT NOT NULL DEFAULT 'text' CHECK (input_mode IN ('text', 'voice', 'skipped')),
  time_spent_seconds INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (session_id, question_index)
);

CREATE INDEX IF NOT EXISTS idx_ai_interview_answers_session ON public.ai_interview_answers(session_id, question_index);

-- 4. Answer Evaluation & Feedback
CREATE TABLE IF NOT EXISTS public.ai_interview_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  answer_id UUID NOT NULL UNIQUE REFERENCES public.ai_interview_answers(id) ON DELETE CASCADE,
  session_id UUID NOT NULL REFERENCES public.ai_interview_sessions(id) ON DELETE CASCADE,
  evaluation_source TEXT NOT NULL DEFAULT 'deterministic_rubric' CHECK (evaluation_source IN ('deterministic_rubric', 'free_tier_ai')),
  total_score NUMERIC(5,2) NOT NULL CHECK (total_score >= 0 AND total_score <= 100),
  technical_accuracy NUMERIC(5,2) NOT NULL DEFAULT 0,
  practical_application NUMERIC(5,2) NOT NULL DEFAULT 0,
  risk_identification NUMERIC(5,2) NOT NULL DEFAULT 0,
  communication_clarity NUMERIC(5,2) NOT NULL DEFAULT 0,
  completeness NUMERIC(5,2) NOT NULL DEFAULT 0,
  strengths JSONB NOT NULL DEFAULT '[]'::jsonb,
  missing_points JSONB NOT NULL DEFAULT '[]'::jsonb,
  improvements JSONB NOT NULL DEFAULT '[]'::jsonb,
  suggested_answer TEXT NOT NULL DEFAULT '',
  follow_up_question TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ai_interview_feedback_session ON public.ai_interview_feedback(session_id);

-- 5. Daily Free-Tier Usage & Rate-Limit Tracking (?0 Cost Guard)
CREATE TABLE IF NOT EXISTS public.ai_interview_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usage_date DATE NOT NULL DEFAULT CURRENT_DATE,
  actor_key TEXT NOT NULL,
  ai_calls_count INTEGER NOT NULL DEFAULT 0,
  rule_evals_count INTEGER NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (usage_date, actor_key)
);

CREATE INDEX IF NOT EXISTS idx_ai_interview_usage_date ON public.ai_interview_usage(usage_date);

-- ============================================================================
-- Row Level Security (RLS)
-- ============================================================================
ALTER TABLE public.ai_interview_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_interview_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_interview_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_interview_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_interview_usage ENABLE ROW LEVEL SECURITY;

-- Questions: read-only for active questions
DROP POLICY IF EXISTS "Public read active interview questions" ON public.ai_interview_questions;
CREATE POLICY "Public read active interview questions"
  ON public.ai_interview_questions FOR SELECT
  USING (is_active = TRUE);

-- Sessions: authenticated users access only their own rows; guest rows scoped via session token header
DROP POLICY IF EXISTS "Users manage own interview sessions" ON public.ai_interview_sessions;
CREATE POLICY "Users manage own interview sessions"
  ON public.ai_interview_sessions FOR ALL
  USING (
    (auth.uid() IS NOT NULL AND user_id = auth.uid())
    OR (
      guest_session_token IS NOT NULL
      AND guest_session_token = COALESCE(current_setting('request.headers', true)::json->>'x-interview-session-token', '')
    )
  )
  WITH CHECK (
    (auth.uid() IS NOT NULL AND user_id = auth.uid())
    OR (
      guest_session_token IS NOT NULL
      AND guest_session_token = COALESCE(current_setting('request.headers', true)::json->>'x-interview-session-token', '')
    )
  );

-- Answers: scoped through parent session ownership
DROP POLICY IF EXISTS "Users manage own interview answers" ON public.ai_interview_answers;
CREATE POLICY "Users manage own interview answers"
  ON public.ai_interview_answers FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.ai_interview_sessions s
      WHERE s.id = ai_interview_answers.session_id
        AND (
          (auth.uid() IS NOT NULL AND s.user_id = auth.uid())
          OR (
            s.guest_session_token IS NOT NULL
            AND s.guest_session_token = COALESCE(current_setting('request.headers', true)::json->>'x-interview-session-token', '')
          )
        )
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.ai_interview_sessions s
      WHERE s.id = ai_interview_answers.session_id
        AND (
          (auth.uid() IS NOT NULL AND s.user_id = auth.uid())
          OR (
            s.guest_session_token IS NOT NULL
            AND s.guest_session_token = COALESCE(current_setting('request.headers', true)::json->>'x-interview-session-token', '')
          )
        )
    )
  );

-- Feedback: read/insert scoped through parent session ownership
DROP POLICY IF EXISTS "Users read own interview feedback" ON public.ai_interview_feedback;
CREATE POLICY "Users read own interview feedback"
  ON public.ai_interview_feedback FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.ai_interview_sessions s
      WHERE s.id = ai_interview_feedback.session_id
        AND (
          (auth.uid() IS NOT NULL AND s.user_id = auth.uid())
          OR (
            s.guest_session_token IS NOT NULL
            AND s.guest_session_token = COALESCE(current_setting('request.headers', true)::json->>'x-interview-session-token', '')
          )
        )
    )
  );

DROP POLICY IF EXISTS "Users insert own interview feedback" ON public.ai_interview_feedback;
CREATE POLICY "Users insert own interview feedback"
  ON public.ai_interview_feedback FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.ai_interview_sessions s
      WHERE s.id = ai_interview_feedback.session_id
        AND (
          (auth.uid() IS NOT NULL AND s.user_id = auth.uid())
          OR (
            s.guest_session_token IS NOT NULL
            AND s.guest_session_token = COALESCE(current_setting('request.headers', true)::json->>'x-interview-session-token', '')
          )
        )
    )
  );

-- Usage table: locked down from direct client writes (service_role only)
DROP POLICY IF EXISTS "No direct client access to usage" ON public.ai_interview_usage;
CREATE POLICY "No direct client access to usage"
  ON public.ai_interview_usage FOR SELECT
  USING (FALSE);
