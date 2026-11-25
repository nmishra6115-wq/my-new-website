alter table public.job_subscribers enable row level security;

drop policy if exists "Allow public job alert signups" on public.job_subscribers;

create policy "Allow public job alert signups"
on public.job_subscribers
for insert
to anon, authenticated
with check (
  length(trim(email)) > 3
  and position('@' in email) > 1
);
