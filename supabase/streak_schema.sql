-- Create streak tracking table
create table if not exists public.user_streaks (
    id uuid default gen_random_uuid() primary key,
    user_id uuid references auth.users(id) on delete cascade not null,
    current_streak int default 0 not null,
    longest_streak int default 0 not null,
    last_activity_date date not null,
    streak_freeze_available boolean default false not null,
    streak_freeze_expires_at timestamp with time zone,
    created_at timestamp with time zone default now() not null,
    updated_at timestamp with time zone default now() not null
);

-- Create daily activity tracking table
create table if not exists public.daily_activities (
    id uuid default gen_random_uuid() primary key,
    user_id uuid references auth.users(id) on delete cascade not null,
    activity_date date not null,
    xp_earned int default 0 not null,
    lessons_completed int default 0 not null,
    created_at timestamp with time zone default now() not null,
    unique(user_id, activity_date)
);

-- Create streak achievements table
create table if not exists public.streak_achievements (
    id uuid default gen_random_uuid() primary key,
    user_id uuid references auth.users(id) on delete cascade not null,
    achievement_type text not null,
    achieved_at timestamp with time zone default now() not null,
    streak_length int not null,
    unique(user_id, achievement_type, streak_length)
);

-- Create streak freeze purchases table
create table if not exists public.streak_freeze_purchases (
    id uuid default gen_random_uuid() primary key,
    user_id uuid references auth.users(id) on delete cascade not null,
    purchased_at timestamp with time zone default now() not null,
    expires_at timestamp with time zone not null,
    source text not null -- 'ad', 'coins', etc.
);

-- Function to update user streak
create or replace function public.update_user_streak(
    p_user_id uuid,
    p_activity_date date default current_date
)
returns void
language plpgsql
security definer
as $$
declare
    v_last_activity date;
    v_current_streak int;
    v_longest_streak int;
    v_has_freeze boolean;
    v_freeze_expires timestamp with time zone;
begin
    -- Get current streak info
    select 
        last_activity_date,
        current_streak,
        longest_streak,
        streak_freeze_available,
        streak_freeze_expires_at
    into 
        v_last_activity,
        v_current_streak,
        v_longest_streak,
        v_has_freeze,
        v_freeze_expires
    from public.user_streaks
    where user_id = p_user_id;

    -- If no streak record exists, create one
    if v_last_activity is null then
        insert into public.user_streaks (
            user_id,
            current_streak,
            longest_streak,
            last_activity_date
        ) values (
            p_user_id,
            1,
            1,
            p_activity_date
        );
        return;
    end if;

    -- Check if streak should continue
    if p_activity_date = v_last_activity + interval '1 day' then
        -- Consecutive day, increment streak
        v_current_streak := v_current_streak + 1;
        if v_current_streak > v_longest_streak then
            v_longest_streak := v_current_streak;
        end if;
    elsif p_activity_date = v_last_activity then
        -- Same day, no change
        return;
    elsif p_activity_date = v_last_activity + interval '2 day' and v_has_freeze and v_freeze_expires > now() then
        -- Used streak freeze
        v_current_streak := v_current_streak + 1;
        if v_current_streak > v_longest_streak then
            v_longest_streak := v_current_streak;
        end if;
        -- Remove used freeze
        v_has_freeze := false;
        v_freeze_expires := null;
    else
        -- Streak broken
        v_current_streak := 1;
    end if;

    -- Update streak record
    update public.user_streaks
    set 
        current_streak = v_current_streak,
        longest_streak = v_longest_streak,
        last_activity_date = p_activity_date,
        streak_freeze_available = v_has_freeze,
        streak_freeze_expires_at = v_freeze_expires,
        updated_at = now()
    where user_id = p_user_id;

    -- Check for achievements
    if v_current_streak in (7, 14, 30) then
        insert into public.streak_achievements (
            user_id,
            achievement_type,
            streak_length
        ) values (
            p_user_id,
            'streak_milestone',
            v_current_streak
        )
        on conflict (user_id, achievement_type, streak_length) do nothing;
    end if;
end;
$$;

-- Function to get user streak status
create or replace function public.get_user_streak_status(
    p_user_id uuid
)
returns table (
    current_streak int,
    longest_streak int,
    last_activity_date date,
    streak_freeze_available boolean,
    streak_freeze_expires_at timestamp with time zone,
    next_activity_deadline timestamp with time zone,
    days_until_streak_break int
)
language plpgsql
security definer
as $$
begin
    return query
    select 
        us.current_streak,
        us.longest_streak,
        us.last_activity_date,
        us.streak_freeze_available,
        us.streak_freeze_expires_at,
        case 
            when us.streak_freeze_available and us.streak_freeze_expires_at > now() then
                us.streak_freeze_expires_at
            else
                (us.last_activity_date + interval '2 days')::timestamp with time zone
        end as next_activity_deadline,
        case 
            when us.streak_freeze_available and us.streak_freeze_expires_at > now() then
                extract(day from (us.streak_freeze_expires_at - now()))
            else
                extract(day from ((us.last_activity_date + interval '2 days') - current_date))
        end::int as days_until_streak_break
    from public.user_streaks us
    where us.user_id = p_user_id;
end;
$$;

-- Function to get user's monthly activity calendar
create or replace function public.get_user_monthly_activity(
    p_user_id uuid,
    p_year int,
    p_month int
)
returns table (
    activity_date date,
    xp_earned int,
    lessons_completed int
)
language plpgsql
security definer
as $$
begin
    return query
    select 
        da.activity_date,
        da.xp_earned,
        da.lessons_completed
    from public.daily_activities da
    where 
        da.user_id = p_user_id
        and extract(year from da.activity_date) = p_year
        and extract(month from da.activity_date) = p_month
    order by da.activity_date;
end;
$$;

-- Add RLS policies
alter table public.user_streaks enable row level security;
alter table public.daily_activities enable row level security;
alter table public.streak_achievements enable row level security;
alter table public.streak_freeze_purchases enable row level security;

-- User streaks policies
create policy "Users can view their own streaks"
    on public.user_streaks for select
    using (auth.uid() = user_id);

create policy "Users can update their own streaks"
    on public.user_streaks for update
    using (auth.uid() = user_id);

-- Daily activities policies
create policy "Users can view their own activities"
    on public.daily_activities for select
    using (auth.uid() = user_id);

create policy "Users can insert their own activities"
    on public.daily_activities for insert
    with check (auth.uid() = user_id);

-- Streak achievements policies
create policy "Users can view their own achievements"
    on public.streak_achievements for select
    using (auth.uid() = user_id);

-- Streak freeze purchases policies
create policy "Users can view their own freeze purchases"
    on public.streak_freeze_purchases for select
    using (auth.uid() = user_id);

create policy "Users can insert their own freeze purchases"
    on public.streak_freeze_purchases for insert
    with check (auth.uid() = user_id); 