import { supabase } from '../utils/supabase';

export interface HeartsState {
    currentHearts: number;
    maxHearts: number;
    lastRefillTime: Date;
    heartsRefillRate: number; // minutes per heart
}

const DEFAULT_MAX_HEARTS = 5;
const DEFAULT_HEARTS_REFILL_RATE = 30; // minutes per heart

export async function getHeartsState(userId: string): Promise<HeartsState> {
    const { data, error } = await supabase
        .from('user_hearts')
        .select('*')
        .eq('user_id', userId)
        .single();

    if (error || !data) {
        // Create new hearts state if none exists
        const newState: HeartsState = {
            currentHearts: DEFAULT_MAX_HEARTS,
            maxHearts: DEFAULT_MAX_HEARTS,
            lastRefillTime: new Date(),
            heartsRefillRate: DEFAULT_HEARTS_REFILL_RATE,
        };

        await supabase
            .from('user_hearts')
            .insert({
                user_id: userId,
                ...newState,
                last_refill_time: newState.lastRefillTime.toISOString(),
            });

        return newState;
    }

    // Calculate current hearts based on time passed
    const lastRefill = new Date(data.last_refill_time);
    const now = new Date();
    const minutesPassed = (now.getTime() - lastRefill.getTime()) / (1000 * 60);
    const heartsRefilled = Math.floor(minutesPassed / data.hearts_refill_rate);
    
    const currentHearts = Math.min(
        data.max_hearts,
        data.current_hearts + heartsRefilled
    );

    // Update hearts if they've refilled
    if (currentHearts > data.current_hearts) {
        await supabase
            .from('user_hearts')
            .update({
                current_hearts: currentHearts,
                last_refill_time: now.toISOString(),
            })
            .eq('user_id', userId);
    }

    return {
        currentHearts,
        maxHearts: data.max_hearts,
        lastRefillTime: lastRefill,
        heartsRefillRate: data.hearts_refill_rate,
    };
}

export async function useHeart(userId: string): Promise<boolean> {
    const state = await getHeartsState(userId);
    
    if (state.currentHearts <= 0) {
        return false;
    }

    const { error } = await supabase
        .from('user_hearts')
        .update({
            current_hearts: state.currentHearts - 1,
        })
        .eq('user_id', userId);

    return !error;
}

export async function refillHearts(userId: string): Promise<void> {
    const { error } = await supabase
        .from('user_hearts')
        .update({
            current_hearts: DEFAULT_MAX_HEARTS,
            last_refill_time: new Date().toISOString(),
        })
        .eq('user_id', userId);

    if (error) {
        throw new Error('Failed to refill hearts');
    }
}

export async function increaseMaxHearts(userId: string, amount: number): Promise<void> {
    const state = await getHeartsState(userId);
    
    const { error } = await supabase
        .from('user_hearts')
        .update({
            max_hearts: state.maxHearts + amount,
            current_hearts: state.currentHearts + amount,
        })
        .eq('user_id', userId);

    if (error) {
        throw new Error('Failed to increase max hearts');
    }
}

export async function decreaseHeartsRefillRate(userId: string, minutes: number): Promise<void> {
    const state = await getHeartsState(userId);
    
    const { error } = await supabase
        .from('user_hearts')
        .update({
            hearts_refill_rate: Math.max(1, state.heartsRefillRate - minutes),
        })
        .eq('user_id', userId);

    if (error) {
        throw new Error('Failed to decrease hearts refill rate');
    }
} 