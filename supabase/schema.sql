-- ==============================================================================
-- Supabase Schema for Gym Workout Tracker
-- ==============================================================================

-- 1. Create PROFILES table
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  unit_preference text not null default 'lbs' check (unit_preference in ('lbs', 'kgs')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 2. Create EXERCISES table
create table if not exists public.exercises (
  id text primary key,
  user_id uuid references auth.users(id) on delete cascade, -- null for built-in system exercises
  name text not null,
  split text not null,
  image_url text default '',
  is_custom boolean not null default false,
  all_splits boolean not null default false,
  created_at timestamptz not null default now()
);

-- 3. Create WORKOUT_LOGS table
create table if not exists public.workout_logs (
  id text primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  date timestamptz not null,
  split text not null,
  cardio_time integer not null default 0,
  cardio_distance numeric(8, 2) not null default 0,
  cardio_calories integer not null default 0,
  exercises jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);

-- 4. Create PROGRESS_ENTRIES table
create table if not exists public.progress_entries (
  id text primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  date timestamptz not null,
  weight numeric(6, 2) not null,
  unit text not null check (unit in ('lbs', 'kgs')),
  photo_url text default '',
  notes text default '',
  created_at timestamptz not null default now()
);

-- ==============================================================================
-- Indexes for Performance
-- ==============================================================================
create index if not exists idx_exercises_user_id on public.exercises(user_id);
create index if not exists idx_exercises_split on public.exercises(split);
create index if not exists idx_workout_logs_user_id on public.workout_logs(user_id);
create index if not exists idx_workout_logs_date on public.workout_logs(date desc);
create index if not exists idx_progress_entries_user_id on public.progress_entries(user_id);
create index if not exists idx_progress_entries_date on public.progress_entries(date desc);

-- ==============================================================================
-- Row Level Security (RLS)
-- ==============================================================================

alter table public.profiles enable row level security;
alter table public.exercises enable row level security;
alter table public.workout_logs enable row level security;
alter table public.progress_entries enable row level security;

-- PROFILES Policies
drop policy if exists "Users can view own profile" on public.profiles;
create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

drop policy if exists "Users can update own profile" on public.profiles;
create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

drop policy if exists "Users can insert own profile" on public.profiles;
create policy "Users can insert own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

-- EXERCISES Policies: System exercises readable by all; custom exercises isolated per user
drop policy if exists "Anyone can read system exercises, user can read own" on public.exercises;
create policy "Anyone can read system exercises, user can read own"
  on public.exercises for select
  using (user_id is null or auth.uid() = user_id);

drop policy if exists "Users can insert own custom exercises" on public.exercises;
create policy "Users can insert own custom exercises"
  on public.exercises for insert
  with check (auth.uid() = user_id and is_custom = true);

drop policy if exists "Users can update own custom exercises" on public.exercises;
create policy "Users can update own custom exercises"
  on public.exercises for update
  using (auth.uid() = user_id and is_custom = true);

drop policy if exists "Users can delete own custom exercises" on public.exercises;
create policy "Users can delete own custom exercises"
  on public.exercises for delete
  using (auth.uid() = user_id and is_custom = true);

-- WORKOUT_LOGS Policies
drop policy if exists "Users can read own workout logs" on public.workout_logs;
create policy "Users can read own workout logs"
  on public.workout_logs for select
  using (auth.uid() = user_id);

drop policy if exists "Users can insert own workout logs" on public.workout_logs;
create policy "Users can insert own workout logs"
  on public.workout_logs for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users can update own workout logs" on public.workout_logs;
create policy "Users can update own workout logs"
  on public.workout_logs for update
  using (auth.uid() = user_id);

drop policy if exists "Users can delete own workout logs" on public.workout_logs;
create policy "Users can delete own workout logs"
  on public.workout_logs for delete
  using (auth.uid() = user_id);

-- PROGRESS_ENTRIES Policies
drop policy if exists "Users can read own progress entries" on public.progress_entries;
create policy "Users can read own progress entries"
  on public.progress_entries for select
  using (auth.uid() = user_id);

drop policy if exists "Users can insert own progress entries" on public.progress_entries;
create policy "Users can insert own progress entries"
  on public.progress_entries for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users can update own progress entries" on public.progress_entries;
create policy "Users can update own progress entries"
  on public.progress_entries for update
  using (auth.uid() = user_id);

drop policy if exists "Users can delete own progress entries" on public.progress_entries;
create policy "Users can delete own progress entries"
  on public.progress_entries for delete
  using (auth.uid() = user_id);

-- ==============================================================================
-- Auto-create profile on user signup Trigger
-- ==============================================================================
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, unit_preference)
  values (new.id, 'lbs')
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ==============================================================================
-- Seed Built-in Exercises (user_id is null, is_custom = false)
-- ==============================================================================
insert into public.exercises (id, user_id, name, split, image_url, is_custom, all_splits)
values
  -- Workout A
  ('workout-a-1', null, 'Lat Pull Down', 'Workout A', 'https://cdn.muscleandstrength.com/sites/default/files/lat-pull-down.jpg', false, false),
  ('workout-a-2', null, 'Incline Press', 'Workout A', 'https://app-media.fitbod.me/v2/162/images/landscape/0_960x540.jpg', false, false),
  ('workout-a-3', null, 'Shoulder Press', 'Workout A', 'https://gymgear.com/cdn/shop/articles/AdobeStock_29077846-scaled-4601848_6d1b52a1-9df4-426d-a160-b2c938ebfa0b-5067431.jpg?v=1767911052', false, false),
  ('workout-a-4', null, 'Lateral Raises', 'Workout A', 'https://i0.wp.com/www.muscleandfitness.com/wp-content/uploads/2019/06/Jeremy-Buendia-Lateral-Dumbbell-Raise.jpg?quality=86&strip=all', false, false),
  ('workout-a-5', null, 'Preacher Curl', 'Workout A', 'https://ozhelp.org.au/blog/wp-content/uploads/2025/02/Mastering-the-Preacher-Curl-A-Step-by-Step-Video-Guide.jpg', false, false),
  ('workout-a-6', null, 'Triceps Cable Overhead', 'Workout A', 'https://i.ytimg.com/vi/1u18yJELsh0/maxresdefault.jpg', false, false),
  ('workout-a-7', null, 'Reverse Curl', 'Workout A', 'https://barbend.com/wp-content/uploads/2023/01/Barbend.com-Article-Image-760x427-Person-performing-a-reverse-bicep-curl.jpg', false, false),
  ('workout-a-8', null, 'Leg Raises', 'Workout A', 'https://selectfitness.com/cdn/shop/files/body-solid-powerline-pvkc83x-vertical-knee-raise-leg-lifts.jpg?v=1715190829&width=2048', false, false),

  -- Workout B
  ('workout-b-1', null, 'T-Bar Row', 'Workout B', 'https://cdn.muscleandstrength.com/sites/default/files/t-bar-row.jpg', false, false),
  ('workout-b-2', null, 'Vertical Chest Press', 'Workout B', 'https://www.panattagymequipment.com.au/wp-content/uploads/2020/05/pic-1mth033_03-700x700.jpg', false, false),
  ('workout-b-3', null, 'Shrugs', 'Workout B', 'https://cdn.muscleandstrength.com/sites/default/files/dumbbell-shrug.jpg', false, false),
  ('workout-b-4', null, 'Rear Delt Fly', 'Workout B', 'https://cdn.muscleandstrength.com/sites/default/files/machine-reverse-fly.jpg', false, false),
  ('workout-b-5', null, 'Hammer Curl', 'Workout B', 'https://theenterpriseworld.com/wp-content/uploads/2025/03/1.-Hammer-Curls-Muscles-Workout-for-Bigger-Stronger-Arms-by-As-Images.jpg', false, false),
  ('workout-b-6', null, 'Triceps Push Down', 'Workout B', 'https://media.istockphoto.com/id/1342504639/photo/a-man-doing-triceps-pushdown-exercise-at-the-gym.jpg?s=612x612&w=0&k=20&c=bE74g7r9thVCwLSLcftp4nle-bWe2iOjs3_xL92tiIA=', false, false),
  ('workout-b-7', null, 'Wrist Curl', 'Workout B', 'https://www.puregym.com/media/x3cpuyoz/wrist-flexion.jpg?quality=80', false, false),
  ('workout-b-8', null, 'General Abs / Crunches', 'Workout B', 'https://i0.wp.com/www.muscleandfitness.com/wp-content/uploads/2017/07/1109-ryan-terry-weighted-crunch-abs.jpg?quality=86&strip=all', false, false),

  -- Workout C
  ('workout-c-1', null, 'Lat Pull Down', 'Workout C', 'https://cdn.muscleandstrength.com/sites/default/files/lat-pull-down.jpg', false, false),
  ('workout-c-2', null, 'Butterfly Machine', 'Workout C', 'https://fitnessdepot.pk/wp-content/uploads/2023/12/Tips-and-Tricks-to-Make-Use-of-Your-Butterfly-Machine-jpg.webp', false, false),
  ('workout-c-3', null, 'Lateral Raises', 'Workout C', 'https://i0.wp.com/www.muscleandfitness.com/wp-content/uploads/2019/06/Jeremy-Buendia-Lateral-Dumbbell-Raise.jpg?quality=86&strip=all', false, false),
  ('workout-c-4', null, 'Incline Curl', 'Workout C', 'https://cdn.jefit.com/assets/img/exercises/gifs/106.gif', false, false),
  ('workout-c-5', null, 'Preacher Curl', 'Workout C', 'https://ozhelp.org.au/blog/wp-content/uploads/2025/02/Mastering-the-Preacher-Curl-A-Step-by-Step-Video-Guide.jpg', false, false),
  ('workout-c-6', null, 'Triceps Cable Overhead', 'Workout C', 'https://i.ytimg.com/vi/1u18yJELsh0/maxresdefault.jpg', false, false),
  ('workout-c-7', null, 'Triceps Push Down', 'Workout C', 'https://media.istockphoto.com/id/1342504639/photo/a-man-doing-triceps-pushdown-exercise-at-the-gym.jpg?s=612x612&w=0&k=20&c=bE74g7r9thVCwLSLcftp4nle-bWe2iOjs3_xL92tiIA=', false, false),
  ('workout-c-8', null, 'Leg Raises', 'Workout C', 'https://selectfitness.com/cdn/shop/files/body-solid-powerline-pvkc83x-vertical-knee-raise-leg-lifts.jpg?v=1715190829&width=2048', false, false),

  -- Workout D
  ('workout-d-1', null, 'Seated Row', 'Workout D', 'https://cdn.muscleandstrength.com/sites/default/files/seated-cable-row.jpg', false, false),
  ('workout-d-2', null, 'Rear Delt Fly', 'Workout D', 'https://cdn.muscleandstrength.com/sites/default/files/machine-reverse-fly.jpg', false, false),
  ('workout-d-3', null, 'Hammer Curl', 'Workout D', 'https://theenterpriseworld.com/wp-content/uploads/2025/03/1.-Hammer-Curls-Muscles-Workout-for-Bigger-Stronger-Arms-by-As-Images.jpg', false, false),
  ('workout-d-4', null, 'Reverse Curl', 'Workout D', 'https://barbend.com/wp-content/uploads/2023/01/Barbend.com-Article-Image-760x427-Person-performing-a-reverse-bicep-curl.jpg', false, false),
  ('workout-d-5', null, 'Wrist Curl', 'Workout D', 'https://www.puregym.com/media/x3cpuyoz/wrist-flexion.jpg?quality=80', false, false),
  ('workout-d-6', null, 'General Abs / Crunches', 'Workout D', 'https://i0.wp.com/www.muscleandfitness.com/wp-content/uploads/2017/07/1109-ryan-terry-weighted-crunch-abs.jpg?quality=86&strip=all', false, false),
  ('workout-d-7', null, 'Shoulder Press', 'Workout D', 'https://gymgear.com/cdn/shop/articles/AdobeStock_29077846-scaled-4601848_6d1b52a1-9df4-426d-a160-b2c938ebfa0b-5067431.jpg?v=1767911052', false, false),
  ('workout-d-8', null, 'Leg Raises', 'Workout D', 'https://selectfitness.com/cdn/shop/files/body-solid-powerline-pvkc83x-vertical-knee-raise-leg-lifts.jpg?v=1715190829&width=2048', false, false),

  -- Home Workout
  ('home-1', null, 'Push Up', 'Home Workout', 'https://fitnessfaqs.com/wp-content/uploads/2023/12/IMG_1170.jpg', false, false),
  ('home-2', null, 'Pull Up', 'Home Workout', 'https://cdn.centr.com/content/35000/34447/images/landscapemobile3x-header-lz-pullupbar-169.jpg', false, false),
  ('home-3', null, 'Hand Gripper', 'Home Workout', 'https://www.mecastrong.com/wp-content/uploads/2026/02/Grip-strength-training-with-hand-grippers.webp', false, false),
  ('home-4', null, 'Bodyweight Squat', 'Home Workout', 'https://hips.hearstapps.com/hmg-prod/images/man-exercising-at-home-royalty-free-image-1645047847.jpg?resize=980:*', false, false),
  ('home-5', null, 'Plank Hold', 'Home Workout', 'https://gymnation.com/media/jpbjzofv/plank2.webp?width=956&height=675&v=1dc68400a14c040', false, false)
on conflict (id) do nothing;
