-- =============================================================================
-- Migration 002: Storage bucket `pdfs` + RLS for user-scoped uploads
-- Run in Supabase SQL Editor after 001_create_documents.sql
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. Bucket (private; paths: {user_id}/{timestamp}-{filename}.pdf)
-- -----------------------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'pdfs',
  'pdfs',
  false,
  10485760,
  array['application/pdf']::text[]
)
on conflict (id) do update set
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;


-- -----------------------------------------------------------------------------
-- 2. RLS policies on storage.objects
-- Authenticated users may only access files under their own folder prefix.
-- -----------------------------------------------------------------------------

create policy "pdfs_insert_own_folder"
  on storage.objects
  for insert
  to authenticated
  with check (
    bucket_id = 'pdfs'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "pdfs_select_own_folder"
  on storage.objects
  for select
  to authenticated
  using (
    bucket_id = 'pdfs'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "pdfs_update_own_folder"
  on storage.objects
  for update
  to authenticated
  using (
    bucket_id = 'pdfs'
    and (storage.foldername(name))[1] = auth.uid()::text
  )
  with check (
    bucket_id = 'pdfs'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "pdfs_delete_own_folder"
  on storage.objects
  for delete
  to authenticated
  using (
    bucket_id = 'pdfs'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
