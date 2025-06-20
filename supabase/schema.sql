-- Enable necessary extensions
create extension if not exists "uuid-ossp";

-- Create profiles table
create table if not exists public.profiles (
    id uuid references auth.users on delete cascade primary key,
    name text,
    email text unique,
    avatar_url text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create user_progress table
create table if not exists public.user_progress (
    id uuid default uuid_generate_v4() primary key,
    user_id uuid references public.profiles(id) on delete cascade not null,
    completed_lessons text[] default '{}',
    lesson_progress jsonb default '{}',
    streak integer default 0,
    last_streak timestamp with time zone,
    xp integer default 0,
    level integer default 1,
    perfect_lessons text[] default '{}',
    total_exercises_completed integer default 0,
    unlocked_lessons text[] default '{}',
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
    unique(user_id)
);

-- Create badges table
create table if not exists public.badges (
    id text primary key,
    name text not null,
    description text not null,
    icon text not null,
    requirement text not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create user_badges table
create table if not exists public.user_badges (
    id uuid default uuid_generate_v4() primary key,
    user_id uuid references public.profiles(id) on delete cascade not null,
    badge_id text references public.badges(id) on delete cascade not null,
    earned_date timestamp with time zone default timezone('utc'::text, now()) not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    unique(user_id, badge_id)
);

-- Create function to handle user creation
create or replace function public.handle_new_user()
returns trigger as $$
begin
    insert into public.profiles (id, email, name)
    values (new.id, new.email, coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)));
    return new;
end;
$$ language plpgsql security definer;

-- Create trigger for new user creation
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
    after insert on auth.users
    for each row execute procedure public.handle_new_user();

-- Set up Row Level Security (RLS)

-- Enable RLS on all tables
alter table public.profiles enable row level security;
alter table public.user_progress enable row level security;
alter table public.badges enable row level security;
alter table public.user_badges enable row level security;

-- Drop existing policies if they exist
drop policy if exists "Users can view their own profile" on public.profiles;
drop policy if exists "Users can update their own profile" on public.profiles;
drop policy if exists "Users can view their own progress" on public.user_progress;
drop policy if exists "Users can update their own progress" on public.user_progress;
drop policy if exists "Users can insert their own progress" on public.user_progress;
drop policy if exists "Anyone can view badges" on public.badges;
drop policy if exists "Users can view their own badges" on public.user_badges;
drop policy if exists "Users can insert their own badges" on public.user_badges;
drop policy if exists "Users can delete their own badges" on public.user_badges;

-- Create new policies
create policy "Users can view their own profile"
    on public.profiles for select
    using (auth.uid() = id);

create policy "Users can update their own profile"
    on public.profiles for update
    using (auth.uid() = id);

create policy "Users can view their own progress"
    on public.user_progress for select
    using (auth.uid() = user_id);

create policy "Users can update their own progress"
    on public.user_progress for update
    using (auth.uid() = user_id);

create policy "Users can insert their own progress"
    on public.user_progress for insert
    with check (auth.uid() = user_id);

create policy "Anyone can view badges"
    on public.badges for select
    to authenticated
    using (true);

create policy "Users can view their own badges"
    on public.user_badges for select
    using (auth.uid() = user_id);

create policy "Users can insert their own badges"
    on public.user_badges for insert
    with check (auth.uid() = user_id);

create policy "Users can delete their own badges"
    on public.user_badges for delete
    using (auth.uid() = user_id);

