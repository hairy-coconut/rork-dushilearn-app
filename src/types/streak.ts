export interface UserStreak {
  id: string;
  user_id: string;
  current_streak: number;
  longest_streak: number;
  last_activity_date: string;
  streak_freeze_available: boolean;
  streak_freeze_expires_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface DailyActivity {
  id: string;
  user_id: string;
  activity_date: string;
  xp_earned: number;
  lessons_completed: number;
  created_at: string;
}

export interface StreakAchievement {
  id: string;
  user_id: string;
  achievement_type: string;
  achieved_at: string;
  streak_length: number;
}

export interface StreakFreezePurchase {
  id: string;
  user_id: string;
  purchased_at: string;
  expires_at: string;
  source: 'ad' | 'coins';
}

export interface StreakStatus {
  current_streak: number;
  longest_streak: number;
  last_activity_date: string;
  streak_freeze_available: boolean;
  streak_freeze_expires_at: string | null;
  next_activity_deadline: string;
  days_until_streak_break: number;
}

export interface MonthlyActivity {
  activity_date: string;
  xp_earned: number;
  lessons_completed: number;
}

export type StreakMilestone = 7 | 14 | 30;

export interface StreakMilestoneReward {
  milestone: StreakMilestone;
  xp_reward: number;
  badge_id: string;
  title: string;
  description: string;
}

export const STREAK_MILESTONES: Record<StreakMilestone, StreakMilestoneReward> = {
  7: {
    milestone: 7,
    xp_reward: 50,
    badge_id: 'streak_seaworthy',
    title: 'Streak Seaworthy',
    description: '7 days of pure Dushi discipline! 🌊'
  },
  14: {
    milestone: 14,
    xp_reward: 100,
    badge_id: 'streak_island_legend',
    title: 'Island Legend',
    description: '14 days of keeping the Dushi vibe alive! 🏝️'
  },
  30: {
    milestone: 30,
    xp_reward: 250,
    badge_id: 'streak_caribbean_king',
    title: 'Caribbean King',
    description: '30 days of unstoppable Dushi power! 👑'
  }
}; 