create extension if not exists pgcrypto;

create table if not exists public.job_sources (
  id text primary key,
  provider text not null,
  source_url text,
  integration_type text not null default 'curated_seed',
  enabled boolean not null default true,
  last_success_at timestamptz,
  last_error text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.jobs (
  id text primary key,
  source_id text references public.job_sources(id) on delete set null,
  source_job_id text,
  employer text not null,
  title text not null,
  description text not null default '',
  city text,
  state text,
  country text not null default 'India',
  remote_eligibility text not null default 'unspecified',
  experience_min integer,
  experience_max integer,
  skills text[] not null default '{}',
  salary text,
  published_at timestamptz,
  first_seen_at timestamptz not null default now(),
  last_verified_at timestamptz not null default now(),
  expires_at timestamptz,
  application_url text not null,
  canonical_url text not null,
  status text not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.job_sync_logs (
  id uuid primary key default gen_random_uuid(),
  source_id text references public.job_sources(id) on delete set null,
  started_at timestamptz not null default now(),
  completed_at timestamptz,
  imported_count integer not null default 0,
  updated_count integer not null default 0,
  expired_count integer not null default 0,
  error_count integer not null default 0,
  status text not null default 'running',
  notes text
);

create table if not exists public.job_alerts (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  state text not null default 'All India',
  city text not null default 'All',
  role_category text not null default 'All',
  experience_min integer,
  experience_max integer,
  frequency text not null default 'daily',
  consent_given boolean not null default false,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create index if not exists jobs_status_state_city_idx
  on public.jobs (status, state, city);

create index if not exists jobs_expires_at_idx
  on public.jobs (expires_at);

create index if not exists jobs_canonical_url_idx
  on public.jobs (canonical_url);

create index if not exists job_sync_logs_source_started_idx
  on public.job_sync_logs (source_id, started_at desc);

alter table public.job_sources enable row level security;
alter table public.jobs enable row level security;
alter table public.job_sync_logs enable row level security;
alter table public.job_alerts enable row level security;

drop policy if exists "jobs_select_active" on public.jobs;
create policy "jobs_select_active" on public.jobs
  for select using (status = 'active');

drop policy if exists "job_sources_select_public" on public.job_sources;
create policy "job_sources_select_public" on public.job_sources
  for select using (enabled = true);
