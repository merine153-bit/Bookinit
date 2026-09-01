-- =====================================================================
-- Eatit — سياسات أمان الصفوف (RLS)
-- القراءة عامة للمحتوى المنشور، والكتابة مقيّدة بصاحب المطعم أو المستخدم نفسه.
-- =====================================================================

alter table public.users enable row level security;
alter table public.restaurants enable row level security;
alter table public.restaurant_hours enable row level security;
alter table public.restaurant_followers enable row level security;
alter table public.menu_categories enable row level security;
alter table public.menu_items enable row level security;
alter table public.posts enable row level security;
alter table public.post_likes enable row level security;
alter table public.post_comments enable row level security;
alter table public.restaurant_stories enable row level security;
alter table public.reviews enable row level security;
alter table public.saved_items enable row level security;
alter table public.notifications enable row level security;

-- دالة مساعدة: هل المستخدم الحالي مالك هذا المطعم؟
create or replace function public.owns_restaurant(target uuid)
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

-- ---------------------------------------------------------------------
-- المستخدمون
-- ---------------------------------------------------------------------
drop policy if exists users_select on public.users;
create policy users_select on public.users for select using (true);

drop policy if exists users_update_self on public.users;
create policy users_update_self on public.users for update
  using (id = auth.uid()) with check (id = auth.uid());

-- ---------------------------------------------------------------------
-- المطاعم ومحتواها — قراءة عامة، كتابة للمالك
-- ---------------------------------------------------------------------
drop policy if exists restaurants_select on public.restaurants;
create policy restaurants_select on public.restaurants for select using (true);

drop policy if exists restaurants_insert on public.restaurants;
create policy restaurants_insert on public.restaurants for insert
  with check (owner_id = auth.uid());

drop policy if exists restaurants_update on public.restaurants;
create policy restaurants_update on public.restaurants for update
  using (owner_id = auth.uid()) with check (owner_id = auth.uid());

drop policy if exists restaurants_delete on public.restaurants;
create policy restaurants_delete on public.restaurants for delete using (owner_id = auth.uid());

do $$
declare
  t text;
begin
  foreach t in array array[
    'restaurant_hours', 'menu_categories', 'menu_items', 'posts', 'restaurant_stories'
  ] loop
    execute format('drop policy if exists %I_select on public.%I;', t, t);
    execute format('create policy %I_select on public.%I for select using (true);', t, t);

    execute format('drop policy if exists %I_write on public.%I;', t, t);
    execute format(
      'create policy %I_write on public.%I for all using (public.owns_restaurant(restaurant_id)) with check (public.owns_restaurant(restaurant_id));',
      t, t
    );
  end loop;
end $$;

-- ---------------------------------------------------------------------
-- التفاعلات — كل مستخدم يدير صفوفه فقط
-- ---------------------------------------------------------------------
drop policy if exists followers_select on public.restaurant_followers;
create policy followers_select on public.restaurant_followers for select using (true);

drop policy if exists followers_write on public.restaurant_followers;
create policy followers_write on public.restaurant_followers for all
  using (user_id = auth.uid()) with check (user_id = auth.uid());

drop policy if exists post_likes_select on public.post_likes;
create policy post_likes_select on public.post_likes for select using (true);

drop policy if exists post_likes_write on public.post_likes;
create policy post_likes_write on public.post_likes for all
  using (user_id = auth.uid()) with check (user_id = auth.uid());

drop policy if exists comments_select on public.post_comments;
create policy comments_select on public.post_comments for select using (true);

drop policy if exists comments_write on public.post_comments;
create policy comments_write on public.post_comments for all
  using (user_id = auth.uid()) with check (user_id = auth.uid());

drop policy if exists reviews_select on public.reviews;
create policy reviews_select on public.reviews for select using (true);

drop policy if exists reviews_write on public.reviews;
create policy reviews_write on public.reviews for all
  using (user_id = auth.uid()) with check (user_id = auth.uid());

-- المحفوظات والإشعارات خاصة بصاحبها
drop policy if exists saved_items_own on public.saved_items;
create policy saved_items_own on public.saved_items for all
  using (user_id = auth.uid()) with check (user_id = auth.uid());

drop policy if exists notifications_own on public.notifications;
create policy notifications_own on public.notifications for all
  using (user_id = auth.uid()) with check (user_id = auth.uid());
