-- ============================================================================
-- ROLLBACK: AMLDecode AI Compliance Interview Simulator
-- Drops ONLY the 5 isolated ai_interview_* tables created in 20261128
-- ============================================================================
DROP TABLE IF EXISTS public.ai_interview_feedback CASCADE;
DROP TABLE IF EXISTS public.ai_interview_answers CASCADE;
DROP TABLE IF EXISTS public.ai_interview_sessions CASCADE;
DROP TABLE IF EXISTS public.ai_interview_questions CASCADE;
DROP TABLE IF EXISTS public.ai_interview_usage CASCADE;
