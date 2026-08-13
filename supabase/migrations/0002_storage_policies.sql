-- =====================================================================
-- تكملة: سياسات الوصول لحاوية التسجيلات الصوتية
-- شغّل هذا فقط إذا لم يظهر القسم الأخير (Storage) في 0001_init.sql بنجاح.
-- إن لم تكن الحاوية voice-recordings موجودة بعد، أنشئها أولًا يدويًا من
-- Storage > New bucket في لوحة تحكم Supabase (اتركها Private)، ثم نفّذ هذا.
-- =====================================================================

insert into storage.buckets (id, name, public)
values ('voice-recordings', 'voice-recordings', false)
on conflict (id) do nothing;

drop policy if exists "voice_recordings_own_folder_select" on storage.objects;
create policy "voice_recordings_own_folder_select" on storage.objects
  for select using (
    bucket_id = 'voice-recordings' and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "voice_recordings_own_folder_insert" on storage.objects;
create policy "voice_recordings_own_folder_insert" on storage.objects
  for insert with check (
    bucket_id = 'voice-recordings' and (storage.foldername(name))[1] = auth.uid()::text
  );
