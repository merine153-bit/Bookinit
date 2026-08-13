-- =====================================================================
-- Passerelle TCF — المخطط الأساسي لقاعدة البيانات
-- طبّق هذا الملف عبر: Supabase Dashboard > SQL Editor > New query > Run
-- =====================================================================

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------
-- profiles: بيانات كل مستخدم (مرتبطة بـ auth.users)
-- ---------------------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text,
  email text,
  avatar_url text,
  target_clb int not null default 7,
  onboarded boolean not null default false,
  total_points int not null default 0,
  current_streak int not null default 0,
  longest_streak int not null default 0,
  last_activity_at date,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "profiles_select_own" on public.profiles
  for select using (auth.uid() = id);
create policy "profiles_update_own" on public.profiles
  for update using (auth.uid() = id);
create policy "profiles_insert_own" on public.profiles
  for insert with check (auth.uid() = id);

-- إنشاء صف profile تلقائيًا عند تسجيل مستخدم جديد (بريد إلكتروني أو Google)
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name'),
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
-- study_plans: خطة الدراسة المختارة (1، 2، 3، 6 أشهر)
-- ---------------------------------------------------------------------
create table if not exists public.study_plans (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  duration_months int not null check (duration_months in (1, 2, 3, 6)),
  plan_name text not null,
  started_at timestamptz not null default now(),
  target_exam_date date,
  is_active boolean not null default true
);

alter table public.study_plans enable row level security;

create policy "study_plans_all_own" on public.study_plans
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ---------------------------------------------------------------------
-- lesson_progress: تقدم المستخدم في كل مهارة
-- ---------------------------------------------------------------------
create table if not exists public.lesson_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  skill_area text not null check (
    skill_area in (
      'comprehension_orale', 'comprehension_ecrite',
      'expression_ecrite', 'expression_orale', 'grammaire_lexique'
    )
  ),
  completed_count int not null default 0,
  total_count int not null default 0,
  accuracy numeric not null default 0,
  updated_at timestamptz not null default now(),
  unique (user_id, skill_area)
);

alter table public.lesson_progress enable row level security;

create policy "lesson_progress_all_own" on public.lesson_progress
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ---------------------------------------------------------------------
-- question_bank: بنك الأسئلة المتجدد (تغذّيه Edge Functions بأسئلة AI جديدة)
-- ---------------------------------------------------------------------
create table if not exists public.question_bank (
  id uuid primary key default gen_random_uuid(),
  skill_area text not null,
  section text not null,
  difficulty_clb int not null default 6,
  type text not null,
  prompt text not null,
  passage text,
  audio_url text,
  options jsonb,
  correct_option_id text,
  correct_text text,
  explanation text,
  source_note text,
  tags text[] default '{}',
  created_by text not null default 'ai',
  created_at timestamptz not null default now()
);

alter table public.question_bank enable row level security;

create policy "question_bank_read_all" on public.question_bank
  for select using (auth.role() = 'authenticated');
-- الكتابة تتم فقط عبر Edge Functions بمفتاح service_role (يتجاوز RLS تلقائيًا)

-- ---------------------------------------------------------------------
-- exam_attempts: محاولات محاكاة الامتحان
-- ---------------------------------------------------------------------
create table if not exists public.exam_attempts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  mode text not null default 'full' check (mode in ('full', 'section')),
  status text not null default 'in_progress' check (status in ('in_progress', 'completed', 'abandoned')),
  seed text not null,
  started_at timestamptz not null default now(),
  completed_at timestamptz,
  duration_seconds int not null,
  results jsonb
);

alter table public.exam_attempts enable row level security;

create policy "exam_attempts_all_own" on public.exam_attempts
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ---------------------------------------------------------------------
-- exam_answers: إجابات المستخدم لكل سؤال ضمن محاولة الامتحان
-- ---------------------------------------------------------------------
create table if not exists public.exam_answers (
  id uuid primary key default gen_random_uuid(),
  exam_attempt_id uuid not null references public.exam_attempts (id) on delete cascade,
  question_id text not null,
  section text not null,
  selected_option_id text,
  written_answer text,
  audio_path text,
  flagged boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.exam_answers enable row level security;

create policy "exam_answers_select_own" on public.exam_answers
  for select using (
    exists (
      select 1 from public.exam_attempts a
      where a.id = exam_answers.exam_attempt_id and a.user_id = auth.uid()
    )
  );
create policy "exam_answers_insert_own" on public.exam_answers
  for insert with check (
    exists (
      select 1 from public.exam_attempts a
      where a.id = exam_answers.exam_attempt_id and a.user_id = auth.uid()
    )
  );

-- ---------------------------------------------------------------------
-- دالة: زيادة النقاط + تحديث سلسلة الأيام المتتالية (streak)
-- ---------------------------------------------------------------------
create or replace function public.increment_points(p_user_id uuid, p_points int)
returns void
language plpgsql
security definer set search_path = public
as $$
declare
  v_last date;
  v_current int;
  v_longest int;
begin
  select last_activity_at, current_streak, longest_streak
    into v_last, v_current, v_longest
  from public.profiles where id = p_user_id;

  if v_last is null or v_last < current_date - interval '1 day' then
    v_current := 1;
  elsif v_last = current_date - interval '1 day' then
    v_current := coalesce(v_current, 0) + 1;
  end if; -- إذا كان النشاط اليوم بالفعل، لا نغيّر السلسلة

  v_longest := greatest(coalesce(v_longest, 0), v_current);

  update public.profiles
  set total_points = total_points + p_points,
      current_streak = v_current,
      longest_streak = v_longest,
      last_activity_at = current_date
  where id = p_user_id;
end;
$$;

grant execute on function public.increment_points(uuid, int) to authenticated;

-- ---------------------------------------------------------------------
-- Storage: حاوية التسجيلات الصوتية (خاصة بكل مستخدم)
-- ---------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('voice-recordings', 'voice-recordings', false)
on conflict (id) do nothing;

create policy "voice_recordings_own_folder_select" on storage.objects
  for select using (
    bucket_id = 'voice-recordings' and (storage.foldername(name))[1] = auth.uid()::text
  );
create policy "voice_recordings_own_folder_insert" on storage.objects
  for insert with check (
    bucket_id = 'voice-recordings' and (storage.foldername(name))[1] = auth.uid()::text
  );
