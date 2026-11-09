create index if not exists reports_reporter_id_idx on public.reports (reporter_id);

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
        where (liked.from_user_id = viewer.id and liked.to_user_id = candidate.id)
          or (liked.from_user_id = candidate.id and liked.to_user_id = viewer.id)
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
