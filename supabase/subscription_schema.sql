-- Subscription tables for DushiLearn

-- Create subscription plans table
create table if not exists public.subscription_plans (
    id text primary key,
    name text not null,
    tier text not null check (tier in ('free', 'premium', 'elite')),
    price decimal(10,2) not null default 0,
    currency text not null default 'USD',
    interval text not null check (interval in ('monthly', 'yearly')),
    features jsonb default '[]',
    is_popular boolean default false,
    is_active boolean default true,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create user subscriptions table
create table if not exists public.user_subscriptions (
    id uuid default uuid_generate_v4() primary key,
    user_id uuid references public.profiles(id) on delete cascade not null,
    plan_id text references public.subscription_plans(id),
    tier text not null check (tier in ('free', 'premium', 'elite')) default 'free',
    tier_name text not null default 'Free',
    is_active boolean default true,
    expires_at timestamp with time zone,
    stripe_subscription_id text,
    stripe_customer_id text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
    unique(user_id)
);

-- Create payment history table
create table if not exists public.payment_history (
    id uuid default uuid_generate_v4() primary key,
    user_id uuid references public.profiles(id) on delete cascade not null,
    subscription_id uuid references public.user_subscriptions(id) on delete cascade,
    amount decimal(10,2) not null,
    currency text not null default 'USD',
    status text not null check (status in ('pending', 'succeeded', 'failed', 'cancelled')),
    stripe_payment_intent_id text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS on subscription tables
alter table public.subscription_plans enable row level security;
alter table public.user_subscriptions enable row level security;
alter table public.payment_history enable row level security;

-- Drop existing policies if they exist
drop policy if exists "Anyone can view subscription plans" on public.subscription_plans;
drop policy if exists "Users can view their own subscription" on public.user_subscriptions;
drop policy if exists "Users can update their own subscription" on public.user_subscriptions;
drop policy if exists "Users can insert their own subscription" on public.user_subscriptions;
drop policy if exists "Users can view their own payment history" on public.payment_history;
drop policy if exists "Users can insert their own payment history" on public.payment_history;

-- Create RLS policies
create policy "Anyone can view subscription plans"
    on public.subscription_plans for select
    to authenticated
    using (is_active = true);

create policy "Users can view their own subscription"
    on public.user_subscriptions for select
    using (auth.uid() = user_id);

create policy "Users can update their own subscription"
    on public.user_subscriptions for update
    using (auth.uid() = user_id);

create policy "Users can insert their own subscription"
    on public.user_subscriptions for insert
    with check (auth.uid() = user_id);

create policy "Users can view their own payment history"
    on public.payment_history for select
    using (auth.uid() = user_id);

create policy "Users can insert their own payment history"
    on public.payment_history for insert
    with check (auth.uid() = user_id);

-- Insert default subscription plans
insert into public.subscription_plans (id, name, tier, price, currency, interval, features, is_popular)
values 
    ('free', 'Free', 'free', 0, 'USD', 'monthly', '["Access to basic lessons", "Limited hearts (5 per day)", "Basic progress tracking", "Community support"]', false),
    ('premium_monthly', 'Premium', 'premium', 9.99, 'USD', 'monthly', '["All premium lessons", "Unlimited hearts", "Advanced exercises", "Download for offline use", "Progress insights", "Custom reminders", "Ad-free experience"]', true),
    ('premium_yearly', 'Premium Yearly', 'premium', 79.99, 'USD', 'yearly', '["All premium lessons", "Unlimited hearts", "Advanced exercises", "Download for offline use", "Progress insights", "Custom reminders", "Ad-free experience", "2 months free!"]', false),
    ('elite_monthly', 'Elite', 'elite', 19.99, 'USD', 'monthly', '["Everything in Premium", "Family sharing (up to 6 people)", "Priority support", "Exclusive addon packs", "Expert-level content", "Personal learning coach", "Early access to new features"]', false)
on conflict (id) do nothing;

-- Function to create default subscription for new users
create or replace function public.create_default_subscription()
returns trigger as $$
begin
    insert into public.user_subscriptions (user_id, tier, tier_name)
    values (new.id, 'free', 'Free');
    return new;
end;
$$ language plpgsql security definer;

-- Create trigger to automatically create subscription for new users
drop trigger if exists on_user_created_subscription on public.profiles;
create trigger on_user_created_subscription
    after insert on public.profiles
    for each row execute procedure public.create_default_subscription();

-- Function to check if user has feature access
create or replace function public.has_feature_access(
    p_user_id uuid,
    p_feature text
)
returns boolean as $$
declare
    v_tier text;
    v_is_active boolean;
    v_expires_at timestamp with time zone;
begin
    -- Get user's subscription info
    select tier, is_active, expires_at
    into v_tier, v_is_active, v_expires_at
    from public.user_subscriptions
    where user_id = p_user_id;
    
    -- If no subscription found, default to free
    if v_tier is null then
        v_tier := 'free';
        v_is_active := true;
    end if;
    
    -- Check if subscription is active and not expired
    if not v_is_active or (v_expires_at is not null and v_expires_at < now()) then
        v_tier := 'free';
    end if;
    
    -- Check feature access based on tier
    case v_tier
        when 'free' then
            return false; -- Free tier has no premium features
        when 'premium' then
            return p_feature in (
                'premium_lessons',
                'advanced_exercises', 
                'unlimited_hearts',
                'download_lessons',
                'progress_insights',
                'custom_reminders'
            );
        when 'elite' then
            return p_feature in (
                'premium_lessons',
                'advanced_exercises',
                'unlimited_hearts', 
                'download_lessons',
                'progress_insights',
                'custom_reminders',
                'family_sharing',
                'priority_support',
                'addon_packs',
                'expert_content'
            );
        else
            return false;
    end case;
end;
$$ language plpgsql security definer;

-- Create indexes for better performance
create index if not exists idx_user_subscriptions_user_id on public.user_subscriptions(user_id);
create index if not exists idx_user_subscriptions_tier on public.user_subscriptions(tier);
create index if not exists idx_user_subscriptions_active on public.user_subscriptions(is_active);
create index if not exists idx_payment_history_user_id on public.payment_history(user_id);
create index if not exists idx_payment_history_status on public.payment_history(status);