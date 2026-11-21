alter table public.job_alerts
  add column if not exists preferred_location text not null default 'All India',
  add column if not exists work_arrangement text not null default 'All',
  add column if not exists skills text[] not null default '{}',
  add column if not exists consent_timestamp timestamptz,
  add column if not exists unsubscribed_at timestamptz,
  add column if not exists last_notified_job_ids text[] not null default '{}';

create unique index if not exists job_alerts_email_active_idx
  on public.job_alerts (lower(email))
  where active = true and unsubscribed_at is null;
