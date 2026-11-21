alter table public.jobs
  add column if not exists role_category text,
  add column if not exists domain_tags text[] not null default '{}',
  add column if not exists classification_provider text,
  add column if not exists classification_model text,
  add column if not exists source_references text[] not null default '{}',
  add column if not exists date_basis text not null default 'first_seen';

create index if not exists jobs_employer_title_idx
  on public.jobs (employer, title);

create index if not exists jobs_source_job_id_idx
  on public.jobs (source_id, source_job_id);
