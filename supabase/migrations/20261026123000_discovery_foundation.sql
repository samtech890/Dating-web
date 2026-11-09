-- Discovery foundation: user-controlled preferences, private saves/passes, and a
-- narrowly-scoped authenticated candidate RPC. No location or compatibility score.

create table if not exists public.discovery_preferences (
  user_id uuid primary key references public.profiles (id) on delete cascade,
  min_age smallint not null default 18 check (min_age between 18 and 120),
  max_age smallint not null default 99 check (max_age between 18 and 120),
  accepted_intentions text[] not null default array['long_term', 'life_partner', 'open_to_explore', 'not_specified']::text[],
  updated_at timestamptz not null default now(),
  check (min_age <= max_age),
  check (cardinality(accepted_intentions) between 1 and 4),
  check (accepted_intentions <@ array['long_term', 'life_partner', 'open_to_explore', 'not_specified']::text[])
);

create table if not exists public.profile_passes (
  user_id uuid not null references public.profiles (id) on delete cascade,
  passed_user_id uuid not null references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, passed_user_id),
  check (user_id <> passed_user_id)
);

create table if not exists public.saved_profiles (
  user_id uuid not null references public.profiles (id) on delete cascade,
  saved_user_id uuid not null references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, saved_user_id),
  check (user_id <> saved_user_id)
);

create index if not exists profile_passes_target_idx on public.profile_passes (passed_user_id);
create index if not exists saved_profiles_target_idx on public.saved_profiles (saved_user_id);
create index if not exists discovery_preferences_age_idx on public.discovery_preferences (min_age, max_age);

alter table public.discovery_preferences enable row level security;
alter table public.profile_passes enable row level security;
alter table public.saved_profiles enable row level security;

 drop policy if exists "Users manage their discovery preferences" on public.discovery_preferences;
create policy "Users manage their discovery preferences"
  on public.discovery_preferences for all to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

drop policy if exists "Users manage their own passes" on public.profile_passes;
create policy "Users manage their own passes"
  on public.profile_passes for all to authenticated
  using (user_id = (select auth.uid()))
  with check (
    user_id = (select auth.uid())
    and exists (
      select 1 from public.profiles target
      where target.id = profile_passes.passed_user_id and target.is_discoverable = true
    )
    and not exists (
      select 1 from public.blocks b
      where (b.blocker_id = (select auth.uid()) and b.blocked_id = profile_passes.passed_user_id)
        or (b.blocker_id = profile_passes.passed_user_id and b.blocked_id = (select auth.uid()))
    )
  );

drop policy if exists "Users manage their own saved profiles" on public.saved_profiles;
create policy "Users manage their own saved profiles"
  on public.saved_profiles for all to authenticated
  using (user_id = (select auth.uid()))
  with check (
    user_id = (select auth.uid())
    and exists (
      select 1 from public.profiles target
      where target.id = saved_profiles.saved_user_id and target.is_discoverable = true
    )
    and not exists (
      select 1 from public.blocks b
      where (b.blocker_id = (select auth.uid()) and b.blocked_id = saved_profiles.saved_user_id)
        or (b.blocker_id = saved_profiles.saved_user_id and b.blocked_id = (select auth.uid()))
    )
  );

create or replace function public.get_discovery_candidates(p_limit integer default 20, p_offset integer default 0)
returns table (
  profile_id uuid,
  display_name text,
  age smallint,
  bio text,
  location_label text,
  relationship_intention text,
  shared_interests text[],
  intention_compatible boolean,
  recommendation_reasons text[],
  is_saved boolean
)
language sql
stable
security definer
set search_path = ''
as $$
  with viewer as (
    select p.id, p.age, p.relationship_intention, pref.min_age, pref.max_age, pref.accepted_intentions
    from public.profiles p
    join public.discovery_preferences pref on pref.user_id = p.id
    where p.id = (select auth.uid())
  ), eligible as (
    select candidate.id, candidate.display_name, candidate.age, candidate.bio,
      candidate.location_label, candidate.relationship_intention, candidate.created_at,
      coalesce(shared.items, array[]::text[]) as shared_interests,
      (candidate.relationship_intention = viewer.relationship_intention
        and candidate.relationship_intention <> 'not_specified') as intention_compatible,
      exists (
        select 1 from public.saved_profiles saved
        where saved.user_id = viewer.id and saved.saved_user_id = candidate.id
      ) as is_saved
    from viewer
    join public.profiles candidate on candidate.id <> viewer.id
      and candidate.is_discoverable = true
      and candidate.age between viewer.min_age and viewer.max_age
      and candidate.relationship_intention = any(viewer.accepted_intentions)
    join public.discovery_preferences candidate_pref on candidate_pref.user_id = candidate.id
      and viewer.age between candidate_pref.min_age and candidate_pref.max_age
      and viewer.relationship_intention = any(candidate_pref.accepted_intentions)
    left join lateral (
      select array_agg(own.interest order by own.interest) as items
      from public.profile_interests own
      join public.profile_interests theirs on theirs.interest = own.interest
        and theirs.user_id = candidate.id
      where own.user_id = viewer.id
    ) shared on true
    where not exists (
        select 1 from public.blocks b
        where (b.blocker_id = viewer.id and b.blocked_id = candidate.id)
          or (b.blocker_id = candidate.id and b.blocked_id = viewer.id)
      )
      and not exists (
        select 1 from public.profile_passes pass
        where pass.user_id = viewer.id and pass.passed_user_id = candidate.id
      )
      and not exists (
        select 1 from public.likes liked
        where liked.from_user_id = viewer.id and liked.to_user_id = candidate.id
      )
  )
  select eligible.id, eligible.display_name, eligible.age, eligible.bio,
    eligible.location_label, eligible.relationship_intention, eligible.shared_interests,
    eligible.intention_compatible,
    array_remove(array[
      case when cardinality(eligible.shared_interests) > 0 then 'Shares interests you selected' end,
      case when eligible.intention_compatible then 'Same stated relationship intention' end,
      'Both profiles fit each other’s stated age and intention preferences'
    ], null)::text[] as recommendation_reasons,
    eligible.is_saved
  from eligible
  order by cardinality(eligible.shared_interests) desc, eligible.intention_compatible desc,
    eligible.created_at desc, eligible.id
  limit greatest(1, least(coalesce(p_limit, 20), 50))
  offset greatest(0, least(coalesce(p_offset, 0), 500));
$$;

revoke all on function public.get_discovery_candidates(integer, integer) from public, anon;
grant execute on function public.get_discovery_candidates(integer, integer) to authenticated;

create or replace function public.undo_latest_profile_pass()
returns boolean
language plpgsql
volatile
security invoker
set search_path = ''
as $$
declare
  removed_count integer;
begin
  delete from public.profile_passes
  where user_id = (select auth.uid())
    and passed_user_id = (
      select pass.passed_user_id from public.profile_passes pass
      where pass.user_id = (select auth.uid())
      order by pass.created_at desc, pass.passed_user_id desc
      limit 1
    );
  get diagnostics removed_count = row_count;
  return removed_count > 0;
end;
$$;

revoke all on function public.undo_latest_profile_pass() from public, anon;
grant execute on function public.undo_latest_profile_pass() to authenticated;
