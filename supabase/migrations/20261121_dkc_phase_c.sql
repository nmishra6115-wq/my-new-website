create extension if not exists pgcrypto;

create table if not exists public.dkc_questions (
  id text primary key,
  statement text not null,
  topic text not null,
  difficulty text not null default 'Intermediate',
  jurisdiction text,
  correct_answer boolean not null,
  explanation text not null,
  source_references text not null,
  related_article_id text,
  related_note_index integer,
  related_article_title text,
  content_hash text not null unique,
  review_status text not null default 'verified',
  publication_status text not null default 'published',
  created_at timestamptz not null default now()
);

create table if not exists public.dkc_daily_publications (
  publication_date_ist date primary key,
  question_id text not null references public.dkc_questions(id) on delete restrict,
  rotation_topic text not null,
  is_fallback boolean not null default false,
  fallback_reason text,
  published_at timestamptz not null default now(),
  publication_status text not null default 'published'
);

create table if not exists public.dkc_attempts (
  id uuid primary key default gen_random_uuid(),
  session_key text not null,
  learner_email text,
  publication_date_ist date not null,
  question_id text not null,
  selected_answer boolean not null,
  is_correct boolean not null,
  answered_at timestamptz not null default now(),
  unique (session_key, publication_date_ist, question_id)
);

create index if not exists dkc_attempts_session_date_idx
  on public.dkc_attempts (session_key, publication_date_ist desc);

alter table public.dkc_questions enable row level security;
alter table public.dkc_daily_publications enable row level security;
alter table public.dkc_attempts enable row level security;

drop policy if exists "dkc_questions_select_published" on public.dkc_questions;
create policy "dkc_questions_select_published" on public.dkc_questions
  for select using (publication_status = 'published');

drop policy if exists "dkc_publications_select_published" on public.dkc_daily_publications;
create policy "dkc_publications_select_published" on public.dkc_daily_publications
  for select using (publication_status = 'published');

drop policy if exists "dkc_attempts_select_all" on public.dkc_attempts;
create policy "dkc_attempts_select_all" on public.dkc_attempts
  for select using (true);

drop policy if exists "dkc_attempts_insert_all" on public.dkc_attempts;
create policy "dkc_attempts_insert_all" on public.dkc_attempts
  for insert with check (true);
