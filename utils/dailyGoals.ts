import { supabase } from './supabase';
import { getCurrentUser } from './auth';
import { calculateLessonXP } from './lessonCompletion';

export interface DailyGoal {
  id: string;
  userId: string;
  date: string;
  targetXP: number;
  currentXP: number;
  completed: boolean;
  streakBonus: number;
  rewards: {
    xp: number;
    coins: number;
    streakFreeze?: boolean;
  };
}

export interface DailyGoalProgress {
  dailyGoal: DailyGoal;
  progress: number;
  remainingXP: number;
  streakBonus: number;
  nextReward: {
    xp: number;
    coins: number;
  };
}

const DEFAULT_DAILY_GOAL = 50; // Default XP goal
const STREAK_MULTIPLIERS = {
  3: 1.2,  // 20% bonus at 3 days
  7: 1.5,  // 50% bonus at 7 days
  14: 2.0, // 100% bonus at 14 days
  30: 2.5, // 150% bonus at 30 days
};

export async function getDailyGoal(): Promise<DailyGoalProgress> {
  try {
    const user = await getCurrentUser();
    if (!user) throw new Error('User not authenticated');

    const today = new Date().toISOString().split('T')[0];
    
    // Get or create daily goal
    let { data: dailyGoal, error } = await supabase
      .from('daily_goals')
      .select('*')
      .eq('user_id', user.id)
      .eq('date', today)
      .single();

    if (error || !dailyGoal) {
      // Create new daily goal
      const { data: newGoal, error: createError } = await supabase
        .from('daily_goals')
        .insert({
          user_id: user.id,
          date: today,
          target_xp: DEFAULT_DAILY_GOAL,
          current_xp: 0,
          completed: false,
          streak_bonus: 1,
        })
        .select()
        .single();

      if (createError) throw createError;
      dailyGoal = newGoal;
    }

    // Calculate streak bonus
    const streakBonus = await calculateStreakBonus(user.id);
    
    // Update streak bonus if changed
    if (streakBonus !== dailyGoal.streak_bonus) {
      await supabase
        .from('daily_goals')
        .update({ streak_bonus: streakBonus })
        .eq('id', dailyGoal.id);
    }

    return {
      dailyGoal: {
        id: dailyGoal.id,
        userId: dailyGoal.user_id,
        date: dailyGoal.date,
        targetXP: dailyGoal.target_xp,
        currentXP: dailyGoal.current_xp,
        completed: dailyGoal.completed,
        streakBonus: streakBonus,
        rewards: {
          xp: dailyGoal.target_xp,
          coins: Math.floor(dailyGoal.target_xp / 10),
          streakFreeze: dailyGoal.streak_bonus >= 2.0,
        },
      },
      progress: (dailyGoal.current_xp / dailyGoal.target_xp) * 100,
      remainingXP: dailyGoal.target_xp - dailyGoal.current_xp,
      streakBonus: streakBonus,
      nextReward: {
        xp: Math.floor(dailyGoal.target_xp * streakBonus),
        coins: Math.floor((dailyGoal.target_xp * streakBonus) / 10),
      },
    };
  } catch (error) {
    console.error('Error getting daily goal:', error);
    throw error;
  }
}

export async function updateDailyGoalProgress(xpEarned: number): Promise<DailyGoalProgress> {
  try {
    const user = await getCurrentUser();
    if (!user) throw new Error('User not authenticated');

    const today = new Date().toISOString().split('T')[0];
    
    // Get current daily goal
    const { data: dailyGoal, error } = await supabase
      .from('daily_goals')
      .select('*')
      .eq('user_id', user.id)
      .eq('date', today)
      .single();

    if (error) throw error;

    // Calculate streak bonus
    const streakBonus = await calculateStreakBonus(user.id);
    
    // Update progress
    const newXP = dailyGoal.current_xp + xpEarned;
    const completed = newXP >= dailyGoal.target_xp;

    const { data: updatedGoal, error: updateError } = await supabase
      .from('daily_goals')
      .update({
        current_xp: newXP,
        completed,
        streak_bonus: streakBonus,
      })
      .eq('id', dailyGoal.id)
      .select()
      .single();

    if (updateError) throw updateError;

    return {
      dailyGoal: {
        id: updatedGoal.id,
        userId: updatedGoal.user_id,
        date: updatedGoal.date,
        targetXP: updatedGoal.target_xp,
        currentXP: updatedGoal.current_xp,
        completed: updatedGoal.completed,
        streakBonus: streakBonus,
        rewards: {
          xp: updatedGoal.target_xp,
          coins: Math.floor(updatedGoal.target_xp / 10),
          streakFreeze: streakBonus >= 2.0,
        },
      },
      progress: (updatedGoal.current_xp / updatedGoal.target_xp) * 100,
      remainingXP: updatedGoal.target_xp - updatedGoal.current_xp,
      streakBonus: streakBonus,
      nextReward: {
        xp: Math.floor(updatedGoal.target_xp * streakBonus),
        coins: Math.floor((updatedGoal.target_xp * streakBonus) / 10),
      },
    };
  } catch (error) {
    console.error('Error updating daily goal:', error);
    throw error;
  }
}

async function calculateStreakBonus(userId: string): Promise<number> {
  try {
    const { data: streak, error } = await supabase
      .from('user_streaks')
      .select('current_streak')
      .eq('user_id', userId)
      .single();

    if (error) throw error;

    // Find the highest applicable multiplier
    const streakDays = streak.current_streak;
    let multiplier = 1.0;

    for (const [days, bonus] of Object.entries(STREAK_MULTIPLIERS)) {
      if (streakDays >= parseInt(days)) {
        multiplier = bonus;
      } else {
        break;
      }
    }

    return multiplier;
  } catch (error) {
    console.error('Error calculating streak bonus:', error);
    return 1.0;
  }
}

export async function adjustDailyGoal(targetXP: number): Promise<void> {
  try {
    const user = await getCurrentUser();
    if (!user) throw new Error('User not authenticated');

    const today = new Date().toISOString().split('T')[0];
    
    const { error } = await supabase
      .from('daily_goals')
      .update({ target_xp: targetXP })
      .eq('user_id', user.id)
      .eq('date', today);

    if (error) throw error;
  } catch (error) {
    console.error('Error adjusting daily goal:', error);
    throw error;
  }
} 