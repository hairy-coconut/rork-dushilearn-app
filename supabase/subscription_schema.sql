-- Enable necessary extensions
create extension if not exists "uuid-ossp" schema "extensions";

-- Create subscription tiers table
create table if not exists public.subscription_tiers (
    id uuid default gen_random_uuid() primary key,
    name text not null,
    description text,
    price decimal(10,2) not null,
    is_recurring boolean default false not null,
    duration_days int,
    features jsonb not null,
    created_at timestamp with time zone default now() not null,
    updated_at timestamp with time zone default now() not null
);

-- Create user subscriptions table
create table if not exists public.user_subscriptions (
    id uuid default gen_random_uuid() primary key,
    user_id uuid references auth.users(id) on delete cascade not null,
    tier_id uuid references public.subscription_tiers(id) on delete restrict not null,
    status text not null check (status in ('active', 'expired', 'cancelled')),
    start_date timestamp with time zone default now() not null,
    end_date timestamp with time zone,
    payment_id text,
    created_at timestamp with time zone default now() not null,
    updated_at timestamp with time zone default now() not null
);

-- Create user features table to track unlocked features
create table if not exists public.user_features (
    id uuid default gen_random_uuid() primary key,
    user_id uuid references auth.users(id) on delete cascade not null,
    feature_key text not null,
    is_active boolean default true not null,
    unlocked_at timestamp with time zone default now() not null,
    expires_at timestamp with time zone,
    created_at timestamp with time zone default now() not null,
    updated_at timestamp with time zone default now() not null,
    unique(user_id, feature_key)
);

-- Create gift subscriptions table
create table if not exists public.gift_subscriptions (
    id uuid default gen_random_uuid() primary key,
    sender_id uuid references auth.users(id) on delete cascade not null,
    recipient_email text not null,
    tier_id uuid references public.subscription_tiers(id) on delete restrict not null,
    status text not null check (status in ('pending', 'redeemed', 'expired')),
    redemption_code text not null,
    expires_at timestamp with time zone not null,
    created_at timestamp with time zone default now() not null,
    updated_at timestamp with time zone default now() not null
);

-- Insert subscription tiers
insert into public.subscription_tiers (name, description, price, is_recurring, duration_days, features)
values
    ('Free', 'Basic access with limited lessons', 0.00, false, null, '{
        "lessons": ["Island Greetings", "Beach & Sun Essentials", "Ordering at the Snack Truck", "Getting Around the Island", "Simple Questions & Responses"],
        "features": ["Coconut Coins & Streaks", "Progress tracking", "Mobile-optimized UI", "Share progress", "Invite friends"]
    }'::jsonb),
    ('Premium', 'Full access to all core lessons', 9.99, false, null, '{
        "lessons": ["Love & Flirtation", "Curacao Slang 101", "Numbers & Money", "Real-Life Conversations", "Culture & Situations"],
        "features": ["Printable Phrasebook PDF", "All badges", "Coconut Club Badge", "Phrase of the Day", "Offline access", "Lifetime updates"]
    }'::jsonb),
    ('Elite', 'AI-powered language learning experience', 49.99, false, null, '{
        "ai_features": ["Real-time AI Translator", "AI Personas", "AI Vision", "Cultural Advisor"],
        "lifestyle_features": ["Digital Certificate", "Early access", "Coconut Club community", "Bonus lessons"],
        "includes_premium": true
    }'::jsonb),
    ('Elite Monthly', 'Monthly AI-powered language learning', 7.99, true, 30, '{
        "ai_features": ["Real-time AI Translator", "AI Personas", "AI Vision", "Cultural Advisor"],
        "lifestyle_features": ["Digital Certificate", "Early access", "Coconut Club community", "Bonus lessons"],
        "includes_premium": true
    }'::jsonb)
on conflict (name) do update
set 
    description = excluded.description,
    price = excluded.price,
    is_recurring = excluded.is_recurring,
    duration_days = excluded.duration_days,
    features = excluded.features,
    updated_at = now();

-- Function to check if a user has access to a feature
create or replace function public.has_feature_access(
    p_user_id uuid,
    p_feature_key text
)
returns boolean
language plpgsql
security definer
as $$
declare
    v_has_access boolean;
begin
    -- Check if user has an active subscription with the feature
    select exists (
        select 1
        from public.user_subscriptions us
        join public.subscription_tiers st on st.id = us.tier_id
        where us.user_id = p_user_id
        and us.status = 'active'
        and (
            us.end_date is null 
            or us.end_date > now()
        )
        and (
            st.features->>'features' ? p_feature_key
            or st.features->>'ai_features' ? p_feature_key
            or st.features->>'lifestyle_features' ? p_feature_key
        )
    ) into v_has_access;

    -- If no subscription access, check individual feature unlock
    if not v_has_access then
        select exists (
            select 1
            from public.user_features uf
            where uf.user_id = p_user_id
            and uf.feature_key = p_feature_key
            and uf.is_active
            and (
                uf.expires_at is null 
                or uf.expires_at > now()
            )
        ) into v_has_access;
    end if;

    return v_has_access;
end;
$$;

-- Function to get user's subscription status
create or replace function public.get_user_subscription_status(
    p_user_id uuid
)
returns table (
    tier_name text,
    status text,
    start_date timestamp with time zone,
    end_date timestamp with time zone,
    features jsonb
)
language plpgsql
security definer
as $$
begin
    return query
    select 
        st.name as tier_name,
        us.status,
        us.start_date,
        us.end_date,
        st.features
    from public.user_subscriptions us
    join public.subscription_tiers st on st.id = us.tier_id
    where us.user_id = p_user_id
    and us.status = 'active'
    and (
        us.end_date is null 
        or us.end_date > now()
    )
    order by us.start_date desc
    limit 1;
end;
$$;

-- Add RLS policies
alter table public.subscription_tiers enable row level security;
alter table public.user_subscriptions enable row level security;
alter table public.user_features enable row level security;
alter table public.gift_subscriptions enable row level security;

-- Subscription tiers policies
create policy "Anyone can view subscription tiers"
    on public.subscription_tiers for select
    to authenticated
    using (true);

-- User subscriptions policies
create policy "Users can view their own subscriptions"
    on public.user_subscriptions for select
    using (auth.uid() = user_id);

create policy "Users can insert their own subscriptions"
    on public.user_subscriptions for insert
    with check (auth.uid() = user_id);

-- User features policies
create policy "Users can view their own features"
    on public.user_features for select
    using (auth.uid() = user_id);

create policy "Users can insert their own features"
    on public.user_features for insert
    with check (auth.uid() = user_id);

-- Gift subscriptions policies
create policy "Users can view their own gift subscriptions"
    on public.gift_subscriptions for select
    using (auth.uid() = sender_id);

create policy "Users can insert their own gift subscriptions"
    on public.gift_subscriptions for insert
    with check (auth.uid() = sender_id); 