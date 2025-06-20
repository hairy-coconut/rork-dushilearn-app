-- Create storage policies for avatars bucket
create policy "Users can upload their own avatar"
on storage.objects for insert
with check (
    bucket_id = 'avatars' and
    auth.uid() = (storage.foldername(name))[1]::uuid
);

create policy "Users can view their own avatar"
on storage.objects for select
using (
    bucket_id = 'avatars' and
    auth.uid() = (storage.foldername(name))[1]::uuid
);

create policy "Users can update their own avatar"
on storage.objects for update
using (
    bucket_id = 'avatars' and
    auth.uid() = (storage.foldername(name))[1]::uuid
);

create policy "Users can delete their own avatar"
on storage.objects for delete
using (
    bucket_id = 'avatars' and
    auth.uid() = (storage.foldername(name))[1]::uuid
); 