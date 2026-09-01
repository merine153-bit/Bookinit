-- =====================================================================
-- Eatit — فصل التقييمات التاريخية عن التقييمات الحيّة
--
-- المشكلة: المحفّز كان يحسب متوسط التقييم من جدول reviews وحده، فمطعم
-- له تقييمان يظهر بـ«5.0 من تقييمين» بدل رقمه الحقيقي المتراكم.
--
-- الحل: عمودان يحملان الرصيد التاريخي (المستورد من منصات أخرى أو من
-- تقييمات لم تُهاجَر)، ويصبح المعروض متوسطاً مرجّحاً للرصيد + الحيّ.
-- =====================================================================

alter table public.restaurants
  add column if not exists base_rating numeric(2, 1) not null default 0,
  add column if not exists base_review_count integer not null default 0;

comment on column public.restaurants.base_rating is
  'متوسط التقييم التاريخي المستورد — يُدمج مع تقييمات جدول reviews.';
comment on column public.restaurants.base_review_count is
  'عدد التقييمات التاريخية المستوردة.';

create or replace function public.refresh_restaurant_rating()
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

-- إعادة احتساب كل المطاعم مرة واحدة بعد تغيير المعادلة.
do $$
declare
  r record;
begin
  for r in select id from public.restaurants loop
    update public.restaurants t
       set review_count = t.base_review_count + coalesce(live.cnt, 0),
           rating = case
             when t.base_review_count + coalesce(live.cnt, 0) = 0 then 0
             else round(
               (t.base_rating * t.base_review_count + coalesce(live.total, 0))
               / (t.base_review_count + coalesce(live.cnt, 0)), 1)
           end
      from (
        select count(*) as cnt, coalesce(sum(rating), 0) as total
          from public.reviews where restaurant_id = r.id
      ) as live
     where t.id = r.id;
  end loop;
end $$;
