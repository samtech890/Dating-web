-- HeartLink initial foundation. Public profile fields only; no contact details or messages.
-- Age is self-reported and is not identity-verified by this schema.

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text not null check (char_length(display_name) between 1 and 40),
  age smallint not null check (age between 18 and 120),
  bio text not null default '' check (char_length(bio) <= 500),
  location_label text not null default '' check (char_length(location_label) <= 100),
  relationship_intention text not null default 'not_specified'
    check (relationship_intention in ('long_term', 'life_partner', 'open_to_explore', 'not_specified')),
  is_discoverable boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.profile_interests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  interest text not null check (char_length(interest) between 1 and 40),
  created_at timestamptz not null default now(),
  unique (user_id, interest)
);

create table if not exists public.likes (
  id uuid primary key default gen_random_uuid(),
  from_user_id uuid not null references public.profiles (id) on delete cascade,
  to_user_id uuid not null references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (from_user_id, to_user_id),
  check (from_user_id <> to_user_id)
);

create table if not exists public.blocks (
  id uuid primary key default gen_random_uuid(),
  blocker_id uuid not null references public.profiles (id) on delete cascade,
  blocked_id uuid not null references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (blocker_id, blocked_id),
  check (blocker_id <> blocked_id)
);

create table if not exists public.reports (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid not null references public.profiles (id) on delete cascade,
  reported_id uuid not null references public.profiles (id) on delete cascade,
  reason text not null check (reason in ('harassment', 'spam', 'impersonation', 'underage_concern', 'inappropriate_content', 'other')),
  details text not null default '' check (char_length(details) <= 2000),
  created_at timestamptz not null default now(),
  check (reporter_id <> reported_id)
);

create index if not exists profiles_discoverable_idx on public.profiles (is_discoverable) where is_discoverable = true;
create index if not exists profile_interests_user_id_idx on public.profile_interests (user_id);
create index if not exists likes_to_user_id_idx on public.likes (to_user_id);
create index if not exists blocks_blocked_id_idx on public.blocks (blocked_id);
create index if not exists reports_reported_id_idx on public.reports (reported_id);
create index if not exists reports_reporter_id_idx on public.reports (reporter_id);

alter table public.profiles enable row level security;
alter table public.profile_interests enable row level security;
alter table public.likes enable row level security;
alter table public.blocks enable row level security;
alter table public.reports enable row level security;

create policy "Users can read discoverable profiles and their own"
  on public.profiles for select to authenticated
  using (id = (select auth.uid()) or is_discoverable = true);
create policy "Users can create their own profile"
  on public.profiles for insert to authenticated
  with check (id = (select auth.uid()));
create policy "Users can update their own profile"
  on public.profiles for update to authenticated
  using (id = (select auth.uid()))
  with check (id = (select auth.uid()));
create policy "Users can delete their own profile"
  on public.profiles for delete to authenticated
  using (id = (select auth.uid()));

create policy "Users can read interests on discoverable profiles"
  on public.profile_interests for select to authenticated
  using (
    user_id = (select auth.uid())
    or exists (
      select 1 from public.profiles p
      where p.id = profile_interests.user_id and p.is_discoverable = true
    )
  );
create policy "Users can add their own interests"
  on public.profile_interests for insert to authenticated
  with check (user_id = (select auth.uid()));
create policy "Users can update their own interests"
  on public.profile_interests for update to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));
create policy "Users can remove their own interests"
  on public.profile_interests for delete to authenticated
  using (user_id = (select auth.uid()));

create policy "Users can read likes they sent or received"
  on public.likes for select to authenticated
  using (from_user_id = (select auth.uid()) or to_user_id = (select auth.uid()));
create policy "Users can like discoverable profiles"
  on public.likes for insert to authenticated
  with check (
    from_user_id = (select auth.uid())
    and exists (
      select 1 from public.profiles p
      where p.id = likes.to_user_id and p.is_discoverable = true
    )
  );
create policy "Users can remove likes they sent"
  on public.likes for delete to authenticated
  using (from_user_id = (select auth.uid()));

create policy "Users can read their own blocks"
  on public.blocks for select to authenticated
  using (blocker_id = (select auth.uid()));
create policy "Users can block another profile"
  on public.blocks for insert to authenticated
  with check (blocker_id = (select auth.uid()));
create policy "Users can remove their own blocks"
  on public.blocks for delete to authenticated
  using (blocker_id = (select auth.uid()));

create policy "Users can read reports they submitted"
  on public.reports for select to authenticated
  using (reporter_id = (select auth.uid()));
create policy "Users can submit a report"
  on public.reports for insert to authenticated
  with check (reporter_id = (select auth.uid()));
