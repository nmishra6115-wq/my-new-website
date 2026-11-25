create or replace function public.upsert_kt2_learner(
  p_email text,
  p_name text,
  p_last_login_at timestamptz default now(),
  p_updated_at timestamptz default now()
)
returns public.kt2_learners
language plpgsql
security definer
set search_path = public
as $$
declare
  v_email text := lower(trim(p_email));
  v_name text := trim(coalesce(p_name, ''));
  v_row public.kt2_learners;
begin
  if v_email = '' then
    return null;
  end if;

  insert into public.kt2_learners (email, name, last_login_at, updated_at)
  values (v_email, v_name, p_last_login_at, p_updated_at)
  on conflict (email) do update
    set name = excluded.name,
        last_login_at = excluded.last_login_at,
        updated_at = excluded.updated_at
  returning * into v_row;

  return v_row;
end;
$$;

drop policy if exists "kt2_learners_update_all" on public.kt2_learners;

revoke all on function public.upsert_kt2_learner(text, text, timestamptz, timestamptz) from public;
grant execute on function public.upsert_kt2_learner(text, text, timestamptz, timestamptz) to anon, authenticated;
