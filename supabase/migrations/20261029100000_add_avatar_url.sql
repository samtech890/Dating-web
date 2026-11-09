-- Add avatar_url field to profiles table for profile image storage
alter table public.profiles add column if not exists avatar_url text;
create index if not exists profiles_avatar_url_idx on public.profiles (avatar_url) where avatar_url is not null;
