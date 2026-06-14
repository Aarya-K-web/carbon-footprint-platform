-- 1. Create public profiles table
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  full_name text not null default '',
  avatar_url text not null default '',
  sustainability_goal text check (sustainability_goal in ('low-carbon', 'carbon-neutral', 'zero-waste', 'eco-guardian')) default 'low-carbon',
  target_carbon_reduction integer default 15 check (target_carbon_reduction >= 0 and target_carbon_reduction <= 100),
  sustainability_score integer default 0 not null,
  onboarding_completed boolean default false not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.profiles enable row level security;

-- Create RLS Policies
create policy "Allow authenticated users to read profiles"
  on public.profiles for select
  using (auth.role() = 'authenticated');

create policy "Allow users to update their own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- Create automatic profile trigger on auth signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, avatar_url, sustainability_goal, target_carbon_reduction, sustainability_score, onboarding_completed)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    coalesce(new.raw_user_meta_data->>'avatar_url', ''),
    'low-carbon',
    15,
    0,
    false
  );
  return new;
end;
$$ language plpgsql security definer;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 2. Storage bucket creation and policies for avatars
insert into storage.buckets (id, name, public) 
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

create policy "Allow public read access to avatars"
  on storage.objects for select
  using (bucket_id = 'avatars');

create policy "Allow authenticated users to upload their own avatar"
  on storage.objects for insert
  with check (bucket_id = 'avatars' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "Allow authenticated users to update their own avatar"
  on storage.objects for update
  using (bucket_id = 'avatars' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "Allow authenticated users to delete their own avatar"
  on storage.objects for delete
  using (bucket_id = 'avatars' and auth.uid()::text = (storage.foldername(name))[1]);

-- 3. Future-proofing: Carbon footprint history ledger
create table public.carbon_history (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  recorded_at timestamp with time zone default timezone('utc'::text, now()) not null,
  diet_annual_co2e numeric not null,
  transport_annual_co2e numeric not null,
  household_annual_co2e numeric not null,
  total_annual_co2e numeric not null,
  mitigation_savings_co2e numeric not null,
  net_co2e numeric not null
);

alter table public.carbon_history enable row level security;

create policy "Allow users to read their own carbon history"
  on public.carbon_history for select
  using (auth.uid() = user_id);

create policy "Allow users to insert their own carbon history"
  on public.carbon_history for insert
  with check (auth.uid() = user_id);

-- 4. Future-proofing: Gamification badge achievements
create table public.user_achievements (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  badge_id text not null,
  unlocked_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique (user_id, badge_id)
);

alter table public.user_achievements enable row level security;

create policy "Allow users to read their own achievements"
  on public.user_achievements for select
  using (auth.uid() = user_id);

create policy "Allow users to insert achievements"
  on public.user_achievements for insert
  with check (auth.uid() = user_id);

-- 5. Future-proofing: Challenges
create table public.challenges (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  description text,
  carbon_saving_kg numeric not null,
  duration_days integer not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.challenges enable row level security;

create policy "Allow authenticated users to read challenges"
  on public.challenges for select
  using (auth.role() = 'authenticated');

create table public.user_challenges (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  challenge_id uuid references public.challenges(id) on delete cascade not null,
  status text check (status in ('active', 'completed', 'abandoned')) default 'active' not null,
  started_at timestamp with time zone default timezone('utc'::text, now()) not null,
  completed_at timestamp with time zone,
  unique (user_id, challenge_id)
);

alter table public.user_challenges enable row level security;

create policy "Allow users to read their own challenge participation"
  on public.user_challenges for select
  using (auth.uid() = user_id);

create policy "Allow users to update their challenge status"
  on public.user_challenges for update
  using (auth.uid() = user_id);

create policy "Allow users to join challenges"
  on public.user_challenges for insert
  with check (auth.uid() = user_id);

-- 6. Future-proofing: AI diagnostic reports
create table public.ai_reports (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  prompt text not null,
  report_content text not null,
  suggestions jsonb
);

alter table public.ai_reports enable row level security;

create policy "Allow users to read their own AI reports"
  on public.ai_reports for select
  using (auth.uid() = user_id);

create policy "Allow users to create AI reports"
  on public.ai_reports for insert
  with check (auth.uid() = user_id);

-- 7. Future-proofing: Leaderboard View
create or replace view public.leaderboard as
  select 
    id as user_id, 
    full_name, 
    avatar_url, 
    sustainability_goal,
    target_carbon_reduction,
    sustainability_score
  from public.profiles
  order by sustainability_score desc, target_carbon_reduction desc;
