-- Rollback for 20261130_aml_skill_passport.sql (Isolated to Skill Passport objects only)

drop table if exists public.skill_passport_audit_logs cascade;
drop table if exists public.skill_passport_recommendations cascade;
drop table if exists public.skill_passport_public_shares cascade;
drop table if exists public.skill_passport_xp_ledger cascade;
drop table if exists public.skill_passport_user_badges cascade;
drop table if exists public.skill_passport_badge_definitions cascade;
drop table if exists public.skill_passport_category_scores cascade;
drop table if exists public.skill_passport_activity_events cascade;
drop table if exists public.skill_passport_profiles cascade;
