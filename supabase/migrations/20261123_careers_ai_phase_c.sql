alter table public.job_sources
  add column if not exists board_or_feed_key text,
  add column if not exists request_timeout_ms integer not null default 8000,
  add column if not exists max_retries integer not null default 2,
  add column if not exists is_running boolean not null default false,
  add column if not exists locked_at timestamptz,
  add column if not exists last_checked_at timestamptz;

alter table public.job_sync_logs
  add column if not exists lock_acquired boolean not null default true,
  add column if not exists retry_count integer not null default 0;
