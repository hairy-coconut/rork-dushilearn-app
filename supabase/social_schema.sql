-- Create friends table
create table if not exists public.friends (
    id uuid default gen_random_uuid() primary key,
    user_id uuid references auth.users(id) on delete cascade not null,
    friend_id uuid references auth.users(id) on delete cascade not null,
    status text not null check (status in ('pending', 'accepted', 'blocked')),
    created_at timestamp with time zone default now() not null,
    updated_at timestamp with time zone default now() not null,
    unique(user_id, friend_id)
);

-- Create leaderboards table
create table if not exists public.leaderboards (
    id uuid default gen_random_uuid() primary key,
    user_id uuid references auth.users(id) on delete cascade not null,
    period text not null check (period in ('daily', 'weekly', 'monthly', 'all_time')),
    xp int default 0 not null,
    rank int,
    created_at timestamp with time zone default now() not null,
    updated_at timestamp with time zone default now() not null,
    unique(user_id, period)
);

-- Create challenges table
create table if not exists public.challenges (
    id uuid default gen_random_uuid() primary key,
    creator_id uuid references auth.users(id) on delete cascade not null,
    title text not null,
    description text,
    type text not null check (type in ('xp', 'lessons', 'streak', 'accuracy')),
    target int not null,
    start_date timestamp with time zone not null,
    end_date timestamp with time zone not null,
    created_at timestamp with time zone default now() not null,
    updated_at timestamp with time zone default now() not null
);

-- Create challenge participants table
create table if not exists public.challenge_participants (
    id uuid default gen_random_uuid() primary key,
    challenge_id uuid references public.challenges(id) on delete cascade not null,
    user_id uuid references auth.users(id) on delete cascade not null,
    progress int default 0 not null,
    completed boolean default false not null,
    created_at timestamp with time zone default now() not null,
    updated_at timestamp with time zone default now() not null,
    unique(challenge_id, user_id)
);

-- Create notifications table
create table if not exists public.notifications (
    id uuid default gen_random_uuid() primary key,
    user_id uuid references auth.users(id) on delete cascade not null,
    type text not null check (type in ('friend_request', 'challenge_invite', 'achievement', 'streak_reminder')),
    title text not null,
    message text not null,
    data jsonb,
    read boolean default false not null,
    created_at timestamp with time zone default now() not null
);

-- Create function to update leaderboard ranks
create or replace function public.update_leaderboard_ranks()
returns trigger
language plpgsql
as $$
begin
    -- Update ranks for all periods
    with ranked_users as (
        select
            user_id,
            period,
            xp,
            rank() over (partition by period order by xp desc) as new_rank
        from public.leaderboards
    )
    update public.leaderboards l
    set rank = r.new_rank
    from ranked_users r
    where l.user_id = r.user_id and l.period = r.period;
    
    return new;
end;
$$;

-- Create trigger for leaderboard rank updates
create trigger update_leaderboard_ranks_trigger
    after insert or update of xp
    on public.leaderboards
    for each row
    execute function public.update_leaderboard_ranks();

-- Create function to handle friend requests
create or replace function public.handle_friend_request(
    p_user_id uuid,
    p_friend_id uuid
)
returns void
language plpgsql
as $$
begin
    -- Check if friendship already exists
    if exists (
        select 1 from public.friends
        where (user_id = p_user_id and friend_id = p_friend_id)
        or (user_id = p_friend_id and friend_id = p_user_id)
    ) then
        raise exception 'Friendship already exists';
    end if;

    -- Create friend request
    insert into public.friends (user_id, friend_id, status)
    values (p_user_id, p_friend_id, 'pending');

    -- Create notification
    insert into public.notifications (
        user_id,
        type,
        title,
        message,
        data
    )
    values (
        p_friend_id,
        'friend_request',
        'New Friend Request',
        'You have a new friend request',
        jsonb_build_object('user_id', p_user_id)
    );
end;
$$;

-- Create function to accept friend request
create or replace function public.accept_friend_request(
    p_user_id uuid,
    p_friend_id uuid
)
returns void
language plpgsql
as $$
begin
    -- Update friend request status
    update public.friends
    set status = 'accepted',
        updated_at = now()
    where user_id = p_friend_id
    and friend_id = p_user_id
    and status = 'pending';

    -- Create notification
    insert into public.notifications (
        user_id,
        type,
        title,
        message,
        data
    )
    values (
        p_friend_id,
        'friend_request',
        'Friend Request Accepted',
        'Your friend request was accepted',
        jsonb_build_object('user_id', p_user_id)
    );
end;
$$;

-- Create function to create challenge
create or replace function public.create_challenge(
    p_creator_id uuid,
    p_title text,
    p_description text,
    p_type text,
    p_target int,
    p_start_date timestamp with time zone,
    p_end_date timestamp with time zone
)
returns uuid
language plpgsql
as $$
declare
    v_challenge_id uuid;
begin
    -- Create challenge
    insert into public.challenges (
        creator_id,
        title,
        description,
        type,
        target,
        start_date,
        end_date
    )
    values (
        p_creator_id,
        p_title,
        p_description,
        p_type,
        p_target,
        p_start_date,
        p_end_date
    )
    returning id into v_challenge_id;

    -- Add creator as participant
    insert into public.challenge_participants (
        challenge_id,
        user_id
    )
    values (
        v_challenge_id,
        p_creator_id
    );

    return v_challenge_id;
end;
$$;

-- Create function to invite friend to challenge
create or replace function public.invite_to_challenge(
    p_challenge_id uuid,
    p_inviter_id uuid,
    p_invitee_id uuid
)
returns void
language plpgsql
as $$
begin
    -- Check if users are friends
    if not exists (
        select 1 from public.friends
        where ((user_id = p_inviter_id and friend_id = p_invitee_id)
        or (user_id = p_invitee_id and friend_id = p_inviter_id))
        and status = 'accepted'
    ) then
        raise exception 'Users are not friends';
    end if;

    -- Add invitee as participant
    insert into public.challenge_participants (
        challenge_id,
        user_id
    )
    values (
        p_challenge_id,
        p_invitee_id
    );

    -- Create notification
    insert into public.notifications (
        user_id,
        type,
        title,
        message,
        data
    )
    values (
        p_invitee_id,
        'challenge_invite',
        'Challenge Invitation',
        'You have been invited to a challenge',
        jsonb_build_object(
            'challenge_id', p_challenge_id,
            'inviter_id', p_inviter_id
        )
    );
end;
$$; 