-- Insert default badges (only if they don't exist)
insert into public.badges (id, name, description, icon, requirement)
select * from (values
    ('first_lesson', 'First Steps', 'Complete your first lesson', '🎯', 'Complete any lesson'),
    ('perfect_lesson', 'Perfect Score', 'Complete a lesson with 100% accuracy', '⭐', 'Get 100% on any lesson'),
    ('streak_3', 'On Fire', 'Maintain a 3-day streak', '🔥', 'Complete lessons for 3 consecutive days'),
    ('streak_7', 'Unstoppable', 'Maintain a 7-day streak', '🌟', 'Complete lessons for 7 consecutive days'),
    ('level_5', 'Rising Star', 'Reach level 5', '🌠', 'Accumulate enough XP to reach level 5'),
    ('level_10', 'Language Master', 'Reach level 10', '👑', 'Accumulate enough XP to reach level 10'),
    ('share_progress', 'Social Butterfly', 'Share your progress', '🦋', 'Share your progress with others'),
    ('complete_all', 'Completionist', 'Complete all available lessons', '🏆', 'Finish every lesson in the app')
) as v(id, name, description, icon, requirement)
where not exists (
    select 1 from public.badges where id = v.id
);

-- Create indexes for better performance
create index if not exists idx_user_progress_user_id on public.user_progress(user_id);
create index if not exists idx_user_badges_user_id on public.user_badges(user_id);
create index if not exists idx_user_badges_badge_id on public.user_badges(badge_id);

-- Function to update user progress and check for badges
create or replace function public.update_user_progress(
    p_user_id uuid,
    p_completed_lesson text,
    p_xp_gained integer,
    p_perfect boolean default false
)
returns json as $$
declare
    v_current_progress public.user_progress;
    v_new_badges text[];
    v_result json;
begin
    -- Get current progress
    select * into v_current_progress
    from public.user_progress
    where user_id = p_user_id;

    -- Update progress
    update public.user_progress
    set
        completed_lessons = array_append(completed_lessons, p_completed_lesson),
        xp = xp + p_xp_gained,
        level = floor((xp + p_xp_gained) / 100) + 1,
        perfect_lessons = case when p_perfect then array_append(perfect_lessons, p_completed_lesson) else perfect_lessons end,
        total_exercises_completed = total_exercises_completed + 1,
        updated_at = now()
    where user_id = p_user_id
    returning * into v_current_progress;

    -- Check for new badges
    with new_badges as (
        select b.id
        from public.badges b
        where not exists (
            select 1
            from public.user_badges ub
            where ub.user_id = p_user_id
            and ub.badge_id = b.id
        )
        and (
            -- First lesson badge
            (b.id = 'first_lesson' and array_length(v_current_progress.completed_lessons, 1) = 1)
            or
            -- Perfect lesson badge
            (b.id = 'perfect_lesson' and p_perfect)
            or
            -- Streak badges
            (b.id = 'streak_3' and v_current_progress.streak >= 3)
            or
            (b.id = 'streak_7' and v_current_progress.streak >= 7)
            or
            -- Level badges
            (b.id = 'level_5' and v_current_progress.level >= 5)
            or
            (b.id = 'level_10' and v_current_progress.level >= 10)
            or
            -- Complete all lessons badge
            (b.id = 'complete_all' and array_length(v_current_progress.completed_lessons, 1) >= 50)
        )
    )
    insert into public.user_badges (user_id, badge_id)
    select p_user_id, id
    from new_badges
    returning badge_id into v_new_badges;

    -- Return updated progress and new badges
    select json_build_object(
        'progress', v_current_progress,
        'new_badges', v_new_badges
    ) into v_result;

    return v_result;
end;
$$ language plpgsql security definer;

-- Function to get user statistics
create or replace function public.get_user_stats(p_user_id uuid)
returns json as $$
declare
    v_result json;
begin
    select json_build_object(
        'profile', (
            select json_build_object(
                'id', p.id,
                'name', p.name,
                'email', p.email,
                'avatar_url', p.avatar_url,
                'created_at', p.created_at
            )
            from public.profiles p
            where p.id = p_user_id
        ),
        'progress', (
            select json_build_object(
                'completed_lessons', up.completed_lessons,
                'streak', up.streak,
                'xp', up.xp,
                'level', up.level,
                'perfect_lessons', up.perfect_lessons,
                'total_exercises_completed', up.total_exercises_completed
            )
            from public.user_progress up
            where up.user_id = p_user_id
        ),
        'badges', (
            select json_agg(json_build_object(
                'id', b.id,
                'name', b.name,
                'description', b.description,
                'icon', b.icon,
                'earned_date', ub.earned_date
            ))
            from public.user_badges ub
            join public.badges b on b.id = ub.badge_id
            where ub.user_id = p_user_id
        )
    ) into v_result;

    return v_result;
end;
$$ language plpgsql security definer;

-- Function to update user streak
create or replace function public.update_user_streak(p_user_id uuid)
returns integer as $$
declare
    v_current_streak integer;
    v_last_streak timestamp with time zone;
    v_new_streak integer;
begin
    -- Get current streak info
    select streak, last_streak
    into v_current_streak, v_last_streak
    from public.user_progress
    where user_id = p_user_id;

    -- Check if last streak was yesterday
    if v_last_streak is null or
       v_last_streak < current_date - interval '1 day' or
       v_last_streak > current_date then
        v_new_streak := 1;
    else
        v_new_streak := v_current_streak + 1;
    end if;

    -- Update streak
    update public.user_progress
    set
        streak = v_new_streak,
        last_streak = current_timestamp,
        updated_at = now()
    where user_id = p_user_id;

    return v_new_streak;
end;
$$ language plpgsql security definer;

-- Function to get leaderboard
create or replace function public.get_leaderboard(
    p_limit integer default 10,
    p_offset integer default 0
)
returns table (
    user_id uuid,
    name text,
    avatar_url text,
    xp integer,
    level integer,
    streak integer,
    rank bigint
) as $$
begin
    return query
    with ranked_users as (
        select
            up.user_id,
            p.name,
            p.avatar_url,
            up.xp,
            up.level,
            up.streak,
            rank() over (order by up.xp desc, up.streak desc)
        from public.user_progress up
        join public.profiles p on p.id = up.user_id
    )
    select
        user_id,
        name,
        avatar_url,
        xp,
        level,
        streak,
        rank
    from ranked_users
    where rank between p_offset + 1 and p_offset + p_limit
    order by rank;
end;
$$ language plpgsql security definer; 