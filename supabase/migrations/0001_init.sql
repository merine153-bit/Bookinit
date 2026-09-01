-- =====================================================================
-- Eatit — المخطط الأساسي لقاعدة البيانات
-- =====================================================================

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------
-- أنواع مخصصة
-- ---------------------------------------------------------------------
do $$ begin
  create type user_role as enum ('USER', 'RESTAURANT_OWNER', 'ADMIN');
exception when duplicate_object then null; end $$;

do $$ begin
  create type saved_entity_type as enum ('restaurant', 'menu_item', 'post');
exception when duplicate_object then null; end $$;

do $$ begin
  create type badge_tone as enum ('new', 'popular');
exception when duplicate_object then null; end $$;

-- ---------------------------------------------------------------------
-- المستخدمون (ملف تعريفي مرتبط بـ auth.users)
-- ---------------------------------------------------------------------
create table if not exists public.users (
  id uuid primary key references auth.users (id) on delete cascade,
  username text unique,
  full_name text,
  bio text,
  avatar_url text,
  role user_role not null default 'USER',
  followers_count integer not null default 0,
  following_count integer not null default 0,
  created_at timestamptz not null default now()
);

-- إنشاء ملف تعريفي تلقائياً لكل مستخدم جديد
create or replace function public.handle_new_user()
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
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------
-- المطاعم
-- ---------------------------------------------------------------------
create table if not exists public.restaurants (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid references public.users (id) on delete set null,
  name text not null,
  slug text not null unique,
  description text default '',
  short_description text default '',
  logo_url text,
  cover_url text,
  category text not null default 'مطاعم',
  tags text[] not null default '{}',
  address text,
  city text,
  latitude double precision not null default 0,
  longitude double precision not null default 0,
  rating numeric(2, 1) not null default 0,
  review_count integer not null default 0,
  follower_count integer not null default 0,
  like_count integer not null default 0,
  price_range smallint not null default 2 check (price_range between 1 and 3),
  is_verified boolean not null default false,
  phone text,
  distance_km numeric(5, 2) not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists restaurants_category_idx on public.restaurants (category);
create index if not exists restaurants_rating_idx on public.restaurants (rating desc);
create index if not exists restaurants_owner_idx on public.restaurants (owner_id);

create table if not exists public.restaurant_hours (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references public.restaurants (id) on delete cascade,
  day_of_week smallint not null check (day_of_week between 0 and 6),
  opens_at text not null default '09:00',
  closes_at text not null default '23:00',
  is_closed boolean not null default false,
  unique (restaurant_id, day_of_week)
);

create table if not exists public.restaurant_followers (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references public.restaurants (id) on delete cascade,
  user_id uuid not null references public.users (id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (restaurant_id, user_id)
);

-- ---------------------------------------------------------------------
-- القوائم
-- ---------------------------------------------------------------------
create table if not exists public.menu_categories (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references public.restaurants (id) on delete cascade,
  name text not null,
  sort_order integer not null default 0
);

create index if not exists menu_categories_restaurant_idx on public.menu_categories (restaurant_id, sort_order);

create table if not exists public.menu_items (
  id uuid primary key default gen_random_uuid(),
  category_id uuid not null references public.menu_categories (id) on delete cascade,
  restaurant_id uuid not null references public.restaurants (id) on delete cascade,
  name text not null,
  description text default '',
  price numeric(10, 2) not null default 0,
  currency text not null default 'ر.س',
  image_url text,
  is_available boolean not null default true,
  tags text[] not null default '{}',
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists menu_items_restaurant_idx on public.menu_items (restaurant_id, sort_order);
create index if not exists menu_items_category_idx on public.menu_items (category_id, sort_order);

-- ---------------------------------------------------------------------
-- المحتوى الاجتماعي
-- ---------------------------------------------------------------------
create table if not exists public.posts (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references public.restaurants (id) on delete cascade,
  author_id uuid references public.users (id) on delete set null,
  caption text default '',
  image_url text,
  badge text,
  badge_tone badge_tone not null default 'new',
  like_count integer not null default 0,
  comment_count integer not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists posts_created_idx on public.posts (created_at desc);
create index if not exists posts_restaurant_idx on public.posts (restaurant_id);

create table if not exists public.post_likes (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts (id) on delete cascade,
  user_id uuid not null references public.users (id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (post_id, user_id)
);

create table if not exists public.post_comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts (id) on delete cascade,
  user_id uuid references public.users (id) on delete set null,
  author_name text not null default 'ضيف',
  author_avatar text,
  body text not null,
  created_at timestamptz not null default now()
);

create index if not exists post_comments_post_idx on public.post_comments (post_id, created_at desc);

create table if not exists public.restaurant_stories (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references public.restaurants (id) on delete cascade,
  title text not null default '',
  image_url text,
  caption text default '',
  created_at timestamptz not null default now(),
  expires_at timestamptz not null default (now() + interval '24 hours')
);

create index if not exists stories_expiry_idx on public.restaurant_stories (expires_at desc);

create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references public.restaurants (id) on delete cascade,
  user_id uuid references public.users (id) on delete set null,
  author_name text not null default 'ضيف',
  author_avatar text,
  rating numeric(2, 1) not null check (rating between 1 and 5),
  comment text default '',
  created_at timestamptz not null default now()
);

create index if not exists reviews_restaurant_idx on public.reviews (restaurant_id, created_at desc);

create table if not exists public.saved_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users (id) on delete cascade,
  entity_type saved_entity_type not null,
  entity_id uuid not null,
  created_at timestamptz not null default now(),
  unique (user_id, entity_type, entity_id)
);

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users (id) on delete cascade,
  title text not null,
  body text default '',
  href text default '/',
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- تحديث تلقائي لمتوسط التقييم وعدد التقييمات
-- ---------------------------------------------------------------------
create or replace function public.refresh_restaurant_rating()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  target uuid := coalesce(new.restaurant_id, old.restaurant_id);
begin
  update public.restaurants r
  set rating = coalesce((select round(avg(rating)::numeric, 1) from public.reviews where restaurant_id = target), 0),
      review_count = (select count(*) from public.reviews where restaurant_id = target)
  where r.id = target;
  return null;
end;
$$;

drop trigger if exists reviews_refresh_rating on public.reviews;
create trigger reviews_refresh_rating
  after insert or update or delete on public.reviews
  for each row execute function public.refresh_restaurant_rating();
