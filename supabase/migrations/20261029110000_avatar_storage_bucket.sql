-- Create avatars storage bucket with Row Level Security policies
-- Avatars are public but upload/delete is restricted to authenticated users

-- Insert storage bucket configuration
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'avatars',
  'avatars',
  true,
  5242880, -- 5MB max file size
  array['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
)
on conflict (id) do nothing;

-- Enable RLS on storage.objects
alter table storage.objects enable row level security;

-- Policy: Public can read avatar files
create policy "Public can view avatars"
  on storage.objects for select
  to public
  using (bucket_id = 'avatars');

-- Policy: Authenticated users can upload their own avatar
create policy "Users can upload their own avatar"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- Policy: Users can update their own avatar
create policy "Users can update their own avatar"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  )
  with check (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- Policy: Users can delete their own avatar
create policy "Users can delete their own avatar"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
