create table if not exists public.careers_ai_settings (
  id text primary key default 'default',
  expiry_days integer not null default 15 check (expiry_days >= 1 and expiry_days <= 365),
  updated_at timestamptz not null default now()
);

insert into public.careers_ai_settings (id, expiry_days)
values ('default', 15)
on conflict (id) do nothing;

alter table public.jobs
  add column if not exists closed_early boolean not null default false,
  add column if not exists closed_reason text,
  add column if not exists archived_at timestamptz;

drop policy if exists "jobs_select_active" on public.jobs;
create policy "jobs_select_active" on public.jobs
  for select using (
    status = 'active'
    and closed_early = false
    and (expires_at is null or expires_at > now())
  );
