create table if not exists public.careers_ai_audit_log (
  id uuid primary key default gen_random_uuid(),
  actor_label text not null default 'admin_session',
  action_type text not null,
  details jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

alter table public.careers_ai_audit_log enable row level security;

create index if not exists careers_ai_audit_log_created_idx
  on public.careers_ai_audit_log (created_at desc);
