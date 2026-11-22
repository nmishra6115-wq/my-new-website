-- ============================================================================
-- ROLLBACK: AMLDecode AI Daily Intelligence Challenge Engine (20261129)
-- Drops ONLY the additive tables added in 20261129.
-- Does NOT drop dkc_questions, dkc_daily_publications, or dkc_attempts.
-- ============================================================================
DROP TABLE IF EXISTS public.dkc_user_achievements CASCADE;
DROP TABLE IF EXISTS public.dkc_achievements CASCADE;
DROP TABLE IF EXISTS public.dkc_xp_transactions CASCADE;
DROP TABLE IF EXISTS public.dkc_user_stats CASCADE;
DROP TABLE IF EXISTS public.dkc_public_profiles CASCADE;
DROP TABLE IF EXISTS public.dkc_generation_logs CASCADE;
DROP TABLE IF EXISTS public.dkc_admin_controls CASCADE;

ALTER TABLE IF EXISTS public.dkc_questions
  DROP COLUMN IF EXISTS key_learning_points,
  DROP COLUMN IF EXISTS analyst_takeaway,
  DROP COLUMN IF EXISTS practical_application,
  DROP COLUMN IF EXISTS updated_at;
