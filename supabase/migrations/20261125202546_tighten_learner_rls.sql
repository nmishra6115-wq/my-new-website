-- Remove broad public SELECT policies on learner and attempt tables
drop policy if exists "kt2_learners_select_all" on public.kt2_learners;
drop policy if exists "kt2_attempts_select_all" on public.kt2_attempts;

-- Replace unrestricted learner_accounts policy with authenticated ownership check
drop policy if exists "learner_accounts_upsert_own" on public.learner_accounts;

create policy "learner_accounts_select_own"
  on public.learner_accounts
  for select
  to authenticated
  using (auth.uid() = auth_user_id);

create policy "learner_accounts_insert_own"
  on public.learner_accounts
  for insert
  to authenticated
  with check (auth.uid() = auth_user_id);

create policy "learner_accounts_update_own"
  on public.learner_accounts
  for update
  to authenticated
  using (auth.uid() = auth_user_id)
  with check (auth.uid() = auth_user_id);

drop policy if exists "dkc_attempts_select_all" on public.dkc_attempts;
