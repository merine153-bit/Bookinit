-- =====================================================================
-- Eatit — تخزين وسائط المطاعم (رفع الصور من الجهاز)
--
-- مسار الملف: media/<restaurant_id>/<اسم عشوائي>.jpg
-- الجزء الأول من المسار هو معرّف المطعم، وعليه تعتمد السياسات للتأكد
-- أن الرافع يملك ذلك المطعم — فلا يكتب صاحب مطعم في مجلد غيره.
-- =====================================================================

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'media',
  'media',
  true,
  5242880,  -- 5 ميغابايت
  array['image/jpeg', 'image/png', 'image/webp', 'image/avif']
)
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

-- القراءة عامة: الصور تظهر لكل زوّار التطبيق.
drop policy if exists media_public_read on storage.objects;
create policy media_public_read on storage.objects
  for select using (bucket_id = 'media');

-- الكتابة والتعديل والحذف: لصاحب المطعم داخل مجلد مطعمه فقط.
drop policy if exists media_owner_insert on storage.objects;
create policy media_owner_insert on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'media'
    and private.owns_restaurant((storage.foldername(name))[1]::uuid)
  );

drop policy if exists media_owner_update on storage.objects;
create policy media_owner_update on storage.objects
  for update to authenticated
  using (
    bucket_id = 'media'
    and private.owns_restaurant((storage.foldername(name))[1]::uuid)
  );

drop policy if exists media_owner_delete on storage.objects;
create policy media_owner_delete on storage.objects
  for delete to authenticated
  using (
    bucket_id = 'media'
    and private.owns_restaurant((storage.foldername(name))[1]::uuid)
  );
