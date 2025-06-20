import { supabase } from '../utils/supabase';

export interface DailyReward {
    id: string;
    type: 'xp' | 'hearts' | 'streak_freeze' | 'gem' | 'special';
    amount: number;
    claimed: boolean;
    claimDate: Date | null;
    streakDay: number;
    specialReward?: {
        title: string;
        description: string;
        icon: string;
    };
}

export interface RewardProgress {
    currentStreak: number;
    longestStreak: number;
    totalRewardsClaimed: number;
    nextReward: DailyReward | null;
    streakMultiplier: number;
}

const STREAK_MULTIPLIERS = {
    3: 1.5,  // 3-day streak: 1.5x rewards
    7: 2,    // 7-day streak: 2x rewards
    14: 2.5, // 14-day streak: 2.5x rewards
    30: 3,   // 30-day streak: 3x rewards
};

const SPECIAL_REWARDS = {
    7: {
        title: 'Weekly Champion',
        description: 'Complete a week of learning!',
        icon: 'trophy',
    },
    14: {
        title: 'Fortnight Master',
        description: 'Two weeks of dedication!',
        icon: 'star',
    },
    30: {
        title: 'Monthly Legend',
        description: 'A month of excellence!',
        icon: 'crown',
    },
};

export async function getDailyRewards(userId: string): Promise<DailyReward[]> {
    const { data: rewards, error } = await supabase
        .from('daily_rewards')
        .select('*')
        .eq('user_id', userId)
        .order('streak_day', { ascending: true });

    if (error) {
        throw new Error('Failed to fetch daily rewards');
    }

    return rewards.map(reward => ({
        id: reward.id,
        type: reward.type,
        amount: reward.amount,
        claimed: reward.claimed,
        claimDate: reward.claim_date ? new Date(reward.claim_date) : null,
        streakDay: reward.streak_day,
        specialReward: SPECIAL_REWARDS[reward.streak_day],
    }));
}

export async function getRewardProgress(userId: string): Promise<RewardProgress> {
    const { data: progress, error } = await supabase
        .from('user_reward_progress')
        .select('*')
        .eq('user_id', userId)
        .single();

    if (error) {
        throw new Error('Failed to fetch reward progress');
    }

    // Calculate streak multiplier
    let streakMultiplier = 1;
    for (const [days, multiplier] of Object.entries(STREAK_MULTIPLIERS)) {
        if (progress.current_streak >= parseInt(days)) {
            streakMultiplier = multiplier;
        }
    }

    // Get next available reward
    const rewards = await getDailyRewards(userId);
    const nextReward = rewards.find(r => !r.claimed) || null;

    return {
        currentStreak: progress.current_streak,
        longestStreak: progress.longest_streak,
        totalRewardsClaimed: progress.total_rewards_claimed,
        nextReward,
        streakMultiplier,
    };
}

export async function claimDailyReward(userId: string, rewardId: string): Promise<{
    success: boolean;
    reward: DailyReward;
    bonusXp?: number;
}> {
    const { data: reward, error: fetchError } = await supabase
        .from('daily_rewards')
        .select('*')
        .eq('id', rewardId)
        .single();

    if (fetchError || !reward) {
        throw new Error('Reward not found');
    }

    if (reward.claimed) {
        throw new Error('Reward already claimed');
    }

    // Get current progress for multiplier
    const progress = await getRewardProgress(userId);
    const bonusAmount = Math.floor(reward.amount * (progress.streakMultiplier - 1));

    // Start transaction
    const { error: updateError } = await supabase
        .from('daily_rewards')
        .update({
            claimed: true,
            claim_date: new Date().toISOString(),
        })
        .eq('id', rewardId);

    if (updateError) {
        throw new Error('Failed to claim reward');
    }

    // Update user progress
    const { error: progressError } = await supabase
        .from('user_reward_progress')
        .update({
            current_streak: progress.currentStreak + 1,
            longest_streak: Math.max(progress.currentStreak + 1, progress.longestStreak),
            total_rewards_claimed: progress.totalRewardsClaimed + 1,
        })
        .eq('user_id', userId);

    if (progressError) {
        throw new Error('Failed to update progress');
    }

    // Apply reward based on type
    switch (reward.type) {
        case 'xp':
            await supabase.rpc('add_user_xp', {
                user_id: userId,
                amount: reward.amount + bonusAmount,
            });
            break;
        case 'hearts':
            await supabase.rpc('refill_hearts', { user_id: userId });
            break;
        case 'streak_freeze':
            await supabase
                .from('user_boosters')
                .insert({
                    user_id: userId,
                    type: 'streak_freeze',
                    expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
                });
            break;
        case 'gem':
            await supabase.rpc('add_user_gems', {
                user_id: userId,
                amount: reward.amount,
            });
            break;
    }

    return {
        success: true,
        reward: {
            ...reward,
            claimed: true,
            claimDate: new Date(),
        },
        bonusXp: bonusAmount,
    };
}

export async function generateNextRewards(userId: string): Promise<void> {
    const progress = await getRewardProgress(userId);
    const rewards = await getDailyRewards(userId);

    // Generate next 7 days of rewards
    for (let i = 1; i <= 7; i++) {
        const streakDay = progress.currentStreak + i;
        
        // Skip if reward already exists
        if (rewards.some(r => r.streak_day === streakDay)) {
            continue;
        }

        // Determine reward type and amount
        let type: DailyReward['type'] = 'xp';
        let amount = 10;

        // Special rewards for milestone days
        if (SPECIAL_REWARDS[streakDay]) {
            type = 'special';
            amount = 50;
        } else {
            // Regular rewards
            const rewardTypes: DailyReward['type'][] = ['xp', 'hearts', 'gem', 'streak_freeze'];
            type = rewardTypes[Math.floor(Math.random() * rewardTypes.length)];
            
            switch (type) {
                case 'xp':
                    amount = 10 + Math.floor(Math.random() * 20);
                    break;
                case 'hearts':
                    amount = 1;
                    break;
                case 'gem':
                    amount = 5 + Math.floor(Math.random() * 10);
                    break;
                case 'streak_freeze':
                    amount = 1;
                    break;
            }
        }

        // Create reward
        await supabase
            .from('daily_rewards')
            .insert({
                user_id: userId,
                type,
                amount,
                streak_day: streakDay,
                claimed: false,
            });
    }
} 