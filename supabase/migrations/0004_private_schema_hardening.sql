-- =====================================================================
-- Eatit — تقوية أمنية: نقل دوال SECURITY DEFINER خارج المخطط المعروض
--
-- المشكلة التي رصدها مستشار Supabase الأمني:
--   handle_new_user و owns_restaurant و refresh_restaurant_rating كانت
--   في مخطط public، فصارت قابلة للاستدعاء عبر /rest/v1/rpc/ من أي زائر.
--
-- الحل: PostgREST يعرض مخطط public فقط. نقل الدوال إلى مخطط private
-- يمنع استدعاءها عبر الـ API مع بقائها متاحة للمحفّزات وسياسات RLS.
-- =====================================================================

create schema if not exists private;

grant usage on schema private to anon, authenticated, service_role;

-- ---------------------------------------------------------------------
-- ١) دالة ملكية المطعم (تُستدعى داخل سياسات RLS)
-- ---------------------------------------------------------------------
create or replace function private.owns_restaurant(target uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.restaurants r
    where r.id = target and r.owner_id = auth.uid()
  );
$$;

-- الصلاحية مطلوبة لأن سياسات RLS تُقيَّم بصلاحيات الدور الطالب.
grant execute on function private.owns_restaurant(uuid) to anon, authenticated;

do $$
declare
  t text;
begin
  foreach t in array array[
    'restaurant_hours', 'menu_categories', 'menu_items', 'posts', 'restaurant_stories'
  ] loop
    execute format('drop policy if exists %I_write on public.%I;', t, t);
    execute format(
      'create policy %I_write on public.%I for all using (private.owns_restaurant(restaurant_id)) with check (private.owns_restaurant(restaurant_id));',
      t, t
    );
  end loop;
end $$;

drop function if exists public.owns_restaurant(uuid);

-- ---------------------------------------------------------------------
-- ٢) دالة إنشاء الملف التعريفي عند التسجيل
-- ---------------------------------------------------------------------
create or replace function private.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.users (id, username, full_name, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'username', '@' || split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data ->> 'full_name', 'مستخدم Eatit'),
    new.raw_user_meta_data ->> 'avatar_url'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function private.handle_new_user();

drop function if exists public.handle_new_user();

-- ---------------------------------------------------------------------
-- ٣) دالة إعادة احتساب التقييم
-- ---------------------------------------------------------------------
create or replace function private.refresh_restaurant_rating()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  target uuid := coalesce(new.restaurant_id, old.restaurant_id);
  live_count integer;
  live_sum numeric;
  base_count integer;
  base_avg numeric;
  total integer;
begin
  select count(*), coalesce(sum(rating), 0)
    into live_count, live_sum
    from public.reviews
   where restaurant_id = target;

  select base_review_count, base_rating
    into base_count, base_avg
    from public.restaurants
   where id = target;

  total := coalesce(base_count, 0) + live_count;

  update public.restaurants r
     set review_count = total,
         rating = case
           when total = 0 then 0
           else round((coalesce(base_avg, 0) * coalesce(base_count, 0) + live_sum) / total, 1)
         end
   where r.id = target;

  return null;
end;
$$;

drop trigger if exists reviews_refresh_rating on public.reviews;
create trigger reviews_refresh_rating
  after insert or update or delete on public.reviews
  for each row execute function private.refresh_restaurant_rating();

drop function if exists public.refresh_restaurant_rating();
