-- Account deletion function with cascading cleanup
-- This function safely deletes a user account and all associated data

create or replace function public.delete_user_account()
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  user_id uuid;
begin
  -- Get the current user's ID
  user_id := auth.uid();
  
  if user_id is null then
    raise exception 'User not authenticated';
  end if;
  
  -- Delete user's avatar files from storage
  delete from storage.objects
  where bucket_id = 'avatars'
    and (storage.foldername(name))[1] = user_id::text;
  
  -- Delete profile-related data (cascades via foreign keys)
  delete from public.reports where reporter_id = user_id or reported_id = user_id;
  delete from public.blocks where blocker_id = user_id or blocked_id = user_id;
  delete from public.likes where from_user_id = user_id or to_user_id = user_id;
  delete from public.saved_profiles where user_id = user_id or saved_user_id = user_id;
  delete from public.profile_passes where user_id = user_id or passed_user_id = user_id;
  delete from public.discovery_preferences where user_id = user_id;
  delete from public.profile_interests where user_id = user_id;
  delete from public.profiles where id = user_id;
  
  -- Note: The auth.users deletion is handled by Supabase Auth
  -- This function only handles public schema data
  
  return true;
end;
$$;

revoke all on function public.delete_user_account() from public, anon;
grant execute on function public.delete_user_account() to authenticated;
